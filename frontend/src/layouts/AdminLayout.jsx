import React, { useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminLayout = ({ children }) => {
    const { user, logout } = useContext(AuthContext);
    const history = useHistory();

    const handleLogout = () => {
        logout();
        history.replace('/admin/login');
    };

    return (
        <div className="admin-layout min-h-screen bg-gray-100 dark:bg-gray-950">
            <header className="bg-gray-900 p-4 text-white shadow-sm">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold">Cert-Prep Admin</h1>
                        <p className="text-sm text-gray-300">{user?.email}</p>
                    </div>
                    <nav className="flex items-center gap-3 text-sm sm:gap-4">
                        <Link to="/admin" className="hover:text-blue-300">Dashboard</Link>
                        <button type="button" onClick={handleLogout} className="hover:text-blue-300">Log out</button>
                    </nav>
                </div>
            </header>
            <main className="mx-auto max-w-6xl p-4">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;