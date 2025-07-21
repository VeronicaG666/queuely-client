import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import CreateQueue from "./pages/CreateQueue";
import BusinessDashboard from "./pages/BusinessDashboard";
import JoinQueue from "./pages/JoinQueue";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CreateQueue />} />
          <Route path="/login" element={<Login />} />
          <Route path="/join" element={<JoinQueue />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <BusinessDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
