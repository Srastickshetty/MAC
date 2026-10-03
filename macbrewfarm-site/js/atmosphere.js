// ---------------------------------------------------------------------------
// Mac Brew Farm: Interactive Atmosphere Shifter
// Real-time Day ☀️ / Golden Hour 🌅 / Night Canopy 🌙 Time-of-Day Experience
// ---------------------------------------------------------------------------

export function initAtmosphere() {
  const root = document.documentElement;
  const heroVideo = document.getElementById('heroVideo');
  const buttons = document.querySelectorAll('.atm-btn');
  const statusLabel = document.getElementById('atmStatusLabel');

  const modes = {
    day: {
      label: 'Day Garden ☀️',
      video: 'media/video/feast-table.mp4',
      poster: 'media/video/feast-table.webp',
      glow: 'rgba(235, 190, 120, 0.28)',
      themeColor: '#173B2C',
    },
    golden: {
      label: 'Golden Hour 🌅',
      video: 'media/video/reel-golden-hour.mp4',
      poster: 'media/video/reel-golden-hour.webp',
      glow: 'rgba(214, 40, 79, 0.32)',
      themeColor: '#10291F',
    },
    night: {
      label: 'Night Canopy 🌙',
      video: 'media/video/reel-ambience.mp4',
      poster: 'media/video/reel-ambience.webp',
      glow: 'rgba(245, 158, 11, 0.35)',
      themeColor: '#07130E',
    },
  };

  // Determine initial mode based on local Bengaluru time (IST = UTC+5:30)
  function getBengaluruMode() {
    const now = new Date();
    // UTC hours + 5.5
    const istHours = (now.getUTCHours() + 5 + (now.getUTCMinutes() + 30 >= 60 ? 1 : 0)) % 24;
    if (istHours >= 6 && istHours < 16) return 'day';
    if (istHours >= 16 && istHours < 19) return 'golden';
    return 'night';
  }

  let currentMode = getBengaluruMode();

  function applyAtmosphere(mode, userInitiated = false) {
    if (!modes[mode]) mode = 'golden';
    currentMode = mode;
    root.setAttribute('data-atmosphere', mode);

    // Update active button states
    buttons.forEach((btn) => {
      const isCurrent = btn.getAttribute('data-mode') === mode;
      btn.classList.toggle('is-active', isCurrent);
      btn.setAttribute('aria-pressed', String(isCurrent));
    });

    if (statusLabel) {
      statusLabel.textContent = modes[mode].label;
    }

    // Set ambient glow
    const bgGlow = document.getElementById('bgGlow');
    if (bgGlow) {
      bgGlow.style.setProperty('--glow', modes[mode].glow);
    }

    // Update hero video smoothly
    if (heroVideo && userInitiated) {
      heroVideo.style.opacity = '0.2';
      setTimeout(() => {
        heroVideo.src = modes[mode].video;
        heroVideo.poster = modes[mode].poster;
        heroVideo.load();
        heroVideo.play().catch(() => {});
        heroVideo.style.opacity = '0.55';
      }, 200);
    }
  }

  // Bind clicks
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-mode');
      applyAtmosphere(mode, true);
    });
  });

  // Apply initial atmosphere
  applyAtmosphere(currentMode, false);
}
