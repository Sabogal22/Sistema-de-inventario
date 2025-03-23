import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute'; // Importa el PrivateRoute

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                {/* Protege el Dashboard con PrivateRoute */}
                <Route path="/dashboard" element={<PrivateRoute />}>
                    <Route index element={<Dashboard />} />
                </Route>
            </Routes>
        </Router>
    );
};

export default App;
