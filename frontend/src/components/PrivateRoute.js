import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Navbar from "./Navbar"; // Se renderiza solo cuando el usuario está autenticado.

const PrivateRoute = () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
        return <Navigate to="/" replace />;
    }

    return (
        <>
            <Navbar /> {/* Se renderiza solo si el usuario está autenticado */}
            <Outlet /> {/* Renderiza las rutas hijas como Dashboard y Products */}
        </>
    );
};

export default PrivateRoute;
