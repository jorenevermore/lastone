import React, { useState } from 'react';
import { Modal, Button, Form, Spinner, InputGroup } from 'react-bootstrap';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, GeoPoint } from 'firebase/firestore';
import { geohashForLocation } from 'geofire-common';
import { useNavigate } from 'react-router-dom';
import MapComponent from './MapComponent';

const SignupModal = ({ show, handleClose }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState(null); // { lat: 0, lng: 0 }
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!location) {
      setError('Please select a location on the map');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!email || !password) {
      setError('Email and Password cannot be empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Geohash generation for the location
      const geohash = geohashForLocation([location.lat, location.lng]);

      // Save to Firestore with UID as a field
      const createdAt = Date.now(); // Milliseconds since epoch
      const barbershopId = user.uid; // Use UID as barbersId for easy reference

      await setDoc(doc(db, 'barbershops', barbershopId), {
        barbershopId, // UID added as a top-level field
        name,
        loc: {
          coordinates: new GeoPoint(location.lat, location.lng), // GeoPoint under "loc"
          geohash, // Geohash under "loc"
        },
        phone,
        email: user.email,
        isOpen: false, // Default value
        availableDays: [], // Default empty array
        barbers: [], // Default empty array
        createdAt, // Timestamp in milliseconds
      });

      resetForm();
      handleClose();
      navigate('/dashboard');
    } catch (error) {
      setError('Error creating account: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setLocation(null);
    setPhone('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  return (
    <Modal show={show} onHide={() => { handleClose(); resetForm(); }} className="signup-modal">
      <Modal.Header closeButton>
        <Modal.Title>Create Your Account</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formBasicName">
            <Form.Label>Name of Barbershop</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter the name of your barbershop"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </Form.Group>

          <Form.Group controlId="formBasicLocation">
            <Form.Label>Location (Select on Map)</Form.Label>
            <MapComponent onLocationSelect={setLocation} />
          </Form.Group>

          <Form.Group controlId="formBasicPhone">
            <Form.Label>Contact Number</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your contact number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />
          </Form.Group>

          <Form.Group controlId="formBasicEmail">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </Form.Group>

          <Form.Group controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <InputGroup.Text onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? 'Hide' : 'Show'}
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <Form.Group controlId="formBasicConfirmPassword">
            <Form.Label>Confirm Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <InputGroup.Text onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? 'Hide' : 'Show'}
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          {loading && <div className="text-center mt-3"><Spinner animation="border" /></div>}
          {error && <p className="text-danger text-center">{error}</p>}

          <Button className="btn-primary w-100 mt-3" onClick={handleSignup} disabled={loading}>
            Sign Up
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default SignupModal;
