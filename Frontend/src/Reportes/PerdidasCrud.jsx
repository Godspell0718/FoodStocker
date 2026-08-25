import { useState, useEffect } from 'react';
import apiAxios from '../api/axiosConfig.js';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, Search, AlertCircle, TrendingUp, Eye, RefreshCw, X, FileText } from 'lucide-react';
import Swal from 'sweetalert2';

const PerdidasCrud = () => {
  const [perdidas, setPerdidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cargandoVencidos, setCargandoVencidos] = useState(false);
  const [selectedObservacion, setSelectedObservacion] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPerdidas();
  }, []);

  const fetchPerdidas = async () => {
    try {
      const response = await apiAxios.get('/api/perdidas');
      setPerdidas(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching perdidas:', error);
      setLoading(false);
    }
  };

  const handleCargarVencidos = async () => {
    setCargandoVencidos(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('userFoodStocker') || '{}');
      const response = await apiAxios.post('/api/perdidas/cargar-vencidos', {
        Id_Responsable: currentUser.id
      });
      Swal.fire({
        icon: 'success',
        title: 'Insumos Vencidos Procesados',
        text: response.data.mensaje,
        confirmButtonColor: '#1e3a5f'
      });
      fetchPerdidas();
    } catch (error) {
      console.error('Error al cargar insumos vencidos:', error);
      Swal.fire('Error', error.response?.data?.mensaje || 'No se pudieron cargar los insumos vencidos', 'error');
    } finally {
      setCargandoVencidos(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el reporte de pérdida permanentemente y restituirá el stock.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#153753'
    });

    if (confirm.isConfirmed) {
      try {
        await apiAxios.delete(`/api/perdidas/${id}`);
        Swal.fire('Eliminado', 'Reporte eliminado correctamente', 'success');
        fetchPerdidas();
      } catch (error) {
        console.error('Error deleting perdida:', error);
        Swal.fire('Error', 'Hubo un error al eliminar el reporte.', 'error');
      }
    }
  };

  const filteredPerdidas = perdidas.filter(p => 
    p.insumo?.Nom_Insumo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.Motivo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.Observaciones?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="tw-p-4 md:tw-p-8 tw-w-full tw-bg-gradient-to-br tw-from-gray-50 tw-to-indigo-50/50 tw-min-h-screen">
      <div className="tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-start md:tw-items-center tw-mb-8 tw-gap-4">
        <div>
          <h1 className="tw-text-3xl tw-font-extrabold tw-bg-clip-text tw-text-transparent tw-bg-gradient-to-r tw-from-indigo-700 tw-to-purple-600 tw-drop-shadow-sm">
            Reportes de Pérdida
          </h1>
          <p className="tw-text-sm tw-font-medium tw-text-gray-500 tw-mt-2 tw-flex tw-items-center tw-gap-2">
            <AlertCircle size={16} className="tw-text-indigo-400" />
            Gestión y trazabilidad de mermas, vencimientos y daños
          </p>
        </div>

        <div className="tw-flex tw-gap-3">
          {/* Requerimiento 9: Botón Cargar Insumos Vencidos */}
          <button
            onClick={handleCargarVencidos}
            disabled={cargandoVencidos}
            className="tw-bg-amber-600 hover:tw-bg-amber-700 tw-text-white tw-font-semibold tw-py-2.5 tw-px-4 tw-rounded-xl tw-flex tw-items-center tw-gap-2 tw-shadow-md tw-transition-all disabled:tw-opacity-50"
            title="Detectar y registrar automáticamente entradas con fecha vencida"
          >
            <RefreshCw size={18} className={cargandoVencidos ? "tw-animate-spin" : ""} />
            <span>Cargar Vencidos</span>
          </button>

          <button
            onClick={() => navigate('/perdidas/nuevo')}
            className="tw-group tw-bg-gradient-to-r tw-from-indigo-600 tw-to-purple-600 hover:tw-from-indigo-700 hover:tw-to-purple-700 tw-text-white tw-font-semibold tw-py-2.5 tw-px-5 tw-rounded-xl tw-flex tw-items-center tw-gap-2 tw-shadow-md tw-shadow-indigo-200 hover:tw-shadow-lg hover:tw-shadow-indigo-300 tw-transition-all tw-duration-300"
          >
            <PlusCircle size={20} className="group-hover:tw-rotate-90 tw-transition-transform tw-duration-300" />
            Registrar Pérdida
          </button>
        </div>
      </div>

      <div className="tw-bg-white/80 tw-backdrop-blur-xl tw-rounded-2xl tw-shadow-xl tw-border tw-border-white/50 tw-p-6 tw-mb-8">
        <div className="tw-relative tw-w-full md:tw-w-96">
          <div className="tw-absolute tw-inset-y-0 tw-left-0 tw-pl-4 tw-flex tw-items-center tw-pointer-events-none">
            <Search className="tw-h-5 tw-w-5 tw-text-indigo-400" />
          </div>
          <input
            type="text"
            className="tw-block tw-w-full tw-pl-11 tw-pr-4 tw-py-3 tw-bg-white/50 tw-border tw-border-indigo-100 tw-rounded-xl focus:tw-ring-4 focus:tw-ring-indigo-500/20 focus:tw-border-indigo-500 tw-text-sm tw-font-medium tw-text-gray-700 tw-transition-all tw-placeholder-gray-400 tw-shadow-inner"
            placeholder="Buscar por insumo, motivo u observaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="tw-bg-white/80 tw-backdrop-blur-xl tw-rounded-2xl tw-shadow-xl tw-border tw-border-white/50 tw-overflow-hidden tw-relative">
        <div className="tw-overflow-x-auto">
          <table className="tw-w-full tw-text-left tw-border-collapse">
            <thead>
              <tr className="tw-bg-gradient-to-r tw-from-indigo-50 tw-to-purple-50/50 tw-border-b tw-border-indigo-100/50">
                <th className="tw-px-6 tw-py-4 tw-text-xs tw-font-bold tw-text-indigo-900 tw-uppercase tw-tracking-wider">ID</th>
                <th className="tw-px-6 tw-py-4 tw-text-xs tw-font-bold tw-text-indigo-900 tw-uppercase tw-tracking-wider">Insumo</th>
                <th className="tw-px-6 tw-py-4 tw-text-xs tw-font-bold tw-text-indigo-900 tw-uppercase tw-tracking-wider">Lote</th>
                <th className="tw-px-6 tw-py-4 tw-text-xs tw-font-bold tw-text-indigo-900 tw-uppercase tw-tracking-wider">Cantidad</th>
                <th className="tw-px-6 tw-py-4 tw-text-xs tw-font-bold tw-text-indigo-900 tw-uppercase tw-tracking-wider">Motivo</th>
                <th className="tw-px-6 tw-py-4 tw-text-xs tw-font-bold tw-text-indigo-900 tw-uppercase tw-tracking-wider">Responsable</th>
                <th className="tw-px-6 tw-py-4 tw-text-xs tw-font-bold tw-text-indigo-900 tw-uppercase tw-tracking-wider tw-text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="tw-divide-y tw-divide-gray-100/80">
              {loading ? (
                <tr>
                  <td colSpan="7" className="tw-px-6 tw-py-12 tw-text-center">
                    <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-animate-pulse">
                      <div className="tw-w-10 tw-h-10 tw-border-4 tw-border-indigo-200 tw-border-t-indigo-600 tw-rounded-full tw-animate-spin tw-mb-4"></div>
                      <p className="tw-text-indigo-600 tw-font-medium">Cargando registros...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPerdidas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="tw-px-6 tw-py-16 tw-text-center tw-flex tw-flex-col tw-items-center tw-justify-center">
                    <div className="tw-bg-indigo-50 tw-p-4 tw-rounded-full tw-mb-4">
                      <AlertCircle className="tw-h-10 tw-w-10 tw-text-indigo-400" />
                    </div>
                    <p className="tw-text-lg tw-font-semibold tw-text-gray-700">No hay reportes</p>
                    <p className="tw-text-sm tw-text-gray-500 tw-mt-1">No se encontraron reportes que coincidan con la búsqueda.</p>
                  </td>
                </tr>
              ) : (
                filteredPerdidas.map((perdida) => (
                  <tr key={perdida.Id_Perdida} className="hover:tw-bg-indigo-50/30 tw-transition-all tw-duration-200 tw-group">
                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-font-bold tw-text-indigo-600">
                      #{perdida.Id_Perdida}
                    </td>
                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                      <div className="tw-text-sm tw-font-bold tw-text-gray-800">{perdida.insumo?.Nom_Insumo || 'N/A'}</div>
                      <div className="tw-text-xs tw-text-gray-500 tw-font-medium tw-mt-0.5">{new Date(perdida.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                      <span className="tw-text-sm tw-font-medium tw-text-slate-600 tw-bg-slate-100 tw-px-2.5 tw-py-1 tw-rounded-md tw-border tw-border-slate-200">
                        {perdida.entrada?.Lote || 'N/A'}
                      </span>
                    </td>
                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                      <div className="tw-inline-flex tw-items-center tw-gap-1.5 tw-px-3 tw-py-1 tw-rounded-full tw-bg-red-50 tw-text-red-600 tw-font-bold tw-border tw-border-red-100">
                        <TrendingUp size={14} className="tw-rotate-180" />
                        -{perdida.Cantidad}
                      </div>
                    </td>
                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                      <span className={`tw-px-3 tw-py-1.5 tw-inline-flex tw-text-xs tw-font-bold tw-rounded-full tw-shadow-sm tw-border ${perdida.Motivo === 'VENCIMIENTO' ? 'tw-bg-orange-50 tw-text-orange-700 tw-border-orange-200' : perdida.Motivo === 'DAÑO_FISICO' ? 'tw-bg-rose-50 tw-text-rose-700 tw-border-rose-200' : perdida.Motivo === 'CONTAMINACION' ? 'tw-bg-amber-50 tw-text-amber-700 tw-border-amber-200' : 'tw-bg-slate-50 tw-text-slate-700 tw-border-slate-200'}`}>
                        {perdida.Motivo}
                      </span>
                    </td>
                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-font-medium tw-text-gray-600 tw-flex tw-items-center tw-gap-2">
                      <div className="tw-w-6 tw-h-6 tw-rounded-full tw-bg-gradient-to-br tw-from-indigo-100 tw-to-purple-100 tw-border tw-border-indigo-200 tw-flex tw-items-center tw-justify-center tw-text-indigo-700 tw-font-bold tw-text-[10px]">
                        {perdida.responsable?.Nom_Responsable?.[0] || 'U'}
                      </div>
                      {perdida.responsable?.Nom_Responsable || 'N/A'}
                    </td>
                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-right tw-text-sm tw-font-medium">
                      <div className="tw-flex tw-justify-end tw-gap-2">
                        
                        {/* Requerimiento 10: Icono OJO para ver observaciones */}
                        <button
                          onClick={() => setSelectedObservacion(perdida)}
                          className="tw-text-blue-600 hover:tw-text-white tw-p-2 tw-rounded-lg hover:tw-bg-blue-600 tw-shadow-sm tw-transition-all tw-duration-200"
                          title="Ver Observaciones"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => navigate(`/perdidas/editar/${perdida.Id_Perdida}`)}
                          className="tw-text-indigo-600 hover:tw-text-white tw-p-2 tw-rounded-lg hover:tw-bg-indigo-500 tw-shadow-sm tw-transition-all tw-duration-200"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(perdida.Id_Perdida)}
                          className="tw-text-rose-500 hover:tw-text-white tw-p-2 tw-rounded-lg hover:tw-bg-rose-500 tw-shadow-sm tw-transition-all tw-duration-200"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Observaciones (Requerimiento 10) */}
      {selectedObservacion && (
        <div 
          className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-4 tw-bg-black/50 tw-backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setSelectedObservacion(null)}
        >
          <div className="tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-lg tw-overflow-hidden tw-animate-in tw-fade-in tw-zoom-in-95 tw-duration-200">
            <div className="tw-bg-indigo-900 tw-px-6 tw-py-4 tw-flex tw-justify-between tw-items-center">
              <div className="tw-flex tw-items-center tw-gap-3">
                <FileText className="tw-w-5 tw-h-5 tw-text-indigo-300" />
                <h5 className="tw-text-white tw-font-bold tw-text-lg tw-m-0">
                  Observaciones de la Pérdida #{selectedObservacion.Id_Perdida}
                </h5>
              </div>
              <button 
                onClick={() => setSelectedObservacion(null)}
                className="tw-text-white/70 hover:tw-text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="tw-p-6 tw-space-y-4">
              <div className="tw-grid tw-grid-cols-2 tw-gap-4 tw-bg-gray-50 tw-p-4 tw-rounded-xl">
                <div>
                  <span className="tw-text-xs tw-font-bold tw-text-gray-400 tw-uppercase">Insumo</span>
                  <p className="tw-text-sm tw-font-bold tw-text-gray-800">{selectedObservacion.insumo?.Nom_Insumo || 'N/A'}</p>
                </div>
                <div>
                  <span className="tw-text-xs tw-font-bold tw-text-gray-400 tw-uppercase">Cantidad Pérdida</span>
                  <p className="tw-text-sm tw-font-bold tw-text-red-600">-{selectedObservacion.Cantidad}</p>
                </div>
                <div>
                  <span className="tw-text-xs tw-font-bold tw-text-gray-400 tw-uppercase">Motivo</span>
                  <p className="tw-text-sm tw-font-bold tw-text-gray-700">{selectedObservacion.Motivo}</p>
                </div>
                <div>
                  <span className="tw-text-xs tw-font-bold tw-text-gray-400 tw-uppercase">Lote Afectado</span>
                  <p className="tw-text-sm tw-font-mono tw-text-indigo-600">{selectedObservacion.entrada?.Lote || 'N/A'}</p>
                </div>
              </div>

              <div>
                <label className="tw-block tw-text-xs tw-font-bold tw-text-gray-400 tw-uppercase tw-mb-2">
                  Detalle de Observaciones
                </label>
                <div className="tw-p-4 tw-bg-amber-50/60 tw-border tw-border-amber-200/60 tw-rounded-xl tw-text-sm tw-text-gray-700 tw-leading-relaxed min-h-[100px]">
                  {selectedObservacion.Observaciones || 'Sin observaciones especificadas para este registro.'}
                </div>
              </div>

              <div className="tw-flex tw-justify-end tw-pt-2">
                <button
                  onClick={() => setSelectedObservacion(null)}
                  className="tw-px-5 tw-py-2.5 tw-bg-indigo-900 hover:tw-bg-indigo-800 tw-text-white tw-font-semibold tw-rounded-xl tw-shadow-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerdidasCrud;
