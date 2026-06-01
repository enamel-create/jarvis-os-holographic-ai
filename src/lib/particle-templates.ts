// Generate target positions for various particle templates.
// All templates return Float32Array of length count * 3 centered around origin.

export type TemplateId =
  | "sphere"
  | "heart"
  | "saturn"
  | "sunflower"
  | "fireworks"
  | "dna"
  | "galaxy"
  | "atom"
  | "neural"
  | "torus"
  | "infinity"
  | "cube"
  | "spiral"
  | "butterfly";

export const TEMPLATES: { id: TemplateId; name: string }[] = [
  { id: "galaxy", name: "Galaxy" },
  { id: "dna", name: "DNA Helix" },
  { id: "atom", name: "Atom" },
  { id: "neural", name: "Neural Net" },
  { id: "torus", name: "Torus" },
  { id: "sphere", name: "Sphere" },
  { id: "heart", name: "Heart" },
  { id: "saturn", name: "Saturn" },
  { id: "sunflower", name: "Sunflower" },
  { id: "fireworks", name: "Fireworks" },
  { id: "infinity", name: "Infinity" },
  { id: "cube", name: "Cube" },
  { id: "spiral", name: "Spiral" },
  { id: "butterfly", name: "Butterfly" },
];

const TAU = Math.PI * 2;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

export function generatePositions(template: TemplateId, count: number): Float32Array {
  const out = new Float32Array(count * 3);
  switch (template) {
    case "sphere": {
      for (let i = 0; i < count; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = TAU * u;
        const phi = Math.acos(2 * v - 1);
        const r = 2.2 + rand(-0.05, 0.05);
        out[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        out[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        out[i * 3 + 2] = r * Math.cos(phi);
      }
      break;
    }
    case "heart": {
      for (let i = 0; i < count; i++) {
        const t = rand(0, TAU);
        const s = 0.08;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        out[i * 3] = x * s + rand(-0.1, 0.1);
        out[i * 3 + 1] = y * s + rand(-0.1, 0.1);
        out[i * 3 + 2] = rand(-0.2, 0.2);
      }
      break;
    }
    case "saturn": {
      for (let i = 0; i < count; i++) {
        const planet = i < count * 0.35;
        if (planet) {
          const u = Math.random();
          const v = Math.random();
          const theta = TAU * u;
          const phi = Math.acos(2 * v - 1);
          const r = 1.2;
          out[i * 3] = r * Math.sin(phi) * Math.cos(theta);
          out[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.9;
          out[i * 3 + 2] = r * Math.cos(phi);
        } else {
          const a = rand(0, TAU);
          const r = rand(1.7, 2.6);
          out[i * 3] = Math.cos(a) * r;
          out[i * 3 + 1] = rand(-0.04, 0.04);
          out[i * 3 + 2] = Math.sin(a) * r;
        }
      }
      break;
    }
    case "sunflower": {
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < count; i++) {
        const r = Math.sqrt(i / count) * 2.5;
        const a = i * golden;
        out[i * 3] = Math.cos(a) * r;
        out[i * 3 + 1] = Math.sin(a) * r;
        out[i * 3 + 2] = rand(-0.06, 0.06);
      }
      break;
    }
    case "fireworks": {
      const bursts = 7;
      for (let i = 0; i < count; i++) {
        const b = i % bursts;
        const cx = Math.cos((b / bursts) * TAU) * 1.6;
        const cy = Math.sin((b / bursts) * TAU) * 1.2;
        const dir = Math.random() * TAU;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = rand(0.2, 1.1);
        out[i * 3] = cx + r * Math.sin(phi) * Math.cos(dir);
        out[i * 3 + 1] = cy + r * Math.sin(phi) * Math.sin(dir);
        out[i * 3 + 2] = r * Math.cos(phi);
      }
      break;
    }
    case "dna": {
      const turns = 6;
      for (let i = 0; i < count; i++) {
        const t = (i / count) * turns * TAU;
        const y = (i / count - 0.5) * 5;
        const strand = i % 3;
        const r = 0.8;
        if (strand === 2) {
          // rungs
          const lerp = (i % 17) / 17;
          out[i * 3] = Math.cos(t) * r * (1 - 2 * lerp);
          out[i * 3 + 1] = y;
          out[i * 3 + 2] = Math.sin(t) * r * (1 - 2 * lerp);
        } else {
          const offset = strand === 0 ? 0 : Math.PI;
          out[i * 3] = Math.cos(t + offset) * r;
          out[i * 3 + 1] = y;
          out[i * 3 + 2] = Math.sin(t + offset) * r;
        }
      }
      break;
    }
    case "galaxy": {
      const arms = 4;
      for (let i = 0; i < count; i++) {
        const arm = i % arms;
        const t = Math.pow(Math.random(), 0.6);
        const r = t * 3;
        const angle = (arm / arms) * TAU + t * 5;
        const spread = (1 - t) * 0.4 + 0.05;
        out[i * 3] = Math.cos(angle) * r + rand(-spread, spread);
        out[i * 3 + 1] = rand(-0.08, 0.08) * (1 - t * 0.8);
        out[i * 3 + 2] = Math.sin(angle) * r + rand(-spread, spread);
      }
      break;
    }
    case "atom": {
      for (let i = 0; i < count; i++) {
        const kind = i % 4;
        const a = Math.random() * TAU;
        const r = 1.8;
        if (kind === 0) {
          out[i * 3] = Math.cos(a) * r;
          out[i * 3 + 1] = Math.sin(a) * r;
          out[i * 3 + 2] = 0;
        } else if (kind === 1) {
          out[i * 3] = Math.cos(a) * r;
          out[i * 3 + 1] = 0;
          out[i * 3 + 2] = Math.sin(a) * r;
        } else if (kind === 2) {
          out[i * 3] = 0;
          out[i * 3 + 1] = Math.cos(a) * r;
          out[i * 3 + 2] = Math.sin(a) * r;
        } else {
          // nucleus
          const u = Math.random();
          const v = Math.random();
          const theta = TAU * u;
          const phi = Math.acos(2 * v - 1);
          const nr = 0.35 * Math.cbrt(Math.random());
          out[i * 3] = nr * Math.sin(phi) * Math.cos(theta);
          out[i * 3 + 1] = nr * Math.sin(phi) * Math.sin(theta);
          out[i * 3 + 2] = nr * Math.cos(phi);
        }
      }
      break;
    }
    case "neural": {
      const nodes = 24;
      const pts: [number, number, number][] = [];
      for (let n = 0; n < nodes; n++) {
        pts.push([rand(-2.2, 2.2), rand(-1.4, 1.4), rand(-1.2, 1.2)]);
      }
      for (let i = 0; i < count; i++) {
        if (Math.random() < 0.25) {
          const p = pts[i % nodes];
          out[i * 3] = p[0] + rand(-0.04, 0.04);
          out[i * 3 + 1] = p[1] + rand(-0.04, 0.04);
          out[i * 3 + 2] = p[2] + rand(-0.04, 0.04);
        } else {
          const a = pts[Math.floor(Math.random() * nodes)];
          const b = pts[Math.floor(Math.random() * nodes)];
          const t = Math.random();
          out[i * 3] = a[0] + (b[0] - a[0]) * t;
          out[i * 3 + 1] = a[1] + (b[1] - a[1]) * t;
          out[i * 3 + 2] = a[2] + (b[2] - a[2]) * t;
        }
      }
      break;
    }
    case "torus": {
      const R = 1.8;
      const r = 0.6;
      for (let i = 0; i < count; i++) {
        const u = Math.random() * TAU;
        const v = Math.random() * TAU;
        out[i * 3] = (R + r * Math.cos(v)) * Math.cos(u);
        out[i * 3 + 1] = r * Math.sin(v);
        out[i * 3 + 2] = (R + r * Math.cos(v)) * Math.sin(u);
      }
      break;
    }
    case "infinity": {
      for (let i = 0; i < count; i++) {
        const t = rand(0, TAU);
        const s = 2.2;
        const denom = 1 + Math.sin(t) * Math.sin(t);
        out[i * 3] = (s * Math.cos(t)) / denom + rand(-0.04, 0.04);
        out[i * 3 + 1] = (s * Math.sin(t) * Math.cos(t)) / denom + rand(-0.04, 0.04);
        out[i * 3 + 2] = rand(-0.15, 0.15);
      }
      break;
    }
    case "cube": {
      const s = 1.6;
      for (let i = 0; i < count; i++) {
        const face = i % 6;
        const u = rand(-s, s);
        const v = rand(-s, s);
        switch (face) {
          case 0: out[i*3]=s; out[i*3+1]=u; out[i*3+2]=v; break;
          case 1: out[i*3]=-s; out[i*3+1]=u; out[i*3+2]=v; break;
          case 2: out[i*3]=u; out[i*3+1]=s; out[i*3+2]=v; break;
          case 3: out[i*3]=u; out[i*3+1]=-s; out[i*3+2]=v; break;
          case 4: out[i*3]=u; out[i*3+1]=v; out[i*3+2]=s; break;
          case 5: out[i*3]=u; out[i*3+1]=v; out[i*3+2]=-s; break;
        }
      }
      break;
    }
    case "spiral": {
      for (let i = 0; i < count; i++) {
        const t = i / count;
        const a = t * TAU * 8;
        const r = t * 2.6;
        out[i * 3] = Math.cos(a) * r;
        out[i * 3 + 1] = (t - 0.5) * 3;
        out[i * 3 + 2] = Math.sin(a) * r;
      }
      break;
    }
    case "butterfly": {
      for (let i = 0; i < count; i++) {
        const t = rand(0, TAU * 6);
        const e = Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - Math.pow(Math.sin(t / 12), 5);
        const s = 0.45;
        out[i * 3] = Math.sin(t) * e * s;
        out[i * 3 + 1] = Math.cos(t) * e * s;
        out[i * 3 + 2] = rand(-0.15, 0.15);
      }
      break;
    }
  }
  return out;
}
