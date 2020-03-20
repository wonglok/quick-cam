<template>
  <div class="">
  </div>
</template>

<script>
import { WebGLRenderer } from 'three'

export default {
  props: {
    base: {}
  },
  data () {
    return {
      target: false
    }
  },
  async mounted () {
    const base = this.base
    const makeGIF = base.makeGIF
    const renderer = base.renderer = new WebGLRenderer({
      preserveDrawingBuffer: makeGIF,
      antialias: true,
      alpha: true
    })

    base.getWidth = () => {
      if (makeGIF) {
        return 256
      } else {
        return window.innerWidth
      }
    }
    base.getHeight = () => {
      if (makeGIF) {
        return 256
      } else {
        return window.innerHeight
      }
    }
    base.getDPI = () => {
      if (makeGIF) {
        return 4
      } else {
        return 2
      }
    }

    const resizer = () => {
      const dpi = base.getDPI() // window.devicePixelRatio || 2.0;
      renderer.setSize(base.getWidth(), base.getHeight())
      renderer.setPixelRatio(dpi)
    }
    // resizer()
    base.onResize(resizer)

    base.mounter.appendChild(renderer.domElement)

    this.$emit('renderer', renderer)
  },
  beforeDestroy () {
  }
}
</script>
