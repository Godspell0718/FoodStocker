import perdidaModel from '../models/perdidasModel.js';
import insumoModel from '../models/insumosModel.js';
import responsableModel from '../models/responsableModel.js';
import entradaModel from '../models/entradasModel.js';

class PerdidasService {
    static async getAll() {
        return await perdidaModel.findAll({
            include: [
                { model: insumoModel, attributes: ['Nom_Insumo'] },
                { model: responsableModel, attributes: ['Nom_Responsable'] },
                { model: entradaModel, attributes: ['Lote'] }
            ],
            order: [['createdAt', 'DESC']]
        });
    }

    static async getById(id) {
        const perdida = await perdidaModel.findByPk(id, {
            include: [
                { model: insumoModel, attributes: ['Nom_Insumo'] },
                { model: responsableModel, attributes: ['Nom_Responsable'] },
                { model: entradaModel, attributes: ['Lote'] }
            ]
        });
        if (!perdida) {
            throw new Error('Reporte de pérdida no encontrado');
        }
        return perdida;
    }

    static async create(data) {
        // Lógica para descontar de entradasModel la cantidad perdida
        if(data.Id_Entrada) {
            const entrada = await entradaModel.findByPk(data.Id_Entrada);
            if(entrada) {
                const cantidadPerdida = parseInt(data.Cantidad);
                const stockDisponible = entrada.Can_Inicial - entrada.Can_Salida;
                
                if(cantidadPerdida > stockDisponible) {
                    throw new Error(`La cantidad reportada (${cantidadPerdida}) excede el stock disponible en este lote (${stockDisponible}).`);
                }

                entrada.Can_Salida += cantidadPerdida;
                
                // Si se agota todo el lote, actualizamos su estado
                if (entrada.Can_Inicial - entrada.Can_Salida <= 0) {
                    entrada.Estado = 'AGOTADO';
                }

                await entrada.save();
            }
        }
        return await perdidaModel.create(data);
    }

    static async update(id, data) {
        const perdida = await this.getById(id);
        
        // Si hay un cambio en la cantidad o en la entrada asignada
        if (perdida.Id_Entrada) {
            const entradaVieja = await entradaModel.findByPk(perdida.Id_Entrada);
            if (entradaVieja) {
                // Devolver el stock viejo
                entradaVieja.Can_Salida -= perdida.Cantidad;
                if (entradaVieja.Can_Inicial - entradaVieja.Can_Salida > 0 && entradaVieja.Estado === 'AGOTADO') {
                    entradaVieja.Estado = 'STOCK';
                }
                await entradaVieja.save();
            }
        }

        // Si la nueva actualización también tiene lote, se le resta el nuevo stock
        if (data.Id_Entrada) {
            const entradaNueva = await entradaModel.findByPk(data.Id_Entrada);
            if (entradaNueva) {
                const nuevaCantidad = parseInt(data.Cantidad);
                const stockDisponible = entradaNueva.Can_Inicial - entradaNueva.Can_Salida;
                
                if (nuevaCantidad > stockDisponible) {
                    throw new Error(`La nueva cantidad (${nuevaCantidad}) excede el stock disponible en este lote (${stockDisponible}).`);
                }
                
                entradaNueva.Can_Salida += nuevaCantidad;
                if (entradaNueva.Can_Inicial - entradaNueva.Can_Salida <= 0) {
                    entradaNueva.Estado = 'AGOTADO';
                }
                await entradaNueva.save();
            }
        }

        return await perdida.update(data);
    }

    static async delete(id) {
        const perdida = await this.getById(id);
        
        // Restituir el stock si se elimina la pérdida
        if (perdida.Id_Entrada) {
            const entrada = await entradaModel.findByPk(perdida.Id_Entrada);
            if (entrada) {
                entrada.Can_Salida -= perdida.Cantidad;
                if (entrada.Can_Inicial - entrada.Can_Salida > 0 && entrada.Estado === 'AGOTADO') {
                    entrada.Estado = 'STOCK';
                }
                await entrada.save();
            }
        }

        return await perdida.destroy();
    }
}

export default PerdidasService;
