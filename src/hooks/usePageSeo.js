/**
 * usePageSeo Hook
 * 
 * Dynamic client-side SEO & Open Graph meta tag manager.
 * Keeps browser document.title, canonical links, social meta tags (og:*, twitter:*),
 * and Schema.org JSON-LD structured data dynamically synced during SPA navigations.
 */

import { useEffect } from 'react';

const DEFAULT_TITLE = 'ShopSilo - Hyperlocal Retail Marketplace & Smart Dukan OS';
const DEFAULT_DESCRIPTION = 'ShopSilo connects customers with verified neighborhood retail stores for real-time inventory discovery, bargain offers, and instant 30-minute counter pickup.';
const DEFAULT_IMAGE = 'https://shopsilo.in/og-image.png';
const BASE_URL = 'https://shopsilo.in';

export function usePageSeo({
  title,
  description,
  image,
  url,
  type = 'website',
  jsonLd,
}) {
  useEffect(() => {
    // 1. Title
    const fullTitle = title ? `${title} | ShopSilo` : DEFAULT_TITLE;
    document.title = fullTitle;

    // Helper to update or create a meta tag
    const setMetaTag = (attribute, attributeValue, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attribute}="${attributeValue}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attribute, attributeValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Helper to update or create link tag
    const setLinkTag = (rel, href) => {
      if (!href) return;
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    const finalDesc = description || DEFAULT_DESCRIPTION;
    const finalImage = image || DEFAULT_IMAGE;
    const finalUrl = url ? (url.startsWith('http') ? url : `${BASE_URL}${url}`) : window.location.href;

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', finalDesc);

    // 3. OpenGraph Social Tags
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', finalDesc);
    setMetaTag('property', 'og:image', finalImage);
    setMetaTag('property', 'og:url', finalUrl);
    setMetaTag('property', 'og:site_name', 'ShopSilo');

    // 4. Twitter Cards
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', finalDesc);
    setMetaTag('name', 'twitter:image', finalImage);

    // 5. Canonical Link
    setLinkTag('canonical', finalUrl);

    // 6. Optional Schema.org JSON-LD Structured Data Injection
    let scriptTag = null;
    if (jsonLd) {
      const scriptId = 'dynamic-route-jsonld';
      scriptTag = document.getElementById(scriptId);
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(jsonLd);
    }

    // Cleanup on unmount / route change: Restore default title
    return () => {
      document.title = DEFAULT_TITLE;
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.removeChild(scriptTag);
      }
    };
  }, [title, description, image, url, type, jsonLd]);
}

export default usePageSeo;

