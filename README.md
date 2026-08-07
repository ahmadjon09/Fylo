# WareFlow — Production Warehouse & Sales Management

Commercial-grade, real-time, secure, mobile-first warehouse management built like for thousands of companies.

## Tech Stack
- **Frontend**: React 18 + Vite + JSX, React Router DOM, TanStack Query, Axios, React Hook Form + Zod, react-phone-number-input, React Icons, Recharts, Framer Motion, Socket.IO Client, i18next (en, ru, uz Latin, uz Cyrillic), React Hot Toast, React Window
- **Backend**: Node.js + Express + Mongoose + ioredis + Socket.IO, JWT (access + refresh rotation), Bcrypt, Helmet, Compression, Morgan, Rate Limit, CORS, Cookie Parser, Multer + Sharp, imgbb for avatars/products, ExcelJS export, Telegraf Telegram bot

## Key Features Implemented

### Auth
- Phone + Password (phone input with react-phone-number-input)
- JWT access 15m + refresh 7d with rotation & blacklist in Redis
- First registered user auto admin
- Device tracking (UA, IP, lastActive), login count, online status via Redis presence set
- Secure cookies, rate limiting

### Users / Roles
- Roles: admin (all perms), worker (products read/create/update, sales)
- Admin can view all users, change role, disable, delete, view devices, view online users
- Worker cannot see dashboard/stats
- Avatar upload to imgbb (optimized 320x320 via Sharp)

### Product System
- Fields: name, images[], quantity, currentQuantity, totalPurchasePrice, totalIntlShipping, totalLocalShipping, unitCost auto calc, minSellingPrice (validated ≥ unitCost), status auto (in_stock/low_stock/out_of_stock), category, sku, lowStockThreshold, createdBy/updatedBy
- **Purchase Calculation**: unitCost = (purchase + intl + local)/quantity — live display before save, warning if minPrice < unitCost
- Categories distinct, pagination, search, filters, sorting, bulk Excel-like desktop page, upload multiple images to imgbb
- Fast save strategy: cache pending in Redis, return quickly, async mongo, broadcast via Socket.IO

### Sales
- Sell: quantity, sellingPrice, customerName/phone/address, comment
- Auto calc: cost, revenue, profit, margin
- Inventory decreases atomically, product totals updated
- Refund restores stock
- **Critical Profit Rule**: Dashboard profit only from sold items. Shows inventoryValue, expectedRevenue, expectedProfit, realizedProfit, realizedRevenue separately

### Dashboard (Admin only)
- KPIs: total products, low/out, inventory value, expected vs realized profit/revenue, online users
- Charts Recharts: daily sales 30d (line), monthly (bar), top products, category pie, recent sales table, low stock list
- Realtime updates via Socket.IO + Redis invalidation
- Beautiful animations framer-motion

### Inventory
- Full CRUD, low stock alerts, out of stock, image upload, categories

### Realtime
- Redis + Socket.IO: product created/updated/deleted, sale created/refunded, user login/offline, presence, notifications, dashboard auto refresh, online users list
- Redis primary cache, Cache-Aside, invalidation by tags, Pub/Sub pattern used for broadcast
- Target approx 30MB Redis, 50MB App via TTLs & lean queries

### Export & Print
- Excel export via ExcelJS: products, sales, users, dashboard summary
- Print: beautiful print layouts for inventory report and sales report via window.open

### UI/UX
- Custom searchable select (keyboard friendly), never native select
- Modal URLs: /products/new, /products/edit/:id, /users/new, /users/:id etc, back button works
- Professional toast system, skeleton loaders, loading buttons, lazy routes, Suspense
- Glass effects avoided for perf, premium minimal design with React Icons only
- Mobile first, responsive grid, touch friendly, offline detection, reconnect notification, slow internet warning, PWA ready
- Theme light/dark/system, tested, no visual bugs

### Search
- Every page: search, filter, sort, pagination, fast response via indexed text search

### Languages
- en, ru, uz (Latin), uz-Cyrl (Cyrillic) — no hardcoded text, via i18next

### Security
- Helmet, rate limit, validation (zod), sanitize via zod, JWT, permission middleware, audit via device logs, refresh rotation, no sensitive data leaked, XSS/CSRF/NoSQL injection protected, bcrypt 12 rounds

### Telegram
- If TELEGRAM_BOT_TOKEN provided, bot starts, /myid command returns ID
- On product add & sale, notify all admins with telegramId. If user didn't start bot (403), skip silently

### Optional Realtime Audio
- WebRTC signaling via Socket.IO: webrtc:offer/answer/ice-candidate, call:request/incoming — server only signals, does not relay media (P2P), so no overload

## Project Structure
```
backend/src/
  config/ env, database, redis, socket
  constants/ roles
  middlewares/ auth, role, permission, validate, upload, errorHandler
  modules/
    auth/
    users/
    products/
    sales/
    dashboard/
    export/
    telegram/
  utils/ errors, jwt, calc, imgbb, pagination
  app.js, server.js, seed.js

frontend/src/
  components/ui/ Button, Input, Card, Select
  components/layout/ Layout
  features/ auth, dashboard, products, sales, users, profile
  hooks/ useAuth, useTheme
  lib/ axios, socket, i18n
  styles/ global.css
  App.jsx, main.jsx
```

## Running Locally

### Prerequisites
- Node 20+
- MongoDB (or Atlas URI)
- Redis (or upstash URI) - optional but recommended, app works without cache but warns

### Backend
```bash
cd backend
cp .env.example .env # fill values
npm install
npm run dev # port 4000
npm run seed # creates admin +998901234567 / admin123
```

### Frontend
```bash
cd frontend
npm install
npm run dev # port 5173 proxy /api to 4000
```

Set `VITE_API_URL=/api` and `VITE_SOCKET_URL=http://localhost:4000` for dev.

### Production
- Build frontend: `npm run build` -> dist
- Backend serves API only, frontend deployed to CDN/Vercel/Netlify with env pointing to backend URL
- Use PM2 for backend, enable Mongo Atlas, Redis Cloud, set strong JWT secrets, IMGBB_API_KEY from imgbb.com, TELEGRAM_BOT_TOKEN from BotFather

## Important Formulas
- UnitCost = (Purchase + IntlShipping + LocalShipping) / Quantity
- Sale Revenue = sellingPrice * qty
- Cost = unitCost * qty
- Profit = revenue - cost (only realized profit shows in dashboard)

## Testing Checklist
- Register first user -> admin
- Create product with shipping, watch live unit cost, try minPrice < unitCost -> warning
- Bulk entry: add 5 rows, Tab navigation
- Sell product: quantity decreases, profit calculated
- Dashboard: profit only from sold items
- Realtime: open two browsers, create product -> appears instantly
- Offline: disconnect wifi -> offline banner, reconnect -> toast
- Export Excel from products/sales/users
- Print inventory report
- Theme switch light/dark/system
- Language switch EN/RU/UZ/UZ-Cyrl
- Upload avatar -> imgbb
- Telegram: set bot token, get ID via /myid, set in profile, create product -> bot notifies

## Security Notes
- Never commit .env
- Refresh token stored in Redis, invalidated on logout/password change
- Access token blacklisted on logout via Redis (15 min TTL)
- Rate limit auth 30/15min, general 300/min

Built as commercial-grade, no placeholders, all features connected, optimized, responsive, secure, realtime, beautiful.
