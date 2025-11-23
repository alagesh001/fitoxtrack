import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";

// HappyBirthdayImageGenerator.jsx
// Single-file React component (Tailwind CSS assumed) that auto-generates
// a "Happy Birthday" image on an HTML canvas and allows download.

// Usage: Drop this file into a Vite/CRA React project and import it in App.jsx:
// import HappyBirthdayImageGenerator from './HappyBirthdayImageGenerator';
// <HappyBirthdayImageGenerator />

export default function HappyBirthdayImageGenerator() {
  const canvasRef = useRef(null);
  const [name, setName] = useState("Friend");
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [bgPreset, setBgPreset] = useState(0);
  const [emoji, setEmoji] = useState("🎉");
  const [width] = useState(800); // image width
  const [height] = useState(1200); // image height (good for social cards)
const [fontFamily, setFontFamily] = useState("'Lobster', bold");
  const [seed, setSeed] = useState(Date.now());
const [fromText, setFromText] = useState("");
 const [selectedGym, setSelectedGym] = useState(null);
const [loading, setLoading] = useState(true);
const storedGym = JSON.parse(localStorage.getItem("selectedGym") || "{}");
  const gymid = storedGym?.GymId;
  const [showAuthBlock, setShowAuthBlock] = useState(false);

useEffect(() => {
  const storedGymRaw = localStorage.getItem("selectedGym");
  const storedGym = storedGymRaw ? JSON.parse(storedGymRaw) : null;

  const storedRenew = localStorage.getItem(`renew_data_${gymid}`);


  if (!storedGym || !storedRenew) {
    console.log("Access Blocked: Missing required localStorage data");
    setShowAuthBlock(true);
    return;
  }
   const now = new Date();

  // storedRenew.expiresAt = "17-07-2025"
  const [day, month, year] = storedRenew.split("-");

  // Convert to JS date: yyyy-mm-ddT23:59:59
  const expiryDate = new Date(`${year}-${month}-${day}T23:59:59`);

  if (now > expiryDate) {
    console.log("Access Blocked: Renew date expired");
    setShowAuthBlock(true);
    return;
  }

  console.log("Access Allowed");
}, []);
useEffect(() => {
  const storedGym = localStorage.getItem("selectedGym");

  if (storedGym) {
    const parsedGym = JSON.parse(storedGym);
    setSelectedGym(parsedGym);

    if (parsedGym?.GymName) {
      setFromText(parsedGym.GymName);
    }
  }
}, []); 


  // background gradient presets
  const bgPresets = [
    ["#FFDEE9", "#B5FFFC"],
    ["#fbd3e9", "#bbf3ff"],
    ["#a18cd1", "#fbc2eb"],
    ["#f6d365", "#fda085"],
    ["#89f7fe", "#66a6ff"],
  ];

  // draw balloons (simple circles with gradients)
  function drawBalloons(ctx, rng) {
    const balloons = Math.floor(6 + rng() * 6);
    for (let i = 0; i < balloons; i++) {
      const x = (rng() * 0.9 + 0.05) * width;
      const y = (rng() * 0.45 + 0.25) * height;
      const r = 40 + rng() * 90;
      const hue = Math.floor(rng() * 360);
      const grad = ctx.createRadialGradient(x - r / 3, y - r / 3, r / 6, x, y, r);
      grad.addColorStop(0, `hsla(${hue},90%,70%,0.95)`);
      grad.addColorStop(1, `hsla(${(hue + 40) % 360},70%,45%,0.95)`);
      ctx.beginPath();
      ctx.fillStyle = grad;
      ctx.ellipse(x, y, r * 0.8, r, 0, 0, Math.PI * 2);
      ctx.fill();
      // string
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 2;
      ctx.moveTo(x, y + r);
      ctx.lineTo(x, y + r + (40 + rng() * 80));
      ctx.stroke();
    }
  }

  // draw confetti
  function drawConfetti(ctx, rng) {
    const count = 220;
    for (let i = 0; i < count; i++) {
      const x = rng() * width;
      const y = rng() * height;
      const w = 6 + Math.floor(rng() * 10);
      const h = 6 + Math.floor(rng() * 10);
      const hue = Math.floor(rng() * 360);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rng() * Math.PI);
      ctx.fillStyle = `hsla(${hue},85%,55%,${0.85 - rng() * 0.3})`;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.restore();
    }
  }

  function seededRNG(s) {
    // simple mulberry32 PRNG
    let t = s >>> 0;
    return function () {
      t += 0x6D2B79F5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  function drawImage() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width * 2; // draw at 2x for crispness on high-dpi
    canvas.height = height * 2;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(2, 2);

    // seeded rng
    const rng = seededRNG(seed);

    // background
    const [a, b] = bgPresets[bgPreset % bgPresets.length];
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, a);
    grad.addColorStop(1, b);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // soft overlay circles
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.globalAlpha = 0.18 * (0.6 + rng() * 0.8);
      ctx.fillStyle = `rgba(255,255,255,0.5)`;
      const rx = (rng() * 0.9 + 0.05) * width;
      const ry = (rng() * 0.9 + 0.05) * height;
      ctx.ellipse(rx, ry, 160 + rng() * 240, 80 + rng() * 200, rng() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // balloons & confetti
    drawBalloons(ctx, rng);
    drawConfetti(ctx, rng);

    // big "Happy Birthday" text
    let  bigFontSize = Math.floor(52 + rng() * 28);
    ctx.font = `700 ${bigFontSize}px Montserrat, Arial, sans-serif`;
   let text = "Happy Birthday";
let textWidth = ctx.measureText(text).width;

// scale down if too wide (more than 85% of canvas width)
const maxTextWidth = width * 0.7;
while (textWidth > maxTextWidth && bigFontSize > 24) {
  bigFontSize -= 2;
  ctx.font = `700 ${bigFontSize}px ${fontFamily}`;
  textWidth = ctx.measureText(text).width;
}
   
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // stroke for depth
    const centerX = width / 2;
    const centerY = height / 2 - 200;
// === BACKGROUND BOX for TEXT ===
const boxWidth = width * 0.8;
const boxHeight = height * 0.5; // adjust if needed for more space
const boxX = (width - boxWidth) / 2;
const boxY = 320;

ctx.save();
ctx.fillStyle = "rgba(0, 0, 0, 0.18)"; // semi-transparent black
ctx.beginPath();
ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 30); // rounded corners
ctx.fill();
ctx.restore();
    // drop shadow
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.fillText("Happy Birthday", centerX + 4, centerY + 6);
    ctx.restore();

    // main text fill
    const textGrad = ctx.createLinearGradient(centerX - 200, centerY - 40, centerX + 200, centerY + 40);
    textGrad.addColorStop(0, "#fff7ae");
    textGrad.addColorStop(1, "#ff8bac");

    ctx.fillStyle = textGrad;
    ctx.fillText("Happy Birthday", centerX, centerY);

    // smaller name
    ctx.font = `600 ${Math.floor(34 + rng() * 18)}px ${fontFamily}`;
    ctx.fillStyle = "rgba(255,255,255,0.98)";
    ctx.fillText(`${emoji} ${name} ${emoji}`, centerX, centerY + 70);

// 🎂 --- Draw a cute layered cake below the name ---
let y = centerY + 150;
const cakeY = y + 100; // position below the last line of text
const cakeWidth = 140;
const cakeHeight = 100;
const cakeX = centerX - cakeWidth / 2;

// cake base (plate)
ctx.fillStyle = "#ffecd9ff";
ctx.beginPath();
ctx.roundRect(cakeX - 10, cakeY + cakeHeight -50, cakeWidth + 20, 16, 8);
ctx.fill();

// bottom layer
ctx.fillStyle = "#f4a261";
ctx.fillRect(cakeX, cakeY, cakeWidth, 40);

// frosting drip layer
ctx.fillStyle = "#fdd5d5";
ctx.beginPath();
ctx.moveTo(cakeX, cakeY);
ctx.lineTo(cakeX + cakeWidth, cakeY);
ctx.lineTo(cakeX + cakeWidth, cakeY + 30);
for (let i = 0; i < cakeWidth; i += 20) {
  ctx.quadraticCurveTo(cakeX + i + 10, cakeY + 50, cakeX + i + 20, cakeY + 30);
}
ctx.lineTo(cakeX, cakeY + 30);
ctx.closePath();
ctx.fill();

// top layer
ctx.fillStyle = "#f08080";
ctx.fillRect(cakeX + 20, cakeY - 30, cakeWidth - 40, 30);

// candle
ctx.fillStyle = "#ffd166";
ctx.fillRect(centerX - 5, cakeY - 60, 10, 30);

// flame
ctx.beginPath();
ctx.moveTo(centerX, cakeY - 68);
ctx.quadraticCurveTo(centerX - 5, cakeY - 80, centerX, cakeY - 92);
ctx.quadraticCurveTo(centerX + 5, cakeY - 80, centerX, cakeY - 68);
ctx.fillStyle = "#ffb703";
ctx.fill();


if (fromText) {
  const grad = ctx.createLinearGradient(0, 0, width, 0);
  grad.addColorStop(0, "#ffffffff");
  grad.addColorStop(1, "#ffffffff");
  ctx.fillStyle = grad;
  ctx.textAlign = "center";

  // --- Draw "Wishes from" line ---
      ctx.font = `500 36px Montserrat, Arial, sans-serif`;

  ctx.fillText("Wishes from", centerX, centerY + 400);

  // --- Draw the gym name below, with wrapping if too long ---
      ctx.font = `600 40px Montserrat, Arial, sans-serif`;

  const maxWidth = width * 0.8; // 80% of canvas width
  const words = fromText.split(" ");
  let line = "";
  let y = centerY + 450; // starting point for gym name

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const testWidth = ctx.measureText(testLine).width;

    if (testWidth > maxWidth && i > 0) {
      ctx.fillText(line.trim(), centerX, y);
      line = words[i] + " ";
      y += 45; // move down for next line
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), centerX, y);
}
    // footer small note
    ctx.font = `400 14px ${fontFamily}`;
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillText("Generated with ❤️ — Fitox", centerX, height - 24);
  }

  // useEffect(() => {
  //   if (autoGenerate) drawImage();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [seed, bgPreset, name, emoji, fontFamily]);
  const regenerate = () => {
    // You can add extra behavior here if needed (like animations or reset)
      if (loading)return;

    setLoading(true); // optional: start loading manually before triggering
    setSeed(Date.now());
  };
  useEffect(() => {
      
    const timer = setTimeout(() => {
drawImage();
      setLoading(false);        // stop loader
    }, 2000);
  
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);
 
  useEffect(() => {
    // auto-generate on first mount
    setTimeout(() => setSeed(Date.now()), 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // convert to blob at 2x resolution
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `happy-birthday-${name.replace(/\s+/g, "-").toLowerCase() || 'card'}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {showAuthBlock && (
  <div className="px-10 fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
    <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full text-center">
      <h2 className="text-xl font-bold text-red-600 mb-3">
        Not Authorised
      </h2>
      <p className="text-gray-700 text-base">
        Kindly login through authorized account to access.
      </p>
    </div>
  </div>
)}
<div className="flex flex-col gap-3 mt-6">
        <div className="flex-1">
          <div className="bg-white/60 rounded-2xl p-4 shadow-lg">
  <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-gray-800">
  <span className="bg-blue-600 text-white text-sm px-2 py-1 rounded-md">Fitox AI</span>
  Birthday Generator 
</h2>



<div className="flex flex-col gap-3 mt-6">
              <label className="flex flex-col">
                <span className="text-sm">Birthday Name</span>
                <input
                  className="mt-1 p-2 rounded-md border"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm">Emoji</span>
                <input
                  className="mt-1 p-2 rounded-md border"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm">Background</span>
                <div className="flex gap-2 mt-1">
                  {bgPresets.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setBgPreset(i)}
                      className={`h-10 w-12 rounded-md border ${bgPreset === i ? 'ring-2 ring-offset-2' : ''}`}
                      style={{ background: `linear-gradient(135deg, ${p[0]}, ${p[1]})` }}
                    />
                  ))}
                </div>
              </label>

              <label className="flex flex-col">
                <span className="text-sm">Font</span>
   <select
  value={fontFamily}
  onChange={(e) => setFontFamily(e.target.value)}
  className="border rounded-md p-2 text-sm bg-white shadow-sm"
>  <option value="'Lobster', cursive">🍓 Lobster (Classic display)</option>

  <option value="'Poppins', sans-serif">💎 Poppins (Modern clean)</option>
  <option value="'Fredoka One', cursive">🍭 Fredoka One (Bold & bubbly)</option>
  <option value="'Kaushan Script', cursive">🌿 Kaushan Script (Natural flow)</option>
  <option value="'Cookie', cursive">🍪 Cookie (Soft & sweet)</option>
  <option value="'Sacramento', cursive">🌸 Sacramento (Minimal elegant)</option>
  <option value="'Caveat', cursive">🖋️ Caveat (Handwritten casual)</option>
</select>
              </label>

              {/* <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={autoGenerate}
                  onChange={(e) => setAutoGenerate(e.target.checked)}
                />
                <span className="text-sm">Auto-generate on change</span>
              </label> */}

<div className="flex items-center justify-end gap-2 mt-2 col-span-1 md:col-span-2">
                  <button
            onClick={handleDownload}
            className="p-2 rounded-md bg-green-600 hover:bg-green-700 text-white transition"
          >
            <Download className="w-5 h-5" />
          </button>
                <button
                  onClick={() => regenerate()}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Regenerate
                </button>

        

                <button
                  onClick={() => {
                    // copy image to clipboard (if supported)
                    const canvas = zRef.current;
                    if (!canvas) return;
                    canvas.toBlob(async (blob) => {
                      try {
                        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                        alert('Image copied to clipboard');
                      } catch (e) {
                        alert('Copy failed — try downloading instead');
                      }
                    });
                  }}
                  className="px-3 py-2 rounded-md border"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Tip: Use the "Regenerate" button to produce a new layout. Use the "copy" to use the same to send without downloading.
          </div>
        </div>

<div className="w-full  flex flex-col items-center justify-center">
<div className="rounded-2xl overflow-hidden shadow-xl border w-full 
     max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto ">  <div className="bg-white p-2 flex items-center justify-between">
    <div className="text-xs font-medium">Preview (Portrait)</div>
    <div className="text-[10px] text-gray-500">2× Render Quality</div>
  </div>

        <div className="relative rounded-2xl shadow-lg border border-white/10 mt-2 w-full overflow-hidden bg-white">
  {/* Loading State */}
  {loading && (
    <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md bg-black/40 z-20">
      <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-white mt-4 text-sm opacity-80">Generating AI output...</p>
    </div>
  )}

  {/* Canvas Wrapper */}
  <div className="p-2 flex justify-center items-center min-h-[60vh]">
    <div
      className="relative flex justify-center items-center w-full"
      style={{ maxHeight: "80vh" }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          display: "block",
          borderRadius: "12px",
          width: "100%",
          height: "auto",
          objectFit: "contain",
          maxHeight: "80vh",
          transition: "filter 0.5s ease, opacity 0.5s ease",
          filter: loading ? "blur(10px)" : "blur(0)",
          opacity: loading ? 0.5 : 1,
        }}
      />
    </div>
  </div>

  {/* Optional subtle glow border */}
  <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 pointer-events-none"></div>
</div>


</div>



          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-sm text-gray-500"
          >
<p className="text-sm text-gray-600 flex items-center gap-1">
  Click 
  <Download className="w-4 h-4 inline mx-1 text-gray-700" /> 
  to save the generated image.
</p>          </motion.div>
        </div>
      </div>
    </div>
  );
}
