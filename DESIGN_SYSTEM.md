# AgroVision AI Design System (v2.1)
## Modern Enterprise Agricultural Framework

### 1. Visual Identity & Brand
The visual language of AgroVision AI is designed to balance **Agricultural Vitality** (Emerald) with **Enterprise Professionalism** (Slate).

### 2. Design Tokens

| Token | Value | Rationale |
| :--- | :--- | :--- |
| **Primary (Brand)** | `#10b981` (Emerald 500) | Represents growth, health, and precision agriculture. |
| **Secondary (Growth)** | `#84cc16` (Lime 500) | Used for accentuating active status and fresh data. |
| **Neutral (Surface)** | `#f8fafc` (Slate 50) | Clean background for data-heavy dashboards. |
| **Neutral (Text)** | `#0f172a` (Slate 900) | High-contrast readability for farmers and experts. |
| **Accent (Alert)** | `#fbbf24` (Amber 400) | Professional attention for disease warnings. |

### 3. Typography Scale
- **Headings (Outfit)**: High-tech, geometric sans-serif for clarity.
- **Body (Inter)**: Highly legible at small sizes for mobile field use.
- **Scale**:
  - `Display`: 96px (Tracking -0.05em, Font Weight 900)
  - `H1`: 64px (Tracking -0.04em, Font Weight 800)
  - `Body`: 16px (Leading 1.6, Font Weight 500)

### 4. Layout & Spacing
- **Base Unit**: 4px
- **Containers**: Max-width 1280px with 24px horizontal gutters.
- **Radius**: Large, rounded corners (24px - 48px) for a modern, friendly SaaS feel.

### 5. Interaction Guidelines
- **Micro-interactions**: Use `framer-motion` for subtle scale transitions (1.05x) on hover.
- **Micro-feedback**: Subtle haptic-style pulses on diagnostic completion.
- **Glassmorphism**: 80% opacity with 16px blur for sticky headers and floating metrics.

### 6. Accessibility (WCAG 2.1)
- **Contrast**: All primary text maintains a > 4.5:1 ratio against backgrounds.
- **Touch Targets**: Min 48x48px for all mobile interactive elements.
- **Skeleton States**: Used during all async fetches to reduce perceived latency.
