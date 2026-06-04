import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import CreateAccount from "../pages/CreateAccount";
import AdminDashboard from "../pages/AdminDashboard";
import LiveTracking from "../pages/LiveTracking";
import Wagons from "../pages/Wagons";
import Stations from "../pages/Stations";
import AIAlerts from "../pages/AIAlerts";
import CargoMonitoring from "../pages/CargoMonitoring";
import Analytics from "../pages/Analytics";
import PredictiveInsights from "../pages/PredictiveInsights";
import WagonHealth from "../pages/WagonHealth";
import Maintenance from "../pages/Maintenance";
import Reports from "../pages/Reports";
import UsersRoles from "../pages/UsersRoles";
import Settings from "../pages/Settings";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />
        <Route
          path="/create-account"
          element={<CreateAccount />}
       />

        <Route
          path="/admin"
          element={<AdminDashboard />}
       />
       <Route path="/live-tracking" element={<LiveTracking />} />
      <Route path="/wagons" element={<Wagons />} />
      <Route path="/stations" element={<Stations />} />
      <Route path="/ai-alerts" element={<AIAlerts />} />
      <Route path="/cargo-monitoring" element={<CargoMonitoring />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/predictive-insights" element={<PredictiveInsights />} />
      <Route path="/wagon-health" element={<WagonHealth />} />
      <Route path="/maintenance" element={<Maintenance />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/users-roles" element={<UsersRoles />} />
      <Route path="/settings" element={<Settings />} />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;