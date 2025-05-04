import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Container,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Row,
  Col,
  InputGroup,
  FormControl,
  Modal
} from 'react-bootstrap';

const AddItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    location: '',
    status: '',
    stock: 1,
    min_stock: 1,
    responsible_user: '',
    qr_code: '',
    image: null
  });
  
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Cargar datos necesarios para los select
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const [categoriesRes, locationsRes, statusesRes, usersRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/category/list/", { headers }),
          axios.get('http://127.0.0.1:8000/location/list/', { headers }),
          axios.get('http://127.0.0.1:8000/status/list/', { headers }),
          axios.get('http://127.0.0.1:8000/users/list/', { headers })
        ]);
        
        setCategories(categoriesRes.data);
        setLocations(locationsRes.data);
        setStatuses(statusesRes.data);
        setUsers(usersRes.data);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('Error al cargar los datos iniciales');
      }
    };
    
    fetchInitialData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      
      // Crear vista previa de la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('access_token');
      const formDataToSend = new FormData();
      
      // Agregar todos los campos al FormData
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('min_stock', formData.min_stock);
      formDataToSend.append('responsible_user', formData.responsible_user);
      formDataToSend.append('qr_code', formData.qr_code);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      
      const response = await axios.post(
        'http://127.0.0.1:8000/items/create/',
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setSuccess(true);
      setTimeout(() => navigate('/products'), 2000);
    } catch (error) {
      console.error('Error creating item:', error);
      setError(error.response?.data?.message || 'Error al crear el ítem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-success text-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0">
              <i className="fas fa-plus-circle me-2"></i>
              Agregar Nuevo Ítem
            </h3>
            <Button 
              variant="outline-light" 
              onClick={() => navigate('/products')}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Volver
            </Button>
          </div>
        </Card.Header>
        
        <Card.Body>
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert variant="success">
              <i className="fas fa-check-circle me-2"></i>
              ¡Ítem creado exitosamente! Redirigiendo...
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre del Ítem *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Laptop HP EliteBook"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Descripción detallada del ítem"
                  />
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Stock Inicial *</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Stock Mínimo *</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        name="min_stock"
                        value={formData.min_stock}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Código QR (opcional)</Form.Label>
                  <Form.Control
                    type="text"
                    name="qr_code"
                    value={formData.qr_code}
                    onChange={handleChange}
                    placeholder="Código QR o identificador único"
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Imagen (opcional)</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {previewImage && (
                    <div className="mt-3 text-center">
                      <img 
                        src={previewImage} 
                        alt="Vista previa" 
                        className="img-thumbnail"
                        style={{ maxHeight: '200px' }}
                      />
                    </div>
                  )}
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Categoría *</Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccionar categoría</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ubicación *</Form.Label>
                      <Form.Select
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccionar ubicación</option>
                        {locations.map(loc => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Estado *</Form.Label>
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccionar estado</option>
                        {statuses.map(status => (
                          <option key={status.id} value={status.id}>
                            {status.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Usuario responsable (opcional)</Form.Label>
                      <Form.Select
                        name="responsible_user"
                        value={formData.responsible_user}
                        onChange={handleChange}
                      >
                        <option value="">No asignado</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.username}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
            </Row>
            
            <div className="d-flex justify-content-end">
              <Button 
                variant="success" 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    Guardar Ítem
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AddItem;