import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Table, Row, Col } from 'react-bootstrap';
import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const Barbers = () => {
  const [showModal, setShowModal] = useState(false);
  const [barberDetails, setBarberDetails] = useState({
    fullName: '',
    contactNumber: '',
    address: '',
    email: '',
  });
  const [barbers, setBarbers] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchBarbers = async (uid) => {
      try {
        const userDocRef = doc(db, 'users', uid);
        const barberCollection = collection(userDocRef, 'barbersprofile');
        const barberSnapshot = await getDocs(barberCollection);
        const barberList = barberSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBarbers(barberList);
      } catch (error) {
        console.error('Error fetching documents: ', error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchBarbers(user.uid);
      } else {
        setUserId(null);
        setBarbers([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBarberDetails({ ...barberDetails, [name]: value });
  };

  const handleSaveBarber = async () => {
    if (!userId) return;
    try {
      const userDocRef = doc(db, 'users', userId);
      const barberCollection = collection(userDocRef, 'barbersprofile');
      const docRef = await addDoc(barberCollection, barberDetails);

      const newBarber = { id: docRef.id, ...barberDetails };
      setBarbers([...barbers, newBarber]);

      setShowModal(false);
      setBarberDetails({
        fullName: '',
        contactNumber: '',
        address: '',
        email: '',
      });
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  const handleDeleteBarber = async (barberId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const barberDocRef = doc(userDocRef, 'barbersprofile', barberId);
      await deleteDoc(barberDocRef);

      setBarbers(barbers.filter((barber) => barber.id !== barberId));
    } catch (error) {
      console.error('Error deleting barber: ', error);
    }
  };

  return (
    <div className="container mt-4">
      <Row className="mb-4">
        <Col>
          <h3>Manage Barbers</h3>
        </Col>
        <Col className="text-right">
          <Button variant="danger" disabled className="mr-2">
            Delete
          </Button>
          <Button variant="success" onClick={() => setShowModal(true)}>
            Add New Barber
          </Button>
        </Col>
      </Row>

      {/* Modal for Adding Barber */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Barber</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="fullName">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                value={barberDetails.fullName}
                onChange={handleInputChange}
                placeholder="Enter Full Name"
              />
            </Form.Group>
            <Form.Group controlId="contactNumber">
              <Form.Label>Contact Number</Form.Label>
              <Form.Control
                type="text"
                name="contactNumber"
                value={barberDetails.contactNumber}
                onChange={handleInputChange}
                placeholder="Enter Contact Number"
              />
            </Form.Group>
            <Form.Group controlId="address">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={barberDetails.address}
                onChange={handleInputChange}
                placeholder="Enter Address"
              />
            </Form.Group>
            <Form.Group controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={barberDetails.email}
                onChange={handleInputChange}
                placeholder="Enter Email"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveBarber}>
            Save Barber
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Barbers Table */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Address</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {barbers.map((barber) => (
            <tr key={barber.id}>
              <td>{barber.fullName}</td>
              <td>{barber.email}</td>
              <td>{barber.address}</td>
              <td>{barber.contactNumber}</td>
              <td>
                <Button variant="warning" size="sm" className="mr-2">
                  <i className="fas fa-pencil-alt"></i>
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteBarber(barber.id)}
                >
                  <i className="fas fa-trash-alt"></i>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Barbers;
