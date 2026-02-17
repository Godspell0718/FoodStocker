import { useState } from 'react'
import apiAxios from '../api/axiosConfig.js'

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
    const [textFormButton, setTextFormButton] = useState('Enviar')

    const gestionarForm = async (e) => {
        e.preventDefault()

        // Validar campos obligatorios
        if (!Fec_Ven_Entrada) {
            alert('La fecha de vencimiento es obligatoria')
            return
        }
        if (!Lote) {
            alert('El lote es obligatorio')
            return
        }
        if (!Can_Inicial || Can_Inicial <= 0) {
            alert('La cantidad inicial debe ser un número positivo')
            return
        }
        if (!Id_Proveedor) {
            alert('El ID del proveedor es obligatorio')
            return
        }
        if (!Id_Pasante) {
            alert('El ID del pasante es obligatorio')
            return
        }
        if (!Id_Instructor) {
            alert('El ID del instructor es obligatorio')
            return
        }
        if (!Id_Insumos) {
            alert('El ID del insumo es obligatorio')
            return
        }

        try {
            setTextFormButton('Enviando...')
            const response = await apiAxios.post('/api/entradas/', {
                Fec_Ven_Entrada,
                Lote,
                Vlr_Unitario: Vlr_Unitario ? parseFloat(Vlr_Unitario) : null,
                Can_Inicial: parseInt(Can_Inicial),
                Id_Proveedor: parseInt(Id_Proveedor),
                Id_Pasante: parseInt(Id_Pasante),
                Id_Instructor: parseInt(Id_Instructor),
                Id_Insumos: parseInt(Id_Insumos)
                // No enviamos Vlr_Total (generado) ni Estado (se calcula automáticamente)
            })

            alert('Entrada creada con éxito!')
            // Limpiar formulario
            setFec_Ven_Entrada('')
            setLote('')
            setVlr_Unitario('')
            setCan_Inicial('')
            setId_Proveedor('')
            setId_Pasante('')
            setId_Instructor('')
            setId_Insumos('')
            hideModal()
            refreshTable() // Actualizar la lista de entradas
        } catch (error) {
            console.error('Error al crear la entrada:', error.response ? error.response.data : error.message)
            alert(error.response?.data?.mensaje || error.message || 'Error al crear la entrada')
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
                <input type="submit" className='btn btn-primary w-50' value={textFormButton} />
            </div>
        </form>
    )
}

export default EntradasForm