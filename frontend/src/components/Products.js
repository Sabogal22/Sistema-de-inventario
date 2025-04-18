import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Products = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    const obtenerProductos = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/items/all/', {
          headers: { Authorization: `Bearer ${token}`},
        });
        setProductos(response.data.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error('Error al obtener productos:', error);
        setProductos([]);
      } finally {
        setLoading(false);
      }
    };

    obtenerProductos();
  }, []);

  const exportarAExcel = () => {
    const worksheetData = productos.map(producto => ({
      ID: producto.id,
      Nombre: producto.name,
      Descripción: producto.description,
      Categoría: producto.category,
      Ubicación: producto.location,
      Estado: producto.status,
      QR: producto.qrCode
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
    
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(fileData, "productos.xlsx");
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card shadow-lg p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="text-primary">
            <i className="fa-solid fa-box me-2"></i> Lista de Productos
          </h2>
          <div>
            <button className="btn btn-success me-2" onClick={exportarAExcel}>
              <i className="fa-solid fa-file-excel me-2"></i> Exportar a Excel
            </button>
            <button className="btn btn-secondary">
              <i className="fa-solid fa-print me-2"></i> Imprimir Lista
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Imagen</th>
                <th>Ubicación</th>
                <th>Estado</th>
                <th>QR Code</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(productos) && productos.length > 0 ? (
                productos.map((producto) => (
                  <tr key={producto.id}>
                    <td>{producto.id}</td>
                    <td>{producto.name}</td>
                    <td>{producto.category}</td>
                    <td>
                      {producto.image ? (
                        <img 
                          src={producto.image} 
                          alt={`Imagen de ${producto.name}`} 
                          style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "0.5rem" }} 
                        />
                      ) : (
                        <span className="text-muted">Sin imagen</span>
                      )}
                    </td>
                    <td>{producto.category}</td>
                    <td>{producto.location}</td>
                    <td>
                    <span
                      className={`badge text-uppercase d-flex align-items-center gap-1
                        ${producto.status === "Disponible" ? "bg-success" : 
                          producto.status === "Mantenimiento" ? "bg-warning text-dark" : 
                          "bg-danger"}`}
                    >
                      <i className={`fa-solid ${
                        producto.status === "Disponible" ? "fa-check-circle" : 
                        producto.status === "Mantenimiento" ? "fa-wrench" : 
                        "fa-times-circle"
                      }`}></i>
                      {producto.status}
                    </span>
                    </td>
                    <td>{producto.qrCode}</td>
                    <td>
                    <button className="btn btn-warning btn-sm me-2" title="Editar">
                      <i className="fa-solid fa-edit"></i>
                    </button>
                    <button className="btn btn-danger btn-sm" title="Eliminar">
                      <i className="fa-solid fa-trash"></i>
                    </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">No hay productos disponibles</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Products;
