import React from "react";

const Dashboard = () => {
  return (
    <div className="container mt-4">
      <h1 className="mb-4">📦 Inventario FET</h1>
      <p className="text-muted">Aquí puedes ver el estado del inventario de la Fundacion Escuela Tecnologica.</p>

      <div className="row mt-4">
        {/* Total de ítems en inventario */}
        <div className="col-md-3">
          <div className="card text-white bg-primary mb-3 shadow">
            <div className="card-body text-center">
              <h5 className="card-title">
                <i className="fa-solid fa-box me-2"></i>Total Ítems
              </h5>
              <p className="fs-3 fw-bold">320</p>
            </div>
          </div>
        </div>

        {/* Ítems disponibles para préstamo */}
        <div className="col-md-3">
          <div className="card text-white bg-success mb-3 shadow">
            <div className="card-body text-center">
              <h5 className="card-title">
                <i className="fa-solid fa-hand-holding-box me-2"></i>Disponibles
              </h5>
              <p className="fs-3 fw-bold">215</p>
            </div>
          </div>
        </div>

        {/* Ítems en mantenimiento */}
        <div className="col-md-3">
          <div className="card text-white bg-warning mb-3 shadow">
            <div className="card-body text-center">
              <h5 className="card-title">
                <i className="fa-solid fa-tools me-2"></i>En Mantenimiento
              </h5>
              <p className="fs-3 fw-bold">25</p>
            </div>
          </div>
        </div>

        {/* Ítems no disponibles */}
        <div className="col-md-3">
          <div className="card text-white bg-danger mb-3 shadow">
            <div className="card-body text-center">
              <h5 className="card-title">
                <i className="fa-solid fa-ban me-2"></i>No Disponibles
              </h5>
              <p className="fs-3 fw-bold">80</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de búsqueda */}
      <div className="mt-4">
        <h3>🔍 Buscar un ítem</h3>
        <input
          type="text"
          className="form-control"
          placeholder="Escribe el nombre del ítem..."
        />
      </div>
    </div>
  );
};

export default Dashboard;
