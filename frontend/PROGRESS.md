# AI Progress State

> Note for AI Assistant: Always update this file at the end of each session. Always read this file at the beginning of a new session to restore context.

## 🚀 Project Milestones
- [x] **Phase 1**: Initialize Next.js App Router, TailwindCSS & shadcn/ui.
- [x] **Phase 2**: Slice landing page UI (Hero, Features, Steps, Showcase, Payments, CTA).
- [x] **Phase 3**: Slice Dashboard Shell & Overview (Sidebar, Header, Layout, Balance Cards, Quick Actions, Recent Activity).
- [x] **Phase 4**: Responsive Behavior & Mobile Adaptation across all layouts.
- [x] **Phase 5**: Inner Pages (All Activity & Inbox) with polymorphic data tables.
- [x] **Phase 6**: Wallet & Balance Management (Interactive token charts and IDR cards).
- [x] **Phase 7**: Swap Token Interface (Reversible state, reusable blocks, strict fintech UI).
- [x] **Phase 8**: Send THR Page & Shared Component System (Multi-recipient chips, custom amount inputs, shared finance/forms layer).
- [x] **Phase 9**: Send THR Envelope Selection (Zustand state refactoring, live envelope preview, modular preset/upload selection tabs).
- [x] **Phase 10**: Explore Rooms Page (Component-based dashboard density layout, local search/filter state, API-ready mock service layer).
- [x] **Phase 11**: Retractable Sidebar & Dark Theme Architecture (Coordinated layout state, native `localStorage` theme toggle, semantic neutral-1 to neutral-13 mapping).
- [x] **Phase 12**: Web3 Wallet Connection (Integrated `@stellar/freighter-api`, created global Zustand store for connection state, implemented `ConnectWalletButton`).
- [x] **Phase 13**: Environment Configuration (Created `.env` and `.env.example` to define `NEXT_PUBLIC_STELLAR_NETWORK` for testnet vs mainnet switching).
- [x] **Phase 14**: Frontend Web3 Authentication Integration (SIWS).
  - Integrated `ConnectWalletButton` with the backend API (`/nonce` and `/sign-in`).
  - Added full challenge-response cryptographic signing using Freighter `signMessage`.
  - Expanded `useWalletStore` to securely track `userId` post-authentication.
  - Resolved cross-origin issues with dynamic `NEXT_PUBLIC_API_URL` parsing and implementation of Next.js Rewrites API Proxy.
  - **API Schema Compliance**: Verified the frontend cleanly consumes the strict backend standard response format. `fetch` seamlessly processes `201 Created` statuses for successful POST login flows, and correctly parses the standardized `{"key": "IS_INVALID"}` format within the `errors` JSON tree.
  - **Bugfix**: Synchronized backend signature verification with Freighter's undocumented `Stellar Signed Message:\n` prefix constraint.
  - **Bugfix (Auth Signature)**: Fixed `Invalid signature or message` by correctly hashing the prefixed payload with `SHA-256` before verification in `auth.py`, matching Freighter's internal Ed25519 payload specification. Added robust `Buffer` to `base64` serialization in `ConnectWalletButton.tsx` to handle cross-version Freighter API outputs.
  - **Bugfix (CORS/Networking)**: Resolved `TypeError: Failed to fetch` and proxy instability by implementing a robust manual proxy using Next.js API Route Handlers (`app/api/auth/[...path]/route.ts`). This guarantees JSON-formatted errors, completely bypasses browser CORS blocks, and avoids Node.js/Bun rewrite engine bugs on `127.0.0.1`.
- [x] **Phase 15**: Profile & Disconnect Flow.
  - Added interactive Profile Dropdown in the Dashboard Header.
  - Dynamically displays the user's truncated Freighter public key.
  - Implemented secure global `disconnect()` clearing Zustand store and returning user to the Landing Page.
- [x] **Phase 16**: JWT Token Management (Frontend).
  - Migrated `ConnectWalletButton.tsx` to use `axios` for robust HTTP request handling.
  - Integrated `setAuthToken` utility from `lib/auth.ts` to securely store the backend `access_token` in cookies upon successful authentication.
  - Updated `Header.tsx` disconnect flow to call `removeAuthToken()`, completely clearing the session cookie alongside the Zustand store.
- [x] **Phase 17**: User Profile Integration & Auto-Logout.
  - Installed `@tanstack/react-query` to handle server state fetching and caching.
  - Configured global `QueryClientProvider` via a new client `Providers` component in `app/layout.tsx`.
  - Created `useUserProfile` hook to automatically fetch user data from `/api/auth/me` using the stored JWT.
  - Implemented an **Auto-Logout Mechanism**: If the profile fetch fails (e.g. 401 Unauthorized), the hook triggers `removeAuthToken()`, disconnects the wallet store, and redirects to the landing page.
  - Updated `Header.tsx` to display the dynamically fetched `username` instead of static text if available.
- [x] **Phase 18**: Route Protection Proxy (Next.js 16.2+).
  - Implemented Next.js Edge `proxy.ts` (formerly `middleware.ts`) to strictly protect authenticated routes (`/dashboard`, `/sendthr`, dll).
  - Proxy intercepts requests at the server level, checking for the existence of the `access_token` cookie.
  - If a user attempts to access a protected route without connecting their wallet, they are automatically redirected to the landing page (`/`).
  - Added an auto-redirect logic: if a user is already authenticated and visits the root landing page, they are forwarded straight to `/dashboard`.
- [x] **Phase 19**: Real-time Dashboard Balances Integration.
  - Converted the `DashboardPage` and `BalanceSection` into client-side components leveraging the `useUserProfile` hook.
  - Replaced hardcoded mockup balances on the main dashboard with live, dynamic data (XLM, USDC, and total IDR value) fetched directly from the backend's on-chain Horizon Testnet integrations.
  - Shortened the display name in the Greeting component to `XXXX...XXXX` if the default username is the 56-character Stellar wallet public key.
  - **Bugfix (Type Check)**: Fixed a Next.js compilation block in `ConnectWalletButton.tsx` by correcting the option parameter passed to Freighter's `signMessage` function, passing `networkPassphrase` and `address` instead of the untyped `network` key.
- [x] **Phase 20**: Brand Identity Rebranding & Reusable Status Component.
  - **Rebranding (Berbagift)**: Rebranded the platform name from **BagiTHR** to **Berbagift** across all frontend UI components, templates, metadata titles, layouts, headers, and form logos. Standardized the brand text as a single cohesive unit in `text-primary-500`.
  - **Universal Status State (`components/shared/status-state.tsx`)**: Designed a highly flexible, reusable visual component to display empty states, warnings, processing states, successes, and failed transfers. Supports custom icons, background circle styling, text, and clean built-in button actions (`buttonText`, `onButtonClick`).
  - **Interactive Swap & Send THR Simulation**: Integrated status state pages into Swap Token and Send THR flows. Clicking Swap/Confirm triggers state flows (Processing -> Success) backed by a code constant `IS_DEV_MODE = true` for easy offline review or API transition testing. When active, these render cleanly as pure, un-bordered status pages.
  - **Activity Table Polish**: Redesigned borders and padding. Removed outer table container borders, removed header backgrounds to keep it white (`bg-white`), and made the column header box rounded at the top corners (`rounded-t-md`). Restored `border-b` dividers between table body rows and added an empty state handler using `StatusState` when there are no activity records.
- [x] **Phase 21**: Consolidated Mock Data & Scalable API/Query Library Setup.
  - **Mock Data Consolidation**: Extracted all hardcoded mock data lists from page templates and stored them in modular JSON files (`envelopes.json`, `tokens.json`, `myrooms.json`, `activities.json`) inside `frontend/mockapi/` to prevent duplication.
  - **REST API db.json Bridge**: Created a unified database blueprint `db.json` at the root of the workspace to serve as a mock backend contract for external `json-server` routing.
  - **Modular API client**: Upgraded `frontend/lib/api/client.ts` with request interceptors to automatically inject Bearer auth tokens from browser cookies.
  - **Atomic Services & Query Hooks**: Created clean, modular, and type-safe query/mutation libraries under `frontend/lib/api/` to manage rooms, envelopes, tokens, and activities. The current structure uses `lib/api/queries/` for TanStack Query hooks, `lib/api/services/` for request functions, and `lib/api/types/` for shared contracts.
  - **Auth Planning Groundwork**: Laid out auth/profile endpoints in `profile.api.ts` as placeholders/comments for future coordination with the backend team.
- [x] **Phase 22**: Togglable API Developer Modes (Local Mock vs. JSON Server).
  - **Environment Toggles**: Introduced `NEXT_PUBLIC_API_MODE=local` in `.env` and `.env.example` to let developers switch environments instantly.
  - **Dynamic Services**: Refactored `rooms.ts`, `envelopes.ts`, `tokens.ts`, and `activities.ts` service endpoints to dynamically load local mock JSONs (supporting query parsing, search parameters, and simulated latency) in `local` mode or send Axios calls in `server` mode.
- [x] **Phase 23**: Next.js API Proxy Rewrites & UI Hooks Wiring.
  - **API Proxy Routing**: Configured standard next rewrites in `next.config.ts` mapping `/api/:path*` to `NEXT_PUBLIC_API_URL` (or localhost:8888 by default) for a seamless CORS-free deployment. Updated the central Axios `apiClient` `baseURL` to relative `/api`.
  - **Explore Rooms UI Integration**: Refactored `explore/page.tsx` to read the room listing dynamically using the `useRooms` query hook.
  - **Room Detail UI Integration**: Refactored `explore/join/[roomId]/page.tsx` to fetch the room detail via `useRoomDetail`, live claims list via `useRoomActivities`, and trigger the reward claims via the `useClaimReward` mutation.
  - **My Rooms UI Integration**: Refactored `myrooms/page.tsx` to query rooms dynamically from `useRooms` and filter those matching user creator constraints.
  - **Activities UI Integration**: Refactored the dashboard `ActivityTable` component and `dashboard/activity/page.tsx` page to pull live transaction logs via the `useActivities` query hook.
- [x] **Phase 24**: Mock API Contract Hardening & Integration Audit Fixes.
  - **Room Data Normalization**: Hardened `lib/api/services/rooms.ts` with a normalizer that converts inconsistent raw room objects from `rooms.json`, `myrooms.json`, `room-detail.json`, json-server, and future backend envelopes into the canonical `Room` interface before data reaches UI components.
  - **Local Mode Crash Prevention**: Fixed the root cause where `myrooms.json` lacked `creator`, `statusText`, `isSaved`, and `isHighReward`, while `RoomCard` expected those fields. `getRooms()` now safely fills defaults and keeps Explore Rooms from crashing when local mock mode merges public rooms and user-created rooms.
  - **Room Detail Field Alignment**: Updated room detail rendering to use canonical fields (`winners`, `joined`, `maxParticipants`) instead of older detail-only fields (`totalWinners`, `joinedParticipants`, `totalParticipants`). This prevents `undefined/undefined` stats when room detail comes from json-server `/rooms/:id` instead of the dedicated `room-detail.json` mock.
  - **json-server Compatible Filtering**: Changed room list filtering so search/status filters are applied inside the frontend service for both local and server modes. This avoids depending on non-standard json-server query semantics for search fields and keeps local mock, json-server, and backend transitions predictable.
  - **Response Envelope Support**: Added `unwrapApiData<T>()` to `lib/api/client.ts`, allowing services to consume both raw json-server arrays/objects and backend responses shaped like `{ data: T }` without special-case logic in components.
  - **Shared Error Formatting**: Added `getErrorMessage()` to `lib/api/client.ts` and reused it in mutation/auth-adjacent flows so unknown Axios/backend errors become readable UI messages without falling back to unsafe `any` typing.
  - **API Rewrite Contract Correction**: Standardized `NEXT_PUBLIC_API_URL` as an origin (`http://localhost:8888`), not a path (`http://localhost:8888/api`). `next.config.ts` now trims trailing slashes and maps `/api/:path*` to `${NEXT_PUBLIC_API_URL}/:path*`, so `/api/rooms` correctly proxies to json-server `/rooms`.
  - **Create Room Mutation Wiring**: Connected `hooks/use-create-room-state.ts` to `useCreateRoom()` so Create Room and Save Draft now flow through the same service/query invalidation path as server mode, instead of only showing simulated alerts.
  - **Tokens & Envelopes Runtime Validation**: Wired Balance and Envelope selection/preview to `useTokens()` and `useEnvelopes()` while preserving static fallbacks from `lib/data/`. This lets endpoints be exercised without changing the visible UI or making the page blank if the mock server is unavailable.
  - **Lint & Type Safety Cleanup**: Removed high-risk `any` usage around services, chart data, activity tables, and room detail props. Verified `npm run lint` and `npx tsc --noEmit` pass cleanly after the integration fixes.
- [x] **Phase 25**: Profile Settings Page.
  - Implemented the `useUpdateProfile` mutation hook in `lib/api/queries/profile.ts` for updating the user profile via `PUT /api/auth/me`.
  - Created a dedicated Profile Settings page at `app/(main)/dashboard/profile/page.tsx`.
  - Styled using the strict fintech SaaS aesthetic (cards, restrained layout width).
  - Wired form inputs to allow updating `username` and `email` with success and error feedback.
  - Implemented an **Optimistic UI Update** using TanStack Query's `setQueryData` combined with `invalidateQueries`. This instantly synchronizes the newly updated `username` to the global cache without waiting for the background refetch, completely eliminating Header and avatar initials flashing.
  - Updated Sidebar and Header dropdowns to map to `/dashboard/profile` correctly.
  - Refactored the `Disconnect Wallet` flow in `Header.tsx` to use `window.location.href = "/"` instead of the Next.js router, forcing a hard browser refresh to explicitly clear React Query cache and application state for security.
- [x] **Phase 26**: Send THR Web3 Integration (Smart Transactions).
  - Installed `@stellar/stellar-sdk` and integrated `@stellar/freighter-api` to process real on-chain Web3 transactions.
  - Created `lib/api/services/users.ts` to seamlessly convert usernames entered in the UI into target wallet addresses using `GET /api/users/{username}`.
  - Developed `lib/stellar/transactions.ts` to dynamically assemble `TransactionBuilder` operations. Supports multi-send (splitting the total amount across multiple recipients evenly) and automatically resolves asset configurations (Native XLM or testnet USDC via Issuer Address).
  - Replaced the mock timeout in `envelope-preview.tsx` with a real Web3 flow: fetches wallet addresses -> builds XDR payload -> prompts Freighter for user signature -> submits to Horizon testnet -> handles success/failure states gracefully.
  - Upgraded the Send THR entry module (`sendthr-module.tsx`) to pull the real-time asset balance and IDR equivalent dynamically via `useUserProfile`, removing the static mock data. It also now handles inline validation and automatically processes un-submitted username text in the input field when hitting Continue.

## 🏗️ Current Codebase Architecture & Context

The project follows a strict fintech SaaS aesthetic: compact spacing (rounded-md), subtle hierarchy (border-neutral-4), and avoids oversized shadows or flashy gradients. The architecture favors modularity and state isolation.

### 0. Global UI & Interaction Guidelines
- **Global Cursor Rules**: A root CSS directive (`app/globals.css`) enforces `cursor-pointer` on all `<button>`, `<a>`, and `[role="button"]` elements. This guarantees a consistent UX for actionable items across the entire app without needing repetitive utility classes.
- **Shared UI Icons**: Reusable custom SVGs (e.g., `SwapIcon`) are centralized in `components/ui/` for consistent branding across multiple pages and components.
- **Strict Color Semantics**: The application exclusively uses a defined 13-step neutral palette (`neutral-1` to `neutral-13`) and semantic tokens (`bg-background`, `bg-card`, `border-border`). Tailwind's default hundreds (`neutral-500`, `neutral-900`) are explicitly avoided to guarantee perfect dark mode inversion.

### 1. App Shell, Navigation & Theme Orchestration
The layout shell has been deeply refactored to support complex coordinated states without introducing heavy global state managers (like Zustand) where unnecessary.
- **`DashboardLayout` (State Orchestrator)**: The root client provider for the dashboard interface. Manages two critical boolean states: `isMobileMenuOpen` and `isDesktopSidebarOpen`. Passes these states downwards to dynamically adjust main content margins (`lg:ml-[280px]` vs `lg:ml-[80px]`).
- **`Sidebar`**: Reacts to `isDesktopOpen` to smoothly transition its width via native CSS. Implements conditional rendering to hide text labels and bottom cards when retracted, leaving only icons. The invite card utilizes a fixed-width clipping technique (`overflow-x-hidden` on the `<aside>`) rather than height manipulation to ensure smooth opacity fades without layout jumps or weird text reflows. The logo transitions seamlessly between the Sidebar and Header based on this state.
- **`Header`**: Detects if the sidebar is retracted (`!isDesktopSidebarOpen`). If true, it visually injects a redundant "BagiTHR" brand logo on its left side to simulate a persistent YouTube-like branding UX.
- **Theme System (`ThemeToggle`)**: A standalone client component that interfaces directly with `localStorage` and toggles the `.dark` class on `document.documentElement`. The `globals.css` maps the `.dark` variant to shift variables like `--background` from `neutral-1` to `#1e1e1e`, creating a soft, Claude-like premium aesthetic without blinding contrasts.
- **Toggle UI & Borders**: `ThemeToggle` was refined into a compact segmented pill control (`p-0.5`, `w-7 h-6`). Border rendering was standardized by globally replacing hardcoded `border-neutral-5` with `border-border`. `globals.css` defines `--border` as `neutral-5` in light mode and `neutral-8` in dark mode, ensuring borders adapt synchronously across all cards and layouts without component-level overrides. Backgrounds explicitly avoid `dark:bg-black` to strictly inherit `bg-background`.

### 2. Dashboard Overview (`app/dashboard/page.tsx`)
- Acts as the primary assembly point for the dashboard widgets.
- Uses stateless presentational components (`Greeting`, `QuickActionsSection`) alongside data wrappers (`BalanceSection`).
- **`RecentActivitySection`**: Uses a structural shell that imports the shared `ActivityTable` specifically for the overview, injecting shortened default data.

### 3. Shared Data Display Tier
- **`ActivityTable` (Polymorphic Component)**: The core data table. Accepts an optional `data?: ActivityRowProps[]` prop. Rendered by both `RecentActivitySection` and `AllActivityPage`, functioning as a pure CSS Grid matrix.
- **`ActivityRow`**: Handles complex rendering of data objects (icons, text, timestamps). Uses decoupled DOM nodes: a flex layout for mobile and a strict `grid-cols-5` track for desktop to bypass CSS `display: contents` bugs.
- **`StatusBadge`**: Ingests literal strings (`'success'`, `'processing'`) and outputs specific Tailwind color tokens.

### 4. Deep-Dive Pages (Activity & Inbox)
- **`AllActivityPage` (`app/dashboard/activity/page.tsx`)**: Injects an extended `ALL_ACTIVITY_DATA` array into `<ActivityTable />`. Uses a double-border structural wrapper to isolate the outer padded layout from the raw table elements.
- **`InboxPage` (`app/dashboard/inbox/page.tsx`)**: Driven by a `TABS` array state map. Generates category buttons with conditional styling derived from a `tab.active` boolean and numeric `tab.count` badges. Utilizes native `overflow-x-auto` for mobile scrolling.

### 5. Wallet & Balance Management (`app/dashboard/balance/page.tsx`)
The Balance page is a highly interactive, state-driven Client Component designed for dynamic token analysis.
- **Centralized Data Config (`lib/data/tokens.ts`)**: Acts as the single source of truth for token configurations (XLM, USDC). Exports strict TS interfaces (`TokenConfig`, `ChartDataPoint`). This allows adding new tokens without touching UI components.
- **Stateful Controller**: Uses `useState('XLM')` to track `activeTokenId`. The `toggleToken` function safely transitions state and passes downward data flow (injecting the active `TokenConfig`) into presentation components.
- **`ChartHeader`**: Dynamically binds background colors (`token.logoBg`), icons, and formatted currency amounts (`toLocaleString()`). The "Change token" button triggers the parent `onToggleToken` prop.
- **`ChartRangeTabs`**: Manages visual toggles for timeframes using internal `activeRange` state and subtle emerald backgrounds.
- **`BalanceChart`**: Utilizes `recharts` to render a `ResponsiveContainer`. Configured with a `type="natural"` interpolation for an organic curve, and a custom `linearGradient` `<defs>` tag (fading from 0.35 to 0.0 opacity) for a lightweight fintech aesthetic. The `margin={{ bottom: 30 }}` prevents X-axis clipping.
- **Action Cards**: 
  - **`TransferCard`**: Uses constrained text widths (`max-w-[480px]`) and a dedicated security badge (`bg-amber-50`).
  - **`IdrBalanceCard`**: Implements a precise layout structure handling numeric values and two primary action buttons (Withdraw vs. Top Up) using `flex-1` for perfect width distribution.
- **Responsive Grid**: Uses `grid-cols-1 md:grid-cols-2` for the lower cards. This enforces an exact 50/50 symmetrical width distribution on desktop (preventing components from feeling unnaturally large or imbalanced), while safely collapsing into a vertical stack on mobile.

### 6. Swap Token Interface (`app/dashboard/swap/page.tsx`)
The Swap Token page relies on a self-contained, highly modular architecture to manage bidirectional UI flow.
- **Centralized Utils (`lib/utils/currency.ts`)**: Extracted all domain logic (mock exchange rates, fiat calculation) and string parsing/formatting into pure, independent helper functions to adhere to Clean Code principles.
- **`useSwapState` Hook**: Acts strictly as a React state orchestrator. It manages reversible UI state (`fromToken`, `toToken`, amounts, percentages) but delegates complex math and formatting to the `currency` utils.
- **Reversible Logic**: The `handleSwapDirection` explicitly swaps string values and token IDs without triggering side-effect heavy calculation loops, making the UI feel instantly responsive.
- **`SwapModule`**: The central visual container. Stays constrained using `max-w-[740px]` rather than stretching edge-to-edge, maintaining an editorial, premium SaaS aesthetic. The "Swap Direction" button utilizes a structural `flex-col` gap layout (rather than absolute overlap positioning) to float naturally between the FROM and TO cards.
- **`SwapBlock` (Strict Validation)**: A highly reusable UI component handling both "FROM" and "TO" states. Implements strict regex-based decimal input validation (`isValidDecimalInput`) combined with `inputMode="decimal"` to prevent invalid non-numeric keystrokes natively on the client. Uses strict Tailwind constraints to avoid generic DEX styling.

### 7. Send THR & Envelope Selection
The Send THR flow uses a global state management system via Zustand to persist user selections across multiple steps and pages.
- **Global Zustand Store (`hooks/use-send-thr-state.ts`)**: Replaces local state with a `zustand` store (`useSendThrStore`). This persists Recipients, Amount, Message, and Envelope selection data seamlessly when navigating from the form (`/sendthr`) to the envelope customization step (`/sendthr/envelope`).
- **Form Module (`components/sendthr/sendthr-module.tsx`)**: Manages multi-recipient chips and custom amount inputs. Validates input state before routing to the envelope page.
- **Envelope Selection Architecture (`/sendthr/envelope`)**: Uses a responsive 2-column layout.
  - **`EnvelopeSelector`**: Tab-driven UI separating preset templates (`EnvelopeTemplateCard` mapped from `lib/data/envelopes.ts`) from the custom image upload view (`UploadSection`).
  - **API-Ready Custom Upload**: `UploadSection` simulates an API upload flow, dynamically appending items to the Zustand `uploadedDesigns` array and enabling native deletion.
  - **Live Preview (`EnvelopePreview`)**: A sticky sticky-on-desktop panel that reacts instantly to Zustand store changes, displaying the final aesthetic card with the dynamically generated `bgUrl`, recipient names, and configured amount overlay in a premium frosted-glass presentation.

### 8. Explore Rooms Page (`app/dashboard/rooms/page.tsx`)
The Explore Rooms page is built with a scalable, component-based architecture prioritizing density, scanning efficiency, and API-readiness.
- **Mock Service Layer**: `room.service.ts` intercepts mock JSON files, mimicking a REST backend interface with artificial network delays (`setTimeout`). This ensures UI components don't require heavy refactoring when connected to a real database.
- **Modular Component Isolation (`components/rooms/`)**: Extracted all complex UI elements from the main page file:
  - `RoomCard`: A self-contained component combining `ParticipantStack`, `RoomStats`, and `RoomActions`.
  - `ParticipantStack`: Manages negative overlapping margins dynamically based on a z-index loop to create a connected circle visualization.
  - `RoomFilterTabs` & `RoomSearch`: Presentational components that pass their controlled values back to the parent layout for data filtering.
- **Responsive Fluid Grid**: Utilizes Tailwind grid (`grid-cols-1` to `2xl:grid-cols-5`) to maximize display density on ultra-wide screens without leaving dead space, strictly following the provided reference density.

### 9. Room Detail Page (`app/dashboard/rooms/join/[roomId]/page.tsx`)
The Room Detail page introduces dynamic routing and detailed component isolation.
- **Breadcrumb Navigation**: Utilizes a dynamic breadcrumb sequence ("Explore Rooms > Detail Room") rather than pulling from global routing arrays, maintaining localized context mapping.
- **Mock API Expansion**: Established two new mock JSON schemas: `room-detail.json` for deep statistics and countdown state, and `room-activity.json` for a simulated real-time feed of participants joining/leaving.
- **Component Architecture**: Deeply isolated UI units in `components/rooms/detail/`:
  - `RoomStatsCard` and `RoomDataBlock` manage the core metrics (Reward Pool, Winners, Participants).
  - `ClaimInstructionSection` iteratively maps `ClaimInstructionStep` components avoiding hardcoded JSX duplication.
  - `LiveActivityCard` and `LiveActivityItem` present a scrollable feed of the latest events.
- **State & Custom Hooks**: Created `useCountdown` hook to independently manage the `setInterval` logic, providing clean, formatted timestamps and signaling a reactive `isFinished` state which directly influences the `RoomStatusBanner` (`waiting` vs `claim_open` vs `ended`) and disables Action Buttons natively.
- **Responsive Layout & Visual Polish**: Adopts a highly responsive `75% 25%` grid layout for optimal dashboard breathing room. Fully refined spacing, breadcrumb navigation, and scrollbars to rigorously match the Figma specification.

### 10. Create Room Module & State Config (`components/rooms/create-room-module.tsx`)
The Create Room interface provides creator campaign controls:
- **`CreateRoomModule`**: Root form component containing isolated sub-field components (`RoomIdentityField`, `RoomDescriptionField`, `CapacityWinnersStartsSection`, and `RewardPoolSection`).
- **State Management (`hooks/use-create-room-state.ts`)**: Manages input states for room identity, capacity, winner limitations, session timing, and reward pool token configuration.
- **Draft Persistence**: Implements `handleSaveDraft` and standard form submission `handleSubmit` callbacks to register new campaign rooms.

### 11. Web3 Integration (Freighter Wallet)
Introduced the first blockchain connection layer to the application using `@stellar/freighter-api`.
- **Global Wallet State (`hooks/use-wallet-state.ts`)**: Built a simple, persistent Zustand store (`useWalletStore`) to manage the Freighter public key and `isConnected` state, allowing any component to react to the wallet status seamlessly.
- **`ConnectWalletButton`**: Extracted the Connect Wallet functionality into a dedicated Client Component to cleanly separate interactive Freighter logic (`isConnected`, `requestAccess`) from Server Components like the landing page. Redirects the user directly to the `/dashboard` upon successful key retrieval. Additionally, it dynamically renders a "Dashboard" button instead of "Connect Wallet" if a persistent connection state is already established, bypassing redundant authorization flows.

### 12. Environment Configuration
- **Network Setting Layer**: Established the `.env` and `.env.example` system containing `NEXT_PUBLIC_STELLAR_NETWORK=testnet`. This provides a single source of truth for the application to toggle between Stellar's `testnet` and `public` networks, ensuring future Horizon API requests and Soroban RPC calls respect the current environment.
- **Wallet Network Validation**: Integrated the `NEXT_PUBLIC_STELLAR_NETWORK` variable directly into the `ConnectWalletButton` client component using `@stellar/freighter-api`'s `getNetworkDetails()`. If the user's active Freighter network does not match the application's environment configuration, the UI gracefully blocks the connection request and prompts them to switch networks manually. *(Note: Programmatic auto-switching is blocked by Freighter's security model, ensuring users maintain explicit control over their network connections).*
- **Dual API Mode Toggle**: Configured `NEXT_PUBLIC_API_MODE` (values: `local` or `server`). Setting it to `local` allows developers to run the application completely offline with static JSON mock files mapping endpoints natively, bypassing network calls for rapid slicing. Setting it to `server` enables active Axios client requests for `json-server` or backend API tests.
- **API URL Rule**: `NEXT_PUBLIC_API_URL` should be an origin only, for example `http://localhost:8888`, because Next.js rewrites already add the proxied path. Do not set it to `http://localhost:8888/api` for json-server unless the backend actually exposes resources under `/api/*`.
- **json-server Command**: The root `db.json` is intended to run with `json-server --watch db.json --port 8888`. With the current rewrite, frontend calls to `/api/rooms`, `/api/tokens`, `/api/envelopes`, and `/api/activities` resolve to `http://localhost:8888/rooms`, `http://localhost:8888/tokens`, `http://localhost:8888/envelopes`, and `http://localhost:8888/activities`.

### 13. Frontend API Integrations & Real-Time Charting
- **Binance Klines API & Hooks (`lib/api/binance.ts`, `lib/api/queries/binance.ts`)**: Integrates the public Binance API to retrieve historical pricing candlesticks. Implements backward infinite scroll (lazy loading past data points) using a customized TanStack Query hook, preventing visual layout jumps or scroll shifts.
- **LightweightChart Wrapper (`components/balance/lightweight-chart.tsx`)**: Replaces old widgets with TradingView's high-performance `lightweight-charts` v5. Binds to `activeTokenId` (XLM vs USDC) and renders real-time scrollable area series.
- **SSR/Hydration Safety (`components/balance/chart-token.tsx`)**: Bypasses Server-Side Rendering (SSR) hydration crashes for dynamic third-party widgets by leveraging a client-mounted state check (`isMounted`) inside `useEffect`.
- **Axios API Client & Hooks (`lib/api/client.ts`)**: Configures the base HTTP client settings, handling authorization headers for token verification and querying backend routes like `/me` to update testnet Horizon balances dynamically on the client dashboard.

### 14. Scalable API Client & Query Library (Phase 21 Documentation)
This architecture decouples the raw Axios request layer from React components and coordinates local state query lifecycles through TanStack Query hooks. We restructured the code according to the Kelola-Web layout, separating queries, services, and types into nested directories. The services dynamically switch execution paths depending on the `NEXT_PUBLIC_API_MODE` configuration to support both offline mockup slicing and active json-server contract testing.

#### Library Directory Structure
```
frontend/lib/api/
├── client.ts
├── queries/
│   ├── index.ts
│   ├── rooms.ts
│   ├── envelopes.ts
│   ├── tokens.ts
│   ├── activities.ts
│   └── binance.ts
├── queries.ts
├── services/
│   ├── index.ts
│   ├── rooms.ts
│   ├── envelopes.ts
│   ├── tokens.ts
│   ├── activities.ts
│   └── profile.ts
├── services.ts
├── types/
│   ├── index.ts
│   ├── api.ts
│   ├── rooms.ts
│   ├── envelopes.ts
│   ├── tokens.ts
│   ├── activities.ts
│   └── profile.ts
└── types.ts
```

#### Core API Types (`lib/api/types/`)
* **`api.ts`**: Standard generic wrapper for backend responses (`ApiResponse<T>`).
* **`rooms.ts`**: Defines entity interfaces for `Creator`, `Room`, and `RoomActivity`.
* **`envelopes.ts`**: Defines `EnvelopeTemplate`.
* **`tokens.ts`**: Defines wallet balance and candle trend types (`ChartDataPoint`, `TokenConfig`).
* **`activities.ts`**: Defines user transactions list (`Activity`).
* **`profile.ts`**: Defines user profile details and sub-balances.
* **`index.ts`**: Combines and exports all the nested types.

#### Axios Interceptors Config (`lib/api/client.ts`)
* **Request Interceptor**: Evaluates cookie storage for the `access_token` on the client-side (`typeof window !== 'undefined'`). If found, dynamically injects the token under the HTTP Header: `Authorization: Bearer <token>`.
* **Response Interceptor**: Rejects with `error.response?.data`, `error.message`, or the raw error object, so service callers receive the most useful backend-provided error payload available.
* **`unwrapApiData<T>()`**: Normalizes response payloads from both json-server and wrapped backend APIs. json-server usually returns a raw array/object (`Room[]`, `Room`), while the production backend may return `{ data, message, errors }`. Services should call this helper and return raw domain objects to components.
* **`getErrorMessage()`**: Converts unknown thrown values into a safe display string. Use this in mutation `onError` callbacks and auth-adjacent UI flows instead of manually indexing `err.response?.data`.

#### Atomic Service Functions (`lib/api/services/`)
Services return the raw payload directly (`Promise<Room[]>`, `Promise<Room>`, etc.) by automatically checking for and unwrapping the standard API response envelopes, ensuring drop-in compatibility with both unwrapped `json-server` databases and wrapped production backends. Components should never consume raw JSON imports or Axios responses directly if a service/query hook exists.

1. **Rooms Service (`rooms.ts`)**:
   * `getRooms(params?: { status?: string, search?: string })`: Fetches array of explore/created campaign rooms from `/rooms`. Returns `Promise<Room[]>`.
   * `getRoomDetail(id: string)`: Fetches a single room detail from `/rooms/:id`. Returns `Promise<Room>`.
   * `getRoomActivities(roomId: string)`: Fetches a room's active participants claiming log from `/room-activities`. Returns `Promise<RoomActivity[]>`.
   * `createRoom(roomData: Omit<Room, 'id'>)`: Submits new campaign payload via POST to `/rooms`. Returns `Promise<Room>`.
   * `claimReward(roomId: string)`: Compete for room's THR reward allocation via POST to `/rooms/:id/claim`. Returns `Promise<{ success: boolean; txHash?: string }>`.
   * **Normalizer Guardrail**: `rooms.ts` owns all conversion from loose `RawRoom` fields into canonical `Room`. This is required because `frontend/mockapi/myrooms.json` is intentionally lighter than `rooms.json`, and `room-detail.json` historically used detail-specific fields. Do not duplicate this normalization in pages or cards.
   * **Search/Filter Strategy**: Filtering is applied after fetching all rooms, even in server mode. This keeps json-server compatible and avoids relying on backend-specific search query formats until the real backend contract is finalized.
2. **Envelopes Service (`envelopes.ts`)**:
   * `getEnvelopes()`: Fetches list of preset card templates from `/envelopes`. Returns `Promise<EnvelopeTemplate[]>`.
3. **Tokens Service (`tokens.ts`)**:
   * `getTokens()`: Fetches active crypto balances and candlestick trends from `/tokens`. Returns `Promise<TokenConfig[]>`.
4. **Activities Service (`activities.ts`)**:
   * `getActivities()`: Fetches current user's general transactions from `/activities`. Returns `Promise<Activity[]>`.
5. **Profile Service (`profile.ts` - comment placeholders only)**:
   * Left as planning/comments to avoid breaking active custom authentication. Outlines methods `getProfile` and `updateProfile` for later integration.

#### TanStack Query Hooks (`lib/api/queries/`)
All hooks are structured with strict caching logic:
* **`useRooms(params)`**: Queries explore lists. Configures `staleTime: 5 minutes`. Uses query keys `['rooms', params]`.
* **`useRoomDetail(roomId)`**: Queries individual room metrics. Configures `staleTime: 2 minutes`. Uses query keys `['rooms', 'detail', roomId]`.
* **`useRoomActivities(roomId)`**: Retrieves participant stream. Configures `refetchInterval: 10 seconds` for real-time live claiming updates. Uses query keys `['rooms', 'activities', roomId]`.
* **`useCreateRoom()`**: Mutation hook to POST a room. Configures `onSuccess` to call `queryClient.invalidateQueries({ queryKey: ['rooms'] })` for instant list updates.
* **`useClaimReward()`**: Mutation hook to claim THR. Configures `onSuccess` to invalidate detailed stats and activity logs of the targeted room.
* **`useEnvelopes()`**: Queries templates. Configures `staleTime: 1 hour`. Uses query keys `['envelopes']`.
* **`useTokens()`**: Queries balances. Configures `staleTime: 1 minute`. Uses query keys `['tokens']`.
* **`useActivities()`**: Queries transaction list. Configures `staleTime: 30 seconds`. Uses query keys `['activities']`.
* **`useBinanceKlines(symbol, range)`**: Queries historical candle metrics. Polls current candle data every 1 minute.
* **`useBinanceKlinesInfinite(symbol, range)`**: Infinite scroll backward candlestick data query.

#### UI Integration Guardrails After Phase 24
* **Explore Rooms**: `app/(main)/community/explore/page.tsx` should receive only normalized `Room[]` from `useRooms`. `RoomCard` imports `Room` from `lib/api/types`, not the legacy `services/room.service` type.
* **Room Detail**: `RoomStatsCard` expects canonical `Room`, reads `winners`, `joined`, and `maxParticipants`, and uses a fallback for optional `rewardPoolIdr`. Avoid reintroducing `totalWinners`, `joinedParticipants`, or `totalParticipants` unless the canonical type is intentionally changed.
* **My Rooms**: `app/(main)/community/myrooms/page.tsx` maps normalized `Room` objects into the UI-specific `MyRoomCard` shape. The current mock identifies user rooms by `id` prefix `myroom`; replace this with a real owner/creator field once backend auth/user ownership is available.
* **Create Room**: `hooks/use-create-room-state.ts` now builds an `Omit<Room, 'id'>` payload and calls `useCreateRoom()` for both create and draft flows. This keeps local mode, json-server, and backend submission paths aligned.
* **Activity Table**: `ActivityTable` accepts `Activity[]` from `lib/api/types`. When `data` is omitted it fetches recent activity through `useActivities()` and slices the first four rows for dashboard overview.
* **Balance Tokens**: Balance page calls `useTokens()` but falls back to `TOKENS` from `lib/data/tokens.ts` if the endpoint is unavailable or empty. This preserves UI stability while still exercising the API contract.
* **Envelope Templates**: Envelope selector and preview call `useEnvelopes()` but fall back to `PRESET_ENVELOPES` from `lib/data/envelopes.ts`. Keep the fallback until backend media/template delivery is stable.
* **Auth Boundary**: Route protection and auto-logout are intentionally disabled for UI/backend coordination. Do not treat the current auth setup as production-ready; middleware and profile auto-logout should be re-enabled only after backend auth endpoints are finalized.
* **Validation Baseline**: After the Phase 24 fixes, `npm run lint` and `npx tsc --noEmit` pass. Future changes should keep both commands clean before handoff.
