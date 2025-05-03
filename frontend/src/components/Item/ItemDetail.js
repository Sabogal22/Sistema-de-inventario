import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockHistory, setStockHistory] = useState([]);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockAction, setStockAction] = useState({ type: 'add', quantity: 1 });

  // Función para verificar si un endpoint existe
  const checkEndpointExists = async (url) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.options(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    const fetchItemData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          throw new Error("No hay token de autenticación");
        }

        // 1. Obtener datos del ítem
        const itemResponse = await axios.get(`http://127.0.0.1:8000/items/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setItem(itemResponse.data);
        
        // 2. Verificar y cargar historial solo si el endpoint existe
        const historyEndpoint = `http://127.0.0.1:8000/items/${id}/stock-history/`;
        const endpointAvailable = await checkEndpointExists(historyEndpoint);
        
        if (endpointAvailable) {
          const historyResponse = await axios.get(historyEndpoint, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setStockHistory(historyResponse.data);
        } else {
          console.log("Endpoint de historial no disponible, omitiendo...");
          setStockHistory([]); // Inicializar como array vacío
        }
        
        setError(null);
      } catch (err) {
        console.error("Error:", err);
        setError(err.response?.data?.detail || err.message || "Error al cargar el ítem");
      } finally {
        setLoading(false);
      }
    };

    fetchItemData();
  }, [id]);

  const handleStockUpdate = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error("No hay token de autenticación");
      }
  
      // Validación básica en el frontend
      if (!stockAction.quantity || stockAction.quantity <= 0) {
        throw new Error("La cantidad debe ser mayor que cero");
      }
  
      const response = await axios.post(
        `http://127.0.0.1:8000/items/${id}/update-stock/`,
        {
          type: stockAction.type,
          quantity: parseInt(stockAction.quantity)
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000 // 5 segundos de timeout
        }
      );
  
      if (response.data.success) {
        // Actualizar el estado del ítem
        setItem(prev => ({
          ...prev,
          stock: response.data.stock
        }));
        
        // Actualizar historial
        setStockHistory(prev => [{
          id: response.data.history_id,
          action: stockAction.type,
          quantity: stockAction.quantity,
          old_stock: prev[0]?.new_stock || item.stock,
          new_stock: response.data.stock,
          user: "Usuario actual", // Puedes obtener esto del contexto de autenticación
          date: new Date().toISOString()
        }, ...prev]);
        
        setShowStockModal(false);
      } else {
        throw new Error(response.data.error || "Error al actualizar stock");
      }
    } catch (err) {
      let errorMessage = "Error al actualizar el stock";
      
      if (err.response) {
        // Error de la API
        if (err.response.status === 400) {
          errorMessage = err.response.data.error || "Datos inválidos";
        } else if (err.response.status === 401) {
          errorMessage = "No autorizado - por favor inicia sesión nuevamente";
        } else if (err.response.status === 500) {
          errorMessage = "Error interno del servidor";
        }
      } else if (err.message) {
        // Error de Axios o validación
        errorMessage = err.message;
      }
      
      console.error("Error detallado:", err);
      setError(errorMessage);
    }
  };

  const getStockBadge = () => {
    if (!item) return null;
    
    let badgeClass = "success";
    let icon = "fa-check";
    let text = `Stock: ${item.stock}`;
    
    if (item.stock === 0) {
      badgeClass = "danger";
      icon = "fa-times";
      text = "Agotado";
    } else if (item.stock < item.min_stock) {
      badgeClass = "warning text-dark";
      icon = "fa-exclamation-triangle";
      text = `Bajo stock (${item.stock}/${item.min_stock})`;
    }
    
    return (
      <span className={`badge bg-${badgeClass} d-flex align-items-center gap-2`}>
        <i className={`fas ${icon}`}></i>
        {text}
      </span>
    );
  };

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
        <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
          <h3 className="m-0">
            <i className="fa-solid fa-box me-2"></i> {item.name}
          </h3>
          {getStockBadge()}
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

                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <i className="fa-solid fa-user-shield text-success me-2"></i>
                      <h6 className="m-0">Responsable</h6>
                    </div>
                    <p className="ms-4">
                      {item.responsible_user 
                        ? `${item.responsible_user.username} (${item.responsible_user.role})` 
                        : 'No asignado'}
                    </p>
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

                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <i className="fa-solid fa-boxes-stacked text-success me-2"></i>
                      <h6 className="m-0">Stock mínimo</h6>
                    </div>
                    <p className="ms-4">{item.min_stock} unidades</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Historial de stock */}
          {stockHistory.length > 0 && (
            <div className="mt-4">
              <h5 className="text-success mb-3">
                <i className="fa-solid fa-clock-rotate-left me-2"></i> Historial de Stock
              </h5>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Acción</th>
                      <th>Cantidad</th>
                      <th>Stock anterior</th>
                      <th>Stock nuevo</th>
                      <th>Usuario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockHistory.map((entry, index) => (
                      <tr key={index}>
                        <td>{new Date(entry.date).toLocaleString()}</td>
                        <td>
                          <span className={`badge ${
                            entry.action === 'add' ? 'bg-success' : 'bg-danger'
                          }`}>
                            {entry.action === 'add' ? 'Añadido' : 'Retirado'}
                          </span>
                        </td>
                        <td>{entry.quantity}</td>
                        <td>{entry.old_stock}</td>
                        <td>{entry.new_stock}</td>
                        <td>{entry.user || 'Sistema'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sección de acciones */}
      <div className="d-flex justify-content-end gap-3 mt-4">
        <button 
          className="btn btn-success"
          onClick={() => setShowStockModal(true)}
        >
          <i className="fa-solid fa-boxes-stacked me-2"></i> Gestionar Stock
        </button>
        
        <button className="btn btn-primary">
          <i className="fa-solid fa-pen-to-square me-2"></i> Editar
        </button>
      </div>

      {/* Modal para gestionar stock */}
      <div className={`modal fade ${showStockModal ? 'show d-block' : ''}`} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-success text-white">
              <h5 className="modal-title">Gestionar Stock</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowStockModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Acción</label>
                <select 
                  className="form-select"
                  value={stockAction.type}
                  onChange={(e) => setStockAction({...stockAction, type: e.target.value})}
                >
                  <option value="add">Añadir stock</option>
                  <option value="subtract">Retirar stock</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Cantidad</label>
                <input 
                  type="number" 
                  className="form-control"
                  min="1"
                  value={stockAction.quantity}
                  onChange={(e) => setStockAction({...stockAction, quantity: parseInt(e.target.value) || 1})}
                />
              </div>
              {stockAction.type === 'subtract' && item.stock - stockAction.quantity < 0 && (
                <div className="alert alert-warning">
                  No hay suficiente stock para esta operación
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowStockModal(false)}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn btn-success"
                onClick={handleStockUpdate}
                disabled={stockAction.type === 'subtract' && item.stock - stockAction.quantity < 0}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;