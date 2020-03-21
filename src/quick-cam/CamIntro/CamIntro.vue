<template>
  <div class="full">
    <div class="wrapper">
      <div class="text-xl p-2 bg-gray-600 text-white flex justify-between items-center lg:text-4xl">
        <div class="text-lg">📸 Group Cam 📷 </div>
        <div class="text-lg cursor-pointer select-none border px-2 py-1 lg:text-2xl" @click="$router.push('/create-room')">Create Room</div>
      </div>
      <div class="text-2xl p-2 py-2">Search My Room</div>
      <div class="px-2">
        <input type="text" v-model="query" @keydown.enter="search" @input="results = false" placeholder="Search Room ID" class="bg-gray-200 p-2" />
        <button class="text-lg cursor-pointer select-none border p-2 ml-2" @click="search">Search</button>
      </div>
      <div v-if="results">
        <div class="text-xl p-2">Results</div>
        <div class="p-2" v-if="results.length === 0">No Search Result for "{{ query }}"...</div>
        <div v-else  class="">
          <div class="bg-gray-200 odd:bg-gray-300 flex justify-between lg:justify-start items-center" :key="item._id" v-for="item in results">
            <!-- <div class="p-3 bg-gray-300 inline-block cursor-pointer hover:bg-gray-100">
              ❤️
            </div> -->
            <div class="p-3 underline cursor-pointer inline-block hover:bg-gray-100 w-full" @click="$router.push(`/${item.slug}`)">👑 {{ item.slug }}</div>

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
      query: '',
      results: false
    }
  },
  methods: {
    async search () {
      if (!this.query) {
        this.results = false
        return
      }
      const results = await cAPI.searchSlug({ query: this.query })
      this.results = results
    }
  },
  mounted () {
    // this.query = 'wonglok'
    // this.search()
  }
}
</script>

<style>

</style>
