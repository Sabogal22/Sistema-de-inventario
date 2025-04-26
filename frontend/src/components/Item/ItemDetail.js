import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          throw new Error("No hay token de autenticación");
        }

        const response = await axios.get(`http://127.0.0.1:8000/items/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setItem(response.data);
        setError(null);
      } catch (err) {
        console.error("Error:", err);
        setError(err.response?.data?.detail || err.message || "Error al cargar el ítem");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
      <div className="spinner-border text-success" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="container mt-5">
      <button onClick={() => navigate(-1)} className="btn btn-outline-success mb-4">
        <i className="fa-solid fa-arrow-left me-2"></i> Volver
      </button>
      <div className="alert alert-danger">
        {error === "Authentication credentials were not provided." 
          ? "Debes iniciar sesión para ver este contenido" 
          : error}
      </div>
    </div>
  );

  if (!item) return (
    <div className="container mt-5">
      <button onClick={() => navigate(-1)} className="btn btn-outline-success mb-4">
        <i className="fa-solid fa-arrow-left me-2"></i> Volver
      </button>
      <div className="alert alert-warning">Ítem no encontrado</div>
    </div>
  );

  return (
    <div className="container py-4">
      {/* Header con botón de volver */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-outline-success"
        >
          <i className="fa-solid fa-arrow-left me-2"></i> Volver al inventario
        </button>
        <h2 className="m-0 text-success">
          <i className="fa-solid fa-box-open me-2"></i> Detalle del Ítem
        </h2>
      </div>

      {/* Tarjeta principal */}
      <div className="card border-success mb-4 shadow">
        <div className="card-header bg-success text-white">
          <h3 className="m-0">
            <i className="fa-solid fa-box me-2"></i> {item.name}
          </h3>
        </div>
        
        <div className="card-body">
          {/* Sección de imagen */}
          {item.image && (
            <div className="text-center mb-4">
              <img 
                src={item.image} 
                alt={item.name} 
                className="img-fluid rounded shadow"
                style={{ 
                  maxHeight: '300px',
                  border: '3px solid #198754',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}
              />
            </div>
          )}

          {/* Descripción */}
          <div className="mb-4 p-3 bg-light rounded">
            <h5 className="text-success">
              <i className="fa-solid fa-circle-info me-2"></i> Descripción
            </h5>
            <p className="mb-0">{item.description}</p>
          </div>

          {/* Grid de información */}
          <div className="row g-4">
            {/* Columna izquierda */}
            <div className="col-md-6">
              <div className="card h-100 border-success">
                <div className="card-body">
                  <h5 className="text-success mb-4">
                    <i className="fa-solid fa-circle-info me-2"></i> Información General
                  </h5>
                  
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <i className="fa-solid fa-tags text-success me-2"></i>
                      <h6 className="m-0">Categoría</h6>
                    </div>
                    <p className="ms-4">{item.category.name}</p>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <i className="fa-solid fa-location-dot text-success me-2"></i>
                      <h6 className="m-0">Ubicación</h6>
                    </div>
                    <p className="ms-4">{item.location.name}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna derecha */}
            <div className="col-md-6">
              <div className="card h-100 border-success">
                <div className="card-body">
                  <h5 className="text-success mb-4">
                    <i className="fa-solid fa-screwdriver-wrench me-2"></i> Detalles Técnicos
                  </h5>
                  
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <div className="bg-success rounded-circle p-2 me-2">
                        <i className="fa-solid fa-qrcode text-white"></i>
                      </div>
                      <h6 className="m-0">Código QR</h6>
                    </div>
                    <p className="ms-4">{item.qr_code || 'No asignado'}</p>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <i className="fa-solid fa-calendar-days text-success me-2"></i>
                      <h6 className="m-0">Fecha de creación</h6>
                    </div>
                    <p className="ms-4">{new Date(item.created_at).toLocaleDateString()}</p>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <div className="bg-success rounded-circle p-2 me-2">
                        <i className="fa-solid fa-circle-check text-white"></i>
                      </div>
                      <h6 className="m-0">Estado</h6>
                    </div>
                    <p className="ms-4">
                      <span className={`badge ${
                        item.status.name === 'Disponible' ? 'bg-success' :
                        item.status.name === 'Mantenimiento' ? 'bg-warning text-dark' :
                        'bg-danger'
                      }`}>
                        {item.status.name}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de acciones */}
      <div className="d-flex justify-content-end gap-3 mt-4">
        <button className="btn btn-success">
          <i className="fa-solid fa-pen-to-square me-2"></i> Editar
        </button>
      </div>
    </div>
  );
};

export default ItemDetail;