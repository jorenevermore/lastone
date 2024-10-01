import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal'; 
import ProtectedRoute from './components/ProtectedRoute';
import { auth } from './firebase';

function App() {
  const [showLogin, setShowLogin] = React.useState(false);
  const [showSignup, setShowSignup] = React.useState(false); 
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  const handleLoginClick = () => setShowLogin(true);
  const handleLogoutClick = async () => {
    try {
      await auth.signOut();
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const handleSignupClick = () => setShowSignup(true); 

  return (
    <Router>
      <div className="App">
        <Navbar 
          onLoginClick={handleLoginClick} 
          isLoggedIn={isLoggedIn} 
          onLogoutClick={handleLogoutClick} 
        />
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