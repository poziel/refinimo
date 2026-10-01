<template>
  <div aria-hidden="true" class="landing-ownership-art">
    <div class="landing-orbit landing-orbit-one" />
    <div class="landing-orbit landing-orbit-two" />
    <div class="landing-data-core"><v-icon icon="mdi-database-outline" size="34" /><span>Your Firebase</span></div>

    <div class="landing-orbit-detail landing-orbit-team" data-test-id="landing-ownership-detail">
      <span class="landing-orbit-title">Your team</span>
      <div class="landing-orbit-avatars"><span>M</span><span>J</span><span>A</span><span>You</span></div>
    </div>

    <div class="landing-orbit-detail landing-orbit-rooms" data-test-id="landing-ownership-detail">
      <v-icon icon="mdi-door-open" size="19" /><span>Rooms<small>Sprint planning</small></span>
    </div>

    <div class="landing-orbit-detail landing-orbit-votes" data-test-id="landing-ownership-detail">
      <span class="landing-orbit-title"><v-icon icon="mdi-cards-outline" size="16" /> Votes</span>
      <div class="landing-orbit-estimates"><span>3</span><span>5</span><span>8</span></div>
    </div>

    <div class="landing-orbit-detail landing-orbit-history" data-test-id="landing-ownership-detail">
      <v-icon icon="mdi-history" size="19" /><span>History<small>Every round, together</small></span>
    </div>

    <span class="landing-orbit-node landing-orbit-node-one" />
    <span class="landing-orbit-node landing-orbit-node-two" />
  </div>
</template>
