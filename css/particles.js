// ===================================================
// Crypto Nova LP - パーティクルアニメーション
// ===================================================

const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];
let animationId;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 3 + 1;
    this.speedY = Math.random() * 0.3 - 0.15;
    this.speedX = Math.random() * 0.2 - 0.1;
    this.opacity = Math.random() * 0.5 + 0.1;
    this.opacitySpeed = Math.random() * 0.005 + 0.002;
    this.opacityDirection = 1;
    this.isGold = Math.random() < 0.2;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.x += Math.sin(Date.now() * 0.001 + this.y * 0.01) * 0.2;
    this.opacity += this.opacitySpeed * this.opacityDirection;
    if (this.opacity >= 0.6) this.opacityDirection = -1;
    if (this.opacity <= 0.1) this.opacityDirection = 1;
    if (this.x < -10 || this.x > canvas.width + 10 || this.y < -10 || this.y > canvas.height + 10) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    if (this.isGold) {
      ctx.fillStyle = `rgba(242, 216, 148, ${this.opacity})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = `rgba(242, 216, 148, ${this.opacity * 0.5})`;
    } else {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
      ctx.shadowBlur = 4;
      ctx.shadowColor = `rgba(255, 255, 255, ${this.opacity * 0.3})`;
    }
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function initParticles() {
  const count = window.innerWidth < 768 ? 25 : 55;
  particles = [];
  for (let i = 0; i < count; i++) particles.push(new Particle());
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  animationId = requestAnimationFrame(animateParticles);
}

resizeCanvas();
initParticles();
animateParticles();

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { resizeCanvas(); initParticles(); }, 250);
});

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  cancelAnimationFrame(animationId);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
