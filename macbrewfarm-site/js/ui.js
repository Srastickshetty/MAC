// Navigation, anchor links and the custom cursor.
import { scroller, scrollToEl, scrollToY } from './scroll.js';

export function initUI({ reduce }) {
  const root = document.documentElement;
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const overlay = document.getElementById('navOverlay');
  const inertTargets = [document.getElementById('main'), document.querySelector('footer')].filter(Boolean);

  // --- nav background after the first bit of scrolling ---
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- mobile overlay ---
  let open = false;
  function setOpen(next, returnFocus = true) {
    if (next === open) return;
    open = next;
    overlay.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    document.body.style.overflow = open ? 'hidden' : '';
    inertTargets.forEach((el) => { el.inert = open; });
    if (scroller.lenis) open ? scroller.lenis.stop() : scroller.lenis.start();
    if (open) {
      const first = overlay.querySelector('a');
      if (first) setTimeout(() => first.focus({ preventScroll: true }), 50);
    } else if (returnFocus) {
      toggle.focus({ preventScroll: true });
    }
  }
  toggle.addEventListener('click', () => setOpen(!open));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) setOpen(false);
  });
  // If the window grows to desktop width while the overlay is open, close it.
  matchMedia('(min-width: 900px)').addEventListener('change', (m) => {
    if (m.matches) setOpen(false, false);
  });

  // --- anchor links (smooth scroll, works with Lenis and without) ---
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    const id = a.getAttribute('href');
    if (!id || id.length < 2) return;
    const wasOpen = open;
    if (id === '#top') {
      e.preventDefault();
      setOpen(false, false);
      scrollToY(0);
      return;
    }
    let el = null;
    try { el = document.querySelector(id); } catch (_) { /* invalid selector */ }
    if (!el) return;
    e.preventDefault();
    setOpen(false, false);
    // Give the browser a frame to restore scrolling after the overlay closes.
    requestAnimationFrame(() => {
      scrollToEl(el);
      try { history.pushState(null, '', id); } catch (_) { /* file:// etc. */ }
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    });
    if (wasOpen) toggle.blur();
  });

  // --- custom cursor & magnetic attraction (mouse devices only) ---
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const cursor = document.getElementById('cursor');
  if (fine && !reduce && cursor) {
    const dot = cursor.querySelector('.cursor-dot');
    const ring = cursor.querySelector('.cursor-ring');
    let mx = -100, my = -100, rx = -100, ry = -100, seen = false;
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      if (!seen) { seen = true; rx = mx; ry = my; root.classList.add('has-cursor'); }
    }, { passive: true });
    document.addEventListener('pointerleave', () => root.classList.remove('has-cursor'));
    document.addEventListener('pointerenter', () => { if (seen) root.classList.add('has-cursor'); });
    document.addEventListener('mouseover', (e) => {
      const hot = e.target.closest && e.target.closest('a, button, [data-tilt], .ck-thumb-card, .space-card, .vt-mini-card');
      root.classList.toggle('cursor-hover', !!hot);
    });
    (function loop() {
      rx += (mx - rx) * 0.22;
      ry += (my - ry) * 0.22;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(loop);
    })();

    // Magnetic buttons
    const magneticSelector = '.btn, .ck-arrow-btn, .spaces-arrow-btn, .vt-play-pause-btn, .vt-audio-btn';
    document.querySelectorAll(magneticSelector).forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = (e.clientX - cx) * 0.28;
        const dy = (e.clientY - cy) * 0.28;
        el.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transform = '';
      });
    });
  }

  // --- Ambient Garden Atmosphere Synth (Web Audio API) ---
  let audioCtx = null;
  let noiseNode = null;
  let gainNode = null;
  let isAmbiencePlaying = false;

  function toggleGardenAmbience(btn) {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      audioCtx = new AudioContext();

      // Generate soft filtered stream / garden breeze noise
      const bufferSize = audioCtx.sampleRate * 2;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.95 * b1 + white * 0.05;
        b2 = 0.85 * b2 + white * 0.05;
        output[i] = (b0 + b1 + b2) * 0.07;
      }

      const whiteNoise = audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 650;

      gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0.01, audioCtx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      whiteNoise.start(0);
      noiseNode = whiteNoise;
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    isAmbiencePlaying = !isAmbiencePlaying;
    if (isAmbiencePlaying) {
      gainNode.gain.setTargetAtTime(0.06, audioCtx.currentTime, 0.4);
      if (btn) btn.classList.add('is-active');
      if (btn) btn.setAttribute('aria-pressed', 'true');
    } else {
      gainNode.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.3);
      if (btn) btn.classList.remove('is-active');
      if (btn) btn.setAttribute('aria-pressed', 'false');
    }
  }

  const ambienceToggleBtn = document.getElementById('ambienceAudioToggle');
  if (ambienceToggleBtn) {
    ambienceToggleBtn.addEventListener('click', () => toggleGardenAmbience(ambienceToggleBtn));
  }
}
