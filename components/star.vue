<script setup lang="ts">
import P5 from 'p5'

const starsEl = $ref<HTMLDivElement | null>(null)

interface Shine {
  amplitude: number
  distination: number
  shine: (p: P5) => void
}

function drawWithHalo(p: P5, x: number, y: number, radius: number, c: P5.Color) {
  const img = p.createGraphics(2 * radius, 2 * radius)
  const ctx = img.drawingContext
  const grd = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius)
  grd.addColorStop(0, c)
  grd.addColorStop(0.8, p.color(p.red(c), p.green(c), p.blue(c), 128))
  grd.addColorStop(1, p.color(p.red(c), p.green(c), p.blue(c), 0))
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, 2 * radius, 2 * radius)
  p.image(img, x - radius, y - radius)
}

class Star implements Shine {
  x: number
  y: number
  size: number
  amplitude: number
  distination: number
  nowSize: number
  constructor() {
    this.x = Math.random() * window.innerWidth - window.innerWidth / 2
    this.y = Math.random() * window.innerHeight / 4 - window.innerHeight / 4
    this.size = Math.random() * 0.5 + 0.5
    this.amplitude = Math.random() * (this.size / 2) + this.size / 2
    this.distination = this.size + this.amplitude
    this.nowSize = this.size
  }

  shine(p: P5) {
    const d = this.distination - this.nowSize
    this.nowSize += p.random(d / 4) + d / 4
    if (Math.abs(this.nowSize - this.distination) < 0.1) {
      if (this.distination === this.size + this.amplitude)
        this.distination = this.size - this.amplitude
      else this.distination = this.size + this.amplitude
    }
  }

  show(p: P5) {
    /* const weight = p.map(this.y, 0, window.innerHeight / 4, 1, 0)
    const alpha = p.map(this.nowSize, this.size - this.amplitude, this.size + this.amplitude, 0, 255) * weight
    p.fill(255, 255, 255, alpha)
    p.noStroke()
    p.ellipse(this.x, this.y, this.nowSize, this.nowSize) */
    drawWithHalo(p, this.x, this.y, this.nowSize, p.color(255, 255, 255))
  }
}

const stars: Star[] = []

onMounted(() => {
  // let count = 0
  const starsCanvas = new P5((p: P5) => {
    p.setup = () => {
      p.createCanvas(window.innerWidth, window.innerHeight / 2, p.WEBGL)
      while (stars.length < 50) stars.push(new Star())
      p.clear()
    }
    p.draw = () => {
      /* count++
      if (count % 5 === 0) { */
      p.clear()

      for (const star of stars) {
        star.shine(p)
        star.show(p)
      }
      // }
    }
  }, starsEl)
})
</script>

<template>
  <div ref="starsEl" fixed left-0 top-0 z-3 />
</template>
