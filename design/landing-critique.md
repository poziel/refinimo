# Refinimo landing-page design critique

Reviewed 29 September 2026 using the design-critique skill. This is a refinement review for a first-time Scrum-team visitor: understand the product, try a sample round, and understand the Firebase prerequisite before entering the app.

## Scope and evidence

- Read the current landing component, styles, shared-card demo, and theme tokens.
- Inspected the live Rose light theme at a 1521px browser viewport, including Overview, How it works, and About. Inspected Overview at 390px and measured computed font sizes.
- Used the user's annotated images as visual evidence; the blue selection outlines are annotations, not product borders.
- This is a visual and code-based critique, not a user study or a full accessibility audit. No application code was changed for this review. The recommendations below are design judgments; sizes, colors, and dimensions reported as current values were verified in source or computed styles.

## Assessment

Keep the composition. The concise main heading, clear primary action, shared planning cards, varied section layouts, and ownership illustration give the page a recognizable identity. The remaining weaknesses are concentrated in text scale and light-mode surface treatment.

### 1. High priority: enlarge the text visitors need to read or act on

The design allocates generous space to headings and illustrations but uses compact application-interface sizes for explanatory content. This creates a disproportionate jump from large headings to small paragraphs.

| Text role | Current size | Proposed starting point |
| --- | --- | --- |
| Main descriptions and FAQ answers | 13px | 16px |
| Firebase/About paragraphs | 14px | 16px |
| Hero introduction | 16px desktop, 14px phone | 16-17px across widths |
| Navigation and primary controls | 11-13px depending on location and breakpoint | 14px |
| Firebase prerequisite and setup link | 11px | 14px |
| Demo reveal button | 11px | 14px |
| Demo feedback/privacy guidance | 9-10px | 12-13px |
| Product highlights | 12px desktop, 10px phone | 13-14px |

Use a small role-based type scale, preferably expressed in rem, and allow text to wrap on phones. Preserve comfortable line height rather than scaling every dimension proportionally. Tiny initials, playing-card corner values, and nonessential orbital labels can remain miniature because they serve an illustrative role.

Evidence: `src/styles/landing.css` lines 42, 44, 50, 56, 71, 76, 124, 147, 331-341; `src/components/landing/LandingDemo.vue` lines 185, 192, 195, 198-199.

### 2. Medium priority: reduce the light-mode gradient's saturation difference

Both annotated cards use the selected palette already. In Rose light, the exact gradient is `#ffd5e7` to `#ffffff`, against a page background of `#fff7fb`. The starting tint is substantially stronger than the surrounding surfaces; spreading it over the full credits card makes the transition especially prominent.

Introduce a separate light-mode decorative fill: mix approximately 25-35% of the existing soft accent with 65-75% of the card surface, then fade toward the card surface or a second very pale tint. For Rose, a start near `#fff2f8` would be much closer to the surrounding page. Retain the chosen hue, keep text/link accent tokens separate, and leave the dark-mode treatment intact.

The issue here is visual emphasis rather than weak body-text contrast. The Rose body color `#724056` has a calculated contrast ratio of approximately 6.16:1 against the current pink stop and 8.13:1 against white. These endpoint measurements are not a complete contrast audit.

Evidence: `src/styles/landing.css` lines 10, 148, 160; Rose light tokens in `src/styles/settings.scss` lines 117-124.

### 3. Medium priority: make the required setup condition easier to notice

The inline placement requested by the user works well, but an 11px prerequisite below a prominent start action reads like optional fine print. A first-time visitor needs to understand that live rooms require Firebase configuration. Keep the inline relationship, increase it to 14px, and consider the explicit wording "One-time Firebase setup required" with a short setup-guide link.

Evidence: `src/pages/index.vue` hero setup note; `src/styles/landing.css` lines 50-51.

### 4. Medium priority: shorten the About card's paragraph measure

The featured credits paragraph measured 1202px wide at the desktop review size, with 14px text and no max-width. Following a long line to the next line requires more effort than the rest of the page.

Keep the full-width visual surface, but constrain its prose to approximately 65-75ch. Pair this with the larger body size; the paragraph can occupy more lines without making the whole page dense.

Evidence: `src/styles/landing.css` lines 147 and 160; live `.landing-card-featured p` computed width and max-width.

### 5. Lower priority: soften the demo's light-mode shadow

The demo uses the same substantial dark shadow in both modes: `0 28px 70px -28px #03060d80`. On the pale Rose page it creates a visible gray cast beneath the preview and feels heavier than the surrounding thin borders and light surfaces.

Give the light theme a lower-opacity shadow, starting around 8-12% theme-colored ink, while retaining enough separation from the background. Verify by eye rather than treating the initial numeric suggestion as a final specification.

Evidence: `src/components/landing/LandingDemo.vue` line 158 and the live light-mode overview.

## Proposed next refinement pass

Owner: landing-page implementation. Timing: next refinement pass before the next visual review; no external deadline assumed.

1. Establish the readable text scale and promote the setup prerequisite.
2. Add light-specific decorative fills and a gentler preview shadow.
3. Limit the credits paragraph's line length.
4. Review 320px, 390px, 640px, and desktop layouts for wrapping, clipping, and balanced spacing after the larger type is applied.
5. Check representative light palettes (Rose, Midnight, Amber) and dark mode, then verify keyboard use, text enlargement, and the preview's reveal/reset behavior.

The acceptance goal is readable essential content at normal viewing size, with light-mode decoration supporting the text rather than drawing attention away from it. No broader redesign is indicated by this review.

## Implementation follow-through

Implemented the refinement pass on 29 September 2026:

- Added a shared rem-based text scale: 16px body copy, 17px introductions, 14px navigation and controls, and 12-13px supporting demo text at the default root size.
- Made the Firebase prerequisite explicit and kept its setup-guide link inline.
- Replaced both highlighted card gradients with a faint solid accent tint (8% in dark mode, 10% in light), a muted outline, and a short accent segment along the top edge. Headings, body copy, and links retain their normal theme colors. This adds a little more distinction than the plain outlined treatment while remaining quieter than a full accent fill, and supersedes recommendation 2's proposed gradient treatment.
- Restored the featured credits paragraph to the full card content width at the user's request, superseding recommendation 4. Softened the demo shadow in light mode.
- Removed the demo's decorative captions, increased space before the reveal button, and replaced the table gradient with an opaque palette tint.
- Allowed navigation and long credit links to wrap when text is enlarged, preserving access on narrow screens.
