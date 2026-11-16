import * as THREE from 'three';

const SAD_SKY = new THREE.Color(0xb8c4cf);
const HAPPY_SKY = new THREE.Color(0x7fd4ff);
const GREY_60 = new THREE.Color(0x999999);
const CONFETTI_COLORS = [0xff595e, 0xffca3a, 0x8ac926, 0x1982c4, 0xc77dff];

export function getLotTransform(i) {
  const angle = (i * 40 * Math.PI) / 180;
  const x = Math.sin(angle) * 6.5, z = Math.cos(angle) * 6.5;
  return { angle, position: new THREE.Vector3(x, 0, z), front: new THREE.Vector3(Math.sin(angle) * 4.4, 0, Math.cos(angle) * 4.4), rotY: Math.atan2(-x, -z) };
}

function makeBadgeCanvas(txt, bg, fg, w = 256, h = 128) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  if (bg) {
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.roundRect(8, 8, w - 16, h - 16, 28); ctx.fill();
    ctx.lineWidth = 8; ctx.strokeStyle = '#ffffff'; ctx.stroke();
  }
  ctx.fillStyle = fg;
  ctx.font = `800 ${Math.round(h * 0.48)}px sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(txt, w / 2, h / 2 + 2);
  return c;
}

function makeSprite(txt, bg, fg, sx = 0.9, sy = 0.45, w = 256, h = 128) {
  const tex = new THREE.CanvasTexture(makeBadgeCanvas(txt, bg, fg, w, h));
  tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
  sp.scale.set(sx, sy, 1);
  return { sp, tex };
}

function updateSpriteText(obj, txt, bg, fg, w = 256, h = 128) {
  const ctx = obj.tex.image.getContext('2d');
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(makeBadgeCanvas(txt, bg, fg, w, h), 0, 0);
  obj.tex.needsUpdate = true;
}

export function createCity(scene, hemiLight, dirLight) {
  const box = new THREE.BoxGeometry(1, 1, 1), cyl = new THREE.CylinderGeometry(1, 1, 1, 14);
  const cone = new THREE.ConeGeometry(1, 1, 10), sphere = new THREE.SphereGeometry(1, 10, 8);
  const cap = new THREE.CapsuleGeometry(0.14, 0.24, 4, 8);
  const mat = (c, o) => new THREE.MeshLambertMaterial({ color: c, ...o });
  const mGrass = mat(0x8be07b), mSand = mat(0xf4d58d), mPlaza = mat(0xf6efe2), mPad = mat(0xe8dfd1);
  const mTrunk = mat(0x9b6b43), mLeaf1 = mat(0x5bc96f), mLeaf2 = mat(0x76db7a), mCloud = mat(0xffffff);
  const mWater = mat(0x6cd4ff), mSkin = mat(0xffd5b5), mSmoke = mat(0xf1f5f9, { transparent: true, opacity: 0.85 });
  const mDarkCloud = mat(0x64748b);

  const part = (g, m, sx, sy, sz, x, y, z, rx = 0, ry = 0) => {
    const mesh = new THREE.Mesh(g, m);
    mesh.scale.set(sx, sy, sz); mesh.position.set(x, y, z);
    if (rx || ry) mesh.rotation.set(rx, ry, 0);
    return mesh;
  };

  scene.add(
    part(new THREE.CylinderGeometry(10.1, 9.4, 0.45, 42), mSand, 1, 1, 1, 0, -0.58, 0),
    part(new THREE.CylinderGeometry(10, 9.6, 0.7, 42), mGrass, 1, 1, 1, 0, -0.35, 0),
    part(new THREE.CylinderGeometry(3.2, 3.25, 0.08, 32), mPlaza, 1, 1, 1, 0, 0.04, 0),
  );
  const fountainTop = part(sphere, mWater, 0.34, 0.24, 0.34, 0, 0.94, 0);
  scene.add(part(cyl, mPad, 1.05, 0.24, 1.05, 0, 0.2, 0), part(cyl, mWater, 0.88, 0.16, 0.88, 0, 0.25, 0), part(cyl, mPlaza, 0.22, 0.72, 0.22, 0, 0.52, 0), fountainTop);

  for (let i = 0; i < 8; i++) {
    const a = ((20 + i * 40) * Math.PI) / 180;
    const tree = new THREE.Group();
    tree.position.set(Math.sin(a) * 8.95, 0, Math.cos(a) * 8.95);
    tree.scale.setScalar(0.88 + (i % 3) * 0.12);
    tree.add(part(cyl, mTrunk, 0.16, 0.75, 0.16, 0, 0.37, 0), part(cone, mLeaf1, 0.72, 1.05, 0.72, 0, 1.05, 0), part(cone, mLeaf2, 0.52, 0.82, 0.52, 0, 1.55, 0));
    scene.add(tree);
  }

  // Plaza truck & edge towers
  const plazaTruck = new THREE.Group();
  plazaTruck.add(part(box, mat(0xef476f), 0.55, 0.34, 0.34, 0, 0.24, 0), part(box, mat(0xffd166), 0.24, 0.28, 0.32, 0.34, 0.2, 0), part(cyl, mat(0x2b2d42), 0.1, 0.38, 0.1, -0.15, 0.1, 0, Math.PI / 2), part(cyl, mat(0x2b2d42), 0.1, 0.38, 0.1, 0.2, 0.1, 0, Math.PI / 2));
  plazaTruck.visible = false;
  scene.add(plazaTruck);

  const edgeTowers = new THREE.Group();
  edgeTowers.add(part(box, mat(0x90dbf4), 0.9, 2.5, 0.9, -4.8, 1.25, -7.2), part(box, mat(0xffafcc), 0.8, 2.1, 0.8, -3.6, 1.05, -7.8));
  edgeTowers.scale.y = 0.01; edgeTowers.visible = false;
  scene.add(edgeTowers);

  // Birds & extra city cars (unlocked after mission 5)
  const birds = [0, 1, 2].map((i) => {
    const b = new THREE.Group();
    b.add(part(box, mCloud, 0.36, 0.06, 0.12, -0.16, 0, 0, 0, 0.2), part(box, mCloud, 0.36, 0.06, 0.12, 0.16, 0, 0, 0, -0.2));
    b.visible = false; scene.add(b);
    return { g: b, angle: i * 2.1, r: 4.5 + i * 1.4, y: 4.8 + i * 0.6 };
  });
  const cityCars = [0x4cc9f0, 0xffd166].map((c, i) => {
    const cg = new THREE.Group();
    cg.add(part(box, mat(c), 0.48, 0.22, 0.28, 0, 0.16, 0), part(box, mCloud, 0.24, 0.16, 0.24, 0, 0.32, 0));
    cg.visible = false; scene.add(cg);
    return { g: cg, angle: i * Math.PI, r: 3.7 };
  });

  // Pooled particles: 20 gold sparkles + 30 confetti + 8 grey puffs = 58 (< 80 max)
  const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });
  const sparkGeo = new THREE.OctahedronGeometry(0.11, 0);
  const sparkles = Array.from({ length: 20 }, () => {
    const m = new THREE.Mesh(sparkGeo, sparkMat); m.visible = false; scene.add(m);
    return { m, vx: 0, vy: 0, vz: 0, life: 0 };
  });
  const confMats = CONFETTI_COLORS.map((c) => new THREE.MeshBasicMaterial({ color: c }));
  const confGeo = new THREE.BoxGeometry(0.14, 0.04, 0.14);
  const confetti = Array.from({ length: 30 }, (_, idx) => {
    const m = new THREE.Mesh(confGeo, confMats[idx % confMats.length]); m.visible = false; scene.add(m);
    return { m, vx: 0, vy: 0, vz: 0, rx: 0, ry: 0, life: 0 };
  });
  const puffMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
  const puffs = Array.from({ length: 8 }, () => {
    const m = new THREE.Mesh(sphere, puffMat); m.visible = false; scene.add(m);
    return { m, vx: 0, vy: 0, vz: 0, life: 0 };
  });

  function spawnSolveParticles(lotIndex) {
    const { position } = getLotTransform(lotIndex);
    for (let i = 0; i < sparkles.length; i++) {
      const p = sparkles[i], a = (i / sparkles.length) * Math.PI * 2;
      p.m.position.set(position.x, 1.4, position.z); p.m.visible = true;
      p.vx = Math.cos(a) * (1.2 + (i % 3) * 0.5); p.vy = 2.6 + (i % 4) * 0.6; p.vz = Math.sin(a) * (1.2 + (i % 3) * 0.5);
      p.life = 1.6;
    }
    for (let i = 0; i < confetti.length; i++) {
      const p = confetti[i], a = (i * 2.399) % 6.28;
      p.m.position.set(position.x + Math.cos(a) * 0.4, 2.7 + (i % 5) * 0.25, position.z + Math.sin(a) * 0.4);
      p.m.visible = true;
      p.vx = Math.cos(a) * (0.9 + (i % 3) * 0.4); p.vy = 1.4 + (i % 4) * 0.4; p.vz = Math.sin(a) * (0.9 + (i % 3) * 0.4);
      p.rx = 4 + (i % 3) * 2; p.ry = 5 + (i % 4) * 2; p.life = 2.0;
    }
  }

  function spawnWrongPuffs(lotIndex) {
    const { position } = getLotTransform(lotIndex);
    for (let i = 0; i < puffs.length; i++) {
      const p = puffs[i], a = (i / puffs.length) * Math.PI * 2;
      p.m.position.set(position.x, 1.5, position.z); p.m.scale.setScalar(0.22); p.m.visible = true;
      p.vx = Math.cos(a) * 1.1; p.vy = 0.8 + (i % 2) * 0.4; p.vz = Math.sin(a) * 1.1; p.life = 0.85;
    }
  }

  const ringGeo = new THREE.RingGeometry(1.45, 1.72, 28);
  ringGeo.rotateX(-Math.PI / 2);
  const padGeo = new THREE.CylinderGeometry(1.5, 1.55, 0.06, 20);
  const lots = [], lotGroups = [];
  let truckActive = false, truckAngle = 0, towerGrow = 0, extraLife = false;

  for (let i = 0; i < 9; i++) {
    const { position, rotY } = getLotTransform(i);
    const group = new THREE.Group();
    group.position.copy(position); group.rotation.y = rotY; group.userData.lotIndex = i;
    group.add(part(padGeo, mPad, 1, 1, 1, 0, 0.03, 0));

    const tracked = [], probGrp = new THREE.Group(), solveGrp = new THREE.Group();
    solveGrp.visible = false;
    group.add(probGrp, solveGrp);

    // Problem indicators: pulsing red ring, bouncing "!" bubble, small dark cloud
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xef476f, transparent: true, opacity: 0.75, depthWrite: false });
    const redRing = new THREE.Mesh(ringGeo, ringMat);
    redRing.position.y = 0.07; redRing.visible = false;
    const alertBubble = makeSprite('!', '#ef476f', '#ffffff', 0.65, 0.65, 128, 128).sp;
    alertBubble.position.set(0, 2.55, 0); alertBubble.visible = false;
    const darkCloud = new THREE.Group();
    darkCloud.add(part(sphere, mDarkCloud, 0.45, 0.24, 0.3, 0, 0, 0), part(sphere, mDarkCloud, 0.32, 0.2, 0.25, -0.3, -0.04, 0), part(sphere, mDarkCloud, 0.3, 0.2, 0.25, 0.3, -0.04, 0));
    darkCloud.position.set(0.55, 2.45, -0.2); darkCloud.visible = false;
    group.add(redRing, alertBubble, darkCloud);

    const lotMat = (hex, extra) => {
      const happy = new THREE.Color(hex), sad = happy.clone().lerp(GREY_60, 0.85);
      const m = mat(sad.clone(), extra); tracked.push({ m, sad, happy }); return m;
    };
    const add = (g, m, sx, sy, sz, x, y, z, rx = 0, ry = 0, parent = group) => {
      const mesh = part(g, m, sx, sy, sz, x, y, z, rx, ry);
      mesh.userData.lotIndex = i; parent.add(mesh); return mesh;
    };

    let onSolve = () => {}, onReset = () => {}, onTick = () => {}, onWrong = () => {};

    if (i === 0) {
      const w = lotMat(0xf4a261), r = lotMat(0x52b788), tr = lotMat(0xffe169), p = lotMat(0xe76f51);
      add(box, w, 1.75, 1.15, 1.35, 0, 0.62, 0); add(box, r, 1.85, 0.2, 1.45, 0, 1.28, 0);
      add(cyl, p, 0.16, 0.9, 0.16, -0.48, 1.75, -0.25); add(cyl, p, 0.14, 0.72, 0.14, 0.35, 1.66, -0.25);
      add(box, tr, 0.45, 0.6, 0.08, 0, 0.35, 0.68);
      add(box, mat(0x9ca3af), 0.46, 0.28, 0.28, -0.65, 0.2, 1.05, 0, 0, probGrp);
      add(box, mat(0x9ca3af), 0.46, 0.28, 0.28, 0.65, 0.2, 1.05, 0, 0, probGrp);
      const smokes = [0, 1, 2].map((k) => add(sphere, mSmoke, 0.22, 0.22, 0.22, -0.48, 2.3 + k * 0.3, -0.25, 0, 0, solveGrp));
      const gdpBar = add(box, mat(0x52b788), 0.32, 1.4, 0.32, 1.15, 0.75, 0.2, 0, 0, solveGrp);
      const gdpTag = makeSprite('GDP ⬆', '#52b788', '#ffffff', 1.1, 0.5).sp;
      gdpTag.position.set(1.15, 1.85, 0.2); solveGrp.add(gdpTag);
      onSolve = () => { gdpBar.scale.y = 0.1; truckActive = true; plazaTruck.visible = true; };
      onReset = () => { truckActive = false; plazaTruck.visible = false; };
      onTick = (t, dt) => {
        gdpBar.scale.y = THREE.MathUtils.lerp(gdpBar.scale.y, 1.4, Math.min(dt * 3, 1));
        gdpBar.position.y = gdpBar.scale.y * 0.5 + 0.06;
        smokes.forEach((s, idx) => { const f = (t * 0.9 + idx * 0.33) % 1; s.position.y = 2.25 + f * 0.9; s.scale.setScalar(0.18 + f * 0.18); });
      };
    } else if (i === 1) {
      const w = lotMat(0xffafcc), r = lotMat(0xffd6e0);
      add(box, w, 1.5, 1.1, 1.3, 0, 0.6, 0); add(box, r, 1.68, 0.22, 1.55, 0, 1.22, 0.08);
      add(cone, lotMat(0xf4c07a), 0.36, 0.65, 0.36, 0, 1.65, 0, Math.PI);
      add(sphere, lotMat(0x80ed99), 0.34, 0.34, 0.34, 0, 2.02, 0); add(box, r, 0.46, 0.58, 0.08, 0, 0.34, 0.66);
      const priceTag = makeSprite('$1', '#fff3b0', '#e63946', 0.95, 0.55);
      priceTag.sp.position.set(0, 2.6, 0); group.add(priceTag.sp);
      // Mini bank booth beside shop + people dropping coins in
      add(box, mat(0xfff1d0), 0.72, 0.68, 0.58, 1.05, 0.38, 0.35, 0, 0, solveGrp);
      add(cone, mat(0x4cc9f0), 0.56, 0.32, 0.56, 1.05, 0.88, 0.35, 0, Math.PI / 4, solveGrp);
      const bankSign = makeSprite('🏦', '#ffffff', '#264653', 0.42, 0.42, 96, 96).sp;
      bankSign.position.set(1.05, 1.25, 0.35); solveGrp.add(bankSign);
      const savers = [0, 1, 2].map((c) => {
        const sg = new THREE.Group();
        sg.add(part(cap, mat(0x4cc9f0), 0.82, 0.82, 0.82, 0, 0.28, 0), part(sphere, mSkin, 0.12, 0.12, 0.12, 0, 0.58, 0));
        const coin = part(cyl, sparkMat, 0.08, 0.03, 0.08, 0.14, 0.55, 0, Math.PI / 2);
        sg.add(coin); solveGrp.add(sg);
        return { sg, coin, startX: -0.7 + c * 0.35, startZ: 1.05 };
      });
      let balloonT = 0, solvedFlag = false, lastDollar = 1, bankT = 0;
      onWrong = (kind) => { if (kind === 'inflate') balloonT = 1.4; };
      onSolve = () => { solvedFlag = true; balloonT = 0; bankT = 0; priceTag.sp.scale.set(0.78, 0.44, 1); updateSpriteText(priceTag, '$2', '#d8f3dc', '#2d6a4f'); };
      onReset = () => { solvedFlag = false; balloonT = 0; bankT = 0; lastDollar = 1; priceTag.sp.scale.set(0.95, 0.55, 1); updateSpriteText(priceTag, '$1', '#fff3b0', '#e63946'); };
      onTick = (t, dt) => {
        if (!solvedFlag) {
          const val = 1 + (Math.floor(t * 1.4) % 5);
          if (val !== lastDollar) { lastDollar = val; updateSpriteText(priceTag, `$${val}`, '#fff3b0', '#e63946'); }
          if (balloonT > 0) { balloonT = Math.max(0, balloonT - dt); const b = 1 + Math.sin(balloonT * 2.2) * 0.9; priceTag.sp.scale.set(0.95 * b, 0.55 * b, 1); }
          else priceTag.sp.scale.set(0.95, 0.55, 1);
        } else {
          bankT = (bankT + dt * 0.65) % 1;
          savers.forEach((sv, idx) => {
            const p = (bankT + idx * 0.3) % 1;
            sv.sg.position.set(THREE.MathUtils.lerp(sv.startX, 0.85, p), Math.abs(Math.sin(p * Math.PI * 3)) * 0.08, THREE.MathUtils.lerp(sv.startZ, 0.65, p));
            sv.coin.visible = p < 0.85;
            sv.coin.position.y = p > 0.65 ? 0.55 - (p - 0.65) * 1.2 : 0.55;
          });
        }
      };
    } else if (i === 2) {
      const wd = lotMat(0xd4a373), winMat = mat(0x475569);
      add(box, lotMat(0x64dfdf), 1.55, 1.05, 1.2, 0, 0.58, -0.15);
      add(cone, lotMat(0xe76f51), 1.25, 0.65, 1.25, 0, 1.42, -0.15, 0, Math.PI / 4);
      add(box, winMat, 0.38, 0.32, 0.08, -0.42, 0.68, 0.46); add(box, winMat, 0.38, 0.32, 0.08, 0.42, 0.68, 0.46);
      add(box, wd, 0.95, 0.12, 0.42, 0, 0.44, 0.78); add(box, wd, 0.12, 0.38, 0.34, -0.36, 0.22, 0.78); add(box, wd, 0.12, 0.38, 0.34, 0.36, 0.22, 0.78);
      const workers = [-0.36, -0.12, 0.12, 0.36].map((wx) => {
        const wg = new THREE.Group(); wg.position.set(wx, 0.48, 0.8);
        wg.add(part(cap, mat(0x9ca3af), 0.75, 0.75, 0.75, 0, 0.18, 0), part(sphere, mSkin, 0.11, 0.11, 0.11, 0, 0.46, 0));
        const hat = part(sphere, mat(0xffd166), 0.13, 0.08, 0.13, 0, 0.56, 0); hat.visible = false; wg.add(hat);
        group.add(wg); return { wg, hat, wx };
      });
      let walkT = 0, solvedFlag = false;
      onSolve = () => { solvedFlag = true; walkT = 0; winMat.color.setHex(0xffe169); workers.forEach((w) => { w.hat.visible = true; }); };
      onReset = () => { solvedFlag = false; winMat.color.setHex(0x475569); workers.forEach((w) => { w.hat.visible = false; w.wg.visible = true; w.wg.position.set(w.wx, 0.48, 0.8); }); };
      onTick = (t, dt) => {
        if (solvedFlag && walkT < 1) {
          walkT = Math.min(1, walkT + dt * 0.9);
          workers.forEach((w) => { w.wg.position.z = THREE.MathUtils.lerp(0.8, 0.1, walkT); w.wg.position.y = THREE.MathUtils.lerp(0.48, 0.12, walkT); if (walkT >= 1) w.wg.visible = false; });
        }
      };
    } else if (i === 3) {
      const cs = [0x72efdd, 0xffe66d, 0xc77dff], rs = [0x48bfe3, 0xff9f1c, 0x9d4edd];
      for (let s = 0; s < 3; s++) {
        const sx = (s - 1) * 0.68, h = s === 1 ? 1.15 : 0.95;
        add(box, lotMat(cs[s]), 0.6, h, 0.95, sx, h / 2 + 0.05, 0);
        add(box, lotMat(rs[s]), 0.66, 0.18, 1.05, sx, h + 0.14, 0);
        add(box, mat(0x94a3b8), 0.44, 0.6, 0.06, sx, 0.36, 0.5, 0, 0, probGrp);
        add(box, mat(rs[s]), 0.55, 0.1, 0.32, sx, 0.72, 0.62, 0.25, 0, solveGrp);
        const qb = makeSprite('?', '#ffffff', '#64748b', 0.42, 0.42, 96, 96).sp;
        qb.position.set(sx, h + 0.55, 0); probGrp.add(qb);
      }
      const openSign = makeSprite('OPEN', '#52b788', '#ffffff', 0.95, 0.4).sp; openSign.position.set(0, 1.55, 0.4);
      const thumbs = makeSprite('👍', '#fff3b0', '#264653', 0.65, 0.55, 128, 128).sp; thumbs.position.set(0, 2.15, 0);
      solveGrp.add(openSign, thumbs);
    } else if (i === 4) {
      [[0xff758f, -0.55, -0.2], [0xffd166, 0.52, -0.25], [0x4ea8de, 0, 0.48]].forEach(([c, x, z]) => add(cone, lotMat(c), 0.46, 0.72, 0.46, x, 0.41, z, 0, 0, probGrp));
      const hColors = [0xffafcc, 0x90dbf4, 0xfde4cf, 0xb9fbc0];
      const houses = [[-0.6, -0.35], [0.6, -0.35], [-0.55, 0.45], [0.55, 0.45]].map(([hx, hz], idx) => {
        const hg = new THREE.Group(); hg.position.set(hx, 0, hz);
        hg.add(part(box, mat(hColors[idx]), 0.58, 0.52, 0.52, 0, 0.3, 0), part(cone, mat(0xe76f51), 0.46, 0.38, 0.46, 0, 0.75, 0, 0, Math.PI / 4));
        hg.scale.setScalar(0.01); solveGrp.add(hg); return hg;
      });
      let popT = 0;
      onSolve = () => { popT = 0; houses.forEach((h) => h.scale.setScalar(0.01)); };
      onTick = (t, dt) => {
        if (solveGrp.visible && popT < 1.2) { popT += dt; houses.forEach((h, idx) => h.scale.setScalar(THREE.MathUtils.clamp((popT - idx * 0.2) * 2.5, 0.01, 1))); }
      };
    } else if (i === 5) {
      const rk = lotMat(0x8d99ae), mist = lotMat(0xe5edf4, { transparent: true, opacity: 0.78 });
      add(sphere, rk, 0.32, 0.2, 0.28, -0.45, 0.14, 0.2); add(sphere, rk, 0.24, 0.18, 0.22, 0.48, 0.12, -0.25);
      for (let p = 0; p < 5; p++) add(sphere, mist, 0.65, 0.34, 0.55, (p - 2) * 0.36, 0.38 + (p % 2) * 0.12, (p % 3 - 1) * 0.25, 0, 0, probGrp);
      add(box, mat(0x1e293b), 1.65, 1.15, 0.1, 0, 0.9, 0, 0, 0, solveGrp);
      const bars = [0xff758f, 0xffd166, 0x52b788].map((c, idx) => add(box, mat(c), 0.24, 0.8, 0.14, (idx - 1) * 0.4, 0.5, 0.06, 0, 0, solveGrp));
      const upArrow = makeSprite('⬆', '#52b788', '#ffffff', 0.55, 0.55, 128, 128).sp; upArrow.position.set(0.55, 1.65, 0.1); solveGrp.add(upArrow);
      onSolve = () => { bars.forEach((b) => { b.scale.y = 0.05; }); };
      onTick = (t, dt) => { if (solveGrp.visible) bars.forEach((b, idx) => { b.scale.y = THREE.MathUtils.lerp(b.scale.y, 0.35 + idx * 0.28, Math.min(dt * 4, 1)); b.position.y = 0.45 + b.scale.y * 0.5; }); };
    } else if (i === 6) {
      const r = lotMat(0x43aa8b), white = lotMat(0xffffff), gaugeMats = [0, 1, 2].map(() => mat(0x334155));
      add(box, lotMat(0xfff1d0), 1.9, 1.35, 1.3, 0, 0.72, -0.05);
      add(cone, r, 1.35, 0.65, 1.15, 0, 1.72, -0.05, 0, Math.PI / 4);
      add(box, r, 0.5, 0.58, 0.12, 0, 0.34, 0.62);
      const needles = [];
      for (let g = 0; g < 3; g++) {
        add(cyl, white, 0.2, 0.08, 0.2, (g - 1) * 0.52, 0.98, 0.62, Math.PI / 2);
        add(cyl, gaugeMats[g], 0.13, 0.1, 0.13, (g - 1) * 0.52, 0.98, 0.63, Math.PI / 2);
        const nd = add(box, mat(0xffffff), 0.03, 0.12, 0.03, (g - 1) * 0.52, 0.98, 0.7); nd.rotation.z = 0.9; needles.push(nd);
      }
      const badge = makeSprite('💼  🏷️  🏭', '#ffffff', '#264653', 1.45, 0.46, 320, 110).sp;
      badge.position.set(0, 2.35, 0); solveGrp.add(badge);
      let gT = 0;
      onSolve = () => { gT = 0; gaugeMats.forEach((gm) => gm.color.setHex(0x334155)); };
      onReset = () => { gaugeMats.forEach((gm) => gm.color.setHex(0x334155)); needles.forEach((n) => { n.rotation.z = 0.9; }); };
      onTick = (t, dt) => {
        if (solveGrp.visible) {
          gT += dt;
          gaugeMats.forEach((gm, idx) => { if (gT > idx * 0.28) { gm.color.setHex(0x52b788); needles[idx].rotation.z = THREE.MathUtils.lerp(needles[idx].rotation.z, -0.6, Math.min(dt * 5, 1)); } });
        }
      };
    } else if (i === 7) {
      add(box, lotMat(0xfcd5ce), 1.4, 0.12, 1.1, 0, 0.11, 0);
      add(cyl, mTrunk, 0.05, 0.7, 0.05, 0.55, 0.4, 0.55, 0, 0, probGrp);
      const qSign = makeSprite('?', '#f9c74f', '#264653', 0.65, 0.55, 128, 128).sp; qSign.position.set(0.55, 1.05, 0.55); probGrp.add(qSign);
      add(box, mat(0xffb5a7), 1.65, 1.1, 1.1, 0, 0.62, 0, 0, 0, solveGrp);
      add(cone, mat(0x4ea8de), 1.25, 0.55, 1.0, 0, 1.42, 0, 0, Math.PI / 4, solveGrp);
      const bell = add(cone, mat(0xffd166), 0.18, 0.25, 0.18, 0, 1.75, 0, 0, 0, solveGrp);
      onSolve = () => { edgeTowers.visible = true; towerGrow = 0.01; };
      onReset = () => { edgeTowers.visible = false; edgeTowers.scale.y = 0.01; towerGrow = 0; };
      onTick = (t) => { if (solveGrp.visible) bell.rotation.z = Math.sin(t * 14) * 0.22; };
    } else {
      const fr = lotMat(0xf4a261);
      add(cyl, fr, 0.07, 1.1, 0.07, -0.58, 0.58, 0); add(cyl, fr, 0.07, 1.1, 0.07, 0.58, 0.58, 0);
      add(box, fr, 1.36, 0.85, 0.1, 0, 0.92, 0); add(box, lotMat(0xffffff), 1.16, 0.65, 0.12, 0, 0.9, 0.01);
      add(box, lotMat(0x4ea8de), 1.36, 0.18, 0.14, 0, 1.38, 0);
      const q1 = makeSprite('?', '#ffffff', '#64748b', 0.5, 0.5, 128, 128).sp; q1.position.set(-0.35, 1.85, 0); probGrp.add(q1);
      const q2 = makeSprite('?', '#ffffff', '#64748b', 0.5, 0.5, 128, 128).sp; q2.position.set(0.35, 1.85, 0); probGrp.add(q2);
      const cal = makeSprite('📅  🏭  🏷️  💼', '#fff3b0', '#264653', 1.5, 0.72, 340, 150).sp; cal.position.set(0, 1.05, 0.25); solveGrp.add(cal);
    }

    scene.add(group);
    lotGroups.push(group);
    let moodCur = 0, moodTarget = 0, popT = 1;

    lots.push({
      index: i, group,
      setMood(t, instant = false) {
        moodTarget = THREE.MathUtils.clamp(t, 0, 1);
        if (instant) { moodCur = moodTarget; for (let k = 0; k < tracked.length; k++) tracked[k].m.color.copy(tracked[k].sad).lerp(tracked[k].happy, moodCur); }
      },
      setActiveProblem(active) { alertBubble.visible = active; redRing.visible = active; darkCloud.visible = active; },
      solve(instant = false) {
        alertBubble.visible = false; redRing.visible = false; darkCloud.visible = false;
        probGrp.visible = false; solveGrp.visible = true;
        popT = instant ? 1 : 0; solveGrp.scale.setScalar(instant ? 1 : 0.01);
        onSolve();
        if (!instant) spawnSolveParticles(i);
      },
      wrong(kind) { onWrong(kind); spawnWrongPuffs(i); },
      reset() {
        alertBubble.visible = false; redRing.visible = false; darkCloud.visible = false;
        probGrp.visible = true; solveGrp.visible = false; solveGrp.scale.setScalar(1);
        this.setMood(0, true); onReset();
      },
      tick(t, dt) {
        if (alertBubble.visible) {
          alertBubble.position.y = 2.55 + Math.abs(Math.sin(t * 4)) * 0.22;
          const pulse = 1 + Math.sin(t * 5) * 0.08;
          redRing.scale.setScalar(pulse);
          darkCloud.position.y = 2.45 + Math.sin(t * 2.5) * 0.08;
        }
        if (moodCur !== moodTarget) {
          moodCur = Math.min(moodTarget, moodCur + dt / 0.8);
          for (let k = 0; k < tracked.length; k++) tracked[k].m.color.copy(tracked[k].sad).lerp(tracked[k].happy, moodCur);
        }
        if (solveGrp.visible && popT < 1) {
          popT = Math.min(1, popT + dt / 0.42);
          const s = popT < 0.65 ? (popT / 0.65) * 1.15 : 1.15 - ((popT - 0.65) / 0.35) * 0.15;
          solveGrp.scale.setScalar(s);
        }
        onTick(t, dt);
      },
    });
  }

  // Pooled 15 plaza people (6 visible initially, +1 per solved mission)
  const pCols = [0xff758f, 0x4cc9f0, 0xffd166, 0x80ed99, 0xb892ff, 0xff9f1c];
  const people = Array.from({ length: 15 }, (_, i) => {
    const g = new THREE.Group();
    g.add(part(cap, mat(pCols[i % pCols.length]), 1, 1, 1, 0, 0.28, 0), part(sphere, mSkin, 0.14, 0.14, 0.14, 0, 0.62, 0));
    g.visible = i < 6; scene.add(g);
    return { g, angle: (i * Math.PI * 2) / 15, radius: 2.0 + (i % 3) * 0.36, speed: 0.2 + (i % 4) * 0.04, jumpT: 0 };
  });

  const clouds = [6.8, 7.6, 7.1, 8.1].map((h, i) => {
    const g = new THREE.Group();
    g.add(part(sphere, mCloud, 1.2, 0.65, 0.75, 0, 0, 0), part(sphere, mCloud, 0.85, 0.55, 0.65, -0.85, -0.08, 0.05), part(sphere, mCloud, 0.8, 0.52, 0.62, 0.85, -0.1, -0.05));
    g.position.set(-14 + i * 9, h, -6 + (i % 2) * 8); scene.add(g);
    return { g, speed: 0.45 + i * 0.12 };
  });

  function setCityMood(t) {
    const c = THREE.MathUtils.clamp(t, 0, 1);
    scene.background.copy(SAD_SKY).lerp(HAPPY_SKY, c);
    if (scene.fog) scene.fog.color.copy(scene.background);
    hemiLight.intensity = THREE.MathUtils.lerp(0.75, 1.15, c);
    dirLight.intensity = THREE.MathUtils.lerp(0.55, 1.25, c);
  }
  setCityMood(0);

  function setSolvedCount(count) {
    const visiblePeople = Math.min(15, 6 + count);
    people.forEach((p, idx) => { p.g.visible = idx < visiblePeople; });
    extraLife = count >= 5;
    birds.forEach((b) => { b.g.visible = extraLife; });
    cityCars.forEach((c) => { c.g.visible = extraLife; });
  }

  function jumpPeople(count = 3, duration = 1.3) {
    let jumped = 0;
    for (let i = 0; i < people.length && jumped < count; i++) {
      if (people[i].g.visible) { people[i].jumpT = duration; jumped++; }
    }
  }

  function resetAll() {
    setCityMood(0); setSolvedCount(0);
    people.forEach((p) => { p.jumpT = 0; });
    sparkles.forEach((p) => { p.life = 0; p.m.visible = false; });
    confetti.forEach((p) => { p.life = 0; p.m.visible = false; });
    puffs.forEach((p) => { p.life = 0; p.m.visible = false; });
    lots.forEach((l) => l.reset());
  }

  function update(elapsed, dt) {
    for (let i = 0; i < people.length; i++) {
      const p = people[i];
      if (!p.g.visible) continue;
      p.angle += p.speed * dt;
      let y = Math.abs(Math.sin(elapsed * 5 + i)) * 0.05;
      if (p.jumpT > 0) { p.jumpT = Math.max(0, p.jumpT - dt); y = Math.abs(Math.sin(elapsed * 12 + i)) * 0.48; }
      p.g.position.set(Math.cos(p.angle) * p.radius, y, Math.sin(p.angle) * p.radius);
      p.g.rotation.y = -p.angle;
    }
    for (let i = 0; i < clouds.length; i++) {
      clouds[i].g.position.x += clouds[i].speed * dt;
      if (clouds[i].g.position.x > 18) clouds[i].g.position.x = -18;
    }
    if (extraLife) {
      for (let i = 0; i < birds.length; i++) {
        const b = birds[i]; b.angle += dt * 0.55;
        b.g.position.set(Math.cos(b.angle) * b.r, b.y + Math.sin(elapsed * 4 + i) * 0.25, Math.sin(b.angle) * b.r);
        b.g.rotation.y = -b.angle;
      }
      for (let i = 0; i < cityCars.length; i++) {
        const c = cityCars[i]; c.angle -= dt * 0.7;
        c.g.position.set(Math.cos(c.angle) * c.r, 0.05, Math.sin(c.angle) * c.r);
        c.g.rotation.y = -c.angle + Math.PI / 2;
      }
    }
    if (truckActive) {
      truckAngle += dt * 0.9;
      plazaTruck.position.set(Math.cos(truckAngle) * 3.45, 0.05, Math.sin(truckAngle) * 3.45);
      plazaTruck.rotation.y = -truckAngle;
    }
    if (edgeTowers.visible && towerGrow < 1) {
      towerGrow = Math.min(1, towerGrow + dt * 1.6);
      edgeTowers.scale.y = towerGrow;
    }
    for (let i = 0; i < sparkles.length; i++) {
      const p = sparkles[i]; if (p.life <= 0) continue;
      p.life -= dt; p.vy -= 5.5 * dt;
      p.m.position.x += p.vx * dt; p.m.position.y += p.vy * dt; p.m.position.z += p.vz * dt;
      p.m.rotation.y += 6 * dt; p.m.scale.setScalar(Math.max(0.01, p.life / 1.6));
      if (p.life <= 0) p.m.visible = false;
    }
    for (let i = 0; i < confetti.length; i++) {
      const p = confetti[i]; if (p.life <= 0) continue;
      p.life -= dt; p.vy -= 4.2 * dt;
      p.m.position.x += p.vx * dt; p.m.position.y = Math.max(0.08, p.m.position.y + p.vy * dt); p.m.position.z += p.vz * dt;
      p.m.rotation.x += p.rx * dt; p.m.rotation.y += p.ry * dt;
      if (p.life <= 0) p.m.visible = false;
    }
    for (let i = 0; i < puffs.length; i++) {
      const p = puffs[i]; if (p.life <= 0) continue;
      p.life -= dt;
      p.m.position.x += p.vx * dt; p.m.position.y += p.vy * dt; p.m.position.z += p.vz * dt;
      p.m.scale.setScalar(0.18 + (1 - p.life / 0.85) * 0.24);
      if (p.life <= 0) p.m.visible = false;
    }
    fountainTop.position.y = 0.94 + Math.sin(elapsed * 3.5) * 0.04;
    for (let i = 0; i < lots.length; i++) lots[i].tick(elapsed, dt);
  }

  return { lots, lotGroups, setCityMood, setSolvedCount, jumpPeople, resetAll, update };
}
