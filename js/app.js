/* ============================================================
   ShandyMan Contracting — App Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. Scroll Reveal Animations ---------- */
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, index * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));


  /* ---------- 2. Header Scroll Effect ---------- */
  const header = document.querySelector('.site-header');
  const handleHeaderScroll = () => {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();


  /* ---------- 3. Mobile Navigation ---------- */
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }


  /* ---------- 4. Hero Rotating Text ---------- */
  const rotatingEl = document.querySelector('.hero-rotating-text');
  if (rotatingEl) {
    const words = ['Renovations', 'Custom Kitchens', 'Home Additions', 'Carpentry', 'New Builds'];
    let wordIndex = 0;

    const rotateWord = () => {
      rotatingEl.style.opacity = '0';
      rotatingEl.style.transform = 'translateY(10px)';

      setTimeout(() => {
        wordIndex = (wordIndex + 1) % words.length;
        rotatingEl.textContent = words[wordIndex];
        rotatingEl.style.opacity = '1';
        rotatingEl.style.transform = 'translateY(0)';
      }, 300);
    };

    rotatingEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    setInterval(rotateWord, 2800);
  }


  /* ---------- 5. Showcase Filter ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const showcaseCards = document.querySelectorAll('.showcase-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      showcaseCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = '';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 350);
        }
      });
    });
  });


  /* ---------- 6. Quote Calculator ---------- */
  const calcSteps = document.querySelectorAll('.calc-step');
  const progressDots = document.querySelectorAll('.calc-progress-dot');
  let currentStep = 0;

  const calcState = {
    projectType: '',
    sqft: 500,
    finish: ''
  };

  // Pricing matrix (per sqft in CAD)
  const pricing = {
    kitchen:    { standard: [80, 120],  premium: [150, 250],  luxury: [280, 450] },
    bathroom:   { standard: [100, 160], premium: [200, 320],  luxury: [350, 550] },
    addition:   { standard: [200, 300], premium: [350, 500],  luxury: [550, 800] },
    renovation: { standard: [60, 100],  premium: [120, 200],  luxury: [220, 380] },
    newbuild:   { standard: [180, 260], premium: [300, 450],  luxury: [500, 750] },
    carpentry:  { standard: [40, 70],   premium: [80, 140],   luxury: [160, 280] }
  };

  const goToStep = (step) => {
    calcSteps.forEach(s => s.classList.remove('active'));
    calcSteps[step].classList.add('active');

    progressDots.forEach((dot, i) => {
      dot.classList.remove('active', 'completed');
      if (i === step) dot.classList.add('active');
      if (i < step) dot.classList.add('completed');
    });

    currentStep = step;
  };

  // Project type selection
  document.querySelectorAll('.calc-option[data-type]').forEach(option => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.calc-option[data-type]').forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
      calcState.projectType = option.dataset.type;
    });
  });

  // Sq ft slider
  const sqftSlider = document.getElementById('sqft-slider');
  const sqftDisplay = document.getElementById('sqft-display');
  if (sqftSlider) {
    sqftSlider.addEventListener('input', () => {
      calcState.sqft = parseInt(sqftSlider.value);
      sqftDisplay.textContent = calcState.sqft.toLocaleString() + ' sq ft';
    });
  }

  // Finish selection
  document.querySelectorAll('.calc-option[data-finish]').forEach(option => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.calc-option[data-finish]').forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
      calcState.finish = option.dataset.finish;
    });
  });

  // Next / Back
  document.querySelectorAll('.calc-next').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep < calcSteps.length - 1) {
        // Final step: compute result
        if (currentStep === calcSteps.length - 2) {
          computeEstimate();
        }
        goToStep(currentStep + 1);
      }
    });
  });

  document.querySelectorAll('.calc-back').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 0) goToStep(currentStep - 1);
    });
  });

  const computeEstimate = () => {
    const type = calcState.projectType || 'renovation';
    const finish = calcState.finish || 'standard';
    const sqft = calcState.sqft || 500;

    const range = pricing[type]?.[finish] || [100, 200];
    const low = (range[0] * sqft).toLocaleString();
    const high = (range[1] * sqft).toLocaleString();

    const resultEl = document.getElementById('calc-result-price');
    if (resultEl) {
      resultEl.textContent = `$${low} — $${high} CAD`;
    }
  };

  // Restart
  const restartBtn = document.getElementById('calc-restart');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      calcState.projectType = '';
      calcState.sqft = 500;
      calcState.finish = '';

      document.querySelectorAll('.calc-option').forEach(o => o.classList.remove('selected'));
      if (sqftSlider) {
        sqftSlider.value = 500;
        sqftDisplay.textContent = '500 sq ft';
      }
      goToStep(0);
    });
  }


  /* ---------- 7. Testimonial Carousel ---------- */
  const track = document.querySelector('.testimonials-track');
  const prevBtn = document.getElementById('testimonial-prev');
  const nextBtn = document.getElementById('testimonial-next');

  if (track && prevBtn && nextBtn) {
    let scrollPos = 0;
    const cardWidth = () => {
      const card = track.querySelector('.testimonial-card');
      if (!card) return 400;
      const gap = parseInt(getComputedStyle(track).gap) || 24;
      return card.offsetWidth + gap;
    };

    const maxScroll = () => {
      return Math.max(0, track.scrollWidth - track.parentElement.offsetWidth);
    };

    nextBtn.addEventListener('click', () => {
      scrollPos = Math.min(scrollPos + cardWidth(), maxScroll());
      track.style.transform = `translateX(-${scrollPos}px)`;
    });

    prevBtn.addEventListener('click', () => {
      scrollPos = Math.max(scrollPos - cardWidth(), 0);
      track.style.transform = `translateX(-${scrollPos}px)`;
    });

    // Auto-scroll
    let autoplayInterval = setInterval(() => {
      if (scrollPos >= maxScroll()) {
        scrollPos = 0;
      } else {
        scrollPos += cardWidth();
      }
      track.style.transform = `translateX(-${scrollPos}px)`;
    }, 5000);

    // Pause on hover
    track.parentElement.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
    track.parentElement.addEventListener('mouseleave', () => {
      autoplayInterval = setInterval(() => {
        if (scrollPos >= maxScroll()) {
          scrollPos = 0;
        } else {
          scrollPos += cardWidth();
        }
        track.style.transform = `translateX(-${scrollPos}px)`;
      }, 5000);
    });
  }


  /* ---------- 8. Contact Form ---------- */
  const contactForm = document.getElementById('contact-form');
  const successOverlay = document.getElementById('success-overlay');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Simple validation
      const name = contactForm.querySelector('#contact-name');
      const email = contactForm.querySelector('#contact-email');
      const message = contactForm.querySelector('#contact-message');
      let valid = true;

      [name, email, message].forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = '#ef4444';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });

      if (email && email.value && !email.value.includes('@')) {
        email.style.borderColor = '#ef4444';
        valid = false;
      }

      if (valid && successOverlay) {
        successOverlay.classList.add('active');
        contactForm.reset();
      }
    });
  }

  // Close success overlay
  const closeSuccess = document.getElementById('close-success');
  if (closeSuccess && successOverlay) {
    closeSuccess.addEventListener('click', () => {
      successOverlay.classList.remove('active');
    });
  }


  /* ---------- 9. Back to Top ---------- */
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  /* ---------- 10. Smooth Scroll for Anchor Links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

});
