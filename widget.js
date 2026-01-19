// Lightweight embeddable countdown widget
// Usage (auto-init):
//  - Add an element with class "countdown-widget" and attribute data-target (ISO datetime or timestamp).
//  - Optionally set data-expired-message and include a child with [data-expired-message] to show message.
//  - Alternatively, call createCountdown(element, { target: Date|string, title: string, onExpire: fn }).

(function (global) {
  'use strict';

  function parseTarget(input) {
    if (!input) return null;
    // If it's a numeric timestamp (seconds or ms), handle it
    if (/^\d+$/.test(input)) {
      const n = Number(input);
      // decide if seconds (10-digit) or ms
      return new Date(n < 1e12 ? n * 1000 : n);
    }
    // try ISO parse
    const d = new Date(input);
    if (!isNaN(d)) return d;
    return null;
  }

  function formatNumber(n) {
    return String(n).padStart(2, '0');
  }

  function computeParts(diffMs) {
    if (diffMs <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    let s = Math.floor(diffMs / 1000);
    const days = Math.floor(s / 86400); s -= days * 86400;
    const hours = Math.floor(s / 3600); s -= hours * 3600;
    const minutes = Math.floor(s / 60); s -= minutes * 60;
    const seconds = s;
    return { days, hours, minutes, seconds, expired: false };
  }

  function updateDisplay(root, parts) {
    const daysEl = root.querySelector('[data-value-days]');
    const hoursEl = root.querySelector('[data-value-hours]');
    const minutesEl = root.querySelector('[data-value-minutes]');
    const secondsEl = root.querySelector('[data-value-seconds]');
    if (daysEl) daysEl.textContent = String(parts.days);
    if (hoursEl) hoursEl.textContent = formatNumber(parts.hours);
    if (minutesEl) minutesEl.textContent = formatNumber(parts.minutes);
    if (secondsEl) secondsEl.textContent = formatNumber(parts.seconds);

    const expiredEl = root.querySelector('[data-expired-message]');
    if (parts.expired) {
      if (expiredEl) expiredEl.hidden = false;
      root.classList.add('expired');
    } else {
      if (expiredEl) expiredEl.hidden = true;
      root.classList.remove('expired');
    }
  }

  function Countdown(root, opts) {
    this.root = root;
    opts = opts || {};
    this.onExpire = opts.onExpire || null;

    // target from opts, data attribute, or attribute
    const dataTarget = root.getAttribute('data-target') || root.dataset.target || opts.target || '';
    this.target = parseTarget(dataTarget) || (opts.target ? parseTarget(opts.target) : null);

    // expired message
    const expiredMsg = opts.expiredMessage || root.dataset.expiredMessage || null;
    if (expiredMsg) {
      const el = root.querySelector('[data-expired-message]');
      if (el) el.textContent = expiredMsg;
    }

    // keep timer id
    this._timer = null;
    this._lastParts = null;
  }

  Countdown.prototype.start = function () {
    if (!this.target) {
      // if no explicit target, try to read a timestamp text in the widget
      // otherwise, do nothing
      return;
    }
    this.stop();
    const self = this;
    function tick() {
      const now = new Date();
      const diff = self.target - now;
      const parts = computeParts(diff);
      // update only when changed (reduce DOM thrash)
      const s = JSON.stringify(parts);
      if (s !== self._lastParts) {
        updateDisplay(self.root, parts);
        self._lastParts = s;
      }
      if (parts.expired) {
        self.stop();
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
    this.start();
    return true;
  };

  // createCountdown: convenience factory
  function createCountdown(root, options) {
    if (!root) return null;
    // if already initialized, return existing instance
    if (root.__countdownInstance) return root.__countdownInstance;
    const inst = new Countdown(root, options || {});
    root.__countdownInstance = inst;
    inst.start();
    return inst;
  }

  // Auto-initialize all elements with class 'countdown-widget' on DOMContentLoaded
  function autoInitAll() {
    const els = document.querySelectorAll('.countdown-widget');
    els.forEach(function (el) {
      // Only init if not already
      if (!el.__countdownInstance) {
        createCountdown(el);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInitAll);
  } else {
    setTimeout(autoInitAll, 0);
  }

  // API export
  global.createCountdown = createCountdown;
  global.CountdownWidget = {
    parseTarget: parseTarget
  };

})(window);