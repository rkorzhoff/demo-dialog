export default null
declare let self: ServiceWorkerGlobalScope

const CHECK_INTERVAL = 30_000 // 30 сек
console.log('worker v2')
// Устанавливаем новый SW сразу
self.addEventListener('install', () => {
  console.log('[SW]: Установлен')
  self.skipWaiting() // Применяем сразу
})

// Заставляем всех клиентов использовать новый SW
self.addEventListener('activate', (event) => {
  console.log('[SW]: Активирован')
  event.waitUntil(deleteOldCaches()) // Удаляем старый кэш
  self.clients.claim() // Берём управление всеми вкладками
})

// Удаление старых кешей
async function deleteOldCaches() {
  const cacheNames = await caches.keys()
  await Promise.all(cacheNames.map((cache) => caches.delete(cache)))
  console.log('[SW]: Старые кеши удалены')
}

self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    console.log('[SW]: Выполняется обновление')
    self.skipWaiting()
  }
})
// Проверка версии
async function checkVersion() {
  try {
    const response = await fetch('/version.json', { cache: 'no-store' })
    const data = await response.json()

    const cache = await caches.open('app-version')
    const cachedResponse = await cache.match('/version.json')

    if (cachedResponse) {
      const cachedData = await cachedResponse.json()
      if (cachedData.version !== data.version) {
        console.log('[SW]: Доступно обновление')
        const clients = await self.clients.matchAll()
        clients.forEach((client) => client.postMessage({ hasUpdate: true }))

        self.registration.update()
      }
    }

    // Обновляем кеш
    await cache.put('/version.json', new Response(JSON.stringify(data)))
  } catch (error) {
    console.error('[SW]: Ошибка при проверке версии', error)
  }
}

setInterval(checkVersion, CHECK_INTERVAL)
