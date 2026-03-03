import React, { useRef, useState, useEffect } from "react";
import { Pose } from "@mediapipe/pose";

export default function VideoPoseSingleScreen() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const rafRef = useRef(null);
const VISIBILITY_THRESHOLD = 0.3;
const [isPlaying, setIsPlaying] = useState(false);
  const [videoURL, setVideoURL] = useState(null);
  const [playbackRate, setPlaybackRate] = useState(1);
const [isRecordingLM, setIsRecordingLM] = useState(false);
const [recordedLandmarks, setRecordedLandmarks] = useState(null);
const recordedFramesRef = useRef([]);
const isRecordingRef = useRef(false);
const startTimeRef = useRef(null);
const [videoOpacity, setVideoOpacity] = useState(0.5);
const playbackCanvasRef = useRef(null);
const playbackRAFRef = useRef(null);
  // ---------- Upload ----------
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setVideoURL(url);
  };
  useEffect(() => {
  const video = videoRef.current;
  const canvas = canvasRef.current;

  const syncCanvasSize = () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  };

  video?.addEventListener("loadedmetadata", syncCanvasSize);

  return () => {
    video?.removeEventListener("loadedmetadata", syncCanvasSize);
  };
}, []);
useEffect(() => {
  isRecordingRef.current = isRecordingLM;
}, [isRecordingLM]);
  // ---------- Initialize Pose ----------
  useEffect(() => {
    poseRef.current = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

   poseRef.current.setOptions({
  modelComplexity: 2,   // better accuracy
  smoothLandmarks: true,
  enableSegmentation: false,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7,
});

    poseRef.current.onResults(onResults);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);
  const handlePlayPause = () => {
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
useEffect(() => {
  const video = videoRef.current;
  if (!video) return;

  const onPlay = () => setIsPlaying(true);
  const onPause = () => setIsPlaying(false);

  video.addEventListener("play", onPlay);
  video.addEventListener("pause", onPause);

  return () => {
    video.removeEventListener("play", onPlay);
    video.removeEventListener("pause", onPause);
  };
}, [videoURL]);
  // ---------- Process Video Frames ----------
useEffect(() => {
  if (!recordedLandmarks || recordedLandmarks.length === 0) return;

  const canvas = playbackCanvasRef.current;
  const ctx = canvas.getContext("2d");

  canvas.width = canvasRef.current.width;
  canvas.height = canvasRef.current.height;

  let frameIndex = 0;
  let startTime = performance.now();

  const play = (now) => {
    if (frameIndex >= recordedLandmarks.length) return;

    const elapsed = (now - startTime) / 1000; // seconds
    const frame = recordedLandmarks[frameIndex];

    if (elapsed >= frame.time) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const lm = frame.landmarks.map(p => ({
        x: p[0],
        y: p[1],
        z: p[2],
        visibility: p[3]
      }));

      drawLandmarks(ctx, { poseLandmarks: lm });

      frameIndex++;
    }

    playbackRAFRef.current = requestAnimationFrame(play);
  };

  playbackRAFRef.current = requestAnimationFrame(play);

  return () => cancelAnimationFrame(playbackRAFRef.current);
}, [recordedLandmarks]);
  const startLandmarkRecording = () => {
  recordedFramesRef.current = [];
  setRecordedLandmarks(null);
  setIsRecordingLM(true);
};

const stopLandmarkRecording = () => {
  setIsRecordingLM(false);
  setRecordedLandmarks([...recordedFramesRef.current]);
};
  useEffect(() => {
    if (!videoURL || !videoRef.current) return;

    const video = videoRef.current;

    const processFrame = async () => {
      if (video.paused || video.ended) return;

      await poseRef.current.send({ image: video });
      rafRef.current = requestAnimationFrame(processFrame);
    };

    video.onplay = () => {
      video.playbackRate = playbackRate;
      processFrame();
    };
  }, [videoURL, playbackRate]);


  // ---------- Drawing ----------
  const onResults = (results) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = videoRef.current;

    if (!video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;


    if (!results.poseLandmarks) return;
if (isRecordingRef.current) {
  if (!startTimeRef.current) {
    startTimeRef.current = videoRef.current.currentTime;
  }

  const frame = {
    time: videoRef.current.currentTime - startTimeRef.current,
    landmarks: results.poseLandmarks.map(lm => ([
      lm.x,
      lm.y,
      lm.z,
      lm.visibility ?? 1
    ]))
  };

  recordedFramesRef.current.push(frame);
}
    if (ctx) drawLandmarks(ctx, results);

  };
function drawLandmarks(ctx, results) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();

  // Mirror horizontally
  // ctx.translate(ctx.canvas.width, 0);
  // ctx.scale(-1, 1);

  ctx.globalAlpha = 0.9;

  const lm = results?.poseLandmarks;
  if (!lm || lm.length < 33) {
    ctx.restore();
    return;
  }

  // Convert relative coordinates to canvas coords
  const P = (i) => ({
    x: lm[i].x * ctx.canvas.width,
    y: lm[i].y * ctx.canvas.height
  });

  const drawLine = (i, j, color = "rgba(0,255,0,0.9)") => {
    ctx.beginPath();
    const a = P(i);
    const b = P(j);
       const lmchecka = lm[i];
       const lmcheckb = lm[j];
  if (!lmchecka || !lmcheckb) return;

    // 🚫 Skip if not visible
  if (
    lmchecka.visibility < VISIBILITY_THRESHOLD ||
    lmcheckb.visibility < VISIBILITY_THRESHOLD
  ) return;  // 🚫 Skip if either point invisible
      ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
    ctx.stroke();
  };
// Use Set for fast lookup
const LEFT_SET = new Set([
  13,      // left elbow
  25, 27   // left knee, ankle
]);

const RIGHT_SET = new Set([
  14,      // right elbow
  26, 28   // right knee, ankle
]);
const CENTER_SET = new Set([
  11, 12,   // shoulders
  23, 24    // hips
]);
const drawPoint = (i, r = 6) => {
   const lmcheck = lm[i];

    // 🚫 Skip if not visible
    if (!lmcheck || lmcheck.visibility < VISIBILITY_THRESHOLD) return;
  const p = P(i);

  let color = "white";

  if (LEFT_SET.has(i)) {
    color = "rgba(255, 0, 242, 0.9)";
  } 
  else if (RIGHT_SET.has(i)) {
    color = "rgba(255, 238, 0, 0.9)";
  } 
  else if (CENTER_SET.has(i)) {
    color = "rgba(0, 225, 255, 0.9)";
  }

  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
};

  // -----------------------------
  // FULL BODY CONNECTIONS
  // -----------------------------
  const COLORS = {
  LEFT: "rgba(255, 0, 242, 0.9)",      // Red
  RIGHT: "rgba(255, 238, 0, 0.9)",     // Blue
  CENTER: "rgba(0, 225, 255, 0.9)"     // Green
};
const LEFT_CONNECTIONS = [
  [11, 13], [13, 15],       // left arm
  [23, 25], [25, 27],       // left leg
  [11, 23]                  // left torso
];

const RIGHT_CONNECTIONS = [
  [12, 14], [14, 16],       // right arm
  [24, 26], [26, 28],       // right leg
  [12, 24]                  // right torso
];

const CENTER_CONNECTIONS = [
  [11, 12],                 // shoulders
  [23, 24],                 // hips
  [0, 1], [1, 2], [2, 3], [3, 7]  // face / nose bridge
];
LEFT_CONNECTIONS.forEach(([i, j]) =>
  drawLine(i, j, COLORS.LEFT)
);

RIGHT_CONNECTIONS.forEach(([i, j]) =>
  drawLine(i, j, COLORS.RIGHT)
);

CENTER_CONNECTIONS.forEach(([i, j]) =>
  drawLine(i, j, COLORS.CENTER)
);
  // const LEFT = {
  //   SHOULDER: 11,
  //   ELBOW: 13,
  //   WRIST: 15,
  //   HIP: 23,
  //   KNEE: 25,
  //   ANKLE: 27,
  //   HEEL: 29,
  //   FOOT: 31
  // };

  // const RIGHT = {
  //   SHOULDER: 12,
  //   ELBOW: 14,
  //   WRIST: 16,
  //   HIP: 24,
  //   KNEE: 26,
  //   ANKLE: 28,
  //   HEEL: 30,
  //   FOOT: 32
  // };

  // // Torso
  // drawLine(LEFT.SHOULDER, RIGHT.SHOULDER);
  // drawLine(LEFT.HIP, RIGHT.HIP);
  // drawLine(LEFT.SHOULDER, LEFT.HIP);
  // drawLine(RIGHT.SHOULDER, RIGHT.HIP);

  // // Left Arm
  // drawLine(LEFT.SHOULDER, LEFT.ELBOW);
  // drawLine(LEFT.ELBOW, LEFT.WRIST);

  // // Right Arm
  // drawLine(RIGHT.SHOULDER, RIGHT.ELBOW);
  // drawLine(RIGHT.ELBOW, RIGHT.WRIST);

  // // Left Leg
  // drawLine(LEFT.HIP, LEFT.KNEE);
  // drawLine(LEFT.KNEE, LEFT.ANKLE);
  // drawLine(LEFT.ANKLE, LEFT.HEEL);
  // drawLine(LEFT.HEEL, LEFT.FOOT);

  // // Right Leg
  // drawLine(RIGHT.HIP, RIGHT.KNEE);
  // drawLine(RIGHT.KNEE, RIGHT.ANKLE);
  // drawLine(RIGHT.ANKLE, RIGHT.HEEL);
  // drawLine(RIGHT.HEEL, RIGHT.FOOT);

  // Draw Points (all 33)
  for (let i = 0; i < lm.length; i++) {
    drawPoint(i);
  }

  ctx.restore();
}


  // ---------- Speed Change ----------
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center gap-4 p-6">
      {/* Upload */}
      <input
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
        className="bg-gray-800 border border-gray-600 p-2 rounded"
      />

      {/* Show only after upload */}
      {videoURL && (
        <>
          {/* Speed */}
          <div className="flex items-center gap-2">
            <span className="text-sm">Speed:</span>
            <select
              value={playbackRate}
              onChange={(e) => setPlaybackRate(Number(e.target.value))}
              className="bg-gray-800 border border-gray-600 p-1 rounded"
            >
              <option value={0.1}>0.1x</option>
              <option value={0.2}>0.2x</option>
              <option value={0.3}>0.3x</option>
              <option value={0.5}>0.5x</option>
              <option value={0.7}>0.8x</option>
              <option value={1}>1x</option>
            </select>
          </div>

          {/* Video + Canvas Overlay */}
        <div className="relative w-full max-w-xl">
 <video
  ref={videoRef}
  src={videoURL}
  playsInline
  muted
  className="w-full rounded-lg bg-black transition-opacity duration-200"
  style={{ opacity: 0.5 }} // initial default
/>
  <canvas
    ref={canvasRef}
    className="absolute top-0 left-0 w-full h-full pointer-events-none"
  />
{/* Opacity Slider */}
<div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-3 py-2 rounded-xl text-white text-xs flex items-center gap-2 shadow-lg">
  <span className="opacity-80">Video</span>
  <input
    type="range"
    min="0"
    max="100"
    defaultValue="50"
    onChange={(e) => {
      videoRef.current.style.opacity = e.target.value / 100;
    }}
    className="w-24 accent-green-400 cursor-pointer"
  />
</div>
  {/* Play / Pause Overlay Button */}
  <button
    onClick={handlePlayPause}
    className="absolute bottom-3 left-3 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-lg text-sm"
  >
    {isPlaying ? "Pause" : "Play"}
  </button>
</div>
{/* <div className="flex gap-3 mt-3">
  {!isRecordingLM ? (
    <button
      onClick={startLandmarkRecording}
      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
    >
      Record Landmarks
    </button>
  ) : (
    <button
      onClick={stopLandmarkRecording}
      className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded"
    >
      Stop Recording
    </button>
  )}
</div>
{recordedLandmarks && (
  <div className="w-full max-w-xl mt-6">
    <h3 className="text-sm mb-2 text-gray-300">
      Landmark Playback
    </h3>

    <canvas
      ref={playbackCanvasRef}
      className="w-full bg-black rounded-lg"
    />
  </div>
)} */}
        </>
      )}
    </div>
  );
}