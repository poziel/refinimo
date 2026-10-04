# Refinimo landing-page competitive review

Reviewed 29 September 2026 using the competitive-analysis skill. The objective is a clearer, more attractive first visit that helps a Scrum team understand the product and take its next step.

## Evidence and limits

Official public pages were reviewed for content, navigation, calls to action, and linked entry points. Planning Poker Online's desktop hero was also inspected in the browser. Refinimo was assessed from the supplied screenshots, `README.md`, `CONFIG.md`, and the existing landing source. No competitor account or shared room was created. No conversion, performance, accessibility conformance, or mobile usability measurements were collected. Statements about those properties below are either explicitly attributed product claims or marked untested. Recommendations are design judgments, not measured conversion predictions.

## Compact comparison

The clarity scores are provisional heuristic judgments of first-visit communication: 1 = unclear offer/action, 3 = understandable with reading, 5 = immediately clear offer, proof, and next step. They are not usability study results.

| Product / role | Observed landing hierarchy and action | Product proof and initial journey | Clarity / friction judgment |
| --- | --- | --- | --- |
| [Planning Poker Online](https://planningpokeronline.com/) — direct | Short centered heading, one-line subtitle, prominent blue start button on navy; spare Features/Pricing navigation. | Product illustrations, live/async voting, results, three-step explanation. Start action links to a create-game screen. | **4/5.** Clear entry and tangible product. A cookie banner obscured part of the desktop preview. Published free-plan limits mean visitors must assess plan fit. Full creation flow untested. |
| [Scrum Poker Online](https://www.scrumpoker-online.org/en/) — direct | Immediate create-room action plus room-number entry. Explicit no-account/no-email promise. How-it-works sequence followed by long educational content and FAQs. | Advertises create → invite → estimate, with links, room IDs, and QR sharing. | **4/5.** Very explicit first action; long lower-page explanation adds reading. Free accounts unlock custom cards; a paid tier removes ads. Actual submission flow untested. |
| [Parabol Sprint Poker](https://www.parabol.co/agile/sprint-poker/) — direct | Outcome-led heading, free-trial CTA, illustrated task-led sections: choose issues, vote privately, discuss the result. Broader product navigation. | Integrations, cards, vote distributions, and meeting summaries demonstrate use. CTA reaches account creation. | **4/5.** Strong explanation through product tasks; broader suite and registration add decisions. Its [homepage](https://www.parabol.co/) also offers a practice round, linked to a retrospective demo rather than Sprint Poker. |
| [Linear](https://linear.app/) — aspirational adjacent | Brief positioning followed immediately by detailed product UI; later sections organized around jobs in the development workflow. Signup and app entry are separate. | Concrete issues, activity, planning, and review examples carry the story. Signup is a separate destination. | **4/5.** Specific UI evidence supports the promise, though the broad product requires more explanation than Refinimo. Signup completion untested; no claim about mobile or visual performance. |

## What the comparison means

**Table stakes:** a clear main action, an understandable invite/vote/reveal journey, proof of the interface, and honest account/cost expectations. The competitors explain a usable task before explaining their underlying technology. Refinimo already has the task depth; its current landing obscures it with an exceptionally long headline, repeated prose panels, and no hero-level app action.

**Planning Poker Online's strength** is focus and a visible relationship between promise, action, and product. Adopt that hierarchy; avoid borrowing its artwork or treating playful decoration as proof of usability.

**Scrum Poker Online's strength** is reducing uncertainty about the first step. Refinimo cannot honestly copy its instant-start promise because Firebase configuration is required. Instead, make the actual next step understandable and let visitors experience a local sample before configuration.

**Parabol's strength** is showing what happens before and after a vote. Refinimo's illustration should communicate people, a shared story, private choices, and the reveal, rather than only a deck. Keep any sample distinctly labeled so visitors do not mistake fictional participants for a live room.

**Linear's transferable pattern** is using concrete product situations as evidence. A focused Refinimo table can do this with far less UI. Distinct section proportions and generous whitespace will improve the current wall of equally weighted cards. This is a design inference from the structure, not a claim that copying Linear's style increases conversion.

## Opportunity map for this implementation

| Priority | Opportunity | Proposed change | Acceptance signal |
| --- | --- | --- | --- |
| Now | Make the promise scannable | A short headline such as “Less ceremony. Better estimates.”, one sentence of explanation, and a visible Open app action. | Product category and main action are clear in the first viewport. |
| Now | Demonstrate the useful moment | A compact interactive demo with a sample story, teammate votes, selected card, reveal, and reset. | Visitors can select/reveal/reset locally; keyboard and status announcements work. |
| Now | Make ownership understandable | Explain that the app is free and the team supplies Firebase for live sync; link to setup near the action. | No implication of zero setup or guaranteed zero Firebase charges. |
| Now | Give the page a visual rhythm | Spacious hero, compact trust/benefit row, three-step workflow, fewer richer feature compositions, closing CTA. | Hierarchy is apparent without reading every paragraph. |
| Now | Preserve practical guidance | Keep setup and project credits reachable through existing navigation; reformat dense setup into a clear ordered guide. | Existing destinations, links, and setup material remain usable. |
| Later | Reduce real onboarding effort | Review configuration sharing and the initial setup journey separately. | Validate with first-time users; avoid claiming a completion time before testing. |

Suggested aesthetic: near-black ink, restrained blue accents tied to the existing brand, warm off-white card faces, crisp dividers, compact uppercase labels, and controlled elevation. Let the poker cards carry the playful identity. Avoid fake customer logos, invented adoption numbers, oversized glow effects, and repeated generic feature tiles.

## Mobile, accessibility, and verification

Planning Poker Online explicitly claims support across devices. Scrum Poker Online describes mobile browser and QR joining. Those claims were not independently tested. Linear and Parabol expose skip links in their public page markup; this is a positive signal, not evidence of full accessibility conformance.

For Refinimo, check a narrow phone viewport and desktop, no horizontal page overflow, comfortably sized buttons, visible keyboard focus, meaningful labels, reduced-motion support, and both existing themes. The demo must use native controls and expose changing state to assistive technology. Run the production build and relevant landing tests, with honest separation between local demo verification and real Firebase-room verification.

## Annotated source list

- [Planning Poker Online landing page](https://planningpokeronline.com/) — hero, product sections, three steps, free-plan limits; desktop hero visually inspected.
- [Planning Poker Online create game](https://planningpokeronline.com/new-game/) — CTA destination inspected without creating a game.
- [Scrum Poker Online](https://www.scrumpoker-online.org/en/) — instant-room proposition, process, FAQs, account distinctions, and mobile claims.
- [Parabol Sprint Poker](https://www.parabol.co/agile/sprint-poker/) — task sequence, product illustrations, estimates and summaries.
- [Parabol homepage](https://www.parabol.co/) — optional practice-round link; [demo destination](https://action.parabol.co/retrospective-demo/reflect) and [account destination](https://action.parabol.co/create-account) confirmed.
- [Linear](https://linear.app/) — product-led content sequence and [signup destination](https://linear.app/signup).
- Local `README.md` and `CONFIG.md` — real Refinimo capabilities, Firebase requirement, browser preferences, and configuration sharing; implementation should verify any drift against code.
