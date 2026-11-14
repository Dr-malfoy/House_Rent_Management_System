# Smart House Rent — Page-by-Page Requirements (Landing Page & Dashboards)

> Companion to `PROMPTS.md`. Same stack (Next.js frontend, Node.js/Express backend, MySQL inside `backend/database/`) and same design system (colors #FCFCF5 and #57BA29, light/dark mode, boxy UI, Lenis smooth scrolling, animated card transitions).
> Give this file to the AI coding assistant together with `PROMPTS.md`. Where the two files differ on pages, roles, or flows, **this file wins**.

---

## 0. Overview

### 0.1 Page list

| # | Page | Route | Access |
|---|------|-------|--------|
| 1 | Home (landing) | `/` | Public |
| 2 | Houses | `/houses` | Public |
| 3 | Map | `/map` | Public |
| 4 | Contact | `/contact` | Public (feedback form requires login) |
| 5 | Login / Sign up | `/login`, `/register` | Public |
| 6 | User dashboard | `/dashboard` | Logged-in user |
| 7 | House holder dashboard | `/host` | Logged-in house holder |
| 8 | Booking page | `/book/[houseId]` | NID-verified logged-in user |
| 9 | House post page | `/post`, `/post/[id]/edit` | NID-verified logged-in user or house holder |
| 10 | House information page | `/houses/[id]` | Public |
| 11 | Admin dashboard | `/admin` (+ sub-pages) | Admin only |

### 0.2 Roles (updated)
- **User** – can browse, **book** houses, and **also post** houses.
- **House holder** – can post and manage houses and see booker information.
- **Admin** – manages users, NID verification, houses, and feedback.
- A user who posts a house gets the **house holder tools** (posted houses, edit, booker info, deal complete) in addition to the user features. The simplest implementation: one account with a `role` of `user`, `house_holder`, or `admin`, where posting a house automatically enables the house holder view for that account.
- **NID verification is required for both users and house holders** before they can **post** a house or **book** a house.

### 0.3 Global rules
- All pages follow the design system in `PROMPTS.md` Section 2 (boxy cards, light/dark toggle, smooth scrolling, animated transitions).
- Navbar (all public pages): Logo, Home, Houses, Map, Contact, theme toggle, Login/Sign up (or avatar menu with Dashboard, Notifications, Logout when logged in).
- Currency is **BDT (৳)**. Area/location dropdowns use **Bangladesh** divisions, districts, and areas.
- Out of scope: online payment, live chat, native mobile app. (Any "paid" or "featured" status is set by the admin or recorded manually; there is no payment gateway.)
- All coordinates are stored as MySQL `POINT SRID 4326` with a `SPATIAL INDEX`.

---

## 1. Home Page (`/`)

### 1.a Hero Section
- Full-width hero that shows the **paid / featured houses** (houses marked `is_featured = true`) as an **auto-scrolling slider** (carousel).
  - Assumption: "paid houses" means promoted/featured listings. The admin (or the system, via a manual record) marks a house as featured. No online payment.
- Each slide shows: **cover image (background), house name (centered), and a "Book" button**.
- Clicking **Book** navigates to the **Booking page** (`/book/[houseId]`). If the user is not logged in, redirect to login, then return to the booking page.
- Behavior:
  - Auto-scroll every ~4 seconds, smooth sliding/fade transition
  - Pause on hover, swipe on mobile, dots/arrows for manual control
  - Respect `prefers-reduced-motion`
  - Skeleton loader while featured houses load; hide the section gracefully if there are none

### 1.b House Section
- Compact **small-card grid** showing all approved houses, with a **vertically scrolling** area (fixed-height box with internal vertical scroll, or paginated "load more on scroll").
- Each small card: thumbnail, house name, area, price per month (৳), beds/baths, status badge.
- Cards animate in (staggered fade-up) and lift on hover; clicking a card opens the **House Information page**.
- A **"View More"** button below the section navigates to the **Houses page** (`/houses`).
- Apply `data-lenis-prevent` to the inner vertical scroll box so nested scrolling works with smooth scrolling.

### 1.c Mini Map
- A small embedded Leaflet **mini map** showing house pins (clustered if many).
- The map is **toggleable**: a toggle control shows/hides the mini map.
- When the mini map is toggled on, a **"View Map"** button appears; clicking it navigates to the **Map page** (`/map`).

### 1.d Footer (About Information)
- About the project (short description of the Smart House Rent Management System)
- Quick links: Home, Houses, Map, Contact, Login/Sign up
- Contact info (phone, email, WhatsApp), social links, copyright, project credits (Uttara University, CSE)
- Boxy layout, works in light and dark mode

---

## 2. Houses Page (`/houses`)

- Shows **all approved houses** as cards in a responsive grid; card click -> House Information page.
- **Filters (top bar):**
  - **Area search dropdown (Bangladesh):** searchable dropdown of Bangladesh division -> district -> area/upazila (e.g., Dhaka -> Dhaka -> Uttara, Mirpur, Dhanmondi...). Typing filters the options.
  - **Money (budget) filter:** min and max rent in ৳ (slider + number inputs).
  - Optional extras: bedrooms, bathrooms, property type, sort by (price, newest).
- Active filters shown as removable boxy chips; "Clear all" button.
- Cards animate when filters change (AnimatePresence layout animation).
- Pagination or infinite scroll; empty state when nothing matches.
- Each card: cover image, house name, area, rent (৳/month), beds, baths, size, "Available" badge.

---

## 3. Map Page (`/map`)

- **Full-page map** (full viewport, below the navbar) using Leaflet, with smooth scrolling/zooming and light/dark tile styles.
- **Pin drop:** the user clicks anywhere on the map to drop a pin (draggable). Also support "Use my location" and an address search box.
- **Radius selection:** after dropping a pin, the user selects a radius (500 m, 1000 m; optionally more such as 2 km). A **circle** is drawn around the pin.
- **Results:** houses **inside the circle** (found with the MySQL spatial query: bounding box prefilter + `ST_Distance_Sphere`) are shown in a **horizontal scrollable card strip that floats on top of the map** (bottom-aligned overlay, or as described: right side, horizontally scrolling). Cards include distance from the pin.
  - The overlay is floating (semi-transparent boxy panel with shadow), horizontally scrollable with smooth scroll/snap, and can be collapsed.
- Card <-> marker sync: hovering a card highlights its marker (pulse), clicking a marker scrolls to its card; clicking a card opens the House Information page.
- Houses outside the circle are dimmed or hidden. Changing the pin or radius re-runs the search with animated card changes.
- The map page must not scroll the page body; the map stays full-page (`data-lenis-prevent` on the map and the card strip).

---

## 4. Contact Section / Page (`/contact`)

- Contact details boxes: **phone number, email, WhatsApp** (WhatsApp as a click-to-chat `wa.me` link, phone as `tel:`, email as `mailto:`).
- **Feedback / complaint form** where a **house holder or user** can send feedback or a complaint:
  - Fields: name (prefilled if logged in), email, category (Feedback / Complaint / Suggestion / Other), related house (optional), subject, message
  - Validation, success toast, and the submission is stored in the database
  - Requires login so the admin's response can be delivered as a notification
- Submitted feedback appears in the Admin **Feedback page**. The admin's response appears in the user's **notifications** (see Section 11.5).

---

## 5. Login & Sign Up (`/login`, `/register`)

- **Sign up fields:** full name, email, phone, password + confirm password, account type (User or House holder), terms checkbox.
- **Login fields:** email (or phone) and password; "Remember me"; "Forgot password" link (optional, can be a simple placeholder flow).
- JWT-based auth; passwords hashed with bcrypt; clear validation and error messages.
- After login, redirect by role: User -> `/dashboard`, House holder -> `/host`, Admin -> `/admin`.
- Banned users see a clear "Your account is banned" message and cannot log in.
- Boxy centered form cards, theme-aware, animated entrance.

---

## 6. Dashboards

### 6.1 User Dashboard (`/dashboard`)
- **Booked houses:** list of houses the user has booked, with status (Pending, Confirmed, Deal Completed, Cancelled), booking date, and a link to the house information page.
- **Post a house:** a "Post a House" button (opens the House Post page). Users can post houses just like house holders.
- Once the user has posted houses, the dashboard also shows the **house holder section** (Section 6.2): their posts, edit, booker information, directions, and deal complete.
- Other boxes: profile and **NID verification status** (Not submitted / Pending / Verified / Rejected) with a button to submit NID, notifications (including admin responses to feedback), saved houses.
- Boxy bento-grid layout with animated stat boxes.

### 6.2 House Holder Dashboard (`/host`)
- **Posted houses:** shows all houses the house holder posted (status: Pending approval, Approved, Booked, Deal Completed).
- **Edit posts:** edit button on each post opens the House Post page in edit mode (see 8.ii).
- **Booker information:** for each booked house, the house holder can see **who booked it**:
  - Booker name, phone, email, NID-verified badge, booking date, message, number of members, move-in date
  - Clicking the booker's information opens a details panel/modal with a **"Direction" button**.
- **Direction button:** shows the route from the **booker's live/current location to the house** on a map, with **way points** (route line, distance, and estimated time).
  - Implementation suggestion: Leaflet Routing Machine or OSRM public API (or openrouteservice) between the booker's shared location (from the browser Geolocation API when they booked, or their last saved location) and the house's stored coordinates. If the booker's location is not available, show only the house pin and a notice.
  - Note: the booker's location is only visible to the house holder of that booked house, and only after the booker consents when booking.
- **Deal Complete button:** on a booked house, the house holder (or the user who posted it) presses **"Deal Complete"**.
  - The **post is automatically removed from public listings** (hidden from Home, Houses, and Map pages), and
  - The dashboard shows a **"Deal Complete"** label/status at that place instead of the active post.
  - The record is kept in the database (status `deal_completed`) for history and for the admin; it is not hard-deleted.
- Stats boxes: total posts, active posts, bookings, completed deals.

---

## 7. NID Verification (applies to users and house holders)

- Both **users and house holders must be NID verified** to:
  - **Post** a house, and
  - **Book** a house.
- Unverified users who click Post or Book are redirected to an **NID submission form** (with a clear message).
- **NID submission form fields:** full name (as on NID), NID number, date of birth, father's/mother's name (optional), address, NID front image, NID back image, selfie (optional).
- After submission the status is **Pending** until the admin reviews it (see Admin: NID Verification page). Possible statuses: `not_submitted`, `pending`, `verified`, `rejected` (with a reason).
- Security: NID images are stored privately (not publicly served), only the owner and the admin can access them; mask the NID number everywhere except the admin review view and the owner's own view.
- Notifications are sent on approval or rejection.

---

## 8. Core Flow Pages

### 8.i Booking Page (`/book/[houseId]`)
- Requirements: user must be **logged in and NID verified**. If not, redirect to login or to the NID form.
- Page layout (two boxes):
  - **House information box:** cover image, house name, location, rent (৳), beds/baths, and a short summary.
  - **Booker details entry form:** name, phone, email, number of members, move-in date, message to the house holder, and consent checkbox to share location with the house holder.
- **Auto-fetch for verified users:** if the booker's NID is verified, their **NID details (name, NID number masked, date of birth, address) are automatically fetched and prefilled** (read-only) into the form from their verified NID record. The user cannot edit the verified NID fields.
- A user cannot book their own house, and cannot book a house that is already booked or deal-completed.
- Submitting creates a booking record, notifies the house holder (booker information appears on the house holder dashboard), and shows a success screen with a link to the user dashboard.
- Prevent duplicate bookings with the same user and house.

### 8.ii House Post Page (`/post`, `/post/[id]/edit`)
- Requirements: user or house holder must be **logged in and NID verified**.
- **Form fields:**
  - **House name**
  - **Location select dropdown** (Bangladesh division -> district -> area)
  - **Mini map:** after the location is selected, the mini map **shows that location**, and the user can **drop/drag a pin** to set the exact spot. The pin's **geo location (latitude/longitude) is saved** to the database (as `POINT`). Coordinates are shown read-only; nobody types lat/long manually.
  - **Cover picture input** (one main image)
  - **Other pictures input** (multiple images for example, flat, rooms, kitchen, bathroom, balcony pictures) with previews, reorder, and remove
  - **Price selection input** (rent per month in ৳, plus optional security deposit)
  - **Details input box** (description, bedrooms, bathrooms, size, floor, facilities/amenities, rules, availability date)
- The user can later **edit or modify** the post, including the pin location, images, and price. Edits to an approved post may require admin re-approval (configurable, default: allowed without re-approval except for location changes).
- New posts start as `pending` and go live once the admin approves (the admin Houses page), or optionally auto-approve for verified users (configurable).
- Validation: required fields, image type and size limits (e.g., JPG/PNG/WebP, max 5 MB each), maximum number of images.

### 8.iii House Information Page (`/houses/[id]`)
- **House name** (heading), **cover picture** (large hero image), and **other pictures** (gallery/lightbox with smooth transitions).
- **Details information:** rent (৳), deposit, beds, baths, size, floor, amenities, description, rules, availability, posted date, status.
- **Mini map** showing the exact house location pin (with a "Get directions" link to the full map or Google Maps/OSM).
- House holder info (name, verified badge; phone/email shown only to logged-in users or after booking, configurable).
- **Book button** -> Booking page (disabled with a message if the house is booked/deal completed, or the viewer is the owner).
- Statically generated with ISR (`revalidate`) for fast loads; shared-element transition from the card.

---

## 9. Admin Dashboard (`/admin`)

Admin-only (JWT + `authorize('admin')`). Sidebar navigation with the pages below. Boxy design, light/dark mode.

### 9.1 Overview
- Stat boxes: total users, pending NIDs, total houses, pending houses, bookings, completed deals, unread feedback.

### 9.2 Users Page (`/admin/users`)
- Table of **all users** (name, email, phone, role, NID status, status, joined date), with search and filters.
- **Ban / unban** button (with confirmation and an optional reason).
- **Clicking a user** opens a detail view showing their **information and NID** (NID number, NID images, verification status), their posts, and their bookings.

### 9.3 NID Verification Page (`/admin/nid`)
- Shows **all submitted NIDs** (default filter: Pending), with a table or card queue.
- The admin **reviews** the submitted data and images (front/back, selfie) side by side.
- Actions: **Confirm** -> the user's NID becomes **Verified**; **Reject** (with a required reason) -> status Rejected and the user is notified and may resubmit.
- Record who reviewed and when. Verified NID data is what the booking page auto-fetches.

### 9.4 Houses Page (`/admin/houses`)
- Table/cards of **all houses with all their information** (owner, location and pin on a map, price, photos, details, status, featured flag, bookings).
- Actions: approve, reject (with reason), remove, mark/unmark **featured** (controls the Home hero slider), view the full house information.

### 9.5 Feedback Page (`/admin/feedback`)
- Shows **all feedback and complaints** submitted from the Contact form (sender, category, related house, subject, message, date, status: New / In progress / Resolved).
- The admin can **respond** to each item.
- When the admin responds, the response **appears in the user's notifications** (notification bell on the navbar and the dashboard Notifications box, with unread count).

---

## 10. Data Model Additions (in `backend/database/schema.sql`)

Extend the original schema from `PROMPTS.md` with:

- `users`: `role ENUM('user','house_holder','admin')`, `nid_status ENUM('not_submitted','pending','verified','rejected') DEFAULT 'not_submitted'`, `status` (`active`/`banned`), `ban_reason`
- `nid_verifications`: id, user_id FK, full_name, nid_number, date_of_birth, address, front_image_path, back_image_path, selfie_path, status, rejection_reason, reviewed_by FK, reviewed_at, submitted_at
- `houses` (or `listings`): add `is_featured BOOL`, `status ENUM('pending','approved','rejected','booked','deal_completed','unpublished')`, `location POINT SRID 4326` with `SPATIAL INDEX`, `division`, `district`, `area`, `cover_image`
- `house_images`: id, house_id FK, image_path, sort_order
- `bookings`: id, house_id FK, user_id FK, members, move_in_date, message, share_location BOOL, booker_lat/booker_lng (or POINT) nullable, status ENUM('pending','confirmed','deal_completed','cancelled'), created_at, UNIQUE(house_id, user_id)
- `feedback`: id, user_id FK, category, house_id nullable, subject, message, status, admin_response, responded_by, responded_at, created_at
- `notifications`: id, user_id FK, type (`feedback_response`, `nid_approved`, `nid_rejected`, `booking_new`, `house_approved`, ...), title, body, link, is_read, created_at
- `bd_locations` (optional seed): division, district, area for the Bangladesh dropdowns (or a static JSON file used by the frontend)

---

## 11. API Endpoints to Provide (all under `/api/v1`)

### 11.1 Public
- `GET /houses` (filters: area, division, district, min_rent, max_rent, bedrooms, bathrooms, sort, page)
- `GET /houses/featured` (hero slider), `GET /houses/:id`, `GET /houses/ids`
- `GET /map/nearby?lat=&lng=&radius=` (houses inside the circle, nearest first, with `distance_m`)
- `GET /locations/divisions`, `/districts?division=`, `/areas?district=`

### 11.2 Auth & Profile
- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `PUT /auth/profile`

### 11.3 NID
- `POST /nid` (submit), `GET /nid/me` (status)
- Admin: `GET /admin/nid?status=`, `GET /admin/nid/:id`, `PATCH /admin/nid/:id/review` (confirm or reject with reason)

### 11.4 Houses & Bookings
- `POST /houses`, `PUT /houses/:id`, `DELETE /houses/:id`, `POST /houses/:id/images` (require NID verified)
- `GET /me/houses` (my posts), `PATCH /houses/:id/deal-complete` (owner only; sets `deal_completed`, hides post)
- `POST /bookings` (require NID verified; auto-fetches verified NID data server-side), `GET /me/bookings`, `GET /houses/:id/bookings` (owner only; booker information), `GET /bookings/:id/route` (owner only; booker location and house location for directions)

### 11.5 Feedback & Notifications
- `POST /feedback`
- `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`
- Admin: `GET /admin/feedback`, `POST /admin/feedback/:id/respond` (creates the user's notification)

### 11.6 Admin
- `GET /admin/stats`, `GET /admin/users`, `GET /admin/users/:id`, `PATCH /admin/users/:id/ban`, `PATCH /admin/users/:id/unban`
- `GET /admin/houses`, `PATCH /admin/houses/:id/review`, `PATCH /admin/houses/:id/featured`, `DELETE /admin/houses/:id`

---

## 12. Acceptance Checklist

**Home**
- [ ] Hero auto-scrolls featured houses; centered house name and Book button; Book opens the booking page
- [ ] House section: small cards, vertical scrolling, View More -> Houses page
- [ ] Mini map with toggle; View Map button appears when toggled on and opens the Map page
- [ ] Footer with about information, links, and contacts

**Houses page**
- [ ] Bangladesh area search dropdown, money filter, card grid, card -> House Information page

**Map page**
- [ ] Full-page map, pin drop, radius select with circle, houses inside the circle shown in a floating horizontal strip, smooth scrolling

**Contact**
- [ ] Phone, email, WhatsApp, feedback/complaint form saved to the database

**Auth**
- [ ] Login and sign up with role-based redirect and banned-user handling

**Dashboards**
- [ ] User dashboard: booked houses and post option
- [ ] House holder dashboard: posted houses, edit, booker information, Direction button with route and way points to the house
- [ ] Users who post also see the house holder tools and booker information
- [ ] Deal Complete button removes the post from public pages and shows "Deal Complete"

**Flow pages**
- [ ] NID verification required for posting and booking (both roles)
- [ ] Booking page: house info and booker form; verified NID data auto-fetched
- [ ] House Post page: name, location dropdown, mini map with pin drop saved as geo location, cover and other pictures, price, details, and later edit
- [ ] House Information page: name, cover, details, mini map, other pictures

**Admin**
- [ ] Users page with ban and click-to-view information and NID
- [ ] NID verification page: review and confirm/reject
- [ ] Houses page: all house information, approve/reject/feature
- [ ] Feedback page: view all feedback and respond; response appears in the user's notifications

**Global**
- [ ] Colors #FCFCF5 and #57BA29, light and dark mode, boxy UI, smooth scrolling, card transitions
- [ ] Only two top-level folders (`frontend`, `backend`) with the database inside `backend/database/`
- [ ] No online payment, live chat, or native mobile app

---

## 13. Ready-to-Paste Prompts

### Prompt A — Database and Backend updates
```
Using PROMPTS.md and PAGES_SPEC.md, update the backend and backend/database/schema.sql to support the page flows in PAGES_SPEC.md: roles (user, house_holder, admin), NID verification (nid_verifications table, private image storage, admin review), houses with featured flag and deal_completed status, bookings (with optional booker location and consent), feedback with admin response, notifications, and Bangladesh location data. Implement all endpoints in PAGES_SPEC.md Section 11 with RBAC, NID-verified checks on posting and booking, auto-fetching verified NID data on booking, automatic removal of public listings on deal-complete, and notifications created on NID review, new bookings, and feedback responses. Keep the MySQL POINT + SPATIAL INDEX nearby search. Update the seed data and the README.
```

### Prompt B — Frontend public pages
```
Using PROMPTS.md (design system, Section 2) and PAGES_SPEC.md, build the frontend public pages: Home (auto-scrolling featured hero with centered house name and Book button, small-card vertical-scroll house section with View More, toggleable mini map with View Map button, footer), Houses (Bangladesh area search dropdown, money filter, card grid), Map (full-page map, pin drop, radius circle, floating horizontal strip of houses inside the circle), Contact (phone, email, WhatsApp, feedback/complaint form), Login/Sign up, and House Information (name, cover, details, mini map, other pictures). Use #FCFCF5 and #57BA29, light/dark mode, boxy UI, Lenis smooth scrolling, and animated card transitions.
```

### Prompt C — Frontend flows and dashboards
```
Using PROMPTS.md and PAGES_SPEC.md, build the frontend NID submission form, Booking page (house info + booker form with verified NID auto-fetch), House Post page (name, Bangladesh location dropdown, mini map with pin drop saved as geo location, cover and other pictures, price, details, edit mode), User dashboard (booked houses, post option, notifications), House holder dashboard (posts, edit, booker information, Direction button showing a route with way points from the booker's location to the house, Deal Complete button that removes the post and shows "Deal Complete"), and the Admin dashboard (Users with ban and NID view, NID Verification review and confirm/reject, Houses with all information, Feedback with responses that show up in user notifications). Follow the same design system.
```
