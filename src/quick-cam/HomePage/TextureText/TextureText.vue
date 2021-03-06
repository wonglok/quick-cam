<template>
  <div></div>
</template>
<script>
// import MeshText from 'three-spritetext'
import TextTexture from '@seregpie/three.text-texture'

import { ShaderMaterial, Mesh, PlaneBufferGeometry } from 'three'

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
    text: {
      default: 'With Lok Lok .com'
    },
    visible: {
      default: true
    },
    align: {},
    kn: {},
    base: {},
    font: {},
    screen: {},
    texture: {}
  },
  watch: {
    visible () {
      this.sprite.visible = this.visible
    }
  },
  async mounted () {
    const base = this.base
    // const pattern = await base.waitKN(this.texture)

    const glProxy = this.glProxy = {
      add: (v) => {
        this.$emit('add', v)
        this.$parent.$emit('add', v)
      },
      remove: (v) => {
        this.$emit('remove', v)
        this.$parent.$emit('remove', v)
      }
    }

    async function loadSeaside () {
      const font = new FontFace('SeasideResortNF', `url('/fonts/seaside/SeasideResortNF.eot?#iefix') format('embedded-opentype'),  url('/fonts/seaside/SeasideResortNF.woff') format('woff'), url('/fonts/seaside/SeasideResortNF.ttf')  format('truetype'), url('/fonts/seaside/SeasideResortNF.svg#SeasideResortNF') format('svg')`, {
        family: 'SeasideResortNF',
        style: 'normal',
        weight: `normal`
        // `font-weight: normal; font-style: normal;`
      })
      await font.load()
      document.fonts.add(font)
    }
    if (this.font === 'SeasideResortNF') {
      await loadSeaside()
    }

    const texture = new TextTexture({
      align: this.align || 'center',
      fillStyle: 'white',
      fontFamily: `${this.font || 'Arial'}, sans-serif`,
      fontSize: 140,
      fontStyle: 'normal',
      fontVariant: 'normal',
      fontWeight: 'normal',
      lineGap: 0.15,
      padding: 0.15,
      // mini text shadow
      strokeStyle: '#bababa',
      strokeWidth: 0.025,
      text: ''
    })
    /* eslint-disable */
    const material = new ShaderMaterial({
      transparent: true,
      uniforms: {
        // patternTexture: { value: pattern },
        textTexture: { value: texture }
      },
      vertexShader: require('raw-loader!./text-vert.glsl').default,
      fragmentShader: require('raw-loader!./text-frag.glsl').default
    })
    /* eslint-enable */

    const makeGeo = () => {
      // const screen = this.screen
      const width = texture.image.width * 0.0075
      const height = texture.image.width * 0.0075 * (texture.image.height) / (texture.image.width)
      const geo = new PlaneBufferGeometry(width, height, 2, 2)

      geo.computeBoundingSphere()
      geo.computeBoundingBox()

      // mirror.position.x = geo.boundingSphere.radius * -0.5
      // mirror.position.y = (geo.boundingBox.min.y + geo.boundingBox.max.y) * -0.25
      // mirror.needsUpdate = true

      const sizing = {
        radius: width * 0.5,
        width: width,
        height: height,
        depth: 0
      }

      // console.log(this.text, 'sizing', sizing)
      this.$parent.$emit('size', sizing)

      return geo
    }
    const sprite = new Mesh(undefined, material)
    sprite.position.z = 1.0

    this.sprite = sprite
    texture.redraw()
    // sprite.scale
    //   .set(texture.image.width / texture.image.height, 1, 1)
    glProxy.add(sprite)
    this.sprite.visible = this.visible

    const update = () => {
      texture.fontFamily = `${this.font || 'Arial'}, sans-serif`
      texture.text = this.text
      texture.redraw()
      sprite.geometry = makeGeo()
      sprite.needsUpdate = true
      // sprite.scale
      //   .set(texture.image.width / texture.image.height, 1, 1)
    }

    update()

    this.$watch('font', () => {
      update()
    })
    this.$watch('text', () => {
      update()
    })
    base.onResize(() => {
      update()
    })
  },
  async beforeDestroy () {
    const glProxy = this.glProxy
    if (this.sprite) {
      glProxy.remove(this.sprite)
    }
  }
}
</script>
