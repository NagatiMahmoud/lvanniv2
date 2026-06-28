const loader = document.getElementById('loader');
const openHeartBtn = document.getElementById('openHeartBtn');
const apologySection = document.getElementById('apologySection');
const giftBox = document.getElementById('giftBox');
const giftMessage = document.getElementById('giftMessage');
const themeToggle = document.getElementById('themeToggle');
const musicToggle = document.getElementById('musicToggle');
const bgMusic = document.getElementById('bgMusic');
const scrollProgress = document.getElementById('scrollProgress');
const cursorGlow = document.getElementById('cursorGlow');
const confettiCanvas = document.getElementById('confettiCanvas');
const ctx = confettiCanvas.getContext('2d');

const createFloaters = (containerId, symbol, count, minDuration, maxDuration) => {
  const container = document.getElementById(containerId);

  for (let i = 0; i < count; i += 1) {
    const el = document.createElement('span');
    el.className = containerId.slice(0, -1);
    el.textContent = symbol;
    el.style.left = `${Math.random() * 100}%`;
    el.style.animationDuration = `${Math.random() * (maxDuration - minDuration) + minDuration}s`;
    el.style.animationDelay = `${Math.random() * 8}s`;
    el.style.opacity = `${Math.random() * 0.8 + 0.2}`;
    container.appendChild(el);
  }
};

const createStars = () => {
  const stars = document.getElementById('stars');

  for (let i = 0; i < 85; i += 1) {
    const star = document.createElement('span');
    star.className = 'star';
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDuration = `${Math.random() * 2 + 1}s`;
    stars.appendChild(star);
  }
};

const startTypingEffect = () => {
  const target = document.getElementById('typingText');
  const text = target.textContent.trim();
  let index = 0;
  target.textContent = '';

  const type = () => {
    if (index < text.length) {
      target.textContent += text[index];
      index += 1;
      setTimeout(type, 30);
    }
  };

  type();
};

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((section) => {
  revealObserver.observe(section);
});

openHeartBtn.addEventListener('click', () => {
  apologySection.classList.remove('hidden');
  requestAnimationFrame(() => apologySection.classList.add('visible'));
  apologySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  themeToggle.textContent = document.body.classList.contains('light') ? '☀️' : '🌙';
});

musicToggle.addEventListener('click', async () => {
  try {
    if (bgMusic.paused) {
      await bgMusic.play();
      musicToggle.textContent = '⏸️';
    } else {
      bgMusic.pause();
      musicToggle.textContent = '▶️';
    }
  } catch (error) {
    musicToggle.textContent = '🔇';
  }
});

window.addEventListener('scroll', () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  scrollProgress.style.width = `${progress}%`;
});

window.addEventListener('mousemove', (event) => {
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
});

window.addEventListener('load', () => {
  setTimeout(() => {
    loader.classList.add('hidden');
  }, 900);
  startTypingEffect();
});

let confetti = [];

const resizeCanvas = () => {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
};

const randomColor = () => {
  const colors = ['#f7a8d5', '#f6d995', '#c7b2ff', '#ffffff'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const launchConfetti = () => {
  resizeCanvas();
  confetti = Array.from({ length: 120 }, () => ({
    x: confettiCanvas.width / 2,
    y: confettiCanvas.height / 2,
    r: Math.random() * 3 + 2,
    c: randomColor(),
    vx: (Math.random() - 0.5) * 8,
    vy: (Math.random() - 1.2) * 9,
    g: Math.random() * 0.15 + 0.08,
    life: 90,
  }));

  const animate = () => {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confetti.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.g;
      p.life -= 1;
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    confetti = confetti.filter((p) => p.life > 0);
    if (confetti.length > 0) requestAnimationFrame(animate);
  };

  animate();
};

giftBox.addEventListener('click', () => {
  launchConfetti();
  giftMessage.classList.remove('hidden');
  giftMessage.classList.add('visible');

  const hearts = document.getElementById('hearts');
  for (let i = 0; i < 18; i += 1) {
    const heart = document.createElement('span');
    heart.className = 'heart';
    heart.textContent = '💖';
    heart.style.left = `${45 + Math.random() * 10}%`;
    heart.style.top = '52%';
    heart.style.animationDuration = `${Math.random() * 1.2 + 0.9}s`;
    heart.style.transform = `translate(${(Math.random() - 0.5) * 240}px, ${(Math.random() - 1) * 260}px)`;
    hearts.appendChild(heart);
    setTimeout(() => heart.remove(), 1300);
  }
});

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
createStars();
createFloaters('hearts', '💗', 14, 8, 16);
createFloaters('petals', '🌸', 14, 9, 17);
createFloaters('particles', '•', 20, 10, 18);
