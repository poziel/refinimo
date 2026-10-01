<template>
  <div class="landing-page" :class="{ 'landing-page-light': !currentThemeDefinition.dark }">
    <a class="landing-skip" href="#landing-content">Skip to content</a>

    <div class="landing-wrap">
      <header class="landing-topbar">
        <router-link class="landing-brand" to="/">
          <span class="landing-brand-mark">
            <img alt="" :src="logoUrl">
          </span>

          <span class="landing-brand-name">Refinimo</span>
        </router-link>

        <nav aria-label="Main navigation" class="landing-nav">
          <router-link
            v-for="tab in LANDING_PAGES"
            :key="tab.id"
            :aria-current="currentTab === tab.id ? 'page' : undefined"
            class="landing-nav-tab"
            :class="{ 'landing-nav-tab-active': currentTab === tab.id }"
            :data-test-id="`landing-tab-${tab.id}`"
            :to="tab.path"
          >
            {{ tab.label }}
          </router-link>
        </nav>

        <div class="landing-header-actions">
          <v-menu location="bottom end">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                :aria-label="`Theme: ${currentThemeDefinition.label} ${appStore.themeModePreference}`"
                class="landing-theme-trigger"
                data-test-id="landing-theme-trigger"
                icon="mdi-palette-outline"
                variant="text"
              />
            </template>

            <div class="landing-theme-menu">
              <div aria-label="Theme mode" class="landing-theme-mode-row" role="group">
                <button
                  v-for="option in themeModeOptions"
                  :key="option.value"
                  :aria-pressed="appStore.themeModePreference === option.value"
                  class="landing-theme-mode-option"
                  :class="{ 'landing-theme-mode-option-active': appStore.themeModePreference === option.value }"
                  :data-test-id="`landing-theme-mode-${option.value}`"
                  type="button"
                  @click="appStore.setThemeModePreference(option.value)"
                >
                  <v-icon :icon="option.icon" size="15" />
                  <span>{{ option.shortLabel }}</span>
                </button>
              </div>

              <div class="landing-theme-options">
                <button
                  v-for="theme in themeOptions"
                  :key="theme.family"
                  :aria-pressed="appStore.currentThemeFamily === theme.family"
                  class="landing-theme-option"
                  :class="{ 'landing-theme-option-active': appStore.currentThemeFamily === theme.family }"
                  type="button"
                  @click="setLandingTheme(theme.family)"
                >
                  <span class="landing-theme-swatch" :style="landingSwatchStyle(theme)">
                    <span class="landing-theme-dot" :style="landingDotStyle(theme)" />
                  </span>

                  <span>{{ theme.label }}</span>
                  <v-icon v-if="appStore.currentThemeFamily === theme.family" icon="mdi-check" size="16" />
                </button>
              </div>
            </div>
          </v-menu>

          <GitHubStarsButton />

          <v-btn
            :append-icon="APP_ENTRY_ICON"
            class="ui-btn ui-btn-primary landing-topbar-cta"
            data-test-id="landing-primary-action"
            to="/app"
            variant="flat"
          >
            {{ primaryActionLabel }}
          </v-btn>
        </div>
      </header>

      <div id="landing-content" ref="contentElement" class="landing-content" tabindex="-1">
        <template v-if="currentTab === 'pitch'">
          <section aria-labelledby="landing-title" class="landing-hero">
            <div class="landing-copy">
              <h1 id="landing-title">Less guessing.<br><span>More alignment.</span></h1>
              <p class="landing-lead">Planning poker that brings every perspective to the table. Vote privately, reveal together, and turn your next sprint into a shared plan.</p>

              <div class="landing-actions">
                <router-link class="landing-button landing-button-primary" data-test-id="landing-hero-action" to="/app">
                  {{ primaryActionLabel }} <v-icon aria-hidden="true" :icon="APP_ENTRY_ICON" size="18" />
                </router-link>

                <button class="landing-button landing-button-secondary" data-test-id="landing-try-preview" type="button" @click="tryPreview">
                  <v-icon icon="mdi-play-circle-outline" size="20" /> Try it out
                </button>
              </div>

              <p class="landing-setup-note">Free to use. One-time Firebase setup required.
                <router-link to="/your-database">Setup guide <v-icon aria-hidden="true" icon="mdi-arrow-right" size="16" /></router-link>
              </p>
            </div>

            <div ref="previewElement" class="landing-preview">
              <LandingDemo />

            </div>
          </section>

          <div aria-label="Product highlights" class="landing-value-strip">
            <span><v-icon icon="mdi-account-multiple-outline" size="20" /> Every voice counts</span>
            <span><v-icon icon="mdi-sync" size="20" /> Together in real time</span>
            <span><v-icon icon="mdi-lock-outline" size="19" /> Your data, in your hands</span>
            <span><v-icon icon="mdi-credit-card-off-outline" size="20" /> No subscription</span>
          </div>

          <section class="landing-section landing-rhythm">
            <div class="landing-section-head landing-section-head-split">
              <div><h2>Get on the same page.<br>One card at a time.</h2></div>
              <p>Less ceremony, more conversation.<br>Give your team a simple way to think independently—and move forward together.</p>
            </div>

            <div class="landing-journey">
              <article v-for="step in planningSteps" :key="step.number" class="landing-journey-step">
                <div class="landing-journey-top"><span>{{ step.number }}</span><v-icon :icon="step.icon" size="24" /></div>
                <h3>{{ step.title }}</h3><p>{{ step.body }}</p>
              </article>
            </div>
          </section>

          <section class="landing-section landing-toolkit">
            <div class="landing-section-head"><h2>Make room for your way of working.</h2></div>

            <div class="landing-feature-grid">
              <article class="landing-feature landing-feature-decks">
                <div aria-hidden="true" class="landing-card-fan">
                  <div v-for="value in [3, 5, 8]" :key="value" class="landing-fan-card">
                    <PlanningCard flipped :selected="value === 5" :value="value" />
                  </div>
                </div>

                <div><h3>A deck that fits the discussion.</h3><p>Fibonacci, custom values, a question mark, or a coffee break. Pick the cards that make sense to your team.</p></div>
              </article>

              <article class="landing-feature">
                <div aria-hidden="true" class="landing-history-preview"><div><span class="landing-history-check">✓</span><span>Improve onboarding</span><b>5</b></div><div><span class="landing-history-check">✓</span><span>Add team invitations</span><b>3</b></div><div><span class="landing-history-check">✓</span><span>Polish the dashboard</span><b>8</b></div></div>
                <div><h3>Good context. Better decisions.</h3><p>Keep task details close and revisit past rounds with optional session history. The conversation has somewhere to land.</p></div>
              </article>
            </div>

            <div class="landing-extras"><span>And the details that keep things moving</span><span><v-icon icon="mdi-timer-outline" size="17" /> Round timers</span><span><v-icon icon="mdi-account-star-outline" size="17" /> Leader controls</span><span><v-icon icon="mdi-monitor-cellphone" size="17" /> Separate voting dock</span></div>
          </section>

          <section aria-labelledby="landing-ownership-title" class="landing-ownership" data-test-id="landing-ownership">
            <div class="landing-ownership-visual">
              <OwnershipIllustration />
            </div>

            <div class="landing-ownership-copy"><h2 id="landing-ownership-title">Your workspace.<br>Your rules.</h2><p>Refinimo brings the planning table. You bring the Firebase project. Your rooms, votes, and history live in a backend your team controls.</p><p class="landing-ownership-detail">No subscription. No feature tiers. Just a little setup before your first real session.</p><router-link class="landing-text-link" to="/your-database">Your database <v-icon aria-hidden="true" icon="mdi-arrow-right" size="18" /></router-link></div>
          </section>

          <section aria-labelledby="landing-faq-title" class="landing-section landing-faq">
            <div class="landing-section-head"><h2 id="landing-faq-title">A few good questions.</h2></div>
            <div class="landing-faq-list"><details v-for="(question, index) in questions" :key="question.title"><summary :data-test-id="`landing-faq-${index}`">{{ question.title }}<v-icon class="landing-faq-icon" icon="mdi-plus" size="19" /></summary><p>{{ question.answer }}</p></details></div>
          </section>

          <section aria-labelledby="landing-final-title" class="landing-final-cta" data-test-id="landing-final-cta">
            <div class="landing-final-copy">
              <h2 id="landing-final-title"><span v-for="line in BRAND_TAGLINE_LINES" :key="line">{{ line }}</span></h2>
              <p>Give every teammate a say in your next sprint.</p>
              <router-link class="landing-button landing-button-primary" data-test-id="landing-final-action" to="/app">{{ primaryActionLabel }} <v-icon aria-hidden="true" :icon="APP_ENTRY_ICON" size="18" /></router-link>
              <p class="landing-final-note">Free planning poker for your whole team.</p>
            </div>

            <div class="landing-final-art">
              <img
                alt="Planning cards revealed around a shared table"
                data-test-id="landing-hero-image"
                decoding="async"
                height="1086"
                loading="lazy"
                :src="planningTogetherImage"
                width="1448"
              >
            </div>
          </section>
        </template>

        <LandingFeatures v-else-if="currentTab === 'features'" :primary-action-label="primaryActionLabel" />
        <LandingDatabase v-else-if="currentTab === 'database'" />

        <template v-else>
          <section class="landing-section landing-section-with-top-gap">
            <div class="landing-section-head">
              <h1>Good things are<br><span>built together.</span></h1>
              <p class="landing-section-intro">Meet the projects and people behind Refinimo.</p>
            </div>

            <article class="landing-card landing-card-featured">
              <h2>Special thanks to sky0matic</h2>

              <p>
                This project started as a fork of <strong>sky0matic's Poker0Matic</strong>. As the implementation
                moved too far away from sky0matic's original direction for the project, it became its own project
                instead. Special thanks to sky0matic for providing the initial foundation that made this version
                possible.
              </p>

              <a
                class="landing-inline-link"
                href="https://github.com/sky0matic/poker0matic"
                rel="noopener noreferrer"
                target="_blank"
              >
                Visit sky0matic/poker0matic
              </a>
            </article>

            <div class="landing-grid landing-grid-two">
              <article v-for="credit in aboutCredits" :key="credit.title" class="landing-card">
                <h2>{{ credit.title }}</h2>

                <p>{{ credit.body }}</p>

                <a class="landing-inline-link" :href="credit.href" rel="noopener noreferrer" target="_blank">
                  Visit {{ credit.label }}
                </a>
              </article>
            </div>
          </section>
        </template>

      </div>

      <footer class="landing-footer">
        <div class="landing-footer-copy"><router-link class="landing-brand" to="/"><img alt="" height="28" :src="logoUrl" width="28"><span>Refinimo</span></router-link><p>{{ BRAND_TAGLINE }}</p></div>

        <nav aria-label="Footer navigation" class="landing-footer-links">
          <router-link v-for="page in LANDING_PAGES" :key="page.id" :to="page.path">{{ page.id === 'about' ? 'About & credits' : page.label }}</router-link>
          <a href="https://github.com/poziel/refinimo" rel="noopener noreferrer" target="_blank">GitHub <v-icon aria-hidden="true" icon="mdi-open-in-new" size="16" /></a>
        </nav>

        <MadeWithLoveCredit class="landing-maker-credit" />
      </footer>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, nextTick, ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import planningTogetherImage from '@/assets/planning-together.png'
  import GitHubStarsButton from '@/components/landing/GitHubStarsButton.vue'
  import LandingDatabase from '@/components/landing/LandingDatabase.vue'
  import LandingDemo from '@/components/landing/LandingDemo.vue'
  import LandingFeatures from '@/components/landing/LandingFeatures.vue'
  import OwnershipIllustration from '@/components/landing/OwnershipIllustration.vue'
  import MadeWithLoveCredit from '@/components/MadeWithLoveCredit.vue'
  import PlanningCard from '@/components/PlanningCard.vue'
  import { useAppStore } from '@/stores/app'
  import { useConfigStore } from '@/stores/config'
  import { BRAND_TAGLINE, BRAND_TAGLINE_LINES } from '@/utils/brand'
  import { APP_ENTRY_ICON, LANDING_PAGES } from '@/utils/landingNavigation'
  import {
    THEME_FAMILIES,
    THEME_FAMILY_LOOKUP,
    THEME_LOOKUP,
    type ThemeFamily,
    type ThemeModePreference,
  } from '@/utils/themes'

  const appStore = useAppStore()
  const configStore = useConfigStore()
  configStore.initializeConfig()

  const route = useRoute()
  const currentTab = computed(() => route.meta.landingPage ?? 'pitch')
  const logoUrl = `${import.meta.env.BASE_URL}images/logo.png`
  const contentElement = ref<HTMLElement | null>(null)
  const previewElement = ref<HTMLElement | null>(null)
  const themeModeOptions: Array<{ value: ThemeModePreference, shortLabel: string, icon: string }> = [
    { value: 'system', shortLabel: 'Auto', icon: 'mdi-theme-light-dark' },
    { value: 'dark', shortLabel: 'Dark', icon: 'mdi-weather-night' },
    { value: 'light', shortLabel: 'Light', icon: 'mdi-white-balance-sunny' },
  ]
  const themeOptions = computed(() => THEME_FAMILIES.map(family => THEME_FAMILY_LOOKUP[family]))
  const planningSteps = [
    { number: '01', icon: 'mdi-link-variant', title: 'Bring everyone to the table.', body: 'With Firebase connected, create a room and share the link. Your team joins the same space, wherever they work.' },
    { number: '02', icon: 'mdi-cards-outline', title: 'Think for yourself. Pick a card.', body: 'Give everyone room to form their own estimate. Votes stay hidden in the room until it is time to reveal.' },
    { number: '03', icon: 'mdi-forum-outline', title: 'Reveal the “why” behind the number.', body: 'Turn the cards over together. Explore the differences, surface assumptions, and find a shared understanding.' },
  ]
  const questions = [
    { title: 'Is Refinimo really free?', answer: 'Yes. Refinimo has no subscription or paid feature tiers. Your Firebase project is separate and subject to Firebase’s usage limits and any billing settings you choose.' },
    { title: 'Why do I need a Firebase project?', answer: 'Firebase keeps your team’s room in sync: participants, votes, task details, and history. Connecting your own project means your team controls that shared data. The Your database guide walks you through setup.' },
    { title: 'Does everyone need to set up Firebase?', answer: 'One person sets up the Firebase project. Share a room link with the configuration included so teammates can connect to the same project. Refinimo remembers the configuration in each browser.' },
    { title: 'Can we make the room our own?', answer: 'Absolutely. Choose your deck, add task context, enable round history and timers, or use leader controls. Personal themes, avatars, and a separate voting dock help everyone settle in.' },
  ]
  const aboutCredits = [
    {
      title: 'DiceBear',
      body: 'Used for generated avatar styles and lightweight player identities.',
      href: 'https://www.dicebear.com/',
      label: 'DiceBear',
    },
    {
      title: 'Gravatar',
      body: 'Used as an optional profile image source for globally recognized avatars.',
      href: 'https://gravatar.com/',
      label: 'Gravatar',
    },
    {
      title: 'Anggara Putra',
      body: 'Credited for the Magnific playing-card suit artwork used across the card and icon set.',
      href: 'https://www.magnific.com/author/anggara-putra',
      label: 'Magnific',
    },
    {
      title: 'NSFWJS and TensorFlow.js',
      body: 'Used for client-side checks on custom avatar image URLs before they are saved.',
      href: 'https://github.com/infinitered/nsfwjs',
      label: 'NSFWJS',
    },
    {
      title: 'Vue Advanced Cropper',
      body: 'Used for custom avatar image cropping in the profile editor.',
      href: 'https://github.com/advanced-cropper/vue-advanced-cropper',
      label: 'Cropper',
    },
    {
      title: 'Vuetify and Material Design Icons',
      body: 'The interface is built on Vuetify, with Material Design Icons supporting the visual system and controls.',
      href: 'https://vuetifyjs.com/',
      label: 'Vuetify',
    },
    {
      title: 'Firebase Realtime Database',
      body: 'Provides the live synchronization layer for rooms, votes, player presence, and shared session state.',
      href: 'https://firebase.google.com/products/realtime-database',
      label: 'Firebase',
    },
  ]

  const primaryActionLabel = computed(() => configStore.configFound ? 'Open app' : 'Start planning')
  const currentThemeDefinition = computed(() => THEME_LOOKUP[appStore.currentTheme])

  watch(() => route.path, async () => {
    await nextTick()
    contentElement.value?.focus({ preventScroll: true })
  })

  function tryPreview () {
    previewElement.value?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'center',
    })
    const previewControl = previewElement.value?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]:enabled')
      ?? previewElement.value?.querySelector<HTMLButtonElement>('[data-test-id="landing-demo-reveal"]')
    previewControl?.focus({ preventScroll: true })
  }

  function setLandingTheme (theme: ThemeFamily) {
    appStore.setTheme(theme)
  }

  function landingSwatchStyle (theme: typeof themeOptions.value[number]) {
    if (appStore.themeModePreference === 'system') {
      return {
        background: `linear-gradient(135deg, ${theme.dark?.preview.bg} 0 50%, ${theme.light?.preview.bg} 50% 100%)`,
      }
    }

    return { background: theme[appStore.themeModePreference]?.preview.bg }
  }

  function landingDotStyle (theme: typeof themeOptions.value[number]) {
    if (appStore.themeModePreference === 'system') {
      return {
        background: `linear-gradient(135deg, ${theme.dark?.preview.accent} 0 50%, ${theme.light?.preview.accent} 50% 100%)`,
      }
    }

    return { background: theme[appStore.themeModePreference]?.preview.accent }
  }

</script>

<style src="../styles/landing.css"></style>
