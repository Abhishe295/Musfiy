import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Stats from "./pages/Stats";
import { useAuthStore } from "./stores/useAuthStore";
import { useEffect } from "react";
import { Music2, Loader2 } from "lucide-react";
import AmbientBackground from "./components/AmbientBackground";

function App() {
  const { isAuthenticated, checkAuth, loading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="relative min-h-screen w-full bg-base-100 flex items-center justify-center overflow-hidden">
        <AmbientBackground />

        <div className="relative text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl">
                <Music2 size={40} className="sm:w-12 sm:h-12 text-white" />
              </div>
              <div
                className="absolute inset-0 rounded-2xl border-2 border-primary/25 animate-spin"
                style={{ animationDuration: "3s" }}
              ></div>
            </div>
          </div>

          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2 tracking-tight">
              Musify
            </h1>
            <p className="text-sm sm:text-base text-base-content/50">
              Your personal music experience
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Loader2 size={18} className="animate-spin text-primary" />
            <span className="text-sm text-base-content/50">
              Loading your session...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-base-100">
      <AmbientBackground />
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 2600,
          style: {
            background: "rgb(16 16 20)",
            color: "rgb(237 237 240)",
            border: "1px solid rgb(255 255 255 / 0.08)",
            borderRadius: "14px",
            fontSize: "13px",
            padding: "10px 16px",
            boxShadow: "0 16px 40px -12px rgb(0 0 0 / 0.6)",
          },
          success: { iconTheme: { primary: "rgb(124 92 246)", secondary: "white" } },
        }}
      />

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

        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
        />
      </Routes>
    </div>
  );
}

export default App;
