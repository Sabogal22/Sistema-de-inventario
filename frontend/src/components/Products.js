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
  Alert,
  Row,
  Col,
  Modal,
  Form,
  Pagination,
  Dropdown
} from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [exporting, setExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    maintenance: 0,
    unavailable: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://127.0.0.1:8000/items/all/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const sortedProducts = response.data.sort((a, b) => a.name.localeCompare(b.name));
        setProducts(sortedProducts);
        
        setStats({
          total: sortedProducts.length,
          available: sortedProducts.filter(p => p.status === 'Disponible').length,
          maintenance: sortedProducts.filter(p => p.status === 'Mantenimiento').length,
          unavailable: sortedProducts.filter(p => p.status === 'No disponible').length
        });
        
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

  // Filtrado de productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePageSelect = (e) => {
    const selectedPage = Number(e.target.value);
    if (selectedPage >= 1 && selectedPage <= totalPages) {
      paginate(selectedPage);
    }
  };

  // Exportar a Excel
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

  // Eliminar producto
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`http://127.0.0.1:8000/items/delete/${productToDelete.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setProducts(products.filter(p => p.id !== productToDelete.id));
      setShowDeleteModal(false);
      
      setStats(prev => ({
        ...prev,
        total: prev.total - 1,
        [productToDelete.status.toLowerCase().replace(' ', '_')]: prev[productToDelete.status.toLowerCase().replace(' ', '_')] - 1
      }));
      
    } catch (error) {
      console.error('Delete error:', error);
      setError('Error al eliminar el producto');
    }
  };

  // Badge de estado
  const getStatusBadge = (status) => {
    const statusConfig = {
      Disponible: { color: "success", icon: "fa-check-circle" },
      Mantenimiento: { color: "warning", icon: "fa-tools", textDark: true },
      "No disponible": { color: "danger", icon: "fa-times-circle" },
      "Bajo stock": { color: "info", icon: "fa-exclamation-triangle" }
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
        <span className="ms-3">Cargando productos...</span>
      </div>
    );
  }

  // Generar rango de páginas para mostrar
  const getPageRange = () => {
    const range = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      const half = Math.floor(maxVisiblePages / 2);
      let start = currentPage - half;
      let end = currentPage + half;
      
      if (start < 1) {
        start = 1;
        end = maxVisiblePages;
      }
      
      if (end > totalPages) {
        end = totalPages;
        start = totalPages - maxVisiblePages + 1;
      }
      
      for (let i = start; i <= end; i++) {
        range.push(i);
      }
    }
    
    return range;
  };

  return (
    <Container className="py-4">
      {/* Modal de confirmación de eliminación */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro que deseas eliminar el producto <strong>{productToDelete?.name}</strong>? Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Estadísticas */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0 text-muted">Total</h6>
                  <h3 className="mb-0">{stats.total}</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <i className="fas fa-boxes text-success"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0 text-muted">Disponibles</h6>
                  <h3 className="mb-0 text-success">{stats.available}</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <i className="fas fa-check-circle text-success"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0 text-muted">Mantenimiento</h6>
                  <h3 className="mb-0 text-warning">{stats.maintenance}</h3>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <i className="fas fa-tools text-warning"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0 text-muted">No disponibles</h6>
                  <h3 className="mb-0 text-danger">{stats.unavailable}</h3>
                </div>
                <div className="bg-danger bg-opacity-10 p-3 rounded">
                  <i className="fas fa-times-circle text-danger"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tarjeta principal */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-success text-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0">
              <i className="fas fa-boxes me-2"></i>
              Gestión de Productos
            </h3>
            <div className="d-flex gap-2">
              <Button 
                as={Link}
                to="/products/add"
                variant="outline-light"
                className="d-flex align-items-center"
              >
                <i className="fas fa-plus me-2"></i>
                Agregar
              </Button>

              <Button 
                variant="light" 
                onClick={exportToExcel}
                disabled={exporting || products.length === 0}
                className="d-flex align-items-center"
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
          {/* Filtros y búsqueda */}
          <Row className="mb-4">
            <Col md={8}>
              <InputGroup>
                <InputGroup.Text className="bg-light">
                  <i className="fas fa-search"></i>
                </InputGroup.Text>
                <FormControl
                  placeholder="Buscar productos por nombre, descripción, categoría o ubicación..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select 
                value={filterStatus} 
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Todos los estados</option>
                <option value="Disponible">Disponible</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="No disponible">No disponible</option>
              </Form.Select>
            </Col>
          </Row>

          {/* Controles de paginación superiores */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
              <span className="me-2">Mostrar:</span>
              <Form.Select 
                value={itemsPerPage} 
                onChange={handleItemsPerPageChange}
                style={{ width: '80px' }}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="50">50</option>
              </Form.Select>
              <span className="ms-2">ítems por página</span>
            </div>
            
            <div className="d-flex align-items-center">
              <span className="me-2">
                Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredProducts.length)} de {filteredProducts.length} ítems
              </span>
              
              {totalPages > 1 && (
                <Dropdown className="ms-3">
                  <Dropdown.Toggle variant="outline-secondary" size="sm">
                    Ir a página
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <div className="px-3 py-2">
                      <Form.Control
                        type="number"
                        min="1"
                        max={totalPages}
                        placeholder={`1-${totalPages}`}
                        onChange={handlePageSelect}
                        style={{ width: '80px' }}
                      />
                    </div>
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4" onClose={() => setError(null)} dismissible>
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
                {currentItems.length > 0 ? (
                  currentItems.map((product) => (
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
                            style={{ 
                              width: "60px", 
                              height: "60px", 
                              objectFit: "cover",
                              cursor: "pointer"
                            }}
                            onClick={() => window.open(product.image, '_blank')}
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
                        <Button 
                          as={Link}
                          to={`/products/edit/${product.id}`}
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2"
                          title="Editar"
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          title="Eliminar"
                          onClick={() => handleDeleteClick(product)}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      {searchTerm || filterStatus !== 'all' ? (
                        <Alert variant="info" className="mb-0">
                          <i className="fas fa-info-circle me-2"></i>
                          No se encontraron productos con los filtros aplicados
                        </Alert>
                      ) : (
                        <Alert variant="warning" className="mb-0">
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

          {/* Paginación inferior */}
          {filteredProducts.length > itemsPerPage && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div>
                <Pagination>
                  <Pagination.First 
                    onClick={() => paginate(1)} 
                    disabled={currentPage === 1} 
                  />
                  <Pagination.Prev 
                    onClick={() => paginate(currentPage - 1)} 
                    disabled={currentPage === 1} 
                  />
                  
                  {getPageRange().map(number => (
                    <Pagination.Item
                      key={number}
                      active={number === currentPage}
                      onClick={() => paginate(number)}
                    >
                      {number}
                    </Pagination.Item>
                  ))}
                  
                  <Pagination.Next 
                    onClick={() => paginate(currentPage + 1)} 
                    disabled={currentPage === totalPages} 
                  />
                  <Pagination.Last 
                    onClick={() => paginate(totalPages)} 
                    disabled={currentPage === totalPages} 
                  />
                </Pagination>
              </div>
              
              <div className="d-flex align-items-center">
                <span className="me-2">Página:</span>
                <Form.Control
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = Number(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      paginate(page);
                    }
                  }}
                  style={{ width: '70px' }}
                />
                <span className="ms-2">de {totalPages}</span>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Products;