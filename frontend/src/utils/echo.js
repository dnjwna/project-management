import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import axios from 'axios'

window.Pusher = Pusher

const createEcho = () => {
  return new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'my-app-key',
    wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
    wsPort: parseInt(import.meta.env.VITE_REVERB_PORT || '8080'),
    wssPort: parseInt(import.meta.env.VITE_REVERB_PORT || '8080'),
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
    authorizer: (channel) => ({
      authorize: (socketId, callback) => {
        // 1. Ambil token di dalam sini supaya selalu mendapatkan yang terbaru setelah login
        const token = localStorage.getItem('token') 

        // 2. URL diganti ke /broadcasting/auth (tanpa /api) agar tidak 404
        axios.post(
          'http://127.0.0.1:8000/broadcasting/auth', 
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