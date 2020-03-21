<template>
  <div>
    {{ loading ? 'Loading....' : '' }}
    <button class="disable-dbl-tap-zoom p-2 border m-1" @click="makeAlbum">makeAlbum</button>
    <button class="disable-dbl-tap-zoom p-2 border m-1" @click="login">login</button>
    <button class="disable-dbl-tap-zoom p-2 border m-1" @click="getAlbumBySlug">getAlbumBySlug</button>
    <button class="disable-dbl-tap-zoom p-2 border m-1" @click="getPhotosBySlug">getPhotosBySlug</button>
    <button class="disable-dbl-tap-zoom p-2 border m-1" @click="openCamera">openCamera</button>
    <button class="disable-dbl-tap-zoom p-2 border m-1" v-if="takePhoto" @click="takePhoto">takePhoto</button>
    <button class="disable-dbl-tap-zoom p-2 border m-1" v-if="takeGif" @click="takeGif">takeGif</button>

    <button class="disable-dbl-tap-zoom p-2 m-2 border" v-if="mode === 'normal'" @click="startSelect()">Select</button>
    <button class="disable-dbl-tap-zoom p-2 m-2 border" v-if="mode === 'normal'" @click="selectAll()">Select All</button>
    <button class="disable-dbl-tap-zoom p-2 m-2 border" v-if="mode === 'selecting'" @click="cancelSelect()">Cancel Select</button>
    <button class="disable-dbl-tap-zoom p-2 m-2 border" v-if="mode === 'selecting'" @click="removeSelected()">Remove Selected</button>
    <div class="">
      <video v-show="takePhoto" class="h-64 w-64 object-cover" :class="{ snapping: snapping, snaponce: snaponce }" playsinline ref="video"></video>
      <canvas ref="canvas" style="display: none"></canvas>
      <div class="flex flex-wrap">
        <div :key="photo._id" v-for="(photo) in photos" class="flex items-center">
          <img class="h-32 w-32 object-cover" v-if="photo.photo && photo.type !== 'uploading'" :src="`${apiURL}${photo.photo.url}`" alt="">
          <img class="h-32 w-32 object-cover" v-if="photo.type === 'uploading'" :src="`${photo.blobURL}`" alt="">
          <div v-if="photo.type === 'rendering'">
            Making GIF
          </div>
          <div v-if="photo.type === 'uploading'">
            Loading
          </div>
          <div v-if="photo.type !== 'uploading'">
            <button class="disable-dbl-tap-zoom p-2 m-2 border" v-if="mode === 'normal'" @click="removePhoto({ photo, photos })">Delete</button>
            <input type="checkbox" v-model="photo.selected" v-if="mode === 'selecting'" @input="$nextTick($forceUpdate)">
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import * as API from '../api/cAPI.js'
import gifshot from 'gifshot'
export default {
  data () {
    return {
      snaponce: false,
      snapping: false,
      loading: false,
      apiURL: API.apiURL,
      photos: [],
      takeGif: false,
      takePhoto: false,
      mode: 'normal'
    }
  },
  mounted () {
    this.getPhotosBySlug()
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

      await API.removePhotosIn({
        photoIDs: photoSelected,
        slug: 'wonglok831',
        viewPassword: '123bbb'
      })
    },
    async removePhoto ({ photo, photos }) {
      const idx = photos.find(e => e._id === photo._id)
      photos.splice(idx, 1)

      const data = await API.removePhotosIn({
        photoIDs: [photo._id],
        slug: 'wonglok831',
        viewPassword: '123bbb'
      })

      return data
    },
    async makeAlbum () {
      const data = await API.makeAlbum({
        slug: 'wonglok831',
        adminPassword: 'wonglok',
        enableViewPassword: true,
        viewPassword: '123bbb',
        description: 'lok lok'
      })
      console.log(data)
    },
    async login () {
      const data = await API.login({
        album: 'wonglok831',
        password: 'wonglok'
      })
      console.log(data)
    },
    async getPhotosBySlug () {
      const data = await API.getPhotosBySlug({
        slug: 'wonglok831',
        viewPassword: '123bbb'
      })
      this.photos = data
      console.log(data)
    },
    async getAlbumBySlug () {
      const data = await API.getAlbumBySlug({
        slug: 'wonglok831'
      })
      this.albumID = data._id
      console.log(data)
    },
    async openCamera () {
      var height = 256
      var width = 256
      const canvas = this.$refs['canvas']
      const video = this.$refs['video']

      var streaming = false
      navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 512 }, height: { ideal: 512 } }, audio: false })
        .then((stream) => {
          video.srcObject = stream
          video.play()
        })
        .catch((err) => {
          console.log('An error occurred: ' + err)
        })
      video.addEventListener('canplay', (ev) => {
        if (!streaming) {
          height = video.videoHeight / (video.videoWidth / width)

          video.setAttribute('width', width)
          video.setAttribute('height', height)

          canvas.setAttribute('width', width)
          canvas.setAttribute('height', height)
          streaming = true
          this.takePhoto = takePhoto
        }
      }, false)
      const album = await API.getAlbumBySlug({ slug: 'wonglok831' })
      const takePhoto = async () => {
        this.snaponce = true
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
              blobURL: URL.createObjectURL(new Blob([blob], { type: 'image/jpeg' }))
            }
            this.photos.push(obj)
            const progress = (v) => console.log(v)
            const data = await API.uploadPhoto({ name: 'lok lok', blob, albumID: album._id, progress })
            this.loading = true
            const idx = this.photos.findIndex(p => p._id === obj._id)
            this.photos[idx] = data
            // await this.getPhotosBySlug()
            this.loading = false
          }, 'image/jpeg', 1)
        }

        console.log('123')
      }
      this.takePhoto = takePhoto
      const makeSnap = () => {
        var context = canvas.getContext('2d')
        context.fillStyle = '#AAA'
        context.fillRect(0, 0, canvas.width, canvas.height)
        canvas.width = width
        canvas.height = height
        context.drawImage(video, 0, 0, width, height)

        // const image = new Image()
        // image.src =
        return canvas.toDataURL('image/jpg', 1.0)
      }

      const uploadGif = async (blob, tempObj) => {
        tempObj.tpye = 'uploading'
        tempObj.blobURL = URL.createObjectURL(new Blob([blob], { type: 'image/gif' }))
        const progress = (v) => console.log(v)
        const data = await API.uploadPhoto({ name: 'lok lok', filename: 'image.gif', blob, albumID: album._id, progress })
        this.loading = true
        const idx = this.photos.findIndex(p => p._id === tempObj._id)
        this.photos[idx] = data
        // await this.getPhotosBySlug()
        this.loading = false
      }
      const takeGif = async () => {
        this.snapping = true
        const gif = []
        const makeGif = () => {
          const tempObj = {
            type: 'rendering',
            _id: Math.random(),
            blobURL: false
          }
          this.photos.push(tempObj)
          gifshot.createGIF({
            gifWidth: width,
            gifHeight: height,
            images: gif
          }, (result) => {
            console.log(result)
            const blob = API.dataURItoBlob(result.image)
            uploadGif(blob, tempObj)
          })
        }
        const loop = () => {
          gif.push(
            makeSnap()
          )
          if (gif.length < 30) {
            console.log('add more', gif.length)
            setTimeout(loop, 30)
          } else {
            this.snapping = false
            console.log('make gif', gif)
            makeGif(gif)
          }
        }
        loop()
      }
      this.takeGif = takeGif
    }
  }
}
</script>

<style scoped>
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
