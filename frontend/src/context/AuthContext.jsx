import React, { createContext, useState, useEffect } from 'react';
import { getUser, loginUser, logoutUser, signupUser, adminLoginUser } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(() => Boolean(localStorage.getItem('token')));

    useEffect(() => {
        if (!token) {
            setUser(null);
            setIsAuthenticated(false);
            setAuthLoading(false);
            return;
        }

        const loadUser = async () => {
            setAuthLoading(true);
            try {
                const userData = await getUser(token);
                if (!userData) {
                    throw new Error('Unable to restore the signed-in user.');
                }
                setUser(userData);
                setIsAuthenticated(true);
            } catch (error) {
                localStorage.removeItem('token');
                setUser(null);
                setToken(null);
                setIsAuthenticated(false);
            } finally {
                setAuthLoading(false);
            }
        };

        loadUser();
    }, [token]);

    const login = async (email, password) => {
        const data = await loginUser({email, password});
        const payload = data.data || data;
        const userData = payload.user || null;
        const newToken = payload.token || null;

        if (!newToken || !userData) {
            throw new Error('Login response missing user or token.');
        }

        localStorage.setItem('token', newToken);
        setUser(userData);
        setToken(newToken);
        setIsAuthenticated(true);
        return data;
    };

    const adminLogin = async (email, password) => {
        const data = await adminLoginUser({ email, password });
        const payload = data.data || data;
        const userData = payload.user || null;
        const newToken = payload.token || null;

        if (!newToken || !userData || userData.role !== 'admin') {
            throw new Error('Admin login response is invalid.');
        }

        localStorage.setItem('token', newToken);
        setUser(userData);
        setToken(newToken);
        setIsAuthenticated(true);
        return data;
    };

    const signup = async (name, email, password) => {
        const response = await signupUser({ name, email, password, confirmPassword: password });
        return response;
    };

    const logout = () => {
        logoutUser();
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, authLoading, login, adminLogin, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};