<template>
  <div></div>
</template>

<style>
</style>

<script>
import { PerspectiveCamera } from 'three'
export default {
  props: {
    kn: {},
    base: {}
  },
  mounted () {
    const base = this.base
    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 10000000)

    const resizer = () => {
      camera.aspect = base.getWidth() / base.getHeight()
      camera.updateProjectionMatrix()
    }
    // resizer()
    base.onResize(resizer)

    this.base[this.kn] = camera
    this.$emit('camera', camera)
  }
}
</script>
