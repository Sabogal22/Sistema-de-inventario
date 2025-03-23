import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/dashboard">
          <i className="fa-solid fa-warehouse me-2"></i> Inventario
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">
                <i className="fa-solid fa-house me-1"></i> Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/products">
                <i className="fa-solid fa-boxes me-1"></i> Productos
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/categorias">
                <i className="fa-solid fa-tags me-1"></i> Categorías
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/reportes">
                <i className="fa-solid fa-chart-line me-1"></i> Reportes
              </Link>
            </li>
            <li className="nav-item">
              <button className="btn btn-danger btn-sm ms-3" onClick={handleLogout}>
                <i className="fa-solid fa-sign-out-alt me-1"></i> Cerrar Sesión
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
