import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; // Opcional: Si tienes un dashboard en React

const App = () => {
    // Estado para manejar la autenticación
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
        <Router>
            <Routes>
                {/* Ruta de Login */}
                <Route
                    path="/login"
                    element={
                        isAuthenticated ? (
                            // Si el usuario ya está autenticado, redirige al dashboard o al admin
                            <Navigate to="/dashboard" />
                        ) : (
                            // Si no está autenticado, muestra el formulario de login
                            <Login onLogin={() => setIsAuthenticated(true)} />
                        )
                    }
                />

                {/* Ruta de Dashboard (Opcional) */}
                <Route
                    path="/dashboard"
                    element={
                        // Protege la ruta del dashboard
                        <PrivateRoute isAuthenticated={isAuthenticated}>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />

                {/* Ruta por defecto (Redirige a Login) */}
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
};

// Componente para proteger rutas
const PrivateRoute = ({ children, isAuthenticated }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default App;