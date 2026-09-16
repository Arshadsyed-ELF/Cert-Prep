import React, { useContext } from 'react';
import { Link, NavLink, useHistory } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminLayout = ({ children }) => {
    const { user, logout } = useContext(AuthContext);
    const history = useHistory();

    const handleLogout = () => {
        logout();
        history.replace('/admin/login');
    };

    return (
        <div className="app-shell admin-shell min-h-screen">
            <header className="admin-header p-4">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="app-brand"><span className="app-brand-mark">C</span> cert<span>prep</span> <small>ADMIN</small></h1>
                        <p className="text-sm opacity-70">{user?.email}</p>
                    </div>
                    <nav className="flex items-center gap-1 text-sm sm:gap-2">
                        <NavLink exact to="/admin/overview" activeClassName="admin-nav-link-active" className="admin-nav-link">Overview</NavLink>
                        <NavLink to="/admin/assessments" activeClassName="admin-nav-link-active" className="admin-nav-link">Assessments</NavLink>
                        <NavLink to="/admin/users" activeClassName="admin-nav-link-active" className="admin-nav-link">Users</NavLink>
                        <button type="button" onClick={handleLogout} className="admin-nav-link">Log out</button>
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
