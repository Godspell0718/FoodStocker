// crudInsumos.jsx
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
    const [tipoDetalle, setTipoDetalle] = useState('disponible'); // 'disponible' o 'nodisponible'
    const [vistaDetalle, setVistaDetalle] = useState(null);

    // 🆕 ESTADOS PARA LA FUNCIONALIDAD DE SOLICITUDES
    const [solicitudes, setSolicitudes] = useState([]);
    const [insumoSolicitudDetalle, setInsumoSolicitudDetalle] = useState(null);

    useEffect(() => {
        getAllInsumos();
        cargarSolicitudes();
    }, []);

    const getAllInsumos = async () => {
        try {
            const response = await apiAxios.get('/api/insumos/con-lotes');
            setInsumos(response.data);
        } catch (error) {
            console.error('Error al obtener insumos:', error);
        }
    };

    // 🆕 CARGAR SOLICITUDES PENDIENTES
    const cargarSolicitudes = async () => {
        try {
            const res = await apiAxios.get("/api/solicitudes/pendientes");
            const filtradas = res.data.filter(s => 
                ['solicitado', 'proceso'].includes(s.ultimoEstado?.toLowerCase())
            );
            setSolicitudes(filtradas);
        } catch (error) {
            console.error("Error cargando solicitudes:", error);
        }
    };

    // 🆕 LÓGICA DE CONTEO PARA LA COLUMNA
    const getInfoSolicitudes = (idInsumo) => {
        const lista = [];
        let total = 0;
        solicitudes.forEach(sol => {
            (sol.insumos || []).forEach(item => {
                if (item.Id_insumos === idInsumo || item.id_insumo === idInsumo) {
                    total += item.cantidad_solicitada;
                    lista.push({ ...sol, cantEsp: item.cantidad_solicitada });
                }
            });
        });
        return { total, lista };
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
                MySwal.fire({ title: 'Error', text: mensaje, icon: 'error' });
            }
        }
    };

    const verLotesDisponibles = (row) => {
        setTipoDetalle('disponible');
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
                const total = row.entradas
                    ?.filter(e => e.Estado === 'STOCK')
                    .reduce((acc, e) => acc + (e.Can_Inicial - e.Can_Salida), 0) || 0;
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
                        data-bs-toggle="modal"
                        data-bs-target="#modalDetalleLotes"
                        onClick={() => verLotesDisponibles(row)}
                    >
                        {total}
                    </button>
                );
            },
            sortable: true
        },
        // 🆕 COLUMNA SOLICITUDES (Ubicada entre disponible y consumido)
        {
            name: "Stock en solicitud",
            cell: row => {
                const { total, lista } = getInfoSolicitudes(row.Id_Insumos);
                return (
                    <button 
                        className="btn btn-sm text-white fw-bold" 
                        style={{ backgroundColor: '#4169E1', minWidth: '40px', borderRadius: '4px', border: 'none' }}
                        onClick={() => {
                            setInsumoSolicitudDetalle({ nombre: row.Nom_Insumo, lista });
                            const modal = new bootstrap.Modal(document.getElementById('modalDetalleSolicitudes'));
                            modal.show();
                        }}
                    >
                        {total}
                    </button>
                );
            }
        },
        {
            name: "Stock Consumido",
            cell: row => (
                <button
                    className="btn btn-sm"
                    style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        minWidth: '40px',
                        borderRadius: '4px',
                        padding: '4px 8px'
                    }}
                    onClick={() => setVistaDetalle(row)}
                >
                    <i className="fa-solid fa-eye"></i>
                </button>
            )
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

    const filteredInsumos = insumos.filter(insumo => {
        const textToSearch = filterText.toLowerCase();
        return (
            insumo.Nom_Insumo?.toLowerCase().includes(textToSearch) ||
            insumo.Tip_Insumo?.toLowerCase().includes(textToSearch)
        );
    });

    const hideModal = () => {
        document.getElementById('closeModalInsumos').click();
        setInsumoEditando(null);
        getAllInsumos();
        cargarSolicitudes();
    };

    const lotesFiltrados = insumoDetalle?.entradas?.filter(ent => ent.Estado === 'STOCK') || [];

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
                            <span>Detalle de {vistaDetalle.Nom_Insumo}</span>
                            <button className="btn btn-light btn-sm" onClick={() => setVistaDetalle(null)}>← Volver</button>
                        </div>
                        <div className="card-body">
                            {vistaDetalle.entradas?.filter(e => e.Estado !== 'STOCK').length === 0 ? (
                                <div className="alert alert-info">No hay lotes no disponibles</div>
                            ) : (
                                <table className="table table-bordered">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Lote</th><th>Cantidad</th><th>Vence</th><th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vistaDetalle.entradas.filter(e => e.Estado !== 'STOCK').map(l => (
                                            <tr key={l.Id_Entradas}>
                                                <td>{l.Lote}</td>
                                                <td>{l.Can_Inicial - l.Can_Salida}</td>
                                                <td>{l.Fec_Ven_Entrada}</td>
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

                {/* MODAL EDITAR/AGREGAR */}
                <div className="modal fade" id="modalInsumos" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5">{insumoEditando ? 'Editar Insumo' : 'Agregar Nuevo Insumo'}</h1>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" id="closeModalInsumos"></button>
                            </div>
                            <div className="modal-body">
                                <InsumosForm hideModal={hideModal} insumoParaEditar={insumoEditando} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🆕 MODAL DE SOLICITUDES */}
                <div className="modal fade" id="modalDetalleSolicitudes" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header" style={{ backgroundColor: '#4169E1', color: 'white' }}>
                                <h5 className="modal-title">Solicitudes de: {insumoSolicitudDetalle?.nombre}</h5>
                                <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                            <div className="modal-body">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th># Solicitud</th><th>Cantidad</th><th>Responsable</th><th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {insumoSolicitudDetalle?.lista.map((s, i) => (
                                            <tr key={i}>
                                                <td>{s.Id_solicitud}</td>
                                                <td className="fw-bold">{s.cantEsp}</td>
                                                <td>{s.responsable?.Nom_Responsable}</td>
                                                <td><span className="badge bg-primary">{s.ultimoEstado}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODAL DETALLE LOTES DISPONIBLES */}
                <div className="modal fade" id="modalDetalleLotes" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Lotes disponibles de {insumoDetalle?.Nom_Insumo}</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div className="modal-body">
                                <table className="table table-striped">
                                    <thead>
                                        <tr><th>Lote</th><th>Cantidad</th><th>Vencimiento</th><th>Estado</th></tr>
                                    </thead>
                                    <tbody>
                                        {lotesFiltrados.map(ent => (
                                            <tr key={ent.Id_Entradas}>
                                                <td>{ent.Lote}</td>
                                                <td>{ent.Can_Inicial - ent.Can_Salida}</td>
                                                <td>{ent.Fec_Ven_Entrada ? new Date(ent.Fec_Ven_Entrada).toLocaleDateString() : '—'}</td>
                                                <td><span className="badge bg-success">Disponible</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CrudInsumos;