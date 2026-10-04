import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import Config from '@/pages/config.vue'
import Index from '@/pages/index.vue'
import Lobby from '@/pages/lobby.vue'
import { useConfigStore } from '@/stores/config'
import { LANDING_PAGES } from '@/utils/landingNavigation'
import { buildPageTitle } from '@/utils/pageTitle'

function requireConfig (to: RouteLocationNormalized) {
  const configStore = useConfigStore()
  configStore.initializeConfig()

  // Apply config from URL query param (client-side navigation or shared link).
  // Must happen before the configFound check so a shared link works even when
  // no config is stored yet.
  if ('config' in to.query) {
    configStore.applyConfigFromBase64(String(to.query.config))
    const { config: _, ...query } = to.query
    return { path: to.path, params: to.params, query, replace: true }
  }

  if (!configStore.configFound) {
    return '/app/config?e'
  }

  return true
}

function applySharedLinkRedirect (to: RouteLocationNormalized, fallbackPath: string) {
  const configStore = useConfigStore()
  configStore.initializeConfig()

  if ('config' in to.query || 'roomId' in to.query) {
    if ('config' in to.query) {
      configStore.applyConfigFromBase64(String(to.query.config))
    }
    const roomId = to.query.roomId
    if (typeof roomId === 'string' && roomId.trim().length > 0) {
      return `/app/room/${roomId.trim()}`
    }
    const { config: _, roomId: __, ...query } = to.query
    return { path: fallbackPath, query, replace: true }
  }

  return true
}

function ensureMetaTag (selector: string, create: () => HTMLMetaElement) {
  let tag = document.head.querySelector(selector) as HTMLMetaElement | null
  if (!tag) {
    tag = create()
    document.head.append(tag)
  }
  return tag
}

function ensureCanonicalLink () {
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.append(link)
  }
  return link
}

function buildCanonicalUrl (fullPath: string) {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')
  return new URL(`${basePath}${fullPath}`, window.location.origin).toString()
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return { el: to.hash, top: 24 }
    }
    if (to.meta.public && to.path !== from.path) {
      return { top: 0 }
    }
  },
  routes: [
    ...LANDING_PAGES.map(page => ({
      path: page.path,
      component: Index,
      beforeEnter: page.path === '/'
        ? (to: RouteLocationNormalized) => applySharedLinkRedirect(to, '/app')
        : undefined,
      meta: {
        public: true,
        landingPage: page.id,
        title: buildPageTitle([page.title]),
        description: page.description,
      },
    })),
    {
      path: '/demo',
      component: () => import('@/pages/demo.vue'),
      meta: {
        demo: true,
        title: buildPageTitle(['Try Refinimo']),
        description: 'Try a real planning poker room with simulated teammates. No setup needed.',
      },
    },
    {
      path: '/demo/dock/:roomId',
      component: () => import('@/pages/demo-dock.vue'),
      meta: { demo: true, dockOnly: true, title: buildPageTitle(['Demo voting dock']) },
    },
    {
      path: '/app',
      component: Lobby,
      beforeEnter: to => applySharedLinkRedirect(to, '/app'),
      meta: {
        requiresUserName: true,
        title: buildPageTitle(['Lobby']),
        description: 'Lobby for creating a new planning poker room, joining an existing session, or connecting your Firebase project to start estimating with Refinimo.',
      },
    },
    {
      path: '/app/room/:roomId',
      component: () => import('@/pages/room.vue'),
      beforeEnter: requireConfig,
      meta: {
        requiresUserName: true,
        title: buildPageTitle(['Room']),
        description: 'Collaborative planning poker room for live scrum estimation, anonymous voting, and shared reveal.',
      },
    },
    {
      path: '/app/dock/:roomId?',
      component: () => import('@/pages/dock.vue'),
      meta: {
        dockOnly: true,
        title: buildPageTitle(['Voting Dock']),
        description: 'Dedicated Refinimo voting dock for the current planning room.',
      },
    },
    {
      path: '/app/create',
      component: () => import('@/pages/create.vue'),
      beforeEnter: requireConfig,
      meta: {
        requiresUserName: true,
        title: buildPageTitle(['Create room']),
        description: 'Set up a new Refinimo planning poker room and configure the estimation deck for your team.',
      },
    },
    {
      path: '/app/config',
      component: Config,
      props: route => ({
        showError: 'e' in route.query,
      }),
      meta: {
        title: buildPageTitle(['Configuration']),
        description: 'Connect Refinimo to your Firebase Realtime Database project to enable room creation, joining, and collaboration.',
      },
    },
    {
      path: '/app/attributions',
      component: () => import('@/pages/attributions.vue'),
      meta: {
        title: buildPageTitle(['Attributions']),
        description: 'Third-party credits and attribution information for Refinimo.',
      },
    },
  ],
})

router.afterEach(to => {
  const title = typeof to.meta.title === 'string' ? to.meta.title : 'Refinimo'
  const description = typeof to.meta.description === 'string'
    ? to.meta.description
    : 'Collaborative planning poker for agile teams.'

  document.title = title

  ensureMetaTag('meta[name="description"]', () => {
    const meta = document.createElement('meta')
    meta.name = 'description'
    return meta
  }).content = description

  ensureMetaTag('meta[property="og:title"]', () => {
    const meta = document.createElement('meta')
    meta.setAttribute('property', 'og:title')
    return meta
  }).content = title

  ensureMetaTag('meta[property="og:description"]', () => {
    const meta = document.createElement('meta')
    meta.setAttribute('property', 'og:description')
    return meta
  }).content = description

  ensureMetaTag('meta[property="og:type"]', () => {
    const meta = document.createElement('meta')
    meta.setAttribute('property', 'og:type')
    return meta
  }).content = 'website'

  ensureCanonicalLink().href = buildCanonicalUrl(to.fullPath)
})

export default router
