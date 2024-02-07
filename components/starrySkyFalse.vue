<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/**
 * Inspiration - Yuri Artiukh - https://youtube.com/channel/UCDo7RTzizoOdPjY8A-xDR7g
 */

// import threeOrbitControls from 'https://cdn.skypack.dev/three-orbit-controls@82.1.0'

interface Container {
  el: HTMLElement
  width: number
  height: number
  halfWidth: number
  halfHeight: number
}

class StarrySky {
  container: Container
  numberOfStars: number
  starSpeed: number
  canUserControl: boolean
  rafID: number | null
  useStarShape: boolean
  mouse: { x: number, y: number }
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
  camera: THREE.PerspectiveCamera
  controls: any
  stars: THREE.Group

  constructor({ container, numberOfStars = 1000, starSpeed = 2, control = false, useStarShape = false }) {
    this.numberOfStars = numberOfStars
    this.starSpeed = starSpeed / 10000
    this.canUserControl = control
    this.rafID = null
    this.useStarShape = useStarShape

    this.mouse = {
      x: 0,
      y: 0,
    }

    this.container = {
      el: container,
      width: window.innerWidth,
      height: window.innerHeight,
      halfWidth: window.innerWidth / 2,
      halfHeight: window.innerHeight / 2,
    }

    this._init()
  }

  _init() {
    this._initScene()
    this._initRenderer()
    this._initCamera()
    if (this.canUserControl)
      this._initControls()
    this._createStars()
    this._bindMethods()
    this._addListeners()
    this._render()
  }

  _initScene() {
    this.scene = new THREE.Scene()
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ alpha: true })

    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.container.width, this.container.height)

    this.container.el.appendChild(this.renderer.domElement)
  }

  _initCamera() {
    this.camera = new THREE.PerspectiveCamera(70, this.container.width / this.container.height, 0.001, 5000)
    this.camera.position.set(0, 0, 1500)
  }

  _initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
  }

  _createStars() {
    const material = new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(this._createTexture({ useStarShape: this.useStarShape })),
    })

    this.stars = new THREE.Group()
    this.scene.add(this.stars)

    // const size = this.container.width > this.container.height
    //                ? this.container.width
    //                : this.container.height

    for (let i = 0; i < this.numberOfStars; i++) {
      const star = new THREE.Sprite(material)

      star.position.x = (2 * Math.random() - 1) * 1000
      star.position.y = (2 * Math.random() - 1) * 1000
      star.position.z = (2 * Math.random() - 1) * 1000

      star.scale.x = star.scale.y = 5 + 5 * Math.random()

      this.stars.add(star)
    }
  }

  _onMouseMove(event: MouseEvent) {
    this.mouse.x = event.clientX - this.container.halfWidth
    this.mouse.y = event.clientY - this.container.halfHeight
  }

  _onMouseLeave() {
    this.mouse.x = 0
    this.mouse.y = 0
  }

  _bindMethods() {
    this._resize = this._resize.bind(this)
    this._render = this._render.bind(this)
    this._onMouseMove = this._onMouseMove.bind(this)
    this._onMouseLeave = this._onMouseLeave.bind(this)
  }

  _addListeners() {
    window.addEventListener('resize', this._resize)
    window.addEventListener('mousemove', this._onMouseMove)
    document.body.addEventListener('mouseleave', this._onMouseLeave)
  }

  _render() {
    this._animate()
    this.renderer.render(this.scene, this.camera)

    this.rafID = requestAnimationFrame(this._render)
  }

  _rotateStars() {
    this.stars.rotation.x += this.starSpeed
    this.stars.rotation.y += this.starSpeed
  }

  _lookAround() {
    // this.camera.position.x += (this.mouse.x/3 - this.camera.position.x) * 0.01
    // this.camera.position.y -= (this.mouse.y/3 + this.camera.position.y) * 0.01
    this.scene.position.x = this._lerp(this.scene.position.x, -this.mouse.x / 15, 0.03)
    this.scene.position.y = this._lerp(this.scene.position.y, this.mouse.y / 15, 0.03)
  }

  _animate() {
    this._rotateStars()
    this._lookAround()
    if (this.canUserControl)
      this.controls.update()
  }

  _createTexture({ size = 32, useStarShape = true }) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = size
    canvas.height = size

    const halfSize = size / 2
    const gradient = ctx!.createRadialGradient(halfSize, halfSize, 0, halfSize, halfSize, halfSize)

    if (!useStarShape) {
      // Simple circle
      gradient.addColorStop(0.3, 'rgba(255,255,255,0.8)')
      gradient.addColorStop(0.6, 'rgba(5,30,150,0.4)')
      gradient.addColorStop(1.0, 'rgba(5,30,150,0)')

      ctx!.fillStyle = gradient
      ctx!.fillRect(0, 0, size, size)
    }
    else {
      // Star
      const spikes = 5
      const step = Math.PI / spikes
      let rotation = Math.PI / 2 * 3

      gradient.addColorStop(0.3, 'rgba(255,255,255,0.8)')
      gradient.addColorStop(0.6, 'rgba(255,255,255,0.4)')
      gradient.addColorStop(1.0, 'rgba(5,30,150,0)')

      ctx!.beginPath()
      ctx!.moveTo(halfSize, 0)
      for (let i = 0; i < spikes; i++) {
        // Outer
        ctx!.lineTo(
          halfSize + halfSize * Math.cos(rotation),
          halfSize + halfSize * Math.sin(rotation),
        )
        rotation += step

        // Inner
        ctx!.lineTo(
          halfSize + halfSize / 2 * Math.cos(rotation),
          halfSize + halfSize / 2 * Math.sin(rotation),
        )
        rotation += step
      }
      ctx!.closePath()

      ctx!.fillStyle = gradient
      ctx!.fill()
    }

    return canvas
  }

  _resize() {
    const width = window.innerWidth
    const height = window.innerHeight

    this.container.width = width
    this.container.height = height
    this.container.halfWidth = width / 2
    this.container.halfHeight = height / 2

    this.renderer.setSize(width, height)

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  /**
   * Linear interpolation
   * @param {number} v0 - The starting value
   * @param {number} v1 - The destination value
   * @param {number} t - The normal value (between 0 and 1) to control the Linear Interpolation
   * @return {number} - A value between two numbers at a specified, decimal midpoint
   */
  _lerp(v0, v1, t) {
    return (1 - t) * v0 + t * v1
  }
}

onMounted(() => {
  const starrysky = new StarrySky({
    container: document.getElementById('js-starry-sky'),
    numberOfStars: 1700,
    starSpeed: 2,
    control: true,
    useStarShape: true,
  })
})
</script>

<template>
  <div>
    <main
      id="js-starry-sky"
      style="background: url(https://habrastorage.org/webt/ak/w2/kg/akw2kgettepstgcpegyrou7n2r4.jpeg);" fixed left-0 top-0
    />
  </div>
</template>
