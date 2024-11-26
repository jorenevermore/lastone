import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const handleLoginClick = () => setShowLogin(true);
  const handleSignupClick = () => setShowSignup(true);

  return (
    <Router>
      <div className="App">
        <Navbar onLoginClick={handleLoginClick} />
        <LoginModal show={showLogin} handleClose={() => setShowLogin(false)} />
        <SignupModal show={showSignup} handleClose={() => setShowSignup(false)} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
