import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    // Obtener datos del usuario
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/user/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsername(response.data.username);
        setRole(response.data.role);
      } catch (error) {
        console.error("Error al obtener usuario:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Bienvenido, {username || "Usuario"} - Rol: {role || "Usuario"}</h1>
      <p className="text-muted">Aquí puedes gestionar tu inventario.</p>

      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card text-white bg-primary mb-3">
            <div className="card-body">
              <h5 className="card-title">
                <i className="fa-solid fa-boxes-stacked me-2"></i>Total Productos
              </h5>
              <p className="fs-4 fw-bold">152</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-success mb-3">
            <div className="card-body">
              <h5 className="card-title">
                <i className="fa-solid fa-warehouse me-2"></i>Stock Disponible
              </h5>
              <p className="fs-4 fw-bold">89%</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-danger mb-3">
            <div className="card-body">
              <h5 className="card-title">
                <i className="fa-solid fa-exclamation-circle me-2"></i>Productos Agotados
              </h5>
              <p className="fs-4 fw-bold">12</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
