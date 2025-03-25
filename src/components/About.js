import React from 'react'; 
import '../App.css';
import '../styles/About.css'; // Importing necessary CSS files for styling
import finalBackground from '../assets/finalbackground.png'; // Importing image asset
import connectWithBarber from '../assets/connectwbarber.jpg'; // Importing another image asset
import Jorene from '../assets/jorene.jpg';
import Ryan from '../assets/ryan.png';
import Ryle from '../assets/ryle.jpg';


const About = () => {
  return (
    <div className="about-container">
      {/* First Section: Why We Exist */}
      <div className="about-section container">
        <div className="row align-items-center">
          {/* Image Section */}
          <div className="col-md-6 about-image">
            <img src={finalBackground} alt="ALOT Barbershop" className="rounded-img" />
          </div>

          {/* Text Section */}
          <div className="col-md-6 about-content">
            <h2 className="about-title">Why We Exist</h2>
            <p className="about-text">
              ALOT empowers both barbers and clients to connect effortlessly.
            </p>
            <p className="about-text">
              Our platform offers user-friendly tools for barbershop management, client engagement, and more—bringing convenience to your fingertips.
            </p>
          </div>
        </div>
      </div>

      {/* Second Section: Connect with Your Local Barber */}
      <div className="connect-barber-section">
        <div className="connect-barber-image">
          <img src={connectWithBarber} alt="Connect with Barber" className="overlayed-img" />
        </div>
        <div className="connect-barber-overlay">
          <div className="connect-barber-content">
            <h2 className="connect-barber-title">Connect with Your Local Barber</h2>
            <p className="connect-barber-text">
              Your ultimate app for discovering and connecting with trusted local barbers.
            </p>
          </div>
        </div>
      </div>

      {/* Third Section: Meet Our Team */}
      <div className="team-section">
        <h2 className="team-title">Meet Our Team</h2>
        <div className="row">
          <div className="col-md-4 team-member">
            <div className="team-image-wrapper">
              <img src={Jorene} alt="Jorene Pamaos" className="team-image" />
            </div>
            <h3 className="team-name">Jorene Pamaos</h3>
            <p className="team-role">Web Developer</p>
          </div>
          <div className="col-md-4 team-member">
            <div className="team-image-wrapper">
              <img src={Ryle} alt="Ryle Maturan" className="team-image" />
            </div>
            <h3 className="team-name">Ryle Maturan</h3>
            <p className="team-role">Mobile Developer</p>
          </div>
          <div className="col-md-4 team-member">
            <div className="team-image-wrapper">
              <img src={Ryan} alt="Ryan Tabarno" className="team-image" />
            </div>
            <h3 className="team-name">Ryan Tabarno</h3>
            <p className="team-role">Mobile Developer</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
