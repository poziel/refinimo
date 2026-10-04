<script setup lang="ts">
  import { computed, ref } from 'vue'
  import PlanningCard from '@/components/PlanningCard.vue'

  const choices = ['1', '2', '3', '5', '8', '13', '?']
  const selectedVote = ref('5')
  const revealed = ref(false)
  const participants = computed(() => [
    { name: 'Maya', initials: 'M', color: 'peach', vote: '3' },
    { name: 'Jules', initials: 'J', color: 'lilac', vote: '5' },
    { name: 'Alex', initials: 'A', color: 'mint', vote: '8' },
    { name: 'You', initials: 'Y', color: 'blue', vote: selectedVote.value },
  ])
  const status = computed(() => {
    if (!revealed.value) return `Your vote is ${selectedVote.value}. Ready to see what everyone thinks?`
    if (selectedVote.value === '?') return 'A question is a good place to start. Talk through what feels uncertain.'
    const values = [3, 5, 8, Number(selectedVote.value)]
    return `Estimates range from ${Math.min(...values)} to ${Math.max(...values)}. Talk through the differences.`
  })
</script>

<template>
  <section aria-label="Interactive planning poker preview" class="landing-demo" data-test-id="landing-demo">
    <div class="demo-window">
      <header class="demo-toolbar">
        <div class="demo-room-title">
          <span aria-hidden="true" class="demo-room-icon">◇</span>
          <span>Sprint planning</span>
        </div>

        <span class="demo-room-badge">Demo room</span>
      </header>

      <div class="demo-story">
        <div class="demo-story-meta"><span>STORY 024</span><span>Fibonacci deck</span></div>
        <h2>Make onboarding feel effortless</h2>
      </div>

      <div class="demo-table" :class="{ 'demo-table-revealed': revealed }">
        <div aria-hidden="true" class="demo-table-outline" />

        <div class="demo-participants">
          <div v-for="(person, index) in participants" :key="person.name" class="demo-participant">
            <PlanningCard
              :aria-label="`${person.name}: ${revealed ? `${person.vote} points` : 'vote hidden'}`"
              class="demo-playing-card"
              :class="{ 'demo-playing-card-revealed': revealed }"
              compact
              :data-player-name="person.name"
              data-test-id="landing-demo-participant-card"
              :flip-delay="`${index * 45}ms`"
              :flipped="revealed"
              role="img"
              :style="{ '--card-tilt': `${[-7, -3, 4, 8][index]}deg`, '--card-delay': `${index * 45}ms` }"
              :value="person.vote"
            />

            <div class="demo-person">
              <span aria-hidden="true" class="demo-avatar" :class="`demo-avatar-${person.color}`">{{ person.initials }}</span>
              <span class="demo-person-name">{{ person.name }}</span>
              <svg v-if="!revealed" aria-hidden="true" class="demo-voted-check" viewBox="0 0 16 16"><path d="m3.5 8 3 3 6-6" /></svg>
            </div>
          </div>
        </div>

        <button class="demo-reveal" data-test-id="landing-demo-reveal" type="button" @click="revealed = !revealed">
          <svg v-if="!revealed" aria-hidden="true" viewBox="0 0 20 20"><path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5Z" /><circle cx="10" cy="10" r="2" /></svg>
          <svg v-else aria-hidden="true" viewBox="0 0 20 20"><path d="M4 6a7 7 0 1 1-1 6M4 2v4h4" /></svg>
          {{ revealed ? 'Start a new round' : 'Reveal cards' }}
        </button>

        <p aria-live="polite" class="demo-status" role="status">{{ status }}</p>
      </div>

      <div class="demo-voting">
        <div class="demo-voting-label"><span>Your estimate</span>

          <span>{{ revealed ? 'Round revealed' : 'Only you can see it' }}<svg v-if="!revealed" aria-hidden="true" viewBox="0 0 16 16"><rect
                                                                                                                                        height="7"
                                                                                                                                        rx="1.5"
                                                                                                                                        width="9"
                                                                                                                                        x="3.5"
                                                                                                                                        y="7"
                                                                                                                                      />

            <path d="M5.5 7V4.5a2.5 2.5 0 0 1 5 0V7" /></svg></span></div>

        <div aria-label="Choose your estimate" class="demo-vote-choices" role="group">
          <PlanningCard
            v-for="choice in choices"
            :key="choice"
            :aria-label="choice === '?' ? 'Choose uncertain estimate' : `Choose ${choice} points`"
            :aria-pressed="selectedVote === choice"
            class="demo-vote-choice"
            data-test-id="landing-demo-vote"
            :disabled="revealed"
            flipped
            mini
            selectable
            :selected="selectedVote === choice"
            :value="choice"
            @select="selectedVote = choice"
          />
        </div>
      </div>
    </div>

  </section>
</template>

<style scoped>
.landing-demo {
  width: 100%;
  min-width: 0;
  color: var(--lp-text, #f1f2f5);
  font-family: inherit;
}

.demo-toolbar,
.demo-room-title,
.demo-story-meta,
.demo-person,
.demo-voting-label,
.demo-voting-label > span,
.demo-reveal {
  display: flex;
  align-items: center;
}

.demo-window {
  overflow: hidden;
  border: 1px solid var(--lp-border, #303745);
  border-radius: 17px;
  background: var(--lp-surface, #141920);
  box-shadow: var(--lp-demo-shadow, 0 28px 70px -28px #03060d80, 0 1px 0 #ffffff08 inset);
}

.demo-toolbar {
  min-height: 51px;
  padding: 10px 23px;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--lp-border, #303745);
  background: var(--lp-elevated, #1b2029);
}

.demo-room-title { min-width: 0; gap: var(--icon-text-gap); font-size: var(--lp-type-control, .875rem); font-weight: 650; line-height: 1.5; overflow-wrap: anywhere; }
.demo-room-icon { flex-shrink: 0; color: var(--lp-accent, #6c94ff); font-size: 26px; line-height: 1; }
.demo-room-badge { padding: 4px 8px; border: 1px solid var(--lp-border, #303745); border-radius: 5px; color: var(--lp-muted, #a6aebc); font-size: var(--lp-type-caption, .75rem); line-height: 1.5; }
.demo-story { padding: 15px 24px 0; }
.demo-story-meta { flex-wrap: wrap; justify-content: space-between; gap: 6px 12px; color: var(--lp-muted, #a6aebc); font-size: var(--lp-type-caption, .75rem); line-height: 1.5; }
.demo-story-meta > span:first-child { font-family: monospace; letter-spacing: 0.08em; }
.demo-story h2 { margin: 7px 0 0; font-size: var(--lp-type-body, 1rem); font-weight: 600; line-height: 1.5; letter-spacing: -0.025em; }

.demo-table { position: relative; isolation: isolate; padding: 19px 24px 20px; text-align: center; }
.demo-table-outline { position: absolute; z-index: -1; top: 45px; left: 18px; right: 18px; height: 100px; border: 1px solid color-mix(in srgb, var(--lp-accent, #6c94ff) 16%, transparent); border-radius: 50%; background: var(--lp-demo-table, var(--lp-elevated, #1b2029)); }
.demo-table-outline::after { position: absolute; inset: 7px; border: 1px solid color-mix(in srgb, var(--lp-accent, #6c94ff) 6%, transparent); border-radius: inherit; content: ''; }
.demo-participants { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; max-width: 382px; margin: 0 auto; }
.demo-participant { display: flex; flex-direction: column; align-items: center; min-width: 0; }
.demo-playing-card { transform: rotate(var(--card-tilt)); transition: transform 240ms ease var(--card-delay); }
.demo-playing-card-revealed { transform: rotate(0deg) translateY(-3px); }
.demo-person { min-height: 19px; max-width: 100%; flex-wrap: wrap; justify-content: center; gap: 4px 5px; margin-top: 12px; font-size: var(--lp-type-caption, .75rem); font-weight: 500; line-height: 1.5; }
.demo-person-name { min-width: 0; overflow-wrap: anywhere; }
.demo-avatar { display: grid; place-items: center; width: 19px; height: 19px; flex-shrink: 0; border-radius: 50%; font-size: 9px; font-weight: 700; }
.demo-avatar-peach { background: #e6b79a; color: #593824; }
.demo-avatar-lilac { background: #bdb3dc; color: #443863; }
.demo-avatar-mint { background: #afd1bd; color: #315740; }
.demo-avatar-blue { background: #b4c7f5; color: #304a82; }
.demo-voted-check { flex-shrink: 0; width: 11px; height: 11px; fill: none; stroke: var(--lp-accent, #6c94ff); stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.demo-reveal { justify-content: center; gap: var(--icon-text-gap); min-height: 44px; max-width: 100%; margin: 32px auto 0; padding: 10px 17px; border: 1px solid color-mix(in srgb, var(--lp-accent, #6c94ff) 33%, transparent); border-radius: 7px; background: var(--lp-accent-soft, #6c94ff13); color: var(--lp-accent, #6c94ff); font: inherit; font-size: var(--lp-type-control, .875rem); font-weight: 650; line-height: 1.5; cursor: pointer; transition: background 180ms, transform 180ms; }
.demo-reveal:hover { background: color-mix(in srgb, var(--lp-accent, #6c94ff) 18%, var(--lp-surface, #141920)); transform: translateY(-1px); }
.demo-reveal svg { flex-shrink: 0; width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.demo-status { max-width: 360px; min-height: 3em; margin: 12px auto 0; color: var(--lp-muted, #a6aebc); font-size: var(--lp-type-small, .8125rem); line-height: 1.5; text-wrap: balance; overflow-wrap: anywhere; }

.demo-voting { padding: 13px 24px 15px; border-top: 1px solid var(--lp-border, #303745); background: var(--lp-elevated, #1b2029); }
.demo-voting-label { flex-wrap: wrap; justify-content: space-between; gap: 8px 16px; margin-bottom: 14px; font-size: var(--lp-type-small, .8125rem); font-weight: 500; line-height: 1.5; }
.demo-voting-label > span:last-child { gap: var(--icon-text-gap); color: var(--lp-muted, #a6aebc); font-size: var(--lp-type-caption, .75rem); font-weight: 400; }
.demo-voting-label svg { flex-shrink: 0; width: 11px; height: 11px; fill: none; stroke: currentColor; stroke-width: 1.1; }
.demo-vote-choices { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px; max-width: 345px; margin: 0 auto; padding-top: 8px; }
.demo-vote-choice { --planning-card-w: 100%; --planning-card-h: auto; min-height: 44px; aspect-ratio: 7 / 10; }
.demo-vote-choice.planning-card-selected,
.demo-vote-choice.planning-card-selected:hover,
.demo-vote-choice.planning-card-selected:focus-visible { transform: translateY(-6px); }
.demo-vote-choice:disabled { cursor: default; }
.demo-vote-choice:disabled:not(.planning-card-selected) { transform: none; }
.demo-reveal:focus-visible,
.demo-vote-choice:focus-visible { outline: 2px solid var(--lp-accent, #6c94ff); outline-offset: 4px; }

@media (max-width: 600px) {
  .demo-toolbar { min-height: 51px; padding-inline: 16px; }
  .demo-story { padding-inline: 17px; }
  .demo-table { padding-inline: 13px; }
  .demo-playing-card { --planning-card-w: 49px; --planning-card-h: 69px; }
  .demo-participants { gap: 5px; }
  .demo-person { gap: 4px; }
  .demo-person-name { flex-basis: 100%; order: 1; }
  .demo-avatar { width: 17px; height: 17px; font-size: 8px; }
  .demo-reveal { min-height: 44px; }
  .demo-voting { padding-inline: 17px; }
  .demo-vote-choices { gap: 6px; }
  .demo-status { max-width: 265px; }
}

@media (prefers-reduced-motion: reduce) {
  .demo-playing-card,
  .demo-reveal,
  .demo-vote-choice,
  .landing-demo :deep(.planning-card-back),
  .landing-demo :deep(.planning-card-face) { transition: none; }
}
</style>
