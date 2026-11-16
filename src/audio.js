let ctx = null;
let master = null;
let noiseBuf = null;
let muted = false;
let bgTimer = 0;
let bgStep = 0;
const MELODY = [523, 659, 587, 784, 659, 587, 523, 392];

function ensureCtx() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : 1;
  master.connect(ctx.destination);
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  startBgLoop();
  return ctx;
}

function tone(freq, dur, type = 'sine', vol = 0.14, delay = 0, endFreq = null) {
  const c = ensureCtx();
  if (!c || muted) return;
  const t = c.currentTime + delay;
  const osc = c.createOscillator(), g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
  g.gain.setValueAtTime(0.001, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(g); g.connect(master);
  osc.start(t); osc.stop(t + dur + 0.02);
}

function startBgLoop() {
  if (bgTimer) return;
  bgTimer = window.setInterval(() => {
    if (!ctx || muted || document.hidden || ctx.state !== 'running') return;
    tone(MELODY[bgStep % MELODY.length], 0.34, 'sine', 0.024);
    bgStep++;
  }, 520);
}

export function initAudio() { ensureCtx(); }

export function toggleMute() {
  muted = !muted;
  if (master && ctx) master.gain.setValueAtTime(muted ? 0 : 1, ctx.currentTime);
  if (muted) try { window.speechSynthesis?.cancel(); } catch {}
  return muted;
}

export function isMuted() { return muted; }

export function playPop() { tone(420, 0.08, 'sine', 0.12, 0, 780); }

export function playBuildPop() { tone(240, 0.11, 'sine', 0.14, 0, 580); }

export function playStar() {
  tone(1320, 0.22, 'triangle', 0.14, 0);
  tone(1980, 0.28, 'sine', 0.1, 0.06);
}

export function playCorrect() {
  [523, 659, 784].forEach((f, i) => tone(f, 0.18, 'triangle', 0.14, i * 0.09));
}

export function playWrong() { tone(210, 0.2, 'sine', 0.12, 0, 145); }

export function playFinal() {
  [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.28, 'triangle', 0.14, i * 0.11));
}

export function playMission() {
  const c = ensureCtx();
  if (!c || muted) return;
  for (let i = 0; i < 6; i++) tone(130 + i * 14, 0.055, 'triangle', 0.08, i * 0.055, 95);
  if (!noiseBuf) return;
  const src = c.createBufferSource(), filt = c.createBiquadFilter(), g = c.createGain();
  src.buffer = noiseBuf;
  filt.type = 'bandpass';
  const t = c.currentTime + 0.24;
  filt.frequency.setValueAtTime(300, t);
  filt.frequency.exponentialRampToValueAtTime(1600, t + 0.25);
  g.gain.setValueAtTime(0.001, t);
  g.gain.linearRampToValueAtTime(0.11, t + 0.08);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.34);
  src.connect(filt); filt.connect(g); g.connect(master);
  src.start(t); src.stop(t + 0.36);
}

export function speakText(text, lang) {
  if (muted || !text) return;
  try {
    const synth = window.speechSynthesis;
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') return;
    const voices = synth.getVoices ? synth.getVoices() : [];
    const prefix = lang === 'ar' ? 'ar' : 'en';
    if (voices.length > 0 && !voices.some((v) => v.lang?.toLowerCase().startsWith(prefix))) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
    u.rate = 0.96;
    synth.speak(u);
  } catch {}
}
