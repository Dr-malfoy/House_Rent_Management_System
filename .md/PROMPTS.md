# Web-Based Smart House Rent Management System — Build Prompts (v2)

> Course: CSE0613310 Software Engineering — Uttara University, Dept. of CSE
> Use these prompts **in order** with an AI coding assistant. Every prompt relies on the shared requirements in Section 0 and Section 1.

**What changed in v2**
- The database now lives **inside the backend folder** (`backend/database/`). Only **two** top-level folders: `frontend/` and `backend/`.
- New design system: brand colors **#FCFCF5** and **#57BA29**, **light mode + dark mode**, **boxy UI**, **smooth animated scrolling**, and **animated card transitions**.

---

## 0. Master Context (paste this at the start of every session)

```
You are a senior full-stack engineer and UI designer. Build a "Web-Based Smart House Rent Management System".

PROBLEM
Traditional house-rent search uses vague text addresses ("near yellow building"), causing search and mapping friction. Our system replaces this with precise latitude/longitude storage and radius-based proximity search (500 m / 1000 m).

PROJECT LAYOUT (exactly TWO top-level folders — database lives inside backend)
smart-house-rent/
├── frontend/              -> Next.js (React) app
└── backend/               -> Node.js + Express.js REST API
    └── database/          -> MySQL 8.0+ schema, spatial index, seed scripts, migration runner

TECH STACK (unified JavaScript / SQL)
- Frontend: Next.js (App Router, SSG + ISR), React, Tailwind CSS, react-leaflet + Leaflet.js, next-themes (light/dark), Framer Motion (animations), Lenis (smooth scrolling)
- Backend: Node.js, Express.js, mysql2, JWT auth, bcrypt, express-validator, cors, helmet, morgan, express-rate-limit, multer, dotenv, axios
- Database: MySQL 8.0+ with POINT column, SPATIAL INDEX, ST_Distance_Sphere
- Geocoding: Nominatim (OpenStreetMap) via a backend middleware (valid User-Agent header, max 1 request/second, caching)

USER ROLES (role-based access control)
1. Tenant  2. Landlord  3. Admin — each with a secure, role-specific dashboard.

IN SCOPE
- Frontend: split-screen search view, budget-based listing filters, interactive property map
- Backend: RESTful API services, Nominatim geocoding middleware
- Database (inside backend/database): relational user profiles, rental billing ledgers, spatial point storage

OUT OF SCOPE (do NOT build)
- Native mobile apps, digital online payments, live chat

NON-FUNCTIONAL REQUIREMENTS
- Fast listing loads using Next.js SSG / Incremental Static Regeneration (ISR)
- Sub-second proximity search using MySQL spatial index
- Leaflet map and listing panel stay in sync; the map/list split uses ~70% of the viewport
- Secure: hashed passwords, JWT, role checks on every protected route, input validation, parameterized SQL only
- Clean, commented, modular code; environment variables for all secrets; README in each folder
- API is client-agnostic and versioned (/api/v1) so mobile apps can be added later

DESIGN SYSTEM (applies to every screen — see Section 2 for full details)
- Brand colors: #FCFCF5 (cream background) and #57BA29 (green primary)
- Light mode AND dark mode with a toggle (persisted, respects system preference)
- "Boxy" UI: square/near-square corners, visible borders, hard offset shadows, grid-based box layouts
- Smooth, animated scrolling and animated card transitions throughout

Work step by step, keep frontend and backend strictly separated, and never put backend code in frontend or vice versa.
```

---

## 1. Requirements Checklist (the AI must satisfy ALL of these)

### 1.1 Functional Requirements

**Public / Tenant**
- [ ] Register, login, logout, edit profile
- [ ] Browse listings on a **split-screen** page: listing cards plus an interactive Leaflet map (map/list area ≈ 70% of viewport, kept in sync)
- [ ] Hovering/clicking a card highlights its map marker; clicking a marker scrolls to and highlights its card
- [ ] **Radius search**: center = current location, typed address/landmark (Nominatim), or dropped map pin; radius **500 m** or **1000 m** only
- [ ] Results sorted by distance (nearest first), distance shown on each card
- [ ] **Budget filter** (min/max rent), plus bedrooms, bathrooms, property type
- [ ] Listing detail page with photos, rent, address, map pin, landlord contact info
- [ ] Save / favorite listings; send rental inquiry to landlord
- [ ] View own rental agreement and billing ledger (due/paid status, recorded manually — no online payment)

**Landlord**
- [ ] Dashboard with own properties, inquiries, tenants, billing ledger
- [ ] Create / edit / delete / publish / unpublish listings
- [ ] **Pin dropping** on a Leaflet map to set exact location (no manual numeric lat/long typing); address -> coordinates via Nominatim; stored as MySQL `POINT`
- [ ] Upload property images
- [ ] Assign a tenant to a property (rental agreement: start/end date, monthly rent, deposit)
- [ ] Generate monthly billing entries (rent, utilities, other charges) and mark paid/unpaid manually
- [ ] Manage tenant inquiries

**Admin**
- [ ] Dashboard with system statistics
- [ ] Manage users (view, activate/deactivate/ban, change role)
- [ ] Approve / reject / remove listings
- [ ] View all billing ledgers (audit)
- [ ] Manage property types and amenities

### 1.2 Non-Functional Requirements
- [ ] Next.js SSG/ISR for home and listing detail pages (`revalidate`), client-side fetch for radius search
- [ ] `listings.location` is `POINT NOT NULL SRID 4326` with a `SPATIAL INDEX`
- [ ] Proximity query uses a bounding-box prefilter + `ST_Distance_Sphere`; target < 1 second
- [ ] Nominatim middleware with caching, 1 req/sec throttle, proper `User-Agent`
- [ ] Responsive UI (desktop split-screen, mobile stacked with map/list toggle)
- [ ] RBAC middleware: `authenticate`, `authorize('tenant'|'landlord'|'admin')`
- [ ] Centralized error handling, consistent JSON format, Helmet, CORS, rate limiting on auth routes

### 1.3 UI / Design Requirements
- [ ] Colors #FCFCF5 and #57BA29 used as the brand palette (tokens in Section 2)
- [ ] Light mode and dark mode, toggle in navbar, saved in localStorage, defaults to system preference, no flash on load
- [ ] Boxy UI on every component (cards, buttons, inputs, modals, tables, badges, map container)
- [ ] Smooth animated scrolling (Lenis) on all pages
- [ ] Animated card transitions: staggered entrance on scroll, hover lift, list reorder/filter animation, card -> detail shared transition, page transitions
- [ ] Respect `prefers-reduced-motion`
- [ ] Leaflet map tiles/popups restyled to match light and dark themes
- [ ] WCAG AA text contrast in both modes

---

## 2. Design System Specification (include with every frontend prompt)

```
COLOR TOKENS (define as CSS variables and map them in tailwind.config)

LIGHT MODE
--bg:            #FCFCF5   (page background, cream)
--surface:       #FFFFFF   (cards, inputs)
--surface-alt:   #F3F3E7   (subtle boxes, table stripes)
--primary:       #57BA29   (buttons, active states, markers, links)
--primary-hover: #479E1F
--primary-soft:  #E6F5DD   (badges, highlights)
--on-primary:    #0F1A09   (text on green buttons — verify contrast)
--text:          #1A1D14
--text-muted:    #5C6152
--border:        #1A1D14   (strong boxy borders, 2px)
--border-soft:   #D9DAC8
--shadow-box:    4px 4px 0 0 #1A1D14   (hard offset shadow)
--danger: #D6403A   --warning: #E0A100   --success: #57BA29

DARK MODE
--bg:            #11140D
--surface:       #1A1E14
--surface-alt:   #232819
--primary:       #57BA29   (same brand green)
--primary-hover: #6FD140
--primary-soft:  #223318
--on-primary:    #0F1A09
--text:          #FCFCF5   (cream reused as text color)
--text-muted:    #A9AE9A
--border:        #FCFCF5   (or #57BA29 for accent boxes), 2px
--border-soft:   #343A28
--shadow-box:    4px 4px 0 0 #57BA29
--danger: #FF6B64   --warning: #F2BD2E   --success: #57BA29

THEMING
- Use next-themes with attribute="data-theme" (or class), defaultTheme="system", enableSystem, disableTransitionOnChange off for a smooth color crossfade (200-300 ms transition on background/color/border).
- Theme toggle button (sun/moon icon) in the navbar and in dashboard headers.

BOXY STYLE RULES
- border-radius: 0 (max 4px) on EVERYTHING: cards, buttons, inputs, selects, badges, modals, images, map container, toasts.
- 2px solid borders using --border; hard offset shadow (--shadow-box), no blurry soft shadows.
- Grid-based layouts made of visible boxes (bento/grid style); consistent 8px spacing scale.
- Buttons: solid #57BA29 with border and offset shadow; on hover the shadow shrinks and the button translates (translate(2px,2px)) to feel "pressed"; on active shadow = 0.
- Typography: one bold geometric/grotesk sans for headings (e.g. "Space Grotesk" or "Sora") and a clean sans for body (e.g. "Inter"); UPPERCASE small labels for box titles.
- Icons: lucide-react, 2px stroke, square caps.
- Tables and forms are also boxed with clear cell borders.

ANIMATION RULES (Framer Motion + Lenis)
- Smooth scrolling: initialize Lenis in a client component provider (lerp ~0.1, smoothWheel true); sync with Framer Motion's useScroll; disable on prefers-reduced-motion; make sure the Leaflet map and the scrollable listing panel still scroll/zoom correctly (use data-lenis-prevent on those containers).
- Scroll progress bar (3px, #57BA29) fixed at the top of the page.
- Card entrance: fade + translateY(24px -> 0) with staggerChildren (0.06 s) when the card enters the viewport (whileInView, once: true).
- Card hover: translate(-3px,-3px) and shadow grows from 4px to 7px; image inside scales 1.05 smoothly.
- Filter/search changes: use AnimatePresence + layout animation so cards smoothly reorder, fade out and fade in (mode="popLayout").
- Card -> detail transition: shared layout animation (layoutId on the cover image and title) or a smooth expand/fade page transition between /search and /listings/[id].
- Page transitions: short fade/slide (250 ms) between routes via a template.js wrapper.
- Map marker <-> card sync: pulsing ring on the active marker, card gets a #57BA29 border + shifted shadow when active.
- Skeleton loaders: boxy shimmer blocks.
- Dashboard stat boxes: count-up number animation on enter.
- Easing: cubic-bezier(0.22, 1, 0.36, 1); durations 200-500 ms.
```

---

## 3. Prompt 1 — Database (inside `backend/database/`)

```
Create the database layer INSIDE the backend folder at backend/database/ (there is NO separate top-level database folder). Use MySQL 8.0+.

Deliver:
1. backend/database/schema.sql — creates database `smart_house_rent` (utf8mb4) and these tables with proper PKs, FKs, ENUMs, indexes, timestamps:

   - users (id, full_name, email UNIQUE, password_hash, phone, role ENUM('tenant','landlord','admin'), status ENUM('active','inactive','banned') DEFAULT 'active', created_at, updated_at)
   - user_profiles (id, user_id FK UNIQUE, address_text, nid_number, profile_photo_url, bio, occupation)
   - property_types (id, name UNIQUE)  -- Apartment, Room, Sublet, House, Studio
   - amenities (id, name UNIQUE)
   - listings (
       id, landlord_id FK users, property_type_id FK,
       title, description, address_text, area_name, city,
       location POINT NOT NULL SRID 4326,   -- spatial point storage
       rent_amount DECIMAL(10,2), security_deposit DECIMAL(10,2),
       bedrooms INT, bathrooms INT, size_sqft INT,
       status ENUM('pending','approved','rejected','rented','unpublished') DEFAULT 'pending',
       created_at, updated_at,
       SPATIAL INDEX idx_listings_location (location),
       INDEX on (status, rent_amount), INDEX on landlord_id
     )
   - listing_images (id, listing_id FK ON DELETE CASCADE, image_url, is_cover BOOL)
   - listing_amenities (listing_id FK, amenity_id FK, PRIMARY KEY(listing_id, amenity_id))
   - favorites (id, tenant_id FK, listing_id FK, UNIQUE(tenant_id, listing_id))
   - inquiries (id, listing_id FK, tenant_id FK, message, status ENUM('new','read','replied','closed'), created_at)
   - rental_agreements (id, listing_id FK, tenant_id FK, landlord_id FK, start_date, end_date, monthly_rent, deposit_amount, status ENUM('active','ended','terminated'), created_at)
   - billing_ledger (
       id, agreement_id FK, billing_month DATE, rent_amount, utility_amount DEFAULT 0, other_charges DEFAULT 0,
       total_amount, due_date,
       payment_status ENUM('unpaid','paid','partial','overdue') DEFAULT 'unpaid',
       paid_amount DEFAULT 0, paid_on DATE NULL,
       payment_method ENUM('cash','bank_transfer','mobile_banking','other') NULL,
       note, created_at,
       UNIQUE(agreement_id, billing_month)
     )   -- manual recording only; NO online payment gateway
   - geocode_cache (id, query_text UNIQUE, latitude, longitude, display_name, created_at)

2. backend/database/spatial_queries.sql — documented examples:
   - Insert a listing with ST_SRID(POINT(...), 4326) — document the axis order for SRID 4326 and use it consistently in backend code
   - Radius search for 500 m and 1000 m: bounding-box prefilter (MBRContains on a computed envelope) + ST_Distance_Sphere(location, center) <= radius, ORDER BY distance ASC
   - Combined radius + budget filter query
   - EXPLAIN examples proving the spatial index is used

3. backend/database/seed.sql — realistic Dhaka sample data: 1 admin, 3 landlords, 5 tenants (bcrypt hash placeholders noted), 20+ listings around Dhaka with real-looking coordinates, images, amenities, a few agreements and billing rows.

4. backend/database/migrate.js — Node script (uses mysql2 + dotenv from backend/.env) with npm scripts `db:setup` (run schema.sql) and `db:seed` (run seed.sql) so setup is one command: `npm run db:setup && npm run db:seed`.

5. backend/database/README.md — manual run steps (mysql -u root -p < backend/database/schema.sql), ER overview in text, SRID/axis-order notes.

Ensure scripts are idempotent (DROP TABLE IF EXISTS in correct FK order or CREATE IF NOT EXISTS).
```

---

## 4. Prompt 2 — Backend (Node.js + Express.js)

```
Create the /backend folder: a Node.js + Express.js REST API for the Smart House Rent system using MySQL (mysql2/promise pool). The database scripts from Prompt 1 live in backend/database/. Do not touch /frontend.

STRUCTURE
backend/
├── package.json (scripts: start, dev with nodemon, db:setup, db:seed), .env.example, README.md
├── server.js
├── database/            (schema.sql, spatial_queries.sql, seed.sql, migrate.js, README.md)
├── uploads/             (listing images, served statically)
└── src/
    ├── config/          (db.js pool, env.js)
    ├── routes/          (auth, users, listings, search, inquiries, favorites, agreements, billing, admin, geocode)
    ├── controllers/
    ├── services/        (nominatim.service.js, spatial.service.js)
    ├── middleware/      (auth.js, authorize.js, validate.js, errorHandler.js, rateLimiter.js, geocode.middleware.js, upload.js)
    └── utils/           (response helper, distance helpers)

GLOBAL
- Base path /api/v1, JSON only, consistent response: { success, message, data, errors }
- helmet, cors (allow frontend origin from env), express-rate-limit (stricter on /auth), morgan logging
- Parameterized SQL only; input validation with express-validator; centralized error handler
- bcrypt password hashing; JWT access tokens (payload: id, role)
- Env vars: PORT, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, JWT_EXPIRES_IN, FRONTEND_URL, NOMINATIM_BASE_URL, NOMINATIM_USER_AGENT

MIDDLEWARE
- authenticate (verify JWT), authorize(...roles) for RBAC
- geocode.middleware: if a request has an address/landmark string but no coordinates, call Nominatim and attach lat/lng to req.geo. Must send the required User-Agent, throttle to max 1 request/second, check geocode_cache first and store new results, and return 422 with a clear message on failure.

ENDPOINTS
Auth: POST /auth/register (role tenant|landlord only), POST /auth/login, GET /auth/me, PUT /auth/profile, PUT /auth/change-password
Listings (public read): GET /listings (paginated; filters: min_rent, max_rent, bedrooms, bathrooms, type, area), GET /listings/:id, GET /listings/ids (for Next.js static generation)
Listings (landlord): POST /listings, PUT /listings/:id, DELETE /listings/:id, PATCH /listings/:id/status (publish/unpublish), POST /listings/:id/images, GET /landlord/listings
  - Create/update accept {lat, lng} (from map pin) OR an address string geocoded via middleware; store as ST_SRID(POINT(...), 4326); only the owner can modify
Search: GET /search/nearby?lat=&lng=&radius=500|1000&min_rent=&max_rent=&bedrooms=...
  - Only radius 500 or 1000 (reject others)
  - Also accept ?q=<landmark/address> to geocode the center via Nominatim
  - Bounding-box prefilter on the SPATIAL INDEX + ST_Distance_Sphere; return distance_m per listing, nearest first; only status='approved'
Geocode: GET /geocode?q= (suggestions, cached, rate-limited), GET /geocode/reverse?lat=&lng=
Favorites (tenant): GET/POST/DELETE /favorites
Inquiries: POST /listings/:id/inquiries (tenant), GET /inquiries (tenant: own; landlord: for own listings), PATCH /inquiries/:id/status (landlord)
Agreements: POST /agreements (landlord), GET /agreements, PATCH /agreements/:id/end
Billing ledger: POST /billing (landlord generates monthly entry), GET /billing (role-filtered), PATCH /billing/:id/pay (landlord manually marks paid with method/date — NO payment gateway), GET /billing/summary
Admin: GET /admin/stats, GET /admin/users, PATCH /admin/users/:id/status, PATCH /admin/users/:id/role, GET /admin/listings, PATCH /admin/listings/:id/review (approve|reject), DELETE /admin/listings/:id, GET /admin/billing, CRUD /admin/amenities and /admin/property-types

SECURITY RULES
- Tenants see only their own favorites, inquiries, agreements, billing
- Landlords manage only their own listings/agreements/billing
- Admin routes protected by authorize('admin')

DELIVERABLES
- Full working code, .env.example, backend/README.md with API documentation (endpoint, role, request, response example)
- A small test script verifying nearby search returns correct results for 500 m vs 1000 m
```

---

## 5. Prompt 3 — Frontend (Next.js) with the New Design System

```
Create the /frontend folder: a Next.js app (App Router) with Tailwind CSS, react-leaflet, next-themes, Framer Motion and Lenis. It talks ONLY to the backend REST API (NEXT_PUBLIC_API_URL). Do not touch /backend. Apply the DESIGN SYSTEM SPECIFICATION (Section 2) to every page and component.

STRUCTURE
frontend/
├── package.json, .env.example (NEXT_PUBLIC_API_URL, NEXT_PUBLIC_DEFAULT_LAT/LNG), tailwind.config.js, README.md
├── app/
│   ├── layout.jsx                    (fonts, ThemeProvider, SmoothScrollProvider, Navbar, ScrollProgress)
│   ├── template.jsx                  (page transition wrapper)
│   ├── globals.css                   (CSS variables for light/dark tokens, boxy base styles)
│   ├── page.jsx                      (home: SSG/ISR featured listings + search entry)
│   ├── search/page.jsx               (SPLIT-SCREEN search view)
│   ├── listings/[id]/page.jsx        (detail page, generateStaticParams + revalidate => SSG/ISR)
│   ├── login/ , register/
│   ├── tenant/   (dashboard, favorites, inquiries, my-rental, billing)
│   ├── landlord/ (dashboard, listings, listings/new, listings/[id]/edit, inquiries, agreements, billing)
│   └── admin/    (dashboard, users, listings-review, billing, lookups)
├── components/
│   ├── ui/ (BoxButton, BoxCard, BoxInput, BoxSelect, BoxBadge, BoxModal, BoxTable, Toast, Skeleton, ThemeToggle, ScrollProgress)
│   ├── motion/ (SmoothScrollProvider (Lenis), FadeInStagger, AnimatedCard, PageTransition, CountUp)
│   └── (Navbar, ListingCard, ListingGrid, FilterBar, RadiusSelector, BudgetSlider, MapView, LocationPicker, AddressSearchBox, ProtectedRoute, DashboardLayout)
├── lib/ (api client, auth context, utils)
└── styles/

KEY FEATURES
1. Rendering: Home and listing detail pages use SSG with ISR (revalidate ~60 s). The search page fetches nearby results client-side. Load Leaflet with dynamic import (ssr: false).

2. Design system: implement the exact color tokens (#FCFCF5, #57BA29 and derived tones), light/dark theme toggle with no flash of wrong theme, boxy components (radius 0-4px, 2px borders, hard offset shadows), and the motion rules from Section 2: Lenis smooth scrolling, scroll progress bar, staggered card entrance, hover lift, AnimatePresence layout animation on filtering/sorting, shared-element card -> detail transition, route transitions, count-up stats, boxy skeleton loaders. Respect prefers-reduced-motion.

3. Split-screen search (/search): desktop layout where the map + listing panel take ~70% of the viewport and stay SYNCED:
   - Scrollable listing cards panel and Leaflet map with markers (green #57BA29 square-style markers, pulsing ring on active)
   - Hover/click card <-> highlight marker; click marker -> scroll to card; map move/zoom can limit visible listings
   - Mobile: stacked layout with a boxy Map/List toggle
   - Map tiles switch to a dark tile style in dark mode; popups and controls restyled boxy
   - Apply data-lenis-prevent to the map and the listing panel so scrolling and zooming work correctly

4. Search controls: address/landmark search box (backend /geocode, debounced, with suggestions), "Use my location" button, click map to set the search center, radius selector with ONLY 500 m and 1000 m, draw the radius circle on the map, budget filter (min/max), bedrooms/bathrooms/type filters. Show distance ("320 m away") on each card, sorted nearest first.

5. Landlord listing form: LocationPicker with Leaflet pin dropping (draggable marker, click-to-place) and address search that moves the pin — users NEVER type numeric latitude/longitude (show read-only coordinates). Multi-image upload with preview.

6. Auth: login/register, JWT handling, auth context, ProtectedRoute + role-based redirects (tenant -> /tenant, landlord -> /landlord, admin -> /admin); block cross-role access.

7. Dashboards (boxy bento-grid layouts, animated stat boxes):
   - Tenant: saved listings, inquiries sent, current rental agreement, billing ledger table (paid/unpaid)
   - Landlord: stats, manage listings (create/edit/delete/publish), inquiries inbox, create agreements, generate billing entries and manually mark paid
   - Admin: stats, user management table (activate/ban/change role), approve/reject listings, view all billing, manage amenities/property types

8. UX: responsive, accessible (keyboard focus rings in #57BA29, WCAG AA contrast in both themes), loading skeletons, empty and error states, toast notifications, form validation.

9. Do NOT implement: online payment gateway, live chat, native mobile app.

DELIVERABLES
Full working code, install/run instructions in frontend/README.md, default map center Dhaka, and a short "Design tokens" section in the README listing the colors and animation settings.
```

---

## 6. Prompt 4 — Integration, Testing & Documentation

```
Integrate and verify the full system (frontend + backend with its database folder).

1. Root README.md: project overview, architecture (text diagram), folder structure (frontend/ and backend/ with backend/database/ inside), prerequisites (Node 18+, MySQL 8.0+), and run order:
   a) cd backend && npm install && cp .env.example .env (set DB credentials)
   b) npm run db:setup && npm run db:seed
   c) npm run dev   (backend)
   d) cd ../frontend && npm install && cp .env.example .env.local && npm run dev
2. Verify CORS, env variables, static image serving, and that the frontend calls /api/v1 correctly.
3. Write docs/TEST_PLAN.md with test cases for:
   - Register/login per role and RBAC blocking (tenant cannot open /admin, etc.)
   - Landlord pin-drop stores the correct POINT
   - Nearby search: only listings within 500 m, then more within 1000 m; sorted by distance
   - Budget filter combined with radius
   - Nominatim geocoding of a landmark/address and cache hit on repeat
   - Split-screen sync (card <-> marker)
   - Billing ledger: generate month, mark paid manually, tenant sees status
   - Admin approves a listing and it appears publicly
   - Performance: EXPLAIN shows spatial index use and response < 1 s with 10,000+ seeded rows (provide a seed generator script)
   - ISR: listing detail updates after the revalidation window
   - UI: light/dark toggle persists and has no flash on reload; colors match #FCFCF5 / #57BA29 tokens; all components are boxy; smooth scrolling works on every page without breaking the map; card entrance/hover/filter/detail transitions run; prefers-reduced-motion disables animations; contrast passes WCAG AA in both modes
4. Fix any bugs found and list known limitations (out of scope: native mobile app, online payments, live chat).
```

---

## 7. Optional Prompt — Final Review

```
Review the entire project against Sections 1 and 2 of PROMPTS.md. For each checklist item output PASS/FAIL with the file(s) implementing it, then fix every FAIL. Also confirm: only two top-level folders (frontend, backend) with the database inside backend/database, MySQL POINT + SPATIAL INDEX in use, only 500 m / 1000 m radius supported, Leaflet pin dropping works, ~70% split-screen sync, SSG/ISR used, three role-based dashboards, light + dark mode with #FCFCF5 and #57BA29, boxy UI, smooth scrolling, animated card transitions, and no out-of-scope features.
```

---

## 8. References

- Next.js Documentation (Routing & Static Generation)
- MySQL 8.0 Reference Manual (Spatial Types & `ST_Distance_Sphere`)
- Leaflet Documentation (Interactive Maps & Markers)
- Nominatim API Policy (OpenStreetMap Foundation)
- Express.js Documentation (Routing & Middleware)
- Framer Motion, Lenis, next-themes Documentation
