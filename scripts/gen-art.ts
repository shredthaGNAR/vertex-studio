import { writeFileSync, mkdirSync } from "node:fs";

// Deterministic PRNG so artwork is stable across runs
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LIME = "#C8FF2E";
const CYAN = "#67E8F9";
const VIOLET = "#A78BFA";
const AMBER = "#FBBF24";

const grain = (id: string, opacity = 0.05) => `
  <filter id="${id}"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
  <rect width="100%" height="100%" filter="url(#${id})" opacity="${opacity}"/>`;

function smoothPath(pts: Array<[number, number]>): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const xc = (pts[i][0] + pts[i + 1][0]) / 2;
    const yc = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q ${pts[i][0]},${pts[i][1]} ${xc},${yc}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last[0]},${last[1]}`;
  return d;
}

/* ---------------------------------- DASHBOARD ---------------------------------- */
function dashboard(): string {
  const rand = mulberry32(42);
  const W = 1200, H = 900;
  // area chart data: upward random walk
  const pts: Array<[number, number]> = [];
  let v = 0.72;
  for (let i = 0; i <= 36; i++) {
    v -= 0.008 + rand() * 0.02;
    v = Math.max(0.12, Math.min(0.85, v + (rand() - 0.5) * 0.06));
    pts.push([150 + (i / 36) * 950, 120 + v * 620]);
  }
  const line = smoothPath(pts);
  const area = `${line} L 1100,780 L 150,780 Z`;
  // grid lines
  let grid = "";
  for (let i = 0; i < 6; i++) grid += `<line x1="150" y1="${140 + i * 128}" x2="1100" y2="${140 + i * 128}" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>`;
  // KPI cards
  const kpis = [
    { x: 150, label: "REVENUE", val: "$1.42M", delta: "+38.2%" },
    { x: 390, label: "CONVERSION", val: "4.86%", delta: "+212%" },
    { x: 630, label: "TRAFFIC", val: "812K", delta: "+94%" },
    { x: 870, label: "AVG. ORDER", val: "$132", delta: "+17%" },
  ];
  const kpiSvg = kpis.map(k => `
    <rect x="${k.x}" y="60" width="220" height="96" rx="14" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.07)"/>
    <text x="${k.x + 20}" y="92" font-family="monospace" font-size="11" fill="rgba(255,255,255,0.4)" letter-spacing="2">${k.label}</text>
    <text x="${k.x + 20}" y="128" font-family="Arial, sans-serif" font-weight="bold" font-size="28" fill="#fff">${k.val}</text>
    <text x="${k.x + 140}" y="128" font-family="monospace" font-size="13" fill="${LIME}">${k.delta}</text>`).join("");
  // bars
  let bars = "";
  for (let i = 0; i < 24; i++) {
    const h = 20 + rand() * 90;
    bars += `<rect x="${160 + i * 40}" y="${860 - h}" width="18" height="${h}" rx="4" fill="${i % 5 === 4 ? LIME : "rgba(255,255,255,0.12)"}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${LIME}" stop-opacity="0.35"/><stop offset="100%" stop-color="${LIME}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.7" cy="0.15" r="0.9">
      <stop offset="0%" stop-color="${LIME}" stop-opacity="0.12"/><stop offset="100%" stop-color="${LIME}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#0A0A0D"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  ${kpiSvg}
  ${grid}
  <path d="${area}" fill="url(#area)"/>
  <path d="${line}" fill="none" stroke="${LIME}" stroke-width="3.5" stroke-linecap="round"/>
  <circle cx="${pts[30][0]}" cy="${pts[30][1]}" r="7" fill="${LIME}"/>
  <circle cx="${pts[30][0]}" cy="${pts[30][1]}" r="16" fill="none" stroke="${LIME}" stroke-opacity="0.35" stroke-width="2"/>
  ${bars}
  <text x="60" y="48" font-family="monospace" font-size="12" fill="rgba(255,255,255,0.35)" letter-spacing="3">GROWTH / ANALYTICS</text>
  ${grain("g1")}
</svg>`;
}

/* ---------------------------------- CODE EDITOR ---------------------------------- */
function code(): string {
  const rand = mulberry32(7);
  const W = 1200, H = 900;
  const palette = [LIME, CYAN, VIOLET, "rgba(255,255,255,0.55)", "rgba(255,255,255,0.25)", AMBER];
  let rows = "";
  let y = 170;
  let lineNo = 1;
  while (y < 800) {
    const indent = Math.floor(rand() * 4) * 34;
    let x = 150 + indent;
    const segs = 2 + Math.floor(rand() * 3);
    for (let s = 0; s < segs; s++) {
      const w = 40 + rand() * 130;
      const c = palette[Math.floor(rand() * palette.length)];
      rows += `<rect x="${x}" y="${y}" width="${w}" height="12" rx="6" fill="${c}" opacity="${c.startsWith("rgba") ? 1 : 0.9}"/>`;
      x += w + 18;
    }
    rows += `<text x="96" y="${y + 11}" font-family="monospace" font-size="12" fill="rgba(255,255,255,0.18)" text-anchor="end">${lineNo++}</text>`;
    y += rand() < 0.18 ? 62 : 38;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="cglow" cx="0.25" cy="0.1" r="1">
      <stop offset="0%" stop-color="${VIOLET}" stop-opacity="0.14"/><stop offset="60%" stop-color="${VIOLET}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#0A0A0D"/>
  <rect width="${W}" height="${H}" fill="url(#cglow)"/>
  <rect x="60" y="60" width="1080" height="780" rx="18" fill="#0E0E12" stroke="rgba(255,255,255,0.08)"/>
  <rect x="60" y="60" width="1080" height="52" rx="18" fill="rgba(255,255,255,0.03)"/>
  <circle cx="96" cy="86" r="7" fill="#FF5F57"/><circle cx="122" cy="86" r="7" fill="#FEBC2E"/><circle cx="148" cy="86" r="7" fill="#28C840"/>
  <rect x="220" y="72" width="150" height="28" rx="8" fill="rgba(255,255,255,0.06)"/>
  <text x="236" y="91" font-family="monospace" font-size="13" fill="${LIME}">index.astro</text>
  <line x1="120" y1="130" x2="120" y2="820" stroke="rgba(255,255,255,0.06)"/>
  ${rows}
  <rect x="60" y="760" width="1080" height="80" rx="18" fill="rgba(200,255,46,0.04)"/>
  <text x="96" y="808" font-family="monospace" font-size="16" fill="${LIME}">➜  vertex build --production  ✓ 214ms</text>
  <rect x="1050" y="140" width="60" height="600" rx="8" fill="rgba(255,255,255,0.03)"/>
  ${Array.from({ length: 30 }, (_, i) => `<rect x="1058" y="${150 + i * 19}" width="${20 + rand() * 34}" height="8" rx="4" fill="rgba(255,255,255,0.1)"/>`).join("")}
  ${grain("g2")}
</svg>`;
}

/* ---------------------------------- PHONE APP ---------------------------------- */
function phone(): string {
  const rand = mulberry32(99);
  const W = 1200, H = 900;
  const cards = Array.from({ length: 2 }, (_, r) =>
    Array.from({ length: 2 }, (_, c) => {
      const x = 80 + c * 200, y = 330 + r * 190;
      return `<rect x="${x}" y="${y}" width="180" height="170" rx="16" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.07)"/>
      <rect x="${x + 16}" y="${y + 16}" width="148" height="86" rx="10" fill="rgba(200,255,46,${0.06 + rand() * 0.08})"/>
      <rect x="${x + 16}" y="${y + 116}" width="${90 + rand() * 50}" height="10" rx="5" fill="rgba(255,255,255,0.35)"/>
      <rect x="${x + 16}" y="${y + 136}" width="60" height="10" rx="5" fill="${LIME}" opacity="0.8"/>`;
    }).join("")
  ).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="phalo" cx="0.5" cy="0.55" r="0.55">
      <stop offset="0%" stop-color="${LIME}" stop-opacity="0.22"/><stop offset="100%" stop-color="${LIME}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="pherom" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${LIME}" stop-opacity="0.5"/><stop offset="50%" stop-color="${VIOLET}" stop-opacity="0.35"/><stop offset="100%" stop-color="${CYAN}" stop-opacity="0.3"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#0A0A0D"/>
  <ellipse cx="600" cy="520" rx="420" ry="380" fill="url(#phalo)"/>
  <g transform="rotate(-7 600 460)">
    <rect x="370" y="110" width="460" height="760" rx="54" fill="#101014" stroke="rgba(255,255,255,0.14)" stroke-width="2"/>
    <rect x="388" y="128" width="424" height="724" rx="40" fill="#0B0B0F"/>
    <rect x="540" y="146" width="120" height="26" rx="13" fill="#101014"/>
    <rect x="412" y="200" width="376" height="110" rx="18" fill="url(#pherom)" opacity="0.85"/>
    <text x="436" y="248" font-family="Arial, sans-serif" font-weight="bold" font-size="26" fill="#fff">Summer Drop</text>
    <text x="436" y="280" font-family="monospace" font-size="13" fill="rgba(255,255,255,0.75)">CONVERSION-READY</text>
    <g transform="translate(340,0)">${cards}</g>
    <rect x="412" y="740" width="376" height="54" rx="27" fill="${LIME}"/>
    <text x="600" y="774" font-family="Arial, sans-serif" font-weight="bold" font-size="20" fill="#0A0A0D" text-anchor="middle">Shop now</text>
    <rect x="412" y="812" width="376" height="24" rx="12" fill="rgba(255,255,255,0.05)"/>
    <circle cx="470" cy="824" r="7" fill="rgba(255,255,255,0.4)"/><circle cx="560" cy="824" r="7" fill="${LIME}"/><circle cx="650" cy="824" r="7" fill="rgba(255,255,255,0.4)"/><circle cx="740" cy="824" r="7" fill="rgba(255,255,255,0.4)"/>
  </g>
  ${grain("g3")}
</svg>`;
}

/* ---------------------------------- MESH / STRATEGY ---------------------------------- */
function mesh(): string {
  const W = 1200, H = 900;
  let waves = "";
  for (let l = 0; l < 14; l++) {
    const baseY = 180 + l * 48;
    const pts: Array<[number, number]> = [];
    for (let x = -40; x <= W + 40; x += 30) {
      const y = baseY + Math.sin(x / 190 + l * 0.55) * 46 + Math.sin(x / 90 + l) * 16;
      pts.push([x, y]);
    }
    const op = 0.08 + (l / 14) * 0.3;
    waves += `<path d="${smoothPath(pts)}" fill="none" stroke="${l % 3 === 0 ? LIME : "#ffffff"}" stroke-opacity="${l % 3 === 0 ? op + 0.15 : op}" stroke-width="${l % 3 === 0 ? 1.6 : 1}"/>`;
  }
  const rand = mulberry32(5);
  const nodes = Array.from({ length: 26 }, () => {
    const x = rand() * W, y = 150 + rand() * 620;
    return `<circle cx="${x}" cy="${y}" r="${1.5 + rand() * 3}" fill="${LIME}" opacity="${0.25 + rand() * 0.6}"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="mglow" cx="0.5" cy="0.4" r="0.7">
      <stop offset="0%" stop-color="${LIME}" stop-opacity="0.1"/><stop offset="100%" stop-color="${LIME}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#0A0A0D"/>
  <rect width="${W}" height="${H}" fill="url(#mglow)"/>
  ${waves}
  ${nodes}
  <circle cx="600" cy="400" r="150" fill="none" stroke="${LIME}" stroke-opacity="0.3" stroke-dasharray="3 9"/>
  <circle cx="600" cy="400" r="230" fill="none" stroke="rgba(255,255,255,0.1)" stroke-dasharray="2 12"/>
  <circle cx="600" cy="400" r="7" fill="${LIME}"/>
  <text x="60" y="830" font-family="monospace" font-size="12" fill="rgba(255,255,255,0.35)" letter-spacing="3">STRATEGY / SYSTEMS</text>
  ${grain("g4")}
</svg>`;
}

/* ---------------------------------- FOUNDER PORTRAIT ---------------------------------- */
function founder(): string {
  const W = 900, H = 1200;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="body" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#1E1E26"/><stop offset="45%" stop-color="#121218"/><stop offset="100%" stop-color="#0A0A0E"/>
    </linearGradient>
    <linearGradient id="rim" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${LIME}"/><stop offset="35%" stop-color="${LIME}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="fglow" cx="0.2" cy="0.25" r="0.8">
      <stop offset="0%" stop-color="${LIME}" stop-opacity="0.16"/><stop offset="100%" stop-color="${LIME}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="1" fill="rgba(255,255,255,0.03)"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="#0A0A0D"/>
  <rect width="${W}" height="${H}" fill="url(#fglow)"/>
  <text x="450" y="1050" font-family="Arial, sans-serif" font-weight="900" font-size="380" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="2" text-anchor="middle">AC</text>
  <g>
    <circle cx="450" cy="470" r="150" fill="url(#body)"/>
    <path d="M 140,1200 C 140,940 290,838 450,838 C 610,838 760,940 760,1200 Z" fill="url(#body)"/>
    <circle cx="450" cy="470" r="150" fill="none" stroke="url(#rim)" stroke-width="5"/>
    <path d="M 140,1200 C 140,940 290,838 450,838 C 610,838 760,940 760,1200 Z" fill="none" stroke="url(#rim)" stroke-width="5"/>
  </g>
  <rect width="${W}" height="${H}" fill="url(#scan)"/>
  <text x="60" y="90" font-family="monospace" font-size="16" fill="rgba(255,255,255,0.45)" letter-spacing="6">VERTEX / FOUNDER</text>
  <circle cx="60" cy="1120" r="6" fill="${LIME}"/>
  <text x="84" y="1127" font-family="monospace" font-size="15" fill="rgba(255,255,255,0.5)" letter-spacing="3">ALEX CARTER — EST. 2017</text>
  ${grain("g5", 0.07)}
</svg>`;
}

mkdirSync("src/assets", { recursive: true });
writeFileSync("src/assets/art-dashboard.svg", dashboard());
writeFileSync("src/assets/art-code.svg", code());
writeFileSync("src/assets/art-phone.svg", phone());
writeFileSync("src/assets/art-mesh.svg", mesh());
writeFileSync("src/assets/founder.svg", founder());
console.log("Generated: art-dashboard, art-code, art-phone, art-mesh, founder");
