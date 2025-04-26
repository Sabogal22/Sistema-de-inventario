import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState({ username: "", role: "" });

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/notifications/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(response.data);
      } catch (err) {
        setError("Error al cargar las notificaciones.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchNotifications();
    }
  }, [token]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/user/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser({
          username: response.data.username,
          role: response.data.role,
        });
      } catch (error) {
        console.error("Error al obtener usuario:", error);
      }
    };

    if (token) {
      fetchUser();
    }
  }, [token]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllAsRead = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/notifications/mark-all/", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      setError("Error al marcar como leídas.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm" style={{ borderBottom: "3px solid #0d6e3d" }}>
      <div className="container-fluid">
        {/* Brand/logo */}
        <Link className="navbar-brand d-flex align-items-center" to="/dashboard">
          <div className="bg-white rounded-circle p-2 me-2 d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
            <i className="fa-solid fa-warehouse text-success fs-5"></i>
          </div>
          <span className="fw-bold">Inventario FET</span>
        </Link>

        {/* Mobile toggle */}
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
        >
          <i className="fa-solid fa-bars"></i>
        </button>

        {/* Navbar content */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive("/dashboard")} d-flex align-items-center`} 
                to="/dashboard"
              >
                <i className="fa-solid fa-gauge-high me-2"></i>
                <span>Dashboard</span>
              </Link>
            </li>
            
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive("/products")} d-flex align-items-center`} 
                to="/products"
              >
                <i className="fa-solid fa-boxes-stacked me-2"></i>
                <span>Productos</span>
              </Link>
            </li>
            
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive("/category")} d-flex align-items-center`} 
                to="/category"
              >
                <i className="fa-solid fa-tags me-2"></i>
                <span>Categorías</span>
              </Link>
            </li>
            
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive("/location")} d-flex align-items-center`} 
                to="/location"
              >
                <i className="fa-solid fa-location-dot me-2"></i>
                <span>Ubicaciones</span>
              </Link>
            </li>
            
            {user.role === "admin" && (
              <li className="nav-item">
                <Link 
                  className={`nav-link ${isActive("/user")} d-flex align-items-center`} 
                  to="/user"
                >
                  <i className="fa-solid fa-users-gear me-2"></i>
                  <span>Usuarios</span>
                </Link>
              </li>
            )}
          </ul>

          {/* Right side elements */}
          <div className="d-flex align-items-center">
            {/* Notifications dropdown */}
            <div className="dropdown me-3" ref={notificationRef}>
              <button 
                className="btn btn-link text-white position-relative p-0" 
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notificaciones"
              >
                <i className="fa-solid fa-bell fs-5"></i>
                {unreadCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="dropdown-menu dropdown-menu-end show shadow" 
                  style={{ 
                    width: "350px",
                    maxHeight: "80vh",
                    overflowY: "auto",
                    inset: "0px auto auto 0px",
                    transform: "translate(-258px, 40px)"
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom bg-light">
                    <h6 className="mb-0 fw-bold text-success">Notificaciones</h6>
                    <div>
                      <button 
                        className="btn btn-sm btn-outline-success py-0 px-2"
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                        title="Marcar todas como leídas"
                      >
                        <i className="fa-solid fa-check-double"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="notification-content">
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border text-success" role="status">
                          <span className="visually-hidden">Cargando...</span>
                        </div>
                      </div>
                    ) : error ? (
                      <div className="alert alert-danger m-2">{error}</div>
                    ) : notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`dropdown-item p-3 border-bottom ${!notif.is_read ? "bg-light" : ""}`}
                          style={{ whiteSpace: "normal" }}
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <p className="mb-1 fw-semibold">{notif.message}</p>
                              <small className="text-muted d-block">
                                <i className="fa-regular fa-clock me-1"></i>
                                {new Date(notif.created_at).toLocaleString()}
                              </small>
                            </div>
                            {!notif.is_read && (
                              <span className="badge bg-success ms-2">Nuevo</span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted p-4">
                        <i className="fa-regular fa-bell-slash fa-2x mb-2"></i>
                        <p className="mb-0">No hay notificaciones</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User dropdown */}
            <div className="dropdown">
              <button 
                className="btn btn-link text-white dropdown-toggle d-flex align-items-center" 
                id="userDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <div className="bg-white rounded-circle p-1 me-2">
                  <i className="fa-solid fa-user text-success"></i>
                </div>
                <div className="d-flex flex-column text-start">
                  <span className="fw-bold">{user.username}</span>
                  <small className="text-white-50">{user.role}</small>
                </div>
              </button>
              
              <ul className="dropdown-menu dropdown-menu-end shadow" aria-labelledby="userDropdown">
                <li>
                  <Link className="dropdown-item" to="/profile">
                    <i className="fa-solid fa-user-gear me-2"></i> Mi perfil
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/settings">
                    <i className="fa-solid fa-gear me-2"></i> Configuración
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    <i className="fa-solid fa-right-from-bracket me-2"></i> Cerrar sesión
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;