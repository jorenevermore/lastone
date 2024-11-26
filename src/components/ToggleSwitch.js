import React from 'react';
import '../styles/ToggleSwitch.css'; 

const ToggleSwitch = ({ isAvailable, onToggle }) => {
  return (
    <div className="toggle-container">
      <div 
        className={`toggle-button ${isAvailable ? 'active' : ''}`}
        onClick={onToggle}
      >
        <div className="toggle-circle"></div>
      </div>
      <span className={`availability-indicator ${isAvailable ? 'available' : 'unavailable'}`}></span>
    </div>
  );
};

export default ToggleSwitch;
