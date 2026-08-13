// FrameInGoa v2 — Builder Boarding Pass renderer
// Front: 1080 x 1350 boarding pass · Back: 1080 x 1350 manifest

export const THEMES = {
  sunset: {
    label: "Sunset",
    swatch: ["#FF5E5B", "#FFB648"],
    skyTop: "#2A1245",
    skyMid: "#B0316B",
    skyBot: "#FF7A4D",
    sun: "#FFB648",
    sunGlow: "rgba(255, 182, 72, 0.55)",
    wave1: "#1D0F35",
    wave2: "#3A1B54",
    ink: "#FFF3E2",
    sub: "#FFD9A8",
    photoBorder: "#FFF3E2",
    footer: "#180C2C",
    footerInk: "#FFD9A8",
  },
  nightrave: {
    label: "Night Rave",
    swatch: ["#FF3CAC", "#5D2AFF"],
    skyTop: "#07071A",
    skyMid: "#1B1044",
    skyBot: "#41186B",
    sun: "#FF3CAC",
    sunGlow: "rgba(255, 60, 172, 0.45)",
    wave1: "#0A0A22",
    wave2: "#241458",
    ink: "#F2ECFF",
    sub: "#8BF5E6",
    photoBorder: "#8BF5E6",
    footer: "#050512",
    footerInk: "#8BF5E6",
  },
  seabreeze: {
    label: "Sea Breeze",
    swatch: ["#2EC4B6", "#FFF3E2"],
    skyTop: "#CFF6EF",
    skyMid: "#8FE5DA",
    skyBot: "#FFE8C2",
    sun: "#FF9F5A",
    sunGlow: "rgba(255, 159, 90, 0.5)",
    wave1: "#1C7F76",
    wave2: "#2EC4B6",
    ink: "#0E3A36",
    sub: "#155E56",
    photoBorder: "#0E3A36",
    footer: "#0E3A36",
    footerInk: "#CFF6EF",
  },
};

export const W = 1080;
export const H = 1350;

export function serialFor(name, team) {
  let h = 2166136261;
  for (const ch of `${name}|${team}|goa26`) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  const hex = (h >>> 0).toString(16).toUpperCase().padStart(8, "0");
  return `BP-26-${hex.slice(0, 4)}`;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawSun(ctx, t, cx, cy, r) {
  const glow = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r * 1.6);
  glow.addColorStop(0, t.sunGlow);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  const sg = ctx.createLinearGradient(0, cy - r, 0, cy + r);
  sg.addColorStop(0, t.sun);
  sg.addColorStop(1, t.skyBot);
  ctx.fillStyle = sg;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  let gap = 10;
  let y = cy + 30;
  while (y < cy + r) {
    ctx.fillRect(cx - r, y, r * 2, gap * 0.55);
    y += gap * 2.4;
    gap += 5;
  }
  ctx.restore();
}

function drawWaves(ctx, t, baseY) {
  const bands = [
    { y: baseY, amp: 26, color: t.wave1, alpha: 0.9 },
    { y: baseY + 55, amp: 34, color: t.wave2, alpha: 0.85 },
  ];
  for (const b of bands) {
    ctx.save();
    ctx.globalAlpha = b.alpha;
    ctx.beginPath();
    ctx.moveTo(0, b.y);
    for (let x = 0; x <= W; x += 20) {
      ctx.lineTo(x, b.y + Math.sin(x / 90) * b.amp);
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = b.color;
    ctx.fill();
    ctx.restore();
  }
}

function drawPalm(ctx, x, baseY, h, color, flip = 1) {
  ctx.save();
  ctx.translate(x, baseY);
  ctx.scale(flip, 1);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.moveTo(-16, 0);
  ctx.quadraticCurveTo(10, -h * 0.55, h * 0.22, -h);
  ctx.quadraticCurveTo(h * 0.22 + 10, -h - 4, h * 0.22 + 6, -h + 8);
  ctx.quadraticCurveTo(22, -h * 0.5, 16, 0);
  ctx.closePath();
  ctx.fill();

  const tipX = h * 0.22 + 2;
  const tipY = -h + 4;
  const fronds = [
    [-1.0, -0.55], [-0.75, -0.9], [-0.2, -1.05],
    [0.4, -0.95], [0.9, -0.6], [1.05, -0.15],
  ];
  for (const [dx, dy] of fronds) {
    const ex = tipX + dx * h * 0.52;
    const ey = tipY + dy * h * 0.38;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.quadraticCurveTo(tipX + dx * h * 0.28, tipY + dy * h * 0.1 - 18, ex, ey);
    ctx.quadraticCurveTo(tipX + dx * h * 0.3, tipY + dy * h * 0.24 + 14, tipX, tipY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawBarcode(ctx, cx, cy, seedStr, color, half = 150, tall = 26) {
  let seed = 7;
  for (const ch of seedStr || "goa") seed = (seed * 31 + ch.charCodeAt(0)) % 9973;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483647;
    return (seed % 1000) / 1000;
  };
  ctx.fillStyle = color;
  let x = cx - half;
  while (x < cx + half) {
    const w = 2 + rand() * 7;
    if (rand() > 0.35) ctx.fillRect(x, cy - tall, w, tall * 2);
    x += w + 3 + rand() * 5;
  }
}

function drawPhoto(ctx, img, x, y, size, radius, zoom, rotDeg, t) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 14;
  roundRect(ctx, x - 10, y - 10, size + 20, size + 20, radius + 8);
  ctx.fillStyle = t.photoBorder;
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundRect(ctx, x, y, size, size, radius);
  ctx.clip();
  if (img) {
    const rad = (rotDeg * Math.PI) / 180;
    const c = Math.abs(Math.cos(rad));
    const s = Math.abs(Math.sin(rad));
    const needed = size * (c + s);
    const scale =
      Math.max(needed / img.naturalWidth, needed / img.naturalHeight) * zoom;
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate(rad);
    ctx.drawImage(
      img,
      (-img.naturalWidth * scale) / 2,
      (-img.naturalHeight * scale) / 2,
      img.naturalWidth * scale,
      img.naturalHeight * scale
    );
  } else {
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = t.ink;
    ctx.textAlign = "center";
    ctx.font = '600 30px "JetBrains Mono"';
    ctx.fillText("YOUR PHOTO HERE", x + size / 2, y + size / 2 + 10);
  }
  ctx.restore();
}

function fitText(ctx, text, maxWidth, weight, startPx, family, minPx = 40) {
  let px = startPx;
  ctx.font = `${weight} ${px}px "${family}"`;
  while (ctx.measureText(text).width > maxWidth && px > minPx) {
    px -= 4;
    ctx.font = `${weight} ${px}px "${family}"`;
  }
  return px;
}

export async function ensureFonts() {
  await Promise.all([
    document.fonts.load('800 84px "Bricolage Grotesque"'),
    document.fonts.load('600 42px "Bricolage Grotesque"'),
    document.fonts.load('600 34px "JetBrains Mono"'),
    document.fonts.load('400 30px "JetBrains Mono"'),
  ]);
}

export function drawFront(canvas, state) {
  const { img, name, role, team, themeKey, zoom, rot, qrImg } = state;
  const t = THEMES[themeKey] || THEMES.sunset;
  const serial = serialFor(name, team);
  const ctx = canvas.getContext("2d");
  canvas.width = W;
  canvas.height = H;

  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, t.skyTop);
  sky.addColorStop(0.55, t.skyMid);
  sky.addColorStop(1, t.skyBot);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  drawSun(ctx, t, W / 2, 520, 340);
  drawWaves(ctx, t, 950);
  drawPalm(ctx, 92, 1105, 250, t.wave1, 1);
  drawPalm(ctx, 988, 1105, 225, t.wave1, -1);

  // header
  ctx.textAlign = "center";
  ctx.fillStyle = t.sub;
  ctx.font = '600 28px "JetBrains Mono"';
  ctx.fillText("HACKER HOUSE GOA · OPEN TRIALS '26", W / 2, 96);
  ctx.fillStyle = t.ink;
  ctx.font = '800 58px "Bricolage Grotesque"';
  ctx.fillText("BUILDER BOARDING PASS", W / 2, 168);

  // photo
  const P = 520;
  drawPhoto(ctx, img, (W - P) / 2, 225, P, 36, zoom, rot, t);

  // name + role
  const nm = (name || "Your Name").toUpperCase();
  ctx.textAlign = "center";
  ctx.fillStyle = t.ink;
  fitText(ctx, nm, 940, 800, 78, "Bricolage Grotesque");
  ctx.fillText(nm, W / 2, 862);
  ctx.fillStyle = t.sub;
  ctx.font = '600 32px "JetBrains Mono"';
  ctx.fillText(role || "builder // shipping from goa", W / 2, 922);

  // gate row — ticket detail
  const cols = [
    { x: 220, label: "GATE", value: t.label.toUpperCase() },
    { x: 540, label: "SEAT", value: (team || "SOLO").toUpperCase().slice(0, 12) },
    { x: 860, label: "SEQ", value: serial },
  ];
  for (const col of cols) {
    ctx.fillStyle = t.sub;
    ctx.globalAlpha = 0.8;
    ctx.font = '400 20px "JetBrains Mono"';
    ctx.fillText(col.label, col.x, 990);
    ctx.globalAlpha = 1;
    ctx.fillStyle = t.ink;
    ctx.font = '600 32px "JetBrains Mono"';
    ctx.fillText(col.value, col.x, 1032);
  }

  // perforation
  const perfY = 1082;
  ctx.save();
  ctx.strokeStyle = t.ink;
  ctx.globalAlpha = 0.6;
  ctx.setLineDash([14, 14]);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(46, perfY);
  ctx.lineTo(W - 46, perfY);
  ctx.stroke();
  ctx.restore();

  // footer strip
  ctx.fillStyle = t.footer;
  ctx.fillRect(0, perfY + 14, W, H - perfY - 14);

  ctx.fillStyle = t.footerInk;
  ctx.textAlign = "left";
  ctx.font = '600 30px "JetBrains Mono"';
  ctx.fillText("28–31 OCT 2026", 64, 1180);
  ctx.fillText("GOA · IN", 64, 1226);
  ctx.font = '400 26px "JetBrains Mono"';
  ctx.fillText("#FrameInGoa", 64, 1290);

  if (qrImg) {
    const q = 190;
    const qx = W - 64 - q;
    const qy = perfY + 14 + (H - perfY - 14 - q) / 2;
    roundRect(ctx, qx - 10, qy - 10, q + 20, q + 20, 18);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.drawImage(qrImg, qx, qy, q, q);
    drawBarcode(ctx, 560, 1216, name + serial, t.footerInk, 120, 40);
  } else {
    drawBarcode(ctx, 660, 1216, name + serial, t.footerInk, 220, 46);
  }

  // punch holes (transparent like a real ticket)
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(0, perfY, 30, 0, Math.PI * 2);
  ctx.arc(W, perfY, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawBack(canvas, state) {
  const { name, role, team, themeKey, qrImg } = state;
  const t = THEMES[themeKey] || THEMES.sunset;
  const serial = serialFor(name, team);
  const ctx = canvas.getContext("2d");
  canvas.width = W;
  canvas.height = H;

  // base + grid
  ctx.fillStyle = t.footer;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = t.ink;
  ctx.globalAlpha = 0.05;
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 54) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y <= H; y += 54) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // watermark sun
  ctx.strokeStyle = t.ink;
  ctx.globalAlpha = 0.08;
  ctx.lineWidth = 3;
  for (let r = 60; r <= 420; r += 60) {
    ctx.beginPath();
    ctx.arc(W - 120, 140, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // header
  ctx.textAlign = "left";
  ctx.fillStyle = t.sub;
  ctx.font = '600 26px "JetBrains Mono"';
  ctx.fillText("BUILDER MANIFEST — KEEP UNTIL LANDING", 80, 120);
  ctx.fillStyle = t.ink;
  ctx.font = '800 64px "Bricolage Grotesque"';
  ctx.fillText("HACKER HOUSE GOA '26", 80, 204);

  // detail rows
  const rows = [
    ["PASSENGER", (name || "YOUR NAME").toUpperCase()],
    ["ROLE", (role || "BUILDER").toUpperCase()],
    ["TEAM", (team || "SOLO BUILDER").toUpperCase()],
    ["SERIAL", serial],
    ["DATES", "28–31 OCT 2026"],
    ["PORT", "GOA, INDIA"],
  ];
  let y = 300;
  for (const [label, value] of rows) {
    ctx.fillStyle = t.sub;
    ctx.globalAlpha = 0.85;
    ctx.font = '400 22px "JetBrains Mono"';
    ctx.fillText(label, 80, y);
    ctx.globalAlpha = 1;
    ctx.fillStyle = t.ink;
    const v = String(value).slice(0, 30);
    fitText(ctx, v, 620, 600, 42, "Bricolage Grotesque", 28);
    ctx.fillText(v, 320, y + 2);

    ctx.save();
    ctx.strokeStyle = t.ink;
    ctx.globalAlpha = 0.25;
    ctx.setLineDash([8, 10]);
    ctx.beginPath();
    ctx.moveTo(80, y + 34);
    ctx.lineTo(W - 80, y + 34);
    ctx.stroke();
    ctx.restore();
    y += 104;
  }

  // QR / barcode block
  if (qrImg) {
    const q = 260;
    const qx = (W - q) / 2;
    const qy = 960;
    roundRect(ctx, qx - 14, qy - 14, q + 28, q + 28, 22);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.drawImage(qrImg, qx, qy, q, q);
  } else {
    drawBarcode(ctx, W / 2, 1080, name + serial, t.ink, 320, 70);
  }

  ctx.textAlign = "center";
  ctx.fillStyle = t.sub;
  ctx.font = '400 26px "JetBrains Mono"';
  ctx.fillText("this pass admits one builder · ship > talk", W / 2, 1290);
  ctx.font = '600 26px "JetBrains Mono"';
  ctx.fillText("#FrameInGoa", W / 2, 1326);
}
