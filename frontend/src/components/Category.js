import React from 'react';

const Categories = () => {
  // Datos de prueba
  const categories = [
    { id: 1, name: "Electrónica" },
    { id: 2, name: "Periféricos" },
    { id: 3, name: "Monitores" },
    { id: 4, name: "Almacenamiento" },
    { id: 5, name: "Accesorios" },
  ];

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <h2>
          <i className="fa-solid fa-tags me-2"></i> Lista de Categorías
        </h2>
        <button className="btn btn-primary">
          <i className="fa-solid fa-plus me-2"></i>Agregar Categoría
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
          {categories.map((category) => (
            <tr key={category.id}>
              <td>{category.id}</td>
              <td>{category.name}</td>
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

export default Categories;
