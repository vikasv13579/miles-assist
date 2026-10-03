# Production-Ready Admin Dashboard

🚀 **Live Demo:** [https://miles-assist.vercel.app/](https://miles-assist.vercel.app/)

A responsive, high-performance Admin Dashboard web application built with **Next.js (App Router)**, **TypeScript**, **TanStack Query**, **Redux Toolkit**, and **Tailwind CSS**.

---

## 🌟 Features Overview

### 1. Main Dashboard (`/`)
- **Interactive KPI Cards**: Display real-time key metrics including Total Revenue, Active Users, Total Bookings, and System Uptime with percentage trends and dynamic icon indicators.
- **Revenue Analytics Chart**: Interactive double line chart (using Recharts) visualizing monthly income vs. operational expense trends with tooltips.
- **Transactions Table**: Responsive data table with search, filter tabs, status badges, and action buttons.
- **System Alerts & Health Monitors**: Live alert center with dismissible alerts and real-time server health metric progress bars.
- **Top Bar & Navigation Tabs**: Unified header with global search, notification dropdowns, profile drawer trigger, and category tabs.

### 2. Users Management (`/users`)
- Loads users from the configured Miles Assist backend API.
- Real-time search by name, email, or role.
- Status filtering and user creation, editing, and deletion through the backend API.
- Direct navigation to detailed User Profiles (`/user-profile`).

### 3. Transactions Management (`/transactions`)
- Loads persisted transactions and related user details from the backend API.
- Supports server-side search, status and amount filters, and transaction status updates.
- Direct navigation to Transaction Detail view (`/transaction-detail`).

### 4. Bookings Management (`/bookings`)
- Loads persisted bookings and related user details from the backend API.
- Supports booking creation, status updates, and rescheduling through the API.
- Direct navigation to Booking Detail view (`/booking-detail`).

### 5. Detailed Views
- **User Detail Page (`/user-profile`)**: Overview, contact info, security permissions, recent transactions, and activity history.
- **Transaction Detail Page (`/transaction-detail`)**: Financial breakdown, line item list, customer details, and invoice actions.
- **Booking Detail Page (`/booking-detail`)**: Appointment schedule, meeting link join action, note attachments, and status controls.

---

## 🛠️ Technology Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router with Turbopack) |
| **Language** | TypeScript |
| **Server State Management** | TanStack Query v5 (`@tanstack/react-query`) |
| **Client State Management** | Redux Toolkit (`@reduxjs/toolkit`, `react-redux`) |
| **Styling & UI** | Tailwind CSS v4, Lucide React Icons |
| **Data Visualization** | Recharts |
| **Backend API** | Miles Assist NestJS REST API backed by PostgreSQL |

---

## 🌐 Dynamic Backend API Integration

The frontend reads `NEXT_PUBLIC_API_URL` and sends requests through the shared client in `src/lib/auth-api.ts`. The API functions in `src/lib/api.ts` fetch dashboard metrics, users, transactions, bookings, reports, and settings from the Miles Assist NestJS backend. These records are loaded dynamically from the backend and stored in PostgreSQL.

After a successful login, the frontend stores the returned JWT and includes it as a bearer token on protected API requests. TanStack Query handles loading, caching, refetching, and mutation updates in the dashboard pages.

| Area | Backend endpoints |
|---|---|
| Authentication | `POST /auth/login`, `GET /auth/me` |
| Dashboard | `GET /dashboard/stats`, `/dashboard/charts`, `/dashboard/alerts`, `/dashboard/health`, `/dashboard/analytics`, `/dashboard/reports`, `/dashboard/settings`; `PATCH /dashboard/settings` |
| Users | `GET /users`, `GET /users/:id`, `POST /users`, `PATCH /users/:id`, `DELETE /users/:id` |
| Transactions | `GET /transactions`, `GET /transactions/:id`, `POST /transactions`, `PATCH /transactions/:id/status` |
| Bookings | `GET /bookings`, `GET /bookings/:id`, `POST /bookings`, `PATCH /bookings/:id` |

All endpoints except login require authentication. See the backend Swagger page at `/api/docs` for request parameters and response schemas.

---

## 🧠 State Management Architecture

### 1. Server State (TanStack Query)
- **Caching & Stale Time**: Handles server data fetching, automatic background revalidation, caching, and deduplication.
- **Loading & Error States**: Provides clean `isLoading` skeleton states and retryable `isError` fallbacks across all pages.
- **Separation of Concerns**: Data fetching and mutations are encapsulated in `src/lib/api.ts` and called from components via TanStack Query hooks.

### 2. Client Application State (Redux Toolkit)
- **Global UI State Slice (`src/lib/store/uiSlice.ts`)**:
  - `activeNav`: Keeps track of current active section (`dashboard`, `users`, `transactions`, `bookings`, `profile`).
  - `searchQuery`: Syncs global top bar search input across all dashboard views.
  - `sidebarOpen`: Controls mobile sidebar drawer visibility state.
  - `activeTab`: Tracks dashboard active category tab (`overview`, `analytics`, `reports`).
  - `alerts`: Manages dismissible notification alerts in real-time.

---

## 🎨 UI/UX & Responsive Design

- **Pixel-Accurate Aesthetics (Figma-to-Code)**: The application features strict adherence to provided Figma design layouts with customized exact pixel measurements, meticulously matched typography (Inter font), precise flex alignments, absolute positioning (where specified), and curated exact color codes (`#0F172A`, `#1E293B`, `#64748B`, `#4F46E5`).
  - **Pixel-Perfect Pages Configured**:
    - `UsersPage`: Strict table layouts with custom paddings and actions.
    - `TransactionsPage`: Absolute container bounds (e.g. `1136x50` headers) and export elements.
    - `BookingsPage`: Perfected 4-card KPI summary row, filtering frames (`1136x64`), and data grids matching exact specifications.
    - `UserDetailPage`: Exact component matching including the `Profile Hero Banner` layout, strict `Middle Grid` sizing (712x235px), and absolute `dot-indicator` positioning on the Recent Activity log.
    - `TopBar`: Pixel-accurate header structure featuring exactly calculated search boundaries (240x32px) and notification container sizing.
- **Mobile Responsiveness**:
  - **Desktop**: Full persistent sidebar with multi-column grid dashboard layout locked into rigid, pixel-perfect container boundaries (`1136px` content bounds).
  - **Mobile/Tablet**: Collapsible slide-out navigation drawer with dark backdrop overlay and a fluid, flexible stack layout designed gracefully around the rigid desktop structures.
- **Real-World UI States Handled**:
  - ⏳ **Loading State**: Animated skeleton loaders and spinner indicators during network requests.
  - ❌ **Error State**: Graceful error alert banners with explicit **"Try Again"** refetch buttons.
  - 📭 **Empty State**: Clear empty search/filter illustrations with "Reset Filters" action.
  - 🟢 **Active / Disabled States**: Visual feedback on active tabs, selected rows, and disabled navigation buttons.

---

## 🚀 Getting Started & Setup Instructions

### Prerequisites
- Node.js version `22.x` (required by the backend)
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/miles-assist.git
   cd miles-assist
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure and start the backend**:
   The login page needs the backend API. Configure its database and JWT secret first:
   ```bash
   cd backend
   cp .env.example .env
   ```
   Set `DATABASE_URL` to your PostgreSQL database and set `PORT=3001` so the API does not conflict with the frontend on port `3000`. Keep `CORS_ORIGIN=http://localhost:3000` for local development.

   Install backend dependencies, apply the database migrations, create the development admin account, and start the API:
   ```bash
   npm install
   npx prisma migrate dev
   npm run prisma:seed
   npm run start:dev
   ```

4. **Configure the frontend API URL**:
   The frontend uses the production API at `https://miles-assist-backend.vercel.app` by default. To use your local backend, create `.env.local` in the repository root:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```
   Set `NEXT_PUBLIC_API_URL` to override the default live API URL. Restart the frontend after changing this value.

   In Vercel, the frontend falls back to the live API if `NEXT_PUBLIC_API_URL` is unset. You can set it explicitly in the **frontend** project's environment variables for Production and/or Preview, then redeploy. The backend allows `https://miles-assist.vercel.app` and local development by default. For other frontend domains or Preview deployments, add their exact origins to the backend project's comma-separated `CORS_ORIGIN` value, then redeploy the backend.

5. **Run the frontend** in a second terminal, from the repository root:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000/login](http://localhost:3000/login) and sign in with the development seed account:
   - **Email**: `admin@example.com`
   - **Password**: `Admin@123`

   These seed credentials are for a locally seeded database only. Production login requires an administrator account provisioned in the live backend database; local seed credentials will not work there.

6. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

---

## 📁 Directory Structure

```
miles-assist/
├── src/
│   ├── app/
│   │   ├── layout.tsx                # App root layout with Redux & Query providers
│   │   ├── page.tsx                  # Main Dashboard view
│   │   ├── users/page.tsx            # Users route
│   │   ├── transactions/page.tsx     # Transactions route
│   │   ├── bookings/page.tsx         # Bookings route
│   │   ├── user-profile/page.tsx     # User Detail route
│   │   ├── transaction-detail/page.tsx # Transaction Detail route
│   │   └── booking-detail/page.tsx   # Booking Detail route
│   ├── components/
│   │   ├── Sidebar.tsx               # Responsive sidebar drawer
│   │   ├── TopBar.tsx                # Header bar with global search & notifications
│   │   ├── MobileBottomNav.tsx       # Sticky bottom navigation for mobile viewports
│   │   ├── KPIRow.tsx                # Dashboard stats cards
│   │   ├── RevenueChart.tsx          # Recharts analytics line chart
│   │   ├── TransactionsTable.tsx     # Main dashboard transactions list
│   │   ├── SystemAlerts.tsx          # Real-time alert notifications
│   │   ├── SystemHealth.tsx          # Live server health gauges
│   │   ├── UsersPage.tsx             # Complete users table & management
│   │   ├── TransactionsPage.tsx      # Complete transactions ledger
│   │   ├── BookingsPage.tsx          # Complete bookings management
│   │   ├── UserDetailPage.tsx        # User profile detail view
│   │   ├── TransactionDetailPage.tsx # Transaction receipt detail view
│   │   ├── BookingDetailPage.tsx     # Booking appointment detail view
│   │   └── AddUserModal.tsx          # New user creation modal dialog
│   └── lib/
│       ├── api.ts                    # Backend REST API functions
│       └── store/
│           ├── store.ts              # Redux Toolkit store config
│           └── uiSlice.ts            # UI state slice (Redux)
├── public/                           # Static assets & icons
├── package.json
└── README.md
```

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check [issues page](https://github.com/your-username/miles-assist/issues).

## 🧑‍💻 Author

**Your Name**
- GitHub: [@your-username](https://github.com/your-username)
- LinkedIn: [Your Name](https://linkedin.com/in/your-username)
