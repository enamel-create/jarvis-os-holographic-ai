import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { generatePositions, generateTemplateColors, type TemplateId } from "@/lib/particle-templates";
import { THEMES, useTheme } from "@/lib/theme";

export type ColorMode = "single" | "template" | "rainbow" | "cosmic" | "neon" | "plasma" | "aurora" | "electric" | "quantum";

interface Props {
  template: TemplateId;
  count: number;
  spread: number;
  turbulence: number;
  rotationSpeed: number;
  colorMode: ColorMode;
  glow: number;
}

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uMorph;
  uniform float uTurbulence;
  uniform float uSpread;
  attribute vec3 aTarget;
  attribute vec3 aPrev;
  attribute vec3 aColor;
  attribute float aSeed;
  varying vec3 vColor;
  varying float vAlpha;

  vec3 hash3(float n) {
    return fract(sin(vec3(n, n + 1.0, n + 2.0)) * 43758.5453);
  }

  void main() {
    vec3 pos = mix(aPrev, aTarget, smoothstep(0.0, 1.0, uMorph)) * uSpread;
    float t = uTime + aSeed * 6.2831;
    vec3 jitter = (hash3(aSeed) - 0.5) * 2.0;
    pos += jitter * uTurbulence * (0.5 + 0.5 * sin(t * 0.7));
    pos.y += sin(t * 0.8 + aSeed * 4.0) * 0.04;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    float dist = -mv.z;
    gl_PointSize = uSize * (300.0 / max(dist, 0.001));
    vColor = aColor;
    vAlpha = 1.0;
  }
`;

const FRAG = /* glsl */ `
  uniform float uGlow;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);
    float halo = pow(core, 2.0);
    vec3 col = vColor * (0.6 + halo * (1.4 + uGlow));
    float a = halo * vAlpha;
    gl_FragColor = vec4(col, a);
  }
`;

function colorForMode(mode: ColorMode, i: number, total: number, base: THREE.Color, accent: THREE.Color, target: THREE.Color) {
  const t = i / total;
  const c = new THREE.Color();
  switch (mode) {
    case "single":
      c.copy(base);
      break;
    case "template": {
      c.copy(base).lerp(accent, (Math.sin(t * Math.PI * 4) + 1) / 2);
      break;
    }
    case "rainbow":
      c.setHSL((t + Math.random() * 0.02) % 1, 0.85, 0.6);
      break;
    case "cosmic":
      c.setHSL(0.6 + Math.random() * 0.2, 0.8, 0.4 + Math.random() * 0.4);
      break;
    case "neon":
      c.setHSL([0.83, 0.5, 0.95][i % 3], 1.0, 0.6);
      break;
    case "plasma":
      c.setHSL(0.78 + Math.sin(t * 6) * 0.1, 0.9, 0.55);
      break;
    case "aurora":
      c.setHSL(0.4 + Math.sin(t * 8) * 0.15, 0.7, 0.55);
      break;
    case "electric":
      c.setHSL(0.55 + Math.random() * 0.05, 1.0, 0.65);
      break;
    case "quantum":
      c.copy(accent).lerp(new THREE.Color("#ffffff"), Math.random() * 0.6);
      break;
  }
  target.copy(c);
}

export function ParticleField({ template, count, spread, turbulence, rotationSpeed, colorMode, glow }: Props) {
  const { theme } = useTheme();
  const pointsRef = useRef<THREE.Points>(null!);
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const morphStart = useRef(performance.now());
  const [primary, accent] = useMemo(() => {
    const activeTheme = THEMES.find((entry) => entry.id === theme);
    return activeTheme?.swatch ?? ["#22d3ee", "#0ea5e9"];
  }, [theme]);

  const { positions, prev, colors, seeds } = useMemo(() => {
    const positions = generatePositions(template, count);
    const prev = new Float32Array(positions);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) seeds[i] = Math.random();
    const base = new THREE.Color(primary);
    const accentColor = new THREE.Color(accent);
    const colors =
      colorMode === "template"
        ? generateTemplateColors(template, count, primary, accent)
        : (() => {
            const arr = new Float32Array(count * 3);
            const tmp = new THREE.Color();
            for (let i = 0; i < count; i++) {
              colorForMode(colorMode, i, count, base, accentColor, tmp);
              arr[i * 3] = tmp.r;
              arr[i * 3 + 1] = tmp.g;
              arr[i * 3 + 2] = tmp.b;
            }
            return arr;
          })();
    return { positions, prev, colors, seeds };
  }, [accent, count, colorMode, primary, template]);

  // morph target when template changes
  useEffect(() => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry as THREE.BufferGeometry;
    const targetAttr = geom.getAttribute("aTarget") as THREE.BufferAttribute;
    const prevAttr = geom.getAttribute("aPrev") as THREE.BufferAttribute;
    // snapshot current rendered position into prev
    prevAttr.array.set(targetAttr.array);
    prevAttr.needsUpdate = true;
    const next = generatePositions(template, count);
    targetAttr.array.set(next);
    targetAttr.needsUpdate = true;
    morphStart.current = performance.now();
    if (matRef.current) matRef.current.uniforms.uMorph.value = 0;
  }, [template, count]);

  // recolor when colorMode or theme changes
  useEffect(() => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry as THREE.BufferGeometry;
    const colAttr = geom.getAttribute("aColor") as THREE.BufferAttribute;
    const arr = colAttr.array as Float32Array;
    if (colorMode === "template") {
      arr.set(generateTemplateColors(template, count, primary, accent));
    } else {
      const base = new THREE.Color(primary);
      const accentColor = new THREE.Color(accent);
      const tmp = new THREE.Color();
      for (let i = 0; i < count; i++) {
        colorForMode(colorMode, i, count, base, accentColor, tmp);
        arr[i * 3] = tmp.r;
        arr[i * 3 + 1] = tmp.g;
        arr[i * 3 + 2] = tmp.b;
      }
    }
    colAttr.needsUpdate = true;
  }, [accent, colorMode, count, primary, template]);

  const { gl } = useThree();
  useEffect(() => {
    gl.setClearColor(new THREE.Color("#000000"), 0);
  }, [gl]);

  useFrame((state, dt) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    matRef.current.uniforms.uSpread.value = spread;
    matRef.current.uniforms.uTurbulence.value = turbulence;
    matRef.current.uniforms.uGlow.value = glow;
    const m = Math.min(1, (performance.now() - morphStart.current) / 1200);
    matRef.current.uniforms.uMorph.value = m;
    if (pointsRef.current) {
      pointsRef.current.rotation.y += dt * rotationSpeed;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.15;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aTarget" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aPrev" args={[prev, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uSize: { value: 6 },
          uMorph: { value: 1 },
          uTurbulence: { value: turbulence },
          uSpread: { value: spread },
          uGlow: { value: glow },
        }}
      />
    </points>
  );
}
