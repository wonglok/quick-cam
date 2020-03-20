<template>
  <div></div>
</template>
<script>
import { MeshBasicMaterial, Mesh, BackSide, SphereBufferGeometry } from 'three'

export const visibleHeightAtZDepth = (depth, camera) => {
  // compensate for cameras not positioned at z=0
  const cameraOffset = camera.position.z
  if (depth < cameraOffset) depth -= cameraOffset
  else depth += cameraOffset

  // vertical fov in radians
  const vFOV = camera.fov * Math.PI / 180

  // Math.abs to ensure the result is always positive
  return 2 * Math.tan(vFOV / 2) * Math.abs(depth)
}

export const visibleWidthAtZDepth = (depth, camera) => {
  const height = visibleHeightAtZDepth(depth, camera)
  return height * camera.aspect
}

export default {
  props: {
    kn: {},
    base: {},
    texture: {}
  },
  async mounted () {
    const base = this.base
    const camera = await base.waitKN('camera')
    const texture = await base.waitKN(this.texture)
    const glProxy = this.glProxy = {
      add: (v) => {
        this.$parent.$emit('add', v)
      },
      remove: (v) => {
        this.$parent.$emit('remove', v)
      }
    }

    const mat = new MeshBasicMaterial({ map: texture, side: BackSide })
    const mesh = new Mesh(undefined, mat)

    base.onResize(() => {
      const width = visibleWidthAtZDepth(camera.position.z, camera)
      const height = visibleHeightAtZDepth(camera.position.z, camera)
      const max = Math.max(width, height) * 200.0
      const geo = new SphereBufferGeometry(max, 8, 8)
      mesh.geometry = geo
      mesh.needsUpdate = true
    })

    base[this.kn] = mesh

    glProxy.add(mesh)
  },
  async beforeDestroy () {
    const mesh = await this.base.waitKN(this.kn)
    this.glProxy.remove(mesh)
  }
}
</script>
