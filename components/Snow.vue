<script setup lang="ts">
import P5 from 'p5'

const snow = $ref<HTMLCanvasElement | null>(null)

interface Point {
  x: number
  y: number
}

interface Branch {
  x: number
  y: number
  alpha: number
  angle: number
  len: number
}

function getEndPoint(branch: Branch) {
  return {
    x: branch.x + Math.cos(branch.angle) * 10,
    y: branch.y + Math.sin(branch.angle) * 10,
  }
}

const branches: Branch[] = []
const dx = Math.random() * 2 - 1
const dy = Math.random() * 2 - 1

function s(sketch: any) {
  sketch.setup = () => {
    sketch.createCanvas(400, 400)
  }

  sketch.draw = () => {
    sketch.background(0)
    sketch.stroke(255)

    if (branches.length === 0)
      generate()

    for (const b of branches) {
      lineTo(b)
      b.alpha *= 0.99 // 逐渐减小 alpha 值
    }
  }

  function lineTo(b: Branch) {
    sketch.stroke(255, b.alpha)
    const endPoint = getEndPoint(b)
    sketch.line(b.x, b.y, endPoint.x, endPoint.y)
  }

  function generate() {
    branches.push({
      x: 200,
      y: 200,
      alpha: 255,
      angle: -Math.PI / 2,
      len: 10,
    })
    const depth = Math.random() * 3 + 1
    let sons: Branch[] = [branches[0]]
    let i = 1
    while (i <= depth) {
      const newSons: Branch[] = []
      const dAngle = [-1, 0, 1]
      for (const s of sons) {
        const angle = Math.random() * Math.PI / 6 + Math.PI / 18
        const newStart = getEndPoint(s)
        for (const a of dAngle) {
          const newBranch = {
            x: newStart.x,
            y: newStart.y,
            alpha: 255,
            angle: s.angle + angle * a,
            len: s.len * 0.7,
          }
          branches.push(newBranch)
          newSons.push(newBranch)
        }
      }
      sons = newSons
      i++
    }
  }
}

onMounted(() => {
  new P5(s, snow)
})
</script>

<template>
  <div ref="snow" />
</template>
