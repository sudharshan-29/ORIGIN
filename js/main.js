/* ═══════════════════════════════════════════════════════
   ORIGIN — Main JavaScript
   Handles navigation, animations, lightbox, and interactions
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── DOM References ──────────────────────────────────
  const nav           = document.getElementById('nav');
  const navToggle     = document.getElementById('navToggle');
  const mobileNav     = document.getElementById('mobileNav');
  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = lightbox.querySelector('.lightbox__img');
  const lightboxClose = lightbox.querySelector('.lightbox__close');
  const lightboxPrev  = lightbox.querySelector('.lightbox__prev');
  const lightboxNext  = lightbox.querySelector('.lightbox__next');
  const hero          = document.getElementById('hero');
  const yearEl        = document.getElementById('currentYear');

  // ─── Set Current Year ────────────────────────────────
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ─── Navigation Scroll Effect ────────────────────────
  let lastScroll = 0;
  const SCROLL_THRESHOLD = 50;

  function handleNavScroll() {
    const y = window.scrollY;
    nav.classList.toggle('nav--scrolled', y > SCROLL_THRESHOLD);
    lastScroll = y;
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // Initial check

  // ─── Active Nav Link Highlighting ────────────────────
  const sections = document.querySelectorAll('.section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  function highlightNavLink() {
    const scrollY = window.scrollY + window.innerHeight / 3;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach((link) => {
          link.classList.toggle(
            'nav__link--active',
            link.getAttribute('href') === `#${id}`
          );
        });
      }
    });
  }

  window.addEventListener('scroll', highlightNavLink, { passive: true });

  // ─── Mobile Navigation ───────────────────────────────
  function toggleMobileNav() {
    const isOpen = mobileNav.classList.toggle('mobile-nav--open');
    navToggle.classList.toggle('nav__toggle--active', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
    mobileNav.setAttribute('aria-hidden', !isOpen);
    document.body.classList.toggle('no-scroll', isOpen);
  }

  function closeMobileNav() {
    mobileNav.classList.remove('mobile-nav--open');
    navToggle.classList.remove('nav__toggle--active');
    navToggle.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }

  navToggle.addEventListener('click', toggleMobileNav);

  // Close mobile nav on link click
  mobileNav.querySelectorAll('.mobile-nav__link, .btn').forEach((link) => {
    link.addEventListener('click', closeMobileNav);
  });

  // ─── Smooth Scroll for Anchors ───────────────────────
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      closeMobileNav();

      const offset = nav.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ─── Hero Load Animation ────────────────────────────
  window.addEventListener('load', () => {
    hero.classList.add('hero--loaded');
  });

  // ─── Scroll Reveal Animations ────────────────────────
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (!prefersReducedMotion) {
    const revealElements = document.querySelectorAll('.anim-reveal');

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('anim-reveal--visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px',
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    // If reduced motion, show everything immediately
    document.querySelectorAll('.anim-reveal').forEach((el) => {
      el.classList.add('anim-reveal--visible');
    });
  }

  // ─── Gallery Lightbox ────────────────────────────────
  const galleryItems = document.querySelectorAll('.gallery__item');
  let currentLightboxIndex = 0;
  const galleryImages = [];

  galleryItems.forEach((item, index) => {
    const img = item.querySelector('.gallery__img');
    if (img) {
      // Get the high-res version of the image
      const src = img.src.replace(/w=\d+/, 'w=1600').replace(/q=\d+/, 'q=90');
      galleryImages.push({ src, alt: img.alt });

      const openHandler = () => openLightbox(index);
      item.addEventListener('click', openHandler);
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openHandler();
        }
      });
    }
  });

  function openLightbox(index) {
    currentLightboxIndex = index;
    updateLightboxImage();
    lightbox.classList.add('lightbox--open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('lightbox--open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }

  function updateLightboxImage() {
    const image = galleryImages[currentLightboxIndex];
    if (image) {
      lightboxImg.src = image.src;
      lightboxImg.alt = image.alt;
    }
  }

  function navigateLightbox(direction) {
    currentLightboxIndex =
      (currentLightboxIndex + direction + galleryImages.length) %
      galleryImages.length;
    updateLightboxImage();
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
  lightboxNext.addEventListener('click', () => navigateLightbox(1));

  // Close lightbox on backdrop click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target === lightbox.querySelector('.lightbox__content')) {
      closeLightbox();
    }
  });

  // Keyboard navigation for lightbox
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('lightbox--open')) return;

    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        navigateLightbox(-1);
        break;
      case 'ArrowRight':
        navigateLightbox(1);
        break;
    }
  });

  // ─── Keyboard Accessibility: Escape closes mobile nav ─
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('mobile-nav--open')) {
      closeMobileNav();
    }
  });

})();

