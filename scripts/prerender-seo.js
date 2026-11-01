/**
 * Prerender & SEO Static Snapshot Generator for ShopSilo Customer Frontend
 * 
 * Runs after `vite build` to generate static prerendered HTML pages for key routes:
 * - / (Homepage)
 * - /explore (Explore Local Shops & Products)
 * - /deals (Today's Flash Deals & Bargains)
 * - /khata (Digital Khata Ledger & Passbook)
 * 
 * Ensures search engine crawlers (Googlebot, Bingbot) and social bots (WhatsApp,
 * Facebook, Twitter/X, Telegram) receive fully rendered semantic HTML, headings,
 * structured JSON-LD data, and OpenGraph tags even without executing JavaScript.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const templatePath = path.join(distDir, 'index.html');

if (!fs.existsSync(templatePath)) {
  console.error('[SEO Prerender] dist/index.html does not exist. Run vite build first.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(templatePath, 'utf8');

const ROUTES = [
  {
    path: 'explore',
    title: 'Explore Neighborhood Shops & Live Inventory | ShopSilo',
    description: 'Find verified grocery, electronics, and daily retail stores near you. Browse live in-stock catalogs, compare local prices, and reserve 15-minute counter pickups.',
    url: 'https://shopsilo.in/explore',
    heading: 'Explore Neighborhood Retail Stores & Products',
    bodyContent: `
      <main style="max-width: 1200px; margin: 0 auto; padding: 24px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <header style="margin-bottom: 24px;">
          <h1 style="font-size: 1.8rem; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Explore Neighborhood Retail Stores & Live In-Stock Catalogs</h1>
          <p style="color: #475569; font-size: 1rem; line-height: 1.5;">Browse live inventory from verified local grocery, pharmacy, electronics, and daily retail shops within 1km to 10km. Compare prices across stores and reserve items for instant counter pickup.</p>
        </header>
        <section aria-label="Available Product Categories" style="margin-bottom: 28px;">
          <h2 style="font-size: 1.2rem; font-weight: 700; color: #1e293b; margin-bottom: 12px;">Popular Categories</h2>
          <ul style="display: flex; flex-wrap: wrap; gap: 10px; list-style: none; padding: 0;">
            <li style="padding: 8px 14px; background: #f1f5f9; border-radius: 8px; font-weight: 600;">Grocery & Staples (किराना)</li>
            <li style="padding: 8px 14px; background: #f1f5f9; border-radius: 8px; font-weight: 600;">Dairy, Bread & Eggs (डेयरी)</li>
            <li style="padding: 8px 14px; background: #f1f5f9; border-radius: 8px; font-weight: 600;">Snacks & Beverages (नमकीन व चाय)</li>
            <li style="padding: 8px 14px; background: #f1f5f9; border-radius: 8px; font-weight: 600;">Personal Care & Hygiene (साबुन व शैम्पू)</li>
            <li style="padding: 8px 14px; background: #f1f5f9; border-radius: 8px; font-weight: 600;">Household Cleaning & Essentials</li>
          </ul>
        </section>
        <section aria-label="Platform Advantages">
          <h2 style="font-size: 1.2rem; font-weight: 700; color: #1e293b; margin-bottom: 8px;">Why Choose ShopSilo?</h2>
          <p style="color: #64748b; font-size: 0.95rem; line-height: 1.6;">Unlike distant warehouses, ShopSilo connects you directly to physical retail stores right in your neighborhood. Get exact item availability, zero counterfeit risk, direct WhatsApp communication with store owners, and guaranteed instant 15-minute pickup.</p>
        </section>
      </main>
    `,
  },
  {
    path: 'deals',
    title: "Today's Best Local Market Deals & Discount Offers | ShopSilo",
    description: 'Exclusive daily flash bargains, bundle discounts, and clearance offers from verified neighborhood stores in your area. Save more on daily groceries.',
    url: 'https://shopsilo.in/deals',
    heading: "Today's Top Neighborhood Store Deals & Bargains",
    bodyContent: `
      <main style="max-width: 1200px; margin: 0 auto; padding: 24px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <header style="margin-bottom: 24px;">
          <h1 style="font-size: 1.8rem; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Today's Exclusive Local Market Deals & Bargains</h1>
          <p style="color: #475569; font-size: 1rem; line-height: 1.5;">Save up to 40% on daily groceries, staples, snacks, and home essentials with verified daily promotions from local neighborhood shopkeepers.</p>
        </header>
        <section aria-label="Daily Offers">
          <h2 style="font-size: 1.2rem; font-weight: 700; color: #1e293b; margin-bottom: 12px;">Featured Store Offers</h2>
          <p style="color: #64748b; font-size: 0.95rem; line-height: 1.6;">Browse active coupon codes, flat-rate discounts, and minimum order savings published in real-time by nearby retailers.</p>
        </section>
      </main>
    `,
  },
  {
    path: 'khata',
    title: 'Digital Customer Khata Ledger & Udhar Passbook | ShopSilo',
    description: 'Check your store credit balance, view itemized digital parchis, verify your local customer trust score, and pay pending bills online via UPI.',
    url: 'https://shopsilo.in/khata',
    heading: 'Digital Customer Khata & Udhar Passbook',
    bodyContent: `
      <main style="max-width: 1200px; margin: 0 auto; padding: 24px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <header style="margin-bottom: 24px;">
          <h1 style="font-size: 1.8rem; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Digital Customer Khata Ledger & Transparent Udhar Passbook</h1>
          <p style="color: #475569; font-size: 1rem; line-height: 1.5;">Manage your trusted store credit with 100% transparency. View every purchased item receipt, track payment history, build your neighborhood trust score, and clear dues with 1-click UPI payments.</p>
        </header>
      </main>
    `,
  },
];

console.log('[SEO Prerender] Starting static HTML snapshot generation for public routes...');

ROUTES.forEach((route) => {
  let html = baseHtml;

  // Replace Title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${route.title}</title>`);

  // Replace Description
  html = html.replace(
    /<meta name="description" content=".*?" \/>/i,
    `<meta name="description" content="${route.description}" />`
  );

  // Replace Canonical Link
  html = html.replace(
    /<link rel="canonical" href=".*?" \/>/i,
    `<link rel="canonical" href="${route.url}" />`
  );

  // Replace OpenGraph Tags
  html = html.replace(
    /<meta property="og:title" content=".*?" \/>/i,
    `<meta property="og:title" content="${route.title}" />`
  );
  html = html.replace(
    /<meta property="og:description" content=".*?" \/>/i,
    `<meta property="og:description" content="${route.description}" />`
  );
  html = html.replace(
    /<meta property="og:url" content=".*?" \/>/i,
    `<meta property="og:url" content="${route.url}" />`
  );

  // Replace Twitter Tags
  html = html.replace(
    /<meta name="twitter:title" content=".*?" \/>/i,
    `<meta name="twitter:title" content="${route.title}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content=".*?" \/>/i,
    `<meta name="twitter:description" content="${route.description}" />`
  );

  // Inject semantic HTML body content into <div id="root"></div> for non-JS crawlers
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${route.bodyContent}</div>`
  );

  const routeDir = path.join(distDir, route.path);
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }

  const outputPath = path.join(routeDir, 'index.html');
  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`[SEO Prerender] ✓ Pre-rendered ${route.url} -> dist/${route.path}/index.html`);
});

// Also create 200.html and 404.html for SPA hostings (Cloudflare, Netlify, Nginx)
fs.copyFileSync(templatePath, path.join(distDir, '200.html'));
fs.copyFileSync(templatePath, path.join(distDir, '404.html'));
console.log('[SEO Prerender] ✓ Created dist/200.html & dist/404.html SPA fallbacks');

// Ensure internal stats report is purged from production distribution
const distStats = path.join(distDir, 'stats.html');
if (fs.existsSync(distStats)) {
  fs.unlinkSync(distStats);
  console.log('[SEO Prerender] ✓ Purged internal bundle visualizer report (dist/stats.html)');
}

console.log('[SEO Prerender] Completed successfully.');

