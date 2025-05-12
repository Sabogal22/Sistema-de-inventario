import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
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

const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados del formulario
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
  
  // Estados para datos de selección
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Estado para comparación de cambios
  const [originalData, setOriginalData] = useState({
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

  // Cargar datos del ítem
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        const headers = { Authorization: `Bearer ${token}` };
        
        // Obtener datos del ítem y listas en paralelo
        const [itemResponse, categoriesRes, locationsRes, statusesRes, usersRes] = await Promise.all([
          axios.get(`http://127.0.0.1:8000/items/${id}/`, { headers }),
          axios.get("http://127.0.0.1:8000/category/list/", { headers }),
          axios.get('http://127.0.0.1:8000/location/list/', { headers }),
          axios.get('http://127.0.0.1:8000/status/list/', { headers }),
          axios.get('http://127.0.0.1:8000/users/list/', { headers })
        ]);
        
        const itemData = itemResponse.data;
        
        // Establecer estados del formulario
        const newFormData = {
          name: itemData.name,
          description: itemData.description,
          category: itemData.category?.id || '',
          location: itemData.location?.id || '',
          status: itemData.status?.id || '',
          stock: itemData.stock,
          min_stock: itemData.min_stock,
          responsible_user: itemData.responsible_user?.id || '',
          qr_code: itemData.qr_code || '',
          image: null
        };
        
        setFormData(newFormData);
        setOriginalData(newFormData);
        
        if (itemData.image) {
          setCurrentImage(itemData.image);
        }
        
        // Establecer datos para los select
        setCategories(categoriesRes.data);
        setLocations(locationsRes.data);
        setStatuses(statusesRes.data);
        setUsers(usersRes.data);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error al cargar los datos del ítem');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stock' || name === 'min_stock' ? parseInt(value) || 0 : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      // Crear vista previa de la nueva imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setPreviewImage(null);
    setCurrentImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formDataToSend = new FormData();
    let hasChanges = false;

    // Lista de campos a comparar
    const fieldsToCheck = [
      'name', 'description', 'category', 'location', 
      'status', 'stock', 'min_stock', 'responsible_user', 'qr_code'
    ];

    // Comparar cada campo
    fieldsToCheck.forEach(field => {
      if (String(formData[field]) !== String(originalData[field])) {
        formDataToSend.append(field, formData[field]);
        hasChanges = true;
      }
    });

    // Manejo especial de imagen
    if (formData.image) {
      formDataToSend.append('image', formData.image);
      hasChanges = true;
    } else if (!previewImage && currentImage) {
      formDataToSend.append('image', '');
      hasChanges = true;
    }

    if (!hasChanges) {
      setError('No se detectaron cambios');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.patch(
        `http://127.0.0.1:8000/items/update/${id}/`,
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.message) {
        setSuccess(true);
        // Actualizar originalData con los nuevos valores
        setOriginalData(formData);
        // Actualizar la imagen actual si se subió una nueva
        if (formData.image && previewImage) {
          setCurrentImage(previewImage);
        } else if (!previewImage && !formData.image) {
          setCurrentImage(null);
        }
        setTimeout(() => navigate('/products'), 1500);
      } else {
        throw new Error('Respuesta inesperada del servidor');
      }
    } catch (error) {
      console.error('Error al actualizar:', error);
      setError(error.response?.data?.error || 'Error al actualizar el ítem');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      await axios.delete(`http://127.0.0.1:8000/items/delete/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/products');
    } catch (error) {
      console.error('Error deleting item:', error);
      setError('Error al eliminar el ítem');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-success text-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0">
              <i className="fas fa-edit me-2"></i>
              Editar Ítem
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
              ¡Ítem actualizado exitosamente! Redirigiendo...
            </Alert>
          )}
          
          {loading && !formData.name ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Cargando datos del ítem...</p>
            </div>
          ) : (
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
                        <Form.Label>Stock Actual *</Form.Label>
                        <InputGroup>
                          <FormControl
                            type="number"
                            min="0"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            required
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Stock Mínimo *</Form.Label>
                        <InputGroup>
                          <FormControl
                            type="number"
                            min="1"
                            name="min_stock"
                            value={formData.min_stock}
                            onChange={handleChange}
                            required
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Código QR (opcional)</Form.Label>
                    <InputGroup>
                      <FormControl
                        type="text"
                        name="qr_code"
                        value={formData.qr_code}
                        onChange={handleChange}
                        placeholder="Código QR o identificador único"
                      />
                    </InputGroup>
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
                    {(currentImage || previewImage) && (
                      <div className="mt-3 text-center">
                        <img 
                          src={previewImage || currentImage} 
                          alt="Vista previa" 
                          className="img-thumbnail"
                          style={{ maxHeight: '200px' }}
                        />
                        <div className="mt-2">
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={handleRemoveImage}
                          >
                            <i className="fas fa-trash me-1"></i>
                            Eliminar imagen
                          </Button>
                        </div>
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
                          className="form-select"
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
                          className="form-select"
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
                          className="form-select"
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
                          className="form-select"
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
              
              <div className="d-flex justify-content-between">
                <Button 
                  variant="danger" 
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={loading}
                >
                  <i className="fas fa-trash me-2"></i>
                  Eliminar Ítem
                </Button>
                
                <div>
                  <Button 
                    variant="secondary" 
                    type="button"
                    onClick={() => navigate('/products')}
                    className="me-2"
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  
                  <Button 
                    variant="primary" 
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
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
      
      {/* Modal de confirmación para eliminar */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <i className="fas fa-exclamation-triangle me-2"></i>
            Confirmar Eliminación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar este ítem permanentemente? Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <>
                <i className="fas fa-trash me-1"></i>
                Eliminar
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EditItem;