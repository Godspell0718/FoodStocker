import { useState, useEffect } from "react"
import apiNode from "../api/axiosConfig.js"
import DataTable from "react-data-table-component"
import EntradasForm from "./entradasForm.jsx"

const CrudEntradas = () => {

    const [entradas, setEntradas] = useState([])
    const [filterText, setFilterText] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [entradaSeleccionada, setEntradaSeleccionada] = useState(null)

    const columnsTable = [
        {
            name: "ID",
            selector: row => row.Id_Entradas,
            sortable: true,
            width: "80px"
        },
        {
            name: "Lote",
            selector: row => row.Lote,
            sortable: true,
            width: "120px"
        },
        {
            name: "Fecha Venc.",
            selector: row =>
                row.Fec_Ven_Entrada
                    ? new Date(row.Fec_Ven_Entrada).toLocaleDateString("es-CO")
                    : "—",
            sortable: true,
            width: "130px"
        },
        {
            name: "Insumo",
            selector: row => row.insumo?.Nom_Insumo || `ID ${row.Id_Insumos}`,
            sortable: true
        },
        {
            name: "Unidad Med.",
            selector: row => row.Uni_medida || "—",
            sortable: true,
            width: "120px"
        },
        {
            name: "Proveedor",
            selector: row => row.proveedor?.Nom_Proveedor || `ID ${row.Id_Proveedor}`,
            sortable: true
        },
        {
            name: "Cantidad",
            selector: row => `${row.Can_Inicial - row.Can_Salida} / ${row.Can_Inicial}`,
            sortable: true,
            width: "130px"
        },
        {
            name: "Vlr Unitario",
            selector: row => row.Vlr_Unitario ?? "—",
            sortable: true,
            width: "120px"
        },
        {
            name: "Vlr Total",
            selector: row => row.Vlr_Total ?? "—",
            sortable: true,
            width: "120px"
        },
        {
            name: "Estado",
            sortable: true,
            width: "110px",
            cell: row => {
                const color = {
                    STOCK: "success",
                    AGOTADO: "danger",
                    VENCIDO: "warning"
                }
                return (
                    <span className={`badge bg-${color[row.Estado] || "secondary"}`}>
                        {row.Estado}
                    </span>
                )
            }
        },
        {
            name: "Pasante",
            selector: row => row.pasante?.Nom_Responsable || `ID ${row.Id_Pasante}`,
            sortable: true
        },
        {
            name: "Instructor",
            selector: row => row.instructor?.Nom_Responsable || `ID ${row.Id_Instructor}`,
            sortable: true
        },
        {
            name: "Acciones",
            cell: row => (
                <button
                    className="btn btn-sm btn-dark"
                    data-bs-toggle="modal"
                    data-bs-target="#entradasModal"
                    onClick={() => setEntradaSeleccionada(row)}
                >
                    <i className="fa-solid fa-utensils"></i>
                </button>
            ),
            ignoreRowClick: true,
            button: true
        }
    ]

    const getAllEntradas = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await apiNode.get("/api/entradas/")
            setEntradas(Array.isArray(response.data) ? response.data : [])
        } catch {
            setError("Error al cargar entradas")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getAllEntradas()
    }, [])

    const filtered = entradas.filter(e =>
        JSON.stringify(e).toLowerCase().includes(filterText.toLowerCase())
    )

    const hideModal = () => {
        document.getElementById("closeModal").click()
        setEntradaSeleccionada(null)
        getAllEntradas()
    }

    return (
        <div className="container mt-5">

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row mb-3">
                <div className="col-8">
                    <input
                        className="form-control"
                        placeholder="Buscar..."
                        value={filterText}
                        onChange={e => setFilterText(e.target.value)}
                    />
                </div>
                <div className="col-4 text-end">
                    <button
                        className="btn btn-dark"
                        data-bs-toggle="modal"
                        data-bs-target="#entradasModal"
                        onClick={() => setEntradaSeleccionada(null)}
                    >
                        Nueva Entrada
                    </button>
                </div>
            </div>

            <DataTable
                title="Entradas"
                columns={columnsTable}
                data={filtered}
                pagination
                highlightOnHover
                striped
                progressPending={loading}
            />

            <div className="modal fade" id="entradasModal" tabIndex="-1">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Entrada</h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                id="closeModal"
                            ></button>
                        </div>
                        <div className="modal-body">
                            <EntradasForm
                                hideModal={hideModal}
                                refreshTable={getAllEntradas}
                                entradaSeleccionada={entradaSeleccionada}
                            />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default CrudEntradas