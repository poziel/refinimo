<script setup lang="ts">
  import DatabaseRules from './DatabaseRules.vue'

  const logoUrl = `${import.meta.env.BASE_URL}images/logo.png`
</script>

<template>
  <div class="landing-section landing-section-with-top-gap database-page" data-test-id="landing-database">
    <header class="database-intro">
      <div>
        <h1>Bring your<br><span>own database.</span></h1>
        <p class="landing-section-intro">Refinimo is the planning table. Firebase keeps everyone in sync. Connect a project your team owns, and use it for every session.</p>
        <p class="database-team-note"><v-icon aria-hidden="true" icon="mdi-account-multiple-outline" size="21" /> One person sets it up. The whole team joins.</p>
      </div>

      <figure aria-label="Your team's browsers connect directly to your Firebase project" class="database-connection">
        <div aria-hidden="true" class="database-browser">
          <div class="database-browser-bar"><img alt="" height="28" :src="logoUrl" width="28"><strong>Refinimo</strong><span /><span /><span /></div>

          <div class="database-browser-content">
            <div class="database-devices"><v-icon icon="mdi-laptop" size="35" /><v-icon icon="mdi-laptop" size="35" /><v-icon icon="mdi-cellphone" size="28" /></div>
            <strong>Your team's browsers</strong>
            <span>Identity & preferences stay on each device</span>
          </div>
        </div>

        <div aria-hidden="true" class="database-direct-connection"><span /><v-icon icon="mdi-swap-vertical" size="26" /><span>Room updates, in real time</span><span /></div>

        <div aria-hidden="true" class="database-project-store">
          <div class="database-project-store-heading"><v-icon icon="mdi-firebase" size="32" /><div><strong>Your Firebase project</strong><span>Owned and managed by your team</span></div></div>
          <div class="database-shared-data"><span><v-icon icon="mdi-door-open" size="17" />Rooms</span><span><v-icon icon="mdi-cards-playing-outline" size="17" />Votes</span><span><v-icon icon="mdi-history" size="17" />History</span></div>
        </div>
      </figure>
    </header>

    <section aria-labelledby="database-setup-title" class="database-setup">
      <h2 id="database-setup-title">From setup to your first session.</h2>

      <ol class="database-steps">
        <li class="database-step" data-test-id="database-step">
          <div aria-hidden="true" class="database-illustration">
            <div class="database-mock">
              <div class="database-mock-bar"><v-icon icon="mdi-firebase" size="22" /> Firebase</div>

              <div class="database-project">
                <span>Project name</span>
                <div class="database-project-name">Our planning space<span class="database-caret" /></div>
                <span class="database-ready"><v-icon icon="mdi-check-circle-outline" size="18" /> Your team's project</span>
              </div>
            </div>
          </div>

          <div class="database-step-copy">
            <h3><span class="database-step-number">1</span>Create a project</h3>
            <p>Open Firebase Console and create a project. Give it a name your team will recognize. Google Analytics is optional.</p>
            <a class="landing-inline-link" href="https://console.firebase.google.com/" rel="noopener noreferrer" target="_blank">Open Firebase Console <v-icon aria-hidden="true" icon="mdi-open-in-new" size="16" /></a>
          </div>
        </li>

        <li class="database-step" data-test-id="database-step">
          <div aria-hidden="true" class="database-illustration">
            <div class="database-mock">
              <div class="database-mock-bar"><v-icon icon="mdi-database-outline" size="21" /> Realtime Database</div>

              <div class="database-tree">
                <span><v-icon icon="mdi-folder-outline" size="17" /> rooms</span>
                <div><span>participants</span><span>votes</span><span>history</span></div>
              </div>
            </div>
          </div>

          <div class="database-step-copy">
            <h3><span class="database-step-number">2</span>Add your database</h3>
            <p>Create a <strong>Realtime Database</strong>, choose a nearby region, and start in locked mode. Replace its rules with the Refinimo rules below, then publish.</p>
            <a class="landing-inline-link" href="https://console.firebase.google.com/project/_/database/" rel="noopener noreferrer" target="_blank">Open Realtime Database <v-icon aria-hidden="true" icon="mdi-open-in-new" size="16" /></a>
          </div>
        </li>

        <li class="database-step" data-test-id="database-step">
          <div aria-hidden="true" class="database-illustration database-connect">
            <div class="database-config-token"><v-icon icon="mdi-code-braces" size="22" /><span>firebaseConfig<small>projectId · databaseURL · …</small></span></div>
            <div class="database-connector"><span /><v-icon icon="mdi-arrow-down" size="20" /></div>
            <div class="database-app-token"><img alt="" height="30" :src="logoUrl" width="30">Refinimo<v-icon icon="mdi-check-circle-outline" size="20" /></div>
          </div>

          <div class="database-step-copy">
            <h3><span class="database-step-number">3</span>Connect Refinimo</h3>
            <p>In Project settings, register a Web app (<strong>&lt;/&gt;</strong>). Copy its Firebase config values into Refinimo's configuration and save. No SDK installation needed.</p>
            <a class="landing-inline-link" href="https://console.firebase.google.com/project/_/settings/general/" rel="noopener noreferrer" target="_blank">Open Project settings <v-icon aria-hidden="true" icon="mdi-open-in-new" size="16" /></a>
          </div>
        </li>
      </ol>

    </section>

    <DatabaseRules />

    <section aria-labelledby="database-return-title" class="database-follow-through">
      <h2 id="database-return-title">Set up once, keep planning.</h2>

      <div class="database-return-benefits">
        <article>
          <h3><v-icon aria-hidden="true" icon="mdi-content-save-check-outline" size="22" />Connection remembered</h3>
          <p>Refinimo saves your Firebase configuration in this browser. Come back on the same device and start planning.</p>
        </article>

        <article>
          <h3><v-icon aria-hidden="true" icon="mdi-door-open" size="22" />Room for every team</h3>
          <p>Create separate rooms using the same Firebase project. Give each one its own deck and session settings.</p>
        </article>

        <article>
          <h3><v-icon aria-hidden="true" icon="mdi-history" size="22" />Pick up a recent room</h3>
          <p>Find your recent rooms in the app and return to a session without hunting down its link.</p>
        </article>
      </div>
    </section>

    <section aria-labelledby="database-invite-title" class="database-team-setup">
      <div class="database-invite">
        <span aria-hidden="true" class="database-invite-icon"><v-icon icon="mdi-link-variant" size="27" /></span>
        <h2 id="database-invite-title">Ready? Bring<br>the team in.</h2>
        <p>Create a room and share its link with the configuration included. Your teammates join the same project without repeating setup.</p>
        <router-link class="landing-inline-link" data-test-id="database-open-app" to="/app">Invite your team <v-icon aria-hidden="true" icon="mdi-arrow-right" size="18" /></router-link>
      </div>

      <div class="database-details">
        <h3>Before you share the link</h3>

        <details>
          <summary>Where does our data live?<v-icon aria-hidden="true" icon="mdi-plus" size="20" /></summary>

          <div class="database-storage">
            <div><h3><v-icon aria-hidden="true" icon="mdi-web" size="20" />In your browser</h3><p>Your identity, avatar, recent rooms, Firebase configuration, and preferences are saved on this device.</p></div>
            <div><h3><v-icon aria-hidden="true" icon="mdi-database-outline" size="20" />In your Firebase project</h3><p>Rooms, participants, votes, task details, and round history keep the team's session in sync.</p></div>
          </div>
        </details>

        <details>
          <summary>Which config values do I need?<v-icon aria-hidden="true" icon="mdi-plus" size="20" /></summary>

          <div class="database-detail-body">
            <p>Copy the values from your Web app's config into the matching Refinimo fields. Include <code>databaseURL</code> from your Realtime Database. If it is missing, refresh your Web app's config after creating the database.</p>
            <a class="landing-inline-link" href="https://support.google.com/firebase/answer/7015592" rel="noopener noreferrer" target="_blank">Find your Firebase config <v-icon aria-hidden="true" icon="mdi-open-in-new" size="16" /></a>
          </div>
        </details>

        <details>
          <summary>What should I know about access and usage?<v-icon aria-hidden="true" icon="mdi-plus" size="20" /></summary>

          <div class="database-detail-body">
            <p>Refinimo has no subscription. Your Firebase project follows Firebase's usage limits and the billing plan you choose.</p>
            <p>The supplied rules validate the room data format and allow access to individual rooms without sign-in. They do not restrict access to named team members. Share room links with people you trust.</p>
            <a class="landing-inline-link" href="https://firebase.google.com/docs/database/security/get-started" rel="noopener noreferrer" target="_blank">About Firebase rules <v-icon aria-hidden="true" icon="mdi-open-in-new" size="16" /></a>
          </div>
        </details>
      </div>
    </section>
  </div>
</template>

<style scoped>
.database-intro { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); align-items: center; gap: 70px; padding-bottom: 52px; border-bottom: 1px solid var(--lp-border); }
.database-intro .landing-section-intro { max-width: 480px; line-height: 1.8; }
.database-team-note { display: flex; align-items: center; gap: var(--icon-text-gap); margin-top: 22px; color: var(--lp-muted); font-size: var(--lp-type-control); line-height: 1.7; }
.database-team-note .v-icon { color: var(--lp-accent); flex: 0 0 auto; }
.database-connection { min-width: 0; margin: 0; padding: 28px; background: var(--lp-elevated); border: 1px solid var(--lp-border); border-radius: 12px; }
.database-browser { border: 1px solid var(--lp-border); border-radius: 8px; background: var(--lp-surface); }
.database-browser-bar { display: flex; align-items: center; gap: var(--icon-text-gap); padding: 12px 16px; border-bottom: 1px solid var(--lp-border); font-size: var(--lp-type-control); }
.database-browser-bar strong { margin-right: auto; }
.database-browser-bar > span { width: 5px; height: 5px; border-radius: 50%; background: var(--lp-muted); opacity: .45; }
.database-browser-content { display: grid; justify-items: center; gap: 9px; padding: 18px 16px 22px; text-align: center; font-size: var(--lp-type-control); }
.database-browser-content > span { color: var(--lp-muted); font-size: var(--lp-type-small); line-height: 1.6; }
.database-devices { display: flex; align-items: end; gap: 14px; color: var(--lp-accent); margin-bottom: 4px; }
.database-direct-connection { display: flex; align-items: center; justify-content: center; gap: var(--icon-text-gap); min-height: 62px; padding-block: 12px; font-size: var(--lp-type-small); color: var(--lp-muted); }
.database-direct-connection > .v-icon { flex-shrink: 0; color: var(--lp-accent); }
.database-direct-connection > span:first-child, .database-direct-connection > span:last-child { flex: 1; border-top: 1px dashed var(--lp-border); }
.database-project-store { background: var(--lp-surface); border: 1px solid color-mix(in srgb, var(--lp-accent) 30%, var(--lp-border)); border-radius: 8px; }
.database-project-store-heading { display: flex; align-items: center; gap: 14px; padding: 19px 20px; }
.database-project-store-heading > .v-icon { color: var(--lp-accent); flex-shrink: 0; }
.database-project-store-heading strong { display: block; font-size: var(--lp-type-body); font-weight: 600; }
.database-project-store-heading div > span { display: block; margin-top: 5px; color: var(--lp-muted); font-size: var(--lp-type-small); line-height: 1.6; }
.database-shared-data { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; padding: 15px 20px; border-top: 1px solid var(--lp-border); color: var(--lp-muted); font-size: var(--lp-type-small); }
.database-shared-data > span { display: flex; align-items: center; gap: var(--icon-text-gap); }
.database-shared-data .v-icon { color: var(--lp-accent); }
.database-setup { margin-top: 52px; }
.database-setup h2 { font-size: clamp(26px, 2.5vw, 34px); margin-bottom: 30px; }
.database-steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 26px; list-style: none; padding: 0; }
.database-step { min-width: 0; }
.database-illustration { height: 208px; display: grid; align-items: center; padding: 24px; background: var(--lp-elevated); border: 1px solid var(--lp-border); border-radius: 12px; }
.database-mock { background: var(--lp-surface); border: 1px solid var(--lp-border); border-radius: 8px; box-shadow: 0 8px 20px #00000008; }
.database-mock-bar { display: flex; align-items: center; gap: var(--icon-text-gap); padding: 12px 14px; border-bottom: 1px solid var(--lp-border); font-size: var(--lp-type-small); font-weight: 600; }
.database-mock-bar .v-icon { color: var(--lp-accent); }
.database-project { display: grid; gap: 10px; padding: 16px; font-size: var(--lp-type-caption); color: var(--lp-muted); }
.database-project-name { display: flex; align-items: center; padding: 8px 10px; border: 1px solid color-mix(in srgb, var(--lp-accent) 45%, var(--lp-border)); border-radius: 4px; color: var(--lp-text); }
.database-caret { width: 1px; height: 15px; margin-left: 3px; background: var(--lp-accent); }
.database-ready { display: flex; align-items: center; gap: var(--icon-text-gap); }
.database-ready .v-icon { color: var(--lp-accent); }
.database-tree { padding: 14px 18px; font: var(--lp-type-caption)/1.7 var(--font-mono); color: var(--lp-muted); }
.database-tree > span { display: flex; align-items: center; gap: var(--icon-text-gap); color: var(--lp-accent); }
.database-tree > div { display: grid; border-left: 1px solid var(--lp-border); margin-left: 8px; padding-left: 22px; }
.database-tree > div span { position: relative; }
.database-tree > div span::before { content: ''; position: absolute; left: -22px; top: 50%; width: 14px; border-top: 1px solid var(--lp-border); }
.database-connect { align-content: center; justify-items: stretch; }
.database-config-token, .database-app-token { display: flex; align-items: center; gap: var(--icon-text-gap); padding: 12px 15px; font-size: var(--lp-type-small); background: var(--lp-surface); border: 1px solid var(--lp-border); border-radius: 8px; }
.database-config-token > .v-icon { color: var(--lp-accent); }
.database-config-token small { display: block; font-size: .6875rem; color: var(--lp-muted); margin-top: 3px; }
.database-connector { display: grid; justify-items: center; color: var(--lp-accent); }
.database-connector span { border-left: 1px dashed var(--lp-accent); height: 15px; }
.database-app-token { font-weight: 650; }
.database-app-token > .v-icon { margin-left: auto; color: var(--lp-accent); }
.database-step-copy { padding: 24px 2px 0; }
.database-step-copy h3 { display: flex; align-items: center; gap: 12px; font-size: 19px; letter-spacing: -.5px; }
.database-step-number { flex: 0 0 28px; height: 28px; display: grid; place-items: center; border: 1px solid var(--lp-border); border-radius: 50%; color: var(--lp-accent); font: var(--lp-type-small) var(--font-mono); }
.database-step-copy p { color: var(--lp-muted); font-size: var(--lp-type-body); line-height: 1.8; margin-top: 14px; }
.database-step-copy strong { color: var(--lp-text); font-weight: 550; }
.database-follow-through { padding: 64px 0; }
.database-follow-through h2 { font-size: clamp(26px, 2.5vw, 34px); }
.database-return-benefits { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 40px; margin-top: 32px; }
.database-return-benefits h3 { display: flex; align-items: center; gap: var(--icon-text-gap); font-size: 19px; }
.database-return-benefits .v-icon { color: var(--lp-accent); flex-shrink: 0; }
.database-return-benefits p { margin-top: 12px; color: var(--lp-muted); font-size: var(--lp-type-body); line-height: 1.8; }
.database-team-setup { display: grid; grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); gap: 64px; align-items: start; padding: 40px; background: var(--lp-surface); border: 1px solid var(--lp-border); border-radius: 12px; }
.database-invite-icon { display: grid; place-items: center; width: 48px; height: 48px; margin-bottom: 24px; border: 1px solid var(--lp-border); border-radius: 12px; background: var(--lp-elevated); color: var(--lp-accent); }
.database-invite h2 { font-size: 32px; letter-spacing: -1px; }
.database-invite p { max-width: 370px; font-size: var(--lp-type-body); color: var(--lp-muted); line-height: 1.8; margin-top: 18px; }
.database-details > h3 { padding: 6px 0 22px; border-bottom: 1px solid var(--lp-border); }
.database-details details { border-bottom: 1px solid var(--lp-border); }
.database-details details:last-child { border-bottom: 0; }
.database-details summary { display: flex; align-items: center; justify-content: space-between; gap: var(--icon-text-gap); padding: 22px 0; list-style: none; cursor: pointer; font-size: var(--lp-type-body); }
.database-details summary::-webkit-details-marker { display: none; }
.database-details summary .v-icon { color: var(--lp-muted); flex-shrink: 0; }
.database-details details[open] summary .v-icon { transform: rotate(45deg); }
.database-detail-body { padding-bottom: 24px; max-width: 800px; }
.database-detail-body p, .database-storage p { color: var(--lp-muted); font-size: var(--lp-type-body); line-height: 1.8; }
.database-detail-body p + p { margin-top: 12px; }
.database-detail-body code { font-size: .9em; color: var(--lp-text); overflow-wrap: anywhere; }
.database-storage { display: grid; gap: 24px; padding: 0 0 28px; }
.database-storage h3 { display: flex; align-items: center; gap: var(--icon-text-gap); margin-bottom: 10px; }
.database-storage h3 .v-icon { flex-shrink: 0; color: var(--lp-accent); }
@media (max-width: 1100px) {
  .database-intro { gap: 30px; }
  .database-connection { padding-inline: 20px; }
  .database-steps { gap: 20px; }
  .database-illustration { padding: 16px; }
  .database-team-setup { gap: 32px; padding: 30px; }
}
@media (max-width: 900px) {
  .database-intro { grid-template-columns: 1fr; padding-bottom: 36px; }
  .database-connection { max-width: 560px; width: 100%; }
  .database-steps { grid-template-columns: 1fr; gap: 36px; }
  .database-step { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr); gap: 28px; align-items: center; }
  .database-step-copy { padding-top: 0; }
  .database-setup { margin-top: 36px; }
  .database-return-benefits { gap: 24px; }
  .database-team-setup { grid-template-columns: minmax(0, 1fr); }
  .database-invite p { max-width: 550px; }
}
@media (max-width: 620px) {
  .database-step, .database-storage { grid-template-columns: minmax(0, 1fr); }
  .database-illustration { height: auto; min-height: 208px; padding: 24px; }
  .database-step { gap: 20px; }
  .database-connection { padding: 16px; }
  .database-project-store-heading { padding-inline: 14px; }
  .database-project-store-heading > .v-icon { display: none; }
  .database-shared-data { padding: 14px; }
  .database-follow-through { padding-block: 40px; }
  .database-return-benefits { grid-template-columns: minmax(0, 1fr); gap: 28px; }
  .database-team-setup { padding: 24px; }
  .database-config-token { flex-wrap: wrap; }
}
</style>
