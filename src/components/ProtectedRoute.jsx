// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { business } = useAuth();

  if (!business) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
