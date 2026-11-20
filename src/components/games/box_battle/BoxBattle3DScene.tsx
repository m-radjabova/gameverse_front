import { Html } from "@react-three/drei";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import type { AnimationAction, Group, Material, Mesh, MeshBasicMaterial } from "three";
import { AnimationMixer, Box3, Color, LoopOnce, LoopRepeat } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import arenaBackground from "../../../assets/box_battle_arena.jpg";

export type FighterMode = "idle" | "attack" | "hit" | "ko" | "winner";
export type ImpactFx = { tick: number; side: "left" | "right" | null; power: number };

type FighterProps = {
  side: "left" | "right";
  mode: FighterMode;
  animationTick: number;
};

const FIGHTER_MODEL = new URL("./box/urushi.fbx", import.meta.url).href;
const FIGHTER_ANIMATIONS = {
  idle: new URL("./box/Boxing.fbx", import.meta.url).href,
  attack: new URL("./box/urgan payti.fbx", import.meta.url).href,
  ko: new URL("./box/nakaunt.fbx", import.meta.url).href,
  winner: new URL("./box/winner.fbx", import.meta.url).href,
};
const FIGHTER_FILES = [FIGHTER_MODEL, FIGHTER_ANIMATIONS.idle, FIGHTER_ANIMATIONS.attack, FIGHTER_ANIMATIONS.ko, FIGHTER_ANIMATIONS.winner];

export function preloadBoxBattleScene() {
  useLoader.preload(FBXLoader, FIGHTER_FILES);
}

/** Sozlash mumkin bo'lgan qiymatlar */
const TARGET_HEIGHT = 1.9; // jangchi bo'yi (sahna birligida) — model o'lchamidan qat'i nazar bir xil bo'ladi
const BASE_X = 0.95; // markazdan masofa
const LUNGE = 0.7; // hujumda oldinga siljish
const CAMERA_BASE: [number, number, number] = [0, 1.45, 5.3];
const CAMERA_TARGET: [number, number, number] = [0, 1.0, 0];

type FlashMaterial = Material & { emissive?: Color; emissiveIntensity?: number };

function Fighter({ side, mode, animationTick }: FighterProps) {
  const [fighter, idleAnimation, attackAnimation, knockoutAnimation, winnerAnimation] = useLoader(FBXLoader, FIGHTER_FILES);

  const anchor = useRef<Group>(null);
  const activeAction = useRef<AnimationAction | null>(null);
  const lastMode = useRef<FighterMode | null>(null);
  const lastTick = useRef(animationTick);
  const frameMode = useRef<FighterMode>(mode);
  const elapsed = useRef(0);

  const { model, groundOffset, scale, materials } = useMemo(() => {
    const model = clone(fighter);
    model.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(model);
    const height = bounds.max.y - bounds.min.y;
    const rawScale = height > 0 ? TARGET_HEIGHT / height : 0.009;
    const scale = Math.min(0.02, Math.max(0.004, rawScale));

    // Har bir jangchi o'z materialiga ega bo'lsin (zarba paytida qizarishi uchun)
    const materials: FlashMaterial[] = [];
    model.traverse((object) => {
      const mesh = object as Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const cloned = list.map((m) => {
        const c = m.clone() as FlashMaterial;
        if (c.emissive) {
          c.emissive = new Color("#ff2a2a");
          c.emissiveIntensity = 0;
        }
        return c;
      });
      mesh.material = Array.isArray(mesh.material) ? cloned : cloned[0];
      materials.push(...cloned);
    });

    return { model, groundOffset: -bounds.min.y, scale, materials };
  }, [fighter]);

  const clips = useMemo(() => {
    const modelNodes = new Set<string>();
    model.traverse((object) => modelNodes.add(object.name));
    const sources = [
      ["idle", idleAnimation],
      ["attack", attackAnimation],
      ["ko", knockoutAnimation],
      ["winner", winnerAnimation],
    ] as const;

    return sources.flatMap(([name, source]) => {
      const clip = source.animations.find((animation) => animation.tracks.length > 0)?.clone();
      if (!clip) return [];
      clip.tracks = clip.tracks.filter((track) => modelNodes.has(track.name.split(".")[0]));
      clip.name = name;
      return [clip];
    });
  }, [attackAnimation, idleAnimation, knockoutAnimation, model, winnerAnimation]);

  const mixer = useMemo(() => new AnimationMixer(model), [model]);
  const actions = useMemo(
    () => Object.fromEntries(clips.map((clip) => [clip.name, mixer.clipAction(clip)])),
    [clips, mixer],
  );

  // Animatsiyani faqat rejim o'zgarganda (yoki yangi hujumda) qayta ishga tushiramiz.
  // Shunda "hit" paytida idle qayta boshlanib qolmaydi, "ko" esa o'rnidan turib ketmaydi.
  useEffect(() => {
    const changed = lastMode.current !== mode;
    const reAttack = mode === "attack" && lastTick.current !== animationTick;
    lastTick.current = animationTick;
    if (!changed && !reAttack) return;
    lastMode.current = mode;

    if (mode === "hit") return; // idle davom etadi, zarba effekti kod orqali ko'rsatiladi

    const action = actions[mode];
    if (!action) return;
    const previous = activeAction.current;
    if (previous === action && mode === "idle") return;

    const loops = mode === "idle";
    action.reset();
    action.setLoop(loops ? LoopRepeat : LoopOnce, loops ? Infinity : 1);
    action.clampWhenFinished = !loops;
    action.timeScale = mode === "attack" ? 1.35 : mode === "ko" ? 1.6 : 1;
    action.enabled = true;
    if (previous && previous !== action) action.crossFadeFrom(previous, 0.1, true);
    else action.fadeIn(0.1);
    action.play();
    activeAction.current = action;
  }, [actions, animationTick, mode]);

  useFrame((_, delta) => {
    mixer.update(delta);
    const group = anchor.current;
    if (!group) return;

    if (frameMode.current !== mode) {
      frameMode.current = mode;
      elapsed.current = 0;
    }
    elapsed.current += delta;
    const e = elapsed.current;
    const dir = side === "left" ? -1 : 1;

    // Hujum: tez oldinga, kontaktda to'xtab, so'ng orqaga
    let lunge = 0;
    if (mode === "attack") {
      const goIn = Math.min(e / 0.26, 1);
      const back = e <= 0.45 ? 1 : Math.max(0, 1 - (e - 0.45) / 0.4);
      lunge = Math.min(goIn, back) * LUNGE;
    }

    // Zarba yegan: orqaga uloqadi va yengil egiladi
    const recoil = mode === "hit" ? Math.max(0, 1 - e / 0.55) : 0;
    // Nokaut: orqaga surilib, o'sha joyda qoladi
    const koPush = mode === "ko" ? Math.min(1, e / 0.35) * 0.35 : 0;

    const bob = mode === "idle" ? Math.abs(Math.sin(performance.now() * 0.004 + (side === "left" ? 0 : Math.PI))) * 0.02 : 0;

    group.rotation.order = "YXZ";
    group.rotation.y = side === "left" ? Math.PI / 2 : -Math.PI / 2;
    group.rotation.x = (lunge / LUNGE) * 0.18 - recoil * 0.4;
    group.position.x = dir * (BASE_X - lunge + recoil * 0.45 + koPush);
    group.position.y = bob;

    // Zarba yegan paytda qizil chaqnash
    const flash = mode === "hit" ? recoil : mode === "ko" ? Math.max(0, 1 - e / 0.6) : 0;
    for (const m of materials) {
      if (m.emissive) m.emissiveIntensity = flash * 0.9;
    }
  });

  useEffect(
    () => () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
      materials.forEach((material) => material.dispose());
    },
    [materials, mixer, model],
  );

  return (
    <group ref={anchor} position={[side === "left" ? -BASE_X : BASE_X, 0, 0]} scale={scale}>
      <primitive object={model} position={[0, groundOffset, 0]} />
    </group>
  );
}

/** Zarba tegan nuqtada paydo bo'ladigan uchqun */
function Impact({ fx }: { fx: ImpactFx }) {
  const ref = useRef<Mesh>(null);
  const t = useRef(1);

  useEffect(() => {
    if (fx.tick > 0) t.current = 0;
  }, [fx.tick]);

  useFrame((_, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    t.current = Math.min(1, t.current + delta / 0.35);
    const p = t.current;
    mesh.visible = p < 1 && fx.side !== null;
    mesh.scale.setScalar(0.12 + p * (0.55 + fx.power * 0.5));
    (mesh.material as MeshBasicMaterial).opacity = (1 - p) * 0.9;
  });

  return (
    <mesh ref={ref} position={[fx.side === "left" ? -0.55 : 0.55, 1.3, 0.25]} visible={false}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color="#ffd23f" transparent opacity={0.9} depthWrite={false} />
    </mesh>
  );
}

/** Kamera: zarbada titraydi */
function CameraRig({ fx }: { fx: ImpactFx }) {
  const { camera } = useThree();
  const shake = useRef(0);

  useEffect(() => {
    if (fx.tick > 0) shake.current = 0.35;
  }, [fx.tick]);

  useFrame((_, delta) => {
    shake.current = Math.max(0, shake.current - delta);
    const amp = (shake.current / 0.35) * (0.05 + fx.power * 0.12);
    camera.position.set(
      CAMERA_BASE[0] + (Math.random() - 0.5) * amp,
      CAMERA_BASE[1] + (Math.random() - 0.5) * amp,
      CAMERA_BASE[2],
    );
    camera.lookAt(...CAMERA_TARGET);
  });

  return null;
}

function FightScene({
  leftMode,
  rightMode,
  animationTick,
  impact,
}: {
  leftMode: FighterMode;
  rightMode: FighterMode;
  animationTick: number;
  impact: ImpactFx;
}) {
  return (
    <>
      <ambientLight intensity={1.6} />
      <hemisphereLight args={["#f8fafc", "#64748b", 1.1]} />
      <directionalLight position={[-3, 8, 5]} intensity={3} castShadow shadow-mapSize={[512, 512]} />
      <directionalLight position={[5, 5, -4]} intensity={1.4} color="#c4b5fd" />

      {/* Ring pol soyasi */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <shadowMaterial opacity={0.35} />
      </mesh>

      <Fighter side="left" mode={leftMode} animationTick={animationTick} />
      <Fighter side="right" mode={rightMode} animationTick={animationTick} />
      <Impact fx={impact} />
      <CameraRig fx={impact} />
    </>
  );
}

export default function BoxBattle3DScene({
  leftMode,
  rightMode,
  animationTick,
  impact,
}: {
  leftMode: FighterMode;
  rightMode: FighterMode;
  animationTick: number;
  impact: ImpactFx;
}) {
  return (
    <Canvas
      camera={{ position: CAMERA_BASE, fov: 34 }}
      dpr={[1, 1.25]}
      shadows
      gl={{ antialias: true, alpha: true }}
      onCreated={({ camera }) => camera.lookAt(...CAMERA_TARGET)}
      style={{
        backgroundImage: `url("${arenaBackground}")`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <Suspense fallback={<Html center><span className="whitespace-nowrap rounded-xl bg-slate-950/75 px-4 py-2 text-sm font-bold text-white">Jangchilar yuklanmoqda...</span></Html>}>
        <FightScene leftMode={leftMode} rightMode={rightMode} animationTick={animationTick} impact={impact} />
      </Suspense>
    </Canvas>
  );
}
