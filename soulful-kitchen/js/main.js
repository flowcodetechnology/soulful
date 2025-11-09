(() => {
  const docReady = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  };

  docReady(() => {
    const headerLinks = document.querySelectorAll('[data-scroll], a[href^="#"]');
    headerLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        const hash = link.getAttribute('href');
        if (!hash || hash === '#' || hash.startsWith('mailto:') || hash.startsWith('tel:')) {
          return;
        }
        const target = document.querySelector(hash);
        if (target) {
          event.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    const today = new Date();
    const formatted = today.toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach((input) => {
      input.setAttribute('min', formatted);
    });

    const yearEl = document.getElementById('year');
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }

    const toastTemplate = document.getElementById('toastTemplate');
    const showToast = (message, tone = 'success') => {
      if (!toastTemplate) return;
      const toast = toastTemplate.content.firstElementChild.cloneNode(true);
      toast.textContent = message;
      toast.dataset.tone = tone;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    };

    // Video modal logic
    const modal = document.getElementById('videoModal');
    const modalCloseEls = modal ? modal.querySelectorAll('[data-modal-close]') : [];
    const videoEmbed = document.getElementById('videoEmbed');
    let lastFocusedElement = null;
    let iframeLoaded = false;

    const loadYoutubeIframe = (id) => {
      if (iframeLoaded || !videoEmbed) return;
      const iframe = document.createElement('iframe');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      iframe.setAttribute('allowfullscreen', '');
      iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
      iframe.title = 'Soulful Kitchen video';
      videoEmbed.appendChild(iframe);
      iframeLoaded = true;
    };

    const trapFocus = (event) => {
      if (!modal || modal.getAttribute('aria-hidden') === 'true') return;
      const focusableSelectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
      const focusable = Array.from(modal.querySelectorAll(focusableSelectors)).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.key === 'Tab') {
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    const openModal = (id, trigger) => {
      if (!modal) return;
      lastFocusedElement = trigger || document.activeElement;
      modal.setAttribute('aria-hidden', 'false');
      modal.style.display = 'flex';
      loadYoutubeIframe(id);
      const closeButton = modal.querySelector('.modal__close');
      (closeButton || modal).focus();
      document.addEventListener('keydown', handleKeydown);
      document.addEventListener('keydown', trapFocus);
    };

    const closeModal = () => {
      if (!modal) return;
      modal.setAttribute('aria-hidden', 'true');
      modal.style.display = 'none';
      document.removeEventListener('keydown', trapFocus);
      document.removeEventListener('keydown', handleKeydown);
      if (lastFocusedElement) {
        lastFocusedElement.focus();
      }
      if (videoEmbed) {
        videoEmbed.innerHTML = '';
        iframeLoaded = false;
      }
    };

    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    document.querySelectorAll('.js-open-video').forEach((button) => {
      button.addEventListener('click', () => {
        const videoId = button.dataset.youtubeId || videoEmbed?.dataset.youtubeId || '';
        if (!videoId) {
          showToast('Video unavailable. Please provide a YouTube ID.', 'error');
          return;
        }
        openModal(videoId, button);
      });
    });

    modalCloseEls.forEach((el) => {
      el.addEventListener('click', closeModal);
    });

    if (modal) {
      modal.addEventListener('click', (event) => {
        if (event.target === modal) {
          closeModal();
        }
      });
    }

    const serializeForm = (form) => {
      const data = {};
      const formData = new FormData(form);
      formData.forEach((value, key) => {
        data[key] = typeof value === 'string' ? value.trim() : value;
      });
      return data;
    };

    const submitForm = async (form, payload) => {
      try {
        const response = await fetch('form-handler.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await response.json();
        if (!response.ok || !json.ok) {
          throw new Error(json.error || 'Submission failed');
        }
        form.reset();
        return json;
      } catch (error) {
        throw error;
      }
    };

    const quickLeadForm = document.getElementById('quickLeadForm');
    if (quickLeadForm) {
      quickLeadForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const payload = serializeForm(quickLeadForm);
        payload.source = 'quick-lead';
        try {
          await submitForm(quickLeadForm, payload);
          showToast('Thanks! We will reach out shortly.');
        } catch (error) {
          showToast(error.message || 'Unable to submit form.', 'error');
        }
      });
    }

    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
      bookingForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const payload = serializeForm(bookingForm);
        try {
          await submitForm(bookingForm, payload);
          showToast('Booking received! We will confirm soon.');
        } catch (error) {
          showToast(error.message || 'Unable to submit booking.', 'error');
        }
      });
    }
  });
})();
