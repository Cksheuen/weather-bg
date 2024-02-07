<script setup lang="ts">
import P5 from 'p5'

const starrySkyEl = $ref<HTMLDivElement | null>(null)
const cloudsEl = $ref<HTMLDivElement | null>(null)
const noiseFactors: number[] = []
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
  presentColor: Color
  originColor: Color
}

interface LineColor {
  color: Color
  Factor: number
  noiseFactor: number
}

const clouds: Cloud[] = []
const firstLine: LineColor[] = []

onMounted(() => {
  const height = window.innerHeight
  const width = window.innerWidth
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
          const noiseScale = 0.01

          const a = cal2a(p, x, y * 3, px1, py, px2)
          const dist = p.dist(x, y * 1.5, mid, py)
          const brightnessFactorRound = p.map(dist, 0, maxDist, 1.1, 1)
          const brightnessFactor = p.map(a, minA, maxA, 1.4, 0.8)

          const Factor = brightnessFactor * brightnessFactorRound

          // 计算基于 y 坐标的权重
          const weight = p.map(y, 0, window.innerHeight / 2, 1, 0, true)

          // 在计算每个像素的颜色时，使用 Perlin 噪声来调整颜色值
          const noiseFactor = p.noise(x * noiseScale, y * noiseScale, p.frameCount) * weight

          const r = p.map(y, 0, window.innerHeight, 70, 243) * Factor
          const g = p.map(y, 0, window.innerHeight, 77, 228) * Factor
          const b = p.map(y, 0, window.innerHeight, 158, 246) * Factor

          const f = 1.8
          const cr = p.lerp(r, r / f, noiseFactor)
          const cg = p.lerp(g, g / f, noiseFactor)
          const cb = p.lerp(b, b / f, noiseFactor)

          if (p.pixels[index + 0] !== cr || p.pixels[index + 1] !== cg || p.pixels[index + 2] !== cb) {
            clouds.push({
              x,
              y,
              presentColor: { r: cr, g: cg, b: cb },
              originColor: {
                r: p.map(y, 0, window.innerHeight, 70, 243),
                g: p.map(y, 0, window.innerHeight, 77, 228),
                b: p.map(y, 0, window.innerHeight, 158, 246),
              },
            })
          }
          if (x === 0 && y < window.innerHeight / 2)
            firstLine.push({ color: { r: cr, g: cg, b: cb }, Factor, noiseFactor })

          if (y < window.innerHeight / 2) {
            noiseFactors[index] = noiseFactor
            Factors[index] = Factor
          }

          p.pixels[index + 0] = r
          p.pixels[index + 1] = g
          p.pixels[index + 2] = b
          p.pixels[index + 3] = 255
        }
      }
    }

    p.updatePixels()
  }, starrySkyEl)
  const dx = 1
  const dy = 1
  const f = 1.8
  const cloudsCanvas = new P5((p: P5) => {
    p.setup = () => {
      p.createCanvas(window.innerWidth, window.innerHeight / 2, p.WEBGL)
      p.pixelDensity(1)
      p.clear()
      p.noStroke()
      p.loadPixels()
      clouds.forEach((cloud) => {
        const index = (cloud.x + cloud.y * window.innerWidth) * 4
        p.pixels[index + 0] = p.lerp(cloud.originColor.r, cloud.originColor.r / f, noiseFactors[index])
        p.pixels[index + 1] = p.lerp(cloud.originColor.g, cloud.originColor.g / f, noiseFactors[index])
        p.pixels[index + 2] = p.lerp(cloud.originColor.b, cloud.originColor.b / f, noiseFactors[index])
        p.pixels[index + 3] = 255
      })
      p.updatePixels()
    }
    p.draw = () => {
      p.clear()
      p.loadPixels()
      for (const cloud of clouds) {
        cloud.x += 1
        if (cloud.x >= window.innerWidth)
          cloud.x = 0
        const index = (cloud.x + cloud.y * window.innerWidth) * 4
        const r = cloud.originColor.r * Factors[index] * noiseFactors[index]
        const g = cloud.originColor.g * Factors[index] * noiseFactors[index]
        const b = cloud.originColor.b * Factors[index] * noiseFactors[index]
        p.pixels[index + 0] = p.lerp(r, r / f, noiseFactors[index])
        p.pixels[index + 1] = p.lerp(g, g / f, noiseFactors[index])
        p.pixels[index + 2] = p.lerp(b, b / f, noiseFactors[index])
        /* p.pixels[index + 0] = cloud.originColor.r * Factors[index] * noiseFactors[index]
        p.pixels[index + 1] = cloud.originColor.g * Factors[index] * noiseFactors[index]
        p.pixels[index + 2] = cloud.originColor.b * Factors[index] * noiseFactors[index] */
        p.pixels[index + 3] = 255
      }

      /* for (const cloud of clouds) {
        cloud.x += 1
        if (cloud.x > window.innerWidth) {
          cloud.x = 0
          let newR = p.map(cloud.y, 0, window.innerHeight, 70, 243) * firstLine[cloud.y].Factor
          newR = p.lerp(newR, newR / f, firstLine[cloud.y].noiseFactor)
          let newG = p.map(cloud.y, 0, window.innerHeight, 77, 228) * firstLine[cloud.y].Factor
          newG = p.lerp(newG, newG / f, firstLine[cloud.y].noiseFactor)
          let newB = p.map(cloud.y, 0, window.innerHeight, 158, 246) * firstLine[cloud.y].Factor
          newB = p.lerp(newB, newB / f, firstLine[cloud.y].noiseFactor)
          const index = (cloud.x + cloud.y * window.innerWidth) * 4
          p.pixels[index + 0] = newR
          p.pixels[index + 1] = newG
          p.pixels[index + 2] = newB
        }
        const index = (cloud.x + cloud.y * window.innerWidth) * 4
        p.pixels[index + 0] = cloud.presentColor.r
        p.pixels[index + 1] = cloud.presentColor.g
        p.pixels[index + 2] = cloud.presentColor.b
      }
 */
      p.updatePixels()
    }
  }, cloudsEl)
})

/* const cloudsCanvas = new P5((p: P5) => {
    p.setup = () => {
      p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL)
      p.pixelDensity(1)
      p.clear()
      p.noStroke()
    }
    p.draw = () => {
      p.loadPixels()
      for (const cloud of clouds) {
        cloud.x += 1
        if (cloud.x > window.innerWidth)
          cloud.x = 0
        const index = (cloud.x + cloud.y * window.innerWidth) * 4
        p.pixels[index + 0] = p.lerp(cloud.presentColor.r, cloud.presentColor.r / f, noiseFactors[index])
        p.pixels[index + 1] = p.lerp(cloud.presentColor.g, cloud.presentColor.g / f, noiseFactors[index])
        p.pixels[index + 2] = p.lerp(cloud.presentColor.b, cloud.presentColor.b / f, noiseFactors[index])
      }
      p.updatePixels()
    }
  }, cloudsEl) */
</script>

<template>
  <div ref="starrySkyEl" fixed left-0 top-0 z-1 />
  <div ref="cloudsEl" fixed left-0 top-0 z-2 />
</template>
