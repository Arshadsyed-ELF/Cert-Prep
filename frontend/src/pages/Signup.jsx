import React, { useState, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const history = useHistory();
    const { signup } = useContext(AuthContext);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            await signup(formData.name, formData.email, formData.password);
            history.push('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
            <form onSubmit={handleSubmit} className="auth-card w-full max-w-md p-6 sm:p-9">
                <Link to="/" className="auth-brand"><span>⌁</span> certprep</Link>
                <p className="auth-kicker">YOUR NEXT CHAPTER</p><h2>Let’s get you prepared.</h2><p className="auth-subtitle">Create your free learning space in under a minute.</p>
                {error && <p className="auth-error">{error}</p>}
                <div className="mb-4">
                    <label className="auth-label" htmlFor="name">Your name</label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="auth-input w-full py-3 px-4"
                    />
                </div>
                <div className="mb-4">
                    <label className="auth-label" htmlFor="email">Email address</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="auth-input w-full py-3 px-4"
                    />
                </div>
                <div className="mb-4">
                    <label className="auth-label" htmlFor="password">Create a password</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="auth-input w-full py-3 px-4"
                    />
                </div>
                <div className="mb-4">
                    <label className="auth-label" htmlFor="confirmPassword">Confirm password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="auth-input w-full py-3 px-4"
                        autoComplete="new-password"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="auth-submit w-full py-3"
                >
                    {loading ? 'Creating your space...' : <>Create my account <span>→</span></>}
                </button>
                <p className="text-center mt-3 text-sm">
                    Already learning with us? <Link to="/login">Log in</Link>
                </p>
            </form>
        </div>
    );
};

export default Signup;
