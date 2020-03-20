export const makeBase = async ({ stats = false, mounter }) => {
  const getID = () => '_' + (100000000.0 * Math.random()).toFixed(0) + ''
  const env = {
    mounter,
    waitKN: (kn) => {
      return new Promise((resolve) => {
        const key = getID()
        env._.loop[key] = () => {
          if (env[kn]) {
            env._.loop[key] = () => {}
            resolve(env[kn])
          }
        }
      })
    },
    getID,
    _: {
      loop: {},
      resize: {},
      clean: {}
    },
    loop: (fn) => {
      const key = getID()
      env._.loop[key] = fn
      return () => {
        env._.loop[key] = () => {}
      }
    },
    onResize: (fn) => {
      fn()
      env._.resize[getID()] = fn
    },
    onClean: (fn) => {
      env._.clean[getID()] = fn
    },
    destroy: () => {
      for (var loopKN in env._.loop) {
        env._.loop[loopKN] = () => {}
      }
      for (var cleanKN in env._.clean) {
        env._.clean[cleanKN]()
      }
    }
  }
  var rAFID = 0
  const runLoop = () => {
    for (var loopKN in env._.loop) {
      env._.loop[loopKN]()
    }
  }
  const looper = () => {
    rAFID = requestAnimationFrame(looper)
    if (stats) {
      stats.begin()
    }
    runLoop()
    if (stats) {
      stats.end()
    }
  }
  rAFID = requestAnimationFrame(looper)
  env.onClean(() => {
    cancelAnimationFrame(rAFID)
  })

  var tout = 0
  const runResize = () => {
    for (var resizeKN in env._.resize) {
      env._.resize[resizeKN]()
    }
  }
  const resize = () => {
    clearTimeout(tout)
    tout = setTimeout(() => {
      runResize()
    }, 100)
  }
  window.addEventListener('resize', resize, false)
  env.onClean(() => {
    window.removeEventListener('resize', resize, false)
  })

  // window.dispatchEvent(new Event('resize'))
  // setTimeout(() => {
  //   window.dispatchEvent(new Event('resize'))
  // }, 100)

  env.systemReady = () => {
    // runLoop()
    runResize()
  }

  return env
}
