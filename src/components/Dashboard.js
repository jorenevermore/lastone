import '../App.css';
import '../styles/DashboardCard.css';
import '../styles/Sidebar.css';
import Bookings from './Bookings';
import Barbers from './Barbers';
import Services from './Services';
import Availability from './Availability';
import MainContent from './MainContent'; 
import React, { useState } from 'react';

const Dashboard = () => {
  const [selectedContent, setSelectedContent] = useState('main'); // Default to main content

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

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-3 sidebar">
          <div className="sidebar-content p-3">
            <h4>Dashboard Menu</h4>
            <ul className="sidebar-menu list-unstyled">
              <li><button onClick={() => setSelectedContent('main')}>Dashboard Overview</button></li>
              <li><button onClick={() => setSelectedContent('bookings')}>Manage Bookings</button></li>
              <li><button onClick={() => setSelectedContent('barbers')}>Barbers</button></li>
              <li><button onClick={() => setSelectedContent('services')}>Services</button></li>
              <li><button onClick={() => setSelectedContent('availability')}>Availability</button></li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9">
          {/* Dashboard Card */}
          <div className="card mb-4">
            <div className="card-body">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;