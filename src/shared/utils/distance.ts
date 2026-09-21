/**
 * Geo-distance calculations using Haversine formula
 */

export const calculateDistanceKm = (
  lat1?: number | null,
  lon1?: number | null,
  lat2?: number | null,
  lon2?: number | null
): number | null => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    return null;
  }

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371; // Earth's radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return Math.round(d * 10) / 10; // Round to 1 decimal place
};

export const formatDistance = (distanceKm?: number | null): string => {
  if (distanceKm == null) return '';
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m door`;
  }
  return `${distanceKm.toFixed(1)} km door`;
};
