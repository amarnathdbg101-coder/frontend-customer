import { describe, it, expect } from 'vitest';
import { getImageUrl, extractFirstImage, extractAllImages, IMAGE_CDN_BASE } from './imageUrl';
import { API_BASE_URL } from '../api/client';

describe('Unified Image URL Resolver Tests', () => {
  it('returns empty string for null, undefined, or empty inputs', () => {
    expect(getImageUrl(null)).toBe('');
    expect(getImageUrl(undefined)).toBe('');
    expect(getImageUrl('')).toBe('');
    expect(getImageUrl('   ')).toBe('');
  });

  it('preserves local blob and data URLs without modification', () => {
    const blob = 'blob:http://localhost:5173/uuid-1234';
    const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    expect(getImageUrl(blob)).toBe(blob);
    expect(getImageUrl(dataUrl)).toBe(dataUrl);
  });

  it('correctly resolves relative paths starting with /images/', () => {
    const rel = '/images/products/shop-1/item.jpg';
    const resolved = getImageUrl(rel);
    expect(resolved).toBe(`${IMAGE_CDN_BASE}/products/shop-1/item.jpg`);
  });

  it('correctly resolves relative paths starting with images/ without leading slash', () => {
    const rel = 'images/shops/logo.png';
    const resolved = getImageUrl(rel);
    expect(resolved).toBe(`${IMAGE_CDN_BASE}/shops/logo.png`);
  });

  it('correctly resolves raw folder paths (products/..., shops/..., users/...)', () => {
    expect(getImageUrl('products/abc.jpg')).toBe(`${IMAGE_CDN_BASE}/products/abc.jpg`);
    expect(getImageUrl('/products/abc.jpg')).toBe(`${IMAGE_CDN_BASE}/products/abc.jpg`);
    expect(getImageUrl('shops/xyz.jpg')).toBe(`${IMAGE_CDN_BASE}/shops/xyz.jpg`);
    expect(getImageUrl('/shops/xyz.jpg')).toBe(`${IMAGE_CDN_BASE}/shops/xyz.jpg`);
    expect(getImageUrl('users/avatar.jpg')).toBe(`${IMAGE_CDN_BASE}/users/avatar.jpg`);
  });

  it('resolves raw Cloudflare R2 S3 storage endpoints to CDN base', () => {
    const r2Raw = 'https://934563c5b285241e206e60ae40d3082d.r2.cloudflarestorage.com/shopsilo/products/item1.jpg';
    expect(getImageUrl(r2Raw)).toBe(`${IMAGE_CDN_BASE}/products/item1.jpg`);
  });

  it('preserves external absolute https URLs (e.g. Google avatar, CDN)', () => {
    const external = 'https://lh3.googleusercontent.com/a/ACg8ocISomeAvatar';
    expect(getImageUrl(external)).toBe(external);
  });

  it('handles space-separated multiple images by picking the first valid image', () => {
    const multi = '/images/products/p1.jpg /images/products/p2.jpg';
    expect(getImageUrl(multi)).toBe(`${IMAGE_CDN_BASE}/products/p1.jpg`);
  });

  it('handles comma-separated multiple images by picking the first valid image', () => {
    const multi = '/images/products/p1.jpg, /images/products/p2.jpg';
    expect(getImageUrl(multi)).toBe(`${IMAGE_CDN_BASE}/products/p1.jpg`);
  });
});

describe('extractFirstImage Helper Tests', () => {
  it('extracts first item from string array', () => {
    expect(extractFirstImage(['/images/p1.jpg', '/images/p2.jpg'])).toBe('/images/p1.jpg');
    expect(extractFirstImage([])).toBe('');
  });

  it('extracts from JSON stringified array', () => {
    const jsonStr = '["/images/item1.jpg", "/images/item2.jpg"]';
    expect(extractFirstImage(jsonStr)).toBe('/images/item1.jpg');
  });

  it('extracts first image from space-separated list', () => {
    const spaceSeparated = '/images/products/1.jpg /images/products/2.jpg';
    expect(extractFirstImage(spaceSeparated)).toBe('/images/products/1.jpg');
  });

  it('extracts first image from comma-separated list', () => {
    const commaSeparated = '/images/products/1.jpg, /images/products/2.jpg';
    expect(extractFirstImage(commaSeparated)).toBe('/images/products/1.jpg');
  });

  it('returns clean single string as is', () => {
    expect(extractFirstImage('/images/products/solo.jpg')).toBe('/images/products/solo.jpg');
  });

  it('safely handles empty or invalid values', () => {
    expect(extractFirstImage(null)).toBe('');
    expect(extractFirstImage(undefined)).toBe('');
    expect(extractFirstImage('')).toBe('');
    expect(extractFirstImage('[]')).toBe('');
    expect(extractFirstImage('""')).toBe('');
  });
});

describe('extractAllImages Helper Tests', () => {
  it('extracts all items from an array', () => {
    const list = ['/images/1.jpg', '/images/2.jpg'];
    expect(extractAllImages(list)).toEqual(['/images/1.jpg', '/images/2.jpg']);
  });

  it('extracts all items from JSON stringified array', () => {
    const json = '["/images/1.jpg", "/images/2.jpg", "/images/3.jpg"]';
    expect(extractAllImages(json)).toEqual(['/images/1.jpg', '/images/2.jpg', '/images/3.jpg']);
  });

  it('extracts all items from comma-separated string', () => {
    const comma = '/images/1.jpg, /images/2.jpg';
    expect(extractAllImages(comma)).toEqual(['/images/1.jpg', '/images/2.jpg']);
  });

  it('extracts all items from space-separated string', () => {
    const space = '/images/1.jpg /images/2.jpg /images/3.jpg';
    expect(extractAllImages(space)).toEqual(['/images/1.jpg', '/images/2.jpg', '/images/3.jpg']);
  });

  it('returns single array item for plain string', () => {
    expect(extractAllImages('/images/single.jpg')).toEqual(['/images/single.jpg']);
  });

  it('returns empty array for empty inputs', () => {
    expect(extractAllImages(null)).toEqual([]);
    expect(extractAllImages(undefined)).toEqual([]);
    expect(extractAllImages('')).toEqual([]);
    expect(extractAllImages('[]')).toEqual([]);
  });
});
