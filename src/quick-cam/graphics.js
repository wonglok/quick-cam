// export const NavRow = () => import(/* webpackChunkName: "NavRow" */ './Shared/NavRow.vue')

// export const HeroUnit = () => import(/* webpackChunkName: "HeroUnit" */ './Home/HeroUnit.vue')
// export const IntroUnit = () => import(/* webpackChunkName: "IntroUnit" */ './Home/IntroUnit.vue')
// export const FeaturedCards = () => import(/* webpackChunkName: "FeaturedCards" */ './Home/FeaturedCards.vue')
// export const EffortsAndLove = () => import(/* webpackChunkName: "EffortsAndLove" */ './Home/EffortsAndLove.vue')

var path = require('path')
const exporter = {}

function importAll (r) {
  r.keys().forEach(key => {
    const filename = path.basename(key).replace('.vue', '')
    exporter[filename] = () => new Promise((resolve) => {
      resolve(r(key).default)
    })
  })
  return exporter
}

importAll(require.context('./ReusableGraphics', true, /\.vue$/))
importAll(require.context('./HomePage', true, /\.vue$/))
importAll(require.context('./IceCreamPage', true, /\.vue$/))

export default exporter
