<<<<<<< HEAD
import Barra from './barra.jsx'
import { Routes, Route, Navigate } from 'react-router-dom'
import CrudResponsables from './Responsables/crudResponsables'
import CrudProveedores from './Proveedores/crudProveedores'
import CrudDestino from './Destino/crudDestino'
import CrudInsumos from './insumos/crudInsumos.jsx'
import CrudEntradas from './entradas/crudEntradas.jsx';

function App() {

  return (
    <Routes>

    
      <Route path="/" element={<Barra />}>

        <Route index element={<Navigate to="/Proveedores" />} />

        <Route path="Proveedores" element={<CrudProveedores />} />
        <Route path="Responsables" element={<CrudResponsables />} />
        <Route path="Destino" element={<CrudDestino />} />
        <Route path="Insumos" element={<CrudInsumos />} />
        <Route path="Entradas" element={<CrudEntradas />} />

      </Route>

    </Routes>
  )
}

export default App


=======
import { Routes, Route } from "react-router-dom";
import SolicitudCrud from "./Solicitudes/SolicitudCrud.jsx";
import Estado_solicitudCrud from "./Estados_solicitud/Estado_solicitudCrud.jsx";

import Barra_nav from "./Componentes/Barra_nav.jsx";
import Home from "./Componentes/Home.jsx";
import Perfil from "./Componentes/perfil.jsx";
import EstadosCrud from "./Estados/EstadosCrud.jsx";

function App() {
  return (
    <>
      <Barra_nav />

      <main className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/solicitudes" element={<SolicitudCrud />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/Estado_solicitud" element={<Estado_solicitudCrud />} />
          <Route path="/Estados" element={<EstadosCrud />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
>>>>>>> 6172372 (Realice mis tablas Solicitud, Estados y Estados_Solicitud)
