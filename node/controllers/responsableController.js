import ResponsableService from "../services/responsableservice.js";

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
// REGISTRO (con hash)
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
// LOGIN (JWT)
// ==============================
export const loginResponsable = async (req, res) => {
  try {
    const { Cor_Responsable, Contraseña } = req.body;
    
    // 🔍 LOG AÑADIDO
    console.log('🔍 Login attempt for:', Cor_Responsable);
    console.log('🔍 Contraseña recibida (primeros 3 chars):', Contraseña ? Contraseña.substring(0, 3) + '...' : 'No password');

    const data = await ResponsableService.login(
      Cor_Responsable,
      Contraseña
    );

    // 🔍 LOG AÑADIDO
    console.log('✅ Login successful for:', Cor_Responsable);
    console.log('🔑 Token generado:', data.token ? data.token.substring(0, 30) + '...' : 'No token');
    console.log('👤 Usuario data:', { ...data, token: '[HIDDEN]' }); // Ocultamos token en log por seguridad

    res.status(200).json({
      message: "Responsable logeado exitosamente",
      ...data
    });

  } catch (error) {
    // 🔍 LOG AÑADIDO
    console.error('❌ Login failed for:', req.body.Cor_Responsable);
    console.error('❌ Error message:', error.message);
    
    res.status(401).json({ message: error.message });
  }
};

// ==============================
// ACTUALIZAR
// ==============================
export const updateResponsable = async (req, res) => {
  try {
    await ResponsableService.update(req.params.id, req.body);
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