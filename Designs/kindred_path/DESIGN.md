# Design System Strategy: The Compassionate Editorial

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Serene Curator."** 

In the mental health space, digital environments often feel either clinical and cold or overly decorative. This design system breaks that binary by adopting a high-end editorial approach. It treats therapist profiles and mental health resources not as database entries, but as featured stories. By utilizing intentional asymmetry, generous white space, and a sophisticated layering of warm tones, we create a digital sanctuary that feels professional yet deeply human. 

The system rejects the "standard" grid in favor of overlapping elements—such as therapist portraits breaking the bounds of their containers—to symbolize the breaking of barriers and the fluidity of the healing journey.

---

## 2. Colors: Tonal Depth over Structural Lines
Our palette is rooted in the warmth of human connection. We utilize a monochromatic-adjacent range of burgundies and blushes to create a sense of blood-warmth and safety.

### The Palette (Core Tokens)
- **Primary (`#58002a`)**: Our authoritative anchor. Used for deep-action states and high-level navigation.
- **Primary Container (`#800040`)**: The signature "Maroon." Use this for hero sections and primary call-to-actions.
- **Surface (`#fff8f7`)**: The "Blush" canvas. This is a soft, warm white that prevents the eye-strain of pure `#ffffff`.
- **Secondary (`#96406c`)**: Used for supporting interactive elements and categorical accents.

### Color Rules for Senior Designers
*   **The "No-Line" Rule:** Explicitly prohibit the use of 1px solid borders to define sections. Boundaries must be defined through background shifts (e.g., a `surface-container-low` filter sidebar sitting atop a `surface` main gallery).
*   **Surface Hierarchy & Nesting:** Treat the UI as physical layers. A `surface-container-lowest` card (pure white) should sit on a `surface-container` background to create a natural, "lifted" hierarchy without a single line of code for borders.
*   **The Glass & Gradient Rule:** For mobile overlays or floating navigation bars, use Glassmorphism. Apply `surface` colors at 80% opacity with a `20px` backdrop blur. 
*   **Signature Textures:** Use subtle linear gradients transitioning from `primary` to `primary-container` (top-to-bottom) on primary buttons to provide a "weighted" feel that flat color cannot replicate.

---

## 3. Typography: The Voice of Trust
We pair the geometric clarity of **Plus Jakarta Sans** for displays with the approachable, highly legible **Manrope** for body copy.

*   **Display (Plus Jakarta Sans):** Oversized and bold. `display-lg` (3.5rem) should be used with tight letter-spacing (-0.02em) to create an editorial, "magazine" feel for headlines.
*   **Headlines (Plus Jakarta Sans):** Use `headline-sm` (1.5rem) for therapist names. The high x-height conveys confidence and modernism.
*   **Body (Manrope):** All functional text uses Manrope. Its slightly wider character set ensures that even at `body-sm` (0.75rem), clinical information remains accessible and unstrained.
*   **Labels (Manrope Bold):** Used for tags and chips, always in uppercase with `0.05em` tracking to differentiate "data" from "narrative."

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are often too "digital." This system uses **Ambient Light** principles.

*   **The Layering Principle:** Depth is achieved by stacking. 
    *   *Level 0:* `surface` (Main background)
    *   *Level 1:* `surface-container-low` (Secondary sections/Sidebars)
    *   *Level 2:* `surface-container-lowest` (Cards/Interaction points)
*   **Ambient Shadows:** For floating elements (like the "Apply Filters" mobile button), use a shadow tinted with `on-surface` (`#24191a`). 
    *   *Spec:* `0px 12px 32px rgba(36, 25, 26, 0.06)`. This mimics natural light falling on fine paper.
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use the `outline-variant` token at 15% opacity. Never use high-contrast outlines.

---

## 5. Components

### Cards & Therapist Profiles
*   **Styling:** Forbid dividers. Use `xl` (1.5rem) rounded corners.
*   **Editorial Touch:** Therapist portraits should use a large circular or "squircle" mask. To create depth, allow the image to slightly break the top padding of the card.
*   **Spacing:** Use "Breathing Room" (32px+ internal padding) to ensure the content never feels crowded.

### Buttons
*   **Primary:** `primary-container` fill, `on-primary` text. `full` (pill) roundedness.
*   **Secondary:** `outline` token at 20% opacity for the "Ghost Border," with `primary` text.
*   **Interaction:** On hover, buttons should subtly scale (1.02x) rather than just changing color, emphasizing a "tactile" response.

### Selection & Input
*   **Checkboxes & Radios:** Use the `secondary` color for checked states. The "checkmark" icon should be `surface-container-lowest` (white) to pop against the deep maroon background.
*   **Input Fields:** Use `surface-container-high` as the fill. This creates a "recessed" look, suggesting a space for the user to "pour" their information into.

### Chips (Specialty Tags)
*   Use `secondary-fixed` backgrounds with `on-secondary-fixed-variant` text. Corners must be `full` (pill-shaped) to maintain the soft, non-threatening aesthetic.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical layouts where text is left-aligned and imagery is offset to create a premium feel.
*   **Do** use large amounts of vertical white space between therapist cards to respect the user's cognitive load.
*   **Do** use "Soft Pink" (`surface-container`) as a background for functional areas like filters to distinguish them from "Content" areas.

### Don't:
*   **Don't** use black (`#000000`). Always use `on-surface` (`#24191a`) for text to maintain the warm, organic tone.
*   **Don't** use standard "drop shadows" with 0 blur. Shadows must be expansive and faint.
*   **Don't** use 90-degree sharp corners. Every element must have at least a `sm` (0.25rem) radius to feel approachable.
*   **Don't** use a divider line to separate a header from a body. Use a 40px gap or a subtle color shift instead.