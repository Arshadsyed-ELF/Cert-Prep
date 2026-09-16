import React, { useContext, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { adminLogin } = useContext(AuthContext);
    const history = useHistory();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            await adminLogin(email, password);
            history.replace('/admin');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Admin login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page admin-auth flex min-h-screen items-center justify-center px-4">
            <form onSubmit={handleSubmit} className="auth-card w-full max-w-md p-8">
                <Link to="/" className="auth-brand"><span>⌁</span> certprep</Link><p className="auth-kicker">CONTROL CENTER</p>
                <h1>Admin sign in</h1><p className="auth-subtitle">Manage assessments and guide every learner.</p>
                {error && <p className="auth-error">{error}</p>}
                <label className="auth-label mb-4 block">
                    Email
                    <input
                        id="admin-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="auth-input mt-2 w-full px-4 py-3"
                        autoComplete="username"
                        required
                    />
                </label>
                <label className="auth-label mb-6 block">
                    Password
                    <input
                        id="admin-password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="auth-input mt-2 w-full px-4 py-3"
                        autoComplete="current-password"
                        required
                    />
                </label>
                <button
                    type="submit"
                    disabled={loading}
                    className="auth-submit w-full py-3 disabled:opacity-50"
                >
                    {loading ? 'Signing in...' : 'Sign in as admin'}
                </button>
                <Link to="/login" className="auth-switch mt-5 block text-center text-sm">
                    Return to user login
                </Link>
            </form>
        </div>
    );
};

export default AdminLogin;
