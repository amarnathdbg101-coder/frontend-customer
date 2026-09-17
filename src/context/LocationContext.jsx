import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const LocationContext = createContext(null);

const DEFAULT_COORDS = { lat: 26.1542, lng: 85.8918 }; // Default city coordinates

export const LocationProvider = ({ children }) => {
  const [coords, setCoords] = useState(() => {
    const saved = localStorage.getItem('shopsilo_customer_coords');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_COORDS;
  });

  const [locationName, setLocationName] = useState(() => {
    return localStorage.getItem('shopsilo_customer_loc_name') || 'Local Area';
  });

  const [radiusKm, setRadiusKm] = useState(() => {
    const saved = localStorage.getItem('shopsilo_customer_radius');
    return saved ? parseFloat(saved) : 5; // Default 5 km radius
  });

  const [isDetecting, setIsDetecting] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('shopsilo_customer_coords', JSON.stringify(coords));
    } catch (e) {}
  }, [coords]);

  useEffect(() => {
    try {
      localStorage.setItem('shopsilo_customer_loc_name', locationName);
    } catch (e) {}
  }, [locationName]);

  useEffect(() => {
    try {
      localStorage.setItem('shopsilo_customer_radius', radiusKm.toString());
    } catch (e) {}
  }, [radiusKm]);

  // Detect location via device GPS
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser');
      return;
    }
    setIsDetecting(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCoords(newCoords);
        setLocationName('Current GPS Location');
        setIsDetecting(false);
      },
      (error) => {
        console.warn('GPS location access denied or failed:', error);
        setGpsError('Could not access GPS. Using default area.');
        setIsDetecting(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  const setManualLocation = useCallback((name, lat, lng) => {
    setCoords({ lat, lng });
    setLocationName(name);
  }, []);

  const contextValue = useMemo(
    () => ({
      coords,
      locationName,
      radiusKm,
      setRadiusKm,
      detectLocation,
      setManualLocation,
      isDetecting,
      gpsError,
    }),
    [coords, locationName, radiusKm, detectLocation, setManualLocation, isDetecting, gpsError]
  );

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
