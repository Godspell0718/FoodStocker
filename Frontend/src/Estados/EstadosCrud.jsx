import apiAxios from "../api/axiosConfig.js"
import { useEffect, useState } from "react"
import DataTable from "react-data-table-component"
import EstadoForm from "./EstadosForm.jsx"

const EstadosCrud = () => {
    const [Estados, setEstados] = useState([])
    const [selectedEstado, setSelectedEstado] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [refresh, setRefresh] = useState(false)

    const columnsTable = [
        { name: 'ID', selector: row => row.Id_estado },
        { name: 'Nombre', selector: row => row.nom_estado },
        {
            name: 'Acción',
            cell: (row) => (
                <button
                    className="btn btn-dark btn-sm"
                    onClick={() => updateEstado(row.Id_estado)}
                >
                    <i className="fa-solid fa-utensils"></i>
                </button>
            )
        }
    ]

    useEffect(() => {
        getAllEstados()
    }, [refresh])

    const getAllEstados = async () => {
        try {
            const response = await apiAxios.get('/api/Estados/')
            setEstados(response.data)
        } catch (error) {
            console.error("Error al obtener Estados:", error)
        }
    }

    const updateEstado = (Id_estado) => {
        const estadoToUpdate = Estados.find(
            estado => estado.Id_estado === Id_estado
        )

        console.log("Editar: ", estadoToUpdate)

        setSelectedEstado(estadoToUpdate)
        setIsEditing(true)
        setShowModal(true)
    }

   const createEstado = () => {
    setSelectedEstado(null)
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
                <h2>Estados </h2>
                <button
                    type="button"
                    className="btn btn-dark"
                    onClick={createEstado}
                >
                    Nuevo Estado
                </button>
            </div>

            <DataTable
                title="Listado de Estados"
                columns={columnsTable}
                data={Estados}
                keyField="Id_estado"
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
                                    {isEditing ? "Editar Registro" : "Nuevo Estado "}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-dark"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <EstadoForm
                                    hideModal={hideModal}
                                    isEditing={isEditing}
                                    selectedEstado={selectedEstado}
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

export default EstadosCrud
