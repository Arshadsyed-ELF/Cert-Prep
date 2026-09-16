import React, { useContext, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const UserLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const history = useHistory();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    history.replace("/login");
  };

  return (
    <div className="app-shell user-shell min-h-screen text-gray-900 dark:text-gray-100">
      <header className="app-header sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:flex-nowrap sm:px-6 sm:py-4 lg:px-8">
          <Link
            to="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="app-brand"
          >
            <span className="app-brand-mark">C</span> cert<span>prep</span>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="app-menu rounded-lg px-3 py-2 text-sm md:hidden"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
          <nav className="app-desktop-nav hidden items-center gap-2 text-sm font-medium md:flex">
            <Link
              to="/dashboard"
              className="app-nav-link"
            >
              Dashboard
            </Link>
            <Link
              to="/readiness"
              className="app-nav-link"
            >
              Readiness
            </Link>
            <Link
              to="/history"
              className="app-nav-link"
            >
              My Attempts
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2 sm:ml-0 sm:gap-3">
            <div className="app-avatar flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold">
              {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
            </div>
            <Link to="/profile" className="hidden text-right sm:block">
              <p className="app-user-name text-sm font-semibold flex items-center">{user?.name || "Learner"}</p>
              {/* <p className="text-xs text-gray-500">{user?.email}</p> */}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="app-logout text-sm font-semibold"
            >
              Log out
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="app-mobile-nav px-4 py-3 md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1 sm:px-2">
              <Link
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="app-nav-link block rounded-lg px-3 py-3 text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/readiness"
                onClick={() => setMenuOpen(false)}
                className="app-nav-link block rounded-lg px-3 py-3 text-sm font-medium"
              >
                Readiness
              </Link>
              <Link
                to="/history"
                onClick={() => setMenuOpen(false)}
                className="app-nav-link block rounded-lg px-3 py-3 text-sm font-medium"
              >
                My Attempts
              </Link>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="app-nav-link block rounded-lg px-3 py-3 text-sm font-medium"
              >
                Profile
              </Link>
            </div>
          </nav>
        )}
      </header>
      <main>{children}</main>
      <footer className="app-footer px-4 py-7 text-center text-sm">
        <p><strong>certprep</strong> &nbsp;·&nbsp; Learn with clarity. Test with confidence. &nbsp;·&nbsp; © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default UserLayout;
