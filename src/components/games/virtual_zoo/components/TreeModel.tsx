import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import type { Object3D } from "three";
import { Box3, Vector3 } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

const treeAssetMap = {
  tree: {
    url: new URL("../models/trees/Tree.glb", import.meta.url).href,
    targetHeight: 2.8,
  },
  treeOne: {
    url: new URL("../models/trees/Tree (1).glb", import.meta.url).href,
    targetHeight: 3,
  },
  treeTwo: {
    url: new URL("../models/trees/Tree (2).glb", import.meta.url).href,
    targetHeight: 2.7,
  },
  grove: {
    url: new URL("../models/trees/Trees.glb", import.meta.url).href,
    targetHeight: 3.2,
  },
  palm: {
    url: new URL("../models/trees/Palm Tree.glb", import.meta.url).href,
    targetHeight: 3.4,
  },
} as const;

export type TreeVariant = keyof typeof treeAssetMap;

type TreeModelProps = {
  position: [number, number, number];
  scale?: number;
  rotationY?: number;
  variant: TreeVariant;
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

export default function TreeModel({
  position,
  scale = 1,
  rotationY = 0,
  variant,
}: TreeModelProps) {
  const asset = treeAssetMap[variant];
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

useGLTF.preload(treeAssetMap.tree.url);
useGLTF.preload(treeAssetMap.treeOne.url);
useGLTF.preload(treeAssetMap.treeTwo.url);
useGLTF.preload(treeAssetMap.grove.url);
useGLTF.preload(treeAssetMap.palm.url);
