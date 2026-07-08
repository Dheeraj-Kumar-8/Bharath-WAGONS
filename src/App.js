import AppRoutes from "./routes/AppRoutes";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { WagonDataProvider } from "./context/WagonDataContext";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <WagonDataProvider>
          <AppRoutes />
        </WagonDataProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
