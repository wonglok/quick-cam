<template>
  <div class="full">
    <div class="wrapper full">
      <div class="topbar text-xl p-2 bg-teal-600 text-white flex justify-between items-center">
        <div class="">
          <span class="mr-2" @click="$router.push('/')">🏠</span>
        </div>
        <div class="w-full text-center overflow-visible">
          <span class="text-lg">@{{slug}}</span>
        </div>
        <div class="text-xl cursor-pointer select-none px-2 py-1">🔑</div>
      </div>
      <div v-if="room" class="full-minus-topbar">
        <div v-if="room.enableViewPassword && showBlocker" class="full flex justify-center items-start">
          <div class="text-center pt-12">
            <div class=" text-2xl">Please enter viewer password.</div>
            <div class="">
              <input type="password" class="bg-gray-200 p-2 w-full mt-3 text-black" v-model="viewPassword">
              <button @click="getPhotosBySlug()" type="button" class="bg-gray-200 p-2 w-full mt-3 text-black">Enter</button>
            </div>
            <div v-if="failed" class="p-2 text-red-500">
              Wrong Password
            </div>
          </div>
        </div>
        <div v-if="!showBlocker" class="full">
          <div v-if="requestCamera" class="open-cam p-5 flex justify-center">
            <button @click="openCamera" class="border border-gray-300 p-4 py-2 text-xl">Open Camera 📸</button>
          </div>
          <div class="flex justify-center full relative" v-show="!requestCamera">
            <video class="h-full w-full max-w-sm object-cover lg:m-3" :class="{ snapping: snapping, snaponce: snaponce }" playsinline ref="video"></video>
            <canvas ref="canvas" style="display: none"></canvas>
            <div class="snap-btn absolute">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as cAPI from '../api/cAPI'
export default {
  computed: {
    slug () {
      return this.$route.params.slug
    }
  },
  data () {
    return {
      snapping: false,
      snaponce: false,
      requestCamera: true,
      showBlocker: false,
      failed: false,
      viewPassword: '',
      room: null,
      photos: false
    }
  },
  async mounted () {
    await this.loadRoom()

    // debug
    this.viewPassword = '1234'
    this.getPhotosBySlug()
  },
  methods: {
    async openCamera () {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 512 }, height: { ideal: 512 } }, audio: false })
      this.requestCamera = false
      this.$nextTick(() => {
        this.$refs.video.srcObject = this.stream
        this.$refs.video.play()
      })
    },
    async loadRoom () {
      const room = await cAPI.getAlbumBySlug({ slug: this.slug })
      this.room = room
      this.showBlocker = room.enableViewPassword
    },
    async getPhotosBySlug () {
      try {
        this.failed = false
        this.photos = await cAPI.getPhotosBySlug({ slug: this.slug, viewPassword: this.viewPassword })
        this.showBlocker = false
      } catch (e) {
        this.failed = true
      }
    }
  }
}
</script>

<style>
.topbar {
  height: 60px;
}
.full-minus-topbar{
  height: calc(100% - 60px);
}
.snap-btn{
  position: absolute;
  bottom: 25px;
  left: calc(50% - 70px * 0.5);
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.562);
  border: rgba(255, 0, 0, 0.747) solid 5px;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.snap-btn:focus{
  outline: none;
}
</style>
