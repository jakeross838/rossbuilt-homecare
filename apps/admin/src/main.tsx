import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Suppress AbortError from Supabase auth internals (known issue with stale sessions)
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.name === 'AbortError') {
    event.preventDefault()
  }
})

createRoot(document.getElementById('root')!).render(<App />)
