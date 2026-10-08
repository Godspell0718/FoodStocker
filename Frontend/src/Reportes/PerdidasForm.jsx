import { useState, useEffect } from 'react';
import apiAxios from '../api/axiosConfig.js';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Save, X, ArrowLeft, ChevronDown, PackageX, AlertCircle } from 'lucide-react';

const inputClass = "tw-w-full tw-px-4 tw-py-2.5 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-gray-50 tw-text-sm tw-text-gray-700 focus:tw-outline-none focus:tw-border-primario-500 focus:tw-ring-2 focus:tw-ring-primario-100 focus:tw-bg-white tw-transition-all";
const labelClass = "tw-block tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wide tw-mb-1.5";
const selectClass = "tw-w-full tw-px-4 tw-py-2.5 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-gray-50 tw-text-sm tw-text-gray-700 focus:tw-outline-none focus:tw-border-primario-500 focus:tw-ring-2 focus:tw-ring-primario-100 focus:tw-bg-white tw-transition-all tw-appearance-none";

const PerdidasForm = ({ hideModal, refreshTable, perdidaSeleccionada }) => {
    const routeParams = useParams();
    const navigate = useNavigate();
    const isModalMode = typeof hideModal === 'function';

    const currentId = perdidaSeleccionada?.Id_Perdida || routeParams?.id;
    const isEditing = Boolean(currentId);

    const [formData, setFormData] = useState({
        Id_Insumo: '',
        Id_Entrada: '',
        Cantidad: '',
        Motivo: 'VENCIMIENTO',
        Observaciones: '',
        Id_Responsable: ''
    });

    const [insumos, setInsumos] = useState([]);
    const [entradas, setEntradas] = useState([]);
    const [responsables, setResponsables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cargandoDatos, setCargandoDatos] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        cargarDatosIniciales();
    }, [currentId]);

    const cargarDatosIniciales = async () => {
        try {
            setCargandoDatos(true);
            const [insumosRes, entradasRes, responsablesRes] = await Promise.all([
                apiAxios.get('/api/insumos'),
                apiAxios.get('/api/entradas'),
                apiAxios.get('/api/responsables')
            ]);

            const listaInsumos = Array.isArray(insumosRes.data) ? insumosRes.data : [];
            const listaEntradas = Array.isArray(entradasRes.data) ? entradasRes.data : [];
            const listaResponsables = Array.isArray(responsablesRes.data) ? responsablesRes.data : [];

            setInsumos(listaInsumos);
            setEntradas(listaEntradas);
            setResponsables(listaResponsables);

            // Obtener el responsable por defecto desde la sesión si es nuevo
            const currentUser = JSON.parse(localStorage.getItem('userFoodStocker') || '{}');
            const defaultResp = currentUser.id ? String(currentUser.id) : '';

            if (isEditing) {
                if (perdidaSeleccionada) {
                    setFormData({
                        Id_Insumo: perdidaSeleccionada.Id_Insumo || '',
                        Id_Entrada: perdidaSeleccionada.Id_Entrada || '',
                        Cantidad: perdidaSeleccionada.Cantidad ?? '',
                        Motivo: perdidaSeleccionada.Motivo || 'VENCIMIENTO',
                        Observaciones: perdidaSeleccionada.Observaciones || '',
                        Id_Responsable: perdidaSeleccionada.Id_Responsable || defaultResp
                    });
                } else if (currentId) {
                    const res = await apiAxios.get(`/api/perdidas/${currentId}`);
                    const p = res.data;
                    setFormData({
                        Id_Insumo: p.Id_Insumo || '',
                        Id_Entrada: p.Id_Entrada || '',
                        Cantidad: p.Cantidad ?? '',
                        Motivo: p.Motivo || 'VENCIMIENTO',
                        Observaciones: p.Observaciones || '',
                        Id_Responsable: p.Id_Responsable || defaultResp
                    });
                }
            } else {
                setFormData(prev => ({
                    ...prev,
                    Id_Responsable: defaultResp || prev.Id_Responsable
                }));
            }
        } catch (err) {
            console.error('Error cargando datos del formulario:', err);
            setError('Error al cargar la información requerida.');
        } finally {
            setCargandoDatos(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleInsumoChange = (e) => {
        const nuevoInsumo = e.target.value;
        setFormData(prev => ({
            ...prev,
            Id_Insumo: nuevoInsumo,
            Id_Entrada: '' // Resetear lote al cambiar insumo
        }));
    };

    const insumoSeleccionado = insumos.find(i => String(i.Id_Insumos) === String(formData.Id_Insumo));

    const entradasFiltradas = entradas.filter(e => {
        if (!formData.Id_Insumo) return false;
        const coincideInsumo = String(e.Id_Insumos) === String(formData.Id_Insumo);
        const tieneStock = (Number(e.Can_Inicial) - Number(e.Can_Salida)) > 0;
        const esElSeleccionado = String(e.Id_Entradas) === String(formData.Id_Entrada);
        return coincideInsumo && (tieneStock || esElSeleccionado);
    });

    const handleCancel = () => {
        if (isModalMode) {
            hideModal();
        } else {
            navigate('/perdidas');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.Id_Insumo) {
            setError('Por favor, selecciona un insumo.');
            return;
        }

        if (!formData.Cantidad || Number(formData.Cantidad) <= 0) {
            setError('La cantidad perdida debe ser mayor a 0.');
            return;
        }

        if (!formData.Id_Responsable) {
            setError('Por favor, selecciona el responsable que reporta.');
            return;
        }

        setLoading(true);

        try {
            const dataToSubmit = {
                Id_Insumo: Number(formData.Id_Insumo),
                Id_Entrada: formData.Id_Entrada ? Number(formData.Id_Entrada) : null,
                Cantidad: Number(formData.Cantidad),
                Motivo: formData.Motivo,
                Observaciones: formData.Observaciones ? formData.Observaciones.trim() : '',
                Id_Responsable: Number(formData.Id_Responsable)
            };

            if (isEditing) {
                await apiAxios.put(`/api/perdidas/${currentId}`, dataToSubmit);
                Swal.fire({
                    icon: 'success',
                    title: 'Reporte actualizado',
                    text: 'Los cambios fueron guardados correctamente.',
                    timer: 1800,
                    showConfirmButton: false
                });
            } else {
                await apiAxios.post('/api/perdidas', dataToSubmit);
                Swal.fire({
                    icon: 'success',
                    title: 'Reporte registrado',
                    text: 'La pérdida ha sido registrada correctamente.',
                    timer: 1800,
                    showConfirmButton: false
                });
            }

            if (refreshTable) refreshTable();
            if (isModalMode) {
                hideModal();
            } else {
                navigate('/perdidas');
            }
        } catch (err) {
            console.error('Error guardando reporte de pérdida:', err);
            setError(err.response?.data?.mensaje || err.response?.data?.error || 'Error al guardar el reporte de pérdida.');
        } finally {
            setLoading(false);
        }
    };

    const formContent = (
        <form onSubmit={handleSubmit} className="tw-space-y-5">
            {error && (
                <div className="tw-p-4 tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-xl tw-flex tw-items-center tw-gap-3 tw-text-sm tw-text-red-700">
                    <AlertCircle className="tw-w-5 tw-h-5 tw-text-red-500 tw-flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-5">
                {/* Insumo */}
                <div className="tw-space-y-1">
                    <label className={labelClass}>
                        Insumo <span className="tw-text-red-500">*</span>
                    </label>
                    <div className="tw-relative">
                        <select
                            name="Id_Insumo"
                            value={formData.Id_Insumo}
                            onChange={handleInsumoChange}
                            required
                            className={selectClass}
                        >
                            <option value="">Seleccione un insumo</option>
                            {insumos.map((insumo) => (
                                <option key={insumo.Id_Insumos} value={insumo.Id_Insumos}>
                                    {insumo.Nom_Insumo} ({insumo.Uni_medida || '—'})
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="tw-absolute tw-right-4 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-gray-400 tw-pointer-events-none" />
                    </div>
                </div>

                {/* Lote / Entrada */}
                <div className="tw-space-y-1">
                    <label className={labelClass}>
                        Lote / Entrada Afectada
                    </label>
                    <div className="tw-relative">
                        <select
                            name="Id_Entrada"
                            value={formData.Id_Entrada}
                            onChange={handleChange}
                            className={selectClass}
                            disabled={!formData.Id_Insumo}
                        >
                            <option value="">
                                {!formData.Id_Insumo 
                                    ? "Primero elija un insumo" 
                                    : entradasFiltradas.length === 0 
                                        ? "Sin lotes con stock disponible" 
                                        : "Seleccione un lote (Opcional)"}
                            </option>
                            {entradasFiltradas.map((entrada) => {
                                const disponible = (entrada.Can_Inicial || 0) - (entrada.Can_Salida || 0);
                                return (
                                    <option key={entrada.Id_Entradas} value={entrada.Id_Entradas}>
                                        Lote: {entrada.Lote} — Disp: {disponible} {entrada.Uni_medida || insumoSeleccionado?.Uni_medida || ''}
                                    </option>
                                );
                            })}
                        </select>
                        <ChevronDown className="tw-absolute tw-right-4 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-gray-400 tw-pointer-events-none" />
                    </div>
                </div>

                {/* Cantidad */}
                <div className="tw-space-y-1">
                    <label className={labelClass}>
                        Cantidad Perdida <span className="tw-text-red-500">*</span>
                    </label>
                    <div className="tw-relative">
                        <input
                            type="number"
                            name="Cantidad"
                            value={formData.Cantidad}
                            onChange={handleChange}
                            required
                            min="0.01"
                            step="any"
                            className={`${inputClass} tw-pr-14`}
                            placeholder="Ej: 5"
                        />
                        <span className="tw-absolute tw-right-4 tw-top-1/2 -tw-translate-y-1/2 tw-text-xs tw-font-semibold tw-text-gray-400">
                            {insumoSeleccionado?.Uni_medida || 'und'}
                        </span>
                    </div>
                </div>

                {/* Motivo */}
                <div className="tw-space-y-1">
                    <label className={labelClass}>
                        Motivo de la Pérdida <span className="tw-text-red-500">*</span>
                    </label>
                    <div className="tw-relative">
                        <select
                            name="Motivo"
                            value={formData.Motivo}
                            onChange={handleChange}
                            required
                            className={selectClass}
                        >
                            <option value="VENCIMIENTO">Vencimiento</option>
                            <option value="DAÑO_FISICO">Daño Físico</option>
                            <option value="CONTAMINACION">Contaminación</option>
                            <option value="OTROS">Otros</option>
                        </select>
                        <ChevronDown className="tw-absolute tw-right-4 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-gray-400 tw-pointer-events-none" />
                    </div>
                </div>

                {/* Responsable */}
                <div className="tw-space-y-1 md:tw-col-span-2">
                    <label className={labelClass}>
                        Responsable que reporta <span className="tw-text-red-500">*</span>
                    </label>
                    <div className="tw-relative">
                        <select
                            name="Id_Responsable"
                            value={formData.Id_Responsable}
                            onChange={handleChange}
                            required
                            className={selectClass}
                        >
                            <option value="">Seleccione el responsable</option>
                            {responsables.map((responsable) => (
                                <option key={responsable.Id_Responsable} value={responsable.Id_Responsable}>
                                    {responsable.Nom_Responsable} ({responsable.Tip_Responsable})
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="tw-absolute tw-right-4 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-gray-400 tw-pointer-events-none" />
                    </div>
                </div>

                {/* Observaciones */}
                <div className="tw-space-y-1 md:tw-col-span-2">
                    <label className={labelClass}>
                        Observaciones / Detalles
                    </label>
                    <textarea
                        name="Observaciones"
                        value={formData.Observaciones}
                        onChange={handleChange}
                        rows="3"
                        className={inputClass}
                        placeholder="Escriba los detalles o justificación sobre la pérdida..."
                    ></textarea>
                </div>
            </div>

            {/* Botones de acción */}
            <div className="tw-flex tw-gap-3 tw-pt-3">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="tw-flex-1 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-4 tw-py-2.5 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-white tw-text-gray-600 tw-font-semibold hover:tw-bg-gray-50 tw-transition-all"
                >
                    <X className="tw-w-4 tw-h-4" />
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading || cargandoDatos}
                    className="tw-flex-[2] tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-4 tw-py-2.5 tw-rounded-xl tw-bg-primario-900 tw-text-white tw-font-semibold hover:tw-bg-primario-700 tw-transition-all tw-shadow-lg tw-shadow-primario-900/20 disabled:tw-opacity-50"
                >
                    {loading ? (
                        <div className="tw-w-5 tw-h-5 tw-border-2 tw-border-white/30 tw-border-t-white tw-rounded-full tw-animate-spin" />
                    ) : (
                        <Save className="tw-w-4 tw-h-4" />
                    )}
                    {isEditing ? "Actualizar Reporte" : "Guardar Reporte"}
                </button>
            </div>
        </form>
    );

    if (isModalMode) {
        return formContent;
    }

    return (
        <div className="tw-min-h-screen tw-bg-gradient-to-br tw-from-slate-50 tw-to-blue-50 tw-p-6">
            <div className="tw-max-w-4xl tw-mx-auto">
                <div className="tw-flex tw-items-center tw-gap-4 tw-mb-8">
                    <button
                        type="button"
                        onClick={() => navigate('/perdidas')}
                        className="tw-p-2.5 tw-bg-white tw-shadow-sm tw-border tw-border-slate-200 hover:tw-border-primario-400 hover:tw-text-primario-900 tw-text-slate-500 tw-rounded-xl tw-transition-all"
                        title="Volver"
                    >
                        <ArrowLeft className="tw-w-5 tw-h-5" />
                    </button>
                    <div>
                        <div className="tw-flex tw-items-center tw-gap-3">
                            <div className="tw-w-10 tw-h-10 tw-bg-primario-900 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-shadow-lg">
                                <PackageX className="tw-w-5 tw-h-5 tw-text-secundario-400" />
                            </div>
                            <h1 className="tw-text-2xl tw-font-bold tw-text-slate-800">
                                {isEditing ? 'Editar Reporte de Pérdida' : 'Nuevo Reporte de Pérdida'}
                            </h1>
                        </div>
                        <p className="tw-text-slate-500 tw-ml-12 tw-text-sm">
                            Complete los detalles de la merma, vencimiento o baja de inventario
                        </p>
                    </div>
                </div>

                <div className="tw-bg-white tw-rounded-2xl tw-shadow-lg tw-border tw-border-slate-100 tw-p-6 md:tw-p-8">
                    {cargandoDatos ? (
                        <div className="tw-py-12 tw-text-center">
                            <div className="tw-inline-block tw-w-8 tw-h-8 tw-border-4 tw-border-slate-200 tw-border-t-primario-900 tw-rounded-full tw-animate-spin"></div>
                            <p className="tw-mt-3 tw-text-slate-500">Cargando formulario...</p>
                        </div>
                    ) : (
                        formContent
                    )}
                </div>
            </div>
        </div>
    );
};

export default PerdidasForm;
