import React from 'react';

const Products = () => {
  const productos = [
    { id: 1, name: "Laptop HP", description: "Laptop HP con Intel i7.", category: "Electrónica", location: "Almacén A1", status: "Disponible", qrCode: "QR123456" },
    { id: 2, name: "Mouse Logitech", description: "Mouse inalámbrico.", category: "Periféricos", location: "Almacén B3", status: "Agotado", qrCode: "QR789012" },
    { id: 3, name: "Teclado Mecánico", description: "Teclado con switches rojos.", category: "Periféricos", location: "Almacén C2", status: "Disponible", qrCode: "QR345678" },
    { id: 4, name: "Monitor Samsung 24'", description: "Monitor Full HD 75Hz.", category: "Monitores", location: "Almacén D5", status: "Disponible", qrCode: "QR901234" },
    { id: 5, name: "Disco SSD 1TB", description: "Unidad NVMe 1TB.", category: "Almacenamiento", location: "Almacén E4", status: "Disponible", qrCode: "QR567890" },
  ];

  return (
    <div className="container mt-4">
      <div className="card shadow-lg p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="text-primary">
            <i className="fa-solid fa-box me-2"></i> Lista de Productos
          </h2>
          <div>
            <button className="btn btn-success me-2">
              <i className="fa-solid fa-file-excel me-2"></i> Exportar a Excel
            </button>
            <button className="btn btn-secondary">
              <i className="fa-solid fa-print me-2"></i> Imprimir Lista
            </button>
          </div>
        </div>

        <table className="table table-hover">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Ubicación</th>
              <th>Estado</th>
              <th>QR Code</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id}>
                <td>{producto.id}</td>
                <td>{producto.name}</td>
                <td>{producto.description}</td>
                <td>{producto.category}</td>
                <td>{producto.location}</td>
                <td>
                  <span className={`badge ${producto.status === "Disponible" ? "bg-success" : "bg-danger"}`}>
                    {producto.status}
                  </span>
                </td>
                <td>{producto.qrCode}</td>
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

export default Products;
