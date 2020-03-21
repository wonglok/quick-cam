<template>
  <div class="full">
    <div class="wrapper full">
      <div class="topbar text-xl p-2 bg-teal-600 text-white flex justify-between items-center">
        <div class="">
          <span class="mr-2" v-if="!showGallery" @click="showGallery = true">🏠</span>
        </div>
        <div class="w-full text-center overflow-visible">
          <span class="text-lg">@{{slug}}</span>
        </div>
        <div>
          <div v-if="false" class="text-xl cursor-pointer select-none px-2 py-1">🔑</div>
        </div>
      </div>
      <div v-if="notFound">
        <div class="p-5 flex justify-center items-center text-2xl">
          Cannot find room @{{slug}}
        </div>
      </div>
      <div v-if="room" class="full-minus-topbar">
        <div v-if="room && room.enableViewPassword && showBlocker" class="full flex justify-center items-start">
          <div class="text-center pt-12">
            <div class=" text-2xl">Please enter viewer password.</div>
            <div class="">
              <input type="password" class="bg-gray-200 p-2 w-full mt-3 text-black" @keydown.enter="getPhotosBySlug();" v-model="viewPassword" @input="viewPassword = $event.target.value">
              <button @click="getPhotosBySlug()" type="button" class="bg-gray-200 p-2 w-full mt-3 text-black">Enter</button>
            </div>
            <div v-if="wrongPassword" class="p-2 text-red-500">
              Wrong Password
            </div>
          </div>
        </div>
        <div v-if="!showBlocker" class="full">
          <div v-if="showGallery">
            <div class="open-cam p-5 flex justify-center">
              <button @click="openCamera" class="m-1 border border-gray-300 p-4 py-2 text-xl">Open Camera 📸</button>
              <button @click="logout" class="m-1 border border-gray-300 p-4 py-2 text-xl">Logout 🔐</button>
            </div>
            <div class="p-2">
              <div class="flex flex-wrap">
                <div :key="photo._id" v-for="(photo) in photos.slice()" class="inline-flex items-center relative">
                  <div v-if="photo.photo && photo.type !== 'uploading'" class="h-32 w-32 object-cover relative">
                    <img class="h-32 w-32 object-cover" :src="`${getThumbLink(photo)}`" alt="">
                    <button class="absolute text-white rounded-lg bg-red-500 bottom-0 right-0 select-none disable-dbl-tap-zoom p-2 m-2 border" v-if="mode === 'normal'" @click="removePhoto({ photo, photos })">X</button>
                  </div>
                  <img class="h-32 w-32 object-cover" :style="{ background: 'rgba(0,0,0,0.5)' }" v-if="photo.type === 'uploading'" :src="`${getImageLink(photo)}`" alt="">
                  <div class="w-32 absolute bottom-0 left-0" :style="{ background: 'rgba(255,255,255,0.5)', height: `${8 * photo.opacity}rem` }"></div>
                  <div v-if="photo.type === 'rendering'">
                    Making GIF
                  </div>
                  <!-- <div v-if="photo.type === 'uploading'">
                    Loading {{ photo.progress }}
                  </div> -->
                  <!-- <div v-if="photo.type !== 'uploading'">
                    <button class=" select-none disable-dbl-tap-zoom p-2 m-2 border" v-if="mode === 'normal'" @click="removePhoto({ photo, photos })">Delete</button>
                  </div>
                  <div v-if="mode === 'selecting'">
                    <input type="checkbox" v-model="photo.selected" @input="$nextTick($forceUpdate)">
                  </div> -->
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-center full relative" v-show="!showGallery">
            <video class="h-full w-full object-cover bg-gray-200" :class="{ snapping: snapping, snaponce: snaponce }" playsinline ref="video"></video>
            <canvas ref="canvas" style="display: none"></canvas>
            <canvas ref="thumb" style="display: none"></canvas>
            <div class="last-photo disable-dbl-tap-zoom" @click="showGallery = true">
              <div class="" v-if="photos && photos.length > 0">
                <img class="snaponce" v-if="this.photos[this.photos.length - 1].type === 'uploading'" :src="getImageLink(this.photos[this.photos.length - 1])" alt="">
                <img class="snaponce" v-if="this.photos[this.photos.length - 1].photo && this.photos[this.photos.length - 1].type !== 'uploading'" :src="getImageLink(this.photos[this.photos.length - 1])" alt="">
              </div>
            </div>
            <div class="snap-btn disable-dbl-tap-zoom" @click="takePhoto">
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
    },
    socket () {
      return this.adapter.socket
    }
  },
  data () {
    return {
      adapter: cAPI.getSocketAdapter(),
      viewPassword: '',
      notFound: false,
      mode: 'normal',
      photo: {
        height: 1024,
        width: 1024
      },
      snapping: false,
      snaponce: false,
      showGallery: true,
      showBlocker: false,
      wrongPassword: false,

      room: false,
      photos: false
    }
  },
  watch: {
    viewPassword () {
      if (this.room) {
        sessionStorage.setItem('viewPassword@' + this.room._id, this.viewPassword)
      }
    }
  },
  async mounted () {
    await this.loadRoom()
    this.viewPassword = sessionStorage.getItem('viewPassword@' + this.room._id) || ''
    if (this.viewPassword) {
      this.getPhotosBySlug()
    }
    // debug
    // this.viewPassword = '1234'
    // this.getPhotosBySlug()
  },
  methods: {
    logout () {
      this.viewPassword = ''
      this.$forceUpdate()
      this.showBlocker = true
    },
    getImageLink (item) {
      if (item.blobURL) {
        return item.blobURL
      } else {
        return `${cAPI.apiURL}${item.photo.url}`
      }
    },
    getThumbLink (item) {
      if (item.blobURL) {
        return item.blobURL
      } else if (item.thumb) {
        return `${cAPI.apiURL}${item.thumb.url}`
      } else if (item.photo) {
        return `${cAPI.apiURL}${item.photo.url}`
      }
    },
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
        const idx = this.photos.findIndex(e => e._id === photo._id)
        this.socket.emit('remove-album-item', photo)

        this.photos.splice(idx, 1)
      })

      await cAPI.removePhotosIn({
        photoIDs: photoSelected,
        slug: this.slug,
        viewPassword: this.viewPassword
      })
    },
    async removePhoto ({ photo }) {
      const idx = this.photos.findIndex(e => e._id === photo._id)
      this.photos.splice(idx, 1)

      this.socket.emit('remove-album-item', photo)

      const data = await cAPI.removePhotosIn({
        photoIDs: [photo._id],
        slug: this.slug,
        viewPassword: this.viewPassword
      })

      return data
    },
    async takePhoto () {
      this.snaponce = true
      const canvas = this.$refs.canvas
      const video = this.$refs.video
      const width = this.photo.width
      const height = this.photo.height
      var thumbCTX = this.$refs.thumb.getContext('2d')
      thumbCTX.canvas.width = 256
      thumbCTX.canvas.height = 256
      var context = canvas.getContext('2d')
      context.fillStyle = '#FFF'
      context.fillRect(0, 0, canvas.width, canvas.height)
      if (width && height) {
        canvas.width = width
        canvas.height = height

        /**
         * By Ken Fyrstenberg Nilsen
         *
         * drawImageProp(context, image [, x, y, width, height [,offsetX, offsetY]])
         *
         * If image and context are only arguments rectangle will equal canvas
        */
        /* eslint-disable */
        function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {

            if (arguments.length === 2) {
                x = y = 0;
                w = ctx.canvas.width;
                h = ctx.canvas.height;
            }

            // default offset is center
            offsetX = typeof offsetX === "number" ? offsetX : 0.5;
            offsetY = typeof offsetY === "number" ? offsetY : 0.5;

            // keep bounds [0.0, 1.0]
            if (offsetX < 0) offsetX = 0;
            if (offsetY < 0) offsetY = 0;
            if (offsetX > 1) offsetX = 1;
            if (offsetY > 1) offsetY = 1;

            var iw = img.videoWidth || img.width
            var ih = img.videoHeight || img.height
            var r = Math.min(w / iw, h / ih),
                nw = iw * r,   // new prop. width
                nh = ih * r,   // new prop. height
                cx, cy, cw, ch, ar = 1;

            // decide which gap to fill
            if (nw < w) ar = w / nw;
            if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
            nw *= ar;
            nh *= ar;

            // calc source rectangle
            cw = iw / (nw / w);
            ch = ih / (nh / h);

            cx = (iw - cw) * offsetX;
            cy = (ih - ch) * offsetY;

            // make sure source rectangle is valid
            if (cx < 0) cx = 0;
            if (cy < 0) cy = 0;
            if (cw > iw) cw = iw;
            if (ch > ih) ch = ih;

            // fill image in dest. rectangle
            ctx.drawImage(img, cx, cy, cw, ch,  x, y, w, h);
        }
        /* eslint-enable */
        drawImageProp(context, video, 0, 0, width, height)
        drawImageProp(thumbCTX, video, 0, 0, thumbCTX.canvas.width, thumbCTX.canvas.height)

        // context.drawImage(video, 0, 0, width, height)
        const getPhotoBlob = () => new Promise((resolve) => {
          canvas.toBlob(resolve, 'image/jpeg', 0.5)
        })
        const getThumbBlob = () => new Promise((resolve) => {
          thumbCTX.canvas.toBlob(resolve, 'image/jpeg', 0.7)
        })
        const upload = async ({ photoBlob, thumbBlob }) => {
          this.snaponce = false
          const obj = {
            type: 'uploading',
            _id: Math.random(),
            progress: 0,
            opacity: 0,
            blobURL: URL.createObjectURL(new Blob([photoBlob], { type: 'image/jpeg' }))
          }
          this.photos.push(obj)
          const progress = (v) => {
            obj.progress = (v * 100) + '%'
            obj.opacity = v + 0.1
            this.$forceUpdate()
          }
          const data = await cAPI.uploadPhoto({ name: 'loklok', photoBlob, thumbBlob, albumID: this.room._id, progress })
          const idx = this.photos.findIndex(p => p._id === obj._id)
          data.blobURL = obj.blobURL
          this.photos[idx] = data
          const sender = JSON.parse(JSON.stringify(data))
          sender.blobURL = false
          this.socket.emit('add-album-item', sender)
          this.$forceUpdate()
        }
        const [
          photoBlob, thumbBlob
        ] = await Promise.all([
          getPhotoBlob(), getThumbBlob()
        ])
        upload({ photoBlob, thumbBlob })
        // await this.getPhotosBySlug()
      }
    },
    async openCamera () {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1920 }, height: { ideal: 1920 } }, audio: false })
      this.showGallery = false
      this.$nextTick(() => {
        this.$refs.video.srcObject = this.stream
        this.$refs.video.play()
      })
    },
    async loadRoom () {
      await cAPI.getAlbumBySlug({ slug: this.slug })
        .then((room) => {
          this.room = room
          if (room) {
            this.showBlocker = room.enableViewPassword
          } else {
            this.notFound = true
          }
        }, () => {
          this.notFound = true
          return false
        })
    },
    async getPhotosBySlug () {
      try {
        this.wrongPassword = false
        this.photos = await cAPI.getPhotosBySlug({ slug: this.slug, viewPassword: this.viewPassword })
        this.setupEvents()
        this.showBlocker = false
        this.$nextTick(this.openCamera)
      } catch (e) {
        this.wrongPassword = true
      }
    },
    setupEvents () {
      this.socket.on('add-album-item', (data, socketID) => {
        const mySocketID = this.socket.id
        if (mySocketID === socketID) {
          console.log('same, add')
        } else {
          console.log('add-album-item', data)
          if (!this.photos.map(e => e._id).includes(data._id)) {
            this.photos.push(data)
          }
        }
      })
      this.socket.on('remove-album-item', (data, socketID) => {
        const mySocketID = this.socket.id
        if (mySocketID === socketID) {
          console.log('same, remove')
        } else {
          console.log('remove-album-item', data)
          this.photos.splice(this.photos.findIndex(p => p._id === data._id), 1)
        }
      })
      this.socket.on('update-album-item', (data, socketID) => {
        const mySocketID = this.socket.id
        if (mySocketID === socketID) {
          console.log('same, update')
        } else {
          console.log('update-album-item', data)
          const idx = this.photos.findIndex(p => p._id === data._id)
          this.photos[idx] = data
        }
      })
      // this.socket.emit('add-album-item', {
      //   albumID: '123',
      //   def: 546
      // })
      this.socket.emit('join-album', { albumID: this.room._id }, () => {
        console.log('join-album')
      })
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
