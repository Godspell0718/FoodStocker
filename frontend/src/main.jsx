import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

import 'bootstrap/dist/css/bootstrap.min.css';  
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import CrudEntradas from './entradas/crudEntradas.jsx';
import EntradasForm from './entradas/entradasForm.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <CrudEntradas />
  </StrictMode>,
)
