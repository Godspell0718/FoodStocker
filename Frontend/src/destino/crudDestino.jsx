import { useState, useEffect } from "react"
import apiAxios from '../api/axiosConfig.js'
import DataTable from 'react-data-table-component'
import DestinoForm from "./destinoForm.jsx"

const CrudDestino = () => {
  //Crear una prop para guardar los datos de la consulta
  const [destino, setdestino] = useState([])
  const [filterText, setFilterText] = useState("")
  const [destinoSeleccionado, setDestinoSeleccionado] = useState(null)


  const columnsTable = [
    { name: 'Id_Destino', selector: row => row.Id_Destino },
    { name: 'Nombre Destino', selector: row => row.Nom_Destino },
    { name: 'Tipo Destino', selector: row => row.Tip_Destino },
    {
      name: 'Acciones',
      cell: row => (
        <button
          className="btn btn-sm btn-dark"
          data-bs-toggle="modal"
          data-bs-target="#exampleModal"
          onClick={() => setDestinoSeleccionado(row)}   // carga el registro en el state
        >
          <i className="fa-solid fa-utensils"></i>
        </button>
      )
    }


  ]

  //El useEffect se ejecuta cuando se cargar el componente
  useEffect(() => {
    getAlldestino()
  }, [])

  //Crear una función para la consulta
  const getAlldestino = async () => {
    const response = await apiAxios.get('/api/destino/')  //Se utilizar el apiAxios que tiene la URL del backend
    setdestino(response.data) //Se llena la constante players con el resultado de la consulta
    console.log(response.data) //imprimir en consola el resultado de la consulta
  }

  const newListdestino = destino.filter(destino => {

    const textToSearch = filterText.toLowerCase()

    const nombre = destino.Nom_Destino.toLowerCase()

    return (
      nombre.includes(textToSearch)
    )

  })

  const hideModal = () => {
    document.getElementById('closeModal').click()
    setDestinoSeleccionado(null)                   // Limpia el registro seleccionado
    getAlldestino()
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
              data-bs-target="#exampleModal"
              onClick={() => setDestinoSeleccionado(null)}   // abre como NUEVO
            >
              Nuevo
            </button>


          </div>
        </div>
        <div></div>
        <DataTable
          title="Destinos"
          columns={columnsTable}
          data={newListdestino}
          keyField="Id_Destino"
          pagination
          highlightOnHover
          striped
        />
        <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="exampleModalLabel">Modal title</h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" id="closeModal"></button>
              </div>
              <div className="modal-body">
                <DestinoForm
                  hideModal={hideModal}
                  destinoSeleccionado={destinoSeleccionado}
                />

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

export default CrudDestino

