import ResponsableService from "../services/responsableservice.js";
import emailServices from "../services/emailServices.js";
import responsableservice from "../services/responsableservice.js";

//SOLICITAR RESTABLECER CONTRASEÑA
export const getResetPassword = async (req, res) => {
  const { email } = req.body

  try {
    await userService.resetPassword(email)
    res.status(200).json({message: 'El mensaje para restablecer la contraseña fue enviado correctamente.'})
  }catch (error) {
    res.status(400).json({message: error.message})
  }
}

//RECIBIR LA NUEVA CONTRASEÑA
export const getNewPassword = async (req, res) => {
  
  try {
    await responsableservice.setNewPassword(req.body)
    res.status(200).json({message: "Contraseña actualizada correctamente."})

  }catch (error) {
    res.status(400).json({message: "Informacion invalida o el tiempo ha expirado."})
  }
}

// ==============================
// OBTENER TODOS
// ==============================
export const getAllResponsables = async (_req, res) => {
  try {
    const responsables = await ResponsableService.getAll();
    res.status(200).json(responsables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// OBTENER POR ID
// ==============================
export const getResponsableById = async (req, res) => {
  try {
    const responsable = await ResponsableService.getById(req.params.id);
    res.status(200).json(responsable);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// ==============================
// REGISTRO
// ==============================
export const registerResponsable = async (req, res) => {
  try {
    const nuevo = await ResponsableService.register(req.body);
    res.status(201).json({
      message: "Responsable registrado correctamente",
      nuevo
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ==============================
// LOGIN
// ==============================
export const loginResponsable = async (req, res) => {
  try {
    const { Cor_Responsable, Contraseña } = req.body;

    const data = await ResponsableService.login(
      Cor_Responsable,
      Contraseña
    );

    res.status(200).json({
      message: "Responsable logeado exitosamente",
      ...data
    });

  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

// ==============================
// ACTUALIZAR
// ==============================
export const updateResponsable = async (req, res) => {
  try {
    const data = { ...req.body };

    // 🚫 Evitar sobrescribir contraseña vacía
    if (!data.Contraseña) {
      delete data.Contraseña;
    }

    // 🚫 Administrador no puede cambiar su propio rol
    if (req.user && String(req.user.id) === String(req.params.id) && data.Tip_Responsable && data.Tip_Responsable !== req.user.rol) {
      return res.status(400).json({ message: "No está permitido cambiar su propio rol" });
    }

    await ResponsableService.update(req.params.id, data);

    res.status(200).json({
      message: "Responsable actualizado correctamente"
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// ==============================
// ELIMINAR
// ==============================
export const deleteResponsable = async (req, res) => {
  try {
    await ResponsableService.delete(req.params.id);
    res.status(200).json({
      message: "Responsable eliminado correctamente"
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};