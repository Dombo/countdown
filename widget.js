// Lightweight embeddable countdown widget
// Usage (auto-init):
//  - Add an element with class "countdown-widget" and attribute data-target (HH:MM:SS UTC time).
//  - Alternatively, call createCountdown(element, { target: string, title: string, onExpire: fn }).
//  - After expiry the clock counts negative and flashes until stopped.

(function (global) {
  'use strict';

  function parseTarget(input) {
    if (!input) return null;
    // Time-only HH:MM or HH:MM:SS → today at that time in the viewer's local timezone
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(input)) {
      const p = input.split(':').map(Number);
      const n = new Date();
      return new Date(n.getFullYear(), n.getMonth(), n.getDate(), p[0], p[1], p[2] || 0);
    }
    // Numeric unix timestamp (seconds or ms)
    if (/^\d+$/.test(input)) {
      const n = Number(input);
      return new Date(n < 1e12 ? n * 1000 : n);
    }
    // ISO fallback
    const d = new Date(input);
    if (!isNaN(d)) return d;
    return null;
  }

  function formatNumber(n) {
    return String(n).padStart(2, '0');
  }

  function computeParts(diffMs) {
    const expired = diffMs < 0;
    let s = Math.floor(Math.abs(diffMs) / 1000);
    const days  = Math.floor(s / 86400); s -= days  * 86400;
    const hours = Math.floor(s / 3600);  s -= hours * 3600;
    const mins  = Math.floor(s / 60);    s -= mins  * 60;
    return { days, hours, minutes: mins, seconds: s, expired };
  }

  function updateDisplay(root, parts) {
    const daysEl    = root.querySelector('[data-value-days]');
    const hoursEl   = root.querySelector('[data-value-hours]');
    const minutesEl = root.querySelector('[data-value-minutes]');
    const secondsEl = root.querySelector('[data-value-seconds]');

    // Days always hidden (time-only mode)
    if (daysEl) daysEl.closest('.time-segment').hidden = true;

    // Hours: only show when value > 0; prefix with '-' when overdue
    const showHours = parts.hours > 0;
    if (hoursEl) {
      hoursEl.textContent = (parts.expired ? '-' : '') + formatNumber(parts.hours);
      hoursEl.closest('.time-segment').hidden = !showHours;
    }
    // Minutes: carry the '-' sign when hours are hidden and overdue
    if (minutesEl) minutesEl.textContent = (parts.expired && !showHours ? '-' : '') + formatNumber(parts.minutes);
    if (secondsEl) secondsEl.textContent = formatNumber(parts.seconds);

    // Flash the time grid when overdue
    const grid = root.querySelector('.time-grid');
    if (grid) grid.classList.toggle('flashing', parts.expired);

    // Expired message suppressed — negative count is the indicator
    const expiredEl = root.querySelector('[data-expired-message]');
    if (expiredEl) expiredEl.hidden = true;
  }

  function Countdown(root, opts) {
    this.root = root;
    opts = opts || {};
    this.onExpire = opts.onExpire || null;

    const dataTarget = root.getAttribute('data-target') || root.dataset.target || opts.target || '';
    this.target = parseTarget(dataTarget) || (opts.target ? parseTarget(opts.target) : null);

    this._timer = null;
    this._lastParts = null;
    this._expireFired = false;
  }

  Countdown.prototype.start = function () {
    if (!this.target) return;
    this.stop();
    const self = this;
    function tick() {
      const diff = self.target - new Date();
      const parts = computeParts(diff);
      const s = JSON.stringify(parts);
      if (s !== self._lastParts) {
        updateDisplay(self.root, parts);
        self._lastParts = s;
      }
      if (parts.expired && !self._expireFired) {
        self._expireFired = true;
        if (typeof self.onExpire === 'function') self.onExpire();
      }
    }
    tick();
    this._timer = setInterval(tick, 1000);
  };

  Countdown.prototype.stop = function () {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  };

  Countdown.prototype.setTarget = function (t) {
    const parsed = parseTarget(t);
    if (!parsed) return false;
    this.target = parsed;
    this._expireFired = false;
    this.start();
    return true;
  };

  function createCountdown(root, options) {
    if (!root) return null;
    if (root.__countdownInstance) return root.__countdownInstance;
    const inst = new Countdown(root, options || {});
    root.__countdownInstance = inst;
    inst.start();
    return inst;
  }

  function autoInitAll() {
    document.querySelectorAll('.countdown-widget').forEach(function (el) {
      if (!el.__countdownInstance) createCountdown(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInitAll);
  } else {
    setTimeout(autoInitAll, 0);
  }

  global.createCountdown = createCountdown;
  global.CountdownWidget = { parseTarget: parseTarget };

})(window);
