import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { auth } from '../firebase'; 
import { FaSignOutAlt, FaTachometerAlt, FaClipboardList, FaUsers, FaCog, FaCalendarAlt } from 'react-icons/fa'; 
import { Navbar, Nav, Container, Button } from 'react-bootstrap'; 
import Bookings from './Bookings'; 
import Barbers from './Barbers';
import Services from './Services'; 
import Availability from './Availability'; 
import MainContent from './MainContent'; 
import logo from '../assets/logo.png'; 
import '../styles/DashboardNavbar.css'; 

const Dashboard = () => { 
  const [selectedContent, setSelectedContent] = useState('main'); 
  const navigate = useNavigate();

  const renderContent = () => { 
    switch (selectedContent) { 
      case 'bookings': 
        return <Bookings />; 
      case 'barbers': 
        return <Barbers />; 
      case 'services': 
        return <Services />; 
      case 'availability': 
        return <Availability />; 
      case 'main': 
      default: 
        return <MainContent />; 
    } 
  };

  const handleLogout = async () => { 
    const confirmation = window.confirm("Are you sure you want to logout?"); 
    if (confirmation) { 
      try { 
        await auth.signOut(); 
        navigate('/'); 
      } catch (error) { 
        console.error('Logout error:', error); 
      } 
    } 
  };

  return ( 
    <div className="dashboard-container">
      <Navbar bg="dark" variant="dark" expand="lg" className="custom-navbar">
        <Container fluid>
          <Navbar.Brand href="#">
            <img 
              src={logo} 
              alt="Admin Logo" 
              style={{ width: '40px', marginRight: '10px' }} 
            />
            ALOT
          </Navbar.Brand>
          <Nav className="mx-auto">
            <Nav.Link onClick={() => setSelectedContent('main')} className={selectedContent === 'main' ? 'active' : ''}>
              <FaTachometerAlt /> Overview
            </Nav.Link>
            <Nav.Link onClick={() => setSelectedContent('bookings')} className={selectedContent === 'bookings' ? 'active' : ''}>
              <FaClipboardList /> Manage Bookings
            </Nav.Link>
            <Nav.Link onClick={() => setSelectedContent('barbers')} className={selectedContent === 'barbers' ? 'active' : ''}>
              <FaUsers /> Barbers
            </Nav.Link>
            <Nav.Link onClick={() => setSelectedContent('services')} className={selectedContent === 'services' ? 'active' : ''}>
              <FaCog /> Services
            </Nav.Link>
            <Nav.Link onClick={() => setSelectedContent('availability')} className={selectedContent === 'availability' ? 'active' : ''}>
              <FaCalendarAlt /> Availability
            </Nav.Link>
          </Nav>
          <Button variant="danger" onClick={handleLogout} className="ms-auto">
            <FaSignOutAlt /> Logout
          </Button>
        </Container>
      </Navbar>
      <div className="content">
        {renderContent()}
      </div>
    </div>
  ); 
};

export default Dashboard;
