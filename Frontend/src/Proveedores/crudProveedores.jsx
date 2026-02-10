import { useState, useEffect } from "react"
import apiAxios from '../api/axiosConfig.js'
import DataTable from "react-data-table-component"
import ProveedoresForm from "./ProveedoresForm.jsx"

const CrudProveedores = () => {

    const [proveedores, setProveedores] = useState([])
    const [filterText, setFilterText] = useState("")
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null)

    const columnsTable = [
        { name: "Nombre", selector: row => row.Nom_Proveedor },
        { name: "Razón Social", selector: row => row.Raz_Social },
        { name: "NIT", selector: row => row.Nit_Proveedor },
        { name: "Teléfono", selector: row => row.Tel_Proveedor },
        { name: "Correo", selector: row => row.Cor_Proveedor },
        { name: "Dirección", selector: row => row.Dir_Proveedor },
        {
            name: "Actualizar",
            selector: row => (
                <button
                    className="btn btn-sm btn-dark"
                    data-bs-toggle="modal"
                    data-bs-target="#modalProveedores"
                    onClick={() => setProveedorSeleccionado(row)}
                >
                    <i className="fa-solid fa-pen-to-square"></i>
                </button>
            )
        }
    ];

    useEffect(() => {
        getAllProveedores()
    }, [])

    const getAllProveedores = async () => {
        const response = await apiAxios.get('/api/proveedores/')
        setProveedores(response.data)
    }

    const newListProveedores = proveedores.filter(proveedores => {
        const textToSearch = filterText.toLowerCase()
        const nombre = proveedores.Nom_Proveedor.toLowerCase()
        return nombre.includes(textToSearch)
    })

    const hideModal = () => {
        document.getElementById('closeModalProveedor').click()
        setProveedorSeleccionado(null)
        getAllProveedores()
    }

    return (
        <>
            <div className="container mt-5">
                <div className="row d-flex justify-content-between">
                    <div className="col-4">
                        <input className="form-control" value={filterText} onChange={(e) => setFilterText(e.target.value)} />
                    </div>
                    <div className="col-2">
                        <button
                            type="button"
                            className="btn btn-dark"
                            data-bs-toggle="modal"
                            data-bs-target="#modalProveedores"
                            id="closeModalProveedor"
                            onClick={() => setProveedorSeleccionado(null)}
                        >
                            Nuevo
                        </button>
                    </div>
                </div>

                <DataTable
                    title="Proveedores"
                    columns={columnsTable}
                    data={newListProveedores}
                    keyField="Id_Proveedor"
                    pagination
                    highlightOnHover
                    striped
                />

                <div className="modal fade" id="modalProveedores" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5">Proveedor</h1>
                                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                            </div>

                            <div className="modal-body">
                                <ProveedoresForm
                                    hideModal={hideModal}
                                    proveedorSeleccionado={proveedorSeleccionado}
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default CrudProveedores
