import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Arc tokens, imported once at the app root exactly as llms.txt / the docs instruct.
import '@/components/arc/foundation.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
