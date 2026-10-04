<template>
  <main class="dock-window">
    <section class="dock-window-panel">
      <div class="dock-window-head">
        <div>
          <p class="dock-window-kicker">Voting dock</p>
          <h1>{{ title }}</h1>
        </div>

        <v-btn
          aria-label="Close voting dock"
          class="icon-btn"
          density="compact"
          icon
          title="Close voting dock"
          variant="text"
          @click="closeWindow"
        >
          <v-icon icon="mdi-close" size="16" />
        </v-btn>
      </div>

      <template v-if="!demo && !configStore.configFound">
        <div class="dock-window-empty">
          <v-icon icon="mdi-database-off-outline" size="28" />
          <p>Firebase configuration is missing in this window.</p>

          <v-btn class="ui-btn ui-btn-primary" to="/app/config" variant="flat">
            Open configuration
          </v-btn>
        </div>
      </template>

      <template v-else-if="sessionError">
        <div class="dock-window-empty">
          <v-icon icon="mdi-cellphone-off" size="28" />
          <p>{{ sessionError }}</p>
        </div>
      </template>

      <template v-else-if="isPhoneSession && !sessionReady">
        <div class="dock-window-empty">
          <v-icon icon="mdi-loading" size="28" />
          <p>Connecting this device to the voting dock.</p>
        </div>
      </template>

      <template v-else-if="!context.roomId">
        <div class="dock-window-empty">
          <v-icon icon="mdi-cards-outline" size="28" />
          <p>No active room is available for voting.</p>
        </div>
      </template>

      <template v-else-if="roomMissing">
        <div class="dock-window-empty">
          <v-icon icon="mdi-alert-circle-outline" size="28" />
          <p>This room could not be found.</p>
        </div>
      </template>

      <template v-else-if="currentRoom">
        <VoteDock
          :can-vote="canVoteInCurrentRound"
          :collapsed="false"
          :disabled-hint="voteActionHint"
          external-window
          :selected-vote="selectedVote"
          :show-votes="showVotes"
          :user-name="userName || 'Guest'"
          :vote-options="voteOptions"
          @cast-vote="castVote"
        />
      </template>

      <template v-else>
        <div class="dock-window-empty">
          <v-icon icon="mdi-loading" size="28" />
          <p>Connecting to the active room.</p>
        </div>
      </template>
    </section>
  </main>
</template>

<script setup lang="ts">
  import type { ExternalDockSession } from '@/utils/externalDockSession'
  import { ref as dbRef, onValue, remove, runTransaction, update } from 'firebase/database'
  import { computed, inject, onMounted, onUnmounted, ref, watchEffect } from 'vue'
  import { useRoute } from 'vue-router'
  import VoteDock from '@/components/VoteDock.vue'
  import { useRoomVotingDock } from '@/composables/useRoomVotingDock'
  import { demoContextKey } from '@/demo/demoContext'
  import { useAppStore } from '@/stores/app'
  import { useConfigStore } from '@/stores/config'
  import {
    clearExternalDockHeartbeat,
    EXTERNAL_DOCK_COMMAND_KEY,
    EXTERNAL_DOCK_CONTEXT_KEY,
    type ExternalDockRoomContext,
    readExternalDockContext,
    writeExternalDockHeartbeat,
  } from '@/utils/externalDock'
  import {
    EXTERNAL_DOCK_SESSION_HEARTBEAT_MS,
    EXTERNAL_DOCK_SESSION_TTL_MS,
    isExternalDockSessionExpired,
  } from '@/utils/externalDockSession'
  import { registerKeyboardShortcuts } from '@/utils/keyboardShortcuts'
  import { setPageTitle } from '@/utils/pageTitle'
  import { THEME_IDS, type ThemeId } from '@/utils/themes'

  const appStore = useAppStore()
  const configStore = useConfigStore()
  const route = useRoute()
  const demo = inject(demoContextKey, null)
  initializeDockConfig()

  const context = ref<ExternalDockRoomContext>(resolveInitialContext())
  const dockSessionToken = ref(readStringQuery('dockSession'))
  const dockSessionUserId = ref<string | null>(null)
  const dockSessionUserName = ref('')
  const sessionError = ref('')
  const isPhoneSession = computed(() => !!dockSessionToken.value)
  const sessionReady = computed(() => !isPhoneSession.value || !!dockSessionUserId.value)
  const {
    canVoteInCurrentRound,
    castVote,
    currentRoom,
    roomMissing,
    selectedVote,
    showVotes,
    stop,
    subscribeToRoom,
    userName,
    voteActionHint,
    voteOptions,
  } = useRoomVotingDock({
    userId: computed(() => dockSessionUserId.value),
    userName: computed(() => dockSessionUserName.value || configStore.userName),
  })

  let heartbeatTimer: ReturnType<typeof setInterval> | null = null
  let sessionHeartbeatTimer: ReturnType<typeof setInterval> | null = null
  let unsubscribeSession: (() => void) | null = null
  let unregisterShortcuts: (() => void) | null = null

  const title = computed(() => {
    if (currentRoom.value?.name) return currentRoom.value.name
    if (context.value.roomName) return context.value.roomName
    if (context.value.roomId) return 'Active room'
    return 'No active room'
  })

  watchEffect(() => {
    setPageTitle([userName.value || configStore.userName || null, title.value, 'Voting Dock'])
  })

  onMounted(async () => {
    if (demo) {
      subscribeToRoom(demo.roomId)
      return
    }
    writeHeartbeat()
    heartbeatTimer = setInterval(writeHeartbeat, 1000)
    window.addEventListener('storage', onStorage)
    window.addEventListener('beforeunload', clearExternalDockHeartbeat)
    unregisterShortcuts = registerKeyboardShortcuts([
      {
        id: 'dock.close-external-window',
        group: 'dock',
        description: 'Close the external voting window',
        keys: [
          { key: ' ', ctrlKey: true },
          { key: ' ', metaKey: true },
        ],
        when: () => !isPhoneSession.value,
        handler: closeWindow,
      },
    ])

    if (isPhoneSession.value) {
      await claimDockSession()
    }

    if (!isPhoneSession.value || sessionReady.value) {
      subscribeToRoom(context.value.roomId)
    }
  })

  onUnmounted(() => {
    stop()
    if (demo) return
    closeDockSession()
    unsubscribeSession?.()
    unregisterShortcuts?.()
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('beforeunload', clearExternalDockHeartbeat)
    if (heartbeatTimer !== null) clearInterval(heartbeatTimer)
    if (sessionHeartbeatTimer !== null) clearInterval(sessionHeartbeatTimer)
    clearExternalDockHeartbeat()
  })

  function writeHeartbeat () {
    writeExternalDockHeartbeat()
  }

  function onStorage (event: StorageEvent) {
    if (isPhoneSession.value) {
      return
    }

    if (event.key === EXTERNAL_DOCK_CONTEXT_KEY) {
      context.value = readExternalDockContext()
      subscribeToRoom(context.value.roomId)
      return
    }

    if (event.key === EXTERNAL_DOCK_COMMAND_KEY) {
      closeWindow()
    }
  }

  function closeWindow () {
    window.close()
  }

  async function claimDockSession () {
    const roomId = context.value.roomId
    const token = dockSessionToken.value
    const db = configStore.getDb()

    if (!roomId || !token || !db) {
      sessionError.value = 'This voting dock link is missing required room information.'
      return
    }

    const now = Date.now()
    const sessionRef = dbRef(db, `rooms/${roomId}/externalDockSessions/${token}`)

    try {
      const result = await runTransaction(sessionRef, current => {
        if (!current) {
          return current
        }

        const session = current as ExternalDockSession
        if (isExternalDockSessionExpired(session, now)) {
          return {
            ...session,
            status: 'expired',
          }
        }

        return {
          ...session,
          claimedAt: session.claimedAt ?? now,
          lastSeenAt: now,
          expiresAt: now + EXTERNAL_DOCK_SESSION_TTL_MS,
          status: 'connected',
        } satisfies ExternalDockSession
      })

      const session = result.snapshot.val() as ExternalDockSession | null
      if (!session || isExternalDockSessionExpired(session)) {
        sessionError.value = 'This voting dock link has expired. Generate a new QR code from the room.'
        return
      }

      dockSessionUserId.value = session.userId
      dockSessionUserName.value = session.userName
      startDockSessionHeartbeat(roomId, token)
      watchDockSession(roomId, token)
    } catch (error) {
      console.error(error)
      sessionError.value = 'This device could not connect to the voting dock session.'
    }
  }

  function watchDockSession (roomId: string, token: string) {
    const db = configStore.getDb()
    if (!db) return

    unsubscribeSession?.()
    unsubscribeSession = onValue(dbRef(db, `rooms/${roomId}/externalDockSessions/${token}`), snapshot => {
      const session = snapshot.val() as ExternalDockSession | null
      if (!session || isExternalDockSessionExpired(session)) {
        sessionError.value = 'This voting dock session is no longer active.'
        dockSessionUserId.value = null
        stop()
        return
      }

      dockSessionUserId.value = session.userId
      dockSessionUserName.value = session.userName
    })
  }

  function startDockSessionHeartbeat (roomId: string, token: string) {
    if (sessionHeartbeatTimer !== null) clearInterval(sessionHeartbeatTimer)
    sessionHeartbeatTimer = setInterval(() => {
      const db = configStore.getDb()
      if (!db) return
      update(dbRef(db, `rooms/${roomId}/externalDockSessions/${token}`), {
        lastSeenAt: Date.now(),
        expiresAt: Date.now() + EXTERNAL_DOCK_SESSION_TTL_MS,
      }).catch(console.error)
    }, EXTERNAL_DOCK_SESSION_HEARTBEAT_MS)
  }

  function closeDockSession () {
    const roomId = context.value.roomId
    const token = dockSessionToken.value
    const db = configStore.getDb()
    if (!roomId || !token || !db) return

    remove(dbRef(db, `rooms/${roomId}/externalDockSessions/${token}`)).catch(console.error)
  }

  function applyRouteConfig () {
    const config = readStringQuery('config')
    if (config) {
      configStore.applyConfigFromBase64(config)
    }
  }

  function initializeDockConfig () {
    configStore.initializeConfig()
    if (!demo) applyRouteConfig()
    applyRouteTheme()
  }

  function readStringQuery (key: string): string | null {
    const value = route.query[key]
    if (Array.isArray(value)) {
      return value[0] ?? null
    }
    return typeof value === 'string' && value.trim() ? value.trim() : null
  }

  function applyRouteTheme () {
    const theme = readStringQuery('theme')
    if (theme && THEME_IDS.includes(theme as ThemeId)) {
      appStore.setResolvedTheme(theme as ThemeId)
    }
  }

  function resolveInitialContext (): ExternalDockRoomContext {
    if (demo) return { roomId: demo.roomId, roomName: 'Practice room', updatedAt: Date.now() }
    const routeRoomId = typeof route.params.roomId === 'string' && route.params.roomId.trim()
      ? route.params.roomId.trim()
      : null
    const storedContext = readExternalDockContext()

    if (!routeRoomId) {
      return storedContext
    }

    if (storedContext.roomId === routeRoomId) {
      return storedContext
    }

    return {
      roomId: routeRoomId,
      roomName: null,
      updatedAt: Date.now(),
    }
  }
</script>
