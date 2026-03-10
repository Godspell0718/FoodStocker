import apiAxios from "../api/axiosConfig.js"
import { useEffect, useState } from "react"
import DataTable from "react-data-table-component"
import SolicitudFormNuevo from "./SolicitudFormN.jsx"
import SolicitudForm from "./SolicitudForm.jsx"
import Swal from 'sweetalert2';

const SolicitudCrud = () => {
    const [solicitudes, setSolicitudes] = useState([])
    const [selectedSolicitud, setSelectedSolicitud] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [refresh, setRefresh] = useState(false)
    const [filterText, setFilterText] = useState("")
    const [idSolicitudActiva, setIdSolicitudActiva] = useState(null)  // ← NUEVO ESTADO

    const columnsTable = [
        { name: 'ID', selector: row => row.Id_solicitud },
        { name: 'Responsable', selector: row => row.responsable?.Nom_Responsable ?? "Sin responsable" },
        { name: 'Fecha Entrega', selector: row => row.Fec_entrega },
        { name: 'motivo', selector: row => row.motivo },
        { name: 'Fecha de solicitud', selector: row => row.createdat?.slice(0, 19) },
        {
            name: 'Accion',
            cell: (row) => (
                <div className="d-flex gap-1">
                    <button
                        className="btn btn-dark btn-sm"
                        onClick={() => updateSolicitud(row.Id_solicitud)}
                    >
                        <i className="fa-solid fa-utensils"></i>
                    </button>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteSolicitud(row.Id_solicitud)}
                    >
                        <i className="fa-solid fa-trash"></i>
                    </button>
                </div>
            )
        }
    ]

    useEffect(() => {
        getAllSolicitudes()
    }, [refresh])

    const getAllSolicitudes = async () => {
        try {
            const response = await apiAxios.get('/api/solicitudes/')
            setSolicitudes(response.data)
            console.log(response.data)
        } catch (error) {
            console.error("Error al obtener solicitudes:", error)
        }
    }

    const updateSolicitud = (Id_solicitud) => {
        const solicitudToUpdate = solicitudes.find(solicitud => solicitud.Id_solicitud === Id_solicitud)
        console.log("Actualizar solicitud: ", solicitudToUpdate)
        setSelectedSolicitud(solicitudToUpdate)
        setIsEditing(true)
        setShowModal(true)
    }

    const createSolicitud = () => {
        setSelectedSolicitud(null)
        setIsEditing(false)
        setShowModal(true)
    }
    const hideModal = () => {
        setShowModal(false)
        setRefresh(!refresh)
    }
    const deleteSolicitud = async (Id_solicitud) => {
        const confirm = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (confirm.isConfirmed) {
            await apiAxios.delete(`/api/solicitudes/${Id_solicitud}`);
            Swal.fire('Eliminado', 'La solicitud fue eliminada', 'success');
            setRefresh(!refresh);
        }
    }

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            setShowModal(false)
        }
    }

    // Nueva función para manejar el paso a selección de insumos
    const handleSiguiente = (idSolicitud) => {
        setIdSolicitudActiva(idSolicitud)
        setShowModal(false) // Cierra el modal del formulario
    }

    // Filtro
    const newListSolicitudes = solicitudes.filter(solicitud => {
        const textToSearch = filterText.toLowerCase()
        const responsable = solicitud.responsable?.Nom_Responsable?.toLowerCase() ?? ""
        const motivo = solicitud.motivo?.toLowerCase() ?? ""
        return responsable.includes(textToSearch) || motivo.includes(textToSearch)
    })

    // Si hay una solicitud activa, mostramos la pantalla de selección de insumos
    if (idSolicitudActiva) {
        return (
            <SeleccionInsumosSolicitud
                idSolicitud={idSolicitudActiva}
                onCompletado={() => {
                    setIdSolicitudActiva(null)
                    setRefresh(!refresh) // Recarga la lista de solicitudes
                }}
                onCancelar={() => setIdSolicitudActiva(null)}
            />
        )
    }

    // Vista principal del crud
    return (
        <div className="container mt-5">
            <div className="col-4" >
                <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por Responsable o motivo"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                />
            </div>
            <div className="row d-flex justify-content-between">
                <h2>Gestión de Solicitudes</h2>
                <button
                    type="button"
                    className="btn btn-dark"
                    onClick={createSolicitud}
                >
                    Nueva Solicitud
                </button>
            </div>

            <DataTable
                title="Listado de Solicitudes"
                columns={columnsTable}
                data={newListSolicitudes}
                keyField="Id_Solicitud"
                pagination
                highlightOnHover
                striped
            />

            {/* Modal con control React */}
            {showModal && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    onClick={handleBackdropClick}
                >
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title fs-5">
                                    {isEditing ? 'Editar Solicitud' : 'Nueva Solicitud'}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-dark"
                                    aria-label="Close"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {isEditing ? (
                                    <SolicitudForm
                                        hideModal={hideModal}
                                        isEditing={isEditing}
                                        selectedSolicitud={selectedSolicitud}
                                        setRefresh={setRefresh}
                                        refresh={refresh}
                                    />
                                ) : (
                                    <SolicitudFormNuevo
                                        hideModal={hideModal}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SolicitudCrud