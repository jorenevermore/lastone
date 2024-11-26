// Navbar.js
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';
import '../styles/Navbar.css';

const Navbar = ({ onLoginClick }) => { // Removed isLoggedIn and onLogoutClick
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector('.navbar');
      if (window.scrollY > 0) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center w-100">
          <div className="navbar-left">
            <Link className="navbar-brand" to="/" onClick={handleLogoClick}>
              ALOT
            </Link>
          </div>
          <div className="navbar-center">
            <ul className="navbar-nav d-flex flex-row">
              <li className="nav-item">
                <Link className="nav-link" to="/about">About Us</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/contact">Contact</Link>
              </li>
            </ul>
          </div>
          <div className="navbar-right">
            <button className="btn btn-outline-light" onClick={onLoginClick}>LOGIN</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
