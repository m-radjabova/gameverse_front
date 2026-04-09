import { useFrame, useThree } from "@react-three/fiber";
import { useXR, useXRControllerLocomotion } from "@react-three/xr";
import { useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import type { Group } from "three";
import { Euler, Vector3 } from "three";

const moveVector = new Vector3();
const worldPosition = new Vector3();
const zooBoundsX = 18.6;
const zooBoundsZMin = -18.6;
const zooBoundsZMax = 18.6;
const maxPitch = Math.PI / 2.8;

type UseXRMovementParams = {
  autoMoveTarget: [number, number, number] | null;
  onAutoMoveComplete?: () => void;
  originRef: RefObject<Group | null>;
};

export function useXRMovement({
  autoMoveTarget,
  onAutoMoveComplete,
  originRef,
}: UseXRMovementParams) {
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const isPresenting = useXR((state) => state.session != null);
  const [playerPosition, setPlayerPosition] = useState(() => new Vector3(0, 1.6, 14));
  const pressedKeysRef = useRef(new Set<string>());
  const lastPositionRef = useRef(new Vector3(0, 1.6, 14));
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const autoTargetRef = useRef<Vector3 | null>(null);
  const desktopPositionRef = useRef(new Vector3(0, 1.65, 16));
  const desktopYawRef = useRef(0);
  const desktopPitchRef = useRef(0);

  useEffect(() => {
    autoTargetRef.current = autoMoveTarget ? new Vector3(...autoMoveTarget) : null;
  }, [autoMoveTarget]);

  useXRControllerLocomotion(
    originRef,
    { speed: 2.3 },
    { type: "smooth", speed: 1.6, deadZone: 0.3 },
    "left",
  );

  useEffect(() => {
    const movementKeys = new Set([
      "w",
      "a",
      "s",
      "d",
      "q",
      "e",
      "shift",
      "arrowup",
      "arrowdown",
      "arrowleft",
      "arrowright",
    ]);

    const onKeyDown = (event: KeyboardEvent) => {
      if (movementKeys.has(event.key.toLowerCase())) {
        event.preventDefault();
      }

      pressedKeysRef.current.add(event.key.toLowerCase());
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (movementKeys.has(event.key.toLowerCase())) {
        event.preventDefault();
      }

      pressedKeysRef.current.delete(event.key.toLowerCase());
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    if (isPresenting) {
      return;
    }

    const canvas = gl.domElement;

    const onCanvasClick = () => {
      void canvas.requestPointerLock?.();
    };

    const onPointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement === canvas);
    };

    const onMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== canvas) {
        return;
      }

      desktopYawRef.current -= event.movementX * 0.0024;
      desktopPitchRef.current = Math.max(
        -maxPitch,
        Math.min(maxPitch, desktopPitchRef.current - event.movementY * 0.002),
      );
    };

    canvas.addEventListener("click", onCanvasClick);
    document.addEventListener("pointerlockchange", onPointerLockChange);
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      canvas.removeEventListener("click", onCanvasClick);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [gl, isPresenting, originRef]);

  useFrame((_, delta) => {
    if (!originRef.current) {
      return;
    }

    if (!isPresenting) {
      moveVector.set(0, 0, 0);
      let hasManualMovementInput = false;

      if (pressedKeysRef.current.has("w")) {
        moveVector.z -= 1;
        hasManualMovementInput = true;
      }
      if (pressedKeysRef.current.has("s")) {
        moveVector.z += 1;
        hasManualMovementInput = true;
      }
      if (pressedKeysRef.current.has("a")) {
        moveVector.x -= 1;
        hasManualMovementInput = true;
      }
      if (pressedKeysRef.current.has("d")) {
        moveVector.x += 1;
        hasManualMovementInput = true;
      }
      if (pressedKeysRef.current.has("arrowup")) {
        moveVector.z -= 1;
        hasManualMovementInput = true;
      }
      if (pressedKeysRef.current.has("arrowdown")) {
        moveVector.z += 1;
        hasManualMovementInput = true;
      }
      if (pressedKeysRef.current.has("arrowleft")) {
        moveVector.x -= 1;
        hasManualMovementInput = true;
      }
      if (pressedKeysRef.current.has("arrowright")) {
        moveVector.x += 1;
        hasManualMovementInput = true;
      }
      if (pressedKeysRef.current.has("q")) desktopYawRef.current += delta * 1.8;
      if (pressedKeysRef.current.has("e")) desktopYawRef.current -= delta * 1.8;

      if (moveVector.lengthSq() > 0) {
        const speed = pressedKeysRef.current.has("shift") ? 6.4 : 4.6;

        moveVector
          .normalize()
          .applyEuler(new Euler(0, desktopYawRef.current, 0))
          .multiplyScalar(delta * speed);

        desktopPositionRef.current.add(moveVector);

        if (hasManualMovementInput && autoTargetRef.current) {
          autoTargetRef.current = null;
          onAutoMoveComplete?.();
        }
      }

      if (!hasManualMovementInput && autoTargetRef.current) {
        const target = autoTargetRef.current;
        const dx = target.x - desktopPositionRef.current.x;
        const dz = target.z - desktopPositionRef.current.z;
        const distance = Math.hypot(dx, dz);

        if (distance < 0.35) {
          autoTargetRef.current = null;
          onAutoMoveComplete?.();
        } else {
          const targetYaw = Math.atan2(dx, dz);
          const yawDelta = Math.atan2(
            Math.sin(targetYaw - desktopYawRef.current),
            Math.cos(targetYaw - desktopYawRef.current),
          );

          desktopYawRef.current += yawDelta * Math.min(1, delta * 3.4);

          moveVector
            .set(0, 0, 1)
            .applyEuler(new Euler(0, desktopYawRef.current, 0))
            .multiplyScalar(delta * Math.min(4.8, 1.8 + distance));

          desktopPositionRef.current.add(moveVector);
        }
      }

      desktopPositionRef.current.x = Math.max(
        -zooBoundsX,
        Math.min(zooBoundsX, desktopPositionRef.current.x),
      );
      desktopPositionRef.current.z = Math.max(
        zooBoundsZMin,
        Math.min(zooBoundsZMax, desktopPositionRef.current.z),
      );

      camera.position.copy(desktopPositionRef.current);
      camera.rotation.order = "YXZ";
      camera.rotation.set(desktopPitchRef.current, desktopYawRef.current, 0);

      originRef.current.position.x = desktopPositionRef.current.x;
      originRef.current.position.z = desktopPositionRef.current.z;
      originRef.current.rotation.y = desktopYawRef.current;
    }

    camera.getWorldPosition(worldPosition);

    if (lastPositionRef.current.distanceToSquared(worldPosition) > 0.0008) {
      lastPositionRef.current.copy(worldPosition);
      setPlayerPosition(worldPosition.clone());
    }
  });

  const movementHint = useMemo(
    () =>
      isPresenting
        ? "Chap joystick bilan yurish, o'ng joystick bilan burilish mumkin."
        : isPointerLocked
          ? autoMoveTarget
            ? "Hayvon tanlandi: avtomatik yaqinlashuv ishlayapti. Xohlasangiz W A S D bilan bekor qilib o'zingiz yuring."
            : "Mouse bilan tepaga-pastga va yonlarga qarang, W A S D yoki strelkalar bilan yuring, Q/E buradi, Shift tezlashtiradi."
          : "Sahnani bir marta bosing, keyin mouse bilan qarang va W A S D yoki strelkalar bilan yuring, Q/E bilan buriling.",
    [autoMoveTarget, isPointerLocked, isPresenting],
  );

  return {
    isPresenting,
    isPointerLocked,
    movementHint,
    playerPosition,
  };
}
