# Motion refinements

Adapted selectively from the local reference prompts in `X:\Development\learning\txt prompts`:

- `scroll_reveal_blur_stagger_system.txt`: once-only scroll reveals, parent-based staggering, small blur-to-clear text entrances and restrained card scaling.
- `seamless_angled_page_transition_guide.txt`: an approximately 30° diagonal curtain covers same-site navigation and reveals the destination after it is ready. Modified clicks, external destinations, contact protocols, new tabs and same-page anchors keep native behavior.
- `seamless_video_loop_crossfade_system.txt`: implemented with two cached layers of the optimized H.264 MP4 for Safari-compatible blur/crossfade loops.
- `prompt for cleanup.txt`: applied to the replaced motion code. Removed the old reveal observer, three legacy reveal selectors, the old menu keyframes and the old testimonial animation rule. This was not a general cleanup or redesign of the site.

## What changed

- Hero and internal-page introductions enter in a short sequence.
- Headings, services, team cards, technology cards, process steps, timeline entries and gallery images reveal as they enter view.
- Reveals use 45 ms mobile / 70 ms desktop sibling staggering, capped at 210 ms; elements are unobserved after revealing.
- Scroll reveals use blur-to-clear on desktop and mobile. Mobile blur is capped at 4 px; desktop uses 6 px.
- Mobile menu links stagger in; menus and case dialogs close with a 160 ms fade. Focus containment remains native to `<dialog>`.
- Price and FAQ accordions expand/collapse over 300 ms, including rapid direction changes and resizing.
- Results filters, testimonials, booking steps and success messages receive short entrances. State updates are immediate.
- Buttons get subtle pressed feedback; inputs and booking progress indicators transition between states.
- The diagonal curtain travels for 580 ms on desktop and 460 ms on mobile, then holds the LUMEN wordmark for 500 ms before navigation. The loaded destination remains covered for another 500 ms before the curtain reveals it. Refreshes skip the curtain and start at the top of the current page.
- On the homepage, the floating hero header eases into its fixed light background over roughly half a second, including its position, padding, radius, color, shadow and backdrop blur.

## Accessibility and fallbacks

All motion respects `prefers-reduced-motion`. Enabling it during a session cancels active animations and makes pending content visible. Keyboard focus immediately exposes pending reveals. The back/forward cache cannot restore a page with invisible pending content. Without JavaScript, IntersectionObserver or the Web Animations API, content stays visible and native navigation/accordions still work.

Animations do not run continuously and do not reserve permanent compositor layers. No runtime dependency or remote request was added. A short-lived `sessionStorage` flag carries the curtain state to the destination page and is removed as soon as the transition settles.

## Files and checks

`assets/js/motion.js` owns the shared animation lifecycle, diagonal page curtain and accordions. `assets/css/motion.css` contains the motion styling. `main.js` and `results.js` invoke the helper for existing interactions. The HTML generator includes the shared entry and motion files on all 14 pages.

`npm run check` runs the page/interaction suite and additional motion lifecycle assertions with controlled animation and observer doubles. These check state and cancellation, not visual timing or rendering in a real browser.
