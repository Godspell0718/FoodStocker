import { useState } from 'react'
import apiNode from "../api/axiosConfig.js";

const EntradasForm = ({ hideModal, refreshTable }) => {
    // Estados para cada campo del modelo
    const [Fec_Ven_Entrada, setFec_Ven_Entrada] = useState('')
    const [Lote, setLote] = useState('')
    const [Vlr_Unitario, setVlr_Unitario] = useState('')
    const [Can_Inicial, setCan_Inicial] = useState('')
    const [Id_Proveedor, setId_Proveedor] = useState('')
    const [Id_Pasante, setId_Pasante] = useState('')
    const [Id_Instructor, setId_Instructor] = useState('')
    const [Id_Insumos, setId_Insumos] = useState('')
    const [Uni_medida, setUnimedida] = useState('')   // ← Nuevo campo
    const [textFormButton, setTextFormButton] = useState('Enviar')

    const resetForm = () => {
        setFec_Ven_Entrada('')
        setLote('')
        setVlr_Unitario('')
        setCan_Inicial('')
        setId_Proveedor('')
        setId_Pasante('')
        setId_Instructor('')
        setId_Insumos('')
        setUnimedida('')
        setTextFormButton('Enviar')
    }

    const gestionarForm = async (e) => {
        e.preventDefault()

        // Validar campos obligatorios
        if (!Fec_Ven_Entrada) {
            alert('La fecha de vencimiento es obligatoria')
            return
        }
        if (!Lote.trim()) {
            alert('El lote es obligatorio')
            return
        }
        if (!Can_Inicial || Number(Can_Inicial) <= 0) {
            alert('La cantidad inicial debe ser un número positivo')
            return
        }
        if (!Id_Proveedor || Number(Id_Proveedor) <= 0) {
            alert('El ID del proveedor es obligatorio y válido')
            return
        }
        if (!Id_Pasante || Number(Id_Pasante) <= 0) {
            alert('El ID del pasante es obligatorio y válido')
            return
        }
        if (!Id_Instructor || Number(Id_Instructor) <= 0) {
            alert('El ID del instructor es obligatorio y válido')
            return
        }
        if (!Id_Insumos || Number(Id_Insumos) <= 0) {
            alert('El ID del insumo es obligatorio y válido')
            return
        }
        if (!Uni_medida) {
            alert('La unidad de medida es obligatoria')
            return
        }

        try {
            setTextFormButton('Enviando...')

            const payload = {
                Fec_Ven_Entrada,
                Lote: Lote.trim(),
                Vlr_Unitario: Vlr_Unitario ? parseFloat(Vlr_Unitario) : null,
                Can_Inicial: parseInt(Can_Inicial, 10),
                Id_Proveedor: parseInt(Id_Proveedor, 10),
                Id_Pasante: parseInt(Id_Pasante, 10),
                Id_Instructor: parseInt(Id_Instructor, 10),
                Id_Insumos: parseInt(Id_Insumos, 10),
                Uni_medida,
            }

            const response = await apiNode.post('/api/entradas/', payload)

            alert('Entrada creada con éxito!')

            resetForm()
            hideModal()
            refreshTable()

        } catch (error) {
            console.error('Error al crear la entrada:', error)
            
            const mensajeError = 
                error.response?.data?.mensaje ||
                error.response?.data?.error ||
                error.message ||
                'Error desconocido al crear la entrada'

            alert(mensajeError)
        } finally {
            setTextFormButton('Enviar')
        }
    }

    return (
        <form onSubmit={gestionarForm} className='col-12 col-md-6'>
            <div className='mb-3'>
                <label htmlFor="Fec_Ven_Entrada" className='form-label'>Fecha de vencimiento *</label>
                <input
                    type="date"
                    className='form-control'
                    id='Fec_Ven_Entrada'
                    value={Fec_Ven_Entrada}
                    onChange={(e) => setFec_Ven_Entrada(e.target.value)}
                    required
                />
            </div>

            <div className='mb-3'>
                <label htmlFor="Lote" className='form-label'>Lote *</label>
                <input
                    type="text"
                    className='form-control'
                    id='Lote'
                    value={Lote}
                    onChange={(e) => setLote(e.target.value)}
                    placeholder='Ej: L123ABC'
                    required
                />
            </div>

            <div className='mb-3'>
                <label htmlFor="Vlr_Unitario" className='form-label'>Valor unitario (opcional)</label>
                <input
                    type="number"
                    step="0.01"
                    className='form-control'
                    id='Vlr_Unitario'
                    value={Vlr_Unitario}
                    onChange={(e) => setVlr_Unitario(e.target.value)}
                    placeholder='Ej: 2500.50'
                />
            </div>

            <div className='mb-3'>
                <label htmlFor="Can_Inicial" className='form-label'>Cantidad inicial *</label>
                <input
                    type="number"
                    className='form-control'
                    id='Can_Inicial'
                    value={Can_Inicial}
                    onChange={(e) => setCan_Inicial(e.target.value)}
                    min='1'
                    required
                />
            </div>

            <div className='mb-3'>
                <label htmlFor="Uni_medida" className='form-label'>Unidad de medida *</label>
                <select
                    className='form-control'
                    id='Uni_medida'
                    value={Uni_medida}
                    onChange={(e) => setUnimedida(e.target.value)}
                    required
                >
                    <option value="">Seleccione unidad</option>
                    <option value="gr">gramos</option>
                    <option value="kg">kilogramos</option>
                    <option value="ml">mililitros</option>
                    <option value="l">litros</option>
                    <option value="lbs">libras</option>
                    <option value="un">unidades</option>
                    <option value="caja">cajas</option>
                    <option value="paq">paquetes</option>
                </select>
            </div>

            <div className='mb-3'>
                <label htmlFor="Id_Proveedor" className='form-label'>ID del proveedor *</label>
                <input
                    type="number"
                    className='form-control'
                    id='Id_Proveedor'
                    value={Id_Proveedor}
                    onChange={(e) => setId_Proveedor(e.target.value)}
                    min='1'
                    required
                />
            </div>

            <div className='mb-3'>
                <label htmlFor="Id_Pasante" className='form-label'>ID del pasante *</label>
                <input
                    type="number"
                    className='form-control'
                    id='Id_Pasante'
                    value={Id_Pasante}
                    onChange={(e) => setId_Pasante(e.target.value)}
                    min='1'
                    required
                />
            </div>

            <div className='mb-3'>
                <label htmlFor="Id_Instructor" className='form-label'>ID del instructor *</label>
                <input
                    type="number"
                    className='form-control'
                    id='Id_Instructor'
                    value={Id_Instructor}
                    onChange={(e) => setId_Instructor(e.target.value)}
                    min='1'
                    required
                />
            </div>

            <div className='mb-3'>
                <label htmlFor="Id_Insumos" className='form-label'>ID del insumo *</label>
                <input
                    type="number"
                    className='form-control'
                    id='Id_Insumos'
                    value={Id_Insumos}
                    onChange={(e) => setId_Insumos(e.target.value)}
                    min='1'
                    required
                />
            </div>

            <div className='mb-3'>
                <button 
                    type="submit" 
                    className='btn btn-primary w-50'
                    disabled={textFormButton === 'Enviando...'}
                >
                    {textFormButton}
                </button>
            </div>
        </form>
    )
}

export default EntradasForm