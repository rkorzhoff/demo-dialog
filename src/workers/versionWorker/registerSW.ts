export const registerSW = () => {
  const hasUpdate = ref(false)

  const register = async () => {
    if (import.meta.env.DEV) {
      return
    }
    if ('serviceWorker' in navigator === false) {
      return
    }
    try {
      const registration = await navigator.serviceWorker.register('/versionWorker.js', {
        type: 'classic',
      })

      console.log('[SW]: Зарегистрирован')

      // Слушаем обновления SW
      registration.addEventListener('updatefound', () => {
        console.log('[SW]: Найдено обновление')
        const newSW = registration.installing
        if (!newSW) {
          return
        }

        newSW.addEventListener('statechange', () => {
          if (newSW.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('[SW]: Доступна новая версия, запрашиваем обновление')
              hasUpdate.value = true
              newSW.postMessage({ action: 'skipWaiting' })
            } else {
              console.log('[SW]: SW установлен впервые.')
            }
          }
        })
      })

      // Слушаем сообщения от SW
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.hasUpdate) {
          console.log('[Main]: Доступна новая версия приложения!')
          hasUpdate.value = true
        }
      })
    } catch (error) {
      console.error('[SW]: Ошибка при регистрации', error)
    }
  }
  register()

  const refreshApp = () => {
    hasUpdate.value = false
    location.reload()
  }

  return { hasUpdate: computed(() => hasUpdate.value), refreshApp }
}
