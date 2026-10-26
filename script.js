/**
 * GRACE HAVEN CHURCH - MODERN, SPIRITUAL JAVASCRIPT
 * Handles mobile drawer, smooth navigation, scrollspy, lightbox,
 * interactive modals, sermon player simulation, and contact form validation.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================================================================
  // 1. STICKY HEADER & NAVBAR SCROLL BEHAVIOR
  // =========================================================================
  const header = document.getElementById('header');
  
  const handleScroll = () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial check

  // =========================================================================
  // 2. MOBILE NAVIGATION DRAWER
  // =========================================================================
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileCloseBtn = document.getElementById('mobileCloseBtn');
  const mobileBackdrop = document.getElementById('mobileBackdrop');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link, .mobile-join-btn');

  const openMobileNav = () => {
    mobileMenu.classList.add('open');
    mobileBackdrop.classList.add('open');
    hamburgerBtn.classList.add('active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeMobileNav = () => {
    mobileMenu.classList.remove('open');
    mobileBackdrop.classList.remove('open');
    hamburgerBtn.classList.remove('active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMobileNav);
  if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMobileNav);
  if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMobileNav);

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileNav();
    });
  });

  // =========================================================================
  // 3. SMOOTH SCROLLING WITH OFFSET FOR STICKY HEADER
  // =========================================================================
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 80;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - (headerHeight + 10);

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // =========================================================================
  // 4. SCROLLSPY (ACTIVE NAV LINK HIGHLIGHTING)
  // =========================================================================
  const sections = document.querySelectorAll('main > section[id], header[id]');
  const navLinks = document.querySelectorAll('.main-nav .nav-link');

  const updateActiveNavLink = () => {
    let currentSectionId = '';
    const scrollPos = window.pageYOffset + 140;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    if (currentSectionId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    }
  };

  window.addEventListener('scroll', updateActiveNavLink, { passive: true });

  // =========================================================================
  // 5. INTERSECTION OBSERVER FOR FADE-IN SCROLL ANIMATIONS
  // =========================================================================
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            // Slight stagger effect if items share the same parent grid
            setTimeout(() => {
              entry.target.classList.add('revealed');
            }, (index % 4) * 80);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.12
      }
    );

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback if browser doesn't support IntersectionObserver
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  // =========================================================================
  // 6. GALLERY FILTERING & LIGHTBOX MODAL
  // =========================================================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('galleryLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
  const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
  const lightboxNextBtn = document.getElementById('lightboxNextBtn');

  let currentGalleryIndex = 0;
  let activeGalleryItems = Array.from(galleryItems);

  // Category Filtering
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (filterValue === 'all' || itemCategory === filterValue) {
          item.style.display = 'block';
          item.style.animation = 'fadeInUp 0.4s ease forwards';
        } else {
          item.style.display = 'none';
        }
      });

      // Update visible items list for lightbox navigation
      activeGalleryItems = Array.from(galleryItems).filter(item => item.style.display !== 'none');
    });
  });

  // Open Lightbox
  const openLightbox = (index) => {
    currentGalleryIndex = index;
    const targetItem = activeGalleryItems[currentGalleryIndex];
    if (!targetItem) return;

    const img = targetItem.querySelector('img');
    const title = targetItem.querySelector('.gallery-item-title') ? targetItem.querySelector('.gallery-item-title').textContent : '';
    const cat = targetItem.querySelector('.gallery-cat-pill') ? targetItem.querySelector('.gallery-cat-pill').textContent : '';

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || title;
    lightboxCaption.innerHTML = `
      <span class="caption-cat">${cat}</span>
      <h4 class="caption-title">${title}</h4>
    `;

    lightbox.hidden = false;
    setTimeout(() => {
      lightbox.classList.add('active');
    }, 10);
    document.body.style.overflow = 'hidden';
  };

  // Close Lightbox
  const closeLightbox = () => {
    lightbox.classList.remove('active');
    setTimeout(() => {
      lightbox.hidden = true;
      lightboxImg.src = '';
    }, 300);
    document.body.style.overflow = '';
  };

  // Next / Prev Lightbox Navigation
  const showNextLightbox = () => {
    if (activeGalleryItems.length === 0) return;
    currentGalleryIndex = (currentGalleryIndex + 1) % activeGalleryItems.length;
    openLightbox(currentGalleryIndex);
  };

  const showPrevLightbox = () => {
    if (activeGalleryItems.length === 0) return;
    currentGalleryIndex = (currentGalleryIndex - 1 + activeGalleryItems.length) % activeGalleryItems.length;
    openLightbox(currentGalleryIndex);
  };

  // Click on gallery item to open
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      activeGalleryItems = Array.from(galleryItems).filter(i => i.style.display !== 'none');
      const idx = activeGalleryItems.indexOf(item);
      if (idx !== -1) {
        openLightbox(idx);
      }
    });
  });

  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
  if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', showNextLightbox);
  if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', showPrevLightbox);

  // Close lightbox on backdrop click
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  // =========================================================================
  // 7. GENERIC MODAL MANAGER (VISIT MODAL, PASTOR MODAL, SERMON MODAL)
  // =========================================================================
  const openModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.hidden = false;
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove('active');
    setTimeout(() => {
      modal.hidden = true;
    }, 300);
    document.body.style.overflow = '';
  };

  // Universal close modal triggers
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modalId = btn.getAttribute('data-close-modal');
      const modal = document.getElementById(modalId);
      closeModal(modal);
    });
  });

  // Close on modal backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop);
      }
    });
  });

  // Global ESC key listener for all open dialogs
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lightbox && !lightbox.hidden) {
        closeLightbox();
      }
      document.querySelectorAll('.modal-backdrop.active').forEach(modal => {
        closeModal(modal);
      });
      if (mobileMenu && mobileMenu.classList.contains('open')) {
        closeMobileNav();
      }
    }
  });

  // Plan Your Visit triggers
  document.querySelectorAll('.open-visit-modal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('visitModal');
    });
  });

  // Pastor Story Modal triggers
  const openPastorModalBtn = document.getElementById('openPastorModalBtn');
  const openStoryModalBtn = document.getElementById('openStoryModalBtn');

  if (openPastorModalBtn) {
    openPastorModalBtn.addEventListener('click', () => openModal('pastorModal'));
  }
  if (openStoryModalBtn) {
    openStoryModalBtn.addEventListener('click', () => openModal('pastorModal'));
  }

  // Event "Learn More" buttons
  document.querySelectorAll('.event-learn-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.getAttribute('data-event-title');
      const time = btn.getAttribute('data-event-time');
      const loc = btn.getAttribute('data-event-loc');
      showToast(`Event: ${title}`, `Mark your calendar for ${time} in the ${loc}. We look forward to seeing you!`);
    });
  });

  // =========================================================================
  // 8. SERMON VIDEO / AUDIO PLAYER MODAL
  // =========================================================================
  const sermonModal = document.getElementById('sermonModal');
  const sermonModalTitle = document.getElementById('sermonModalTitle');
  const playerSpeaker = document.getElementById('playerSpeaker');
  const playerDate = document.getElementById('playerDate');

  const openSermonModal = (title, speaker, date) => {
    if (sermonModalTitle && title) sermonModalTitle.textContent = title;
    if (playerSpeaker && speaker) playerSpeaker.innerHTML = `<i class="fa-solid fa-user-tie"></i> ${speaker}`;
    if (playerDate && date) playerDate.innerHTML = `<i class="fa-regular fa-calendar"></i> ${date}`;
    openModal('sermonModal');
  };

  // Featured sermon play triggers
  const featuredPlayBtn = document.getElementById('featuredPlayBtn');
  if (featuredPlayBtn) {
    featuredPlayBtn.addEventListener('click', () => {
      const title = featuredPlayBtn.getAttribute('data-video-title');
      const speaker = featuredPlayBtn.getAttribute('data-speaker');
      const date = featuredPlayBtn.getAttribute('data-date');
      openSermonModal(title, speaker, date);
    });
  }

  document.querySelectorAll('.sermon-watch-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.getAttribute('data-video-title') || 'Walking Through the Valley with Unshakeable Peace';
      const speaker = btn.getAttribute('data-speaker') || 'Pastor David Anderson';
      const date = btn.getAttribute('data-date') || 'Sunday Service';
      openSermonModal(title, speaker, date);
    });
  });

  document.querySelectorAll('.sermon-listen-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.getAttribute('data-audio-title') || 'Featured Message';
      showToast('Audio Sermon Loaded', `Now streaming: "${title}". Put on your headphones and enjoy God's word.`);
    });
  });

  // Video Player Play/Pause Toggle Simulation
  const playPauseToggle = document.querySelector('.play-pause-toggle');
  if (playPauseToggle) {
    let isPlaying = true;
    playPauseToggle.addEventListener('click', () => {
      isPlaying = !isPlaying;
      playPauseToggle.innerHTML = isPlaying 
        ? '<i class="fa-solid fa-pause"></i>' 
        : '<i class="fa-solid fa-play"></i>';
    });
  }

  // =========================================================================
  // 9. TOAST NOTIFICATIONS
  // =========================================================================
  const toastNotice = document.getElementById('toastNotice');
  let toastTimer = null;

  const showToast = (title, message) => {
    if (!toastNotice) return;
    const toastTitleEl = toastNotice.querySelector('.toast-title');
    const toastDescEl = toastNotice.querySelector('.toast-desc');

    if (toastTitleEl) toastTitleEl.textContent = title;
    if (toastDescEl) toastDescEl.textContent = message;

    toastNotice.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 4500);
  };

  // =========================================================================
  // 10. CONTACT FORM VALIDATION & INTERACTION
  // =========================================================================
  const contactForm = document.getElementById('churchContactForm');
  const formSuccessCard = document.getElementById('formSuccessCard');
  const sendAnotherBtn = document.getElementById('sendAnotherBtn');
  const submitBtn = document.getElementById('contactSubmitBtn');

  if (contactForm) {
    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const messageInput = document.getElementById('contactMessage');

    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const messageError = document.getElementById('messageError');

    const validateEmail = (email) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const clearErrors = () => {
      nameInput.classList.remove('is-invalid');
      emailInput.classList.remove('is-invalid');
      messageInput.classList.remove('is-invalid');
      if (nameError) nameError.classList.remove('visible');
      if (emailError) emailError.classList.remove('visible');
      if (messageError) messageError.classList.remove('visible');
    };

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors();

      let isValid = true;

      // Validate Name
      if (!nameInput.value.trim()) {
        nameInput.classList.add('is-invalid');
        if (nameError) nameError.classList.add('visible');
        isValid = false;
      }

      // Validate Email
      if (!emailInput.value.trim() || !validateEmail(emailInput.value.trim())) {
        emailInput.classList.add('is-invalid');
        if (emailError) emailError.classList.add('visible');
        isValid = false;
      }

      // Validate Message
      if (!messageInput.value.trim()) {
        messageInput.classList.add('is-invalid');
        if (messageError) messageError.classList.add('visible');
        isValid = false;
      }

      if (!isValid) return;

      // Submit message to Supabase Backend
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Sending Message...</span>';

      const phoneVal = document.getElementById('contactPhone') ? document.getElementById('contactPhone').value.trim() : '';
      const topicEl = document.getElementById('contactTopic');
      const topicVal = topicEl ? (topicEl.options[topicEl.selectedIndex]?.text || topicEl.value) : 'General Inquiry';

      if (window.ChurchAPI && window.ChurchAPI.submitContactMessage) {
        window.ChurchAPI.submitContactMessage({
          fullName: nameInput.value.trim(),
          email: emailInput.value.trim(),
          phone: phoneVal,
          subject: topicVal,
          message: messageInput.value.trim()
        }).then(({ error }) => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          if (error) {
            console.error('Contact submission error:', error);
            showToast('Submission Issue', 'Could not save message to database. Please check your connection.');
          } else {
            contactForm.classList.add('hidden');
            if (formSuccessCard) formSuccessCard.classList.remove('hidden');
            showToast('Message Sent in Grace', `Thank you ${nameInput.value.trim()}, our church pastoral team will reply soon!`);
          }
        }).catch(err => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          contactForm.classList.add('hidden');
          if (formSuccessCard) formSuccessCard.classList.remove('hidden');
          showToast('Message Sent in Grace', `Thank you ${nameInput.value.trim()}, our church pastoral team will reply soon!`);
        });
      } else {
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          contactForm.classList.add('hidden');
          if (formSuccessCard) formSuccessCard.classList.remove('hidden');
          showToast('Message Sent in Grace', `Thank you ${nameInput.value.trim()}, our church pastoral team will reply soon!`);
        }, 800);
      }
    });

    if (sendAnotherBtn) {
      sendAnotherBtn.addEventListener('click', () => {
        contactForm.reset();
        clearErrors();
        formSuccessCard.classList.add('hidden');
        contactForm.classList.remove('hidden');
      });
    }

    // Clear individual errors on input
    nameInput.addEventListener('input', () => {
      if (nameInput.value.trim()) {
        nameInput.classList.remove('is-invalid');
        if (nameError) nameError.classList.remove('visible');
      }
    });

    emailInput.addEventListener('input', () => {
      if (validateEmail(emailInput.value.trim())) {
        emailInput.classList.remove('is-invalid');
        if (emailError) emailError.classList.remove('visible');
      }
    });

    messageInput.addEventListener('input', () => {
      if (messageInput.value.trim()) {
        messageInput.classList.remove('is-invalid');
        if (messageError) messageError.classList.remove('visible');
      }
    });
  }

  // =========================================================================
  // 11. SUPABASE LIVE DYNAMIC CONTENT HYDRATION
  // =========================================================================
  async function hydrateFromSupabase() {
    if (!window.ChurchAPI) return;

    try {
      // 1. Church Settings (Hero & Pastor & Contact Info)
      const settings = await window.ChurchAPI.getChurchSettings();
      if (settings) {
        // Hero
        const heroTitle = document.querySelector('.hero-title');
        const heroLead = document.querySelector('.hero-lead');
        const heroBg = document.querySelector('.hero-bg-img');
        if (heroTitle && settings.hero_title) heroTitle.textContent = settings.hero_title;
        if (heroLead && settings.hero_description) heroLead.textContent = settings.hero_description;
        if (heroBg && settings.hero_bg_image) heroBg.src = settings.hero_bg_image;

        // Pastor
        const pastorKicker = document.querySelector('.pastor-kicker');
        const pastorHeadline = document.querySelector('.pastor-headline');
        const pastorQuote = document.querySelector('.pastor-quote');
        const pastorImg = document.querySelector('.pastor-feature-img');
        if (pastorKicker && settings.pastor_eyebrow) pastorKicker.textContent = settings.pastor_eyebrow;
        if (pastorHeadline && settings.pastor_name) pastorHeadline.textContent = settings.pastor_name;
        if (pastorQuote && settings.pastor_quote) pastorQuote.textContent = settings.pastor_quote;
        if (pastorImg && settings.pastor_image) pastorImg.src = settings.pastor_image;

        // Contact info in contact section
        const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
        const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
        if (settings.phone) {
          phoneLinks.forEach(el => {
            el.href = `tel:${settings.phone.replace(/[^0-9+]/g, '')}`;
            el.textContent = settings.phone;
          });
        }
        if (settings.email) {
          emailLinks.forEach(el => {
            el.href = `mailto:${settings.email}`;
            el.textContent = settings.email;
          });
        }
      }

      // 2. Pathway Cards
      const pathwayCards = await window.ChurchAPI.getPathwayCards();
      const pathwayGrid = document.querySelector('.pathway-grid');
      if (pathwayGrid && pathwayCards && pathwayCards.length > 0) {
        pathwayGrid.innerHTML = pathwayCards.map((card, idx) => `
          <div class="pathway-card ${idx === 1 ? 'featured-card' : ''} reveal-on-scroll is-revealed">
            <div class="pathway-img-wrap">
              <img src="${card.image_url}" alt="${card.title}" class="pathway-img" loading="lazy" onerror="this.src='images/know-god.jpg'">
            </div>
            <div class="pathway-body">
              <h3 class="pathway-title">${card.title.toUpperCase()}</h3>
              <p class="pathway-desc">${card.description}</p>
              <a href="${card.link_url || '#contact'}" class="pathway-link">
                <span>Learn More</span>
                <i class="fa-solid fa-caret-right"></i>
              </a>
            </div>
          </div>
        `).join('');
      }

      // 3. Testimonials
      const testimonials = await window.ChurchAPI.getTestimonials();
      const testimonialsGrid = document.querySelector('.testimonials-grid');
      if (testimonialsGrid && testimonials && testimonials.length > 0) {
        testimonialsGrid.innerHTML = testimonials.map((t, idx) => `
          <div class="testimonial-card ${idx === 1 ? 'featured-testimonial' : ''} reveal-on-scroll is-revealed">
            <div class="testimonial-quote-icon">
              <i class="fa-solid fa-quote-left"></i>
            </div>
            <p class="testimonial-text">“${t.quote}”</p>
            <div class="testimonial-author">
              <img src="${t.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}"
                alt="${t.author_name}" class="testimonial-avatar" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'">
              <div class="testimonial-meta">
                <h4 class="author-name">${t.author_name}</h4>
                <span class="author-sub">${t.author_role || 'Member'}</span>
              </div>
            </div>
          </div>
        `).join('');
      }

    } catch (err) {
      console.warn('Supabase hydration note:', err);
    }
  }

  hydrateFromSupabase();
});
