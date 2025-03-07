import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      console.log("Token recuperado:", token); // <-- Depuración
  
      if (!token) {
        navigate("/");
        return;
      }
  
      const response = await fetch("http://127.0.0.1:8000/api/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setUser(data);
      } else {
        localStorage.removeItem("token");
        navigate("/");
      }
    };
  
    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      {user ? (
        <div>
          <p>Bienvenido, {users.email}</p>
          <p>Rol: {users.role}</p>
          <button onClick={handleLogout}>Cerrar sesión</button>
        </div>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
};

export default Dashboard;
