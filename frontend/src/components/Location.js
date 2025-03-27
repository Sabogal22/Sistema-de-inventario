import React, { useState } from "react";

const Locations = () => {
  // Estado para almacenar ubicaciones
  const [locations, setLocations] = useState([
    { id: 1, name: "Almacén Central" },
    { id: 2, name: "Depósito Norte" },
    { id: 3, name: "Sucursal Este" },
    { id: 4, name: "Tienda Principal" },
    { id: 5, name: "Bodega Sur" },
  ]);

  // Estado para nueva ubicación
  const [newLocation, setNewLocation] = useState("");

  // Función para agregar nueva ubicación
  const addLocation = () => {
    if (newLocation.trim() !== "") {
      const newEntry = {
        id: locations.length + 1,
        name: newLocation,
      };
      setLocations([...locations, newEntry]);
      setNewLocation(""); // Limpiar campo de input
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-lg p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="text-primary">
            <i className="fa-solid fa-map-marker-alt me-2"></i> Lista de Ubicaciones
          </h2>
        </div>

        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Nueva ubicación"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
          />
          <button className="btn btn-primary" onClick={addLocation}>
            <i className="fa-solid fa-plus me-2"></i>Agregar Ubicación
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
            {locations.map((location) => (
              <tr key={location.id}>
                <td>{location.id}</td>
                <td>{location.name}</td>
                <td>
                  <button className="btn btn-warning btn-sm me-2">
                    <i className="fa-solid fa-edit"></i>
                  </button>
                  <button className="btn btn-danger btn-sm">
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Locations;
