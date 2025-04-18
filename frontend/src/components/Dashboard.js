import React, { useState, useEffect } from "react";
import axios from "axios";

const Dashboard = () => {
  const [summary, setSummary] = useState({
    total_items: 0,
    disponibles: 0,
    mantenimiento: 0,
    no_disponibles: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [noResults, setNoResults] = useState(false);

  // Obtener datos del dashboard
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/dashboard/summary/");
        setSummary(response.data);
      } catch (error) {
        console.error("Error al obtener el resumen:", error);
      }
    };
  
    fetchSummary();
  }, []);

  // Buscar ítems
  useEffect(() => {
    const fetchItems = async () => {
      if (searchTerm.trim() === "") {
        setResults([]);
        setNoResults(false);
        return;
      }

      try {
        const response = await axios.get(`http://127.0.0.1:8000/items/search/?q=${searchTerm}`);
        setResults(response.data);
        setNoResults(response.data.length === 0);
      } catch (error) {
        console.error("Error buscando ítems:", error);
        setResults([]);
        setNoResults(true);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchItems();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">📦 Inventario FET</h1>
      <p className="text-muted">Aquí puedes ver el estado del inventario de la Fundación Escuela Tecnológica.</p>

      <div className="row mt-4">
        <div className="col-md-3">
          <div className="card text-white bg-primary mb-3 shadow">
            <div className="card-body text-center">
              <h5 className="card-title">
                <i className="fa-solid fa-box me-2"></i>Total Ítems
              </h5>
              <p className="fs-3 fw-bold">{summary.total_items}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-success mb-3 shadow">
            <div className="card-body text-center">
              <h5 className="card-title">
                <i className="fa-solid fa-hand-holding-box me-2"></i>Disponibles
              </h5>
              <p className="fs-3 fw-bold">{summary.Disponible}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-warning mb-3 shadow">
            <div className="card-body text-center">
              <h5 className="card-title">
                <i className="fa-solid fa-tools me-2"></i>En Mantenimiento
              </h5>
              <p className="fs-3 fw-bold">{summary.Mantenimiento}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-danger mb-3 shadow">
            <div className="card-body text-center">
              <h5 className="card-title">
                <i className="fa-solid fa-ban me-2"></i>No Disponibles
              </h5>
              <p className="fs-3 fw-bold">{summary.no_disponibles}</p>
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
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <ul className="list-group mt-3">
          {results.map((item) => (
            <li key={item.id} className="list-group-item">
              <strong>{item.name}</strong> – {item.description} ({item.category}, {item.location})
            </li>
          ))}
        </ul>

        {noResults && (
          <div className="alert alert-warning mt-3">
            ⚠️ No se encontró ningún ítem con ese nombre en el sistema.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
