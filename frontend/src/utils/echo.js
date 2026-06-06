import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import axios from 'axios'

window.Pusher = Pusher

const createEcho = () => {
  const token = localStorage.getItem('token')

  return new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'my-app-key',
    wsHost: import.meta.env.VITE_REVERB_HOST || '38.47.180.18',
    wsPort: parseInt(import.meta.env.VITE_REVERB_PORT || '6001'),
    wssPort: parseInt(import.meta.env.VITE_REVERB_PORT || '6001'),
    forceTLS: false,
    disableStats: true,
    enabledTransports: ['ws'],
    authorizer: (channel) => ({
      authorize: (socketId, callback) => {
        const baseUrl = import.meta.env.VITE_API_URL
          ? import.meta.env.VITE_API_URL.replace(/\/api$/, '')
          : 'https://38.47.180.18:8443/student06/backend/public'

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