# Smart House Rent Management System — Backend REST API

A production-grade Node.js + Express REST API with MySQL spatial point indexing, Nominatim OpenStreetMap geocoding, JWT role-based access control (RBAC), and manual rental billing ledgers.

---

## 1. Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env

# 3. Setup database & populate initial seed
npm run db:setup
npm run db:seed
# Or: npm run db:init

# 4. Start backend server (Port 5000)
npm run dev
```

---

## 2. Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | API server port | `5000` |
| `DB_HOST` | MySQL hostname / IP | `127.0.0.1` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `""` |
| `DB_NAME` | Database name | `smart_house_rent` |
| `JWT_SECRET` | Secret key for signing tokens | `smart_house_rent_...` |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:3000` |
| `NOMINATIM_BASE_URL` | OpenStreetMap API URL | `https://nominatim.openstreetmap.org` |
| `NOMINATIM_USER_AGENT`| Required User-Agent | `SmartHouseRentSystem/1.0` |

---

## 3. Seed Accounts

All seed accounts use the default password: **`password123`**

| Role | Email | Name | NID Status |
|---|---|---|---|
| **Admin** | `admin@smarthouse.com` | System Administrator | Verified |
| **House holder** | `landlord1@smarthouse.com` | Kabir Hossain | Verified |
| **House holder** | `landlord2@smarthouse.com` | Farhana Rahman | Verified |
| **House holder** | `landlord3@smarthouse.com` | Tanvir Ahmed | Verified |
| **User (Tenant)** | `user1@smarthouse.com` | Sadek Ali | Verified (also posted a house) |
| **User (Tenant)** | `user2@smarthouse.com` | Nusrat Jahan | Verified |
| **User (Pending)** | `user3@smarthouse.com` | Rahim Chowdhury | Pending |
| **User (Unverified)**| `user4@smarthouse.com` | Mehedi Hasan | Not submitted |
| **Banned Account** | `banned@smarthouse.com` | Banned User | Banned |

---

## 4. API Endpoints Reference (`/api/v1`)

### 4.1 Authentication & Profile (`/auth`)
- `POST /auth/register` — Register as `user` or `house_holder`
- `POST /auth/login` — Login with email/phone & password -> returns JWT
- `GET /auth/me` — Fetch current logged-in profile & notification counts
- `PUT /auth/profile` — Update bio, phone, profile photo, occupation
- `PUT /auth/change-password` — Change password

### 4.2 NID Verification (`/nid`)
- `POST /nid` — Submit NID details and front/back/selfie documents
- `GET /nid/me` — Check current user's NID verification status
- `GET /nid/admin` — (Admin) List all NID submissions
- `GET /nid/admin/:id` — (Admin) View single NID application with docs
- `PATCH /nid/admin/:id/review` — (Admin) Confirm (`verified`) or reject with reason

### 4.3 Houses & Listings (`/houses`)
- `GET /houses` — Public list with filters: `division`, `district`, `area`, `min_rent`, `max_rent`, `bedrooms`, `bathrooms`, `type`, `sort`
- `GET /houses/featured` — Hero carousel featured properties
- `GET /houses/ids` — All approved IDs for Next.js SSG
- `GET /houses/:id` — House information with photos, amenities, coordinates, owner info
- `POST /houses` — Post a house (Requires NID verified; accepts map coordinates or geocoded address)
- `PUT /houses/:id` — Update house (Owner or Admin)
- `DELETE /houses/:id` — Delete house (Owner or Admin)
- `PATCH /houses/:id/deal-complete` — Mark deal complete (removes listing from public search)
- `POST /houses/:id/images` — Upload house photos

### 4.4 Spatial Proximity Search (`/search` & `/map`)
- `GET /search/nearby?lat=&lng=&radius=500|1000|2000` — Sub-second radius proximity search using MySQL `SPATIAL INDEX` + `ST_Distance_Sphere`. Returns `distance_m` and `distance_text`, sorted nearest first.
- Accepts `?q=` to auto-geocode landmarks (e.g. `?q=Uttara+Dhaka&radius=500`).

### 4.5 Bookings (`/bookings`)
- `POST /bookings` — Book house (Requires NID verified; auto-fetches NID details; optional live location sharing)
- `GET /bookings/my` — Booker's bookings
- `GET /bookings/house/:id` — Owner views who booked their house
- `GET /bookings/:id/route` — Owner views route navigation with waypoints from booker to house
- `PATCH /bookings/:id/status` — Update booking status (`confirmed`, `cancelled`, `deal_completed`)

### 4.6 Favorites, Inquiries & Feedback
- `GET/POST/DELETE /favorites` — Manage saved houses
- `POST /houses/:id/inquiries` & `GET /inquiries` — Rental inquiries
- `POST /feedback` — User feedback/complaint submission
- `GET /feedback/admin` & `POST /feedback/admin/:id/respond` — Admin responds to feedback -> triggers user notification
- `GET /notifications` & `PATCH /notifications/:id/read` — User notification center

### 4.7 Rental Agreements & Billing (`/agreements` & `/billing`)
- `POST /agreements` — Create rental agreement
- `GET /agreements` — Role-filtered agreements
- `POST /billing` — Generate monthly bill (Rent + Utilities + Other)
- `GET /billing` — View billing ledger (Paid / Unpaid status)
- `PATCH /billing/:id/pay` — Landlord manually records offline payment (Cash, Bank, Mobile banking — NO online payment gateway)
- `GET /billing/summary` — Billing totals and summary

### 4.8 Admin Operations (`/admin`)
- `GET /admin/stats` — System overview metrics
- `GET /admin/users` & `GET /admin/users/:id` — User management & NID inspection
- `PATCH /admin/users/:id/ban` & `unban` — Ban/unban accounts
- `PATCH /admin/users/:id/role` — Update user role
- `GET /admin/houses` — All houses review
- `PATCH /admin/houses/:id/review` — Approve/reject house
- `PATCH /admin/houses/:id/featured` — Toggle hero carousel featured flag
- CRUD `/admin/amenities` and `/admin/property-types`
