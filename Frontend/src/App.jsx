import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Stats from "./pages/Stats";
import { useAuthStore } from "./stores/useAuthStore";
import { useEffect } from "react";
import { useThemeStore } from "./lib/useTheme";
import ThemePage from "./pages/ThemePage";
import { Music2, Loader2 } from "lucide-react";

function App() {
  const { isAuthenticated, checkAuth, loading } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div data-theme={theme} className="min-h-screen w-full bg-gradient-to-br from-base-300 to-base-200 flex items-center justify-center">
        
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse"></div>
        </div>

        {/* Loading Content */}
        <div className="relative text-center space-y-6">
          
          {/* Logo with pulse animation */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl animate-pulse">
                <Music2 size={40} className="sm:w-12 sm:h-12 text-white" />
              </div>
              {/* Rotating ring */}
              <div className="absolute inset-0 rounded-2xl border-4 border-primary/30 animate-spin" style={{ animationDuration: '3s' }}></div>
            </div>
          </div>

          {/* Brand Name */}
          <div>
            <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              Musify
            </h1>
            <p className="text-sm sm:text-base text-base-content/60">
              Your personal music experience
            </p>
          </div>

          {/* Loading Spinner */}
          <div className="flex items-center justify-center gap-3">
            <Loader2 size={20} className="animate-spin text-primary" />
            <span className="text-sm text-base-content/70 animate-pulse">
              Loading your session...
            </span>
          </div>

          {/* Loading dots animation */}
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-theme={theme} className="h-full w-full">
      <Navbar />

      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
        />

        <Route
          path="/"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/stats"
          element={isAuthenticated ? <Stats /> : <Navigate to="/login" replace />}
        />

        <Route path="/theme" element={<ThemePage />} />

        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
        />
      </Routes>
    </div>
  );
}

export default App;