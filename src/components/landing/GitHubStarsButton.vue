<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

  const repositoryUrl = 'https://github.com/poziel/refinimo'
  const apiUrl = 'https://api.github.com/repos/poziel/refinimo'
  const cacheKey = 'refinimo:github-stars'
  const cacheLifetime = 30 * 60 * 1000
  const stars = ref<number | null>(null)
  const controller = new AbortController()
  let timeout: ReturnType<typeof setTimeout> | undefined

  const countLabel = computed(() => stars.value?.toLocaleString('en-US'))
  const linkLabel = computed(() => stars.value === null
    ? 'Refinimo on GitHub (opens in a new tab)'
    : `Refinimo on GitHub, ${countLabel.value} ${stars.value === 1 ? 'star' : 'stars'} (opens in a new tab)`)

  function isStarCount (value: unknown): value is number {
    return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
  }

  function readCachedCount (): number | null {
    try {
      const cached = JSON.parse(sessionStorage.getItem(cacheKey) ?? 'null')
      if (!cached || !isStarCount(cached.count) || !Number.isSafeInteger(cached.fetchedAt)) return null
      const age = Date.now() - cached.fetchedAt
      return age >= 0 && age < cacheLifetime ? cached.count : null
    } catch {
      return null
    }
  }

  onMounted(async () => {
    stars.value = readCachedCount()
    if (stars.value !== null) return

    timeout = setTimeout(() => controller.abort(), 5000)
    try {
      const response = await fetch(apiUrl, {
        headers: { Accept: 'application/vnd.github+json' },
        credentials: 'omit',
        signal: controller.signal,
      })
      if (!response.ok) return
      const repository = await response.json()
      if (controller.signal.aborted || !isStarCount(repository?.stargazers_count)) return
      stars.value = repository.stargazers_count
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify({ count: stars.value, fetchedAt: Date.now() }))
      } catch {
        // The repository link and fetched count still work when storage is unavailable.
      }
    } catch {
      // Keep the GitHub link usable if the optional public count cannot be loaded.
    } finally {
      clearTimeout(timeout)
    }
  })

  onBeforeUnmount(() => {
    controller.abort()
    clearTimeout(timeout)
  })
</script>

<template>
  <a
    :aria-label="linkLabel"
    class="landing-github"
    data-test-id="landing-github"
    :href="repositoryUrl"
    rel="noopener noreferrer"
    target="_blank"
  >
    <v-icon aria-hidden="true" icon="mdi-github" size="19" />
    <span class="landing-github-label">GitHub</span>

    <span v-if="stars !== null" aria-hidden="true" class="landing-github-count" data-test-id="landing-github-stars">
      <v-icon icon="mdi-star-outline" size="16" />
      {{ countLabel }}
    </span>
  </a>
</template>

<style scoped>
.landing-github {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--icon-text-gap);
  min-height: 44px;
  padding: 8px 12px;
  border: 1px solid var(--lp-border);
  border-radius: 8px;
  background: var(--lp-surface);
  color: var(--lp-text);
  font-size: var(--lp-type-control);
  font-weight: 550;
  line-height: 1.4;
  text-decoration: none;
  white-space: nowrap;
  transition: border-color 160ms ease, background-color 160ms ease;
}

.landing-github:hover {
  border-color: var(--lp-accent);
  background: var(--lp-elevated);
}

.landing-github:focus-visible {
  outline: 2px solid var(--lp-accent);
  outline-offset: 4px;
}

.landing-github-count {
  display: inline-flex;
  align-items: center;
  gap: var(--icon-text-gap);
  border-left: 1px solid var(--lp-border);
  padding-left: 8px;
  margin-left: 1px;
  color: var(--lp-muted);
  font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  .landing-github { transition: none; }
}

@media (max-width: 620px) {
  .landing-github-label { display: none; }
}
@media (min-width: 1151px) and (max-width: 1279px) {
  .landing-github-label { display: none; }
}
</style>
