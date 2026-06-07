# BagiTHR AI Development Rules

> **Catatan untuk AI Assistant:** File ini adalah "Source of Truth" untuk gaya penulisan kode dan arsitektur. Patuhi aturan ini di setiap *generate* kode.

## 1. Project Overview
BagiTHR is a modern Web3 social finance platform built with:
- Next.js App Router
- TypeScript
- TailwindCSS
- shadcn/ui

The application focuses on realtime interaction, social engagement, mobile-first experience, and scalable frontend architecture. The project uses AI-assisted development workflow.

All generated code should prioritize maintainability, readability, modularity, and clean architecture.

## 2. Core Development Principles
- Prefer simple and maintainable solutions. Avoid overengineering.
- Follow existing project patterns.
- Prioritize readability over clever abstractions.
- Build reusable systems instead of one-off implementations.

## 3. Architecture Rules
- Use feature-based architecture.
- Keep components modular and focused. Avoid massive page components.
- Separate UI from business logic.
- Prefer composition over deeply nested components.
- **Avoid:** duplicated logic, giant utility files, and unnecessary abstractions.

## 4. Next.js Rules
- Use App Router conventions.
- Prefer Server Components by default.
- Use Client Components (`"use client"`) only when interactivity is required.
- Avoid unnecessary `useEffect` usage and client-side fetching.
- Keep routing structure clean and scalable.

## 5. TypeScript Rules
- Use strict TypeScript typing.
- **Avoid using `any`.**
- Prefer explicit types for component props. Keep type definitions readable.

## 6. UI & Styling Rules (TailwindCSS)
- **STRICT DESIGN SYSTEM COMPLIANCE:** Never hallucinate, improvise, or invent new UI patterns, colors, or spacing. Always strictly adhere to the defined CSS variables and design system tokens provided by the designer.
- **ICONS:** MUST use **Flaticon Uicons (uiticons)** with classes like `fi fi-rr-*`. DO NOT use `lucide-react`. The CDN link for Uicons must be included in the root layout (`app/layout.tsx`).
- Prefer semantic utility composition.
- Avoid extremely long `className` blocks. Extract reusable UI patterns into components.
- Use `cn()` utility (dari `clsx` + `tailwind-merge`) for conditional classes.
- Use semantic design tokens. Avoid hardcoded colors (e.g. `#123456`) and random arbitrary spacing values (e.g. `w-[13px]`).
- **Avoid:** excessive visual complexity, cluttered layouts, random Tailwind values, and AI-invented UI components that are not in the design spec.

## 7. Responsive & Realtime Rules
- **Mobile-first by default.** Ensure layouts work on smaller screens.
- Prioritize touch-friendly interaction.
- Realtime UI should feel responsive, synchronized, fast, and alive.
- Prioritize loading states, optimistic updates, and realtime feedback.
- **Avoid:** blocking interactions and delayed visual feedback.

## 8. Animation Rules
- Use animation intentionally. Keep transitions smooth and subtle.
- Prioritize responsiveness over flashy effects. Use Framer Motion when needed.

## 9. Security Rules
- Never expose secrets or private keys (`.env`).
- Avoid unsafe client-side sensitive logic.
- Follow secure authentication practices.

## 10. AI Coding Behavior Rules
- Follow existing project structure. Do not introduce new patterns unnecessarily.
- Do not rewrite unrelated code.
- Explain important architectural decisions briefly.
- Keep implementations clean and avoid unnecessary dependencies.
