import { useState, useEffect } from 'react';
import apiAxios from '../api/axiosConfig.js';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

const PerdidasForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

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
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
    if (isEditing) {
      fetchPerdida();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const [insumosRes, entradasRes, responsablesRes] = await Promise.all([
        apiAxios.get('/api/insumos'),
        apiAxios.get('/api/entradas'),
        apiAxios.get('/api/responsables')
      ]);
      setInsumos(insumosRes.data);
      setEntradas(entradasRes.data);
      setResponsables(responsablesRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error al cargar los datos del formulario.');
    }
  };

  const fetchPerdida = async () => {
    try {
      const response = await apiAxios.get(`/api/perdidas/${id}`);
      setFormData({
        Id_Insumo: response.data.Id_Insumo,
        Id_Entrada: response.data.Id_Entrada || '',
        Cantidad: response.data.Cantidad,
        Motivo: response.data.Motivo,
        Observaciones: response.data.Observaciones || '',
        Id_Responsable: response.data.Id_Responsable
      });
    } catch (err) {
      console.error('Error fetching perdida:', err);
      setError('Error al cargar el reporte.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const dataToSubmit = { ...formData };
      if (!dataToSubmit.Id_Entrada) {
        dataToSubmit.Id_Entrada = null;
      }

      if (isEditing) {
        await apiAxios.put(`/api/perdidas/${id}`, dataToSubmit);
      } else {
        await apiAxios.post('/api/perdidas', dataToSubmit);
      }
      navigate('/perdidas');
    } catch (err) {
      console.error('Error saving perdida:', err);
      setError(err.response?.data?.mensaje || 'Error al guardar el reporte de pérdida.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tw-p-4 md:tw-p-8 tw-w-full tw-bg-gradient-to-br tw-from-gray-50 tw-to-indigo-50/50 tw-min-h-screen tw-flex tw-justify-center tw-items-start">
      <div className="tw-w-full tw-max-w-4xl tw-transform tw-transition-all tw-duration-300">
        <div className="tw-flex tw-flex-col md:tw-flex-row md:tw-items-center tw-gap-4 tw-mb-8">
          <button 
            onClick={() => navigate('/perdidas')}
            className="tw-group tw-p-2.5 tw-bg-white tw-shadow-sm tw-border tw-border-gray-200 hover:tw-border-indigo-300 hover:tw-shadow-md tw-text-gray-500 hover:tw-text-indigo-600 tw-rounded-xl tw-transition-all tw-duration-300"
          >
            <ArrowLeft size={22} className="group-hover:tw--translate-x-1 tw-transition-transform tw-duration-300" />
          </button>
          <div>
            <h1 className="tw-text-3xl tw-font-extrabold tw-bg-clip-text tw-text-transparent tw-bg-gradient-to-r tw-from-indigo-700 tw-to-purple-600 tw-drop-shadow-sm">
              {isEditing ? 'Editar Reporte de Pérdida' : 'Nuevo Reporte de Pérdida'}
            </h1>
            <p className="tw-text-sm tw-font-medium tw-text-gray-500 tw-mt-1">Complete los detalles de la merma o vencimiento del insumo</p>
          </div>
        </div>

        {error && (
          <div className="tw-bg-rose-50/80 tw-backdrop-blur-sm tw-border-l-4 tw-border-rose-500 tw-p-4 tw-mb-8 tw-rounded-xl tw-shadow-sm tw-animate-in tw-fade-in tw-slide-in-from-top-4 tw-duration-300">
            <p className="tw-text-rose-700 tw-font-medium tw-flex tw-items-center tw-gap-2">
              <span className="tw-w-5 tw-h-5 tw-rounded-full tw-bg-rose-200 tw-flex tw-items-center tw-justify-center tw-text-rose-700 tw-text-xs tw-font-bold">!</span>
              {error}
            </p>
          </div>
        )}

        <div className="tw-bg-white/80 tw-backdrop-blur-xl tw-rounded-2xl tw-shadow-xl tw-border tw-border-white/50 tw-overflow-hidden tw-relative">
          <div className="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-1 tw-bg-gradient-to-r tw-from-indigo-500 tw-via-purple-500 tw-to-pink-500"></div>
          
          <form onSubmit={handleSubmit} className="tw-p-8">
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-8">
              
              {/* Insumo */}
              <div className="tw-space-y-2">
                <label className="tw-block tw-text-sm tw-font-bold tw-text-slate-700">Insumo <span className="tw-text-rose-500">*</span></label>
                <select
                  name="Id_Insumo"
                  value={formData.Id_Insumo}
                  onChange={handleChange}
                  required
                  className="tw-w-full tw-px-4 tw-py-3 tw-bg-slate-50/50 tw-border tw-border-slate-200 tw-rounded-xl focus:tw-ring-4 focus:tw-ring-indigo-500/20 focus:tw-border-indigo-500 tw-text-sm tw-font-medium tw-text-slate-700 tw-transition-all tw-duration-300 tw-shadow-inner"
                >
                  <option value="">Seleccione un insumo</option>
                  {insumos.map((insumo) => (
                    <option key={insumo.Id_Insumos} value={insumo.Id_Insumos}>
                      {insumo.Nom_Insumo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lote / Entrada */}
              <div className="tw-space-y-2">
                <label className="tw-block tw-text-sm tw-font-bold tw-text-slate-700">Lote / Entrada Afectada</label>
                <select
                  name="Id_Entrada"
                  value={formData.Id_Entrada}
                  onChange={handleChange}
                  className="tw-w-full tw-px-4 tw-py-3 tw-bg-slate-50/50 tw-border tw-border-slate-200 tw-rounded-xl focus:tw-ring-4 focus:tw-ring-indigo-500/20 focus:tw-border-indigo-500 tw-text-sm tw-font-medium tw-text-slate-700 tw-transition-all tw-duration-300 tw-shadow-inner"
                >
                  <option value="">Seleccione un lote (Opcional)</option>
                  {entradas
                    .filter(e => !formData.Id_Insumo || e.Id_Insumos.toString() === formData.Id_Insumo.toString())
                    .filter(e => (e.Can_Inicial - e.Can_Salida) > 0 || e.Id_Entradas === formData.Id_Entrada)
                    .map((entrada) => {
                      const disponible = entrada.Can_Inicial - entrada.Can_Salida;
                      return (
                        <option key={entrada.Id_Entradas} value={entrada.Id_Entradas}>
                          Lote: {entrada.Lote} - Disp: {disponible}
                        </option>
                      );
                    })}
                </select>
              </div>

              {/* Cantidad */}
              <div className="tw-space-y-2">
                <label className="tw-block tw-text-sm tw-font-bold tw-text-slate-700">Cantidad Perdida <span className="tw-text-rose-500">*</span></label>
                <div className="tw-relative">
                  <input
                    type="number"
                    name="Cantidad"
                    value={formData.Cantidad}
                    onChange={handleChange}
                    required
                    min="1"
                    className="tw-w-full tw-px-4 tw-py-3 tw-pl-10 tw-bg-slate-50/50 tw-border tw-border-slate-200 tw-rounded-xl focus:tw-ring-4 focus:tw-ring-indigo-500/20 focus:tw-border-indigo-500 tw-text-sm tw-font-medium tw-text-rose-600 tw-transition-all tw-duration-300 tw-shadow-inner"
                    placeholder="Ej. 5"
                  />
                  <span className="tw-absolute tw-left-4 tw-top-1/2 tw--translate-y-1/2 tw-text-rose-500 tw-font-bold">-</span>
                </div>
              </div>

              {/* Motivo */}
              <div className="tw-space-y-2">
                <label className="tw-block tw-text-sm tw-font-bold tw-text-slate-700">Motivo <span className="tw-text-rose-500">*</span></label>
                <select
                  name="Motivo"
                  value={formData.Motivo}
                  onChange={handleChange}
                  required
                  className="tw-w-full tw-px-4 tw-py-3 tw-bg-slate-50/50 tw-border tw-border-slate-200 tw-rounded-xl focus:tw-ring-4 focus:tw-ring-indigo-500/20 focus:tw-border-indigo-500 tw-text-sm tw-font-medium tw-text-slate-700 tw-transition-all tw-duration-300 tw-shadow-inner"
                >
                  <option value="VENCIMIENTO">Vencimiento</option>
                  <option value="DAÑO_FISICO">Daño Físico</option>
                  <option value="CONTAMINACION">Contaminación</option>
                  <option value="OTROS">Otros</option>
                </select>
              </div>

              {/* Responsable */}
              <div className="tw-space-y-2">
                <label className="tw-block tw-text-sm tw-font-bold tw-text-slate-700">Responsable que reporta <span className="tw-text-rose-500">*</span></label>
                <select
                  name="Id_Responsable"
                  value={formData.Id_Responsable}
                  onChange={handleChange}
                  required
                  className="tw-w-full tw-px-4 tw-py-3 tw-bg-slate-50/50 tw-border tw-border-slate-200 tw-rounded-xl focus:tw-ring-4 focus:tw-ring-indigo-500/20 focus:tw-border-indigo-500 tw-text-sm tw-font-medium tw-text-slate-700 tw-transition-all tw-duration-300 tw-shadow-inner"
                >
                  <option value="">Seleccione el responsable</option>
                  {responsables.map((responsable) => (
                    <option key={responsable.Id_Responsable} value={responsable.Id_Responsable}>
                      {responsable.Nom_Responsable} ({responsable.Tip_Responsable})
                    </option>
                  ))}
                </select>
              </div>

              {/* Observaciones */}
              <div className="md:tw-col-span-2 tw-space-y-2">
                <label className="tw-block tw-text-sm tw-font-bold tw-text-slate-700">Observaciones / Detalles</label>
                <textarea
                  name="Observaciones"
                  value={formData.Observaciones}
                  onChange={handleChange}
                  rows="4"
                  className="tw-w-full tw-px-4 tw-py-3 tw-bg-slate-50/50 tw-border tw-border-slate-200 tw-rounded-xl focus:tw-ring-4 focus:tw-ring-indigo-500/20 focus:tw-border-indigo-500 tw-text-sm tw-font-medium tw-text-slate-700 tw-transition-all tw-duration-300 tw-shadow-inner tw-resize-none"
                  placeholder="Escriba los detalles o justificación sobre la pérdida..."
                ></textarea>
              </div>

            </div>

            <div className="tw-mt-10 tw-flex tw-flex-col-reverse sm:tw-flex-row tw-justify-end tw-gap-4 tw-pt-6 tw-border-t tw-border-slate-100">
              <button
                type="button"
                onClick={() => navigate('/perdidas')}
                className="tw-px-6 tw-py-3 tw-text-sm tw-font-bold tw-text-slate-600 tw-bg-white tw-border tw-border-slate-200 tw-rounded-xl hover:tw-bg-slate-50 hover:tw-text-slate-800 tw-transition-all tw-duration-200 tw-shadow-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="tw-px-6 tw-py-3 tw-text-sm tw-font-bold tw-text-white tw-bg-gradient-to-r tw-from-indigo-600 tw-to-purple-600 tw-rounded-xl hover:tw-from-indigo-700 hover:tw-to-purple-700 tw-transition-all tw-duration-300 tw-shadow-md tw-shadow-indigo-200 hover:tw-shadow-lg hover:tw-shadow-indigo-300 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-transform hover:tw--translate-y-0.5 disabled:tw-opacity-70 disabled:tw-cursor-not-allowed disabled:tw-transform-none"
              >
                {loading ? (
                  <>
                    <div className="tw-w-5 tw-h-5 tw-border-2 tw-border-white/30 tw-border-t-white tw-rounded-full tw-animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={18} /> 
                    Guardar Reporte
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PerdidasForm;
