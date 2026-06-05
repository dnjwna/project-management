import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import axios from 'axios'

window.Pusher = Pusher

const createEcho = () => {
  // 1. Sesuaikan fallback port ke 6001 sesuai instruksi mentor lo
  const wsHost = import.meta.env.VITE_REVERB_HOST || '38.47.180.18'
  const wsPort = parseInt(import.meta.env.VITE_REVERB_PORT || '6001') 
  
  // 2. Karena mentor bilang pake ws://, kita paksa di lokal bernilai false dulu
  // Kecuali nanti kalau di server udah dicolok reverse proxy HTTPS, baru diubah
  const scheme = import.meta.env.VITE_REVERB_SCHEME || 'ws'
  const isSecure = scheme === 'wss'

  return new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'my-app-key',
    wsHost: wsHost,
    wsPort: wsPort,
    wssPort: wsPort,
    forceTLS: isSecure, // Mengikuti variabel scheme dari .env
    enabledTransports: ['ws', 'wss'],
    authorizer: (channel) => ({
      authorize: (socketId, callback) => {
        const token = localStorage.getItem('token') 

        // 3. Ambil base URL API lo yang bener
        const baseUrl = import.meta.env.VITE_API_URL 
          ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') 
          : 'https://38.47.180.18:8443/student06/backend/public' // Sesuaikan path real VPS lo

        axios.post(
          `${baseUrl}/broadcasting/auth`, 
          { socket_id: socketId, channel_name: channel.name },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          }
        )
          .then(res => callback(null, res.data))
          .catch(err => callback(err, null))
      },
    }),
  })
}

export default createEcho