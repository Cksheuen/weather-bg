<script setup lang="ts">
import P5 from 'p5'

const WIDTH = 1800
const HEIGHT = 900

const canvasContainer = ref(null)
let myP5 = null
let dx = 0
const dy = 0

interface Branch {
  x: number
  y: number
  alpha: number
  angle: number
  len: number
}

function getEndPoint(branch: Branch, len: number) {
  return {
    x: branch.x + Math.cos(branch.angle) * len,
    y: branch.y + Math.sin(branch.angle) * len,
  }
}

function lineTo(b: Branch, sketch: P5) {
  sketch.stroke(255, b.alpha)
  const endPoint = getEndPoint(b, b.len)
  sketch.line(b.x, b.y, endPoint.x, endPoint.y)
}

function generate(x: number, y: number, len: number, depth: number, leaves: number) {
  const branches: Branch[] = []
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI * 2 / leaves) {
    branches.push({
      x: 0,
      y: 0,
      alpha: 255,
      angle,
      len,
    })
  }
  let sons: Branch[] = [...branches]
  let i = 1
  while (i <= depth) {
    const newSons: Branch[] = []
    const dAngle = [-1, 0, 1]
    const angle = Math.random() * Math.PI / 4 + Math.PI / 10
    for (const s of sons) {
      const newStart = getEndPoint(s, len)
      for (const a of dAngle) {
        const newBranch = {
          x: newStart.x,
          y: newStart.y,
          alpha: 255,
          angle: s.angle + angle * a,
          len: s.len * 0.8,
        }
        branches.push(newBranch)
        newSons.push(newBranch)
      }
    }
    sons = newSons
    i++
  }
  return branches
}

class Snow {
  x: number
  y: number
  angle: number
  branches: Branch[] = []
  speedX: number
  speedY: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
    this.angle = 0
    this.branches = generate(x, y, 5, Math.random() * 2 + 1, 5 + Math.random() * 2)
    this.speedX = 0
    this.speedY = 0
  }

  draw(p: P5) {
    if (!this.speedX) {
      this.speedX = p.noise(p.frameCount / 10) * 2
      this.speedY = p.noise(p.frameCount / 100) * 2
    }
    p.push()
    p.translate(this.x, this.y)
    p.rotate(this.angle)

    p.beginShape()

    for (const b of this.branches) {
      lineTo(b, p)
      b.alpha *= 0.99 // 逐渐减小 alpha 值
    }
    p.pop()

    this.angle += 0.01
    this.x += this.speedX + dx
    this.y += this.speedY + 0.5
  }

  visible() {
    for (const b of this.branches) {
      if (b.alpha > 0.1 && this.x > -51 && this.x < WIDTH && this.y > -501 && this.y < HEIGHT)
        return true
    }
    return false
  }
}

const shapes: Snow[] = []

onMounted(() => {
  myP5 = new P5((p: P5) => {
    p.setup = () => {
      p.createCanvas(WIDTH, HEIGHT)
      p.colorMode(p.RGB, 255, 255, 255, 1)
    }

    p.draw = async () => {
      p.background(220)
      dx = p.noise(p.frameCount / 100) - 1
      // dy = p.noise(p.frameCount / 100) * 2 + 1
      while (shapes.length < 100)
        shapes.push(new Snow(p.random(p.width) - 10, -Math.random() * 500))

      for (const shape of shapes) {
        if (shape.visible()) {
          shape.draw(p)
        }
        else {
          const index = shapes.indexOf(shape)
          shapes.splice(index, 1)
        }
      }
    }

    p.mousePressed = () => {
      const shape = new Snow(p.mouseX, p.mouseY)
      shapes.push(shape)
    }
  }, canvasContainer.value)
})

onUnmounted(() => {
  myP5.remove()
})
</script>

<template>
  <div ref="canvasContainer" m-0 scale-60 p-0 />
</template>

<style scoped>
div {
  width: 100%;
  height: 100%;
}
</style>
