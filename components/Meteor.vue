<script setup lang="ts">
import P5 from 'p5'

const meteorEl = $ref<HTMLDivElement | null>(null)

interface Color {
  r: number
  g: number
  b: number
}

interface Gradient {
  from: Color
  to: Color
}

function drawGradientLine(p: P5, x1: number, y1: number, x2: number, y2: number, c1: P5.Color, c2: P5.Color) {
  for (let i = 0; i <= 1; i += 0.01) {
    p.stroke(p.lerpColor(c1, c2, i))
    const x = p.lerp(x1, x2, i)
    const y = p.lerp(y1, y2, i)
    const dx = p.lerp(x1, x2, i + 0.01)
    const dy = p.lerp(y1, y2, i + 0.01)
    p.line(x, y, dx, dy)
  }
}

class Meteor {
  x: number
  y: number
  speedX: number
  speedY: number
  angle: number
  gradient: Gradient
  len: number
  constructor() {
    this.x = Math.random() * window.innerWidth - window.innerWidth / 2
    console.log(this.x)

    this.y = 0
    if (this.x < window.innerWidth / 2)
      this.angle = Math.random() * Math.PI / 2
    else this.angle = Math.random() * Math.PI / 2 + Math.PI / 2
    this.speedX = Math.cos(this.angle) * 10
    this.speedY = Math.abs(Math.sin(this.angle) * 10)
    const from = {
      r: Math.random() * 255,
      g: Math.random() * 255,
      b: Math.random() * 255,
    }
    const to = {
      r: Math.random() * 255,
      g: Math.random() * 255,
      b: Math.random() * 255,
    }
    this.gradient = { from, to }
    this.len = Math.random() * 30 + 20
  }

  fall() {
    this.x += this.speedX
    this.y += this.speedY
  }

  show(p: P5) {
    p.stroke(255, 255, 255)
    p.strokeWeight(2)
    p.line(this.x, this.y, this.x - Math.cos(this.angle) * this.len, this.y - Math.sin(this.angle) * this.len)
    // drawGradientLine(p, this.x, this.y, this.x - Math.cos(this.angle) * this.len, this.y - Math.sin(this.angle) * this.len, p.color(this.gradient.from.r, this.gradient.from.g, this.gradient.from.b), p.color(this.gradient.to.r, this.gradient.to.g, this.gradient.to.b))
  }
}

const meteors: Meteor[] = []

onMounted(() => {
  const meteor = new P5((p: P5) => {
    p.setup = () => {
      p.createCanvas(window.innerWidth, window.innerHeight)
    }
    p.draw = () => {
      p.clear()
      // p.background(0)
      while (meteors.length < 10) meteors.push(new Meteor())
      for (const meteor of meteors) {
        if (meteor.y > window.innerHeight || meteor.x > window.innerWidth || meteor.x < 0) {
          meteors.splice(meteors.indexOf(meteor), 1)
          continue
        }
        meteor.fall()
        meteor.show(p)
      }
    }
  }, meteorEl)
})
</script>

<template>
  <div ref="meteorEl" fixed left-0 top-0 z-4 />
</template>
