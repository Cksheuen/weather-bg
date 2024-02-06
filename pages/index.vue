<script setup lang="ts">
import type { WeatherKey } from '@/types/global'

const weather = ref<WeatherKey>('snow')

function change() {
  if (weather.value === 'snow')
    weather.value = 'rain'
  else
    weather.value = 'snow'
}
</script>

<template>
  <div>
    <div absolute z-10 btn @click="change">
      {{ weather }}
    </div>
    <ClientOnly>
      <Drop :weather="weather" />
    </ClientOnly>
  </div>
</template>
