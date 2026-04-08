# Design System Specification: Editorial Intelligence

## 1. Overview & Creative North Star
**Creative North Star: The Architectural Advisor**

This design system moves away from the frantic, high-saturation "green-tech" aesthetic. Instead, it adopts the persona of a high-end architectural firm—authoritative, understated, and impeccably organized. We are building a "Digital Curator" experience: an interface that doesn't just show data, but narrates a home’s energy evolution through sophisticated, layered surfaces and a rigid commitment to white space.

The system breaks the "startup template" look by utilizing **intentional asymmetry** and **tonal layering**. We bypass the traditional "box-and-line" layout in favor of an editorial grid where content depth is felt through color shifts rather than seen through borders. This creates a conversational flow that feels like a premium consultation rather than a software form.

---

## 2. Colors: The Tonal Spectrum
We utilize a palette of deep, grounded earth tones and "warm-tech" neutrals. The goal is "Energy-Forward" without being "Eco-Cliche."

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section content. Traditional lines create visual noise that degrades the premium feel.
*   **Boundaries:** Define sections solely through background color shifts (e.g., a `surface-container-low` section sitting on a `surface` background).
*   **Nesting:** Use the surface-container tiers (Lowest to Highest) to create "nested" depth. Each inner container should use a slightly higher tier to define its importance, mimicking stacked sheets of fine, heavy-weight paper.

### Core Palette
*   **Primary (`#002428`):** Deep Teal. Used for primary narrative elements and grounding the UI.
*   **Secondary (`#795900`):** Warm Amber. Our "Focus" color. Use sparingly for high-value CTAs or progress indicators.
*   **Tertiary (`#022600`):** Muted Sage. Reserved for "Positive" outcomes—savings, rebates, and energy gains.
*   **Background (`#faf9f6`):** A warm, off-white gallery bone. This provides the "canvas" for our card-based architecture.

### The "Glass & Gradient" Rule
To add visual "soul," use subtle linear gradients (e.g., `primary` to `primary_container`) for hero buttons or primary cards. For floating overlays, implement **Glassmorphism**: use semi-transparent surface colors with a `backdrop-blur` (12px–20px) to allow the background energy to bleed through.

---

## 3. Typography: The Editorial Voice
Our typography scale is designed for readability and "Expert" tone. We pair **Manrope** (Display/Headline) for its modern, geometric authority with **Inter** (Body/Label) for its functional clarity.

*   **Display-LG (3.5rem / Manrope):** Used for singular, high-impact statements. Tight letter-spacing (-0.02em).
*   **Headline-MD (1.75rem / Manrope):** The standard "Step" header in the conversational flow.
*   **Title-LG (1.375rem / Inter):** Used for card titles. Bold, clear, and trustworthy.
*   **Body-LG (1rem / Inter):** The primary conversational voice. Increased line-height (1.6) for effortless reading.
*   **Label-MD (0.75rem / Inter):** Mid-gray (`on_surface_variant`). Used for metadata and secondary labels. Never use pure black for secondary text.

---

## 4. Elevation & Depth: Tonal Layering
In this system, "Elevation" is a color property, not a shadow property.

*   **The Layering Principle:** Stacking follows a logic of light. 
    *   **Base:** `surface` (#faf9f6)
    *   **Sectioning:** `surface_container_low` (#f4f3f0)
    *   **Interactive Cards:** `surface_container_lowest` (#ffffff)
*   **Ambient Shadows:** If a card must "float" (e.g., a modal or a primary satellite map tooltip), use a shadow with a 24px-32px blur at 4%–6% opacity. The shadow color should be a tinted teal (`primary`), never a neutral gray.
*   **The "Ghost Border" Fallback:** If accessibility requires a container edge, use a `1px` stroke of `outline_variant` at **15% opacity**. It should be felt as a "suggestion" of a line, not a hard stop.

---

## 5. Signature Components

### Primary Buttons
*   **Style:** High-radius (`full`), using the `primary` color.
*   **Interaction:** On hover, transition to `primary_container`. 
*   **Padding:** Generous horizontal padding (32px) to communicate importance and "breathable" luxury.

### Conversational Input Fields
*   **Style:** Large, `surface_container_lowest` backgrounds with no visible borders. 
*   **Focus State:** A soft 2px outer glow in `secondary_fixed` (Amber) to signify "Warm Focus."
*   **Labels:** Floating labels using `label-md` in `on_surface_variant`.

### Atmospheric Satellite Maps
*   **Styling:** Embedded maps must use a custom grayscale or "Dark Teal" tint to match the `primary` palette. 
*   **Overlays:** Use `surface_container_highest` for map tooltips with a heavy backdrop blur.

### Modern Progress "Orbs"
*   Instead of a standard horizontal bar, use a series of staggered tonal chips (`secondary_container`) to show progress through the energy upgrade journey.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical padding (e.g., more top padding than bottom) to create an editorial feel.
*   **Do** use `primary_fixed_dim` for "inactive" states instead of standard gray; keep the UI within the teal/warm-neutral family.
*   **Do** prioritize vertical white space. If you think there is enough space, add 16px more.

### Don't:
*   **Don't** use dividers or lines to separate list items. Use `8px` of vertical space or a subtle `surface_container` background shift.
*   **Don't** use pure "Green" (#00FF00) for savings. Use the `tertiary` (#022600) or `on_tertiary_container` for a sophisticated, "Money-in-Bank" feel.
*   **Don't** use standard "Drop Shadows." If the element doesn't look like it's naturally catching light through tonal shifts, the shadow is too heavy.
*   **Don't** crowd the satellite map. Give the map a container with `xl` (0.75rem) roundedness and treat it like a piece of high-end photography.