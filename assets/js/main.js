/* All interactions run locally. Form data is never sent or persisted. */
(() => {
  'use strict';
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = $('#site-header');
  const updateHeader = () => header?.classList.toggle('scrolled', scrollY > 35);
  addEventListener('scroll', updateHeader, {passive: true});
  updateHeader();

  const menu = $('#mobile-menu');
  const toggle = $('.menu-toggle');
  if (menu && toggle) {
    toggle.addEventListener('click', () => {
      menu.showModal();
      toggle.setAttribute('aria-expanded', 'true');
      $('.menu-close', menu).focus();
    });
    $('.menu-close', menu).addEventListener('click', () => menu.close());
    $$('nav a', menu).forEach(link => link.addEventListener('click', () => menu.close()));
    menu.addEventListener('close', () => {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus({preventScroll: true});
    });
    matchMedia('(min-width: 1024px)').addEventListener('change', event => {
      if (event.matches && menu.open) menu.close();
    });
  }
  // Native modal dialogs provide focus containment, Escape handling and inert background.
  $$('.dialog-close').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  $$('dialog').forEach(dialog => dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }));
  $$('[data-demo-social]').forEach(button => button.addEventListener('click', () => {
    $('#notice-text').textContent = `Profilul ${button.dataset.demoSocial} nu este configurat. ${window.LUMEN_CONFIG.name} este o clinică fictivă, creată pentru această demonstrație.`;
    $('#notice-dialog').showModal();
  }));

  const video = $('#hero-video');
  const connection = navigator.connection;
  if (video && !reducedMotion && !connection?.saveData && !['slow-2g', '2g'].includes(connection?.effectiveType)) {
    const loadVideo = async () => {
      // The real MP4 is optional. Verify it before enabling playback on a web server.
      // file:// cannot fetch a HEAD response, so it uses the static poster.
      if (location.protocol === 'file:') return;
      try {
        const response = await fetch(video.dataset.src, {method: 'HEAD'});
        if (!response.ok || !response.headers.get('content-type')?.includes('video')) return;
        video.src = video.dataset.src;
        video.muted = true;
        video.addEventListener('playing', () => video.classList.add('playing'));
        video.addEventListener('error', () => video.classList.remove('playing'));
        await video.play();
      } catch { video.classList.remove('playing'); }
    };
    if ('requestIdleCallback' in window) requestIdleCallback(loadVideo, {timeout: 2500});
    else setTimeout(loadVideo, 1500);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) video.pause();
      else if (video.getAttribute('src')) video.play().catch(() => video.classList.remove('playing'));
    });
  }
  // If an owner removes an asset, retain the designed background instead of a broken icon.
  $$('img').forEach(img => {
    const fallback = () => { img.style.visibility = 'hidden'; img.parentElement.classList.add('image-unavailable'); };
    img.addEventListener('error', fallback);
    if (img.complete && !img.naturalWidth) fallback();
  });

  $$('.compare-range').forEach(range => {
    const compare = range.closest('.comparison');
    const update = () => {
      compare.style.setProperty('--position', `${range.value}%`);
      range.setAttribute('aria-valuetext', `${range.value}% înainte, ${100 - Number(range.value)}% după`);
    };
    range.addEventListener('input', update);
    // Pointer position maps directly to the full image width; keyboard stays native.
    let dragging = false;
    const positionAt = event => {
      const bounds = range.getBoundingClientRect();
      range.value = Math.round(Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100)));
      update();
    };
    range.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      dragging = true;
      range.setPointerCapture(event.pointerId);
      positionAt(event);
    });
    range.addEventListener('pointermove', event => { if (dragging) positionAt(event); });
    range.addEventListener('pointerup', () => { dragging = false; });
    range.addEventListener('pointercancel', () => { dragging = false; });
    update();
  });

  const testimonial = $('.testimonials');
  if (testimonial) {
    const slides = $$('.testimonial-slide', testimonial);
    let index = 0;
    const show = next => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => { slide.hidden = i !== index; });
      $('.testimonial-count', testimonial).textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      $('.slide-progress span', testimonial).style.transform = `translateX(${index * 100}%)`;
    };
    $('.testimonial-prev', testimonial).addEventListener('click', () => show(index - 1));
    $('.testimonial-next', testimonial).addEventListener('click', () => show(index + 1));
    let start = null;
    testimonial.addEventListener('touchstart', event => {
      start = {x: event.touches[0].clientX, y: event.touches[0].clientY};
    }, {passive: true});
    testimonial.addEventListener('touchend', event => {
      if (!start) return;
      const dx = event.changedTouches[0].clientX - start.x;
      const dy = event.changedTouches[0].clientY - start.y;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) show(index + (dx < 0 ? 1 : -1));
      start = null;
    }, {passive: true});
  }

  const date = $('#booking-day');
  if (date) {
    const now = new Date();
    date.min = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
  const params = new URLSearchParams(location.search);
  const selectKnownOption = (select, value) => {
    if (select && [...select.options].some(option => option.value === value)) select.value = value;
  };
  selectKnownOption($('#booking-service'), params.get('serviciu'));
  selectKnownOption($('#booking-doctor'), params.get('medic'));

  function errorFor(input) {
    const value = input.value.trim();
    if (input.type === 'checkbox') return input.required && !input.checked ? 'Bifează acordul pentru a continua.' : '';
    if (input.required && !value) return input.tagName === 'SELECT' ? 'Alege o opțiune.' : 'Completează acest câmp.';
    if (input.name === 'name' && value && value.length < 2) return 'Introdu un nume de cel puțin două caractere.';
    if (input.type === 'tel' && value && (!/^\+?[\d\s().-]+$/.test(value) || value.replace(/\D/g, '').length < 9 || value.replace(/\D/g, '').length > 15)) return 'Introdu un număr valid de telefon, cu 9–15 cifre.';
    if (input.type === 'email' && value && input.validity.typeMismatch) return 'Verifică adresa de email, de exemplu nume@exemplu.ro.';
    if (input.type === 'date' && value && value < input.min) return 'Alege ziua de astăzi sau o zi viitoare.';
    if (!input.validity.valid) return 'Verifică valoarea introdusă.';
    return '';
  }
  function validateInput(input) {
    const error = errorFor(input);
    const element = $('.field-error', input.closest('.field'));
    if (element) {
      element.id ||= `${input.id}-error`;
      element.textContent = error;
      input.setAttribute('aria-describedby', element.id);
    }
    if (error) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
    return !error;
  }
  function validateScope(scope) {
    const invalid = $$('input, select, textarea', scope).filter(input => !input.disabled).filter(input => !validateInput(input));
    invalid[0]?.focus();
    return invalid.length === 0;
  }

  $$('[data-form]').forEach(form => {
    const steps = $$('[data-step]', form);
    let currentStep = 0;
    function showStep(index, focus = true) {
      currentStep = index;
      steps.forEach((step, i) => { step.hidden = i !== index; step.disabled = i !== index; });
      $$('.booking-progress li', form).forEach((item, i) => {
        item.classList.toggle('active', i === index);
        item.classList.toggle('complete', i < index);
        if (i === index) item.setAttribute('aria-current', 'step');
        else item.removeAttribute('aria-current');
      });
      $('[data-back]', form).hidden = index === 0;
      $('[data-next]', form).hidden = index === steps.length - 1;
      $('[data-submit]', form).hidden = index !== steps.length - 1;
      if (focus) {
        const legend = $('legend', steps[index]);
        legend.tabIndex = -1;
        legend.focus({preventScroll: true});
        form.scrollIntoView({behavior: reducedMotion ? 'instant' : 'smooth', block: 'start'});
      }
    }
    if (steps.length) {
      $('[data-next]', form).addEventListener('click', () => {
        if (validateScope(steps[currentStep])) showStep(currentStep + 1);
      });
      $('[data-back]', form).addEventListener('click', () => showStep(currentStep - 1));
      form.addEventListener('keydown', event => {
        if (event.key === 'Enter' && !['TEXTAREA', 'BUTTON', 'SELECT'].includes(event.target.tagName) && currentStep < steps.length - 1) {
          event.preventDefault();
          if (validateScope(steps[currentStep])) showStep(currentStep + 1);
        }
      });
    }
    $$('input, select, textarea', form).forEach(input => {
      input.addEventListener('blur', () => { if (input.value || input.hasAttribute('aria-invalid')) validateInput(input); });
      input.addEventListener('input', () => { if (input.hasAttribute('aria-invalid')) validateInput(input); });
      input.addEventListener('change', () => { if (input.hasAttribute('aria-invalid')) validateInput(input); });
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (steps.length) {
        if (currentStep < steps.length - 1) {
          if (validateScope(steps[currentStep])) showStep(currentStep + 1);
          return;
        }
        for (let i = 0; i < steps.length; i++) {
          // Recheck earlier values without leaving invalid controls hidden.
          steps[i].disabled = false;
          const invalid = $$('input, select, textarea', steps[i]).some(input => errorFor(input));
          if (invalid) { showStep(i); validateScope(steps[i]); return; }
        }
      }
      if (!validateScope(form)) return;
      const status = $('.form-status', form);
      [...form.children].forEach(child => { if (child !== status) child.hidden = true; });
      // Do not echo the submitted values or claim that an appointment was actually made.
      status.innerHTML = '<div class="form-success" tabindex="-1"><span class="form-success-icon" aria-hidden="true">✓</span><h3>Totul este completat.</h3><p>Ai parcurs cu succes formularul demonstrativ. Datele nu au fost trimise sau salvate și nu s-a creat o programare reală.</p><p>În versiunea conectată a site-ului, echipa ar confirma solicitarea telefonic.</p><button type="button" class="button secondary" data-reset-form>Reia demonstrația <span aria-hidden="true">↗</span></button></div>';
      $('.form-success', status).focus({preventScroll: true});
      status.scrollIntoView({behavior: reducedMotion ? 'instant' : 'smooth', block: 'center'});
      $('[data-reset-form]', status).addEventListener('click', () => {
        form.reset();
        [...form.children].forEach(child => { child.hidden = false; });
        status.innerHTML = '';
        $$('.field-error', form).forEach(error => { error.textContent = ''; });
        $$('[aria-invalid]', form).forEach(input => input.removeAttribute('aria-invalid'));
        if (steps.length) showStep(0);
        else $('input', form).focus();
      });
    });
  });

  const mobileBar = $('.mobile-bar');
  const relevantAreas = $$('footer, [data-form]');
  const visibleAreas = new Set();
  if (mobileBar && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) visibleAreas.add(entry.target); else visibleAreas.delete(entry.target); });
      mobileBar.classList.toggle('is-hidden', visibleAreas.size > 0);
    }, {rootMargin: '0px 0px -80px 0px', threshold: 0});
    relevantAreas.forEach(area => observer.observe(area));
  }
  // Content is visible by default; only enhance sections below the initial viewport.
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), {threshold: 0.05});
    $$('.section-heading, .service-row-copy, .values-grid, .timeline').forEach(element => {
      if (element.getBoundingClientRect().top > innerHeight) {
        element.classList.add('reveal');
        observer.observe(element);
      }
    });
  }
})();
