// ---------------------------------------------------------------------------
// Mac Brew Farm: Photorealistic 3D Brew Farm World & Interactive Stage (WebGL)
// Built with Three.js, GLSL Gerstner Wave Shaders, Physical Glass Optics,
// Real-world Video Portals, Inertial Liquid Physics & 3D Spatial Landmarks.
// ---------------------------------------------------------------------------
import * as THREE from 'three';

// Global scene controller interface for external UI sync
export const farm3D = {
  setWaypoint: null,
  setAtmosphere: null,
  setDrinkStyle: null,
  swirlDrink: null,
  triggerRipple: null,
  currentWaypoint: 'overview',
  currentAtmosphere: 'golden',
  currentDrink: 'ale',
};

export function initFarmScene() {
  const canvas = document.getElementById('farmGlCanvas');
  if (!canvas) return;

  // Scene & Fog
  const scene = new THREE.Scene();
  const nightFogColor = new THREE.Color(0x0a1a14);
  const goldenFogColor = new THREE.Color(0x28190d);
  scene.fog = new THREE.FogExp2(goldenFogColor, 0.032);

  // Camera setup
  const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 3.2, 9.5);
  const cameraTarget = new THREE.Vector3(0, 0.6, 0);
  camera.lookAt(cameraTarget);

  // Renderer setup with ACESFilmic tone mapping & soft shadows
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
    stencil: false,
    depth: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const textureLoader = new THREE.TextureLoader();

  // -------------------------------------------------------------------------
  // 1. Procedural Environment Map (PMREM) for Realistic Reflections
  // -------------------------------------------------------------------------
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  
  function updateEnvironment(isNight) {
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(isNight ? 0x05100b : 0x1f1208);

    // Warm key lights in environment
    const p1 = new THREE.PointLight(isNight ? 0xf59e0b : 0xfad165, isNight ? 5 : 8, 30);
    p1.position.set(4, 8, 4);
    envScene.add(p1);

    const p2 = new THREE.PointLight(isNight ? 0x10b981 : 0xe39a45, isNight ? 3 : 5, 25);
    p2.position.set(-6, 3, -4);
    envScene.add(p2);

    const p3 = new THREE.DirectionalLight(isNight ? 0x64748b : 0xffebd4, isNight ? 2 : 4);
    p3.position.set(0, 10, 5);
    envScene.add(p3);

    const envMap = pmremGenerator.fromScene(envScene, 0.04).texture;
    scene.environment = envMap;
  }
  updateEnvironment(false); // start in golden hour

  // -------------------------------------------------------------------------
  // 2. Lighting Rig (Golden Hour vs. Night Garden)
  // -------------------------------------------------------------------------
  const ambientLight = new THREE.AmbientLight(0x382414, 1.4);
  scene.add(ambientLight);

  const mainSunLight = new THREE.DirectionalLight(0xffdfa8, 2.8);
  mainSunLight.position.set(6, 14, 8);
  mainSunLight.castShadow = true;
  mainSunLight.shadow.mapSize.width = 1024;
  mainSunLight.shadow.mapSize.height = 1024;
  mainSunLight.shadow.camera.near = 0.5;
  mainSunLight.shadow.camera.far = 35;
  mainSunLight.shadow.camera.left = -12;
  mainSunLight.shadow.camera.right = 12;
  mainSunLight.shadow.camera.top = 12;
  mainSunLight.shadow.camera.bottom = -12;
  mainSunLight.shadow.bias = -0.0005;
  scene.add(mainSunLight);

  const gardenFillLight = new THREE.DirectionalLight(0x7fb685, 1.2);
  gardenFillLight.position.set(-8, 6, -4);
  scene.add(gardenFillLight);

  // -------------------------------------------------------------------------
  // 3. Living 3D Water Pond & Fountain with GLSL Gerstner Waves & Ripples
  // -------------------------------------------------------------------------
  const waterGeo = new THREE.PlaneGeometry(28, 24, 96, 96);
  waterGeo.rotateX(-Math.PI / 2);
  waterGeo.translate(0, -1.8, -0.5);

  const rippleOrigins = [
    new THREE.Vector4(0, 0, -999, 1.0),
    new THREE.Vector4(0, 0, -999, 1.0),
    new THREE.Vector4(0, 0, -999, 1.0),
    new THREE.Vector4(0, 0, -999, 1.0),
  ];
  let rippleIndex = 0;

  const waterUniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uDeepColor: { value: new THREE.Color(0x0a2419) },
    uSurfaceColor: { value: new THREE.Color(0x194532) },
    uHighlightColor: { value: new THREE.Color(0xf5d061) },
    uRipples: { value: rippleOrigins },
  };

  const waterMat = new THREE.ShaderMaterial({
    uniforms: waterUniforms,
    vertexShader: `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform vec4 uRipples[4];
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying float vWave;

      void main() {
        vUv = uv;
        vec3 pos = position;

        // Gerstner compound wave equation
        float w1 = sin(pos.x * 0.7 + uTime * 1.3) * cos(pos.z * 0.7 + uTime * 1.0) * 0.12;
        float w2 = sin(pos.x * 1.6 - uTime * 1.4 + pos.z * 1.1) * 0.06;
        float w3 = cos(pos.z * 2.8 + uTime * 2.0) * sin(pos.x * 2.2) * 0.03;

        // Interactive dynamic ripple packets
        float ripples = 0.0;
        for (int i = 0; i < 4; i++) {
          vec4 r = uRipples[i];
          float age = uTime - r.z;
          if (age > 0.0 && age < 4.5) {
            float d = length(pos.xz - r.xy);
            float wavePhase = d * 6.0 - age * 8.0;
            float envelope = exp(-age * 0.75) * exp(-abs(d - age * 1.3) * 1.2) * r.w;
            ripples += sin(wavePhase) * envelope * 0.22;
          }
        }

        // Center fountain constant circular ripple
        float fountainDist = length(pos.xz - vec2(0.0, -0.5));
        float fountainWave = sin(fountainDist * 8.0 - uTime * 6.0) * exp(-fountainDist * 0.45) * 0.07;

        float totalDisp = w1 + w2 + w3 + ripples + fountainWave;
        pos.y += totalDisp;
        vWave = totalDisp;

        // Normal computation
        vec3 n = vec3(
          -(cos(pos.x * 0.7 + uTime * 1.3) * 0.09 + cos(pos.x * 1.6 - uTime * 1.4) * 0.1),
          1.0,
          -(cos(pos.z * 0.7 + uTime * 1.0) * 0.09 + sin(pos.z * 2.8 + uTime * 2.0) * 0.08)
        );
        vNormal = normalize(normalMatrix * n);

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uDeepColor;
      uniform vec3 uSurfaceColor;
      uniform vec3 uHighlightColor;
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying float vWave;

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);

        // Fresnel reflection
        float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.2);

        // Water depth mix
        vec3 waterColor = mix(uDeepColor, uSurfaceColor, vWave * 3.0 + 0.5);

        // Specular sun/lantern reflection
        vec3 lightDir = normalize(vec3(0.4, 0.8, 0.5));
        vec3 halfDir = normalize(lightDir + viewDir);
        float spec = pow(max(dot(normal, halfDir), 0.0), 40.0);

        // Caustic ripple shimmer
        float caustic = sin(vUv.x * 55.0 + sin(uTime * 2.2)) * sin(vUv.y * 55.0 + cos(uTime * 1.9));
        caustic = smoothstep(0.45, 0.95, caustic) * 0.18;

        vec3 finalColor = waterColor + uHighlightColor * (fresnel * 0.8 + spec * 1.1 + caustic);
        gl_FragColor = vec4(finalColor, 0.92);
      }
    `,
    transparent: true,
  });

  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.receiveShadow = true;
  scene.add(waterMesh);

  // Stone basin border surrounding pond
  const pondRimGeo = new THREE.TorusGeometry(12.5, 0.45, 12, 48);
  pondRimGeo.rotateX(Math.PI / 2);
  pondRimGeo.scale(1.15, 1, 0.95);
  pondRimGeo.translate(0, -1.75, -0.5);
  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x242d27,
    roughness: 0.85,
    metalness: 0.1,
  });
  const pondRim = new THREE.Mesh(pondRimGeo, stoneMat);
  pondRim.receiveShadow = true;
  scene.add(pondRim);

  // Ground terrace lawn surrounding estate
  const groundGeo = new THREE.PlaneGeometry(60, 50);
  groundGeo.rotateX(-Math.PI / 2);
  groundGeo.translate(0, -1.82, -2);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x0c2117,
    roughness: 0.95,
    metalness: 0.05,
  });
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  // Fountain center nozzle & water spray
  const fountainGroup = new THREE.Group();
  fountainGroup.position.set(0, -1.8, -0.5);

  const fountainBaseGeo = new THREE.CylinderGeometry(1.2, 1.6, 0.6, 24);
  const fountainBase = new THREE.Mesh(fountainBaseGeo, stoneMat);
  fountainBase.position.y = 0.3;
  fountainGroup.add(fountainBase);

  // Fountain spray particles
  const sprayCount = 140;
  const sprayGeo = new THREE.BufferGeometry();
  const sprayPos = new Float32Array(sprayCount * 3);
  const sprayVel = [];

  for (let i = 0; i < sprayCount; i++) {
    sprayPos[i * 3 + 0] = 0;
    sprayPos[i * 3 + 1] = 0.6;
    sprayPos[i * 3 + 2] = 0;

    const angle = Math.random() * Math.PI * 2;
    const speed = 0.04 + Math.random() * 0.05;
    const upward = 0.12 + Math.random() * 0.09;
    sprayVel.push({
      x: Math.cos(angle) * speed,
      y: upward,
      z: Math.sin(angle) * speed,
      life: Math.random() * 1.5,
    });
  }
  sprayGeo.setAttribute('position', new THREE.BufferAttribute(sprayPos, 3));

  const sprayMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.18,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
  });
  const sprayParticles = new THREE.Points(sprayGeo, sprayMat);
  fountainGroup.add(sprayParticles);
  scene.add(fountainGroup);

  // -------------------------------------------------------------------------
  // 4. Authentic 3D Architectural Pavilion (Curved Facade from Photo)
  // -------------------------------------------------------------------------
  const pavilionGroup = new THREE.Group();
  pavilionGroup.position.set(0, 0.8, -12);

  // Curved backdrop textured with the real signature architecture
  const pavilionTex = textureLoader.load('media/img/space-building.webp');
  pavilionTex.wrapS = THREE.ClampToEdgeWrapping;
  pavilionTex.wrapT = THREE.ClampToEdgeWrapping;

  // Arc cylinder segment for true 3D architectural curvature
  const pavilionGeo = new THREE.CylinderGeometry(18, 18, 8.5, 36, 1, true, -Math.PI * 0.35, Math.PI * 0.7);
  const pavilionMat = new THREE.MeshStandardMaterial({
    map: pavilionTex,
    roughness: 0.65,
    metalness: 0.15,
    side: THREE.DoubleSide,
  });
  const pavilionMesh = new THREE.Mesh(pavilionGeo, pavilionMat);
  pavilionMesh.castShadow = true;
  pavilionMesh.receiveShadow = true;
  pavilionGroup.add(pavilionMesh);

  // Glowing interior warm light spillage from windows
  const pavilionInteriorLight = new THREE.PointLight(0xf59e0b, 3.5, 20, 1.8);
  pavilionInteriorLight.position.set(0, 2.0, 1.5);
  pavilionGroup.add(pavilionInteriorLight);
  scene.add(pavilionGroup);

  // -------------------------------------------------------------------------
  // 5. 3D Tap Bar & Taproom Landmark (Left Zone)
  // -------------------------------------------------------------------------
  const barGroup = new THREE.Group();
  barGroup.position.set(-8.5, 0.2, -4.5);
  barGroup.rotation.y = 0.55;

  const barTex = textureLoader.load('media/img/space-bar.webp');
  const barPlaneGeo = new THREE.PlaneGeometry(6.5, 4.2);
  const barPlaneMat = new THREE.MeshStandardMaterial({
    map: barTex,
    roughness: 0.6,
    metalness: 0.2,
  });
  const barMesh = new THREE.Mesh(barPlaneGeo, barPlaneMat);
  barMesh.castShadow = true;
  barGroup.add(barMesh);

  // Warm bar neon under-glow
  const barLight = new THREE.PointLight(0xf5d061, 3.2, 12, 1.6);
  barLight.position.set(0, -0.4, 1.2);
  barGroup.add(barLight);
  scene.add(barGroup);

  // -------------------------------------------------------------------------
  // 6. 3D Garden Lounge & Tree Canopy Landmark (Right Zone)
  // -------------------------------------------------------------------------
  const loungeGroup = new THREE.Group();
  loungeGroup.position.set(8.5, 0.4, -5.0);
  loungeGroup.rotation.y = -0.55;

  const loungeTex = textureLoader.load('media/img/venue-wide.webp');
  const loungePlaneGeo = new THREE.PlaneGeometry(7.2, 4.4);
  const loungePlaneMat = new THREE.MeshStandardMaterial({
    map: loungeTex,
    roughness: 0.7,
    metalness: 0.1,
  });
  const loungeMesh = new THREE.Mesh(loungePlaneGeo, loungePlaneMat);
  loungeMesh.castShadow = true;
  loungeGroup.add(loungeMesh);

  const loungeLight = new THREE.PointLight(0xe8861d, 2.8, 12, 1.6);
  loungeLight.position.set(0, 0.2, 1.2);
  loungeGroup.add(loungeLight);
  scene.add(loungeGroup);

  // -------------------------------------------------------------------------
  // 7. Floating 3D Curved Cinematic Monolith (Live Video Texture Portal)
  // -------------------------------------------------------------------------
  const videoGroup = new THREE.Group();
  videoGroup.position.set(-3.2, 1.4, -1.8);
  videoGroup.rotation.y = 0.32;

  // Video element streaming the authentic reel
  const videoEl = document.createElement('video');
  videoEl.src = 'media/video/reel-golden-hour.mp4';
  videoEl.crossOrigin = 'anonymous';
  videoEl.loop = true;
  videoEl.muted = true;
  videoEl.playsInline = true;
  videoEl.autoplay = true;
  videoEl.play().catch(() => {});

  const videoTex = new THREE.VideoTexture(videoEl);
  videoTex.minFilter = THREE.LinearFilter;
  videoTex.magFilter = THREE.LinearFilter;

  // Curved glass screen geometry
  const screenW = 4.8;
  const screenH = 2.8;
  const screenGeo = new THREE.PlaneGeometry(screenW, screenH, 32, 1);
  const screenPos = screenGeo.attributes.position;
  // Curve screen slightly along X for curved monitor look
  for (let i = 0; i < screenPos.count; i++) {
    const x = screenPos.getX(i);
    screenPos.setZ(i, -Math.pow(x / (screenW * 0.5), 2.0) * 0.22);
  }
  screenGeo.computeVertexNormals();

  const screenMat = new THREE.MeshStandardMaterial({
    map: videoTex,
    roughness: 0.2,
    metalness: 0.1,
    emissive: 0xffffff,
    emissiveMap: videoTex,
    emissiveIntensity: 0.85,
  });
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  videoGroup.add(screenMesh);

  // Sleek glass frame around screen
  const frameGeo = new THREE.BoxGeometry(screenW + 0.2, screenH + 0.2, 0.1);
  const frameMat = new THREE.MeshPhysicalMaterial({
    color: 0x1a2e24,
    metalness: 0.8,
    roughness: 0.2,
    clearcoat: 1.0,
  });
  const frameMesh = new THREE.Mesh(frameGeo, frameMat);
  frameMesh.position.z = -0.06;
  videoGroup.add(frameMesh);

  // Dynamic light cast by video onto water and mist
  const videoGlowLight = new THREE.PointLight(0xf5d061, 2.5, 9, 1.8);
  videoGlowLight.position.set(0, -0.6, 1.5);
  videoGroup.add(videoGlowLight);
  scene.add(videoGroup);

  // -------------------------------------------------------------------------
  // 8. Foreground 3D Tasting Deck & Photorealistic Craft Drink Simulator
  // -------------------------------------------------------------------------
  const tastingGroup = new THREE.Group();
  tastingGroup.position.set(2.8, -0.4, 4.2);

  // Rustic Timber Tasting Table Counter
  const tableGeo = new THREE.BoxGeometry(3.6, 0.2, 2.4);
  const tableMat = new THREE.MeshStandardMaterial({
    color: 0x221810,
    roughness: 0.65,
    metalness: 0.1,
  });
  const tableMesh = new THREE.Mesh(tableGeo, tableMat);
  tableMesh.position.y = -0.1;
  tableMesh.receiveShadow = true;
  tastingGroup.add(tableMesh);

  // Craft Drink Assembly
  const drinkGroup = new THREE.Group();
  drinkGroup.position.set(0, 0.85, 0);
  tastingGroup.add(drinkGroup);

  // Glass Physical Material (IOR 1.52, Transmission 0.98, dispersion)
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.98,
    opacity: 1,
    transparent: true,
    roughness: 0.02,
    ior: 1.52,
    thickness: 0.9,
    specularIntensity: 1.0,
    specularColor: new THREE.Color(0xffffff),
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    envMapIntensity: 2.5,
  });

  // Coupe Glass Geometry
  function createCoupeGeo() {
    const pts = [];
    pts.push(new THREE.Vector2(0.001, -1.0));
    pts.push(new THREE.Vector2(0.55, -1.0));
    pts.push(new THREE.Vector2(0.52, -0.96));
    pts.push(new THREE.Vector2(0.08, -0.9));
    pts.push(new THREE.Vector2(0.06, 0.0));
    pts.push(new THREE.Vector2(0.12, 0.15));
    pts.push(new THREE.Vector2(0.45, 0.3));
    pts.push(new THREE.Vector2(0.95, 0.7));
    pts.push(new THREE.Vector2(1.05, 1.05));
    // Rim
    pts.push(new THREE.Vector2(1.03, 1.06));
    pts.push(new THREE.Vector2(0.99, 1.05));
    // Bowl interior
    pts.push(new THREE.Vector2(0.9, 0.7));
    pts.push(new THREE.Vector2(0.4, 0.35));
    pts.push(new THREE.Vector2(0.001, 0.28));
    return new THREE.LatheGeometry(pts, 40);
  }

  // Pint Glass Geometry
  function createPintGeo() {
    const pts = [];
    pts.push(new THREE.Vector2(0.001, -0.9));
    pts.push(new THREE.Vector2(0.52, -0.9));
    pts.push(new THREE.Vector2(0.54, -0.84));
    pts.push(new THREE.Vector2(0.65, 0.3));
    pts.push(new THREE.Vector2(0.78, 1.15));
    // Rim
    pts.push(new THREE.Vector2(0.77, 1.17));
    pts.push(new THREE.Vector2(0.73, 1.15));
    // Interior
    pts.push(new THREE.Vector2(0.61, 0.3));
    pts.push(new THREE.Vector2(0.48, -0.82));
    pts.push(new THREE.Vector2(0.001, -0.82));
    return new THREE.LatheGeometry(pts, 40);
  }

  let glassMesh = new THREE.Mesh(createPintGeo(), glassMat);
  glassMesh.castShadow = true;
  drinkGroup.add(glassMesh);

  // Volumetric Liquid with Inertial Sloshing Physics
  const liquidMat = new THREE.MeshPhysicalMaterial({
    color: 0xf5a623,
    transmission: 0.88,
    opacity: 1,
    transparent: true,
    roughness: 0.08,
    ior: 1.34,
    thickness: 1.4,
    attenuationColor: new THREE.Color(0xd97706),
    attenuationDistance: 0.6,
  });

  const liquidGeo = new THREE.CylinderGeometry(0.7, 0.48, 1.6, 32);
  liquidGeo.translate(0, 0.1, 0);
  const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
  drinkGroup.add(liquidMesh);

  // Foam Head (for beer)
  const foamGeo = new THREE.CylinderGeometry(0.74, 0.7, 0.32, 32);
  foamGeo.translate(0, 0.98, 0);
  const foamMat = new THREE.MeshStandardMaterial({
    color: 0xfffaea,
    roughness: 0.92,
    metalness: 0.05,
  });
  const foamMesh = new THREE.Mesh(foamGeo, foamMat);
  drinkGroup.add(foamMesh);

  // Floating Lime Wheel Garnish (for cocktail)
  const limeGroup = new THREE.Group();
  limeGroup.position.set(0.65, 1.05, 0);
  limeGroup.rotation.z = -0.45;
  limeGroup.visible = false;

  const limeRindGeo = new THREE.TorusGeometry(0.38, 0.06, 12, 28);
  const limeRindMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.6 });
  const limeRind = new THREE.Mesh(limeRindGeo, limeRindMat);
  limeGroup.add(limeRind);

  const limePulpGeo = new THREE.CircleGeometry(0.36, 16);
  const limePulpMat = new THREE.MeshPhysicalMaterial({
    color: 0x86efac,
    transmission: 0.7,
    roughness: 0.3,
    side: THREE.DoubleSide,
  });
  const limePulp = new THREE.Mesh(limePulpGeo, limePulpMat);
  limeGroup.add(limePulp);
  drinkGroup.add(limeGroup);

  // Rising Effervescent Carbonation Micro-Bubbles
  const bubbleCount = 42;
  const bubbleGeo = new THREE.SphereGeometry(0.024, 8, 8);
  const bubbleMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.9,
    roughness: 0.1,
    transparent: true,
    opacity: 0.85,
  });
  const bubbleInstanced = new THREE.InstancedMesh(bubbleGeo, bubbleMat, bubbleCount);
  const bubbleDummy = new THREE.Object3D();
  const bubbleData = [];

  for (let i = 0; i < bubbleCount; i++) {
    const x = (Math.random() - 0.5) * 0.75;
    const y = -0.7 + Math.random() * 1.5;
    const z = (Math.random() - 0.5) * 0.75;
    const speed = 0.4 + Math.random() * 0.6;
    bubbleData.push({ x, y, z, speed });
    bubbleDummy.position.set(x, y, z);
    bubbleDummy.updateMatrix();
    bubbleInstanced.setMatrixAt(i, bubbleDummy.matrix);
  }
  bubbleInstanced.instanceMatrix.needsUpdate = true;
  drinkGroup.add(bubbleInstanced);

  // Dedicated soft spotlight on the tasting drink
  const drinkSpotlight = new THREE.SpotLight(0xfff1d6, 3.8, 8, Math.PI / 4, 0.4);
  drinkSpotlight.position.set(1.5, 3.5, 2.0);
  drinkSpotlight.target = drinkGroup;
  tastingGroup.add(drinkSpotlight);
  scene.add(tastingGroup);

  // Slosh physics state variables
  let sloshX = 0, sloshZ = 0;
  let sloshVelX = 0, sloshVelZ = 0;

  // -------------------------------------------------------------------------
  // 9. Volumetric Hanging Lanterns & 3D Glowing Fireflies
  // -------------------------------------------------------------------------
  const lanternGroup = new THREE.Group();
  const lanternPositions = [
    { x: -5.5, y: 2.4, z: -2.0, color: 0xf59e0b, intensity: 3.2 },
    { x: 5.2, y: 2.8, z: -2.8, color: 0xf5d061, intensity: 3.0 },
    { x: -2.8, y: 3.6, z: -6.5, color: 0xe3c79b, intensity: 2.2 },
    { x: 3.2, y: 3.2, z: -5.8, color: 0xf5d061, intensity: 2.5 },
    { x: 0.0, y: 4.2, z: -8.5, color: 0xf6ad55, intensity: 3.5 },
  ];

  const lanternMeshGeo = new THREE.CylinderGeometry(0.24, 0.32, 0.65, 16);
  const lanternMeshMat = new THREE.MeshStandardMaterial({
    color: 0x1f140a,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.95,
    roughness: 0.5,
  });

  lanternPositions.forEach((pos) => {
    const lMesh = new THREE.Mesh(lanternMeshGeo, lanternMeshMat);
    lMesh.position.set(pos.x, pos.y, pos.z);

    const lLight = new THREE.PointLight(pos.color, pos.intensity, 14, 1.8);
    lLight.position.set(pos.x, pos.y, pos.z);

    lanternGroup.add(lMesh);
    lanternGroup.add(lLight);
  });
  scene.add(lanternGroup);

  // 250 Volumetric Glowing Firefly Particles
  const fireflyCount = 250;
  const fireflyGeo = new THREE.BufferGeometry();
  const ffPositions = new Float32Array(fireflyCount * 3);
  const ffScales = new Float32Array(fireflyCount);
  const ffPhases = new Float32Array(fireflyCount);

  for (let i = 0; i < fireflyCount; i++) {
    ffPositions[i * 3 + 0] = (Math.random() - 0.5) * 28;
    ffPositions[i * 3 + 1] = -1.2 + Math.random() * 8.5;
    ffPositions[i * 3 + 2] = (Math.random() - 0.5) * 22;
    ffScales[i] = Math.random() * 2.8 + 1.2;
    ffPhases[i] = Math.random() * Math.PI * 2;
  }
  fireflyGeo.setAttribute('position', new THREE.BufferAttribute(ffPositions, 3));
  fireflyGeo.setAttribute('scale', new THREE.BufferAttribute(ffScales, 1));
  fireflyGeo.setAttribute('phase', new THREE.BufferAttribute(ffPhases, 1));

  const fireflyMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0xf5d061) },
    },
    vertexShader: `
      uniform float uTime;
      attribute float scale;
      attribute float phase;
      varying float vAlpha;

      void main() {
        vec3 pos = position;
        pos.x += sin(uTime * 0.45 + phase) * 0.7;
        pos.y += sin(uTime * 0.65 + phase * 2.0) * 0.45 + cos(uTime * 0.35 + pos.x) * 0.25;
        pos.z += cos(uTime * 0.55 + phase) * 0.6;

        vAlpha = 0.35 + 0.65 * sin(uTime * 2.4 + phase);

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = scale * (42.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vAlpha;

      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        float intensity = pow(1.0 - dist * 2.0, 2.2);
        gl_FragColor = vec4(uColor, intensity * vAlpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const fireflySystem = new THREE.Points(fireflyGeo, fireflyMat);
  scene.add(fireflySystem);

  // -------------------------------------------------------------------------
  // 10. Interactive Camera Waypoints & Smooth Bezier Navigation
  // -------------------------------------------------------------------------
  const waypoints = {
    overview: {
      pos: new THREE.Vector3(0, 3.2, 9.5),
      target: new THREE.Vector3(0, 0.6, 0),
    },
    bar: {
      pos: new THREE.Vector3(-6.2, 1.8, -0.5),
      target: new THREE.Vector3(-8.5, 0.8, -4.5),
    },
    drink: {
      pos: new THREE.Vector3(2.8, 0.9, 6.8),
      target: new THREE.Vector3(2.8, 0.45, 4.2),
    },
    pond: {
      pos: new THREE.Vector3(0, 0.8, 3.8),
      target: new THREE.Vector3(0, -0.6, -1.5),
    },
  };

  let targetCamPos = waypoints.overview.pos.clone();
  let targetCamLook = waypoints.overview.target.clone();

  // Pointer drag orbit controls with smooth momentum
  let isDragging = false;
  let prevPointerX = 0, prevPointerY = 0;
  let orbitRotX = 0, orbitRotY = 0;
  let orbitVelX = 0, orbitVelY = 0;

  window.addEventListener('pointerdown', (e) => {
    // Only capture drag if clicking directly on canvas or stage overlay
    if (e.target.closest('#farmGlCanvas, .hero-3d-stage, .hero')) {
      isDragging = true;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
    }
  });

  window.addEventListener('pointermove', (e) => {
    const mouseNormX = (e.clientX / window.innerWidth) * 2 - 1;
    const mouseNormY = -(e.clientY / window.innerHeight) * 2 + 1;
    waterUniforms.uMouse.value.set(mouseNormX, mouseNormY);

    if (isDragging) {
      const dx = (e.clientX - prevPointerX) * 0.005;
      const dy = (e.clientY - prevPointerY) * 0.005;
      orbitVelX += dx;
      orbitVelY += dy;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;

      // Excite liquid sloshing physics
      sloshVelX += dx * 4.5;
      sloshVelZ += dy * 4.5;
    }
  });

  window.addEventListener('pointerup', () => {
    isDragging = false;
  });

  // Spawn ripple on click/tap
  window.addEventListener('click', (e) => {
    if (!e.target.closest('a, button, input, select')) {
      const rx = (e.clientX / window.innerWidth - 0.5) * 16;
      const rz = (e.clientY / window.innerHeight - 0.5) * 12;
      triggerRipple(rx, rz);
    }
  });

  function triggerRipple(x = 0, z = -0.5) {
    const r = rippleOrigins[rippleIndex % 4];
    r.x = x;
    r.y = z;
    r.z = waterUniforms.uTime.value;
    r.w = 1.0;
    rippleIndex++;
  }

  function swirlDrink() {
    sloshVelX += (Math.random() - 0.5) * 5.0;
    sloshVelZ += (Math.random() - 0.5) * 5.0;
    drinkGroup.rotation.y += 0.4;
  }

  // -------------------------------------------------------------------------
  // 11. External Control Interface
  // -------------------------------------------------------------------------
  farm3D.setWaypoint = (name) => {
    const wp = waypoints[name];
    if (!wp) return;
    farm3D.currentWaypoint = name;
    targetCamPos.copy(wp.pos);
    targetCamLook.copy(wp.target);

    // If zooming onto the drink, trigger a friendly swirl
    if (name === 'drink') swirlDrink();
  };

  farm3D.setAtmosphere = (mode) => {
    farm3D.currentAtmosphere = mode;
    const isNight = mode === 'night';

    // Lerp colors & intensities
    scene.fog.color.copy(isNight ? nightFogColor : goldenFogColor);
    scene.fog.density = isNight ? 0.038 : 0.032;

    ambientLight.color.set(isNight ? 0x0c2419 : 0x382414);
    ambientLight.intensity = isNight ? 1.0 : 1.4;

    mainSunLight.color.set(isNight ? 0x93c5fd : 0xffdfa8);
    mainSunLight.intensity = isNight ? 1.2 : 2.8;

    waterUniforms.uDeepColor.value.set(isNight ? 0x04130d : 0x0a2419);
    waterUniforms.uHighlightColor.value.set(isNight ? 0x67e8f9 : 0xf5d061);
    fireflyMat.uniforms.uColor.value.set(isNight ? 0x86efac : 0xf5d061);

    updateEnvironment(isNight);
  };

  farm3D.setDrinkStyle = (style) => {
    farm3D.currentDrink = style;
    drinkGroup.remove(glassMesh);

    if (style === 'ale') {
      glassMesh.geometry.dispose();
      glassMesh = new THREE.Mesh(createPintGeo(), glassMat);
      liquidMat.color.set(0xf5a623);
      liquidMat.attenuationColor.set(0xd97706);
      liquidMesh.scale.set(1.0, 1.0, 1.0);
      liquidMesh.position.y = 0.1;
      foamMesh.visible = true;
      limeGroup.visible = false;
    } else if (style === 'pomrita') {
      glassMesh.geometry.dispose();
      glassMesh = new THREE.Mesh(createCoupeGeo(), glassMat);
      liquidMat.color.set(0xd946ef);
      liquidMat.attenuationColor.set(0xbe185d);
      liquidMesh.scale.set(1.3, 0.45, 1.3);
      liquidMesh.position.y = 0.48;
      foamMesh.visible = false;
      limeGroup.visible = true;
    } else if (style === 'botanical') {
      glassMesh.geometry.dispose();
      glassMesh = new THREE.Mesh(createCoupeGeo(), glassMat);
      liquidMat.color.set(0x10b981);
      liquidMat.attenuationColor.set(0x047857);
      liquidMesh.scale.set(1.3, 0.45, 1.3);
      liquidMesh.position.y = 0.48;
      foamMesh.visible = false;
      limeGroup.visible = true;
    }
    drinkGroup.add(glassMesh);
    swirlDrink();
  };

  farm3D.swirlDrink = swirlDrink;
  farm3D.triggerRipple = triggerRipple;

  // -------------------------------------------------------------------------
  // 12. Smooth Scroll Camera Integration (Zero Scroll-Locking)
  // -------------------------------------------------------------------------
  let scrollProgress = 0;
  window.addEventListener('scroll', () => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = docH > 0 ? window.scrollY / docH : 0;
  }, { passive: true });

  // -------------------------------------------------------------------------
  // 13. Render Loop (60fps GPU Animated)
  // -------------------------------------------------------------------------
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    const time = clock.getElapsedTime();

    waterUniforms.uTime.value = time;
    fireflyMat.uniforms.uTime.value = time;

    // Orbit momentum damping
    orbitRotX += orbitVelX;
    orbitRotY += orbitVelY;
    orbitVelX *= 0.88;
    orbitVelY *= 0.88;

    // Apply scroll parallax to camera position smoothly
    const scrollDollyY = -scrollProgress * 1.5;
    const scrollDollyZ = -scrollProgress * 2.2;

    // Camera exponential lerp
    const desiredX = targetCamPos.x + orbitRotX * 3.5;
    const desiredY = targetCamPos.y + orbitRotY * 2.0 + scrollDollyY;
    const desiredZ = targetCamPos.z + scrollDollyZ;

    camera.position.x += (desiredX - camera.position.x) * 0.05;
    camera.position.y += (desiredY - camera.position.y) * 0.05;
    camera.position.z += (desiredZ - camera.position.z) * 0.05;

    cameraTarget.x += (targetCamLook.x - cameraTarget.x) * 0.05;
    cameraTarget.y += (targetCamLook.y - cameraTarget.y) * 0.05;
    cameraTarget.z += (targetCamLook.z - cameraTarget.z) * 0.05;
    camera.lookAt(cameraTarget);

    // Fountain spray physics
    const posArr = sprayGeo.attributes.position.array;
    for (let i = 0; i < sprayCount; i++) {
      const v = sprayVel[i];
      posArr[i * 3 + 0] += v.x;
      posArr[i * 3 + 1] += v.y;
      posArr[i * 3 + 2] += v.z;
      v.y -= 0.0035; // gravity

      if (posArr[i * 3 + 1] < 0) {
        posArr[i * 3 + 0] = 0;
        posArr[i * 3 + 1] = 0.6;
        posArr[i * 3 + 2] = 0;
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.035 + Math.random() * 0.045;
        v.x = Math.cos(angle) * speed;
        v.y = 0.11 + Math.random() * 0.08;
        v.z = Math.sin(angle) * speed;
      }
    }
    sprayGeo.attributes.position.needsUpdate = true;

    // Liquid sloshing spring-damper physics
    const springK = 28.0;
    const damping = 4.2;
    const ax = -springK * sloshX - damping * sloshVelX;
    const az = -springK * sloshZ - damping * sloshVelZ;
    sloshVelX += ax * dt;
    sloshVelZ += az * dt;
    sloshX += sloshVelX * dt;
    sloshZ += sloshVelZ * dt;

    liquidMesh.rotation.z = sloshX * 0.22;
    liquidMesh.rotation.x = sloshZ * 0.22;
    foamMesh.rotation.z = sloshX * 0.22;
    foamMesh.rotation.x = sloshZ * 0.22;

    // Rising micro-bubbles animation
    for (let i = 0; i < bubbleCount; i++) {
      const b = bubbleData[i];
      b.y += dt * b.speed;
      if (b.y > 0.85) b.y = -0.7;
      bubbleDummy.position.set(b.x, b.y, b.z);
      bubbleDummy.updateMatrix();
      bubbleInstanced.setMatrixAt(i, bubbleDummy.matrix);
    }
    bubbleInstanced.instanceMatrix.needsUpdate = true;

    // Swaying lanterns in the evening breeze
    lanternGroup.children.forEach((obj, idx) => {
      if (obj.isMesh) {
        obj.rotation.z = Math.sin(time * 1.3 + idx) * 0.08;
        obj.rotation.x = Math.cos(time * 1.1 + idx) * 0.06;
      }
    });

    // Gentle hover float on tasting drink
    drinkGroup.rotation.y += dt * 0.2;

    renderer.render(scene, camera);
  }
  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  // -------------------------------------------------------------------------
  // 14. Setup Interactive HUD Controls
  // -------------------------------------------------------------------------
  function setupFarmHud() {
    const waypointBtns = document.querySelectorAll('.farm-hud-waypoints .farm-hud-btn');
    waypointBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const wp = btn.dataset.waypoint;
        if (wp && farm3D.setWaypoint) {
          farm3D.setWaypoint(wp);
          waypointBtns.forEach((b) => b.classList.remove('is-active'));
          btn.classList.add('is-active');
        }
      });
    });

    const atmoBtn = document.getElementById('hudAtmoToggle');
    if (atmoBtn) {
      let isNight = false;
      atmoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isNight = !isNight;
        const mode = isNight ? 'night' : 'golden';
        farm3D.setAtmosphere(mode);
        const icon = atmoBtn.querySelector('.hud-atmo-icon');
        const text = atmoBtn.querySelector('.hud-atmo-text');
        if (icon) icon.textContent = isNight ? '🌙' : '🌅';
        if (text) text.textContent = isNight ? 'Night Garden' : 'Golden Hour';
        atmoBtn.classList.toggle('is-night', isNight);
      });
    }

    const drinkBtn = document.getElementById('hudDrinkStyleBtn');
    if (drinkBtn) {
      const styles = [
        { id: 'ale', name: 'Craft Ale', icon: '🍺' },
        { id: 'pomrita', name: 'Pomrita Coupe', icon: '🍸' },
        { id: 'botanical', name: 'Botanical Tonic', icon: '🌿' },
      ];
      let styleIdx = 0;
      drinkBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        styleIdx = (styleIdx + 1) % styles.length;
        const cur = styles[styleIdx];
        farm3D.setDrinkStyle(cur.id);
        const icon = drinkBtn.querySelector('.hud-drink-icon');
        const text = drinkBtn.querySelector('.hud-drink-text');
        if (icon) icon.textContent = cur.icon;
        if (text) text.textContent = cur.name;
      });
    }

    const swirlBtn = document.getElementById('hudSwirlBtn');
    if (swirlBtn) {
      swirlBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        swirlDrink();
      });
    }
  }

  // Run HUD setup after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupFarmHud);
  } else {
    setupFarmHud();
  }

  return farm3D;
}

