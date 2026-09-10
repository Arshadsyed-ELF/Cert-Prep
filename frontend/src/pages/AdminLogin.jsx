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
        <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
            <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">Cert-Prep</p>
                <h1 className="mb-2 text-3xl font-bold text-gray-900">Admin sign in</h1>
                <p className="mb-6 text-sm text-gray-500">Manage quizzes and review your certification platform.</p>
                {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                <label className="mb-4 block text-sm font-medium text-gray-700">
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="mt-2 w-full rounded border px-3 py-2"
                        autoComplete="username"
                        required
                    />
                </label>
                <label className="mb-6 block text-sm font-medium text-gray-700">
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="mt-2 w-full rounded border px-3 py-2"
                        autoComplete="current-password"
                        required
                    />
                </label>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded bg-gray-900 py-2 font-semibold text-white hover:bg-gray-700 disabled:bg-gray-400"
                >
                    {loading ? 'Signing in...' : 'Sign in as admin'}
                </button>
                <Link to="/login" className="mt-4 block text-center text-sm text-blue-600 hover:underline">
                    Return to user login
                </Link>
            </form>
        </div>
    );
};

export default AdminLogin;
