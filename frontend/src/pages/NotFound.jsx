import React from 'react';

const NotFound = () => {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <h1 className="text-4xl font-bold">404</h1>
                <p className="mt-4 text-lg">Page Not Found</p>
                <p className="mt-2">The page you are looking for does not exist.</p>
            </div>
        </div>
    );
};

export default NotFound;