
// PRELOADER + SHUTTER (the same shutter also closes and reopens when the user returns to this tab)
const pl = document.getElementById('preloader');
let shutterTimer, hideTimer;
window.addEventListener('load', () => {
  pl.classList.add('done');
  setTimeout(() => { pl.style.display = 'none'; }, 2850);
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible' || !pl) return;
  clearTimeout(shutterTimer); clearTimeout(hideTimer);
  pl.style.display = '';
  pl.classList.remove('done', 'reopen');   // shutter lands fully closed
  void pl.offsetWidth;                     // restart the animation
  shutterTimer = setTimeout(() => pl.classList.add('reopen'), 350);
  hideTimer = setTimeout(() => { pl.style.display = 'none'; pl.classList.remove('reopen'); }, 1500);
});

// CURSOR
const cur = document.getElementById('cur'), trail = document.getElementById('cur-trail');
let mx = 0, my = 0, tx = 0, ty = 0;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cur.style.left = mx + 'px'; cur.style.top = my + 'px';
});
(function loop() {
  tx += (mx - tx) * 0.1; ty += (my - ty) * 0.1;
  trail.style.left = tx + 'px'; trail.style.top = ty + 'px';
  requestAnimationFrame(loop);
})();
document.querySelectorAll('a,button,.game-card,.member,.pillar,.stat-block').forEach(el => {
  el.addEventListener('mouseenter', () => { cur.style.width='18px'; cur.style.height='18px'; trail.style.width='58px'; trail.style.height='58px'; trail.style.borderColor='rgba(217,0,55,0.7)'; });
  el.addEventListener('mouseleave', () => { cur.style.width='10px'; cur.style.height='10px'; trail.style.width='40px'; trail.style.height='40px'; trail.style.borderColor='rgba(217,0,55,0.5)'; });
});

// NAV
window.addEventListener('scroll', () => document.getElementById('nav').classList.toggle('scrolled', scrollY > 60));

// PARTICLES
const canvas = document.getElementById('particles-canvas'), ctx = canvas.getContext('2d');
let W, H;
function resize() { W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
resize(); window.addEventListener('resize', resize);
const pts = Array.from({length:110}, () => ({
  x: Math.random()*innerWidth, y: Math.random()*innerHeight,
  r: Math.random()*1.4+0.3, vx: (Math.random()-.5)*.28, vy: (Math.random()-.5)*.28,
  a: Math.random()*.45+.08, red: Math.random()>.72
}));
(function animP() {
  ctx.clearRect(0,0,W,H);
  pts.forEach(p => {
    p.x+=p.vx; p.y+=p.vy;
    if(p.x<0||p.x>W) { p.x=Math.random()*W; p.y=Math.random()*H; }
    if(p.y<0||p.y>H) { p.x=Math.random()*W; p.y=Math.random()*H; }
    ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle = p.red ? `rgba(217,0,55,${p.a})` : `rgba(242,237,232,${p.a*.28})`;
    ctx.fill();
  });
  requestAnimationFrame(animP);
})();

// HERO SLAB PARALLAX
document.addEventListener('mousemove', e => {
  const xf = (e.clientX/innerWidth-.5), yf = (e.clientY/innerHeight-.5);
  const s = document.getElementById('heroSlab');
  if(s) s.style.transform = `translate(${xf*18}px,${yf*14}px)`;
});

// SCROLL REVEAL
const srEls = document.querySelectorAll('.sr');
const srObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); srObs.unobserve(e.target); } });
}, {threshold:0.1});
srEls.forEach(el => srObs.observe(el));

// COUNTERS
function runCounters() {
  document.querySelectorAll('.c').forEach(el => {
    const to = +el.dataset.to, start = performance.now(), dur = 1700;
    (function step(now) {
      const p = Math.min((now-start)/dur,1), e = 1-Math.pow(1-p,3);
      el.textContent = Math.round(e*to);
      if(p<1) requestAnimationFrame(step);
      else el.textContent = to;
    })(start);
  });
}
const statsObs = new IntersectionObserver(entries => { if(entries[0].isIntersecting){runCounters();statsObs.disconnect();}},{threshold:0.3});
const se = document.getElementById('stats');
if(se) statsObs.observe(se);

// CARD TILT
document.querySelectorAll('.game-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const xp = (e.clientX-r.left)/r.width-.5, yp = (e.clientY-r.top)/r.height-.5;
    card.style.transform = `perspective(900px) rotateY(${xp*7}deg) rotateX(${-yp*7}deg)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform=''; });
});

// FORM
function handleForm(e) {
  e.preventDefault();
  const form = e.currentTarget;
  if (!form.reportValidity()) return;
  showToast('Demo form only — connect a backend or email service to deliver messages.');
}

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if(id==='#') return;
    e.preventDefault();
    document.querySelector(id)?.scrollIntoView({behavior:'smooth'});
  });
});

// Extra interactions: mobile nav, portfolio filters, theme switch, scroll progress.
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.querySelector('.nav-links');
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    navLinks.classList.toggle('open', open);
  });
  navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    navLinks.classList.remove('open');
  }));
}
// THEME (saved in localStorage so the choice survives tab switches and reloads)
const themeToggle = document.getElementById('themeToggle');
const THEME_KEY = 'hn-theme';
function applyTheme(light, notify) {
  document.body.classList.toggle('light-mode', light);
  if (themeToggle) {
    themeToggle.textContent = light ? '☼' : '◐';
    themeToggle.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
  }
  try { localStorage.setItem(THEME_KEY, light ? 'light' : 'dark'); } catch (e) {}
  if (notify) showToast(light ? 'Light theme enabled' : 'Dark theme enabled');
}
let savedLight = false;
try { savedLight = localStorage.getItem(THEME_KEY) === 'light'; } catch (e) {}
applyTheme(savedLight, false);
if (themeToggle) themeToggle.addEventListener('click', () => applyTheme(!document.body.classList.contains('light-mode'), true));
const gameSearch = document.getElementById('gameSearch');
const filterButtons = [...document.querySelectorAll('.filter-btn')];
const gameCards = [...document.querySelectorAll('.game-card')];
const resultsLine = document.getElementById('resultsLine');
let activeGenre = 'all';
function filterGames() {
  const q = (gameSearch?.value || '').trim().toLowerCase();
  let count = 0;
  gameCards.forEach(card => {
    const matchesGenre = activeGenre === 'all' || card.dataset.genre === activeGenre;
    const text = `${card.dataset.title || ''} ${card.querySelector('.game-genre')?.textContent || ''} ${card.querySelector('.game-desc')?.textContent || ''}`.toLowerCase();
    const show = matchesGenre && text.includes(q);
    card.hidden = !show;
    if (show) count++;
  });
  if (resultsLine) resultsLine.textContent = `${String(count).padStart(2,'0')} ${count === 1 ? 'EXPERIENCE' : 'EXPERIENCES'} / ${count ? 'SELECT A TITLE' : 'NO MATCHES — TRY ANOTHER SEARCH'}`;
}
filterButtons.forEach(btn => btn.addEventListener('click', () => {
  activeGenre = btn.dataset.filter;
  filterButtons.forEach(b => b.classList.toggle('active', b === btn));
  filterGames();
}));
gameSearch?.addEventListener('input', filterGames);
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 4200);
}
const progress = document.getElementById('scrollProgress');
const backTop = document.getElementById('backTop');
function updateScrollUI() {
  const max = document.documentElement.scrollHeight - innerHeight;
  if (progress) progress.style.width = `${max > 0 ? scrollY / max * 100 : 0}%`;
  if (backTop) backTop.classList.toggle('visible', scrollY > 600);
}
addEventListener('scroll', updateScrollUI, {passive:true});
addEventListener('resize', updateScrollUI);
updateScrollUI();
backTop?.addEventListener('click', () => scrollTo({top:0,behavior:'smooth'}));
if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.sr').forEach(el => el.classList.add('in'));
}
document.querySelectorAll('.cform .ff').forEach((field, i) => {
  const label = field.querySelector('label'), control = field.querySelector('input,select,textarea');
  if (label && control) { if (!control.id) control.id = `contact-field-${i+1}`; label.htmlFor = control.id; }
});

