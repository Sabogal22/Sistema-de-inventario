import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import UserList from "./UserList";
import UserModal from "./UserModal";
import { Button } from "react-bootstrap";
import Swal from "sweetalert2";

const User = () => {
  const [users, setUsers] = useState([]); // Lista de usuarios
  const [modalShow, setModalShow] = useState(false); // Estado del modal
  const [selectedUser, setSelectedUser] = useState(null); // Usuario seleccionado para editar
  const token = localStorage.getItem("access_token");

  // Definir fetchUsers fuera del useEffect
  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/users/all/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  }, [token]); // `useCallback` memoriza la función y solo cambia cuando `token` cambia
  
  useEffect(() => {
    if (token) fetchUsers();
  }, [token, fetchUsers]); 

  // Abrir modal para agregar usuario
  const handleAddUser = () => {
    setSelectedUser(null);
    setModalShow(true);
  };

  // Abrir modal para editar usuario
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setModalShow(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await axios.delete(
        `http://127.0.0.1:8000/users/delete/${userId}/`, 
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.status === 200) {
        setUsers(users.filter(user => user.id !== userId));
        Swal.fire('¡Eliminado!', 'Usuario eliminado correctamente', 'success');
      }
    } catch (error) {
      console.error("Error completo:", error);
      
      let errorMessage = 'No se pudo eliminar el usuario';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      Swal.fire('Error', errorMessage, 'error');
    }
  };

  // Guardar usuario (crear o actualizar)
  const handleSaveUser = async (userData) => {
    if (!userData) {
      console.error("Error: userData es undefined.");
      return;
    }
  
    try {
      if (userData.id) {
        await axios.put(`http://127.0.0.1:8000/users/${userData.id}/`, userData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("http://127.0.0.1:8000/users/create/", userData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
  
      setModalShow(false);
      fetchUsers(); // ✅ Refresca la lista
    } catch (error) {
      console.error("Error al guardar usuario:", error);
    }
  };  

  return (
    <div className="container mt-4">
      <div className="card shadow-lg p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="text-primary">
            <i className="fa-solid fa-users me-2"></i> Lista de Usuarios
          </h2>
          <Button variant="success" onClick={handleAddUser}>
            <i className="fa-solid fa-plus me-2"></i> Agregar Usuario
          </Button>
        </div>

        {/* Lista de usuarios */}
        <UserList 
          users={users} 
          onEditUser={handleEditUser} 
          onDeleteUser={handleDeleteUser}
        />

        {/* Modal para agregar/editar usuario */}
        <UserModal
          show={modalShow}
          handleClose={() => setModalShow(false)}
          user={selectedUser}
          onUserSaved={handleSaveUser}
        />
      </div>
    </div>
  );
};

export default User;
