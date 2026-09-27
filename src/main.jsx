import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./index.css"
import App from './App.jsx'

import { BrowserRouter as Router } from "react-router"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/Auth_Context.jsx'
import { ThemeProvider } from './context/ThemeToggle_Context.jsx'
import { ToastProvider } from './context/Toast_Context.jsx'

const client = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={client}>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <Router>
              <App />
            </Router>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
