/* All interactions run locally. Form data is never sent or persisted. */
(() => {
  'use strict';
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motion = window.LumenMotion;
  const english = document.documentElement.lang === 'en';
  const ui = english ? {
    social: name => `The ${name} profile is not configured. ${window.LUMEN_CONFIG.name} is a fictional clinic created for this demonstration.`,
    comparison: (before, after) => `${before}% before, ${after}% after`,
    consent: 'Tick the consent box to continue.', select: 'Select an option.', required: 'Complete this field.',
    name: 'Enter a name containing at least two characters.', phone: 'Enter a valid phone number containing 9–15 digits.',
    email: 'Check the email address, for example name@example.com.', date: 'Select today or a future date.', value: 'Check the value entered.',
    success: '<div class="form-success" tabindex="-1"><span class="form-success-icon" aria-hidden="true">✓</span><h3>Everything is complete.</h3><p>You have completed the demonstration form. The data was neither sent nor saved, and no real appointment was created.</p><p>In a connected version of this website, the team would confirm the request by phone.</p><button type="button" class="button secondary" data-reset-form>Restart the demonstration <span aria-hidden="true">↗</span></button></div>'
  } : {
    social: name => `Profilul ${name} nu este configurat. ${window.LUMEN_CONFIG.name} este o clinică fictivă, creată pentru această demonstrație.`,
    comparison: (before, after) => `${before}% înainte, ${after}% după`,
    consent: 'Bifează acordul pentru a continua.', select: 'Alege o opțiune.', required: 'Completează acest câmp.',
    name: 'Introdu un nume de cel puțin două caractere.', phone: 'Introdu un număr valid de telefon, cu 9–15 cifre.',
    email: 'Verifică adresa de email, de exemplu nume@exemplu.ro.', date: 'Alege ziua de astăzi sau o zi viitoare.', value: 'Verifică valoarea introdusă.',
    success: '<div class="form-success" tabindex="-1"><span class="form-success-icon" aria-hidden="true">✓</span><h3>Totul este completat.</h3><p>Ai parcurs cu succes formularul demonstrativ. Datele nu au fost trimise sau salvate și nu s-a creat o programare reală.</p><p>În versiunea conectată a site-ului, echipa ar confirma solicitarea telefonic.</p><button type="button" class="button secondary" data-reset-form>Reia demonstrația <span aria-hidden="true">↗</span></button></div>'
  };
  const header = $('#site-header');
  const updateHeader = () => header?.classList.toggle('scrolled', scrollY > 35);
  addEventListener('scroll', updateHeader, {passive: true});
  updateHeader();

  const menu = $('#mobile-menu');
  const toggle = $('.menu-toggle');
  if (menu && toggle) {
    toggle.addEventListener('click', () => {
      menu.showModal();
      motion?.enter(menu, {distance: -18, duration: 300});
      $$('nav a', menu).forEach((link, index) => motion?.enter(link, {delay: Math.min(index * 35, 175), distance: 12, duration: 350}));
      toggle.setAttribute('aria-expanded', 'true');
      $('.menu-close', menu).focus();
    });
    $('.menu-close', menu).addEventListener('click', () => closeDialog(menu));
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
  const closingDialogs = new WeakSet();
  function closeDialog(dialog) {
    if (!dialog?.open || closingDialogs.has(dialog)) return;
    const animation = motion?.animate(dialog, [{opacity: 1, transform: 'translateY(0)'}, {opacity: 0, transform: 'translateY(10px)'}], {duration: 160, easing: 'ease-in'});
    if (!animation) { dialog.close(); return; }
    closingDialogs.add(dialog);
    const finish = () => { closingDialogs.delete(dialog); if (dialog.open) dialog.close(); };
    animation.finished.then(finish, finish);
  }
  $$('.dialog-close').forEach(button => button.addEventListener('click', () => closeDialog(button.closest('dialog'))));
  $$('dialog').forEach(dialog => dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog);
  }));
  $$('dialog').forEach(dialog => dialog.addEventListener('cancel', event => {
    if (!motion || motion.reduced) return;
    event.preventDefault();
    closeDialog(dialog);
  }));
  $$('[data-demo-social]').forEach(button => button.addEventListener('click', () => {
    $('#notice-text').textContent = ui.social(button.dataset.demoSocial);
    $('#notice-dialog').showModal();
    motion?.enter($('#notice-dialog'), {distance: 14, duration: 260});
  }));

  const video = $('#hero-video');
  const heroMedia = window.LUMEN_CONFIG?.media || {};
  const mobileHero = matchMedia('(max-width: 767px)').matches;
  if (video && mobileHero && heroMedia.heroMobile) video.poster = heroMedia.heroMobile;
  const connection = navigator.connection;
  if (video && !reducedMotion && !connection?.saveData && !['slow-2g', '2g'].includes(connection?.effectiveType)) {
    let activeVideo = video;
    let standbyVideo;
    let switching = false;
    let loopFrame = 0;
    let settleTimer = 0;
    const crossfadeDuration = 900;
    const crossfadeLead = 1.15;

    const addSources = (target, sources) => {
      sources.forEach(([src, type]) => {
        const source = document.createElement('source');
        source.src = src;
        source.type = type;
        target.append(source);
      });
      target.load();
      target.muted = true;
    };
    const settleCrossfade = () => {
      if (!switching) return;
      activeVideo.pause();
      activeVideo.currentTime = 0;
      activeVideo.classList.remove('playing', 'is-active', 'is-fading');
      [activeVideo, standbyVideo] = [standbyVideo, activeVideo];
      switching = false;
    };
    const crossfade = async () => {
      if (switching || !standbyVideo) return;
      switching = true;
      standbyVideo.currentTime = 0;
      try {
        await standbyVideo.play();
        standbyVideo.classList.add('playing');
        requestAnimationFrame(() => {
          standbyVideo.classList.add('is-active');
          activeVideo.classList.remove('is-active');
          activeVideo.classList.add('is-fading');
        });
        clearTimeout(settleTimer);
        settleTimer = setTimeout(settleCrossfade, crossfadeDuration + 80);
      } catch {
        switching = false;
        activeVideo.loop = true;
      }
    };
    const watchLoop = () => {
      if (!document.hidden && !switching && Number.isFinite(activeVideo.duration) && activeVideo.duration > 0 && activeVideo.duration - activeVideo.currentTime <= crossfadeLead) crossfade();
      loopFrame = requestAnimationFrame(watchLoop);
    };
    const loadVideo = async () => {
      // Verify the preferred WebM before adding sources; MP4 remains the fallback.
      try {
        const candidates = (mobileHero
          ? [heroMedia.videoMobileWebm, heroMedia.videoMobile]
          : [video.dataset.srcWebm, video.dataset.srcMp4]
        ).filter(Boolean);
        let preferred = location.protocol === 'file:' ? candidates[0] : '';
        if (location.protocol !== 'file:') {
          for (const candidate of candidates) {
            const response = await fetch(candidate, {method: 'HEAD'});
            if (response.ok && response.headers.get('content-type')?.includes('video')) { preferred = candidate; break; }
          }
        }
        if (!preferred) return;
        if (motion?.reduced) return;
        const sources = candidates.map(src => [src, src.endsWith('.webm') ? 'video/webm' : 'video/mp4']);
        standbyVideo = video.cloneNode(false);
        standbyVideo.removeAttribute('id');
        standbyVideo.removeAttribute('poster');
        standbyVideo.removeAttribute('autoplay');
        standbyVideo.className = 'hero-video-clone';
        video.after(standbyVideo);
        addSources(video, sources);
        addSources(standbyVideo, sources);
        [video, standbyVideo].forEach(item => item.addEventListener('error', () => item.classList.remove('playing', 'is-active', 'is-fading')));
        await video.play();
        video.classList.add('playing', 'is-active');
        loopFrame = requestAnimationFrame(watchLoop);
      } catch { video.classList.remove('playing', 'is-active', 'is-fading'); }
    };
    if ('requestIdleCallback' in window) requestIdleCallback(loadVideo, {timeout: 2500});
    else setTimeout(loadVideo, 1500);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        activeVideo.pause();
        standbyVideo?.pause();
      } else if (activeVideo.querySelector('source') && !motion?.reduced) {
        settleCrossfade();
        activeVideo.play().catch(() => activeVideo.classList.remove('playing', 'is-active'));
      }
    });
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', event => {
      if (event.matches) {
        cancelAnimationFrame(loopFrame);
        clearTimeout(settleTimer);
        video.pause();
        standbyVideo?.pause();
        video.classList.remove('playing', 'is-active', 'is-fading');
        standbyVideo?.classList.remove('playing', 'is-active', 'is-fading');
      }
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
      range.setAttribute('aria-valuetext', ui.comparison(range.value, 100 - Number(range.value)));
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
      const direction = next > index ? 1 : -1;
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => { slide.hidden = i !== index; });
      motion?.animate(slides[index], [{opacity: 0, transform: `translateX(${direction * 16}px)`}, {opacity: 1, transform: 'translateX(0)'}], {duration: 380});
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
    if (input.type === 'checkbox') return input.required && !input.checked ? ui.consent : '';
    if (input.required && !value) return input.tagName === 'SELECT' ? ui.select : ui.required;
    if (input.name === 'name' && value && value.length < 2) return ui.name;
    if (input.type === 'tel' && value && (!/^\+?[\d\s().-]+$/.test(value) || value.replace(/\D/g, '').length < 9 || value.replace(/\D/g, '').length > 15)) return ui.phone;
    if (input.type === 'email' && value && input.validity.typeMismatch) return ui.email;
    if (input.type === 'date' && value && value < input.min) return ui.date;
    if (!input.validity.valid) return ui.value;
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
      const direction = index >= currentStep ? 1 : -1;
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
        form.scrollIntoView({behavior: (motion?.reduced ?? reducedMotion) ? 'instant' : 'smooth', block: 'start'});
      }
      motion?.animate(steps[index], [{opacity: 0, transform: `translateX(${direction * 16}px)`}, {opacity: 1, transform: 'translateX(0)'}], {duration: 320});
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
      status.innerHTML = ui.success;
      $('.form-success', status).focus({preventScroll: true});
      motion?.enter($('.form-success', status), {distance: 14, scale: true, duration: 400});
      status.scrollIntoView({behavior: (motion?.reduced ?? reducedMotion) ? 'instant' : 'smooth', block: 'center'});
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
  const hero = $('.hero');
  const relevantAreas = $$('footer, [data-form]');
  const visibleAreas = new Set();
  if (mobileBar && 'IntersectionObserver' in window) {
    let pastHero = !hero;
    const renderMobileBar = () => {
      mobileBar.classList.toggle('is-hidden', !pastHero || visibleAreas.size > 0);
    };
    renderMobileBar();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) visibleAreas.add(entry.target); else visibleAreas.delete(entry.target); });
      renderMobileBar();
    }, {rootMargin: '0px 0px -80px 0px', threshold: 0});
    relevantAreas.forEach(area => observer.observe(area));
    if (hero) {
      const heroObserver = new IntersectionObserver(([entry]) => {
        pastHero = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0;
        renderMobileBar();
      }, {threshold: 0});
      heroObserver.observe(hero);
    }
  }
})();
