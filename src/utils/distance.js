/**
 * Distance calculation & travel time utility using Haversine formula
 * Supports live GPS distance, walking time (mins walk), driving time (mins drive),
 * and direct Google Maps navigation links.
 */

export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const numLat1 = Number(lat1);
  const numLon1 = Number(lon1);
  const numLat2 = Number(lat2);
  const numLon2 = Number(lon2);
  if (isNaN(numLat1) || isNaN(numLon1) || isNaN(numLat2) || isNaN(numLon2)) return null;

  const R = 6371; // Earth radius in km
  const dLat = ((numLat2 - numLat1) * Math.PI) / 180;
  const dLon = ((numLon2 - numLon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((numLat1 * Math.PI) / 180) *
      Math.cos((numLat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const formatDistance = (km) => {
  if (km == null || isNaN(km)) return null;
  if (km < 1) {
    return `${Math.round(km * 1000)} m away`;
  }
  return `${km.toFixed(1)} km away`;
};

export const getWalkingTimeMinutes = (km) => {
  if (km == null || isNaN(km)) return 0;
  // Average human walking speed ~ 4.8 km/h => ~12.5 mins per km
  return Math.max(1, Math.round(km * 12.5));
};

export const getDrivingTimeMinutes = (km) => {
  if (km == null || isNaN(km)) return 0;
  // Local city riding / driving speed ~ 22 km/h => ~2.7 mins per km
  return Math.max(1, Math.round(km * 2.7));
};

export const formatTravelTime = (km, isHindi = false) => {
  if (km == null || isNaN(km)) return null;
  const distStr = km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;

  if (km <= 0.8) {
    const walkMins = getWalkingTimeMinutes(km);
    return {
      icon: '🚶',
      mode: 'walk',
      distStr,
      timeStr: `${walkMins} ${isHindi ? 'मिनट पैदल' : 'mins walk'}`,
      full: `🚶 ${distStr} (${walkMins} ${isHindi ? 'मिनट पैदल' : 'mins walk'})`,
    };
  }

  const driveMins = getDrivingTimeMinutes(km);
  return {
    icon: '🚗',
    mode: 'drive',
    distStr,
    timeStr: `${driveMins} ${isHindi ? 'मिनट ड्राइव' : 'mins drive'}`,
    full: `🚗 ${distStr} (${driveMins} ${isHindi ? 'मिनट ड्राइव' : 'mins drive'})`,
  };
};

export const getDirectionsUrl = (lat, lng, storeName = '') => {
  if (!lat || !lng) return 'https://maps.google.com';
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${lat},${lng}`)}${storeName ? `&destination_place_id=${encodeURIComponent(storeName)}` : ''}`;
};
