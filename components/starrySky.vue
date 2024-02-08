<script setup lang="ts">
import P5 from 'p5'

const starrySkyEl = $ref<HTMLDivElement | null>(null)
// const rightCloudEl = $ref<HTMLDivElement | null>(null)
// const leftCloudEl = $ref<HTMLDivElement | null>(null)
// const cloudsEl = $ref<HTMLDivElement | null>(null)
const f = 1.8

const Factors: number[] = []

function cal2a(p: P5, x: number, y: number, px1: number, py: number, px2: number) {
  return p.dist(x, y, px1, py) + p.dist(x, y, px2, py)
}

interface Color {
  r: number
  g: number
  b: number
}

interface Cloud {
  x: number
  y: number
  originColor: Color
  noiseFactor: number
  parallelFactor: number
  weight: number
}

const clouds: Cloud[] = []

onMounted(() => {
  const height = window.innerHeight
  const width = window.innerWidth
  const noiseScale = 0.01
  let py: number
  let px1: number
  let px2: number
  let maxA: number
  let mid: number
  let maxDist: number
  let minA: number
  const starrySky = new P5((p: P5) => {
    p.setup = () => {
      p.createCanvas(window.innerWidth, window.innerHeight)
      p.pixelDensity(1)
      p.clear()
      p.loadPixels()

      py = -p.random(window.innerHeight / 4) + window.innerHeight * 1.5
      px1 = p.random(window.innerWidth / 4)
      px2 = p.random(window.innerWidth / 4) + window.innerWidth / 4 * 3
      maxA = Math.max(
        cal2a(p, 0, 0, px1, py, px2),
        cal2a(p, window.innerWidth, 0, px1, py, px2),
        cal2a(p, 0, window.innerHeight, px1, py, px2),
        cal2a(p, window.innerWidth, window.innerHeight, px1, py, px2),
      )
      mid = (px1 + px2) / 2
      maxDist = Math.max(
        p.dist(0, 0, mid, py),
        p.dist(window.innerWidth, 0, mid, py),
        p.dist(0, window.innerHeight, mid, py),
        p.dist(window.innerWidth, window.innerHeight, mid, py),
      )

      minA = cal2a(p, mid, py, px1, py, px2)

      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          const index = (x + y * width) * 4

          const a = cal2a(p, x, y * 3, px1, py, px2)
          const dist = p.dist(x, y * 1.5, mid, py)
          const brightnessFactorRound = p.map(dist, 0, maxDist, 1.1, 1)
          const brightnessFactor = p.map(a, minA, maxA, 1.2, 0.8)

          const Factor = brightnessFactor * brightnessFactorRound

          // 计算基于 y 坐标的权重
          const weight = p.map(y, 0, window.innerHeight / 2, 1, 0, true)

          // 在计算每个像素的颜色时，使用 Perlin 噪声来调整颜色值
          const noiseFactor = p.noise(x * noiseScale, y * noiseScale, p.frameCount) * weight

          // 242, 230, 247
          // 55, 71, 159
          const r = p.map(y, 0, window.innerHeight, 55, 242) * Factor
          const g = p.map(y, 0, window.innerHeight, 71, 230) * Factor
          const b = p.map(y, 0, window.innerHeight, 159, 247) * Factor

          const cr = p.lerp(r, r / f, noiseFactor)
          const cg = p.lerp(g, g / f, noiseFactor)
          const cb = p.lerp(b, b / f, noiseFactor)

          if (r !== cr || g !== cg || b !== cb) {
            let parallelFactor
            if (x === 0) { parallelFactor = noiseFactor }
            else {
              const dis = window.innerWidth + 1
              parallelFactor = p.noise((dis - x) * noiseScale, y * noiseScale, p.frameCount) * weight
            }
            clouds.push({
              x,
              y,
              originColor: {
                r: p.map(y, 0, window.innerHeight, 55, 242),
                g: p.map(y, 0, window.innerHeight, 71, 230),
                b: p.map(y, 0, window.innerHeight, 159, 247),
              },
              noiseFactor,
              parallelFactor,
              weight,
            })
          }
          if (y < window.innerHeight / 2)
            Factors[index] = Factor

          p.pixels[index + 0] = r
          p.pixels[index + 1] = g
          p.pixels[index + 2] = b
          p.pixels[index + 3] = 255
        }
      }
      p.updatePixels()
    }
    p.draw = () => {
      p.loadPixels()
      for (const cloud of clouds) {
        cloud.x += 2
        if (cloud.x >= window.innerWidth) {
          cloud.x = 0
          const t = cloud.noiseFactor
          cloud.noiseFactor = cloud.parallelFactor
          cloud.parallelFactor = t
        }
        const index = (cloud.x + cloud.y * window.innerWidth) * 4
        let r = cloud.originColor.r * Factors[index]
        let g = cloud.originColor.g * Factors[index]
        let b = cloud.originColor.b * Factors[index]
        if (r > 242)
          r = 242
        if (g > 230)
          g = 230
        if (b > 247)
          b = 247
        p.pixels[index + 0] = p.lerp(r, r / f, cloud.noiseFactor)
        p.pixels[index + 1] = p.lerp(g, g / f, cloud.noiseFactor)
        p.pixels[index + 2] = p.lerp(b, b / f, cloud.noiseFactor)
        p.pixels[index + 3] = 255
      }

      p.updatePixels()
    }
  }, starrySkyEl)
  /* const cloudsCanvas = new P5((p: P5) => {
    p.setup = () => {
      p.createCanvas(window.innerWidth, window.innerHeight / 2, p.WEBGL)
      p.pixelDensity(1)
    }
    p.draw = () => {
      p.loadPixels()
      for (const cloud of clouds) {
        cloud.x += 2
        if (cloud.x >= window.innerWidth) {
          cloud.x = 0
          const t = cloud.noiseFactor
          cloud.noiseFactor = cloud.parallelFactor
          cloud.parallelFactor = t
        }
        const index = (cloud.x + cloud.y * window.innerWidth) * 4
        let r = cloud.originColor.r * Factors[index]
        let g = cloud.originColor.g * Factors[index]
        let b = cloud.originColor.b * Factors[index]
        if (r > 242)
          r = 242
        if (g > 230)
          g = 230
        if (b > 247)
          b = 247
        p.pixels[index + 0] = p.lerp(r, r / f, cloud.noiseFactor)
        p.pixels[index + 1] = p.lerp(g, g / f, cloud.noiseFactor)
        p.pixels[index + 2] = p.lerp(b, b / f, cloud.noiseFactor)
        p.pixels[index + 3] = 255
      }

      p.updatePixels()
    }
  }, cloudsEl) */
  /* const rightCloudElCanvas = new P5((p: P5) => {
    p.setup = () => {
      p.createCanvas(window.innerWidth, window.innerHeight / 2, p.WEBGL)
      p.pixelDensity(1)
      p.loadPixels()
      for (const cloud of clouds) {
        const index = (cloud.x + cloud.y * window.innerWidth) * 4
        let r = cloud.originColor.r * Factors[index]
        let g = cloud.originColor.g * Factors[index]
        let b = cloud.originColor.b * Factors[index]
        if (r > 242)
          r = 242
        if (g > 230)
          g = 230
        if (b > 247)
          b = 247
        p.pixels[index + 0] = p.lerp(r, r / f, cloud.noiseFactor)
        p.pixels[index + 1] = p.lerp(g, g / f, cloud.noiseFactor)
        p.pixels[index + 2] = p.lerp(b, b / f, cloud.noiseFactor)
        p.pixels[index + 3] = 255
      }
      p.updatePixels()
    }
  }, rightCloudEl)
  const leftCloudElCanvas = new P5((p: P5) => {
    p.setup = () => {
      p.createCanvas(window.innerWidth, window.innerHeight / 2, p.WEBGL)
      p.pixelDensity(1)
      p.loadPixels()
      for (const cloud of clouds) {
        const index = (cloud.x + cloud.y * window.innerWidth) * 4
        let r = cloud.originColor.r * Factors[index]
        let g = cloud.originColor.g * Factors[index]
        let b = cloud.originColor.b * Factors[index]
        if (r > 242)
          r = 242
        if (g > 230)
          g = 230
        if (b > 247)
          b = 247
        p.pixels[index + 0] = p.lerp(r, r / f, cloud.parallelFactor)
        p.pixels[index + 1] = p.lerp(g, g / f, cloud.parallelFactor)
        p.pixels[index + 2] = p.lerp(b, b / f, cloud.parallelFactor)
        p.pixels[index + 3] = 255
      }
      p.updatePixels()
    }
  }, leftCloudEl)
  let x = 0
  let y = -window.innerHeight
  const animate = () => {
    x++
    y++
    if (x >= window.innerWidth)
      x = -window.innerWidth
    if (y >= window.innerHeight)
      y = -window.innerHeight
    rightCloudEl!.style.transform = `translateX(${x}px)`
    leftCloudEl!.style.transform = `translateX(${y}px)`

    requestAnimationFrame(animate)
  }

  requestAnimationFrame(animate) */
})
</script>

<template>
  <div ref="starrySkyEl" z-1 />
  <!-- <div ref="rightCloudEl" z-2 />
  <div ref="leftCloudEl" z-2 /> -->
  <!-- <div ref="cloudsEl" z-2 /> -->
  <star />
  <!-- <Meteor /> -->
  <!-- <Drop weather="rain" /> -->
</template>

<style>
div {
  position: fixed;
  left: 0;
  top: 0;
}
</style>
