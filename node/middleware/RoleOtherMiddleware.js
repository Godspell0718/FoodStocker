export const authorizeRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'No autenticado' });
      }

      const rol = req.user.Tip_Responsable;

      if (rol === 'ADMIN') {
        return next();
      }

      const ROL_ALIAS = {
        'Pasante de agroindustria': 'GA',
        'Gestor de almacen': 'GA',
        'Gestor de almacén': 'GA',
        'Instructor de agroindustria': 'IEU',
        'Instructor encargado de unidad': 'IEU',
        'Pasante solicitante': 'SOL',
        'Solicitante': 'SOL',
        'PDU': 'GA',
        'IA': 'IEU'
      };

      const rolNormalizado = ROL_ALIAS[rol] || rol;
      const permitidosNormalizados = rolesPermitidos.map(r => ROL_ALIAS[r] || r);

      if (!permitidosNormalizados.includes(rolNormalizado)) {
        return res.status(403).json({
          message: `El rol ${rol} no tiene acceso`
        });
      }

      next();

    } catch (error) {
      return res.status(500).json({
        message: 'Error en middleware de roles',
        error: error.message
      });
    }
  };
};