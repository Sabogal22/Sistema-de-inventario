import React from 'react';

const Products = () => {
  // Datos de prueba
  const productos  = [
    { id: 1, nombre: "Laptop HP", categoria: "Electrónica", precio: 1200, stock: 5 },
    { id: 2, nombre: "Mouse Logitech", categoria: "Periféricos", precio: 25, stock: 0 },
    { id: 3, nombre: "Teclado Mecánico", categoria: "Periféricos", precio: 80, stock: 10 },
    { id: 4, nombre: "Monitor Samsung 24'", categoria: "Monitores", precio: 300, stock: 7 },
    { id: 5, nombre: "Disco SSD 1TB", categoria: "Almacenamiento", precio: 150, stock: 15 },
  ];

  return (
    <div className="container mt-4">
      <h2>
        <i className="fa-solid fa-box me-2"></i>Lista de Productos
      </h2>

      <table className="table table-striped mt-3">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio ($)</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto.id}>
              <td>{producto.id}</td>
              <td>{producto.nombre}</td>
              <td>{producto.categoria}</td>
              <td>{producto.precio.toFixed(2)}</td>
              <td>
                <span className={`badge ${producto.stock > 0 ? "bg-success" : "bg-danger"}`}>
                  {producto.stock > 0 ? producto.stock : "Agotado"}
                </span>
              </td>
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

export default Products;