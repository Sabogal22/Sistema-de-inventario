import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";

const UserModal = ({ show, handleClose, user, onUserSaved }) => {
  const [formData, setFormData] = useState({
    id: "",
    username: "",
    email: "",
    role: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({ id: user.id, username: user.username, email: user.email, role: user.role, password: "" });
    } else {
      setFormData({ id: "", username: "", email: "", role: "", password: "" });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    console.log("Datos antes de enviar:", formData); // <-- Agregar esto
  
    if (!formData.username || !formData.email) {
      Swal.fire("Error", "Por favor, completa todos los campos.", "error");
      return;
    }
  
    if (!formData.id && !formData.password) {
      Swal.fire("Error", "La contraseña es obligatoria al crear un usuario.", "error");
      return;
    }
  
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };
  
      let requestData = { ...formData };
      if (formData.id && !formData.password) {
        delete requestData.password;
      }
  
      let response;
      if (formData.id) {
        response = await axios.put(`http://127.0.0.1:8000/users/${formData.id}/`, requestData, { headers });
      } else {
        response = await axios.post("http://127.0.0.1:8000/users/create/", requestData, { headers });
      }
  
      console.log("Usuario guardado:", response.data);
  
      if (typeof onUserSaved === "function") {
        await onUserSaved();
      } else {
        console.warn("onUserSaved no está definido o no es una función");
      }
  
      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "Usuario guardado correctamente.",
        timer: 2000,
        showConfirmButton: false
      });
  
      handleClose();
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      if (error.response) {
        Swal.fire("Error", `Error ${error.response.status}: ${JSON.stringify(error.response.data)}`, "error");
      } else {
        Swal.fire("Error", "Error al conectar con el servidor.", "error");
      }
    }
  };  

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{formData.id ? "Editar Usuario" : "Agregar Usuario"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre de Usuario</Form.Label>
            <Form.Control type="text" name="username" value={formData.username} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Correo Electrónico</Form.Label>
            <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={formData.id ? "(Opcional si no quieres cambiarla)" : "Obligatoria"}
              required={!formData.id}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Rol</Form.Label>
            <Form.Select name="role" value={formData.role} onChange={handleChange} required>
              <option value="">Seleccione un rol</option>
              <option value="admin">Admin</option>
              <option value="pasante">Pasante</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserModal;
