/**
 * Generative Topographic Contour System
 *
 * Creates unique, deterministic contour patterns for each case study
 * based on slug hash. Inspired by OS survey maps and terrain visualization.
 */

// ============================================
// SEEDED RANDOM NUMBER GENERATOR
// ============================================

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function createSeededRandom(seed: number) {
  return function(): number {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

// ============================================
// SIMPLEX NOISE (Lightweight implementation)
// ============================================

const GRAD3 = [
  [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
  [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
  [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
];

function createNoise(seed: number) {
  const perm = new Array(512);
  const random = createSeededRandom(seed);

  // Generate permutation table
  const p = new Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;

  // Shuffle with seeded random
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }

  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255];
  }

  function dot(g: number[], x: number, y: number): number {
    return g[0] * x + g[1] * y;
  }

  return function noise2D(xin: number, yin: number): number {
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;

    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);

    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;

    let i1, j1;
    if (x0 > y0) { i1 = 1; j1 = 0; }
    else { i1 = 0; j1 = 1; }

    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;

    const ii = i & 255;
    const jj = j & 255;

    let n0 = 0, n1 = 0, n2 = 0;

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      t0 *= t0;
      const gi0 = perm[ii + perm[jj]] % 12;
      n0 = t0 * t0 * dot(GRAD3[gi0], x0, y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      t1 *= t1;
      const gi1 = perm[ii + i1 + perm[jj + j1]] % 12;
      n1 = t1 * t1 * dot(GRAD3[gi1], x1, y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      t2 *= t2;
      const gi2 = perm[ii + 1 + perm[jj + 1]] % 12;
      n2 = t2 * t2 * dot(GRAD3[gi2], x2, y2);
    }

    // Scale to [-1, 1]
    return 70 * (n0 + n1 + n2);
  };
}

// ============================================
// COLOR SCHEMES
// ============================================

export interface ColorScheme {
  background: string;
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
}

const COLOR_SCHEMES: ColorScheme[] = [
  {
    // Forest depth
    background: '#0a2628',
    primary: '#D9EDB5',
    secondary: '#41818e',
    accent: '#87a290',
    glow: 'rgba(217, 237, 181, 0.15)',
  },
  {
    // Teal waters
    background: '#0d3035',
    primary: '#7DB5C7',
    secondary: '#41818e',
    accent: '#A0C7FE',
    glow: 'rgba(125, 181, 199, 0.12)',
  },
  {
    // Midnight survey
    background: '#081820',
    primary: '#A0C7FE',
    secondary: '#41818e',
    accent: '#D9EDB5',
    glow: 'rgba(160, 199, 254, 0.1)',
  },
  {
    // Warm terrain
    background: '#1a2a2c',
    primary: '#D67656',
    secondary: '#D9EDB5',
    accent: '#87a290',
    glow: 'rgba(214, 118, 86, 0.12)',
  },
  {
    // Deep forest
    background: '#0c1f21',
    primary: '#87a290',
    secondary: '#D9EDB5',
    accent: '#41818e',
    glow: 'rgba(135, 162, 144, 0.15)',
  },
];

// ============================================
// CONTOUR PATH GENERATION
// ============================================

interface ContourLine {
  path: string;
  opacity: number;
  strokeWidth: number;
  level: number;
}

interface ContourConfig {
  width: number;
  height: number;
  levels: number;
  complexity: number;
  centerX?: number;
  centerY?: number;
}

export interface ContourPattern {
  lines: ContourLine[];
  colorScheme: ColorScheme;
  seed: number;
  peaks: Array<{ x: number; y: number; strength: number }>;
}

function generateContourPath(
  centerX: number,
  centerY: number,
  baseRadius: number,
  noise: (x: number, y: number) => number,
  noiseScale: number,
  noiseIntensity: number,
  points: number = 120
): string {
  const pathPoints: Array<{ x: number; y: number }> = [];

  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2;

    // Sample noise at this angle
    const nx = Math.cos(angle) * noiseScale + centerX * 0.01;
    const ny = Math.sin(angle) * noiseScale + centerY * 0.01;
    const noiseValue = noise(nx, ny);

    // Apply noise distortion to radius
    const distortedRadius = baseRadius * (1 + noiseValue * noiseIntensity);

    const x = centerX + Math.cos(angle) * distortedRadius;
    const y = centerY + Math.sin(angle) * distortedRadius;

    pathPoints.push({ x, y });
  }

  // Generate smooth SVG path using cubic bezier curves
  if (pathPoints.length < 3) return '';

  let d = `M ${pathPoints[0].x.toFixed(2)} ${pathPoints[0].y.toFixed(2)}`;

  for (let i = 0; i < pathPoints.length - 1; i++) {
    const p0 = pathPoints[i === 0 ? pathPoints.length - 2 : i - 1];
    const p1 = pathPoints[i];
    const p2 = pathPoints[i + 1];
    const p3 = pathPoints[i + 2 >= pathPoints.length ? (i + 2) % pathPoints.length : i + 2];

    // Catmull-Rom to Bezier conversion
    const tension = 0.3;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  return d + ' Z';
}

export function generateContourPattern(
  slug: string,
  config: ContourConfig
): ContourPattern {
  const seed = hashString(slug || 'default');
  const random = createSeededRandom(seed);
  const noise = createNoise(seed);

  const { width, height, levels, complexity } = config;
  const centerX = config.centerX ?? width / 2;
  const centerY = config.centerY ?? height / 2;

  // Select color scheme deterministically
  const colorScheme = COLOR_SCHEMES[seed % COLOR_SCHEMES.length];

  // Generate multiple "peak" centers for more complex terrain
  const peakCount = 1 + Math.floor(random() * 2);
  const peaks: Array<{ x: number; y: number; strength: number }> = [];

  peaks.push({
    x: centerX + (random() - 0.5) * width * 0.3,
    y: centerY + (random() - 0.5) * height * 0.3,
    strength: 0.8 + random() * 0.4,
  });

  for (let i = 1; i < peakCount; i++) {
    peaks.push({
      x: centerX + (random() - 0.5) * width * 0.6,
      y: centerY + (random() - 0.5) * height * 0.6,
      strength: 0.3 + random() * 0.5,
    });
  }

  const lines: ContourLine[] = [];
  const maxRadius = Math.max(width, height) * 0.6;
  const noiseScale = 1.5 + random() * 1.5;

  // Generate contour lines from center outward
  for (let level = 0; level < levels; level++) {
    const t = level / (levels - 1);
    const baseRadius = 20 + t * maxRadius;

    // Noise intensity increases toward outer rings
    const noiseIntensity = 0.15 + t * 0.35 * complexity;

    // Opacity: stronger in middle, fading at edges and center
    const opacityCurve = Math.sin(t * Math.PI);
    const opacity = 0.15 + opacityCurve * 0.5;

    // Stroke width varies subtly
    const strokeWidth = 1 + (1 - t) * 0.5;

    // Generate path for each peak influence
    for (const peak of peaks) {
      const path = generateContourPath(
        peak.x,
        peak.y,
        baseRadius * peak.strength,
        noise,
        noiseScale + level * 0.1,
        noiseIntensity,
        100 + level * 10
      );

      if (path) {
        lines.push({
          path,
          opacity: opacity * peak.strength,
          strokeWidth,
          level,
        });
      }
    }
  }

  return {
    lines,
    colorScheme,
    seed,
    peaks,
  };
}

// ============================================
// ANIMATION KEYFRAMES GENERATOR
// ============================================

export function generateAnimationOffset(seed: number, index: number): number {
  const random = createSeededRandom(seed + index * 1000);
  return random() * 20; // 0-20 second offset
}

// ============================================
// GRADIENT DEFINITIONS
// ============================================

export function generateGradientId(slug: string): string {
  return `contour-glow-${hashString(slug || 'default')}`;
}
