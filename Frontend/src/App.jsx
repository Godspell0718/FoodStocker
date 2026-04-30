import { Routes, Route, Navigate } from 'react-router-dom'
import CrudResponsables from './Responsables/crudResponsables'
import CrudProveedores from './Proveedores/crudProveedores'
import CrudDestino from './destino/crudDestino'
import CrudInsumos from './insumos/crudInsumos.jsx'
import CrudEntradas from './entradas/crudEntradas.jsx'
import SolicitudCrud from './Solicitudes/SolicitudCrud.jsx'
import EstadoCrud from './Estados/EstadosCrud.jsx'
import Estados_solicitudCrud from './Estados_solicitud/Estado_solicitudCrud.jsx'
import Login from './home/Login'
import Home from './home/home.jsx'
import { useState, useEffect } from 'react'
import SolicitudConLotes from "./Solicitudes/SolicitudConLotes.jsx"
import SolicitudPendientes from "./Solicitudes/Solicitudpendientes.jsx"

function App() {
  const [isAuth, setIsAuth] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('tokenFoodStocker')
    setIsAuth(!!stored)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="tw-min-h-screen tw-flex tw-flex-col tw-items-center tw-justify-center tw-bg-slate-950 tw-gap-4">
        <div className="tw-w-10 tw-h-10 tw-border-4 tw-border-slate-700 tw-border-t-white tw-rounded-full tw-animate-spin"></div>
        <p className="tw-text-slate-400 tw-text-sm tw-font-medium">Cargando FoodStocker...</p>
      </div>
    )
  }

  return (
    <Routes>

      {/* Ruta pública */}
      <Route path="/login" element={<Login setIsAuth={setIsAuth} />} />

      {/* Rutas protegidas con Home como layout */}
      <Route
        path="/"
        element={
          isAuth ? <Home /> : <Navigate to="/login" />
        }
      >

        <Route index element={<Navigate to="Entradas" />} />

        <Route path="Proveedores" element={<CrudProveedores />} />
        <Route path="Responsables" element={<CrudResponsables />} />
        <Route path="Destino" element={<CrudDestino />} />
        <Route path="Insumos" element={<CrudInsumos />} />
        <Route path="Entradas" element={<CrudEntradas />} />
        <Route path="Solicitudes" element={<SolicitudCrud />} />
        <Route path="Estados" element={<EstadoCrud />} />
        <Route path="solicitudes-pendientes" element={<SolicitudPendientes />} />
        <Route path="solicitud-nueva" element={<SolicitudConLotes />} />
        <Route path="Estado_solicitud" element={<Estados_solicitudCrud />} />

      </Route>

      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to={isAuth ? "/" : "/login"} />} />

    </Routes>
  )
}

export default App