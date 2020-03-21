<template>
  <div class="full">
    <div class="wrapper">
      <div class="text-xl p-2 bg-gray-600 text-white flex justify-between items-center lg:text-4xl">
        <div class="text-lg">🎊 Create Room 🎉 </div>
        <div class="text-lg cursor-pointer select-none border px-2 py-1" @click="$router.push('/')">Search Room</div>
      </div>
      <div class="text-2xl p-2 py-2">Create My Room</div>
      <div class="px-2">
        <input type="search" v-model="username" @keydown.enter="checkCanUse" @input="results = false" placeholder="New Room ID" class="bg-gray-200 p-2" />
        <button class="text-lg cursor-pointer select-none border px-2 py-1 ml-2" @click="checkCanUse">Check Taken?</button>
      </div>
      <div v-if="results">
        <div class="text-xl p-2 text-red-500" v-if="results.length > 0">Username is Taken</div>
        <div v-if="results.length === 0">
          <div class="p-2">
            You can use <span class=" font-bold">@{{ username }}</span>
          </div>
          <div class="p-2 text-xl text-bold">
            Album Owner Password
          </div>
          <div class="p-2">
            <input type="password" v-model="form.adminPassword" placeholder="Album Password" class=" w-full lg:w-1/3 bg-gray-200 p-2" />
          </div>
          <div class="px-2 text-xl text-bold">
            Enbale Viewer Password ?
            <div v-if="form.enableViewPassword" @click="form.enableViewPassword = !form.enableViewPassword" class="p-1 mb-3 rounded bg-green-500 text-white inline-flex justify-center items-center">🔐</div>
            <div v-if="!form.enableViewPassword" @click="form.enableViewPassword = !form.enableViewPassword" class="p-1 mb-3 rounded bg-red-300 text-white inline-flex justify-center items-center">🔓</div>
          </div>
          <div class="px-2 mb-3" v-if="form.enableViewPassword">
            <input type="password" v-model="form.viewPassword" placeholder="Viewer Password" class=" w-full lg:w-1/3 bg-gray-200 p-2" />
          </div>
          <div class="px-2 text-xl text-bold">
            Album Description
          </div>
          <div class="px-2">
            <input type="text" v-model="form.desc" placeholder="Description" class=" w-full lg:w-1/3 bg-gray-200 p-2" />
          </div>

          <div class="p-2 mt-3">
            <button :disabled="isSubmitting" @click="submitCreate()" class="w-full lg:w-1/3 bg-green-500 text-white p-2 rounded-lg">Create My Room</button>
          </div>
        </div>
        <div v-else  class="">
          <div class="bg-gray-200 odd:bg-gray-300 flex justify-between lg:justify-start items-center" :key="item._id" v-for="item in results">
            <div class="p-3 underline cursor-pointer inline-block" @click="$router.push(`/${item.slug}`)">👑 {{ item.slug }}</div>
            <!-- <div class="p-3 bg-gray-300 inline-block cursor-pointer">
              ❤️
            </div> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as cAPI from '../api/cAPI'
export default {
  data () {
    return {
      isSubmitting: false,
      username: '',
      results: false,
      form: {
        adminPassword: '',
        enableViewPassword: true,
        viewPassword: '',
        desc: ''
      }
    }
  },
  methods: {
    async checkCanUse () {
      if (!this.username) {
        this.results = false
        return
      }
      const results = await cAPI.eqSlug({ query: this.username })
      this.results = results
    },
    async submitCreate () {
      this.isSubmitting = true
      const data = await cAPI.makeAlbum({
        slug: this.username,
        adminPassword: this.form.adminPassword,
        enableViewPassword: this.form.enableViewPassword,
        viewPassword: this.form.viewPassword,
        description: this.form.desc
      })
      this.$router.push('/' + data.slug)
      console.log(data)
    }
  },
  mounted () {
    // this.username = 'wonglok8312'
    // this.checkCanUse()
  }
}
</script>

<style>

</style>
