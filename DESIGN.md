---
colors:
  primary: "oklch(30% 20% 270deg)"
  primary_hover: "oklch(35% 22% 270deg)"
  secondary: "oklch(35% 18% 300deg)"
  accent: "oklch(35% 18% 300deg)"
  accent_hover: "oklch(40% 20% 300deg)"
  danger: "#ef4444"
backgrounds:
  app: "#020205"
  deep: "#05070b"
  panel: "#0a0b0f"
  card: "#111318"
  elevated: "#1a1d24"
  header: "#171b24"
  glass: "rgba(10, 11, 15, 0.8)"
text:
  primary: "#ffffff"
  secondary: "#e4e4e7"
  muted: "#71717a"
  dim: "#52525b"
borders:
  color: "rgba(255, 255, 255, 0.08)"
  soft: "rgba(255, 255, 255, 0.05)"
  light: "rgba(255, 255, 255, 0.1)"
border_radius:
  sm: "6px"
  md: "10px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
shadows:
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)"
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
  glow: "0 0 20px oklch(30% 20% 270deg / 0.4)"
  glow_accent: "0 0 20px oklch(35% 18% 300deg / 0.4)"
transitions:
  fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)"
  normal: "300ms cubic-bezier(0.4, 0, 0.2, 1)"
typography:
  font_family: "'Inter', system-ui, -apple-system, sans-serif"
---

# Overview

The design system provides a dark, cinematic aesthetic optimized for video editing and creative content production. It features a layered background system, cyan and emerald accent colors, and consistent component styling across 30+ specialized studios and tools. The system emphasizes functionality, visual hierarchy, and performance for professional creative workflows.

# Colors

The color palette uses deep indigo (oklch(30% 20% 270deg)) as the primary color for active states and accents, creating a cinematic and professional feel. Complementary purple (oklch(35% 18% 300deg)) serves success states and highlights. The layered dark background system remains from void (#020205) to elevated surfaces (#1a1d24). Text hierarchy includes white primary, muted secondary, and dim tertiary colors. Borders use 8% opacity white overlays. Neutrals are tinted toward the primary hue for cohesion.

# Typography

Typography uses Inter font family with system fallbacks and Work Sans for headings. The scale follows a 1.25 ratio between heading levels for clear hierarchy. Font weights include 400 (regular), 500 (medium), and 600 (semibold) for contrast. Body text uses 400 weight with optimized line heights (1.5-1.6) for readability during extended editing sessions. Responsive scaling maintains proportions across devices.

# Components

Components follow a standardized structure with consistent button styles (primary-btn, icon-btn, circle-btn), modal overlays, and card layouts. Interactive elements use enforced hover and drag states. The design system enforcer ensures visual consistency across all components and apps.

# Patterns

The interface maintains the consistent two-column layout with preview/timeline left and sidebar right across all 30+ apps. Headers contain navigation with brand logo and action buttons. Floating rails provide quick access to common functions. Spacing uses varied padding for better visual rhythm, avoiding monotonous identical margins. Timeline-based editing remains the core interaction pattern, with drag-and-drop media libraries and AI-powered panels. Information hierarchy is enhanced through refined alignment and spacing relationships.

# Motion

Motion uses smooth transitions with cubic-bezier easing curves and exponential ease-out for natural deceleration. Interactive elements provide immediate visual feedback through hover states and micro-interactions. Loading states use spinning indicators with consistent timing. Transitions between apps maintain context while updating content areas. Purposeful animations enhance user experience without affecting layout properties.