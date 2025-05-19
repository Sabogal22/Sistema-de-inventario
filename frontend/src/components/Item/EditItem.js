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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        const headers = { Authorization: `Bearer ${token}` };

        const [itemRes, categoriesRes, locationsRes, statusesRes, usersRes] = await Promise.all([
          axios.get(`http://127.0.0.1:8000/items/${id}/`, { headers }),
          axios.get("http://127.0.0.1:8000/category/list/", { headers }),
          axios.get('http://127.0.0.1:8000/location/list/', { headers }),
          axios.get('http://127.0.0.1:8000/status/list/', { headers }),
          axios.get('http://127.0.0.1:8000/users/list/', { headers })
        ]);

        const item = itemRes.data;

        setFormData({
          name: item.name || '',
          description: item.description || '',
          category: item.category?.id || '',
          location: item.location?.id || '',
          status: item.status?.id || '',
          stock: item.stock || 1,
          min_stock: item.min_stock || 1,
          responsible_user: item.responsible_user?.id || '',
          qr_code: item.qr_code || '',
          image: null
        });

        setCurrentImage(item.image || null);
        setCategories(categoriesRes.data);
        setLocations(locationsRes.data);
        setStatuses(statusesRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error(err);
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
      [name]: ['stock', 'min_stock'].includes(name) ? (value === '' ? '' : parseInt(value)) : value
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

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: null })); // null mejor que '' para claridad
    setPreviewImage(null);
    setCurrentImage(null); // también eliminamos la imagen actual
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');

      // Usar FormData para enviar imagen y otros datos
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name || '');
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('category', formData.category ? formData.category.toString() : '');
      formDataToSend.append('location', formData.location ? formData.location.toString() : '');
      formDataToSend.append('status', formData.status ? formData.status.toString() : '');
      formDataToSend.append('stock', formData.stock !== undefined && formData.stock !== null ? formData.stock : 0);
      formDataToSend.append('min_stock', formData.min_stock !== undefined && formData.min_stock !== null ? formData.min_stock : 1);
      formDataToSend.append('responsible_user', formData.responsible_user ? formData.responsible_user.toString() : '');
      formDataToSend.append('qr_code', formData.qr_code || '');

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      } else if (!currentImage) {
        formDataToSend.append('image', '');
      }

      const response = await axios.post(
        `http://127.0.0.1:8000/items/update/${id}/`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );


      setSuccess(true);
      setTimeout(() => navigate('/products'), 1500);
    } catch (err) {
      console.error(err);
      let msg = 'Error al actualizar el ítem';
      if (err.response?.data) {
        msg = JSON.stringify(err.response.data);
        msg = JSON.stringify(err.responseIMG.data);
      }
      setError(msg);
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
    } catch (err) {
      console.error(err);
      setError('Error al eliminar el ítem');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-success text-white py-3 d-flex justify-content-between">
          <h3 className="mb-0"><i className="fas fa-edit me-2"></i>Editar Ítem</h3>
          <Button variant="outline-light" onClick={() => navigate('/products')}>
            <i className="fas fa-arrow-left me-2"></i>Volver
          </Button>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">¡Ítem actualizado exitosamente!</Alert>}
          {loading && !formData.name ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-3">Cargando datos del ítem...</p>
            </div>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre *</Form.Label>
                    <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Descripción</Form.Label>
                    <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Stock *</Form.Label>
                    <Form.Control type="number" name="stock" value={formData.stock} min="0" onChange={handleChange} required />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Stock mínimo *</Form.Label>
                    <Form.Control type="number" name="min_stock" value={formData.min_stock} min="1" onChange={handleChange} required />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>QR (opcional)</Form.Label>
                    <Form.Control type="text" name="qr_code" value={formData.qr_code} onChange={handleChange} />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Imagen</Form.Label>
                    <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
                    {(previewImage || currentImage) && (
                      <div className="mt-2 text-center">
                        <img src={previewImage || currentImage} alt="Preview" className="img-thumbnail" style={{ maxHeight: '200px' }} />
                        <Button variant="outline-danger" size="sm" className="mt-2" onClick={handleRemoveImage}>
                          <i className="fas fa-trash me-1"></i> Eliminar Imagen
                        </Button>
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Categoría *</Form.Label>
                    <Form.Select name="category" value={formData.category} onChange={handleChange} required>
                      <option value="">Seleccionar categoría</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Ubicación *</Form.Label>
                    <Form.Select name="location" value={formData.location} onChange={handleChange} required>
                      <option value="">Seleccionar ubicación</option>
                      {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Estado *</Form.Label>
                    <Form.Select name="status" value={formData.status} onChange={handleChange} required>
                      <option value="">Seleccionar estado</option>
                      {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Responsable (opcional)</Form.Label>
                    <Form.Select name="responsible_user" value={formData.responsible_user} onChange={handleChange}>
                      <option value="">No asignado</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-between">
                <Button variant="danger" type="button" onClick={() => setShowDeleteModal(true)} disabled={loading}>
                  <i className="fas fa-trash me-2"></i>Eliminar Ítem
                </Button>
                <div>
                  <Button variant="secondary" onClick={() => navigate('/products')} className="me-2" disabled={loading}>Cancelar</Button>
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? <Spinner animation="border" size="sm" className="me-2" /> : <i className="fas fa-save me-2"></i>}
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title><i className="fas fa-exclamation-triangle me-2"></i>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Estás seguro de que deseas eliminar este ítem?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : <><i className="fas fa-trash me-1"></i>Eliminar</>}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EditItem;