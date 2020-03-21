import io from 'socket.io-client'
// import P2P from 'socket.io-p2p'

export var guiURL = `https://madeforyouapp.com`
export var apiURL = `https://quick-cam-api.madeforyouapp.com`
export var remoteURL = guiURL

if (process.env.NODE_ENV === 'development') {
  apiURL = `http://` + location.hostname + ':1337'
  remoteURL = `${location.protocol}//${location.host}`
}

export const getSocketAdapter = () => {
  const NSIO = io(apiURL + '/cam', {
    autoConnect: false,
    transports: ['websocket']
  })
  const retry = () => {
    NSIO.disconnect()
    const tout = setInterval(() => {
      if (!NSIO.connected) {
        NSIO.open()
      } else {
        clearInterval(tout)
      }
    }, 1000)
  }
  NSIO.on('error', retry)
  // NSIO.on('reconnect_error', retry)
  // NSIO.on('reconnect_failed', retry)
  // NSIO.on('disconnect', retry)
  NSIO.open()

  // const p2p = new P2P(NSIO)
  const onReady = () => {
    return new Promise((resolve) => {
      NSIO.on('connection', (socket) => {
        resolve(socket)
      })
    })
  }
  return {
    socket: NSIO,
    onReady
    // p2p
  }
}

getSocketAdapter()

const BaBam = async (args) => {
  const axios = (await import('axios')).default
  return axios({
    ...args
  })
    .then(e => {
      return e.data
    })
    .catch(e => {
      console.log(args.method, args.url)
      console.log(e)
      return Promise.reject(e)
    })
}

export const makeAlbum = async ({ slug, description, adminPassword, viewPassword, enableViewPassword }) => {
  const output = await BaBam({
    method: 'POST',
    baseURL: apiURL,
    url: `/albums`,
    data: {
      slug: slug,
      description: description,
      adminPassword: adminPassword,
      viewPassword: viewPassword,
      enableViewPassword: enableViewPassword,
      date: new Date()
    }
  })
  return output
}

export const login = async ({ album, password }) => {
  const output = await BaBam({
    method: 'POST',
    baseURL: apiURL,
    url: `/albums/login`,
    data: {
      album,
      password
    }
  })
  return output
}

export const eqSlug = async (input) => {
  // http://localhost:1337/albums?slug_contains=awo
  const output = await BaBam({
    method: 'GET',
    baseURL: apiURL,
    url: `/albums/?slug_eq=${encodeURIComponent(input.query.toLowerCase())}`
  })
  if (output) {
    return output
  } else {
    return false
  }
}
export const searchSlug = async (input) => {
  // http://localhost:1337/albums?slug_contains=awo
  const output = await BaBam({
    method: 'GET',
    baseURL: apiURL,
    url: `/albums/?slug_contains=${encodeURIComponent(input.query)}`
  })
  if (output) {
    return output
  } else {
    return false
  }
}

export const getAlbumBySlug = async (input) => {
  const output = await BaBam({
    method: 'GET',
    baseURL: apiURL,
    url: `/albums/?slug=${encodeURIComponent(input.slug)}`
  })
  if (output) {
    return output[0]
  } else {
    return false
  }
}

export function dataURItoBlob (dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1])

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split('')[0]

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length)
  var ia = new Uint8Array(ab)
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }

  // Old Code
  // write the ArrayBuffer to a blob, and you're done
  // var bb = new BlobBuilder()
  // bb.append(ab)
  // return bb.getBlob(mimeString)

  // New Code
  return new Blob([ab], { type: mimeString })
}

export const uploadPhoto = async ({ name, blob, albumID, filename = 'image.jpg', progress = () => {} }) => {
  const formData = new FormData()
  formData.append(`files.photo`, new File([blob], filename), filename)
  formData.append(`data`, JSON.stringify({
    desc: 'desc',
    albumID: albumID,
    deviceUUID: '12345',
    deviceDisplayName: name
  }))

  const output = await BaBam({
    method: 'POST',
    baseURL: apiURL,
    url: `/photos`,
    data: formData,
    onUploadProgress: (progressEvent) => {
      var percentCompleted = ((progressEvent.loaded) / progressEvent.total)
      progress(percentCompleted)
    }
  })
  if (output) {
    return output
  } else {
    return false
  }
}

export const getPhotosBySlug = async ({ slug, viewPassword }) => {
  const output = await BaBam({
    method: 'POST',
    baseURL: apiURL,
    data: {
      slug,
      viewPassword
    },
    url: `/albums/getPhotosBySlug`
  })

  if (output) {
    return output
  } else {
    return false
  }
}

export const removePhotosIn = async ({ photoIDs, slug, viewPassword }) => {
  const output = await BaBam({
    method: 'POST',
    baseURL: apiURL,
    data: {
      photoIDs,
      slug,
      viewPassword
    },
    url: `/albums/removePhotosIn`
  })

  if (output) {
    return output
  } else {
    return false
  }
}
