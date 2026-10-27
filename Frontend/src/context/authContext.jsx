import { createContext, useState, useEffect } from "react";
import { normalizarRol } from "../utils/roles.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Cargar sesión guardada
  useEffect(() => {
    const storedUser = localStorage.getItem("userFoodStocker");
    const storedToken = localStorage.getItem("tokenFoodStocker");

    if (storedUser && storedToken) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.rol) parsed.rol = normalizarRol(parsed.rol);
        setUser(parsed);
      } catch (e) {
        setUser(JSON.parse(storedUser));
      }
      setToken(storedToken);
    }
  }, []);

  const login = (usuario, token) => {
    const usuarioNormalizado = usuario ? { ...usuario, rol: normalizarRol(usuario.rol) } : usuario;
    localStorage.setItem("userFoodStocker", JSON.stringify(usuarioNormalizado));
    localStorage.setItem("tokenFoodStocker", token);

    setUser(usuarioNormalizado);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem("userFoodStocker");
    localStorage.removeItem("tokenFoodStocker");

    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};