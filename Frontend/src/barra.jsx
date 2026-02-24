import React from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'

const Navbar = ({ isAuth, logout }) => {
    const navigate = useNavigate();

    const navClass = ({ isActive }) =>
        isActive ? 'nav-link active' : 'nav-link';

    const handleLogout = () => {
        logout(); // Llama a la función logout que viene de App.jsx
        navigate('/login');
    };

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
                        <li className="nav-item">
                            <NavLink to="/insumos" className={navClass}>
                                Insumos 
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/entradas" className={navClass}>
                                Entradas
                            </NavLink>
                        </li>
                        
                        {/* 🔴 SECCIÓN AGREGADA - Dropdown de usuario */}
                        {isAuth ? (
                            <li className="nav-item dropdown">
                                <a
                                    className="nav-link dropdown-toggle"
                                    href="#"
                                    role="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    Usuario
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <button 
                                            className="dropdown-item" 
                                            onClick={handleLogout}
                                        >
                                            Cerrar Sesión
                                        </button>
                                    </li>
                                </ul>
                            </li>
                        ) : (
                            <li className="nav-item">
                                <NavLink to="/login" className={navClass}>
                                    Iniciar Sesión
                                </NavLink>
                            </li>
                        )}
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
                    <button 
                        type="button" 
                        className="btn-close" 
                        data-bs-dismiss="offcanvas"
                        id="botonCerrarOffCanvas"
                    ></button>
                </div>

                <div className="offcanvas-body">
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
                        <div data-bs-dismiss="offcanvas">
                            <NavLink to="/insumos" className={navClass}>
                                Insumos
                            </NavLink>
                        </div>
                        <div data-bs-dismiss="offcanvas">
                            <NavLink to="/entradas" className={navClass}>
                                Entradas
                            </NavLink>
                        </div>
                        
                        {/* 🔴 También agregar logout en el offcanvas para móviles */}
                        {isAuth && (
                            <div className="mt-3 border-top pt-2">
                                <button 
                                    className="btn btn-outline-danger w-100"
                                    onClick={() => {
                                        handleLogout();
                                        // Cerrar offcanvas después de logout
                                        document.getElementById('botonCerrarOffCanvas')?.click();
                                    }}
                                >
                                    Cerrar Sesión
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <main className="container my-4">
                <Outlet />
            </main>
        </>
    );
}

export default Navbar;