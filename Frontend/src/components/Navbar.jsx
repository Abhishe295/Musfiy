import { LogOut, Sun, Moon } from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore";
import { useThemeStore } from "../lib/useTheme";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { isAuthenticated, userName, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const firstLetter = userName ? userName.charAt(0).toUpperCase() : "?";

  return (
    <div className="navbar bg-base-100/70 backdrop-blur-xl border-b border-base-content/[0.06] px-6 sticky top-0 z-50">

      {/* LEFT: Brand */}
      <div className="flex-1">
        <Link
          to="/"
          className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent transition-opacity hover:opacity-80"
        >
          Musify
        </Link>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-3">

        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="btn btn-ghost btn-circle btn-sm hover:text-primary"
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* IF NOT LOGGED IN → Show login */}
        {!isAuthenticated ? (
          <Link
            to="/login"
            className="btn btn-primary btn-sm px-6 rounded-full"
          >
            Login
          </Link>
        ) : (
          /* DROPDOWN */
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="avatar placeholder cursor-pointer group"
            >
              <div className="bg-gradient-to-br from-primary to-secondary text-base-100 rounded-full w-10 h-10 ring-1 ring-base-content/10 group-hover:ring-primary/40 transition-all duration-200">
                <span className="text-base font-bold">{firstLetter}</span>
              </div>
            </div>

            <ul
              tabIndex={0}
              className="dropdown-content z-[100] menu p-3 shadow-lg bg-base-200 rounded-2xl w-52 mt-3 border border-base-content/[0.06]"
            >
              <li className="menu-title px-4 py-2">
                <div className="flex items-center gap-3">
                  <div className="avatar placeholder">
                    <div className="bg-gradient-to-br from-primary to-secondary text-base-100 rounded-full w-10 h-10">
                      <span className="text-sm font-bold">{firstLetter}</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-base-content normal-case">{userName}</span>
                    <span className="text-xs text-base-content/50 normal-case">Member</span>
                  </div>
                </div>
              </li>

              <div className="divider my-1"></div>

              <li>
                <button
                  onClick={logout}
                  className="flex items-center gap-3 text-error hover:bg-error/10 rounded-lg py-3 font-medium transition-colors duration-200 w-full px-3"
                >
                  <LogOut size={18} strokeWidth={2} />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;