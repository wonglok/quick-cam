<template>
  <div class="full">
    <div class="camera-area">
      <div class="debug">
      </div>
    </div>
    <div class="camera-roll"></div>
  </div>
</template>

<script>
import * as cAPI from '../api/cAPI'
export default {
  data () {
    return {
      adapter: cAPI.getSocketAdapter()
    }
  },
  computed: {
    socket () {
      return this.adapter.socket
    }
  },
  async mounted () {
    this.socket.on('connect', () => {
      const mySocketID = this.socket.id
      this.socket.on('add-room-item', (data, socketID) => {
        if (mySocketID === socketID) {
          console.log('same')
        }
        console.log('add-room-item', data)
      })
      this.socket.on('remove-room-item', (data, socketID) => {
        console.log('remove-room-item', data)
      })
      this.socket.on('update-room-item', (data, socketID) => {
        console.log('update-room-item', data)
      })
      this.socket.emit('join', { roomID: '123' })
      this.socket.emit('add-room-item', {
        roomID: '123',
        def: 546
      })
    })
  }
}
</script>

<style scoped>

</style>
