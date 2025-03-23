import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Navbar = ({ handleLogout }) => {
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
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">
                <i className="fa-solid fa-house me-2"></i> Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/productos">
                <i className="fa-solid fa-box me-2"></i> Productos
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/categorias">
                <i className="fa-solid fa-tags me-2"></i> Categorías
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/reportes">
                <i className="fa-solid fa-chart-line me-2"></i> Reportes
              </Link>
            </li>
          </ul>

          {/* Botón de Cerrar Sesión */}
          <button onClick={handleLogout} className="btn btn-danger">
            <i className="fa-solid fa-right-from-bracket me-2"></i> Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
};

const Dashboard = () => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      console.error("No hay token disponible");
      navigate('/');
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/user/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsername(response.data.username);
        setRole(response.data.role);
      } catch (error) {
        console.error("Error al obtener usuario:", error);
        navigate('/');
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/');
  };

  return (
    <div>
      <Navbar handleLogout={handleLogout} />

      <div className="container mt-4">
        <h1 className="mb-4">Bienvenido, {username || 'Usuario'} - Rol: {role || 'Usuario'}</h1>
        <p className="text-muted">Aquí puedes gestionar tu inventario.</p>

        <div className="row mt-4">
          <div className="col-md-4">
            <div className="card text-white bg-primary mb-3">
              <div className="card-body">
                <h5 className="card-title"><i className="fa-solid fa-boxes-stacked me-2"></i>Total Productos</h5>
                <p className="fs-4 fw-bold">152</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-white bg-success mb-3">
              <div className="card-body">
                <h5 className="card-title"><i className="fa-solid fa-warehouse me-2"></i>Stock Disponible</h5>
                <p className="fs-4 fw-bold">89%</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-white bg-danger mb-3">
              <div className="card-body">
                <h5 className="card-title"><i className="fa-solid fa-exclamation-circle me-2"></i>Productos Agotados</h5>
                <p className="fs-4 fw-bold">12</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
