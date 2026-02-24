import responsableModel from "../models/responsableModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

class ResponsableService {

  // ========================
  // OBTENER TODOS
  // ========================
  async getAll() {
    return await responsableModel.findAll();
  }

  // ========================
  // OBTENER POR ID
  // ========================
  async getById(id) {
    const responsable = await responsableModel.findByPk(id);

    if (!responsable)
      throw new Error("Responsable no encontrado");

    return responsable;
  }

  // ========================
  // REGISTRO
  // ========================
  async register(data) {

    const {
      Nom_Responsable,
      Tip_Responsable,
      Tel_Responsable,
      Cor_Responsable,
      Doc_Responsable,
      Contraseña
    } = data;

    const existe = await responsableModel.findOne({
      where: { Cor_Responsable }
    });

    if (existe)
      throw new Error("El correo ya está registrado");

    const hashedPassword = await bcrypt.hash(Contraseña, 10);

    const nuevo = await responsableModel.create({
      Nom_Responsable,
      Tip_Responsable,
      Tel_Responsable,
      Cor_Responsable,
      Doc_Responsable,
      Contraseña: hashedPassword,
      uuid: uuidv4()
    });

    return nuevo;
  }

  // ========================
  // LOGIN
  // ========================
  async login(Cor_Responsable, Contraseña) {

    console.log('🔍 [SERVICE] Buscando responsable con correo:', Cor_Responsable);

    const responsable = await responsableModel.findOne({
      where: { Cor_Responsable }
    });

    if (!responsable) {
      console.log('❌ [SERVICE] No se encontró responsable con ese correo');
      throw new Error("Credenciales inválidas");
    }

    console.log('✅ [SERVICE] Responsable encontrado. ID:', responsable.Id_Responsable);
    console.log('🔍 [SERVICE] Comparando contraseñas...');
    console.log('🔍 [SERVICE] Contraseña recibida (primeros 3 chars):', Contraseña ? Contraseña.substring(0, 3) + '...' : 'No password');
    console.log('🔍 [SERVICE] Hash almacenado (primeros 20 chars):', responsable.Contraseña ? responsable.Contraseña.substring(0, 20) + '...' : 'No hash');

    const passwordValida = await bcrypt.compare(
      Contraseña,
      responsable.Contraseña
    );

    if (!passwordValida) {
      console.log('❌ [SERVICE] Contraseña incorrecta');
      throw new Error("Credenciales inválidas");
    }

    console.log('✅ [SERVICE] Contraseña válida. Generando token...');
    console.log('🔑 [SERVICE] JWT_SECRET existe:', process.env.JWT_SECRET ? '✓ Sí' : '✗ No');
    
    const token = jwt.sign(
      {
        id: responsable.Id_Responsable,
        rol: responsable.Tip_Responsable,
        uuid: responsable.uuid
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    console.log('✅ [SERVICE] Token generado:', token.substring(0, 30) + '...');
    console.log('✅ [SERVICE] Token expira en: 2 horas');

    return {
      token,
      usuario: {
        id: responsable.Id_Responsable,
        nombre: responsable.Nom_Responsable,
        rol: responsable.Tip_Responsable
      }
    };
  }

  // ========================
  // ACTUALIZAR
  // ========================
  async update(id, data) {
    const [updated] = await responsableModel.update(data, {
      where: { Id_Responsable: id }
    });

    if (!updated)
      throw new Error("Responsable no encontrado");

    return true;
  }

  // ========================
  // ELIMINAR
  // ========================
  async delete(id) {
    const deleted = await responsableModel.destroy({
      where: { Id_Responsable: id }
    });

    if (!deleted)
      throw new Error("Responsable no encontrado");

    return true;
  }
}

export default new ResponsableService();