import { Float, useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { memo, useEffect, useMemo, useRef } from "react";
import type { Group, Object3D } from "three";
import { AnimationClip, Box3, Vector3 } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { ZooAnimal } from "../types";

type AnimalModelProps = {
  animal: ZooAnimal;
  active: boolean;
  discovered: boolean;
  onSelect: () => void;
};

const animalAssetMap = {
  lion: {
    url: new URL("../models/Lion.glb", import.meta.url).href,
    targetHeight: 1.1,
    rotationY: 0,
    modelPosition: [0, 0, 0] as [number, number, number],
  },
  elephant: {
    url: new URL("../models/Elephant.glb", import.meta.url).href,
    targetHeight: 1.35,
    rotationY: 0,
    modelPosition: [0, 0, 0] as [number, number, number],
  },
  monkey: {
    url: new URL("../models/Chimpanzee.glb", import.meta.url).href,
    targetHeight: 1,
    rotationY: Math.PI,
    modelPosition: [0, 0, 0] as [number, number, number],
  },
  giraffe: {
    url: new URL("../models/Giraffe.glb", import.meta.url).href,
    targetHeight: 1.7,
    rotationY: -Math.PI / 2,
    modelPosition: [0, 0, 0] as [number, number, number],
  },
  zebra: {
    url: new URL("../models/Zebra.glb", import.meta.url).href,
    targetHeight: 1.15,
    rotationY: Math.PI,
    modelPosition: [0, 0, 0] as [number, number, number],
  },
  tiger: {
    url: new URL("../models/Tiger.glb", import.meta.url).href,
    targetHeight: 1.18,
    rotationY: Math.PI,
    modelPosition: [0, 0, 0] as [number, number, number],
  },
  leopard: {
    url: new URL("../models/Tiger.glb", import.meta.url).href,
    targetHeight: 1.06,
    rotationY: Math.PI,
    modelPosition: [0, 0, 0] as [number, number, number],
  },
  rhino: {
    url: new URL("../models/Rhinoceros.glb", import.meta.url).href,
    targetHeight: 1.28,
    rotationY: Math.PI,
    modelPosition: [0, 0, 0] as [number, number, number],
  },
  bear: {
    url: new URL("../models/Black bear.glb", import.meta.url).href,
    targetHeight: 1.18,
    rotationY: Math.PI,
    modelPosition: [0, 0, 0] as [number, number, number],
  },
  wolf: {
    url: new URL("../models/Wolf.glb", import.meta.url).href,
    targetHeight: 0.98,
    rotationY: Math.PI,
    modelPosition: [0, 0, 0] as [number, number, number],
  },
  crocodile: {
    url: new URL("../models/crocodile.glb", import.meta.url).href,
    targetHeight: 0.72,
    rotationY: Math.PI,
    modelPosition: [0, 0, 0] as [number, number, number],
  },
  camel: {
    url: new URL("../models/Camel.glb", import.meta.url).href,
    targetHeight: 1.5,
    rotationY: Math.PI,
    modelPosition: [0, 0, 0] as [number, number, number],
  },
  penguin: {
    url: new URL("../models/Penguin.glb", import.meta.url).href,
    targetHeight: 0.92,
    rotationY: Math.PI,
    modelPosition: [0, 0, 0] as [number, number, number],
  },
  parrot: {
    url: new URL("../models/Parrot.glb", import.meta.url).href,
    targetHeight: 0.88,
    rotationY: Math.PI,
    modelPosition: [0, 0, 0] as [number, number, number],
  },
  kangaroo: {
    url: new URL("../models/Kangaroo.glb", import.meta.url).href,
    targetHeight: 1.35,
    rotationY: Math.PI,
    modelPosition: [0, 0, 0] as [number, number, number],
  },
  fox: {
    url: new URL("../models/Fox.glb", import.meta.url).href,
    targetHeight: 1,
    rotationY: Math.PI,
    modelPosition: [0, 0, 0] as [number, number, number],
  },
  rabbit: {
    url: new URL("../models/Rabbit.glb", import.meta.url).href,
    targetHeight: 0.62,
    rotationY: Math.PI,
    modelPosition: [0, 0, 0] as [number, number, number],
  },
  panda: {
    url: new URL("../models/Panda.glb", import.meta.url).href,
    targetHeight: 1.08,
    rotationY: Math.PI,
    modelPosition: [0, 0, 0] as [number, number, number],
  },
  hippo: {
    url: new URL("../models/Hippopotamus.glb", import.meta.url).href,
    targetHeight: 1.02,
    rotationY: Math.PI,
    modelPosition: [0, 0, 0] as [number, number, number],
  },
} as const;

type AnimalAssetKey = keyof typeof animalAssetMap;

function pickClip(clips: AnimationClip[]) {
  if (clips.length === 0) {
    return null;
  }

  return (
    clips.find((clip) => /idle/i.test(clip.name)) ??
    clips.find((clip) => /walk|run|anim|take/i.test(clip.name)) ??
    clips[0]
  );
}

const sizeBox = new Box3();
const sizeVector = new Vector3();
const centerVector = new Vector3();

function cleanupAndNormalizeModel(object: Object3D, targetHeight: number) {
  sizeBox.setFromObject(object);
  sizeBox.getSize(sizeVector);

  const safeHeight = Math.max(sizeVector.y, 0.001);
  const normalizedScale = targetHeight / safeHeight;

  object.scale.setScalar(normalizedScale);

  sizeBox.setFromObject(object);
  sizeBox.getCenter(centerVector);

  object.position.x -= centerVector.x;
  object.position.z -= centerVector.z;
  object.position.y -= sizeBox.min.y;
}

function ProceduralAnimalModel({
  animal,
  active,
  discovered,
  onSelect,
}: AnimalModelProps) {
  const rootRef = useRef<Group>(null);
  const glowColor = active ? animal.accent : discovered ? "#b6f0c7" : "#ffffff";
  const bodyOpacity = active ? 0.92 : 0.58;
  const isBird = animal.speciesGroup === "bird";
  const isReptile = animal.speciesGroup === "reptile";
  const isTall = animal.id === "camel" || animal.id === "kangaroo";
  const bodyLength = isBird ? 0.8 : isReptile ? 1.25 : 1.05;
  const bodyHeight = animal.id === "hippo" ? 0.62 : isTall ? 0.92 : isBird ? 0.58 : 0.74;
  const headSize = animal.id === "elephant" ? 0.4 : isBird ? 0.28 : 0.3;
  const legHeight = isBird ? 0.5 : animal.id === "giraffe" ? 1.1 : isTall ? 0.95 : 0.62;

  useFrame((state) => {
    if (!rootRef.current) {
      return;
    }

    const wobble = state.clock.elapsedTime;
    rootRef.current.position.y = Math.sin(wobble * 1.15) * 0.05;
    rootRef.current.rotation.z = Math.sin(wobble * 0.5) * 0.015;
  });

  return (
    <group onClick={onSelect}>
      <Float floatIntensity={0.1} rotationIntensity={0.05} speed={1.4}>
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.5, 56]} />
          <meshBasicMaterial color={glowColor} opacity={bodyOpacity} transparent />
        </mesh>
      </Float>

      <group ref={rootRef}>
        <mesh castShadow position={[0, legHeight + bodyHeight * 0.42, 0]}>
          <capsuleGeometry args={[bodyHeight * 0.28, bodyLength, 8, 16]} />
          <meshStandardMaterial color={animal.accent} roughness={0.88} />
        </mesh>

        <mesh castShadow position={[0, legHeight + bodyHeight * 0.55, bodyLength * 0.55]}>
          <sphereGeometry args={[headSize, 18, 18]} />
          <meshStandardMaterial color={animal.secondaryAccent} roughness={0.82} />
        </mesh>

        <mesh castShadow position={[-0.1, legHeight + bodyHeight * 0.56, bodyLength * 0.78]}>
          <coneGeometry args={[0.08, 0.22, 10]} />
          <meshStandardMaterial color={animal.secondaryAccent} roughness={0.85} />
        </mesh>
        <mesh castShadow position={[0.1, legHeight + bodyHeight * 0.56, bodyLength * 0.78]}>
          <coneGeometry args={[0.08, 0.22, 10]} />
          <meshStandardMaterial color={animal.secondaryAccent} roughness={0.85} />
        </mesh>

        {[
          [-0.28, legHeight / 2, -0.24],
          [0.28, legHeight / 2, -0.24],
          [-0.28, legHeight / 2, 0.28],
          [0.28, legHeight / 2, 0.28],
        ].map((leg, index) => (
          <mesh key={index} castShadow position={leg as [number, number, number]}>
            <cylinderGeometry args={[0.08, 0.09, legHeight, 12]} />
            <meshStandardMaterial color={animal.secondaryAccent} roughness={0.92} />
          </mesh>
        ))}

        {isBird ? (
          <>
            <mesh castShadow position={[-0.34, legHeight + bodyHeight * 0.48, 0.04]} rotation={[0, 0, 0.55]}>
              <capsuleGeometry args={[0.08, 0.38, 6, 10]} />
              <meshStandardMaterial color={animal.secondaryAccent} roughness={0.84} />
            </mesh>
            <mesh castShadow position={[0.34, legHeight + bodyHeight * 0.48, 0.04]} rotation={[0, 0, -0.55]}>
              <capsuleGeometry args={[0.08, 0.38, 6, 10]} />
              <meshStandardMaterial color={animal.secondaryAccent} roughness={0.84} />
            </mesh>
          </>
        ) : null}

        {isReptile ? (
          <mesh castShadow position={[0, legHeight + 0.18, -0.9]} rotation={[0.15, 0, 0]}>
            <coneGeometry args={[0.14, 0.8, 12]} />
            <meshStandardMaterial color={animal.secondaryAccent} roughness={0.9} />
          </mesh>
        ) : (
          <mesh castShadow position={[0, legHeight + 0.45, -0.82]} rotation={[0.6, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.09, 0.8, 10]} />
            <meshStandardMaterial color={animal.secondaryAccent} roughness={0.92} />
          </mesh>
        )}

        <mesh position={[-0.1, legHeight + bodyHeight * 0.58, bodyLength * 0.84]}>
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshBasicMaterial color="#111111" toneMapped={false} />
        </mesh>
        <mesh position={[0.1, legHeight + bodyHeight * 0.58, bodyLength * 0.84]}>
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshBasicMaterial color="#111111" toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function GLTFAnimalModel({
  animal,
  active,
  discovered,
  onSelect,
  asset,
}: AnimalModelProps & {
  asset: (typeof animalAssetMap)[AnimalAssetKey];
}) {
  const rootRef = useRef<Group>(null);
  const modelAnchorRef = useRef<Group>(null);
  const gltf = useGLTF(asset.url);

  const clonedScene = useMemo(() => {
    const scene = clone(gltf.scene);

    scene.traverse((object) => {
      if ("castShadow" in object) {
        object.castShadow = true;
      }

      if ("receiveShadow" in object) {
        object.receiveShadow = true;
      }
    });

    cleanupAndNormalizeModel(scene, asset.targetHeight);

    return scene;
  }, [asset.targetHeight, gltf.scene]);

  const { actions } = useAnimations(gltf.animations, modelAnchorRef);

  useEffect(() => {
    const clip = pickClip(gltf.animations);

    if (!clip) {
      return;
    }

    const action = actions[clip.name];

    if (!action) {
      return;
    }

    action.reset();
    action.fadeIn(0.35);
    action.timeScale =
      animal.id === "elephant"
        ? 0.75
        : animal.id === "giraffe"
          ? 0.82
          : animal.id === "crocodile"
            ? 0.68
            : animal.id === "penguin"
              ? 0.9
              : 1;
    action.play();

    return () => {
      action.fadeOut(0.25);
      action.stop();
    };
  }, [actions, animal.id, gltf.animations]);

  useFrame((state) => {
    if (!rootRef.current) {
      return;
    }

    const wobble = state.clock.elapsedTime;
    rootRef.current.position.y = Math.sin(wobble * 1.15) * 0.05;
    rootRef.current.rotation.z = Math.sin(wobble * 0.5) * 0.015;
  });

  const glowColor = active ? animal.accent : discovered ? "#b6f0c7" : "#ffffff";
  const bodyOpacity = active ? 0.92 : 0.58;

  return (
    <group onClick={onSelect}>
      <Float floatIntensity={0.1} rotationIntensity={0.05} speed={1.4}>
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.5, 56]} />
          <meshBasicMaterial color={glowColor} opacity={bodyOpacity} transparent />
        </mesh>
      </Float>

      <group ref={rootRef}>
        <group
          ref={modelAnchorRef}
          position={asset.modelPosition}
          rotation={[0, asset.rotationY, 0]}
        >
          <primitive dispose={null} object={clonedScene} />
        </group>
      </group>
    </group>
  );
}

function AnimalModel(props: AnimalModelProps) {
  const asset = animalAssetMap[props.animal.id as AnimalAssetKey];

  if (!asset) {
    return <ProceduralAnimalModel {...props} />;
  }

  return <GLTFAnimalModel {...props} asset={asset} />;
}

useGLTF.preload(animalAssetMap.lion.url);
useGLTF.preload(animalAssetMap.elephant.url);
useGLTF.preload(animalAssetMap.monkey.url);
useGLTF.preload(animalAssetMap.giraffe.url);
useGLTF.preload(animalAssetMap.zebra.url);
useGLTF.preload(animalAssetMap.tiger.url);
useGLTF.preload(animalAssetMap.leopard.url);
useGLTF.preload(animalAssetMap.rhino.url);
useGLTF.preload(animalAssetMap.bear.url);
useGLTF.preload(animalAssetMap.wolf.url);
useGLTF.preload(animalAssetMap.crocodile.url);
useGLTF.preload(animalAssetMap.camel.url);
useGLTF.preload(animalAssetMap.penguin.url);
useGLTF.preload(animalAssetMap.parrot.url);
useGLTF.preload(animalAssetMap.kangaroo.url);
useGLTF.preload(animalAssetMap.fox.url);
useGLTF.preload(animalAssetMap.rabbit.url);
useGLTF.preload(animalAssetMap.panda.url);
useGLTF.preload(animalAssetMap.hippo.url);

export default memo(AnimalModel);
