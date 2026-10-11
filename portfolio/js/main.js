/* Ravi Khanai — portfolio. Renders content from js/data.js, then layers GSAP + ScrollTrigger motion on top.
   Motion lives inside gsap.matchMedia so prefers-reduced-motion users get the final, readable state. */
(function () {
  'use strict';

  const D = window.PORTFOLIO;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const root = document.documentElement;
  gsap.registerPlugin(ScrollTrigger);

  /* ───────────────────────── Render content ───────────────────────── */
  const SECTIONS = ['Home', 'About', 'Journey', 'Projects', 'Skills', 'Contact'];
  $('#nav').innerHTML = SECTIONS.map(l => `<a href="#${l.toLowerCase()}" data-sec="${l.toLowerCase()}">${l}</a>`).join('');

  $('#timeline').innerHTML = D.journey.map(j => `
    <li class="tl-item">
      <div class="tl-when"><div class="tl-years">${esc(j.years)}</div><div class="tl-place">${esc(j.place)}</div></div>
      <div class="tl-rail"><span class="tl-fill"></span><span class="tl-dot"></span></div>
      <div class="tl-body">
        <div class="tl-kind">${esc(j.kind)}</div>
        <h3 class="tl-role">${esc(j.role)}</h3>
        <div class="tl-org">${esc(j.org)}</div>
        <p class="tl-story">${esc(j.story)}</p>
        ${j.story2 ? `<p class="tl-story">${esc(j.story2)}</p>` : ''}
        ${j.highlight ? `${j.highlightLabel ? `<div class="tl-hl-label">${esc(j.highlightLabel)}</div>` : ''}<p class="tl-hl">${esc(j.highlight)}</p>` : ''}
        ${j.key && j.key.length ? `<div class="tl-sub">Key experience</div><div class="chips">${j.key.map(k => `<span class="chip chip-key">${esc(k)}</span>`).join('')}</div><div class="tl-sub second">Impact</div>` : ''}
        <div class="chips">${(j.wins || []).map(w => `<span class="chip chip-win">${esc(w)}</span>`).join('')}</div>
        ${j.lesson ? `<p class="tl-lesson"><strong>What it taught me:</strong> ${esc(j.lesson)}</p>` : ''}
      </div>
    </li>`).join('');

  const CATS = ['All', 'Digitalization', 'Infrastructure', 'Operations'];
  $('#filters').innerHTML = CATS.map((c, i) => `<button class="filter" type="button" data-cat="${c}" aria-pressed="${i === 0}">${c}</button>`).join('');

  $('#cards').innerHTML = D.projects.map((p, i) => `
    <article class="card" data-cat="${esc(p.cat)}" data-i="${i}">
      <div class="card-art" role="img" aria-label="${esc(p.title)}" data-anim></div>
      <div class="card-body">
        <div class="card-meta"><span>${esc(p.cat)}</span><span>${esc(p.year)}</span></div>
        <h3 class="card-title"><button class="card-open" type="button" aria-haspopup="dialog">${esc(p.title)}</button></h3>
        <p class="card-sum">${esc(p.summary)}</p>
        <div class="card-foot"><span class="card-impact">${esc(p.impact)}</span><span class="card-more" aria-hidden="true">Case study →</span></div>
      </div>
    </article>`).join('');

  $('#skills-main').innerHTML = D.skills.map(g => `
    <div class="sk-group">
      <div class="sk-title">${esc(g.group)}</div>
      <div class="sk-items">${g.items.map(s => `<span class="skill">${esc(s)}</span>`).join('')}</div>
    </div>`).join('') +
    `<p class="approach"><strong>My approach:</strong> Technology should simplify work, improve visibility and create measurable business value.</p>`;

  const MARQUEE = ['IT Operations', 'Technical Leadership', 'Automation', 'Digital Transformation', 'Power Platform', 'Microsoft 365', 'Global Service Delivery', 'Business Impact'];
  const half = MARQUEE.concat(MARQUEE).map(t => `<span>${t}</span>`).join('');
  $('#marquee-track').innerHTML = half + half;

  /* ───────────────────────── Project cover SVGs ───────────────────────── */
  const svgFor = (p, prefix) => {
    let s = window[p.svg] || '';
    if (prefix && s) s = s.replace(/id="([^"]+)"/g, `id="${prefix}$1"`).replace(/url\(#([^)]+)\)/g, `url(#${prefix}$1)`).replace(/href="#([^"]+)"/g, `href="#${prefix}$1"`);
    return s;
  };
  $$('.card').forEach(card => { $('.card-art', card).innerHTML = svgFor(D.projects[card.dataset.i], ''); });

  // Cover animations are SMIL: only run them while visible (and never behind an open modal).
  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const syncAnim = el => {
    const s = el.querySelector('svg'); if (!s || !s.pauseAnimations) return;
    const run = !prefersReduce.matches && (el.__inModal || (el.__vis && !document.body.classList.contains('modal-open')));
    if (run) s.unpauseAnimations(); else s.pauseAnimations();
  };
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { e.target.__vis = e.isIntersecting; syncAnim(e.target); }), { rootMargin: '100px' }) : null;
  $$('[data-anim]').forEach(el => {
    const s = el.querySelector('svg');
    if (s && s.pauseAnimations) { s.pauseAnimations(); if (prefersReduce.matches) { try { s.setCurrentTime(5); } catch (e) { /* noop */ } } }
    if (io) io.observe(el);
  });

  /* ───────────────────────── Text splitters ───────────────────────── */
  function split(el, mode) {
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    const walk = node => Array.from(node.childNodes).forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(t => {
          if (!t) return;
          if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'word'; w.setAttribute('aria-hidden', 'true');
          if (mode === 'chars') { Array.from(t).forEach(c => { const ch = document.createElement('span'); ch.className = 'ch'; ch.textContent = c; w.appendChild(ch); }); }
          else { const i = document.createElement('span'); i.className = 'word-i'; i.textContent = t; w.appendChild(i); }
          frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
    walk(el);
    return mode === 'chars' ? $$('.ch', el) : $$('.word-i', el);
  }
  const heroChars = split($('#hero-title'), 'chars');
  const contactChars = split($('#contact-title'), 'chars');
  const h2Words = $$('.split-words').map(h => ({ h, words: split(h, 'words') }));

  /* ───────────────────────── Always-on behaviour (no motion needed) ───────────────────────── */
  // Scroll progress
  const bar = $('#progress-bar');
  const onScroll = () => {
    const max = root.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0) + ')';
  };
  window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll); onScroll();

  // Header state + nav highlighting
  ScrollTrigger.create({ start: 60, end: 'max', toggleClass: { targets: '#site-header', className: 'is-scrolled' } });
  const navLinks = $$('#nav a');
  const setActive = id => navLinks.forEach(a => { const on = a.dataset.sec === id; a.classList.toggle('active', on); if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  SECTIONS.map(s => s.toLowerCase()).forEach(id => {
    ScrollTrigger.create({ trigger: '#' + id, start: 'top 40%', end: 'bottom 40%', onToggle: self => self.isActive && setActive(id) });
  });
  setActive('home');

  // Filters
  const cards = $$('.card');
  const motionOK = () => !prefersReduce.matches;
  $$('.filter').forEach(btn => btn.addEventListener('click', () => {
    if (btn.getAttribute('aria-pressed') === 'true') return;
    $$('.filter').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    const cat = btn.dataset.cat;
    const apply = () => {
      cards.forEach(c => { c.hidden = !(cat === 'All' || c.dataset.cat === cat); });
      const shown = cards.filter(c => !c.hidden);
      if (motionOK()) gsap.fromTo(shown, { autoAlpha: 0, y: 28, scale: .97 }, { autoAlpha: 1, y: 0, scale: 1, duration: .6, stagger: .07, ease: 'expo.out', overwrite: true, clearProps: 'transform' });
      else gsap.set(shown, { autoAlpha: 1, y: 0, scale: 1 });
      ScrollTrigger.refresh();
    };
    const visible = cards.filter(c => !c.hidden);
    if (motionOK() && visible.length) gsap.to(visible, { autoAlpha: 0, y: -12, duration: .2, stagger: .02, overwrite: true, onComplete: apply });
    else apply();
  }));

  /* ───────────────────────── Modal ───────────────────────── */
  const modal = $('#modal'), panel = $('#modal-panel');
  let opener = null;
  const sec = (label, html, cls) => `<div class="m-sec ${cls || ''}"><div class="meta">${label}</div>${html}</div>`;
  function openModal(p, from) {
    opener = from;
    const art = $('#m-art');
    art.innerHTML = svgFor(p, 'm-');
    art.setAttribute('role', 'img'); art.setAttribute('aria-label', p.title);
    art.__inModal = true; art.setAttribute('data-anim', '');
    $('#m-cat').textContent = p.cat + ' · ' + p.org; $('#m-year').textContent = p.year; $('#m-title').textContent = p.title;
    $('#m-sections').innerHTML =
      sec('CHALLENGE', `<p>${esc(p.challenge)}</p>`) +
      (p.role ? sec('MY ROLE', `<p>${esc(p.role)}</p>`) : '') +
      sec(esc(p.actionLabel || 'WHAT I DID'), `<p>${esc(p.action)}</p>`) +
      sec('TECHNOLOGY', `<div class="chips">${(p.tools || []).map(t => `<span class="chip chip-key">${esc(t)}</span>`).join('')}</div>`) +
      sec('RESULT', (p.resultStat ? `<div class="m-stat">${esc(p.resultStat)}</div>` : '') + (p.result ? `<p class="strong">${esc(p.result)}</p>` : '') + (p.resultNote ? `<p class="m-note">${esc(p.resultNoteLabel)}: <strong>${esc(p.resultNote)}</strong></p>` : '')) +
      (p.takeaway ? sec('KEY TAKEAWAY', `<p>${esc(p.takeaway)}</p>`, 'take') : '');
    modal.hidden = false; document.body.classList.add('modal-open');
    $$('[data-anim]').forEach(syncAnim); syncAnim(art);
    if (motionOK()) {
      // opacity (not autoAlpha): the panel must stay focusable while it animates in
      gsap.fromTo('.modal-backdrop', { opacity: 0 }, { opacity: 1, duration: .3 });
      gsap.fromTo(panel, { opacity: 0, y: 56, scale: .96 }, { opacity: 1, y: 0, scale: 1, duration: .55, ease: 'expo.out' });
      gsap.fromTo('.m-sec', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .5, stagger: .06, delay: .2, ease: 'power3.out' });
    }
    panel.scrollTop = 0; panel.focus({ preventScroll: true });
  }
  function closeModal() {
    if (modal.hidden) return;
    const done = () => {
      modal.hidden = true; document.body.classList.remove('modal-open');
      gsap.set(['.modal-backdrop', panel, '.m-sec'], { clearProps: 'all' });
      const art = $('#m-art'); art.__inModal = false; art.innerHTML = '';
      $$('[data-anim]').forEach(syncAnim);
      if (opener) opener.focus({ preventScroll: true });
    };
    if (motionOK()) {
      gsap.to(panel, { opacity: 0, y: 30, scale: .98, duration: .25, ease: 'power2.in' });
      gsap.to('.modal-backdrop', { opacity: 0, duration: .25, onComplete: done });
    } else done();
  }
  cards.forEach(card => $('.card-open', card).addEventListener('click', e => openModal(D.projects[card.dataset.i], e.currentTarget)));
  modal.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeModal(); });
  document.addEventListener('keydown', e => {
    if (modal.hidden) return;
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key === 'Tab') { // keep focus inside the dialog
      const f = $$('button,[href],[tabindex]:not([tabindex="-1"])', panel).filter(x => !x.disabled);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ───────────────────────── Motion ───────────────────────── */
  const mm = gsap.matchMedia();
  mm.add({ motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)', desktop: '(min-width: 900px)', fine: '(hover: hover) and (pointer: fine)' }, ctx => {
    const { motion, reduce, desktop, fine } = ctx.conditions;
    root.classList.toggle('reduce', !!reduce);
    if (!motion) { $$('[data-anim]').forEach(syncAnim); return; }
    $$('[data-anim]').forEach(syncAnim);

    const reveal = (targets, vars, trigger, start) => gsap.fromTo(targets,
      Object.assign({ autoAlpha: 0, y: 36 }, vars && vars.from),
      Object.assign({ autoAlpha: 1, y: 0, duration: .9, ease: 'expo.out', clearProps: 'transform', scrollTrigger: { trigger: trigger || targets, start: start || 'top 88%', once: true } }, vars && vars.to));

    /* HERO intro */
    const intro = gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: () => {
      gsap.set('.portrait', { clearProps: 'clipPath' });
      $$('.float-chip').forEach((c, i) => gsap.to(c, { y: i ? 12 : -12, duration: 3 + i, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
    } });
    intro
      .fromTo('.badge', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .8 })
      .fromTo(heroChars, { yPercent: 118, rotate: 5 }, { yPercent: 0, rotate: 0, duration: 1.1, stagger: .04 }, '-=.5')
      .fromTo('.hero-role,.hero-tags,.hero-lede', { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: .9, stagger: .12 }, '-=.75')
      .fromTo('.hero-cta', { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: .8 }, '-=.6')
      .fromTo('.portrait', { autoAlpha: 0, yPercent: 10, scale: 1.05, clipPath: 'inset(28% 0 0 0)' }, { autoAlpha: 1, yPercent: 0, scale: 1, clipPath: 'inset(0% 0 0 0)', duration: 1.4 }, .25)
      .fromTo('.pr-draw', { autoAlpha: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' }, .35)
      .fromTo('.float-chip', { autoAlpha: 0, y: 30, scale: .9 }, { autoAlpha: 1, y: 0, scale: 1, stagger: .18, duration: .9, ease: 'back.out(1.7)' }, '-=.9');

    /* HERO parallax on scroll-out */
    const par = gsap.timeline({ scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: .8 } });
    par.to('.hero-visual', { yPercent: -6, ease: 'none' }, 0)
      .to('.hero-copy', { yPercent: -12, autoAlpha: .25, ease: 'none' }, 0)
      .to('.hero-grid', { yPercent: 14, ease: 'none' }, 0)
      .to('.orb-a', { yPercent: 40, ease: 'none' }, 0)
      .to('.ring-a', { yPercent: 60, rotate: 120, ease: 'none' }, 0)
      .to('.ring-b', { yPercent: -90, rotate: -90, ease: 'none' }, 0);
    gsap.to('.ring-b', { rotate: 360, duration: 40, repeat: -1, ease: 'none' });

    /* STATS */
    $$('.stat-num').forEach(el => {
      const end = +el.dataset.count, suffix = el.dataset.suffix || '', o = { v: 0 };
      el.textContent = '0' + suffix;
      gsap.to(o, { v: end, duration: 2, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v) + suffix; }, scrollTrigger: { trigger: '.stats', start: 'top 88%', once: true } });
    });
    gsap.fromTo('.stat', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .8, stagger: .12, ease: 'expo.out', scrollTrigger: { trigger: '.stats', start: 'top 88%', once: true } });
    gsap.fromTo('.stat', { '--s': 0 }, { '--s': 1, duration: 1, stagger: .12, ease: 'power2.out', scrollTrigger: { trigger: '.stats', start: 'top 88%', once: true } });

    /* MARQUEE — loops, speeds up and flips with scroll velocity, pauses off-screen */
    const track = $('#marquee-track');
    const loop = gsap.to(track, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
    ScrollTrigger.create({
      trigger: '.marquee', start: 'top bottom', end: 'bottom top',
      onToggle: s => (s.isActive ? loop.play() : loop.pause()),
      onUpdate: s => {
        const boost = Math.min(6, 1 + Math.abs(s.getVelocity()) / 350) * s.direction;
        gsap.to(loop, { timeScale: boost, duration: .25, overwrite: true, onComplete: () => gsap.to(loop, { timeScale: s.direction, duration: 1.2 }) });
      }
    });

    /* Section furniture: eyebrows, headings, ghost numbers */
    $$('.eyebrow').forEach(e => {
      const st = { trigger: e, start: 'top 90%', once: true };
      gsap.fromTo($('.eyebrow-line', e), { scaleX: 0 }, { scaleX: 1, duration: .9, ease: 'expo.out', scrollTrigger: st });
      gsap.fromTo($('.eyebrow-text', e), { autoAlpha: 0, x: -18 }, { autoAlpha: 1, x: 0, duration: .8, ease: 'expo.out', scrollTrigger: st });
    });
    h2Words.forEach(({ h, words }) => gsap.fromTo(words, { yPercent: 115 }, { yPercent: 0, duration: 1, stagger: .05, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 86%', once: true } }));
    $$('.ghost-num').forEach(g => gsap.fromTo(g, { yPercent: -12 }, { yPercent: 28, ease: 'none', scrollTrigger: { trigger: g.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));

    /* ABOUT */
    reveal('.quote', null, '.quote');
    gsap.timeline({ scrollTrigger: { trigger: '#about-text', start: 'top 72%', end: 'bottom 80%', scrub: 1 } })
      .fromTo('#keywords li', { opacity: .16, x: -26, '--s': 0 }, { opacity: 1, x: 0, '--s': 1, stagger: 1, ease: 'none', duration: 1 });
    $$('#about-text > p').forEach(p => {
      reveal(p, null, p);
      $$('.mark', p).forEach(m => gsap.fromTo(m, { '--u': '0%' }, { '--u': '100%', duration: 1.1, delay: .5, ease: 'power3.out', scrollTrigger: { trigger: p, start: 'top 85%', once: true } }));
    });
    reveal('.trio div', { from: { y: 28, scale: .95 }, to: { stagger: .12, duration: .8 } }, '.trio', 'top 90%');

    /* JOURNEY */
    $$('.tl-item').forEach(item => {
      const dot = $('.tl-dot', item), fill = $('.tl-fill', item);
      gsap.fromTo(fill, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: item, start: 'top 60%', end: 'bottom 60%', scrub: .4 } });
      ScrollTrigger.create({
        trigger: item, start: 'top 60%',
        onEnter: () => { dot.classList.add('on', 'pulse'); gsap.fromTo(dot, { scale: .3 }, { scale: 1, duration: .8, ease: 'back.out(3)' }); },
        onLeaveBack: () => dot.classList.remove('on', 'pulse')
      });
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, scrollTrigger: { trigger: item, start: 'top 78%', once: true } });
      tl.from($('.tl-when', item), { autoAlpha: 0, x: desktop ? -50 : -20, duration: .9 })
        .from($$('.tl-body > *:not(.chips)', item), { autoAlpha: 0, y: 30, duration: .8, stagger: .07 }, .1)
        .from($$('.chip', item), { autoAlpha: 0, scale: .8, y: 12, duration: .6, stagger: .05, ease: 'back.out(1.8)', clearProps: 'transform' }, .45);
      const lesson = $('.tl-lesson', item);
      if (lesson) tl.fromTo(lesson, { '--s': 0 }, { '--s': 1, duration: .9 }, .6);
    });
    const endDot = $('.tl-dot-end');
    ScrollTrigger.create({ trigger: '#continues', start: 'top 70%', once: true, onEnter: () => gsap.fromTo(endDot, { scale: 0 }, { scale: 1, duration: .8, ease: 'back.out(3)' }) });
    reveal('.continues-title', null, '#continues', 'top 78%');
    reveal('.continues-lines p', { to: { stagger: .15 } }, '.continues-lines', 'top 85%');
    gsap.fromTo('#chain > *', { opacity: .18 }, { opacity: 1, stagger: .15, ease: 'none', scrollTrigger: { trigger: '#chain', start: 'top 92%', end: 'top 55%', scrub: true } });

    /* PROJECTS */
    reveal('#filters .filter', { from: { y: 16 }, to: { stagger: .06, duration: .6 } }, '#filters', 'top 92%');
    gsap.set(cards, { autoAlpha: 0, y: 60 });
    ScrollTrigger.batch(cards, {
      start: 'top 90%', once: true,
      onEnter: batch => gsap.fromTo(batch, { autoAlpha: 0, y: 60, scale: .97 }, { autoAlpha: 1, y: 0, scale: 1, duration: .9, stagger: .12, ease: 'expo.out', overwrite: true, clearProps: 'transform' })
    });
    if (fine) {
      cards.forEach(card => {
        card.addEventListener('pointermove', e => {
          const r = card.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
          card.style.setProperty('--mx', (px * 100) + '%'); card.style.setProperty('--my', (py * 100) + '%');
          gsap.to(card, { rotationX: (.5 - py) * 7, rotationY: (px - .5) * 9, y: -6, transformPerspective: 900, duration: .5, ease: 'power2.out', overwrite: 'auto' });
        });
        card.addEventListener('pointerleave', () => gsap.to(card, { rotationX: 0, rotationY: 0, y: 0, duration: .7, ease: 'elastic.out(1,.6)', overwrite: 'auto' }));
      });
    }

    /* SKILLS */
    reveal('.reveal-card', { from: { y: 44 }, to: { stagger: .15 } }, '.skills-side', 'top 70%');
    $$('.sk-group').forEach(g => {
      const st = { trigger: g, start: 'top 86%', once: true };
      gsap.fromTo($('.sk-title', g), { '--s': 0, autoAlpha: 0, y: 14 }, { '--s': 1, autoAlpha: 1, y: 0, duration: .9, ease: 'expo.out', scrollTrigger: st });
      gsap.fromTo($$('.skill', g), { autoAlpha: 0, scale: .82, y: 14 }, { autoAlpha: 1, scale: 1, y: 0, duration: .6, stagger: .05, ease: 'back.out(1.8)', scrollTrigger: st, clearProps: 'transform' });
    });
    reveal('.approach', null, '.approach');

    /* CONTACT */
    gsap.fromTo(contactChars, { yPercent: 115 }, { yPercent: 0, duration: 1, stagger: .03, ease: 'expo.out', scrollTrigger: { trigger: '#contact-title', start: 'top 85%', once: true } });
    reveal('.contact-lede,.talk', { to: { stagger: .12 } }, '.contact-lede', 'top 88%');
    reveal('.c-tile', { from: { y: 40 }, to: { stagger: .1 } }, '.contact-grid', 'top 88%');
    reveal('.btn-resume', null, '.btn-resume', 'top 95%');
    reveal('.foot', null, '.foot', 'top 98%');

    /* Pointer-only flourishes */
    if (fine) {
      const glow = $('.cursor-glow'), gx = gsap.quickTo(glow, 'x', { duration: .6, ease: 'power3' }), gy = gsap.quickTo(glow, 'y', { duration: .6, ease: 'power3' });
      const move = e => { glow.classList.add('on'); gx(e.clientX); gy(e.clientY); };
      window.addEventListener('pointermove', move, { passive: true });
      $$('.magnetic').forEach(el => {
        const mx = gsap.quickTo(el, 'x', { duration: .5, ease: 'power3' }), my = gsap.quickTo(el, 'y', { duration: .5, ease: 'power3' });
        el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); mx((e.clientX - (r.left + r.width / 2)) * .28); my((e.clientY - (r.top + r.height / 2)) * .35); });
        el.addEventListener('pointerleave', () => { mx(0); my(0); });
      });
      return () => window.removeEventListener('pointermove', move);
    }
  });

  // Pinned/measured layouts depend on font + image metrics.
  const refresh = () => ScrollTrigger.refresh();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  window.addEventListener('load', refresh);
})();
