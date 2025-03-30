import React, { useState } from "react";
import { Button, Table } from "react-bootstrap";
import Swal from "sweetalert2";

const UserList = ({ users, onEditUser, onDeleteUser }) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = (user) => {
    Swal.fire({
      title: `¿Eliminar usuario ${user.username}?`,
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        setDeletingId(user.id);
        onDeleteUser(user.id)
          .finally(() => setDeletingId(null));
      }  
    });
  };

  return (
    <Table striped bordered hover responsive>
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
              <td>{user.role}</td>
              <td className="text-center">
                <Button
                  variant="warning"
                  size="sm"
                  className="me-2"
                  onClick={() => onEditUser(user)}
                >
                  <i className="fa fa-edit"></i> Editar
                </Button>
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={() => handleDelete(user)}
                  disabled={deletingId === user.id}
                >
                  <i className="fa fa-trash"></i> 
                  {deletingId === user.id ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" className="text-center fw-bold text-muted py-3">
              No hay usuarios disponibles
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default UserList;
