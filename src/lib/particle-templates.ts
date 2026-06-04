// Generate target positions for various particle templates.
// All templates return Float32Array of length count * 3 centered around origin.

export type TemplateId =
  | "sphere"
  | "heart"
  | "saturn"
  | "sunflower"
  | "fireworks"
  | "car"
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
  { id: "heart", name: "Hearts" },
  { id: "saturn", name: "Saturn" },
  { id: "sunflower", name: "Sunflower" },
  { id: "car", name: "Car" },
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
        const hx = 1.3 * Math.pow(Math.sin(t), 3);
        const hy = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 15 + 0.15;
        const r = Math.random() < 0.4 ? 1 : Math.sqrt(Math.random());
        out[i * 3] = hx * r * 2.6 + rand(-0.08, 0.08);
        out[i * 3 + 1] = hy * r * 2.6 + rand(-0.08, 0.08);
        out[i * 3 + 2] = rand(-0.24, 0.24);
      }
      break;
    }
    case "saturn": {
      for (let i = 0; i < count; i++) {
        if (Math.random() < 0.35) {
          const phi = Math.random() * TAU;
          const theta = Math.acos(Math.random() * 2 - 1);
          const r = Math.pow(Math.random(), 0.6) * 1.15;
          out[i * 3] = r * Math.sin(theta) * Math.cos(phi);
          out[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
          out[i * 3 + 2] = r * Math.cos(theta);
        } else {
          let ringRadius = 1.55 + Math.random() * 2;
          while (ringRadius > 2.2 && ringRadius < 2.5) {
            ringRadius = 1.55 + Math.random() * 2;
          }
          const angle = Math.random() * TAU;
          const rx = ringRadius * Math.cos(angle);
          const rz = ringRadius * Math.sin(angle);
          const ry = (Math.random() - 0.5) * 0.05;
          const cosX = Math.cos(0.45);
          const sinX = Math.sin(0.45);
          const cosY = Math.cos(0.21);
          const sinY = Math.sin(0.21);
          const y1 = ry * cosX - rz * sinX;
          const z1 = ry * sinX + rz * cosX;
          out[i * 3] = rx * cosY + z1 * sinY;
          out[i * 3 + 1] = y1;
          out[i * 3 + 2] = -rx * sinY + z1 * cosY;
        }
      }
      break;
    }
    case "sunflower": {
      for (let i = 0; i < count; i++) {
        if (Math.random() < 0.45) {
          const r = Math.sqrt(Math.random()) * 1.55;
          const theta = i * 137.5 * (Math.PI / 180);
          out[i * 3] = r * Math.cos(theta);
          out[i * 3 + 1] = r * Math.sin(theta);
          out[i * 3 + 2] = rand(-0.14, 0.14);
        } else {
          const petalIndex = Math.floor(Math.random() * 32);
          const baseAngle = petalIndex * (TAU / 32);
          const petalT = Math.random();
          const r = 1.55 + 1.45 * petalT;
          const widthFactor = Math.sin(petalT * Math.PI) * 0.08;
          const angle = baseAngle + (Math.random() - 0.5) * widthFactor;
          out[i * 3] = r * Math.cos(angle);
          out[i * 3 + 1] = r * Math.sin(angle);
          out[i * 3 + 2] = Math.pow(petalT, 1.5) * 0.5 + rand(-0.08, 0.08);
        }
      }
      break;
    }
    case "fireworks": {
      for (let i = 0; i < count; i++) {
        const randVal = Math.random();
        if (randVal < 0.35) {
          const phi = Math.random() * TAU;
          const theta = Math.acos(Math.random() * 2 - 1);
          const r = 2.8 + Math.random() * 0.6;
          out[i * 3] = r * Math.sin(theta) * Math.cos(phi);
          out[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
          out[i * 3 + 2] = r * Math.cos(theta);
        } else if (randVal < 0.65) {
          const phi = Math.random() * TAU;
          const theta = Math.acos(Math.random() * 2 - 1);
          const r = 1.4 + Math.random() * 0.45;
          out[i * 3] = r * Math.sin(theta) * Math.cos(phi);
          out[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
          out[i * 3 + 2] = r * Math.cos(theta);
        } else if (randVal < 0.88) {
          const trailIndex = Math.floor(Math.random() * 8);
          const dirX = trailIndex & 1 ? 1 : -1;
          const dirY = trailIndex & 2 ? 1 : -1;
          const dirZ = trailIndex & 4 ? 1 : -1;
          const length = Math.random() * 3.6;
          const norm = Math.sqrt(3);
          out[i * 3] = (dirX / norm) * length + rand(-0.18, 0.18);
          out[i * 3 + 1] = (dirY / norm) * length + rand(-0.18, 0.18);
          out[i * 3 + 2] = (dirZ / norm) * length + rand(-0.18, 0.18);
        } else {
          const phi = Math.random() * TAU;
          const theta = Math.acos(Math.random() * 2 - 1);
          const r = Math.pow(Math.random(), 1.6) * 0.55;
          out[i * 3] = r * Math.sin(theta) * Math.cos(phi);
          out[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
          out[i * 3 + 2] = r * Math.cos(theta);
        }
      }
      break;
    }
    case "car": {
      for (let i = 0; i < count; i++) {
        const part = Math.random();
        let x = 0;
        let y = 0;
        let z = 0;
        if (part < 0.01) {
          const left = Math.random() < 0.5;
          x = 3.1;
          y = -0.1 + rand(-0.08, 0.08);
          z = left ? 0.95 : -0.95;
        } else if (part < 0.02) {
          const left = Math.random() < 0.5;
          x = -3.1;
          y = 0.1 + rand(-0.08, 0.08);
          z = left ? 1.05 : -1.05;
        } else if (part < 0.045) {
          x = -2.7 - Math.random() * 0.35;
          y = 0.5 + Math.random() * 0.25;
          z = rand(-1.15, 1.15);
        } else if (part < 0.25) {
          const wheelIndex = Math.floor(Math.random() * 4);
          const wheelX = wheelIndex < 2 ? 1.65 : -1.65;
          const wheelZ = wheelIndex % 2 === 0 ? 1.35 : -1.35;
          const angle = Math.random() * TAU;
          const radius = Math.random() < 0.35 ? Math.random() * 0.8 : 0.8;
          x = wheelX + Math.cos(angle) * radius;
          y = -0.85 + Math.sin(angle) * radius;
          z = wheelZ + rand(-0.15, 0.15);
        } else if (part < 0.65) {
          x = rand(-3.1, 3.1);
          z = rand(-1.4, 1.4);
          let topY = 0.25;
          const bottomY = -0.85;
          if (x > 1.05) topY = 0.25 - 0.5 * ((x - 1.05) / 1.8);
          if (x < -1.95) topY = 0.25 - 0.18 * ((-x - 1.95) / 0.9);
          const sideRand = Math.random();
          if (sideRand < 0.2) y = topY;
          else if (sideRand < 0.4) y = bottomY;
          else {
            y = bottomY + Math.random() * (topY - bottomY);
            if (Math.random() < 0.5) z = Math.random() < 0.5 ? 1.35 : -1.35;
            else x = Math.random() < 0.5 ? 3.1 : -3.1;
          }
        } else {
          x = -1.45 + Math.random() * 2.25;
          z = rand(-1.1, 1.1);
          let topY = 1.2;
          if (x > 0) topY = 0.25 + (1.2 - 0.25) * (1 - x / 0.8);
          else if (x < -0.95) topY = 0.25 + (1.2 - 0.25) * ((x + 1.45) / 0.5);
          if (Math.random() < 0.3) y = topY;
          else {
            y = 0.25 + Math.random() * (topY - 0.25);
            if (Math.random() < 0.5) z = Math.random() < 0.5 ? 1.05 : -1.05;
          }
        }
        out[i * 3] = x + rand(-0.04, 0.04);
        out[i * 3 + 1] = y + rand(-0.04, 0.04);
        out[i * 3 + 2] = z + rand(-0.04, 0.04);
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

function parseCssColor(input: string) {
  if (input.startsWith("#")) {
    const hex = input.replace("#", "");
    const normalized = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
    const int = Number.parseInt(normalized, 16);
    return {
      r: ((int >> 16) & 255) / 255,
      g: ((int >> 8) & 255) / 255,
      b: (int & 255) / 255,
    };
  }

  const match = input.match(/rgba?\(([^)]+)\)/i);
  if (!match) return { r: 1, g: 1, b: 1 };
  const [r, g, b] = match[1].split(",").map((value) => Number.parseFloat(value.trim()) / 255);
  return { r, g, b };
}

export function generateTemplateColors(template: TemplateId, count: number, primary: string, accent: string): Float32Array {
  const colors = new Float32Array(count * 3);
  const base = parseCssColor(primary);
  const alt = parseCssColor(accent);

  for (let i = 0; i < count; i++) {
    let color = base;

    switch (template) {
      case "heart": {
        const randValue = Math.random();
        color = randValue < 0.45 ? { r: 1, g: 0.08, b: 0.18 } : randValue < 0.8 ? { r: 1, g: 0.15, b: 0.55 } : { r: 0.85, g: 0, b: 0.35 };
        break;
      }
      case "sunflower": {
        color = Math.random() < 0.45
          ? Math.random() < 0.4
            ? { r: 0.18, g: 0.11, b: 0.05 }
            : Math.random() < 0.7
              ? { r: 0.28, g: 0.18, b: 0.08 }
              : { r: 0.12, g: 0.12, b: 0.08 }
          : Math.random() < 0.7
            ? { r: 1, g: 0.85, b: 0 }
            : { r: 0.95, g: 0.75, b: 0 };
        break;
      }
      case "saturn": {
        const randValue = Math.random();
        color = randValue < 0.35
          ? { r: 0.95, g: 0.65, b: 0.38 }
          : randValue < 0.65
            ? { r: 0.15, g: 0.72, b: 1 }
            : randValue < 0.86
              ? { r: 0.92, g: 0.72, b: 0.15 }
              : { r: 0.55, g: 0.45, b: 0.95 };
        break;
      }
      case "car": {
        const randValue = Math.random();
        color = randValue < 0.01
          ? { r: 1, g: 1, b: 0.85 }
          : randValue < 0.02
            ? { r: 1, g: 0.05, b: 0.05 }
            : randValue < 0.045
              ? { r: 0.15, g: 0.15, b: 0.15 }
              : randValue < 0.25
                ? Math.random() < 0.3 ? { r: 0.75, g: 0.75, b: 0.75 } : { r: 0.18, g: 0.18, b: 0.18 }
                : randValue < 0.65
                  ? { r: 0.95, g: 0.08, b: 0.18 }
                  : { r: 0.28, g: 0.82, b: 0.98 };
        break;
      }
      case "fireworks": {
        const randValue = Math.random();
        color = randValue < 0.22
          ? { r: 0.08, g: 0.98, b: 0.28 }
          : randValue < 0.44
            ? { r: 0.98, g: 0.08, b: 0.58 }
            : randValue < 0.66
              ? { r: 0.08, g: 0.68, b: 0.98 }
              : randValue < 0.85
                ? { r: 0.98, g: 0.88, b: 0.08 }
                : { r: 1, g: 1, b: 1 };
        break;
      }
      default: {
        const t = i / count;
        color = {
          r: base.r + (alt.r - base.r) * ((Math.sin(t * Math.PI * 4) + 1) / 2),
          g: base.g + (alt.g - base.g) * ((Math.sin(t * Math.PI * 4) + 1) / 2),
          b: base.b + (alt.b - base.b) * ((Math.sin(t * Math.PI * 4) + 1) / 2),
        };
      }
    }

    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  return colors;
}
