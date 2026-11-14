# Smart House Rent Management System — Frontend (Next.js)

Next.js App Router frontend with React, Tailwind CSS, Leaflet.js (`react-leaflet`), next-themes (Light & Dark), Framer Motion, and Lenis smooth scrolling.

---

## 1. Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env.local

# 3. Start development server (Port 3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 2. Default Configuration

- **Default Map Center**: Dhaka, Bangladesh (`Lat: 23.8103, Lng: 90.4125`)
- **Backend API URL**: `http://localhost:5000/api/v1`

---

## 3. Design System & Tokens

### 3.1 Color Tokens

#### Light Mode (`data-theme="light"`)
- `--bg`: `#FCFCF5` (Page background, cream)
- `--surface`: `#FFFFFF` (Cards, inputs, modals)
- `--surface-alt`: `#F3F3E7` (Subtle bento boxes, table stripes)
- `--primary`: `#57BA29` (Brand green: buttons, active states, map markers, links)
- `--primary-hover`: `#479E1F`
- `--primary-soft`: `#E6F5DD` (Badges, active chips)
- `--on-primary`: `#0F1A09` (High contrast text on green elements)
- `--text`: `#1A1D14` (High-contrast dark typography)
- `--text-muted`: `#5C6152`
- `--border`: `#1A1D14` (2px solid boxy borders)
- `--border-soft`: `#D9DAC8`
- `--shadow-box`: `4px 4px 0 0 #1A1D14` (Hard offset shadow)

#### Dark Mode (`data-theme="dark"`)
- `--bg`: `#11140D`
- `--surface`: `#1A1E14`
- `--surface-alt`: `#232819`
- `--primary`: `#57BA29`
- `--primary-hover`: `#6FD140`
- `--primary-soft`: `#223318`
- `--on-primary`: `#0F1A09`
- `--text`: `#FCFCF5`
- `--text-muted`: `#A9AE9A`
- `--border`: `#FCFCF5` (2px solid borders)
- `--border-soft`: `#343A28`
- `--shadow-box`: `4px 4px 0 0 #57BA29`

### 3.2 Boxy UI Rules
- `border-radius: 0` (max 2-4px) across all components (cards, inputs, badges, modals, map container).
- `2px solid` borders using `--border`.
- Hard offset shadows (`shadow-box: 4px 4px 0 0 ...`), zero blurry gradients.
- Interactive pressed button animation: hover translates `translate(2px, 2px)` with reduced shadow; active translates `translate(4px, 4px)` with 0 shadow.

### 3.3 Motion & Smooth Scrolling
- **Lenis Smooth Scroll**: initialized globally in `SmoothScrollProvider` (`lerp: 0.1`, `smoothWheel: true`).
- `data-lenis-prevent` on Leaflet map containers and nested vertical card boxes to prevent wheel event capture.
- **Scroll Progress Bar**: fixed 3px `#57BA29` bar synced to window scroll progress.
- **Framer Motion**: Staggered card entrances (`0.06s` stagger), layout animations on filter changes (`AnimatePresence mode="popLayout"`), count-up numbers in stat cards, and 250ms route transition wrappers.
- Respects `prefers-reduced-motion` media queries automatically.

---

## 4. Key Page Routes

| Route | Description | Access |
|---|---|---|
| `/` | Home Landing Page (Featured hero slider, small-card vertical scroll, toggleable mini map) | Public |
| `/houses` | Catalog with Bangladesh Division/District/Area dropdown & budget slider | Public |
| `/houses/[id]` | House Information Page (Photo gallery, details, mini map, book button) | Public |
| `/map` | Full-page interactive map with pin-drop, 500m/1000m radius circle & floating horizontal card strip | Public |
| `/search` | Split-Screen Search view (Cards panel + Leaflet map synced, ~70% viewport) | Public |
| `/contact` | Contact details (Phone, Email, WhatsApp) + Feedback / Complaint form | Public |
| `/login` | Sign In with role-based redirection and banned-account check | Public |
| `/register` | Sign Up with account type selection (`user` / `house_holder`) | Public |
| `/dashboard` | User dashboard: bookings, post button, dual-role host section, NID status | User / All |
| `/host` | House holder dashboard: posted houses, booker information, GPS direction route, deal complete | House holder |
| `/book/[houseId]` | Booking page: auto-fetches verified NID details (read-only), share location consent | Verified users |
| `/post` | House posting: LocationPicker pin drop, Bangladesh dropdown, photo uploads | Verified users |
| `/post/[id]/edit` | Edit house details and update GPS pin location | Owner / Admin |
| `/nid` | National ID submission and verification status tracker | Logged in |
| `/admin` | Admin console: Overview stats, user bans, NID review, house reviews, feedback replies | Admin only |
