import apiAxios from "../api/axiosConfig.js"
import { useEffect, useState } from "react"
import DataTable from "react-data-table-component"
import Estado_solicitudForm from "./Estado_solicitudForm.jsx"

const Estados_solicitudCrud = () => {
    const [estados_solicitud, setEstados_solicitud] = useState([])
    const [selectedEstado_solicitud, setSelectedEstado_solicitud] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [refresh, setRefresh] = useState(false)

    const columnsTable = [
        { name: 'ID', selector: row => row.Id_estado_solicitud }, 
        { name: 'Solicitud', selector: row => row.Id_solicitud },
        { name: 'Estado', selector: row => row.Id_estado },
        { name: 'Fecha', selector: row => row.fecha },
        {
            name: 'Acción',
            cell: (row) => (
                <button
                    className="btn btn-dark btn-sm"
                    onClick={() => updateEstado_solicitud(row.Id_estado_solicitud)}
                >
                    <i className="fa-solid fa-utensils"></i>
                </button>
            )
        }
    ]

    useEffect(() => {
        getAllEstados_solicitud()
    }, [refresh])

    const getAllEstados_solicitud = async () => {
        try {
            const response = await apiAxios.get('/api/Estado_solicitud/')
            setEstados_solicitud(response.data)
        } catch (error) {
            console.error("Error al obtener estados_solicitud:", error)
        }
    }

    const updateEstado_solicitud = (Id_estado_solicitud) => {
        const estadoToUpdate = estados_solicitud.find(
            estado => estado.Id_estado_solicitud === Id_estado_solicitud        
        )

        console.log("Editar: ", estadoToUpdate)

        setSelectedEstado_solicitud(estadoToUpdate)
        setIsEditing(true)
        setShowModal(true)
    }

    const createEstado_solicitud = () => {
        setSelectedEstado_solicitud(null)
        setIsEditing(false)
        setShowModal(true)
    }

    const hideModal = () => {
        setShowModal(false)
        setRefresh(!refresh)
    }

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            setShowModal(false)
        }
    }
    // const newListSalidas = salidasInsumos.filter(salidasInsumos => {
    // const texToSearch = filterText.toLowerCase();

    // const almacen = salidasInsumos.Insumo?.Nom_almacen?.toLowerCase() ?? "";
    // const destino = salidasInsumos.Destino?.Nom_Destino?.toLowerCase() ?? "";
    // return almacen.includes(texToSearch) || destino.includes(texToSearch);
    // });

    return (
        <div className="container">
            <div className="row d-flex justify-content-between">
                <h2>Gestión de Estados x Solicitudes </h2>
                <button
                    type="button"
                    className="btn btn-dark"
                    onClick={createEstado_solicitud}
                >
                    Nuevo Estado
                </button>
            </div>

            <DataTable
                title="Listado de Estados x Solicitudes"
                columns={columnsTable}
                data={estados_solicitud}
                keyField="Id_estado_solicitud"
                pagination
                highlightOnHover
                striped
            />

            {showModal && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    onClick={handleBackdropClick}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title fs-5">
                                    {isEditing ? "Editar Registro" : "Nuevo Estado x Solicitud"}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-dark"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <Estado_solicitudForm  
                                    hideModal={hideModal}
                                    isEditing={isEditing}
                                    selectedEstado_solicitud={selectedEstado_solicitud}
                                    setRefresh={setRefresh}
                                    refresh={refresh}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Estados_solicitudCrud
