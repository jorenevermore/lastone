/* global google */
import React, { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const DEFAULT_LOCATION = { lat: -34.397, lng: 150.644 }; 
const ZOOM_LEVEL = 15; 

const MapComponent = ({ onLocationSelect }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);


  const initializeMap = (map) => {
    markerRef.current = new google.maps.Marker({
      position: map.getCenter(),
      map,
      draggable: true,
    });

    markerRef.current.addListener('dragend', handleMarkerDrag);
    map.addListener('click', handleMapClick);

    getUserLocation(map); 
  };


  const handleMarkerDrag = (event) => {
    const { lat, lng } = event.latLng.toJSON();
    onLocationSelect({ lat, lng });
  };

  const handleMapClick = (event) => {
    const { lat, lng } = event.latLng.toJSON();
    markerRef.current.setPosition({ lat, lng });
    onLocationSelect({ lat, lng });
  };


  const getUserLocation = (map) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          map.setCenter(userLocation);
          markerRef.current.setPosition(userLocation);
          onLocationSelect(userLocation);
        },
        () => {
          console.error('Error getting location. Using default location.');
          map.setCenter(DEFAULT_LOCATION); 
          markerRef.current.setPosition(DEFAULT_LOCATION);
          onLocationSelect(DEFAULT_LOCATION); 
        }
      );
    } else {
      console.error('Geolocation not supported by this browser. Using default location.');
      map.setCenter(DEFAULT_LOCATION);
      markerRef.current.setPosition(DEFAULT_LOCATION);
      onLocationSelect(DEFAULT_LOCATION); 
    }
  };

  useEffect(() => {
    const loader = new Loader({
      apiKey: 'AIzaSyAAlwboaaSEPBpdZqSJXmbGIRdQS9TYHlc', 
      version: 'weekly',
    });

    loader.load().then(() => {
      const map = new google.maps.Map(mapRef.current, {
        center: DEFAULT_LOCATION,
        zoom: ZOOM_LEVEL,
      });

      initializeMap(map);
    });

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null); 
      }
    };
  }, [onLocationSelect]); 

  return (
    <div
      ref={mapRef}
      style={{ height: '300px', width: '100%', border: '1px solid #ccc' }}
    />
  );
};

export default MapComponent;
