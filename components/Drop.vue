<script setup lang="ts">
import P5 from 'p5'
import type { WeatherKey } from '@/types/global'
import { RainDrop, Snow } from '@/types/global'

const props = defineProps<{
  weather: WeatherKey
}>()

let WIDTH = window.innerWidth
let HEIGHT = window.innerHeight

const canvasContainer = ref(null)
let myP5: P5 = null
let dx = 0

const WeatherClassMap = {
  rain: RainDrop,
  snow: Snow,
}

const ElNumMap = {
  rain: 500,
  snow: 100,
}

let elNum = ElNumMap[props.weather]

type WeatherClass = RainDrop | Snow

let weatherEls: WeatherClass[] = []

watch(() => props.weather, () => {
  weatherEls = []
  elNum = ElNumMap[props.weather]
  generate()
})

function generate() {
  const Weather = WeatherClassMap[props.weather]
  const begin = weatherEls.length
  while (weatherEls.length < elNum && weatherEls.length < begin + 50)
    weatherEls.push(new Weather(Math.random() * WIDTH, -Math.random() * 500))
}

onMounted(() => {
  myP5 = new P5((p: P5) => {
    p.setup = () => {
      p.createCanvas(WIDTH, HEIGHT)
    }

    p.draw = async () => {
      p.background(220)
      dx = p.noise(p.frameCount / 100) - 1
      if (weatherEls.length < elNum)
        generate()
      for (let i = 0; i < weatherEls.length; i++) {
        if (weatherEls[i].y > HEIGHT) {
          weatherEls.splice(i, 1)
          continue
        }
        weatherEls[i].fall(p, dx)
      }
    }

    p.mousePressed = () => {
      const shape = new Snow(p.mouseX, p.mouseY)
      weatherEls.push(shape)
    }
  }, canvasContainer.value)

  addEventListener('resize', () => {
    WIDTH = window.innerWidth
    HEIGHT = window.innerHeight
    myP5.resizeCanvas(window.innerWidth, window.innerHeight)
  })
})

onUnmounted(() => {
  myP5.remove()
})
</script>

<template>
  <div ref="canvasContainer" fixed left-0 top-0 z-4 />
</template>
