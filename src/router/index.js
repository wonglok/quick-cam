import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../quick-cam/Layout/HomePageLayout.vue'

// npm install --save @tweenjs/tween.js stats.js three vue-color
// npm install --save @seregpie/three.text-texture expr-eval raw-loader
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/ice-cream',
    name: 'IceCream',
    // component: () => import(/* webpackChunkName: "secondary" */ '../quick-cam/Layout/IceCreamLayout.vue')
    component: () => import('../quick-cam/Layout/IceCreamLayout.vue')
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: function () {
      return import(/* webpackChunkName: "about" */ '../views/About.vue')
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
