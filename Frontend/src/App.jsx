import Barra from './barra.jsx'
import { Routes, Route, Navigate } from 'react-router-dom'
import CrudResponsables from './Responsables/crudResponsables'
import CrudProveedores from './Proveedores/crudProveedores'
import CrudDestino from './Destino/crudDestino'
import CrudInsumos from './insumos/crudInsumos.jsx';

function App() {

  return (
    <Routes>

    
      <Route path="/" element={<Barra />}>

        <Route index element={<Navigate to="/Proveedores" />} />

        <Route path="Proveedores" element={<CrudProveedores />} />
        <Route path="Responsables" element={<CrudResponsables />} />
        <Route path="Destino" element={<CrudDestino />} />
        <Route path="Insumos" element={<CrudInsumos />} />

      </Route>

    </Routes>
  )
}

export default App


