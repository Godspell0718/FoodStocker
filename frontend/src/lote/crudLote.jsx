import { useState, useEffect } from "react"
import apiAxios from '../api/axiosConfig.js'
import DataTable from 'react-data-table-component'
import LoteForm from "./loteForm.jsx"

const CrudLote = () => {
    //Crear una prop para guardar los datos de la consulta
    const [lote, setlote] = useState([])
    const [filterText, setFilterText] = useState("")

    const columnsTable = [
        { name: 'Id_Lote', selector: row => row.Id_Lote },
        {
            name: 'Fecha de llegada',
            selector: row => new Date(row.createdAt).toLocaleDateString()
        },

        { name: 'Almacen', selector: row => row.Id_Almacen },
        {
            name: 'Acciones', selector: row => (
                <button className="btn btn-sm bg-info"><i className="fa-solid fa-pencil"></i></button>
            )
        }

    ]

    //El useEffect se ejecuta cuando se cargar el componente
    useEffect(() => {
        getAlllote()
    }, [])

    //Crear una función para la consulta
    const getAlllote = async () => {
        const response = await apiAxios.get('/api/lote/')  //Se utilizar el apiAxios que tiene la URL del backend
        setlote(response.data) //Se llena la constante players con el resultado de la consulta
        console.log(response.data) //imprimir en consola el resultado de la consulta
    }

    const newListlote = lote.filter(lote => {

        const textToSearch = filterText.toLowerCase()

        const idlote = String(lote.Id_Lote).toLowerCase()

        return (
            idlote.includes(textToSearch)
        )

    })

    const hideModal = () => {
        document.getElementById('closeModalLote').click()
    }

    return (
        <>
            <div className="container mt-5">
                <div className="row d-flex justify-content-between">
                    <div className="col-4">
                        <input className="form-control" value={filterText} onChange={(e) => setFilterText(e.target.value)} />
                    </div>
                    <div className="col-2">
                        <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#ModalLote" id="closeModalLote">
                            Nuevo
                        </button>

                    </div>
                </div>
                <div></div>
                <DataTable
                    title="Lote"
                    columns={columnsTable}
                    data={newListlote}
                    keyField="id"
                    pagination
                    highlightOnHover
                    striped
                />
                <div className="modal fade" id="ModalLote" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="exampleModalLabel">Modal title</h1>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <LoteForm hideModal={hideModal} />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>

    )
}

export default CrudLote
