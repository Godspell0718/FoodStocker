// crudInsumos.jsx - Versión corregida
import { useState, useEffect } from "react";
import apiAxios from '../api/axiosConfig.js';
import DataTable from 'react-data-table-component';
import InsumosForm from './insumosForm.jsx';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import * as bootstrap from 'bootstrap';

const CrudInsumos = () => {

    const MySwal = withReactContent(Swal);
    const [insumos, setInsumos] = useState([]);
    const [filterText, setFilterText] = useState('');
    const [insumoEditando, setInsumoEditando] = useState(null);
    const [insumoDetalle, setInsumoDetalle] = useState(null);
    const [tipoDetalle, setTipoDetalle] = useState('disponible');
    const [vistaDetalle, setVistaDetalle] = useState(null);
    const [solicitudes, setSolicitudes] = useState([]);
    const [insumoSolicitudDetalle, setInsumoSolicitudDetalle] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0); // Para forzar refrescos

    useEffect(() => {
        getAllInsumos();
        cargarSolicitudesInsumos();
    }, [refreshKey]); // Se refresca cuando cambia refreshKey

    const getAllInsumos = async () => {
        try {
            const response = await apiAxios.get('/api/insumos/con-lotes');
            console.log('Datos recibidos del backend:', response.data); // Para depuración
            setInsumos(response.data);
        } catch (error) {
            console.error('Error al obtener insumos:', error);
        }
    };

    const cargarSolicitudesInsumos = async () => {
        try {
            const res = await apiAxios.get("/api/solicitudes/pendientes");
            const activas = res.data.filter(s =>
                s.ultimoEstado?.toLowerCase() === 'solicitado' ||
                s.ultimoEstado?.toLowerCase() === 'proceso'
            );
            setSolicitudes(activas);
        } catch (error) {
            console.error("Error al obtener solicitudes para conteo:", error);
        }
    };

    // Función para calcular stock disponible correctamente
    const calcularStockDisponible = (insumo) => {
        if (!insumo.entradas || !Array.isArray(insumo.entradas)) return 0;

        // Calcula el stock sumando todas las entradas ACTIVAS (no vencidas ni agotadas)
        const stockTotal = insumo.entradas
            .filter(entrada => {
                // Solo contar entradas en estado STOCK
                if (entrada.Estado !== 'STOCK') return false;

                // Opcional: Verificar que no esté vencida
                const fechaVenc = entrada.Fec_Ven_Entrada ? new Date(entrada.Fec_Ven_Entrada) : null;
                const hoy = new Date();
                if (fechaVenc && fechaVenc < hoy) return false;

                return true;
            })
            .reduce((acc, entrada) => {
                const disponible = (entrada.Can_Inicial || 0) - (entrada.Can_Salida || 0);
                return acc + Math.max(0, disponible);
            }, 0);

        return stockTotal;
    };

    const obtenerConteoYLista = (idInsumo) => {
        const listaParaModal = [];
        let acumuladoSolicitado = 0;

        solicitudes.forEach(sol => {
            if (sol.insumos && Array.isArray(sol.insumos)) {
                sol.insumos.forEach(item => {
                    if (item.Id_insumos === idInsumo || item.id_insumo === idInsumo) {
                        acumuladoSolicitado += item.cantidad_solicitada;
                        listaParaModal.push({
                            id: sol.Id_solicitud,
                            cantidad: item.cantidad_solicitada,
                            estado: sol.ultimoEstado,
                            responsable: sol.responsable?.Nom_Responsable || 'N/A'
                        });
                    }
                });
            }
        });
        return { acumuladoSolicitado, listaParaModal };
    };

    const eliminarInsumo = async (id, nombre) => {
        const result = await MySwal.fire({
            title: '¿Eliminar insumo?',
            text: `¿Estás seguro de eliminar "${nombre}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#236099',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await apiAxios.delete(`/api/insumos/${id}`);
                MySwal.fire({
                    title: 'Eliminado',
                    text: 'Insumo eliminado correctamente',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                setRefreshKey(prev => prev + 1); // Refrescar después de eliminar
            } catch (error) {
                let mensaje = 'Error al eliminar el insumo';
                if (error.response && error.response.status === 400) {
                    mensaje = error.response.data.error || 'No se puede eliminar el insumo porque tiene registros asociados.';
                }
                MySwal.fire({ title: 'Error', text: mensaje, icon: 'error' });
            }
        }
    };

    const columns = [
        { name: "Id de Insumos", selector: row => row.Id_Insumos, sortable: true },
        { name: "Nombre del insumo", selector: row => row.Nom_Insumo, sortable: true },
        { name: "Tipo de insumo", selector: row => row.Tip_Insumo, sortable: true },
        { name: "Referencia del insumo", selector: row => row.Ref_Insumo, sortable: true },
        {
            name: "Stock disponible",
            cell: row => {
                const stockTotal = calcularStockDisponible(row);
                return (
                    <button
                        className="btn btn-sm"
                        style={{ backgroundColor: '#1d334a', color: 'white', border: 'none', minWidth: '40px', borderRadius: '4px', padding: '4px 8px', fontWeight: 'bold' }}
                        data-bs-toggle="modal"
                        data-bs-target="#modalDetalleLotes"
                        onClick={() => {
                            setTipoDetalle('disponible');
                            setInsumoDetalle(row);
                        }}
                    >
                        {stockTotal}
                    </button>
                );
            },
            sortable: true,
            sortFunction: (a, b) => {
                const stockA = calcularStockDisponible(a);
                const stockB = calcularStockDisponible(b);
                return stockA - stockB;
            }
        },
        {
            name: "Stock en solicitud",
            cell: row => {
                const { acumuladoSolicitado, listaParaModal } = obtenerConteoYLista(row.Id_Insumos);
                return (
                    <button
                        className="btn btn-sm text-white fw-bold"
                        style={{ backgroundColor: '#D1C661', minWidth: '40px', borderRadius: '4px', border: 'none' }}
                        onClick={() => {
                            setInsumoSolicitudDetalle({ nombre: row.Nom_Insumo, datos: listaParaModal });
                            const modal = new bootstrap.Modal(document.getElementById('modalDetalleSolicitudes'));
                            modal.show();
                        }}
                    >
                        {acumuladoSolicitado}
                    </button>
                );
            }
        },
        {
            name: "Stock Consumido",
            cell: row => {
                const consumido = row.entradas?.reduce((acc, e) => {
                    if (e.Estado === 'AGOTADO' || e.Estado === 'VENCIDO') {
                        return acc + (e.Can_Inicial - e.Can_Salida);
                    }
                    return acc;
                }, 0) || 0;

                return (
                    <button
                        className="btn btn-sm"
                        style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', minWidth: '40px', borderRadius: '4px' }}
                        onClick={() => setVistaDetalle(row)}
                    >
                        {consumido}
                    </button>
                );
            }
        },
        {
            name: "Actualizar",
            cell: row => (
                <button className="btn btn-sm btn-dark" data-bs-toggle="modal" data-bs-target="#modalInsumos" onClick={() => setInsumoEditando(row)}>
                    <i className="fa-solid fa-pen-to-square"></i>
                </button>
            )
        },
        {
            name: "Eliminar",
            cell: row => (
                <button className="btn btn-sm btn-danger" onClick={() => eliminarInsumo(row.Id_Insumos, row.Nom_Insumo)}>
                    <i className="fa-solid fa-trash"></i>
                </button>
            )
        }
    ];

    const filteredInsumos = insumos.filter(insumo => {
        const textToSearch = filterText.toLowerCase();
        return insumo.Nom_Insumo?.toLowerCase().includes(textToSearch) ||
            insumo.Tip_Insumo?.toLowerCase().includes(textToSearch);
    });

    const hideModal = () => {
        const closeModalBtn = document.getElementById('closeModalInsumos');
        if (closeModalBtn) closeModalBtn.click();
        setInsumoEditando(null);
        setRefreshKey(prev => prev + 1); // Refrescar después de cerrar el modal
    };

    return (
        <>
            <div className="container mt-5">
                <div className="row d-flex justify-content-between align-items-center mb-3">
                    <div className="col-4">
                        <input
                            className="form-control"
                            placeholder="Buscar por nombre o tipo..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                        />
                    </div>
                    <div className="col-2 text-end">
                        <button
                            type="button"
                            className="btn btn-dark"
                            data-bs-toggle="modal"
                            data-bs-target="#modalInsumos"
                            onClick={() => setInsumoEditando(null)}
                        >
                            Agregar Insumo
                        </button>
                    </div>
                </div>

                {!vistaDetalle ? (
                    <DataTable
                        title="Lista de Insumos"
                        columns={columns}
                        data={filteredInsumos}
                        keyField="Id_Insumos"
                        pagination
                        highlightOnHover
                        striped
                        responsive
                    />
                ) : (
                    <div className="card shadow">
                        <div className="card-header bg-dark text-white d-flex justify-content-between">
                            <span>Detalle de lotes consumidos: {vistaDetalle.Nom_Insumo}</span>
                            <button className="btn btn-light btn-sm" onClick={() => setVistaDetalle(null)}>← Volver</button>
                        </div>
                        <div className="card-body">
                            {vistaDetalle.entradas?.filter(e => e.Estado !== 'STOCK').length === 0 ? (
                                <div className="alert alert-info text-center">No hay registros de lotes agotados o vencidos para este insumo.</div>
                            ) : (
                                <table className="table table-bordered table-hover">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>ID Entrada</th>
                                            <th>Lote</th>
                                            <th>Cant. Inicial</th>
                                            <th>Cant. Salida</th>
                                            <th>Cant. Restante</th>
                                            <th>Vencimiento</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vistaDetalle.entradas
                                            .filter(e => e.Estado !== 'STOCK')
                                            .map(l => (
                                                <tr key={l.Id_Entradas}>
                                                    <td>{l.Id_Entradas}</td>
                                                    <td>{l.Lote}</td>
                                                    <td>{l.Can_Inicial}</td>
                                                    <td>{l.Can_Salida}</td>
                                                    <td>{(l.Can_Inicial || 0) - (l.Can_Salida || 0)}</td>
                                                    <td>{l.Fec_Ven_Entrada || 'N/A'}</td>
                                                    <td>
                                                        <span className={`badge ${l.Estado === 'AGOTADO' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                                            {l.Estado}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* MODAL FORMULARIO */}
                <div className="modal fade" id="modalInsumos" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5">{insumoEditando ? 'Editar Insumo' : 'Agregar Nuevo Insumo'}</h1>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" id="closeModalInsumos"></button>
                            </div>
                            <div className="modal-body">
                                <InsumosForm
                                    hideModal={hideModal}
                                    insumoParaEditar={insumoEditando}
                                    onSuccess={() => setRefreshKey(prev => prev + 1)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODAL PARA VER DETALLE DE LAS SOLICITUDES */}
                <div className="modal fade" id="modalDetalleSolicitudes" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header" style={{ backgroundColor: 'black', color: 'white' }}>
                                <h5 className="modal-title">Solicitudes Pendientes: {insumoSolicitudDetalle?.nombre}</h5>
                                <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                            <div className="modal-body">
                                {insumoSolicitudDetalle?.datos.length > 0 ? (
                                    <table className="table table-striped table-hover">
                                        <thead>
                                            <tr>
                                                <th># Solicitud</th>
                                                <th>Cantidad</th>
                                                <th>Responsable</th>
                                                <th>Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {insumoSolicitudDetalle.datos.map((s, i) => (
                                                <tr key={i}>
                                                    <td>{s.id}</td>
                                                    <td className="fw-bold">{s.cantidad}</td>
                                                    <td>{s.responsable}</td>
                                                    <td><span className="badge bg-primary">{s.estado}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="alert alert-info">No hay solicitudes activas para este insumo.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODAL DETALLE LOTES DISPONIBLES */}
                <div className="modal fade" id="modalDetalleLotes" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Lotes disponibles de: {insumoDetalle?.Nom_Insumo}</h5>
                                <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                            <div className="modal-body">
                                {insumoDetalle?.entradas?.filter(ent => ent.Estado === 'STOCK').length > 0 ? (
                                    <table className="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>ID Entrada</th>
                                                <th>Lote</th>
                                                <th>Cant. Inicial</th>
                                                <th>Cant. Salida</th>
                                                <th>Cant. Disponible</th>
                                                <th>Vencimiento</th>
                                                <th>Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {insumoDetalle.entradas
                                                .filter(ent => ent.Estado === 'STOCK')
                                                .map(ent => {
                                                    const disponible = (ent.Can_Inicial || 0) - (ent.Can_Salida || 0);
                                                    return (
                                                        <tr key={ent.Id_Entradas}>
                                                            <td>{ent.Id_Entradas}</td>
                                                            <td>{ent.Lote}</td>
                                                            <td>{ent.Can_Inicial}</td>
                                                            <td>{ent.Can_Salida}</td>
                                                            <td className="fw-bold text-success">{disponible}</td>
                                                            <td>{ent.Fec_Ven_Entrada || 'N/A'}</td>
                                                            <td><span className="badge bg-success">En Stock</span></td>
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="alert alert-info">
                                        No hay lotes disponibles para este insumo
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CrudInsumos;