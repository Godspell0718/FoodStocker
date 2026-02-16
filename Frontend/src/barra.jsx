import React from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'

export default function Barra() {
    const navClass = ({ isActive }) =>
        isActive ? 'nav-link active' : 'nav-link';

    return (
        <>

            <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">

                <Link className="navbar-brand" to="/">FoodStocker</Link>

                <button
                    className="btn btn-outline-light"
                    type="button"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#sidebarOffcanvas"
                >
                    ☰
                </button>

                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav ms-3">
                        <li className="nav-item">
                            <NavLink to="/Proveedores" className={navClass}>
                                Proveedores
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/Responsables" className={navClass}>
                                Responsables
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/destino" className={navClass}>
                                Destinos
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </nav>

            <div
                className="offcanvas offcanvas-start"
                tabIndex="-1"
                id="sidebarOffcanvas"
            >
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title">Menú</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
                </div>

                <div className="offcanvas-body">

                    {/*envolver NavLink para que Bootstrap cierre el menu correctamente */}
                    <div className="nav flex-column">

                        <div data-bs-dismiss="offcanvas">
                            <NavLink to="/Proveedores" className={navClass}>
                                Proveedores
                            </NavLink>
                        </div>

                        <div data-bs-dismiss="offcanvas">
                            <NavLink to="/Responsables" className={navClass}>
                                Responsables
                            </NavLink>
                        </div>

                        <div data-bs-dismiss="offcanvas">
                            <NavLink to="/destino" className={navClass}>
                                Destinos
                            </NavLink>
                        </div>

                    </div>
                </div>
            </div>

            <main className="container my-4">
                <Outlet />
            </main>
        </>
    );
}

