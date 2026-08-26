import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import * as bootstrap from 'bootstrap'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './index.css'
//import CrudProveedores from './Proveedores/crudProveedores.jsx'
//import CrudResponsables from './Responsables/crudResponsables.jsx'

import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/authContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)