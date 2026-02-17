import { useState, useEffect } from "react"
import apiAxios from "../api/axiosConfig.js";
import DataTable from 'react-data-table-component';
import EntradasForm from "./entradasForm.jsx";

const CrudEntradas = () => {

    const [entradas, setEntradas] = useState([])
    const [filterText, setFilterText] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const columnsTable = [
        { 
            name: 'ID', 
            selector: row => row.Id_Entradas,  
            sortable: true, 
            width: '80px' 
        },
        { 
            name: 'Lote', 
            selector: row => row.Lote || 'N/A',  
            sortable: true,
            width: '120px'
        },
        { 
            name: 'Fecha Venc.', 
            selector: row => {
                if (!row.Fec_Ven_Entrada) return 'No definida';  
                const fecha = new Date(row.Fec_Ven_Entrada);
                return fecha.toLocaleDateString('es-ES');
            }, 
            sortable: true,
            width: '130px'
        },
        { 
            name: 'Insumo',  
            selector: row => row.insumo?.Nom_Insumo || `ID: ${row.Id_Insumos}`,
            sortable: true 
        },
        { 
            name: 'Proveedor', 
            selector: row => row.proveedor?.Nom_Proveedor || `ID: ${row.Id_Proveedor}`,  
            sortable: true 
        },
        { 
            name: 'Cantidad', 
            selector: row => `${row.Can_Inicial - row.Can_Salida} / ${row.Can_Inicial}`,  
            sortable: true,
            width: '100px'
        },
        {
            name: 'Vlr Unitario',
            selector: row => row.Vlr_Unitario,
            sortable: true,
            width: '100px'
        },
        {
            name: 'Vlr Total',
            selector: row => row.Vlr_Total,
            sortable: true,
            width: '100px'
        },
        { 
            name: 'Estado',  
            selector: row => row.Estado,
            sortable: true,
            width: '100px',
            cell: row => {
                const badges = {
                    'STOCK': 'success',
                    'AGOTADO': 'danger',
                    'VENCIDO': 'warning'
                };
                return (
                    <span className={`badge bg-${badges[row.Estado] || 'secondary'}`}>
                        {row.Estado}
                    </span>
                );
            }
        },
        { 
            name: 'Pasante', 
            selector: row => row.pasante?.Nom_Responsable || `ID: ${row.Id_Pasante}`,  
            sortable: true 
        },
        { 
            name: 'Instructor', 
            selector: row => row.instructor?.Nom_Responsable || `ID: ${row.Id_Instructor}`,  
            sortable: true 
        },
    ]

    useEffect(() => {
        getAllEntradas()
    }, [])

    const getAllEntradas = async () => {
        try {
            setLoading(true)
            setError(null)
            
            const response = await apiAxios.get("/api/entradas/")
            
            console.log("✅ Datos recibidos:", response.data)
            
            // Verificar si response.data es un array
            if (Array.isArray(response.data)) {
                setEntradas(response.data)
            } else {
                console.error("❌ Los datos no son un array:", response.data)
                setError("Formato de datos incorrecto")
                setEntradas([])
            }
            
        } catch (error) {
            console.error("❌ Error completo:", error)
            console.error("❌ Error response:", error.response)
            console.error("❌ Error data:", error.response?.data)
            
            setError(error.response?.data?.mensaje || error.message || "Error al obtener entradas")
            setEntradas([])
        } finally {
            setLoading(false)
        }
    }

    const newListEntradas = entradas.filter(entrada => {
        const textToSearch = filterText.toLowerCase()
        const id = entrada.Id_Entradas?.toString().toLowerCase() || "" 
        const lote = entrada.Lote?.toLowerCase() || ""  
        const insumo = entrada.insumo?.Nom_Insumo?.toLowerCase() || ""  
        const proveedor = entrada.proveedor?.Nom_Proveedor?.toLowerCase() || ""
        const pasante = entrada.pasante?.Nom_Responsable?.toLowerCase() || ""
        const instructor = entrada.instructor?.Nom_Responsable?.toLowerCase() || ""
        const estado = entrada.Estado?.toLowerCase() || ""  
        
        return (
            id.includes(textToSearch) ||
            lote.includes(textToSearch) ||
            insumo.includes(textToSearch) ||
            proveedor.includes(textToSearch) ||
            pasante.includes(textToSearch) ||
            instructor.includes(textToSearch) ||
            estado.includes(textToSearch)
        )
    })

    const hideModal = () => {
        document.getElementById('closeModal').click();
    }

    const refreshTable = () => {
        getAllEntradas();
    }

    return (
        <>
            <div className="container mt-5">
                {/* Mostrar error si existe */}
                {error && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        <strong>Error:</strong> {error}
                        <button 
                            type="button" 
                            className="btn-close" 
                            onClick={() => setError(null)}
                        ></button>
                    </div>
                )}

                <div className="row d-flex justify-content-between mb-3">
                    <div className="col-8">
                        <input 
                            className="form-control" 
                            placeholder="Buscar por ID, lote, insumo, proveedor, estado..." 
                            value={filterText} 
                            onChange={(e) => setFilterText(e.target.value)} 
                        />
                    </div>
                    <div className="col-4 text-end">
                        <button 
                            type="button" 
                            className="btn btn-primary" 
                            data-bs-toggle="modal" 
                            data-bs-target="#exampleModal"
                        >
                            Nueva Entrada
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-secondary ms-2" 
                            onClick={refreshTable}
                            disabled={loading}
                        >
                            {loading ? 'Cargando...' : 'Actualizar'}
                        </button>
                    </div>
                </div>
                
                <DataTable
                    title="Listado de Entradas"
                    columns={columnsTable}
                    data={newListEntradas}
                    keyField="Id_Entradas"  // ← CORREGIDO
                    pagination
                    highlightOnHover
                    striped
                    progressPending={loading}
                    progressComponent={<div className="p-5">Cargando entradas...</div>}
                    noDataComponent={
                        error 
                            ? "Error al cargar los datos" 
                            : "No hay entradas registradas"
                    }
                />

                {/* Modal */}
                <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="exampleModalLabel">Nueva Entrada</h1>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    data-bs-dismiss="modal" 
                                    aria-label="Close"
                                    id="closeModal"
                                ></button>
                            </div>
                            <div className="modal-body">
                                <EntradasForm 
                                    hideModal={hideModal} 
                                    refreshTable={refreshTable} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CrudEntradas