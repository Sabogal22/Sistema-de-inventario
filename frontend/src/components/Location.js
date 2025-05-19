import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState("");
  const [editingLocation, setEditingLocation] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Ajusta la cantidad de items por página
  const token = localStorage.getItem("access_token");

  const fetchLocations = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://127.0.0.1:8000/location/all/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLocations(response.data);
    } catch (error) {
      console.error("Error al obtener ubicaciones:", error);
      Swal.fire("Error", "No se pudieron cargar las ubicaciones", "error");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const addLocation = async () => {
    if (newLocation.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Campo requerido",
        text: "El nombre de la ubicación no puede estar vacío",
        confirmButtonColor: "#198754"
      });
      return;
    }
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/location/create/",
        { name: newLocation },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLocations([...locations, response.data]);
      setNewLocation("");
      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Ubicación agregada correctamente",
        confirmButtonColor: "#198754"
      });
      setCurrentPage(totalPages); // Ir a la última página si agregas nuevo
    } catch (error) {
      console.error("Error al agregar ubicación:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "No se pudo agregar la ubicación",
        confirmButtonColor: "#198754"
      });
    }
  };

  const startEditing = (location) => {
    setEditingLocation(location.id);
    setEditedName(location.name);
  };

  const cancelEditing = () => {
    setEditingLocation(null);
    setEditedName("");
  };

  const updateLocation = async (id) => {
    if (editedName.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Campo requerido",
        text: "El nombre de la ubicación no puede estar vacío",
        confirmButtonColor: "#198754"
      });
      return;
    }
    try {
      await axios.put(
        `http://127.0.0.1:8000/location/${id}/update/`,
        { name: editedName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLocations(locations.map(loc => (loc.id === id ? { ...loc, name: editedName } : loc)));
      setEditingLocation(null);
      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Ubicación actualizada correctamente",
        confirmButtonColor: "#198754"
      });
    } catch (error) {
      console.error("Error al actualizar ubicación:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "No se pudo actualizar la ubicación",
        confirmButtonColor: "#198754"
      });
    }
  };

  const deleteLocation = async (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#198754",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://127.0.0.1:8000/location/${id}/delete/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setLocations(locations.filter(loc => loc.id !== id));
          Swal.fire({
            icon: "success",
            title: "¡Eliminado!",
            text: "Ubicación eliminada correctamente",
            confirmButtonColor: "#198754"
          });
          // Ajustar página si eliminaste el último item de la última página
          const lastPage = Math.ceil((locations.length - 1) / itemsPerPage);
          if (currentPage > lastPage) setCurrentPage(lastPage);
        } catch (error) {
          console.error("Error al eliminar ubicación:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.response?.data?.message || "No se pudo eliminar la ubicación",
            confirmButtonColor: "#198754"
          });
        }
      }
    });
  };

  // Paginación:
  const totalPages = Math.ceil(locations.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = locations.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (pageNumber) => {
    if (pageNumber < 1) return;
    if (pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container py-4">
      <div className="card shadow border-0">
        <div className="card-header bg-success text-white py-3">
          <h2 className="mb-0 d-flex align-items-center">
            <i className="fa-solid fa-location-dot me-3"></i>
            Gestión de Ubicaciones
          </h2>
        </div>

        <div className="card-body">
          {/* Formulario para agregar nueva ubicación */}
          <div className="row mb-4">
            <div className="col-md-12">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Nombre de la nueva ubicación"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addLocation()}
                />
                <button
                  className="btn btn-success px-4"
                  onClick={addLocation}
                  disabled={!newLocation.trim()}
                >
                  <i className="fa-solid fa-plus me-2"></i> Agregar
                </button>
              </div>
            </div>
          </div>

          {/* Tabla de ubicaciones */}
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th className="w-25">ID</th>
                  <th>Nombre</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="3" className="text-center py-4">
                      <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-muted">
                      <i className="fa-solid fa-inbox fa-2x mb-3"></i>
                      <p className="mb-0 fw-bold">No hay ubicaciones registradas</p>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((location) => (
                    <tr key={location.id} className={editingLocation === location.id ? "table-active" : ""}>
                      <td className="fw-bold">{location.id}</td>
                      <td>
                        {editingLocation === location.id ? (
                          <input
                            type="text"
                            className="form-control"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            autoFocus
                          />
                        ) : (
                          <span className="d-flex align-items-center">
                            <i className="fa-solid fa-location-dot text-success me-2"></i>
                            {location.name}
                          </span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end">
                          {editingLocation === location.id ? (
                            <>
                              <button
                                className="btn btn-sm btn-success me-2"
                                onClick={() => updateLocation(location.id)}
                                disabled={!editedName.trim() || editedName === location.name}
                                title="Guardar cambios"
                              >
                                <i className="fa-solid fa-check"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={cancelEditing}
                                title="Cancelar edición"
                              >
                                <i className="fa-solid fa-times"></i>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn btn-sm btn-outline-warning me-2"
                                onClick={() => startEditing(location)}
                                title="Editar ubicación"
                              >
                                <i className="fa-solid fa-pen"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => deleteLocation(location.id)}
                                title="Eliminar ubicación"
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Controles de paginación */}
          <nav>
            <ul className="pagination justify-content-center">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => goToPage(currentPage - 1)}>Anterior</button>
              </li>

              {[...Array(totalPages)].map((_, idx) => {
                const page = idx + 1;
                return (
                  <li
                    key={page}
                    className={`page-item ${currentPage === page ? "active" : ""}`}
                  >
                    <button className="page-link" onClick={() => goToPage(page)}>{page}</button>
                  </li>
                );
              })}

              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => goToPage(currentPage + 1)}>Siguiente</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Locations;
