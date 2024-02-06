import type P5 from 'p5'

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

function generateSnow(x: number, y: number, len: number, depth: number, leaves: number) {
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

export interface Fall {
  fall: (p: P5, dx: number) => void
}

export type WeatherKey = 'rain' | 'snow'

export interface Branch {
  x: number
  y: number
  alpha: number
  angle: number
  len: number
}

export class RainDrop implements Fall {
  x: number
  y: number
  z: number
  speedX: number
  speedY: number
  len: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
    this.z = Math.random() * 20
    this.speedX = 0
    this.speedY = 0
    this.len = Math.random() * 5
  }

  fall(p: P5, dx: number) {
    if (!this.speedX) {
      this.speedX = p.noise(p.frameCount / 500) * 2
      this.speedY = p.noise(p.frameCount) * 15 + 5
    }
    this.x += this.speedX + dx
    this.y += this.speedY + 0.5
    p.stroke(255)

    this.show(p)
  }

  show(p: P5) {
    const thick = p.map(this.z, 0, 20, 1, 3)
    p.strokeWeight(thick)
    p.stroke(128)
    p.line(this.x, this.y, this.x, this.y + this.len)
  }
}

export class Snow implements Fall {
  x: number
  y: number
  angle: number
  branches: Branch[] = []
  speedX: number
  speedY: number
  count: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
    this.angle = 0
    this.branches = generateSnow(x, y, 5, Math.random() * 2 + 1, 5 + Math.random() * 2)
    this.speedX = 0
    this.speedY = 0
    this.count = 0
  }

  fall(p: P5, dx: number = 0) {
    if (!this.speedX) {
      this.speedX = p.noise(p.frameCount / 10) * 2
      this.speedY = p.noise(p.frameCount / 100) * 2
    }
    p.push()
    p.translate(this.x, this.y)
    p.rotate(this.angle)

    p.beginShape()

    this.count++

    for (const b of this.branches) {
      lineTo(b, p)
      if (this.count === 10) {
        b.alpha *= 0.99
        this.count = 0
      }
    }
    p.pop()

    this.angle += 0.01
    this.x += this.speedX + dx
    this.y += this.speedY + 2
  }

  /* visible() {
    for (const b of this.branches) {
      if (b.alpha > 0.1 && this.x > -51 && this.x < WIDTH && this.y > -501 && this.y < HEIGHT)
        return true
    }
    return false
  } */
}
