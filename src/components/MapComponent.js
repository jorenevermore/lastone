/* global google */
import React, { useEffect, useRef, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const DEFAULT_LOCATION = { lat: 10.3157, lng: 123.8854 }; 
const ZOOM_LEVEL = 15; 

const MapComponent = ({ onLocationSelect }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const handleMarkerDrag = useCallback((event) => {
    const { lat, lng } = event.latLng.toJSON();
    onLocationSelect({ lat, lng });
  }, [onLocationSelect]);

  const handleMapClick = useCallback((event) => {
    const { lat, lng } = event.latLng.toJSON();
    if (markerRef.current) {
      markerRef.current.setPosition({ lat, lng });
    }
    onLocationSelect({ lat, lng });
  }, [onLocationSelect]);

  const getUserLocation = useCallback((map) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          map.setCenter(userLocation);
          if (markerRef.current) {
            markerRef.current.setPosition(userLocation);
          }
          onLocationSelect(userLocation);
        },
        () => {
          console.error('Error getting location. Using default location.');
          map.setCenter(DEFAULT_LOCATION); 
          if (markerRef.current) {
            markerRef.current.setPosition(DEFAULT_LOCATION);
          }
          onLocationSelect(DEFAULT_LOCATION); 
        }
      );
    } else {
      console.error('Geolocation not supported by this browser. Using default location.');
      map.setCenter(DEFAULT_LOCATION);
      if (markerRef.current) {
        markerRef.current.setPosition(DEFAULT_LOCATION);
      }
      onLocationSelect(DEFAULT_LOCATION); 
    }
  }, [onLocationSelect]);

  const initializeMap = useCallback((map) => {
    markerRef.current = new google.maps.Marker({
      position: map.getCenter(),
      map,
      draggable: true,
    });

    markerRef.current.addListener('dragend', handleMarkerDrag);
    map.addListener('click', handleMapClick);

    getUserLocation(map); 
  }, [handleMarkerDrag, handleMapClick, getUserLocation]);

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
  }, [initializeMap]); 

  return (
    <div
      ref={mapRef}
      style={{ height: '300px', width: '100%', border: '1px solid #ccc' }}
    />
  );
};

export default MapComponent;
