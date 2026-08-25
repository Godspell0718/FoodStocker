import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from './context/authContext';

// VISTAS
import CrudResponsables from './Responsables/crudResponsables.jsx';
import CrudProveedores from './Proveedores/crudProveedores.jsx';
import CrudDestino from './destino/crudDestino.jsx';
import CrudInsumos from './insumos/crudInsumos.jsx';
import CrudEntradas from './entradas/crudEntradas.jsx';
import SolicitudCrud from './Solicitudes/SolicitudCrud.jsx';
import EstadoCrud from './Estados/EstadosCrud.jsx';
import Estados_solicitudCrud from './Estados_solicitud/Estado_solicitudCrud.jsx';
import Login from './home/Login';
import Home from './home/home.jsx';
import SolicitudConLotes from "./Solicitudes/SolicitudConLotes.jsx";
import SolicitudPendientes from "./Solicitudes/Solicitudpendientes.jsx";
import DashboardReportes from './Reportes/DashboardReportes.jsx';
import PerdidasCrud from './Reportes/PerdidasCrud.jsx';
import PerdidasForm from './Reportes/PerdidasForm.jsx';
const RutaProtegida = ({ children, rolesPermitidos = [] }) => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" />;

  const rol = user.rol?.trim();

  if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(rol)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  const { user } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('tokenFoodStocker');

    // simulación de validación
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

      {/* LOGIN */}
      <Route path="/login" element={<Login />} />

      {/* LAYOUT */}
      <Route
        path="/"
        element={user ? <Home /> : <Navigate to="/login" />}
      >

        {/* ACCESOS CONFIGURADOS SEGÚN EL ENTORNO DE ROLES NUEVOS */}
        <Route
          path="Proveedores"
          element={
            <RutaProtegida rolesPermitidos={["ADMIN"]}>
              <CrudProveedores />
            </RutaProtegida>
          }
        />

        <Route
          path="Responsables"
          element={
            <RutaProtegida rolesPermitidos={["ADMIN"]}>
              <CrudResponsables />
            </RutaProtegida>
          }
        />

        <Route
          path="Destino"
          element={
            <RutaProtegida rolesPermitidos={["ADMIN", "Pasante de agroindustria", "Instructor de agroindustria"]}>
              <CrudDestino />
            </RutaProtegida>
          }
        />

        <Route
          path="Estados"
          element={
            <RutaProtegida rolesPermitidos={["ADMIN", "Pasante de agroindustria", "Instructor de agroindustria"]}>
              <EstadoCrud />
            </RutaProtegida>
          }
        />

        <Route
          path="Estado_solicitud"
          element={
            <RutaProtegida rolesPermitidos={["ADMIN", "Pasante de agroindustria", "Instructor de agroindustria"]}>
              <Estados_solicitudCrud />
            </RutaProtegida>
          }
        />

        <Route
          path="Insumos"
          element={
            <RutaProtegida rolesPermitidos={["ADMIN", "Pasante de agroindustria", "Instructor de agroindustria"]}>
              <CrudInsumos />
            </RutaProtegida>
          }
        />

        <Route
          path="Entradas"
          element={
            <RutaProtegida rolesPermitidos={["ADMIN", "Pasante de agroindustria", "Instructor de agroindustria"]}>
              <CrudEntradas />
            </RutaProtegida>
          }
        />

        <Route
          path="Solicitudes"
          element={
            <RutaProtegida rolesPermitidos={["ADMIN", "Pasante de agroindustria", "Instructor de agroindustria"]}>
              <SolicitudCrud />
            </RutaProtegida>
          }
        />

        <Route
          path="Reportes"
          element={
            <RutaProtegida rolesPermitidos={["ADMIN", "Pasante de agroindustria", "Instructor de agroindustria"]}>
              <DashboardReportes />
            </RutaProtegida>
          }
        />

        <Route
          path="perdidas"
          element={
            <RutaProtegida rolesPermitidos={["ADMIN", "Pasante de agroindustria", "Instructor de agroindustria"]}>
              <PerdidasCrud />
            </RutaProtegida>
          }
        />

        <Route
          path="perdidas/nuevo"
          element={
            <RutaProtegida rolesPermitidos={["ADMIN", "Pasante de agroindustria", "Instructor de agroindustria"]}>
              <PerdidasForm />
            </RutaProtegida>
          }
        />

        <Route
          path="perdidas/editar/:id"
          element={
            <RutaProtegida rolesPermitidos={["ADMIN", "Pasante de agroindustria", "Instructor de agroindustria"]}>
              <PerdidasForm />
            </RutaProtegida>
          }
        />

        <Route
          path="solicitudes-pendientes"
          element={
            <RutaProtegida rolesPermitidos={["ADMIN", "Pasante de agroindustria", "Instructor de agroindustria"]}>
              <SolicitudPendientes />
            </RutaProtegida>
          }
        />

        <Route
          path="solicitud-nueva"
          element={
            <RutaProtegida rolesPermitidos={["ADMIN", "Pasante de agroindustria", "Instructor de agroindustria", "Pasante solicitante"]}>
              <SolicitudConLotes />
            </RutaProtegida>
          }
        />

      </Route>

      {/* FALLBACK */}
      <Route
        path="*"
        element={<Navigate to={user ? "/" : "/login"} />}
      />

    </Routes>
  );
}

export default App;