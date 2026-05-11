import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import type { Object3D } from "three";
import { Box3, Vector3 } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

const flowerAssetMap = {
  flowerGroup: {
    url: new URL("../models/flowers/Flower Group.glb", import.meta.url).href,
    targetHeight: 0.95,
  },
  grassPatch: {
    url: new URL("../models/flowers/Grass Patch.glb", import.meta.url).href,
    targetHeight: 0.82,
  },
  roses: {
    url: new URL("../models/flowers/Roses.glb", import.meta.url).href,
    targetHeight: 0.9,
  },
  flower1: {
    url: new URL("../models/flowers/flower1.glb", import.meta.url).href,
    targetHeight: 0.88,
  },
  tulip3: {
    url: new URL("../models/flowers/tulip 3.glb", import.meta.url).href,
    targetHeight: 0.92,
  },
} as const;

export type FlowerVariant = keyof typeof flowerAssetMap;

type FlowerModelProps = {
  position: [number, number, number];
  scale?: number;
  rotationY?: number;
  variant: FlowerVariant;
};

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

export default function FlowerModel({
  position,
  scale = 1,
  rotationY = 0,
  variant,
}: FlowerModelProps) {
  const asset = flowerAssetMap[variant];
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

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <primitive dispose={null} object={clonedScene} />
    </group>
  );
}

useGLTF.preload(flowerAssetMap.flowerGroup.url);
useGLTF.preload(flowerAssetMap.grassPatch.url);
useGLTF.preload(flowerAssetMap.roses.url);
useGLTF.preload(flowerAssetMap.flower1.url);
useGLTF.preload(flowerAssetMap.tulip3.url);
