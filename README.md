# Web-Based Smart House Rent Management System

> **Course**: CSE0613310 Software Engineering — Uttara University, Dept. of CSE  
> **Brand Palette**: `#57BA29` (Primary Green) & `#FCFCF5` (Cream)  
> **Design Style**: Boxy Neobrutalism UI, Light & Dark Theme, Smooth Scrolling & Spatial Proximity Search  

---

## 1. Problem & Architecture

Traditional house-rent search platforms in Dhaka rely on vague text addresses ("behind yellow building", "near tin shed"), leading to extreme user friction, navigation errors, and inability to filter by true geographic proximity.

This system replaces vague text with **precise GPS spatial point storage (`POINT NOT NULL SRID 4326`)** and **sub-second 500m / 1000m radius proximity search** utilizing MySQL's spatial R-tree index (`MBRContains`) + geodesic spherical distance calculation (`ST_Distance_Sphere`).

### Architecture Overview

```
 +-------------------------------------------------------------------------+
 |                            CLIENT BROWSER                               |
 |   Next.js 14 (App Router) + React-Leaflet + Lenis + Framer Motion       |
 +------------------------------------+------------------------------------+
                                      |
                      REST JSON APIs  | (Bearer JWT)
                                      v
 +------------------------------------+------------------------------------+
 |                        BACKEND SERVICE LAYER                            |
 |        Node.js + Express.js REST API (Port 5000, /api/v1)              |
 |   - RBAC Auth (Tenant, Landlord, Admin)                                 |
 |   - Nominatim OpenStreetMap Geocoding Middleware (Throttled & Cached)   |
 |   - Spatial Bounding-Box Prefilter + Geodesic Calculation Engine       |
 |   - Multipart Photo & Private NID Document Storage                      |
 +------------------------------------+------------------------------------+
                                      |
                           MySQL Pool | (mysql2/promise)
                                      v
 +------------------------------------+------------------------------------+
 |                           DATABASE LAYER                                |
 |              MySQL 8.0+ / MariaDB 10.5+ (backend/database/)            |
 |   - POINT Column with SPATIAL INDEX                                    |
 |   - Bounding Envelope Pruning (MBRContains) + ST_Distance_Sphere        |
 |   - Relational Tables: Users, NID, Houses, Bookings, Agreements, Ledger |
 +-------------------------------------------------------------------------+
```

---

## 2. Project Layout (Strictly TWO Top-Level Folders)

```
smart-house-rent/
├── backend/                  -> Node.js + Express REST API
│   ├── database/             -> Schema, spatial queries, seeds, migrations
│   │   ├── schema.sql        -> Full DDL schema with SPATIAL INDEX
│   │   ├── spatial_queries.sql -> Documented 500m/1000m MBR queries
│   │   ├── seed.sql          -> Dhaka sample data (25+ houses, users, etc.)
│   │   ├── migrate.js        -> Node migration runner
│   │   └── generate_seed.js  -> 10,000+ listing benchmark generator
│   ├── src/
│   │   ├── config/           -> MySQL pool and environment settings
│   │   ├── controllers/      -> Auth, NID, Houses, Search, Bookings, Admin
│   │   ├── middleware/       -> Auth, RBAC, Geocode, Upload, Rate Limiter
│   │   ├── routes/           -> Versioned REST routes (/api/v1)
│   │   ├── services/         -> Nominatim & Spatial query services
│   │   └── utils/            -> Standard responses & distance calculations
│   ├── uploads/              -> Statically served property photos
│   ├── server.js             -> Express entrypoint
│   ├── package.json
│   └── .env.example
│
├── frontend/                 -> Next.js 14 App Router
│   ├── app/
│   │   ├── page.jsx          -> Home (Hero auto-slider, vertical cards, mini-map)
│   │   ├── houses/           -> Catalog with BD locations dropdown & budget slider
│   │   ├── map/              -> Full-page map with radius circle & card strip
│   │   ├── search/           -> Split-screen search view (~70% synced viewport)
│   │   ├── book/[houseId]/   -> Booking page (verified NID auto-fetch)
│   │   ├── post/             -> House post with LocationPicker pin drop
│   │   ├── nid/              -> National ID verification submission
│   │   ├── contact/          -> Phone, WhatsApp, and feedback/complaint form
│   │   ├── dashboard/        -> User dashboard (bookings, dual host tools)
│   │   ├── host/             -> House holder portal (bookers, GPS route, deal complete)
│   │   └── admin/            -> Admin console (users, NID review, house approvals)
│   ├── components/           -> Boxy UI, Motion, Leaflet maps, Navbar, Footer
│   ├── lib/                  -> API client, Auth Context, Bangladesh location tree
│   ├── tailwind.config.js    -> Design tokens (#57BA29, #FCFCF5, boxy shadows)
│   └── package.json
│
├── docs/
│   └── TEST_PLAN.md          -> Comprehensive test cases and verification matrix
└── README.md
```

---

## 3. Prerequisites

- **Node.js**: `v18.0.0` or newer
- **MySQL / MariaDB**: `8.0+` (or MariaDB `10.5+` with Spatial GIS enabled)

---

## 4. Step-by-Step Run Instructions

### Step 1: Database & Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env if your MySQL root has a password

# Run database migration and realistic Dhaka seed
npm run db:setup
npm run db:seed
# Or one-liner: npm run db:init

# Start Backend API (runs on http://localhost:5000)
npm run dev
```

### Step 2: Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
cp .env.example .env.local

# Start Next.js App (runs on http://localhost:3000)
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

---

## 5. Seed Test Accounts

All accounts are pre-seeded with password: **`password123`**

| Role | Email | Name | Capabilities |
|---|---|---|---|
| **Admin** | `admin@smarthouse.com` | System Admin | User bans, NID review, house reviews, feedback replies |
| **House Holder** | `landlord1@smarthouse.com` | Kabir Hossain | Manage Uttara/Mirpur houses, inspect booker GPS routes, deal complete |
| **User (Verified)**| `user1@smarthouse.com` | Sadek Ali | Book houses, post houses (dual-role active on dashboard) |
| **User (Pending)** | `user3@smarthouse.com` | Rahim Chowdhury | Pending NID verification for testing review queue |
| **Banned User** | `banned@smarthouse.com` | Banned User | Tests login prevention for banned accounts |

---

## 6. Testing & Benchmarking

- Run automated spatial search unit test (500m vs 1000m vs budget):
  ```bash
  cd backend && npm run test:spatial
  ```
- Run 10,000+ listing R-Tree spatial indexing performance benchmark:
  ```bash
  cd backend && npm run db:bench
  ```

See [`docs/TEST_PLAN.md`](./docs/TEST_PLAN.md) for full test suites and manual validation checklist.
