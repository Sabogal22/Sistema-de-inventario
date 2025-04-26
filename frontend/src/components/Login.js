import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('access_token')) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/token/', {
                username,
                password,
            });
            const { access, refresh } = response.data;
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            navigate('/dashboard');
        } catch (err) {
            setError('Usuario o contraseña incorrectos. Por favor intente nuevamente.');
            console.error("Error de autenticación:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container" style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #198754 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div className="col-md-8 col-lg-6 col-xl-5">
                <div className="card shadow-lg" style={{
                    borderRadius: '15px',
                    overflow: 'hidden',
                    border: 'none'
                }}>
                    {/* Header con logo */}
                    <div className="card-header py-4 text-center" style={{
                        backgroundColor: '#198754',
                        color: 'white'
                    }}>
                        <div className="d-flex justify-content-center mb-3">
                            <i className="fas fa-university fa-3x"></i>
                        </div>
                        <h2 className="mb-0">Sistema de Inventario FET</h2>
                        <p className="mb-0 opacity-75">Ingrese sus credenciales para acceder</p>
                    </div>
                    
                    <div className="card-body p-5">
                        {error && (
                            <div className="alert alert-danger d-flex align-items-center" role="alert">
                                <i className="fas fa-exclamation-circle me-2"></i>
                                <div>{error}</div>
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="username" className="form-label fw-bold">
                                    <i className="fas fa-user me-2 text-success"></i>Usuario
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light">
                                        <i className="fas fa-user text-muted"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control py-3"
                                        id="username"
                                        placeholder="Ingrese su usuario"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        style={{
                                            borderLeft: 'none'
                                        }}
                                    />
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <label htmlFor="password" className="form-label fw-bold">
                                    <i className="fas fa-lock me-2 text-success"></i>Contraseña
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light">
                                        <i className="fas fa-key text-muted"></i>
                                    </span>
                                    <input
                                        type="password"
                                        className="form-control py-3"
                                        id="password"
                                        placeholder="Ingrese su contraseña"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        style={{
                                            borderLeft: 'none'
                                        }}
                                    />
                                </div>
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="rememberMe"
                                    />
                                    <label className="form-check-label" htmlFor="rememberMe">
                                        Recordarme
                                    </label>
                                </div>
                            </div>
                            
                            <button 
                                type="submit" 
                                className="btn btn-success w-100 py-3 fw-bold"
                                disabled={isLoading}
                                style={{
                                    fontSize: '1.1rem',
                                    letterSpacing: '1px',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Cargando...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-sign-in-alt me-2"></i> INGRESAR
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                    
                    <div className="card-footer text-center py-3" style={{
                        backgroundColor: 'rgba(25, 135, 84, 0.1)'
                    }}>
                        <p className="mb-0">
                            ¿No tienes una cuenta? <a href="#!" className="text-success fw-bold text-decoration-none">Contacta al administrador</a>
                        </p>
                    </div>
                </div>
                
                <div className="text-center mt-4 text-white">
                    <p className="mb-0">© {new Date().getFullYear()} Fundación Escuela Tecnológica. Todos los derechos reservados.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;