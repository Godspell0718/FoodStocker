import jwt from "jsonwebtoken";

export default async function authMiddleware(req, res, next) {
    try {
        console.log('🔍 Middleware - Headers recibidos:', req.headers);
        
        const authHeader = req.get('Authorization');
        console.log('🔍 Middleware - Authorization header:', authHeader);
        
        if (!authHeader) {
            console.log('❌ Middleware - No token provided');
            return res.status(401).json({ message: 'No token provided' });
        }

        // ✅ CORREGIDO: split por espacio, no por caracteres
        const parts = authHeader.split(' ');
        console.log('🔍 Middleware - Parts:', parts);
        
        // ✅ CORREGIDO: parts en lugar de parths
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            console.log('❌ Middleware - Invalid format:', parts[0]);
            return res.status(401).json({ message: 'Invalid authorization format' });
        }

        const token = parts[1];
        console.log('🔍 Middleware - Token extraído:', token ? token.substring(0, 20) + '...' : 'No token');

        if (!token) {
            console.log('❌ Middleware - Token vacío');
            return res.status(401).json({ message: 'No token provided' });
        }

        // ✅ CORREGIDO: process.env (no procces.env)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Middleware - Token válido. Usuario:', decoded);
        
        req.user = decoded;
        return next();
        
    } catch (err) {
        console.error('❌ Middleware - Error:', err.message);
        return res.status(401).json({ message: 'Token invalido o expirado' });
    }
}