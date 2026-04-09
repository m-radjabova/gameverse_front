import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import type { Object3D } from "three";
import { Box3, Vector3 } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

const wallAssetMap = {
  fence: {
    url: new URL("../models/walls/Fence.glb", import.meta.url).href,
    targetHeight: 1.7,
  },
  hedge: {
    url: new URL("../models/walls/Hedge.glb", import.meta.url).href,
    targetHeight: 1.3,
  },
  fountain: {
    url: new URL("../models/walls/Fountain.glb", import.meta.url).href,
    targetHeight: 2.6,
  },
  bench: {
    url: new URL("../models/walls/Bench.glb", import.meta.url).href,
    targetHeight: 1.15,
  },
} as const;

export type WallVariant = keyof typeof wallAssetMap;

type WallModelProps = {
  position: [number, number, number];
  scale?: number;
  rotationY?: number;
  variant: WallVariant;
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

export default function WallModel({
  position,
  scale = 1,
  rotationY = 0,
  variant,
}: WallModelProps) {
  const asset = wallAssetMap[variant];
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

useGLTF.preload(wallAssetMap.fence.url);
useGLTF.preload(wallAssetMap.hedge.url);
useGLTF.preload(wallAssetMap.fountain.url);
useGLTF.preload(wallAssetMap.bench.url);
