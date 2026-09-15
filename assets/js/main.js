/* Matthew Broglio — portfolio interactions
   Kept deliberately small: mobile menu, scroll state, section reveals,
   one-time number counters, and contact-form handling. */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Mobile menu ---------------------------------------------------- */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('mobile-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1080) {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---- Nav hairline on scroll ----------------------------------------- */
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Section reveals ------------------------------------------------- */
  var revealables = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---- Number counters -------------------------------------------------
     Opt in with data-count="41" on the element holding the number.
     Optional data-prefix / data-suffix / data-decimals.                   */
  var counters = document.querySelectorAll('[data-count]');

  function paint(el, value) {
    var decimals = parseInt(el.dataset.decimals || '0', 10);
    el.textContent = (el.dataset.prefix || '') +
      value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
      (el.dataset.suffix || '');
  }

  function run(el) {
    var target = parseFloat(el.dataset.count);
    if (reduceMotion) { paint(el, target); return; }
    var duration = 950, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      paint(el, target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
      else paint(el, target);
    }
    requestAnimationFrame(step);
  }

  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(function (el) { paint(el, parseFloat(el.dataset.count)); });
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { run(entry.target); cio.unobserve(entry.target); }
        });
      }, { threshold: 0.4 });
      counters.forEach(function (el) { paint(el, 0); cio.observe(el); });
    }
  }

  /* ---- Contact form ----------------------------------------------------
     No backend is wired up yet. Until one is added, the form opens the
     visitor's mail client with the message pre-filled. Replace the block
     below with a form service (Formspree, Netlify Forms, etc.) when ready. */
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var address = form.dataset.email || '';
      var status = document.getElementById('form-status');

      if (!address || address.indexOf('INSERT') !== -1) {
        if (status) {
          status.textContent = 'This form is not connected yet — add an email address to data-email on the form element in contact.html.';
        }
        return;
      }

      var name = encodeURIComponent(form.elements.name.value);
      var subject = encodeURIComponent(form.elements.subject.value || 'Portfolio enquiry');
      var body = encodeURIComponent(
        form.elements.message.value + '\n\n— ' + form.elements.name.value + ' (' + form.elements.email.value + ')'
      );
      window.location.href = 'mailto:' + address + '?subject=' + subject + '&body=' + body;
      if (status) status.textContent = 'Opening your email app…';
      void name;
    });
  }

  /* ---- Footer year ------------------------------------------------------ */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
