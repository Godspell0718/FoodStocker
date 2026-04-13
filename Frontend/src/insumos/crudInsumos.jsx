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

    // Función para abrir modal con lotes disponibles
    const verLotesDisponibles = (row) => {
        setTipoDetalle('disponible');
        setInsumoDetalle(row);
    };

    // Función para abrir modal con lotes no disponibles
    const verLotesNoDisponibles = (row) => {
        setTipoDetalle('nodisponible');
        setInsumoDetalle(row);
    };

    const columns = [
        { name: "Id de Insumos", selector: row => row.Id_Insumos, sortable: true },
        { name: "Nombre del insumo", selector: row => row.Nom_Insumo, sortable: true },
        { name: "Tipo de insumo", selector: row => row.Tip_Insumo, sortable: true },
        { name: "Referencia del insumo", selector: row => row.Ref_Insumo, sortable: true },

        // 🆕 COLUMNA 1: Stock disponible (antes "Stock total")
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
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#2a4a6e'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#1d334a'}
                        data-bs-toggle="modal"
                        data-bs-target="#modalDetalleLotes"
                        onClick={() => verLotesDisponibles(row)}
                    >
                        {total}
                    </button>
                );
            },
            sortable: true,
            sortFunction: (a, b) => {
                const totalA = a.entradas
                    ?.filter(e => e.Estado === 'STOCK')
                    .reduce((acc, e) => acc + (e.Can_Inicial - e.Can_Salida), 0) || 0;
                const totalB = b.entradas
                    ?.filter(e => e.Estado === 'STOCK')
                    .reduce((acc, e) => acc + (e.Can_Inicial - e.Can_Salida), 0) || 0;
                return totalA - totalB;
            }
        },

        // 🆕 COLUMNA 2: Stock no disponible (dañados/vencidos)
        {
            name: "Stock Consumido",
            cell: row => {
                const total = row.entradas
                    ?.filter(e => e.Estado !== 'STOCK')
                    .reduce((acc, e) => acc + (e.Can_Inicial - e.Can_Salida), 0) || 0;

                // Si hay stock no disponible, mostrar botón rojo con ojo
                return (
                    <button
                        className="btn btn-sm"
                        style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            minWidth: '40px',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}

                        onClick={() => setVistaDetalle(row)}
                    >
                        <i className="fa-solid fa-eye"></i>  {/* ← CAMBIADO: ahora muestra el ojo */}
                    </button>
                );
            }
        },


        {
            sortable: true,
            sortFunction: (a, b) => {
                const totalA = a.entradas
                    ?.filter(e => e.Estado !== 'STOCK')
                    .reduce((acc, e) => acc + (e.Can_Inicial - e.Can_Salida), 0) || 0;
                const totalB = b.entradas
                    ?.filter(e => e.Estado !== 'STOCK')
                    .reduce((acc, e) => acc + (e.Can_Inicial - e.Can_Salida), 0) || 0;
                return totalA - totalB;
            }
        },

        // Columna Actualizar (existente)
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

        // Columna Eliminar (existente)
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

        return (
            nombre.includes(textToSearch) ||
            tipo.includes(textToSearch)
        );
    });

    const hideModal = () => {
        document.getElementById('closeModalInsumos').click();
        setInsumoEditando(null);
        getAllInsumos();
    };

    // Filtrar lotes según el tipo de detalle
    const lotesFiltrados = insumoDetalle?.entradas?.filter(ent => {
        if (tipoDetalle === 'disponible') {
            return ent.Estado === 'STOCK';
        } else {
            return ent.Estado !== 'STOCK';
        }
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
                {/* Modal existente de edición/creación */}
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

                {/* 🆕 MODAL MEJORADO: Detalle de lotes (disponibles o no disponibles) */}
                <div className="modal fade" id="modalDetalleLotes" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {tipoDetalle === 'disponible' ? 'Lotes disponibles' : 'Lotes no disponibles'}
                                    {' '}de {insumoDetalle?.Nom_Insumo}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                ></button>
                            </div>
                            <div className="modal-body">
                                {insumoDetalle && (
                                    <>
                                        {lotesFiltrados.length > 0 ? (
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
                                                    : 'Si hay lotes no disponibles para este insumo'}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

export default CrudInsumos;