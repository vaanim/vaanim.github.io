(function () {
  'use strict';

  // Footer year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen);
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Scrollspy: highlight the nav link for the section in view
  var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll('a')) : [];
  var sections = navLinks
    .map(function (link) { return link.getAttribute('href'); })
    .filter(function (href) { return href && href.charAt(0) === '#'; })
    .map(function (href) { return document.querySelector(href); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = nav.querySelector('a[href="#' + entry.target.id + '"]');
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove('active'); });
          link.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(function (section) { spy.observe(section); });
  }

  // Reveal-on-scroll animation
  var revealTargets = document.querySelectorAll('.section, .project-card, .timeline-item');
  revealTargets.forEach(function (el) { el.classList.add('reveal'); });

  if ('IntersectionObserver' in window) {
    var revealer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealTargets.forEach(function (el) { revealer.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Carousel
  document.querySelectorAll('.carousel').forEach(function (carousel) {
    var track = carousel.querySelector('.carousel-track');
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.carousel-slide'));
    var dotsWrap = carousel.querySelector('.carousel-dots');
    var prevBtn = carousel.querySelector('.carousel-btn.prev');
    var nextBtn = carousel.querySelector('.carousel-btn.next');
    var index = 0;
    var visibleCount = 1;
    var maxIndex = 0;
    var dots = [];
    var autoplayMs = 5000;
    var timer = null;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var desktopVisible = parseInt(carousel.dataset.visible, 10) || 1;
    var mobileVisible = parseInt(carousel.dataset.visibleMobile, 10) || 1;
    var breakpoint = parseInt(carousel.dataset.breakpoint, 10) || 720;
    var mobileQuery = window.matchMedia('(max-width: ' + breakpoint + 'px)');

    function buildDots() {
      dotsWrap.innerHTML = '';
      dots = [];
      for (var i = 0; i <= maxIndex; i++) {
        (function (i) {
          var dot = document.createElement('button');
          dot.className = 'carousel-dot';
          dot.type = 'button';
          dot.setAttribute('role', 'tab');
          dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
          dot.addEventListener('click', function () { goTo(i); startAutoplay(); });
          dotsWrap.appendChild(dot);
          dots.push(dot);
        })(i);
      }
    }

    function render() {
      var step = 100 / visibleCount;
      track.style.transform = 'translateX(-' + (index * step) + '%)';
      dots.forEach(function (dot, i) { dot.classList.toggle('is-active', i === index); });
    }

    function recalc() {
      visibleCount = mobileQuery.matches ? mobileVisible : desktopVisible;
      maxIndex = Math.max(0, slides.length - visibleCount);
      if (index > maxIndex) index = maxIndex;
      buildDots();
      render();
    }

    function goTo(i) {
      index = maxIndex === 0 ? 0 : (i + maxIndex + 1) % (maxIndex + 1);
      render();
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    function startAutoplay() {
      if (reduceMotion || maxIndex === 0) return;
      stopAutoplay();
      timer = window.setInterval(next, autoplayMs);
    }
    function stopAutoplay() {
      if (timer) { window.clearInterval(timer); timer = null; }
    }

    if (nextBtn) nextBtn.addEventListener('click', function () { next(); startAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); startAutoplay(); });

    carousel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { next(); startAutoplay(); }
      if (e.key === 'ArrowLeft') { prev(); startAutoplay(); }
    });

    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('focusin', stopAutoplay);
    carousel.addEventListener('focusout', startAutoplay);

    var touchStartX = null;
    track.addEventListener('touchstart', function (e) { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (touchStartX === null) return;
      var delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 40) { delta < 0 ? next() : prev(); startAutoplay(); }
      touchStartX = null;
    });

    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener('change', recalc);
    } else if (mobileQuery.addListener) {
      mobileQuery.addListener(recalc);
    }

    recalc();
    startAutoplay();
  });
})();
