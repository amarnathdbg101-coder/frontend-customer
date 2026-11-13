# ShopSilo Customer Side — UI/UX & Presentation Audit

**Audit date:** 12 November 2026  
**Scope:** Customer-facing routes, shared navigation/layout, product and shop cards, storefront/product detail, deals, saved items, reservations, Khata, profile, authentication, cart/checkout, responsive styles, language/theme support.

## Executive summary

Customer frontend mein feature coverage strong hai: nearby discovery, search, price comparison, shop profiles, live inventory, saved items, coupon/cart, pickup reservations, reviews, bilingual UI, dark theme aur mobile/desktop navigation already maujood hain. Core opportunity aur features add karna nahi, balki presentation ko zyada **clear, trustworthy aur focused** banana hai.

Abhi experience ka strongest customer promise — “paas ki dukaan se sahi product dhoondho, stock/price samjho, phir pickup reserve karo” — multiple controls, explanations aur mixed promises ke beech dilute ho sakta hai. Sabse pehle trust signals ko real data se bind karein, first screen par shopping ko primary banayein, aur pickup language/design ko consistent karein.

## Jo pehle se achha hai

- **Mobile-first structure:** compact mobile shell, fixed bottom navigation, responsive product/shop grids aur desktop navigation alag se defined hain.
- **Useful discovery tools:** location, autocomplete, recent/voice search, category browse, radius/open-now/price filters, curated aisles aur compare flow.
- **Local-shop context:** shop profile mein identity, status, distance, rating, reviews, directions/contact aur pickup actions ke liye building blocks hain.
- **End-to-end shopping support:** product detail, saved list, coupons, cart, reservation confirmation/QR aur reservation tracking available hain.
- **States aur accessibility ki buniyad:** skeletons/empty states, page-level route splitting, kuch ARIA labels, keyboard handling aur theme/language contexts maujood hain.
- **Hindi aur English dono:** fonts/localization support hai; Hindi rendering local browser preview mein readable thi.

## Priority findings

| Priority | Finding | Customer impact | Recommended direction |
|---|---|---|---|
| **P0 — Trust** | Product cards missing data par made-up certainty dikha sakte hain: fallback stock `10`, verified `true`, “Gupta Store” aur “450m away” (see `ProductCard.jsx`). Related catalog components mein bhi stock fallback `1` milta hai. | Galat availability, verification ya distance customer ka trust tod sakte hain—especially jab ShopSilo live inventory ko core promise banata hai. | Unknown ko unknown dikhayein: “Stock confirm karein”, “Distance unavailable” ya badge hide karein. Verified/open/price/stock badges sirf explicit, current data par dikhayein. |
| **P1 — First impression** | Home search field mein voice, compare aur submit actions ek saath hain; uske turant baad “How ShopSilo Works” guide aur result controls aate hain (`ExploreShopsScreen.jsx`, `SearchHeroSection.jsx`). | User ko pehle hi viewport mein bahut saare choices milte hain aur product discovery secondary lag sakti hai. | Search/location ko hero banayein. Primary action “Search”; “Compare” ko secondary link/button. Guide ko chhota, dismissible ya first-visit-only rakhein. Product/shop feed ko guide se pehle surface karein. |
| **P1 — Empty/error state** | Local render mein product/shop API calls `500` hue aur home ne “No Products Found” dikhaya. UI is state ko no-match aur service failure se alag nahi karti. | User samajh sakta hai ki area mein products hi nahi hain, jabki data load fail ho sakta hai. | `No results`, `Location permission/coverage`, `Network/server error` ke alag states dein; retry aur location/search/filter reset actions visible rakhein. |
| **P1 — Promise consistency** | Pickup copy alag-alag jagah 10-second, 15-minute aur 30-minute claims karti hai (product detail, storefront SEO, checkout/cart). | Customer ko reservation ka matlab aur pickup timing unclear ho sakti hai; marketing promise aur actual process mismatch ho sakta hai. | Ek approved, operationally accurate promise use karein. “Reservation hold duration”, “ready-by estimate” aur counter handover time ko alag terms mein samjhayen. |
| **P1 — Cart presentation** | `App.jsx` global `FloatingCartBar` render karta hai aur `AppLayout.jsx` bhi cart items par apna floating bar dikhata hai. Dono same bottom position use karte hain. | Cart mein items hon to floating controls overlap/duplicate ho sakte hain; cart action ka polish girta hai. | Ek hi shared cart CTA rakhein, safe-area/bottom-nav offset centrally manage karein, aur quantity + payable total consistently dikhayein. |
| **P1 — Navigation hierarchy** | Mobile bottom nav mein Explore, Deals, Khata, Saved aur Profile hain; Reservations alag tab nahi hai. Desktop mein Reservations prominent hai. | Purchase ke baad pickup status dhoondhna mushkil ho sakta hai; Khata (credit ledger) aur core shopping destinations ek level par compete karte hain. | Customer ke top tasks ke hisaab se mobile nav ko validate karein. “Pickups/Orders” ko direct pahunch dein; Deals ko Explore ke andar section/link banane par vichar karein. Khata ko tabhi top-level rakhein jab usage uski priority justify kare. |
| **P2 — Visual consistency** | Design tokens hain, par cards/screens mein inline hard-coded colors, gradients, radii aur shadows bhi bahut hain; dark theme ke saath kuch surfaces/text mismatch ka risk hai. | App ek hi brand system ke bajay mixed visual patterns jaisa lag sakta hai. | Primary indigo, action green, neutrals, semantic colors, type scale, spacing aur elevation ke tokens define karke inline one-off colors ko dheere-dheere replace karein. |
| **P2 — Mobile card density** | Product grid mobile par 2 columns hai; card mein square image, stock, title, price/savings, shop/distance aur multiple actions hain (`cards.css`, `ProductCard.jsx`). | Chhote screens par card cramped ho sakta hai aur image/price/primary action ka emphasis kam ho sakta hai. | Card ko “image → product + price → nearby shop/availability → one clear CTA” tak simplify karein. Compare/save jaise secondary actions ko icon/secondary affordance banayein; full detail screen par extra information rakhein. |
| **P2 — Touch/accessibility polish** | Shared design token 44px minimum touch size define karta hai, lekin kuch compact card/header controls isse chhote hain; focus styling har control mein equally obvious nahi hai. | Small-screen users aur keyboard/switch users ke liye tap/focus less reliable ho sakta hai. | Interactive targets ko 44×44px ke aas-paas rakhein, focus-visible state har control par consistent karein, aur Hindi/English + dark/light combinations mein contrast check karein. |

## Screen-by-screen presentation direction

### 1. Explore / Home (`/`)

- Top area ka order rakhein: **location → search → useful categories/shortcuts → nearby results**.
- Search placeholder ko user intent par focus karein, jaise “Kya dhoondh rahe hain?”; voice search optional rahe.
- Search ke neeche current location/radius ko short, editable chip ke roop mein dikhayein; location unavailable ho to manual selection clear ho.
- “Search / Compare / Reserve” guide ko feed se pehle persistent banner na banayein. First-time onboarding ya ek-line explanation ke roop mein use karein.
- Feed ko meaningful groups mein dikhayein: “Aapke paas”, “Khuli hui dukaanen”, “Popular categories”, phir “Sab products/shops”. Empty results par reset/retry action dein.

### 2. Product cards, product detail aur storefront

- Card par sabse pehle readable product image, naam, price aur stock certainty; phir shop identity + distance. Ek primary CTA ko sab cards par consistent rakhein.
- Product detail par photo, current price, selected shop, stock freshness/availability aur “Reserve for pickup” ko clear hierarchy dein. Similar items/compare secondary section ho.
- Storefront mein cover/logo ke baad shop name, verified status (only if verified), open/closed state, address/distance aur primary contact/directions actions dikhayein; aisles aur full grid ke beech switching obvious ho.
- Review count, inventory freshness aur “verified” ka matlab real/traceable data se support ho; sample/default values customer ko real signals jaise na dikhayein.

### 3. Deals, saved, cart, reservations

- Deal card par benefit, eligibility/expiry, shop aur distance ko scan-friendly order mein dikhayein; claim hone par cart mein applied status visible rakhein.
- Saved screen mein items/shops ka tab pattern theek hai; zero-state mein relevant “Explore products” / “Find shops” action rakhein.
- Cart/checkout mein total, coupon savings, store identity, pickup timing/hold policy aur login requirement checkout shuru karne se pehle samajh aaye.
- Reservation confirmation ke baad token/QR ke saath shop address, directions, current status aur pickup instructions ko sabse prominent banayein; “Pickups” tak one-tap return dein.

### 4. Khata, profile, login/register

- Khata financial/credit task hai; is page par balance, recent transactions aur due/action state ko clear summaries mein dikhayein. Payment/dispute options ko transaction context ke andar rakhein.
- Profile ko account settings ka hub banayein: personal details, language/theme, addresses, help/privacy aur sign-out ko predictable sections dein.
- Login/register par field labels, keyboard types, password help, error recovery aur Google sign-in ko visual order mein consistent rakhein; customer sign-in aur merchant portal ka distinction clear rahe.

## Suggested visual direction

**Brand feel:** “modern local marketplace” — warm, helpful aur dependable; sirf generic quick-commerce clone nahi. Existing indigo brand ko stable base banayein, green ko success/availability/savings ke semantic use tak limit karein, aur background ko calm neutral rakhein.

**Hierarchy:** har screen par ek main task aur ek primary CTA. Product ke liye price/availability; shop ke liye status/location; reservation ke liye pickup code/status ko sabse pehle scan karna chahiye.

**Imagery:** real product/shop photography ko priority dein. Missing image ke liye neutral branded placeholder use karein; fabricated store/product labels ya location values se gap fill na karein.

**Motion:** add-to-cart, save, loading aur reservation confirmation par short feedback; decorative animation ko kam rakhein. Reduced-motion preference ko support karein.

**Language:** Hindi aur English dono mein labels, dates, currency aur pickup terminology ka ek glossary rakhein. Ek hi screen par formal Hindi, English labels aur Hinglish ka accidental mix na ho.

## Recommended implementation order

1. **Trust/data correctness:** default/fallback inventory, verification, shop name aur distance signals ko audit karke unknown state banayein.
2. **Customer journey clarity:** pickup claims unify karein; cart CTA duplication hataayein; mobile navigation mein pickup access improve karein.
3. **Home-page hierarchy:** first viewport ko search + location + product/shop discovery ke around simplify karein; empty/error states separate karein.
4. **Design-system cleanup:** tokens, card/button patterns, dark mode aur touch/focus states standardize karein.
5. **Visual QA:** populated data ke saath 360/390px mobile, 768px tablet, 1280px+ desktop; Hindi/English; dark/light; loading/empty/error; cart and reservation flows test karein.

## Review basis and limitation

Source review mein customer routes (`App.jsx`), shared shell/navigation, Explore, Deals, Saved, Storefront, Product Detail, Reservations, Khata, Profile, Login/Register, cart/checkout aur responsive/token styles cover kiye gaye. Local browser preview 778×480 par open hua; location/search shell aur empty state render hue, horizontal overflow nahi dikha. Usi run mein product/shop API requests `500` return hue, isliye real catalog data ke saath product/shop card presentation aur reservation end-to-end ko visually verify nahi kiya ja saka. Report code evidence aur available local render par aadharit hai; populated backend ke saath final visual QA abhi baaki hai.

## Key files reviewed

- `src/App.jsx`
- `src/pages/customer/ExploreShopsScreen.jsx`
- `src/pages/customer/StorefrontScreen.jsx`
- `src/pages/customer/ProductDetailScreen.jsx`
- `src/pages/customer/DealsScreen.jsx`
- `src/pages/customer/SavedScreen.jsx`
- `src/pages/customer/ReservationsScreen.jsx`
- `src/pages/customer/CustomerKhataScreen.jsx`
- `src/pages/customer/CustomerProfileScreen.jsx`
- `src/pages/auth/LoginScreen.jsx`, `src/pages/auth/RegisterScreen.jsx`
- `src/components/cards/ProductCard.jsx`, `src/components/cards/ShopCard.jsx`
- `src/components/layout/AppLayout.jsx`, `src/components/layout/BottomNav.jsx`, `src/components/layout/DesktopNavbar.jsx`
- `src/components/cart/FloatingCartBar.jsx`, `src/components/cart/CartDrawer.jsx`, `src/components/cart/CheckoutModal.jsx`
- `src/styles/variables.css`, `src/styles/mobile.css`, `src/styles/cards.css`
