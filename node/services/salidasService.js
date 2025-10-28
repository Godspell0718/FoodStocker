
import Salidas from "../models/salidasModel.js";

class salidasService{

    async getAllSalidas(){
        return await Salidas.findAll()
    }

    async getSalidaById(Id_Salida){

    const salida = await Salidas.findByPk(Id_Salida)
    if (!salida) throw new Error("Envio no encontrado")
    return salida
    }
    async create(data){
        return await Salidas.create(data)
    }

    async update(Id_Salida, data){
        const result = await Salidas.update(data,{ where: {Id_Salida}})
        const update = result[0]
        if (update === 0 ) throw new Error ("Envio no encontrado o Datos no actualizados")
        return true 
    }
    async delete(Id_Salida){
        const deleted = await Salidas.destroy({where: {Id_Salida}})
        if(!deleted) throw new Error ("Envio no encontrado o no eliminado")
        return true
    }
    
}
export default new salidasService()