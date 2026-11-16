import * as THREE from 'three';
import { getLotTransform } from './city.js';
import { HERO_IMAGES } from './text.js';

export function loadCutoutCanvas(url, cb, onErr) {
  const img = new Image();
  img.onload = () => {
    const w = img.naturalWidth || 256, h = img.naturalHeight || 256;
    const scale = Math.min(1, 320 / Math.max(w, h));
    const cw = Math.max(1, Math.round(w * scale)), ch = Math.max(1, Math.round(h * scale));
    const c = document.createElement('canvas');
    c.width = cw; c.height = ch;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, cw, ch);
    const data = ctx.getImageData(0, 0, cw, ch);
    const px = data.data, vis = new Uint8Array(cw * ch), q = new Int32Array(cw * ch);
    let head = 0, tail = 0;
    const push = (idx) => { if (!vis[idx]) { vis[idx] = 1; q[tail++] = idx; } };
    for (let x = 0; x < cw; x++) { push(x); push((ch - 1) * cw + x); }
    for (let y = 0; y < ch; y++) { push(y * cw); push(y * cw + cw - 1); }
    while (head < tail) {
      const idx = q[head++], p = idx * 4;
      if (px[p] > 230 && px[p + 1] > 230 && px[p + 2] > 230) {
        px[p + 3] = 0;
        const x = idx % cw, y = (idx / cw) | 0;
        if (x > 0) push(idx - 1);
        if (x + 1 < cw) push(idx + 1);
        if (y > 0) push(idx - cw);
        if (y + 1 < ch) push(idx + cw);
      }
    }
    ctx.putImageData(data, 0, 0);
    let minX = cw, minY = ch, maxX = 0, maxY = 0;
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
      if (px[(y * cw + x) * 4 + 3] > 10) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
    if (maxX <= minX || maxY <= minY) { cb(c); return; }
    const tw = maxX - minX + 1, th = maxY - minY + 1;
    const out = document.createElement('canvas');
    out.width = tw; out.height = th;
    out.getContext('2d').drawImage(c, minX, minY, tw, th, 0, 0, tw, th);
    cb(out);
  };
  img.onerror = onErr;
  img.src = url;
}

export function createCharacter(scene) {
  const root = new THREE.Group();
  root.position.set(0, 0.06, 1.55);
  root.visible = false;
  scene.add(root);

  const shadowGeo = new THREE.CircleGeometry(0.45, 20);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadow = new THREE.Mesh(
    shadowGeo,
    new THREE.MeshBasicMaterial({ color: 0x1a2634, transparent: true, opacity: 0.26, depthWrite: false }),
  );
  shadow.position.y = 0.02;
  root.add(shadow);

  const visual = new THREE.Group();
  root.add(visual);

  const planeMat = new THREE.MeshBasicMaterial({ transparent: true, alphaTest: 0.1, side: THREE.DoubleSide });
  const spriteMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.6), planeMat);
  spriteMesh.position.y = 0.8;
  visual.add(spriteMesh);

  const fallback = new THREE.Group();
  const bodyMat = new THREE.MeshLambertMaterial({ color: 0x4aa8ff });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 0.62, 6, 12), bodyMat);
  body.position.y = 0.56;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 12), new THREE.MeshLambertMaterial({ color: 0xffd5b5 }));
  head.position.y = 1.24;
  fallback.add(body, head);
  fallback.visible = false;
  visual.add(fallback);

  const walkFrom = new THREE.Vector3(), walkToPos = new THREE.Vector3();
  let activeTex = null, walking = false, walkT = 0, shakeT = 0, celebT = 0, finalJump = false, idleT = 0;

  function setHero(hero) {
    root.visible = true;
    bodyMat.color.setHex(hero === 'girl' ? 0xff749b : 0x4aa8ff);
    spriteMesh.visible = false;
    fallback.visible = true;
    loadCutoutCanvas(
      HERO_IMAGES[hero] || HERO_IMAGES.boy,
      (cutout) => {
        if (activeTex) activeTex.dispose();
        const tex = new THREE.CanvasTexture(cutout);
        tex.colorSpace = THREE.SRGBColorSpace;
        activeTex = tex;
        spriteMesh.scale.set((1.6 * (cutout.width / cutout.height)) / 1.2, 1, 1);
        planeMat.map = tex;
        planeMat.needsUpdate = true;
        spriteMesh.visible = true;
        fallback.visible = false;
      },
      () => { spriteMesh.visible = false; fallback.visible = true; },
    );
  }

  function startWalk(x, z) {
    walkFrom.copy(root.position);
    walkToPos.set(x, 0.06, z);
    walkT = 0;
    walking = true;
  }

  function walkTo(lotIndex) {
    const { front } = getLotTransform(lotIndex);
    startWalk(front.x, front.z);
  }
  function walkHome() { startWalk(0, 1.55); }
  function shake() { shakeT = 0.55; }
  function celebrate() { celebT = 0.85; }
  function setFinalJump(v) { finalJump = v; }
  function reset() {
    root.position.set(0, 0.06, 1.55);
    walking = false; walkT = 0; shakeT = 0; celebT = 0; finalJump = false;
    visual.position.set(0, 0, 0); visual.rotation.set(0, 0, 0); visual.scale.set(1, 1, 1);
  }

  function update(dt, camera) {
    if (!root.visible) return;
    idleT += dt;
    let spin = 0;

    if (walking) {
      walkT = Math.min(walkT + dt, 1);
      const ease = walkT < 0.5 ? 2 * walkT * walkT : 1 - Math.pow(-2 * walkT + 2, 2) / 2;
      root.position.lerpVectors(walkFrom, walkToPos, ease);
      const hop = Math.abs(Math.sin(walkT * Math.PI * 4)) * 0.28;
      visual.position.set(0, hop, 0);
      visual.rotation.z = Math.sin(walkT * Math.PI * 4) * 0.09;
      visual.scale.set(1 - hop * 0.16, 1 + hop * 0.22, 1);
      shadow.scale.setScalar(1 - hop * 0.45);
      if (walkT >= 1) { walking = false; visual.rotation.z = 0; shadow.scale.setScalar(1); }
    } else if (celebT > 0) {
      celebT = Math.max(0, celebT - dt);
      const p = 1 - celebT / 0.85;
      const arc = Math.sin(p * Math.PI);
      const sq = p < 0.14 ? 1 - p * 1.4 : p > 0.86 ? 1 - (1 - p) * 1.4 : 1 + arc * 0.18;
      visual.position.set(0, arc * 0.72, 0);
      visual.scale.set(2 - sq, sq, 1);
      visual.rotation.z = 0;
      spin = p * Math.PI * 2;
      shadow.scale.setScalar(1 - arc * 0.42);
      if (celebT === 0) { visual.position.y = 0; visual.scale.set(1, 1, 1); shadow.scale.setScalar(1); }
    } else if (shakeT > 0) {
      shakeT = Math.max(0, shakeT - dt);
      const p = shakeT / 0.55;
      visual.position.set(Math.sin(p * Math.PI * 6) * 0.15, -Math.sin(p * Math.PI) * 0.14, 0);
      visual.rotation.z = Math.sin(p * Math.PI * 6) * 0.14;
      visual.scale.set(1.08, 0.92, 1);
      if (shakeT === 0) { visual.position.set(0, 0, 0); visual.rotation.z = 0; visual.scale.set(1, 1, 1); }
    } else if (finalJump) {
      const h = Math.abs(Math.sin(idleT * 6.5)) * 0.44;
      visual.position.set(0, h, 0);
      visual.scale.set(1 - h * 0.14, 1 + h * 0.18, 1);
      shadow.scale.setScalar(1 - h * 0.35);
    } else {
      const b = Math.sin(idleT * 2.6);
      visual.position.set(0, b * 0.035 + 0.035, 0);
      visual.scale.set(1 - b * 0.015, 1 + b * 0.025, 1);
      visual.rotation.z = 0;
      shadow.scale.setScalar(1);
    }

    visual.rotation.y = Math.atan2(camera.position.x - root.position.x, camera.position.z - root.position.z) + spin;
  }

  return { setHero, walkTo, walkHome, shake, celebrate, setFinalJump, reset, update };
}
