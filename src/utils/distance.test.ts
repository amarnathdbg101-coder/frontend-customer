import { describe, it, expect } from 'vitest';
import {
  calculateDistanceKm,
  formatDistance,
  getWalkingTimeMinutes,
  getDrivingTimeMinutes,
  formatTravelTime,
  getDirectionsUrl,
} from './distance';

describe('Distance & Navigation Utility Tests', () => {
  it('should return null when coordinates are missing or invalid', () => {
    expect(calculateDistanceKm(null, null, 26.15, 85.89)).toBeNull();
    expect(calculateDistanceKm(26.15, 85.89, undefined, null)).toBeNull();
    expect(calculateDistanceKm('invalid' as any, 85.89, 26.15, 85.89)).toBeNull();
  });

  it('should calculate accurate distance between two GPS coordinates using Haversine formula', () => {
    // Distance between Delhi (28.6139, 77.2090) and Mumbai (19.0760, 72.8777) ~ 1148 km
    const distance = calculateDistanceKm(28.6139, 77.2090, 19.0760, 72.8777);
    expect(distance).toBeGreaterThan(1140);
    expect(distance).toBeLessThan(1160);
  });

  it('should format distance into meters for <1km and km for >=1km', () => {
    expect(formatDistance(null)).toBeNull();
    expect(formatDistance(0.35)).toBe('350 m away');
    expect(formatDistance(2.45)).toBe('2.5 km away');
  });

  it('should calculate walking and driving travel time in minutes', () => {
    expect(getWalkingTimeMinutes(0.4)).toBe(5); // ~0.4 * 12.5 = 5 mins
    expect(getDrivingTimeMinutes(10)).toBe(27); // ~10 * 2.7 = 27 mins
  });

  it('should format travel time badge in English and Hindi', () => {
    const walkEng = formatTravelTime(0.5, false);
    expect(walkEng?.icon).toBe('🚶');
    expect(walkEng?.timeStr).toContain('mins walk');

    const walkHindi = formatTravelTime(0.5, true);
    expect(walkHindi?.timeStr).toContain('मिनट पैदल');

    const driveEng = formatTravelTime(5, false);
    expect(driveEng?.icon).toBe('🚗');
    expect(driveEng?.timeStr).toContain('mins drive');
  });

  it('should generate valid Google Maps directions URL', () => {
    const url = getDirectionsUrl(26.1542, 85.8918, 'Gupta Store');
    expect(url).toContain('https://www.google.com/maps/dir/?api=1');
    expect(url).toContain('destination=26.1542%2C85.8918');
    expect(url).toContain('destination_place_id=Gupta%20Store');
  });
});
