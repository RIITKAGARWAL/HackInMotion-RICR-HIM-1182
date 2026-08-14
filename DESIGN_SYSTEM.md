# SpenSight Design System & UI Specifications

## 1. Design Philosophy
SpenSight employs a **Modern Glassmorphism** aesthetic built on an ultra-dark slate base (`#0b0f19`). The interface emphasizes depth through multi-layered blurred surfaces, dynamic glow accents, 1px micro-borders, and high-contrast accessibility standards.

---

## 2. Color Palette & Token Hierarchy

### Base & Backgrounds
- **App Canvas (`--background`)**: `#0b0f19`
- **Glass Card Overlay (`--card-bg`)**: `rgba(17, 24, 39, 0.75)`
- **Solid Elevated Surface (`--card-bg-solid`)**: `rgba(17, 24, 39, 0.92)`
- **Sidebar Surface**: `rgba(15, 23, 42, 0.88)`

### Borders & Overlays
- **Subtle Border (`--card-border`)**: `rgba(255, 255, 255, 0.08)`
- **Emphasized Border (`--card-border-strong`)**: `rgba(255, 255, 255, 0.14)`

### Brand & Functional Accents
- **Primary Brand (`--primary`)**: `#3b82f6` (Blue)
- **Primary Hover (`--primary-hover`)**: `#2563eb`
- **Brand Glow (`--primary-glow`)**: `rgba(59, 130, 246, 0.35)`
- **Accent Purple (`--accent-purple`)**: `#8b5cf6`
- **Positive / Cashflow In (`--accent-green`)**: `#10b981`
- **Negative / Alert (`--accent-red`)**: `#ef4444`
- **Warning (`--accent-amber`)**: `#f59e0b`
- **Transfers / Info (`--accent-cyan`)**: `#06b6d4`

### Typography & Neutrals
- **Text Primary (`--text-white`)**: `#f8fafc`
- **Text Muted (`--text-muted`)**: `#94a3b8`

---

## 3. Elevation, Glassmorphism & Motion

### Blur & Shadows
- **Glassmorphic Filter**: `blur(16px)` / `blur(18px)` (Sidebar & Modals)
- **Card Shadow**: `0 12px 40px rgba(0, 0, 0, 0.4)`
- **Primary Glow**: `0 8px 32px rgba(59, 130, 246, 0.35)`

### Radii Hierarchy
- **Large Container / Cards (`--radius-lg`)**: `18px` (22px for Modals)
- **Medium Elements / Tables (`--radius-md`)**: `12px`
- **Small Badges / Utility Buttons (`--radius-sm`)**: `8px`
- **Pills / Chips**: `999px` / `20px`

### Transitions & Animation Curves
- **Standard Transition Curve**: `all 0.25s cubic-bezier(0.4, 0, 0.2, 1)`
- **Progress Fill Curve**: `width 0.6s cubic-bezier(0.4, 0, 0.2, 1)`
- **Keyframe Sequences**: `popIn`, `slideIn`, `fadeIn`, `spin`, and `bounce`

---

## 4. Layout Architecture & Component Blueprint
- **Layout Architecture**: 220px fixed left sidebar with responsive off-canvas drawer on screens $< 900\text{px}$.
- **Ambient Lighting**: Double pseudo-element ambient radial glow blobs (`55vw` blurred at `120px`).
- **Interactive Floating Action Button (FAB)**: $62\times62\text{px}$ gradient action trigger with $90^\circ$ rotation feedback on hover.
- **Micro-Interactions**: Hover lifts (`translateY(-2px)`), active scaling (`scale(0.97)`), and tabular numeric alignment for financial data.