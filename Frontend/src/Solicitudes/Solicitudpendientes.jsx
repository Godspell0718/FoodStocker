import { useState, useEffect } from "react";
import apiAxios from "../api/axiosConfig.js";
import Swal from "sweetalert2";
import { ClipboardList, CheckCircle, XCircle, X, Truck, Loader2, Package, Calendar, User, FileText, Hash, RefreshCw, MessageSquare, MapPin, AlertTriangle, Boxes, Layers, Scale, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { fmtCantidadConPresentacion, fmtUnidad, fmtFechaVencimiento } from "../utils/inventario.js";

const ESTADO_CONFIG = {
    solicitado: { label: "Solicitado", bg: "tw-bg-secundario-100 tw-text-secundario-800", dot: "tw-bg-secundario-400" },
    proceso: { label: "En Proceso", bg: "tw-bg-blue-100 tw-text-blue-800", dot: "tw-bg-blue-500" },
    despachado: { label: "Despachado", bg: "tw-bg-green-100 tw-text-green-800", dot: "tw-bg-green-500" },
    cancelado: { label: "Cancelado", bg: "tw-bg-red-100 tw-text-red-700", dot: "tw-bg-red-500" },
};

const EstadoBadge = ({ estado }) => {
    const key = estado?.toLowerCase();
    const config = ESTADO_CONFIG[key] || { label: estado ?? "Sin estado", bg: "tw-bg-gray-100 tw-text-gray-600", dot: "tw-bg-gray-400" };
    return (
        <span className={`tw-inline-flex tw-items-center tw-gap-1.5 tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-semibold ${config.bg}`}>
            <span className={`tw-w-1.5 tw-h-1.5 tw-rounded-full ${config.dot}`} />
            {config.label}
        </span>
    );
};

const SolicitudPendientes = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState("solicitado");
    const [busquedaNombre, setBusquedaNombre] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const ITEMS_POR_PAGINA = 5;

    useEffect(() => { cargarSolicitudes(); }, []);

    const cargarSolicitudes = async () => {
        try {
            setLoading(true);
            const res = await apiAxios.get("/api/solicitudes/pendientes");
            setSolicitudes(res.data);
        } catch (error) {
            console.error("Error cargando solicitudes:", error);
        } finally {
            setLoading(false);
        }
    };

    const cambiarEstado = async (Id_solicitud, Id_estado, nombreEstado) => {
        // Si es cancelación, pedir motivo obligatorio
        if (Id_estado === 4) {
            const { value: motivo_cancelacion, isConfirmed } = await Swal.fire({
                title: '¿Cancelar esta solicitud?',
                html: '<p style="margin-bottom:8px;color:#6b7280;font-size:14px">Escribe el motivo de la cancelación <strong>(obligatorio)</strong></p>',
                input: 'textarea',
                inputPlaceholder: 'Escribe el motivo de cancelación...',
                inputAttributes: { 'aria-label': 'Motivo de cancelación', style: 'min-height:80px' },
                showCancelButton: true,
                confirmButtonText: 'Sí, cancelar solicitud',
                cancelButtonText: 'Volver',
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280',
                inputValidator: (value) => {
                    if (!value || !value.trim()) return '¡Debes escribir un motivo de cancelación!';
                },
            });
            if (!isConfirmed) return;
            try {
                await apiAxios.post("/api/solicitudes/cambiar-estado", { Id_solicitud, Id_estado, motivo_cancelacion });
                Swal.fire({ icon: "success", title: "Solicitud cancelada", timer: 1200, showConfirmButton: false });
                cargarSolicitudes();
                window.dispatchEvent(new Event("nuevaSolicitud"));
            } catch (error) {
                Swal.fire("Error", error.response?.data?.message || "No se pudo cancelar la solicitud", "error");
            }
            return;
        }

        const confirm = await Swal.fire({
            title: `¿Cambiar a "${nombreEstado}"?`,
            text: "Esta acción quedará registrada",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, confirmar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#153753",
            cancelButtonColor: "#6b7280",
        });
        if (!confirm.isConfirmed) return;
        try {
            await apiAxios.post("/api/solicitudes/cambiar-estado", { Id_solicitud, Id_estado });
            Swal.fire({ icon: "success", title: "Estado actualizado", timer: 1200, showConfirmButton: false });
            cargarSolicitudes();
            window.dispatchEvent(new Event("nuevaSolicitud"));
        } catch (error) {
            Swal.fire("Error", error.response?.data?.message || "No se pudo cambiar el estado", "error");
        }
    };

    const handleCambiarLote = async (item, nuevoIdEntrada, sol) => {
        if (!nuevoIdEntrada || nuevoIdEntrada === item.Id_Entradas) return;
        const loteDestino = item.insumo?.entradas?.find(e => e.Id_Entradas === nuevoIdEntrada);
        const nombreLote = loteDestino?.Lote || `#${nuevoIdEntrada}`;

        const confirm = await Swal.fire({
            title: '¿Cambiar lote asignado?',
            html: `<p style="font-size:14px;color:#4b5563;margin-bottom:4px;">
                    ¿Deseas cambiar el insumo <strong>${item.insumo?.Nom_Insumo || ''}</strong> al lote <strong>${nombreLote}</strong>?
                   </p>
                   <p style="font-size:12px;color:#6b7280;">Se actualizará la reserva de stock al nuevo lote seleccionado.</p>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, cambiar lote',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#153753',
            cancelButtonColor: '#6b7280',
        });

        if (!confirm.isConfirmed) return;

        try {
            await apiAxios.post("/api/solicitudes/cambiar-lote", {
                Id_insumo_solicitud: item.Id_insumo_solicitud,
                Id_Entradas_nuevo: nuevoIdEntrada
            });
            Swal.fire({
                icon: 'success',
                title: 'Lote actualizado',
                text: `El insumo ahora saldrá del lote ${nombreLote}`,
                timer: 1500,
                showConfirmButton: false
            });
            cargarSolicitudes();
            window.dispatchEvent(new Event("nuevaSolicitud"));
        } catch (error) {
            Swal.fire(
                'Error al cambiar lote',
                error.response?.data?.message || 'No se pudo cambiar el lote asignado',
                'error'
            );
        }
    };

    const guardarNovedad = async (sol) => {
        const estado = sol.ultimoEstado?.toLowerCase();
        const esFinalizado = estado === "despachado" || estado === "cancelado";

        // Si la solicitud ya está despachada o cancelada:
        if (esFinalizado) {
            if (sol.novedad) {
                // Modo lectura: mostrar la novedad registrada sin permitir edición
                Swal.fire({
                    title: `Novedad Registrada (#${sol.Id_solicitud})`,
                    html: `
                        <div style="text-align: left; font-size: 13px; color: #374151;">
                            <p style="margin-bottom: 8px;"><strong>Estado de solicitud:</strong> <span style="text-transform: capitalize;">${estado}</span></p>
                            <div style="padding: 12px; border-radius: 10px; background: #fef3c7; border: 1px solid #fde68a; color: #92400e;">
                                <strong>Novedad:</strong><br/>${sol.novedad}
                            </div>
                            <p style="font-size: 11px; color: #6b7280; margin-top: 10px;">* No se pueden modificar las cantidades de una solicitud ${estado}.</p>
                        </div>`,
                    icon: 'info',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#153753'
                });
                return;
            }
            Swal.fire("Acción no permitida", `No se pueden registrar novedades en solicitudes ${estado}s`, "warning");
            return;
        }

        const insumosData = sol.insumos || [];
        if (insumosData.length === 0) {
            Swal.fire("Sin insumos", "Esta solicitud no tiene insumos registrados", "info");
            return;
        }

        // Construir filas HTML con las columnas requeridas: Insumo/Lote | Solicitado | Entregar | Por Entregar (A restar) | Descripción
        const filasHTML = insumosData.map((item, idx) => {
            const nombre = item.insumo?.Nom_Insumo ?? `Insumo #${item.Id_insumos}`;
            const lote = item.entrada?.Lote ?? "—";
            const unidad = item.insumo?.Uni_medida || item.entrada?.Uni_medida || '';
            const solicitada = item.cantidad_solicitada;
            const entregadaPrevia = item.cantidad_entregada !== null && item.cantidad_entregada !== undefined
                ? item.cantidad_entregada : solicitada;
            const diff = solicitada - entregadaPrevia;

            return `
                <tr style="border-bottom: 1px solid #f3f4f6;">
                    <td style="padding: 10px 8px; font-size: 13px; font-weight: 600; color: #1e293b;">
                        ${nombre}
                        <div style="font-size: 11px; font-weight: 500; color: #64748b; margin-top: 2px;">
                            Lote: <strong>${lote}</strong> ${unidad ? `· <span style="background:#f1f5f9;padding:1px 6px;border-radius:4px;font-size:10px;">${unidad}</span>` : ''}
                        </div>
                    </td>
                    <td style="padding: 10px 8px; text-align: center;">
                        <span style="font-weight: 700; color: #153753; font-size: 14px;">${solicitada} ${unidad ? `<small style="font-size:11px;color:#64748b;">${unidad}</small>` : ''}</span>
                    </td>
                    <td style="padding: 10px 8px; text-align: center;">
                        <input type="number" id="novedad-entregar-${idx}" min="0" max="${solicitada}" value="${entregadaPrevia}"
                            data-id="${item.Id_insumo_solicitud}" data-solicitada="${solicitada}" data-nombre="${nombre}"
                            style="width: 75px; padding: 6px 8px; border: 2px solid #cbd5e1; border-radius: 8px; text-align: center; font-size: 14px; font-weight: 700; color: #153753; outline: none;"
                            onfocus="this.style.borderColor='#153753'" onblur="this.style.borderColor='#cbd5e1'"
                            oninput="
                                var req = ${solicitada};
                                var ent = parseInt(this.value || 0);
                                var resta = req - ent;
                                var spanResta = document.getElementById('novedad-resta-${idx}');
                                var inputDesc = document.getElementById('novedad-desc-${idx}');
                                if(resta > 0){
                                    spanResta.textContent = resta + ' a restar';
                                    spanResta.style.color = '#dc2626';
                                    spanResta.style.background = '#fef2f2';
                                    inputDesc.style.display = 'block';
                                } else {
                                    spanResta.textContent = '0 (Completo)';
                                    spanResta.style.color = '#16a34a';
                                    spanResta.style.background = '#f0fdf4';
                                    inputDesc.style.display = 'none';
                                }
                            "
                        />
                    </td>
                    <td style="padding: 10px 8px; text-align: center;">
                        <span id="novedad-resta-${idx}" style="font-size: 12px; font-weight: 700; padding: 4px 8px; border-radius: 6px;
                            color: ${diff > 0 ? '#dc2626' : '#16a34a'}; background: ${diff > 0 ? '#fef2f2' : '#f0fdf4'};">
                            ${diff > 0 ? `${diff} a restar` : '0 (Completo)'}
                        </span>
                    </td>
                    <td style="padding: 10px 8px;">
                        <input type="text" id="novedad-desc-${idx}" placeholder="Motivo por el que no se entrega..."
                            style="width: 100%; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 12px; display: ${diff > 0 ? 'block' : 'none'}; outline: none;"
                            onfocus="this.style.borderColor='#153753'" onblur="this.style.borderColor='#cbd5e1'"
                        />
                    </td>
                </tr>`;
        }).join('');

        const htmlContent = `
            <div style="text-align: left; margin-top: 6px;">
                <p style="font-size: 13px; color: #64748b; margin-bottom: 12px;">
                    Indica cuántos insumos se van a <strong>entregar</strong>. Los sobrantes (por entregar/a restar) se devolverán automáticamente al stock del lote.
                </p>
                <div style="border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; margin-bottom: 12px; max-height: 320px; overflow-y: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                        <thead>
                            <tr style="background: #153753; position: sticky; top: 0; z-index: 10;">
                                <th style="padding: 10px 8px; text-align: left; color: #c9a84c; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Insumo / Lote</th>
                                <th style="padding: 10px 8px; text-align: center; color: #c9a84c; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Solicitado</th>
                                <th style="padding: 10px 8px; text-align: center; color: #c9a84c; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Entregar</th>
                                <th style="padding: 10px 8px; text-align: center; color: #c9a84c; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Cant. Por Entregar / Restar</th>
                                <th style="padding: 10px 8px; text-align: left; color: #c9a84c; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; width: 35%;">Descripción / Motivo</th>
                            </tr>
                        </thead>
                        <tbody>${filasHTML}</tbody>
                    </table>
                </div>
                <div>
                    <label style="font-size: 12px; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Observación General de Novedad (opcional)</label>
                    <textarea id="novedad-observacion-general" placeholder="Nota general para la solicitud..."
                        style="width: 100%; min-height: 50px; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 12px; outline: none; font-family: inherit;"
                        onfocus="this.style.borderColor='#153753'" onblur="this.style.borderColor='#cbd5e1'"
                    >${sol.novedad || ''}</textarea>
                </div>
            </div>`;

        // Mostrar Modal de Novedad
        const { value: novedadData, isConfirmed } = await Swal.fire({
            title: 'Novedad de entrega de insumos',
            html: htmlContent,
            width: 820,
            showCancelButton: true,
            confirmButtonText: 'Guardar novedad',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#153753',
            cancelButtonColor: '#64748b',
            preConfirm: () => {
                const items = [];
                const motivosDetalle = [];
                let hayDiferencia = false;

                for (let idx = 0; idx < insumosData.length; idx++) {
                    const inputEntregar = document.getElementById(`novedad-entregar-${idx}`);
                    const inputDesc = document.getElementById(`novedad-desc-${idx}`);

                    const entregada = parseInt(inputEntregar.value);
                    const solicitada = parseInt(inputEntregar.dataset.solicitada);
                    const idInsumoSolicitud = parseInt(inputEntregar.dataset.id);
                    const nombreInsumo = inputEntregar.dataset.nombre;
                    const descMotivo = inputDesc ? inputDesc.value.trim() : '';

                    if (isNaN(entregada) || entregada < 0) {
                        Swal.showValidationMessage('Todas las cantidades a entregar deben ser números válidos y mayor o igual a 0');
                        return false;
                    }
                    if (entregada > solicitada) {
                        Swal.showValidationMessage(`La cantidad a entregar de "${nombreInsumo}" no puede superar la solicitada (${solicitada})`);
                        return false;
                    }

                    const aRestar = solicitada - entregada;
                    if (aRestar > 0) {
                        hayDiferencia = true;
                        if (descMotivo) {
                            motivosDetalle.push(`${nombreInsumo}: se entregan ${entregada}/${solicitada} (${aRestar} por entregar). Motivo: ${descMotivo}`);
                        } else {
                            motivosDetalle.push(`${nombreInsumo}: se entregan ${entregada}/${solicitada} (${aRestar} por entregar)`);
                        }
                    }

                    items.push({
                        Id_insumo_solicitud: idInsumoSolicitud,
                        cantidad_solicitada: solicitada,
                        cantidad_entregada: entregada
                    });
                }

                const obsGeneral = document.getElementById('novedad-observacion-general').value.trim();

                if (!hayDiferencia && !obsGeneral) {
                    Swal.showValidationMessage('No hay diferencias en las cantidades ni observaciones registradas.');
                    return false;
                }

                // Consolidar la observación completa para guardar en sol.novedad
                let observacionConsolidada = '';
                if (motivosDetalle.length > 0) {
                    observacionConsolidada = motivosDetalle.join(' | ');
                    if (obsGeneral) observacionConsolidada += ` — Nota: ${obsGeneral}`;
                } else {
                    observacionConsolidada = obsGeneral;
                }

                return { items, observacion: observacionConsolidada, motivosDetalle };
            }
        });

        if (!isConfirmed || !novedadData) return;

        // Resumen antes de aplicar los cambios en stock
        const devueltos = novedadData.items.filter(i => i.cantidad_entregada < i.cantidad_solicitada);
        let resumenHTML = '';
        if (devueltos.length > 0) {
            const listaHTML = devueltos.map(i => {
                const diff = i.cantidad_solicitada - i.cantidad_entregada;
                const nombre = insumosData.find(x => x.Id_insumo_solicitud === i.Id_insumo_solicitud)?.insumo?.Nom_Insumo || 'Insumo';
                return `<li style="padding: 3px 0; font-size: 13px;"><strong>${nombre}:</strong> <span style="color: #dc2626; font-weight: 700;">+${diff}</span> regresan al stock</li>`;
            }).join('');
            resumenHTML = `<ul style="list-style: none; padding: 0; margin: 10px 0; text-align: left;">${listaHTML}</ul>`;
        }

        const confirm2 = await Swal.fire({
            title: '¿Confirmar actualización de novedad?',
            html: `<p style="font-size: 13px; color: #64748b;">Los insumos por entregar (a restar) regresarán al stock del lote automáticamente.</p>${resumenHTML}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Volver',
            confirmButtonColor: '#153753',
            cancelButtonColor: '#64748b'
        });

        if (!confirm2.isConfirmed) return;

        // Enviar datos al backend
        try {
            await apiAxios.post('/api/solicitudes/novedad', {
                Id_solicitud: sol.Id_solicitud,
                observacion: novedadData.observacion,
                items: novedadData.items
            });
            Swal.fire({
                icon: 'success',
                title: 'Novedad registrada exitosamente',
                text: devueltos.length > 0 ? `Se actualizaron ${devueltos.length} insumo(s) y se devolvió la diferencia al stock` : 'Novedad guardada correctamente',
                timer: 2200,
                showConfirmButton: false
            });
            cargarSolicitudes();
            window.dispatchEvent(new Event('nuevaSolicitud'));
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'No se pudo registrar la novedad', 'error');
        }
    };

    const normalizar = (texto) =>
        (texto || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();

    // Lista de nombres únicos de solicitantes para autocompletado
    const solicitantesUnicos = Array.from(
        new Set(
            solicitudes
                .map(s => s.responsable?.Nom_Responsable)
                .filter(Boolean)
        )
    ).sort((a, b) => a.localeCompare(b));

    // Solicitudes del estado actual
    const solicitudesPorEstado = solicitudes.filter(
        sol => sol.ultimoEstado?.toLowerCase() === filtroEstado.toLowerCase()
    );

    // Solicitudes del estado actual filtradas por el nombre del solicitante
    const solicitudesFiltradas = solicitudesPorEstado.filter(sol => {
        if (!busquedaNombre.trim()) return true;
        const query = normalizar(busquedaNombre);
        const nombreResp = normalizar(sol.responsable?.Nom_Responsable);
        return nombreResp.includes(query);
    });

    const totalPaginas = Math.ceil(solicitudesFiltradas.length / ITEMS_POR_PAGINA) || 1;
    const solicitudesPaginadas = solicitudesFiltradas.slice(
        (paginaActual - 1) * ITEMS_POR_PAGINA,
        paginaActual * ITEMS_POR_PAGINA
    );

    // Contador por estado (toma en cuenta el filtro de búsqueda si está activo)
    const contarPorEstado = (estadoKey) => {
        if (busquedaNombre.trim()) {
            const query = normalizar(busquedaNombre);
            return solicitudes.filter(
                sol => sol.ultimoEstado?.toLowerCase() === estadoKey &&
                    normalizar(sol.responsable?.Nom_Responsable).includes(query)
            ).length;
        }
        return solicitudes.filter(sol => sol.ultimoEstado?.toLowerCase() === estadoKey).length;
    };

    return (
        <div className="tw-p-2">

            {/* Header */}
            <div className="tw-flex tw-items-center tw-justify-between tw-mb-6">
                <div className="tw-flex tw-items-center tw-gap-3">
                    <div className="tw-w-10 tw-h-10 tw-rounded-xl tw-bg-primario-900 tw-flex tw-items-center tw-justify-center tw-shadow-md">
                        <ClipboardList className="tw-w-5 tw-h-5 tw-text-secundario-400" />
                    </div>
                    <div>
                        <h1 className="tw-text-xl tw-font-bold tw-text-gray-800 tw-m-0">Solicitudes Pendientes</h1>
                        <p className="tw-text-sm tw-text-gray-500 tw-m-0">Gestiona y despacha cada solicitud de insumos</p>
                    </div>
                </div>
                <button
                    onClick={cargarSolicitudes}
                    className="tw-flex tw-items-center tw-gap-2 tw-px-3.5 tw-py-2 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-white tw-text-sm tw-text-gray-600 hover:tw-bg-gray-50 tw-transition-all tw-shadow-sm"
                >
                    <RefreshCw className="tw-w-4 tw-h-4" />
                    Actualizar
                </button>
            </div>

            {/* Tabs de Filtro por Estado */}
            <div className="tw-flex tw-gap-2 tw-mb-4 tw-bg-white tw-p-1.5 tw-rounded-xl tw-shadow-sm tw-border tw-border-gray-100 tw-overflow-x-auto">
                <button
                    onClick={() => { setFiltroEstado("solicitado"); setPaginaActual(1); }}
                    className={`tw-flex-1 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-4 tw-py-2.5 tw-rounded-lg tw-text-sm tw-font-medium tw-transition-all tw-whitespace-nowrap ${
                        filtroEstado === "solicitado"
                            ? "tw-bg-amber-100 tw-text-amber-800 tw-shadow-sm tw-font-semibold"
                            : "tw-text-gray-500 hover:tw-bg-gray-50 hover:tw-text-gray-700"
                    }`}
                >
                    <span>Solicitadas</span>
                    <span className={`tw-px-2 tw-py-0.5 tw-text-xs tw-rounded-full tw-font-bold ${
                        filtroEstado === "solicitado"
                            ? "tw-bg-amber-200/80 tw-text-amber-900"
                            : "tw-bg-gray-100 tw-text-gray-600"
                    }`}>
                        {contarPorEstado("solicitado")}
                    </span>
                </button>
                <button
                    onClick={() => { setFiltroEstado("proceso"); setPaginaActual(1); }}
                    className={`tw-flex-1 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-4 tw-py-2.5 tw-rounded-lg tw-text-sm tw-font-medium tw-transition-all tw-whitespace-nowrap ${
                        filtroEstado === "proceso"
                            ? "tw-bg-blue-100 tw-text-blue-800 tw-shadow-sm tw-font-semibold"
                            : "tw-text-gray-500 hover:tw-bg-gray-50 hover:tw-text-gray-700"
                    }`}
                >
                    <span>En Proceso</span>
                    <span className={`tw-px-2 tw-py-0.5 tw-text-xs tw-rounded-full tw-font-bold ${
                        filtroEstado === "proceso"
                            ? "tw-bg-blue-200/80 tw-text-blue-900"
                            : "tw-bg-gray-100 tw-text-gray-600"
                    }`}>
                        {contarPorEstado("proceso")}
                    </span>
                </button>
                <button
                    onClick={() => { setFiltroEstado("despachado"); setPaginaActual(1); }}
                    className={`tw-flex-1 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-4 tw-py-2.5 tw-rounded-lg tw-text-sm tw-font-medium tw-transition-all tw-whitespace-nowrap ${
                        filtroEstado === "despachado"
                            ? "tw-bg-emerald-100 tw-text-emerald-800 tw-shadow-sm tw-font-semibold"
                            : "tw-text-gray-500 hover:tw-bg-gray-50 hover:tw-text-gray-700"
                    }`}
                >
                    <span>Despachadas</span>
                    <span className={`tw-px-2 tw-py-0.5 tw-text-xs tw-rounded-full tw-font-bold ${
                        filtroEstado === "despachado"
                            ? "tw-bg-emerald-200/80 tw-text-emerald-900"
                            : "tw-bg-gray-100 tw-text-gray-600"
                    }`}>
                        {contarPorEstado("despachado")}
                    </span>
                </button>
                <button
                    onClick={() => { setFiltroEstado("cancelado"); setPaginaActual(1); }}
                    className={`tw-flex-1 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-4 tw-py-2.5 tw-rounded-lg tw-text-sm tw-font-medium tw-transition-all tw-whitespace-nowrap ${
                        filtroEstado === "cancelado"
                            ? "tw-bg-red-100 tw-text-red-800 tw-shadow-sm tw-font-semibold"
                            : "tw-text-gray-500 hover:tw-bg-gray-50 hover:tw-text-gray-700"
                    }`}
                >
                    <span>Canceladas</span>
                    <span className={`tw-px-2 tw-py-0.5 tw-text-xs tw-rounded-full tw-font-bold ${
                        filtroEstado === "cancelado"
                            ? "tw-bg-red-200/80 tw-text-red-900"
                            : "tw-bg-gray-100 tw-text-gray-600"
                    }`}>
                        {contarPorEstado("cancelado")}
                    </span>
                </button>
            </div>

            {/* Filtro por Nombre del Solicitante */}
            <div className="tw-bg-white tw-p-3.5 tw-rounded-xl tw-shadow-sm tw-border tw-border-gray-100 tw-mb-5 tw-flex tw-flex-col sm:tw-flex-row tw-items-center tw-justify-between tw-gap-3">
                <div className="tw-relative tw-w-full sm:tw-w-96">
                    <Search className="tw-absolute tw-left-3 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-gray-400" />
                    <input
                        type="text"
                        list="lista-solicitantes"
                        value={busquedaNombre}
                        onChange={(e) => { setBusquedaNombre(e.target.value); setPaginaActual(1); }}
                        placeholder="Buscar por nombre del solicitante..."
                        className="tw-w-full tw-pl-9 tw-pr-9 tw-py-2 tw-text-sm tw-border tw-border-gray-200 tw-rounded-lg tw-bg-gray-50 focus:tw-bg-white focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-primario-500/20 focus:tw-border-primario-500 tw-transition-all"
                    />
                    {busquedaNombre && (
                        <button
                            type="button"
                            onClick={() => { setBusquedaNombre(""); setPaginaActual(1); }}
                            className="tw-absolute tw-right-2.5 tw-top-1/2 -tw-translate-y-1/2 tw-text-gray-400 hover:tw-text-gray-600 tw-p-0.5 tw-rounded-full hover:tw-bg-gray-100 tw-transition-colors"
                            title="Limpiar búsqueda"
                        >
                            <X className="tw-w-4 tw-h-4" />
                        </button>
                    )}
                    <datalist id="lista-solicitantes">
                        {solicitantesUnicos.map((nom, idx) => (
                            <option key={idx} value={nom} />
                        ))}
                    </datalist>
                </div>

                <div className="tw-flex tw-items-center tw-gap-2 tw-text-xs tw-text-gray-500 tw-w-full sm:tw-w-auto tw-justify-between sm:tw-justify-end">
                    {busquedaNombre.trim() ? (
                        <div className="tw-flex tw-items-center tw-gap-1.5 tw-bg-amber-50 tw-text-amber-800 tw-px-2.5 tw-py-1 tw-rounded-lg tw-border tw-border-amber-200">
                            <User className="tw-w-3.5 tw-h-3.5 tw-text-amber-600" />
                            <span>
                                Filtrando por solicitante: <strong>"{busquedaNombre}"</strong>
                            </span>
                            <span className="tw-font-bold tw-ml-1">
                                ({solicitudesFiltradas.length} {solicitudesFiltradas.length === 1 ? 'coincidencia' : 'coincidencias'})
                            </span>
                        </div>
                    ) : (
                        <span className="tw-text-gray-400">
                            Mostrando <strong>{solicitudesPorEstado.length}</strong> {solicitudesPorEstado.length === 1 ? 'solicitud' : 'solicitudes'} en este estado
                        </span>
                    )}
                </div>
            </div>

            {/* Loading */}
            {loading ? (
                <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-20 tw-gap-3">
                    <Loader2 className="tw-w-8 tw-h-8 tw-text-primario-500 tw-animate-spin" />
                    <p className="tw-text-gray-500 tw-text-sm">Cargando solicitudes...</p>
                </div>
            ) : solicitudesPorEstado.length === 0 ? (
                <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-20 tw-gap-3">
                    <div className="tw-w-16 tw-h-16 tw-rounded-2xl tw-bg-gray-100 tw-flex tw-items-center tw-justify-center">
                        <ClipboardList className="tw-w-8 tw-h-8 tw-text-gray-400" />
                    </div>
                    <p className="tw-text-gray-500 tw-font-medium">
                        No hay solicitudes {filtroEstado === "solicitado" ? "solicitadas" : filtroEstado === "proceso" ? "en proceso" : filtroEstado === "despachado" ? "despachadas" : "canceladas"}
                    </p>
                    <p className="tw-text-gray-400 tw-text-sm">Todas las solicitudes en este estado están al día</p>
                </div>
            ) : solicitudesFiltradas.length === 0 ? (
                <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-16 tw-gap-3 tw-bg-white tw-rounded-2xl tw-border tw-border-gray-100 tw-shadow-sm">
                    <div className="tw-w-14 tw-h-14 tw-rounded-2xl tw-bg-amber-50 tw-flex tw-items-center tw-justify-center">
                        <Search className="tw-w-7 tw-h-7 tw-text-amber-500" />
                    </div>
                    <p className="tw-text-gray-700 tw-font-semibold tw-text-base tw-m-0">
                        No se encontraron solicitudes para "{busquedaNombre}"
                    </p>
                    <p className="tw-text-gray-400 tw-text-sm tw-m-0">
                        No hay solicitudes de este solicitante en el estado {filtroEstado === "solicitado" ? "Solicitadas" : filtroEstado === "proceso" ? "En Proceso" : filtroEstado === "despachado" ? "Despachadas" : "Canceladas"}.
                    </p>
                    <button
                        onClick={() => setBusquedaNombre("")}
                        className="tw-mt-2 tw-px-4 tw-py-2 tw-text-xs tw-font-semibold tw-text-primario-900 tw-bg-primario-50 hover:tw-bg-primario-100 tw-rounded-lg tw-transition-colors"
                    >
                        Limpiar filtro de búsqueda
                    </button>
                </div>
            ) : (
                <div className="tw-flex tw-flex-col tw-gap-4">
                    {solicitudesPaginadas.map(sol => (
                        <div
                            key={sol.Id_solicitud}
                            className="tw-bg-white tw-rounded-2xl tw-shadow-sm tw-border tw-border-gray-100 tw-overflow-hidden hover:tw-shadow-md tw-transition-shadow tw-duration-200"
                        >
                            {/* Card header */}
                            <div className="tw-flex tw-items-center tw-justify-between tw-px-5 tw-py-3.5 tw-bg-primario-900">
                                <div className="tw-flex tw-items-center tw-gap-2">
                                    <span className="tw-text-secundario-400 tw-font-bold tw-text-sm">#{sol.Id_solicitud}</span>
                                    <span className="tw-text-primario-200 tw-text-sm tw-font-medium">
                                        — {sol.responsable?.Nom_Responsable ?? "Sin responsable"}
                                    </span>
                                    <span className="tw-ml-2 tw-inline-flex tw-items-center tw-gap-1 tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-[11px] tw-font-bold tw-bg-primario-800 tw-text-secundario-300 tw-border tw-border-primario-700">
                                        {sol.Tip_solicitud === 'PRESENTACION' ? (
                                            <>
                                                <Package className="tw-w-3 tw-h-3" />
                                                <span>Empaque completo</span>
                                            </>
                                        ) : (
                                            <>
                                                <Scale className="tw-w-3 tw-h-3" />
                                                <span>Cantidad exacta</span>
                                            </>
                                        )}
                                    </span>
                                </div>
                                <EstadoBadge estado={sol.ultimoEstado} />
                            </div>

                            {/* Card body */}
                            <div className="tw-px-5 tw-py-4">

                                {/* Info grid */}
                                <div className="tw-grid tw-grid-cols-2 md:tw-grid-cols-5 tw-gap-4 tw-mb-4">
                                    <div>
                                        <div className="tw-flex tw-items-center tw-gap-1.5 tw-mb-0.5">
                                            <FileText className="tw-w-3.5 tw-h-3.5 tw-text-gray-400" />
                                            <span className="tw-text-xs tw-text-gray-500 tw-font-medium">Motivo</span>
                                        </div>
                                        <p className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-m-0">{sol.motivo}</p>
                                    </div>
                                    <div>
                                        <div className="tw-flex tw-items-center tw-gap-1.5 tw-mb-0.5">
                                            <FileText className="tw-w-3.5 tw-h-3.5 tw-text-gray-400" />
                                            <span className="tw-text-xs tw-text-gray-500 tw-font-medium">Descripción</span>
                                        </div>
                                        <p className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-m-0">{sol.Descripcion || "Sin descripción"}</p>
                                    </div>
                                    <div>
                                        <div className="tw-flex tw-items-center tw-gap-1.5 tw-mb-0.5">
                                            <Hash className="tw-w-3.5 tw-h-3.5 tw-text-gray-400" />
                                            <span className="tw-text-xs tw-text-gray-500 tw-font-medium">Ficha</span>
                                        </div>
                                        <p className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-m-0">{sol.Ficha || "N/A"}</p>
                                    </div>
                                    <div>
                                        <div className="tw-flex tw-items-center tw-gap-1.5 tw-mb-0.5">
                                            <MapPin className="tw-w-3.5 tw-h-3.5 tw-text-gray-400" />
                                            <span className="tw-text-xs tw-text-gray-500 tw-font-medium">Destino</span>
                                        </div>
                                        <p className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-m-0">{sol.destino?.Nom_Destino || "N/A"}</p>
                                    </div>
                                    <div>
                                        <div className="tw-flex tw-items-center tw-gap-1.5 tw-mb-0.5">
                                            <Calendar className="tw-w-3.5 tw-h-3.5 tw-text-gray-400" />
                                            <span className="tw-text-xs tw-text-gray-500 tw-font-medium">Fecha entrega</span>
                                        </div>
                                        <p className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-m-0">{sol.Fec_entrega}</p>
                                    </div>
                                </div>

                                {/* Observaciones de la solicitud (si las tiene) */}
                                {sol.Observaciones && (
                                    <div className="tw-mb-4 tw-px-3.5 tw-py-2 tw-rounded-xl tw-bg-slate-50 tw-border tw-border-slate-200 tw-text-xs tw-text-slate-700">
                                        <strong className="tw-text-slate-900">Nota / Observaciones:</strong> {sol.Observaciones}
                                    </div>
                                )}

                                {/* Divider */}
                                <div className="tw-border-t tw-border-gray-100 tw-mb-4" />

                                {/* Tabla insumos */}
                                <p className="tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wider tw-mb-2 tw-flex tw-items-center tw-gap-1.5">
                                    <Package className="tw-w-3.5 tw-h-3.5" />
                                    Insumos solicitados
                                </p>

                                {(sol.insumos || []).length === 0 ? (
                                    <p className="tw-text-sm tw-text-gray-400 tw-italic tw-mb-4">Sin insumos registrados</p>
                                ) : (
                                    <div className="tw-rounded-xl tw-border tw-border-gray-100 tw-overflow-hidden tw-mb-4">
                                        <table className="tw-w-full tw-text-sm">
                                            <thead>
                                                <tr className="tw-bg-gray-50">
                                                    <th className="tw-text-left tw-px-4 tw-py-2.5 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wide">Insumo</th>
                                                    <th className="tw-text-left tw-px-4 tw-py-2.5 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wide">Lote</th>
                                                    <th className="tw-text-left tw-px-4 tw-py-2.5 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wide">Cantidad</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(sol.insumos || []).map((item, index) => (
                                                    <tr key={item.Id_insumo_solicitud || index} className="tw-border-t tw-border-gray-100 hover:tw-bg-gray-50 tw-transition-colors">
                                                        <td className="tw-px-4 tw-py-2.5 tw-text-gray-700">
                                                            <span className="tw-font-medium">{item.insumo?.Nom_Insumo ?? `Insumo #${item.Id_insumos}`}</span>
                                                        </td>
                                                        <td className="tw-px-4 tw-py-2.5">
                                                            {(() => {
                                                                const esModoCantidad = String(sol.Tip_solicitud || 'CANTIDAD').toUpperCase() === 'CANTIDAD';
                                                                const estadoActual = sol.ultimoEstado?.toLowerCase();
                                                                const puedeCambiarLote = esModoCantidad && (estadoActual === 'solicitado' || estadoActual === 'proceso');

                                                                const lotesCandidatos = (item.insumo?.entradas || []).filter(e => {
                                                                    if (e.Id_Entradas === item.Id_Entradas) return true;
                                                                    if (e.Estado !== 'STOCK') return false;
                                                                    const disp = Number(e.Can_Inicial) - Number(e.Can_Salida);
                                                                    return disp >= Number(item.cantidad_solicitada);
                                                                });

                                                                if (puedeCambiarLote && lotesCandidatos.length > 1) {
                                                                    return (
                                                                        <div className="tw-flex tw-flex-col tw-gap-1">
                                                                            <div className="tw-flex tw-items-center tw-gap-1.5">
                                                                                <select
                                                                                    value={item.Id_Entradas}
                                                                                    onChange={(e) => handleCambiarLote(item, Number(e.target.value), sol)}
                                                                                    className="tw-text-xs tw-font-semibold tw-bg-amber-50 tw-border tw-border-amber-300 tw-text-amber-900 tw-rounded-lg tw-px-2 tw-py-1 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-amber-400 tw-cursor-pointer hover:tw-bg-amber-100 tw-transition-colors"
                                                                                    title="Cambiar lote asignado (solicitud por cantidad exacta)"
                                                                                >
                                                                                    {lotesCandidatos.map(lote => {
                                                                                        const esActual = lote.Id_Entradas === item.Id_Entradas;
                                                                                        const disp = esActual
                                                                                            ? (Number(lote.Can_Inicial) - Number(lote.Can_Salida) + Number(item.cantidad_solicitada))
                                                                                            : (Number(lote.Can_Inicial) - Number(lote.Can_Salida));
                                                                                        return (
                                                                                            <option key={lote.Id_Entradas} value={lote.Id_Entradas}>
                                                                                                {lote.Lote} {esActual ? '(Asignado)' : `(Disp: ${disp} ${lote.Uni_medida})`}
                                                                                            </option>
                                                                                        );
                                                                                    })}
                                                                                </select>
                                                                            </div>
                                                                            <span className="tw-text-[11px] tw-text-gray-400">
                                                                                (Vence: {fmtFechaVencimiento(item.entrada?.Fec_Ven_Entrada)})
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                }

                                                                return (
                                                                    <div className="tw-flex tw-items-center tw-gap-1.5">
                                                                        <span className="tw-inline-flex tw-items-center tw-gap-1 tw-px-2 tw-py-0.5 tw-rounded-md tw-bg-gray-100 tw-text-gray-600 tw-text-xs tw-font-medium">
                                                                            <Package className="tw-w-3 tw-h-3" />
                                                                            {item.entrada?.Lote ?? "—"}
                                                                        </span>
                                                                        <span className="tw-text-[11px] tw-text-gray-400">
                                                                            (Vence: {fmtFechaVencimiento(item.entrada?.Fec_Ven_Entrada)})
                                                                        </span>
                                                                        {puedeCambiarLote && lotesCandidatos.length <= 1 && (
                                                                            <span className="tw-text-[10px] tw-text-gray-400 tw-italic">
                                                                                (Único lote)
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })()}
                                                        </td>
                                                        <td className="tw-px-4 tw-py-2.5">
                                                            <span className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-md tw-bg-primario-50 tw-text-primario-900 tw-font-bold tw-text-xs">
                                                                {fmtCantidadConPresentacion(item.cantidad_solicitada, item.insumo || item.entrada)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Botones de acción */}
                                <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-2 tw-justify-between">
                                    <div className="tw-flex tw-flex-wrap tw-gap-2">
                                        {sol.ultimoEstado?.toLowerCase() === "solicitado" && (
                                            <>
                                                <button
                                                    onClick={() => cambiarEstado(sol.Id_solicitud, 2, "proceso")}
                                                    className="tw-flex tw-items-center tw-gap-1.5 tw-px-4 tw-py-2 tw-rounded-lg tw-bg-primario-900 tw-text-white tw-text-sm tw-font-medium hover:tw-bg-primario-700 tw-transition-all tw-shadow-sm"
                                                >
                                                    <CheckCircle className="tw-w-4 tw-h-4" /> Aceptar
                                                </button>
                                                <button
                                                    onClick={() => cambiarEstado(sol.Id_solicitud, 4, "cancelado")}
                                                    className="tw-flex tw-items-center tw-gap-1.5 tw-px-4 tw-py-2 tw-rounded-lg tw-bg-red-500 tw-text-white tw-text-sm tw-font-medium hover:tw-bg-red-600 tw-transition-all tw-shadow-sm"
                                                >
                                                    <X className="tw-w-4 tw-h-4" /> Cancelar
                                                </button>
                                            </>
                                        )}
                                        {sol.ultimoEstado?.toLowerCase() === "proceso" && (
                                            <>
                                                <button
                                                    onClick={() => cambiarEstado(sol.Id_solicitud, 3, "despachado")}
                                                    className="tw-flex tw-items-center tw-gap-1.5 tw-px-4 tw-py-2 tw-rounded-lg tw-bg-green-600 tw-text-white tw-text-sm tw-font-medium hover:tw-bg-green-700 tw-transition-all tw-shadow-sm"
                                                >
                                                    <Truck className="tw-w-4 tw-h-4" /> Despachar
                                                </button>
                                                <button
                                                    onClick={() => cambiarEstado(sol.Id_solicitud, 4, "cancelado")}
                                                    className="tw-flex tw-items-center tw-gap-1.5 tw-px-4 tw-py-2 tw-rounded-lg tw-bg-red-500 tw-text-white tw-text-sm tw-font-medium hover:tw-bg-red-600 tw-transition-all tw-shadow-sm"
                                                >
                                                    <X className="tw-w-4 tw-h-4" /> Cancelar
                                                </button>
                                            </>
                                        )}
                                        {sol.ultimoEstado?.toLowerCase() === "despachado" && (
                                            <span className="tw-flex tw-items-center tw-gap-1.5 tw-px-4 tw-py-2 tw-rounded-lg tw-bg-green-50 tw-text-green-700 tw-text-sm tw-font-medium tw-border tw-border-green-200">
                                                <CheckCircle className="tw-w-4 tw-h-4" /> Despachado
                                            </span>
                                        )}
                                        {sol.ultimoEstado?.toLowerCase() === "cancelado" && (
                                            <div className="tw-flex tw-flex-col tw-gap-2">
                                                <span className="tw-flex tw-items-center tw-gap-1.5 tw-px-4 tw-py-2 tw-rounded-lg tw-bg-red-50 tw-text-red-600 tw-text-sm tw-font-medium tw-border tw-border-red-200">
                                                    <XCircle className="tw-w-4 tw-h-4" /> Cancelado
                                                </span>
                                                {sol.motivo_cancelacion && (
                                                    <div className="tw-flex tw-items-start tw-gap-2 tw-px-4 tw-py-2.5 tw-rounded-lg tw-bg-red-50 tw-border tw-border-red-100">
                                                        <MessageSquare className="tw-w-4 tw-h-4 tw-text-red-400 tw-mt-0.5 tw-shrink-0" />
                                                        <div>
                                                            <p className="tw-text-xs tw-font-semibold tw-text-red-500 tw-m-0 tw-mb-0.5">Motivo de cancelación</p>
                                                            <p className="tw-text-sm tw-text-red-700 tw-m-0">{sol.motivo_cancelacion}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Botón Novedad — deshabilitado si está despachado/cancelado sin novedad previamente registrada */}
                                    {(() => {
                                        const estadoActual = sol.ultimoEstado?.toLowerCase();
                                        const esFinalizado = estadoActual === "despachado" || estadoActual === "cancelado";
                                        const deshabilitado = esFinalizado && !sol.novedad;

                                        return (
                                            <button
                                                onClick={() => guardarNovedad(sol)}
                                                disabled={deshabilitado}
                                                className={`tw-flex tw-items-center tw-gap-1.5 tw-px-4 tw-py-2 tw-rounded-lg tw-text-sm tw-font-medium tw-transition-all tw-shadow-sm tw-border ${deshabilitado
                                                    ? "tw-bg-gray-100 tw-text-gray-400 tw-border-gray-200 tw-cursor-not-allowed tw-shadow-none"
                                                    : sol.novedad
                                                        ? "tw-bg-amber-50 tw-text-amber-700 tw-border-amber-200 hover:tw-bg-amber-100"
                                                        : "tw-bg-gray-50 tw-text-gray-600 tw-border-gray-200 hover:tw-bg-gray-100"
                                                    }`}
                                                title={
                                                    deshabilitado
                                                        ? "No se pueden registrar novedades en solicitudes despachadas o canceladas"
                                                        : sol.novedad
                                                            ? `Ver Novedad: ${sol.novedad}`
                                                            : "Agregar novedad de entrega"
                                                }
                                            >
                                                <AlertTriangle className="tw-w-4 tw-h-4" />
                                                Novedad
                                                {sol.novedad && (
                                                    <span className="tw-w-2 tw-h-2 tw-rounded-full tw-bg-amber-500 tw-inline-block" />
                                                )}
                                            </button>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Controles de paginación */}
                    {totalPaginas > 1 && (
                        <div className="tw-flex tw-flex-col sm:tw-flex-row tw-items-center tw-justify-between tw-gap-3 tw-bg-white tw-px-5 tw-py-3.5 tw-rounded-2xl tw-border tw-border-slate-200/80 tw-shadow-sm tw-mt-2">
                            <span className="tw-text-xs tw-text-slate-500">
                                Mostrando <strong>{(paginaActual - 1) * ITEMS_POR_PAGINA + 1}</strong> a <strong>{Math.min(paginaActual * ITEMS_POR_PAGINA, solicitudesFiltradas.length)}</strong> de <strong>{solicitudesFiltradas.length}</strong> solicitudes
                            </span>
                            <div className="tw-flex tw-items-center tw-gap-1.5">
                                <button
                                    type="button"
                                    disabled={paginaActual === 1}
                                    onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                                    className={`tw-p-2 tw-rounded-xl tw-border tw-text-xs tw-font-semibold tw-flex tw-items-center tw-gap-1 tw-transition-colors ${paginaActual === 1 ? "tw-border-slate-200 tw-text-slate-300 tw-cursor-not-allowed" : "tw-border-slate-200 tw-text-slate-700 hover:tw-bg-slate-50"}`}
                                >
                                    <ChevronLeft className="tw-w-4 tw-h-4" />
                                    <span>Anterior</span>
                                </button>
                                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setPaginaActual(num)}
                                        className={`tw-w-8 tw-h-8 tw-rounded-xl tw-text-xs tw-font-bold tw-transition-all ${paginaActual === num ? "tw-bg-primario-900 tw-text-white tw-shadow-sm" : "tw-text-slate-600 hover:tw-bg-slate-100"}`}
                                    >
                                        {num}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    disabled={paginaActual === totalPaginas}
                                    onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                                    className={`tw-p-2 tw-rounded-xl tw-border tw-text-xs tw-font-semibold tw-flex tw-items-center tw-gap-1 tw-transition-colors ${paginaActual === totalPaginas ? "tw-border-slate-200 tw-text-slate-300 tw-cursor-not-allowed" : "tw-border-slate-200 tw-text-slate-700 hover:tw-bg-slate-50"}`}
                                >
                                    <span>Siguiente</span>
                                    <ChevronRight className="tw-w-4 tw-h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SolicitudPendientes;