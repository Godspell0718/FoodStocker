import responsableModel from "../models/responsableModel.js";
import entradasModel from "../models/entradasModel.js";
import SolicitudModel from "../models/SolicitudModel.js";
import perdidaModel from "../models/perdidasModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import emailServices from "./emailServices.js";

class responsableService{
  //metodo para solicitar restablecimiento de contraseña 
  async resetPassword(email) {
    const responsable = await responsableModel.findOne({where: {email: email }})

    if (!responsable) throw new Error("Ups, algo paso.")

    const tokenForPassword = jwt.sign({user: {id: responsable.id }},
      process.env.JWT_SECRET,
      { expiresIn: '15m'})
    await emailServices.sendPasswordResetEmail(email, tokenForPassword)
    return 
  }
}

class ResponsableService {

  // ========================
  // OBTENER TODOS (SIN CONTRASEÑA)
  // ========================
  async getAll() {
    return await responsableModel.findAll({
      attributes: { exclude: ["Contraseña"] }
    });
  }

  // ========================
  // OBTENER POR ID
  // ========================
  async getById(id) {
    const responsable = await responsableModel.findByPk(id, {
      attributes: { exclude: ["Contraseña"] }
    });

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

    // 🔐 Encriptar contraseña
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

    const responsable = await responsableModel.findOne({
      where: { Cor_Responsable }
    });

    if (!responsable)
      throw new Error("Credenciales inválidas");

    // 🚫 Impedir inicio de sesión si el usuario está INACTIVO
    if (responsable.Estado === "INACTIVO")
      throw new Error("Su usuario se encuentra INACTIVO. Contacte al administrador.");

    const passwordValida = await bcrypt.compare(
      Contraseña,
      responsable.Contraseña
    );

    if (!passwordValida)
      throw new Error("Credenciales inválidas");

    const token = jwt.sign(
      {
        id: responsable.Id_Responsable,
        rol: responsable.Tip_Responsable,
        uuid: responsable.uuid
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

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

    // 🔐 Si viene contraseña → encriptar
    if (data.Contraseña) {
      data.Contraseña = await bcrypt.hash(data.Contraseña, 10);
    }

    const [updated] = await responsableModel.update(data, {
      where: { Id_Responsable: id }
    });

    if (!updated)
      throw new Error("Responsable no encontrado");

    return true;
  }

  // ========================
  // ========================
  // ELIMINAR / INACTIVAR
  // ========================
  async delete(id) {
    const responsable = await responsableModel.findByPk(id);
    if (!responsable) throw new Error("Responsable no encontrado");

    // Verificar si tiene acciones asociadas en entradas, solicitudes o pérdidas
    const hasEntradasPasante = await entradasModel.count({ where: { Id_Pasante: id } });
    const hasEntradasInstructor = await entradasModel.count({ where: { Id_Instructor: id } });
    const hasSolicitudes = await SolicitudModel.count({ where: { Id_Responsable: id } });
    const hasPerdidas = await perdidaModel.count({ where: { Id_Responsable: id } });

    const totalAcciones = hasEntradasPasante + hasEntradasInstructor + hasSolicitudes + hasPerdidas;

    if (totalAcciones > 0 || responsable.Estado === 'ACTIVO') {
      // Inactivar para no romper integridad referencial
      await responsable.update({ Estado: responsable.Estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO' });
      return { inactived: true, nuevoEstado: responsable.Estado };
    } else {
      await responsable.destroy();
      return { deleted: true };
    }
  }
}

export default new ResponsableService();