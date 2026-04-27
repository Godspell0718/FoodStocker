import { useState, useEffect } from "react"
import apiAxios from '../api/axiosConfig.js'
import DataTable from 'react-data-table-component'
import DestinoForm from "./destinoForm.jsx"

const CrudDestino = () => {

  const [destino, setdestino] = useState([])
  const [filterText, setFilterText] = useState("")
  const [destinoSeleccionado, setDestinoSeleccionado] = useState(null)
  const [loading, setLoading] = useState(false)

  const columnsTable = [
    {
      name: "Nombre",
      selector: row => row.Nom_Destino,
      sortable: true,
      grow: 2,
      cell: row => (
        <div className="tw-flex tw-items-center tw-gap-3">
          <div className="tw-w-8 tw-h-8 tw-bg-gradient-to-br tw-from-blue-100 tw-to-amber-100 tw-rounded-full tw-flex tw-items-center tw-justify-center">
            <i className="fa-solid fa-location-dot tw-text-blue-600 tw-text-sm"></i>
          </div>
          <span className="tw-font-medium tw-text-slate-700">{row.Nom_Destino}</span>
        </div>
      )
    },
    {
      name: "Tipo",
      selector: row => row.Tip_Destino,
      cell: row => (
        <span className="tw-px-2 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium tw-bg-amber-100 tw-text-amber-700">
          {row.Tip_Destino}
        </span>
      )
    },
    {
      name: "Acciones",
      right: true,
      cell: row => (
        <button
          className="tw-p-2 tw-rounded-lg tw-bg-gradient-to-r tw-from-blue-500 tw-to-blue-600 hover:tw-from-blue-600 hover:tw-to-blue-700 tw-text-white tw-transition-all tw-duration-200 tw-shadow-md hover:tw-shadow-lg"
          data-bs-toggle="modal"
          data-bs-target="#destinoModal"
          onClick={() => setDestinoSeleccionado(row)}
        >
          <i className="fa-solid fa-pen tw-text-xs"></i>
        </button>
      )
    }
  ]

  useEffect(() => {
    getAlldestino()
  }, [])

  const getAlldestino = async () => {
    setLoading(true)
    try {
      const response = await apiAxios.get('/api/destino/')
      setdestino(response.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const newListdestino = destino.filter(d => {
    const text = filterText.toLowerCase()
    return d.Nom_Destino.toLowerCase().includes(text)
  })

  const hideModal = () => {
    document.getElementById('closeModal')?.click()
    setDestinoSeleccionado(null)
    getAlldestino()
  }

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#1e3a5f',
        borderRadius: '12px 12px 0 0',
      },
    },
    headCells: {
      style: {
        color: '#ffffff',
        fontSize: '13px',
        fontWeight: '600',
        textTransform: 'uppercase',
      },
    },
  }

  return (
    <div className="tw-min-h-screen tw-bg-gradient-to-br tw-from-slate-50 tw-to-blue-50 tw-p-6">
      <div className="tw-max-w-7xl tw-mx-auto">

        {/* HEADER */}
        <div className="tw-mb-8">
          <div className="tw-flex tw-items-center tw-gap-3 tw-mb-2">
            <div className="tw-w-10 tw-h-10 tw-bg-gradient-to-br tw-from-blue-600 tw-to-indigo-600 tw-rounded-xl tw-flex tw-items-center tw-justify-center">
              <i className="fa-solid fa-map-location-dot tw-text-white"></i>
            </div>
            <h1 className="tw-text-2xl tw-font-bold tw-text-slate-800">Gestión de Destinos</h1>
          </div>
          <p className="tw-text-slate-500 tw-ml-12">Administra los destinos del sistema</p>
        </div>

        {/* BUSCADOR + BOTÓN */}
        <div className="tw-bg-white tw-rounded-2xl tw-shadow-sm tw-p-4 tw-mb-6">
          <div className="tw-flex tw-justify-between tw-items-center tw-gap-4">
            <div className="tw-relative tw-w-96">
              <i className="fa-solid fa-magnifying-glass tw-absolute tw-left-3 tw-top-1/2 -tw-translate-y-1/2 tw-text-slate-400"></i>
              <input
                type="text"
                className="tw-w-full tw-pl-10 tw-pr-4 tw-py-2.5 tw-border tw-rounded-xl"
                placeholder="Buscar destino..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>

            <button
              className="tw-px-5 tw-py-2.5 tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-700 tw-text-white tw-rounded-xl"
              data-bs-toggle="modal"
              data-bs-target="#destinoModal"
              id="closeModal"
              onClick={() => setDestinoSeleccionado(null)}
            >
              <i className="fa-solid fa-plus"></i> Nuevo Destino
            </button>
          </div>
        </div>

        {/* TABLA */}
        <div className="tw-bg-white tw-rounded-2xl tw-shadow-lg tw-overflow-hidden">
          <DataTable
            columns={columnsTable}
            data={newListdestino}
            keyField="Id_Destino"
            pagination
            highlightOnHover
            customStyles={customStyles}
            progressPending={loading}
          />
        </div>

        {/* MODAL */}
        <div className="modal fade" id="destinoModal">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content tw-rounded-2xl">

              <div className="tw-bg-gradient-to-r tw-from-blue-600 tw-to-indigo-600 tw-p-4">
                <h5 className="tw-text-white">
                  {destinoSeleccionado ? 'Editar Destino' : 'Nuevo Destino'}
                </h5>
              </div>

              <div className="tw-p-6">
                <DestinoForm
                  hideModal={hideModal}
                  destinoSeleccionado={destinoSeleccionado}
                />
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default CrudDestino



