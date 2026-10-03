// ---------------------------------------------------------------------------
// Mac Brew Farm: Interactive 60fps Golden Effervescence & Fireflies Canvas
// Lightweight, buttery-smooth GPU particle system reacting to cursor physics.
// ---------------------------------------------------------------------------

export function initParticles({ reduce }) {
  const canvas = document.getElementById('particlesCanvas');
  if (!canvas || reduce) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const count = window.innerWidth < 768 ? 28 : 55;

  let mouse = { x: -1000, y: -1000, vx: 0, vy: 0, lastX: 0, lastY: 0 };
  let isHovered = false;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  window.addEventListener('pointermove', (e) => {
    mouse.vx = e.clientX - mouse.lastX;
    mouse.vy = e.clientY - mouse.lastY;
    mouse.lastX = mouse.x = e.clientX;
    mouse.lastY = mouse.y = e.clientY;
    isHovered = true;
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    isHovered = false;
    mouse.x = -1000;
    mouse.y = -1000;
  });

  class Particle {
    constructor() {
      this.reset(true);
    }
    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.size = Math.random() * 2.8 + 1;
      this.baseSpeed = Math.random() * 0.4 + 0.2;
      this.speed = this.baseSpeed;
      this.opacity = Math.random() * 0.4 + 0.15;
      this.baseOpacity = this.opacity;
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = Math.random() * 0.02 + 0.01;
      this.hue = Math.random() > 0.4 ? '42, 78%, 68%' : '345, 65%, 55%'; // Gold or Ruby
    }
    update() {
      this.wobble += this.wobbleSpeed;
      this.x += Math.sin(this.wobble) * 0.45;
      this.y -= this.speed;

      // Mouse interactive deflection
      if (isHovered) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 120;
        if (dist < maxDist) {
          const force = (1 - dist / maxDist) * 1.5;
          this.x -= (dx / dist) * force * 3;
          this.y -= (dy / dist) * force * 3;
          this.opacity = Math.min(0.85, this.baseOpacity + force * 0.5);
        } else {
          this.opacity += (this.baseOpacity - this.opacity) * 0.05;
        }
      }

      if (this.y < -15 || this.x < -15 || this.x > width + 15) {
        this.reset();
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, ${this.opacity})`;
      ctx.shadowBlur = this.size * 3;
      ctx.shadowColor = `hsla(${this.hue}, 0.8)`;
      ctx.fill();
    }
  }

  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }

  let running = true;
  function animate() {
    if (!running) return;
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    requestAnimationFrame(animate);
  }

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) animate();
  });

  animate();
}
