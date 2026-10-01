# Production-Ready Admin Dashboard

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
- Integrated with public REST API (`https://dummyjson.com/users`).
- Real-time search by name, email, or role.
- Role (`Admin`, `Editor`, `Viewer`) and Status (`Active`, `Inactive`, `Suspended`) filtering.
- Interactive **Add User Modal** to create new users with validation.
- Multi-selection with bulk actions (Delete selected, Change role).
- Direct navigation to detailed User Profiles (`/user-profile`).

### 3. Transactions Management (`/transactions`)
- Integrated with public REST API (`https://dummyjson.com/carts`).
- Financial cart and transaction ledger displaying items, user details, totals, payment status, and timestamps.
- Status filters (`All`, `Completed`, `Pending`, `Refunded`).
- Direct navigation to Transaction Detail view (`/transaction-detail`) with refund processing and receipt printing simulation.

### 4. Bookings Management (`/bookings`)
- Integrated with public REST API (`https://dummyjson.com/todos`).
- Scheduled appointment list with service types, durations, customer info, and status badges.
- Tabbed filters (`All`, `Confirmed`, `Completed`, `Pending`, `Cancelled`).
- Quick actions to mark confirmed/completed or reschedule.
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
| **Public REST API** | DummyJSON (`https://dummyjson.com`) |

---

## 🌐 Public REST APIs Used

This application connects to free, public REST APIs from **DummyJSON** to populate live data:

1. **Users API**: `https://dummyjson.com/users?limit=30`
   - Supplies real user profiles, names, email addresses, roles, and avatar images.
2. **User Detail API**: `https://dummyjson.com/users/{id}`
   - Supplies individual user profile information, contact numbers, and company metadata.
3. **Transactions/Carts API**: `https://dummyjson.com/carts?limit=20`
   - Supplies financial transactions, total cart prices, item quantities, and product item breakdowns.
4. **Bookings/Todos API**: `https://dummyjson.com/todos?limit=20`
   - Supplies real service appointments, scheduled task status, and completion flags.

---

## 🧠 State Management Architecture

### 1. Server State (TanStack Query)
- **Caching & Stale Time**: Handles server data fetching, automatic background revalidation, caching, and deduplication.
- **Loading & Error States**: Provides clean `isLoading` skeleton states and retryable `isError` fallbacks across all pages.
- **Separation of Concerns**: Data fetching logic is encapsulated in `src/lib/api.ts` and called inside components via `useQuery` hooks.

### 2. Client Application State (Redux Toolkit)
- **Global UI State Slice (`src/lib/store/uiSlice.ts`)**:
  - `activeNav`: Keeps track of current active section (`dashboard`, `users`, `transactions`, `bookings`, `profile`).
  - `searchQuery`: Syncs global top bar search input across all dashboard views.
  - `sidebarOpen`: Controls mobile sidebar drawer visibility state.
  - `activeTab`: Tracks dashboard active category tab (`overview`, `analytics`, `reports`).
  - `alerts`: Manages dismissible notification alerts in real-time.

---

## 🎨 UI/UX & Responsive Design

- **Pixel-Accurate Aesthetics**: Sleek dark sidebar (`#1E293B`), glassmorphism accents, curated slate color palette, sharp borders, and subtle shadows.
- **Mobile Responsiveness**:
  - **Desktop**: Full persistent sidebar with multi-column grid dashboard layout.
  - **Mobile/Tablet**: Collapsible slide-out navigation drawer with dark backdrop overlay and a sticky mobile bottom navigation bar (`MobileBottomNav`).
  - Tables and cards automatically adapt with horizontal scrolling and responsive stack layouts.
- **Real-World UI States Handled**:
  - ⏳ **Loading State**: Animated skeleton loaders and spinner indicators during network requests.
  - ❌ **Error State**: Graceful error alert banners with explicit **"Try Again"** refetch buttons.
  - 📭 **Empty State**: Clear empty search/filter illustrations with "Reset Filters" action.
  - 🟢 **Active / Disabled States**: Visual feedback on active tabs, selected rows, and disabled navigation buttons.

---

## 🚀 Getting Started & Setup Instructions

### Prerequisites
- Node.js version `18.x` or higher
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

3. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production**:
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
│       ├── api.ts                    # Public REST API client functions (DummyJSON)
│       └── store/
│           ├── store.ts              # Redux Toolkit store config
│           └── uiSlice.ts            # UI state slice (Redux)
├── public/                           # Static assets & icons
├── package.json
└── README.md
```

---

## 📝 License

This project is created for evaluation purposes as part of the Frontend Developer Round 2 Practical Assignment.
