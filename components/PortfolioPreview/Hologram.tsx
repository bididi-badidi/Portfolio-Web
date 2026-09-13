"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { BotState, IntroStage } from "./state";
import { createAnimationLayers, DEFAULT_BODY_ANIMATION, type AnimationControls, type UpperAnimation } from "./animationLayers";
import type { PresentationGesture } from "@/content/projects";

const GLB_MODEL_PATH = "/models/reference-full-body-v5-layered.glb";
/** Preview prototype: V5 full-body Blender export with authored materials and gesture clips. */
export function Hologram({
  state,
  gesture,
  presenting,
  reducedMotion,
  intro,
  animationControls,
}: {
  state: BotState;
  gesture: PresentationGesture;
  presenting: boolean;
  reducedMotion: boolean;
  intro: IntroStage;
  animationControls?: AnimationControls;
}) {
  const host = useRef<HTMLDivElement>(null);
  const live = useRef({
    state,
    gesture,
    presenting,
    intro,
    animationControls,
  });
  const [ready, setReady] = useState(false);
  useEffect(() => {
    live.current = {
      state,
      gesture,
      presenting,
      intro,
      animationControls,
    };
  }, [state, gesture, presenting, intro, animationControls]);
  useEffect(() => {
    setReady(false);
    if (reducedMotion || !host.current) return;
    const container = host.current;
    let dispose = () => {};
    let cancelled = false;
    void (async () => {
      const T = await import("three");
      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
      if (cancelled) return;
      let renderer: InstanceType<typeof T.WebGLRenderer>;
      try {
        renderer = new T.WebGLRenderer({ alpha: true, antialias: true });
      } catch {
        return;
      }
      const scene = new T.Scene();
      const camera = new T.PerspectiveCamera(34, 1, 0.1, 20);
      camera.position.set(0, 0.05, 5.1);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1 : 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      container.appendChild(renderer.domElement);
      const environmentScene = new T.Scene();
      environmentScene.background = new T.Color(0x01040a);
      const stripGeometry = new T.BoxGeometry(1, 1, 1);
      const stripMaterial = new T.MeshBasicMaterial({ color: new T.Color(0.7, 1.8, 3.5) });
      for (const [x, y, z, width, height, depth] of [
        [-4, 1, 0, 0.15, 6, 2],
        [4, 1, -1, 0.15, 6, 2],
        [0, 4, 0, 4, 0.12, 1],
        [-1.5, 1, 4, 0.12, 3, 0.12],
      ]) {
        const strip = new T.Mesh(stripGeometry, stripMaterial);
        strip.position.set(x, y, z);
        strip.scale.set(width, height, depth);
        environmentScene.add(strip);
      }
      const pmrem = new T.PMREMGenerator(renderer);
      const environment = pmrem.fromScene(environmentScene);

      scene.environment = environment.texture;
      stripGeometry.dispose();
      stripMaterial.dispose();
      pmrem.dispose();

      // A cool soft key reveals the face; side lights trace the sapphire silhouette.
      const key = new T.DirectionalLight(0xb5e5ff, 1.3);
      key.position.set(-3, 4, 5);
      const fill = new T.DirectionalLight(0x357bcb, 0.5);
      fill.position.set(3, 1, 4);
      const leftRim = new T.DirectionalLight(0x38bfff, 5);
      leftRim.position.set(-3, 1, -2);
      const rightRim = new T.DirectionalLight(0x168bff, 6);
      rightRim.position.set(3, 2, -2);
      const crown = new T.DirectionalLight(0x91e5ff, 2.5);
      crown.position.set(0, 5, 0);
      scene.add(key, fill, leftRim, rightRim, crown);

      const uniforms = { time: { value: 0 }, activity: { value: 0 } };
      let frame = 0;
      let model: InstanceType<typeof T.Group> | undefined;
      let layers: ReturnType<typeof createAnimationLayers> | undefined;
      const materials = new Set<InstanceType<typeof T.Material>>();
      const skeletons = new Set<InstanceType<typeof T.Skeleton>>();
      const particlesGeometry = new T.BufferGeometry();
      const positions = new Float32Array(180 * 3);
      for (let i = 0; i < positions.length; i++) positions[i] = Math.sin(i * 127.1) * 2.1;
      particlesGeometry.setAttribute("position", new T.BufferAttribute(positions, 3));
      const particlesMaterial = new T.PointsMaterial({
        color: getComputedStyle(container).getPropertyValue("--hologram-light").trim(),
        size: 0.012,
        transparent: true,
        opacity: 0.4,
      });
      const particles = new T.Points(particlesGeometry, particlesMaterial);
      scene.add(particles);
      const resize = () => {
        const { width, height } = container.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      const observer = new ResizeObserver(resize);
      observer.observe(container);
      resize();
      const loseContext = (event: Event) => {
        event.preventDefault();
        setReady(false);
        cancelAnimationFrame(frame);
      };
      renderer.domElement.addEventListener("webglcontextlost", loseContext);
      const releaseModel = (group: InstanceType<typeof T.Group>) => {
        group.traverse((object) => {
          if (object instanceof T.Mesh) {
            object.geometry.dispose();
            (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) =>
              materials.add(material),
            );
            if (object instanceof T.SkinnedMesh) skeletons.add(object.skeleton);
          }
        });
        skeletons.forEach((skeleton) => skeleton.dispose());
        materials.forEach((material) => material.dispose());
      };
      dispose = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        renderer.domElement.removeEventListener("webglcontextlost", loseContext);
        layers?.dispose();
        if (model) {
          releaseModel(model);
        }
        environment.dispose();
        particlesGeometry.dispose();
        particlesMaterial.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
      try {
        const gltf = await new GLTFLoader().loadAsync(GLB_MODEL_PATH);
        if (cancelled) {
          releaseModel(gltf.scene);
          return;
        }

        model = gltf.scene;
        model.traverse((object) => {
          if (!(object instanceof T.Mesh)) return;
          object.frustumCulled = false;
          for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
            if (!(material instanceof T.MeshStandardMaterial) || materials.has(material)) continue;

            const sapphire = material.name.includes("optical sapphire");
            material.envMapIntensity = sapphire ? 1.35 : 1.1;
            if (material instanceof T.MeshPhysicalMaterial && sapphire) {
              material.color.set(0x034278);
              material.metalness = 0.58;
              material.roughness = 0.22;
              material.clearcoat = 0.65;
              material.clearcoatRoughness = 0.25;
              material.transmission = 0.12;
              material.ior = 1.38;
            }
            if (material.name.includes("submerged crystal lattice")) {
              material.emissive.set(0x0879d9);
              material.emissiveIntensity = 0.8;
            }
            if (material.name.includes("cyan filaments")) {
              material.emissive.set(0x19bbff);
              material.emissiveIntensity = 3.5;
            }
            if (material.name.includes("white cyan eye cores")) {
              material.emissive.set(0x70e6ff);
              material.emissiveIntensity = 12;
            }
            materials.add(material);
            if (!sapphire) continue;
            material.onBeforeCompile = (shader) => {
              shader.uniforms.time = uniforms.time;
              shader.uniforms.activity = uniforms.activity;
              shader.fragmentShader = "uniform float time; uniform float activity;\n" + shader.fragmentShader;
              // Add radiance before tone mapping, using the final view-space normal.
              shader.fragmentShader = shader.fragmentShader.replace(
                "#include <opaque_fragment>",
                `
                float rim = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 3.5);
                float pulse = 1.0 + activity * 0.08 * sin(time * 2.4);
                outgoingLight += vec3(0.015, 0.32, 0.85) * rim * pulse;
                #include <opaque_fragment>`,
              );
            };
          }
        });
        layers = createAnimationLayers(model, gltf.animations);
        layers.mixer.update(0);
        let automaticGesture: string | null = null;
        let automaticSequenceId = 0;
        let automaticSequence: AnimationControls["sequence"];
        model.updateMatrixWorld(true);
        const bounds = new T.Box3().setFromObject(model);
        const size = bounds.getSize(new T.Vector3());
        model.position.sub(bounds.getCenter(new T.Vector3()));
        const presenter = new T.Group();
        presenter.add(model);
        presenter.scale.setScalar(Math.min(2.55 / size.y, 3.1 / size.x));
        scene.add(presenter);
        const clock = new T.Clock();
        let elapsed = 0;
        const render = () => {
          if (cancelled) return;
          const delta = Math.min(clock.getDelta(), 0.05);
          if (!document.hidden) {
            elapsed += delta;
            const active = live.current;
            const requestedGesture =
              active.state === "thinking" ? "ThinkUpperBody" : active.state === "action" ? "ActionUpperBody" : null;
            if (requestedGesture !== automaticGesture) {
              automaticGesture = requestedGesture;
              automaticSequence = {
                id: --automaticSequenceId,
                clips: requestedGesture ? [requestedGesture as UpperAnimation] : [],
              };
            }
            layers!.update(
              delta,
              {
                mode: active.presenting ? "presenting" : "idle",
                body:
                  active.state === "thinking" ? "ThinkBody" : DEFAULT_BODY_ANIMATION,
                talking: active.state === "speaking",
                sequence: automaticSequence,
                ...active.animationControls,
              },
              active.intro === "boot",
            );
            const playback = layers!.snapshot();
            if (container.dataset.animation !== playback.upper) container.dataset.animation = playback.upper;
            if (container.dataset.mode !== playback.mode) container.dataset.mode = playback.mode;
            // A slow turn reveals real facial and shoulder depth without tracking visitors.
            presenter.rotation.y = Math.sin(elapsed * 0.32) * 0.09;
            presenter.position.y = Math.sin(elapsed * 1.2) * 0.012;
            uniforms.time.value = elapsed;
            uniforms.activity.value = active.state === "speaking" || active.state === "thinking" ? 1 : 0;
            particles.rotation.y = elapsed * 0.018;
            renderer.render(scene, camera);
          }
          frame = requestAnimationFrame(render);
        };
        render();
        setReady(true);
      } catch (error) {
        console.error("Hologram initialization failed:", error);

        if (!cancelled) {
          setReady(false);
          dispose();
        }
      }
    })().catch((error) => {
      console.error("Hologram async error:", error);

      if (!cancelled) {
        setReady(false);
        dispose();
      }
    });
    return () => {
      cancelled = true;
      dispose();
    };
  }, [reducedMotion]);

  return (
    <div className="hologram" data-state={state}>
      <Image
        src="/image/portfolio-preview/reference-full-body-v5.png"
        alt="A sapphire hologram concierge with luminous cyan eyes, crystalline veins and articulated hands"
        fill
        priority
        sizes="(max-width: 767px) 90vw, 48vw"
        className={ready && !reducedMotion ? "hologram-fallback hidden-projection" : "hologram-fallback"}
      />
      <div ref={host} className="hologram-canvas" aria-hidden="true" />
      <div className="hologram-base" aria-hidden="true" />
    </div>
  );
}
