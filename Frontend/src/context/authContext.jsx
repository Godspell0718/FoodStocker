import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // 🔹 Cargar sesión guardada
  useEffect(() => {
    const storedUser = localStorage.getItem("userFoodStocker");
    const storedToken = localStorage.getItem("tokenFoodStocker");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const login = (usuario, token) => {
    localStorage.setItem("userFoodStocker", JSON.stringify(usuario));
    localStorage.setItem("tokenFoodStocker", token);

    setUser(usuario);
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