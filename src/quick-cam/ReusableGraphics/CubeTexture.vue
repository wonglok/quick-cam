<template>
  <div></div>
</template>
<script>
import { CubeTexture } from 'three'
export default {
  props: {
    canvas: {},
    kn: {},
    base: {}
  },
  async mounted () {
    const ct = await this.base.waitKN(this.canvas)
    const texture = new CubeTexture([
      ct,
      ct,
      ct,

      ct,
      ct,
      ct
    ])
    this.base.loop(() => {
      texture.needsUpdate = true
    })
    this.base[this.kn] = texture
  }
}
</script>
