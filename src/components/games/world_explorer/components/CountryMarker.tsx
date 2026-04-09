import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import type { Group, Mesh, Object3D } from "three";
import * as THREE from "three";
import type { Country } from "../types";

type CountryMarkerProps = {
  country: Country;
  earthRef: RefObject<Mesh | null>;
  isSelected: boolean;
  isCompleted: boolean;
  markerKind?: "country" | "capital";
  onSelect: (country: Country) => void;
};

export default function CountryMarker({
  country,
  earthRef,
  isSelected,
  isCompleted,
  markerKind = "country",
  onSelect,
}: CountryMarkerProps) {
  const markerRef = useRef<Group>(null);
  const hitAreaRef = useRef<Mesh>(null);
  const coreRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { camera } = useThree();
  const worldPositionRef = useRef(new THREE.Vector3());
  const normalRef = useRef(new THREE.Vector3());
  const cameraDirectionRef = useRef(new THREE.Vector3());
  const handleSelect = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    onSelect(country);
  };

  const markerColor = useMemo(() => {
    if (markerKind === "capital") {
      if (isSelected) return "#38bdf8";
      if (isHovered) return "#7dd3fc";
      return "#0ea5e9";
    }
    if (isCompleted) return "#4ade80";
    if (isSelected) return "#fde047";
    if (isHovered) return "#7dd3fc";
    return "#f8fafc";
  }, [isCompleted, isHovered, isSelected, markerKind]);

  const markerPosition = useMemo(() => {
    const sourcePosition =
      markerKind === "capital" && country.capitalPosition ? country.capitalPosition : country.position;
    const vector = new THREE.Vector3(...sourcePosition).normalize().multiplyScalar(2.08);
    return vector.toArray() as [number, number, number];
  }, [country.capitalPosition, country.position, markerKind]);

  useFrame(({ clock }) => {
    if (!markerRef.current) return;

    const pulse = 1 + Math.sin(clock.elapsedTime * 3.2) * 0.08;
    const emphasis = isSelected ? 1.2 : isHovered ? 1.12 : 1;
    const completionBoost = isCompleted ? 1.05 : 1;
    const kindScale = markerKind === "capital" ? 0.78 : 1;
    const scale = pulse * emphasis * completionBoost * kindScale;

    markerRef.current.scale.setScalar(scale);
    markerRef.current.lookAt(camera.position);
    const worldPosition = markerRef.current.getWorldPosition(worldPositionRef.current);
    const surfaceNormal = normalRef.current.copy(worldPosition).normalize();
    const cameraDirection = cameraDirectionRef.current
      .copy(camera.position)
      .sub(worldPosition)
      .normalize();
    const facingCamera = surfaceNormal.dot(cameraDirection) > 0.02;

    markerRef.current.visible = facingCamera;

    if (coreRef.current) {
      const material = coreRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = isSelected ? 1 : isHovered ? 0.8 : 0.55;
    }

    if (glowRef.current) {
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = isSelected ? 0.34 : isHovered ? 0.24 : 0.16;
    }
  });

  return (
    <group position={markerPosition} ref={markerRef}>
      <mesh
        onClick={handleSelect}
        onPointerDown={handleSelect}
        onPointerEnter={(event) => {
          event.stopPropagation();
          setIsHovered(true);
        }}
        onPointerLeave={() => setIsHovered(false)}
        ref={hitAreaRef}
      >
        <sphereGeometry args={[markerKind === "capital" ? 0.18 : 0.24, 18, 18]} />
        <meshBasicMaterial opacity={0} transparent />
      </mesh>

      <mesh
        onClick={handleSelect}
        onPointerDown={handleSelect}
        onPointerEnter={(event) => {
          event.stopPropagation();
          setIsHovered(true);
        }}
        onPointerLeave={() => setIsHovered(false)}
        ref={glowRef}
      >
        <sphereGeometry args={[markerKind === "capital" ? 0.06 : 0.085, 24, 24]} />
        <meshBasicMaterial
          color={markerColor}
          depthWrite={false}
          opacity={markerKind === "capital" ? 0.22 : 0.16}
          transparent
        />
      </mesh>

      <mesh
        onClick={handleSelect}
        onPointerDown={handleSelect}
        onPointerEnter={(event) => {
          event.stopPropagation();
          setIsHovered(true);
        }}
        onPointerLeave={() => setIsHovered(false)}
        ref={coreRef}
      >
        <sphereGeometry args={[markerKind === "capital" ? 0.022 : 0.03, 24, 24]} />
        <meshStandardMaterial
          color={markerColor}
          emissive={markerColor}
          emissiveIntensity={0.55}
          metalness={0.1}
          roughness={0.3}
        />
      </mesh>

      {isSelected && markerKind === "country" && (
        <Html center distanceFactor={7} occlude={[earthRef as RefObject<Object3D>]} sprite transform>
          <span className="pointer-events-none absolute left-1/2 top-[-1.9rem] flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/12 bg-slate-950/78 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-slate-100 shadow-[0_8px_24px_rgba(15,23,42,0.32)] whitespace-nowrap">
            <span className="text-[10px] leading-none">{country.flag}</span>
            <span>{country.name}</span>
          </span>
        </Html>
      )}
    </group>
  );
}
