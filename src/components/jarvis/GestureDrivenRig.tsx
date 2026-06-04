import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { ParticleField, type ColorMode } from "@/components/jarvis/ParticleField";
import type { TemplateId } from "@/lib/particle-templates";

interface GestureDrivenRigProps {
  template: TemplateId;
  count: number;
  spread: number;
  turbulence: number;
  rotationSpeed: number;
  colorMode: ColorMode;
  glow: number;
  targetPosition: [number, number, number];
  targetQuaternion: [number, number, number, number];
  scale: number;
  spreadMultiplier: number;
  turbulenceBoost: number;
}

export function GestureDrivenRig(props: GestureDrivenRigProps) {
  const groupRef = useRef<THREE.Group>(null);
  const position = useMemo(
    () => new THREE.Vector3(props.targetPosition[0], props.targetPosition[1], props.targetPosition[2]),
    [props.targetPosition],
  );
  const quaternion = useMemo(
    () => new THREE.Quaternion(...props.targetQuaternion),
    [props.targetQuaternion],
  );

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.lerp(position, 0.08);
    groupRef.current.quaternion.slerp(quaternion, 0.08);
    const currentScale = groupRef.current.scale.x;
    const nextScale = THREE.MathUtils.lerp(currentScale, props.scale, 0.08);
    groupRef.current.scale.setScalar(nextScale);
  });

  return (
    <group ref={groupRef}>
      <ParticleField
        template={props.template}
        count={props.count}
        spread={props.spread * props.spreadMultiplier}
        turbulence={props.turbulence + props.turbulenceBoost}
        rotationSpeed={props.rotationSpeed}
        colorMode={props.colorMode}
        glow={props.glow}
      />
    </group>
  );
}