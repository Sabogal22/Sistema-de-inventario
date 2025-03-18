import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Sidebar = ({ role }) => {
    return (
        <aside className="w-64 bg-gray-900 text-white h-screen p-5">
            <h2 className="text-xl font-bold mb-5">Inventario</h2>
            <ul>
                <li className="mb-2"><a href="#" className="hover:text-gray-300">Dashboard</a></li>
                <li className="mb-2"><a href="#" className="hover:text-gray-300">Productos</a></li>
                <li className="mb-2"><a href="#" className="hover:text-gray-300">Categorías</a></li>
                <li className="mb-2"><a href="#" className="hover:text-gray-300">Reportes</a></li>
                {/* Solo mostrar Usuarios si el rol es "admin" */}
                {role === 'admin' && (
                    <li className="mb-2"><a href="#" className="hover:text-gray-300">Usuarios</a></li>
                )}
            </ul>
        </aside>
    );
};

const Dashboard = () => {
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            console.error("No hay token disponible");
            return;
        }
    
        const fetchUser = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/user/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsername(response.data.username);
                setRole(response.data.role);
            } catch (error) {
                console.error("Error al obtener usuario:", error);
            }
        };
        fetchUser();
    }, []);
        

    return (
        <div className="flex h-screen">
            <Sidebar role={role} />
            <main className="flex-1 p-10">
                <h1 className="text-3xl font-bold">Bienvenido, {username || 'Usuario'} tu Rol asignado {role || 'Usuario'}</h1>
                <p className="text-gray-600 mt-2">Aquí puedes gestionar tu inventario.</p>

                <div className="grid grid-cols-3 gap-6 mt-6">
                    <div className="bg-blue-500 p-5 text-white rounded-lg shadow-md">
                        <h2 className="text-lg font-semibold">Total Productos</h2>
                        <p className="text-2xl font-bold">152</p>
                    </div>
                    <div className="bg-green-500 p-5 text-white rounded-lg shadow-md">
                        <h2 className="text-lg font-semibold">Stock Disponible</h2>
                        <p className="text-2xl font-bold">89%</p>
                    </div>
                    <div className="bg-red-500 p-5 text-white rounded-lg shadow-md">
                        <h2 className="text-lg font-semibold">Productos Agotados</h2>
                        <p className="text-2xl font-bold">12</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
