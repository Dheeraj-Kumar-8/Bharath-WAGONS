import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import LandingPage        from "../pages/LandingPage";
import LoginPage          from "../pages/LoginPage";
import CreateAccount      from "../pages/CreateAccount";
import AdminDashboard     from "../pages/AdminDashboard";
import LiveTracking       from "../pages/LiveTracking";
import Wagons             from "../pages/Wagons";
import Stations           from "../pages/Stations";
import AIAlerts           from "../pages/AIAlerts";
import CargoMonitoring    from "../pages/CargoMonitoring";
import Analytics          from "../pages/Analytics";
import PredictiveInsights from "../pages/PredictiveInsights";
import WagonHealth        from "../pages/WagonHealth";
import Maintenance        from "../pages/Maintenance";
import Reports            from "../pages/Reports";
import UsersRoles         from "../pages/UsersRoles";
import Settings           from "../pages/Settings";

// Redirects to /login if not authenticated
const Guard = ({ children }) => {
  const { admin } = useAuth();
  return admin ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/"               element={<LandingPage />} />
      <Route path="/login"          element={<LoginPage />} />
      <Route path="/create-account" element={<CreateAccount />} />

      <Route path="/admin"               element={<Guard><AdminDashboard /></Guard>} />
      <Route path="/live-tracking"       element={<Guard><LiveTracking /></Guard>} />
      <Route path="/wagons"              element={<Guard><Wagons /></Guard>} />
      <Route path="/stations"            element={<Guard><Stations /></Guard>} />
      <Route path="/ai-alerts"           element={<Guard><AIAlerts /></Guard>} />
      <Route path="/cargo-monitoring"    element={<Guard><CargoMonitoring /></Guard>} />
      <Route path="/analytics"           element={<Guard><Analytics /></Guard>} />
      <Route path="/predictive-insights" element={<Guard><PredictiveInsights /></Guard>} />
      <Route path="/wagon-health"        element={<Guard><WagonHealth /></Guard>} />
      <Route path="/maintenance"         element={<Guard><Maintenance /></Guard>} />
      <Route path="/reports"             element={<Guard><Reports /></Guard>} />
      <Route path="/users-roles"         element={<Guard><UsersRoles /></Guard>} />
      <Route path="/settings"            element={<Guard><Settings /></Guard>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
