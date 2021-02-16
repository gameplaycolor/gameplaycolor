const cacheName = 'gameplaycolor'
const cachedFiles = [
  '/assets/silent.mp3',
  '/defaults/apple-touch-startup-image-1242x2148.png',
  '/defaults/apple-touch-startup-image-1536x2008.png',
  '/defaults/apple-touch-startup-image-2048x1496.png',
  '/defaults/apple-touch-startup-image-640x1096.png',
  '/images/drive.png',
  '/images/icon-large.png',
  '/images/icon.png',
  '/checksum.txt',
  '/index.html'
]

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(cachedFiles)
    })
  )
})

self.addEventListener('fetch', function(event) {
  const reqUrl = new URL(event.request.url)
  console.log(event.request, reqUrl)

  if (reqUrl.pathname == '/request-update') {
    event.respondWith(
      checkForUpdate()
    )
  } else {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request)
      })
    )
  }
})

async function checkForUpdate() {
  try {
    const [oldRes, newRes] = await Promise.all([
      caches.match("/checksum.txt"),
      fetch("/checksum.txt")
    ])
  
    const [oldHash, newHash] = await Promise.all([
      oldRes.text(),
      newRes.text()
    ])
  
    console.log(oldHash, newHash)
    if (oldHash == newHash) {
      return new Response('{ "update": false }', {
        headers: { "Content-Type": "application/json" }
      })
    }
  
    const cache = await caches.open(cacheName)
    await cache.addAll(cachedFiles)
  
    const [versionRes, releaseRes] = await Promise.all([
      fetch("/version.txt"),
      fetch("/release.txt")
    ])
    const [version, release] = await Promise.all([
      versionRes.text(),
      releaseRes.text()
    ])
  
    return new Response(JSON.stringify({
      update: true,
      version,
      release
    }), {
      headers: { "Content-Type": "application/json" }
    })
  } catch(error) {
    return new Response(JSON.stringify({ update: false, error }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}
