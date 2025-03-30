import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState("");
  const [editingLocation, setEditingLocation] = useState(null);
  const [editedName, setEditedName] = useState("");
  const token = localStorage.getItem("access_token");

  const fetchLocations = useCallback(async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/location/all/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLocations(response.data);
    } catch (error) {
      console.error("Error al obtener ubicaciones:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const addLocation = async () => {
    if (newLocation.trim() === "") {
      Swal.fire("Error", "El nombre de la ubicación no puede estar vacío", "error");
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
      Swal.fire("Éxito", "Ubicación agregada correctamente", "success");
    } catch (error) {
      console.error("Error al agregar ubicación:", error);
      Swal.fire("Error", "No se pudo agregar la ubicación", "error");
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
      Swal.fire("Error", "El nombre de la ubicación no puede estar vacío", "error");
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
      Swal.fire("Éxito", "Ubicación actualizada correctamente", "success");
    } catch (error) {
      console.error("Error al actualizar ubicación:", error);
      Swal.fire("Error", "No se pudo actualizar la ubicación", "error");
    }
  };

  const deleteLocation = async (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará la ubicación permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://127.0.0.1:8000/location/${id}/delete/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setLocations(locations.filter(loc => loc.id !== id));
          Swal.fire("Eliminado", "Ubicación eliminada correctamente", "success");
        } catch (error) {
          console.error("Error al eliminar ubicación:", error);
          Swal.fire("Error", "No se pudo eliminar la ubicación", "error");
        }
      }
    });
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-lg p-4">
        <h2 className="text-primary mb-3">
          <i className="fa-solid fa-map-marker-alt me-2"></i> Lista de Ubicaciones
        </h2>

        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Nueva ubicación"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
          />
          <button className="btn btn-primary" onClick={addLocation}>
            <i className="fa-solid fa-save me-2"></i>Guardar
          </button>
        </div>

        <table className="table table-hover">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {locations.length > 0 ? (
              locations.map((location) => (
                <tr key={location.id}>
                  <td>{location.id}</td>
                  <td>
                    {editingLocation === location.id ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                      />
                    ) : (
                      location.name
                    )}
                  </td>
                  <td>
                    {editingLocation === location.id ? (
                      <>
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() => updateLocation(location.id)}
                        >
                          <i className="fa-solid fa-check"></i>
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={cancelEditing}
                        >
                          <i className="fa-solid fa-times"></i>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => startEditing(location)}
                        >
                          <i className="fa-solid fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteLocation(location.id)}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center fw-bold text-muted py-3">
                  No hay ubicaciones disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Locations;
