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
  FormControl,
  Modal
} from 'react-bootstrap';

const EditItem = () => {
  const { id } = useParams();
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
  const [currentImage, setCurrentImage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Cargar datos del ítem y datos necesarios para los select
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        const headers = { Authorization: `Bearer ${token}` };
        
        // Obtener datos del ítem
        const itemResponse = await axios.get(`http://127.0.0.1:8000/items/detail/${id}/`, { headers });
        const itemData = itemResponse.data;
        
        // Obtener datos para los select
        const [categoriesRes, locationsRes, statusesRes, usersRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/category/list/", { headers }),
          axios.get('http://127.0.0.1:8000/location/list/', { headers }),
          axios.get('http://127.0.0.1:8000/status/list/', { headers }),
          axios.get('http://127.0.0.1:8000/users/list/', { headers })
        ]);
        
        // Establecer datos del ítem
        setFormData({
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
        });
        
        // Establecer imagen actual si existe
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
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setCurrentImage(null); // Eliminar la vista previa de la imagen actual
      
      // Crear vista previa de la nueva imagen
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
      
      // Solo agregar la imagen si se ha seleccionado una nueva
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      } else if (!currentImage) {
        // Si no hay imagen actual ni nueva, enviar campo vacío para borrar la imagen existente
        formDataToSend.append('image', '');
      }
      
      const response = await axios.put(
        `http://127.0.0.1:8000/items/update/${id}/`,
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
      console.error('Error updating item:', error);
      setError(error.response?.data?.message || 'Error al actualizar el ítem');
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
        <Card.Header className="bg-primary text-white py-3">
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
                    {(currentImage || previewImage) && (
                      <div className="mt-3 text-center">
                        <img 
                          src={previewImage || currentImage} 
                          alt="Vista previa" 
                          className="img-thumbnail"
                          style={{ maxHeight: '200px' }}
                        />
                        {currentImage && !previewImage && (
                          <div className="mt-2">
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => setCurrentImage(null)}
                            >
                              <i className="fas fa-trash me-1"></i>
                              Eliminar imagen actual
                            </Button>
                          </div>
                        )}
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
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar este ítem? Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              'Eliminar'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EditItem;