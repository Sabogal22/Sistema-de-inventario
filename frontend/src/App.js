import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Products from "./components/Products";
import Category from "./components/Category";
import Location from "./components/Location";
import PrivateRoute from "./components/PrivateRoute";
import User from "./components/Users/User";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* Rutas protegidas dentro de PrivateRoute */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/category" element={<Category />} />
          <Route path="/location" element={<Location />} />
          <Route path="/user" element={<User />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
