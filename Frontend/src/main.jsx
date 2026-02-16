<<<<<<< HEAD
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
=======
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
//import CrudProveedores from './Proveedores/crudProveedores.jsx'
//import CrudResponsables from './Responsables/crudResponsables.jsx'

import {BrowserRouter} from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </React.StrictMode>,
)
>>>>>>> dd1dfd9e4e94d06fac96c31960a5d9cfb1e1e3bc
