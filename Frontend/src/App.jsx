import Barra from './barra.jsx'
import { Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom'
import CrudResponsables from './Responsables/crudResponsables'
import CrudProveedores from './Proveedores/crudProveedores'
import CrudDestino from './Destino/crudDestino'
import CrudInsumos from './insumos/crudInsumos.jsx'
import CrudEntradas from './entradas/crudEntradas.jsx'
import SolicitudCrud from './solicitudes/solicitudCrud.jsx'
import EstadoCrud from './Estados/EstadosCrud.jsx'
import Estados_solicitudCrud from './Estados_solicitud/Estado_solicitudCrud.jsx'
import Login from './home/Login'
import Home from './home/home.jsx'
import { useState, useEffect } from 'react'

// Layout para rutas que necesitan el navbar de Bootstrap
function LayoutWithNavbar({ isAuth, logout }) {
  return (
    <>
      <Barra isAuth={isAuth} logout={logout} />
      <main className="container my-4">
        <Outlet />
      </main>
    </>
  );
}

// Layout para rutas SIN navbar (como Home)
function LayoutWithoutNavbar() {
  return (
    <main className="container-fluid p-0 m-0"> {/* Sin container de Bootstrap */}
      <Outlet />
    </main>
  );
}

function App() {
  const navigate = useNavigate()
  const [isAuth, setIsAuth] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('tokenFoodStocker')
    setIsAuth(!!stored)
    setIsLoading(false)
  }, [])

  const logout = () => {
    localStorage.removeItem('tokenFoodStocker')
    localStorage.removeItem('userFoodStocker')
    setIsAuth(false)
    navigate('/login')
  }

  if (isLoading) {
    return <div className="text-center mt-5">Cargando...</div>
  }

  return (
    <Routes>
      {/* Rutas públicas SIN navbar */}
      <Route path="/login" element={<Login setIsAuth={setIsAuth} />} />
      <Route path="/home" element={<Home />} />
      
      {/* Rutas protegidas CON navbar (Bootstrap) */}
      <Route
        path="/"
        element={
          isAuth ? (
            <LayoutWithNavbar isAuth={isAuth} logout={logout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      >
        <Route index element={<Navigate to="/home" />} />
        <Route path="Proveedores" element={<CrudProveedores />} />
        <Route path="Responsables" element={<CrudResponsables />} />
        <Route path="Destino" element={<CrudDestino />} />
        <Route path="Insumos" element={<CrudInsumos />} />
        <Route path="Entradas" element={<CrudEntradas />} />
        <Route path="Solicitudes" element={<SolicitudCrud />} />
        <Route path="Estados" element={<EstadoCrud />} />
        <Route path="Estado_solicitud" element={<Estados_solicitudCrud />} />
      </Route>
      
      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to={isAuth ? "/" : "/login"} />} />
    </Routes>
  )
}

export default App