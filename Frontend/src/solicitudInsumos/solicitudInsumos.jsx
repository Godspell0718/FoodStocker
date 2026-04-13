import { useState, useEffect } from "react";
import apiAxios from "../api/axiosConfig.js";
import Swal from "sweetalert2";

const SeleccionInsumosSolicitud = ({ idSolicitud, onCompletado, onCancelar }) => {
  const [insumos, setInsumos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(false);
  const [selecciones, setSelecciones] = useState({}); // clave: "idInsumo-idLote" -> { idInsumo, idLote, cantidad }

  // Cargar insumos al montar el componente
  useEffect(() => {
    cargarInsumos();
  }, []);

  const cargarInsumos = async (textoFiltro = "") => {
    setLoading(true);
    try {
      const response = await apiAxios.get("/api/solicitud-insumos/disponibles", {
        params: { filtro: textoFiltro }
      });
      setInsumos(response.data);
    } catch (error) {
      console.error("Error al cargar insumos:", error);
      Swal.fire("Error", "No se pudieron cargar los insumos", "error");
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio en el filtro con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      cargarInsumos(filtro);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [filtro]);

  const handleCheckboxChange = (idInsumo, idLote, checked) => {
    const key = `${idInsumo}-${idLote}`;
    if (checked) {
      setSelecciones(prev => ({
        ...prev,
        [key]: { idInsumo, idLote, cantidad: 1 }
      }));
    } else {
      setSelecciones(prev => {
        const newPrev = { ...prev };
        delete newPrev[key];
        return newPrev;
      });
    }
  };

  const handleCantidadChange = (idInsumo, idLote, cantidad) => {
    const key = `${idInsumo}-${idLote}`;
    setSelecciones(prev => ({
      ...prev,
      [key]: { ...prev[key], cantidad: parseInt(cantidad) || 1 }
    }));
  };

  const handleAgregarInsumo = async (insumo) => {
    // Filtrar las selecciones que pertenecen a este insumo
    const lotesSeleccionados = Object.values(selecciones).filter(
      sel => sel.idInsumo === insumo.Id_Insumos
    );

    if (lotesSeleccionados.length === 0) {
      Swal.fire("Atención", "Debes seleccionar al menos un lote", "warning");
      return;
    }

    const result = await Swal.fire({
      title: "Confirmar asignación",
      text: `¿Asignar ${lotesSeleccionados.length} lote(s) de ${insumo.Nom_Insumo}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, asignar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      try {
        await apiAxios.post("/api/solicitud-insumos/guardar-seleccion", {
          idSolicitud,
          insumosSeleccionados: lotesSeleccionados
        });

        Swal.fire("Éxito", "Insumos asignados correctamente", "success");

        // Limpiar las selecciones de este insumo
        setSelecciones(prev => {
          const newPrev = { ...prev };
          lotesSeleccionados.forEach(sel => {
            const key = `${sel.idInsumo}-${sel.idLote}`;
            delete newPrev[key];
          });
          return newPrev;
        });

        // Recargar insumos para actualizar disponibilidad
        cargarInsumos(filtro);
      } catch (error) {
        console.error("Error al asignar:", error);
        Swal.fire("Error", "No se pudieron asignar los insumos", "error");
      }
    }
  };

  const handleFinalizar = async () => {
    const todasSelecciones = Object.values(selecciones);
    if (todasSelecciones.length === 0) {
      onCompletado(); // No hay nada pendiente
      return;
    }

    const result = await Swal.fire({
      title: "¿Finalizar solicitud?",
      text: `Todavía tienes ${todasSelecciones.length} lote(s) sin confirmar. Si finalizas ahora, se guardarán automáticamente.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, finalizar",
      cancelButtonText: "Seguir seleccionando"
    });

    if (result.isConfirmed) {
      try {
        await apiAxios.post("/api/solicitud-insumos/guardar-seleccion", {
          idSolicitud,
          insumosSeleccionados: todasSelecciones
        });

        Swal.fire("Completado", "Solicitud finalizada con todos los insumos", "success");
        onCompletado();
      } catch (error) {
        console.error("Error al finalizar:", error);
        Swal.fire("Error", "No se pudieron guardar algunos insumos", "error");
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h4>Seleccionar insumos - Solicitud #{idSolicitud}</h4>
        </div>
        <div className="card-body">
          {/* Filtro */}
          <div className="mb-3">
            <label className="form-label fw-bold">Filtrar por nombre de insumo:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Escribe para buscar..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
            {loading && <small className="text-muted">Buscando...</small>}
          </div>

          {/* Tabla de insumos */}
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th>Nombre Insumo</th>
                  <th>Lotes disponibles (ordenados por vencimiento)</th>
                  <th>Cantidad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {insumos.map(insumo => (
                  <tr key={insumo.Id_Insumos}>
                    <td className="align-middle fw-bold">{insumo.Nom_Insumo}</td>
                    <td>
                      {insumo.lotes.length > 0 ? (
                        insumo.lotes.map(lote => (
                          <div key={lote.Id_Entradas} className="form-check mb-2">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`lote-${lote.Id_Entradas}`}
                              checked={!!selecciones[`${insumo.Id_Insumos}-${lote.Id_Entradas}`]}
                              onChange={(e) =>
                                handleCheckboxChange(
                                  insumo.Id_Insumos,
                                  lote.Id_Entradas,
                                  e.target.checked
                                )
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`lote-${lote.Id_Entradas}`}
                            >
                              <strong>{lote.Lote}</strong> - 
                              Vence: {new Date(lote.Fec_Ven_Entrada).toLocaleDateString()} - 
                              Disp: {lote.cantidadDisponible} {lote.Uni_medida}
                            </label>
                          </div>
                        ))
                      ) : (
                        <span className="text-muted">Sin lotes disponibles</span>
                      )}
                    </td>
                    <td className="align-middle">
                      {insumo.lotes.map(lote => (
                        <div key={lote.Id_Entradas} className="mb-2">
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            style={{ width: "80px" }}
                            min="1"
                            max={lote.cantidadDisponible}
                            value={
                              selecciones[`${insumo.Id_Insumos}-${lote.Id_Entradas}`]?.cantidad || 1
                            }
                            onChange={(e) =>
                              handleCantidadChange(
                                insumo.Id_Insumos,
                                lote.Id_Entradas,
                                e.target.value
                              )
                            }
                            disabled={!selecciones[`${insumo.Id_Insumos}-${lote.Id_Entradas}`]}
                          />
                        </div>
                      ))}
                    </td>
                    <td className="align-middle">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleAgregarInsumo(insumo)}
                      >
                        Agregar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {insumos.length === 0 && !loading && (
            <div className="alert alert-info">No hay insumos disponibles.</div>
          )}
        </div>

        <div className="card-footer">
          <div className="d-flex justify-content-between align-items-center">
            <button className="btn btn-secondary" onClick={onCancelar}>
              Cancelar
            </button>
            <span className="badge bg-info">
              {Object.values(selecciones).length} lote(s) seleccionado(s)
            </span>
            <button className="btn btn-primary" onClick={handleFinalizar}>
              Finalizar solicitud
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeleccionInsumosSolicitud;