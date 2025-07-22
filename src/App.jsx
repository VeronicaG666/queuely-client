import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import CreateQueue from "./pages/CreateQueue";
import JoinQueue from "./pages/JoinQueue";
import BusinessDashboard from "./pages/BusinessDashboard";
import Dashboard from "./pages/Dashboard"; // Queue-specific dashboard (with queueId)

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<CreateQueue />} />
          <Route path="/login" element={<Login />} />
          <Route path="/join" element={<JoinQueue />} />

          {/* Dynamic Queue Dashboard (for business view by queue link) */}
          <Route path="/dashboard/:queueId" element={<Dashboard />} />

          {/* Authenticated Business Dashboard */}
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
