import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';
import '../styles/Navbar.css';

const Navbar = ({ onLoginClick, isLoggedIn, onLogoutClick }) => {
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
    navigate(isLoggedIn ? '/dashboard' : '/');
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
            {!isLoggedIn && (
              <ul className="navbar-nav d-flex flex-row">
                <li className="nav-item">
                  <Link className="nav-link" to="/about">About Us</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/contact">Contact</Link>
                </li>
              </ul>
            )}
          </div>
          <div className="navbar-right">
            {!isLoggedIn ? (
              <button className="btn btn-outline-light" onClick={onLoginClick}>LOGIN</button>
            ) : (
              <button className="btn btn-outline-light" onClick={onLogoutClick}>LOGOUT</button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
