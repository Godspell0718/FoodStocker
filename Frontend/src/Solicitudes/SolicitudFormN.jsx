import { useState, useEffect } from "react";
import apiAxios from "../api/axiosConfig.js";
import Swal from "sweetalert2";
import {
    FileText, Calendar, User, Search, ShoppingCart,
    Plus, Trash2, ArrowRight, ArrowLeft, Send, X, Package
} from "lucide-react";

const SolicitudFormNuevo = ({ hideModal }) => {
    const [paso, setPaso] = useState(1);

    const [formData, setFormData] = useState({ motivo: "", Fec_entrega: "" });
    const [insumos, setInsumos] = useState([]);
    const [filtro, setFiltro] = useState("");
    const [cantidades, setCantidades] = useState({});
    const [carrito, setCarrito] = useState([]);

    const usuario = JSON.parse(localStorage.getItem("userFoodStocker") || "{}");

    useEffect(() => {
        if (paso === 2) cargarInsumos();
    }, [paso]);

    const cargarInsumos = async () => {
        try {
            const res = await apiAxios.get("/api/insumos/con-stock");
            setInsumos(res.data);
        } catch (error) {
            console.error("Error al cargar insumos:", error);
        }
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const siguientePaso = () => {
        if (!formData.motivo || !formData.Fec_entrega) {
            Swal.fire("Campos requeridos", "Por favor completa el motivo y la fecha de entrega", "warning");
            return;
        }
        setPaso(2);
    };

    const insumosFiltrados = insumos.filter(ins =>
        ins.Nom_Insumo.toLowerCase().includes(filtro.toLowerCase())
    );

    const agregarAlCarrito = (insumo) => {
        const cantidad = parseInt(cantidades[insumo.Id_Insumos] || 0);
        if (!cantidad || cantidad <= 0) {
            Swal.fire("Cantidad inválida", "Ingresa una cantidad mayor a 0", "warning");
            return;
        }
        const stockDisponible = insumo.stockReal ?? 0;
        if (cantidad > stockDisponible) {
            Swal.fire("Sin stock suficiente", `Solo hay ${stockDisponible} unidades disponibles`, "warning");
            return;
        }
        const yaExiste = carrito.find(item => item.Id_Insumos === insumo.Id_Insumos);
        if (yaExiste) {
            setCarrito(carrito.map(item => item.Id_Insumos === insumo.Id_Insumos ? { ...item, cantidad } : item));
        } else {
            setCarrito([...carrito, { Id_Insumos: insumo.Id_Insumos, Nom_Insumo: insumo.Nom_Insumo, Uni_Med_Insumo: insumo.Uni_Med_Insumo, cantidad }]);
        }
        setCantidades({ ...cantidades, [insumo.Id_Insumos]: "" });
        Swal.fire({ icon: "success", title: "Agregado", text: `${insumo.Nom_Insumo} agregado`, timer: 900, showConfirmButton: false });
    };

    const quitarDelCarrito = (Id_Insumos) => {
        setCarrito(carrito.filter(item => item.Id_Insumos !== Id_Insumos));
    };

    const enviarSolicitud = async () => {
        if (carrito.length === 0) {
            Swal.fire("Carrito vacío", "Agrega al menos un insumo", "warning");
            return;
        }
        try {
            await apiAxios.post("/api/solicitudes/completa", {
                Id_Responsable: usuario.id,
                Fec_entrega: formData.Fec_entrega,
                motivo: formData.motivo,
                insumos: carrito.map(item => ({ Id_insumos: item.Id_Insumos, cantidad_solicitada: item.cantidad }))
            });
            Swal.fire({ title: "¡Solicitud creada!", text: "Tu solicitud fue registrada correctamente", icon: "success", timer: 1800, showConfirmButton: false });
            hideModal();
        } catch (error) {
            Swal.fire("Error", error.response?.data?.message || "Error al crear la solicitud", "error");
        }
    };

    const inputClass = "tw-w-full tw-px-4 tw-py-2.5 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-gray-50 tw-text-sm tw-text-gray-700 focus:tw-outline-none focus:tw-border-primario-500 focus:tw-ring-2 focus:tw-ring-primario-100 focus:tw-bg-white tw-transition-all";
    const labelClass = "tw-block tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wide tw-mb-1.5";

    return (
        <div>
            {/* Stepper */}
            <div className="tw-flex tw-items-center tw-mb-6">
                <div className={`tw-flex tw-items-center tw-justify-center tw-w-8 tw-h-8 tw-rounded-full tw-text-sm tw-font-bold tw-shadow-sm tw-transition-all ${paso >= 1 ? "tw-bg-primario-900 tw-text-secundario-400" : "tw-bg-gray-200 tw-text-gray-500"}`}>1</div>
                <div className={`tw-flex-1 tw-h-1 tw-mx-2 tw-rounded-full tw-transition-all ${paso >= 2 ? "tw-bg-primario-700" : "tw-bg-gray-200"}`} />
                <div className={`tw-flex tw-items-center tw-justify-center tw-w-8 tw-h-8 tw-rounded-full tw-text-sm tw-font-bold tw-shadow-sm tw-transition-all ${paso >= 2 ? "tw-bg-primario-900 tw-text-secundario-400" : "tw-bg-gray-200 tw-text-gray-500"}`}>2</div>
            </div>

            {/* PASO 1 */}
            {paso === 1 && (
                <div className="tw-flex tw-flex-col tw-gap-4">
                    <p className="tw-text-sm tw-font-semibold tw-text-gray-600 tw-m-0">Información de la solicitud</p>

                    <div>
                        <label className={labelClass}>
                            <FileText className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1" /> Motivo
                        </label>
                        <input
                            type="text"
                            id="motivo"
                            className={inputClass}
                            placeholder="Ej: Práctica de panadería"
                            value={formData.motivo}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>
                            <Calendar className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1" /> Fecha de entrega
                        </label>
                        <input
                            type="date"
                            id="Fec_entrega"
                            className={inputClass}
                            value={formData.Fec_entrega}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="tw-flex tw-items-center tw-gap-2 tw-px-3 tw-py-2 tw-rounded-lg tw-bg-primario-50 tw-border tw-border-primario-100">
                        <User className="tw-w-4 tw-h-4 tw-text-primario-600" />
                        <span className="tw-text-sm tw-text-primario-800">
                            Solicitante: <strong>{usuario.nombre || "No identificado"}</strong>
                        </span>
                    </div>

                    <div className="tw-flex tw-gap-2 tw-mt-2">
                        <button
                            onClick={siguientePaso}
                            className="tw-flex-1 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-4 tw-py-2.5 tw-rounded-xl tw-bg-primario-900 tw-text-white tw-font-medium tw-text-sm hover:tw-bg-primario-700 tw-transition-all tw-shadow-md"
                        >
                            Siguiente <ArrowRight className="tw-w-4 tw-h-4" />
                        </button>
                        <button
                            onClick={hideModal}
                            className="tw-flex tw-items-center tw-gap-1.5 tw-px-4 tw-py-2.5 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-white tw-text-gray-600 tw-text-sm hover:tw-bg-gray-50 tw-transition-all"
                        >
                            <X className="tw-w-4 tw-h-4" /> Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* PASO 2 */}
            {paso === 2 && (
                <div className="tw-flex tw-flex-col tw-gap-4">
                    <p className="tw-text-sm tw-font-semibold tw-text-gray-600 tw-m-0">Seleccionar insumos</p>

                    {/* Buscador */}
                    <div className="tw-relative">
                        <Search className="tw-absolute tw-left-3 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-gray-400" />
                        <input
                            type="text"
                            className={`${inputClass} tw-pl-9`}
                            placeholder="Filtrar por nombre del insumo..."
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        />
                    </div>

                    {/* Tabla insumos */}
                    <div className="tw-rounded-xl tw-border tw-border-gray-200 tw-overflow-hidden" style={{ maxHeight: 240, overflowY: "auto" }}>
                        <table className="tw-w-full tw-text-sm">
                            <thead className="tw-sticky tw-top-0">
                                <tr className="tw-bg-primario-900">
                                    <th className="tw-text-left tw-px-4 tw-py-2.5 tw-text-xs tw-font-semibold tw-text-primario-100 tw-uppercase tw-tracking-wide">Insumo</th>
                                    <th className="tw-text-left tw-px-4 tw-py-2.5 tw-text-xs tw-font-semibold tw-text-primario-100 tw-uppercase tw-tracking-wide">Stock</th>
                                    <th className="tw-text-left tw-px-4 tw-py-2.5 tw-text-xs tw-font-semibold tw-text-primario-100 tw-uppercase tw-tracking-wide">Cantidad</th>
                                    <th className="tw-px-4 tw-py-2.5" />
                                </tr>
                            </thead>
                            <tbody>
                                {insumosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="tw-text-center tw-py-6 tw-text-gray-400 tw-text-sm">No se encontraron insumos</td>
                                    </tr>
                                ) : (
                                    insumosFiltrados.map(ins => (
                                        <tr key={ins.Id_Insumos} className="tw-border-t tw-border-gray-100 hover:tw-bg-gray-50 tw-transition-colors">
                                            <td className="tw-px-4 tw-py-2.5 tw-font-medium tw-text-gray-700">{ins.Nom_Insumo}</td>
                                            <td className="tw-px-4 tw-py-2.5">
                                                <span className="tw-inline-flex tw-items-center tw-px-2 tw-py-0.5 tw-rounded-md tw-bg-green-50 tw-text-green-700 tw-font-bold tw-text-xs">
                                                    {ins.stockReal ?? 0} {ins.Uni_Med_Insumo}
                                                </span>
                                            </td>
                                            <td className="tw-px-4 tw-py-2.5">
                                                <input
                                                    type="number"
                                                    className="tw-w-20 tw-px-2 tw-py-1.5 tw-rounded-lg tw-border tw-border-gray-200 tw-text-sm focus:tw-outline-none focus:tw-border-primario-400 tw-bg-gray-50"
                                                    min={1}
                                                    max={ins.stockReal ?? 0}
                                                    value={cantidades[ins.Id_Insumos] || ""}
                                                    onChange={(e) => setCantidades({ ...cantidades, [ins.Id_Insumos]: e.target.value })}
                                                />
                                            </td>
                                            <td className="tw-px-4 tw-py-2.5">
                                                <button
                                                    onClick={() => agregarAlCarrito(ins)}
                                                    className="tw-flex tw-items-center tw-gap-1 tw-px-3 tw-py-1.5 tw-rounded-lg tw-bg-primario-900 tw-text-white tw-text-xs tw-font-medium hover:tw-bg-primario-700 tw-transition-all"
                                                >
                                                    <Plus className="tw-w-3.5 tw-h-3.5" /> Agregar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Carrito */}
                    {carrito.length > 0 && (
                        <div className="tw-rounded-xl tw-border tw-border-primario-100 tw-bg-primario-50 tw-overflow-hidden">
                            <div className="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2.5 tw-bg-primario-100">
                                <ShoppingCart className="tw-w-4 tw-h-4 tw-text-primario-700" />
                                <span className="tw-text-xs tw-font-semibold tw-text-primario-800 tw-uppercase tw-tracking-wide">
                                    Insumos seleccionados ({carrito.length})
                                </span>
                            </div>
                            <ul className="tw-divide-y tw-divide-primario-100">
                                {carrito.map(item => (
                                    <li key={item.Id_Insumos} className="tw-flex tw-items-center tw-justify-between tw-px-4 tw-py-2.5">
                                        <div className="tw-flex tw-items-center tw-gap-2">
                                            <Package className="tw-w-3.5 tw-h-3.5 tw-text-primario-500" />
                                            <span className="tw-text-sm tw-text-gray-700">{item.Nom_Insumo}</span>
                                            <span className="tw-inline-flex tw-items-center tw-px-2 tw-py-0.5 tw-rounded-md tw-bg-primario-200 tw-text-primario-900 tw-text-xs tw-font-bold">
                                                {item.cantidad} {item.Uni_Med_Insumo}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => quitarDelCarrito(item.Id_Insumos)}
                                            className="tw-flex tw-items-center tw-justify-center tw-w-7 tw-h-7 tw-rounded-lg tw-text-red-400 hover:tw-bg-red-50 hover:tw-text-red-600 tw-transition-all"
                                        >
                                            <Trash2 className="tw-w-3.5 tw-h-3.5" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Botones */}
                    <div className="tw-flex tw-gap-2 tw-mt-1">
                        <button
                            onClick={() => setPaso(1)}
                            className="tw-flex tw-items-center tw-gap-1.5 tw-px-4 tw-py-2.5 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-white tw-text-gray-600 tw-text-sm hover:tw-bg-gray-50 tw-transition-all"
                        >
                            <ArrowLeft className="tw-w-4 tw-h-4" /> Atrás
                        </button>
                        <button
                            onClick={enviarSolicitud}
                            className="tw-flex-1 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-4 tw-py-2.5 tw-rounded-xl tw-bg-primario-900 tw-text-white tw-font-medium tw-text-sm hover:tw-bg-primario-700 tw-transition-all tw-shadow-md"
                        >
                            <Send className="tw-w-4 tw-h-4" /> Crear Solicitud
                        </button>
                        <button
                            onClick={hideModal}
                            className="tw-flex tw-items-center tw-gap-1.5 tw-px-4 tw-py-2.5 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-white tw-text-gray-600 tw-text-sm hover:tw-bg-gray-50 tw-transition-all"
                        >
                            <X className="tw-w-4 tw-h-4" /> Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SolicitudFormNuevo;