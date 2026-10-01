<template>
  <DemoSession :key="session" @restart="session++" />
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import DemoSession from '@/components/DemoSession.vue'

  const session = ref(0)
</script>
