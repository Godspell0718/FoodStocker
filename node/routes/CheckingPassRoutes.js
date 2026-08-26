// controllers/CheckingPassController.js

// ⚠️ IMPORTA TU CONEXIÓN A BD
// import db from '../database/db.js';


// ==========================
// 🔹 ENTRADAS
// ==========================

export const crearEntrada = async (req, res) => {
  try {
    const datos = req.body;

    // await db.query('INSERT INTO entradas SET ?', [datos]);

    res.json({ message: 'Entrada creada correctamente' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verEntradas = async (req, res) => {
  try {
    // const [rows] = await db.query('SELECT * FROM entradas');

    res.json({
      message: 'Listado de entradas',
      // data: rows
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ==========================
// 🔹 SOLICITUDES
// ==========================

export const crearSolicitud = async (req, res) => {
  try {
    const datos = req.body;

    // await db.query('INSERT INTO solicitud SET ?', [datos]);

    res.json({ message: 'Solicitud creada correctamente' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verSolicitudes = async (req, res) => {
  try {
    // const [rows] = await db.query('SELECT * FROM solicitud');

    res.json({
      message: 'Listado de solicitudes',
      // data: rows
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cambiarEstadoSolicitud = async (req, res) => {
  try {
    const { id, estado } = req.body;

    // await db.query('UPDATE solicitud SET estado = ? WHERE id = ?', [estado, id]);

    res.json({ message: 'Estado actualizado correctamente' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ==========================
// 🔹 INSUMOS
// ==========================

export const crearInsumo = async (req, res) => {
  try {
    const datos = req.body;

    // await db.query('INSERT INTO insumos SET ?', [datos]);

    res.json({ message: 'Insumo creado correctamente' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verInsumos = async (req, res) => {
  try {
    // const [rows] = await db.query('SELECT * FROM insumos');

    res.json({
      message: 'Listado de insumos',
      // data: rows
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ==========================
// 🔹 PROVEEDORES
// ==========================

export const crearProveedor = async (req, res) => {
  try {
    const datos = req.body;

    // await db.query('INSERT INTO proveedores SET ?', [datos]);

    res.json({ message: 'Proveedor creado correctamente' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const asignarProveedor = async (req, res) => {
  try {
    const datos = req.body;

    // await db.query('INSERT INTO insumosproveedor SET ?', [datos]);

    res.json({ message: 'Proveedor asignado correctamente' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};