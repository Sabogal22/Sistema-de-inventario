import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const PrivateRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        setIsAuthenticated(!!token);
    }, []);

    if (isAuthenticated === null) {
        return <div>Cargando...</div>;
    }

    return isAuthenticated ? (
        <>
            <Navbar />
            <Outlet />
        </>
    ) : (
        <Navigate to="/" replace />
    );
};

export default PrivateRoute;
