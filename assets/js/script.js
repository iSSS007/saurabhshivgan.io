/* ──────────────────────────────────
   LOADER
────────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 1900);
});

/* ──────────────────────────────────
   PARTICLE CANVAS BACKGROUND
────────────────────────────────── */
(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x: -999, y: -999 };

  const COLORS = ['rgba(59,130,246,', 'rgba(139,92,246,', 'rgba(6,182,212,', 'rgba(236,72,153,'];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function Particle() {
    this.reset();
  }
  Particle.prototype.reset = function () {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.r = Math.random() * 1.5 + 0.3;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.alpha = Math.random() * 0.5 + 0.1;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
  };
  Particle.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    const dx = this.x - mouse.x, dy = this.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 80) {
      this.x += dx / dist * 0.8;
      this.y += dy / dist * 0.8;
    }
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  };
  Particle.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color + this.alpha + ')';
    ctx.fill();
  };

  function init() {
    resize();
    particles = [];
    const count = Math.min(180, Math.floor(W * H / 8000));
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(139,92,246,' + (0.08 * (1 - d / 120)) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function drawOrbs() {
    // soft gradient orbs in the background
    const orbs = [
      { x: W * 0.15, y: H * 0.3, r: 300, c1: 'rgba(59,130,246,0.06)', c2: 'transparent' },
      { x: W * 0.85, y: H * 0.6, r: 350, c1: 'rgba(139,92,246,0.07)', c2: 'transparent' },
      { x: W * 0.5, y: H * 0.9, r: 280, c1: 'rgba(6,182,212,0.05)', c2: 'transparent' },
    ];
    orbs.forEach(o => {
      const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
      g.addColorStop(0, o.c1);
      g.addColorStop(1, o.c2);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawOrbs();
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', init);
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

  init();
  animate();
})();

/* ──────────────────────────────────
   SCROLL REVEAL
────────────────────────────────── */
(function () {
  const items = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  items.forEach(i => obs.observe(i));
})();

/* ──────────────────────────────────
   MOBILE MENU
────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('open');
});

function closeMobile() {
  hamburger.classList.remove('active');
  mobileMenu.classList.remove('open');
}

/* ──────────────────────────────────
   NAV ACTIVE SECTION HIGHLIGHT
────────────────────────────────── */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    navLinks.forEach(a => {
      a.style.color = a.getAttribute('href') === '#' + current
        ? 'var(--text-primary)' : '';
    });
  });
})();

/* ──────────────────────────────────
   CONTACT FORM (opens mail client)
────────────────────────────────── */
function sanitizeInput(input) {
  return input.replace(/<[^>]*>?/gm, "");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function handleFormSubmit() {
  let name = sanitizeInput(document.getElementById('cf-name').value.trim());
  let email = sanitizeInput(document.getElementById('cf-email').value.trim());
  let msg = sanitizeInput(document.getElementById('cf-msg').value.trim());

  if (!name || !email || !msg) {
    alert('Please fill in all fields.');
    return;
  }

  if (!isValidEmail(email)) {
    alert('Please enter a valid email.');
    return;
  }

  if (msg.length > 300) {
    alert('Message should be under 300 characters.');
    return;
  }

  const subject = encodeURIComponent(`Portfolio Contact from ${name}`);
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\n\nMessage:\n${msg}`
  );

  window.location.href =
    `mailto:shivgansaurabh79@gmail.com?subject=${subject}&body=${body}`;
}

/* ──────────────────────────────────
   TYPED EFFECT ON HERO TAGLINE
────────────────────────────────── */
(function () {
  const words = ['cross-platform mobile apps', 'elegant .NET MAUI solutions', 'scalable REST APIs', 'modern full-stack systems'];
  let wi = 0, ci = 0, deleting = false;
  const el = document.querySelector('.hero-tagline span');
  if (!el) return;

  function type() {
    const word = words[wi];
    if (!deleting) {
      el.textContent = word.slice(0, ++ci);
      if (ci === word.length) { deleting = true; setTimeout(type, 1800); return; }
    } else {
      el.textContent = word.slice(0, --ci);
      if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; }
    }
    setTimeout(type, deleting ? 40 : 70);
  }
  type();
})();

/* ──────────────────────────────────
   CURSOR GLOW
──────────────────────────────────  */
document.addEventListener("mousemove", e => {
  const glow = document.getElementById("cursorGlow");
  if (glow) {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  }
});

/* ────────────────────────────────── 
   SLIDER (AUTOPLAY + PAUSE)
──────────────────────────────────  */
document.querySelectorAll('.slider').forEach(slider => {
  const slides = slider.querySelectorAll('.slide');
  let index = 0;
  let interval;

  function showNext() {
    slides[index].classList.remove('active');
    index = (index + 1) % slides.length;
    slides[index].classList.add('active');
  }

  function startSlider() {
    interval = setInterval(showNext, 2500);
  }

  function stopSlider() {
    clearInterval(interval);
  }

  // Start autoplay
  startSlider();

  // Pause on hover
  slider.addEventListener('mouseenter', stopSlider);

  // Resume on leave
  slider.addEventListener('mouseleave', startSlider);
});

/* ────────────────────────────────── 
   CHARACTER COUNTER
──────────────────────────────────  */
const msgInput = document.getElementById("cf-msg");
const counter = document.getElementById("charCount");

msgInput?.addEventListener("input", () => {
  counter.textContent = msgInput.value.length + " / 300";
});

/* ────────────────────────────────── 
   FOOTER YEAR
──────────────────────────────────  */
const startYear = 2025;
const currentYear = new Date().getFullYear();

document.getElementById("yearRange").textContent =
  startYear === currentYear ? startYear : `${startYear}-${currentYear}`;