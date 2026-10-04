<template>
  <v-menu content-class="ui-user-menu" location="bottom end" origin="top end">
    <template #activator="{ props }">
      <v-btn v-bind="props" class="user-menu-btn" data-test-id="user-menu-button" variant="text">
        <PlayerAvatar
          :avatar-bg="configStore.avatarBg"
          :avatar-seed="configStore.avatarSeed || displayName"
          :avatar-source="configStore.avatarSource"
          :avatar-style="configStore.avatarStyle"
          :avatar-url="avatarUrl"
          :custom-avatar-crop="configStore.customAvatarCrop"
          :custom-avatar-url="configStore.customAvatarUrl"
          :size="32"
          square
        />

        <span class="user-menu-name">{{ displayName }}</span>
      </v-btn>
    </template>

    <v-list class="ui-menu-list" density="compact" min-width="200">
      <v-list-item
        class="ui-menu-item"
        data-test-id="user-menu-profile"
        prepend-icon="mdi-account-cog"
        title="Preferences"
        @click="appStore.setPreferencesModalOpen(true)"
      />

      <v-divider class="ui-menu-divider" />

      <v-list-item
        v-if="!demo"
        class="ui-menu-item"
        data-test-id="user-menu-configuration"
        prepend-icon="mdi-cog"
        title="Configuration"
        @click="appStore.setConfigModalOpen(true)"
      />

      <v-list-item
        class="ui-menu-item"
        data-test-id="user-menu-keyboard-shortcuts"
        prepend-icon="mdi-keyboard-outline"
        title="Keyboard shortcuts"
        @click="appStore.setKeyboardShortcutsModalOpen(true)"
      />

      <v-list-item
        class="ui-menu-item"
        data-test-id="user-menu-about"
        prepend-icon="mdi-information-outline"
        title="About"
        @click="aboutModalOpen = true"
      />
    </v-list>
  </v-menu>

  <UserSettingsModal v-model="appStore.preferencesModalOpen" />
  <KeyboardShortcutsModal v-model="appStore.keyboardShortcutsModalOpen" />
  <AboutModal v-model="aboutModalOpen" />
</template>

<script lang="ts" setup>
  import { storeToRefs } from 'pinia'
  import { computed, ref } from 'vue'
  import AboutModal from '@/components/AboutModal.vue'
  import KeyboardShortcutsModal from '@/components/KeyboardShortcutsModal.vue'
  import PlayerAvatar from '@/components/PlayerAvatar.vue'
  import UserSettingsModal from '@/components/settings/UserSettingsModal.vue'
  import { DEMO_VISITOR_NAME } from '@/demo/demoContext'
  import { useAppStore } from '@/stores/app'
  import { useConfigStore } from '@/stores/config'
  import { buildGravatarAvatarUrl, isValidGravatarEmail } from '@/utils/avatarStyles'

  const menuProps = defineProps<{ demo?: boolean }>()
  const appStore = useAppStore()
  const configStore = useConfigStore()
  const { userName } = storeToRefs(configStore)

  const aboutModalOpen = ref(false)

  const displayName = computed(() => menuProps.demo ? DEMO_VISITOR_NAME : userName.value || 'Guest')
  const avatarUrl = computed(() => (
    configStore.avatarSource === 'gravatar' && isValidGravatarEmail(configStore.gravatarEmail)
      ? buildGravatarAvatarUrl(configStore.gravatarEmail, 128)
      : null
  ))
</script>
