import { useState, useEffect } from "react"
import apiAxios from '../api/axiosConfig.js'
import DataTable from 'react-data-table-component'
import DestinoForm from "./destinoForm.jsx"
import Swal from "sweetalert2"
import { 
    MapPin, Utensils, Hash, Type,
    Plus, Search, Pencil, Trash2, X, Inbox 
} from "lucide-react"

const CrudDestino = () => {
    //Crear una prop para guardar los datos de la consulta
    const [destino, setdestino] = useState([])
    const [filterText, setFilterText] = useState("")
    const [destinoSeleccionado, setDestinoSeleccionado] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)


    const columnsTable = [
        { 
            name: 'ID', 
            selector: row => row.Id_Destino,
            width: "80px",
            cell: row => <span className="tw-font-mono tw-text-slate-500">#{row.Id_Destino}</span>
        },
        { 
            name: 'Nombre Destino', 
            selector: row => row.Nom_Destino,
            sortable: true,
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-3">
                    <div className="tw-w-8 tw-h-8 tw-bg-blue-100 tw-rounded-lg tw-flex tw-items-center tw-justify-center">
                        <MapPin className="tw-w-4 tw-h-4 tw-text-blue-600" />
                    </div>
                    <span className="tw-font-medium tw-text-slate-700">{row.Nom_Destino}</span>
                </div>
            )
        },
        { 
            name: 'Tipo Destino', 
            selector: row => row.Tip_Destino,
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-2">
                    <Type className="tw-w-3.5 tw-h-3.5 tw-text-slate-400" />
                    <span className="tw-text-slate-600">{row.Tip_Destino}</span>
                </div>
            )
        },
        {
            name: 'Acciones',
            right: true,
            width: "100px",
            cell: row => (
                <div className="tw-flex tw-gap-2">
                    <button
                        title="Editar"
                        className="tw-p-1.5 tw-rounded-lg tw-bg-primario-900 tw-text-white hover:tw-bg-primario-700 tw-transition-all tw-duration-200 tw-shadow-sm"
                        onClick={() => {
                            setDestinoSeleccionado(row)
                            setShowModal(true)
                        }}
                    >
                        <Pencil className="tw-w-3.5 tw-h-3.5" />
                    </button>
                    <button
                        title="Eliminar"
                        className="tw-p-1.5 tw-rounded-lg tw-bg-red-50 tw-text-red-500 hover:tw-bg-red-500 hover:tw-text-white tw-transition-all tw-duration-200 tw-shadow-sm"
                        onClick={() => deleteDestino(row.Id_Destino)}
                    >
                        <Trash2 className="tw-w-3.5 tw-h-3.5" />
                    </button>
                </div>
            )
        }
    ]

  //El useEffect se ejecuta cuando se cargar el componente
  useEffect(() => {
    getAlldestino()
  }, [])

  //Crear una función para la consulta
    const deleteDestino = async (id) => {
        const confirm = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción eliminará el destino permanentemente",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#153753",
        })

        if (confirm.isConfirmed) {
            try {
                await apiAxios.delete(`/api/destino/${id}`)
                Swal.fire({
                    title: "Eliminado",
                    text: "El destino ha sido eliminado correctamente",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                })
                getAlldestino()
            } catch (error) {
                Swal.fire("Error", error.response?.data?.message || "No se pudo eliminar el destino", "error")
            }
        }
    }

    const getAlldestino = async () => {
        setLoading(true)
        try {
            const response = await apiAxios.get('/api/destino/')
            setdestino(Array.isArray(response.data) ? response.data : [])
        } catch (error) {
            console.error("Error al cargar destinos:", error)
        } finally {
            setLoading(false)
        }
    }

  const newListdestino = destino.filter(destino => {

    const textToSearch = filterText.toLowerCase()

    const nombre = destino.Nom_Destino?.toLowerCase() || ""

    return (
      nombre.includes(textToSearch)
    )

  })

    const hideModal = () => {
        setShowModal(false)
        setDestinoSeleccionado(null)
        getAlldestino()
    }

    // Estilos personalizados para DataTable
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
                letterSpacing: '0.5px',
                paddingTop: '16px',
                paddingBottom: '16px',
            },
        },
        rows: {
            style: {
                borderRadius: '8px',
                marginTop: '4px',
                marginBottom: '4px',
                '&:hover': {
                    backgroundColor: '#fef3c7',
                },
            },
        },
        pagination: {
            style: {
                borderTop: '1px solid #e2e8f0',
                paddingTop: '12px',
                paddingBottom: '12px',
            },
        },
    }

    return (
        <div className="tw-min-h-screen tw-bg-gradient-to-br tw-from-slate-50 tw-to-blue-50 tw-p-6">
            <div className="tw-max-w-5xl tw-mx-auto">
                {/* Header */}
                <div className="tw-mb-8">
                    <div className="tw-flex tw-items-center tw-gap-3 tw-mb-2">
                        <div className="tw-w-10 tw-h-10 tw-bg-primario-900 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-shadow-lg">
                            <MapPin className="tw-w-5 tw-h-5 tw-text-secundario-400" />
                        </div>
                        <h1 className="tw-text-2xl tw-font-bold tw-text-slate-800">Gestión de Destinos</h1>
                    </div>
                    <p className="tw-text-slate-500 tw-ml-12">Administra los lugares de destino para los insumos</p>
                </div>

                {/* Barra de herramientas */}
                <div className="tw-bg-white tw-rounded-2xl tw-shadow-sm tw-p-4 tw-mb-6">
                    <div className="tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-center tw-gap-4">
                        <div className="tw-relative tw-w-full md:tw-w-96">
                            <Search className="tw-absolute tw-left-3 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-slate-400" />
                            <input
                                type="text"
                                className="tw-w-full tw-pl-10 tw-pr-4 tw-py-2.5 tw-border tw-border-slate-200 tw-rounded-xl tw-bg-slate-50 tw-text-slate-700 tw-placeholder-slate-400 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-primario-500/20 focus:tw-border-primario-500 tw-transition-all"
                                placeholder="Buscar por nombre..."
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            className="tw-px-5 tw-py-2.5 tw-bg-primario-900 hover:tw-bg-primario-700 tw-text-white tw-font-medium tw-rounded-xl tw-shadow-md hover:tw-shadow-lg tw-transition-all tw-duration-200 tw-flex tw-items-center tw-gap-2"
                            onClick={() => {
                                setDestinoSeleccionado(null)
                                setShowModal(true)
                            }}
                        >
                            <Plus className="tw-w-4 tw-h-4" />
                            <span>Nuevo Destino</span>
                        </button>
                    </div>
                </div>

                {/* Tabla de datos */}
                <div className="tw-bg-white tw-rounded-2xl tw-shadow-lg tw-overflow-hidden">
                    <DataTable
                        columns={columnsTable}
                        data={newListdestino}
                        keyField="Id_Destino"
                        pagination
                        highlightOnHover
                        responsive
                        customStyles={customStyles}
                        progressPending={loading}
                        progressComponent={
                            <div className="tw-py-12 tw-text-center">
                                <div className="tw-inline-block tw-w-8 tw-h-8 tw-border-4 tw-border-slate-200 tw-border-t-primario-900 tw-rounded-full tw-animate-spin"></div>
                                <p className="tw-mt-3 tw-text-slate-500">Cargando destinos...</p>
                            </div>
                        }
                        noDataComponent={
                            <div className="tw-py-12 tw-text-center">
                                <Inbox className="tw-w-12 tw-h-12 tw-text-slate-300 tw-mx-auto tw-mb-3" />
                                <p className="tw-text-slate-400">No se encontraron destinos</p>
                            </div>
                        }
                    />
                </div>

                {/* Modal Custom Tailwind */}
                {showModal && (
                    <div 
                        className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-4 tw-bg-black/50 tw-backdrop-blur-sm"
                        onClick={(e) => e.target === e.currentTarget && hideModal()}
                    >
                        <div className="tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-md tw-overflow-hidden tw-animate-in tw-fade-in tw-zoom-in-95 tw-duration-200">
                            {/* Modal Header */}
                            <div className="tw-bg-primario-900 tw-px-6 tw-py-4">
                                <div className="tw-flex tw-justify-between tw-items-center">
                                    <div className="tw-flex tw-items-center tw-gap-3">
                                        <div className="tw-w-8 tw-h-8 tw-bg-white/20 tw-rounded-lg tw-flex tw-items-center tw-justify-center">
                                            <MapPin className="tw-w-5 tw-h-5 tw-text-secundario-400" />
                                        </div>
                                        <h5 className="tw-text-white tw-font-semibold tw-text-lg tw-m-0">
                                            {destinoSeleccionado ? 'Editar Destino' : 'Nuevo Destino'}
                                        </h5>
                                    </div>
                                    <button
                                        type="button"
                                        className="tw-text-white/70 hover:tw-text-white tw-transition-colors"
                                        onClick={hideModal}
                                    >
                                        <X className="tw-w-6 tw-h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="tw-p-6">
                                <DestinoForm
                                    hideModal={hideModal}
                                    destinoSeleccionado={destinoSeleccionado}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CrudDestino

