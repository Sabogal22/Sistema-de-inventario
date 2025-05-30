import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Products from "./components/Products";
import Category from "./components/Category";
import Location from "./components/Location";
import PrivateRoute from "./components/PrivateRoute";
import User from "./components/Users/User";
import ItemDetail from "./components/Item/ItemDetail";
import SendNotification from "./components/SendNotification";
import AddItem from "./components/Item/AddItem";
import EditItem from "./components/Item/EditItem";

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
          <Route path="/items/:id" element={<ItemDetail />} />
          <Route path="/send-notification" element={<SendNotification />} />
          <Route path="/products/add" element={<AddItem />} />
          <Route path="/products/edit/:id" element={<EditItem />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
