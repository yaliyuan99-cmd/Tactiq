/**
 * The interactive 3D ring — a stylised engineering twin, not a product
 * render. Built from primitives so every component is individually
 * addressable: the explode slider moves parts along staged vectors, and
 * selection is shared with the page's component list (digital-twin rule:
 * touch the list, the model answers; touch the model, the list answers).
 *
 * Motion: all positions/rotations ease with exponential damping (physical
 * weight, no bounce). Idle rotation pauses on hover/drag and disappears
 * entirely under reduced motion (frameloop stays, damping still settles).
 *
 * This module is loaded lazily — three.js never enters the main bundle.
 */
import { useRef, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { RING_PARTS, type RingPart, type PartId } from './ringParts';

const EASE = (t: number) => t * t * (3 - 2 * t); // smoothstep

interface RingSceneProps {
  /** 0 = assembled, 1 = fully exploded. */
  explode: number;
  selected: PartId | null;
  onSelect: (id: PartId | null) => void;
  reducedMotion: boolean;
  /** Camera distance, driven by the page's zoom controls / wheel. */
  zoom: number;
}

function PartMesh({
  part,
  explode,
  selected,
  onSelect,
  reducedMotion,
}: {
  part: RingPart;
  explode: number;
  selected: PartId | null;
  onSelect: (id: PartId | null) => void;
  reducedMotion: boolean;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);

  const isSelected = selected === part.id;
  const isDimmed = selected !== null && !isSelected;

  // Progress of THIS part within its choreography window.
  const target = useMemo(() => {
    const [start, end] = part.window;
    const local = EASE(Math.min(1, Math.max(0, (explode - start) / (end - start))));
    const pull = isSelected ? 0.16 : 0;
    return new THREE.Vector3(
      part.assembled[0] + part.explodeDir[0] * (part.explodeDistance * local + pull),
      part.assembled[1] + part.explodeDir[1] * (part.explodeDistance * local + pull),
      part.assembled[2] + part.explodeDir[2] * (part.explodeDistance * local + pull),
    );
  }, [explode, isSelected, part]);

  const appeared = part.appearsAt === undefined || explode >= part.appearsAt;

  useFrame((_, delta) => {
    if (!mesh.current || !material.current) return;
    const lambda = reducedMotion ? 50 : 6; // reduced motion ≈ instant settle
    mesh.current.position.x = THREE.MathUtils.damp(mesh.current.position.x, target.x, lambda, delta);
    mesh.current.position.y = THREE.MathUtils.damp(mesh.current.position.y, target.y, lambda, delta);
    mesh.current.position.z = THREE.MathUtils.damp(mesh.current.position.z, target.z, lambda, delta);
    const scaleTarget = appeared ? 1 : 0.001;
    const s = THREE.MathUtils.damp(mesh.current.scale.x, scaleTarget, lambda, delta);
    mesh.current.scale.setScalar(s);
    material.current.opacity = THREE.MathUtils.damp(
      material.current.opacity,
      isDimmed ? 0.28 : 1,
      reducedMotion ? 50 : 10,
      delta,
    );
    material.current.emissiveIntensity = THREE.MathUtils.damp(
      material.current.emissiveIntensity,
      isSelected ? 0.45 : hovered ? 0.2 : 0,
      reducedMotion ? 50 : 10,
      delta,
    );
  });

  const onClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onSelect(isSelected ? null : part.id);
    },
    [isSelected, onSelect, part.id],
  );

  return (
    <mesh
      ref={mesh}
      position={part.assembled}
      rotation={[0, 0, part.rotationZ ?? 0]}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = '';
      }}
    >
      {part.geometry.kind === 'torus' ? (
        <torusGeometry args={[part.geometry.radius, part.geometry.tube, 28, 72]} />
      ) : part.geometry.kind === 'box' ? (
        <boxGeometry args={part.geometry.size} />
      ) : (
        <cylinderGeometry args={[part.geometry.radius, part.geometry.radius, part.geometry.height, 24]} />
      )}
      <meshStandardMaterial
        ref={material}
        color={part.color}
        emissive={part.color}
        emissiveIntensity={0}
        roughness={0.82}
        metalness={0.1}
        transparent
        opacity={1}
      />
    </mesh>
  );
}

function RingAssembly({
  explode,
  selected,
  onSelect,
  reducedMotion,
  zoom,
}: RingSceneProps) {
  const group = useRef<THREE.Group>(null);
  const dragging = useRef(false);
  const hovering = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const targetRot = useRef({ x: 0.35, y: -0.5 });
  const idleSpin = useRef(0);

  useFrame((state, delta) => {
    if (!group.current) return;
    // Idle rotation — pauses while hovered/dragging, off under reduced motion.
    if (!reducedMotion && !dragging.current && !hovering.current && selected === null) {
      idleSpin.current += delta * 0.22;
    }
    const lambda = reducedMotion ? 50 : 5;
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      targetRot.current.y + idleSpin.current,
      lambda,
      delta,
    );
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      targetRot.current.x,
      lambda,
      delta,
    );
    // The camera pulls back as the assembly opens, keeping every part framed.
    const zoomTarget = zoom + explode * 1.6;
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, zoomTarget, 8, delta);
  });

  return (
    <>
      {/* Restrained studio lighting — matte prototype, no chrome.
          (r155+ physical light units: intensities carry the π factor.) */}
      <ambientLight intensity={2.3} />
      <directionalLight position={[2.5, 3, 4]} intensity={4.6} />
      <directionalLight position={[-3, -1.5, -2.5]} intensity={1.2} />

      {/* Invisible drag surface behind everything. */}
      <mesh
        position={[0, 0, -2.5]}
        onPointerDown={(e) => {
          dragging.current = true;
          last.current = { x: e.clientX, y: e.clientY };
          (e.target as Element)?.setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!dragging.current || !last.current) return;
          targetRot.current.y += (e.clientX - last.current.x) * 0.006;
          targetRot.current.x = Math.min(
            0.9,
            Math.max(-0.9, targetRot.current.x + (e.clientY - last.current.y) * 0.005),
          );
          last.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={() => {
          dragging.current = false;
          last.current = null;
        }}
        onPointerOver={() => {
          hovering.current = true;
        }}
        onPointerOut={() => {
          hovering.current = false;
          dragging.current = false;
        }}
        onClick={() => onSelect(null)}
      >
        <planeGeometry args={[30, 30]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <group ref={group}>
        {RING_PARTS.map((part) => (
          <PartMesh
            key={part.id}
            part={part}
            explode={explode}
            selected={selected}
            onSelect={onSelect}
            reducedMotion={reducedMotion}
          />
        ))}
      </group>
    </>
  );
}

export default function RingScene(props: RingSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.4], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      /* The canvas is decorative interaction sugar — everything it shows is
         mirrored in the component list beside it. */
      aria-hidden
      style={{ touchAction: 'none' }}
    >
      <RingAssembly {...props} />
    </Canvas>
  );
}
