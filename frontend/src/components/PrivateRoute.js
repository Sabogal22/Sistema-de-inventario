import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const PrivateRoute = () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
        return <Navigate to="/" replace />;
    }

    return (
        <>
            <Navbar />
            <Outlet />
        </>
    );
};

export default PrivateRoute;
