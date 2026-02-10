import { useState } from 'react'
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import CrudDestino from './destino/crudDestino'
import CrudLote from './lote/crudLote'
import Barra from './barra.jsx'



function App() {


  return (
    <>
      <Routes>

        {/* LAYOUT (Barra contiene el <Outlet />) */}
        <Route path="/" element={<Barra />}>

          {/* Ruta de inicio */}
          <Route index element={<Navigate to="destino" />} />

          {/* Ruta destino */}
          <Route path="destino" element={<CrudDestino />} />
           <Route path="lote" element={<CrudLote />} />

        </Route>

      </Routes>
    </>
  )
}


export default App
