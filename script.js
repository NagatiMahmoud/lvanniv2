/* --------------------------------------------------
   Standalone interactions for the birthday surprise
   Uses vanilla JavaScript only.
-------------------------------------------------- */

const body = document.body;
const loadingScreen = document.getElementById('loadingScreen');
const progressIndicator = document.getElementById('progressIndicator');
const typingTarget = document.getElementById('typingTarget');
const themeToggle = document.getElementById('themeToggle');
const musicToggle = document.getElementById('musicToggle');
const floatingMusic = document.getElementById('floatingMusic');
const ambientAudio = document.getElementById('ambientAudio');
const openHeartBtn = document.getElementById('openHeartBtn');
const scrollWishesBtn = document.getElementById('scrollWishesBtn');
const apologySection = document.getElementById('apology');
const revealSections = document.querySelectorAll('.reveal-section');
const hiddenSection = document.querySelector('.hidden-section');
const giftButton = document.getElementById('giftButton');
const surpriseMessage = document.getElementById('surpriseMessage');
const confettiCanvas = document.getElementById('confettiCanvas');
const cursorGlow = document.getElementById('cursorGlow');
const heartsRain = document.getElementById('heartsRain');
const petalsLayer = document.getElementById('petalsLayer');
const particlesLayer = document.getElementById('particlesLayer');

let audioContext;
let gainNode;
let droneNodes = [];
let musicPlaying = false;
let fallbackStarted = false;
let typingIndex = 0;
let confettiRunning = false;
let confettiPieces = [];
let confettiAnimationId = 0;

const typingPhrase = 'A soft letter from the heart';
const heartIcons = ['♥', '❤', '✦'];
const petalColors = ['rgba(248,165,200,0.78)', 'rgba(246,212,139,0.7)', 'rgba(200,181,255,0.72)'];

function bootstrap() {
  createAmbientLayers();
  setupScrollProgress();
  setupRevealObservers();
  setupTypingAnimation();
  setupThemeToggle();
  setupMusicControls();
  setupSurpriseGift();
  setupCursorGlow();
  setupHeroActions();
  setupConfettiCanvas();

  window.addEventListener('resize', resizeCanvas, { passive: true });
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('pointermove', handlePointerMove, { passive: true });

  window.setTimeout(() => {
    loadingScreen.classList.add('is-hidden');
  }, 1300);
}

function createAmbientLayers() {
  const heartsFragment = document.createDocumentFragment();
  const petalsFragment = document.createDocumentFragment();
  const particlesFragment = document.createDocumentFragment();

  for (let index = 0; index < 18; index += 1) {
    const heart = document.createElement('span');
    heart.className = 'heart';
    heart.textContent = heartIcons[index % heartIcons.length];
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.bottom = `${-20 - Math.random() * 60}vh`;
    heart.style.animationDelay = `${Math.random() * 12}s`;
    heart.style.animationDuration = `${10 + Math.random() * 8}s`;
    heart.style.opacity = `${0.15 + Math.random() * 0.25}`;
    heartsFragment.appendChild(heart);
  }

  for (let index = 0; index < 16; index += 1) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.top = `${-10 - Math.random() * 40}vh`;
    petal.style.animationDelay = `${Math.random() * 16}s`;
    petal.style.animationDuration = `${12 + Math.random() * 12}s`;
    petal.style.background = `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.95), ${petalColors[index % petalColors.length]} 45%, rgba(255,255,255,0.1) 100%)`;
    petalsFragment.appendChild(petal);
  }

  for (let index = 0; index < 20; index += 1) {
    const particle = document.createElement('span');
    particle.className = 'particle';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 10}s`;
    particle.style.animationDuration = `${10 + Math.random() * 8}s`;
    particle.style.opacity = `${0.15 + Math.random() * 0.45}`;
    particlesFragment.appendChild(particle);
  }

  heartsRain.appendChild(heartsFragment);
  petalsLayer.appendChild(petalsFragment);
  particlesLayer.appendChild(particlesFragment);
}

function setupScrollProgress() {
  updateProgress();
}

function updateProgress() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  progressIndicator.style.width = `${Math.min(Math.max(ratio * 100, 0), 100)}%`;
}

function setupRevealObservers() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealSections.forEach((section) => observer.observe(section));
}

function setupTypingAnimation() {
  typingTarget.textContent = '';
  window.setInterval(() => {
    typingIndex = (typingIndex + 1) % (typingPhrase.length + 24);
    const visibleLength = Math.min(typingIndex, typingPhrase.length);
    typingTarget.textContent = typingPhrase.slice(0, visibleLength);
    if (typingIndex > typingPhrase.length + 8) {
      typingIndex = 0;
    }
  }, 80);
}

function setupThemeToggle() {
  themeToggle.addEventListener('click', () => {
    const nextTheme = body.dataset.theme === 'dark' ? 'light' : 'dark';
    body.dataset.theme = nextTheme;
    themeToggle.querySelector('.icon').textContent = nextTheme === 'dark' ? '☾' : '☀';
    document.documentElement.style.colorScheme = nextTheme;
  });
}

function setupMusicControls() {
  const toggleMusic = async () => {
    if (!audioContext) {
      createFallbackAmbientMusic();
    }

    try {
      if (musicPlaying) {
        ambientAudio.pause();
        stopFallbackAmbientMusic();
        musicPlaying = false;
      } else {
        await ambientAudio.play();
        musicPlaying = true;
      }
    } catch (error) {
      if (!musicPlaying) {
        startFallbackAmbientMusic();
        musicPlaying = true;
      } else {
        stopFallbackAmbientMusic();
        musicPlaying = false;
      }
    }

    syncMusicButtons();
  };

  musicToggle.addEventListener('click', toggleMusic);
  floatingMusic.addEventListener('click', toggleMusic);

  ambientAudio.addEventListener('ended', () => {
    musicPlaying = false;
    syncMusicButtons();
  });

  ambientAudio.addEventListener('error', () => {
    if (musicPlaying) {
      stopFallbackAmbientMusic();
      musicPlaying = false;
      syncMusicButtons();
    }
  });
}

function createFallbackAmbientMusic() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioContext.createGain();
    gainNode.gain.value = 0;
    gainNode.connect(audioContext.destination);

    const notes = [196, 247, 293.66, 392];
    droneNodes = notes.map((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const oscillatorGain = audioContext.createGain();
      oscillator.type = index % 2 === 0 ? 'sine' : 'triangle';
      oscillator.frequency.value = frequency;
      oscillatorGain.gain.value = 0.1 / (index + 1);
      oscillator.connect(oscillatorGain);
      oscillatorGain.connect(gainNode);
      oscillator.start();
      return { oscillator, oscillatorGain };
    });

    fallbackStarted = true;
  } catch (error) {
    audioContext = null;
    gainNode = null;
    droneNodes = [];
    fallbackStarted = false;
  }
}

function startFallbackAmbientMusic() {
  if (!audioContext || !gainNode || droneNodes.length === 0) {
    return;
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  if (!fallbackStarted) {
    createFallbackAmbientMusic();
  }

  gainNode.gain.setTargetAtTime(0.018, audioContext.currentTime, 0.08);
}

function stopFallbackAmbientMusic() {
  if (!audioContext || !gainNode || !droneNodes.length) {
    return;
  }

  gainNode.gain.setTargetAtTime(0, audioContext.currentTime, 0.08);
}

function syncMusicButtons() {
  const icon = musicPlaying ? '❚❚' : '♪';
  musicToggle.querySelector('.icon').textContent = icon;
  floatingMusic.querySelector('.floating-music-icon').textContent = icon;
  musicToggle.setAttribute('aria-label', musicPlaying ? 'Pause romantic music' : 'Play romantic music');
  floatingMusic.setAttribute('aria-label', musicPlaying ? 'Pause romantic music' : 'Play romantic music');
}

function setupSurpriseGift() {
  giftButton.addEventListener('click', () => {
    giftButton.classList.add('is-open');
    surpriseMessage.classList.add('flash-celebration');
    launchConfettiBurst();
    launchHeartsBurst();
    window.setTimeout(() => {
      surpriseMessage.classList.remove('flash-celebration');
    }, 1000);
  });
}

function setupHeroActions() {
  openHeartBtn.addEventListener('click', () => {
    if (hiddenSection) {
      hiddenSection.classList.add('is-visible');
    }
    if (apologySection) {
      apologySection.classList.add('is-visible');
    }
  });

  scrollWishesBtn.addEventListener('click', () => {
    document.getElementById('wishes').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function setupCursorGlow() {
  cursorGlow.style.left = '50%';
  cursorGlow.style.top = '28%';
}

function handlePointerMove(event) {
  document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`);
  document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`);
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
}

function setupConfettiCanvas() {
  resizeCanvas();
}

function resizeCanvas() {
  const scale = window.devicePixelRatio || 1;
  confettiCanvas.width = Math.floor(window.innerWidth * scale);
  confettiCanvas.height = Math.floor(window.innerHeight * scale);
  confettiCanvas.style.width = `${window.innerWidth}px`;
  confettiCanvas.style.height = `${window.innerHeight}px`;
  const context = confettiCanvas.getContext('2d');
  context.setTransform(scale, 0, 0, scale, 0, 0);
}

function launchConfettiBurst() {
  const context = confettiCanvas.getContext('2d');
  const colors = ['#f8a5c8', '#f6d48b', '#c8b5ff', '#ffffff'];

  for (let index = 0; index < 160; index += 1) {
    confettiPieces.push({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 1.1) * 15,
      gravity: 0.28 + Math.random() * 0.12,
      color: colors[index % colors.length],
      size: 6 + Math.random() * 8,
      rotation: Math.random() * Math.PI,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      life: 180 + Math.random() * 60,
      shape: Math.random() > 0.5 ? 'circle' : 'rect'
    });
  }

  if (!confettiRunning) {
    confettiRunning = true;
    confettiAnimationId = requestAnimationFrame(() => renderConfetti(context));
  }
}

function renderConfetti(context) {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  confettiPieces = confettiPieces.filter((piece) => piece.life > 0);

  confettiPieces.forEach((piece) => {
    piece.x += piece.vx;
    piece.y += piece.vy;
    piece.vy += piece.gravity;
    piece.rotation += piece.rotationSpeed;
    piece.life -= 1;

    context.save();
    context.translate(piece.x, piece.y);
    context.rotate(piece.rotation);
    context.fillStyle = piece.color;
    context.globalAlpha = Math.max(piece.life / 240, 0);

    if (piece.shape === 'circle') {
      context.beginPath();
      context.arc(0, 0, piece.size * 0.55, 0, Math.PI * 2);
      context.fill();
    } else {
      context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.55);
    }

    context.restore();
  });

  if (confettiPieces.length > 0) {
    confettiAnimationId = requestAnimationFrame(() => renderConfetti(context));
  } else {
    confettiRunning = false;
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

function launchHeartsBurst() {
  const burst = document.createElement('div');
  burst.style.position = 'fixed';
  burst.style.left = '50%';
  burst.style.top = '55%';
  burst.style.width = '1px';
  burst.style.height = '1px';
  burst.style.pointerEvents = 'none';
  burst.style.zIndex = '26';
  document.body.appendChild(burst);

  for (let index = 0; index < 18; index += 1) {
    const heart = document.createElement('span');
    heart.textContent = heartIcons[index % heartIcons.length];
    heart.style.position = 'absolute';
    heart.style.left = '0';
    heart.style.top = '0';
    heart.style.color = index % 2 === 0 ? '#f8a5c8' : '#f6d48b';
    heart.style.fontSize = `${18 + Math.random() * 22}px`;
    heart.style.transform = 'translate(-50%, -50%)';
    heart.style.opacity = '0.95';
    heart.style.transition = 'transform 1.1s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 1.1s ease';
    burst.appendChild(heart);

    const angle = (Math.PI * 2 * index) / 18;
    const distance = 130 + Math.random() * 110;
    window.setTimeout(() => {
      heart.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(1.45)`;
      heart.style.opacity = '0';
    }, 10);
  }

  window.setTimeout(() => burst.remove(), 1400);
}

window.addEventListener('DOMContentLoaded', bootstrap);
