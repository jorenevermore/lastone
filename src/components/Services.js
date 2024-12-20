import React, { useState, useEffect } from 'react'; 
import { Modal, Button, Form, Card, Row, Col, Dropdown, Badge, Nav } from 'react-bootstrap';
import { db, auth } from '../firebase';
import { doc, updateDoc, getDoc, addDoc, collection } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { FaEllipsisV, FaTrash, FaEdit } from 'react-icons/fa';
import '../styles/Services.css';

const Services = () => {
  const [userId, setUserId] = useState(null);
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('service');
  const [serviceDetails, setServiceDetails] = useState({
    id: '',
    title: '',
    featuredImage: null,
    previewUrl: null,
    status: 'Available',
  });
  const [styleDetails, setStyleDetails] = useState({
    styleName: '',
    price: '',
    featuredImage: null,
    previewUrl: null,
    serviceId: '',
  });
  const [barbershopId, setBarbershopId] = useState(null);

  useEffect(() => {
    const fetchBarbershopAndServices = async (uid) => {
      try {
        const barbershopDoc = await getDoc(doc(db, 'barbershops', uid));
        if (barbershopDoc.exists()) {
          setBarbershopId(barbershopDoc.id);
          const servicesArray = Array.isArray(barbershopDoc.data().services)
            ? barbershopDoc.data().services
            : [];
          setServices(servicesArray);
        } else {
          console.error('Barbershop not found');
        }
      } catch (error) {
        console.error('Error fetching barbershop: ', error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchBarbershopAndServices(user.uid);
      } else {
        setUserId(null);
        setServices([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e, isStyle = false) => {
    const { name, value } = e.target;
    if (isStyle) {
      setStyleDetails({ ...styleDetails, [name]: value });
    } else {
      setServiceDetails({ ...serviceDetails, [name]: value });
    }
  };

  const handleImageUpload = (e, isStyle = false) => {
    const file = e.target.files[0];
    if (isStyle) {
      setStyleDetails({ ...styleDetails, featuredImage: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setStyleDetails({ ...styleDetails, previewUrl: reader.result });
      };
      reader.readAsDataURL(file);
    } else {
      setServiceDetails({ ...serviceDetails, featuredImage: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setServiceDetails({ ...serviceDetails, previewUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveService = async () => {
    if (!userId || !barbershopId) return;

    try {
      const barbershopRef = doc(db, 'barbershops', barbershopId);

      const newService = {
        id: editing ? serviceDetails.id : `service_${Date.now()}`,
        title: serviceDetails.title,
        status: serviceDetails.status,
        featuredImage: serviceDetails.previewUrl || serviceDetails.featuredImage,
      };

      const updatedServices = editing
        ? services.map((service) => (service.id === serviceDetails.id ? newService : service))
        : [...services, newService];

      await updateDoc(barbershopRef, { services: updatedServices });
      setServices(updatedServices);
      setEditing(false); // Reset editing state
      setShowModal(false);
    } catch (error) {
      console.error('Error saving service: ', error);
    }
  };

  const handleSaveStyle = async () => {
    if (!userId || !barbershopId || !styleDetails.serviceId) return;

    try {
      const styleCollection = collection(db, 'styles');
      const newStyle = {
        styleId: `style_${Date.now()}`,
        styleName: styleDetails.styleName,
        price: styleDetails.price,
        featuredImage: styleDetails.previewUrl || styleDetails.featuredImage,
        serviceId: styleDetails.serviceId,
        barbershopId,
      };

      await addDoc(styleCollection, newStyle);
      setShowModal(false);
    } catch (error) {
      console.error('Error saving style: ', error);
    }
  };

  const handleEditService = (service) => {
    setServiceDetails(service);
    setEditing(true); // Ensure editing state is set
    setActiveTab('service'); // Default to the Service tab
    setShowModal(true);
  };

  const handleTabChange = (tab) => setActiveTab(tab);

  return (
    <div className="services-container">
      <div className="header">
        <h2>Services</h2>
        <Button variant="primary" onClick={() => {
          setEditing(false);
          setServiceDetails({ id: '', title: '', featuredImage: null, previewUrl: null, status: 'Available' });
          setShowModal(true);
        }}>
          Add Service
        </Button>
      </div>

      <Row className="service-grid">
        {services.map((service) => (
          <Col key={service.id} md={4} className="grid-item">
            <Card className={service.status === 'Disabled' ? 'disabled' : ''}>
              {service.featuredImage && <Card.Img variant="top" src={service.featuredImage} />}
              <Card.Body>
                <Card.Title>{service.title}</Card.Title>
                <Dropdown align="end">
                  <Dropdown.Toggle as={Button} variant="light" className="icon-btn">
                    <FaEllipsisV />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handleEditService(service)}>
                      <FaEdit /> Edit
                    </Dropdown.Item>
                    <Dropdown.Item className="text-danger">
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
          <Modal.Title>Add New</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Nav variant="tabs" activeKey={activeTab} onSelect={handleTabChange}>
            <Nav.Item>
              <Nav.Link eventKey="service">Service</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="style">Style</Nav.Link>
            </Nav.Item>
          </Nav>
          {activeTab === 'service' && (
            <Form>
              <Form.Group controlId="title">
                <Form.Label>Service Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={serviceDetails.title}
                  onChange={handleInputChange}
                  placeholder="Enter service title"
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

              <Form.Group controlId="featuredImage">
                <Form.Label>Service Image</Form.Label>
                <Form.Control type="file" onChange={handleImageUpload} />
              </Form.Group>

              {serviceDetails.previewUrl && (
                <img src={serviceDetails.previewUrl} alt="Preview" className="img-preview" />
              )}
            </Form>
          )}
          {activeTab === 'style' && (
            <Form>
              <Form.Group controlId="styleName">
                <Form.Label>Style Name</Form.Label>
                <Form.Control
                  type="text"
                  name="styleName"
                  value={styleDetails.styleName}
                  onChange={(e) => handleInputChange(e, true)}
                  placeholder="Enter style name"
                />
              </Form.Group>

              <Form.Group controlId="price">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={styleDetails.price}
                  onChange={(e) => handleInputChange(e, true)}
                  placeholder="Enter price"
                />
              </Form.Group>

              <Form.Group controlId="serviceId">
                <Form.Label>Service</Form.Label>
                <Form.Control
                  as="select"
                  name="serviceId"
                  value={styleDetails.serviceId}
                  onChange={(e) => handleInputChange(e, true)}
                >
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.title}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="featuredImage">
                <Form.Label>Style Image</Form.Label>
                <Form.Control type="file" onChange={(e) => handleImageUpload(e, true)} />
              </Form.Group>

              {styleDetails.previewUrl && (
                <img src={styleDetails.previewUrl} alt="Preview" className="img-preview" />
              )}
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          <Button variant="primary" onClick={activeTab === 'service' ? handleSaveService : handleSaveStyle}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Services;
  