// 3D layer: one coupe glass that stays on screen from the hero through the
// cocktail section. Its liquid colour, foam and garnish change with the
// active cocktail. Built with plain three.js (no build step).

import * as THREE from 'three';
import { store, intro } from './store.js';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;

// Glass dimensions (before the group is centred on the origin).
const R = 1.08; // rim radius
const H = 0.8; // bowl height
const Y_TOP = 2.0; // rim height
const STEM_R = 0.075;
const WALL = 0.045;
const CENTER_Y = 1.0; // shift so the glass is vertically centred

function glassProfile() {
  const pts = [
    [0.0001, 0], [0.6, 0], [0.65, 0.015], [0.66, 0.04], [0.6, 0.075],
    [0.42, 0.115], [0.17, 0.16], [0.09, 0.24], [STEM_R, 0.34], [STEM_R, 1.0], [0.078, 1.12],
  ];
  const yBowl = Y_TOP - H;
  const n = 32;
  for (let i = 1; i <= n; i++) {
    const th = (i / n) * Math.PI / 2;
    pts.push([STEM_R + (R - STEM_R) * Math.sin(th), yBowl + H * (1 - Math.cos(th))]);
  }
  // rim, then the inner wall back down to the axis
  const yInnerBottom = yBowl + WALL * 1.6;
  for (let i = n; i >= 0; i--) {
    const th = (i / n) * Math.PI / 2;
    pts.push([Math.max(0.0001, (R - WALL) * Math.sin(th)), yInnerBottom + (Y_TOP - yInnerBottom) * (1 - Math.cos(th))]);
  }
  return pts.map(([x, y]) => new THREE.Vector2(x, y - CENTER_Y));
}

function liquidGeometry(level) {
  // Fill the inner bowl up to `level` below the rim.
  const yBowl = Y_TOP - H;
  const yIB = yBowl + WALL * 1.6;
  const ySurface = Y_TOP - level;
  const ratio = clamp((ySurface - yIB) / (Y_TOP - yIB), 0, 1);
  const thMax = Math.acos(1 - ratio);
  const pts = [];
  const m = 28;
  for (let i = 0; i <= m; i++) {
    const th = (i / m) * thMax;
    pts.push(new THREE.Vector2(
      Math.max(0.0001, 0.965 * (R - WALL) * Math.sin(th)),
      yIB + 0.004 + (Y_TOP - yIB) * (1 - Math.cos(th)) - CENTER_Y,
    ));
  }
  const rTop = pts[pts.length - 1].x;
  const yTop = pts[pts.length - 1].y;
  pts.push(new THREE.Vector2(0.0001, yTop));
  const geo = new THREE.LatheGeometry(pts, 72);
  // darker at the bottom, lighter near the surface
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const yMin = pts[0].y;
  for (let i = 0; i < pos.count; i++) {
    const t = clamp((pos.getY(i) - yMin) / Math.max(0.001, yTop - yMin));
    const v = 0.55 + 0.45 * t;
    colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = v;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return { geo, rTop, yTop };
}

function makeEnvironment(renderer) {
  const pm = new THREE.PMREMGenerator(renderer);
  const s = new THREE.Scene();
  s.background = new THREE.Color(0x0a120e);
  const panel = (w, h, color, k, pos) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }),
    );
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    s.add(m);
  };
  panel(6, 3, 0xffe0b0, 6, [4, 4, 3]); // warm key
  panel(2, 6, 0x7fd6a0, 3, [-5, 1, 2]); // green kicker
  panel(5, 5, 0xffffff, 4, [0, 5, -3]); // top
  panel(8, 1, 0xff9a6a, 2, [0, -3, 4]); // low warm
  panel(3, 3, 0xffd7a0, 3, [-3, 3, -4]); // back
  const tex = pm.fromScene(s, 0.04).texture;
  pm.dispose();
  return tex;
}

function radialTexture(inner, outer) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  grad.addColorStop(0, inner);
  grad.addColorStop(1, outer);
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeGlassMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: { uTint: { value: new THREE.Color('#dff5ea') } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; uniform vec3 uTint;
      void main() {
        vec3 n = normalize(vN);
        if (!gl_FrontFacing) n = -n;
        vec3 v = normalize(vV);
        float f = pow(1.0 - clamp(abs(dot(n, v)), 0.0, 1.0), 2.4);
        vec3 l1 = normalize(vec3(0.55, 0.75, 0.6));
        vec3 h1 = normalize(l1 + v);
        float s1 = pow(max(dot(n, h1), 0.0), 80.0);
        vec3 l2 = normalize(vec3(-0.7, 0.3, 0.5));
        vec3 h2 = normalize(l2 + v);
        float s2 = pow(max(dot(n, h2), 0.0), 60.0) * 0.6;
        float spec = s1 + s2;
        vec3 col = uTint * (0.35 + f * 0.9) + vec3(1.0) * spec;
        float a = clamp(0.05 + f * 0.7 + spec, 0.0, 0.95);
        gl_FragColor = vec4(col, a);
      }`,
  });
}

function makeSparkles(count) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const phase = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 12;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 7;
    pos[i * 3 + 2] = -3 + Math.random() * 5;
    size[i] = 0.5 + Math.random() * 1.6;
    phase[i] = Math.random();
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPx: { value: 1 },
      uTint: { value: new THREE.Color('#f3d49b') },
    },
    vertexShader: /* glsl */ `
      attribute float aSize; attribute float aPhase;
      uniform float uTime; uniform float uPx; varying float vA;
      void main() {
        vec3 p = position;
        p.y += sin(uTime * 0.35 + aPhase * 6.283) * 0.35;
        p.x += cos(uTime * 0.25 + aPhase * 9.0) * 0.2;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uPx * 38.0 / (-mv.z);
        vA = 0.55 + 0.45 * sin(uTime * 1.3 + aPhase * 20.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uTint; varying float vA;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        a *= a;
        gl_FragColor = vec4(uTint * 1.2, a * vA * 0.9);
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  return points;
}

function makeHopCone() {
  const rings = [
    { r: 0.2, y: 0.95, n: 5, m: 0.8 }, { r: 0.4, y: 0.62, n: 6, m: 1.0 },
    { r: 0.54, y: 0.25, n: 7, m: 1.1 }, { r: 0.55, y: -0.12, n: 7, m: 1.1 },
    { r: 0.46, y: -0.48, n: 6, m: 1.0 }, { r: 0.32, y: -0.8, n: 5, m: 0.85 },
    { r: 0.15, y: -1.05, n: 3, m: 0.6 },
  ];
  const total = rings.reduce((a, r) => a + r.n, 0);
  const geo = new THREE.SphereGeometry(1, 10, 8);
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55, metalness: 0, envMapIntensity: 0.9 });
  const mesh = new THREE.InstancedMesh(geo, mat, total);
  const d = new THREE.Object3D();
  d.rotation.order = 'YZX';
  const c1 = new THREE.Color('#5f8a4b');
  const c2 = new THREE.Color('#a9c97a');
  const c = new THREE.Color();
  let k = 0;
  rings.forEach((ring, ri) => {
    for (let j = 0; j < ring.n; j++) {
      const a = (j / ring.n) * Math.PI * 2 + ri * 0.55;
      d.position.set(Math.cos(a) * ring.r, ring.y, Math.sin(a) * ring.r);
      d.rotation.set(0, -a, 0.32);
      d.scale.set(0.07 * ring.m, 0.34 * ring.m, 0.24 * ring.m);
      d.updateMatrix();
      mesh.setMatrixAt(k, d.matrix);
      c.copy(c1).lerp(c2, clamp(ri / (rings.length - 1) + (Math.random() - 0.5) * 0.25));
      mesh.setColorAt(k, c);
      k++;
    }
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return mesh;
}

export function initScene(canvas) {
  return new Promise((resolve, reject) => {
    try {
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      canvas.addEventListener('webglcontextlost', (e) => e.preventDefault());

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
      camera.position.set(0, 0.6, 9);
      scene.environment = makeEnvironment(renderer);
      scene.add(new THREE.AmbientLight(0xffffff, 0.35));
      const key = new THREE.DirectionalLight(0xffd9a0, 1.4);
      key.position.set(3, 5, 4);
      scene.add(key);

      // --- glass group ---
      const glass = new THREE.Group();
      scene.add(glass);
      glass.add(new THREE.Mesh(new THREE.LatheGeometry(glassProfile(), 96), makeGlassMaterial()));

      const liquid = liquidGeometry(0.22);
      const liquidMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(store.liquid), roughness: 0.22, metalness: 0, envMapIntensity: 0.9,
        vertexColors: true, emissive: new THREE.Color(store.liquid), emissiveIntensity: 0.22,
      });
      glass.add(new THREE.Mesh(liquid.geo, liquidMat));

      const foamPts = [
        [0.0001, 0], [liquid.rTop * 0.99, 0], [liquid.rTop, 0.03], [liquid.rTop * 0.93, 0.09],
        [liquid.rTop * 0.6, 0.14], [0.0001, 0.165],
      ].map(([x, y]) => new THREE.Vector2(x, y));
      const foamMat = new THREE.MeshStandardMaterial({ color: 0xf7ecd9, roughness: 0.85, metalness: 0, envMapIntensity: 0.5 });
      const foam = new THREE.Mesh(new THREE.LatheGeometry(foamPts, 48), foamMat);
      foam.position.y = liquid.yTop;
      glass.add(foam);

      // citrus wheel on the rim: the one asymmetric detail, so the spin reads
      const wheelMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(store.garnish), roughness: 0.5, envMapIntensity: 0.8 });
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.045, 40), wheelMat);
      const rind = new THREE.Mesh(
        new THREE.TorusGeometry(0.34, 0.028, 10, 40),
        new THREE.MeshStandardMaterial({ color: 0x2f4a22, roughness: 0.6 }),
      );
      rind.rotation.x = Math.PI / 2;
      wheel.add(rind);
      wheel.rotation.set(Math.PI / 2, 0, 0.35);
      wheel.position.set(0.96, Y_TOP - CENTER_Y + 0.12, 0);
      glass.add(wheel);

      // soft shadow on the "table"
      const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(3.2, 3.2),
        new THREE.MeshBasicMaterial({ map: radialTexture('rgba(0,0,0,0.55)', 'rgba(0,0,0,0)'), transparent: true, depthWrite: false }),
      );
      shadow.rotation.x = -Math.PI / 2;
      scene.add(shadow);

      // --- floating hop cones ---
      const hops = new THREE.Group();
      scene.add(hops);
      const hopSpots = [
        { x: -4.1, y: 1.5, z: -1.5, s: 0.7 }, { x: 4.0, y: 1.9, z: -1.8, s: 0.55 },
        { x: -3.5, y: -1.6, z: -0.5, s: 0.85 }, { x: 3.7, y: -1.3, z: -1.0, s: 0.6 },
        { x: 0.2, y: 2.4, z: -3.0, s: 0.5 },
      ];
      const hopSpotsNarrow = [
        { x: -1.3, y: 2.0, z: -1.0, s: 0.42 }, { x: 1.25, y: 1.7, z: -1.2, s: 0.36 },
        { x: -1.15, y: -2.1, z: -0.5, s: 0.5 }, { x: 1.2, y: -1.9, z: -0.8, s: 0.4 },
      ];
      const hopObjs = [];
      const hopSource = makeHopCone();
      for (let i = 0; i < hopSpots.length; i++) {
        const g = new THREE.Group();
        const m = i === 0 ? hopSource : new THREE.InstancedMesh(hopSource.geometry, hopSource.material, hopSource.count);
        if (i > 0) {
          m.instanceMatrix.copy(hopSource.instanceMatrix);
          m.instanceMatrix.needsUpdate = true;
          if (hopSource.instanceColor) {
            m.instanceColor = hopSource.instanceColor.clone();
            m.instanceColor.needsUpdate = true;
          }
        }
        g.add(m);
        hops.add(g);
        hopObjs.push({ g, phase: Math.random() * 6.28, spin: 0.15 + Math.random() * 0.25, rate: 0.5 + Math.random() * 0.5 });
      }

      // --- gold dust ---
      let sparkleCount = matchMedia('(pointer:coarse)').matches ? 70 : 140;
      const sparkles = makeSparkles(sparkleCount);
      scene.add(sparkles);

      // --- state ---
      let isWide = true;
      let quality = 1.75;
      const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
      if (matchMedia('(pointer:fine)').matches) {
        window.addEventListener('pointermove', (e) => {
          ptr.tx = (e.clientX / innerWidth) * 2 - 1;
          ptr.ty = (e.clientY / innerHeight) * 2 - 1;
        }, { passive: true });
      }

      function resize() {
        const w = innerWidth;
        const h = innerHeight;
        isWide = w >= 900 && w / h > 0.95;
        const dpr = Math.min(window.devicePixelRatio || 1, isWide ? 1.75 : 1.5, quality);
        renderer.setPixelRatio(dpr);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        sparkles.material.uniforms.uPx.value = dpr;
        hopObjs.forEach((o, i) => {
          o.base = (isWide ? hopSpots : hopSpotsNarrow)[i];
          o.g.visible = !!o.base;
        });
      }
      resize();
      window.addEventListener('resize', resize);

      const tmp = new THREE.Color();
      const GOLD = new THREE.Color('#f3d49b');
      let pulse = 0;
      let lastActive = store.active;
      let last = performance.now();
      let slow = 0;

      function update(dt, t) {
        ptr.x += (ptr.tx - ptr.x) * Math.min(1, dt * 3);
        ptr.y += (ptr.ty - ptr.y) * Math.min(1, dt * 3);

        const hp = store.heroP;
        const e = easeInOut(hp);
        const cp = store.cockP;
        const hero = isWide ? { x: 0, y: -0.25, s: 1.5 } : { x: 0, y: -0.45, s: 0.8 };
        const ck = isWide ? { x: 0.05, y: -0.1, s: 1.4 } : { x: 0, y: 0.95, s: 0.7 };
        const iv = clamp(intro.v);

        if (store.active !== lastActive) {
          lastActive = store.active;
          pulse = 1;
        }
        pulse = Math.max(0, pulse - dt * 1.8);
        const pop = 1 + 0.09 * Math.sin(pulse * Math.PI);

        const s = lerp(hero.s, ck.s, e) * iv * pop;
        const px = lerp(hero.x, ck.x, e);
        const py = lerp(hero.y, ck.y, e) + Math.sin(t * 0.9) * 0.04;
        glass.position.set(px, py, 0);
        glass.scale.setScalar(Math.max(0.0001, s));
        glass.rotation.set(
          0.14 + ptr.y * 0.1,
          t * 0.28 + e * Math.PI * 2 + cp * Math.PI * 4 + ptr.x * 0.35 + (1 - iv) * 2.5,
          Math.sin(pulse * 14) * 0.05 * pulse,
        );
        shadow.position.set(px, py - CENTER_Y * s + 0.02, 0);
        shadow.scale.setScalar(Math.max(0.0001, s));

        const k = 1 - Math.exp(-dt * 5);
        liquidMat.color.lerp(tmp.set(store.liquid), k);
        liquidMat.emissive.copy(liquidMat.color);
        wheelMat.color.lerp(tmp.set(store.garnish), k);
        foam.scale.y += (Math.max(0.0001, store.foam) - foam.scale.y) * k;
        foam.visible = foam.scale.y > 0.02;
        sparkles.material.uniforms.uTime.value = t;
        sparkles.material.uniforms.uTint.value.lerp(tmp.set(store.liquid).lerp(GOLD, 0.55), k);

        const fade = 1 - smooth(0.3, 0.85, hp);
        hopObjs.forEach((o) => {
          if (!o.base) return;
          o.g.position.set(o.base.x, o.base.y + hp * 3.2 * (o.base.z + 4) * 0.35 + Math.sin(t * o.rate + o.phase) * 0.12, o.base.z);
          o.g.rotation.y += dt * o.spin;
          o.g.rotation.z = Math.sin(t * 0.5 + o.phase) * 0.2;
          o.g.scale.setScalar(Math.max(0.0001, o.base.s * iv * fade));
        });

        camera.position.x += (ptr.x * 0.5 - camera.position.x) * Math.min(1, dt * 2);
        camera.position.y += (0.6 - ptr.y * 0.2 - camera.position.y) * Math.min(1, dt * 2);
        camera.lookAt(0, 0, 0);
      }

      function frame(now) {
        requestAnimationFrame(frame);
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (!store.visible || document.hidden) return;
        update(dt, now / 1000);
        renderer.render(scene, camera);
        // simple adaptive quality: drop pixel ratio if the device struggles
        slow = dt > 0.034 ? slow + 1 : Math.max(0, slow - 1);
        if (slow > 45 && quality > 1.1) {
          quality = 1.1;
          slow = 0;
          resize();
        }
      }
      requestAnimationFrame((now) => {
        last = now;
        update(0.016, now / 1000);
        renderer.render(scene, camera);
        resolve();
        requestAnimationFrame(frame);
      });
    } catch (err) {
      reject(err);
    }
  });
}
