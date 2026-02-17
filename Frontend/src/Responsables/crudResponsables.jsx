import { useState, useEffect } from "react"
import apiAxios from '../api/axiosConfig.js'
import DataTable from "react-data-table-component"
import ResponsablesForm from "./ResponsablesForm.jsx"

const CrudResponsables = () => {

    const [responsables, setResponsables] = useState([])
    const [filterText, setFilterText] = useState("")

    const [responsableSeleccionado, setResponsableSeleccionado] = useState(null)

    const columnsTable = [
        { name: "Nombre", selector: row => row.Nom_Responsable },
        { name: "Documento", selector: row => row.Doc_Responsable },
        { name: "Correo", selector: row => row.Cor_Responsable },
        { name: "Telefono", selector: row => row.Tel_Responsable },
        { name: "Tipo", selector: row => row.Tip_Responsable },
        {
            name: "Acciones",
            selector: row => (
                <button
                    className="btn btn-sm btn-dark"
                    data-bs-toggle="modal"
                    data-bs-target="#responsablesModal"
                    onClick={() => setResponsableSeleccionado(row)}
                >
                    <i className="fa-solid fa-utensils"></i>
                </button>
            )
        }
    ]

    useEffect(() => {
        getAllResponsables()
    }, [])

    const getAllResponsables = async () => {
        const response = await apiAxios.get('/api/responsables/')
        setResponsables(response.data)
    }

    const newListResponsables = responsables.filter(responsable => {
        const textToSearch = filterText.toLowerCase()
        const nombre = responsable.Nom_Responsable.toLowerCase()
        return nombre.includes(textToSearch)
    })

    const hideModal = () => {
        document.getElementById('closeModal').click()
        setResponsableSeleccionado(null) 
        getAllResponsables() 
    }

    return (
        <>
            <div className="container mt-5">
                <div className="row d-flex justify-content-between">
                    <div className="col-4">
                        <input
                            className="form-control"
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                        />
                    </div>
                    <div className="col-2">
                        <button
                            type="button"
                            className="btn btn-dark"
                            data-bs-toggle="modal"
                            data-bs-target="#responsablesModal"
                            id="closeModal"
                            onClick={() => setResponsableSeleccionado(null)} 
                        >
                            Nuevo
                        </button>
                    </div>
                </div>

                <DataTable
                    title="Responsables"
                    columns={columnsTable}
                    data={newListResponsables}
                    keyField="Id_Responsable"
                    pagination
                    highlightOnHover
                    striped
                />

                <div className="modal fade" id="responsablesModal" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5">Responsable</h1>
                                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                            </div>

                            <div className="modal-body">
                                {/* 🟦 PASAR RESPONSABLE AL FORM */}
                                <ResponsablesForm
                                    hideModal={hideModal}
                                    responsableSeleccionado={responsableSeleccionado}
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default CrudResponsables
