// src/components/NavBarOffCanvas.jsx
import React from "react";
import { Link, NavLink } from "react-router-dom";

const Barra_nav = () => {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">(Aqui voy a poner el logo)</Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasMenu"
            aria-controls="offcanvasMenu"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse d-none">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink to="/" className="nav-link" end>
                  Inicio
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/solicitudes" className="nav-link">
                  Solicitudes
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/Estado_solicitud" className="nav-link">
                  Estados de Solicitud
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/Estados" className="nav-link">
                  Estados
                </NavLink>
              </li>
              
            </ul>

            <div className="d-flex">
              <Link className="btn btn-outline-light me-2" to="/perfil">
                Perfil
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div
        className="offcanvas offcanvas-start"
        tabIndex="-1"
        id="offcanvasMenu"
        aria-labelledby="offcanvasMenuLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasMenuabLel">Menú</h5>
          <button
            type="button"
            className="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <div className="list-group">
            <NavLink
              to="/"
              end
              className="list-group-item list-ogrup-item-action"
              data-bs-dismiss="offcanvas"
            >
              Inicio
            </NavLink>

            <NavLink
              to="/solicitudes"
              className="list-group-item list-group-item-action"
              data-bs-dismiss="offcanvas"
            >
              Solicitudes 
            </NavLink>

          <NavLink
              to="/Estado_solicitud"
              className="list-group-item list-group-item-action"
              data-bs-dismiss="offcanvas"
            >
              Estados de Solicitud
            </NavLink>
            <NavLink
              to="/Estados"
              className="list-group-item list-group-item-action"
              data-bs-dismiss="offcanvas"
            >
              Estados
            </NavLink>

            <NavLink
              to="/perfil"
              className="list-group-item list-group-item-action mt-3"
              data-bs-dismiss="offcanvas"
            >
              Perfil
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
};

export default Barra_nav;
