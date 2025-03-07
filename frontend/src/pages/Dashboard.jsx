import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="dashboard-content">
        <main className="dashboard-main">
          <h1 className="dashboard-title">Bienvenido al Dashboard</h1>
          <p className="dashboard-subtitle">
            Aquí puedes visualizar información clave del sistema.
          </p>

          <div className="dashboard-cards">
            <div className="dashboard-card">
              <h2>Usuarios</h2>
              <p>100</p>
            </div>
            <div className="dashboard-card">
              <h2>Ventas</h2>
              <p>$50,000</p>
            </div>
            <div className="dashboard-card">
              <h2>Productos</h2>
              <p>25</p>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
