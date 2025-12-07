import { Palette, LogOut } from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { isAuthenticated, userName, logout } = useAuthStore();

  const firstLetter = userName ? userName.charAt(0).toUpperCase() : "?";

  return (
    <div className="navbar bg-base-100/80 backdrop-blur-md border-b border-base-300 px-6 sticky top-0 z-50 shadow-sm">

      {/* LEFT: Brand */}
      <div className="flex-1">
        <Link 
          to="/" 
          className="text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hover:scale-105 transition-transform"
        >
          Musify
        </Link>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">

        {/* Theme Button */}
        <Link 
          to="/theme" 
          className="btn btn-ghost btn-circle hover:bg-primary/10 hover:text-primary transition-all duration-300"
        >
          <Palette size={20} strokeWidth={2} />
        </Link>

        {/* IF NOT LOGGED IN → Show login */}
        {!isAuthenticated ? (
          <Link 
            to="/login" 
            className="btn btn-primary btn-sm px-6 rounded-full shadow-lg hover:shadow-primary/50 transition-all duration-300"
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
              <div className="bg-gradient-to-br from-primary to-secondary text-base-100 rounded-full w-10 h-10 ring-2 ring-primary/20 group-hover:ring-4 group-hover:ring-primary/40 transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:scale-105">
                <span className="text-base font-bold">{firstLetter}</span>
              </div>
            </div>

            <ul
              tabIndex={0}
              className="dropdown-content z-[100] menu p-3 shadow-2xl bg-base-100 rounded-2xl w-52 mt-3 border border-base-300"
            >
              <li className="menu-title px-4 py-2">
                <div className="flex items-center gap-3">
                  <div className="avatar placeholder">
                    <div className="bg-gradient-to-br from-primary to-secondary text-base-100 rounded-full w-10 h-10">
                      <span className="text-sm font-bold">{firstLetter}</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-base-content">{userName}</span>
                    <span className="text-xs text-base-content/60">Member</span>
                  </div>
                </div>
              </li>
              
              <div className="divider my-1"></div>

              <li>
                <button 
                  onClick={logout} 
                  className="flex items-center gap-3 text-error hover:bg-error/10 rounded-lg py-3 font-medium transition-colors duration-200"
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