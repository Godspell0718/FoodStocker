import { useState, useEffect } from 'react';
import apiAxios from '../api/axiosConfig.js';

export const useContadores = () => {
    const [totalInsumos, setTotalInsumos] = useState(0);
    const [totalSolicitudes, setTotalSolicitudes] = useState(0);
    const [totalProveedores, setTotalProveedores] = useState(0);
    const [entradasHoy, setEntradasHoy] = useState(0);
    const [cargando, setCargando] = useState(true);

    // ESTADOS PARA ALERTAS
    const [proximosAVencer, setProximosAVencer] = useState([]);
    const [stockCritico, setStockCritico] = useState([]);

    const cargarContadores = async () => {
        try {
            // Obtener total de insumos
            const resInsumos = await apiAxios.get('/api/insumos/con-lotes');
            setTotalInsumos(resInsumos.data.length);

            // Procesar alertas de vencimiento y stock crítico
            const hoy = new Date();
            const dosMesesDespues = new Date();
            dosMesesDespues.setMonth(hoy.getMonth() + 2);

            const vencimientos = [];
            const criticos = [];

            resInsumos.data.forEach(insumo => {
                // Verificar cada entrada/lote del insumo
                if (insumo.entradas && Array.isArray(insumo.entradas)) {
                    insumo.entradas.forEach(entrada => {
                        // Solo considerar entradas en STOCK
                        if (entrada.Estado === 'STOCK') {
                            const cantidadDisponible = entrada.Can_Inicial - entrada.Can_Salida;

                            // Verificar vencimiento próximo (2 meses)
                            if (entrada.Fec_Ven_Entrada) {
                                const fechaVencimiento = new Date(entrada.Fec_Ven_Entrada);
                                if (fechaVencimiento <= dosMesesDespues && fechaVencimiento > hoy) {
                                    vencimientos.push({
                                        idInsumo: insumo.Id_Insumos,
                                        nombreInsumo: insumo.Nom_Insumo,
                                        lote: entrada.Lote,
                                        fechaVencimiento: entrada.Fec_Ven_Entrada,
                                        cantidadDisponible: cantidadDisponible,
                                        diasRestantes: Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24))
                                    });
                                }
                            }

                            // Verificar stock crítico (menos del 25% de la cantidad inicial)




                            if (cantidadDisponible <= 10) {
                                criticos.push({
                                    idInsumo: insumo.Id_Insumos,
                                    nombreInsumo: insumo.Nom_Insumo,
                                    lote: entrada.Lote,
                                    cantidadDisponible: cantidadDisponible,
                                });
                            }
                        }
                    });
                }
            });

            setProximosAVencer(vencimientos);
            setStockCritico(criticos);

            // Obtener solicitudes pendientes
            const resSolicitudes = await apiAxios.get("/api/solicitudes/pendientes");
            const activas = resSolicitudes.data.filter(s =>
                s.ultimoEstado?.toLowerCase() === 'solicitado' ||
                s.ultimoEstado?.toLowerCase() === 'proceso'
            );
            setTotalSolicitudes(activas.length);

            // Obtener total de proveedores
            const resProveedores = await apiAxios.get('/api/proveedores/');
            setTotalProveedores(resProveedores.data.length);

            // Obtener entradas del día de hoy
            const resEntradas = await apiAxios.get('/api/entradas/');
            const inicioHoy = new Date();
            inicioHoy.setHours(0, 0, 0, 0);

            const entradasDeHoy = resEntradas.data.filter(entrada => {
                const fechaEntrada = new Date(entrada.createdAt || entrada.Fec_Entrada);
                fechaEntrada.setHours(0, 0, 0, 0);
                return fechaEntrada.getTime() === inicioHoy.getTime();
            });
            setEntradasHoy(entradasDeHoy.length);

        } catch (error) {
            console.error('Error al cargar contadores:', error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarContadores();
    }, []);

    return {
        totalInsumos,
        totalSolicitudes,
        totalProveedores,
        entradasHoy,
        proximosAVencer,
        stockCritico,
        cargando,
        recargar: cargarContadores
    };
};