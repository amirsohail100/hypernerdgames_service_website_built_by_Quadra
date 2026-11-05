
// THREE.JS LAYER — ambient background (scroll-linked) + card hover 3D
(function () {
  if (typeof THREE === 'undefined') return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const RED = 0xD90037, RED_B = 0xFF0043;
  const mouse = { x: 0, y: 0 };
  addEventListener('mousemove', e => { mouse.x = e.clientX / innerWidth - .5; mouse.y = e.clientY / innerHeight - .5; });

  // ---- AMBIENT: wave grid + wireframe shapes spread along the page ----
  const amb = document.getElementById('ambient-3d');
  const aR = new THREE.WebGLRenderer({ canvas: amb, alpha: true, antialias: true });
  aR.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  aR.setSize(innerWidth, innerHeight, false);
  const aS = new THREE.Scene();
  const aC = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, .1, 200);
  aC.position.z = 13;
  let camY = 0;

  const N = innerWidth < 900 ? 22 : 40, gp = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) gp.push((i / (N - 1) - .5) * 60, 0, (j / (N - 1) - .5) * 60);
  const gGeo = new THREE.BufferGeometry();
  gGeo.setAttribute('position', new THREE.Float32BufferAttribute(gp, 3));
  const grid = new THREE.Points(gGeo, new THREE.PointsMaterial({ color: RED, size: .09, transparent: true, opacity: .35 }));
  grid.position.y = -9; grid.rotation.x = -.35;
  aS.add(grid);

  const wireMat = (c, o) => new THREE.MeshBasicMaterial({ color: c, wireframe: true, transparent: true, opacity: o });
  const shapes = [];
  const mk = (geo, x, y, z, s, o) => { const m = new THREE.Mesh(geo, wireMat(RED_B, o)); m.position.set(x, y, z); m.scale.setScalar(s); aS.add(m); shapes.push(m); };
  mk(new THREE.IcosahedronGeometry(1, 1), -6, 3, -3, 1.6, .22);
  mk(new THREE.TorusGeometry(1, .02, 8, 80), 6, -2, -4, 2.2, .3);
  mk(new THREE.OctahedronGeometry(1, 0), 4.5, 7, -7, 1.4, .18);
  mk(new THREE.DodecahedronGeometry(1, 0), -5.5, -7.5, -5, 1.5, .2);
  mk(new THREE.TorusKnotGeometry(.8, .2, 90, 10), 0, -17, -6, 1.2, .18);
  mk(new THREE.IcosahedronGeometry(1, 0), 7, -20, -4, 1.8, .2);

  // ---- FLOATING CONTROLLER GLYPHS (X, circle, triangle, square) in background ----
  const rawM = { x: -9999, y: -9999 };
  addEventListener('mousemove', e => { rawM.x = e.clientX; rawM.y = e.clientY; });
  document.addEventListener('mouseleave', () => { rawM.x = rawM.y = -9999; });
  const gRR = (p, w, h, r) => { const x = -w / 2, y = -h / 2; p.moveTo(x + r, y); p.lineTo(x + w - r, y); p.quadraticCurveTo(x + w, y, x + w, y + r); p.lineTo(x + w, y + h - r); p.quadraticCurveTo(x + w, y + h, x + w - r, y + h); p.lineTo(x + r, y + h); p.quadraticCurveTo(x, y + h, x, y + h - r); p.lineTo(x, y + r); p.quadraticCurveTo(x, y, x + r, y); return p; };
  const GVS = 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = -mv.xyz; gl_Position = projectionMatrix*mv; }';
  const GFS = `
uniform vec3 uColor; uniform vec2 uMouse; uniform vec2 uCenter; uniform float uGlow; uniform float uRadius; uniform float uTime;
varying vec3 vN; varying vec3 vV;
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
void main(){
  vec3 n = normalize(vN), v = normalize(vV);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 2.0);
  float dist = distance(gl_FragCoord.xy, uMouse);
  float spot = (1.0 - smoothstep(0.0, uRadius, dist)) * uGlow;
  vec2 dir = uMouse - uCenter;
  float pol = sin(atan(dir.y, dir.x));
  vec3 col = uColor * 0.45 + uColor * (fres * (0.4 + 1.6 * uGlow) + spot * 1.2);
  float gn = hash(floor(gl_FragCoord.xy * 0.5) + floor(uTime * 12.0));
  float ns = spot * 0.45;
  col = mix(col, vec3(1.0), max(pol, 0.0) * gn * ns);
  col = mix(col, vec3(0.0), max(-pol, 0.0) * (1.0 - gn) * ns);
  gl_FragColor = vec4(col, 1.0);
}`;
  const GOPT = { depth: .28, bevelEnabled: true, bevelThickness: .08, bevelSize: .06, bevelSegments: 3, curveSegments: 24 };
  function glyphGeo(k) {
    const extr = s => { const g = new THREE.ExtrudeGeometry(s, GOPT); g.center(); return g; };
    if (k === 'circle') { const s = new THREE.Shape(); s.absarc(0, 0, 1, 0, Math.PI * 2, false); const h = new THREE.Path(); h.absarc(0, 0, .7, 0, Math.PI * 2, true); s.holes.push(h); return extr(s); }
    if (k === 'square') { const s = gRR(new THREE.Shape(), 1.7, 1.7, .22); s.holes.push(gRR(new THREE.Path(), 1.2, 1.2, .1)); return extr(s); }
    if (k === 'tri') { const s = new THREE.Shape(); s.moveTo(0, 1.05); s.lineTo(.95, -.6); s.lineTo(-.95, -.6); s.closePath(); const h = new THREE.Path(); h.moveTo(0, .6); h.lineTo(.5, -.38); h.lineTo(-.5, -.38); h.closePath(); s.holes.push(h); return extr(s); }
    return extr(gRR(new THREE.Shape(), 2.1, .5, .12));
  }
  const GLYPHS = [
    { k: 'cross', c: 0xFF0043, p: [-7, 4, -2] },
    { k: 'circle', c: 0xFFD9DF, p: [6, 1.5, -3] },
    { k: 'tri', c: 0xFF9A3D, p: [-4.5, -6, -2.5] },
    { k: 'square', c: 0x9B5CFF, p: [7, -9, -3] },
    { k: 'circle', c: 0xFF6A88, p: [-6.5, -14, -3.5] },
    { k: 'cross', c: 0xFF7A1A, p: [5.5, -19, -2.5] }
  ];
  const glyphs = GLYPHS.map((d, i) => {
    const grp = new THREE.Group();
    const mat = new THREE.ShaderMaterial({ uniforms: { uColor: { value: new THREE.Color(d.c) }, uMouse: { value: new THREE.Vector2(-999, -999) }, uCenter: { value: new THREE.Vector2() }, uGlow: { value: 0 }, uRadius: { value: 80 }, uTime: { value: 0 } }, vertexShader: GVS, fragmentShader: GFS });
    if (d.k === 'cross') { const g = glyphGeo('cross'); [Math.PI / 4, -Math.PI / 4].forEach(a => { const m = new THREE.Mesh(g, mat); m.rotation.z = a; grp.add(m); }); }
    else grp.add(new THREE.Mesh(glyphGeo(d.k), mat));
    grp.scale.setScalar(1.1); aS.add(grp);
    return { grp, mat, base: new THREE.Vector3(...d.p), off: new THREE.Vector2(), glow: 0, seed: i * 1.7 };
  });
  const gTmp = new THREE.Vector3();
  function updateGlyphs(t) {
    const pr = aR.getPixelRatio();
    glyphs.forEach(g => {
      g.grp.position.set(g.base.x + g.off.x, g.base.y + g.off.y + Math.sin(t * .8 + g.seed) * .25, g.base.z);
      g.grp.rotation.set(Math.sin(t * .5 + g.seed) * .3, t * .3 + g.seed, Math.cos(t * .4 + g.seed) * .2);
      gTmp.copy(g.grp.position).project(aC);
      const sx = (gTmp.x + 1) / 2 * innerWidth, sy = (1 - gTmp.y) / 2 * innerHeight;
      const dx = sx - rawM.x, dy = sy - rawM.y, d = Math.hypot(dx, dy);
      let p = Math.max(0, 1 - d / 320); p *= p;
      // deflect away from cursor
      const k = d > 0 ? p * 2.6 / d : 0;
      g.off.x += (dx * k - g.off.x) * .08;
      g.off.y += (-dy * k - g.off.y) * .08;
      g.glow += (p - g.glow) * .1;
      g.mat.uniforms.uMouse.value.set(rawM.x * pr, (innerHeight - rawM.y) * pr);
      g.mat.uniforms.uCenter.value.set(sx * pr, (innerHeight - sy) * pr);
      g.mat.uniforms.uGlow.value = g.glow;
      g.mat.uniforms.uRadius.value = (80 + 220 * g.glow) * pr;
      g.mat.uniforms.uTime.value = t;
    });
  }

  // ---- CARD SCENES (built lazily on first hover) ----
  const ring = (r, c, o) => new THREE.Mesh(new THREE.TorusGeometry(r, .012, 8, 160), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o }));
  const dust = (n, r, c, s) => {
    const p = [];
    for (let i = 0; i < n; i++) {
      const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1), rr = r * (.6 + Math.random() * .6);
      p.push(rr * Math.sin(ph) * Math.cos(th), rr * Math.sin(ph) * Math.sin(th), rr * Math.cos(ph));
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({ color: c, size: s, transparent: true, opacity: .9 }));
  };
  const BUILDERS = [
    // 01 Voidrift — void core with orbiting rings
    g => {
      const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 2), wireMat(RED_B, .75));
      const r1 = ring(1.6, RED_B, .6), r2 = ring(1.9, 0xFF6A88, .35), d = dust(180, 2.4, 0xFF6A88, .04);
      g.add(core, r1, r2, d);
      return (t, h) => {
        core.rotation.set(t * .25, t * .4, 0);
        core.scale.setScalar(1 + Math.sin(t * 1.6) * .05 + h * .12);
        r1.rotation.set(Math.PI / 2.4, t * (.4 + h * 1.4), 0);
        r2.rotation.set(t * (.3 + h), Math.PI / 3, t * .2);
        d.rotation.y = -t * (.2 + h * .8);
      };
    },
    // 02 Nexus Arena — sci-fi octa with a scanning ring and orbiting cubes
    g => {
      const oct = new THREE.Mesh(new THREE.OctahedronGeometry(1.2, 0), wireMat(0xFF7A1A, .8));
      const scan = ring(1.2, 0xFFB26B, .9); scan.rotation.x = Math.PI / 2;
      const cubes = [0, 1, 2, 3].map(() => new THREE.Mesh(new THREE.BoxGeometry(.18, .18, .18), wireMat(0xFF7A1A, .9)));
      g.add(oct, scan, ...cubes);
      return (t, h) => {
        oct.rotation.set(t * .3, t * (.5 + h * 1.2), 0);
        const y = Math.sin(t * (1.4 + h * 2)) * 1.1;
        scan.position.y = y; scan.scale.setScalar(Math.max(.05, 1 - Math.abs(y) / 1.2));
        cubes.forEach((c, i) => { const a = t * (.6 + h * 1.4) + i * Math.PI / 2; c.position.set(Math.cos(a) * 2.1, Math.sin(a * 2) * .3, Math.sin(a) * 2.1); c.rotation.set(t, t * 1.3, 0); });
      };
    },
    // 03 Ember Protocol — violet dodeca, shockwave ring, rising embers
    g => {
      const dod = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 0), wireMat(0x9B5CFF, .75));
      const shock = ring(1, 0xFF8A3D, .6); shock.rotation.x = Math.PI / 2;
      const emb = dust(140, 1.8, 0xFF8A3D, .05), p = emb.geometry.attributes.position.array;
      g.add(dod, shock, emb);
      return (t, h) => {
        dod.rotation.set(t * .3, t * (.45 + h * 1.2), t * .15);
        const k = (t * (.5 + h)) % 1;
        shock.scale.setScalar(1 + k * 1.8);
        shock.material.opacity = .6 * (1 - k) * (.3 + h);
        for (let i = 1; i < p.length; i += 3) { p[i] += .01 + h * .025; if (p[i] > 2.2) p[i] = -2.2; }
        emb.geometry.attributes.position.needsUpdate = true;
      };
    }
  ];
  const states = [...document.querySelectorAll('.game-card')].map(card => ({ card, h: 0, target: 0, ready: false, px: 0, py: 0, rx: 0, ry: 0 }));
  function initCard(st, i) {
    const wrap = document.createElement('div');
    wrap.className = 'card-3d';
    st.card.querySelector('.game-card-bg').after(wrap);
    const r = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    wrap.appendChild(r.domElement);
    st.sc = new THREE.Scene();
    st.cam = new THREE.PerspectiveCamera(45, 1, .1, 50); st.cam.position.z = 6;
    st.g = new THREE.Group(); st.sc.add(st.g);
    st.update = BUILDERS[i](st.g); st.r = r;
    const fit = () => { const w = st.card.clientWidth, hh = st.card.clientHeight; r.setSize(w, hh, false); st.cam.aspect = w / hh; st.cam.updateProjectionMatrix(); };
    fit(); new ResizeObserver(fit).observe(st.card);
    st.ready = true;
  }
  states.forEach((st, i) => {
    st.card.addEventListener('mouseenter', () => { if (!st.ready && !reduce) initCard(st, i); st.target = 1; });
    st.card.addEventListener('mouseleave', () => { st.target = 0; });
    st.card.addEventListener('mousemove', e => { const b = st.card.getBoundingClientRect(); st.px = (e.clientX - b.left) / b.width - .5; st.py = (e.clientY - b.top) / b.height - .5; });
  });

  // ---- LOOP ----
  function drawAmbient(t) {
    camY += ((-scrollY * .0045) - camY) * .08;
    aC.position.x += (mouse.x * 2.2 - aC.position.x) * .03;
    aC.position.y = camY; aC.lookAt(0, camY, 0);
    const pos = gGeo.attributes.position.array;
    for (let k = 0; k < pos.length; k += 3) pos[k + 1] = Math.sin(pos[k] * .35 + t * .6) * Math.cos(pos[k + 2] * .35 + t * .5) * 1.4;
    gGeo.attributes.position.needsUpdate = true;
    shapes.forEach((m, i) => { m.rotation.y += .003 + i * .0006; m.rotation.x += .0012; });
    updateGlyphs(t);
    aR.render(aS, aC);
  }
  function loop() {
    const t = performance.now() / 1000;
    drawAmbient(t);
    states.forEach(st => {
      st.h += (st.target - st.h) * .08;
      if (!st.ready || st.h < .002) return;
      st.rx += (st.py - st.rx) * .1; st.ry += (st.px - st.ry) * .1;
      st.g.rotation.set(st.rx * .6, st.ry * .9, 0);
      st.update(t, st.h);
      st.r.render(st.sc, st.cam);
    });
    requestAnimationFrame(loop);
  }
  addEventListener('resize', () => { aR.setSize(innerWidth, innerHeight, false); aC.aspect = innerWidth / innerHeight; aC.updateProjectionMatrix(); });
  if (reduce) drawAmbient(0); else loop();
})();
