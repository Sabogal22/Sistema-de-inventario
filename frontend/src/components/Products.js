import React from 'react';

const Products = () => {
  // Datos de prueba con los nuevos campos
  const productos = [
    {
      id: 1,
      name: "Laptop HP",
      description: "Laptop HP de última generación con procesador Intel i7.",
      category: "Electrónica",
      location: "Almacén A1",
      status: "Disponible",
      qrCode: "QR123456",
    },
    {
      id: 2,
      name: "Mouse Logitech",
      description: "Mouse inalámbrico con sensor óptico de alta precisión.",
      category: "Periféricos",
      location: "Almacén B3",
      status: "Agotado",
      qrCode: "QR789012",
    },
    {
      id: 3,
      name: "Teclado Mecánico",
      description: "Teclado mecánico retroiluminado con switches rojos.",
      category: "Periféricos",
      location: "Almacén C2",
      status: "Disponible",
      qrCode: "QR345678",
    },
    {
      id: 4,
      name: "Monitor Samsung 24'",
      description: "Monitor Full HD con tecnología LED y 75Hz de refresco.",
      category: "Monitores",
      location: "Almacén D5",
      status: "Disponible",
      qrCode: "QR901234",
    },
    {
      id: 5,
      name: "Disco SSD 1TB",
      description: "Unidad de estado sólido NVMe para mayor velocidad.",
      category: "Almacenamiento",
      location: "Almacén E4",
      status: "Disponible",
      qrCode: "QR567890",
    },
  ];

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <h2>
          <i className="fa-solid fa-box me-2"></i> Lista de Productos
        </h2>
        <button className="btn btn-primary">
          <i className="fa-solid fa-plus me-2"></i>Agregar Producto
        </button>
      </div>

      <table className="table table-striped mt-3">
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
  );
};

export default Products;