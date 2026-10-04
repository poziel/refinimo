<script setup lang="ts">
  import { onUnmounted, ref } from 'vue'
  import { useAppStore } from '@/stores/app'
  import firebaseRulesRaw from '../../../firebase.database.rules.json?raw'

  const appStore = useAppStore()
  const firebaseRules = firebaseRulesRaw.trim()
  const rulesExpanded = ref(false)
  const rulesCopied = ref(false)
  let copiedResetTimer: number | null = null

  async function copyFirebaseRules () {
    try {
      await navigator.clipboard.writeText(firebaseRules)
      rulesCopied.value = true
      appStore.showToast('Firebase rules copied.', 'success')

      if (copiedResetTimer !== null) {
        window.clearTimeout(copiedResetTimer)
      }

      copiedResetTimer = window.setTimeout(() => {
        rulesCopied.value = false
        copiedResetTimer = null
      }, 2000)
    } catch {
      appStore.showToast('Could not copy the Firebase rules.', 'error')
    }
  }

  onUnmounted(() => {
    if (copiedResetTimer !== null) {
      window.clearTimeout(copiedResetTimer)
    }
  })
</script>

<template>
  <section id="database-rules" aria-labelledby="landing-rules-title" class="landing-rules-section">
    <div class="landing-rules-head">
      <h2 id="landing-rules-title">Realtime Database rules</h2>

      <button
        aria-controls="firebase-rules"
        :aria-expanded="rulesExpanded"
        class="landing-rules-toggle"
        data-test-id="landing-toggle-rules"
        type="button"
        @click="rulesExpanded = !rulesExpanded"
      >
        <span>{{ rulesExpanded ? 'Hide rules' : 'Show rules' }}</span>
        <v-icon :icon="rulesExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="16" />
      </button>
    </div>

    <p class="landing-rules-copy">
      Copy these rules into the Rules tab of your Realtime Database, then publish. Once your web app is registered, open configuration to connect Refinimo.
    </p>

    <div v-if="rulesExpanded" id="firebase-rules" class="landing-code-shell">
      <v-btn
        :aria-label="rulesCopied ? 'Rules copied' : 'Copy Firebase rules'"
        class="ui-btn ui-btn-ghost landing-copy-icon"
        data-test-id="landing-copy-rules"
        :icon="rulesCopied ? 'mdi-check' : 'mdi-content-copy'"
        size="small"
        variant="flat"
        @click="copyFirebaseRules"
      />

      <pre class="landing-code-block"><code>{{ firebaseRules }}</code></pre>
    </div>

    <div class="landing-rules-actions">
      <v-btn
        class="ui-btn ui-btn-primary landing-cta"
        data-test-id="landing-open-configuration"
        prepend-icon="mdi-cog-outline"
        to="/app/config"
        variant="flat"
      >
        Open configuration
      </v-btn>
    </div>
  </section>
</template>
