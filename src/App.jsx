import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import Landing from "./Landing.jsx";
import {
  THEMES,
  drawFront,
  drawBack,
  ensureFonts,
  serialFor,
} from "./frame.js";

const ROLE_CHIPS = [
  "fullstack",
  "ai engineer",
  "frontend",
  "backend",
  "designer",
  "founder",
  "devops",
  "growth",
];

export default function App() {
  const canvasRef = useRef(null);
  const [img, setImg] = useState(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [team, setTeam] = useState("");
  const [handle, setHandle] = useState("");
  const [themeKey, setThemeKey] = useState("sunset");
  const [zoom, setZoom] = useState(1);
  const [rot, setRot] = useState(0);
  const [side, setSide] = useState("front");
  const [qrImg, setQrImg] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [ready, setReady] = useState(false);

  const state = { img, name, role, team, handle, themeKey, zoom, rot, qrImg };

  useEffect(() => {
    ensureFonts().then(() => setReady(true));
  }, []);

  // build QR from X handle
  useEffect(() => {
    const clean = handle.trim().replace(/^@/, "");
    if (!clean) {
      setQrImg(null);
      return;
    }
    let alive = true;
    QRCode.toDataURL(`https://x.com/${clean}`, {
      margin: 1,
      width: 320,
      color: { dark: "#14102A", light: "#FFFFFF" },
    }).then((url) => {
      const image = new Image();
      image.onload = () => alive && setQrImg(image);
      image.src = url;
    });
    return () => {
      alive = false;
    };
  }, [handle]);

  // redraw preview
  useEffect(() => {
    if (!ready || !canvasRef.current) return;
    if (side === "front") drawFront(canvasRef.current, state);
    else drawBack(canvasRef.current, state);
  }, [img, name, role, team, themeKey, zoom, rot, side, qrImg, ready]);

  function loadFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      setImg(image);
      setZoom(1);
      setRot(0);
    };
    image.src = url;
  }

  function renderSide(which) {
    const c = document.createElement("canvas");
    if (which === "front") drawFront(c, state);
    else drawBack(c, state);
    return c;
  }

  function saveBlob(canvas, suffix) {
    canvas.toBlob((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `frameingoa-${(name || "builder")
        .toLowerCase()
        .replace(/\s+/g, "-")}-${suffix}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    }, "image/png");
  }

  function download(which) {
    saveBlob(renderSide(which), which);
  }

  function downloadBoth() {
    const f = renderSide("front");
    const b = renderSide("back");
    const c = document.createElement("canvas");
    const gap = 40;
    c.width = f.width * 2 + gap;
    c.height = f.height;
    const ctx = c.getContext("2d");
    ctx.drawImage(f, 0, 0);
    ctx.drawImage(b, f.width + gap, 0);
    saveBlob(c, "both");
  }

  function shareToX() {
    const text = encodeURIComponent(
      "Boarding pass secured 🌴 See you at Hacker House Goa, 28–31 Oct '26.\n\n#FrameInGoa"
    );
    window.open(`https://x.com/intent/tweet?text=${text}`, "_blank");
  }

  return (
    <div className="page">
      <Landing />

      <main id="studio" className="studio">
        <header className="studio-head">
          <h2>Pass Studio</h2>
          <p className="sub">
            Everything runs in your browser — no login, nothing uploaded
            anywhere.
          </p>
        </header>

        <div className="grid">
          <section className="panel controls">
            <label
              className={`drop ${dragOver ? "over" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                loadFile(e.dataTransfer.files[0]);
              }}
            >
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={(e) => loadFile(e.target.files[0])}
              />
              <span className="drop-title">
                {img ? "Photo loaded — tap to change" : "Drop your photo here"}
              </span>
              <span className="drop-sub">
                or click to browse · JPG / PNG / WebP
              </span>
            </label>

            {img && (
              <div className="sliders">
                <div className="slider-row">
                  <label htmlFor="zoom">Zoom</label>
                  <input
                    id="zoom"
                    type="range"
                    min="1"
                    max="2.5"
                    step="0.01"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                  />
                  <span className="mono-val">{zoom.toFixed(2)}×</span>
                </div>
                <div className="slider-row">
                  <label htmlFor="rot">Rotate</label>
                  <input
                    id="rot"
                    type="range"
                    min="-30"
                    max="30"
                    step="1"
                    value={rot}
                    onChange={(e) => setRot(Number(e.target.value))}
                  />
                  <span className="mono-val">{rot}°</span>
                </div>
                <button
                  className="reset"
                  onClick={() => {
                    setZoom(1);
                    setRot(0);
                  }}
                >
                  Reset
                </button>
              </div>
            )}

            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                maxLength={22}
                placeholder="Akshay Anand"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="role">Role / stack</label>
              <input
                id="role"
                maxLength={34}
                placeholder="growth // building in public"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
              <div className="chips">
                {ROLE_CHIPS.map((r) => (
                  <button
                    key={r}
                    className={`chip small ${role === r ? "active" : ""}`}
                    onClick={() => setRole(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="two-col">
              <div className="field">
                <label htmlFor="team">Team</label>
                <input
                  id="team"
                  maxLength={14}
                  placeholder="optional"
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="handle">X handle → QR</label>
                <input
                  id="handle"
                  maxLength={16}
                  placeholder="@HelloVyom"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label>Vibe</label>
              <div className="chips">
                {Object.entries(THEMES).map(([key, t]) => (
                  <button
                    key={key}
                    className={`chip ${themeKey === key ? "active" : ""}`}
                    onClick={() => setThemeKey(key)}
                  >
                    <span
                      className="dot"
                      style={{
                        background: `linear-gradient(135deg, ${t.swatch[0]}, ${t.swatch[1]})`,
                      }}
                    />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="serial-row">
              <span>SERIAL</span>
              <span className="mono-val">{serialFor(name, team)}</span>
            </div>
          </section>

          <section className="panel preview">
            <div className="preview-bar">
              <span className="tag">LIVE PREVIEW</span>
              <button
                className="flip"
                onClick={() => setSide(side === "front" ? "back" : "front")}
              >
                ⇄ Flip to {side === "front" ? "back" : "front"}
              </button>
            </div>
            <canvas
              ref={canvasRef}
              aria-label="Boarding pass preview"
              onClick={() => setSide(side === "front" ? "back" : "front")}
            />
            <p className="hint">
              Showing the {side} — click the pass to flip · 1080 × 1350
            </p>

            <div className="dl-grid">
              <button className="ghost" onClick={() => download("front")} disabled={!ready}>
                ↓ Front
              </button>
              <button className="ghost" onClick={() => download("back")} disabled={!ready}>
                ↓ Back
              </button>
              <button className="cta" onClick={downloadBoth} disabled={!ready}>
                ↓ Both sides
              </button>
              <button className="ghost" onClick={shareToX}>
                Share to X ↗
              </button>
            </div>
            <p className="hint">
              "Both sides" saves one wide image. Share opens X — attach your
              downloaded pass there.
            </p>
          </section>
        </div>
      </main>

      <footer className="foot">
        <span>Built for Hacker House Goa 2026 open trials</span>
        <span className="tag">28–31 Oct · Goa, IN</span>
      </footer>
    </div>
  );
}
