import * as T from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { createAnimationLayers } from "@/components/PortfolioPreview/animationLayers";
import { CUE, smooth, stageAt, type Stage } from "./timeline";

// The same V5 sculpt as reference-full-body-v5.glb, with the existing retargeted clips.
const MODEL_URL = "/models/reference-full-body-v5-layered.glb";
// Next serves this static GLB with chunked transfer in development (no Content-Length).
const MODEL_BYTES = 14_158_572;

export type IntroductionScene = {
  dispose(): void;
  skip(): void;
  replay(): void;
  setPaused(value: boolean): void;
  setHidden(value: boolean): void;
  setReducedMotion(value: boolean): void;
  isSpeaking(): boolean;
  isPaused(): boolean;
};

type Options = {
  signal: AbortSignal;
  reducedMotion: boolean;
  onProgress(value: number | null): void;
  onStage(value: Stage): void;
  onError(): void;
};

const signalShader = {
  uniforms: { tDiffuse: { value: null }, time: { value: 0 }, corruption: { value: 0 }, visibility: { value: 0 } },
  vertexShader: `varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
  fragmentShader: `uniform sampler2D tDiffuse;
    uniform float time, corruption, visibility;
    varying vec2 vUv;
    float hash(float n) { return fract(sin(n * 127.1) * 43758.5453); }
    void main() {
      vec2 uv = vUv;
      // Two signal rearrangements per second, confined to thin strips. No full-screen strobe.
      float epoch = floor(time * 2.);
      float row = floor(uv.y * 38.);
      float noise = hash(row + epoch * 39.);
      float tear = step(.65, noise) * corruption;
      uv.x += (noise - .5) * .65 * tear;
      uv.y += sin(row * 8. + epoch) * .035 * tear;
      vec3 color = texture2D(tDiffuse, clamp(uv, .001, .999)).rgb;
      float split = .009 * corruption * (1. + tear * 3.);
      color.r = texture2D(tDiffuse, clamp(uv + vec2(split, 0.), .001, .999)).r;
      color.b = texture2D(tDiffuse, clamp(uv - vec2(split, 0.), .001, .999)).b;
      color *= 1. - tear * .65;
      float scanline = .96 + .04 * sin(vUv.y * 1000.);
      color *= mix(1., scanline, corruption);
      color += vec3(.005, .06, .13) * tear * step(.97, fract(uv.x * 64. + row));
      float vignette = 1. - .35 * smoothstep(.25, .8, length(vUv - .5));
      gl_FragColor = vec4(mix(vec3(.000607, .001214, .002428), color * vignette, visibility), 1.);
    }`,
};

/** A single clock owns the camera, rig, signal effect and dialogue cue. */
export async function createIntroductionScene(host: HTMLElement, options: Options): Promise<IntroductionScene | null> {
  let renderer: T.WebGLRenderer;
  try {
    renderer = new T.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  } catch {
    options.onError();
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.25 : 1.5));
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x020408);
  host.appendChild(renderer.domElement);
  const scene = new T.Scene();
  scene.background = new T.Color(0x020408);
  const camera = new T.PerspectiveCamera(32, 1, .005, 80);
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  const signalPass = new ShaderPass(signalShader);
  const outputPass = new OutputPass();
  composer.addPass(renderPass);
  composer.addPass(signalPass);
  composer.addPass(outputPass);

  const geometries = new Set<T.BufferGeometry>();
  const materials = new Set<T.Material>();
  const textures = new Set<T.Texture>();
  const skeletons = new Set<T.Skeleton>();
  function trackResources(root: T.Object3D) {
    root.traverse((object) => {
      if (!(object instanceof T.Mesh || object instanceof T.Points)) return;
      geometries.add(object.geometry);
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        materials.add(material);
        for (const value of Object.values(material)) if (value instanceof T.Texture) textures.add(value);
      }
      if (object instanceof T.SkinnedMesh) skeletons.add(object.skeleton);
    });
  }

  const studio = new T.Scene();
  studio.background = new T.Color(0x01040a);
  const stripGeometry = new T.BoxGeometry(1, 1, 1);
  const stripMaterial = new T.MeshBasicMaterial({ color: new T.Color(.7, 1.8, 3.5) });
  for (const [x, y, z, width, height, depth] of [
    [-4, 1, 0, .15, 6, 2], [4, 1, -1, .15, 6, 2], [0, 4, 0, 4, .12, 1], [-1.5, 1, 4, .12, 3, .12],
  ]) {
    const strip = new T.Mesh(stripGeometry, stripMaterial);
    strip.position.set(x, y, z);
    strip.scale.set(width, height, depth);
    studio.add(strip);
  }
  const pmrem = new T.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(studio);
  scene.environment = environment.texture;
  pmrem.dispose();
  stripGeometry.dispose();
  stripMaterial.dispose();
  for (const [color, intensity, x, y, z] of [
    [0xb5e5ff, 1.3, -3, 4, 5], [0x357bcb, .5, 3, 1, 4],
    [0x38bfff, 5, -3, 1, -2], [0x168bff, 6, 3, 2, -2], [0x91e5ff, 2.5, 0, 5, 0],
  ]) {
    const light = new T.DirectionalLight(color, intensity);
    light.position.set(x, y, z);
    scene.add(light);
  }

  const stage = new T.Group();
  scene.add(stage);
  const floorMaterial = new T.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { strength: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: `varying vec2 vUv; uniform float strength;
      void main() { float r = length(vUv - .5) * 2.;
        float halo = exp(-r * r * 9.) * .09;
        float ring = exp(-pow((r - .48) * 190., 2.)) * .025;
        gl_FragColor = vec4(.015, .28, .65, (halo + ring) * strength); }`,
  });
  const floor = new T.Mesh(new T.PlaneGeometry(6, 6), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -.015;
  stage.add(floor);
  const dustGeometry = new T.BufferGeometry();
  const dustPositions = new Float32Array(100 * 3);
  for (let i = 0; i < 100; i++) {
    dustPositions[i * 3] = Math.sin(i * 127.1) * 4;
    dustPositions[i * 3 + 1] = .04 + (Math.sin(i * 93.7) * .5 + .5) * 2.8;
    dustPositions[i * 3 + 2] = -Math.abs(Math.sin(i * 47.3)) * 6;
  }
  dustGeometry.setAttribute("position", new T.BufferAttribute(dustPositions, 3));
  const dustMaterial = new T.PointsMaterial({ color: 0x3898cd, size: .009, transparent: true, opacity: 0, depthWrite: false });
  stage.add(new T.Points(dustGeometry, dustMaterial));
  trackResources(stage);

  let disposed = false;
  let frame = 0;
  let time = 0;
  let lastFrame = 0;
  let paused = false;
  let hidden = document.hidden;
  let reduced = options.reducedMotion;
  let currentStage: Stage = "loading";
  let layers: ReturnType<typeof createAnimationLayers> | undefined;
  let gltf: Awaited<ReturnType<GLTFLoader["parseAsync"]>> | undefined;
  const presenter = new T.Group();
  scene.add(presenter);
  const eye = new T.Vector3();
  const face = new T.Vector3();
  const look = new T.Vector3();
  const eyeMeshes: T.Mesh[] = [];

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    options.signal.removeEventListener("abort", dispose);
    renderer.domElement.removeEventListener("webglcontextlost", contextLost);
    layers?.dispose();
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    textures.forEach((texture) => texture.dispose());
    skeletons.forEach((skeleton) => skeleton.dispose());
    environment.dispose();
    renderPass.dispose();
    signalPass.dispose();
    outputPass.dispose();
    composer.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  }
  function contextLost(event: Event) {
    event.preventDefault();
    options.onError();
    dispose();
  }
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  options.signal.addEventListener("abort", dispose, { once: true });
  const observer = new ResizeObserver(() => {
    if (disposed) return;
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    composer.setSize(width, height);
    if (gltf) draw(0);
  });
  observer.observe(host);

  function draw(delta: number) {
    if (!layers || disposed) return;
    const next = stageAt(time);
    const walking = next === "arrival";
    const arrival = smooth(CUE.arrival, CUE.speak, time);
    // Linear travel through the middle keeps the stride grounded; ease only the first/last step.
    const travelTime = Math.max(0, Math.min(8, time - CUE.arrival));
    const travel = travelTime < .65 ? travelTime * travelTime / 1.3
      : travelTime > 7.35 ? 7.35 - (8 - travelTime) ** 2 / 1.3 : travelTime - .325;
    presenter.position.z = time < CUE.arrival ? 0 : -5.2 * (1 - travel / 7.35);
    if (time >= CUE.speak) presenter.position.z = 0;
    layers.update(reduced ? 0 : delta, {
      body: walking ? "WalkingBody" : "ListenBody",
      upper: walking ? "WalkingUpperBody" : undefined,
      talking: next === "speaking" && time < CUE.speak + .9 && !reduced,
      blinking: false,
    });
    // Drive both the actual eyelid morph and its radiance; the lens sees only one eye initially.
    const blink = time < 2 ? 1 - smooth(.35, 1.8, time)
      : !reduced && next === "idle" ? Math.max(0, 1 - Math.abs((time % 6.7) - 3.2) / .12) : 0;
    eyeMeshes.forEach((mesh) => { if (mesh.morphTargetInfluences) mesh.morphTargetInfluences[0] = blink; });

    const zoom = smooth(CUE.zoom, CUE.glitch - .3, time);
    if (time < CUE.arrival) {
      look.copy(eye).lerp(face, zoom);
      camera.position.set(look.x, look.y, T.MathUtils.lerp(eye.z + .125, face.z + 1.12, zoom));
      camera.lookAt(look);
    } else {
      // Reserve the bottom fifth of the frame for the greeting on desktop and mobile.
      const distance = camera.aspect < .7 ? 7.9 : 7.35;
      camera.position.set(0, 1.55, distance);
      camera.lookAt(0, 1.04, 0);
    }
    const visible = time < CUE.blackout ? smooth(0, .7, time) * (1 - smooth(CUE.blackout - .45, CUE.blackout, time))
      : time < CUE.arrival ? 0 : reduced ? 1 : smooth(CUE.arrival, CUE.arrival + 2.3, time);
    const corruption = next === "glitch" ? smooth(CUE.glitch, CUE.glitch + .8, time) : 0;
    signalPass.uniforms.time.value = time;
    signalPass.uniforms.corruption.value = reduced ? 0 : corruption;
    signalPass.uniforms.visibility.value = visible;
    // Let the distant figure emerge gradually, including its emissive eyes.
    presenter.visible = next !== "blackout";
    stage.visible = time >= CUE.arrival;
    floorMaterial.uniforms.strength.value = arrival;
    dustMaterial.opacity = reduced ? 0 : arrival * .36;
    composer.render();
    if (next !== currentStage) {
      currentStage = next;
      options.onStage(next);
    }
  }
  function tick(now: number) {
    if (disposed) return;
    // Use elapsed time, not a clamped frame delta: a slower GPU must not lengthen the film.
    // Hidden tabs and explicit pauses reset lastFrame, so returning never skips a scene.
    const delta = lastFrame ? Math.max(0, (now - lastFrame) / 1000) : 0;
    lastFrame = now;
    if (!hidden && !paused && (!reduced || currentStage !== "idle")) {
      time += delta;
      draw(delta);
    }
    frame = requestAnimationFrame(tick);
  }

  try {
    const response = await fetch(MODEL_URL, { signal: options.signal });
    if (!response.ok) throw new Error(`Model request failed: ${response.status}`);
    const total = Number(response.headers.get("Content-Length")) || MODEL_BYTES;
    const reader = response.body?.getReader();
    let bytes: ArrayBuffer;
    if (reader) {
      const chunks: Uint8Array[] = [];
      let received = 0;
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        options.onProgress(total > 0 ? Math.min(94, Math.round(received / total * 94)) : null);
      }
      const joined = new Uint8Array(received);
      let offset = 0;
      for (const chunk of chunks) { joined.set(chunk, offset); offset += chunk.length; }
      bytes = joined.buffer;
    } else bytes = await response.arrayBuffer();
    if (disposed) return null;
    options.onProgress(95);
    gltf = await new GLTFLoader().parseAsync(bytes, "/models/");
    if (disposed) {
      // A GLTF parse cannot be aborted; release assets that finished after unmount.
      trackResources(gltf.scene);
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      textures.forEach((texture) => texture.dispose());
      skeletons.forEach((skeleton) => skeleton.dispose());
      return null;
    }
    trackResources(gltf.scene);
    layers = createAnimationLayers(gltf.scene, gltf.animations);
    layers.update(0, { body: "ListenBody" });
    const model = gltf.scene;
    model.updateMatrixWorld(true);
    const bounds = new T.Box3().setFromObject(model);
    const center = bounds.getCenter(new T.Vector3());
    const scale = 2.65 / bounds.getSize(new T.Vector3()).y;
    model.position.set(-center.x, -bounds.min.y, -center.z);
    presenter.add(model);
    presenter.scale.setScalar(scale);
    presenter.updateMatrixWorld(true);
    let eyeObject: T.Mesh | undefined;
    model.traverse((object) => {
      if (!(object instanceof T.Mesh)) return;
      object.frustumCulled = false;
      const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
      const isEye = objectMaterials.some((material) => /white cyan eye cores|soft eye radiance/.test(material.name));
      if (isEye) {
        eyeMeshes.push(object);
        if (!eyeObject && objectMaterials.some((material) => material.name.includes("white cyan eye cores"))) eyeObject = object;
      }
    });
    for (const material of materials) {
      if (!(material instanceof T.MeshStandardMaterial)) continue;
      const sapphire = material.name.includes("optical sapphire");
      material.envMapIntensity = sapphire ? 1.35 : 1.1;
      if (sapphire && material instanceof T.MeshPhysicalMaterial) {
        material.color.set(0x034278);
        material.metalness = .58;
        material.roughness = .22;
        material.clearcoat = .65;
        material.clearcoatRoughness = .25;
        material.transmission = .12;
        material.ior = 1.38;
      }
      if (material.name.includes("submerged crystal lattice")) { material.emissive.set(0x0879d9); material.emissiveIntensity = .8; }
      if (material.name.includes("cyan filaments")) { material.emissive.set(0x19bbff); material.emissiveIntensity = 3.5; }
      if (material.name.includes("white cyan eye cores")) { material.emissive.set(0x70e6ff); material.emissiveIntensity = 12; }
    }
    if (!eyeObject) throw new Error("The V5 eye mesh is missing");
    new T.Box3().setFromObject(eyeObject).getCenter(eye);
    face.set(0, eye.y + .005, eye.z - .025);
    time = reduced ? CUE.idle : 0;
    const { width, height } = host.getBoundingClientRect();
    renderer.setSize(width, height);
    composer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    await renderer.compileAsync(scene, camera);
    if (disposed) return null;
    options.onProgress(100);
    draw(0);
    frame = requestAnimationFrame(tick);
  } catch (error) {
    if (!options.signal.aborted) { console.error("AI introduction:", error); options.onError(); }
    dispose();
    return null;
  }

  return {
    dispose,
    skip() { time = CUE.idle; paused = false; draw(0); },
    replay() {
      if (!gltf) return;
      layers?.dispose();
      layers = createAnimationLayers(gltf.scene, gltf.animations);
      time = reduced ? CUE.speak : 0;
      paused = false;
      lastFrame = 0;
      draw(0);
    },
    setPaused(value) { paused = value; lastFrame = 0; },
    setHidden(value) { hidden = value; lastFrame = 0; },
    setReducedMotion(value) { reduced = value; if (value) { time = CUE.idle; paused = false; draw(0); } },
    isSpeaking: () => currentStage === "speaking",
    isPaused: () => paused,
  };
}
