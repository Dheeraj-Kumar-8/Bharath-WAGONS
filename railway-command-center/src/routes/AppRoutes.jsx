import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SearchProvider } from "../context/SearchContext";
import { OperatorDataProvider } from "../context/OperatorDataContext";
import OperatorSearchModal from "../components/OperatorSearchModal";

import LandingPage        from "../pages/LandingPage";
import LoginPage          from "../pages/LoginPage";
import CreateAccount      from "../pages/CreateAccount";
import ActivatePage       from "../pages/ActivatePage";
import PasswordResetPage  from "../pages/PasswordResetPage";
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
import OperatorDashboard  from "../pages/OperatorDashboard";
import OperatorWagons     from "../pages/OperatorWagons";
import OperatorTracking   from "../pages/OperatorTracking";
import OperatorMaintenance from "../pages/OperatorMaintenance";
import OperatorAlerts     from "../pages/OperatorAlerts";
import OperatorCargo      from "../pages/OperatorCargo";
import OperatorReports    from "../pages/OperatorReports";
import OperatorSettings   from "../pages/OperatorSettings";

const Guard = ({ children }) => {
  const { admin } = useAuth();
  return admin ? children : <Navigate to="/login" replace />;
};

const OperatorGuard = ({ children }) => {
  const { operator, operators } = useAuth();
  if (!operator) return <Navigate to="/login" replace />;
  const live = operators.find(o => o.id === operator.id);
  if (live && live.status !== "Active") return <Navigate to="/login" replace />;
  return children;
};

// Operator shell: single OperatorDataProvider + SearchProvider wrap ALL operator routes
// so state (alerts resolved, maintenance updated, etc.) persists during navigation
const OperatorShell = ({ children }) => (
  <OperatorGuard>
    <OperatorDataProvider>
      <SearchProvider>
        {children}
        <OperatorSearchModal />
      </SearchProvider>
    </OperatorDataProvider>
  </OperatorGuard>
);

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/"               element={<LandingPage />} />
      <Route path="/login"          element={<LoginPage />} />
      <Route path="/create-account" element={<CreateAccount />} />
      <Route path="/activate/:token"       element={<ActivatePage />} />
      <Route path="/reset-password/:token" element={<PasswordResetPage />} />

      {/* Admin routes — completely untouched */}
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

      {/* Operator routes — single shared shell */}
      <Route path="/operator"            element={<OperatorShell><OperatorDashboard /></OperatorShell>} />
      <Route path="/operator/wagons"     element={<OperatorShell><OperatorWagons /></OperatorShell>} />
      <Route path="/operator/tracking"   element={<OperatorShell><OperatorTracking /></OperatorShell>} />
      <Route path="/operator/maintenance" element={<OperatorShell><OperatorMaintenance /></OperatorShell>} />
      <Route path="/operator/alerts"     element={<OperatorShell><OperatorAlerts /></OperatorShell>} />
      <Route path="/operator/cargo"      element={<OperatorShell><OperatorCargo /></OperatorShell>} />
      <Route path="/operator/reports"    element={<OperatorShell><OperatorReports /></OperatorShell>} />
      <Route path="/operator/settings"   element={<OperatorShell><OperatorSettings /></OperatorShell>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
