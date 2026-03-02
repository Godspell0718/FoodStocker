import Barra from './barra.jsx'
import { Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom'
import CrudResponsables from './Responsables/crudResponsables'
import CrudProveedores from './Proveedores/crudProveedores'
import CrudDestino from './Destino/crudDestino'
import CrudInsumos from './insumos/crudInsumos.jsx'
import CrudEntradas from './entradas/crudEntradas.jsx'
import Login from './home/Login'
import { useState, useEffect } from 'react'

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
    return <div>Cargando...</div>
  }

  return (
    <>
      <Barra isAuth={isAuth} logout={logout} />
      <Routes>
        <Route path="/login" element={<Login setIsAuth={setIsAuth} />} />
        
        <Route
          path="/"
          element={isAuth ? <Outlet /> : <Navigate to="/login" />}
        >
          <Route index element={<Navigate to="/Proveedores" />} />
          <Route path="Proveedores" element={<CrudProveedores />} />
          <Route path="Responsables" element={<CrudResponsables />} />
          <Route path="Destino" element={<CrudDestino />} />
          <Route path="Insumos" element={<CrudInsumos />} />
          <Route path="Entradas" element={<CrudEntradas />} />
        </Route>
        
        <Route path="*" element={<Navigate to={isAuth ? "/" : "/login"} />} />
      </Routes>
    </>
  )
}  // ← Aquí cierra la función App

export default App  // ← El export va DESPUÉS de la función, no dentro