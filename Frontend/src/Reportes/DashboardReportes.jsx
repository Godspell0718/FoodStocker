import React, { useState, useEffect } from "react";
import apiNode from "../api/axiosConfig.js";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import {
  PackageSearch,
  ClipboardList,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  PackageX,
  Clock,
  Loader2
} from "lucide-react";

export default function DashboardReportes() {
  const [loading, setLoading] = useState(true);
  const [insumos, setInsumos] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resInsumos, resSolicitudes] = await Promise.all([
        apiNode.get("/api/insumos/con-lotes"),
        apiNode.get("/api/solicitudes/pendientes")
      ]);
      setInsumos(resInsumos.data || []);
      setSolicitudes(resSolicitudes.data || []);
    } catch (error) {
      console.error("Error al cargar datos para el dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="tw-min-h-screen tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-3">
        <Loader2 className="tw-w-8 tw-h-8 tw-text-primario-500 tw-animate-spin" />
        <p className="tw-text-slate-500 tw-text-sm">Generando reportes...</p>
      </div>
    );
  }

  // --- PROCESAMIENTO DE DATOS ---

  // KPIs Insumos
  const totalInsumos = insumos.length;
  const insumosSinStock = insumos.filter(ins => {
    const stock = (ins.entradas || []).reduce((acc, lote) => acc + (lote.Can_Inicial - lote.Can_Salida), 0);
    return stock <= 0;
  });
  
  // --- ALERTAS (Stock Crítico y Vencimientos) ---
  const alertas = [];
  const hoy = new Date();

  insumos.forEach(ins => {
    let stockTotal = 0;
    
    (ins.entradas || []).forEach(lote => {
      const stockLote = lote.Can_Inicial - lote.Can_Salida;
      stockTotal += stockLote;

      if (stockLote > 0 && lote.Fec_Ven_Entrada) {
        const fechaVenc = new Date(lote.Fec_Ven_Entrada);
        const diasRestantes = Math.ceil((fechaVenc - hoy) / (1000 * 60 * 60 * 24));
        
        if (diasRestantes < 0) {
          alertas.push({
            id: `venc-${lote.Id_Entradas}`,
            tipo: 'vencimiento',
            severidad: 'high',
            insumo: ins.Nom_Insumo,
            mensaje: 'Lote Vencido',
            detalle: `Lote ${lote.Lote} venció hace ${Math.abs(diasRestantes)} días`,
            stock: stockLote,
            unidad: ins.Uni_Med_Insumo
          });
        } else if (diasRestantes <= 30) {
          alertas.push({
            id: `venc-${lote.Id_Entradas}`,
            tipo: 'vencimiento',
            severidad: 'medium',
            insumo: ins.Nom_Insumo,
            mensaje: 'Próximo a Vencer',
            detalle: `Lote ${lote.Lote} vence en ${diasRestantes} días`,
            stock: stockLote,
            unidad: ins.Uni_Med_Insumo
          });
        }
      }
    });

    if (stockTotal === 0) {
      alertas.push({
        id: `stock-${ins.Id_Insumos}`,
        tipo: 'stock',
        severidad: 'high',
        insumo: ins.Nom_Insumo,
        mensaje: 'Agotado',
        detalle: 'Sin unidades en el sistema',
        stock: 0,
        unidad: ins.Uni_Med_Insumo
      });
    } else if (stockTotal <= 10) {
      alertas.push({
        id: `stock-${ins.Id_Insumos}`,
        tipo: 'stock',
        severidad: 'medium',
        insumo: ins.Nom_Insumo,
        mensaje: 'Stock Bajo',
        detalle: `Total general: ${stockTotal} unidades`,
        stock: stockTotal,
        unidad: ins.Uni_Med_Insumo
      });
    }
  });

  // Ordenar priorizando los de severidad alta
  alertas.sort((a, b) => {
    if (a.severidad === 'high' && b.severidad !== 'high') return -1;
    if (a.severidad !== 'high' && b.severidad === 'high') return 1;
    return 0;
  });
  const alertasMostrar = alertas.slice(0, 8);

  // KPIs Solicitudes
  const totalSolicitudes = solicitudes.length;
  const solPendientes = solicitudes.filter(s => s.ultimoEstado?.toLowerCase() === "solicitado" || s.ultimoEstado?.toLowerCase() === "proceso").length;
  const solDespachadas = solicitudes.filter(s => s.ultimoEstado?.toLowerCase() === "despachado").length;
  const solCanceladas = solicitudes.filter(s => s.ultimoEstado?.toLowerCase() === "cancelado").length;

  // Data para gráficos
  const dataEstados = [
    { name: "Pendientes", value: solPendientes, color: "#f59e0b" }, // amber-500
    { name: "Despachadas", value: solDespachadas, color: "#10b981" }, // emerald-500
    { name: "Canceladas", value: solCanceladas, color: "#ef4444" }, // red-500
  ].filter(d => d.value > 0);

  // Top insumos solicitados (aproximación rápida)
  const topInsumosMap = {};
  solicitudes.forEach(sol => {
    if (sol.insumos) {
      sol.insumos.forEach(item => {
        const nombre = item.insumo?.Nom_Insumo || `ID ${item.Id_insumos}`;
        topInsumosMap[nombre] = (topInsumosMap[nombre] || 0) + item.cantidad_solicitada;
      });
    }
  });
  
  const dataTopInsumos = Object.keys(topInsumosMap)
    .map(key => ({ name: key, cantidad: topInsumosMap[key] }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5); // top 5

  return (
    <div className="tw-p-6">
      <div className="tw-max-w-7xl tw-mx-auto tw-space-y-6">
        
        {/* Header */}
        <div className="tw-flex tw-items-center tw-gap-3 tw-mb-8">
          <div className="tw-w-10 tw-h-10 tw-rounded-xl tw-bg-gradient-to-br tw-from-indigo-600 tw-to-blue-500 tw-flex tw-items-center tw-justify-center tw-shadow-lg tw-shadow-indigo-500/30">
            <TrendingUp className="tw-w-5 tw-h-5 tw-text-white" />
          </div>
          <div>
            <h1 className="tw-text-xl tw-font-bold tw-text-slate-800 tw-m-0">Dashboard de Reportes</h1>
            <p className="tw-text-sm tw-text-slate-500 tw-m-0">Resumen general y estadísticas del sistema</p>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-4">
          
          {/* KPI 1 */}
          <div className="tw-bg-white tw-rounded-2xl tw-p-5 tw-shadow-sm tw-border tw-border-slate-100 tw-flex tw-items-center tw-gap-4 tw-transition-all hover:tw-shadow-md">
            <div className="tw-w-12 tw-h-12 tw-rounded-full tw-bg-blue-50 tw-flex tw-items-center tw-justify-center tw-shrink-0">
              <PackageSearch className="tw-w-6 tw-h-6 tw-text-blue-600" />
            </div>
            <div>
              <p className="tw-text-sm tw-font-medium tw-text-slate-500 tw-m-0">Total Insumos</p>
              <h3 className="tw-text-2xl tw-font-bold tw-text-slate-800 tw-m-0">{totalInsumos}</h3>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="tw-bg-white tw-rounded-2xl tw-p-5 tw-shadow-sm tw-border tw-border-slate-100 tw-flex tw-items-center tw-gap-4 tw-transition-all hover:tw-shadow-md">
            <div className="tw-w-12 tw-h-12 tw-rounded-full tw-bg-amber-50 tw-flex tw-items-center tw-justify-center tw-shrink-0">
              <ClipboardList className="tw-w-6 tw-h-6 tw-text-amber-600" />
            </div>
            <div>
              <p className="tw-text-sm tw-font-medium tw-text-slate-500 tw-m-0">Solicitudes Activas</p>
              <h3 className="tw-text-2xl tw-font-bold tw-text-slate-800 tw-m-0">{solPendientes}</h3>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="tw-bg-white tw-rounded-2xl tw-p-5 tw-shadow-sm tw-border tw-border-slate-100 tw-flex tw-items-center tw-gap-4 tw-transition-all hover:tw-shadow-md">
            <div className="tw-w-12 tw-h-12 tw-rounded-full tw-bg-emerald-50 tw-flex tw-items-center tw-justify-center tw-shrink-0">
              <CheckCircle className="tw-w-6 tw-h-6 tw-text-emerald-600" />
            </div>
            <div>
              <p className="tw-text-sm tw-font-medium tw-text-slate-500 tw-m-0">Despachadas</p>
              <h3 className="tw-text-2xl tw-font-bold tw-text-slate-800 tw-m-0">{solDespachadas}</h3>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="tw-bg-white tw-rounded-2xl tw-p-5 tw-shadow-sm tw-border tw-border-slate-100 tw-flex tw-items-center tw-gap-4 tw-transition-all hover:tw-shadow-md">
            <div className="tw-w-12 tw-h-12 tw-rounded-full tw-bg-red-50 tw-flex tw-items-center tw-justify-center tw-shrink-0">
              <AlertTriangle className="tw-w-6 tw-h-6 tw-text-red-600" />
            </div>
            <div>
              <p className="tw-text-sm tw-font-medium tw-text-slate-500 tw-m-0">Insumos Agotados</p>
              <h3 className="tw-text-2xl tw-font-bold tw-text-slate-800 tw-m-0">{insumosSinStock.length}</h3>
            </div>
          </div>

        </div>

        {/* Charts Grid */}
        <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-3 tw-gap-6">
          
          {/* Top Insumos Chart */}
          <div className="tw-bg-white tw-rounded-2xl tw-shadow-sm tw-border tw-border-slate-100 tw-p-6 lg:tw-col-span-2">
            <h3 className="tw-text-lg tw-font-bold tw-text-slate-800 tw-mb-6 tw-flex tw-items-center tw-gap-2">
              <TrendingUp className="tw-w-5 tw-h-5 tw-text-indigo-500" />
              Top 5 Insumos Más Solicitados
            </h3>
            <div className="tw-h-[300px] tw-w-full">
              {dataTopInsumos.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataTopInsumos} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12, fill: '#64748b'}} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    />
                    <Bar dataKey="cantidad" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} name="Cantidad" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="tw-h-full tw-flex tw-items-center tw-justify-center tw-text-slate-400 tw-text-sm">
                  No hay datos suficientes
                </div>
              )}
            </div>
          </div>

          {/* Estado Solicitudes Chart */}
          <div className="tw-bg-white tw-rounded-2xl tw-shadow-sm tw-border tw-border-slate-100 tw-p-6">
            <h3 className="tw-text-lg tw-font-bold tw-text-slate-800 tw-mb-6 tw-flex tw-items-center tw-gap-2">
              <ClipboardList className="tw-w-5 tw-h-5 tw-text-blue-500" />
              Estado de Solicitudes
            </h3>
            <div className="tw-h-[260px] tw-w-full tw-flex tw-items-center tw-justify-center">
              {dataEstados.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataEstados}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {dataEstados.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="tw-text-slate-400 tw-text-sm">No hay solicitudes registradas</div>
              )}
            </div>
            <div className="tw-mt-2 tw-text-center">
              <p className="tw-text-xs tw-text-slate-500">Total histórico: <span className="tw-font-bold">{totalSolicitudes}</span></p>
            </div>
          </div>

        </div>

        {/* Panel de Alertas */}
        <div className="tw-bg-white tw-rounded-2xl tw-shadow-sm tw-border tw-border-slate-100 tw-overflow-hidden">
          <div className="tw-bg-slate-50 tw-px-6 tw-py-4 tw-border-b tw-border-slate-100">
            <h3 className="tw-text-sm tw-font-bold tw-text-slate-700 tw-flex tw-items-center tw-gap-2 tw-uppercase tw-tracking-wide">
              <AlertTriangle className="tw-w-4 tw-h-4 tw-text-amber-500" />
              Atención: Stock Crítico
            </h3>
          </div>
          <div className="tw-divide-y tw-divide-slate-100">
            {alertasMostrar.length > 0 ? (
              alertasMostrar.map(alerta => (
                <div key={alerta.id} className="tw-px-6 tw-py-4 tw-flex tw-items-center tw-justify-between hover:tw-bg-slate-50 tw-transition-colors">
                  <div className="tw-flex tw-items-center tw-gap-3">
                    <div className={`tw-w-8 tw-h-8 tw-rounded-full tw-flex tw-items-center tw-justify-center ${alerta.severidad === 'high' ? 'tw-bg-red-100 tw-text-red-600' : 'tw-bg-amber-100 tw-text-amber-600'}`}>
                      {alerta.tipo === 'stock' && alerta.severidad === 'high' ? <PackageX className="tw-w-4 tw-h-4" /> : 
                       alerta.tipo === 'vencimiento' && alerta.severidad === 'high' ? <AlertTriangle className="tw-w-4 tw-h-4" /> :
                       <Clock className="tw-w-4 tw-h-4" />}
                    </div>
                    <div>
                      <p className="tw-font-semibold tw-text-slate-800 tw-m-0">
                        {alerta.insumo} <span className={`tw-ml-2 tw-text-[10px] tw-px-1.5 tw-py-0.5 tw-rounded tw-font-bold tw-uppercase ${alerta.severidad === 'high' ? 'tw-bg-red-100 tw-text-red-700' : 'tw-bg-amber-100 tw-text-amber-700'}`}>{alerta.mensaje}</span>
                      </p>
                      <p className="tw-text-xs tw-text-slate-500 tw-m-0 tw-mt-0.5">{alerta.detalle}</p>
                    </div>
                  </div>
                  <div className="tw-text-right">
                    <span className={`tw-inline-flex tw-items-center tw-px-2.5 tw-py-1 tw-rounded-lg tw-text-xs tw-font-bold ${alerta.severidad === 'high' ? 'tw-bg-red-50 tw-text-red-600' : 'tw-bg-amber-50 tw-text-amber-700'}`}>
                      {alerta.stock} {alerta.unidad}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="tw-px-6 tw-py-8 tw-text-center tw-text-slate-500">
                <CheckCircle className="tw-w-8 tw-h-8 tw-text-emerald-400 tw-mx-auto tw-mb-2" />
                <p className="tw-text-sm">Todo el stock está en niveles óptimos</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
