# Coffee Bliss — PRD

## Original Problem Statement
Build a full-stack premium coffee shop website "Coffee Bliss" with a modern, aesthetic UI/UX suitable for a freelancing client. Pages: Home (hero, featured, testimonials, sticky nav, footer), Menu (categories + add-to-cart), About, Contact, Login/Register, Cart, Admin. Glassmorphism + soft coffee-brown/beige/cream tones; premium typography; fully responsive with smooth transitions.

Originally requested tech: PHP + MySQL. Built on platform stack: **React + FastAPI + MongoDB** (Emergent-optimized).

## Architecture
- **Frontend**: React 19 + React Router + Tailwind. Contexts: AuthContext (cookie-based JWT session), CartContext (localStorage). Fonts: Cormorant Garamond (headings) + Outfit (body). Lucide-react icons. Sonner toasts.
- **Backend**: FastAPI + Motor (async MongoDB). JWT access/refresh via httpOnly cookies. Bcrypt password hashing. Admin role + seeded admin on startup.
- **Data**: MongoDB collections — `users`, `products`, `testimonials`, `orders`, `contact_messages`. Unique index on users.email; unique index on products.id.

## User Personas
- **Visitor** – browses menu, reads story, contacts cafe
- **Customer** – registers/logs in, adds items to cart, places orders
- **Admin** – signs in, adds/removes menu items from dashboard

## Core Requirements
- Hero + featured + testimonials on Home
- Menu with Coffee/Beverages/Desserts filter and add-to-cart
- About with brand story, mission/vision, team
- Contact form + opening hours + map placeholder
- JWT register/login/logout with httpOnly cookies
- Cart drawer with qty adjust, remove, persist to localStorage, checkout -> /api/orders
- Admin dashboard to manage products

## Implemented (Feb 2026)
- All pages built with warm editorial design (Cormorant Garamond + Outfit, cream/mocha palette, burnt-orange accent #D96C4A)
- 10 products and 3 testimonials seeded on startup
- Admin seeded: admin@coffeebliss.com / admin123
- Glassmorphism sticky nav, hover lift cards, smooth scroll, staggered hero fade-in
- Mobile responsive (mobile menu, stacked grids, split-screen auth collapses)
- Auth flow verified end-to-end; admin CRUD verified; cart+order flow verified
- Testing agent: 100% backend (15/15), 100% frontend

## Backlog
**P1**
- Stripe checkout instead of direct-order (revenue)
- Order history page for customers
- Product edit (PUT endpoint exists; no UI yet)

**P2**
- Real Google Maps embed in Contact
- Image upload for admin (object storage)
- Brute-force lockout on login
- Password reset flow
- Email receipts via Resend/SendGrid
