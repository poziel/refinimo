import { spawn } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')
const packageJsonPath = path.join(projectRoot, 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

const appId = toAppId(packageJson.name)
const hostname = `${appId}.local`
const registryPath = getRegistryPath()
const startPort = parsePort(process.env.LOCAL_DEV_START_PORT) ?? 3000
const skipInstall = process.argv.includes('--skip-install') || process.env.LOCAL_DEV_INIT_SKIP_INSTALL === '1'

async function main () {
  const registry = readRegistry(registryPath)
  const port = await assignPort(registry, appId, startPort)

  updateHostsFile(hostname)
  upsertEnvFile(path.join(projectRoot, '.env.local'), {
    LOCAL_DEV_HOST: hostname,
    LOCAL_DEV_BIND_HOST: '127.0.0.1',
    LOCAL_DEV_PORT: String(port),
  })

  registry.apps[appId] = {
    hostname,
    port,
    root: projectRoot,
    updatedAt: new Date().toISOString(),
  }
  writeRegistry(registryPath, registry)

  if (!skipInstall) {
    await runCommand('npm', ['install'])
  }

  console.log('')
  console.log(`Initialized ${packageJson.name}`)
  console.log(`Host: ${hostname} -> 127.0.0.1`)
  console.log(`Port: ${port}`)
  console.log(`URL:  http://${hostname}:${port}`)
}

function toAppId (value) {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/^@/, '')
    .replace(/[\\/]/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  if (!normalized) {
    throw new Error('package.json must include a package name before init can create a local host.')
  }

  return normalized
}

function getRegistryPath () {
  if (process.env.LOCAL_DEV_REGISTRY_PATH) {
    return path.resolve(process.env.LOCAL_DEV_REGISTRY_PATH)
  }

  const baseDir = process.env.LOCALAPPDATA || path.join(os.homedir(), '.local-dev-sites')
  return path.join(baseDir, 'local-dev-sites', 'registry.json')
}

function readRegistry (filePath) {
  if (!fs.existsSync(filePath)) {
    return { version: 1, apps: {} }
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    return {
      version: 1,
      apps: isPlainObject(parsed.apps) ? parsed.apps : {},
    }
  } catch (error) {
    throw new Error(`Could not read local dev registry at ${filePath}: ${error.message}`, { cause: error })
  }
}

function writeRegistry (filePath, registry) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(registry, null, 2)}\n`)
}

async function assignPort (registry, currentAppId, basePort) {
  const currentApp = registry.apps[currentAppId]
  const reservedPorts = new Set(
    Object.entries(registry.apps)
      .filter(([appId]) => appId !== currentAppId)
      .map(([, app]) => Number(app.port))
      .filter(port => Number.isInteger(port)),
  )

  if (Number.isInteger(currentApp?.port) && !reservedPorts.has(currentApp.port)) {
    return currentApp.port
  }

  const highestReservedPort = [...reservedPorts].reduce((highest, port) => Math.max(highest, port), basePort - 1)
  let candidatePort = Math.max(basePort, highestReservedPort + 1)

  while (reservedPorts.has(candidatePort) || !(await isPortAvailable(candidatePort))) {
    candidatePort += 1
  }

  return candidatePort
}

function isPortAvailable (port) {
  return new Promise(resolve => {
    const server = net.createServer()

    server.once('error', () => {
      resolve(false)
    })

    server.once('listening', () => {
      server.close(() => {
        resolve(true)
      })
    })

    server.listen({ port, host: '127.0.0.1', exclusive: true })
  })
}

function updateHostsFile (host) {
  const hostsPath = process.platform === 'win32'
    ? path.join(process.env.SystemRoot || String.raw`C:\Windows`, 'System32', 'drivers', 'etc', 'hosts')
    : '/etc/hosts'

  const content = fs.readFileSync(hostsPath, 'utf8')
  const conflictingLine = content
    .split(/\r?\n/)
    .find(line => {
      const entry = parseHostsLine(line)
      return entry?.hosts.includes(host) && !['127.0.0.1', '::1'].includes(entry.address)
    })

  if (conflictingLine) {
    throw new Error(`Hosts file already maps ${host} somewhere else: ${conflictingLine.trim()}`)
  }

  const hasEntry = content
    .split(/\r?\n/)
    .some(line => {
      const entry = parseHostsLine(line)
      return entry?.hosts.includes(host) && ['127.0.0.1', '::1'].includes(entry.address)
    })

  if (hasEntry) {
    return
  }

  const lineEnding = content.includes('\r\n') ? '\r\n' : '\n'
  const prefix = content.endsWith('\n') || content.length === 0 ? '' : lineEnding

  try {
    fs.appendFileSync(hostsPath, `${prefix}127.0.0.1 ${host} # local-dev-sites${lineEnding}`)
  } catch (error) {
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      throw new Error(`Could not update ${hostsPath}. Run npm run init from an elevated PowerShell window.`, { cause: error })
    }

    throw error
  }
}

function parseHostsLine (line) {
  const withoutComment = line.split('#')[0]?.trim()
  if (!withoutComment) {
    return null
  }

  const [address, ...hosts] = withoutComment.split(/\s+/)
  if (!address || hosts.length === 0) {
    return null
  }

  return { address, hosts }
}

function upsertEnvFile (filePath, values) {
  const lines = fs.existsSync(filePath)
    ? fs.readFileSync(filePath, 'utf8').split(/\r?\n/)
    : []
  const seenKeys = new Set()
  const nextLines = lines.map(line => {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/)
    if (!match || !(match[1] in values)) {
      return line
    }

    seenKeys.add(match[1])
    return `${match[1]}=${values[match[1]]}`
  })

  for (const [key, value] of Object.entries(values)) {
    if (!seenKeys.has(key)) {
      nextLines.push(`${key}=${value}`)
    }
  }

  while (nextLines.at(-1) === '') {
    nextLines.pop()
  }

  fs.writeFileSync(filePath, `${nextLines.join('\n')}\n`)
}

function runCommand (command, args) {
  return new Promise((resolve, reject) => {
    const executable = process.platform === 'win32' && command === 'npm' ? 'npm.cmd' : command
    const child = spawn(executable, args, {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: false,
    })

    child.once('error', reject)
    child.once('exit', code => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`))
    })
  })
}

function parsePort (value) {
  const port = Number(value)
  return Number.isInteger(port) && port > 0 && port < 65_536 ? port : undefined
}

function isPlainObject (value) {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

main().catch(error => {
  console.error(`init failed: ${error.message}`)
  process.exitCode = 1
})
