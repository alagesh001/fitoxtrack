import React, { useRef, useState, useEffect } from "react";
import ImageCropper from "./ImageCropper";

// TransformationImageGenerator.jsx
// Single-file React component (default export) using Tailwind CSS
// - Inputs: two photos, gym logo, gym name, title, subtitle, text for image A and B
// - Controls: blend mode, scale & rotation for each image, font size
// - Preview on canvas, Generate & Download PNG

export default function TransformationImageGenerator() {
  const canvasRef = useRef(null);
  const [imgAFile, setImgAFile] = useState(null);
  const [imgBFile, setImgBFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0); // 1..5
  const [frameColor, setFrameColor] = useState("#ff0000"); // default red

  const [imgA, setImgA] = useState(null);
  const [imgB, setImgB] = useState(null);
  const [logoImg, setLogoImg] = useState(null);

  const [gymName, setGymName] = useState("Your Gym");
  const [title, setTitle] = useState("Transformation Weight Loss");
  const [subtitle, setSubtitle] = useState("5 - Months");
  const [textA, setTextA] = useState("Before (120kg)");
  const [textB, setTextB] = useState("After (80kg)");

  const [blendMode, setBlendMode] = useState("none");
  const [fontSize, setFontSize] = useState(36);
  const [canvasWidth, setCanvasWidth] = useState(900);
  const [canvasHeight, setCanvasHeight] = useState(1200);

  // Simple transform controls per image (scale and rotate)
  const [aScale, setAScale] = useState(1);
  const [bScale, setBScale] = useState(1);
  const [aRotate, setARotate] = useState(0);
  const [bRotate, setBRotate] = useState(0);
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
  // Utility: load file into Image object
  function fileToImage(file, cb) {
    if (!file) return cb(null);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => cb(img);
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  // Watch files and create images
  useEffect(() => {
    fileToImage(imgAFile, setImgA);
  }, [imgAFile]);

  useEffect(() => {
    fileToImage(imgBFile, setImgB);
  }, [imgBFile]);

  useEffect(() => {
    fileToImage(logoFile, setLogoImg);
  }, [logoFile]);

  // Draw function: draws the composed preview on canvas
  function drawPreview() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // High DPI support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // background
    ctx.fillStyle = "#111827"; // tailwind gray-900
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Layout: left half = image A, right half = image B
    const halfW = canvasWidth / 2;
const padding = 40;

    // helper to draw image into a box with optional scale and rotation
function drawImageInBox(img, x, y, w, h, scale = 1, rotate = 0, frameType = 0, frameColor = "#ff0000") {
  if (!img) {
    ctx.save();
    ctx.fillStyle = "#222221ff";
    ctx.fillRect(x, y, w, h);
    ctx.restore();
    return;
  }

  const imgRatio = img.width / img.height;
  const boxRatio = w / h;

  let drawW, drawH;
  if (imgRatio < boxRatio) {
    drawW = w * scale;
    drawH = drawW / imgRatio;
  } else {
    drawH = h * scale;
    drawW = drawH * imgRatio;
  }

  const cx = x + w / 2;
  const cy = y + h / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotate * Math.PI) / 180);

  // Crop if width > 450
  let sx = 0;
  let sWidth = img.width;
  if (drawW > 450) {
    const excess = drawW - 450;
    const cropRatio = excess / drawW;
    sx = img.width * cropRatio;
    sWidth = img.width - sx;
    drawW = 450;
  }

  // Draw the image
  ctx.drawImage(
    img,
    sx, 0,
    sWidth, img.height,
    -drawW / 2, -drawH / 2,
    drawW, drawH
  );

  // Set frame style based on frameType
  ctx.save(); // style save
  ctx.lineWidth = 10;
  ctx.setLineDash([]);
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";

  switch(frameType) {
    case 0: // Soft glow
     
      break;
    case 1: // Soft glow
      ctx.strokeStyle = frameColor;
      ctx.shadowColor = frameColor + "88";
      ctx.shadowBlur = 20;
      break;
    case 2: // Dashed fire effect
      ctx.strokeStyle = frameColor;
      ctx.shadowColor = frameColor + "aa";
      ctx.shadowBlur = 15;
      ctx.setLineDash([15, 5]);
      break;
    case 3: // Gradient frame
      const grad = ctx.createLinearGradient(-drawW/2, -drawH/2, drawW/2, drawH/2);
      grad.addColorStop(0, frameColor);
      grad.addColorStop(0.5, "white");
      grad.addColorStop(1, frameColor);
      ctx.strokeStyle = grad;
      break;
    case 4: // Shadowed neon
      ctx.strokeStyle = frameColor;
      ctx.shadowColor = frameColor + "cc";
      ctx.shadowBlur = 25;
      break;
    case 5: // Fancy dashed glow
      ctx.strokeStyle = frameColor;
      ctx.shadowColor = frameColor + "99";
      ctx.shadowBlur = 15;
      ctx.setLineDash([10, 5, 5, 5]);
      break;
    default:
      ctx.strokeStyle = frameColor;
  }

  // COMMON: draw the border rectangle
  if(frameType!=0){
  ctx.strokeRect(-drawW / 2, -drawH / 2, drawW, drawH);
}

  ctx.restore(); // style restore
  ctx.restore(); // image restore
}









    // Draw images
    // Image A
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    drawImageInBox(imgA, 0, 250, 450, 800, 1, 0,currentFrame,frameColor);
    ctx.restore();

    // Image B - use blend mode if selected
    ctx.save();
    if (blendMode !== "none") ctx.globalCompositeOperation = blendMode; // e.g. multiply, screen
    drawImageInBox(imgB, 450, 250, 450, 800, 1, 0,currentFrame,frameColor);
    ctx.restore();

    // Overlay semi-transparent panel for texts
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, canvasHeight - 140, canvasWidth, 140);
    ctx.restore();

    // Gym logo + name at top-left
    const logoSize = 96;

// ---------------------------
// 1) MEASURE GYM NAME WIDTH
// ---------------------------
ctx.font = "700 28px Inter, sans-serif";
const gymNameWidth = ctx.measureText(gymName).width;

// --------------------------------------
// 2) CALCULATE TOTAL WIDTH OF THE BLOCK
// --------------------------------------
let totalWidth;
if (logoImg) {
  totalWidth = logoSize + 20 + gymNameWidth; // logo + spacing + text
} else {
  totalWidth = gymNameWidth; // only text
}

// ---------------------------
// 3) CENTER X POSITION
// ---------------------------
const startX = (canvasWidth - totalWidth) / 2;

// ---------------------------
// 4) DRAW ELEMENTS
// ---------------------------

// If logo exists → draw logo
if (logoImg) {
  ctx.save();
  ctx.fillStyle = "rgba(10, 10, 10, 0.27)";
  ctx.fillRect(startX - 6, padding - 12, logoSize + 12, logoSize + 12);

  ctx.drawImage(logoImg, startX, padding-6, logoSize, logoSize);
  ctx.restore();
}

// Draw gym name (next to logo OR centered alone)
ctx.save();
ctx.fillStyle = "#ffffff";
ctx.font = "700 28px Inter, sans-serif";
ctx.textAlign = "left";

const gymNameX = logoImg ? startX + logoSize + 20 : startX;

ctx.fillText(gymName, gymNameX, padding + logoSize / 2 -6);
ctx.restore();


    // Title centered top
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.font = `800 34px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(title, canvasWidth /2, padding + 140);
    ctx.restore();

    // Subtitle below title
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = `500 24px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(subtitle, canvasWidth/2 , padding + 180);
    ctx.restore();

    // Text labels on each image (textA on left, textB on right)
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.font = `700 ${fontSize}px Inter, sans-serif`;
    ctx.textAlign = "center";
    // Image A label
    ctx.fillText(textA, halfW / 2, canvasHeight - 60);
    // Image B label
    ctx.fillText(textB, halfW + halfW / 2, canvasHeight - 60);
    ctx.restore();

    // Small watermark or expiry placeholder bottom-right
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "500 12px Inter, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(new Date().toLocaleDateString(), canvasWidth - padding, canvasHeight - 12);
    ctx.restore();
  }

  // Redraw when dependencies change
  useEffect(() => {
    drawPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgA, imgB, logoImg, gymName, title, subtitle, textA, textB, blendMode, fontSize, aScale, bScale, aRotate, bRotate, canvasWidth, canvasHeight,currentFrame,frameColor]);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${gymName.replace(/\s+/g, "_")}_transformation.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
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
       <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-gray-800">
    <span className="bg-blue-600 text-white text-sm px-2 py-1 rounded-md">Fitox AI</span>
   Transformation Poster
  </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Controls */}
        <div className="col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow">
<div className="space-y-4">

  {/* Photo A */}
  <div>
    <label className="block text-sm font-medium mb-1">Photo A (Before)</label>
    <label className="inline-block px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600">
      Upload Photo A
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          if (!file) return;
          setImgAFile(file);
          setShowCropper({ show: true, file, callback: setImgA });
          e.target.value = null; // allow selecting same file again
        }}
      />
    </label>

    {/* Preview */}
    {imgA && (
      <img
        src={imgA.src}
        alt="Cropped A"
        className="mt-2 w-20 h-20 object-cover rounded border"
      />
    )}
  </div>

  {/* Photo B */}
  <div>
    <label className="block text-sm font-medium mb-1">Photo B (After)</label>
    <label className="inline-block px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600">
      Upload Photo B
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          if (!file) return;
          setImgBFile(file);
          setShowCropper({ show: true, file, callback: setImgB });
          e.target.value = null;
        }}
      />
    </label>

    {/* Preview */}
    {imgB && (
      <img
        src={imgB.src}
        alt="Cropped B"
        className="mt-2 w-20 h-20 object-cover rounded border"
      />
    )}
  </div>

  {/* Cropper */}
  {showCropper.show && showCropper.file && (
    <ImageCropper
      key={showCropper.file.name + showCropper.file.lastModified} // force remount
      file={showCropper.file}
      onCrop={(croppedImage) => {
        showCropper.callback(croppedImage); // set correct image
        setShowCropper({ show: false, file: null, callback: null });
      }}
      onCancel={() => setShowCropper({ show: false, file: null, callback: null })}
    />
  )}
</div>

            <label className="block text-sm mt-3">Gym Logo</label>
           <div className="mt-1 flex items-center space-x-2">
  <label className="inline-block px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600">
    Upload Gym Logo
    <input
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
    />
  </label>

  {/* Show tick if file selected */}
  {logoFile && (
    <span className="text-green-500 text-xl">✅</span>
  )}
</div>
            <label className="block text-sm mt-3">Gym Name</label>
            <input value={gymName} onChange={(e) => setGymName(e.target.value)} className="w-full mt-1 border rounded px-2 py-1" />

            <label className="block text-sm mt-3">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mt-1 border rounded px-2 py-1" />

            <label className="block text-sm mt-3">Subtitle</label>
            <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="w-full mt-1 border rounded px-2 py-1" />

            <label className="block text-sm mt-3">Text on Image A</label>
            <input value={textA} onChange={(e) => setTextA(e.target.value)} className="w-full mt-1 border rounded px-2 py-1" />

            <label className="block text-sm mt-3">Text on Image B</label>
            <input value={textB} onChange={(e) => setTextB(e.target.value)} className="w-full mt-1 border rounded px-2 py-1" />
          </div>

          <div className="bg-white p-4 rounded-2xl shadow space-y-3">
<h3 className="font-medium text-orange-500">Style & Transforms</h3>

           
            <label className="block text-sm mt-2">Font Size</label>
            <input type="range" min={18} max={72} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} />
              <label className="flex items-center space-x-2">
           <div className="flex flex-col space-y-2 mt-3">
  <span className="text-sm ">Frame Color</span>

  <div className="flex flex-col space-y-2">
    {/* Preset colors in two rows */}
    <div className="flex justify-start space-x-2">
      {["#c00202ff", "#37ac02ff", "#b80081ff","#c54800ff"].map((color) => (
        <button
          key={color}
          className={`w-8 h-8 rounded-full border-2 ${frameColor === color ? "border-black" : "border-gray-300"}`}
          style={{ backgroundColor: color }}
          onClick={() => setFrameColor(color)}
        />
      ))}
    </div>
    <div className="flex justify-start space-x-2">
      {["#e7b900ff", "#ffffffff", "#00c4c4ff","#000000ff"].map((color) => (
        <button
          key={color}
          className={`w-8 h-8 rounded-full border-2 ${frameColor === color ? "border-black" : "border-gray-300"}`}
          style={{ backgroundColor: color }}
          onClick={() => setFrameColor(color)}
        />
      ))}
    </div>

  </div>
</div>

        </label>
            <label className="block text-sm mt-2">Choose Frame</label>

             <button
        onClick={() => setCurrentFrame(prev => (prev >= 5 ? 0 : prev + 1))}
        className="mt-1 py-3 px-6 rounded-xl bg-orange-400 text-white font-semibold hover:bg-orange-500"
      >
        Frame {currentFrame}
      </button>

            <div className="flex gap-2 mt-2">
              {/* <button onClick={() => { setCanvasWidth(1200); setCanvasHeight(700); }} className="bg-indigo-600 text-white px-3 py-1 rounded">Set 1200×700</button> */}
              {/* <button onClick={() => { setCanvasWidth(900); setCanvasHeight(900); }} className="bg-gray-200 px-3 py-1 rounded">Square 900</button> */}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow flex gap-2">
            {/* <button onClick={drawPreview} className="flex-1 bg-emerald-500 text-white px-3 py-2 rounded">Generate</button> */}
            <button onClick={handleDownload} className="flex-1 bg-green-600 text-white px-3 py-2 rounded">Download PNG</button>
          </div>
        </div>

        {/* Right: Canvas Preview */}
       <div className="col-span-2">
  <div className="bg-white p-4 rounded-2xl shadow">

    {/* FRAME (keeps full image visible) */}
<div
  className="
    relative w-full 
    max-h-[600px]        /* mobile compact */
    sm:max-h-[800px]
    md:max-h-[1000px]
    lg:max-h-[1200px]
    rounded-lg overflow-hidden border bg-gray-100 
    flex items-center justify-center
  "
>

  <canvas
    ref={canvasRef}
    style={{
      maxWidth: "100%",     // scale down to fit width
      maxHeight: "100%",    // scale down to fit height
      width: "auto",
      height: "auto",
      objectFit: "contain",
      display: "block",
    }}
  />
</div>


    <p className="text-xs text-gray-500 mt-2">
      Tip: upload high-resolution photos for best results. Use blend modes to create artistic transforms.
    </p>

  </div>
</div>

      </div>
    </div>
  );
}
{/* <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Preview</h2>
              <div className="text-sm text-gray-500">{canvasWidth} × {canvasHeight}px</div>
            </div> */}