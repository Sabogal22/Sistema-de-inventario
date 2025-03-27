import React, { useState, useEffect } from "react";
import axios from "axios";

const User = () => {
  const [users, setUsers] = useState([]); // Cambiar a una lista
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/users/all/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data); // Guardar la lista de usuarios
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };

    if (token) {
      fetchUsers();
    }
  }, [token]);

  return (
    <div className="container mt-4">
      <div className="card shadow-lg p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="text-primary">
            <i className="fa-solid fa-users me-2"></i> Lista de Usuarios
          </h2>
          <button className="btn btn-success">
            <i className="fa-solid fa-user-plus me-2"></i> Agregar Usuario
          </button>
        </div>

        <table className="table table-hover">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Nombre de Usuario</th>
              <th>Correo Electrónico</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.role || "N/A"}</td>
                  <td>
                    <button className="btn btn-warning btn-sm me-2">
                      <i className="fa-solid fa-edit"></i> Editar
                    </button>
                    <button className="btn btn-danger btn-sm">
                      <i className="fa-solid fa-trash"></i> Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  Cargando usuarios...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default User;
