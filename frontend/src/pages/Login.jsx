import React, { useState, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await login(email, password);
            history.push('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        }
        // Admin sign inAdmin sign inAdmin sign in
    };

    return (
        <div className="auth-page flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
            <form onSubmit={handleSubmit} className="auth-card w-full max-w-md p-6 sm:p-9">
                <Link to="/" className="auth-brand"><span>⌁</span> certprep</Link>
                <p className="auth-kicker">WELCOME BACK</p>
                <h1>Sign in to continue.</h1>
                <p className="auth-subtitle">Pick up your certification preparation right where you left off.</p>
                {error && <p className="auth-error" role="alert">{error}</p>}
                <div className="mb-4">
                    <label className="auth-label" htmlFor="login-email">Email address</label>
                    <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="auth-input w-full px-4 py-3"
                        autoComplete="username"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="auth-label" htmlFor="login-password">Password</label>
                    <input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="auth-input w-full px-4 py-3"
                        autoComplete="current-password"
                        required
                    />
                </div>
                <button type="submit" className="auth-submit w-full py-3">
                    Sign in <span>→</span>
                </button>
                <p className="auth-footer text-center mt-3 text-sm">
                    Need an account? <Link to="/signup">Create one</Link>
                </p>
                <p className="auth-footer mt-3 text-center text-sm">
                    <Link to="/admin/login">Admin sign in</Link>
                </p>
            </form>
        </div>
    );
};

export default Login;
