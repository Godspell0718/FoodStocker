import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <-- Importa BrowserRouter
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Import Bootstrap correctamente
import * as bootstrap from 'bootstrap';

// Hacer disponible bootstrap globalmente
window.bootstrap = bootstrap;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* <-- Envuelve App con BrowserRouter */}
      <App />
    </BrowserRouter>
  </StrictMode>
)