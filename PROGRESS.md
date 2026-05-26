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

## 🏗️ Current Codebase Architecture & Context

The project follows a strict fintech SaaS aesthetic: compact spacing (rounded-md), subtle hierarchy (border-neutral-200), and avoids oversized shadows or flashy gradients. The architecture favors modularity and state isolation.

### 0. Global UI & Interaction Guidelines
- **Global Cursor Rules**: A root CSS directive (`app/globals.css`) enforces `cursor-pointer` on all `<button>`, `<a>`, and `[role="button"]` elements. This guarantees a consistent UX for actionable items across the entire app without needing repetitive utility classes.
- **Shared UI Icons**: Reusable custom SVGs (e.g., `SwapIcon`) are centralized in `components/ui/` for consistent branding across multiple pages and components.

### 1. App Shell & Navigation Layer
- **`DashboardLayout` (Client Component)**: The root provider for dashboard state. Manages the `isMobileMenuOpen` boolean. Passes state to `Header` (for drawer triggers) and `Sidebar` (for visibility).
- **`Header` (Dynamic Routing)**: Uses `usePathname` to dynamically render the current page title (e.g., "Swap Token", "All Activity"). This centralizes the routing state and eliminates redundant `<h1 />` tags across all internal page components.
- **`Sidebar`**: Utilizes `usePathname` for dynamic active states. Enforces strict styling consistency: active links use the brand's primary emerald background (`bg-[#16a34a]`) with white text, while inactive links uniformly use `text-black`. Adapts seamlessly to mobile overlays.

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

### 7. Send THR Page (`app/sendthr/page.tsx`)
The Send THR page provides a centered, high-density dashboard form layout designed for multi-recipient rewards transfers.
- **`useSendThrState` Hook**: Manages local form state, including a dynamic `Recipient` array, amount validations using clean numeric utils, active token selections, and optional custom text message parameters.
- **Recipient input mechanism**: Implements an interactive multi-chip list (`RecipientChip`) inside a border-monitored wrapping field. Pressing enter automatically appends new usernames with custom initials calculations and allows instant removal.
- **`TokenAmountField` integration**: Utilizes size `lg` formatting to render high-contrast inputs (`text-3xl`) and enlarged fiat badges (`text-xl`) to capture a premium fintech tool feel.
- **`DashboardLayout` compatibility**: Placed inside a customized `/sendthr` root app router group which imports and wraps the page under the global app layout controls while retaining the precise sidebar navigation.

