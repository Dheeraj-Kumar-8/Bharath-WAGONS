import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import CreateAccount from "../pages/CreateAccount";

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

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;