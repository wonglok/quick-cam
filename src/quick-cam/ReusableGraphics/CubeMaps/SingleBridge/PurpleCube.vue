<template>
  <div><slot></slot></div>
</template>
<script>
import { CubeTextureLoader } from 'three'
export default {
  props: {
    kn: {},
    base: {},
    wait: {
      default: true
    }
  },
  created () {
  },
  data () {
    return {
      cubemap: new CubeTextureLoader().load([
        require('./purple.png'),
        require('./purple.png'),
        require('./purple.png'),
        require('./purple.png'),
        require('./purple.png'),
        require('./purple.png')
      ], () => {
        if (this.wait && this.base && this.kn) {
          this.base[this.kn] = this.cubemap
        }
      })
    }
  },
  mounted () {
    if (!this.wait && this.base && this.kn) {
      this.base[this.kn] = this.cubemap
    }
  }
}
</script>
