import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './app/store'
import { TooltipProvider } from '@/components/ui/tooltip'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </Provider>
  </StrictMode>,
)