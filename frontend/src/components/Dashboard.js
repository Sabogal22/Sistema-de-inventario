import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const Dashboard = () => {
    const [username, setUsername] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('access_token');

        if (!token) {
            console.error("No hay token disponible en localStorage");
            return;
        }

        const decodedToken = jwtDecode(token);
        const fetchUser = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/user/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsername(response.data.username);
            } catch (error) {
                console.error("Error al obtener usuario:", error);
            }
        };

        fetchUser();
    }, []);

    return (
        <div className="container mt-5">
            <h1>Bienvenido, {username ? username : 'Usuario'} </h1>
            <p>Aquí puedes gestionar tu inventario.</p>
        </div>
    );
};

export default Dashboard;
