<template>
  <div class="full" ref="mounter">
    <WebGLRenderer v-if="base" @renderer="renderer = $event" :base="base" kn="renderer"></WebGLRenderer>
    <PerspectiveCamera v-if="base" @camera="camera = $event" :base="base" :kn="'camera'"></PerspectiveCamera>

    <!-- Controls -->
    <!-- <OrbitControls v-if="isDev && base" :base="base" :kn="'orbitControls'"></OrbitControls> -->

    <!-- Compute Intese Resources -->
    <!-- <PaintCanvas v-if="base && sdk" :sdk="sdk" :base="base" :kn="'paleCanvas'" :settings="'paint-canvas'"></PaintCanvas>
    <CubeTexture v-if="base" :base="base" :canvas="'paleCanvas'" :kn="'paleCube'"></CubeTexture>
    <CanvasTexture v-if="base" :base="base" :canvas="'paleCanvas'" :kn="'pale2DTexture'"></CanvasTexture> -->

    <!-- Compute Intese Resources -->
    <PaintCanvas v-if="base && sdk" :sdk="sdk" :base="base" :kn="'creamCanvas'" :settings="'cream-canvas'"></PaintCanvas>
    <CubeTexture v-if="base" :base="base" :canvas="'creamCanvas'" :kn="'creamCube'"></CubeTexture>
    <CanvasTexture v-if="base" :base="base" :canvas="'creamCanvas'" :kn="'cream2DTexture'"></CanvasTexture>

    <!-- Raycaster -->
    <Raycaster v-if="base" :sdk="sdk" :base="base" :kn="'clickers'"></Raycaster>

    <!-- Scene -->
    <Scene v-if="base" @scene="scene = $event" :base="base" :kn="'scene'">

      <!-- Dome -->
      <SkyDome :base="base" :kn="'skydome'" :texture="'cream2DTexture'"></SkyDome>

      <O3D v-if="base && stub && screen && scroller && sdk">
        <HomeOverlay :sdk="sdk" :base="base"></HomeOverlay>
      </O3D>

    </Scene>
  </div>
</template>

<script>
// import Vue from 'vue'
import { makeSDK } from '../../human'
import { makeScroller } from '../ReusableGraphics/Scroll.js'
import { makeBase } from '../ReusableGraphics/BaseAPI.js'
import { getScreen } from '../ReusableGraphics/GetScreen.js'
import { castDownEvent } from '../ReusableGraphics/Scope.js'
import Stats from 'stats.js'

const TWEEN = require('@tweenjs/tween.js').default

export default {
  components: {
    ...require('../graphics').default
  },
  data () {
    return {
      renderer: false,
      scene: false,
      camera: false,
      layers: {
        logo: false
      },
      overlay: '',
      stub: false,
      screen: false,
      ready: false,
      isDev: process.env.NODE_ENV === 'development',
      logs: [],
      base: false,
      sdk: false,
      // scroller: {},
      scroller: { value: 0 }
    }
  },
  created () {
  },
  async mounted () {
    this.onReady()
  },
  methods: {
    relayout () {
      castDownEvent(this, 'relayout', {})
    },
    async onReady () {
      this.sdk = await makeSDK()
      var stats = false
      if (this.isDev) {
        stats = new Stats()
        this.$refs.mounter.appendChild(stats.dom)
      }
      this.base = await makeBase({ stats, mounter: this.$refs.mounter })

      this.sdk.onStubGroup('home-page', (stub) => {
        this.stub = stub
        this.relayout()
      })

      this.$on('overlay', (overlay) => {
        this.overlay = overlay
      })

      this.$on('onScroll', () => {
        if (this.overlay !== '') {
          this.overlay = ''
        }
      })

      window.addEventListener('keydown', (evt) => {
        if (evt.keyCode === 27) {
          this.overlay = ''
        }
      }, false)

      const base = this.base
      const renderer = await base.waitKN('renderer')
      const scene = await base.waitKN('scene')
      const camera = await base.waitKN('camera')

      camera.position.z = 200

      this.screen = getScreen({ camera, depth: 0.0 })
      base.onResize(() => {
        this.screen = getScreen({ camera, depth: 0.0 })
        this.relayout()
      })

      // const vm = this
      this.scroller = makeScroller({
        base,
        touchTarget: renderer.domElement,
        onMove: () => {
          this.$emit('onScroll')
        },
        limit: {
          get canRun () {
            return true
          },
          y: 1
        }
      })

      base.loop(() => {
        TWEEN.update()
        renderer.render(scene, camera)
      })

      base.systemReady()

      setTimeout(() => {
        this.ready = true
        castDownEvent(this, 'relayout', {})
      })
    },
    log (v) {
      this.logs.unshift(v)
      this.logs = this.logs.slice(0, 50)
    }
  },
  beforeDestroy () {
    this.base.destroy()
  }
}
</script>

<style scoped>
.full{
  width: 100%;
  height: 100%;
}
</style>
