<script setup lang="ts">
  import { computed, ref } from 'vue'
  import PlanningCard from '@/components/PlanningCard.vue'
  import { APP_ENTRY_ICON } from '@/utils/landingNavigation'

  defineProps<{ primaryActionLabel: string }>()

  const decks = [
    { name: 'Fibonacci', values: [1, 2, 3, 5, 8] },
    { name: 'T-shirt', values: ['XS', 'S', 'M', 'L', 'XL'] },
    { name: 'Custom', values: [1, 4, 8, '?', '☕'] },
  ]
  const selectedDeck = ref(0)
  const deck = computed(() => decks[selectedDeck.value]!)
  const rounds = [
    { title: 'Improve onboarding', points: '5', round: '03' },
    { title: 'Add team invitations', points: '3', round: '02' },
    { title: 'Polish the dashboard', points: '8', round: '01' },
  ]
</script>

<template>
  <div class="landing-section landing-section-with-top-gap features-page" data-test-id="landing-features">
    <header class="features-intro">
      <h1>Everything for<br><span>your next round.</span></h1>
      <p class="landing-section-intro">Explore the tools for your next planning session.</p>
    </header>

    <section aria-labelledby="features-voting-title" class="features-voting">
      <div class="features-voting-copy">
        <h2 id="features-voting-title">Every vote<br>gets a voice.</h2>
        <p>Pick your estimate without seeing everyone else's. Reveal the cards together, talk through the differences, and start the next round.</p>

        <ul>
          <li><v-icon aria-hidden="true" icon="mdi-cards-playing-outline" size="20" /> Hidden votes until the reveal</li>
          <li><v-icon aria-hidden="true" icon="mdi-sync" size="20" /> Everyone in sync, in real time</li>
          <li><v-icon aria-hidden="true" icon="mdi-restart" size="20" /> A fresh round in one click</li>
        </ul>
      </div>

      <figure aria-label="Example estimates and discussion" class="features-estimates">
        <figcaption>One story, different estimates<v-icon aria-hidden="true" icon="mdi-comment-text-multiple-outline" size="22" /></figcaption>

        <div class="features-estimate-cards">
          <div v-for="(name, index) in ['Maya', 'Jules', 'Alex']" :key="name" class="features-estimate-person">
            <PlanningCard
              :aria-label="`${name}: ${[3, 5, 8][index]} points`"
              flipped
              role="img"
              :value="[3, 5, 8][index]"
            />

            <span>{{ name }}</span>
          </div>
        </div>

        <div aria-hidden="true" class="features-estimate-connector"><span /></div>

        <div class="features-discussion">
          <p><span class="features-discussion-estimate">3</span><span>“We can reuse the existing flow.”</span></p>
          <p><span class="features-discussion-estimate">8</span><span>“The permissions need a closer look.”</span></p>
        </div>
      </figure>
    </section>

    <div class="features-grid">
      <section aria-labelledby="features-decks-title" class="features-panel">
        <div class="features-deck-demo">
          <div aria-label="Example deck" class="features-deck-options" role="group">
            <button
              v-for="(option, index) in decks"
              :key="option.name"
              :aria-pressed="selectedDeck === index"
              data-test-id="feature-deck-choice"
              type="button"
              @click="selectedDeck = index"
            >{{ option.name }}</button>
          </div>

          <div :aria-label="`${deck.name} example cards`" class="features-deck-cards" role="img">
            <PlanningCard
              v-for="value in deck.values"
              :key="value"
              aria-hidden="true"
              flipped
              :value="value"
            />
          </div>
        </div>

        <div class="features-panel-copy">
          <h2 id="features-decks-title">Your team. Your scale.</h2>
          <p>Use Fibonacci, T-shirt sizes, or a custom deck. Add a question mark when you're unsure, or a coffee card when it's time for a break.</p>
        </div>
      </section>

      <section aria-labelledby="features-history-title" class="features-panel">
        <div aria-label="Example round history" class="features-history-demo">
          <div class="features-mini-heading"><v-icon aria-hidden="true" icon="mdi-history" size="19" /> Round history <span>3 rounds</span></div>
          <div v-for="round in rounds" :key="round.round" class="features-history-row"><span>{{ round.round }}</span><span>{{ round.title }}</span><strong>{{ round.points }}</strong></div>
        </div>

        <div class="features-panel-copy">
          <h2 id="features-history-title">Keep the context.</h2>
          <p>Add a task title, description, and link. With history enabled, revisit previous rounds and the estimates your team agreed on.</p>
        </div>
      </section>

      <section aria-labelledby="features-timers-title" class="features-panel">
        <div aria-hidden="true" class="features-timer-demo">
          <div class="features-timer-clock">
            <svg viewBox="0 0 140 140"><circle class="features-timer-track" cx="70" cy="70" r="61" /><circle class="features-timer-progress" cx="70" cy="70" r="61" /></svg>
            <div><v-icon icon="mdi-timer-outline" size="19" /><strong>01:30</strong><span>Time to vote</span></div>
          </div>

          <div class="features-leader-note"><span class="features-leader-avatar">M</span><span>Maya<small>Session leader</small></span><v-icon icon="mdi-account-star-outline" size="22" /></div>
        </div>

        <div class="features-panel-copy">
          <h2 id="features-timers-title">Keep the session moving.</h2>
          <p>Set a round timer, choose automatic or manual timing, and let a session leader guide reveals and resets when your team needs a facilitator.</p>
        </div>
      </section>

      <section aria-labelledby="features-dock-title" class="features-panel">
        <div aria-hidden="true" class="features-dock-demo">
          <div class="features-work-window"><div><span /><span /><span /></div><strong>Make onboarding feel effortless</strong><i /><i /><i /></div>

          <div class="features-dock-window"><div><v-icon icon="mdi-dock-window" size="17" /> Voting dock</div>

            <div class="features-dock-cards"><PlanningCard
              v-for="value in [3, 5, 8]"
              :key="value"
              flipped
              :selected="value === 5"
              :value="value"
            /></div></div>
        </div>

        <div class="features-panel-copy">
          <h2 id="features-dock-title">A little room for your vote.</h2>
          <p>Open the voting dock in its own window. Keep your cards nearby while the task, meeting, or discussion stays front and center.</p>
        </div>
      </section>
    </div>

    <section aria-label="More ways to make it yours" class="features-details">
      <article><v-icon aria-hidden="true" icon="mdi-link-variant" size="26" /><h2>One link for the team.</h2><p>Share a room link with its configuration so everyone can join the same session.</p></article>
      <article><v-icon aria-hidden="true" icon="mdi-palette-outline" size="26" /><h2>Feel at home.</h2><p>Choose a theme, make an avatar your own, and react together as the cards turn.</p></article>
      <article><v-icon aria-hidden="true" icon="mdi-database-outline" size="26" /><h2>Bring your own database.</h2><p>Keep the team's rooms, votes, and history in your own Firebase project.</p><router-link class="landing-inline-link" to="/your-database">Explore the setup <v-icon aria-hidden="true" icon="mdi-arrow-right" size="17" /></router-link></article>
    </section>

    <section aria-labelledby="features-closing-title" class="features-closing" data-test-id="features-next-steps">
      <div class="features-closing-copy">
        <div aria-hidden="true" class="features-team"><span>M</span><span>J</span><span>A</span><span>You</span><span class="features-team-invite"><v-icon icon="mdi-plus" size="20" /></span></div>
        <h2 id="features-closing-title">The next round<br>is yours.</h2>
        <p>Choose your deck, bring your team, and make space for the conversation.</p>
      </div>

      <div class="features-next-steps">
        <router-link class="features-next-link features-next-link-primary" data-test-id="features-open-app" to="/app">
          <span class="features-next-title">{{ primaryActionLabel }}<v-icon aria-hidden="true" :icon="APP_ENTRY_ICON" size="20" /></span>
          <span>Create a room or return to your team.</span>
        </router-link>

        <router-link class="features-next-link" data-test-id="features-setup-guide" to="/your-database">
          <span class="features-next-title">Set up your database<v-icon aria-hidden="true" icon="mdi-arrow-right" size="20" /></span>
          <span>First visit? Start with the three-step guide.</span>
        </router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
.features-intro .landing-section-intro { line-height: 1.8; }
.features-voting { display: grid; grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); gap: 60px; align-items: center; padding: 60px 0; margin-top: 42px; border-block: 1px solid var(--lp-border); }
.features-voting-copy p { font-size: var(--lp-type-body); color: var(--lp-muted); line-height: 1.8; max-width: 390px; margin-top: 20px; }
.features-voting-copy ul { display: grid; gap: 17px; list-style: none; padding: 0; margin-top: 26px; }
.features-voting-copy li { display: flex; align-items: center; gap: var(--icon-text-gap); font-size: var(--lp-type-control); color: var(--lp-muted); }
.features-voting-copy .v-icon { color: var(--lp-accent); }
.features-estimates { margin: 0; min-width: 0; padding: 28px 32px 30px; border: 1px solid var(--lp-border); border-radius: 12px; background: var(--lp-elevated); }
.features-estimates figcaption { display: flex; align-items: center; justify-content: space-between; gap: var(--icon-text-gap); font-size: var(--lp-type-control); color: var(--lp-muted); }
.features-estimates figcaption .v-icon { color: var(--lp-accent); flex-shrink: 0; }
.features-estimate-cards { display: flex; justify-content: center; gap: clamp(24px, 4vw, 56px); margin: 32px 0 16px; }
.features-estimate-person { display: grid; justify-items: center; gap: 14px; color: var(--lp-muted); font-size: var(--lp-type-small); }
.features-estimate-person :deep(.planning-card) { --planning-card-w: 68px; --planning-card-h: 96px; font-size: 30px; }
.features-estimate-person:first-child :deep(.planning-card) { transform: rotate(-6deg); }
.features-estimate-person:last-child :deep(.planning-card) { transform: rotate(6deg); }
.features-estimate-connector { width: 72%; height: 17px; margin: 0 auto 18px; border: 1px solid var(--lp-border); border-top: 0; border-radius: 0 0 8px 8px; position: relative; }
.features-estimate-connector span { position: absolute; top: 100%; left: 50%; height: 18px; border-left: 1px solid var(--lp-border); }
.features-discussion { padding: 5px 20px; background: var(--lp-surface); border: 1px solid var(--lp-border); border-radius: 8px; }
.features-discussion p { display: flex; align-items: center; gap: 12px; padding: 14px 0; color: var(--lp-muted); font-size: var(--lp-type-control); line-height: 1.6; }
.features-discussion p + p { border-top: 1px solid var(--lp-border); }
.features-discussion-estimate { display: grid; place-items: center; width: 27px; height: 34px; flex-shrink: 0; color: var(--lp-accent); background: var(--lp-elevated); border: 1px solid var(--lp-border); border-radius: 4px; font: var(--lp-type-control) var(--font-mono); }
.features-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 26px; margin-top: 60px; }
.features-panel { min-width: 0; border: 1px solid var(--lp-border); background: var(--lp-surface); border-radius: 12px; overflow: hidden; }
.features-panel-copy { padding: 30px; border-top: 1px solid var(--lp-border); }
.features-panel h2 { font-size: 25px; letter-spacing: -.8px; }
.features-panel p { font-size: var(--lp-type-body); line-height: 1.8; color: var(--lp-muted); margin-top: 12px; }
.features-deck-demo, .features-history-demo, .features-timer-demo, .features-dock-demo { height: 236px; background: var(--lp-elevated); }
.features-deck-demo { display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 24px; padding: 24px; }
.features-deck-options { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; }
.features-deck-options button { appearance: none; background: transparent; min-height: 44px; padding: 6px 14px; border: 1px solid transparent; border-radius: 6px; color: var(--lp-muted); font: inherit; font-size: var(--lp-type-control); cursor: pointer; }
.features-deck-options button[aria-pressed="true"] { background: var(--lp-surface); border-color: var(--lp-border); color: var(--lp-accent); }
.features-deck-options button:hover { color: var(--lp-text); }
.features-deck-cards { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.features-deck-cards :deep(.planning-card) { --planning-card-w: 57px; --planning-card-h: 80px; font-size: 24px; }
.features-history-demo { display: flex; flex-direction: column; justify-content: center; padding: 24px 34px; }
.features-mini-heading { display: flex; align-items: center; gap: var(--icon-text-gap); font-size: var(--lp-type-small); font-weight: 550; margin-bottom: 15px; }
.features-mini-heading .v-icon { color: var(--lp-accent); }
.features-mini-heading > span { margin-left: auto; font-size: var(--lp-type-caption); color: var(--lp-muted); font-weight: 400; }
.features-history-row { display: flex; align-items: center; gap: 14px; min-height: 43px; border-top: 1px solid var(--lp-border); font-size: var(--lp-type-small); }
.features-history-row > span:first-child { font: var(--lp-type-caption) var(--font-mono); color: var(--lp-muted); }
.features-history-row strong { margin-left: auto; min-width: 28px; height: 27px; display: grid; place-items: center; border: 1px solid var(--lp-border); border-radius: 4px; background: var(--lp-surface); color: var(--lp-accent); font-family: var(--font-mono); }
.features-timer-demo { display: flex; align-items: center; justify-content: center; gap: 40px; padding: 24px; }
.features-timer-clock { position: relative; width: 140px; height: 140px; flex-shrink: 0; }
.features-timer-clock svg { width: 100%; height: 100%; transform: rotate(-90deg); fill: none; stroke-width: 3; }
.features-timer-track { stroke: var(--lp-border); }
.features-timer-progress { stroke: var(--lp-accent); stroke-dasharray: 280 383; stroke-linecap: round; }
.features-timer-clock > div { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.features-timer-clock .v-icon { color: var(--lp-muted); }
.features-timer-clock strong { font: 30px/1.4 var(--font-mono); }
.features-timer-clock span { color: var(--lp-muted); font-size: var(--lp-type-caption); }
.features-leader-note { display: flex; align-items: center; gap: var(--icon-text-gap); border: 1px solid var(--lp-border); border-radius: 8px; padding: 12px; background: var(--lp-surface); font-size: var(--lp-type-small); }
.features-leader-avatar { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 50%; background: #e1b497; color: #3c302b; }
.features-leader-note small { display: block; margin-top: 4px; color: var(--lp-muted); font-size: var(--lp-type-caption); }
.features-leader-note .v-icon { color: var(--lp-accent); }
.features-dock-demo { position: relative; padding: 27px 34px; overflow: hidden; }
.features-work-window { width: 78%; height: 155px; padding: 15px 18px; border: 1px solid var(--lp-border); border-radius: 8px; background: var(--lp-surface); }
.features-work-window > div { display: flex; gap: 4px; margin-bottom: 16px; }
.features-work-window > div > span { width: 5px; height: 5px; border-radius: 50%; background: var(--lp-muted); opacity: .5; }
.features-work-window strong { display: block; max-width: 85%; font-size: var(--lp-type-small); font-weight: 500; }
.features-work-window i { display: block; width: 80%; height: 4px; margin-top: 10px; border-radius: 3px; background: var(--lp-border); }
.features-work-window i:last-child { width: 45%; }
.features-dock-window { position: absolute; bottom: 24px; right: 34px; padding: 12px 18px; background: var(--lp-surface); border: 1px solid color-mix(in srgb, var(--lp-accent) 35%, var(--lp-border)); border-radius: 8px; box-shadow: 0 8px 20px #00000010; }
.features-dock-window > div:first-child { display: flex; align-items: center; gap: var(--icon-text-gap); color: var(--lp-muted); font-size: var(--lp-type-caption); margin-bottom: 12px; }
.features-dock-cards { display: flex; gap: 8px; }
.features-dock-cards :deep(.planning-card) { --planning-card-w: 38px; --planning-card-h: 54px; font-size: 17px; border-radius: 4px; }
.features-details { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 40px; padding: 60px 0; }
.features-details .v-icon { color: var(--lp-accent); }
.features-details h2 { margin-top: 20px; font-size: 22px; letter-spacing: -.6px; }
.features-details p { font-size: var(--lp-type-body); line-height: 1.8; color: var(--lp-muted); margin-top: 12px; }
.features-closing { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 60px; border: 1px solid var(--lp-border); border-radius: 12px; padding: 46px; background: var(--lp-surface); }
.features-closing-copy { min-width: 0; }
.features-team { display: flex; align-items: center; margin-bottom: 24px; padding-left: 5px; }
.features-team > span { display: grid; place-items: center; width: 39px; height: 39px; margin-left: -5px; border: 3px solid var(--lp-surface); border-radius: 50%; background: #e1b497; color: #292d39; font-size: 13px; font-weight: 600; }
.features-team > span:nth-child(2) { background: #b9aad7; }
.features-team > span:nth-child(3) { background: #9bc5ae; }
.features-team > span:nth-child(4) { background: #aac1f2; }
.features-team > .features-team-invite { border: 1px dashed var(--lp-border); background: transparent; color: var(--lp-muted); margin-left: 8px; width: 33px; height: 33px; }
.features-closing h2 { font-size: clamp(30px, 3vw, 42px); }
.features-closing-copy > p { max-width: 340px; color: var(--lp-muted); font-size: var(--lp-type-body); line-height: 1.8; margin-top: 18px; }
.features-next-steps { display: grid; gap: 14px; min-width: 0; }
.features-next-link { display: grid; gap: 9px; padding: 24px; border: 1px solid var(--lp-border); border-radius: 8px; background: var(--lp-bg); color: var(--lp-muted); text-decoration: none; font-size: var(--lp-type-control); line-height: 1.6; transition: border-color .2s, background .2s; }
.features-next-title { display: flex; align-items: center; gap: var(--icon-text-gap); color: var(--lp-text); font-size: var(--lp-type-body); font-weight: 600; }
.features-next-title .v-icon { flex-shrink: 0; color: var(--lp-accent); }
.features-next-link-primary { background: var(--lp-elevated); border-color: color-mix(in srgb, var(--lp-accent) 30%, var(--lp-border)); }
.features-next-link:hover { background: var(--lp-elevated); border-color: var(--lp-accent); }
@media (max-width: 1100px) {
  .features-voting { gap: 32px; }
  .features-timer-demo { gap: 16px; }
  .features-leader-note { flex-wrap: wrap; }
}
@media (max-width: 900px) {
  .features-voting { grid-template-columns: 1fr; }
  .features-voting-copy { max-width: 620px; }
  .features-voting-copy p { max-width: none; }
  .features-voting > :last-child { max-width: 670px; width: 100%; justify-self: center; }
  .features-grid { gap: 20px; }
  .features-deck-demo, .features-timer-demo { height: auto; min-height: 250px; }
  .features-timer-demo { flex-wrap: wrap; }
  .features-history-demo, .features-dock-demo { height: 250px; padding-inline: 22px; }
  .features-history-row { gap: 8px; }
  .features-dock-window { right: 22px; }
  .features-panel-copy { padding: 24px; }
  .features-details { gap: 24px; }
  .features-closing { gap: 32px; padding: 32px; }
}
@media (max-width: 620px) {
  .features-voting { padding-block: 36px; margin-top: 32px; }
  .features-estimates { padding: 22px 18px; }
  .features-estimate-cards { gap: 23px; }
  .features-estimate-person :deep(.planning-card) { --planning-card-w: 52px; --planning-card-h: 74px; font-size: 25px; }
  .features-discussion { padding-inline: 12px; }
  .features-grid, .features-details { grid-template-columns: minmax(0, 1fr); }
  .features-grid { margin-top: 36px; }
  .features-deck-demo { padding: 20px 14px; }
  .features-deck-cards { gap: 7px; }
  .features-deck-cards :deep(.planning-card) { --planning-card-w: 43px; --planning-card-h: 62px; font-size: 20px; }
  .features-details { gap: 36px; padding-block: 40px; }
  .features-closing { grid-template-columns: minmax(0, 1fr); padding: 26px; }
  .features-next-link { padding: 18px; }
}
</style>
