import { useState, useEffect } from "react";
import apiAxios from "../api/axiosConfig.js";

const InsumosForm = ({ closeModal, insumoParaEditar }) => {
    const [Nom_Insumo, setNom_Insumo] = useState("");
    const [peso, setPeso] = useState("");
    const [Tip_Insumo, setTip_Insumo] = useState("");
    const [Can_Insumo, setCan_Insumo] = useState("");
    const [Uni_Med_Insumo, setUni_Med_Insumo] = useState("");
    const [Ref_Insumo, setRef_Insumo] = useState("");
    const [Codigo_Insumo, setCodigo_Insumo] = useState("");

    useEffect(() => {
        if (insumoParaEditar) {
            setNom_Insumo(insumoParaEditar.Nom_Insumo);
            setPeso(insumoParaEditar.peso);
            setTip_Insumo(insumoParaEditar.Tip_Insumo);
            setCan_Insumo(insumoParaEditar.Can_Insumo);
            setUni_Med_Insumo(insumoParaEditar.Uni_Med_Insumo);
            setRef_Insumo(insumoParaEditar.Ref_Insumo);
            setCodigo_Insumo(insumoParaEditar.Codigo_Insumo);
        } else {
            setNom_Insumo("");
            setPeso("");
            setTip_Insumo("");
            setCan_Insumo("");
            setUni_Med_Insumo("");
            setRef_Insumo("");
            setCodigo_Insumo("");
        }
    }, [insumoParaEditar]);

    const gestionarForm = async (e) => {
        e.preventDefault();

        try {
            if (insumoParaEditar) {
                await apiAxios.put(`/api/insumos/${insumoParaEditar.Id_Insumos}`, {
                    Nom_Insumo: Nom_Insumo,
                    peso: peso,
                    Tip_Insumo: Tip_Insumo,
                    Can_Insumo: Can_Insumo,
                    Uni_Med_Insumo: Uni_Med_Insumo,
                    Ref_Insumo: Ref_Insumo,
                    Codigo_Insumo: Codigo_Insumo
                });
                alert('Insumo actualizado correctamente');
            } else {
                await apiAxios.post('/api/insumos/', {
                    Nom_Insumo: Nom_Insumo,
                    peso: peso,
                    Tip_Insumo: Tip_Insumo,
                    Can_Insumo: Can_Insumo,
                    Uni_Med_Insumo: Uni_Med_Insumo,
                    Ref_Insumo: Ref_Insumo,
                    Codigo_Insumo: Codigo_Insumo
                });
                alert('Insumo creado correctamente');
            }

            setNom_Insumo("");
            setPeso("");
            setTip_Insumo("");
            setCan_Insumo("");
            setUni_Med_Insumo("");
            setRef_Insumo("");
            setCodigo_Insumo("");

            if (closeModal) {
                closeModal();
            }

        } catch (error) {
            console.error("Error registrando insumo:", error.response ? error.response.data : error.message);
            alert(error.message);
        }
    }

    return (
        <form onSubmit={gestionarForm}>
            <div className="mb-3">
                <label htmlFor="Nom_Insumo" className="form-label">Nombre del Insumo</label>
                <input
                    type="text"
                    id="Nom_Insumo"
                    className="form-control"
                    value={Nom_Insumo}
                    onChange={(e) => setNom_Insumo(e.target.value)}
                    required
                />
            </div>
            <div className="mb-3">
                <label htmlFor="Can_Insumo" className="form-label">unidades del Insumo</label>
                <input
                    type="number"
                    id="Can_Insumo"
                    className="form-control"
                    value={Can_Insumo}
                    onChange={(e) => setCan_Insumo(e.target.value)}
                    required
                />
            </div>
                        <div className="mb-3">
                <label htmlFor="peso del insumo" className="form-label">Peso del Insumo</label>
                <input
                    type="decimal"
                    id="peso del insumo"
                    className="form-control"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                    required
                />
            </div>
            <div className="mb-3">
                <label htmlFor="Uni_Med_Insumo" className="form-label">Unidad de Medida</label>
                <select
                    id="Uni_Med_Insumo"
                    className="form-control"
                    value={Uni_Med_Insumo}
                    onChange={(e) => setUni_Med_Insumo(e.target.value)}
                    required
                >
                    <option value="">Seleccione la Unidad de media del insumo</option>
                    <option value="gr">Gramos</option>
                    <option value="kg">Kilogramos</option>
                    <option value="ml">Mililitros</option>
                    <option value="L">Litros</option>
                    <option value="lbs">Libras</option>

                </select>
            </div>
            <div className="mb-3">
                <label htmlFor="Ref_Insumo" className="form-label">Referencia del Insumo</label>
                <select
                    id="Ref_Insumo"
                    className="form-control"
                    value={Ref_Insumo}
                    onChange={(e) => setRef_Insumo(e.target.value)}
                    required
                >
                    <option value="">Seleccione la referencia del insumo</option>
                    <option value="MP">Materia prima</option>
                    <option value="IN">Insumo</option>
                    </select>
            </div>
            <div className="mb-3">
                <label htmlFor="Codigo_Insumo" className="form-label">Código del Insumo</label>
                <input
                    type="text"
                    id="Codigo_Insumo"
                    className="form-control"
                    value={Codigo_Insumo}
                    onChange={(e) => setCodigo_Insumo(e.target.value)}
                    required
                />
            </div>
            <div className="mb-3">
                <label htmlFor="Tip_Insumo" className="form-label">Tipo de Insumo</label>
                <select
                    id="Tip_Insumo"
                    className="form-control"
                    value={Tip_Insumo}
                    onChange={(e) => setTip_Insumo(e.target.value)}>
                    <option value="">Seleccione un tipo de insumo</option>
                    <option value="lacteos">Lácteos</option>
                    <option value="carnicos">Cárnicos</option>
                    <option value="chocolateria">Chocolatería</option>
                    <option value="panaderia">Panadería</option>
                    <option value="fruhor">Fruhor</option>
                    <option value="cafe">Café</option>
                    <option value="bebidas">Aguas</option>
                    <option value="condimentos">Condimentos</option>
                    <option value="especias">Especias</option>
                    <option value="frutas">Frutas</option>
                    <option value="verduras">Verduras</option>
                    <option value="granos">Granos</option>
                    <option value="cereales">Cereales</option>
                    <option value="aceites">Aceites</option>
                    <option value="salsas">Salsas</option>
                    <option value="enlatados">Enlatados</option>
                    <option value="congelados">Congelados</option>
                </select>
            </div>

            <div className="mb-3">
                <input
                    type="submit"
                    className="btn btn-primary w-50"
                    value={insumoParaEditar ? "Actualizar" : "Enviar"}
                />
            </div>

            {insumoParaEditar && (
                <div className="alert alert-primary alert-dismissible fade show d-flex align-items-center" role="alert">
                    <i className="fa-solid fa-circle-info me-2"></i>  
                    <div>
                        <strong>Nota:</strong> Los campos que no modifiques conservarán su valor actual.
                    </div>
                    <button type="button" className="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            )}
        </form>
    );
}

export default InsumosForm;