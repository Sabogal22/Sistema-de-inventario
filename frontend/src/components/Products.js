import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { 
  Card, 
  Table, 
  Button, 
  Badge, 
  Spinner, 
  Container,
  InputGroup,
  FormControl,
  Alert
} from 'react-bootstrap';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://127.0.0.1:8000/items/all/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(response.data.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Error al cargar los productos');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const exportToExcel = async () => {
    try {
      setExporting(true);
      const worksheetData = products.map(product => ({
        ID: product.id,
        Nombre: product.name,
        Descripción: product.description,
        Categoría: product.category,
        Ubicación: product.location,
        Estado: product.status,
        'Código QR': product.qrCode,
        'Fecha Registro': product.created_at
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
      
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(fileData, `productos_fet_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Export error:', error);
      setError('Error al exportar a Excel');
    } finally {
      setExporting(false);
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const statusConfig = {
      Disponible: { color: "success", icon: "fa-check-circle" },
      Mantenimiento: { color: "warning", icon: "fa-tools", textDark: true },
      "No disponible": { color: "danger", icon: "fa-times-circle" }
    };

    const config = statusConfig[status] || { color: "secondary", icon: "fa-question-circle" };

    return (
      <Badge 
        bg={config.color} 
        className={`d-flex align-items-center gap-1 ${config.textDark ? 'text-dark' : ''}`}
      >
        <i className={`fas ${config.icon}`}></i>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <Spinner animation="border" variant="success" />
      </div>
    );
  }

  return (
    <Container className="py-4">
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-success text-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0">
              <i className="fas fa-boxes me-2"></i>
              Gestión de Productos
            </h3>
            <div className="d-flex gap-2">
              <Button 
                variant="light" 
                onClick={exportToExcel}
                disabled={exporting || products.length === 0}
              >
                {exporting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-file-excel me-2 text-success"></i>
                    Exportar
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card.Header>

        <Card.Body>
          <div className="mb-4">
            <InputGroup>
              <InputGroup.Text className="bg-light">
                <i className="fas fa-search"></i>
              </InputGroup.Text>
              <FormControl
                placeholder="Buscar productos por nombre, descripción, categoría o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Producto</th>
                  <th>Descripción</th>
                  <th className="text-center">Imagen</th>
                  <th>Categoría</th>
                  <th>Ubicación</th>
                  <th className="text-center">Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="fw-bold">{product.id}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className="fas fa-box text-muted me-2"></i>
                          {product.name}
                        </div>
                      </td>
                      <td>
                        <small className="text-muted">
                          {product.description || 'Sin descripción'}
                        </small>
                      </td>
                      <td className="text-center">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="img-thumbnail"
                            style={{ width: "60px", height: "60px", objectFit: "cover" }}
                          />
                        ) : (
                          <i className="fas fa-image text-muted" title="Sin imagen"></i>
                        )}
                      </td>
                      <td>
                        <Badge bg="light" text="dark">
                          <i className="fas fa-tag me-1"></i>
                          {product.category}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg="light" text="dark">
                          <i className="fas fa-map-marker-alt me-1"></i>
                          {product.location}
                        </Badge>
                      </td>
                      <td className="text-center">
                        {getStatusBadge(product.status)}
                      </td>
                      <td className="text-center">
                        <Button variant="outline-warning" size="sm" className="me-2">
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button variant="outline-danger" size="sm">
                          <i className="fas fa-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      {searchTerm ? (
                        <Alert variant="info">
                          <i className="fas fa-info-circle me-2"></i>
                          No se encontraron productos con ese criterio de búsqueda
                        </Alert>
                      ) : (
                        <Alert variant="warning">
                          <i className="fas fa-box-open me-2"></i>
                          No hay productos registrados en el sistema
                        </Alert>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Products;