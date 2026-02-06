# Swiis On-Call Rota - Implementation Plan

## Overview

A mobile-first web application for Swiis Foster Care to manage on-call staff rotations. The system supports weekday overnight shifts (Mon-Fri 5pm-9am), weekend shifts (Fri 5pm - Mon 9am), staff directories, shift swaps, handovers, and escalation chains.

---

## 1. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 15 (App Router, TypeScript) | Server Components reduce client JS; file-based routing matches the navigation structure |
| **Styling** | Tailwind CSS v4 | Matches the mockup designs; CSS-first `@theme` config for Swiis brand tokens |
| **Fonts** | Inter (body), Montserrat (headings) via `next/font` | Self-hosted for performance; matches mockups |
| **Icons** | Google Material Symbols | Used throughout all mockup designs |
| **State** | Zustand | Simple global state (theme, calendar position, filters) |
| **Data Fetching** | React Server Components + SWR | Server Components for initial loads; SWR for polling (e.g. current on-call) |
| **Database** | SQLite via Prisma ORM | Zero-setup dev database; swap to PostgreSQL later by changing one line |
| **Auth** | NextAuth.js v5 (Credentials) | Simple email/password for internal staff; extensible to SSO later |
| **Testing** | Vitest + React Testing Library + Playwright | Unit, component, and E2E coverage |
| **PWA** | `manifest.ts` + service worker | Home-screen installable for on-call staff using mobile phones |

---

## 2. Project Structure

```
Swiis-Rota/
├── prisma/
│   ├── schema.prisma              # Database schema
│   ├── seed.ts                    # Development seed data
│   └── dev.db                     # SQLite file (gitignored)
├── public/
│   ├── icons/                     # PWA icons
│   └── sw.js                      # Service worker
├── src/
│   ├── app/
│   │   ├── manifest.ts            # PWA manifest
│   │   ├── layout.tsx             # Root layout (fonts, providers)
│   │   ├── page.tsx               # Dashboard / Home
│   │   ├── (auth)/
│   │   │   └── login/page.tsx     # Login page
│   │   ├── (main)/
│   │   │   ├── layout.tsx         # Main layout with bottom nav
│   │   │   ├── rota/
│   │   │   │   ├── page.tsx       # 3-month calendar view
│   │   │   │   └── [shiftId]/page.tsx
│   │   │   ├── staff/
│   │   │   │   ├── page.tsx       # Staff directory
│   │   │   │   └── [staffId]/page.tsx
│   │   │   ├── alerts/page.tsx    # Notifications
│   │   │   └── profile/
│   │   │       ├── page.tsx       # User profile
│   │   │       └── settings/page.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── shifts/            # CRUD + /current
│   │       ├── swap-requests/     # CRUD + approve/reject
│   │       ├── staff/             # List + escalation
│   │       ├── handovers/         # CRUD
│   │       └── activity/          # Feed
│   ├── components/
│   │   ├── ui/                    # Button, Card, Badge, Avatar, Dialog, etc.
│   │   ├── layout/                # BottomNav, Header, PageContainer
│   │   ├── dashboard/             # OnCallCard, QuickActions, UpcomingShifts, etc.
│   │   ├── rota/                  # MonthCalendar, ShiftCell, AddShiftSheet, etc.
│   │   ├── staff/                 # StaffList, StaffCard, EscalationList
│   │   └── shifts/                # ShiftDetail, SwapRequestForm, HandoverForm
│   ├── lib/
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── auth.ts                # NextAuth config
│   │   ├── utils.ts               # Utilities (cn, date helpers)
│   │   └── constants.ts           # Shift rules, business constants
│   ├── hooks/                     # useCurrentShift, useTheme, useMediaQuery
│   ├── stores/app-store.ts        # Zustand store
│   ├── types/                     # TypeScript types
│   └── services/                  # Server-side query functions
│       ├── shift-service.ts
│       ├── staff-service.ts
│       └── activity-service.ts
└── tests/
    ├── unit/
    ├── components/
    └── e2e/
```

---

## 3. Data Models

### User
| Field | Type | Description |
|---|---|---|
| id | String (CUID) | Primary key |
| email | String (unique) | Login credential |
| passwordHash | String | Bcrypt hash |
| firstName | String | |
| lastName | String | |
| role | Enum | SUPPORT_WORKER, TEAM_LEAD, MANAGER, ADMIN |
| phone | String? | Contact number |
| avatarUrl | String? | Profile image |
| isActive | Boolean | Soft delete |
| escalationOrder | Int? | Position in escalation chain (null = not on chain) |

### Shift
| Field | Type | Description |
|---|---|---|
| id | String (CUID) | Primary key |
| date | DateTime | Calendar date this shift belongs to |
| type | Enum | WEEKDAY_OVERNIGHT, WEEKEND |
| startTime | DateTime | Actual start (e.g., Fri 5pm) |
| endTime | DateTime | Actual end (e.g., Mon 9am) |
| notes | String? | Shift notes |

### ShiftAssignment
| Field | Type | Description |
|---|---|---|
| id | String (CUID) | Primary key |
| shiftId | String (unique FK) | Links to Shift |
| primaryStaffId | String (FK) | Primary on-call |
| secondaryStaffId | String (FK) | Secondary on-call |

> **Why separate Shift and ShiftAssignment?** A swap modifies the assignment without changing the time slot. It also allows creating unassigned shifts.

### SwapRequest
| Field | Type | Description |
|---|---|---|
| id | String (CUID) | Primary key |
| shiftId | String (FK) | Which shift to swap |
| requesterId | String (FK) | Who wants to swap |
| targetStaffId | String (FK) | Who they want to swap with |
| status | Enum | PENDING, APPROVED, REJECTED, CANCELLED |
| reason | String? | |
| reviewedBy | String? | Manager who acted on it |

### Handover
| Field | Type | Description |
|---|---|---|
| id | String (CUID) | Primary key |
| shiftId | String (FK) | Which shift |
| fromUserId | String (FK) | Outgoing staff |
| toUserId | String (FK) | Incoming staff |
| notes | String | Free-text handover notes |
| openItems | String? | JSON of pending cases |

### ActivityLog
| Field | Type | Description |
|---|---|---|
| id | String (CUID) | |
| userId | String (FK) | Who performed the action |
| action | Enum | SHIFT_ASSIGNED, SWAP_REQUESTED, SWAP_APPROVED, HANDOVER_COMPLETED, etc. |
| description | String | Human-readable description |

### Notification
| Field | Type | Description |
|---|---|---|
| id | String (CUID) | |
| userId | String (FK) | Recipient |
| title | String | |
| body | String | |
| type | Enum | SHIFT_REMINDER, SWAP_REQUEST, HANDOVER, ESCALATION |
| isRead | Boolean | |

### SupportMetric
| Field | Type | Description |
|---|---|---|
| id | String (CUID) | |
| periodStart | DateTime | |
| periodEnd | DateTime | |
| responseRate | Float | % |
| carerSatisfaction | Float | % |
| placementStability | Float | % |

---

## 4. Pages & Components

### 4.1 Dashboard (Home)

| Component | Description |
|---|---|
| `OnCallCard` | Shows current primary + secondary on-call staff with avatars, roles, and CALL/HANDOVER buttons |
| `QuickActions` | 2x2 grid: 3-Month Rota, Request Swap, Team Directory, Escalation List |
| `ScheduleDefinition` | Static cards showing weekday (5pm-9am) and weekend (Fri 5pm - Mon 9am) rules |
| `UpcomingShifts` | List of next 3-5 shifts with date, staff names, type badge |
| `SupportInsights` | Three donut-chart cards: Response Rate, Carer Satisfaction, Placement Stability |
| `RecentActivity` | Feed of recent events (swap approvals, new assignments, etc.) |

### 4.2 Rota (3-Month Calendar)

| Component | Description |
|---|---|
| `ThreeMonthView` | Scrollable container rendering three `MonthCalendar` components |
| `MonthCalendar` | 7-column CSS grid. Orange header with month/year. Day abbreviation row. |
| `ShiftCell` | Day cell: date number, weekday (blue bg) or weekend (orange bg), abbreviated staff names |
| `ShiftFilter` | Filter by staff member or shift type (weekday/weekend) |
| `AddShiftSheet` | Bottom sheet form: date picker, auto-detected type, primary/secondary staff dropdowns |

### 4.3 Staff Directory

| Component | Description |
|---|---|
| `StaffList` | All active staff with search |
| `StaffCard` | Avatar, name, role, phone. Quick call/message buttons |
| `EscalationList` | Numbered chain of escalation contacts |

### 4.4 Alerts

| Component | Description |
|---|---|
| `NotificationList` | Paginated notifications with icons, read/unread states |
| Mark-all-read | Bulk action button |

### 4.5 Profile

| Component | Description |
|---|---|
| `ProfileHeader` | Avatar, name, role, contact details |
| `ThemeToggle` | Dark/light mode switch |
| `SignOutButton` | Logs out via NextAuth |

### 4.6 Bottom Navigation

Four tabs: **Home** (dashboard icon), **Rota** (calendar icon), **Alerts** (notifications icon), **Profile** (person icon). Active tab highlighted in Swiis orange.

---

## 5. Design System (Tailwind `@theme`)

```css
@import "tailwindcss";

@theme {
  --color-swiis-orange: #f47932;
  --color-swiis-orange-light: #fef3ec;
  --color-swiis-blue: #0091cd;
  --color-swiis-blue-light: #e6f5fb;
  --color-swiis-green: #8dc63f;
  --color-swiis-green-light: #f0f9e6;
  --color-swiis-purple: #542e81;
  --color-swiis-purple-light: #f0ebf5;
  --color-swiis-red: #b91c1c;
  --color-swiis-red-light: #fef2f2;
  --color-background-light: #f8f9fa;
  --color-background-dark: #111827;

  --font-sans: 'Inter', sans-serif;
  --font-heading: 'Montserrat', sans-serif;
}
```

Dark mode: class-based toggling (`dark` class on `<html>`), persisted in Zustand + localStorage.

---

## 6. API Routes

### Shifts
| Method | Route | Description |
|---|---|---|
| GET | `/api/shifts` | List shifts (query: `from`, `to`, `staffId`, `type`) |
| POST | `/api/shifts` | Create shift + assignment |
| GET | `/api/shifts/current` | Get currently active on-call shift |
| GET | `/api/shifts/[shiftId]` | Get single shift detail |
| PUT | `/api/shifts/[shiftId]` | Update shift or reassign |
| DELETE | `/api/shifts/[shiftId]` | Delete shift |

### Swap Requests
| Method | Route | Description |
|---|---|---|
| GET | `/api/swap-requests` | List (filterable by status) |
| POST | `/api/swap-requests` | Create new request |
| PUT | `/api/swap-requests/[id]` | Approve or reject (manager only) |

### Staff
| Method | Route | Description |
|---|---|---|
| GET | `/api/staff` | List all active staff |
| GET | `/api/staff/escalation` | Get ordered escalation chain |

### Handovers
| Method | Route | Description |
|---|---|---|
| GET | `/api/handovers` | List (filterable by shift) |
| POST | `/api/handovers` | Create handover notes |

### Activity & Notifications
| Method | Route | Description |
|---|---|---|
| GET | `/api/activity` | Paginated activity feed |
| GET | `/api/notifications` | Current user's notifications |
| PUT | `/api/notifications/mark-read` | Mark as read |

---

## 7. Business Logic: Shift Rules

```
WEEKDAY_OVERNIGHT:
  Start: Monday-Friday at 5:00 PM
  End:   Next day at 9:00 AM
  Staff: Primary + Secondary

WEEKEND:
  Start: Friday at 5:00 PM
  End:   Monday at 9:00 AM
  Staff: Primary + Secondary
  Note:  Spans 3 calendar days (Fri/Sat/Sun)
```

**Current on-call determination**: Query shifts where `startTime <= NOW AND endTime >= NOW`. Return the matching shift assignment with primary and secondary staff.

**Weekend calendar display**: A single weekend shift appears in Friday, Saturday, and Sunday cells. Query uses date range overlap: `shift.startTime <= dayEnd AND shift.endTime >= dayStart`.

---

## 8. Implementation Phases

### Phase 1: Foundation
- Initialize Next.js 15 + TypeScript + Tailwind v4
- Set up Swiis design tokens and fonts
- Build root layout and (main) layout with `BottomNav`
- Create primitive UI components (Button, Card, Badge, Avatar, Skeleton)
- Create stub pages for all routes
- Set up Zustand store with theme toggling

**Deliverable**: Navigable app shell with bottom tabs, dark mode, and Swiis branding.

### Phase 2: Database & Auth
- Set up Prisma with SQLite and full schema
- Run initial migration
- Write seed script with realistic 3-month sample data
- Configure NextAuth.js with Credentials provider
- Build login page and route protection middleware

**Deliverable**: Seeded database, working login, protected routes.

### Phase 3: Dashboard
- Implement `getCurrentOnCallShift()` query
- Build OnCallCard with primary/secondary staff display
- Build QuickActions grid
- Build ScheduleDefinition cards
- Build UpcomingShifts list
- Build SupportInsights metric donut cards
- Build RecentActivity feed

**Deliverable**: Fully functional dashboard with real data.

### Phase 4: Calendar / Rota View
- Implement `getShiftsByDateRange()` query
- Build MonthCalendar grid with weekday/weekend styling
- Build ShiftCell with staff name display
- Build ThreeMonthView with month navigation
- Build ShiftFilter (staff dropdown, type chips)
- Build AddShiftSheet bottom sheet form
- Build shift detail page

**Deliverable**: Browsable 3-month calendar with shift display, filtering, and creation.

### Phase 5: Staff & Escalation
- Build StaffList and StaffCard components
- Build EscalationList with numbered chain
- Add `tel:` and `sms:` links for mobile contact
- Build staff detail page

**Deliverable**: Staff directory with one-tap contact and escalation chain.

### Phase 6: Swap & Handover Workflows
- Build SwapRequestForm and approval flow
- Build HandoverForm with notes and open items
- Add activity logging to all operations
- Display swap status and handover notes on shift detail

**Deliverable**: Complete swap request and handover workflows.

### Phase 7: Notifications & Activity
- Implement notification creation triggers
- Build alerts page with notification list
- Add unread badge to navigation
- Build full activity feed with pagination

**Deliverable**: Working notification system and activity feed.

### Phase 8: PWA & Polish
- Add PWA manifest and service worker
- Full dark mode audit across all components
- Loading states and error boundaries for all routes
- Responsive audit (320px-430px)
- Empty state designs

**Deliverable**: Installable PWA with polished, production-ready UI.

### Phase 9: Testing
- Unit tests for business logic (shift time calculation, date utilities)
- Component tests for key UI (OnCallCard, MonthCalendar, ShiftCell)
- API route integration tests
- E2E tests with Playwright (login, dashboard, create shift, swap)
- Accessibility audit

**Deliverable**: Tested, accessible, production-ready application.

---

## 9. Known Challenges

| Challenge | Mitigation |
|---|---|
| Weekend shifts span 3 calendar days | Use date range overlap query, not simple date equality |
| Concurrent edits by multiple managers | SWR revalidation on focus; consider WebSockets in a future phase |
| SQLite single-writer concurrency | Acceptable for small team (<50 users); migrate to PostgreSQL via Prisma if needed |
| Dark mode in Tailwind v4 | Configure class strategy: `@variant dark (&:where(.dark, .dark *))` |
| Phone call/SMS from app | Use native `tel:` and `sms:` links initially; integrate Twilio later if needed |

---

## 10. Role-Based Access

| Role | Permissions |
|---|---|
| SUPPORT_WORKER | View rota, view own shifts, request swaps, create handovers |
| TEAM_LEAD | All above + approve/reject swaps for their team |
| MANAGER | All above + create/edit/delete any shift, manage all staff |
| ADMIN | All above + manage users, roles, system settings |
