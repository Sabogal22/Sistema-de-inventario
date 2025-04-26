import React, { useState } from "react";
import { Button, Table, Badge, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";

const UserList = ({ users, onEditUser, onDeleteUser }) => {
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const handleDelete = (user) => {
    Swal.fire({
      title: `¿Eliminar usuario ${user.username}?`,
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#198754",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        setDeletingId(user.id);
        if (typeof onDeleteUser === 'function') {
          onDeleteUser(user.id)
            .catch(error => console.error("Error al eliminar:", error))
            .finally(() => setDeletingId(null));
        } else {
          setDeletingId(null);
        }
      }
    });
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    if (typeof onEditUser === 'function') {
      try {
        const editResult = onEditUser(user);
        // Si es una promesa, usa finally
        if (editResult && typeof editResult.finally === 'function') {
          editResult.finally(() => setEditingId(null));
        } else {
          setEditingId(null);
        }
      } catch (error) {
        console.error("Error al editar:", error);
        setEditingId(null);
      }
    } else {
      setEditingId(null);
    }
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      admin: "success",
      pasante: "primary",
      editor: "warning",
      invitado: "secondary"
    };
    return (
      <Badge bg={roleColors[role] || "info"} className="text-capitalize">
        {role}
      </Badge>
    );
  };

  return (
    <div className="table-responsive">
      <Table striped hover className="align-middle">
        <thead className="bg-success text-white">
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Correo</th>
            <th className="text-center">Rol</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id} className={deletingId === user.id ? "table-danger" : ""}>
                <td className="fw-bold">{user.id}</td>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px" }}>
                      <i className="fa-solid fa-user text-success"></i>
                    </div>
                    <span>{user.username}</span>
                  </div>
                </td>
                <td>
                  <a href={`mailto:${user.email}`} className="text-decoration-none">
                    {user.email}
                  </a>
                </td>
                <td className="text-center">
                  {getRoleBadge(user.role)}
                </td>
                <td className="text-center">
                  <div className="d-flex justify-content-center gap-2">
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => handleEdit(user)}
                      disabled={editingId === user.id}
                    >
                      {editingId === user.id ? (
                        <Spinner animation="border" size="sm" className="me-2" />
                      ) : (
                        <i className="fa-solid fa-pen me-2"></i>
                      )}
                      Editar
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(user)}
                      disabled={deletingId === user.id}
                    >
                      {deletingId === user.id ? (
                        <Spinner animation="border" size="sm" className="me-2" />
                      ) : (
                        <i className="fa-solid fa-trash me-2"></i>
                      )}
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-4">
                <div className="d-flex flex-column align-items-center">
                  <i className="fa-solid fa-users-slash text-muted mb-3" style={{ fontSize: "2rem" }}></i>
                  <h5 className="text-muted">No hay usuarios registrados</h5>
                  <p className="text-muted mb-0">Agrega nuevos usuarios para comenzar</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default UserList;