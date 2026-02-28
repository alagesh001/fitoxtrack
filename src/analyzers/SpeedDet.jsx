import React, { useRef, useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Navigate } from "react-router-dom";

export default function ServeSpeedTool() {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [fps, setFps] = useState(30);
  const [customFps, setCustomFps] = useState("");

  const [serveFrom, setServeFrom] = useState("center");
  const [landAt, setLandAt] = useState("center");
const [selectedRate, setSelectedRate] = useState(1);
  const [manualDistance, setManualDistance] = useState("");
  const [impactFrame, setImpactFrame] = useState(null);
  const [crossFrame, setCrossFrame] = useState(null);
  const [speed, setSpeed] = useState(null);
const [isPlaying, setIsPlaying] = useState(false);
const [isMuted, setIsMuted] = useState(true);
const [zoom, setZoom] = useState(1);
const [position, setPosition] = useState({ x: 0, y: 0 });
    const navigate = useNavigate();
useEffect(() => {
  window.scrollTo({
    top: 0,
    behavior: "smooth", // remove this if you want instant scroll
  });
}, []);
useEffect(() => {
  const video = videoRef.current;
  if (!video) return;

  const handleEnded = () => {
    setIsPlaying(false);
  };

  video.addEventListener("ended", handleEnded);

  return () => {
    video.removeEventListener("ended", handleEnded);
  };
}, []);
const lastTouchDistance = useRef(null);
const lastTouchPosition = useRef(null);
useEffect(() => {
  if (fps) {
    setImpactFrame(null);
    setCrossFrame(null);
    setSpeed(null);
    return;
  }

  

}, [fps]);
const togglePlay = () => {
  const video = videoRef.current;
  if (!video) return;

  if (video.paused) {
    video.play();
    setIsPlaying(true);
  } else {
    video.pause();
    setIsPlaying(false);
  }
};
const toggleMute = () => {
  const video = videoRef.current;
  if (!video) return;

  video.muted = !video.muted;
  setIsMuted(video.muted);
};
const zoomIn = () => setZoom((z) => Math.min(z + 0.2, 4));
const zoomOut = () => setZoom((z) => Math.max(z - 0.2, 1));
const resetZoom = () => {
  setZoom(1);
  setPosition({ x: 0, y: 0 });
};
const handleTouchStart = (e) => {
  if (e.touches.length === 2) {
    // pinch start
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    lastTouchDistance.current = Math.sqrt(dx * dx + dy * dy);
  } else if (e.touches.length === 1 && zoom > 1) {
    lastTouchPosition.current = {
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y
    };
  }
};

const handleTouchMove = (e) => {
  if (e.touches.length === 2) {
    // pinch zoom
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (lastTouchDistance.current) {
      const scaleChange = distance / lastTouchDistance.current;
      setZoom((z) => Math.min(Math.max(z * scaleChange, 1), 4));
    }

    lastTouchDistance.current = distance;
  }

  if (e.touches.length === 1 && zoom > 1 && lastTouchPosition.current) {
    setPosition({
      x: e.touches[0].clientX - lastTouchPosition.current.x,
      y: e.touches[0].clientY - lastTouchPosition.current.y
    });
  }
};

const handleTouchEnd = () => {
  lastTouchDistance.current = null;
  lastTouchPosition.current = null;
};
  const BASELINE_TO_NET = 11.89;
  const HALF_WIDTH = 4.115;

  const positionMap = {
    center: 0,
    middle: HALF_WIDTH / 2,
    corner: HALF_WIDTH
  };
const seekBy = (seconds) => {
  const video = videoRef.current;
  if (!video) return;

  video.currentTime = Math.max(
    0,
    Math.min(video.duration, video.currentTime + seconds)
  );
};
  const getCurrentFrame = () => {
    return Math.floor(videoRef.current.currentTime * fps);
  };

  const markImpact = () => setImpactFrame(getCurrentFrame());
  const markNetCross = () => setCrossFrame(getCurrentFrame());

const calculateDistance = () => {
  if (manualDistance) return Number(manualDistance);

  const from = positionMap["center"];
  const to = positionMap["middle"];

  const fullLateral = Math.abs(from - to);

  const BASELINE_TO_NET = 11.885;
  const BASELINE_TO_SERVICE = 18.29;

  const lateralAtNet =
    (BASELINE_TO_NET / BASELINE_TO_SERVICE) * fullLateral;

  return Math.sqrt(
    BASELINE_TO_NET ** 2 + lateralAtNet ** 2
  );
};

  const calculateSpeed = () => {
    if (impactFrame == null || crossFrame == null) return;

    if (crossFrame <= impactFrame) {
      alert("Net cross must be after impact.");
      return;
    }

    const time = (crossFrame - impactFrame) / fps;
    const distance = calculateDistance();

    const speedMps = distance / time;
    const speedKmh = speedMps * 3.6;

    setSpeed(speedKmh.toFixed(2));
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      videoRef.current.src = URL.createObjectURL(file);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
  {/* Back Button */}
  <button
     onClick={() => {
    if (window.history.length > 1) {
      navigate(-1);   // Go back
    } else {
      navigate("/ai-hub");  // Fallback
    }
  }}
    className="p-3 rounded-full 
               bg-gray-800 hover:bg-gray-700
               text-white shadow-md hover:shadow-lg
               transition duration-300 hover:scale-105"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  </button>
  <h2 className="flex items-center mb-5 mt-2 gap-2 text-xl sm:text-2xl font-bold text-white">
    <span className="bg-blue-600 text-white text-sm px-2 py-1 rounded-md">TennisX </span>
    Serve Speed Calculator
  </h2>
  <div className="bg-white/10 border border-blue-500/30 rounded-xl p-4 text-sm text-gray-200 mb-6">
  <p className="font-semibold text-blue-400 mb-2">Recording Tips:</p>
  <ul className="space-y-1 list-disc list-inside">
    <li>🎥 Record from the side to clearly detect when the ball crosses the net.</li>
    <li>⚡ Use higher FPS (60fps or more) for better speed accuracy.</li>
    <li>💡 Record in a bright place so the ball is clearly visible.</li>
  </ul>
</div>
 <div>
      {/* Hidden file input */}
      <input
        type="file"
        accept="video/*"
        ref={fileInputRef}
        onChange={handleUpload}
        className="hidden"
      />

      {/* Upload Button */}
      <button
        onClick={() => fileInputRef.current.click()}
        className="px-6 py-3 bg-blue-600 text-white rounded-xl"
      >
        Upload Video
      </button>

    </div>
<div className="relative overflow-hidden rounded-xl mt-4 bg-black">
  <div
    className="transition-transform duration-150"
    style={{
      transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`
    }}
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
  >
    <video
      ref={videoRef}
      className="w-full"
      controls={false}
      playsInline
       muted={isMuted}
    />
  </div>
</div>
<div className="mt-4 space-y-3">

  {/* Row 1 : Playback Controls */}
 <div className="flex gap-3">
  {/* Rewind Button */}
  <button
    onClick={() => seekBy(-0.02)}
    className="flex items-center justify-center p-3  rounded-xl text-white hover:bg-gray-600 active:bg-gray-700 transition-colors"
    aria-label="Rewind 5 seconds"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l-7-7 7-7M19 19l-7-7 7-7" />
    </svg>
  </button>

  {/* Play / Pause Button */}
  <button
    onClick={togglePlay}
    className="flex-1 p-3 bg-green-400 rounded-xl text-white font-bold hover:bg-green-500 active:bg-green-600 transition-colors text-2xl"
    aria-label={isPlaying ? "Pause" : "Play"}
  >
    {isPlaying ? "| |" : "▶"}
  </button>

  {/* Forward Button */}
  <button
    onClick={() => seekBy(0.02)}
    className="flex items-center justify-center p-3  rounded-xl text-white hover:bg-gray-600 active:bg-gray-700 transition-colors"
    aria-label="Forward 5 seconds"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5l7 7-7 7M5 5l7 7-7 7" />
    </svg>
  </button>
</div>

  {/* Row 2 : Audio + Zoom Controls */}
  <div className="flex gap-3">
    <button
      onClick={toggleMute}
      className="flex-1 py-3 bg-gray-500 rounded-xl text-white"
    >
      {isMuted ? "🔇" : "🔊"}
    </button>

    {/* Zoom In */}
<button
  onClick={zoomIn}
  className="flex items-center justify-center gap-2 flex-1 py-3 bg-slate-600 rounded-xl text-white font-semibold hover:bg-slate-700 active:bg-slate-800 transition-colors"
  aria-label="Zoom In"
>
  {/* Magnifier + */}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <circle cx="11" cy="11" r="7" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="11" y1="8" x2="11" y2="14" strokeLinecap="round" />
    <line x1="8" y1="11" x2="14" y2="11" strokeLinecap="round" />
    <line x1="16.65" y1="16.65" x2="21" y2="21" strokeLinecap="round" />
  </svg>
  
</button>

{/* Zoom Out */}
<button
  onClick={zoomOut}
  className="flex items-center justify-center gap-2 flex-1 py-3 bg-slate-600 rounded-xl text-white font-semibold hover:bg-slate-700 active:bg-slate-800 transition-colors"
  aria-label="Zoom Out"
>
  {/* Magnifier - */}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <circle cx="11" cy="11" r="7" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="8" y1="11" x2="14" y2="11" strokeLinecap="round" />
    <line x1="16.65" y1="16.65" x2="21" y2="21" strokeLinecap="round" />
  </svg>

</button>

 <button
  onClick={resetZoom}
  className="flex-1 py-3 rounded-xl font-semibold
  bg-gray-500 text-white
  transition-all duration-200
  
  active:scale-95 active:bg-black"
>
  Reset
</button>
  </div>

</div>
        {/* Slow Motion */}
     <div className="flex gap-3 mt-3">
  {[1, 0.5, 0.25, 0.1].map((rate) => (
    <button
      key={rate}
      onClick={() => {
        videoRef.current.playbackRate = rate;
        setSelectedRate(rate);
      }}
      className={`flex-1 py-2 rounded-lg border transition-all duration-200
        ${
          selectedRate === rate
            ? "border-white text-white"
            : "border-gray-600 text-gray-400"
        }`}
    >
      {rate}x
    </button>
  ))}
</div>

        {/* Mark Buttons */}
<div className="flex gap-4 mt-4">
  <button
    onClick={markImpact}
    className={`flex items-center justify-center gap-2 p-3 rounded-xl 
    transition-all duration-200 active:scale-95
    ${
      impactFrame !== null
        ? "bg-green-600 text-white ring-2 font-bold ring-green-400 animate-pulse-once"
        : "border-2 border-green-600 font-bold  text-white-600 bg-transparent hover:bg-green-50 active:bg-green-100"
    }`}
  >
    Mark Racquet Touch
    {impactFrame !== null && <span className="text-white font-bold">✓</span>}
  </button>

  <button
    onClick={markNetCross}
    className={`flex items-center justify-center gap-2 p-3 rounded-xl 
    transition-all duration-200 active:scale-95
    ${
      crossFrame !== null
        ? "bg-green-600 font-bold text-white ring-2 ring-green-400 animate-pulse-once"
        : "border-2 border-green-600 font-bold  text-white-600 bg-transparent hover:bg-green-50 active:bg-green-100"
    }`}
  >
    Mark Net Cross
    {crossFrame !== null && <span className="text-white font-bold">✓</span>}
  </button>
</div>

        <div style={styles.infoBox}>
          <p>Impact Frame: {impactFrame ?? "-"}</p>
          <p>Net Cross Frame: {crossFrame ?? "-"}</p>
        </div>

        {/* FPS */}
        <div style={styles.sectionTitle}>FPS (Find in Video Properties)</div>
        <div style={styles.grid4}>
          {[30, 60, 120, 240].map((value) => (
            <button
              key={value}
              onClick={() => setFps(value)}
              style={{
                ...styles.smallBtn,
                background: fps === value ? "#22c55e" : "#334155"
              }}
            >
              {value}
            </button>
          ))}
        </div>

        {/* <div style={styles.row}>
          <input
            type="number"
            placeholder="Custom FPS"
            value={customFps}
            onChange={(e) => setCustomFps(e.target.value)}
            style={styles.input}
          />
          <button
            onClick={() => customFps && setFps(Number(customFps))}
            style={styles.smallBtn}
          >
            Set
          </button>
        </div> */}

        {/* Serve Position */}
        {/* <div style={styles.sectionTitle}>Serve From</div>
        <div style={styles.grid3}>
          {["center", "middle", "corner"].map((pos) => (
            <button
              key={pos}
              onClick={() => setServeFrom(pos)}
              style={{
                ...styles.smallBtn,
                background: serveFrom === pos ? "#3b82f6" : "#334155"
              }}
            >
              {pos}
            </button>
          ))}
        </div> */}

        {/* <div style={styles.sectionTitle}>Ball Lands At</div>
        <div style={styles.grid3}>
          {["center", "middle", "corner"].map((pos) => (
            <button
              key={pos}
              onClick={() => setLandAt(pos)}
              style={{
                ...styles.smallBtn,
                background: landAt === pos ? "#f59e0b" : "#334155"
              }}
            >
              {pos}
            </button>
          ))}
        </div> */}

        {/* Manual Distance Override */}
        {/* <div style={styles.row}>
          <input
            type="number"
            placeholder="Manual Distance (m)"
            value={manualDistance}
            onChange={(e) => setManualDistance(e.target.value)}
            style={styles.input}
          />
        </div> */}

       <button
  onClick={calculateSpeed}
  className="w-full py-3 mt-6 rounded-xl font-semibold
  text-white shadow-md
  transition-all duration-200
  hover:shadow-lg active:scale-95"
  style={{ backgroundColor: "#f59e0b" }}
>
  Calculate Speed
</button>

        {speed && (
          <div style={styles.result}>
            {speed} km/h
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0f172a",
    display: "flex",
    justifyContent: "center",
    padding: 15,
    fontFamily: "sans-serif",
    color: "white"
  },
  card: {
    background: "#1e293b",
    padding: 20,
    borderRadius: 16,
    width: "100%",
    maxWidth: 480
  },
  title: { textAlign: "center", marginBottom: 15 },
  video: { width: "100%", borderRadius: 12, marginTop: 15 },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 8,
    marginTop: 15
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
    marginTop: 10
  },
  row: {
    display: "flex",
    gap: 10,
    marginTop: 15,
    alignItems: "center"
  },
  primaryBtn: {
    width: "100%",
    padding: 12,
    marginTop: 15,
    background: "#22c55e",
    border: "none",
    borderRadius: 8,
    color: "white",
    fontWeight: "bold"
  },
  secondaryBtn: {
    width: "100%",
    padding: 12,
    marginTop: 10,
    background: "#3b82f6",
    border: "none",
    borderRadius: 8,
    color: "white",
    fontWeight: "bold"
  },
  calculateBtn: {
    width: "100%",
    padding: 14,
    marginTop: 20,
    background: "#f59e0b",
    border: "none",
    borderRadius: 8,
    color: "black",
    fontWeight: "bold"
  },
  smallBtn: {
    padding: 8,
    background: "#334155",
    border: "none",
    borderRadius: 6,
    color: "white",
    fontSize: 12
  },
  input: {
    padding: 6,
    borderRadius: 6,
    border: "none",
    width: "100%"
  },
  infoBox: {
    marginTop: 15,
    background: "#0f172a",
    padding: 10,
    borderRadius: 8,
    fontSize: 14
  },
  sectionTitle: {
    marginTop: 20,
    fontWeight: "bold",
    fontSize: 14
  },
  result: {
    marginTop: 25,
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#22c55e"
  }
};