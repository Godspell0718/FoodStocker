import { useState, useEffect } from "react"
import apiAxios from '../api/axiosConfig.js'
import DataTable from 'react-data-table-component'
import InsumosForm from './insumosForm.jsx'
import * as bootstrap from 'bootstrap';

const CrudInsumos = () => {
    
    const [insumos, setInsumos] = useState([])
    const [filterText, setFilterText] = useState('')
    const [insumoEditando, setInsumoEditando] = useState(null)

    const columns = [
        { name: "Id de Insumos", selector: row => row.Id_Insumos, sortable: true },
        { name: "Nombre del insumo", selector: row => row.Nom_Insumo, sortable: true },
        { name: "Tipo de insumo", selector: row => row.Tip_Insumo, sortable: true },
        { name: "Unidades del insumo", selector: row => row.Can_Insumo, sortable: true },
        { name: "Peso del insumo", selector: row => row.peso, sortable: true },
        { name: "Unidad de medida", selector: row => row.Uni_Med_Insumo, sortable: true },
        { name: "Referencia del insumo", selector: row => row.Ref_Insumo, sortable: true },
        { name: "Código Insumo", selector: row => row.Codigo_Insumo, sortable: true },
        {
            name: "Actualizar",
            selector: row => (
                <button
                    className="btn btn-sm btn-dark"
                    data-bs-toggle="modal"
                    data-bs-target="#modalInsumos"
                    onClick={() => setInsumoEditando(row)}
                >
                    <i className="fa-solid fa-pen-to-square"></i>
                </button>
            )
        }
    ]

    useEffect(() => {
        getAllInsumos()
    }, [])

    const getAllInsumos = async () => {
        try {
            const response = await apiAxios.get('/api/insumos/')
            setInsumos(response.data)
        } catch (error) {
            console.error('Error al obtener insumos:', error)
        }
    }

    const filteredInsumos = insumos.filter(insumo => {
        const textToSearch = filterText.toLowerCase()
        const nombre = insumo.Nom_Insumo?.toLowerCase() || ''
        const tipo = insumo.Tip_Insumo?.toLowerCase() || ''

        return (
            nombre.includes(textToSearch) ||
            tipo.includes(textToSearch)
        )
    })

    const hideModal = () => {
        document.getElementById('closeModalInsumos').click()
        setInsumoEditando(null)
        getAllInsumos()
    }

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
                            id="closeModalInsumos"
                            onClick={() => setInsumoEditando(null)}
                        >
                            Agregar Insumo
                        </button>
                    </div>
                </div>

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
            </div>
        </>
    )
}

export default CrudInsumos