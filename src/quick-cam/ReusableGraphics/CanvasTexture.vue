<template>
  <div></div>
</template>
<script>
import { CanvasTexture } from 'three'
export default {
  props: {
    canvas: {},
    kn: {},
    base: {}
  },
  async mounted () {
    const ct = await this.base.waitKN(this.canvas)
    const texture = new CanvasTexture(ct)
    this.base.loop(() => {
      texture.needsUpdate = true
    })
    this.base[this.kn] = texture
  }
}
</script>
