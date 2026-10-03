// ---------------------------------------------------------------------------
// Mac Brew Farm: Photorealistic 3D Craft Drink & Liquid Simulator
// Physical Glass (Transmission/IOR/Refraction), Sloshing Liquid, Rising Bubbles & Ice
// ---------------------------------------------------------------------------
import * as THREE from 'three';

export function create3DDrinkViewer(containerEl) {
  if (!containerEl) return null;

  const width = containerEl.clientWidth || 400;
  const height = containerEl.clientHeight || 400;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
  camera.position.set(0, 1.2, 5.5);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  containerEl.appendChild(renderer.domElement);

  // -------------------------------------------------------------------------
  // Procedural Environment Reflection Map
  // -------------------------------------------------------------------------
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x0a1a14);

  // Warm golden lantern light in environment
  const envLight1 = new THREE.PointLight(0xf5d061, 6, 20);
  envLight1.position.set(3, 4, 3);
  envScene.add(envLight1);
  const envLight2 = new THREE.PointLight(0xe8861d, 4, 20);
  envLight2.position.set(-3, -2, -3);
  envScene.add(envLight2);
  const envLight3 = new THREE.DirectionalLight(0xffffff, 3);
  envLight3.position.set(0, 6, 4);
  envScene.add(envLight3);

  const renderTarget = pmremGenerator.fromScene(envScene);
  scene.environment = renderTarget.texture;

  // -------------------------------------------------------------------------
  // Studio Lights for Glass & Liquid Refraction
  // -------------------------------------------------------------------------
  const keyLight = new THREE.SpotLight(0xffffff, 4.5, 25, Math.PI / 4, 0.3);
  keyLight.position.set(3, 6, 4);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xe3c79b, 3.2);
  rimLight.position.set(-3, 2, -4);
  scene.add(rimLight);

  const fillLight = new THREE.DirectionalLight(0x8db580, 1.8);
  fillLight.position.set(0, -3, 2);
  scene.add(fillLight);

  const drinkGroup = new THREE.Group();
  scene.add(drinkGroup);

  // -------------------------------------------------------------------------
  // Realistic Double-Walled Crystal Glass (Coupe & Pint Profiles)
  // -------------------------------------------------------------------------
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.98,
    opacity: 1,
    transparent: true,
    roughness: 0.02,
    ior: 1.52,
    thickness: 0.85,
    specularIntensity: 1.0,
    specularColor: new THREE.Color(0xffffff),
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    envMapIntensity: 2.4,
  });

  // Coupe Glass Profile
  function createCoupeGeometry() {
    const pts = [];
    // Base
    pts.push(new THREE.Vector2(0.001, -1.8));
    pts.push(new THREE.Vector2(0.85, -1.8));
    pts.push(new THREE.Vector2(0.82, -1.74));
    pts.push(new THREE.Vector2(0.12, -1.65));
    // Stem
    pts.push(new THREE.Vector2(0.09, -0.2));
    pts.push(new THREE.Vector2(0.16, 0.0));
    // Bowl exterior
    pts.push(new THREE.Vector2(0.55, 0.2));
    pts.push(new THREE.Vector2(1.18, 0.7));
    pts.push(new THREE.Vector2(1.32, 1.25));
    // Lip
    pts.push(new THREE.Vector2(1.31, 1.27));
    pts.push(new THREE.Vector2(1.26, 1.25));
    // Bowl interior
    pts.push(new THREE.Vector2(1.12, 0.7));
    pts.push(new THREE.Vector2(0.48, 0.26));
    pts.push(new THREE.Vector2(0.001, 0.18));
    return new THREE.LatheGeometry(pts, 48);
  }

  // Craft Beer Pint Glass Profile
  function createPintGeometry() {
    const pts = [];
    pts.push(new THREE.Vector2(0.001, -1.6));
    pts.push(new THREE.Vector2(0.72, -1.6));
    pts.push(new THREE.Vector2(0.75, -1.5));
    pts.push(new THREE.Vector2(0.92, 0.4));
    pts.push(new THREE.Vector2(1.05, 1.4));
    pts.push(new THREE.Vector2(1.03, 1.42));
    pts.push(new THREE.Vector2(0.98, 1.4));
    pts.push(new THREE.Vector2(0.86, 0.4));
    pts.push(new THREE.Vector2(0.68, -1.45));
    pts.push(new THREE.Vector2(0.001, -1.45));
    return new THREE.LatheGeometry(pts, 48);
  }

  let currentGlassType = 'coupe';
  let glassMesh = new THREE.Mesh(createCoupeGeometry(), glassMat);
  drinkGroup.add(glassMesh);

  // -------------------------------------------------------------------------
  // Volumetric Liquid with Fluid Sloshing Physics
  // -------------------------------------------------------------------------
  const liquidMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xd6284f),
    transmission: 0.82,
    opacity: 0.95,
    transparent: true,
    roughness: 0.08,
    ior: 1.34,
    thickness: 1.4,
    specularIntensity: 0.8,
    clearcoat: 0.8,
    envMapIntensity: 1.8,
  });

  function createLiquidGeometry(type = 'coupe') {
    if (type === 'coupe') {
      const pts = [];
      pts.push(new THREE.Vector2(0.001, 0.22));
      pts.push(new THREE.Vector2(0.46, 0.28));
      pts.push(new THREE.Vector2(1.08, 0.7));
      pts.push(new THREE.Vector2(1.22, 1.05));
      pts.push(new THREE.Vector2(0.001, 1.05)); // surface top
      return new THREE.LatheGeometry(pts, 40);
    } else {
      const pts = [];
      pts.push(new THREE.Vector2(0.001, -1.4));
      pts.push(new THREE.Vector2(0.66, -1.4));
      pts.push(new THREE.Vector2(0.84, 0.38));
      pts.push(new THREE.Vector2(0.95, 1.15));
      pts.push(new THREE.Vector2(0.001, 1.15));
      return new THREE.LatheGeometry(pts, 40);
    }
  }

  let liquidMesh = new THREE.Mesh(createLiquidGeometry('coupe'), liquidMat);
  drinkGroup.add(liquidMesh);

  // -------------------------------------------------------------------------
  // Creamy Foam Head (For Craft Beers / Sours)
  // -------------------------------------------------------------------------
  const foamMat = new THREE.MeshStandardMaterial({
    color: 0xfffcf5,
    roughness: 0.9,
    metalness: 0.05,
  });
  const foamMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.23, 1.2, 0.2, 36), foamMat);
  foamMesh.position.set(0, 1.06, 0);
  drinkGroup.add(foamMesh);

  // -------------------------------------------------------------------------
  // Rising Carbonation Micro-Bubbles (InstancedMesh)
  // -------------------------------------------------------------------------
  const bubbleCount = 45;
  const bubbleGeo = new THREE.SphereGeometry(0.024, 8, 8);
  const bubbleMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.95,
    roughness: 0.05,
    ior: 1.1,
  });
  const bubbleMesh = new THREE.InstancedMesh(bubbleGeo, bubbleMat, bubbleCount);
  const bubbleData = [];
  const dummy = new THREE.Object3D();

  for (let i = 0; i < bubbleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 0.75;
    const x = Math.cos(angle) * r;
    const y = 0.25 + Math.random() * 0.75;
    const z = Math.sin(angle) * r;
    const speed = 0.4 + Math.random() * 0.6;
    const wobbleSpeed = 2 + Math.random() * 3;
    bubbleData.push({ x, y, z, speed, wobbleSpeed, startY: 0.25, maxY: 1.05, angle });
    dummy.position.set(x, y, z);
    dummy.updateMatrix();
    bubbleMesh.setMatrixAt(i, dummy.matrix);
  }
  bubbleMesh.instanceMatrix.needsUpdate = true;
  drinkGroup.add(bubbleMesh);

  // -------------------------------------------------------------------------
  // Faceted Crystal Ice Cubes
  // -------------------------------------------------------------------------
  const iceMat = new THREE.MeshPhysicalMaterial({
    color: 0xf5f8fa,
    transmission: 0.94,
    opacity: 0.9,
    transparent: true,
    roughness: 0.1,
    ior: 1.31,
    thickness: 0.6,
  });
  const iceGroup = new THREE.Group();
  const ice1 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), iceMat);
  ice1.position.set(-0.25, 0.65, 0.1);
  ice1.rotation.set(0.4, 0.6, 0.2);

  const ice2 = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), iceMat);
  ice2.position.set(0.3, 0.72, -0.15);
  ice2.rotation.set(-0.3, 0.8, -0.5);

  iceGroup.add(ice1, ice2);
  drinkGroup.add(iceGroup);

  // -------------------------------------------------------------------------
  // 3D Rim Garnish: Fresh Lime Wheel
  // -------------------------------------------------------------------------
  const garnishGroup = new THREE.Group();
  const limePulpMat = new THREE.MeshStandardMaterial({
    color: 0x9cc34a,
    roughness: 0.35,
    transparent: true,
    opacity: 0.88,
  });
  const limeRindMat = new THREE.MeshStandardMaterial({ color: 0x5c9a3c, roughness: 0.6 });
  const limePulp = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.04, 24), limePulpMat);
  const limeRind = new THREE.Mesh(new THREE.CylinderGeometry(0.41, 0.41, 0.038, 24), limeRindMat);
  garnishGroup.add(limeRind, limePulp);
  garnishGroup.position.set(1.24, 1.25, 0);
  garnishGroup.rotation.set(0.3, 0, 1.2);
  drinkGroup.add(garnishGroup);

  // -------------------------------------------------------------------------
  // Physics & Inertial Liquid Slosh
  // -------------------------------------------------------------------------
  let isDragging = false;
  let prevMouseX = 0, prevMouseY = 0;
  let rotVelX = 0, rotVelY = 0;
  let targetRotY = 0, targetRotX = 0;
  let sloshX = 0, sloshZ = 0;
  let sloshVelX = 0, sloshVelZ = 0;

  containerEl.addEventListener('pointerdown', (e) => {
    isDragging = true;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
    containerEl.style.cursor = 'grabbing';
  });

  window.addEventListener('pointerup', () => {
    if (isDragging) {
      isDragging = false;
      containerEl.style.cursor = 'grab';
    }
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - prevMouseX;
    const dy = e.clientY - prevMouseY;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;

    targetRotY += dx * 0.012;
    targetRotX += dy * 0.008;
    targetRotX = Math.max(-0.4, Math.min(0.5, targetRotX));

    // Inject slosh momentum from drag velocity
    sloshVelX += dx * 0.002;
    sloshVelZ += dy * 0.002;
  });

  // Touch Support
  containerEl.style.touchAction = 'none';

  // -------------------------------------------------------------------------
  // API: Drink Style & Color Configuration
  // -------------------------------------------------------------------------
  function setDrinkConfig({ color, foam, hasIce, garnishType, glassType }) {
    if (color) {
      liquidMat.color.set(color);
    }
    if (foam !== undefined) {
      foamMesh.visible = foam > 0.1;
      foamMesh.scale.set(1, Math.max(0.2, foam * 1.5), 1);
    }
    if (hasIce !== undefined) {
      iceGroup.visible = hasIce;
    }
    if (garnishType) {
      garnishGroup.visible = garnishType !== 'none';
    }

    if (glassType && glassType !== currentGlassType) {
      currentGlassType = glassType;
      drinkGroup.remove(glassMesh);
      drinkGroup.remove(liquidMesh);

      const newGlassGeo = glassType === 'pint' ? createPintGeometry() : createCoupeGeometry();
      glassMesh = new THREE.Mesh(newGlassGeo, glassMat);
      drinkGroup.add(glassMesh);

      const newLiquidGeo = createLiquidGeometry(glassType);
      liquidMesh = new THREE.Mesh(newLiquidGeo, liquidMat);
      drinkGroup.add(liquidMesh);

      if (glassType === 'pint') {
        foamMesh.position.set(0, 1.16, 0);
        garnishGroup.visible = false;
      } else {
        foamMesh.position.set(0, 1.06, 0);
        garnishGroup.visible = true;
      }
    }
  }

  function triggerStir() {
    sloshVelX = 0.08;
    sloshVelZ = -0.06;
  }

  // -------------------------------------------------------------------------
  // Animation Loop
  // -------------------------------------------------------------------------
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    const time = clock.getElapsedTime();

    // Auto idle spin when not dragging
    if (!isDragging) {
      targetRotY += 0.004;
    }

    // Smooth rotational damping
    drinkGroup.rotation.y += (targetRotY - drinkGroup.rotation.y) * 0.08;
    drinkGroup.rotation.x += (targetRotX - drinkGroup.rotation.x) * 0.08;

    // Sloshing physics (spring oscillator with damping)
    sloshVelX += -sloshX * 18.0 * dt - sloshVelX * 3.5 * dt;
    sloshVelZ += -sloshZ * 18.0 * dt - sloshVelZ * 3.5 * dt;
    sloshX += sloshVelX;
    sloshZ += sloshVelZ;

    liquidMesh.rotation.z = sloshX;
    liquidMesh.rotation.x = sloshZ;
    foamMesh.rotation.z = sloshX;
    foamMesh.rotation.x = sloshZ;

    // Animate rising carbonation bubbles
    for (let i = 0; i < bubbleCount; i++) {
      const b = bubbleData[i];
      b.y += dt * b.speed;
      b.x += Math.sin(time * b.wobbleSpeed + b.angle) * 0.002;
      if (b.y > b.maxY) {
        b.y = b.startY;
      }
      dummy.position.set(b.x, b.y, b.z);
      dummy.updateMatrix();
      bubbleMesh.setMatrixAt(i, dummy.matrix);
    }
    bubbleMesh.instanceMatrix.needsUpdate = true;

    // Ice bobs gently in liquid
    if (iceGroup.visible) {
      ice1.position.y = 0.65 + Math.sin(time * 2.2) * 0.025;
      ice2.position.y = 0.72 + Math.cos(time * 2.0) * 0.025;
    }

    renderer.render(scene, camera);
  }
  animate();

  function resize(newW, newH) {
    camera.aspect = newW / newH;
    camera.updateProjectionMatrix();
    renderer.setSize(newW, newH);
  }

  return {
    setDrinkConfig,
    triggerStir,
    resize,
  };
}
