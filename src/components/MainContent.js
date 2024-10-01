import React, { useState, useEffect } from 'react';
import '../styles/MainContent.css'; // Import custom styles if needed

const MainContent = () => {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setCurrentDate(formattedDate);
  }, []);

  const availability = "9 AM - 5 PM"; // Sample availability
  const pendingAppointments = 5; // Placeholder for pending appointments

  return (
    <div className="dashboard-overview">
      <h5 className="dashboard-title">Dashboard Overview</h5>
      <p className="dashboard-welcome">
        Welcome to the barbershop dashboard. Here you can get insights, analytics, and manage your barbershop effectively.
      </p>

      {/* Date Section */}
      <div className="dashboard-section">
        <div className="dashboard-card">
          <h6>Current Date</h6>
          <p>{currentDate}</p>
        </div>
      </div>

      {/* Availability Section */}
      <div className="dashboard-section">
        <div className="dashboard-card">
          <h6>Today's Availability</h6>
          <p>{availability}</p>
        </div>
      </div>

      {/* Pending Appointments Section */}
      <div className="dashboard-section">
        <div className="dashboard-card">
          <h6>Pending Appointments</h6>
          <p>{pendingAppointments}</p>
        </div>
      </div>
    </div>
  );
};

export default MainContent;
