import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import UserList from "./UserList";
import UserModal from "./UserModal";
import { Button, Card, Container, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";

const User = () => {
  const [users, setUsers] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("access_token");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://127.0.0.1:8000/users/all/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los usuarios",
        confirmButtonColor: "#198754"
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchUsers();
  }, [token, fetchUsers]);

  const handleAddUser = () => {
    setSelectedUser(null);
    setModalShow(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setModalShow(true);
  };

  const handleDeleteUser = async (userId) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#198754",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(
          `http://127.0.0.1:8000/users/delete/${userId}/`, 
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
    
        setUsers(users.filter(user => user.id !== userId));
        Swal.fire({
          icon: "success",
          title: "¡Eliminado!",
          text: "Usuario eliminado correctamente",
          confirmButtonColor: "#198754",
          timer: 2000
        });
      } catch (error) {
        console.error("Error completo:", error);
        
        let errorMessage = 'No se pudo eliminar el usuario';
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }
        
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
          confirmButtonColor: "#198754"
        });
      }
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      setLoading(true);
      
      // Datos base obligatorios
      const payload = {
        username: userData.username,
        email: userData.email,
        role: userData.role
      };
  
      // Lógica diferente para creación vs edición
      if (!userData.id) {
        // CREACIÓN - Validar password obligatorio
        if (!userData.password) {
          throw new Error("La contraseña es obligatoria para nuevos usuarios");
        }
        payload.password = userData.password;
      } else {
        // EDICIÓN - Password solo si se proporcionó
        if (userData.password) {
          payload.password = userData.password;
        }
      }
  
      const url = userData.id 
        ? `http://127.0.0.1:8000/users/${userData.id}/`
        : "http://127.0.0.1:8000/users/create/";
  
      const method = userData.id ? 'patch' : 'post';
  
      await axios[method](url, payload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: `Usuario ${userData.id ? "actualizado" : "creado"} correctamente`,
        confirmButtonColor: "#198754",
        timer: 2000
      });
  
      setModalShow(false);
      fetchUsers();
    } catch (error) {
      console.error("Error completo:", error.response?.data || error.message);
      
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.error || 
              error.message || 
              "Error al guardar usuario",
        confirmButtonColor: "#198754"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-success text-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0">
              <i className="fas fa-users-cog me-2"></i>
              Gestión de Usuarios
            </h3>
            <Button 
              variant="light" 
              onClick={handleAddUser}
              className="d-flex align-items-center"
            >
              <i className="fas fa-user-plus me-2 text-success"></i>
              Nuevo Usuario
            </Button>
          </div>
        </Card.Header>

        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
              <p className="mt-2">Cargando usuarios...</p>
            </div>
          ) : (
            <UserList 
              users={users} 
              onEditUser={handleEditUser} 
              onDeleteUser={handleDeleteUser}
            />
          )}
        </Card.Body>
      </Card>

      <UserModal
        show={modalShow}
        handleClose={() => setModalShow(false)}
        user={selectedUser}
        onSave={handleSaveUser}
        isLoading={loading}
      />
    </Container>
  );
};

export default User;