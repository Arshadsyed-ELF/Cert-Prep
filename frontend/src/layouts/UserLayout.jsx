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
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:flex-nowrap sm:px-6 sm:py-4 lg:px-8">
          <Link
            to="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="text-xl font-bold tracking-tight text-blue-900"
          >
            Cert-Prep
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 md:hidden dark:border-gray-700 dark:text-gray-200"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
          <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
            <Link
              to="/dashboard"
              className="hover:text-blue-900 dark:text-gray-300 dark:hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              to="/readiness"
              className="hover:text-blue-900 dark:text-gray-300 dark:hover:text-white"
            >
              Readiness
            </Link>
            <Link
              to="/history"
              className="hover:text-blue-900 dark:text-gray-300 dark:hover:text-white"
            >
              My Attempts
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2 sm:ml-0 sm:gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-900">
              {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
            </div>
            <Link to="/profile" className="hidden text-right sm:block">
              <p className="text-sm font-semibold flex items-center">{user?.name || "Learner"}</p>
              {/* <p className="text-xs text-gray-500">{user?.email}</p> */}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-semibold text-gray-500 hover:text-red-600 dark:text-gray-300"
            >
              Log out
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="border-t border-gray-100 px-4 py-3 md:hidden dark:border-gray-800">
            <div className="mx-auto flex max-w-7xl flex-col gap-1 sm:px-2">
              <Link
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Dashboard
              </Link>
              <Link
                to="/readiness"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Readiness
              </Link>
              <Link
                to="/history"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                My Attempts
              </Link>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Profile
              </Link>
            </div>
          </nav>
        )}
      </header>
      <main>{children}</main>
      <footer className="border-t border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900">
        <p>&copy; {new Date().getFullYear()} Cert-Prep. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default UserLayout;
