import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

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

  const fetchNotifications = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/notifications/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data.notifications || response.data);
    } catch (err) {
      setError("Error al cargar las notificaciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
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
      await axios.post(
        "http://127.0.0.1:8000/notifications/mark-all/", 
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      setError("Error al marcar como leídas.");
    }
  };

  const markSingleAsRead = async (notifId, e) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
      e.preventDefault();
    }

    try {
      await axios.post(
        `http://127.0.0.1:8000/notifications/mark/${notifId}/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(notifications.map(n => 
        n.id === notifId ? { ...n, is_read: true } : n
      ));
    } catch (err) {
      setError("Error al marcar la notificación como leída.");
    }
  };

  const handleDeleteNotification = async (notifId, e) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    try {
      await axios.delete(
        `http://127.0.0.1:8000/notifications/delete/${notifId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(notifications.filter(n => n.id !== notifId));
    } catch (err) {
      setError("Error al eliminar la notificación.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
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
        <Link className="navbar-brand d-flex align-items-center" to="/dashboard">
          <div className="bg-white rounded-circle p-2 me-2 d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
            <img 
              src="/logo.png" 
              alt="Logo" 
              style={{ width: "40px", height: "40px", objectFit: "contain" }} 
            />
          </div>
          <span className="fw-bold">Inventario FET</span>
        </Link>

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

          <div className="d-flex align-items-center">
            {/* Notificaciones mejoradas */}
            <div className="dropdown me-3 position-static" ref={notificationRef}>
              <button 
                className="btn btn-link text-white position-relative p-0" 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) fetchNotifications();
                }}
                aria-label="Notificaciones"
                style={{
                  transition: "all 0.3s ease",
                  transform: unreadCount > 0 ? "scale(1.1)" : "scale(1)"
                }}
              >
                <i className={`fa-solid fa-bell fs-5 ${unreadCount > 0 ? "text-warning" : ""}`}></i>
                {unreadCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              <div 
                className={`dropdown-menu dropdown-menu-end p-0 shadow-lg ${showNotifications ? 'show' : ''}`}
                style={{
                  width: "350px",
                  maxHeight: "70vh",
                  overflowY: "auto",
                  position: "absolute",
                  right: "0",
                  left: "auto",
                  marginTop: "5px",
                  border: "none",
                  borderRadius: "10px",
                  borderTop: "3px solid #28a745"
                }}
              >
                <div className="d-flex justify-content-between align-items-center px-3 py-2 bg-light border-bottom">
                  <h6 className="mb-0 fw-bold">
                    <i className="fa-solid fa-bell me-2 text-success"></i>
                    Notificaciones
                  </h6>
                  <button 
                    className="btn btn-sm btn-outline-success"
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                  >
                    <i className="fa-solid fa-check-double me-1"></i>
                    Marcar todas
                  </button>
                </div>
                
                <div className="notification-content">
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-success" role="status"></div>
                      <p className="mt-2 text-muted">Cargando notificaciones...</p>
                    </div>
                  ) : error ? (
                    <div className="alert alert-danger m-3">{error}</div>
                  ) : notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`dropdown-item p-3 ${!notif.is_read ? "bg-light" : ""}`}
                        style={{
                          borderLeft: !notif.is_read ? "4px solid #28a745" : "none",
                          cursor: "pointer",
                          whiteSpace: "normal",
                          wordBreak: "break-word"
                        }}
                        onClick={(e) => {
                          if (!notif.is_read) {
                            markSingleAsRead(notif.id, e);
                          }
                        }}
                      >
                        <div className="d-flex flex-column">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <p className="mb-0" style={{
                              color: !notif.is_read ? "#212529" : "#6c757d",
                              fontWeight: !notif.is_read ? "500" : "normal"
                            }}>
                              {notif.message}
                            </p>
                            <div className="d-flex gap-1 ms-2">
                              {!notif.is_read && (
                                <button 
                                  className="btn btn-sm btn-outline-success"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markSingleAsRead(notif.id, e);
                                  }}
                                  title="Marcar como leída"
                                >
                                  <i className="fa-solid fa-check"></i>
                                </button>
                              )}
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notif.id, e);
                                }}
                                title="Eliminar notificación"
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </div>
                          </div>
                          <small className="text-muted">
                            <i className="fa-regular fa-clock me-1"></i>
                            {new Date(notif.created_at).toLocaleString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </small>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted p-4">
                      <i className="fa-regular fa-bell-slash fa-3x mb-3 text-secondary"></i>
                      <h6 className="mb-1">No hay notificaciones</h6>
                      <small>Cuando tengas notificaciones, aparecerán aquí</small>
                    </div>
                  )}
                </div>
              </div>
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
                  <button 
                    className="dropdown-item"
                    onClick={() => {
                      Swal.fire({
                        icon: "info",
                        title: "Próximamente",
                        text: "La sección 'Mi perfil' estará disponible en una futura actualización.",
                        confirmButtonColor: "#28a745"
                      });
                    }}
                  >
                    <i className="fa-solid fa-user-gear me-2"></i> Mi perfil
                    <small className="text-muted ms-1">(Próximamente)</small>
                  </button>
                </li>
                {user.role === "admin" && (
                  <li>
                    <Link className="dropdown-item" to="/send-notification">
                      <i className="fa-solid fa-paper-plane me-2"></i> Enviar notificación
                    </Link>
                  </li>
                )}
                <li>
                  <button 
                    className="dropdown-item"
                    onClick={() => {
                      Swal.fire({
                        icon: "info",
                        title: "Próximamente",
                        text: "La sección 'Configuración' estará disponible en una futura actualización.",
                        confirmButtonColor: "#28a745"
                      });
                    }}
                  >
                    <i className="fa-solid fa-gear me-2"></i> Configuración
                    <small className="text-muted ms-1">(Próximamente)</small>
                  </button>
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