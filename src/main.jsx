import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./index.css"
import App from './App.jsx'

import { BrowserRouter as Router } from "react-router"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/Auth_Context.jsx'
import { ThemeProvider } from './context/ThemeToggle_Context.jsx'

const client = new QueryClient()

createRoot(document.getElementById('root')).render(

  <StrictMode>
    <QueryClientProvider client={client}>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <App />
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
