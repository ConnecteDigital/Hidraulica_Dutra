// Abertura 3D da home. Câmera cinematográfica em volta de uma conexão de latão
// vazando diante de uma parede de concreto; a chave de grifo aperta a porca, o
// vazamento para e o cano desce, revelando o site por trás da cena.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export type IntroStage = 'leak' | 'fix' | 'ok';

export interface IntroHandle {
  done: Promise<void>;
  skip: () => void;
  dispose: () => void;
}

export interface IntroCallbacks {
  // Cena preparada (shaders compilados, qualidade escolhida) e já tocando
  onReady: () => void;
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

// Gerador pseudoaleatório com semente: as texturas saem sempre iguais, para a
// cena ao vivo bater exatamente com a imagem de capa (poster) da abertura.
let seed = 0;
function rand() {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// Azulejos/porcelanato com rejunte. bump=true gera o relevo (rejunte escuro)
function tiles(
  g: CanvasRenderingContext2D,
  s: number,
  cols: number,
  base: [number, number, number],
  grout: string,
  groutPx: number,
  bump = false,
) {
  const step = s / cols;
  g.fillStyle = bump ? '#000' : grout;
  g.fillRect(0, 0, s, s);
  for (let y = 0; y < cols; y++) {
    for (let x = 0; x < cols; x++) {
      const v = bump ? 0 : (rand() - 0.5) * 10;
      g.fillStyle = bump ? '#fff' : `rgb(${base[0] + v},${base[1] + v},${base[2] + v})`;
      g.fillRect(x * step + groutPx / 2, y * step + groutPx / 2, step - groutPx, step - groutPx);
      if (!bump) {
        // veios suaves de porcelanato
        for (let k = 0; k < 6; k++) {
          g.strokeStyle = `rgba(255,255,255,${0.04 + rand() * 0.05})`;
          g.lineWidth = 1 + rand() * 3;
          g.beginPath();
          g.moveTo(x * step + rand() * step, y * step);
          g.bezierCurveTo(x * step + rand() * step, y * step + step * 0.4, x * step + rand() * step, y * step + step * 0.6, x * step + rand() * step, y * step + step);
          g.stroke();
        }
      }
    }
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
  });
  let dpr = Math.min(window.devicePixelRatio, 1.5);
  seed = 7;
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.82;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0c0e);
  scene.fog = new THREE.FogExp2(0x0b0c0e, 0.085);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
  scene.environment = env;
  scene.environmentIntensity = 0.4;

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.05, 60);

  // ---------- luz ----------
  const key = new THREE.SpotLight(0xffe6c8, 55, 18, 0.6, 0.7, 1.6);
  key.position.set(2.5, 4.2, 3.2);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  scene.add(key, key.target);
  const fill = new THREE.PointLight(0x9cc4ff, 5, 9, 1.6);
  fill.position.set(-2.4, 0.4, 1.8);
  scene.add(fill);
  // luz de teto do banheiro
  const ceiling = new THREE.PointLight(0xfff4e6, 3, 12, 1.4);
  ceiling.position.set(-0.5, 4, 1.5);
  scene.add(ceiling);
  scene.add(new THREE.HemisphereLight(0xf2f5ff, 0x2a2622, 0.1));

  // ---------- ambiente ----------
  const PIPE_Y = 0;
  const FLOOR_Y = -1.55;
  const WALL_Z = -0.75;

  // parede de azulejo branco (cada peça ~1,2 unidade)
  const wallMap = canvasTexture(512, (g, s) => tiles(g, s, 4, [196, 202, 208], '#80868d', 7), true);
  const wallBump = canvasTexture(512, (g, s) => tiles(g, s, 4, [0, 0, 0], '', 7, true));
  for (const tx of [wallMap, wallBump]) tx.repeat.set(14 / 4.8, 8 / 4.8);
  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 8),
    new THREE.MeshStandardMaterial({ map: wallMap, bumpMap: wallBump, bumpScale: 1.2, roughness: 0.18 }),
  );
  wall.position.set(0, 1.4, WALL_Z);
  wall.receiveShadow = true;
  scene.add(wall);

  // piso de porcelanato (peças grandes), que fica brilhante quando molha
  const floorMap = canvasTexture(512, (g, s) => tiles(g, s, 2, [118, 114, 108], '#4f4b47', 5), true);
  const floorBump = canvasTexture(512, (g, s) => tiles(g, s, 2, [0, 0, 0], '', 5, true));
  for (const tx of [floorMap, floorBump]) tx.repeat.set(14 / 6, 10 / 6);
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorMap,
    bumpMap: floorBump,
    bumpScale: 0.8,
    roughness: 0.4,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = FLOOR_Y;
  floor.receiveShadow = true;
  scene.add(floor);

  // rodapé de azulejo
  const skirting = new THREE.Mesh(new THREE.BoxGeometry(14, 0.18, 0.05), new THREE.MeshStandardMaterial({ color: 0xdfe3e8, roughness: 0.25 }));
  skirting.position.set(0, FLOOR_Y + 0.09, WALL_Z + 0.025);
  skirting.receiveShadow = true;
  scene.add(skirting);

  const chrome = new THREE.MeshStandardMaterial({ color: 0xf2f4f7, metalness: 1, roughness: 0.1 });
  const porcelain = new THREE.MeshStandardMaterial({ color: 0xf6f7f9, roughness: 0.12 });

  // ralo de inox no piso, perto de onde a água cai
  const drain = new THREE.Group();
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.02, 0.62), chrome);
  drain.add(plate);
  for (let i = 0; i < 6; i++) {
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.022, 0.035), new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 1 }));
    slot.position.z = -0.2 + i * 0.08;
    drain.add(slot);
  }
  drain.position.set(1.15, FLOOR_Y + 0.01, 1.0);
  drain.traverse((o) => ((o as THREE.Mesh).receiveShadow = true));
  scene.add(drain);

  // coluna de louça da pia, à esquerda
  const pedestalProfile = [
    new THREE.Vector2(0.0, 0),
    new THREE.Vector2(0.62, 0),
    new THREE.Vector2(0.58, 0.12),
    new THREE.Vector2(0.42, 0.6),
    new THREE.Vector2(0.36, 2.2),
    new THREE.Vector2(0.4, 3.6),
    new THREE.Vector2(0.0, 3.6),
  ];
  const pedestal = new THREE.Mesh(new THREE.LatheGeometry(pedestalProfile, 48), porcelain);
  pedestal.position.set(-2.55, FLOOR_Y, WALL_Z + 0.55);
  pedestal.castShadow = pedestal.receiveShadow = true;
  scene.add(pedestal);
  // cuba da pia (só a parte de baixo aparece no alto do quadro)
  const basin = new THREE.Mesh(new THREE.SphereGeometry(1.5, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), porcelain);
  basin.scale.set(1.2, 0.55, 0.85);
  basin.position.set(-2.55, FLOOR_Y + 4.25, WALL_Z + 0.95);
  basin.castShadow = true;
  scene.add(basin);

  // derivação com registro cromado e flexível trançado subindo para a pia
  const tee = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.55, 24), chrome);
  tee.position.set(-1.35, 0.27, 0);
  const valve = new THREE.Mesh(new THREE.SphereGeometry(0.14, 24, 16), chrome);
  valve.position.set(-1.35, 0.6, 0);
  const valveKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 6), chrome);
  valveKnob.rotation.x = Math.PI / 2;
  valveKnob.position.set(-1.35, 0.6, 0.16);
  const hosePath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.35, 0.72, 0),
    new THREE.Vector3(-1.4, 1.4, 0.15),
    new THREE.Vector3(-1.9, 2.3, 0.6),
    new THREE.Vector3(-2.3, 2.8, 1.0),
  ]);
  const hose = new THREE.Mesh(new THREE.TubeGeometry(hosePath, 48, 0.055, 12), new THREE.MeshStandardMaterial({ color: 0xc3c8cf, metalness: 0.9, roughness: 0.45 }));
  const hoseGroup = new THREE.Group();
  hoseGroup.add(tee, valve, valveKnob, hose);
  hoseGroup.traverse((o) => ((o as THREE.Mesh).castShadow = true));

  // poça: lâmina d'água espelhada que cresce no piso
  const puddle = new THREE.Mesh(
    new THREE.CircleGeometry(1, 64),
    new THREE.MeshStandardMaterial({ color: 0x8fa6b8, roughness: 0.03, metalness: 0.2, transparent: true, opacity: 0.45 }),
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

  const steelPipe = new THREE.MeshStandardMaterial({ color: 0xa9b0ba, metalness: 1, roughness: 0.38 });
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 16, 64, 1, true), steelPipe);
  pipe.rotation.z = Math.PI / 2;
  pipe.castShadow = true;
  pipeRig.add(pipe);

  const brass = new THREE.MeshStandardMaterial({ color: 0xc9a25a, metalness: 1, roughness: 0.3 });
  const brassDark = new THREE.MeshStandardMaterial({ color: 0x9c7a3c, metalness: 1, roughness: 0.42 });
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

  pipeRig.add(hoseGroup);

  // abraçadeiras presas na parede segurando o cano
  const strapMat = new THREE.MeshStandardMaterial({ color: 0x2a2f37, metalness: 0.8, roughness: 0.45 });
  for (const x of [-1.85, 1.9]) {
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
  const red = new THREE.MeshStandardMaterial({ color: 0xb3150c, metalness: 0.2, roughness: 0.3 });
  const steel = new THREE.MeshStandardMaterial({ color: 0xb9c0c9, metalness: 1, roughness: 0.3 });
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
  // água: translúcida com reflexo do ambiente. Sem refração de propósito: o shader
  // de refração é caro de compilar e travava a primeira visita.
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0xd6efff,
    metalness: 0.1,
    roughness: 0.04,
    transparent: true,
    opacity: 0.72,
    envMapIntensity: 1.8,
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
    // passo máximo de 1/20 s: se o aparelho engasgar, a animação espera em vez de pular
    const realDt = fixedStep ? (frames > 2 ? fixedStep : 0) : Math.min(raw, 1 / 20) * speed;
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
    floorMat.roughness = 0.4 - wet * 0.3;

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
  // GPU fraca: menos pixels (nenhum shader novo, então não há nova compilação)
  function lowQuality() {
    dpr = Math.min(dpr, 1);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight, false);
  }

  // Antes de mostrar: deixa tudo visível, compila todos os shaders, aloca sombras e
  // buffers de refração e mede o aparelho. Assim nada é preparado no meio da animação.
  let disposed = false;
  async function prepare() {
    canvas.style.opacity = '0';
    wrenchPivot.visible = true;
    puddle.visible = true;
    for (const r of ripples) r.mesh.visible = true;
    placeCamera(0, 0);
    for (let i = 0; i < 24; i++) {
      tmp.set(0.2 + i * 0.01, -0.1 - i * 0.02, 0.4);
      pipeRig.localToWorld(tmp);
      dummy.position.copy(tmp);
      dummy.scale.setScalar(0.02);
      dummy.updateMatrix();
      drops.setMatrixAt(i, dummy.matrix);
    }
    drops.instanceMatrix.needsUpdate = true;
    try {
      await renderer.compileAsync(scene, camera);
    } catch {
      /* segue com a compilação síncrona do primeiro quadro */
    }
    if (disposed) return;
    const nextFrame = () => new Promise<number>((r) => requestAnimationFrame(r));
    renderer.render(scene, camera);
    await nextFrame();
    // mede alguns quadros completos já com tudo compilado
    let last = await nextFrame();
    let total = 0;
    for (let i = 0; i < 3; i++) {
      renderer.render(scene, camera);
      const now = await nextFrame();
      total += now - last;
      last = now;
    }
    if (disposed) return;
    if (fixedStep) (window as unknown as { __introPrograms: number }).__introPrograms = renderer.info.programs?.length ?? -1;
    if (!fixedStep && total / 3 > 34) {
      lowQuality();
      renderer.render(scene, camera);
      await nextFrame();
    }
    for (const r of ripples) r.mesh.visible = false;
    puddle.visible = false;
    wrenchPivot.visible = false;
    if (disposed) return;
    canvas.style.transition = 'opacity .25s ease';
    canvas.style.opacity = '1';
    timer.reset();
    renderer.setAnimationLoop(frame);
    cb.onReady();
  }
  prepare();

  function dispose() {
    disposed = true;
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
