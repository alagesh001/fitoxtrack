// GymOfferCanvasFullBackground.jsx
// Canvas API poster with full background cover + filter controls.
// No external deps. Works in React projects with Tailwind CSS.

import React, { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { useLocation,useNavigate } from "react-router-dom";

export default function GymOfferCanvasFullBackground() {
  // Inputs
    const [gymName, setGymName] = useState("Energy Fitness Studio");
  const [serviceTitle, setServiceTitle] = useState("OUR SERVICES");

  const [offerName, setOfferName] = useState("NEW YEAR OFFER");
  const [offerPrice, setOfferPrice] = useState("3500");
  const [actualPrice, setActualPrice] = useState("5000");
  const [mob, setMob] = useState("81727737333");
  const [address, setAddress] = useState("21/1, Janis Street, Sant Colony, Navi Mumbai");
  const [expiry, setExpiry] = useState("2025-12-10");
  const [selectedColor, setSelectedColor] = useState("indigo");
const [patternShape, setPatternShape] = useState("triangle");

  // Background image and logo data URLs
  const [bgDataUrl, setBgDataUrl] = useState(null);
  const [logoDataUrl, setLogoDataUrl] = useState(null);

  // Filter controls
  const [brightness, setBrightness] = useState(1); // 0-2
  const [contrast, setContrast] = useState(1); // 0-2
  const [saturation, setSaturation] = useState(1); // 0-3
  const [blur, setBlur] = useState(0); // px
  const [bgOpacity, setBgOpacity] = useState(0.6); // overlay opacity (to darken background)
  const [tintHex, setTintHex] = useState("#000000");
  const [tintStrength, setTintStrength] = useState(0.15); // 0-1
  const [fitMode, setFitMode] = useState("cover"); // cover | contain
const storedGym = JSON.parse(localStorage.getItem("selectedGym") || "{}");
  const gymid = storedGym?.GymId;
  const [showAuthBlock, setShowAuthBlock] = useState(false);
const location = useLocation();

 const navigate = useNavigate();

    useEffect(() => {
    // Check if navigation came from button click
    if (!location.state?.fromButton) {
      // Redirect or hide
      navigate("/", { replace: true }); // or just return null
       return null;
    }
  }, [location.state, navigate]);
// useEffect(() => {
//   const storedGymRaw = localStorage.getItem("selectedGym");
//   const storedGym = storedGymRaw ? JSON.parse(storedGymRaw) : null;

//   const storedRenew = localStorage.getItem(`renew_data_${gymid}`);


//   if (!storedGym || !storedRenew) {
//     console.log("Access Blocked: Missing required localStorage data");
//     setShowAuthBlock(true);
//     return;
//   }
//    const now = new Date();

//   // storedRenew.expiresAt = "17-07-2025"
//   const [day, month, year] = storedRenew.split("-");

//   // Convert to JS date: yyyy-mm-ddT23:59:59
//   const expiryDate = new Date(`${year}-${month}-${day}T23:59:59`);

//   if (now > expiryDate) {
//     console.log("Access Blocked: Renew date expired");
//     setShowAuthBlock(true);
//     return;
//   }

//   console.log("Access Allowed");
// }, []);
  // refs for images and canvas
  const canvasRef = useRef(null);
  const bgImgRef = useRef(null);
  const logoImgRef = useRef(null);
  const [servicesEnabled, setServicesEnabled] = useState(true);

const [services, setServices] = useState([
  "Strength Training",
  "Cardio Workouts",
  "Personal Coaching",
  "Weight Loss Program",
  "HIIT & CrossFit",
  "Zumba & Dance Fitness",
  "Steam Bath",
  "Diet & Nutrition Guidance"
]);
const OFFER_TITLE_STYLES = [
  { id: "normal", label: "Normal Clean" },
  { id: "glow", label: "Glow + Stroke" },
  { id: "premium", label: "Premium Gradient" },
];
const [design, setDesign] = useState(1);

const [offerTitleStyle, setOfferTitleStyle] = useState("normal");


 function OfferTitleStyleSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

      {OFFER_TITLE_STYLES.map((style) => (
        <button
          key={style.id}
          onClick={() => onChange(style.id)}
          className={`
            p-3 rounded-xl text-center border transition-all 
            ${
              value === style.id
                ? "bg-indigo-600 text-white border-indigo-700 shadow-md scale-[1.03]"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }
          `}
        >
          {style.label}
        </button>
      ))}

    </div>
  );
}
  // palette (hex colors for canvas)
const colors = {
  indigo:  { hex: "#4f46e5", accent: "#4338ca", textOn: "#ffffff", gradient: "linear-gradient(90deg, #4f46e5 0%, #4338ca 100%)" },
  emerald: { hex: "#10b981", accent: "#059669", textOn: "#ffffff", gradient: "linear-gradient(90deg, #10b981 0%, #059669 100%)" },
  rose:    { hex: "#fb7185", accent: "#f43f5e", textOn: "#ffffff", gradient: "linear-gradient(90deg, #fb7185 0%, #f43f5e 100%)" },
  amber:   { hex: "#f59e0b", accent: "#d97706", textOn: "#ffffff", gradient: "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)" },
  slate:   { hex: "#334155", accent: "#475569", textOn: "#ffffff", gradient: "linear-gradient(90deg, #334155 0%, #475569 100%)" },
  cyan:    { hex: "#06b6d4", accent: "#0891b2", textOn: "#ffffff", gradient: "linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)" },
  violet:  { hex: "#8b5cf6", accent: "#7c3aed", textOn: "#ffffff", gradient: "linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)" },
  lime:    { hex: "#84cc16", accent: "#65a30d", textOn: "#000000", gradient: "linear-gradient(90deg, #84cc16 0%, #65a30d 100%)" },
  orange:  { hex: "#f97316", accent: "#ea580c", textOn: "#ffffff", gradient: "linear-gradient(90deg, #f97316 0%, #ea580c 100%)" },
  gray:    { hex: "#6b7280", accent: "#4b5563", textOn: "#ffffff", gradient: "linear-gradient(90deg, #6b7280 0%, #4b5563 100%)" },
  red:     { hex: "#ef4444", accent: "#dc2626", textOn: "#ffffff", gradient: "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)" },
  teal:    { hex: "#14b8a6", accent: "#0d9488", textOn: "#ffffff", gradient: "linear-gradient(90deg, #14b8a6 0%, #0d9488 100%)" },
  pink:    { hex: "#ec4899", accent: "#db2777", textOn: "#ffffff", gradient: "linear-gradient(90deg, #ec4899 0%, #db2777 100%)" },
};

function roundRectStroke(ctx, x, y, width, height, radius, strokeStyle = "#000", lineWidth = 2, strokeAlpha = 1) {
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.globalAlpha = strokeAlpha;
  roundRectPath(ctx, x, y, width, height, radius);
  ctx.stroke();
  ctx.restore();
}
// Helper: build rounded-rect path (supports number or object radius)
function roundRectPath(ctx, x, y, width, height, radius) {
  if (typeof radius === "number") {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  } else {
    const def = { tl: 0, tr: 0, br: 0, bl: 0 };
    radius = Object.assign(def, radius);
  }

  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
}
  // helpers
  const formatINR = (v) => {
    if (v === "" || v == null) return "-";
    const n = Number(String(v).replace(/[^0-9.-]/g, "")) || 0;
    return `₹${n.toLocaleString("en-IN")}`;
  };
  const [filebgAdded, setFilebgAdded] = useState(false);
  const [filelogoAdded, setFilelogoAdded] = useState(false);
const [loadingimg, setLoadingimg] = useState(false);
const [loadinglogo, setLoadinglogo] = useState(false);

  // handle uploads
function handleBgUpload(e) {
  setFilebgAdded(false);
  setLoadingimg(true);

  const f = e.target.files?.[0];
  if (!f) return;

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      let finalImg = img;

      const maxSizeMB = 2; // Threshold in MB
      if (f.size / 1024 / 1024 > maxSizeMB) {
        // Downscale large images
        const maxDim = 1200; // max width/height
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));

        const off = document.createElement("canvas");
        off.width = img.width * scale;
        off.height = img.height * scale;
        const offCtx = off.getContext("2d");
        offCtx.drawImage(img, 0, 0, off.width, off.height);

        finalImg = new Image();
        finalImg.onload = () => {
          setBgDataUrl(finalImg.src);
          setFilebgAdded(true);
            setLoadingimg(false);

        };
        finalImg.src = off.toDataURL("image/png");
      } else {
        setBgDataUrl(img.src);
        setFilebgAdded(true);
          setLoadingimg(false);

      }
    };
    img.src = reader.result;
  };

  reader.readAsDataURL(f);
}

function handleLogoUpload(e) {
  setFilelogoAdded(false);
          setLoadinglogo(true);

  const f = e.target.files?.[0];
  if (!f) return;

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      let finalImg = img;

      const maxSizeMB = 2; // Threshold in MB
      if (f.size / 1024 / 1024 > maxSizeMB) {
        // Downscale large images
        const maxDim = 1000; // max width/height
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));

        const off = document.createElement("canvas");
        off.width = img.width * scale;
        off.height = img.height * scale;
        const offCtx = off.getContext("2d");
        offCtx.drawImage(img, 0, 0, off.width, off.height);

        finalImg = new Image();
        finalImg.onload = () => {
          setLogoDataUrl(finalImg.src);
          setFilelogoAdded(true);
                    setLoadinglogo(false);

        };
        finalImg.src = off.toDataURL("image/png");
      } else {
        setLogoDataUrl(img.src);
        setFilelogoAdded(true);
                  setLoadinglogo(false);

      }
    };
    img.src = reader.result;
  };

  reader.readAsDataURL(f);
}


  // load images into Image elements when data URLs change
  // useEffect(() => {
  //   if (!bgDataUrl) {
  //    // bgImgRef.current = null;
  //     //redrawCanvas();
  //     return;
  //   }
  //   const img = new Image();
  //   img.crossOrigin = "anonymous";
  //   img.onload = () => {
  //     bgImgRef.current = img;
  //  //   redrawCanvas();
  //   };
  //   img.onerror = () => {
  //     console.warn("Failed to load background image");
  //     bgImgRef.current = null;
  //    // redrawCanvas();
  //   };
  //   img.src = bgDataUrl;
  // }, [bgDataUrl]); 
  
  // eslint-disable-line

  // useEffect(() => {
  //   if (!logoDataUrl) {
  //    // logoImgRef.current = null;
  //    // redrawCanvas();
  //     return;
  //   }
  //   const img = new Image();
  //   img.crossOrigin = "anonymous";
  //   img.onload = () => {
  //     logoImgRef.current = img;
  //    // redrawCanvas();
  //   };
  //   img.onerror = () => {
  //     console.warn("Failed to load logo image");
  //     logoImgRef.current = null;
  //   //  redrawCanvas();
  //   };
  //   img.src = logoDataUrl;
  // }, [logoDataUrl]);
  
  // eslint-disable-line
function drawTextWithSpacing(ctx, text, x, y, spacing = 10) {
  // calculate total width (characters + spacing)
  let totalWidth = 0;
  for (let char of text) {
    totalWidth += ctx.measureText(char).width + spacing;
  }
  totalWidth -= spacing; // remove last extra spacing

  // center text block
  let currentX = x - totalWidth / 2;

  // draw characters
  for (let char of text) {
    ctx.fillText(char, currentX, y);
    currentX += ctx.measureText(char).width + spacing;
  }
}
function getServiceBoxStyle(design, palette) {
  switch (design) {
    case 1:
      return {
        bg: "rgba(255,255,255,0.15)",
        text: "rgba(255,255,255,1)",
        border: null
      };

    case 2:
      return {
        bg: palette.hex + "25",
        text: "#fff",
        border: palette.hex
      };

    case 3:
      return {
        bg: "rgba(0,0,0,0.25)",
        text: palette.hex,
        border: "rgba(255,255,255,0.4)"
      };

    case 4:
      return {
        bg: "rgba(255,255,255,0.10)",
        text: "#fff",
        border: palette.hex + "80"
      };

    case 5:
      return {
        bg: palette.hex + "20",
        text: "#000",
        border: "#fff"
      };

    case 6:
      return {
        bg: "transparent",
        text: "#fff",
        border: palette.hex
      };

    case 7:
      return {
        bg: palette.hex,
        text: "#fff",
        border: null
      };

    case 8:
      return {
        bg: "rgba(255,255,255,0.9)",
        text: palette.hex,
        border: null
      };

    default:
      return {
        bg: "rgba(255,255,255,0.12)",
        text: "#fff",
        border: null
      };
  }
}

function drawServices(ctx, services, canvasWidth, startY, palette,design) {
  const centerX = canvasWidth / 2;

  // Heading
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = palette.hex;
  startY += 140;

  ctx.font = "700 30px 'Poppins', system-ui, sans-serif";
  ctx.fillText(serviceTitle, centerX, startY);
  startY += 60;

  // Filter empty
  const cleanServices = services.filter(s => s && s.trim() !== "");

  const ONE_COLUMN = cleanServices.length <= 5;

  const boxPaddingX = 22;
  const rowGap = 20;
  const boxH = 42;
  const boxRadius = 14;

  ctx.font = "600 22px 'Poppins', system-ui, sans-serif";

  // --------------------- ONE COLUMN ---------------------
  if (ONE_COLUMN) {
    let y = startY;

    cleanServices.forEach(srv => {
      const textW = ctx.measureText(srv).width;
      const boxW = textW + boxPaddingX * 2;
      const boxX = (canvasWidth - boxW) / 2;

     const style = getServiceBoxStyle(design, palette);

// background
roundRectFill(ctx, boxX, y, boxW, boxH, boxRadius, style.bg);

// border (optional)
if (style.border) {
  ctx.strokeStyle = style.border;
  ctx.lineWidth = 2;
  roundRectStroke(ctx, boxX, y, boxW, boxH, boxRadius);
}

// text
ctx.fillStyle = style.text;
      ctx.fillText(srv, boxX + boxW / 2, y + boxH / 2);

      y += boxH + rowGap;
    });

    return startY;
  }

  // --------------------- TWO COLUMN ---------------------
  const colGap = 140;
  const columnWidth = (canvasWidth - colGap) / 2;

  const leftColX = canvasWidth / 2 - columnWidth / 2 - colGap / 2;
  const rightColX = canvasWidth / 2 + colGap / 2;

  const mid = Math.ceil(cleanServices.length / 2);
  const left = cleanServices.slice(0, mid);
  const right = cleanServices.slice(mid);

  function drawColumn(list, x) {
    let y = startY;

    list.forEach((srv) => {
      const textW = ctx.measureText(srv).width;
      const boxW = textW + boxPaddingX * 2;
      const boxX = x - 30;

    const style = getServiceBoxStyle(design, palette);

roundRectFill(ctx, boxX, y, boxW, boxH, boxRadius, style.bg);

if (style.border) {
  ctx.strokeStyle = style.border;
  ctx.lineWidth = 2;
  roundRectStroke(ctx, boxX, y, boxW, boxH, boxRadius);
}

ctx.fillStyle = style.text;
ctx.fillText(srv, boxX + boxW / 2, y + boxH / 2);
      ctx.fillText(srv, boxX + boxW / 2, y + boxH / 2);

      y += boxH + rowGap;
    });
  }

  drawColumn(left, leftColX);
  drawColumn(right, rightColX);

  return startY;
}


function drawOfferName(ctx, text, centerX, y, style = "normal") {
  const title = text || "Special Offer";

  // Reset shadow before applying styles
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";

  switch (style) {

    /* ----------------------------------
     * STYLE 1: GLOW + STROKE (Premium)
     * ---------------------------------- */
    case "glow":
      ctx.font = "800 58px 'Poppins', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Outer glow
      ctx.shadowColor = "rgba(255, 226, 60, 0.75)";
      ctx.shadowBlur = 25;

      // Stroke outline
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(0,0,0,0.55)";
      ctx.strokeText(title, centerX, y-10);

      // Fill text with a bit glow
      ctx.shadowBlur = 15;
      ctx.fillStyle = "white";
      ctx.fillText(title, centerX, y-10);

      ctx.shadowBlur = 0;
      break;

    /* ----------------------------------
     * STYLE 2: GRADIENT PREMIUM
     * ---------------------------------- */
    case "premium":
      ctx.font = "800 60px 'Poppins', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const grad = ctx.createLinearGradient(
        centerX - 200,
        y - 50,
        centerX + 200,
        y + 50
      );

      grad.addColorStop(0, "#ffcf33");
      grad.addColorStop(0.5, "#ff9033");
      grad.addColorStop(1, "#ff3838");

      ctx.fillStyle = grad;
      ctx.fillText(title, centerX, y-10);
      break;

    /* ----------------------------------
     * STYLE 3: NORMAL CLEAN STYLE
     * ---------------------------------- */
    default:
    case "normal":
      ctx.font = "800 48px 'Poppins', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "white";
      ctx.fillText(title, centerX, y-10);
      break;
  }
}

  // redraw when inputs or filters change
//   useEffect(() => {
    
//     if (!bgDataUrl) {
//       bgImgRef.current = null;
//     }
// if (!logoDataUrl) {
//       logoImgRef.current = null;
// }
// if(loading){
//   return;
// }
//   //  redrawCanvas();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [
//     offerName,
//     offerPrice,
//     actualPrice,
//     mob,
//     address,
//     expiry,
//     selectedColor,
//     brightness,
//     contrast,
//     saturation,
//     blur,
//     bgOpacity,
//     tintHex,
//     tintStrength,
//     fitMode,
//     bgDataUrl,
//     logoDataUrl,
//     selectedColor,
//    patternShape,
//    offerTitleStyle,
//    servicesEnabled,
//    services,
//    design
//   ]);
  
function drawBackgroundPattern(ctx, cssW, cssH, palette, shape) {
    switch (shape) {
        case "triangle":
            drawTrianglePattern(ctx, cssW, cssH, palette);
            break;
        case "circle":
            drawCirclePattern(ctx, cssW, cssH, palette);
            break;
        case "square":
            drawSquarePattern(ctx, cssW, cssH, palette);
            break;
        default:
            drawTrianglePattern(ctx, cssW, cssH, palette); // fallback
    }
}
 function drawTrianglePattern(ctx, cssW, cssH, palette) {
    const c20 = `${palette.hex}20`;
    const c30 = `${palette.hex}30`;
    const c40 = `${palette.hex}40`;

    // bottom repeat
    for (let i = 0; i < 6; i++) {
        let offset = i * 180;
        drawTriangle(
            ctx,
            offset, cssH,
            offset + 250, cssH,
            offset + 100, cssH - 180,
            c40
        );
    }

    // top-left
    drawTriangle(ctx, 0, 0, cssW * 0.40, 0, 0, cssH * 0.32, c30);

    // bottom-right
    drawTriangle(ctx, cssW, cssH, cssW * 0.65, cssH, cssW, cssH * 0.55, c40);

    // mid-layer diagonal
    drawTriangle(
        ctx,
        cssW * 0.25, cssH * 0.40,
        cssW * 0.55, cssH * 0.12,
        cssW * 0.70, cssH * 0.48,
        c20
    );
}
function drawCirclePattern(ctx, cssW, cssH, palette) {
    const c20 = `${palette.hex}20`;
    const c30 = `${palette.hex}30`;
    const c50 = `${palette.hex}50`;

    function circle(x, y, r, fill) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
    }

    circle(cssW * 0.2, cssH * 0.25, 120, c20);
    circle(cssW * 0.8, cssH * 0.2, 150, c30);
    circle(cssW * 0.6, cssH * 0.65, 180, c20);
    circle(cssW * 0.3, cssH * 0.8, 130, c50);
    circle(cssW * 0.9, cssH * 0.85, 90, c30);
}
function drawSquarePattern(ctx, cssW, cssH, palette) {
    const c10 = `${palette.hex}10`; // extremely soft
    const c15 = `${palette.hex}15`; 
    const c20 = `${palette.hex}20`;

    function square(x, y, size, fill) {
        ctx.fillStyle = fill;
        ctx.fillRect(x, y, size, size);
    }

    // ---- Subtle grid ----
    const gridSize = 140; // smaller grid, softer pattern

    for (let x = 0; x < cssW; x += gridSize) {
        for (let y = 0; y < cssH; y += gridSize) {
            // very faint alternating squares
            const fill = ((x + y) / gridSize) % 2 === 0 ? c10 : c15;
            square(x, y, gridSize, fill);
        }
    }

    // ---- Few light accent squares ----
    square(cssW * 0.08, cssH * 0.12, 180, c20);
    square(cssW * 0.72, cssH * 0.20, 150, c15);
    square(cssW * 0.28, cssH * 0.65, 200, c10);

    // ---- Very soft diamond accent ----
    ctx.save();
    ctx.translate(cssW * 0.88, cssH * 0.78);
    ctx.rotate(Math.PI / 4);
    square(-80, -80, 160, c15);
    ctx.restore();
}


function drawTriangle(ctx, x1, y1, x2, y2, x3, y3, fill) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
}
function formatExpiryDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;

  const day = date.getDate();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  // Determine ordinal suffix
  const ordinal = (n) => {
    if (n > 3 && n < 21) return "th";
    switch (n % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  return `${day}${ordinal(day)} ${month}, ${year}`;
}
const cssW = 900;
    const cssH = 1200;

function redrawCanvasa() {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const RESOLUTION_SCALE = 1;
  const dpr = (window.devicePixelRatio || 1) * RESOLUTION_SCALE;

  // Set canvas CSS size
  canvas.style.width = cssW + "px";
  canvas.style.height = cssH + "px";

  // Set actual pixel size for HiDPI
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Clear canvas
  ctx.clearRect(0, 0, cssW, cssH);

  // Draw plain rectangle filling the canvas
  ctx.fillStyle = colors[selectedColor] || "#3490dc"; // Use your selected color
  ctx.fillRect(0, 0, cssW, cssH);
}

  // drawing engine
  function redrawCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // CSS size of poster
    const RESOLUTION_SCALE = 3; // 1 = normal, 2 = HD, 3 = d2K/4K
const dpr = (window.devicePixelRatio || 1) * RESOLUTION_SCALE;


    // set size for HiDPI
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    const ctx = canvas.getContext("2d");
    // normalize coordinates to css pixels
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // clear
    ctx.clearRect(0, 0, cssW, cssH);

    // Palette
    const palette = colors[selectedColor] || colors.indigo;
    // ---------- Draw background (image or gradient) ----------
    if (bgImgRef.current) {
      // apply filters via ctx.filter
      // NOTE: some browsers don't support filter on drawImage for large images but modern ones do.
      ctx.save();
      // build filter string: blur(px) brightness contr sat contrast
      const filterParts = [];
      if (blur) filterParts.push(`blur(${blur}px)`);
      filterParts.push(`brightness(${brightness})`);
      filterParts.push(`contrast(${contrast})`);
      filterParts.push(`saturate(${saturation})`);
      ctx.filter = filterParts.join(" ");

      // Calculate draw dims for cover / contain
      const img = bgImgRef.current;
      const imgW = img.width;
      const imgH = img.height;
      const canvasRatio = cssW / cssH;
      const imgRatio = imgW / imgH;

      let drawW = cssW,
        drawH = cssH,
        dx = 0,
        dy = 0;

      if (fitMode === "cover") {
        // scale so that img covers canvas
        if (imgRatio > canvasRatio) {
          // image is wider
          drawH = cssH;
          drawW = imgW * (cssH / imgH);
          dx = (cssW - drawW) / 2;
          dy = 0;
        } else {
          // image is taller
          drawW = cssW;
          drawH = imgH * (cssW / imgW);
          dx = 0;
          dy = (cssH - drawH) / 2;
        }
      } else {
        // contain
        if (imgRatio > canvasRatio) {
          // width constrained
          drawW = cssW;
          drawH = imgH * (cssW / imgW);
          dx = 0;
          dy = (cssH - drawH) / 2;
        } else {
          drawH = cssH;
          drawW = imgW * (cssH / imgH);
          dy = 0;
          dx = (cssW - drawW) / 2;
        }
      }

      // draw image (may extend outside canvas)
      ctx.globalAlpha = 1;

      ctx.drawImage(img, dx, dy, drawW, drawH);

      // reset filters
      ctx.filter = "none";
      ctx.restore();

      // overlay to ensure text readability. Use dynamic bgOpacity and tint
      ctx.save();
      ctx.fillStyle = `rgba(0,0,0,${bgOpacity})`;
      ctx.fillRect(0, 0, cssW, cssH);
      // tint
      if (tintStrength > 0) {
        const tintRgb = hexToRgb(tintHex);
        ctx.fillStyle = `rgba(${tintRgb.r},${tintRgb.g},${tintRgb.b},${tintStrength})`;
        ctx.fillRect(0, 0, cssW, cssH);
      }
      ctx.restore();
    } else {
      // fallback gradient
      const grad = ctx.createLinearGradient(0, 0, 0, cssH);
      grad.addColorStop(0, `rgba(0,0,0)`);
      grad.addColorStop(1, `rgba(0,0,0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, cssW, cssH);
    }
   const shape = document.getElementById("shapeSelector").value;

    // -----------------------------
    // 2️⃣ DRAW BACKGROUND SHAPE PATTERN
    // -----------------------------
drawBackgroundPattern(ctx, cssW, cssH, palette, shape);
   // ---------- Layout constants ----------
const padding = 48;
const leftX = padding;
let y = padding;

// -----------------------------
// BADGE (LIMITED TIME)
// -----------------------------
const badgeW = 180;
const badgeH = 36;


// Move row down

// -----------------------------
// HEADER ROW (LOGO + TITLE + PRICE BOX)
// -----------------------------

// Logo
const logoSize = 96;
const logoY = y;
if(logoDataUrl){
drawLogoCircle(ctx, logoImgRef.current, leftX, logoY, logoSize, "#FFFFFF");
// LEFT side = Logo + Title block
const headerRowHeight = logoSize;         // keep all items aligned
const rowTop = logoY;                      // baseline row top
const centerY = rowTop + headerRowHeight / 2;

// --- Title measurement ---
ctx.save();
ctx.font = "800 40px system-ui, sans-serif";

// measure the text width
let titleText = gymName || "Gym Name";
let textWidth = ctx.measureText(titleText).width;

// padding inside the box
const horizontalPadding = 40; 
const verticalPadding = 20;

// dynamic box width
let boxW = textWidth + horizontalPadding * 2;

// dynamic box height
let boxH = 40 + verticalPadding * 2; // font size + padding

// block position
let boxX = leftX + logoSize + 20;
let boxY = centerY - boxH / 2;

// ---- Draw dynamic rounded box ----
roundRectFill(
  ctx,
  boxX,
  boxY,
  boxW,
  boxH,
  25,
  "rgba(39, 38, 38, 0.47)",
  1
);

// ---- Draw title text inside ----
ctx.fillStyle = "#fff";
ctx.textBaseline = "middle";

ctx.fillText(
  titleText,
  boxX + horizontalPadding,
  centerY
);

}else{
// LEFT side = Logo + Title block
const headerRowHeight = logoSize;
const rowTop = logoY;
const centerY = rowTop + headerRowHeight / 2;

// --- Title measurement ---
ctx.save();
ctx.font = "800 40px system-ui, sans-serif";

let titleText = gymName || "Gym Name";
let textWidth = ctx.measureText(titleText).width;

const horizontalPadding = 40;
const verticalPadding = 20;

let boxW = textWidth + horizontalPadding * 2;
let boxH = 40 + verticalPadding * 2;

// X: next to logo
let boxX = (cssW - boxW) / 2;

// Y: perfectly centered to logo
let boxY = (logoY + logoSize / 2) - (boxH / 2);

// Draw box
roundRectFill(
  ctx,
  boxX,
  boxY,
  boxW,
  boxH,
  25,
  "rgba(39, 38, 38, 0.47)",
  1
);



// ---- Draw title text inside ----
ctx.fillStyle = "#fff";
ctx.textBaseline = "middle";

ctx.fillText(
  titleText,
  boxX + horizontalPadding,
  centerY
);
}



ctx.restore();

y += 60; // spacing

if (servicesEnabled) {
drawServices(ctx, services, cssW, y,palette,design);
}
ctx.textBaseline = "alphabetic";

    // ----------------------------------------------------------
// CENTERED OFFER BLOCK
// ----------------------------------------------------------
y += 600;

const centerX = cssW / 2;
// Gold color
const gold = "#D4AF37";  // beautiful metallic gold

// Line width
const lineWidth = 220;  // length of the line
const lineHeight = 4;   // thickness

// Draw TOP line
ctx.fillStyle =  palette.hex;
ctx.fillRect(centerX - lineWidth / 2, y - 38, lineWidth, lineHeight);
y += 30;

// Offer Name
drawOfferName(ctx, offerName, centerX, y, offerTitleStyle);
ctx.textBaseline = "alphabetic";

// Draw BOTTOM line
y +=30;

ctx.fillStyle =  palette.hex;

ctx.fillRect(centerX - lineWidth / 2, y + 10, lineWidth, lineHeight);
y += 70;

// Actual Price (striked)
ctx.font = "600 22px system-ui, sans-serif";
ctx.fillStyle = "rgba(255,255,255,0.7)";
ctx.fillText(formatINR(actualPrice), centerX, y);

// strike-through line
const actualTextWidth = ctx.measureText(formatINR(actualPrice)).width;
ctx.strokeStyle = "rgba(255,255,255,0.5)";
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(centerX - actualTextWidth / 2 - 4, y - 10);
ctx.lineTo(centerX + actualTextWidth / 2 + 4, y - 10);
ctx.stroke();

// Offer Price badge (centered)
const textWidtha = ctx.measureText(offerPrice).width;
const padX = 100;   // horizontal padding

const badgeWa = textWidtha + padX * 2;
const badgeHa = 80;
const badgeX = centerX - badgeWa / 2;
const badgeY = y;

// Light transparent yellow background
const badgeColor = `${palette.hex}70`;  
// Rounded box
roundRectFill(ctx, badgeX, badgeY  + 12, badgeWa, badgeH+20, 18, badgeColor, 1);

ctx.fillStyle = "rgba(255, 255, 255, 1)";
ctx.font = "800 36px system-ui, sans-serif";
ctx.fillText((offerPrice), centerX, badgeY + badgeHa / 2 + 12);
y += badgeHa + 30;

// Expiry centered
ctx.font = "600 20px system-ui, sans-serif";
ctx.fillStyle = palette.hex;

const formattedExpiry = formatExpiryDate(expiry);
drawTextWithSpacing(ctx, `Expires: ${formattedExpiry}`, centerX, y, 7);
y += 30;

// Reset alignments
ctx.textAlign = "left";


  // ---------- Bottom Info Card (Improved Design) ----------
const infoCardH = 150;
const infoY = cssH - padding - infoCardH;
ctx.fillStyle = "rgba(247, 247, 247, 0.62)";

// Soft white card with shadow (premium)
roundRectFill(ctx, leftX, infoY, cssW - leftX - padding, infoCardH, 18, "rgba(255, 255, 255, 0.9)", 1);

ctx.save();

ctx.restore();

// INNER PADDING
const innerPadX = leftX + 28;
const innerPadY = infoY + 50;

// ---------- Calculate vertical center ----------
const cardCenterY = infoY + infoCardH / 2;

// ---------- Contact & Address (Left Side Centered) ----------
ctx.textAlign = "left";

// Contact text (top line)
ctx.fillStyle = "#181818";
ctx.font = "700 20px 'Poppins', sans-serif";
ctx.textBaseline = "middle";
ctx.fillText(`📞 ${mob}`, innerPadX, cardCenterY - 12);

// Address (below contact)
ctx.fillStyle = "#6b7280";
ctx.font = "500 15px 'Inter', sans-serif";
ctx.textBaseline = "middle";
ctx.fillText(address, innerPadX, cardCenterY + 18);

// ---------- CTA Button (Right Side, Perfect Center) ----------
const ctaW = 220;
const ctaH = 58;
const ctaX = cssW - padding - ctaW - 30;
const ctaY = cardCenterY - ctaH / 2;

// Button background
roundRectFill(ctx, ctaX, ctaY, ctaW, ctaH, 14, palette.hex, 1);

// Optional border
roundRectStroke(ctx, ctaX, ctaY, ctaW, ctaH, 14, "rgba(255,255,255,0.5)", 2);

// CTA Text (center)
ctx.fillStyle = palette.textOn || "#111";
ctx.font = "800 20px 'Inter', sans-serif";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillText("JOIN NOW", ctaX + ctaW / 2, ctaY + ctaH / 2);

// Reset align
ctx.textAlign = "left";


    // footer small
    ctx.font = "400 12px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255)";
    ctx.fillText("Made with ❤️ — Fitox", leftX, cssH - 18);

  }
  
useEffect(() => {
  
  handleGenerateClick();
}, []);

  function handleGenerateClick() {
  // Wait 1 second before executing the actual function
    setLoading(true);

  setTimeout(() => {
    handleGenerateClickDelayed();
  }, 1000);
}
  // Generate button (force redraw)
function handleGenerateClickDelayed() {

  const tasks = [];

  // Background image
  if (bgDataUrl && bgDataUrl !== bgImgRef.current?.src) {
    tasks.push(new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        bgImgRef.current = img;
        resolve();
      };
      img.onerror = () => {
        console.warn("Failed to load background image");
        bgImgRef.current = null;
        resolve();
      };
      img.src = bgDataUrl;
    }));
  }

  // Logo image
  if (logoDataUrl && logoDataUrl !== logoImgRef.current?.src) {
    tasks.push(new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        logoImgRef.current = img;
        resolve();
      };
      img.onerror = () => {
        console.warn("Failed to load logo image");
        logoImgRef.current = null;
        resolve();
      };
      img.src = logoDataUrl;
    }));
  }

  // Wait for all images to load (or fail) before redrawing
  Promise.all(tasks).finally(() => {
    redrawCanvas();
  requestAnimationFrame(() => setLoading(false));
  
  });
}

const hqToggle = document.getElementById("hqToggle");

  // Download PNG
  function handleDownloadClick() {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const HIGH_QUALITY = hqToggle.checked; // checkbox value

  const format = HIGH_QUALITY ? "image/png" : "image/jpeg";
  const quality = HIGH_QUALITY ? 1.0 : 0.85; // jpeg compression

  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const ext = HIGH_QUALITY ? "png" : "jpg";

      a.download = `${(offerName || "offer")
        .replace(/\s+/g, "_")
        .toLowerCase()}.${ext}`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
    format,
    quality // this is used **only** for JPEG
  );
}

  // ---------- Utility drawing helpers ----------

  // rounded rectangle path
  function roundRect(ctx, x, y, w, h, r) {
    const radius = r || 0;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function roundRectFill(ctx, x, y, w, h, r, fillColor = "#000", alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    roundRect(ctx, x, y, w, h, r);
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.restore();
  }

  // draw circular logo (cropped center-cover)
function drawLogoCircle(ctx, img, x, y, size, color) {
  const SCALE = 4;  // upscale internal quality
  const internalSize = size * SCALE;
  const r = internalSize / 2;

  const off = document.createElement("canvas");
  off.width = internalSize;
  off.height = internalSize;

  const offCtx = off.getContext("2d");

  // Clip circle
  offCtx.beginPath();
  offCtx.arc(r, r, r, 0, Math.PI * 2);
  offCtx.clip();

  // COVER scaling
  const scale = Math.max(internalSize / img.width, internalSize / img.height);
  const sw = internalSize / scale;
  const sh = internalSize / scale;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;

  offCtx.drawImage(img, sx, sy, sw, sh, 0, 0, internalSize, internalSize);

  // Draw back to main canvas (downscaled cleanly)
  ctx.drawImage(off, x, y, size, size);
}


  // wrap text (simple)
  function wrapText(ctx, text, x, y, maxWidth, lineHeight = 20, valign = "top") {
    const words = String(text || "").split(" ");
    let line = "";
    let lines = [];
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());
    // vertical offset
    let offsetY = 0;
    if (valign === "middle") {
      offsetY = -((lines.length - 1) * lineHeight) / 2;
    } else if (valign === "bottom") {
      offsetY = -(lines.length - 1) * lineHeight;
    }
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], x, y + offsetY + i * lineHeight);
    }
  }

  // hex <-> rgb helpers
  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const bigint = parseInt(full, 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
  }
  function rgbToHex(r, g, b) {
    const toHex = (n) => ("0" + Math.round(n).toString(16)).slice(-2);
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  function lightenHex(hex, amt = 0.1) {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt);
  }
  function darkenHex(hex, amt = 0.1) {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHex(r * (1 - amt), g * (1 - amt), b * (1 - amt));
  }

  // initial draw on mount
    const [loading, setLoading] = useState(false);
  
// useEffect(() => {
//   const timer = setTimeout(() => {
//     try {
//       console.log("Canvas cleared");

//       if (canvasRef.current) {
//        // redrawCanvas(); // call your canvas drawing function
//       } else {
//         console.warn("Canvas ref not ready yet.");
//       }
//     } catch (err) {
//       console.error("Canvas redraw error:", err);
//     } finally {
//       setLoading(false); // stop loader
//     }
//   }, 2000);

//   return () => clearTimeout(timer);
// }, []); 

// add dependencies if redrawCanvas uses any state/props
const [isDesktop, setIsDesktop] = useState(false);
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkDevice = () => {
    const isLargeScreen = window.matchMedia("(min-width: 768px)").matches;
    const hasMouse = window.matchMedia("(pointer: fine)").matches;

    const desktop = isLargeScreen && hasMouse;

    setIsDesktop(desktop);
    setIsMobile(!desktop); // inverse
  };

  checkDevice();
  window.addEventListener("resize", checkDevice);

  return () => window.removeEventListener("resize", checkDevice);
}, []);
  return (
    <div className="min-h-screen w-full p-6 bg-gray-50 text-gray-800">
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
{(loadinglogo || loadingimg) && (
  <div className="fixed inset-0 bg-white/70 backdrop-blur-md flex flex-col items-center justify-center z-50 overflow-hidden">
    <div className="flex flex-col items-center gap-2">
      {/* Spinner */}
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      {/* Message */}
      <span className="text-sm text-gray-600 mt-2">Uploading...</span>
    </div>
  </div>
)}

 <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-gray-800">
    <span className="bg-blue-600 text-white text-sm px-2 py-1 rounded-md">Fitox AI</span>
   Offer Poster
  </h2>{/* Canvas preview area */}
 
<div
  className={
    isMobile
      ? "grid grid-cols-1 gap-6"        // Mobile → 1 column
      : "grid grid-cols-4 gap-6"        // Desktop → 4 columns
  }
>        {/* Controls column */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow p-5 sticky top-6">
          <h2 className="text-lg font-semibold mb-3">Offer inputs</h2>

          <label className="block text-sm mb-2">
            <span className="text-xs text-gray-600">Offer name</span>
            <input value={offerName} onChange={(e) => setOfferName(e.target.value)} className="mt-1 block w-full rounded-md border p-2" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="text-xs text-gray-600">Offer price</span>
              <input value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} className="mt-1 block w-full rounded-md border p-2" />
            </label>
            <label className="block text-sm">
              <span className="text-xs text-gray-600">Actual price</span>
              <input value={actualPrice} onChange={(e) => setActualPrice(e.target.value)} className="mt-1 block w-full rounded-md border p-2" />
            </label>
          </div>

          <label className="block text-sm mt-3">
            <span className="text-xs text-gray-600">Contact mobile</span>
            <input value={mob} onChange={(e) => setMob(e.target.value)} className="mt-1 block w-full rounded-md border p-2" />
          </label>

          <label className="block text-sm mt-3">
            <span className="text-xs text-gray-600">Address</span>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 block w-full rounded-md border p-2" />
          </label>

          <label className="block text-sm mt-3">
            <span className="text-xs text-gray-600">Expiry date</span>
            <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="mt-1 block w-full rounded-md border p-2" />
          </label>

        <h3 className="mt-5 text-sm font-semibold mb-2">Gym logo</h3>
        
         <label className="relative inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium rounded-xl cursor-pointer shadow-md hover:shadow-lg transition-all duration-200">
  <span className="flex items-center gap-2">
    {filelogoAdded ? (
      <>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-green-300"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        File Added
      </>
    ) : (
      "Upload Image"
    )}
  </span>
  <input
    type="file"
    accept="image/*"
    onChange={handleLogoUpload}
    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
  />
</label>

          <hr className="my-3" />
          <h3 className="text-sm font-semibold mb-2">Background image</h3>
         
         <label className="relative inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium rounded-xl cursor-pointer shadow-md hover:shadow-lg transition-all duration-200">
  <span className="flex items-center gap-2">
    {filebgAdded ? (
      <>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-green-300"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        File Added
      </>
    ) : (
      "Upload Image"
    )}
  </span>
  <input
    type="file"
    accept="image/*"
    onChange={handleBgUpload}
    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
  />
</label>
         {/* <div className="mt-3 text-xs text-gray-600">Fit mode:</div>
           <div className="mt-2 flex gap-2">
            <button onClick={() => setFitMode("cover")} className={`px-2 py-1 rounded ${fitMode === "cover" ? "bg-indigo-600 text-white" : "border"}`}>Cover</button>
            <button onClick={() => setFitMode("contain")} className={`px-2 py-1 rounded ${fitMode === "contain" ? "bg-indigo-600 text-white" : "border"}`}>Contain</button>
          </div> */}

          {bgDataUrl && (
  <div className="bg-white p-4 rounded-2xl shadow-md w-full max-w-md mx-auto">
  <h3 className="text-lg font-semibold mb-4 text-gray-800">Image Filters</h3>

  {/* Brightness */}
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-600 mb-1">
      Brightness: <span className="font-semibold">{brightness}</span>
    </label>
    <input
      type="range"
      min="0.2"
      max="2"
      step="0.01"
      value={brightness}
      onChange={(e) => setBrightness(Number(e.target.value))}
      className="w-full h-2 bg-gray-200 rounded-lg accent-indigo-600 hover:accent-indigo-500"
    />
  </div>

  {/* Contrast */}
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-600 mb-1">
      Contrast: <span className="font-semibold">{contrast}</span>
    </label>
    <input
      type="range"
      min="0.2"
      max="2"
      step="0.01"
      value={contrast}
      onChange={(e) => setContrast(Number(e.target.value))}
      className="w-full h-2 bg-gray-200 rounded-lg accent-indigo-600 hover:accent-indigo-500"
    />
  </div>

  {/* Saturation */}
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-600 mb-1">
      Saturation: <span className="font-semibold">{saturation}</span>
    </label>
    <input
      type="range"
      min="0"
      max="3"
      step="0.01"
      value={saturation}
      onChange={(e) => setSaturation(Number(e.target.value))}
      className="w-full h-2 bg-gray-200 rounded-lg accent-indigo-600 hover:accent-indigo-500"
    />
  </div>

  {/* Blur */}
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-600 mb-1">
      Blur: <span className="font-semibold">{blur}px</span>
    </label>
    <input
      type="range"
      min="0"
      max="12"
      step="0.5"
      value={blur}
      onChange={(e) => setBlur(Number(e.target.value))}
      className="w-full h-2 bg-gray-200 rounded-lg accent-indigo-600 hover:accent-indigo-500"
    />
  </div>

  {/* Dark overlay */}
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-600 mb-1">
      Dark Overlay Opacity: <span className="font-semibold">{bgOpacity}</span>
    </label>
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={bgOpacity}
      onChange={(e) => setBgOpacity(Number(e.target.value))}
      className="w-full h-2 bg-gray-200 rounded-lg accent-indigo-600 hover:accent-indigo-500"
    />
  </div>

  {/* Tint color */}
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-600 mb-2">Tint Color</label>
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={tintHex}
        onChange={(e) => setTintHex(e.target.value)}
        className="w-12 h-12 p-0 border rounded-lg cursor-pointer"
      />
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={tintStrength}
        onChange={(e) => setTintStrength(Number(e.target.value))}
        className="flex-1 h-2 bg-gray-200 rounded-lg accent-indigo-600 hover:accent-indigo-500"
      />
    </div>
  </div>
</div>
          )}
       

          <hr className="my-3" />
<div className="mt-6">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-gray-700">Show Services Section</p>

        <button
onClick={() => setServicesEnabled(prev => !prev)}
          className={`px-3 py-1 rounded-md text-sm font-medium border transition
            ${servicesEnabled
              ? "bg-indigo-600 text-white border-indigo-700"
              : "bg-white border-gray-300"}
          `}
        >
          {servicesEnabled ? "Enabled" : "Disabled"}
        </button>
      </div>

      {servicesEnabled && (
            <div className="mt-6">

        <label className="block text-sm mb-2">
            <span className="text-xs text-gray-600">Title</span>
            <input value={serviceTitle} onChange={(e) => setServiceTitle(e.target.value)} className="mt-1 block w-full rounded-md border p-2" />
          </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">

          {/* LEFT COLUMN (1–4) */}
          <div className="space-y-4">
            {services.slice(0, 4).map((srv, idx) => (
              <div key={idx} className="flex flex-col">
                <span className="text-xs text-gray-500">
                  Service {idx + 1}
                </span>

                 <input
      value={srv}
      onChange={(e) => {
        const updated = [...services];
        updated[idx] = e.target.value;
        setServices(updated);
      }}
      className="mt-1 border rounded-md p-2 text-sm"
    />
              </div>
            ))}
          </div>

          {/* RIGHT COLUMN (5–8) */}
        <div className="space-y-4">
  {services.slice(4, 8).map((srv, idx) => (
    <div key={idx + 4} className="flex flex-col">
      <span className="text-xs text-gray-500">
        Service {idx + 5}
      </span>

      <input
        value={srv}
        onChange={(e) => {
          const updated = [...services];
          updated[idx + 4] = e.target.value;  // FIXED HERE
          setServices(updated);
        }}
        className="mt-1 border rounded-md p-2 text-sm"
      />
    </div>
  ))}
</div>


        </div>
          </div>
      )}
    </div>
    <button
  onClick={() => setDesign(prev => prev >= 8 ? 1 : prev + 1)}
  className="mt-5 py-3 px-4 rounded-xl bg-indigo-600 text-white font-semibold"
>
  Design {design}
</button>
          <hr className="my-3" />
                    <h3 className="text-sm font-semibold mb-2">Design shape (Inner)</h3>

         <select
  id="shapeSelector"
  value={patternShape}
  onChange={(e) => setPatternShape(e.target.value)}
  className="border p-2 rounded-md"
>
  <option value="triangle">Triangles</option>
  <option value="circle">Circles</option>
  <option value="square">Squares</option>
</select>

          <hr className="my-3" />

       

                              <h3 className="text-sm font-semibold mb-2">Offer title style</h3>

<div className="mt-4">
  <OfferTitleStyleSelector
    value={offerTitleStyle}
    onChange={setOfferTitleStyle}
  />
</div>
          <hr className="my-3" />

          <h3 className="text-sm font-semibold mb-2">Design color</h3>
          <div className="flex flex-wrap gap-2 mt-2">
  {Object.keys(colors).map((k) => (
    <button
      key={k}
      onClick={() => setSelectedColor(k)}
      className={`
        w-10 h-10 rounded-full border transition-all duration-150
        ${selectedColor === k ? "ring-2 ring-offset-2 ring-indigo-400" : "ring-0"}
        hover:scale-110
      `}
      style={{ background: colors[k].hex }}
    />
  ))}
</div>
          <div className="mt-4 flex gap-2 justify-end ">

<label className="flex items-center gap-2 cursor-pointer">
  <input type="checkbox" id="hqToggle" />
  <span>High Quality</span>
</label>
</div>
          <div className="mt-4 flex gap-2 justify-end ">
           <button
  onClick={handleGenerateClick}
  className="px-3 py-2 rounded-md bg-indigo-600 text-white font-semibold transform transition-transform duration-150 active:scale-75"
>
  Generate
</button>

<button
  onClick={handleDownloadClick}
  className="px-3 py-2 rounded-md bg-green-600 text-white transform transition-transform duration-150 active:scale-75"
>
  <Download className="w-5 h-5" />
</button>
          </div>

          <p className="text-xs text-gray-500 mt-3">Tip: Adjust filters to improve background visibility for text. Check "High quality" to save at full resolution.</p>
        </div>
        
{!isMobile && (
  <div className="lg:col-span-3">
    <div className="bg-white rounded-2xl p-4 shadow flex flex-col items-center">
      <div className="mb-3 text-sm text-gray-600">Live preview (900 × 1200)</div>

      {/* Canvas wrapper */}
      <div className="relative w-full flex justify-center rounded-lg overflow-hidden border">
        <canvas
          ref={canvasRef}
          style={{ display: "block", background: "#fff" }}
        />

        {/* Loading overlay only on canvas */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md bg-black/40 z-10">
            <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white mt-4 text-sm opacity-80">Generating AI output...</p>
          </div>
        )}
      </div>

      <div className="mt-4 w-full flex justify-between">
        <div className="text-xs text-gray-500">Design — Full background cover</div>
        <div className="text-xs text-gray-500">Tip: Use Generate if changes don't appear</div>
      </div>
    </div>
  </div>
)}

        
      </div>
       {isMobile && ( 
   <div className="mb-10 relative rounded-2xl shadow-lg border border-white/10 mt-2 w-full overflow-hidden bg-white">

  {loading && (
    <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md bg-black/40 z-20">
      <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-white mt-4 text-sm opacity-80">Generating AI output...</p>
    </div>
  )}
         <div className="p-2 flex justify-center items-center min-h-[60vh]">
  <div
    className="relative flex justify-center items-center w-full"
    style={{ maxHeight: "80vh" }}
  >
   <canvas
  ref={canvasRef}
  width={cssW}
  height={cssH}
  className="rounded-xl"
  style={{
    display: "block",
    maxWidth: "100%",   // 🔥 Key: allow shrink to fit width
    height: "auto",     // 🔥 Maintain aspect ratio
    objectFit: "contain",
    maxHeight: "80vh",
    transition: "filter 0.5s ease, opacity 0.5s ease",
    filter: loading ? "blur(10px)" : "blur(0)",
    opacity: loading ? 0.5 : 1,
  }}
/>
  </div>
</div>


  
</div>
 )}
  <footer className="mt-6 text-xs text-gray-400 text-center">
        Fitox AI — Poster Generator.
      </footer>
    </div>
    
  );
}


