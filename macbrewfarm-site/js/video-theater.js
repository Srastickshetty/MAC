// ---------------------------------------------------------------------------
// Mac Brew Farm: Cinematic Real-World Video Theater
// Interactive reel switcher with studio MP3 background audio support
// ---------------------------------------------------------------------------
import { reels } from './data.js';

// ---------------------------------------------------------------------------
// Real Studio Audio BGM Engine
// Plays real recorded MP3 audio with smooth volume fading, looping across all reels
// ---------------------------------------------------------------------------
class RealAudioBGMEngine {
  constructor(audioSrc) {
    this.audio = new Audio(audioSrc || 'media/audio/lounge-bgm.mp3');
    this.audio.loop = true;
    this.audio.preload = 'auto';
    this.audio.volume = 0;
    this.isMuted = true;
    this.isVideoPaused = false;
    this.fadeInterval = null;

    this.audio.addEventListener('error', () => {
      // Graceful fallback if no audio file is provided yet
      console.info('No custom media/audio/lounge-bgm.mp3 detected. Keeping audio silent.');
    });
  }

  fadeTo(targetVolume, duration = 400, onComplete = null) {
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    const stepTime = 30;
    const steps = Math.max(1, duration / stepTime);
    const startVolume = this.audio.volume;
    const delta = (targetVolume - startVolume) / steps;
    let currentStep = 0;

    this.fadeInterval = setInterval(() => {
      currentStep++;
      const newVol = Math.min(1, Math.max(0, startVolume + delta * currentStep));
      this.audio.volume = newVol;
      if (currentStep >= steps) {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
        this.audio.volume = targetVolume;
        if (onComplete) onComplete();
      }
    }, stepTime);
  }

  setMuted(muted) {
    this.isMuted = muted;
    this.syncPlayback();
  }

  setVideoPaused(paused) {
    this.isVideoPaused = paused;
    this.syncPlayback();
  }

  syncPlayback() {
    if (this.isMuted || this.isVideoPaused) {
      this.fadeTo(0, 300, () => {
        if (this.isMuted || this.isVideoPaused) {
          this.audio.pause();
        }
      });
    } else {
      if (this.audio.paused) {
        const p = this.audio.play();
        if (p && p.catch) p.catch(() => {});
      }
      this.fadeTo(0.4, 400);
    }
  }
}

export function initVideoTheater({ isStatic, reduce }) {
  const host = document.getElementById('videoTheaterApp');
  if (!host) return;

  const bgmEngine = new RealAudioBGMEngine('media/audio/lounge-bgm.mp3');
  let activeIndex = 0;
  let isMuted = true;

  host.innerHTML = `
    <div class="vt-container">
      <div class="vt-header">
        <div class="vt-title-wrap">
          <span class="vt-pill-badge">Through the Lens</span>
          <h2 class="display vt-title">Atmosphere, Fire & Golden Hour</h2>
          <p class="lede vt-subtitle">Experience the living energy of Mac Brew Farm — captured live across twilight, open-air canopies, and the kitchen pass.</p>
        </div>
        <div class="vt-reel-tabs" role="tablist" aria-label="Video reels">
          ${reels.map((r, i) => `
            <button class="vt-tab-btn ${i === 0 ? 'is-active' : ''}" type="button" data-index="${i}" role="tab" aria-selected="${i === 0}">
              <span class="vt-tab-num">0${i + 1}</span>
              <span class="vt-tab-text">${r.badge}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="vt-stage">
        <div class="vt-screen-frame">
          <video class="vt-video" id="vtActiveVideo" playsinline webkit-playsinline loop muted preload="auto" poster="${reels[0].poster}">
            <source src="${reels[0].video}" type="video/mp4">
          </video>
          <div class="vt-overlay-glow"></div>
          
          <!-- Screen Control Badges -->
          <div class="vt-screen-header">
            <div class="vt-live-indicator">
              <span class="vt-live-pulse"></span>
              <span class="vt-live-label" id="vtReelBadge">${reels[0].badge}</span>
            </div>
            <div class="vt-audio-wrap">
              <button class="vt-audio-btn" id="vtAudioToggle" type="button" aria-label="Toggle Lounge BGM">
                <svg class="vt-icon-muted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><line x1="23" x2="1" y1="1" y2="23"/></svg>
                <span id="vtAudioLabel">Sound Off</span>
              </button>
            </div>
          </div>

          <div class="vt-screen-footer">
            <div class="vt-caption-box">
              <h3 class="display vt-caption-title" id="vtCaptionTitle">${reels[0].title}</h3>
              <p class="vt-caption-sub" id="vtCaptionSub">${reels[0].subtitle}</p>
            </div>
            <div class="vt-player-controls">
              <button class="vt-play-pause-btn" id="vtPlayPauseBtn" type="button" aria-label="Pause Video">
                <svg class="vt-icon-pause" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              </button>
            </div>
          </div>

          <!-- Video Progress Bar -->
          <div class="vt-progress-track">
            <div class="vt-progress-fill" id="vtProgressFill"></div>
          </div>
        </div>

        <!-- Reel Carousel Cards Below -->
        <div class="vt-cards-carousel" id="vtCardsCarousel">
          ${reels.map((r, i) => `
            <div class="vt-mini-card ${i === 0 ? 'is-active' : ''}" data-index="${i}">
              <div class="vt-mini-thumb">
                <img src="${r.poster}" alt="${r.title}" width="300" height="400" loading="lazy">
                <span class="vt-mini-badge">${r.badge}</span>
                <span class="vt-mini-play-icon">▶</span>
              </div>
              <div class="vt-mini-details">
                <h4 class="vt-mini-title">${r.title}</h4>
                <p class="vt-mini-duration">${r.duration}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Elements
  const video = host.querySelector('#vtActiveVideo');
  const badgeEl = host.querySelector('#vtReelBadge');
  const captionTitle = host.querySelector('#vtCaptionTitle');
  const captionSub = host.querySelector('#vtCaptionSub');
  const audioToggle = host.querySelector('#vtAudioToggle');
  const audioLabel = host.querySelector('#vtAudioLabel');
  const playPauseBtn = host.querySelector('#vtPlayPauseBtn');
  const progressFill = host.querySelector('#vtProgressFill');
  const tabBtns = host.querySelectorAll('.vt-tab-btn');
  const miniCards = host.querySelectorAll('.vt-mini-card');

  // Video switch function — smoothly switches video while real audio continues uninterrupted
  function switchReel(idx) {
    if (idx === activeIndex && video.src) return;
    activeIndex = idx;
    const r = reels[idx];

    // Update buttons
    tabBtns.forEach((btn, i) => {
      btn.classList.toggle('is-active', i === idx);
      btn.setAttribute('aria-selected', String(i === idx));
    });
    miniCards.forEach((card, i) => {
      card.classList.toggle('is-active', i === idx);
    });

    // Update Text
    badgeEl.textContent = r.badge;
    captionTitle.textContent = r.title;
    captionSub.textContent = r.subtitle;

    // Load new video
    video.style.opacity = '0.4';
    video.src = r.video;
    video.poster = r.poster;
    video.muted = true;
    video.load();

    const p = video.play();
    if (p && p.catch) {
      p.catch(() => {});
    }

    setTimeout(() => {
      video.style.opacity = '1';
    }, 150);
  }

  // Audio Toggle
  function updateAudioUI() {
    audioToggle.classList.toggle('is-unmuted', !isMuted);
    audioLabel.innerHTML = isMuted
      ? 'Sound Off'
      : 'Sound On <span class="vt-equalizer-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';
    audioToggle.querySelector('svg').innerHTML = isMuted
      ? '<path d="M11 5 6 9H2v6h4l5 4V5Z"/><line x1="23" x2="1" y1="1" y2="23"/>'
      : '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>';
  }

  function toggleAudio() {
    isMuted = !isMuted;
    bgmEngine.setMuted(isMuted);
    updateAudioUI();
  }

  audioToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleAudio();
  });

  // Play / Pause Toggle
  playPauseBtn.addEventListener('click', () => {
    if (video.paused) {
      video.play();
      bgmEngine.setVideoPaused(false);
      playPauseBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
      playPauseBtn.setAttribute('aria-label', 'Pause Video');
    } else {
      video.pause();
      bgmEngine.setVideoPaused(true);
      playPauseBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
      playPauseBtn.setAttribute('aria-label', 'Play Video');
    }
  });

  // Progress Bar update
  video.addEventListener('timeupdate', () => {
    if (video.duration) {
      const p = (video.currentTime / video.duration) * 100;
      progressFill.style.width = p.toFixed(1) + '%';
    }
  });

  // Tab & Mini card clicks
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      switchReel(idx);
    });
  });

  miniCards.forEach((card) => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.getAttribute('data-index'), 10);
      switchReel(idx);
    });
  });

  // Auto-pause when offscreen
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          video.play().catch(() => {});
          bgmEngine.setVideoPaused(false);
        } else {
          video.pause();
          bgmEngine.setVideoPaused(true);
        }
      });
    }, { threshold: 0.25 });
    io.observe(video);
  } else if (!reduce) {
    video.play().catch(() => {});
  }
}
