import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="auth-page flex min-h-screen items-center justify-center px-4">
            <div className="auth-card max-w-md p-8 text-center sm:p-12">
                <p className="auth-kicker">WRONG TURN</p>
                <h1 className="text-6xl font-bold">404</h1>
                <h2 className="mt-3">This page has wandered off.</h2>
                <p className="auth-subtitle">Let’s bring you back to a place where your preparation can keep moving.</p>
                <Link to="/" className="auth-submit inline-flex items-center px-5 py-3">Return home <span>→</span></Link>
            </div>
        </div>
    );
};

export default NotFound;
