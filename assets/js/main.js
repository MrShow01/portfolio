/* ==========================================================================
   Mohamed El Shehawy — Portfolio
   Vanilla JS. No dependencies.

   1.  Helpers
   2.  Theme toggle
   3.  Mobile navigation
   4.  Scroll: nav state, progress bar, back-to-top, scrollspy
   5.  Reveal on scroll
   6.  Animated counters
   7.  Role typewriter
   8.  Pointer spotlight on cards
   9.  Phone tilt
   10. Copy email + toast
   11. Footer year
   ========================================================================== */

(function () {
  'use strict';

  /* ======================================================================
     1. HELPERS
     ====================================================================== */

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const isReduced = () => reduceMotion.matches;

  /** Run a handler at most once per animation frame. */
  function rafThrottle(fn) {
    let queued = false;
    return function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        fn();
      });
    };
  }

  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
  const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

  /* ======================================================================
     2. THEME TOGGLE
     ====================================================================== */

  (function theme() {
    const root = document.documentElement;
    const toggle = $('#themeToggle');
    if (!toggle) return;

    const colors = { dark: '#0a0b0f', light: '#f7f8fb' };
    const store = {
      get() {
        try {
          return localStorage.getItem('theme');
        } catch (e) {
          return null;
        }
      },
      set(mode) {
        try {
          localStorage.setItem('theme', mode);
        } catch (e) {
          /* storage blocked — the in-page theme still works */
        }
      },
    };

    function apply(mode, persist) {
      root.setAttribute('data-theme', mode);
      toggle.setAttribute(
        'aria-label',
        mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      );
      // Keep the browser chrome in sync with the active theme.
      $$('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', colors[mode]));
      if (persist) store.set(mode);
    }

    // The pre-paint script already picked a theme; sync the label without
    // persisting, so an untouched site keeps following the OS preference.
    apply(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark', false);

    toggle.addEventListener('click', () => {
      apply(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
    });

    // Follow the OS while the visitor hasn't made an explicit choice.
    const osDark = window.matchMedia('(prefers-color-scheme: dark)');
    const onOsChange = (e) => {
      if (!store.get()) apply(e.matches ? 'dark' : 'light', false);
    };
    if (osDark.addEventListener) osDark.addEventListener('change', onOsChange);
    else if (osDark.addListener) osDark.addListener(onOsChange);
  })();

  /* ======================================================================
     3. MOBILE NAVIGATION
     ====================================================================== */

  (function mobileNav() {
    const burger = $('#burger');
    const links = $('#navLinks');
    if (!burger || !links) return;

    const setOpen = (open) => {
      links.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('is-locked', open);
    };

    const isOpen = () => links.classList.contains('is-open');

    burger.addEventListener('click', (e) => {
      e.stopPropagation();
      setOpen(!isOpen());
    });

    // Any in-menu link closes it.
    links.addEventListener('click', (e) => {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('click', (e) => {
      if (isOpen() && !links.contains(e.target) && !burger.contains(e.target)) setOpen(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) {
        setOpen(false);
        burger.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 960 && isOpen()) setOpen(false);
    });
  })();

  /* ======================================================================
     4. SCROLL: NAV STATE, PROGRESS, BACK-TO-TOP, SCROLLSPY
     ====================================================================== */

  (function scrollUi() {
    const nav = $('#nav');
    const bar = $('#scrollBar');
    const toTop = $('#toTop');
    const navLinks = $$('.nav__link');

    // Section elements matching the nav links, in document order.
    const targets = navLinks
      .map((link) => {
        const id = link.getAttribute('href') || '';
        return id.startsWith('#') && id.length > 1
          ? { link: link, section: document.getElementById(id.slice(1)) }
          : null;
      })
      .filter((t) => t && t.section);

    function setActive(link) {
      navLinks.forEach((l) => l.classList.toggle('is-active', l === link));
    }

    const onScroll = rafThrottle(() => {
      const y = window.scrollY || window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (nav) nav.classList.toggle('is-scrolled', y > 12);
      if (bar) bar.style.width = (docHeight > 0 ? clamp((y / docHeight) * 100, 0, 100) : 0) + '%';
      if (toTop) toTop.classList.toggle('is-visible', y > window.innerHeight * 0.6);

      // Scrollspy: the section that owns the reading line (a fifth down the viewport).
      const line = y + window.innerHeight * 0.2 + 80;
      let current = targets.length ? targets[0] : null;
      for (const t of targets) {
        if (t.section.offsetTop <= line) current = t;
      }
      // Near the bottom, the last nav section wins — short sections never scroll to the line.
      if (docHeight > 0 && y >= docHeight - 4 && targets.length) current = targets[targets.length - 1];
      if (current) setActive(current.link);
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    if (toTop) {
      toTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: isReduced() ? 'auto' : 'smooth' });
      });
    }
  })();

  /* ======================================================================
     5. REVEAL ON SCROLL
     ====================================================================== */

  (function reveal() {
    const items = $$('.reveal');
    if (!items.length) return;

    if (isReduced() || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = parseInt(el.dataset.revealDelay || '0', 10);
          el.style.transitionDelay = delay ? delay + 'ms' : '';
          el.classList.add('is-in');
          io.unobserve(el);
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
    );

    items.forEach((el) => io.observe(el));
  })();

  /* ======================================================================
     6. ANIMATED COUNTERS
     ====================================================================== */

  (function counters() {
    const nums = $$('.count');
    if (!nums.length) return;

    function run(el) {
      const target = parseFloat(el.dataset.count || '0');
      if (isReduced() || !Number.isFinite(target)) {
        el.textContent = String(target);
        return;
      }
      const duration = 1500;
      const start = performance.now();

      (function step(now) {
        const p = clamp((now - start) / duration, 0, 1);
        el.textContent = String(Math.round(easeOutExpo(p) * target));
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = String(target);
      })(start);
    }

    if (!('IntersectionObserver' in window)) {
      nums.forEach(run);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          run(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );

    nums.forEach((el) => io.observe(el));
  })();

  /* ======================================================================
     7. ROLE TYPEWRITER
     ====================================================================== */

  (function typewriter() {
    const el = $('#roleText');
    if (!el) return;

    const roles = [
      'Senior Flutter Developer',
      'Cross-Platform Mobile Engineer',
      'Android & iOS Developer',
      'Dart & Flutter Specialist',
      'Flutter Instructor',
    ];

    if (isReduced()) {
      el.textContent = roles[0];
      return;
    }

    let roleIndex = 0;
    let charIndex = roles[0].length; // start from the markup's text
    let deleting = false;
    let gen = 0; // invalidates timers left over from a previous pause

    function tick(g) {
      if (g !== gen || document.hidden) return;
      const word = roles[roleIndex];
      const next = (ms) => setTimeout(() => tick(g), ms);

      if (!deleting) {
        charIndex++;
        el.textContent = word.slice(0, charIndex);
        if (charIndex >= word.length) {
          deleting = true;
          next(2100);
          return;
        }
        next(68 + Math.random() * 42);
      } else {
        charIndex--;
        el.textContent = word.slice(0, charIndex);
        if (charIndex <= 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          next(320);
          return;
        }
        next(34);
      }
    }

    // Restart the single active chain when the tab comes back into view.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) return;
      gen++;
      const g = gen;
      setTimeout(() => tick(g), 400);
    });

    setTimeout(() => {
      deleting = true;
      tick(gen);
    }, 2600);
  })();

  /* ======================================================================
     8. POINTER SPOTLIGHT ON CARDS
     ====================================================================== */

  (function spotlight() {
    if (!finePointer.matches) return;

    document.addEventListener(
      'pointermove',
      (e) => {
        const card = e.target.closest && e.target.closest('.spotlight');
        if (!card) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
      },
      { passive: true }
    );
  })();

  /* ======================================================================
     9. PHONE TILT
     ====================================================================== */

  (function tilt() {
    const el = $('.tilt');
    if (!el || !finePointer.matches || isReduced()) return;

    const stage = el.closest('.hero__visual') || el.parentElement;
    const MAX = 9; // degrees

    stage.addEventListener(
      'pointermove',
      (e) => {
        const r = stage.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform =
          'rotateY(' + px * MAX * 2 + 'deg) rotateX(' + -py * MAX + 'deg)';
      },
      { passive: true }
    );

    stage.addEventListener('pointerleave', () => {
      el.style.transform = '';
    });
  })();

  /* ======================================================================
     10. COPY EMAIL + TOAST
     ====================================================================== */

  const toast = (function toastFactory() {
    const node = $('#toast');
    let timer;

    return function show(message) {
      if (!node) return;
      node.textContent = message;
      node.classList.add('is-visible');
      clearTimeout(timer);
      timer = setTimeout(() => node.classList.remove('is-visible'), 2400);
    };
  })();

  (function copyEmail() {
    const btn = $('#copyEmail');
    if (!btn) return;

    const label = $('[data-copy-label]', btn);
    const email = btn.dataset.email || '';

    async function copy(text) {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
      }
      // Fallback for non-secure contexts (e.g. opened straight from disk).
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    btn.addEventListener('click', async () => {
      try {
        await copy(email);
        if (label) {
          const original = label.textContent;
          label.textContent = 'Copied!';
          setTimeout(() => {
            label.textContent = original;
          }, 2000);
        }
        toast('Email copied — ' + email);
      } catch (e) {
        toast('Copy failed. Email: ' + email);
      }
    });
  })();

  /* ======================================================================
     11. FOOTER YEAR
     ====================================================================== */

  (function year() {
    const el = $('#year');
    if (el) el.textContent = String(new Date().getFullYear());
  })();
})();
