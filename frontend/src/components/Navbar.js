import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const [notifications, setNotifications] = useState([
    { id: 1, message: "Nuevo producto agregado", read: false },
    { id: 2, message: "Stock bajo en 'Laptop HP'", read: false },
    { id: 3, message: "Orden #1234 completada", read: false },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/");
  };

  // Cerrar dropdown si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/dashboard">
          <i className="fa-solid fa-warehouse me-2"></i> Inventario
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
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
              <Link className="nav-link" to="/category">
                <i className="fa-solid fa-tags me-1"></i> Categorías
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/location">
                <i className="fa-solid fa-location-dot me-1"></i> Localizaciones
              </Link>
            </li>

            {/* Notificaciones */}
            <li className="nav-item dropdown position-relative" ref={notificationRef}>
              <button className="nav-link btn btn-link text-white position-relative" onClick={() => setShowNotifications(!showNotifications)}>
                <i className="fa-solid fa-bell"></i>
                {unreadCount > 0 && <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">{unreadCount}</span>}
              </button>

              {/* Dropdown de notificaciones */}
              {showNotifications && (
                <div className="dropdown-menu d-block position-absolute end-0 top-100 mt-2 shadow-lg bg-white rounded" style={{ minWidth: "250px" }}>
                  <h6 className="dropdown-header">Notificaciones</h6>
                  {notifications.length > 0 ? (
                    <>
                      {notifications.map((notif) => (
                        <div key={notif.id} className={`dropdown-item d-flex justify-content-between align-items-center ${notif.read ? "text-muted" : ""}`}>
                          {notif.message}
                          {!notif.read && <span className="badge bg-primary">Nuevo</span>}
                        </div>
                      ))}
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item text-primary" onClick={markAllAsRead}>
                        Marcar todas como leídas
                      </button>
                    </>
                  ) : (
                    <div className="dropdown-item text-muted">Sin notificaciones</div>
                  )}
                </div>
              )}
            </li>

            {/* Cerrar sesión */}
            <li className="nav-item">
              <button className="btn btn-danger btn-sm ms-3" onClick={handleLogout}>
                <i className="fa-solid fa-right-from-bracket me-1"></i> Cerrar Sesión
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
