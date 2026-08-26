import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from './context/authContext';

// --- VISTAS PROTEGIDAS ---
import CrudResponsables from './Responsables/crudResponsables';
import CrudProveedores from './Proveedores/crudProveedores';
import CrudDestino from './Destino/crudDestino';
import CrudInsumos from './insumos/crudInsumos.jsx';
import CrudEntradas from './entradas/crudEntradas.jsx';
import SolicitudCrud from './Solicitudes/SolicitudCrud.jsx';
import EstadoCrud from './Estados/EstadosCrud.jsx';
import Estados_solicitudCrud from './Estados_solicitud/Estado_solicitudCrud.jsx';
import Login from './home/Login';
import Home from './home/home.jsx';
import Inicio from './home/inicio.jsx';
import SolicitudConLotes from "./Solicitudes/SolicitudConLotes.jsx";
import SolicitudPendientes from "./Solicitudes/Solicitudpendientes.jsx";
import DashboardReportes from './Reportes/DashboardReportes.jsx';

// --- VISTAS PÚBLICAS (SEPARADAS) ---
import InicioPublico from './home/beforeLogin/inicioPublico.jsx';
import QuienesSomos from './home/beforeLogin/quienesSomos.jsx';
import ContactoPublico from './home/beforeLogin/contactoPublico.jsx';
import DocumentosPublicos from './home/beforeLogin/documentosPublicos.jsx';

// Lógica de protección: si se cierra sesión, reenvía a /login
const RutaProtegida = ({ children, rolesPermitidos = [] }) => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" replace />;

  const rol = user.rol?.trim();

  if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(rol)) {
    return <Navigate to="/Inicio" replace />;
  }

  return children;
};

function App() {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('tokenFoodStocker');
    if (stored) {
      console.log("Token encontrado");
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="tw-min-h-screen tw-flex tw-flex-col tw-items-center tw-justify-center tw-bg-slate-950 tw-gap-4">
        <div className="tw-w-10 tw-h-10 tw-border-4 tw-border-slate-700 tw-border-t-white tw-rounded-full tw-animate-spin"></div>
        <p className="tw-text-slate-400 tw-text-sm tw-font-medium">
          Cargando FoodStocker...
        </p>
      </div>
    );
  }

  return (
    <Routes>
      
      {/* ================================================= */}
      {/* RUTAS PÚBLICAS (Antes del Login)                  */}
      {/* Si hay sesión activa, redirigen automáticamente   */}
      {/* ================================================= */}
      <Route 
        path="/" 
        element={user ? <Navigate to="/Inicio" replace /> : <InicioPublico />} 
      />
      <Route 
        path="/quienes-somos" 
        element={user ? <Navigate to="/Inicio" replace /> : <QuienesSomos />} 
      />
      <Route 
        path="/contacto" 
        element={user ? <Navigate to="/Inicio" replace /> : <ContactoPublico />} 
      />
      <Route 
        path="/documentos" 
        element={user ? <Navigate to="/Inicio" replace /> : <DocumentosPublicos />} 
      />

      {/* LOGIN: Si hay sesión activa, bloquea el acceso y lo manda al Inicio */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/Inicio" replace /> : <Login />} 
      />

      {/* ================================================= */}
      {/* LAYOUT Y RUTAS PROTEGIDAS                         */}
      {/* ================================================= */}
      <Route element={<RutaProtegida><Home /></RutaProtegida>}>
        
        {/* TODOS LOS ROLES PERMITIDOS */}
        <Route path="/Inicio" element={<Inicio />} />
        <Route path="/Insumos" element={<CrudInsumos />} />
        <Route path="/Entradas" element={<CrudEntradas />} />
        <Route path="/Solicitudes" element={<SolicitudCrud />} />
        <Route path="/Reportes" element={<DashboardReportes />} />
        <Route path="/solicitudes-pendientes" element={<SolicitudPendientes />} />
        <Route path="/solicitud-nueva" element={<SolicitudConLotes />} />

        {/* ADMIN / IA */}
        <Route
          path="/Proveedores"
          element={
            <RutaProtegida rolesPermitidos={["ADMIN", "IA"]}>
              <CrudProveedores />
            </RutaProtegida>
          }
        />
        <Route
          path="/Responsables"
          element={
            <RutaProtegida rolesPermitidos={["ADMIN", "IA"]}>
              <CrudResponsables />
            </RutaProtegida>
          }
        />

        {/* SOLO ADMIN */}
        <Route
          path="/Destino"
          element={
            <RutaProtegida rolesPermitidos={["ADMIN"]}>
              <CrudDestino />
            </RutaProtegida>
          }
        />
        <Route
          path="/Estados"
          element={
            <RutaProtegida rolesPermitidos={["ADMIN"]}>
              <EstadoCrud />
            </RutaProtegida>
          }
        />
        <Route
          path="/Estado_solicitud"
          element={
            <RutaProtegida rolesPermitidos={["ADMIN"]}>
              <Estados_solicitudCrud />
            </RutaProtegida>
          }
        />
      </Route>

      {/* FALLBACK: Si escribe una URL que no existe, evalúa si está logueado o no */}
      <Route
        path="*"
        element={<Navigate to={user ? "/Inicio" : "/login"} replace />}
      />

    </Routes>
  );
}

export default App;