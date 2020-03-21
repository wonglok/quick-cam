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
          <div v-if="requestCamera" >
            <div class="open-cam p-5 flex justify-center">
              <button @click="openCamera" class="border border-gray-300 p-4 py-2 text-xl">Open Camera 📸</button>
            </div>
            <div class="p-2">
              <div class="flex flex-wrap">
              <div :key="photo._id" v-for="(photo) in photos" class="flex items-center">
                <img class="h-32 w-32 object-cover" v-if="photo.photo && photo.type !== 'uploading'" :src="`${apiURL}${photo.photo.url}`" alt="">
                <img class="h-32 w-32 object-cover" v-if="photo.type === 'uploading'" :src="`${photo.blobURL}`" alt="">
                <div v-if="photo.type === 'rendering'">
                  Making GIF
                </div>
                <div v-if="photo.type === 'uploading'">
                  Loading {{ photo.progress }}
                </div>
                <div v-if="photo.type !== 'uploading'">
                  <button class=" select-none disable-dbl-tap-zoom p-2 m-2 border" v-if="mode === 'normal'" @click="removePhoto({ photo, photos })">Delete</button>
                  <input type="checkbox" v-model="photo.selected" v-if="mode === 'selecting'" @input="$nextTick($forceUpdate)">
                </div>
              </div>
            </div>
            </div>
          </div>
          <div class="flex justify-center full relative" v-show="!requestCamera">
            <video class="h-full w-full max-w-lg object-cover bg-gray-200" :class="{ snapping: snapping, snaponce: snaponce }" playsinline ref="video"></video>
            <canvas ref="canvas" style="display: none"></canvas>
            <div class="last-photo disable-dbl-tap-zoom" @click="requestCamera = true">
              <div class="" v-if="photos && photos.length > 0">
                <img v-if="this.photos[this.photos.length - 1].type === 'uploading'" :src="this.photos[this.photos.length - 1].blobURL" alt="">
                <img v-if="this.photos[this.photos.length - 1].photo && this.photos[this.photos.length - 1].type !== 'uploading'" :src="apiURL + this.photos[this.photos.length - 1].photo.url" alt="">
              </div>
            </div>
            <div class="snap-btn disable-dbl-tap-zoom" @click="snapOnce">
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
      mode: 'normal',
      apiURL: cAPI.apiURL,
      photo: {
        height: 128,
        width: 128
      },
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
    // this.viewPassword = '1234'
    // this.getPhotosBySlug()
  },
  methods: {
    async startSelect () {
      this.mode = 'selecting'
      this.photos.forEach((data) => {
        data.selected = false
      })
      this.$forceUpdate()
    },
    async cancelSelect () {
      this.mode = 'normal'
      this.photos.forEach((data) => {
        data.selected = false
      })
      this.$forceUpdate()
    },
    async selectAll () {
      this.mode = 'selecting'
      this.photos.forEach((data) => {
        data.selected = true
      })
      this.$forceUpdate()
    },
    async removeSelected () {
      this.mode = 'normal'

      const photoSelected = this.photos.filter(e => e.selected).slice()
      this.photos.filter(e => e.selected).forEach((photo) => {
        const idx = this.photos.find(e => e._id === photo._id)
        this.photos.splice(idx, 1)
      })

      await cAPI.removePhotosIn({
        photoIDs: photoSelected,
        slug: this.slug,
        viewPassword: this.viewPassword
      })
    },
    async removePhoto ({ photo, photos }) {
      const idx = photos.find(e => e._id === photo._id)
      photos.splice(idx, 1)

      const data = await cAPI.removePhotosIn({
        photoIDs: [photo._id],
        slug: this.slug,
        viewPassword: this.viewPassword
      })

      return data
    },
    async snapOnce () {
      this.snaponce = true
      const canvas = this.$refs.canvas
      const video = this.$refs.video
      const width = this.photo.width
      const height = this.photo.height
      var context = canvas.getContext('2d')
      context.fillStyle = '#AAA'
      context.fillRect(0, 0, canvas.width, canvas.height)
      if (width && height) {
        canvas.width = width
        canvas.height = height
        context.drawImage(video, 0, 0, width, height)

        canvas.toBlob(async (blob) => {
          this.snaponce = false
          const obj = {
            type: 'uploading',
            _id: Math.random(),
            progress: 0,
            blobURL: URL.createObjectURL(new Blob([blob], { type: 'image/jpeg' }))
          }
          this.photos.push(obj)
          const progress = (v) => {
            obj.progress = v
            console.log(v)
          }
          const data = await cAPI.uploadPhoto({ name: 'loklok', blob, albumID: this.room._id, progress })
          const idx = this.photos.findIndex(p => p._id === obj._id)
          this.photos[idx] = data
          console.log(data)
          this.$forceUpdate()
          // await this.getPhotosBySlug()
        }, 'image/jpeg', 1)
      }
    },
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
        console.log(this.photos)
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
  background-color: rgba(189, 189, 189, 0.562);
  border: rgba(255, 0, 0, 0.747) solid 5px;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.last-photo{
  position: absolute;
  bottom: 25px;
  left: 25px;
  background: transparent;
  width: 70px;
  height: 70px;

  border-radius: 50%;
  overflow: hidden;
}
.snap-btn:focus{
  outline: none;
}

.disable-dbl-tap-zoom:focus{
  outline: none;
}
.disable-dbl-tap-zoom {
  user-select: none;
  touch-action: manipulation;
}

@keyframes snap {
  0%{
    opacity: 0.25;
  }
  100%{
    opacity: 1;
  }
}
.snapping{
  animation: snap 0.15s linear 0s infinite normal both;
}
.snaponce{
  animation: snap 0.15s linear 0s 1 normal both;
}
</style>
