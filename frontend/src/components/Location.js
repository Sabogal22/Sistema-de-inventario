import React from 'react';

const Locations = () => {
  // Datos de prueba
  const locations = [
    { id: 1, name: "Almacén Central" },
    { id: 2, name: "Depósito Norte" },
    { id: 3, name: "Sucursal Este" },
    { id: 4, name: "Tienda Principal" },
    { id: 5, name: "Bodega Sur" },
  ];

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <h2>
          <i className="fa-solid fa-map-marker-alt me-2"></i> Lista de Ubicaciones
        </h2>
        <button className="btn btn-primary">
          <i className="fa-solid fa-plus me-2"></i>Agregar Ubicación
        </button>
      </div>

      <table className="table table-striped mt-3">
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
  );
};

export default Locations;
