// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("business");
    if (saved) {
      setBusiness(JSON.parse(saved));
    }
  }, []);

  const login = (businessData) => {
    localStorage.setItem("business", JSON.stringify(businessData));
    setBusiness(businessData);
  };

  const logout = () => {
    localStorage.removeItem("business");
    setBusiness(null);
  };

  return (
    <AuthContext.Provider value={{ business, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
