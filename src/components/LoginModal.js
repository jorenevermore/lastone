import React, { useState, useCallback, useEffect } from 'react';
import { Modal, Button, Form, Spinner, InputGroup } from 'react-bootstrap';
import SignupModal from './SignupModal';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { auth, db } from '../firebase'; // Ensure you have the correct imports for Firestore
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import '../App.css';
import '../styles/Modal.css';

const LoginModal = ({ show, handleClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

   
      const userDoc = await getDoc(doc(db, 'barbershops', user.uid));
      if (!userDoc.exists()) {
        throw new Error('Login Failed');
      }

      handleClose();
      navigate('/dashboard');
      resetForm();
    } catch (error) {
      setError(mapErrorToMessage(error));
    } finally {
      setLoading(false);
    }
  }, [email, password, navigate, handleClose]);

  const mapErrorToMessage = (error) => {
    switch (error.code) {
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/user-not-found':
        return 'No user found with this email';
      default:
        return 'Login error! Please try again.';
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
  };

  const handleShowSignup = () => {
    setShowSignup(true);
    handleClose();
  };

  const handleCloseSignup = () => setShowSignup(false);

  useEffect(() => {
    if (!show) resetForm();
  }, [show]);

  return (
    <>
      <Modal show={show} onHide={handleClose} className="login-modal">
        <Modal.Header closeButton>
          <Modal.Title>Login to Your Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-describedby="emailHelp"
              />
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <InputGroup.Text onClick={() => setShowPassword(!showPassword)} role="button">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>

            {loading && <div className="text-center mt-3"><Spinner animation="border" /></div>}
            {error && <p className="text-danger text-center mt-3">{error}</p>}

            <Button className="btn-primary w-100" onClick={handleLogin} disabled={loading}>
              Login
            </Button>

            <div className="text-center mt-3">
              <p>
                Don't have an account?{' '}
                <Button variant="link" onClick={handleShowSignup} className="p-0">
                  Sign up here
                </Button>
              </p>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <SignupModal show={showSignup} handleClose={handleCloseSignup} />
    </>
  );
};

export default LoginModal;
