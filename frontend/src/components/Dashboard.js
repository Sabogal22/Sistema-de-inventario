import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Spinner,
  Alert,
  ListGroup,
  InputGroup,
  FormControl,
  Badge,
} from "react-bootstrap";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    setLoadingSummary(true);
    axios
      .get("http://127.0.0.1:8000/dashboard/summary/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSummary(res.data))
      .catch((err) => {
        setError("Error cargando el resumen");
      })
      .finally(() => setLoadingSummary(false));
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;
    if (searchTerm.trim() === "") {
      setResults([]);
      setNoResults(false);
      return;
    }

    setLoadingSearch(true);
    axios
      .get(`http://127.0.0.1:8000/items/search/?q=${encodeURIComponent(searchTerm)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setResults(res.data);
        setNoResults(res.data.length === 0);
        setError(null);
      })
      .catch(() => {
        setResults([]);
        setNoResults(true);
        setError("Error buscando ítems");
      })
      .finally(() => setLoadingSearch(false));
  }, [searchTerm, token]);

  if (!token) return null;

  // Mostrar spinner o error mientras carga summary
  if (loadingSummary) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="success" />
      </div>
    );
  }

  if (!summary) {
    return (
      <Alert variant="danger" className="my-5">
        No se pudo cargar el resumen
      </Alert>
    );
  }

  const statusCards = [
    {
      title: "Total Ítems",
      value: summary.total_items,
      icon: "fa-box",
      color: "primary",
      text: "text-white",
    },
    {
      title: "Disponibles",
      value: summary.Disponible,
      icon: "fa-check-circle",
      color: "success",
      text: "text-white",
    },
    {
      title: "Mantenimiento",
      value: summary.Mantenimiento,
      icon: "fa-tools",
      color: "warning",
      text: "text-dark",
    },
    {
      title: "No Disponibles",
      value: summary.no_disponibles,
      icon: "fa-ban",
      color: "danger",
      text: "text-white",
    },
  ];

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1">
            <i className="fas fa-warehouse text-success me-2"></i>
            Inventario FET
          </h1>
          <p className="text-muted mb-0">
            Panel de control del inventario de la Fundación Escuela Tecnológica
          </p>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <Row className="g-4 mb-4">
        {statusCards.map((card, index) => (
          <Col key={index} md={6} lg={3}>
            <Card className={`shadow-sm border-0 bg-${card.color} h-100`}>
              <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className={`mb-0 ${card.text}`}>
                    <i className={`fas ${card.icon} me-2`}></i>
                    {card.title}
                  </h5>
                  <div
                    className={`bg-white bg-opacity-25 rounded-circle p-2 d-flex align-items-center justify-content-center ${card.text}`}
                    style={{ width: "40px", height: "40px" }}
                  >
                    <i className={`fas ${card.icon}`}></i>
                  </div>
                </div>
                <div className="mt-auto">
                  <h2 className={`mb-0 ${card.text}`}>{card.value}</h2>
                  <small className={`${card.text} opacity-75`}>
                    Ítems registrados
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Sección de búsqueda */}
      <Card className="shadow-sm border-0">
        <Card.Body>
          <h3 className="mb-3">
            <i className="fas fa-search text-success me-2"></i>
            Buscar ítem
          </h3>

          <InputGroup className="mb-3">
            <InputGroup.Text className="bg-light">
              <i className="fas fa-search text-muted"></i>
            </InputGroup.Text>
            <FormControl
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          {loadingSearch ? (
            <div className="text-center py-3">
              <Spinner animation="border" variant="success" size="sm" />
              <span className="ms-2">Buscando ítems...</span>
            </div>
          ) : noResults ? (
            <Alert variant="warning" className="d-flex align-items-center">
              <i className="fas fa-exclamation-triangle me-2"></i>
              No se encontraron ítems con ese criterio de búsqueda
            </Alert>
          ) : results.length > 0 ? (
            <ListGroup variant="flush">
              {results.map((item) => (
                <ListGroup.Item
                  key={item.id}
                  action
                  onClick={() => navigate(`/items/${item.id}`)}
                  className="d-flex justify-content-between align-items-center py-3"
                >
                  <div>
                    <h6 className="mb-1">{item.name}</h6>
                    <small className="text-muted">{item.description}</small>
                  </div>
                  <div>
                    <Badge bg="light" text="dark" className="me-2">
                      <i className="fas fa-tag me-1"></i>
                      {item.category}
                    </Badge>
                    <Badge bg="light" text="dark">
                      <i className="fas fa-map-marker-alt me-1"></i>
                      {item.location}
                    </Badge>
                  </div>
                  <i className="fas fa-chevron-right text-muted"></i>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <Alert variant="info" className="d-flex align-items-center">
              <i className="fas fa-info-circle me-2"></i>
              Ingrese un término de búsqueda para encontrar ítems
            </Alert>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Dashboard;