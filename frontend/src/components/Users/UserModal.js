import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";

const UserModal = ({ show, handleClose, user, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'pasante',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const availableRoles = [
    { value: 'pasante', label: 'Pasante' },
    { value: 'admin', label: 'Administrador' }
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        role: user.role || 'pasante',
        password: '' // Siempre vacío para edición
      });
    } else {
      setFormData({
        username: '',
        email: '',
        role: 'pasante',
        password: ''
      });
    }
    setErrors({});
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Nombre de usuario es requerido';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Correo electrónico no válido';
    }
    
    if (!['admin', 'pasante'].includes(formData.role)) {
      newErrors.role = 'Rol no válido';
    }
    
    if (!user && !formData.password) {
      newErrors.password = 'Contraseña es requerida para nuevo usuario';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Envía todos los campos obligatorios siempre
      const submissionData = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        // Envía password solo si es nuevo usuario o si se proporcionó
        ...(!user ? { password: formData.password } : 
            formData.password ? { password: formData.password } : {})
      };
      console.log("Enviando datos:", submissionData); // Para depuración
      onSave(submissionData);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title>
          <i className={`fas fa-${user ? 'user-edit' : 'user-plus'} me-2`}></i>
          {user ? 'Editar Usuario' : 'Crear Usuario'}
        </Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          {Object.keys(errors).length > 0 && (
            <Alert variant="danger">
              Por favor corrija los errores en el formulario
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Nombre de Usuario*</Form.Label>
            <Form.Control
              name="username"
              value={formData.username}
              onChange={handleChange}
              isInvalid={!!errors.username}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.username}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Correo Electrónico*</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              isInvalid={!!errors.email}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Rol*</Form.Label>
            <Form.Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              isInvalid={!!errors.role}
              required
            >
              {availableRoles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.role}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Contraseña {!user && <span className="text-danger">*</span>}
            </Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              isInvalid={!!errors.password}
              placeholder={user ? "Dejar en blanco para no cambiar" : ""}
              required={!user}
            />
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
            {user && (
              <Form.Text className="text-muted">
                Solo complete si desea cambiar la contraseña
              </Form.Text>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="success" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" /> 
                Guardando...
              </>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>
                Guardar
              </>
            )}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default UserModal;