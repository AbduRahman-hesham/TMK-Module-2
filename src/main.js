import * as THREE from 'three';
import './style.css';
import { HERO_IMAGES, MISSIONS, TEXT } from './text.js';
import { createCity, getLotTransform } from './city.js';
import { createCharacter, loadCutoutCanvas } from './character.js';
import { initAudio, isMuted, playBuildPop, playCorrect, playFinal, playMission, playPop, playStar, playWrong, speakText, toggleMute } from './audio.js';

const SAVE_KEY = 'hero_city_save_v1';
const $ = (id) => document.getElementById(id);

const canvas = $('game-canvas');
const menuOverlay = $('menu-overlay');
const langBtn = $('lang-btn');
const muteBtn = $('mute-btn');
const starBar = $('star-bar');
const missionBanner = $('mission-banner');
const continueBtn = $('continue-btn');
const missionTop = $('mission-top');
const missionEmoji = $('mission-emoji');
const missionTitle = $('mission-title');
const whyLine = $('why-line');
const speakBtn = $('speak-btn');
const cardsRow = $('cards-row');
const lessonBar = $('lesson-bar');
const lessonText = $('lesson-text');
const nextBtn = $('next-btn');
const finalOverlay = $('final-overlay');
const finalScore = $('final-score');
const finalTitle = $('final-title');
const restartBtn = $('restart-btn');
const webglError = $('webgl-error');
const webglErrorText = $('webgl-error-text');

let lang = 'ar', hero = 'boy', missionIdx = 0;
let solved = [], results = Array(9).fill(null); // 'star' | 'lost' | null
let currentOrder = [0, 1, 2], lastWrongChoice = null;
let inMenu = true, inFinal = false, solvedCurrent = false, locked = false, picked = false;
let menuOrbit = 0, camAnim = null, fovPunch = 0, camShake = 0;

const starSlots = Array.from({ length: 9 }, () => {
  const s = document.createElement('span');
  s.className = 'star-slot';
  s.textContent = '⭐';
  starBar.appendChild(s);
  return s;
});

function loadSave() {
  try {
    const data = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (!data || !Array.isArray(data.solved)) return null;
    return {
      hero: data.hero || 'boy',
      solved: data.solved,
      results: Array.isArray(data.results) && data.results.length === 9 ? data.results : Array(9).fill(null),
    };
  } catch { return null; }
}
function writeSave() { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ hero, solved, results })); } catch {} }
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch {} }
function countStars() { return results.filter((r) => r === 'star').length; }

function renderStars() {
  starSlots.forEach((el, idx) => {
    el.classList.toggle('filled', results[idx] === 'star');
    el.classList.toggle('lost', results[idx] === 'lost');
  });
}

function renderFinalText() {
  const stars = countStars(), t = TEXT[lang];
  finalScore.textContent = t.finalScore(stars);
  finalTitle.textContent = stars === 9 ? t.tierPerfect : stars >= 6 ? t.tierGreat : t.tierMore;
}

function renderMissionUI() {
  const m = MISSIONS[missionIdx];
  if (!m) return;
  const copy = m[lang];
  missionEmoji.textContent = m.emoji;
  missionTitle.textContent = copy.title;
  lessonText.textContent = copy.lesson;
  if (lastWrongChoice !== null && copy.choices[lastWrongChoice]?.[3]) {
    whyLine.textContent = copy.choices[lastWrongChoice][3];
    whyLine.classList.remove('hidden');
  } else {
    whyLine.classList.add('hidden');
  }
  const buttons = cardsRow.querySelectorAll('.choice-card');
  currentOrder.forEach((choiceIdx, pos) => {
    const btn = buttons[pos];
    if (!btn) return;
    const [emoji, label] = copy.choices[choiceIdx];
    btn.querySelector('.choice-emoji').textContent = emoji;
    btn.querySelector('.choice-label').textContent = label;
  });
}

function applyLanguage() {
  const t = TEXT[lang];
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  $('menu-title').textContent = t.title;
  $('menu-prompt').textContent = t.prompt;
  $('label-boy').textContent = t.boy;
  $('label-girl').textContent = t.girl;
  langBtn.textContent = t.langBtn;
  continueBtn.textContent = t.continueBtn;
  nextBtn.textContent = t.next;
  restartBtn.textContent = t.playAgain;
  webglErrorText.textContent = t.webglError;
  if (!missionBanner.classList.contains('hidden')) missionBanner.textContent = t.missionBanner(missionIdx + 1);
  if (inFinal) renderFinalText();
  if (!inMenu && !inFinal) renderMissionUI();
}

muteBtn.addEventListener('click', () => {
  initAudio();
  muteBtn.textContent = toggleMute() ? '🔇' : '🔊';
  if (!isMuted()) playPop();
});

langBtn.addEventListener('click', () => {
  initAudio(); playPop();
  lang = lang === 'ar' ? 'en' : 'ar';
  applyLanguage();
});

speakBtn.addEventListener('click', () => {
  initAudio(); playPop();
  const copy = MISSIONS[missionIdx]?.[lang];
  if (copy) speakText(solvedCurrent ? copy.lesson : copy.title, lang);
});

['boy', 'girl'].forEach((h) => {
  const img = $(`img-${h}`);
  loadCutoutCanvas(HERO_IMAGES[h], (c) => { img.src = c.toDataURL('image/png'); }, () => { img.src = HERO_IMAGES[h]; });
});

const saved = loadSave();
if (saved && (saved.solved.length > 0 || saved.results.some(Boolean))) continueBtn.classList.remove('hidden');
applyLanguage();

const isSoftwareGl = (() => {
  try {
    const gl = document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const gpu = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch { return true; }
})();

let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: !isSoftwareGl, powerPreference: 'high-performance' }); }
catch { renderer = null; }
if (!renderer || !renderer.getContext()) {
  webglError.classList.remove('hidden'); menuOverlay.classList.add('hidden');
  throw new Error('WebGL unavailable');
}

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight, false);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb8c4cf);
scene.fog = new THREE.Fog(0xb8c4cf, 24, 58);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x7ca66d, 0.75);
const dirLight = new THREE.DirectionalLight(0xfff8e7, 0.55);
dirLight.position.set(10, 18, 12);
scene.add(hemiLight, dirLight);

const city = createCity(scene, hemiLight, dirLight);
const character = createCharacter(scene);
const homeTarget = new THREE.Vector3(0, 0.4, 0);
const camTarget = homeTarget.clone();
const _homeVec = new THREE.Vector3(), _toPos = new THREE.Vector3(), _toTarget = new THREE.Vector3();

function computeHomePose(orbit = 0, out = _homeVec) {
  const aspect = window.innerWidth / Math.max(window.innerHeight, 1);
  const dist = 24 * Math.max(1, 1.18 / aspect);
  const pitch = (35 * Math.PI) / 180, horiz = Math.cos(pitch) * dist;
  return out.set(Math.sin(orbit) * horiz, Math.sin(pitch) * dist, Math.cos(orbit) * horiz);
}

camera.position.copy(computeHomePose(0));
camera.lookAt(camTarget);

function startCamAnim(toPos, toTarget) {
  if (!camAnim) camAnim = { fromPos: new THREE.Vector3(), toPos: new THREE.Vector3(), fromTarget: new THREE.Vector3(), toTarget: new THREE.Vector3(), t: 0 };
  camAnim.fromPos.copy(camera.position); camAnim.toPos.copy(toPos);
  camAnim.fromTarget.copy(camTarget); camAnim.toTarget.copy(toTarget);
  camAnim.t = 0;
}

function flyTo(lotIndex) {
  const { position, angle } = getLotTransform(lotIndex);
  const aspect = window.innerWidth / Math.max(window.innerHeight, 1);
  const dist = aspect < 1 ? Math.min(10.5, 6.4 / Math.max(aspect, 0.55)) : 5.4;
  _toPos.set(Math.sin(angle) * (6.5 - dist), 2.9 + dist * 0.22, Math.cos(angle) * (6.5 - dist));
  _toTarget.set(position.x * 0.88, 0.75, position.z * 0.88);
  startCamAnim(_toPos, _toTarget);
}

function flyHome() { startCamAnim(computeHomePose(0), homeTarget); }

window.addEventListener('resize', () => {
  const w = window.innerWidth, h = Math.max(window.innerHeight, 1);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h, false);
});

function setCardsLocked(state) {
  locked = state;
  cardsRow.querySelectorAll('.choice-card').forEach((b) => b.classList.toggle('locked', state));
}

function flyStarToBar(slotIndex) {
  const star = document.createElement('span');
  star.className = 'flying-star'; star.textContent = '⭐';
  document.body.appendChild(star);
  const rect = starSlots[slotIndex].getBoundingClientRect();
  const sx = window.innerWidth / 2, sy = window.innerHeight * 0.44;
  const ex = rect.left + rect.width / 2, ey = rect.top + rect.height / 2;
  const cx = (sx + ex) / 2 + (ex > sx ? -60 : 60), cy = Math.min(sy, ey) - 90;
  const start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / 650, 1), u = 1 - t;
    star.style.left = `${u * u * sx + 2 * u * t * cx + t * t * ex}px`;
    star.style.top = `${u * u * sy + 2 * u * t * cy + t * t * ey}px`;
    star.style.transform = `translate(-50%, -50%) scale(${1.35 - t * 0.55})`;
    if (t < 1) requestAnimationFrame(step);
    else {
      star.remove();
      playStar();
      renderStars();
      starSlots[slotIndex].classList.add('pop');
      setTimeout(() => starSlots[slotIndex].classList.remove('pop'), 360);
    }
  }
  requestAnimationFrame(step);
}

function startMission(idx) {
  missionIdx = idx; solvedCurrent = false; lastWrongChoice = null;
  const m = MISSIONS[idx];
  missionTop.classList.add('hidden'); cardsRow.classList.add('hidden');
  lessonBar.classList.add('hidden'); whyLine.classList.add('hidden');

  missionBanner.textContent = TEXT[lang].missionBanner(idx + 1);
  missionBanner.classList.remove('hidden');
  playMission();

  setTimeout(() => {
    missionBanner.classList.add('hidden');
    flyTo(m.lot);
    character.walkTo(m.lot);
    city.lots[m.lot].setActiveProblem(true);

    currentOrder = [0, 1, 2];
    for (let i = 2; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [currentOrder[i], currentOrder[j]] = [currentOrder[j], currentOrder[i]];
    }
    cardsRow.innerHTML = '';
    currentOrder.forEach((choiceIdx) => {
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'choice-card';
      btn.innerHTML = '<span class="choice-emoji"></span><span class="choice-label"></span>';
      btn.addEventListener('click', () => handleChoice(btn, choiceIdx));
      cardsRow.appendChild(btn);
    });
    renderMissionUI();
    missionTop.classList.remove('hidden');
    cardsRow.classList.remove('hidden');
    setCardsLocked(true);
    speakText(m[lang].title, lang);
    setTimeout(() => { if (!solvedCurrent) setCardsLocked(false); }, 850);
  }, 820);
}

function handleChoice(btn, choiceIdx) {
  if (locked || solvedCurrent || btn.disabled) return;
  setCardsLocked(true);
  btn.disabled = true;
  initAudio(); playPop();
  btn.classList.add('squash');
  const m = MISSIONS[missionIdx];
  const choice = m[lang].choices[choiceIdx];

  if (choice[2]) {
    solvedCurrent = true;
    whyLine.classList.add('hidden');
    playCorrect();
    setTimeout(playBuildPop, 180);
    try { navigator.vibrate?.(30); } catch {}
    fovPunch = 1;
    city.lots[m.lot].solve();
    city.lots[m.lot].setMood(1);
    city.jumpPeople(3, 1.4);
    character.celebrate();
    if (!solved.includes(missionIdx)) solved.push(missionIdx);
    const earnedStar = results[missionIdx] !== 'lost';
    if (earnedStar) results[missionIdx] = 'star';
    city.setSolvedCount(solved.length);
    writeSave();
    if (earnedStar) flyStarToBar(missionIdx);
    setTimeout(() => {
      cardsRow.classList.add('hidden');
      lessonBar.classList.remove('hidden');
      speakText(m[lang].lesson, lang);
    }, 280);
  } else {
    lastWrongChoice = choiceIdx;
    const whyText = choice[3] || '';
    whyLine.textContent = whyText;
    whyLine.classList.remove('hidden');
    playWrong();
    speakText(whyText, lang);
    camShake = 0.35;
    character.shake();
    city.lots[m.lot].wrong(choice[4]);
    if (results[missionIdx] === null) {
      results[missionIdx] = 'lost';
      writeSave();
      renderStars();
      starSlots[missionIdx].classList.add('crack');
      setTimeout(() => starSlots[missionIdx].classList.remove('crack'), 460);
    }
    setTimeout(() => {
      btn.classList.remove('squash'); btn.classList.add('wrong');
      if (!solvedCurrent) setCardsLocked(false);
    }, 220);
  }
}

function showFinal() {
  inFinal = true;
  city.setCityMood(1);
  city.setSolvedCount(9);
  city.jumpPeople(15, 999);
  character.walkHome();
  character.setFinalJump(true);
  flyHome();
  playFinal();
  renderFinalText();
  missionTop.classList.add('hidden'); cardsRow.classList.add('hidden'); lessonBar.classList.add('hidden');
  finalOverlay.classList.remove('hidden', 'fade-out');
}

nextBtn.addEventListener('click', () => {
  initAudio(); playPop();
  city.setCityMood(solved.length / 9);
  if (missionIdx + 1 < MISSIONS.length) startMission(missionIdx + 1);
  else showFinal();
});

function beginGame(resume = false) {
  inMenu = false; inFinal = false;
  menuOverlay.classList.add('fade-out');
  setTimeout(() => menuOverlay.classList.add('hidden'), 280);
  starBar.classList.remove('hidden');
  character.setHero(hero);
  if (resume) {
    solved.forEach((idx) => { city.lots[idx].solve(true); city.lots[idx].setMood(1, true); });
    city.setCityMood(solved.length / 9);
    city.setSolvedCount(solved.length);
    renderStars();
    const nextIdx = MISSIONS.findIndex((_, i) => !solved.includes(i));
    if (nextIdx === -1) showFinal(); else startMission(nextIdx);
  } else {
    solved = []; results = Array(9).fill(null);
    city.setSolvedCount(0); renderStars(); writeSave(); startMission(0);
  }
}

document.querySelectorAll('.hero-card').forEach((card) => {
  card.addEventListener('click', () => {
    if (picked) return;
    initAudio(); playPop();
    picked = true; hero = card.getAttribute('data-hero') || 'boy';
    card.classList.add('pop');
    setTimeout(() => beginGame(false), 260);
  });
});

continueBtn.addEventListener('click', () => {
  const s = loadSave();
  if (picked || !s) return;
  initAudio(); playPop();
  picked = true; hero = s.hero || 'boy'; solved = [...s.solved]; results = [...s.results];
  beginGame(true);
});

restartBtn.addEventListener('click', () => {
  initAudio(); playPop();
  clearSave(); solved = []; results = Array(9).fill(null); missionIdx = 0; inFinal = false; picked = false; inMenu = true;
  city.resetAll(); character.reset(); renderStars();
  finalOverlay.classList.add('hidden'); starBar.classList.add('hidden'); continueBtn.classList.add('hidden');
  menuOverlay.classList.remove('hidden', 'fade-out');
  document.querySelectorAll('.hero-card').forEach((c) => c.classList.remove('pop'));
  flyHome();
});

let lastTime = performance.now(), elapsed = 0, paused = document.hidden, rafId = 0, timerId = 0;
document.addEventListener('visibilitychange', () => {
  paused = document.hidden;
  if (paused) { cancelAnimationFrame(rafId); clearTimeout(timerId); }
  else { lastTime = performance.now(); tick(); }
});

function afterDraw(cb) {
  const gl = renderer.getContext();
  const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
  gl.flush();
  const poll = () => {
    if (sync && gl.getSyncParameter(sync, gl.SYNC_STATUS) === gl.UNSIGNALED) timerId = window.setTimeout(poll, 5);
    else { if (sync) gl.deleteSync(sync); timerId = window.setTimeout(cb, 80); }
  };
  timerId = window.setTimeout(poll, 5);
}

function tick() {
  if (paused) return;
  const now = performance.now();
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now; elapsed += dt;

  if (inMenu || (inFinal && !camAnim)) {
    menuOrbit += dt * 0.16;
    computeHomePose(menuOrbit, camera.position);
    camera.lookAt(homeTarget);
  } else if (camAnim) {
    camAnim.t = Math.min(camAnim.t + dt / 1.2, 1);
    const p = camAnim.t, ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    camera.position.lerpVectors(camAnim.fromPos, camAnim.toPos, ease);
    camTarget.lerpVectors(camAnim.fromTarget, camAnim.toTarget, ease);
    camera.lookAt(camTarget);
    if (p >= 1) camAnim = null;
  }

  if (fovPunch > 0) {
    fovPunch = Math.max(0, fovPunch - dt * 2.2);
    camera.fov = 50 + Math.sin(fovPunch * Math.PI) * 4.5;
    camera.updateProjectionMatrix();
  }

  city.update(elapsed, dt);
  character.update(dt, camera);

  if (camShake > 0) {
    camShake = Math.max(0, camShake - dt);
    const ox = Math.sin(elapsed * 55) * 0.16 * (camShake / 0.35);
    camera.position.x += ox;
    renderer.render(scene, camera);
    camera.position.x -= ox;
  } else {
    renderer.render(scene, camera);
  }

  if (isSoftwareGl) afterDraw(tick);
  else rafId = requestAnimationFrame(tick);
}

if (!paused) tick();
