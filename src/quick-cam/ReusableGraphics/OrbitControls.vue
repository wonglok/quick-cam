<template>
  <div></div>
</template>
<script>
import { lookUp } from './Scope.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
export default {
  props: {
    // canvas: {},
    kn: {},
    base: {}
  },
  async mounted () {
    const base = this.base
    const camera = lookUp(this.$parent, 'camera')
    const renderer = lookUp(this.$parent, 'renderer')
    const controls = new OrbitControls(camera, renderer.domElement)
    // controls.enableDamping = true
    base.loop(() => {
      controls.update()
    })

    // const ct = await this.base.waitKN(this.canvas)
    // const texture = new CanvasTexture(ct)
    // this.base.loop(() => {
    //   texture.needsUpdate = true
    // })
    // this.base[this.kn] = texture
  }
}
</script>
