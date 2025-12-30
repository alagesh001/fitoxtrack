import React, { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { useLocation,useNavigate } from "react-router-dom";

const LiveSkeletonTracker = () => {
    const location = useLocation();
const { facing = "user" } = location.state || {}; // ✅ DIRECT READ
const [facingMode, setFacingMode] = useState(facing);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const playbackCanvasRef = useRef(null);
  const playbackCanvasClientRef = useRef(null);
const playbackIntervalRef = useRef(null);
const playbackIndexRef = useRef(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const recordedFramesRef = useRef([]);
    const recordedFramesClientRef = useRef([]);
const isRecordingRef = useRef(false);
const trainerIndexRef = useRef(0);
const clientIndexRef = useRef(0);
  const poseRef = useRef(null);
  const [accuracyLevel, setAccuracyLevel] = useState("medium");
  const storedGym = JSON.parse(localStorage.getItem("selectedGym") || "{}");
  const gymid = storedGym?.GymId;
  const [showAuthBlock, setShowAuthBlock] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
    // Check if navigation came from button click
    if (!location.state?.fromButton) {
      // Redirect or hide
    //  navigate("/", { replace: true }); // or just return null
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
const poseAccuracyPresets = {
  low: {
    modelComplexity: 0,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  },
  medium: {
    modelComplexity: 1,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6,
  },
  high: {
    modelComplexity: 2,
    minDetectionConfidence: 0.75,
    minTrackingConfidence: 0.75,
  },
};

const trainerIntervalRef = useRef(null);
const clientIntervalRef = useRef(null);

const [trainerPlaying, setTrainerPlaying] = useState(false);
const [trainerPaused, setTrainerPaused] = useState(false);
  const [running, setRunning] = useState(false);

const [clientPlaying, setClientPlaying] = useState(false);
const [clientPaused, setClientPaused] = useState(false);
const [userRole, setUserRole] = useState("trainer");
const userRoleRef = useRef(userRole);
const [cameraFacing, setCameraFacing] = useState("user"); // "user" = front, "environment" = back
const cameraRef = useRef(null);
useEffect(() => {
  userRoleRef.current = userRole;
}, [userRole]);
const hasMountedRef = useRef(false);

useEffect(() => {
  hasMountedRef.current = true;

  return () => {
    if (!hasMountedRef.current) return;

    // Stop camera stream
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    // Reset states
    setClientPlaying(false);
    setClientPaused(false);
    setTrainerPlaying(false);
    setTrainerPaused(false);

    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

   
  };
}, []);

function applyAccuracyLevel(level) {
  const settings = poseAccuracyPresets[level] || poseAccuracyPresets.medium;

  poseRef.current.setOptions({
    selfieMode: facingMode === "user",
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: false,

    modelComplexity: settings.modelComplexity,
    minDetectionConfidence: settings.minDetectionConfidence,
    minTrackingConfidence: settings.minTrackingConfidence,
  });
}

useEffect(() => {
  isRecordingRef.current = isRecording;
}, [isRecording]);
useEffect(() => {
  if (!videoRef.current) return;

  // Initialize Pose only once
  if (!poseRef.current) {
    poseRef.current = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    poseRef.current.setOptions({
      selfieMode: facingMode === "user",
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    poseRef.current.onResults((results) => {
      if (!results.poseLandmarks) return;
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) drawLandmarks(ctx, results);

      if (isRecordingRef.current) {
        const clonedLandmarks = results.poseLandmarks.map((lm) => ({ ...lm }));
        const role = userRoleRef.current;
        if (role === "trainer") recordedFramesRef.current.push(clonedLandmarks);
        if (role === "client") recordedFramesClientRef.current.push(clonedLandmarks);
      }
    });
  }

  // Stop previous camera stream
  cameraRef.current?.stop?.();

  // Start new camera
  cameraRef.current = new Camera(videoRef.current, {
    onFrame: async () => {
      await poseRef.current.send({ image: videoRef.current });
    },
    facingMode: facingMode,
    width: 1280,
    height: 720,
  });

  cameraRef.current.start().then(() => setRunning(true)).catch((err) => {
    console.error("Camera start failed", err);
    setRunning(false);
  });

  // Cleanup only on unmount
  return () => {
    setRunning(false);
    try {
      cameraRef.current?.stop?.();
      // don't close poseRef.current
    } catch (err) {
      console.warn("Error during cleanup", err);
    }
    cameraRef.current = null;
  };
}, [facingMode]);

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
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
    ctx.stroke();
  };

  const drawPoint = (i, color = "rgba(255,0,0,0.9)", r = 6) => {
    const p = P(i);
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  };

  // -----------------------------
  // FULL BODY CONNECTIONS
  // -----------------------------

  const LEFT = {
    SHOULDER: 11,
    ELBOW: 13,
    WRIST: 15,
    HIP: 23,
    KNEE: 25,
    ANKLE: 27,
    HEEL: 29,
    FOOT: 31
  };

  const RIGHT = {
    SHOULDER: 12,
    ELBOW: 14,
    WRIST: 16,
    HIP: 24,
    KNEE: 26,
    ANKLE: 28,
    HEEL: 30,
    FOOT: 32
  };

  // Torso
  drawLine(LEFT.SHOULDER, RIGHT.SHOULDER);
  drawLine(LEFT.HIP, RIGHT.HIP);
  drawLine(LEFT.SHOULDER, LEFT.HIP);
  drawLine(RIGHT.SHOULDER, RIGHT.HIP);

  // Left Arm
  drawLine(LEFT.SHOULDER, LEFT.ELBOW);
  drawLine(LEFT.ELBOW, LEFT.WRIST);

  // Right Arm
  drawLine(RIGHT.SHOULDER, RIGHT.ELBOW);
  drawLine(RIGHT.ELBOW, RIGHT.WRIST);

  // Left Leg
  drawLine(LEFT.HIP, LEFT.KNEE);
  drawLine(LEFT.KNEE, LEFT.ANKLE);
  drawLine(LEFT.ANKLE, LEFT.HEEL);
  drawLine(LEFT.HEEL, LEFT.FOOT);

  // Right Leg
  drawLine(RIGHT.HIP, RIGHT.KNEE);
  drawLine(RIGHT.KNEE, RIGHT.ANKLE);
  drawLine(RIGHT.ANKLE, RIGHT.HEEL);
  drawLine(RIGHT.HEEL, RIGHT.FOOT);

  // Draw Points (all 33)
  for (let i = 0; i < lm.length; i++) {
    drawPoint(i);
  }

  ctx.restore();
}


  const startRecording = () => {
       if (userRole === "trainer")
       recordedFramesRef.current = [];
     if (userRole === "client")
        recordedFramesClientRef.current = [];
             
    
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };


const playTrainer = () => {
  const frames = recordedFramesRef.current;
  if (!frames.length) return;

  if (!trainerPaused) trainerIndexRef.current = 0;

  setTrainerPlaying(true);
  setTrainerPaused(false);

  trainerIntervalRef.current = setInterval(() => {
    const i = trainerIndexRef.current;

    if (frames[i]) {
      drawPlayback(frames[i], playbackCanvasRef.current);
      trainerIndexRef.current++;
    }

    if (trainerIndexRef.current >= frames.length) stopTrainer();
  }, 60);
};

const pauseTrainer = () => {
  clearInterval(trainerIntervalRef.current);
  setTrainerPlaying(false);
  setTrainerPaused(true);
};

const stopTrainer = () => {
  clearInterval(trainerIntervalRef.current);
  setTrainerPlaying(false);
  setTrainerPaused(false);
  trainerIndexRef.current = 0;
};
const playClient = () => {
  const frames = recordedFramesClientRef.current;
  if (!frames.length) return;

  if (!clientPaused) clientIndexRef.current = 0;

  setClientPlaying(true);
  setClientPaused(false);

  clientIntervalRef.current = setInterval(() => {
    const i = clientIndexRef.current;

    if (frames[i]) {
      drawPlayback(frames[i], playbackCanvasClientRef.current);
      clientIndexRef.current++;
    }

    if (clientIndexRef.current >= frames.length) stopClient();
  }, 60);
};

const pauseClient = () => {
  clearInterval(clientIntervalRef.current);
  setClientPlaying(false);
  setClientPaused(true);
};

const stopClient = () => {
  clearInterval(clientIntervalRef.current);
  setClientPlaying(false);
  setClientPaused(false);
  clientIndexRef.current = 0;
};


 const drawPlayback = (landmarks, canvas) => {
  if (!landmarks || !canvas) return;

  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  const connections = [
    [11, 13], [13, 15], [12, 14], [14, 16],
    [11, 12], [23, 24], [11, 23], [12, 24],
    [23, 25], [25, 27], [24, 26], [26, 28]
  ];

  ctx.strokeStyle = "#00ff00";
  ctx.lineWidth = 2;

  connections.forEach(([s, e]) => {
    const start = landmarks[s];
    const end = landmarks[e];
    if (start && end) {
      ctx.beginPath();
      ctx.moveTo(start.x * width, start.y * height);
      ctx.lineTo(end.x * width, end.y * height);
      ctx.stroke();
    }
  });

  landmarks.forEach(lm => {
    ctx.beginPath();
    ctx.arc(lm.x * width, lm.y * height, 4, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
  });
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-700 p-4">
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
      <div className="bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-4xl space-y-6">
          <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-white">
    <span className="bg-blue-600 text-white text-sm px-2 py-1 rounded-md">TennisX AI</span>
    Real-Time Form Tracker (Front/Back)
  </h2>
<div className="flex justify-center mt-4">
  <div className="flex rounded-xl overflow-hidden border shadow-sm">

    <button
      onClick={() => setUserRole("trainer")}
      className={`px-6 py-2 font-semibold
        ${userRole === "trainer"
          ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white"
          : "bg-gray-100 text-gray-600"
        }`}
    >
      Trainer
    </button>

    <button
      onClick={() => setUserRole("client")}
      className={`px-6 py-2 font-semibold
        ${userRole === "client"
          ? "bg-gradient-to-r from-green-600 to-emerald-700 text-white"
          : "bg-gray-100 text-gray-600"
        }`}
    >
      Client
    </button>

  </div>
 

</div>
<div className="w-full flex justify-center mt-4">
  <select
    value={accuracyLevel}          // default "medium" from useState
    onChange={(e) => {
      setAccuracyLevel(e.target.value);
      applyAccuracyLevel(e.target.value);
    }}
    className="p-2 rounded-xl border bg-white text-black shadow-sm"
  >
    <option value="low">⚡ Low (Fastest)</option>
    <option value="medium">✨ Medium (Balanced)</option>
    <option value="high">🎯 High (Most Accurate)</option>
  </select>
</div>
        <div className="relative">
<video
    ref={videoRef}
    className="w-full h-auto object-cover"
    playsInline
    muted
    style={{
      transform: facingMode === "user" ? "scaleX(-1)" : "scaleX(1)",
    }}
  /> 
          <canvas
            ref={canvasRef}
    className="absolute inset-0 w-full h-full pointer-events-none"

          />
        </div>

       <div className="flex flex-col gap-6 mt-4">

  {/* ROW 1 — RECORD CONTROLS */}
  <div className="flex gap-4 justify-start">
    <button
      onClick={startRecording}
      disabled={isRecording}
      className={`px-4 py-2 rounded-xl text-white ${
        isRecording ? "bg-gray-400 cursor-not-allowed" : "bg-green-600"
      }`}
    >
      Record
    </button>

    <button
      onClick={stopRecording}
      disabled={!isRecording}
      className={`px-4 py-2 rounded-xl text-white ${
        !isRecording ? "bg-gray-400 cursor-not-allowed" : "bg-red-600"
      }`}
    >
      Stop
    </button>
   {/* <button
  onClick={() => {
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
   // startCamera(newMode);
  }}
  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-800 
             rounded-xl shadow-md border border-gray-200 
             hover:shadow-lg hover:bg-gray-50 active:scale-95 
             transition-all duration-200"
>
  <span className="text-lg">🔄</span>
  <span className="font-medium">Switch Camera</span>
</button> */}

  </div>

  {/* ROW 2 — TRAINER */}
  
  {/* ROW 3 — CLIENT */}
  

</div>


     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

  {/* Trainer */}
  <div className="bg-black rounded-xl p-3 shadow">
    <h3 className="font-semibold mb-2 text-white text-center">Trainer Skeleton</h3>
<div className="p-4 border border-blue-200 rounded-xl">
    <h3 className="font-semibold text-white mb-3">Trainer</h3>

    <div className="flex gap-3">
       <button
      onClick={() => {
        if (!trainerPlaying && !trainerPaused) {
          playTrainer();      // first play
        } else if (trainerPlaying) {
          pauseTrainer();     // pause
        } else {
          playTrainer();      // resume
        }
      }}
      disabled={recordedFramesRef.current.length === 0}
      className={`px-6 py-2 rounded-xl text-white transition ${
        trainerPlaying ? "bg-yellow-500" : "bg-blue-600"
      }`}
    >
      {trainerPlaying ? "⏸ Pause" : trainerPaused ? "▶ Resume" : "▶ Play"}
    </button>
    </div>
  </div>

    <div className="mt-5 w-full aspect-[9/16] relative overflow-hidden border border-blue-200 rounded-lg">
      <canvas
        ref={playbackCanvasRef}
        className="w-full h-full"
      />
    </div>
  </div>

  {/* Client */}
  <div className="bg-black rounded-xl p-3 shadow">
    <h3 className="font-semibold mb-2 text-white text-center">Client Skeleton</h3>
<div className="p-4 border border-green-200 rounded-xl">
    <h3 className="font-semibold text-white mb-3">Client</h3>

    <div className="flex gap-3">
     <button
    onClick={() => {
      if (!clientPlaying && !clientPaused) {
        playClient();     // first play
      } else if (clientPlaying) {
        pauseClient();    // pause
      } else {
        playClient();     // resume
      }
    }}
    disabled={recordedFramesClientRef.current.length === 0}
    className={`px-6 py-2 rounded-xl text-white transition ${
      clientPlaying ? "bg-yellow-500" : "bg-green-600"
    }`}
  >
    {clientPlaying ? "⏸ Pause" : clientPaused ? "▶ Resume" : "▶ Play"}
  </button>
    </div>
  </div>
    <div className="mt-5 w-full aspect-[9/16] border-green-200 relative overflow-hidden border rounded-lg">
      <canvas
        ref={playbackCanvasClientRef}
        className="w-full h-full"
      />
    </div>
  </div>

</div>

        
      </div>
    </div>
  );
};

export default LiveSkeletonTracker;
