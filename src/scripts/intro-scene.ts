// Abertura 3D da home: cano vazando no topo da tela, a chave de grifo chega,
// aperta a conexão, o vazamento para e a cena desce revelando o site.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export interface IntroHandle {
  // Resolve quando a cena terminou (ou foi pulada) e já pode sair da tela
  done: Promise<void>;
  skip: () => void;
  dispose: () => void;
}

// Linha do tempo em segundos
const T = {
  leakStart: 0.3,
  wrenchIn: 1.9,
  wrenchGrip: 2.6,
  twistEnd: 3.9,
  fixed: 3.6,
  wrenchOut: 4.1,
  end: 4.9,
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const phase = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

export function startIntro(canvas: HTMLCanvasElement, onStage: (stage: 'leak' | 'fix' | 'ok') => void): IntroHandle {
  const isSmall = Math.min(window.innerWidth, window.innerHeight) < 700;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1.75 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x061127);
  scene.fog = new THREE.Fog(0x061127, 9, 22);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTexture;
  scene.environmentIntensity = 0.9;

  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 50);

  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(3, 5, 6);
  scene.add(key);
  const rim = new THREE.PointLight(0x2fa8ff, 40, 12);
  rim.position.set(-2.5, 0.5, 2);
  scene.add(rim);
  scene.add(new THREE.AmbientLight(0x6688cc, 0.35));

  // Parede de fundo com leve brilho azul atrás do cano
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = glowCanvas.height = 128;
  const g = glowCanvas.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(47,168,255,0.55)');
  grad.addColorStop(1, 'rgba(47,168,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const glowTexture = new THREE.CanvasTexture(glowCanvas);
  glowTexture.colorSpace = THREE.SRGBColorSpace;
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 9),
    new THREE.MeshBasicMaterial({ map: glowTexture, transparent: true, depthWrite: false, fog: false }),
  );
  glow.position.z = -3;
  scene.add(glow);

  // ---------- cano ----------
  const pipeGroup = new THREE.Group();
  scene.add(pipeGroup);
  const chrome = new THREE.MeshStandardMaterial({ color: 0xc9d3e2, metalness: 1, roughness: 0.22 });
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 30, 48, 1), chrome);
  pipe.rotation.z = Math.PI / 2;
  pipeGroup.add(pipe);

  const jointMat = new THREE.MeshStandardMaterial({ color: 0xe3e9f2, metalness: 1, roughness: 0.15, emissive: 0x000000 });
  const joint = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.75, 48), jointMat);
  joint.rotation.z = Math.PI / 2;
  pipeGroup.add(joint);
  // Anéis das bordas da luva
  for (const x of [-0.375, 0.375]) {
    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.035, 12, 48), jointMat);
    lip.rotation.y = Math.PI / 2;
    lip.position.x = x;
    pipeGroup.add(lip);
  }
  // Abraçadeira que aparece quando o conserto termina
  const clampMat = new THREE.MeshStandardMaterial({ color: 0x1e7bff, metalness: 0.6, roughness: 0.3, emissive: 0x1662e8, emissiveIntensity: 0 });
  const clampRing = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.06, 16, 48), clampMat);
  clampRing.rotation.y = Math.PI / 2;
  clampRing.scale.setScalar(0.001);
  pipeGroup.add(clampRing);
  // Onda de brilho no momento do conserto
  const pulse = new THREE.Mesh(
    new THREE.RingGeometry(0.3, 0.38, 64),
    new THREE.MeshBasicMaterial({ color: 0x5fd0ff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }),
  );
  pipeGroup.add(pulse);

  // ---------- chave de grifo ----------
  const wrench = new THREE.Group();
  const red = new THREE.MeshStandardMaterial({ color: 0xd8321e, metalness: 0.35, roughness: 0.35 });
  const steel = new THREE.MeshStandardMaterial({ color: 0xaab6c8, metalness: 1, roughness: 0.3 });
  const handle = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 1.6, 6, 16), red);
  handle.scale.z = 0.75;
  handle.position.y = -1.25;
  const grip = new THREE.Mesh(new THREE.CapsuleGeometry(0.095, 0.5, 6, 16), new THREE.MeshStandardMaterial({ color: 0x1b1f27, roughness: 0.8 }));
  grip.position.y = -1.85;
  const hookJaw = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.16, 0.16), steel);
  hookJaw.position.set(0.12, 0.42, 0);
  const hookTip = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.24, 0.16), steel);
  hookTip.position.set(0.37, 0.3, 0);
  const heelJaw = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.18), red);
  heelJaw.position.set(0.05, -0.4, 0);
  const shank = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.9, 0.14), steel);
  shank.position.set(-0.22, 0.05, 0);
  const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.2, 18), steel);
  nut.position.set(-0.22, -0.25, 0);
  wrench.add(handle, grip, hookJaw, hookTip, heelJaw, shank, nut);
  // O grupo gira em torno do eixo do cano (X); por isso as peças ficam no plano YZ
  wrench.rotation.order = 'XYZ';
  const wrenchPivot = new THREE.Group();
  wrenchPivot.add(wrench);
  wrench.rotation.y = Math.PI / 2 - 0.75;
  wrench.scale.setScalar(1.45);
  pipeGroup.add(wrenchPivot);

  // ---------- água ----------
  const MAX = isSmall ? 420 : 650;
  const dropGeo = new THREE.SphereGeometry(1, 10, 8);
  const water = new THREE.MeshStandardMaterial({
    color: 0x7fd8ff,
    metalness: 0,
    roughness: 0.04,
    emissive: 0x0b4a8a,
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.92,
  });
  const drops = new THREE.InstancedMesh(dropGeo, water, MAX);
  drops.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  drops.frustumCulled = false;
  scene.add(drops);

  const pos = new Float32Array(MAX * 3);
  const vel = new Float32Array(MAX * 3);
  const life = new Float32Array(MAX); // <0 = livre
  const size = new Float32Array(MAX);
  life.fill(-1);

  const dummy = new THREE.Object3D();
  const up = new THREE.Vector3(0, 1, 0);
  const dir = new THREE.Vector3();
  const leakPoint = new THREE.Vector3();

  // Poça no chão que cresce enquanto vaza
  const puddle = new THREE.Mesh(
    new THREE.CircleGeometry(1, 64),
    new THREE.MeshStandardMaterial({ color: 0x2fa8ff, metalness: 0, roughness: 0.05, transparent: true, opacity: 0.3, emissive: 0x0b3fa8, emissiveIntensity: 0.25 }),
  );
  puddle.rotation.x = -Math.PI / 2;
  puddle.scale.setScalar(0.01);
  scene.add(puddle);

  // ---------- enquadramento ----------
  let halfH = 1;
  let halfW = 1;
  let floorY = -3;
  function layout() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    const dist = 7;
    halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist;
    halfW = halfH * camera.aspect;
    // cano perto do topo, chão perto da base
    pipeGroup.position.y = halfH * 0.62;
    floorY = -halfH * 0.88;
    puddle.position.y = floorY;
    glow.position.y = pipeGroup.position.y;
    // em tela estreita a chave e a luva ficam um pouco maiores
    const s = THREE.MathUtils.clamp(halfW / 2.2, 0.75, 1.25);
    pipeGroup.scale.setScalar(s);
  }
  layout();
  window.addEventListener('resize', layout);

  function spawn(i: number, strength: number) {
    pipeGroup.localToWorld(leakPoint.set(0.08, 0.05, 0.3));
    pos[i * 3] = leakPoint.x;
    pos[i * 3 + 1] = leakPoint.y;
    pos[i * 3 + 2] = leakPoint.z;
    // jato para frente e para os lados, com força proporcional ao vazamento
    const spread = (Math.random() - 0.5) * 2;
    const sp = (1.2 + Math.random() * 1.6) * strength;
    vel[i * 3] = spread * 1.1 * strength;
    vel[i * 3 + 1] = (Math.random() * 0.9 - 0.2) * strength;
    vel[i * 3 + 2] = sp;
    life[i] = 0;
    size[i] = 0.014 + Math.random() * 0.02;
  }

  // ---------- loop ----------
  const timer = new THREE.Timer();
  timer.connect(document);
  let elapsed = 0;
  let frames = 0;
  // ?introSpeed=0.25 deixa a abertura em câmera lenta (útil para revisar)
  const speed = Number(new URLSearchParams(location.search).get('introSpeed')) || 1;
  let spawnAcc = 0;
  let next = 0;
  let stage: 'leak' | 'fix' | 'ok' | '' = '';
  let skipped = false;
  let resolveDone!: () => void;
  const done = new Promise<void>((r) => (resolveDone = r));
  let finished = false;

  const camBase = new THREE.Vector3(1.6, -0.6, 7);
  const target = new THREE.Vector3();

  function setStage(s: 'leak' | 'fix' | 'ok') {
    if (stage === s) return;
    stage = s;
    onStage(s);
  }

  function frame() {
    timer.update();
    // os primeiros quadros incluem a compilação dos shaders; não contam no roteiro
    const realDt = frames++ < 2 ? 0 : timer.getDelta() * speed;
    const dt = Math.min(realDt, 1 / 30);
    elapsed += realDt;
    const t = elapsed;

    // câmera: leve órbita para dar profundidade
    const orbit = Math.sin(t * 0.45) * 0.5;
    camera.position.set(camBase.x + orbit, pipeGroup.position.y * 0.35 + camBase.y, camBase.z);
    target.set(0, pipeGroup.position.y * 0.25, 0);
    camera.lookAt(target);

    // intensidade do vazamento: sobe no início, cai enquanto a chave aperta
    const rise = phase(t, T.leakStart, T.leakStart + 0.5);
    const tighten = phase(t, T.wrenchGrip, T.fixed);
    const leak = rise * (1 - easeInOutCubic(tighten));
    if (t > T.leakStart) setStage('leak');
    if (t > T.wrenchGrip) setStage('fix');
    if (t > T.fixed) setStage('ok');

    // chave: entra pela direita, encaixa, gira em vaivém e sai por baixo
    const enter = easeOutCubic(phase(t, T.wrenchIn, T.wrenchGrip));
    const leave = easeInOutCubic(phase(t, T.wrenchOut, T.end));
    const twistT = phase(t, T.wrenchGrip, T.twistEnd);
    const twist = Math.sin(twistT * Math.PI * 6) * 0.45 * (1 - twistT * 0.3);
    wrenchPivot.position.set(THREE.MathUtils.lerp(halfW * 2.2, 0, enter), -leave * halfH * 1.6, 0.0);
    wrenchPivot.rotation.x = -0.35 + twist + (1 - enter) * 1.2;
    wrenchPivot.rotation.z = (1 - enter) * -0.8 + leave * 0.6;
    wrenchPivot.visible = t > T.wrenchIn - 0.05;

    // conserto: abraçadeira cresce, brilho pulsa
    const fixT = phase(t, T.fixed - 0.2, T.fixed + 0.35);
    clampRing.scale.setScalar(Math.max(0.001, easeOutCubic(fixT)));
    const flash = Math.max(0, 1 - Math.abs(t - T.fixed) / 0.5);
    clampMat.emissiveIntensity = 0.4 + flash * 2.2;
    jointMat.emissive.setRGB(0.05 * flash, 0.25 * flash, 0.6 * flash);
    const pulseT = phase(t, T.fixed, T.fixed + 0.8);
    pulse.scale.setScalar(1 + pulseT * 3.5);
    (pulse.material as THREE.MeshBasicMaterial).opacity = pulseT > 0 && pulseT < 1 ? (1 - pulseT) * 0.8 : 0;
    pulse.rotation.y = Math.PI / 2;

    // gotas: nascem no ponto do vazamento e caem com gravidade
    spawnAcc += dt * 260 * leak * (isSmall ? 0.75 : 1);
    while (spawnAcc >= 1) {
      spawnAcc -= 1;
      for (let k = 0; k < MAX; k++) {
        next = (next + 1) % MAX;
        if (life[next] < 0) {
          spawn(next, 0.6 + leak * 0.6);
          break;
        }
      }
    }
    for (let i = 0; i < MAX; i++) {
      if (life[i] < 0) {
        dummy.position.set(0, -100, 0);
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        drops.setMatrixAt(i, dummy.matrix);
        continue;
      }
      life[i] += dt;
      const ix = i * 3;
      vel[ix + 1] -= 9.8 * dt;
      pos[ix] += vel[ix] * dt;
      pos[ix + 1] += vel[ix + 1] * dt;
      pos[ix + 2] += vel[ix + 2] * dt;
      let s = size[i];
      if (pos[ix + 1] < floorY) {
        // respingo: quica baixo e some
        pos[ix + 1] = floorY;
        vel[ix + 1] = Math.abs(vel[ix + 1]) * 0.18;
        vel[ix] *= 0.5;
        vel[ix + 2] *= 0.5;
        size[i] *= 0.82;
        s = size[i];
        if (s < 0.012) life[i] = -1;
      }
      if (life[i] > 3) life[i] = -1;
      dir.set(vel[ix], vel[ix + 1], vel[ix + 2]);
      const speed = dir.length();
      dummy.position.set(pos[ix], pos[ix + 1], pos[ix + 2]);
      if (speed > 0.001) dummy.quaternion.setFromUnitVectors(up, dir.divideScalar(speed));
      const stretch = 1 + Math.min(speed * 0.9, 4.5);
      dummy.scale.set(s, s * stretch, s);
      dummy.updateMatrix();
      drops.setMatrixAt(i, dummy.matrix);
    }
    drops.instanceMatrix.needsUpdate = true;

    // poça cresce com o vazamento e encolhe um pouco depois do conserto
    const puddleTarget = THREE.MathUtils.clamp((t - T.leakStart - 0.4) * 0.7, 0, 1.6) * (1 - 0.35 * phase(t, T.fixed, T.end));
    puddle.scale.setScalar(Math.max(0.01, puddleTarget));
    pipeGroup.localToWorld(leakPoint.set(0, 0, 0));
    puddle.position.x = leakPoint.x + 0.2;
    puddle.position.z = 0.8;

    renderer.render(scene, camera);

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
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.geometry.dispose();
        const mats = Array.isArray(m.material) ? m.material : [m.material];
        mats.forEach((mat) => mat.dispose());
      }
    });
    envTexture.dispose();
    glowTexture.dispose();
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
