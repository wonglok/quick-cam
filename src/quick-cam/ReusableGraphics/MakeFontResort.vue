<template>
  <div></div>
</template>

<script>
import { TextGeometry, Font } from 'three'

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
    sdk: {},
    kn: {},
    base: {},
    setting: {
      default: 'font-resort'
    }
  },
  async mounted () {
    var font = require('./Fonts/resort-display.json')
    var camera = await this.base.waitKN('camera')
    font = new Font(font)

    this.base[this.kn] = async ({ text, width = false, height = false, onReady }) => {
      // eslint-disable-next-line
      const group = this.sdk.getGroup(`${this.setting}`)
      var tout = 0
      // const json = ''
      const runSetup = () => {
        const swidth = visibleWidthAtZDepth(camera.position.z, camera)
        const sheight = visibleHeightAtZDepth(camera.position.z, camera)
        const min = Math.min(swidth, sheight)
        const params = {
          font: font,
          size: (width || (group.proxy.width / 100)) * min,
          height: height || (group.proxy.depth / 100 * 5),
          curveSegments: group.proxy.curveSegments / 100 * 100,
          bevelEnabled: group.proxy.bevelEnabled,
          bevelThickness: group.proxy.bevelThickness / 100,
          bevelSize: group.proxy.bevelSize / 100,
          bevelOffset: group.proxy.bevelOffset / 100,
          bevelSegments: group.proxy.bevelOffset / 100 * 10
        }

        // const newJSON = JSON.stringify(params)
        // if (newJSON !== json) {
        // json = newJSON
        console.log(params)
        var geometry = new TextGeometry(text, params)
        onReady({ geo: geometry })
        // }
      }

      const setupLater = () => {
        clearTimeout(tout)
        tout = setTimeout(() => {
          runSetup()
        }, 50)
      }
      this.base.onResize(runSetup)
      group.autoPulse('width', setupLater)
      group.autoPulse('depth', setupLater)
      group.autoPulse('curveSegments', setupLater)
      group.autoPulse('bevelEnabled', setupLater)
      group.autoPulse('bevelThickness', setupLater)
      group.autoPulse('bevelSize', setupLater)
      group.autoPulse('bevelOffset', setupLater)
      group.autoPulse('bevelSegments', setupLater)
    }
  }
}
</script>

<style>

</style>
