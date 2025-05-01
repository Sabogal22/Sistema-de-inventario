// components/SendNotification.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SendNotification = () => {
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState({ loading: false, error: null, success: false });
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem('access_token');

  // Cargar lista de usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/users/all/', { // Ajusta esta URL
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        setStatus({...status, error: 'Error al cargar usuarios'});
      }
    };
    fetchUsers();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: false });
    
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/notifications/send/',
        { user_id: userId, message },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setStatus({ 
        loading: false, 
        error: null, 
        success: true,
        response: response.data
      });
      setMessage('');
    } catch (error) {
      setStatus({ 
        loading: false, 
        error: error.response?.data?.error || 'Error al enviar notificación',
        success: false 
      });
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="card-title mb-4">Enviar Notificación</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="userId" className="form-label">Usuario Destinatario</label>
              <select
                className="form-select"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              >
                <option value="">Seleccionar usuario...</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username} ({user.role})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-3">
              <label htmlFor="message" className="form-label">Mensaje</label>
              <textarea
                className="form-control"
                id="message"
                rows="3"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-success"
              disabled={status.loading}
            >
              {status.loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Enviando...
                </>
              ) : 'Enviar Notificación'}
            </button>
            
            {status.error && (
              <div className="alert alert-danger mt-3 mb-0">
                {status.error}
              </div>
            )}
            
            {status.success && (
              <div className="alert alert-success mt-3 mb-0">
                Notificación enviada correctamente!
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendNotification;