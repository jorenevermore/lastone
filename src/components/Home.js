import React from 'react'; 
import '../App.css';
import '../styles/Home.css';
import backgroundImage from '../assets/homepagebg.jpg';

const Home = () => {
  return (
    <div 
      className="home-background d-flex align-items-center justify-content-center text-center text-white"
      style={{ backgroundImage: `url(${backgroundImage})` }} 
    >
      <div className="container">
        <div className="row mt-4">
          <div className="col">
            <div className="hero-container">
              <div className="hero-title">
                TRANSFORM YOUR LOOK, <br />
                ANYTIME ANYWHERE
              </div>
              <div className="hero-subtitle">
                STYLE AT YOUR DOORSTEP
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
