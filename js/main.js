/* ═══════════════════════════════════════════════════════
   ORIGIN — Main JavaScript
   Handles navigation, animations, lightbox, and interactions
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Reset Scroll to Start on Page Load / Refresh ────
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // Clear any existing anchor hash on reload so browser starts fresh at top
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }

  // Force scroll position to the top of the page immediately
  window.scrollTo(0, 0);

  window.addEventListener('pageshow', () => {
    window.scrollTo(0, 0);
  });

  window.addEventListener('beforeunload', () => {
    window.scrollTo(0, 0);
  });

  // ─── DOM References ──────────────────────────────────
  const nav           = document.getElementById('nav');
  const navToggle     = document.getElementById('navToggle');
  const themeToggle   = document.getElementById('themeToggle');
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

  // ─── Colour Theme Toggle ────────────────────────────
  const footerLogo = document.getElementById('footerLogo');
  themeToggle.addEventListener('click', () => {
    const isDark = document.body.dataset.theme !== 'dark';
    if (isDark) {
      document.body.dataset.theme = 'dark';
      if (footerLogo) footerLogo.src = 'assets/images/logo-dark.png';
    } else {
      delete document.body.dataset.theme;
      if (footerLogo) footerLogo.src = 'assets/images/logo.png';
    }

    themeToggle.setAttribute(
      'aria-label',
      isDark ? 'Switch to light theme' : 'Switch to dark theme'
    );
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.content = isDark ? '#0A0D14' : '#EDF3FA';
    }
  });

    // ─── Coaching Application ────────────────────────────
    const careersForm = document.getElementById('careersForm');
    const careersStatus = document.getElementById('careersStatus');

    careersForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const name = careersForm.querySelector('#applicantName')?.value.trim();
      const email = careersForm.querySelector('#applicantEmail')?.value.trim();
      const role = careersForm.querySelector('#applicantRole')?.value;
      const exp = careersForm.querySelector('#applicantExperience')?.value.trim();

      const showStatus = (msg, isError) => {
        if (!careersStatus) return;
        careersStatus.textContent = msg;
        careersStatus.classList.toggle('careers__status--error', Boolean(isError));
        careersStatus.hidden = false;
      };

      if (!name) {
        showStatus('Please enter your full name.', true);
        careersForm.querySelector('#applicantName')?.focus();
        return;
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showStatus('Please enter a valid email address.', true);
        careersForm.querySelector('#applicantEmail')?.focus();
        return;
      }

      if (!role) {
        showStatus('Please select a coaching role.', true);
        careersForm.querySelector('#applicantRole')?.focus();
        return;
      }

      if (!exp) {
        showStatus('Please share a brief summary of your qualifications.', true);
        careersForm.querySelector('#applicantExperience')?.focus();
        return;
      }

      const application = new FormData(careersForm);
      const body = [
        `Name: ${application.get('name')}`,
        `Email: ${application.get('email')}`,
        `Phone: ${application.get('phone') || 'Not provided'}`,
        `Role: ${application.get('role')}`,
        '',
        'Qualifications and experience:',
        application.get('experience'),
      ].join('\n');

      showStatus('Application drafted. Opening your email client.', false);

      window.location.href =
        `mailto:info@originfitnessclub.com?subject=${encodeURIComponent('ORIGIN Coaching Application')}&body=${encodeURIComponent(body)}`;
    });

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

  // ─── Bulletproof Smooth Scroll for In-Page Anchors ───
  function smoothScrollToSection(target, href) {
    if (!target) return;

    closeMobileNav();

    // Reveal anim-reveal elements inside target so its bounding box is accurate
    target.querySelectorAll('.anim-reveal').forEach((el) => {
      el.classList.add('anim-reveal--visible');
    });

    const getNavOffset = () => {
      const navEl = document.getElementById('nav');
      return navEl ? navEl.offsetHeight : 70;
    };

    const getTargetScrollY = () => {
      const rect = target.getBoundingClientRect();
      return window.scrollY + rect.top - getNavOffset();
    };

    // 1. Native smooth scroll directly to target (respects CSS scroll-margin-top)
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // 2. Active multi-pass alignment:
    // As lazy images, web fonts, or dynamic content above expand the page during the scroll,
    // re-check the target position and smoothly guide the scroll so it ALWAYS lands exactly at the contact section.
    const correctionDelays = [250, 600, 1000];
    correctionDelays.forEach((delay) => {
      setTimeout(() => {
        const offset = getNavOffset();
        const rect = target.getBoundingClientRect();
        // If target top deviates from nav offset by more than 20px, realign smoothly
        if (Math.abs(rect.top - offset) > 20) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, delay);
    });

    // 3. Update URL hash without causing a default jump
    if (href && window.history && window.history.pushState) {
      window.history.pushState(null, '', href);
    }
  }

  // Delegated event listener so ALL anchor links (present or dynamic) work
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;

    // Support both #contact and #enquiry or any section ID
    let target = document.querySelector(href);
    if (!target && (href === '#enquiry' || href === '#contact')) {
      target = document.getElementById('contact') || document.getElementById('enquiry');
    }

    if (!target) return;

    e.preventDefault();
    smoothScrollToSection(target, href);
  });

  // ─── Scroll Reveal & Hero Load Animations ────────────
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (!prefersReducedMotion) {
    const revealElements = document.querySelectorAll('.anim-reveal');

    // Add js-ready class so CSS only animates when JS is ready
    document.documentElement.classList.add('js-ready');

    // Trigger hero entrance immediately after first paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (hero) hero.classList.add('hero--loaded');
      });
    });

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
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 100) {
        el.classList.add('anim-reveal--visible');
      } else {
        revealObserver.observe(el);
      }
    });
  } else {
    if (hero) hero.classList.add('hero--loaded');
    document.querySelectorAll('.anim-reveal').forEach((el) => {
      el.classList.add('anim-reveal--visible');
    });
  }

  // ─── Tagline Word-by-Word Scroll Reveal (B11) ────────
  const taglineSection = document.getElementById('taglineReveal');
  if (taglineSection) {
    const quoteParagraph = taglineSection.querySelector('.brand-statement__quote p');
    if (quoteParagraph) {
      const words = [];
      const tokenizeNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const parts = node.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(part));
            } else {
              const span = document.createElement('span');
              span.className = 'tagline-word';
              span.textContent = part;
              words.push(span);
              frag.appendChild(span);
            }
          });
          node.parentNode.replaceChild(frag, node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.tagName === 'BR') return;
          Array.from(node.childNodes).forEach(tokenizeNode);
        }
      };

      Array.from(quoteParagraph.childNodes).forEach(tokenizeNode);

      if (prefersReducedMotion) {
        words.forEach((w) => w.classList.add('tagline-word--revealed'));
      } else {
        let revealedCount = 0;
        let rafPending = false;

        const updateTaglineWords = () => {
          rafPending = false;
          const rect = taglineSection.getBoundingClientRect();
          const vh = window.innerHeight;
          const startY = vh * 0.85;
          const endY = vh * 0.52;
          const centerY = rect.top + rect.height * 0.5;
          const progress = Math.min(1, Math.max(0, (startY - centerY) / (startY - endY)));
          const targetCount = Math.ceil(progress * words.length);

          if (targetCount > revealedCount) {
            for (let i = revealedCount; i < targetCount; i++) {
              words[i].classList.add('tagline-word--revealed');
            }
            revealedCount = targetCount;
          }

          if (revealedCount >= words.length) {
            window.removeEventListener('scroll', onScrollTagline);
          }
        };

        const onScrollTagline = () => {
          if (!rafPending) {
            rafPending = true;
            requestAnimationFrame(updateTaglineWords);
          }
        };

        window.addEventListener('scroll', onScrollTagline, { passive: true });
        requestAnimationFrame(updateTaglineWords);
      }
    }
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

  // ─── Membership Category Tabs ────────────────────────
  const membershipTabs    = document.querySelectorAll('.membership__tab');
  const membershipSubnote = document.getElementById('membershipSubnote');
  const planCards         = document.querySelectorAll('.membership__grid .plan');

  const pricingData = {
    individual: {
      subnote: 'Standard individual access to all 3 floors.',
      categoryLabel: 'Basic Access',
      prices: {
        monthly: '2,997',
        quarterly: '7,997',
        halfyearly: '9,997',
        yearly: '12,997',
      },
    },
    couple: {
      subnote: 'Special couple pricing applied per person when joining together.',
      categoryLabel: 'Couple Offer',
      prices: {
        monthly: '2,697',
        quarterly: '7,197',
        halfyearly: '8,997',
        yearly: '11,697',
      },
    },
    buddy: {
      subnote: 'Special buddy discount applied per person when joining with a friend.',
      categoryLabel: 'Buddy Offer',
      prices: {
        monthly: '2,697',
        quarterly: '7,197',
        halfyearly: '8,497',
        yearly: '11,047',
      },
    },
  };

  membershipTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const category = tab.dataset.category;
      if (!category || !pricingData[category]) return;

      membershipTabs.forEach((t) => {
        t.classList.remove('membership__tab--active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('membership__tab--active');
      tab.setAttribute('aria-selected', 'true');

      if (membershipSubnote) {
        membershipSubnote.textContent = pricingData[category].subnote;
      }

      const categoryLabel = pricingData[category].categoryLabel;

      planCards.forEach((card) => {
        const planKey = card.dataset.plan;
        const priceEl = card.querySelector('[data-price]');
        const ctaEl = card.querySelector('.plan__cta');
        const planName = card.querySelector('.plan__name')?.textContent.trim() || '';

        if (priceEl && planKey && pricingData[category].prices[planKey]) {
          priceEl.style.opacity = '0';
          setTimeout(() => {
            priceEl.textContent = pricingData[category].prices[planKey];
            priceEl.style.opacity = '1';
          }, 150);
        }

        if (ctaEl) {
          const text = encodeURIComponent(
            `Hi ORIGIN, I'd like to enquire about the ${planName} Membership (${categoryLabel}) plan.`
          );
          ctaEl.href = `https://wa.me/919642076707?text=${text}`;
        }
      });
    });
  });

  // ─── Ambient Video Autoplay Guarantee ────────────────
  const ambientVideos = document.querySelectorAll('video[autoplay]');
  let hasPausedAmbientVideos = true;

  function playAmbientVideo(vid) {
    if (!vid) return;
    vid.muted = true;
    vid.defaultMuted = true;
    vid.playsInline = true;
    vid.setAttribute('muted', '');
    vid.setAttribute('playsinline', '');
    vid.setAttribute('webkit-playsinline', '');
    vid.setAttribute('x5-playsinline', '');

    const p = vid.play();
    if (p !== undefined) {
      p.then(() => {
        vid.classList.add('video--playing');
        // Update paused state flag
        hasPausedAmbientVideos = Array.from(ambientVideos).some((v) => v.paused);
      }).catch(() => {
        hasPausedAmbientVideos = true;
      });
    }
  }

  function resumeAllPausedAmbientVideos() {
    let anyPaused = false;
    ambientVideos.forEach((vid) => {
      if (vid.paused) {
        anyPaused = true;
        playAmbientVideo(vid);
      }
    });
    hasPausedAmbientVideos = anyPaused;
  }

  // Fallback interaction triggers: touch, scroll, pointer, click, key
  const ambientUnlockEvents = ['touchstart', 'touchend', 'pointerdown', 'mousedown', 'keydown', 'scroll'];
  const handleAmbientInteraction = () => {
    if (hasPausedAmbientVideos) {
      resumeAllPausedAmbientVideos();
    }
  };

  ambientUnlockEvents.forEach((evt) => {
    window.addEventListener(evt, handleAmbientInteraction, { passive: true });
    document.addEventListener(evt, handleAmbientInteraction, { passive: true });
  });

  ambientVideos.forEach((vid) => {
    // Media lifecycle hooks
    vid.addEventListener('canplay', () => {
      if (vid.paused) playAmbientVideo(vid);
    });

    vid.addEventListener('loadeddata', () => {
      if (vid.paused) playAmbientVideo(vid);
    });

    vid.addEventListener('pause', () => {
      hasPausedAmbientVideos = true;
    });

    vid.addEventListener('playing', () => {
      vid.classList.add('video--playing');
      hasPausedAmbientVideos = Array.from(ambientVideos).some((v) => v.paused);
    });

    vid.addEventListener('ended', () => {
      vid.currentTime = 0;
      playAmbientVideo(vid);
    });

    // Immediate initial play attempt
    playAmbientVideo(vid);
  });

  // IntersectionObserver for ambient videos
  if ('IntersectionObserver' in window) {
    const ambientObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const vid = entry.target;
        if (entry.isIntersecting) {
          if (vid.paused) playAmbientVideo(vid);
        }
      });
    }, { threshold: 0.05, rootMargin: '120px 0px 120px 0px' });

    ambientVideos.forEach((vid) => ambientObserver.observe(vid));
  }

  // Resume playback on tab return / page show
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      ambientVideos.forEach((vid) => {
        if (vid.paused) playAmbientVideo(vid);
      });
    }
  });

  window.addEventListener('pageshow', () => {
    ambientVideos.forEach((vid) => {
      if (vid.paused) playAmbientVideo(vid);
    });
  });

  window.addEventListener('focus', () => {
    ambientVideos.forEach((vid) => {
      if (vid.paused) playAmbientVideo(vid);
    });
  });

  // ─── Video Reel Modal ────────────────────────────────
  const videoModal = document.getElementById('videoModal');
  const modalPlayer = document.getElementById('modalVideoPlayer');
  const videoCloseBtn = document.getElementById('videoModalClose');
  const videoBackdrop = document.getElementById('videoModalBackdrop');
  const openReelBtns = document.querySelectorAll('.open-reel-btn');
  const videoPlayToggle = document.getElementById('videoPlayToggle');
  const videoSoundToggle = document.getElementById('videoSoundToggle');

  function openVideoModal() {
    if (!videoModal || !modalPlayer) return;
    videoModal.classList.add('video-modal--active');
    videoModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    modalPlayer.currentTime = 0;
    modalPlayer.muted = false;
    updateSoundIcons(false);
    const playPromise = modalPlayer.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          updatePlayIcons(false);
        })
        .catch(() => {
          // Fallback if browser requires user gesture for audio
          modalPlayer.muted = true;
          updateSoundIcons(true);
          modalPlayer.play().then(() => updatePlayIcons(false)).catch(() => {});
        });
    }
  }

  function closeVideoModal() {
    if (!videoModal || !modalPlayer) return;
    modalPlayer.pause();
    videoModal.classList.remove('video-modal--active');
    videoModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    updatePlayIcons(true);
  }

  function updatePlayIcons(isPaused) {
    if (!videoPlayToggle) return;
    const pauseIcon = videoPlayToggle.querySelector('.icon-pause');
    const playIcon = videoPlayToggle.querySelector('.icon-play');
    if (pauseIcon && playIcon) {
      pauseIcon.style.display = isPaused ? 'none' : 'block';
      playIcon.style.display = isPaused ? 'block' : 'none';
    }
  }

  function updateSoundIcons(isMuted) {
    if (!videoSoundToggle) return;
    const soundOn = videoSoundToggle.querySelector('.icon-sound-on');
    const soundOff = videoSoundToggle.querySelector('.icon-sound-off');
    if (soundOn && soundOff) {
      soundOn.style.display = isMuted ? 'none' : 'block';
      soundOff.style.display = isMuted ? 'block' : 'none';
    }
  }

  const INSTAGRAM_REEL_URL = 'https://www.instagram.com/reel/DfSZTyDyZ9I/?utm_source=ig_web_copy_link&obrf=NTc4MTIwNjQ2YQ==';

  if (openReelBtns.length > 0) {
    openReelBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        if (!btn.hasAttribute('href')) {
          e.preventDefault();
          window.open(INSTAGRAM_REEL_URL, '_blank', 'noopener,noreferrer');
        }
      });
    });
  }

  if (videoCloseBtn) {
    videoCloseBtn.addEventListener('click', closeVideoModal);
  }

  if (videoBackdrop) {
    videoBackdrop.addEventListener('click', closeVideoModal);
  }

  if (videoPlayToggle && modalPlayer) {
    videoPlayToggle.addEventListener('click', () => {
      if (modalPlayer.paused) {
        modalPlayer.play();
        updatePlayIcons(false);
      } else {
        modalPlayer.pause();
        updatePlayIcons(true);
      }
    });
  }

  if (videoSoundToggle && modalPlayer) {
    videoSoundToggle.addEventListener('click', () => {
      modalPlayer.muted = !modalPlayer.muted;
      updateSoundIcons(modalPlayer.muted);
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal && videoModal.classList.contains('video-modal--active')) {
      closeVideoModal();
    }
  });


  // ─── Mobile Scroll Rail Cue Dismissal ────────────────
  const mobileScrollRails = document.querySelectorAll(
    '.trainers__grid, .achievements-showcase__grid, .membership__grid'
  );

  mobileScrollRails.forEach((rail) => {
    rail.addEventListener('scroll', () => {
      if (rail.scrollLeft < 15) return;
      const prev = rail.previousElementSibling;
      if (prev && prev.classList.contains('mobile-scroll-cue')) {
        prev.classList.add('mobile-scroll-cue--dismissed');
      }
    }, { passive: true });
  });

})();
