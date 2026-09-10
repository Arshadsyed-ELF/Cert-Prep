import React, { useContext } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ component: Component, layout: Layout, adminOnly = false, userOnly = false, ...rest }) => {
  const { isAuthenticated, authLoading, user } = useContext(AuthContext);

  return (
    <Route
      {...rest}
      render={(props) => {
        if (authLoading) {
          return <div className="flex min-h-screen items-center justify-center text-gray-600">Restoring your session...</div>;
        }

        if (!isAuthenticated) {
          return <Redirect to="/login" />;
        }

        if (adminOnly && user?.role !== 'admin') {
          return <Redirect to="/login" />;
        }

        if (userOnly && user?.role === 'admin') {
          return <Redirect to="/admin" />;
        }

        const wrapped = Component ? <Component {...props} /> : null;

        if (Layout) {
          return <Layout>{wrapped}</Layout>;
        }

        return wrapped;
      }}
    />
  );
};

export default ProtectedRoute;
