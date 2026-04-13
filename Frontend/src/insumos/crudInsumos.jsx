import { useState, useEffect } from "react";
import apiAxios from '../api/axiosConfig.js';
import DataTable from 'react-data-table-component';
import InsumosForm from './insumosForm.jsx';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const CrudInsumos = () => {

    const MySwal = withReactContent(Swal);
    const [insumos, setInsumos] = useState([]);
    const [filterText, setFilterText] = useState('');
    const [insumoEditando, setInsumoEditando] = useState(null);
    const [insumoDetalle, setInsumoDetalle] = useState(null);
    const [tipoDetalle, setTipoDetalle] = useState('disponible');
    const [vistaDetalle, setVistaDetalle] = useState(null);
    const [insumosEnSolicitud, setInsumosEnSolicitud] = useState({});
    const [cargandoSolicitudes, setCargandoSolicitudes] = useState(false);

    const cargarSolicitudesPendientes = async () => {
        setCargandoSolicitudes(true);
        try {

            const res = await apiAxios.get("/api/solicitudes/pendientes");
            const solicitudes = res.data;

            console.log('📋 Solicitudes pendientes cargadas:', solicitudes);

  
            const insumosTemp = {};

            solicitudes.forEach(sol => {

                const estado = (sol.ultimoEstado || '').toLowerCase();
                if (estado !== 'solicitado' && estado !== 'proceso') {
                    return; 
                }

         
                if (sol.insumos && sol.insumos.length > 0) {
                    sol.insumos.forEach(item => {
                     
                        const idInsumo = item.Id_insumos || item.id_insumo || item.insumo?.Id_Insumos;

                        if (!idInsumo) return;

                      
                        if (!insumosTemp[idInsumo]) {
                            insumosTemp[idInsumo] = {
                                total: 0,
                                lotes: []
                            };
                        }

                       
                        const cantidad = item.cantidad_solicitada || item.cantidad || 0;

                       
                        insumosTemp[idInsumo].total += cantidad;

                     
                        insumosTemp[idInsumo].lotes.push({
                            Id_Solicitud: sol.Id_solicitud,
                            Nom_Insumo: item.insumo?.Nom_Insumo || 'N/A',
                            cantidad: cantidad,
                            fecha_solicitud: sol.createdat || sol.Fec_solicitud,
                            Fec_entrega: sol.Fec_entrega,
                            responsable: sol.responsable?.Nom_Responsable || 'No asignado',
                            motivo: sol.motivo || 'No especificado',
                            estado: sol.ultimoEstado || 'solicitado'
                        });
                    });
                }
            });

            console.log('✅ Insumos en solicitudes pendientes:', insumosTemp);
            setInsumosEnSolicitud(insumosTemp);

        } catch (error) {
            console.error('❌ Error al cargar solicitudes pendientes:', error);
        } finally {
            setCargandoSolicitudes(false);
        }
    };

    const eliminarInsumo = async (id, nombre) => {
        const result = await MySwal.fire({
            title: '¿Eliminar insumo?',
            text: `¿Estás seguro de eliminar "${nombre}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
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

                getAllInsumos();

            } catch (error) {
                let mensaje = 'Error al eliminar';
                if (error.response?.status === 400) {
                    mensaje = error.response.data.error || 'No se puede eliminar';
                }

                MySwal.fire({
                    title: 'Error',
                    text: mensaje,
                    icon: 'error'
                });
            }
        }
    };

  
    const getStockEnSolicitud = (idInsumo) => {
        return insumosEnSolicitud[idInsumo]?.total || 0;
    };

    const getDetalleSolicitudes = (idInsumo) => {
        return insumosEnSolicitud[idInsumo]?.lotes || [];
    };

    
    const verLotesDisponibles = (row) => {
        setTipoDetalle('disponible');
        setInsumoDetalle(row);
    };

   
    const verLotesNoDisponibles = (row) => {
        setTipoDetalle('nodisponible');
        setInsumoDetalle(row);
    };

   
    const verStockEnSolicitud = (row) => {
        setTipoDetalle('ensolicitud');
        setInsumoDetalle(row);
    };

    const columns = [
        { name: "Id de Insumos", selector: row => row.Id_Insumos, sortable: true },
        { name: "Nombre del insumo", selector: row => row.Nom_Insumo, sortable: true },
        { name: "Tipo de insumo", selector: row => row.Tip_Insumo, sortable: true },
        { name: "Referencia del insumo", selector: row => row.Ref_Insumo, sortable: true },

        
        {
            name: "Stock disponible",
            cell: row => {
                const stockTotal = row.entradas
                    ?.filter(e => e.Estado === 'STOCK')
                    .reduce((acc, e) => acc + (e.Can_Inicial - e.Can_Salida), 0) || 0;

                const stockEnSolicitud = getStockEnSolicitud(row.Id_Insumos);
                const stockDisponible = stockTotal - stockEnSolicitud;

                return (
                    <button
                        className="btn btn-sm"
                        style={{
                            backgroundColor: '#1d334a',
                            color: 'white',
                            border: 'none',
                            minWidth: '40px',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#2a4a6e'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#1d334a'}
                        data-bs-toggle="modal"
                        data-bs-target="#modalDetalleLotes"
                        onClick={() => verLotesDisponibles(row)}
                    >
                        {stockDisponible}
                    </button>
                );
            },
            sortable: true,
            sortFunction: (a, b) => {
                const totalA = (a.entradas?.filter(e => e.Estado === 'STOCK').reduce((acc, e) => acc + (e.Can_Inicial - e.Can_Salida), 0) || 0) - getStockEnSolicitud(a.Id_Insumos);
                const totalB = (b.entradas?.filter(e => e.Estado === 'STOCK').reduce((acc, e) => acc + (e.Can_Inicial - e.Can_Salida), 0) || 0) - getStockEnSolicitud(b.Id_Insumos);
                return totalA - totalB;
            }
        },

      
        {
            name: "Stock en solicitud",
            cell: row => {
                const stockEnSolicitud = getStockEnSolicitud(row.Id_Insumos);
                const detalleSolicitudes = getDetalleSolicitudes(row.Id_Insumos);
                const numSolicitudes = detalleSolicitudes.length;

                if (stockEnSolicitud === 0) {
                    return <span className="text-muted">0</span>;
                }

                return (
                    <button
                        className="btn btn-sm position-relative"
                        style={{
                            backgroundColor: '#4169E1', 
                            color: 'white',
                            border: 'none',
                            minWidth: '40px',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#3158D3';
                            e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#4169E1';
                            e.target.style.transform = 'scale(1)';
                        }}
                        data-bs-toggle="modal"
                        data-bs-target="#modalDetalleLotes"
                        onClick={() => verStockEnSolicitud(row)}
                        title={`${stockEnSolicitud} unidades en ${numSolicitudes} solicitud(es) pendiente(s)`}
                    >
                        {stockEnSolicitud}
                        {numSolicitudes > 0 && (
                            <span
                                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                style={{ fontSize: '0.65rem' }}
                            >
                                {numSolicitudes}
                            </span>
                        )}
                    </button>
                );
            },
            sortable: true,
            sortFunction: (a, b) => {
                return getStockEnSolicitud(a.Id_Insumos) - getStockEnSolicitud(b.Id_Insumos);
            }
        },

       
        {
            name: "Stock Consumido",
            cell: row => {
                const total = row.entradas
                    ?.filter(e => e.Estado !== 'STOCK')
                    .reduce((acc, e) => acc + (e.Can_Inicial - e.Can_Salida), 0) || 0;

                return (
                    <button
                        className="btn btn-sm"
                        style={{
                            backgroundColor: total > 0 ? '#dc3545' : '#6c757d',
                            color: 'white',
                            border: 'none',
                            minWidth: '40px',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontWeight: 'bold',
                            cursor: total > 0 ? 'pointer' : 'default'
                        }}
                        data-bs-toggle="modal"
                        data-bs-target="#modalDetalleLotes"
                        onClick={() => total > 0 && verLotesNoDisponibles(row)}
                        disabled={total === 0}
                    >
                        <i className="fa-solid fa-eye"></i>
                    </button>
                );
            },
            sortable: true,
            sortFunction: (a, b) => {
                const totalA = a.entradas?.filter(e => e.Estado !== 'STOCK').reduce((acc, e) => acc + (e.Can_Inicial - e.Can_Salida), 0) || 0;
                const totalB = b.entradas?.filter(e => e.Estado !== 'STOCK').reduce((acc, e) => acc + (e.Can_Inicial - e.Can_Salida), 0) || 0;
                return totalA - totalB;
            }
        },

        
        {
            name: "Actualizar",
            cell: row => (
                <button
                    className="btn btn-sm btn-dark"
                    data-bs-toggle="modal"
                    data-bs-target="#modalInsumos"
                    onClick={() => setInsumoEditando(row)}
                >
                    <i className="fa-solid fa-pen-to-square"></i>
                </button>
            )
        },

       
        {
            name: "Eliminar",
            cell: row => (
                <button
                    className="btn btn-sm btn-danger"
                    onClick={() => eliminarInsumo(row.Id_Insumos, row.Nom_Insumo)}
                >
                    <i className="fa-solid fa-trash"></i>
                </button>
            )
        }
    ];

    useEffect(() => {
        getAllInsumos();
        cargarSolicitudesPendientes();
    }, []);

    const getAllInsumos = async () => {
        try {
            const response = await apiAxios.get('/api/insumos/con-lotes');
            setInsumos(response.data);
        } catch (error) {
            console.error('Error al obtener insumos:', error);
        }
    };

    const filteredInsumos = insumos.filter(insumo => {
        const textToSearch = filterText.toLowerCase();
        const nombre = insumo.Nom_Insumo?.toLowerCase() || '';
        const tipo = insumo.Tip_Insumo?.toLowerCase() || '';
        return nombre.includes(textToSearch) || tipo.includes(textToSearch);
    });

    const hideModal = () => {
        document.getElementById('closeModalInsumos')?.click();
        setInsumoEditando(null);
        getAllInsumos();
        cargarSolicitudesPendientes(); 
    };

    
    const lotesFiltrados = insumoDetalle?.entradas?.filter(ent => {
        if (tipoDetalle === 'disponible') {
            return ent.Estado === 'STOCK';
        } else if (tipoDetalle === 'nodisponible') {
            return ent.Estado !== 'STOCK';
        }
        return false;
    }) || [];

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
                    <div className="col-2">
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
                            <span>Detalle de {vistaDetalle.Nom_Insumo}</span>
                            <button
                                className="btn btn-light btn-sm"
                                onClick={() => setVistaDetalle(null)}
                            >
                                ← Volver
                            </button>
                        </div>
                        <div className="card-body">
                            {vistaDetalle.entradas?.filter(e => e.Estado !== 'STOCK').length === 0 ? (
                                <div className="alert alert-info">
                                    No hay lotes no disponibles
                                </div>
                            ) : (
                                <table className="table table-bordered">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Lote</th>
                                            <th>Cantidad</th>
                                            <th>Vence</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vistaDetalle.entradas
                                            .filter(e => e.Estado !== 'STOCK')
                                            .map(l => (
                                                <tr key={l.Id_Entradas}>
                                                    <td>{l.Lote}</td>
                                                    <td>{l.Can_Inicial - l.Can_Salida}</td>
                                                    <td>{l.Fec_Ven_Entrada}</td>
                                                    <td>
                                                        {l.Estado === 'AGOTADO' && (
                                                            <span className="badge bg-danger">Agotado</span>
                                                        )}
                                                        {l.Estado === 'VENCIDO' && (
                                                            <span className="badge bg-warning text-dark">Vencido</span>
                                                        )}
                                                        {l.Estado !== 'AGOTADO' && l.Estado !== 'VENCIDO' && (
                                                            <span className="badge bg-secondary">{l.Estado}</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* Modal de edición/creación */}
                <div className="modal fade" id="modalInsumos" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5">
                                    {insumoEditando ? 'Editar Insumo' : 'Agregar Nuevo Insumo'}
                                </h1>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    id="closeModalInsumos"
                                ></button>
                            </div>
                            <div className="modal-body">
                                <InsumosForm
                                    hideModal={hideModal}
                                    insumoParaEditar={insumoEditando}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal de detalle de lotes */}
                <div className="modal fade" id="modalDetalleLotes" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header" style={{
                                backgroundColor: tipoDetalle === 'ensolicitud' ? '#4169E1' :
                                    tipoDetalle === 'disponible' ? '#1d334a' : '#dc3545',
                                color: 'white'
                            }}>
                                <h5 className="modal-title">
                                    {tipoDetalle === 'disponible' && (
                                        <>📦 Lotes disponibles de {insumoDetalle?.Nom_Insumo}</>
                                    )}
                                    {tipoDetalle === 'nodisponible' && (
                                        <>📭 Lotes consumidos de {insumoDetalle?.Nom_Insumo}</>
                                    )}
                                    {tipoDetalle === 'ensolicitud' && (
                                        <>📋 Stock en solicitudes pendientes de {insumoDetalle?.Nom_Insumo}</>
                                    )}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    data-bs-dismiss="modal"
                                ></button>
                            </div>
                            <div className="modal-body">
                                {insumoDetalle && (
                                    <>
                                        {tipoDetalle === 'ensolicitud' ? (
                                            
                                            (() => {
                                                const detalleSolicitudes = getDetalleSolicitudes(insumoDetalle.Id_Insumos);
                                                const totalSolicitado = detalleSolicitudes.reduce((sum, s) => sum + s.cantidad, 0);

                                                return detalleSolicitudes.length > 0 ? (
                                                    <>
                                                        <div className="alert" style={{
                                                            backgroundColor: '#4169E1',
                                                            color: 'white'
                                                        }}>
                                                            <i className="fa-solid fa-info-circle me-2"></i>
                                                            <strong>Total en solicitudes pendientes:</strong> {totalSolicitado} unidades
                                                            <br />
                                                            <small>
                                                                Estas unidades están reservadas y serán descontadas cuando la solicitud sea despachada.
                                                            </small>
                                                        </div>

                                                        <div className="table-responsive">
                                                            <table className="table table-striped table-hover">
                                                                <thead style={{ backgroundColor: '#4169E1', color: 'white' }}>
                                                                    <tr>
                                                                        <th>Solicitud #</th>
                                                                        <th>Cantidad</th>
                                                                        <th>Fecha solicitud</th>
                                                                        <th>Entrega</th>
                                                                        <th>Responsable</th>
                                                                        <th>Motivo</th>
                                                                        <th>Estado</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {detalleSolicitudes.map((sol, idx) => (
                                                                        <tr key={idx}>
                                                                            <td>
                                                                                <span className="badge bg-dark">
                                                                                    #{sol.Id_Solicitud}
                                                                                </span>
                                                                            </td>
                                                                            <td>
                                                                                <strong style={{ color: '#4169E1' }}>
                                                                                    {sol.cantidad}
                                                                                </strong>
                                                                            </td>
                                                                            <td>
                                                                                {sol.fecha_solicitud
                                                                                    ? new Date(sol.fecha_solicitud).toLocaleDateString('es-CO')
                                                                                    : '—'}
                                                                            </td>
                                                                            <td>
                                                                                {sol.Fec_entrega
                                                                                    ? new Date(sol.Fec_entrega).toLocaleDateString('es-CO')
                                                                                    : '—'}
                                                                            </td>
                                                                            <td>{sol.responsable}</td>
                                                                            <td>{sol.motivo}</td>
                                                                            <td>
                                                                                {sol.estado === 'solicitado' && (
                                                                                    <span className="badge bg-warning text-dark">
                                                                                        <i className="fa-regular fa-clock me-1"></i>
                                                                                        Solicitado
                                                                                    </span>
                                                                                )}
                                                                                {sol.estado === 'proceso' && (
                                                                                    <span className="badge bg-primary">
                                                                                        <i className="fa-solid fa-gears me-1"></i>
                                                                                        En proceso
                                                                                    </span>
                                                                                )}
                                                                                {sol.estado !== 'solicitado' && sol.estado !== 'proceso' && (
                                                                                    <span className="badge bg-secondary">
                                                                                        {sol.estado}
                                                                                    </span>
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="alert alert-info">
                                                        <i className="fa-solid fa-circle-check me-2"></i>
                                                        No hay solicitudes pendientes para este insumo
                                                    </div>
                                                );
                                            })()
                                        ) : (
                        
                                            lotesFiltrados.length > 0 ? (
                                                <table className="table table-striped table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>Lote</th>
                                                            <th>Cantidad</th>
                                                            <th>Vencimiento</th>
                                                            <th>Proveedor</th>
                                                            <th>Estado</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {lotesFiltrados.map(ent => (
                                                            <tr key={ent.Id_Entradas}>
                                                                <td><strong>{ent.Lote}</strong></td>
                                                                <td>{ent.Can_Inicial - ent.Can_Salida}</td>
                                                                <td>
                                                                    {ent.Fec_Ven_Entrada
                                                                        ? new Date(ent.Fec_Ven_Entrada).toLocaleDateString('es-CO')
                                                                        : '—'}
                                                                </td>
                                                                <td>{ent.proveedor?.Nom_Proveedor || '—'}</td>
                                                                <td>
                                                                    {ent.Estado === 'STOCK' && (
                                                                        <span className="badge bg-success">Disponible</span>
                                                                    )}
                                                                    {ent.Estado === 'VENCIDO' && (
                                                                        <span className="badge bg-warning text-dark">Vencido</span>
                                                                    )}
                                                                    {ent.Estado === 'AGOTADO' && (
                                                                        <span className="badge bg-secondary">Agotado</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div className="alert alert-info">
                                                    {tipoDetalle === 'disponible'
                                                        ? 'No hay lotes disponibles para este insumo'
                                                        : 'No hay lotes no disponibles para este insumo'}
                                                </div>
                                            )
                                        )}
                                    </>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    data-bs-dismiss="modal"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CrudInsumos;