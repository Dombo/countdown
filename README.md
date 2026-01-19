# Embeddable Responsive Countdown Timer

This project provides a small, dependency-free responsive countdown timer you can embed in a page or use as an iframe.

Files:
- `countdown.html` — standalone page designed for embedding in an iframe. It reads query params to set target and title.
- `widget.css` — styles for the countdown, responsive and accessible.
- `widget.js` — lightweight widget script. Auto-initializes `.countdown-widget` elements and exposes `createCountdown()` for manual control.

Usage

1) Embed via iframe (simple)
- Host `countdown.html` and include it as an iframe. Pass `target` (ISO datetime or timestamp) and optional `title` and `expiredMessage` query params.

Example:
```html
<iframe
  src="https://yourdomain.com/countdown.html?target=2026-12-31T23:59:59Z&title=New%20Year&expiredMessage=Happy%20New%20Year!"
  style="width:100%;max-width:720px;height:260px;border:0;border-radius:12px;"
  loading="lazy"
  title="Countdown to New Year"></iframe>
```

2) Inline integration (script)
- Copy `widget.css` into your styles or include it directly.
- Include `widget.js` and add an element:

```html
<link rel="stylesheet" href="widget.css" />
<script src="widget.js"></script>

<div class="countdown-widget" data-target="2026-12-31T23:59:59Z">
  <h2 class="title">Launch</h2>
  <div class="time-grid">
    <div class="time-segment"><div class="value" data-value-days></div><div class="label">Days</div></div>
    <div class="time-segment"><div class="value" data-value-hours></div><div class="label">Hours</div></div>
    <div class="time-segment"><div class="value" data-value-minutes></div><div class="label">Minutes</div></div>
    <div class="time-segment"><div class="value" data-value-seconds></div><div class="label">Seconds</div></div>
  </div>
  <div class="footer"><div class="expired" data-expired-message hidden>Time's up</div></div>
</div>
```

- The script auto-initializes elements with `.countdown-widget`. For manual control:

```js
const el = document.querySelector('.countdown-widget');
const inst = createCountdown(el, {
  target: '2026-12-31T23:59:59Z',
  expiredMessage: 'Done!'
});
```

Customization
- Colors and sizing can be adjusted via the CSS variables in `widget.css` (top of file).
- `data-target` accepts:
  - ISO datetimes: `2026-12-31T23:59:59Z`
  - Millisecond or second timestamps (10 or 13 digit numbers)
- You can set `data-expired-message` on the widget element or include an element with `data-expired-message` to change the expired text.

Accessibility
- Values are updated inside an element with `aria-live="polite"` so screen readers receive updates without being disruptive.
- Titles and aria-labels can be added to better describe the timer in the page context.

License
- Public domain / use as you like.

If you want, I can:
- Produce a single-file widget (HTML+CSS+JS minified) for easier hosting.
- Add color/theme options via query params or CSS variables.
- Add animations or digit flip effects.
