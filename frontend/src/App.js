import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Products from "./components/Products";
import PrivateRoute from "./components/PrivateRoute";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                {/* Rutas protegidas dentro de PrivateRoute */}
                <Route element={<PrivateRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/products" element={<Products />} />
                </Route>
            </Routes>
        </Router>
    );
};

export default App;
