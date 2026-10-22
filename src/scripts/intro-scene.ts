// Abertura 3D da home. Câmera cinematográfica em volta de uma conexão de latão
// vazando diante de uma parede de concreto; a chave de grifo aperta a porca, o
// vazamento para e o cano desce, revelando o site por trás da cena.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

export type IntroStage = 'leak' | 'fix' | 'ok';

export interface IntroHandle {
  done: Promise<void>;
  skip: () => void;
  dispose: () => void;
}

export interface IntroCallbacks {
  onStage: (stage: IntroStage) => void;
  // Altura (px, do topo da tela) até onde o site já está revelado
  onReveal: (px: number) => void;
}

// Roteiro em segundos
const T = {
  leakStart: 0.25,
  wrenchIn: 1.7,
  grip: 2.35,
  fixed: 3.65,
  wrenchOut: 3.95,
  pullBack: 4.1,
  descend: 5.0,
  end: 6.3,
};

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const phase = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// ---------- texturas procedurais ----------
function canvasTexture(size: number, draw: (g: CanvasRenderingContext2D, s: number) => void, srgb = false) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d')!, size);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function concrete(g: CanvasRenderingContext2D, s: number, base: number) {
  g.fillStyle = `rgb(${base},${base},${base + 4})`;
  g.fillRect(0, 0, s, s);
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * s;
    const y = Math.random() * s;
    const r = 20 + Math.random() * 90;
    const v = base + (Math.random() - 0.5) * 30;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(${v},${v},${v + 3},0.35)`);
    grad.addColorStop(1, `rgba(${v},${v},${v},0)`);
    g.fillStyle = grad;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  for (let i = 0; i < 9000; i++) {
    const v = base + (Math.random() - 0.5) * 70;
    g.fillStyle = `rgba(${v},${v},${v},${Math.random() * 0.5})`;
    g.fillRect(Math.random() * s, Math.random() * s, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
}

function brushed(g: CanvasRenderingContext2D, s: number) {
  g.fillStyle = 'rgb(90,90,90)';
  g.fillRect(0, 0, s, s);
  for (let i = 0; i < 1400; i++) {
    const v = 60 + Math.random() * 90;
    g.strokeStyle = `rgba(${v},${v},${v},0.35)`;
    g.lineWidth = Math.random() * 1.5;
    const y = Math.random() * s;
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(s, y + (Math.random() - 0.5) * 2);
    g.stroke();
  }
}

// ---------- chave de grifo ----------
function buildWrench(red: THREE.Material, steel: THREE.Material, dark: THREE.Material) {
  const group = new THREE.Group();
  const bevel = { bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.018, bevelSegments: 3, curveSegments: 10 };

  // cabo levemente afunilado
  const handleShape = new THREE.Shape();
  handleShape.moveTo(-0.07, 0);
  handleShape.lineTo(0.07, 0);
  handleShape.lineTo(0.09, -1.75);
  handleShape.quadraticCurveTo(0, -1.86, -0.09, -1.75);
  handleShape.lineTo(-0.07, 0);
  const handle = new THREE.Mesh(new THREE.ExtrudeGeometry(handleShape, { depth: 0.07, ...bevel }), red);
  handle.position.set(-0.02, -0.34, -0.035);
  const grip = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.45, 8, 20), dark);
  grip.scale.z = 0.7;
  grip.position.set(-0.02, -1.9, 0);

  // mandíbula fixa (gancho), envolvendo a porca por cima
  const hookShape = new THREE.Shape();
  hookShape.moveTo(-0.12, -0.05);
  hookShape.lineTo(-0.12, 0.42);
  hookShape.quadraticCurveTo(-0.12, 0.52, -0.02, 0.52);
  hookShape.lineTo(0.42, 0.52);
  hookShape.quadraticCurveTo(0.5, 0.52, 0.5, 0.44);
  hookShape.lineTo(0.5, 0.3);
  hookShape.lineTo(0.38, 0.3);
  hookShape.lineTo(0.38, 0.38);
  hookShape.lineTo(0.02, 0.38);
  hookShape.lineTo(0.02, -0.05);
  hookShape.lineTo(-0.12, -0.05);
  const hook = new THREE.Mesh(new THREE.ExtrudeGeometry(hookShape, { depth: 0.12, ...bevel }), steel);
  hook.position.set(-0.3, 0, -0.06);

  // mandíbula móvel por baixo
  const heelShape = new THREE.Shape();
  heelShape.moveTo(-0.3, -0.38);
  heelShape.lineTo(0.22, -0.38);
  heelShape.quadraticCurveTo(0.3, -0.38, 0.3, -0.3);
  heelShape.lineTo(0.3, -0.26);
  heelShape.lineTo(-0.3, -0.26);
  heelShape.lineTo(-0.3, -0.38);
  const heel = new THREE.Mesh(new THREE.ExtrudeGeometry(heelShape, { depth: 0.12, ...bevel }), red);
  heel.position.set(-0.02, 0, -0.06);

  // dentes
  const toothGeo = new THREE.ConeGeometry(0.018, 0.04, 4);
  for (let i = 0; i < 9; i++) {
    const top = new THREE.Mesh(toothGeo, steel);
    top.rotation.x = Math.PI;
    top.position.set(-0.26 + i * 0.045, 0.36, 0);
    const bottom = new THREE.Mesh(toothGeo, steel);
    bottom.position.set(-0.26 + i * 0.045, -0.24, 0);
    group.add(top, bottom);
  }

  // porca recartilhada de ajuste
  const knurl = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.16, 28, 1), steel);
  knurl.position.set(-0.36, -0.38, 0);
  const ridgeGeo = new THREE.BoxGeometry(0.012, 0.16, 0.012);
  for (let i = 0; i < 14; i++) {
    const ridge = new THREE.Mesh(ridgeGeo, steel);
    const a = (i / 14) * Math.PI * 2;
    ridge.position.set(-0.36 + Math.cos(a) * 0.1, -0.38, Math.sin(a) * 0.1);
    group.add(ridge);
  }

  // haste que liga o gancho à mandíbula de baixo
  const shank = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.5, 0.1), steel);
  shank.position.set(-0.36, -0.12, 0);
  group.add(handle, grip, hook, heel, knurl, shank);
  group.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) o.castShadow = true;
  });
  return group;
}

export function startIntro(canvas: HTMLCanvasElement, cb: IntroCallbacks): IntroHandle {
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  // ?introSpeed=0.25 deixa a abertura em câmera lenta (útil para revisar)
  const params = new URLSearchParams(location.search);
  const speed = Number(params.get('introSpeed')) || 1;
  // ?introStep=0.04 avança um passo fixo por quadro (revisão quadro a quadro)
  const fixedStep = Number(params.get('introStep')) || 0;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
    outputBufferType: THREE.HalfFloatType,
  });
  let dpr = Math.min(window.devicePixelRatio, small ? 1.5 : 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05070b);
  scene.fog = new THREE.FogExp2(0x05070b, 0.09);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
  scene.environment = env;
  scene.environmentIntensity = 0.4;

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.05, 60);

  // ---------- luz ----------
  const key = new THREE.SpotLight(0xfff1dd, 45, 18, 0.5, 0.65, 1.6);
  key.position.set(2.5, 4.2, 3.2);
  key.castShadow = true;
  key.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  scene.add(key, key.target);
  const fill = new THREE.PointLight(0x3d8bff, 6, 9, 1.6);
  fill.position.set(-2.4, 0.4, 1.8);
  scene.add(fill);
  scene.add(new THREE.HemisphereLight(0x8fb4ff, 0x0b0b0b, 0.15));

  // ---------- ambiente ----------
  const PIPE_Y = 0;
  const FLOOR_Y = -1.55;
  const WALL_Z = -0.75;

  const wallMap = canvasTexture(512, (g, s) => concrete(g, s, 118), true);
  wallMap.repeat.set(3, 2);
  const wallBump = canvasTexture(512, (g, s) => concrete(g, s, 128));
  wallBump.repeat.set(3, 2);
  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 8),
    new THREE.MeshStandardMaterial({ map: wallMap, bumpMap: wallBump, bumpScale: 2.5, roughness: 0.92, color: 0x9aa3b0 }),
  );
  wall.position.set(0, 1.4, WALL_Z);
  wall.receiveShadow = true;
  scene.add(wall);

  const floorMap = canvasTexture(512, (g, s) => concrete(g, s, 70), true);
  floorMap.repeat.set(4, 4);
  const floorMat = new THREE.MeshPhysicalMaterial({
    map: floorMap,
    color: 0x6b7280,
    roughness: 0.55,
    clearcoat: 0,
    clearcoatRoughness: 0.08,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = FLOOR_Y;
  floor.receiveShadow = true;
  scene.add(floor);

  // poça: espelho d'água escuro que cresce
  const puddle = new THREE.Mesh(
    new THREE.CircleGeometry(1, 64),
    new THREE.MeshPhysicalMaterial({ color: 0x0c1a2a, roughness: 0.02, metalness: 0.1, clearcoat: 1, transparent: true, opacity: 0.85 }),
  );
  puddle.rotation.x = -Math.PI / 2;
  puddle.position.set(0.15, FLOOR_Y + 0.002, 0.55);
  puddle.receiveShadow = true;
  puddle.visible = false;
  scene.add(puddle);

  // ---------- cano + conexão ----------
  const pipeRig = new THREE.Group();
  pipeRig.position.y = PIPE_Y;
  scene.add(pipeRig);

  const brushedRough = canvasTexture(256, brushed);
  brushedRough.repeat.set(1, 18);
  const steelPipe = new THREE.MeshPhysicalMaterial({
    color: 0xa9b0ba,
    metalness: 1,
    roughness: 0.42,
    roughnessMap: brushedRough,
    anisotropy: 0.3,
  });
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 16, 64, 1, true), steelPipe);
  pipe.rotation.z = Math.PI / 2;
  pipe.castShadow = true;
  pipeRig.add(pipe);

  const brass = new THREE.MeshPhysicalMaterial({ color: 0xc9a25a, metalness: 1, roughness: 0.3 });
  const brassDark = new THREE.MeshPhysicalMaterial({ color: 0x9c7a3c, metalness: 1, roughness: 0.42 });
  const union = new THREE.Group();
  pipeRig.add(union);
  const threadGeo = new THREE.TorusGeometry(0.175, 0.01, 8, 48);
  for (const x of [-0.33, 0.33]) {
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.22, 48), brassDark);
    collar.rotation.z = Math.PI / 2;
    collar.position.x = x;
    union.add(collar);
    // roscas aparentes
    for (let i = 0; i < 4; i++) {
      const thread = new THREE.Mesh(threadGeo, brass);
      thread.rotation.y = Math.PI / 2;
      thread.position.x = x + Math.sign(x) * (0.13 + i * 0.03);
      union.add(thread);
    }
  }
  // porca sextavada central: é ela que a chave gira
  const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.36, 6, 1), brass);
  nut.rotation.z = Math.PI / 2;
  const nutSpin = new THREE.Group();
  nutSpin.add(nut);
  union.add(nutSpin);
  union.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) o.castShadow = true;
  });

  // abraçadeiras presas na parede segurando o cano
  const strapMat = new THREE.MeshStandardMaterial({ color: 0x2a2f37, metalness: 0.8, roughness: 0.45 });
  for (const x of [-2.4, 2.4]) {
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.025, 10, 32, Math.PI), strapMat);
    strap.position.set(x, 0, 0);
    strap.rotation.y = Math.PI / 2;
    strap.rotation.x = Math.PI / 2;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, Math.abs(WALL_Z)), strapMat);
    arm.position.set(x, 0, WALL_Z / 2);
    strap.castShadow = arm.castShadow = true;
    pipeRig.add(strap, arm);
  }

  // ---------- chave ----------
  const red = new THREE.MeshPhysicalMaterial({ color: 0xb3150c, metalness: 0.2, roughness: 0.38, clearcoat: 1, clearcoatRoughness: 0.12 });
  const steel = new THREE.MeshPhysicalMaterial({ color: 0xb9c0c9, metalness: 1, roughness: 0.3 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x15171c, roughness: 0.85 });
  const wrench = buildWrench(red, steel, rubber);
  // a chave fica no plano YZ (perpendicular ao cano) e gira em torno do eixo X
  const wrenchPivot = new THREE.Group();
  const wrenchLocal = new THREE.Group();
  wrenchLocal.add(wrench);
  wrenchLocal.rotation.y = -Math.PI / 2;
  wrenchPivot.add(wrenchLocal);
  pipeRig.add(wrenchPivot);

  // ---------- água ----------
  const MAX = small ? 320 : 520;
  const waterMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.02,
    transmission: 1,
    thickness: 0.04,
    ior: 1.33,
    attenuationColor: new THREE.Color(0x9fdcff),
    attenuationDistance: 0.4,
    specularIntensity: 1,
    envMapIntensity: 1.6,
  });
  const drops = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 10), waterMat, MAX);
  drops.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  drops.frustumCulled = false;
  scene.add(drops);

  const pos = new Float32Array(MAX * 3);
  const vel = new Float32Array(MAX * 3);
  const alive = new Uint8Array(MAX);
  const size = new Float32Array(MAX);

  // névoa fina perto do vazamento
  const mistTex = canvasTexture(64, (g, s) => {
    const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grad.addColorStop(0, 'rgba(220,240,255,0.9)');
    grad.addColorStop(1, 'rgba(220,240,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, s, s);
  });
  const MIST = 60;
  const mistGeo = new THREE.BufferGeometry();
  const mistPos = new Float32Array(MIST * 3).fill(-50);
  const mistVel = new Float32Array(MIST * 3);
  const mistLife = new Float32Array(MIST).fill(-1);
  mistGeo.setAttribute('position', new THREE.BufferAttribute(mistPos, 3).setUsage(THREE.DynamicDrawUsage));
  const mist = new THREE.Points(
    mistGeo,
    new THREE.PointsMaterial({ map: mistTex, size: 0.12, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending }),
  );
  mist.frustumCulled = false;
  scene.add(mist);

  // ondinhas no chão onde as gotas caem
  const RIPPLES = 16;
  const rippleGeo = new THREE.RingGeometry(0.94, 1, 48);
  const ripples: { mesh: THREE.Mesh; life: number; s: number }[] = [];
  for (let i = 0; i < RIPPLES; i++) {
    const m = new THREE.Mesh(rippleGeo, new THREE.MeshBasicMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    m.visible = false;
    scene.add(m);
    ripples.push({ mesh: m, life: -1, s: 0 });
  }
  let rippleNext = 0;
  function addRipple(x: number, z: number, s: number) {
    const r = ripples[rippleNext];
    rippleNext = (rippleNext + 1) % RIPPLES;
    r.life = 0;
    r.s = s;
    r.mesh.visible = true;
    r.mesh.position.set(x, FLOOR_Y + 0.004, z);
  }

  const dummy = new THREE.Object3D();
  const up = new THREE.Vector3(0, 1, 0);
  const dir = new THREE.Vector3();
  const tmp = new THREE.Vector3();

  function spawnDrop(i: number, strength: number) {
    // sai pela emenda da porca, voltado para a câmera e para baixo
    const a = -0.25 + Math.random() * 0.45;
    tmp.set(0.18 + (Math.random() - 0.5) * 0.03, Math.sin(a) * 0.27, Math.cos(a) * 0.27);
    pipeRig.localToWorld(tmp);
    pos[i * 3] = tmp.x;
    pos[i * 3 + 1] = tmp.y;
    pos[i * 3 + 2] = tmp.z;
    const sp = (2.2 + Math.random() * 1.4) * strength;
    vel[i * 3] = (0.25 + (Math.random() - 0.5) * 0.7) * strength;
    vel[i * 3 + 1] = Math.sin(a) * sp * 0.6 + 0.6 * strength;
    vel[i * 3 + 2] = Math.cos(a) * sp;
    size[i] = Math.random() < 0.15 ? 0.022 + Math.random() * 0.02 : 0.007 + Math.random() * 0.012;
    alive[i] = 1;
  }
  function spawnDrip(i: number) {
    // gotas grossas escorrendo por baixo da porca
    tmp.set((Math.random() - 0.5) * 0.3, -0.27, (Math.random() - 0.3) * 0.12);
    pipeRig.localToWorld(tmp);
    pos[i * 3] = tmp.x;
    pos[i * 3 + 1] = tmp.y;
    pos[i * 3 + 2] = tmp.z;
    vel[i * 3] = 0;
    vel[i * 3 + 1] = -0.2;
    vel[i * 3 + 2] = 0;
    size[i] = 0.02 + Math.random() * 0.015;
    alive[i] = 1;
  }
  let cursor = 0;
  function freeSlot() {
    for (let k = 0; k < MAX; k++) {
      cursor = (cursor + 1) % MAX;
      if (!alive[cursor]) return cursor;
    }
    return -1;
  }

  // ---------- pós-processamento ----------
  const bokeh = new BokehPass(scene, camera, { focus: 1.8, aperture: small ? 0.006 : 0.008, maxblur: 0.012 });
  const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.25, 0.4, 1.8);
  let effectsOn = true;
  renderer.setEffects([bokeh]);

  // ---------- câmera: planos do roteiro ----------
  type Shot = { t: number; pos: THREE.Vector3; look: THREE.Vector3 };
  function shots(): Shot[] {
    const portrait = camera.aspect < 0.9;
    // plano final: frontal, cano no terço de cima (mais longe no celular)
    const finalDist = portrait ? 6.4 : 4.4;
    const finalLookY = portrait ? -1.35 : -0.75;
    return [
      { t: 0, pos: new THREE.Vector3(-1.25, -0.3, 1.05), look: new THREE.Vector3(0.05, -0.05, 0) },
      { t: 1.5, pos: new THREE.Vector3(0.55, -0.62, 1.25), look: new THREE.Vector3(0, -0.25, 0.1) },
      { t: 2.35, pos: new THREE.Vector3(1.9, -0.25, 1.35), look: new THREE.Vector3(0, -0.35, 0) },
      { t: 3.6, pos: new THREE.Vector3(1.55, 0.15, 1.9), look: new THREE.Vector3(0, -0.45, 0) },
      { t: 4.9, pos: new THREE.Vector3(0, -0.35, finalDist), look: new THREE.Vector3(0, finalLookY, 0) },
      { t: 99, pos: new THREE.Vector3(0, -0.35, finalDist), look: new THREE.Vector3(0, finalLookY, 0) },
    ];
  }
  let plan = shots();
  const camPos = new THREE.Vector3();
  const camLook = new THREE.Vector3();
  function placeCamera(t: number, shake: number) {
    let i = 0;
    while (i < plan.length - 2 && t > plan[i + 1].t) i++;
    const a = plan[i];
    const b = plan[i + 1];
    const k = easeInOut(phase(t, a.t, b.t));
    camPos.lerpVectors(a.pos, b.pos, k);
    camLook.lerpVectors(a.look, b.look, k);
    // leve balanço de câmera na mão + impacto nos trancos da chave
    const hand = 0.006;
    camPos.x += Math.sin(t * 2.1) * hand + (Math.random() - 0.5) * shake;
    camPos.y += Math.sin(t * 1.7 + 1) * hand + (Math.random() - 0.5) * shake;
    camera.position.copy(camPos);
    camera.lookAt(camLook);
  }

  function layout() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.fov = camera.aspect < 0.9 ? 58 : 42;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    plan = shots();
  }
  layout();
  window.addEventListener('resize', layout);

  // ---------- loop ----------
  const timer = new THREE.Timer();
  timer.connect(document);
  let elapsed = 0;
  let frames = 0;
  let slowFrames = 0;
  let spawnAcc = 0;
  let dripAcc = 0;
  let stage: IntroStage | '' = '';
  let skipped = false;
  let finished = false;
  let resolveDone!: () => void;
  const done = new Promise<void>((r) => (resolveDone = r));
  const projected = new THREE.Vector3();

  function setStage(s: IntroStage) {
    if (stage !== s) {
      stage = s;
      cb.onStage(s);
    }
  }

  function frame() {
    timer.update();
    // os primeiros quadros incluem a compilação dos shaders; não contam no roteiro
    const raw = frames < 2 ? 0 : timer.getDelta();
    frames++;
    // qualidade adaptativa: em aparelho fraco desliga desfoque/brilho e reduz resolução
    if (frames > 8 && frames < 60 && raw > 1 / 26) slowFrames++;
    if (effectsOn && slowFrames > 12 && !fixedStep) {
      effectsOn = false;
      renderer.setEffects([]);
      // água sem refração: bem mais barata em GPU fraca
      waterMat.transmission = 0;
      waterMat.transparent = true;
      waterMat.opacity = 0.75;
      waterMat.color.set(0xcfeeff);
      waterMat.needsUpdate = true;
      renderer.shadowMap.autoUpdate = false;
      dpr = Math.min(dpr, 1);
      renderer.setPixelRatio(dpr);
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    }
    const realDt = fixedStep ? (frames > 2 ? fixedStep : 0) : raw * speed;
    const dt = Math.min(realDt, 1 / 30);
    elapsed += realDt;
    const t = elapsed;
    (window as unknown as { __introT: number }).__introT = t;

    // vazamento: abre forte e fecha conforme a porca é apertada
    const tighten = phase(t, T.grip, T.fixed);
    const leak = phase(t, T.leakStart, T.leakStart + 0.35) * (1 - smooth(tighten));
    if (t > T.leakStart) setStage('leak');
    if (t > T.grip) setStage('fix');
    if (t > T.fixed) setStage('ok');

    // chave: entra por cima/direita, encaixa na porca, dá 3 trancos e sai
    const enter = easeOut(phase(t, T.wrenchIn, T.grip));
    const exit = easeInOut(phase(t, T.wrenchOut, T.pullBack + 0.5));
    const pulls = phase(t, T.grip, T.fixed);
    const pullWave = Math.max(0, Math.sin(pulls * Math.PI * 3));
    const turned = pulls * 1.05;
    wrenchPivot.visible = t > T.wrenchIn - 0.05 && exit < 1;
    wrenchPivot.rotation.x = -0.2 + (1 - enter) * -1.1 + turned * 0.35 + pullWave * 0.32 + exit * 1.6;
    wrenchPivot.position.y = (1 - enter) * 1.6 + exit * 0.4;
    wrenchPivot.position.x = (1 - enter) * 0.9 + exit * 1.6;
    nutSpin.rotation.x = turned * 0.9 + pullWave * 0.18 * (1 - pulls);
    const shake = pullWave > 0.9 ? 0.008 : 0;

    // cano consertado desce, revelando o site por cima
    const fall = easeInOut(phase(t, T.descend, T.end));
    pipeRig.position.y = PIPE_Y - fall * 6;

    placeCamera(t, shake);
    (bokeh.uniforms as { focus: THREE.IUniform<number> }).focus.value = camera.position.distanceTo(tmp.set(0, pipeRig.position.y - 0.15, 0.1));

    // gotas
    spawnAcc += dt * 420 * leak * (small ? 0.65 : 1);
    while (spawnAcc >= 1) {
      spawnAcc -= 1;
      const i = freeSlot();
      if (i >= 0) spawnDrop(i, 0.55 + leak * 0.6);
    }
    // depois do conserto ainda pingam algumas gotas residuais
    const dripping = t > T.leakStart + 0.4 && t < T.fixed + 0.9;
    dripAcc += dripping ? dt * 9 : 0;
    while (dripAcc >= 1) {
      dripAcc -= 1;
      const i = freeSlot();
      if (i >= 0) spawnDrip(i);
    }
    for (let i = 0; i < MAX; i++) {
      if (!alive[i]) {
        dummy.position.set(0, -50, 0);
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        drops.setMatrixAt(i, dummy.matrix);
        continue;
      }
      const ix = i * 3;
      vel[ix + 1] -= 9.8 * dt;
      // arrasto do ar nas gotas pequenas
      const drag = size[i] < 0.015 ? 0.985 : 0.995;
      vel[ix] *= drag;
      vel[ix + 2] *= drag;
      pos[ix] += vel[ix] * dt;
      pos[ix + 1] += vel[ix + 1] * dt;
      pos[ix + 2] += vel[ix + 2] * dt;
      if (pos[ix + 1] <= FLOOR_Y + size[i]) {
        if (size[i] > 0.012 && Math.random() < 0.5) addRipple(pos[ix], pos[ix + 2], 0.05 + size[i] * 4);
        alive[i] = 0;
        continue;
      }
      tmp.set(pos[ix], pos[ix + 1], pos[ix + 2]);
      if (pos[ix + 2] > 6 || pos[ix + 1] < -12 || tmp.distanceToSquared(camera.position) < 0.12) {
        alive[i] = 0;
        continue;
      }
      dir.set(vel[ix], vel[ix + 1], vel[ix + 2]);
      const sp = dir.length();
      dummy.position.set(pos[ix], pos[ix + 1], pos[ix + 2]);
      if (sp > 0.001) dummy.quaternion.setFromUnitVectors(up, dir.divideScalar(sp));
      const s = size[i];
      dummy.scale.set(s, s * (1 + Math.min(sp * 0.5, 3)), s);
      dummy.updateMatrix();
      drops.setMatrixAt(i, dummy.matrix);
    }
    drops.instanceMatrix.needsUpdate = true;

    // névoa
    for (let i = 0; i < MIST; i++) {
      const ix = i * 3;
      if (mistLife[i] < 0) {
        if (leak > 0.2 && Math.random() < leak * 0.5) {
          tmp.set((Math.random() - 0.5) * 0.4, (Math.random() - 0.3) * 0.3, 0.25);
          pipeRig.localToWorld(tmp);
          mistPos[ix] = tmp.x;
          mistPos[ix + 1] = tmp.y;
          mistPos[ix + 2] = tmp.z;
          mistVel[ix] = (Math.random() - 0.5) * 0.3;
          mistVel[ix + 1] = Math.random() * 0.15;
          mistVel[ix + 2] = 0.3 + Math.random() * 0.5;
          mistLife[i] = 0;
        } else {
          mistPos[ix + 1] = -50;
        }
        continue;
      }
      mistLife[i] += dt;
      mistPos[ix] += mistVel[ix] * dt;
      mistPos[ix + 1] += mistVel[ix + 1] * dt;
      mistPos[ix + 2] += mistVel[ix + 2] * dt;
      if (mistLife[i] > 0.9) mistLife[i] = -1;
    }
    mistGeo.attributes.position.needsUpdate = true;

    // ondinhas
    for (const r of ripples) {
      if (r.life < 0) continue;
      r.life += dt;
      const k = r.life / 0.7;
      if (k >= 1) {
        r.life = -1;
        r.mesh.visible = false;
        continue;
      }
      const s = r.s * (0.3 + k * 2.2);
      r.mesh.scale.set(s, s, 1);
      (r.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.16;
    }

    // poça cresce enquanto vaza; o chão vai ficando molhado
    const wet = clamp01((t - T.leakStart - 0.3) * 0.45);
    puddle.scale.set(0.2 + wet * 1.6, 0.2 + wet * 1.25, 1);
    puddle.visible = wet > 0;
    floorMat.clearcoat = wet * 0.8;
    floorMat.roughness = 0.55 - wet * 0.25;

    renderer.render(scene, camera);

    // linha de revelação: topo do cano projetado na tela
    if (t > T.descend - 0.05) {
      projected.set(0, pipeRig.position.y + 0.32, 0).project(camera);
      cb.onReveal(Math.max(0, (1 - (projected.y * 0.5 + 0.5)) * window.innerHeight));
    }

    if (!finished && (t >= T.end || skipped)) {
      finished = true;
      resolveDone();
    }
  }
  renderer.setAnimationLoop(frame);

  function dispose() {
    renderer.setAnimationLoop(null);
    window.removeEventListener('resize', layout);
    timer.dispose();
    const textures = new Set<THREE.Texture>();
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh && !(o as THREE.Points).isPoints) return;
      m.geometry.dispose();
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      for (const mat of mats) {
        for (const v of Object.values(mat)) if ((v as THREE.Texture)?.isTexture) textures.add(v as THREE.Texture);
        mat.dispose();
      }
    });
    textures.forEach((tx) => tx.dispose());
    bokeh.dispose();
    bloom.dispose();
    env.dispose();
    pmrem.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  }

  return {
    done,
    skip: () => {
      skipped = true;
      resolveDone();
    },
    dispose,
  };
}
