import { createRequire } from 'node:module'
import { fileURLToPath, URL } from 'node:url'
import Vue from '@vitejs/plugin-vue'
import Fonts from 'unplugin-fonts/vite'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

const require = createRequire(import.meta.url)
const packageJson = require('./package.json') as { version: string }

function firebaseMockServerPlugin (): Plugin {
  const state: Record<string, unknown> = {}
  let lastRequestAt = Date.now()

  return {
    name: 'refinimo-firebase-mock-server',
    configureServer (server) {
      server.middlewares.use((_request, _response, next) => {
        lastRequestAt = Date.now()
        next()
      })

      const idleShutdownInterval = setInterval(() => {
        if (Date.now() - lastRequestAt < 15_000) {
          return
        }

        clearInterval(idleShutdownInterval)
        void server.close().finally(() => {
          // eslint-disable-next-line unicorn/no-process-exit -- E2E-only mock server self-terminates after Playwright closes browser pages on Windows.
          process.exit(0)
        })
      }, 1000)

      server.middlewares.use('/__firebase-mock', async (request, response) => {
        const url = new URL(request.url ?? '/', 'http://localhost')
        const path = normalizeMockPath(url.searchParams.get('path') ?? '')

        try {
          if (request.method === 'GET') {
            sendJson(response, { value: getMockValue(state, path) })
            return
          }

          if (request.method === 'POST') {
            const body = await readJsonBody(request)
            const operation = typeof body.operation === 'string' ? body.operation : ''

            if (operation === 'set') {
              setMockValue(state, path, body.value)
            } else if (operation === 'update' && isPlainObject(body.value)) {
              for (const [key, value] of Object.entries(body.value)) {
                setMockValue(state, joinMockPath(path, key), value)
              }
            } else if (operation === 'remove') {
              setMockValue(state, path, null)
            } else if (operation === 'reset') {
              for (const key of Object.keys(state)) {
                delete state[key]
              }
            } else {
              sendJson(response, { error: 'Unsupported mock operation' }, 400)
              return
            }

            sendJson(response, { value: getMockValue(state, path) })
            return
          }

          sendJson(response, { error: 'Unsupported mock method' }, 405)
        } catch (error) {
          sendJson(response, { error: error instanceof Error ? error.message : 'Mock server error' }, 500)
        }
      })
    },
  }
}

function sendJson (response: { statusCode: number, setHeader: (name: string, value: string) => void, end: (body: string) => void }, value: unknown, statusCode = 200) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(value))
}

function readJsonBody (request: NodeJS.ReadableStream): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let body = ''

    request.setEncoding('utf8')
    request.on('data', chunk => {
      body += chunk
    })
    request.on('end', () => {
      if (!body) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(body) as Record<string, unknown>)
      } catch (error) {
        reject(error)
      }
    })
    request.on('error', reject)
  })
}

function getMockValue (root: Record<string, unknown>, path: string) {
  const segments = splitMockPath(path)
  let cursor: unknown = root

  for (const segment of segments) {
    if (!cursor || typeof cursor !== 'object' || !(segment in cursor)) {
      return null
    }
    cursor = (cursor as Record<string, unknown>)[segment]
  }

  return cursor ?? null
}

function setMockValue (root: Record<string, unknown>, path: string, value: unknown) {
  const segments = splitMockPath(path)
  if (segments.length === 0) {
    return
  }

  let cursor = root
  for (const segment of segments.slice(0, -1)) {
    if (!cursor[segment] || typeof cursor[segment] !== 'object' || Array.isArray(cursor[segment])) {
      cursor[segment] = {}
    }
    cursor = cursor[segment] as Record<string, unknown>
  }

  const finalSegment = segments.at(-1)
  if (!finalSegment) {
    return
  }

  if (value === null || value === undefined) {
    delete cursor[finalSegment]
    return
  }

  cursor[finalSegment] = value
}

function isPlainObject (value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function joinMockPath (basePath: string, childPath: string) {
  return normalizeMockPath([basePath, childPath].filter(Boolean).join('/'))
}

function normalizeMockPath (path: string) {
  return path.replace(/^\/+|\/+$/g, '')
}

function splitMockPath (path: string) {
  return normalizeMockPath(path).split('/').filter(Boolean)
}

function parsePort (value: string | undefined) {
  const port = Number(value)
  return Number.isInteger(port) && port > 0 && port < 65_536 ? port : undefined
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env }
  const useFirebaseMock = env.VITE_REFINIMO_FIREBASE_MOCK === '1'
  const basePath = env.VITE_REFINIMO_BASE_PATH ?? '/'
  const devHost = env.LOCAL_DEV_HOST?.trim() || undefined
  const devBindHost = env.LOCAL_DEV_BIND_HOST?.trim() || undefined
  const devPort = parsePort(env.LOCAL_DEV_PORT) ?? 3000

  return {
    base: basePath,
    plugins: [
      ...(useFirebaseMock ? [firebaseMockServerPlugin()] : []),
      Vue({
        template: { transformAssetUrls },
      }),
      // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
      Vuetify({
        autoImport: true,
      }),
      Fonts({
        fontsource: {
          families: [
            {
              name: 'Roboto',
              weights: [100, 300, 400, 500, 700, 900],
              styles: ['normal', 'italic'],
            },
          ],
        },
      }),
    ],
    define: {
      '__APP_VERSION__': JSON.stringify(packageJson.version),
      'process.env': {},
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('src', import.meta.url)),
        ...(useFirebaseMock
          ? { 'firebase/database': fileURLToPath(new URL('src/testing/firebaseDatabaseMock.ts', import.meta.url)) }
          : {}),
      },
      extensions: [
        '.js',
        '.json',
        '.jsx',
        '.mjs',
        '.ts',
        '.tsx',
        '.vue',
      ],
    },
    server: {
      ...(devBindHost ? { host: devBindHost } : {}),
      ...(devHost ? { allowedHosts: [devHost] } : {}),
      port: devPort,
      strictPort: true,
    },
  }
})
