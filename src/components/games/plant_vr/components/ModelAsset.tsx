import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import type { Object3D } from "three";
import { Box3, Vector3 } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

type ModelAssetProps = {
  rotation?: [number, number, number];
  targetHeight: number;
  url: string;
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

export default function ModelAsset({
  rotation = [0, 0, 0],
  targetHeight,
  url,
}: ModelAssetProps) {
  const gltf = useGLTF(url);

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

    cleanupAndNormalizeModel(scene, targetHeight);

    return scene;
  }, [gltf.scene, targetHeight]);

  return <primitive dispose={null} object={clonedScene} rotation={rotation} />;
}
