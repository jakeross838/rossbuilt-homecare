import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Note: StrictMode disabled temporarily due to AbortError issues with Supabase client
// In production, this is not an issue as StrictMode only affects development
createRoot(document.getElementById('root')!).render(<App />)
