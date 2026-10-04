<template>
  <Dock v-if="ready && !error" />

  <main v-else class="dock-window">
    <section class="dock-window-panel dock-window-empty">
      <h1>Demo voting dock</h1>
      <p role="status">{{ error || 'Connecting to your demo room…' }}</p>
      <v-btn v-if="error" class="ui-btn ui-btn-primary" to="/demo" variant="flat">Start a new demo</v-btn>
    </section>
  </main>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, provide, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { DEMO_VISITOR_NAME, demoContextKey } from '@/demo/demoContext'
  import { connectDemoDock } from '@/demo/demoDockChannel'
  import Dock from '@/pages/dock.vue'

  const route = useRoute()
  const roomId = String(route.params.roomId)
  const ready = ref(false)
  const error = ref('')
  const userName = ref(DEMO_VISITOR_NAME)
  const connection = connectDemoDock(roomId, () => {
    error.value = 'This demo has ended. You can start a new one anytime.'
  })
  const context = { database: connection.database, roomId, userId: '', userName, dockActive: ref(true), toggleDock: () => window.close() }
  provide(demoContextKey, context)
  connection.ready.then(identity => {
    context.userId = identity.userId
    userName.value = identity.userName
    ready.value = true
  }).catch((error_: Error) => {
    error.value = error_.message
  })
  onBeforeUnmount(connection.dispose)
</script>
