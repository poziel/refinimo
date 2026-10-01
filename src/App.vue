<template>
  <v-app v-if="isDockOnlyRoute" class="app-shell app-shell-dock-only">
    <router-view />
  </v-app>

  <v-app v-else class="app-shell">
    <v-app-bar v-if="!isPublicRoute" class="hdr" flat height="57">
      <v-btn
        class="brand"
        :ripple="false"
        to="/"
        variant="text"
      >
        <div class="brand-mark">
          <img alt="Refinimo logo" src="/images/logo.png">
        </div>

        <div class="brand-name">Refinimo</div>
      </v-btn>

      <v-spacer />

      <div class="hdr-right">
        <router-link
          v-if="!isDemoRoute && appStore.currentRoomId && (appStore.roomPresenceActive || appStore.roomHasRoundParticipant)"
          class="room-pill"
          :class="{ 'room-pill-away': !appStore.roomPresenceActive || !isInRoom }"
          :to="`/app/room/${appStore.currentRoomId}`"
        >
          <span class="dot" />
          <span class="room-name">{{ appStore.roomName }}</span>
          <span class="room-meta">{{ appStore.playerCount }} online</span>
        </router-link>

        <UserMenu :demo="isDemoRoute" />
      </div>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <v-snackbar
      v-model="appStore.toastVisible"
      class="ui-snackbar"
      :color="appStore.toastType === 'success' ? 'success' : 'error'"
      location="bottom right"
      variant="flat"
    >
      <v-icon
        :icon="appStore.toastType === 'success' ? 'mdi-check' : 'mdi-close'"
        size="16"
      />
      {{ appStore.toastMessage }}
    </v-snackbar>

    <ConfigModal v-if="!isDemoRoute" v-model="appStore.configModalOpen" />

    <!-- ── Global username setup (shown once on first visit) ───────────── -->
    <v-dialog v-model="nameSetupOpen" max-width="480" persistent>
      <v-card class="ui-modal" flat>
        <div class="ui-modal-head">
          <h2>What's your name?</h2>
          <p>This is how you'll appear in planning rooms. You can change it anytime from the user menu.</p>
        </div>

        <v-form @submit.prevent="submitSetupName">
          <div class="ui-modal-body">
            <v-text-field
              v-model="setupName"
              autofocus
              class="ui-field"
              :counter="20"
              data-test-id="initial-name-input"
              hide-details="auto"
              label="Your name"
              maxlength="20"
              placeholder="e.g. Alex"
              variant="outlined"
            />
          </div>

          <div class="ui-modal-foot">
            <v-btn
              class="ui-btn ui-btn-primary"
              data-test-id="initial-name-continue"
              :disabled="!setupName.trim()"
              type="submit"
              variant="flat"
            >
              Continue
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script lang="ts" setup>
  import type { ThemeModePreference } from '@/utils/themes'
  import { ref as dbRef, get } from 'firebase/database'
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import ConfigModal from '@/components/ConfigModal.vue'
  import UserMenu from '@/components/UserMenu.vue'
  import { useAppStore } from '@/stores/app'
  import { useConfigStore } from '@/stores/config'
  import {
    EXTERNAL_DOCK_HEARTBEAT_KEY,
    isExternalDockHeartbeatActive,
    writeExternalDockContext,
  } from '@/utils/externalDock'
  import { hasActiveOverlay, registerKeyboardShortcuts } from '@/utils/keyboardShortcuts'

  const route = useRoute()
  const router = useRouter()
  const appStore = useAppStore()
  const configStore = useConfigStore()

  const isDemoRoute = computed(() => route.meta.demo === true)
  const isInRoom = computed(() => route.path.startsWith('/app/room/'))
  const isDockOnlyRoute = computed(() => route.meta.dockOnly === true)
  const isPublicRoute = computed(() => route.meta.public === true || isDockOnlyRoute.value)
  const requiresUserName = computed(() => route.meta.requiresUserName === true)

  const nameSetupOpen = ref(false)
  const setupName = ref('')
  let unregisterShortcuts: (() => void) | null = null
  let externalDockMonitor: ReturnType<typeof setInterval> | null = null
  const THEME_MODE_SEQUENCE: ThemeModePreference[] = ['system', 'dark', 'light']
  const THEME_MODE_LABELS: Record<ThemeModePreference, string> = {
    dark: 'Dark theme',
    light: 'Light theme',
    system: 'Follow system theme',
  }

  function syncNameSetupPrompt () {
    if (!requiresUserName.value) {
      nameSetupOpen.value = false
      return
    }

    if (!configStore.userName.trim()) {
      nameSetupOpen.value = true
    }
  }

  onMounted(async () => {
    // Lazy routes must resolve before deciding whether real room services apply.
    await router.isReady()
    if (isDockOnlyRoute.value) {
      return
    }

    configStore.initializeConfig()
    syncNameSetupPrompt()
    syncExternalDockStatus()
    syncExternalDockContext()

    window.addEventListener('storage', onStorage)
    externalDockMonitor = setInterval(syncExternalDockStatus, 1000)

    await restoreRoomPillFromRoundParticipant()

    unregisterShortcuts = registerKeyboardShortcuts([
      {
        id: 'app.open-preferences',
        group: 'app',
        description: 'Open Preferences',
        keys: [
          { key: ',', ctrlKey: true },
          { key: ',', metaKey: true },
        ],
        allowInEditable: true,
        when: () => !nameSetupOpen.value && (!hasActiveOverlay() || appStore.preferencesModalOpen),
        handler: () => {
          appStore.setPreferencesModalOpen(!appStore.preferencesModalOpen)
        },
      },
      {
        id: 'app.open-keyboard-shortcuts',
        group: 'app',
        description: 'Open keyboard shortcuts',
        keys: [{ key: 'F1' }],
        allowInEditable: true,
        when: () => !nameSetupOpen.value && (!hasActiveOverlay() || appStore.keyboardShortcutsModalOpen),
        handler: () => {
          appStore.setKeyboardShortcutsModalOpen(!appStore.keyboardShortcutsModalOpen)
        },
      },
      {
        id: 'app.go-lobby',
        group: 'app',
        description: 'Go back to the lobby',
        keys: [{ key: 'Escape' }],
        allowInEditable: true,
        when: () => !nameSetupOpen.value && !hasActiveOverlay() && route.path !== '/app',
        handler: () => {
          void router.push(isDemoRoute.value ? '/' : '/app')
        },
      },
      {
        id: 'app.open-config',
        group: 'app',
        description: 'Open Firebase configuration',
        keys: [
          { key: '.', ctrlKey: true },
          { key: '.', metaKey: true },
        ],
        allowInEditable: true,
        when: () => !isDemoRoute.value && !nameSetupOpen.value && !hasActiveOverlay(),
        handler: () => {
          appStore.setConfigModalOpen(true)
        },
      },
      {
        id: 'app.cycle-theme-mode',
        group: 'app',
        description: 'Cycle theme mode',
        keys: [
          { code: 'KeyK', ctrlKey: true },
          { code: 'KeyK', ctrlKey: true, shiftKey: true },
          { code: 'KeyK', metaKey: true },
          { code: 'KeyK', metaKey: true, shiftKey: true },
        ],
        allowInEditable: true,
        when: () => !nameSetupOpen.value && !hasActiveOverlay(),
        handler: () => {
          cycleThemeMode()
        },
      },
      {
        id: 'app.create-room',
        group: 'app',
        description: 'Create a new room',
        keys: [
          { key: 'n', ctrlKey: true, altKey: true },
          { key: 'n', metaKey: true, altKey: true },
        ],
        allowInEditable: true,
        when: () => !isDemoRoute.value && !nameSetupOpen.value && !hasActiveOverlay() && route.path !== '/app/create',
        handler: () => {
          router.push('/app/create')
        },
      },
    ])
  })

  watch(() => route.fullPath, (_path, previousPath) => {
    if (isDockOnlyRoute.value) return

    syncNameSetupPrompt()
    if (previousPath.startsWith('/demo') && isPublicRoute.value) return
    syncExternalDockContext()
  })

  function cycleThemeMode () {
    const currentIndex = THEME_MODE_SEQUENCE.indexOf(appStore.themeModePreference)
    const nextMode = THEME_MODE_SEQUENCE[(currentIndex + 1) % THEME_MODE_SEQUENCE.length]
    appStore.setThemeModePreference(nextMode)
    appStore.showToast(`Theme mode: ${THEME_MODE_LABELS[nextMode]}`, 'success')
  }

  watch(
    [
      () => appStore.currentRoomId,
      () => appStore.roomName,
      () => appStore.roomPresenceActive,
      () => appStore.roomHasRoundParticipant,
    ],
    () => {
      if (isDockOnlyRoute.value) return
      syncExternalDockContext()
    },
  )

  onUnmounted(() => {
    unregisterShortcuts?.()
    window.removeEventListener('storage', onStorage)
    if (externalDockMonitor !== null) clearInterval(externalDockMonitor)
  })

  function submitSetupName () {
    const trimmed = setupName.value.trim().slice(0, 20)
    configStore.setUserName(trimmed || 'Guest')
    nameSetupOpen.value = false
  }

  async function restoreRoomPillFromRoundParticipant () {
    if (isDemoRoute.value || isPublicRoute.value) return
    if (route.path.startsWith('/app/room/')) return
    if (!configStore.userId) return

    const db = configStore.getDb()
    if (!db) return

    let mostRecentParticipantRoom: {
      id: string
      name: string
      connectedCount: number
      isConnected: boolean
      joinedAt: number
    } | null = null

    for (const recentRoom of configStore.recentRooms) {
      try {
        const snapshot = await get(dbRef(db, `rooms/${recentRoom.id}`))
        if (!snapshot.exists()) continue

        const room = snapshot.val() as {
          name?: string
          users?: Record<string, unknown>
          roundParticipants?: Record<string, { joinedAt?: unknown }>
        }

        const participant = room.roundParticipants?.[configStore.userId]
        if (!participant) continue

        const joinedAt = typeof participant.joinedAt === 'number'
          ? participant.joinedAt
          : recentRoom.joinedAt
        if (mostRecentParticipantRoom && joinedAt <= mostRecentParticipantRoom.joinedAt) continue

        const roomName = room.name ?? recentRoom.name
        const connectedUsers = room.users ?? {}
        mostRecentParticipantRoom = {
          id: recentRoom.id,
          name: roomName,
          connectedCount: Object.keys(connectedUsers).length,
          isConnected: Object.hasOwn(connectedUsers, configStore.userId),
          joinedAt,
        }
      } catch {
        // Ignore transient read errors and keep searching recents.
      }
    }

    if (!mostRecentParticipantRoom) {
      configStore.setActiveRoom(null, null)
      appStore.setRoomInfo(null, '', 0)
      return
    }

    configStore.setActiveRoom(mostRecentParticipantRoom.id, mostRecentParticipantRoom.name)
    appStore.setRoomInfo(
      mostRecentParticipantRoom.id,
      mostRecentParticipantRoom.name,
      mostRecentParticipantRoom.connectedCount,
      mostRecentParticipantRoom.isConnected,
      true,
    )
  }

  function onStorage (event: StorageEvent) {
    if (event.key === EXTERNAL_DOCK_HEARTBEAT_KEY) {
      syncExternalDockStatus()
    }
  }

  function syncExternalDockStatus () {
    appStore.setExternalDockActive(isExternalDockHeartbeatActive())
  }

  function syncExternalDockContext () {
    if (isDemoRoute.value) return
    if (route.meta.dockOnly === true) return
    if (isInRoom.value) {
      const routeRoomId = typeof route.params.roomId === 'string' ? route.params.roomId : null
      const roomId = appStore.currentRoomId ?? routeRoomId
      if (roomId) {
        writeExternalDockContext(roomId, appStore.roomName || configStore.activeRoomName)
      }
      return
    }
    writeExternalDockContext(null, null)
  }
</script>
