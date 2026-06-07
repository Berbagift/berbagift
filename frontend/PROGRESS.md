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
  - Resolved cross-origin issues with dynamic `NEXT_PUBLIC_API_URL` parsing.
  - **API Schema Compliance**: Verified the frontend cleanly consumes the strict backend standard response format. `fetch` seamlessly processes `201 Created` statuses for successful POST login flows, and correctly parses the standardized `{"key": "IS_INVALID"}` format within the `errors` JSON tree.
  - **Bugfix**: Synchronized backend signature verification with Freighter's undocumented `Stellar Signed Message:\n` prefix constraint.
  - **Bugfix (Auth Signature)**: Fixed `Invalid signature or message` by correctly hashing the prefixed payload with `SHA-256` before verification in `auth.py`, matching Freighter's internal Ed25519 payload specification. Added robust `Buffer` to `base64` serialization in `ConnectWalletButton.tsx` to handle cross-version Freighter API outputs.
- [x] **Phase 15**: Profile & Disconnect Flow.
  - Added interactive Profile Dropdown in the Dashboard Header.
  - Dynamically displays the user's truncated Freighter public key.
  - Implemented secure global `disconnect()` clearing Zustand store and returning user to the Landing Page.

## 🏗️ Current Codebase Architecture & Context

The project follows a strict fintech SaaS aesthetic: compact spacing (rounded-md), subtle hierarchy (border-neutral-4), and avoids oversized shadows or flashy gradients. The architecture favors modularity and state isolation.

### 0. Global UI & Interaction Guidelines
- **Global Cursor Rules**: A root CSS directive (`app/globals.css`) enforces `cursor-pointer` on all `<button>`, `<a>`, and `[role="button"]` elements. This guarantees a consistent UX for actionable items across the entire app without needing repetitive utility classes.
- **Shared UI Icons**: Reusable custom SVGs (e.g., `SwapIcon`) are centralized in `components/ui/` for consistent branding across multiple pages and components.
- **Strict Color Semantics**: The application exclusively uses a defined 13-step neutral palette (`neutral-1` to `neutral-13`) and semantic tokens (`bg-background`, `bg-card`, `border-border`). Tailwind's default hundreds (`neutral-500`, `neutral-900`) are explicitly avoided to guarantee perfect dark mode inversion.

### 1. App Shell, Navigation & Theme Orchestration
The layout shell has been deeply refactored to support complex coordinated states without introducing heavy global state managers (like Zustand) where unnecessary.
- **`DashboardLayout` (State Orchestrator)**: The root client provider for the dashboard interface. Manages two critical boolean states: `isMobileMenuOpen` and `isDesktopSidebarOpen`. Passes these states downwards to dynamically adjust main content margins (`lg:ml-[280px]` vs `lg:ml-[80px]`).
- **`Sidebar`**: Reacts to `isDesktopOpen` to smoothly transition its width via native CSS. Implements conditional rendering to hide text labels and bottom cards when retracted, leaving only icons. The logo transitions seamlessly between the Sidebar and Header based on this state.
- **`Header`**: Detects if the sidebar is retracted (`!isDesktopSidebarOpen`). If true, it visually injects a redundant "BagiTHR" brand logo on its left side to simulate a persistent YouTube-like branding UX.
- **Theme System (`ThemeToggle`)**: A standalone client component that interfaces directly with `localStorage` and toggles the `.dark` class on `document.documentElement`. The `globals.css` maps the `.dark` variant to shift variables like `--background` from `neutral-1` to `neutral-12`, creating a soft, Claude-like premium aesthetic without blinding contrasts.

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

### 10. Web3 Integration (Freighter Wallet)
Introduced the first blockchain connection layer to the application using `@stellar/freighter-api`.
- **Global Wallet State (`hooks/use-wallet-state.ts`)**: Built a simple, persistent Zustand store (`useWalletStore`) to manage the Freighter public key and `isConnected` state, allowing any component to react to the wallet status seamlessly.
- **`ConnectWalletButton`**: Extracted the Connect Wallet functionality into a dedicated Client Component to cleanly separate interactive Freighter logic (`isConnected`, `requestAccess`) from Server Components like the landing page. Redirects the user directly to the `/dashboard` upon successful key retrieval. Additionally, it dynamically renders a "Dashboard" button instead of "Connect Wallet" if a persistent connection state is already established, bypassing redundant authorization flows.

### 11. Environment Configuration
- **Network Setting Layer**: Established the `.env` and `.env.example` system containing `NEXT_PUBLIC_STELLAR_NETWORK=testnet`. This provides a single source of truth for the application to toggle between Stellar's `testnet` and `public` networks, ensuring future Horizon API requests and Soroban RPC calls respect the current environment.
- **Wallet Network Validation**: Integrated the `NEXT_PUBLIC_STELLAR_NETWORK` variable directly into the `ConnectWalletButton` client component using `@stellar/freighter-api`'s `getNetworkDetails()`. If the user's active Freighter network does not match the application's environment configuration, the UI gracefully blocks the connection request and prompts them to switch networks manually. *(Note: Programmatic auto-switching is blocked by Freighter's security model, ensuring users maintain explicit control over their network connections).*
