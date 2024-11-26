import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Card, Row, Col, Dropdown, Badge } from 'react-bootstrap';
import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { FaEllipsisV, FaTrash, FaEdit } from 'react-icons/fa';
import '../styles/Services.css';

const Services = () => {
  const [userId, setUserId] = useState(null);
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [serviceDetails, setServiceDetails] = useState({
    name: '',
    price: '',
    image: null,
    previewUrl: null,
    status: 'Available',
  });
  const [selectedServiceId, setSelectedServiceId] = useState(null);

  useEffect(() => {
    const fetchServices = async (uid) => {
      try {
        const userDocRef = doc(db, 'users', uid);
        const servicesCollection = collection(userDocRef, 'services');
        const servicesSnapshot = await getDocs(servicesCollection);
        const servicesList = servicesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setServices(servicesList);
      } catch (error) {
        console.error('Error fetching services: ', error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchServices(user.uid);
      } else {
        setUserId(null);
        setServices([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setServiceDetails({ ...serviceDetails, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setServiceDetails({ ...serviceDetails, image: file });

    const reader = new FileReader();
    reader.onloadend = () => {
      setServiceDetails({ ...serviceDetails, previewUrl: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveService = async () => {
    if (!userId) return;

    try {
      const userDocRef = doc(db, 'users', userId);
      const servicesCollection = collection(userDocRef, 'services');

      // Check if a new image was uploaded, otherwise use the existing one
      let serviceData = {
        name: serviceDetails.name,
        price: serviceDetails.price,
        status: serviceDetails.status,
        image: serviceDetails.previewUrl || serviceDetails.image, // Use existing image if no new one
      };

      if (editing) {
        const serviceDocRef = doc(servicesCollection, selectedServiceId);
        await updateDoc(serviceDocRef, serviceData);
        setServices(
          services.map((service) =>
            service.id === selectedServiceId ? { ...service, ...serviceData } : service
          )
        );
      } else {
        const docRef = await addDoc(servicesCollection, serviceData);
        const newService = { id: docRef.id, ...serviceData };
        setServices([...services, newService]);
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving service: ', error);
    }
  };

  const handleDeleteService = async (serviceId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const serviceDocRef = doc(userDocRef, 'services', serviceId);
      await deleteDoc(serviceDocRef);
      setServices(services.filter((service) => service.id !== serviceId));
    } catch (error) {
      console.error('Error deleting service: ', error);
    }
  };

  const resetForm = () => {
    setServiceDetails({ name: '', price: '', image: null, previewUrl: null, status: 'Available' });
    setEditing(false);
    setSelectedServiceId(null);
  };

  const handleAddService = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditService = (service) => {
    setServiceDetails({ ...service, previewUrl: service.image }); // Preserve original image URL
    setSelectedServiceId(service.id);
    setEditing(true);
    setShowModal(true);
  };

  return (
    <div className="services-container">
      <div className="header">
        <h2>Services</h2>
        <Button variant="primary" onClick={handleAddService}>
          Add Service
        </Button>
      </div>

      <Row className="service-grid">
        {services.map((service) => (
          <Col key={service.id} md={4} className="grid-item">
            <Card className={`service-card ${service.status === 'Disabled' ? 'disabled' : ''}`}>
              {service.image && <Card.Img variant="top" src={service.image} />}
              <Card.Body>
                <Card.Title>{service.name}</Card.Title>
                <Card.Text>${service.price}</Card.Text>
                <Dropdown align="end">
                  <Dropdown.Toggle as={Button} variant="light" className="icon-btn">
                    <FaEllipsisV />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handleEditService(service)}>
                      <FaEdit /> Edit
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleDeleteService(service.id)} className="text-danger">
                      <FaTrash /> Delete
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                <Badge pill bg={service.status === 'Available' ? 'success' : 'danger'}>
                  {service.status}
                </Badge>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? 'Edit Service' : 'Add New Service'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="name">
              <Form.Label>Service Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={serviceDetails.name}
                onChange={handleInputChange}
                placeholder="Enter service name"
              />
            </Form.Group>

            <Form.Group controlId="price">
              <Form.Label>Service Price</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={serviceDetails.price}
                onChange={handleInputChange}
                placeholder="Enter service price"
              />
            </Form.Group>

            <Form.Group controlId="status">
              <Form.Label>Status</Form.Label>
              <Form.Control
                as="select"
                name="status"
                value={serviceDetails.status}
                onChange={handleInputChange}
              >
                <option>Available</option>
                <option>Disabled</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="image">
              <Form.Label>Service Image</Form.Label>
              <Form.Control type="file" onChange={handleImageUpload} />
            </Form.Group>

            {serviceDetails.previewUrl && (
              <img src={serviceDetails.previewUrl} alt="Preview" className="img-preview" />
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleSaveService}>{editing ? 'Update' : 'Save'}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Services;
