import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import ReactDOM from "react-dom/client"
import React from 'react'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
// import CrudDestino from './destino/crudDestino.jsx'
// import DestinoForm from './destino/destinoForm.jsx'
import {BrowserRouter} from "react-router-dom"

// import LoteForm from './lote/loteForm.jsx'
// import CrudLote from './lote/crudLote.jsx'
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
    <App />
    </BrowserRouter>
    {/* <CrudDestino /> */}
    {/* <CrudLote /> */}
  </React.StrictMode>,
)
