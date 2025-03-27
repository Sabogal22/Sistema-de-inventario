import React, { useState } from 'react';

const Categories = () => {
  const [categories, setCategories] = useState([
    { id: 1, name: "Electrónica" },
    { id: 2, name: "Periféricos" },
    { id: 3, name: "Monitores" },
    { id: 4, name: "Almacenamiento" },
    { id: 5, name: "Accesorios" },
  ]);

  const [newCategory, setNewCategory] = useState("");

  const handleAddCategory = () => {
    if (newCategory.trim() !== "") {
      const newEntry = {
        id: categories.length + 1,
        name: newCategory.trim(),
      };
      setCategories([...categories, newEntry]);
      setNewCategory("");
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-lg p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="text-primary">
            <i className="fa-solid fa-tags me-2"></i> Lista de Categorías
          </h2>
        </div>

        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Nueva categoría"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleAddCategory}>
            <i className="fa-solid fa-plus me-2"></i>Agregar
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
    </div>
  );
};

export default Categories;
