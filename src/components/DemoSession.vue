<template>
  <div class="demo-session" data-test-id="demo-session">
    <aside aria-label="About this demo" class="demo-session-banner">
      <div class="demo-session-intro">
        <h1 class="demo-session-label"><v-icon aria-hidden="true" icon="mdi-flask-outline" size="18" /> Demo room</h1>
        <p>Pick a card. {{ botIds.length }} simulated {{ botIds.length === 1 ? 'teammate' : 'teammates' }} will vote with you. Try the settings and play as many rounds as you like.</p>
      </div>

      <div class="demo-session-actions">
        <v-btn
          class="ui-btn ui-btn-ghost"
          data-test-id="demo-new-team"
          prepend-icon="mdi-account-switch-outline"
          variant="flat"
          @click="emit('restart')"
        >New team</v-btn>

        <v-btn class="ui-btn ui-btn-ghost" data-test-id="demo-exit" to="/" variant="flat">Exit demo</v-btn>
      </div>
    </aside>

    <Room />
  </div>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, provide, ref } from 'vue'
  import { MemoryRoomDatabase } from '@/data/memoryRoomDatabase'
  import { DEMO_VISITOR_NAME, demoContextKey } from '@/demo/demoContext'
  import { hostDemoDock } from '@/demo/demoDockChannel'
  import { createDemoRoom } from '@/demo/demoPlayers'
  import { startSimulatedPlayers } from '@/demo/simulatedPlayers'
  import Room from '@/pages/room.vue'
  import { useAppStore } from '@/stores/app'
  import { useConfigStore } from '@/stores/config'

  const emit = defineEmits<{ restart: [] }>()
  const configStore = useConfigStore()
  const appStore = useAppStore()
  configStore.initializeConfig()
  const roomId = crypto.randomUUID()
  const userId = configStore.userId!
  const userName = ref(DEMO_VISITOR_NAME)
  const { room, botIds } = createDemoRoom(userId, userName.value)
  const database = new MemoryRoomDatabase({ rooms: { [roomId]: room } })
  const stopPlayers = startSimulatedPlayers(database, roomId, botIds, userId)
  const closeChannel = hostDemoDock(database, roomId, { userId, userName: userName.value })
  const dockActive = ref(false)
  let dockWindow: Window | null = null
  let disposed = false
  const dockMonitor = setInterval(() => {
    dockActive.value = !!dockWindow && !dockWindow.closed
  }, 500)

  function toggleDock () {
    if (dockWindow && !dockWindow.closed) {
      dockWindow.close()
      dockActive.value = false
      return
    }
    const url = `${import.meta.env.BASE_URL}demo/dock/${roomId}?theme=${encodeURIComponent(appStore.currentTheme)}`
    dockWindow = window.open(url, `Refinimo-demo-${roomId}`, 'popup,width=520,height=720')
    dockActive.value = !!dockWindow
    if (dockWindow) dockWindow.focus()
    else appStore.showToast('Allow popups to open the voting window.', 'error')
  }

  provide(demoContextKey, { database, roomId, userId, userName, dockActive, toggleDock })

  function dispose () {
    if (disposed) return
    disposed = true
    stopPlayers()
    closeChannel()
    dockWindow?.close()
    clearInterval(dockMonitor)
    database.dispose()
    window.removeEventListener('pagehide', dispose)
  }
  function resume (event: PageTransitionEvent) {
    if (event.persisted) emit('restart')
  }
  window.addEventListener('pagehide', dispose)
  window.addEventListener('pageshow', resume)
  onBeforeUnmount(() => {
    dispose()
    window.removeEventListener('pageshow', resume)
  })
</script>

<style scoped>
.demo-session { display: flex; flex-direction: column; height: calc(100dvh - 57px); min-height: 0; }
.demo-session :deep(.shell) { flex: 1; height: auto; min-height: 0; }
.demo-session-banner { display: flex; align-items: center; justify-content: space-between; gap: 12px 24px; padding: 14px 24px; border-bottom: 1px solid var(--border); background: var(--bg-1); }
.demo-session-label { display: inline-flex; align-items: center; gap: var(--icon-text-gap, 6px); margin: 0; color: var(--accent); font-size: 14px; font-weight: 700; }
.demo-session-intro p { margin: 4px 0 0; color: var(--text-2); font-size: 13px; line-height: 1.5; }
.demo-session-actions { display: flex; flex-shrink: 0; gap: 8px; }
@media (max-width: 700px) {
  .demo-session-banner { flex-wrap: wrap; padding: 12px 16px; gap: 8px; }
  .demo-session-actions { margin-left: auto; }
}
</style>
