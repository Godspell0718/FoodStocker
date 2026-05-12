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

      if (!rolesPermitidos.includes(rol)) {
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