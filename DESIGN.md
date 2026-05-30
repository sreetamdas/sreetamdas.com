---
name: sreetamdas.com
description: Personal website, blog, and tinkering playground for Sreetam Das.
colors:
  primary-purple: "#5b34da"
  primary-purple-dark: "#9d86e9"
  secondary-blue: "#358ef1"
  secondary-blue-dark: "#61dafb"
  not-white: "#f7f1ff"
  ink: "#000000"
  karma-background: "#0a0e14"
typography:
  display:
    fontFamily: "Bricolage Grotesque Variable, serif"
    fontSize: "clamp(3.75rem, 10vw, 6rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Bricolage Grotesque Variable, serif"
    fontSize: "2.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  mono:
    fontFamily: "Iosevka, monospace"
    fontSize: "0.9em"
    fontWeight: 400
rounded:
  global: "5px"
  sm: "2px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "32px"
  xl: "80px"
components:
  link-base:
    textColor: "{colors.primary-purple}"
    padding: "0"
  code-inline:
    backgroundColor: "{colors.secondary-blue}"
    textColor: "{colors.ink}"
    rounded: "{rounded.global}"
    padding: "2px 4px"
  nav-logo:
    backgroundColor: "{colors.primary-purple}"
    textColor: "{colors.primary-purple}"
    rounded: "{rounded.global}"
    size: "25px"
---

# Design System: sreetamdas.com

## 1. Overview

**Creative North Star: "The Tinkerer's Notebook"**

The visual system is a readable personal notebook with just enough technical machinery showing through. It uses a narrow content measure, direct navigation, compact controls, and an opinionated purple-to-blue accent pair that signals authorship without turning every page into a showcase.

The site should feel like a senior engineer's workshop: writing-first, source-open, precise, and quietly playful. The interface rejects generic SaaS polish, repeated marketing-card scaffolds, and agency-portfolio spectacle. The page should invite exploration, but prose, links, and route discovery remain the first priority.

**Key Characteristics:**

- Writing-first max width around 650px.
- Purple and blue accents used as active affordances, not decorative filler.
- Bricolage Grotesque gives headings a hand-built, friendly weight.
- Inter keeps body reading familiar and quiet.
- Iosevka marks code and technical details without making the whole site perform as a terminal.
- Low-radius shapes and dashed focus rings keep controls precise.

## 2. Colors

The palette is a compact personal accent system: black or near-white reading surfaces, one saturated purple identity color, and one saturated blue interaction color.

### Primary

- **Workbench Purple**: The main brand accent for links, logo blocks, focus-adjacent emphasis, and active identity marks.
- **Night Purple**: The dark-mode companion for Workbench Purple, softened for readability on black.

### Secondary

- **Livewire Blue**: The interaction accent for animated underlines, hover energy, code tinting, and secondary emphasis.
- **Darkroom Cyan**: The dark-mode companion for Livewire Blue, bright enough to carry small link and code details.

### Neutral

- **Not White**: The light-mode page background, slightly tinted toward the accent system rather than paper beige.
- **Ink**: The main text and dark-mode background anchor.
- **Karma Black**: A deeper near-black reserved for the Karma theme surface.

### Named Rules

**The Accent-Earns-It Rule.** Purple and blue should mark navigation, links, code, focus, or a genuine identity moment. Do not wash whole sections in accent gradients for decoration.

**The No Beige Drift Rule.** The existing light surface is violet-tinted, not cream, sand, parchment, or lifestyle-blog beige. Keep future neutrals tied to the existing accent hue.

## 3. Typography

**Display Font:** Bricolage Grotesque Variable (with serif fallback)
**Body Font:** Inter Variable (with sans-serif fallback)
**Label/Mono Font:** Iosevka (with monospace fallback)

**Character:** The pairing is friendly and technical without becoming startup-generic. Bricolage carries personality in headings; Inter carries long reading; Iosevka appears only where code, metadata, or technical texture needs it.

### Hierarchy

- **Display** (700, `clamp(3.75rem, 10vw, 6rem)`, 1 line-height): Route titles and hero-level greetings. Keep display headings within a 6rem ceiling and use balanced wrapping where possible.
- **Headline** (600, 2.5rem, 1.25 line-height): Blog archive titles, feature names, and prominent content headings.
- **Title** (700, 1.5rem to 2rem, 1.3 line-height): Section headings inside MDX and component titles.
- **Body** (400, 1rem, around 1.65 line-height): Primary reading text. Keep line length close to the existing 650px container, roughly 65 to 75 characters.
- **Label** (400 or 700, 0.875rem to 0.9em): Dates, reading time, code, and compact technical annotations. Avoid all-caps label systems unless a specific component needs a short badge.

### Named Rules

**The Heading-as-Voice Rule.** Let Bricolage carry personality in the title, then let body copy settle down. Do not pair large decorative headings with ornamental section labels everywhere.

**The Mono-Is-A-Tool Rule.** Iosevka is for code and technical annotations. Do not turn the whole brand into terminal cosplay.

## 4. Elevation

The system uses light ambient lift, but only for UI layers that need state, containment, or modal priority. The reading surface is mostly flat: depth comes from spacing, tint, focus outlines, overlays, and motion. Large soft card shadows are not part of the core language.

### Shadow Vocabulary

- **Drawer Lift** (`box-shadow: var(--tw-shadow, 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1))`): Used by the mobile drawer layer after an overlay already establishes modal depth.

### Named Rules

**The Flat-Until-State Rule.** Surfaces are flat by default. Add lift only when an element opens, overlays, hovers with purpose, or needs to separate from the reading plane.

## 5. Components

Components should feel like quiet reading tools: compact, precise, obvious under keyboard focus, and lightly playful only when it helps discovery.

### Buttons

- **Shape:** Small, precise corners using the global radius (5px) or tighter close-button radius (2px).
- **Primary:** The project does not have a broad button system yet. When one is needed, use Workbench Purple against Not White or Ink with enough contrast, compact padding, and direct verb labels.
- **Hover / Focus:** Focus uses dashed outlines in Livewire Blue or the nearest accessible accent. Hover may shift opacity or underline, but should not add wide glow plus border decoration.
- **Secondary / Ghost / Tertiary:** Prefer text links before inventing secondary buttons. If a ghost button is needed, keep it borderless at rest and rely on focus outline plus hover color.

### Chips

- **Style:** Inline code acts as the current chip-like primitive: small global radius, blue-tinted background, mono font, and compact horizontal padding.
- **State:** Use chips for technical terms, tags, or inline metadata. Do not turn content lists into repeated pill clouds without a filtering job.

### Cards / Containers

- **Corner Style:** Low radius only (5px). Avoid 24px or larger cards.
- **Background:** Use foreground tints for blockquotes and code, or the page background for most content.
- **Shadow Strategy:** Follow the Flat-Until-State Rule. Cards should not pair a 1px border with a wide soft shadow.
- **Border:** Use full borders when structure needs them. Do not use colored side stripes.
- **Internal Padding:** Blockquote-like containers use generous vertical padding around 32px with tighter horizontal rhythm.

### Inputs / Fields

- **Style:** No canonical input system is present yet. New fields should inherit the low-radius, compact, high-contrast language.
- **Focus:** Use dashed or solid accent outlines with at least 2px offset. Placeholder text must meet contrast requirements.
- **Error / Disabled:** Errors should be explicit text plus color, not color alone. Disabled states should remain legible.

### Navigation

- **Style, typography, default/hover/active states, mobile treatment.** The header is sticky, compact, and centered within the 650px content measure. Text links use foreground color at rest, Workbench Purple on hover, and an animated Livewire Blue underline. The home mark is a 25px purple square with low radius. Mobile navigation opens through a left drawer with a dark overlay, preserving keyboard focus and a clear close control.

### Signature Component: MDX Link Treatment

Links are the main interactive component. They start as readable text, then reveal a 2px animated underline from Livewire Blue on hover. This keeps prose quiet while still making interaction feel authored.

## 6. Do's and Don'ts

### Do:

- **Do** keep long-form content inside the 650px measure unless a surface has a clear reason to break out.
- **Do** use Workbench Purple and Livewire Blue for affordances, focus, code, and identity moments.
- **Do** preserve the compact sticky header and direct lowercase navigation voice.
- **Do** keep focus states visible with 2px dashed or solid accent outlines.
- **Do** let occasional playful details reward exploration without blocking reading or keyboard navigation.

### Don't:

- **Don't** introduce generic SaaS polish: repeated feature cards, vague startup copy, ornamental gradients, or anonymous launch-page structure.
- **Don't** make the site an overly restrained blog that hides the tinkering and playful personality.
- **Don't** add heavy agency-portfolio spectacle that competes with writing or makes every route feel like a showcase slide.
- **Don't** use gradient text for emphasis in new work. If existing gradient utilities remain, reserve them for legacy or deliberately playful moments, not as the default heading treatment.
- **Don't** use colored `border-left` or `border-right` stripes as card accents.
- **Don't** combine a 1px decorative border with a wide soft shadow on cards or buttons.
- **Don't** use oversized card radii above 16px unless the component is a true pill control.
