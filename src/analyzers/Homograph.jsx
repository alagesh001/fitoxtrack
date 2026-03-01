import React, { useRef, useState,useEffect } from "react";
import { Matrix, SingularValueDecomposition } from "ml-matrix";

const REAL_COURT = {
  // Top baseline
  TL_BASE: [0, 23.77],
  TR_BASE: [10.97, 23.77],
  CENTER_TOP_BASE: [5.485, 23.77],

  // Bottom baseline
  BL_BASE: [0, 0],
  BR_BASE: [10.97, 0],
  CENTER_BOTTOM_BASE: [5.485, 0],

  // Net
  NET_LEFT: [0, 11.885],
  NET_RIGHT: [10.97, 11.885],
  NET_CENTER: [5.485, 11.885],

  // Service lines
TL_SERVICE: [1.37, 18.29],
TR_SERVICE: [9.60, 18.29],

BL_SERVICE: [1.37, 5.485],
BR_SERVICE: [9.60, 5.485],

  // Service center lines
  TOP_SERVICE_CENTER: [5.485, 18.29],
  BOTTOM_SERVICE_CENTER: [5.485, 6.40],
};

export default function CourtCalibration() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
const [isPlaying, setIsPlaying] = useState(false);
const homographyRef = useRef(null);
const pointsRef = useRef({});


  const [selectedPoint, setSelectedPoint] = useState("TL_BASE");
  const [points, setPoints] = useState({});
  const [H, setH] = useState(null);
useEffect(() => {
  pointsRef.current = points;
}, [points]);
useEffect(() => {
  homographyRef.current = H;
}, [H]);
  // =============================
  // Upload Video
  // =============================
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const video = videoRef.current;
    video.src = URL.createObjectURL(file);
    video.load();

    video.onloadedmetadata = () => {
      video.currentTime = 0;
    };

    video.onseeked = () => {
      drawFrame({});
     
    };
  };
  useEffect(() => {
  const video = videoRef.current;
  const canvas = canvasRef.current;
  if (!video || !canvas) return;

  const handleLoaded = () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    drawFrame(); // draw first frame after size set
  };

  video.addEventListener("loadedmetadata", handleLoaded);

  return () => {
    video.removeEventListener("loadedmetadata", handleLoaded);
  };
}, []);

  // =============================
  // Draw Frame
  // =============================
  const drawFrame = (customPoints = points, customH = H) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
      if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw Marked Points
    Object.entries(customPoints).forEach(([label, p]) => {
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = "yellow";
      ctx.fillText(label, p.x + 8, p.y - 8);
    });

    if (customH) drawCourt(customH);
  };

  // =============================
  // Click to Mark
  // =============================
useEffect(() => {
  const video = videoRef.current;
  if (!video) return;

  const handlePlay = () => {
    setIsPlaying(true);
    requestAnimationFrame(renderFrame);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  video.addEventListener("play", handlePlay);
  video.addEventListener("pause", handlePause);
  video.addEventListener("ended", handleEnded);

  return () => {
    video.removeEventListener("play", handlePlay);
    video.removeEventListener("pause", handlePause);
    video.removeEventListener("ended", handleEnded);
  };
}, []);
const handleToggle = () => {
  const video = videoRef.current;
  if (!video) return;

  if (video.ended) {
    video.currentTime = 0; // important for replay
  }

  if (video.paused) {
    video.play(); // play event will start loop
  } else {
    video.pause();
  }

  setIsPlaying(!video.paused);
};
const renderFrame = () => {
  const video = videoRef.current;
  const canvas = canvasRef.current;
  if (!video || !canvas) return;

  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  // Debug logs
 
  if (pointsRef.current) {
    Object.entries(pointsRef.current).forEach(([label, p]) => {
      if (!p) return;

      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, 2 * Math.PI);
      ctx.fill();
    });
  }

  if (homographyRef.current) {
    drawCourt(homographyRef.current);
  }

  if (!video.paused && !video.ended) {
    requestAnimationFrame(renderFrame);
  }
};
  const handleClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const updated = { ...points, [selectedPoint]: { x, y } };
    setPoints(updated);
    drawFrame(updated);
  };

  // =============================
  // Compute Homography
  // =============================
  const computeHomography = () => {
    if (Object.keys(points).length < 4) {
      alert("Mark at least 4 points");
      return;
    }

    const src = [];
    const dst = [];

    Object.keys(points).forEach((key) => {
      const [X, Y] = REAL_COURT[key];
      const { x, y } = points[key];

      src.push([X, Y, 1]);
      dst.push([x, y, 1]);
    });

    const A = [];

    for (let i = 0; i < src.length; i++) {
      const [X, Y] = src[i];
      const [x, y] = dst[i];

      A.push([-X, -Y, -1, 0, 0, 0, x * X, x * Y, x]);
      A.push([0, 0, 0, -X, -Y, -1, y * X, y * Y, y]);
    }

const matrixA = new Matrix(A);
const svd = new SingularValueDecomposition(matrixA);
const V = svd.rightSingularVectors;
const h = V.getColumn(V.columns - 1);

const homography = [
  [h[0], h[1], h[2]],
  [h[3], h[4], h[5]],
  [h[6], h[7], h[8]],
];
    setH(homography);
    drawFrame(points, homography);
  };

  // =============================
  // Project Function
  // =============================
  const project = (H, X, Y) => {
    const denom = H[2][0] * X + H[2][1] * Y + H[2][2];
    const x = (H[0][0] * X + H[0][1] * Y + H[0][2]) / denom;
    const y = (H[1][0] * X + H[1][1] * Y + H[1][2]) / denom;
    return [x, y];
  };

  // =============================
  // Draw Full Doubles Court
  // =============================
  const drawCourt = (H) => {
  const ctx = canvasRef.current.getContext("2d");

  ctx.strokeStyle = "lime";
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";

  const projectLine = (x1, y1, x2, y2) => {
    const a = project(H, x1, y1);
    const b = project(H, x2, y2);

    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.stroke();
  };

  const COURT_LENGTH = 23.77;
  const DOUBLES_WIDTH = 10.97;
  const SINGLES_WIDTH = 8.23;
  const NET_Y = 11.885;
  const SERVICE_TOP = 18.29;
const SERVICE_BOTTOM = NET_Y - 6.40; // 5.485
  const singlesOffset = (DOUBLES_WIDTH - SINGLES_WIDTH) / 2; // 1.37

  // =============================
  // 1️⃣ Outer Doubles Boundary
  // =============================
  projectLine(0, 0, DOUBLES_WIDTH, 0); // bottom baseline
  projectLine(DOUBLES_WIDTH, 0, DOUBLES_WIDTH, COURT_LENGTH);
  projectLine(DOUBLES_WIDTH, COURT_LENGTH, 0, COURT_LENGTH);
  projectLine(0, COURT_LENGTH, 0, 0);

  // =============================
  // 2️⃣ Singles Side Lines
  // =============================
  projectLine(singlesOffset, 0, singlesOffset, COURT_LENGTH);
  projectLine(
    DOUBLES_WIDTH - singlesOffset,
    0,
    DOUBLES_WIDTH - singlesOffset,
    COURT_LENGTH
  );

  // =============================
  // 3️⃣ Net
  // =============================
  projectLine(0, NET_Y, DOUBLES_WIDTH, NET_Y);

  // =============================
  // 4️⃣ Service Lines (Top & Bottom)
  // =============================
projectLine(
  singlesOffset,
  SERVICE_TOP,
  DOUBLES_WIDTH - singlesOffset,
  SERVICE_TOP
);

projectLine(
  singlesOffset,
  SERVICE_BOTTOM,
  DOUBLES_WIDTH - singlesOffset,
  SERVICE_BOTTOM
);

  // =============================
  // 5️⃣ Center Service Line
  // =============================
  projectLine(
    DOUBLES_WIDTH / 2,
    SERVICE_BOTTOM,
    DOUBLES_WIDTH / 2,
    SERVICE_TOP
  );

  // =============================
  // 6️⃣ Center Marks on Baselines
  // =============================
  const centerMarkSize = 0.2; // 20cm

  // Top center mark
  projectLine(
    DOUBLES_WIDTH / 2,
    COURT_LENGTH,
    DOUBLES_WIDTH / 2,
    COURT_LENGTH - centerMarkSize
  );

  // Bottom center mark
  projectLine(
    DOUBLES_WIDTH / 2,
    0,
    DOUBLES_WIDTH / 2,
    centerMarkSize
  );
};
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        Full Tennis Court Projection
      </h2>

      <input type="file" accept="video/*" onChange={handleUpload} />

<div className="flex flex-col sm:flex-row gap-3 mt-4">  <select
    value={selectedPoint}
    onChange={(e) => setSelectedPoint(e.target.value)}
    className="border p-2"
  >
    {Object.keys(REAL_COURT).map((p) => (
      <option key={p}>{p}</option>
    ))}
  </select>

  <button
    onClick={computeHomography}
className="w-full sm:w-auto bg-green-600 text-white px-4 py-3 rounded"  >
    Create Full Court
  </button>

  <button
    onClick={() => {
      const updated = { ...points };
      delete updated[selectedPoint];
      setPoints(updated);
      drawFrame(updated, H);
    }}
    className="bg-red-600 text-white px-4 py-2"
  >
    Remove Selected
  </button>

  <button
    onClick={() => {
      setPoints({});
      setH(null);
      drawFrame({}, null);
    }}
    className="bg-gray-700 text-white px-4 py-2"
  >
    Clear All
  </button>
</div>

<video
  ref={videoRef}
  playsInline
  className="absolute opacity-0 pointer-events-none"
/>
      <div className="border overflow-auto max-h-[80vh] mt-4">
      <canvas
  ref={canvasRef}
  onClick={handleClick}
  className="cursor-crosshair w-full touch-none"
/>
<button
  onClick={handleToggle}
  className="mt-4 bg-amber-500 hover:bg-amber-600 text-black font-semibold px-6 py-2 rounded-xl shadow-md transition"
>
  {isPlaying ? "⏸ Pause" : "▶ Play"}
</button>
      </div>
    </div>
  );
}