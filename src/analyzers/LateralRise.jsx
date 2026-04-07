import React, { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { useLocation,useNavigate } from "react-router-dom";
import { openPoseDB,saveTrainerSession,downloadTrainerSessionsJSON,getAllTrainerSessions,deleteTrainerSessionById,getPoseSessionById,clearTrainerSessions } from "../helper/trackerdb";
import jsonSessions  from "../helper/trainer-sessions.json";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Circle, Trash2 ,Square } from "lucide-react";
import { Navigate } from "react-router-dom";
import { XCircle, ArrowUpRight,X } from "lucide-react";

const LiveSkeletonTracker = () => {
    const location = useLocation();
const { facing = "environment" } = location.state || {}; // ✅ DIRECT READ
const [facingMode, setFacingMode] = useState(facing);
const [trainerReady, setTrainerReady] = useState(false);
const clientFpsRef = useRef(30); // default
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [mobile, setMobile] = useState("");
const [currency, setCurrency] = useState("INR");
const [arcEnabled, setArcEnabled] = useState(false);
const [arcEnabledC, setArcEnabledC] = useState(false);
const [progressUI, setProgressUI] = useState(0);

   const pricing = {
     trial: {
    INR: { display: "₹0" },
    USD: { display: "$0" },
  },
  strokesM: {
      INR: { display: "₹3999", amount: 399900 },
      USD: { display: "$45", amount: 4500 }
    },
    strokesY: {
      INR: { display: "₹14999", amount: 1499900 },
      USD: { display: "$162", amount: 16200 }
    },
    radar: {
      INR: { display: "₹22999", amount: 2299900 },
      USD: { display: "$300", amount: 30000 }
    }
  };
  const [couponApplied, setCouponApplied] = useState(false);
  const coupon = {
    code: "FIRST1000",
    name: "First Time User Offer",
    discount: {
      INR: 1000,
      USD: 12
    }
  };
  //  useEffect(() => {
  
  //   let sessionId = localStorage.getItem("tx_session");
  
  //   if (!sessionId) {
  //     sessionId = crypto.randomUUID();
  //     localStorage.setItem("tx_session", sessionId);
  //   }
  
  //   fetch("https://tennisx.in/api/session", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json"
  //     },
  //     body: JSON.stringify({
  //       isp: "TennisX",
  //       session_id: sessionId,
  //       page: "ai-tracker"
  //     })
  //   }).catch(() => {});
  
  // }, []);
  const [showMetrics, setShowMetrics] = useState(false);
  const showMetricsRef = useRef(false);
  const [metricsUI, setMetricsUI] = useState(false);
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
const [showDialog, setShowDialog] = useState(false);
const [detailshowDialog, setdetailShowDialog] = useState(false);

const [loading, setLoading] = useState(false);
const [showSuccessDialog, setShowSuccessDialog] = useState(false);
const playbackSpeedRef = useRef(1);
const playbackSpeedRefClient = useRef(1);
const showSwingArcRef = useRef(false);
const showSwingArcRefC = useRef(false);

const isLoggedIn = localStorage.getItem("isLoggedInWeb") === "true";
const [selectedPlan, setSelectedPlan] = useState(
  isLoggedIn ? "strokesY" : "trial"
);
  const storedGym = JSON.parse(localStorage.getItem("selectedGym") || "{}");
const today = new Date();
today.setHours(0, 0, 0, 0);

const expiry = new Date(storedGym?.renewaldate);
expiry.setHours(0, 0, 0, 0);
let isExpired = true; // default to expired

if (isLoggedIn && storedGym?.renewaldate) {
  const expiry = new Date(storedGym.renewaldate);
  expiry.setHours(0, 0, 0, 0);

  isExpired = expiry < today;
}
const clientIndexRef = useRef(0);
  const poseRef = useRef(null);
    const [lastSessionId, setLastSessionId] = useState("");
  const [accuracyLevel, setAccuracyLevel] = useState("medium");
  const gymid = storedGym?.GymId;
  const [showAuthBlock, setShowAuthBlock] = useState(false);
    const [showExpireBlock, setShowExpireBlock] = useState(false);

    const navigate = useNavigate();

//    if (!location.state?.fromButton) {
//   return <Navigate to="/ai-hub/" replace />;
// }
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
useEffect(() => {
  window.scrollTo({
    top: 0,
    behavior: "smooth", // remove this if you want instant scroll
  });
}, []);
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
const [trainerSessions, setTrainerSessions] = useState([]);
const [selectedSessionId, setSelectedSessionId] = useState("");

useEffect(() => {
  const loadSessions = async () => {
    const dbSessions = await getAllTrainerSessions();

    const sessionMap = new Map();

    // 1️⃣ add JSON sessions
    jsonSessions.forEach(session => {
      sessionMap.set(session.id, session);
    });

    // 2️⃣ add IndexedDB sessions (overwrite if same id)
    dbSessions.forEach(session => {
      sessionMap.set(session.id, session);
    });

    // 3️⃣ convert back to array
    const mergedSessions = Array.from(sessionMap.values());

    // 4️⃣ sort by createdAt desc
    mergedSessions.sort((a, b) => b.createdAt - a.createdAt);

    setTrainerSessions(mergedSessions);
  };

  loadSessions();
}, []);
useEffect(() => {
  if (!trainerSessions.length) return;

  const defaultSession = trainerSessions.find(
    (s) =>
      s.name === "Service" 
  );

  if (defaultSession) {
    setSelectedSessionId(defaultSession.id);
  }
}, [trainerSessions]);
const [trainerPlaying, setTrainerPlaying] = useState(false);
const [trainerPaused, setTrainerPaused] = useState(false);
  const [running, setRunning] = useState(false);

const [clientPlaying, setClientPlaying] = useState(false);
const [clientPaused, setClientPaused] = useState(false);
const [userRole, setUserRole] = useState("trainer");
const userRoleRef = useRef(userRole);
const [cameraFacing, setCameraFacing] = useState("environment"); // "user" = front, "environment" = back
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
const VISIBILITY_THRESHOLD = 0.3;

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
 const role = userRoleRef.current;

    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) drawLandmarks(ctx, results);

    if (isRecordingRef.current) {
if (role === "trainer") {
      const compressed = results.poseLandmarks.map(lm => ([
        +lm.x.toFixed(4),
        +lm.y.toFixed(4),
        +lm.z.toFixed(4),
        lm.visibility ?? 1,
      ]));
 //const clonedLandmarks = results.poseLandmarks.map((lm) => ({ ...lm }));
      recordedFramesRef.current.push(compressed);
    }
    if (role === "client") {
      const clonedLandmarks = results.poseLandmarks.map((lm) => ({ ...lm }));
recordedFramesClientRef.current.push(clonedLandmarks);    }
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

  // Draw Points (all 33)
  for (let i = 0; i < lm.length; i++) {
    drawPoint(i);
  }

  if (showMetricsRef.current) {
  const P = (i) => ({
    x: lm[i].x * ctx.canvas.width,
    y: lm[i].y * ctx.canvas.height
  });
const getDistance = (i, j) => {
  const aLm = lm[i];
  const bLm = lm[j];

  if (
    !aLm || !bLm ||
    aLm.visibility < VISIBILITY_THRESHOLD ||
    bLm.visibility < VISIBILITY_THRESHOLD
  ) return null;

  const a = P(i);
  const b = P(j);

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};
function calculateAngle(A, B, C) {
  // Angle at point B (A-B-C)

  const AB = { x: A.x - B.x, y: A.y - B.y };
  const CB = { x: C.x - B.x, y: C.y - B.y };

  const dot = AB.x * CB.x + AB.y * CB.y;
  const magAB = Math.sqrt(AB.x * AB.x + AB.y * AB.y);
  const magCB = Math.sqrt(CB.x * CB.x + CB.y * CB.y);

  if (magAB === 0 || magCB === 0) return 0;

  const cosAngle = dot / (magAB * magCB);
  const angle = Math.acos(Math.min(Math.max(cosAngle, -1), 1));

  return (angle * 180) / Math.PI;
}
  // -------- ROTATION (relative to horizontal) --------
  const getRotation = (i, j) => {
    const a = P(i);
    const b = P(j);
    return Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI);
  };
const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;
const LEFT_WRIST = 15;
const RIGHT_WRIST = 16;


const leftSW = getDistance(LEFT_SHOULDER, LEFT_WRIST);
const rightSW = getDistance(RIGHT_SHOULDER, RIGHT_WRIST);
  const shoulderRotation = getRotation(11, 12);
  const hipRotation = getRotation(23, 24);

  // -------- ARM ANGLE (Elbow) --------
  const leftArmAngle = calculateAngle(P(11), P(13), P(15));
  const rightArmAngle = calculateAngle(P(12), P(14), P(16));

  // -------- KNEE ANGLE --------
  const leftKneeAngle = calculateAngle(P(23), P(25), P(27));
  const rightKneeAngle = calculateAngle(P(24), P(26), P(28));

  // -------- BIG DISPLAY --------
  ctx.font = "bold 10px Arial";
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.fillText(`Shoulder Rot: ${shoulderRotation.toFixed(1)}°`, 30, 50);
  ctx.fillText(`Hip Rot: ${hipRotation.toFixed(1)}°`, 30, 60);

  ctx.fillStyle = "rgba(255, 230, 0, 0.95)";
  ctx.fillText(`L Arm: ${leftArmAngle.toFixed(1)}°`, 30, 70);

  ctx.fillStyle = "rgba(255, 238, 0, 0.95)";
  ctx.fillText(`R Arm: ${rightArmAngle.toFixed(1)}°`, 30, 80);

  ctx.fillStyle = "rgba(0, 255, 150, 0.95)";
  ctx.fillText(`L Knee: ${leftKneeAngle.toFixed(1)}°`, 30, 90);

  ctx.fillStyle = "rgba(0, 200, 255, 0.95)";
  ctx.fillText(`R Knee: ${rightKneeAngle.toFixed(1)}°`, 30, 100);
  

if (leftSW !== null) {
  ctx.fillStyle = "rgba(255, 230, 0, 0.95)";
  ctx.fillText(`L Shoulder-Wrist: ${leftSW.toFixed(1)} px`, 30, 110);
}

if (rightSW !== null) {
  ctx.fillStyle = "rgba(255, 238, 0, 0.95)";
  ctx.fillText(`R Shoulder-Wrist: ${rightSW.toFixed(1)} px`, 30, 120);
}
}
  // -----------------------------
// EXTENDED BODY AXIS LINES
// -----------------------------
const drawExtendedAxis = (indexA, indexB, color, dashed = false) => {
  const aLm = lm[indexA];
  const bLm = lm[indexB];

  if (
    !aLm || !bLm ||
    aLm.visibility < VISIBILITY_THRESHOLD ||
    bLm.visibility < VISIBILITY_THRESHOLD
  ) return;

  const a = P(indexA);
  const b = P(indexB);

  const dx = b.x - a.x;
  const dy = b.y - a.y;

  const length = Math.sqrt(dx * dx + dy * dy);
  if (length === 0) return;

  const ux = dx / length;
  const uy = dy / length;

  const extendAmount = 1000;

  const startX = a.x - ux * extendAmount;
  const startY = a.y - uy * extendAmount;

  const endX = b.x + ux * extendAmount;
  const endY = b.y + uy * extendAmount;

  ctx.beginPath();

  if (dashed) {
    ctx.setLineDash([10, 8]); // dotted style
  } else {
    ctx.setLineDash([]); // solid
  }

  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.lineWidth = 3;
  ctx.strokeStyle = color;
  ctx.stroke();

  ctx.setLineDash([]); // reset dash

  // Optional: show distance
  ctx.font = "14px Arial";
  ctx.fillStyle = color;
  ctx.fillText(
    `${length.toFixed(1)} px`,
    (a.x + b.x) / 2,
    (a.y + b.y) / 2 - 10
  );
};

// Shoulders (solid cyan)
drawExtendedAxis(11, 12, "rgba(255, 72, 0, 0.5)", false);

// Hips (dotted orange/red)
drawExtendedAxis(23, 24, "rgba(255, 120, 0, 0.5)", true);
  // -----------------------------
// WRIST CONNECTION MEASUREMENTS
// -----------------------------
const drawConnectionWithDistance = (i, j, color) => {
  const aLm = lm[i];
  const bLm = lm[j];

  if (
    !aLm || !bLm ||
    aLm.visibility < VISIBILITY_THRESHOLD ||
    bLm.visibility < VISIBILITY_THRESHOLD
  ) return;

  const a = P(i);
  const b = P(j);

  // Draw line
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineWidth = 3;
  ctx.strokeStyle = color;
  ctx.stroke();

  // Calculate distance
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // // Draw measurement text at midpoint
  // ctx.font = "14px Arial";
  // ctx.fillStyle = color;
  // ctx.fillText(
  //   `${distance.toFixed(1)} px`,
  //   (a.x + b.x) / 2,
  //   (a.y + b.y) / 2
  // );
};

// LEFT SIDE
drawConnectionWithDistance(15, 11, "rgba(255, 13, 53, 0.5)"); // wrist → shoulder
drawConnectionWithDistance(15, 23, "rgba(255, 13, 53, 0.5)"); // wrist → hip

// RIGHT SIDE
drawConnectionWithDistance(16, 12, "rgba(13, 255, 134, 0.5)"); // wrist → shoulder
drawConnectionWithDistance(16, 24, "rgba(13, 255, 134, 0.5)"); // wrist → hip
  const LEFT_HEEL = 29;
const RIGHT_HEEL = 30;

const leftHeel = lm[LEFT_HEEL];
const rightHeel = lm[RIGHT_HEEL];

if (
  leftHeel &&
  rightHeel &&
  leftHeel.visibility >= VISIBILITY_THRESHOLD &&
  rightHeel.visibility >= VISIBILITY_THRESHOLD
) {
  const a = P(LEFT_HEEL);
  const b = P(RIGHT_HEEL);

  // Draw line
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(255, 0, 43, 0.9)";
  ctx.stroke();

  // Calculate distance (pixels)
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Draw distance text
  // ctx.font = "16px Arial";
  // ctx.fillStyle = "white";
  // ctx.fillText(
  //   `Heel Distance: ${distance.toFixed(1)} px`,
  //   (a.x + b.x) / 2 - 50,
  //   (a.y + b.y) / 2 - 10
  // );
}

  ctx.restore();
}
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
const [showFreeTrialBox, setShowFreeTrialBox] = useState(false);
const [loadingTRequest, setLoadingTRequest] = useState(false);

const startFreeTrial = async (name, email, mobile) => {

  if (!name || !email || !mobile) {
    alert("Please enter name, email and mobile number");
    return;
  }
  setLoadingTRequest(true);

  setShowDialog(false);

  const trialData = localStorage.getItem("tennisx_free_trial");

  if (trialData) {
    const parsed = JSON.parse(trialData);

    if (Date.now() < parsed.expiry) {
                setLoadingTRequest(false);

      setShowFreeTrialBox({
        status: "exists",
        message:
          "Your free trial request has already been sent. Please wait for activation."
      });
      return;
    }
  }

  try {

    const res = await fetch(
      "https://tennisx.in/api/razorpay/create-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          mobile,
          plan: "trial"
        }),
      }
    );

    const data = await res.json();

    if (data.success) {

      const trial = {
        requested: true,
        expiry: Date.now() + (2 * 24 * 60 * 60 * 1000)
      };

      localStorage.setItem(
        "tennisx_free_trial",
        JSON.stringify(trial)
      );

      setShowFreeTrialBox({
        status: "sent",
        message:
          "Your request for free trial has been sent. Once activated, you will receive login credentials for the same."
      });

    } else {

      setShowFreeTrialBox({
        status: "error",
        message: data.message || "Unable to process free trial request."
      });

    }

  } catch (err) {

    console.error(err);

    setShowFreeTrialBox({
      status: "error",
      message: "Network error. Please try again later."
    });

  }
      setLoadingTRequest(false);

};
const handlePayment = async (name, email, mobile) => {
  if (!name || !email || !mobile) {
    alert("Please enter name, email and mobile number");
    return;
  }
   
 setLoading(true);
  // Ensure mobile is 10 digits only
  mobile = mobile.replace(/\D/g, "").slice(-10);

  const sdkLoaded = await loadRazorpayScript();

  if (!sdkLoaded) {
    setLoading(false);
    alert("Razorpay SDK failed to load.");
    return;
  }

  try {
    // 🔹 Create order from backend
    const orderRes = await fetch(
      "https://tennisx.in/api/razorpay/create-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
body: JSON.stringify({
  name,
  email,
  mobile,
  currency,
  plan: selectedPlan,
  couponApplied
}),       }
    );

    if (!orderRes.ok) {
      setLoading(false);
      throw new Error("Order creation request failed");
    }

    const order = await orderRes.json();

    if (!order || !order.id) {
      setLoading(false);
      alert("Order creation failed");
      return;
    }
setLoading(false);
    const options = {
      key: "rzp_live_SM3qfZ3C7cCTQ5",
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,

      name: "Oxad Media",
      description: "TennisX",

      prefill: {
        name,
        email,
        contact: mobile,
      },

      notes: {
        name,
        email,
        mobile,
      },
  modal: {
    ondismiss: function () {
      console.log("Payment popup closed");
      setLoading(false); // ✅ Stop loading if user cancels
    }
  },
      theme: {
        color: "#2ef02e",
      },

      handler: async function (response) {
        try {
          setLoading(false);
          const verifyRes = await fetch(
            "https://tennisx.in/api/razorpay/verify-payment",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                name,
                email,
                mobile,
              }),
            }
          );

          if (!verifyRes.ok) {
            
            throw new Error("Verification request failed");
          }

          const data = await verifyRes.json();

          if (data.success) {
            // ✅ Mark login
            //localStorage.setItem("isLoggedInWeb", "true");

            // ✅ Close dialog
             const expiryTime = Date.now() + (2 * 24 * 60 * 60 * 1000); // 2 days in ms

  const paymentData = {
    verified: true,
    expiresAt: expiryTime
  };

  localStorage.setItem("paymentStatus", JSON.stringify(paymentData));
            if (typeof setShowDialog === "function") {
              setShowDialog(false);
            }

            // ✅ Start recording
            // if (typeof startRecording === "function") {
            //   startRecording();
            // }
setShowSuccessDialog(true);

           // alert("Payment Successful!");
          } else {
            alert("Payment verification failed.");
          }
            setLoading(false);
        } catch (err) {
          setLoading(false);
          console.error("Verification error:", err);
          alert("Verification error.");
        }
      },
    };

    const paymentObject = new window.Razorpay(options);

    paymentObject.on("payment.failed", function (response) {
      console.error("Payment Failed:", response.error);
      alert("Payment Failed. Please try again.");
    });

    paymentObject.open();

  } catch (error) {
    console.error("Payment error:", error);
    alert("Something went wrong. Please try again.");
  }
};
function sendSessionEvent(pageName) {
  // let sessionId = localStorage.getItem("tx_session");

  // if (!sessionId) {
  //   sessionId = crypto.randomUUID();
  //   localStorage.setItem("tx_session", sessionId);
  // }

  // fetch("https://tennisx.in/api/session", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json"
  //   },
  //   body: JSON.stringify({
  //     isp: "TennisX",
  //     session_id: sessionId,
  //     page: pageName
  //   })
  // }).catch(() => {});
}

const checkLogin = () => {
  const isLoggedIn =
    localStorage.getItem("isLoggedInWeb") === "true";
sendSessionEvent("Start Record Clicked");

  if (isLoggedIn) {
    if(isExpired){
      setShowExpireBlock(true);
      return;
    }
   startRecording();
    return;
  }

   const stored = JSON.parse(localStorage.getItem("paymentStatus") || "{}");

  if (stored.verified && stored.expiresAt > Date.now()) {
    console.log("✅ Payment already verified and valid");

    setShowDialog(false);
    setShowSuccessDialog(true);
    return; // ⛔ Stop further execution
  }

  // ❌ If expired, clean it
  if (stored.expiresAt && stored.expiresAt <= Date.now()) {
    localStorage.removeItem("paymentStatus");
    console.log("⚠️ Stored payment expired, removed.");
  }
  //handlePayment(name, email, mobile);
    setShowDialog(true); // 👈 open bottom dialog

//handlePayment();
 
};
  const startRecording = () => {
    //downloadTrainerSessionsJSON();
       if (userRole === "trainer")
       recordedFramesRef.current = [];
     if (userRole === "client")
        recordedFramesClientRef.current = [];
             
    
    setIsRecording(true);
  };

const stopRecording = async () => {
 // await clearTrainerSessions();
    setIsRecording(false);
     if (userRole === "trainer")
     {
 const name = prompt("Enter trainer session name:");
if (!name) return;
  const currentCount = trainerSessions.length; // use the state directly

  if (currentCount >= 10) {
    alert("Cannot save: limit of 10 sessions reached. Delete an old session first.");
    return;
  }
const session = await saveTrainerSession(
  recordedFramesRef.current,
  30,
  name
);

// ✅ instant UI update
setTrainerSessions((prev) =>
  [session, ...prev].sort((a, b) => b.createdAt - a.createdAt)
);

setLastSessionId(session.id);
setSelectedSessionId(session.id);
setTrainerReady(true);

console.log("Saved trainer session:", session.id);
     }
   
  };
const removeTrainer = async () => {
  if (!selectedSessionId) return;

  // 1️⃣ stop playback
  stopTrainer();

  // 2️⃣ delete from DB
const deleted = await deleteTrainerSessionById(selectedSessionId);

if (!deleted) {
  alert("Built-in sessions cannot be deleted.");
  return;
}
  // 3️⃣ clear refs
  trainerFramesRef.current = [];
  trainerFpsRef.current = 0;
  trainerIndexRef.current = 0;

  // 4️⃣ reset UI state
  setSelectedSessionId("");
  setTrainerReady(false);
  setTrainerPlaying(false);
  setTrainerPaused(false);

  // 5️⃣ clear canvas
  const canvas = playbackCanvasRef.current;
  if (canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // 6️⃣ reload dropdown sessions
setTrainerSessions((prev) =>
  prev.filter((s) => s.id !== selectedSessionId)
);;

  console.log("Trainer session deleted");
};
const trainerFramesRef = useRef([]);
const trainerFpsRef = useRef(30);
// useEffect(() => {
//   const loadSession = async () => {
//     const sid = "ce173038-1073-4ad3-8044-bab69cd162b2";

//     const session = await getPoseSessionById(sid);
//     if (!session) return;

//     trainerFramesRef.current = session.frames;
//     trainerFpsRef.current = session.fps;
//     trainerIndexRef.current = 0;

//     console.log("Trainer session loaded:", session.frames.length);
//   };

//   loadSession();
// }, []);
async function getSessionById(id) {
  // 1️⃣ try IndexedDB first
  const dbSession = await getPoseSessionById(id);
  if (dbSession) return dbSession;

  // 2️⃣ fallback to JSON
  return jsonSessions.find(s => s.id === id) || null;
}
useEffect(() => {
  if (!selectedSessionId) return;

  const loadSession = async () => {
    // 🛑 HARD reset playback state
    clearInterval(trainerIntervalRef.current);
    trainerIntervalRef.current = null;

    setTrainerPlaying(false);
    setTrainerPaused(false);

    const session = await getSessionById(selectedSessionId);
    if (!session) return;

    trainerFramesRef.current = session.frames;
    trainerFpsRef.current = session.fps;
    trainerIndexRef.current = 0;
setTrainerReady(session.frames.length > 0);

    console.log(
      "Trainer session loaded:",
      session.name,
      session.frames.length
    );

    // optional preview
    if (session.frames.length) {
      drawPlayback(
        session.frames[0],
        playbackCanvasRef.current
      );
    }
  };

  loadSession();
}, [selectedSessionId]);

const currentPathRef = useRef([]);
const allPathsRef = useRef([]);
const drawPlayback = (frame, canvas) => {
  if (!frame || !canvas) return;

  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const P = (i) => ({
  x: frame[i][0] * ctx.canvas.width,
  y: frame[i][1] * ctx.canvas.height
});
  ctx.clearRect(0, 0, width, height);

  // ---- Connection Groups ----
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
    [23, 24]                  // hips
  ];

  const drawConnections = (connections, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    connections.forEach(([s, e]) => {
      const start = frame[s];
      const end = frame[e];
  if (
      !start || !end ||
      start[3] < VISIBILITY_THRESHOLD ||
      end[3] < VISIBILITY_THRESHOLD
    ) return;
      ctx.beginPath();
      ctx.moveTo(start[0] * width, start[1] * height);
      ctx.lineTo(end[0] * width, end[1] * height);
      ctx.stroke();
    });
  };

  // ---- Draw Skeleton ----
  drawConnections(LEFT_CONNECTIONS, "rgba(255, 0, 242, 0.9)");   // Left = Red
  drawConnections(RIGHT_CONNECTIONS, "rgba(255, 238, 0, 0.9)");  // Right = Blue
  drawConnections(CENTER_CONNECTIONS, "rgba(0, 225, 255, 0.9)"); // Center = Green

  // ---- Draw Joints ----
  frame.forEach((lm, index) => {
  if (!lm || lm[3] < VISIBILITY_THRESHOLD) return; // 🚫 Skip invisible

    let jointColor = "white";

    if ([11,13,15,23,25,27].includes(index)) jointColor = "rgba(255, 0, 242, 0.9)";
    else if ([12,14,16,24,26,28].includes(index)) jointColor = "rgba(255, 238, 0, 0.9)";
    else if ([11,12,23,24].includes(index)) jointColor = "rgba(0, 225, 255, 0.9)";

    ctx.beginPath();
    ctx.arc(lm[0] * width, lm[1] * height, 4, 0, Math.PI * 2);
    ctx.fillStyle = jointColor;
    ctx.fill();
  });

function drawSwingArc(ctx, path) {
  if (path.length < 3) return;

  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);

  for (let i = 1; i < path.length - 1; i++) {
    const xc = (path[i].x + path[i + 1].x) / 2;
    const yc = (path[i].y + path[i + 1].y) / 2;

    ctx.quadraticCurveTo(path[i].x, path[i].y, xc, yc);
  }

  ctx.strokeStyle = "rgba(0,255,255,0.9)";
  ctx.lineWidth = 4;
  ctx.stroke();
}
if (showSwingArcRef.current) {

  const rightWrist = frame[16];

  if (rightWrist && rightWrist[3] > VISIBILITY_THRESHOLD) {
    currentPathRef.current.push({
      x: rightWrist[0] * width,
      y: rightWrist[1] * height
    });

    if (currentPathRef.current.length > MAX_PATH) {
      currentPathRef.current.shift();
    }
  }
}

// draw old arcs
allPathsRef.current.forEach(path => {
  drawSwingArc(ctx, path);
});

// draw current arc
if (showSwingArcRef.current) {
  drawSwingArc(ctx, currentPathRef.current);
}
if (showMetricsRef.current) {
 
  function calculateAngle(A, B, C) {
  // Angle at point B (A-B-C)

  const AB = { x: A.x - B.x, y: A.y - B.y };
  const CB = { x: C.x - B.x, y: C.y - B.y };

  const dot = AB.x * CB.x + AB.y * CB.y;
  const magAB = Math.sqrt(AB.x * AB.x + AB.y * AB.y);
  const magCB = Math.sqrt(CB.x * CB.x + CB.y * CB.y);

  if (magAB === 0 || magCB === 0) return 0;

  const cosAngle = dot / (magAB * magCB);
  const angle = Math.acos(Math.min(Math.max(cosAngle, -1), 1));

  return (angle * 180) / Math.PI;
}
 
const getDistance = (i, j) => {
  const aLm = frame[i];
  const bLm = frame[j];

  if (
    !aLm || !bLm ||
    aLm[3] < VISIBILITY_THRESHOLD ||
    bLm[3] < VISIBILITY_THRESHOLD
  ) return null;

  const a = P(i);
  const b = P(j);

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

  // -------- ROTATION (relative to horizontal) --------
  const getRotation = (i, j) => {
    const a = P(i);
    const b = P(j);
    return Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI);
  };
const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;
const LEFT_WRIST = 15;
const RIGHT_WRIST = 16;


const leftSW = getDistance(LEFT_SHOULDER, LEFT_WRIST);
const rightSW = getDistance(RIGHT_SHOULDER, RIGHT_WRIST);
  const shoulderRotation = getRotation(11, 12);
  const hipRotation = getRotation(23, 24);

  // -------- ARM ANGLE (Elbow) --------
  const leftArmAngle = calculateAngle(P(11), P(13), P(15));
  const rightArmAngle = calculateAngle(P(12), P(14), P(16));

  // -------- KNEE ANGLE --------
  const leftKneeAngle = calculateAngle(P(23), P(25), P(27));
  const rightKneeAngle = calculateAngle(P(24), P(26), P(28));
const baseFont = Math.max(10, canvas.width * 0.018);
  // -------- BIG DISPLAY --------
  ctx.font = `bold ${baseFont}px Arial`;
ctx.fillStyle = "rgba(255,255,255,0.95)";
ctx.fillText(`Shoulder Rot: ${shoulderRotation.toFixed(1)}°`, 30, baseFont * 2);
ctx.fillText(`Hip Rot: ${hipRotation.toFixed(1)}°`, 30, baseFont * 3.5);

ctx.fillStyle = "rgba(255, 0, 242, 0.95)";
ctx.fillText(`L Arm: ${leftArmAngle.toFixed(1)}°`, 30, baseFont * 5);

ctx.fillStyle = "rgba(255, 238, 0, 0.95)";
ctx.fillText(`R Arm: ${rightArmAngle.toFixed(1)}°`, 30, baseFont * 6.5);

ctx.fillStyle = "rgba(0, 255, 150, 0.95)";
ctx.fillText(`L Knee: ${leftKneeAngle.toFixed(1)}°`, 30, baseFont * 8);

ctx.fillStyle = "rgba(0, 200, 255, 0.95)";
ctx.fillText(`R Knee: ${rightKneeAngle.toFixed(1)}°`, 30, baseFont * 9.5);

if (leftSW !== null) {
  ctx.fillStyle = "rgba(255, 0, 242, 0.95)";
  ctx.fillText(`L Shoulder-Wrist: ${leftSW.toFixed(1)} px`, 30, baseFont * 11);
}

if (rightSW !== null) {
  ctx.fillStyle = "rgba(255, 238, 0, 0.95)";
  ctx.fillText(`R Shoulder-Wrist: ${rightSW.toFixed(1)} px`, 30, baseFont * 12.5);
}
}
// EXTENDED BODY AXIS LINES
// -----------------------------
const drawExtendedAxis = (indexA, indexB, color, dashed = false) => {
  const aLm = frame[indexA];
  const bLm = frame[indexB];

  if (
    !aLm || !bLm ||
   aLm[3] < VISIBILITY_THRESHOLD ||
   bLm[3]< VISIBILITY_THRESHOLD
  ) return;

  const a = P(indexA);
  const b = P(indexB);

  const dx = b.x - a.x;
  const dy = b.y - a.y;

  const length = Math.sqrt(dx * dx + dy * dy);
  if (length === 0) return;

  const ux = dx / length;
  const uy = dy / length;

  const extendAmount = 1000;

  const startX = a.x - ux * extendAmount;
  const startY = a.y - uy * extendAmount;

  const endX = b.x + ux * extendAmount;
  const endY = b.y + uy * extendAmount;

  ctx.beginPath();

  if (dashed) {
    ctx.setLineDash([10, 8]); // dotted style
  } else {
    ctx.setLineDash([]); // solid
  }

  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.lineWidth = 3;
  ctx.strokeStyle = color;
  ctx.stroke();

  ctx.setLineDash([]); // reset dash

//   // Optional: show distance
//   ctx.font = "12px Arial";
// ctx.fillStyle = "white";
//   ctx.fillText(
//     `${length.toFixed(1)} px`,
//     (a.x + b.x) / 2,
//     (a.y + b.y) / 2 - 10
//   );
};

// Shoulders (solid cyan)
drawExtendedAxis(11, 12, "rgba(255, 72, 0, 0.3)", false);

// Hips (dotted orange/red)
drawExtendedAxis(23, 24, "rgba(255, 120, 0, 0.3)", true);
  // -----------------------------
// WRIST CONNECTION MEASUREMENTS
// -----------------------------
const drawConnectionWithDistance = (i, j, color) => {
  const aLm = frame[i];
  const bLm = frame[j];

if (
  !aLm || !bLm ||
  aLm[3] < VISIBILITY_THRESHOLD ||
  bLm[3] < VISIBILITY_THRESHOLD
) return;

  const a = P(i);
  const b = P(j);

  // Draw line
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineWidth = 3;
  ctx.strokeStyle = color;
  ctx.stroke();

  // Calculate distance
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Draw measurement text at midpoint
//   ctx.font = "12px Arial";
// ctx.fillStyle = "white";
//   ctx.fillText(
//     `${distance.toFixed(1)} px`,
//     (a.x + b.x) / 2,
//     (a.y + b.y) / 2
//   );
};

// LEFT SIDE
drawConnectionWithDistance(15, 11, "rgba(255, 13, 53, 0.3)"); // wrist → shoulder
drawConnectionWithDistance(15, 23, "rgba(255, 13, 53, 0.4)"); // wrist → hip

// RIGHT SIDE
drawConnectionWithDistance(16, 12, "rgba(13, 255, 134, 0.3)"); // wrist → shoulder
drawConnectionWithDistance(16, 24, "rgba(13, 255, 134, 0.4)"); // wrist → hip
  // -------- Heel Distance (run once) --------
const LEFT_HEEL = 29;
const RIGHT_HEEL = 30;

const leftHeel = frame[LEFT_HEEL];
const rightHeel = frame[RIGHT_HEEL];

if (
  leftHeel &&
  rightHeel &&
  leftHeel[3] >= VISIBILITY_THRESHOLD &&
  rightHeel[3] >= VISIBILITY_THRESHOLD
) {

  const ax = leftHeel[0] * width;
  const ay = leftHeel[1] * height;
  const bx = rightHeel[0] * width;
  const by = rightHeel[1] * height;

  // Draw line
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(255, 0, 43, 0.9)";
  ctx.stroke();

  // Distance
  const dx = bx - ax;
  const dy = by - ay;
  const distance = Math.sqrt(dx * dx + dy * dy);

 ctx.font = "12px Arial"; // smaller font
ctx.fillStyle = "white";

ctx.fillText(
  `Heel Distance: ${distance.toFixed(1)} px`,
  (ax + bx) / 2 - 40,   // slightly centered
  (ay + by) / 2 + 20    // move text below the line
);

}
};

const aplayTrainer = async () => {
  const canvas = playbackCanvasRef.current;
  const frames = trainerFramesRef.current;

  if (!canvas || !frames.length) return;

  // 🎥 Capture canvas stream
  const fps = trainerFpsRef.current || 30;
  canvas.width = 300;
canvas.height = 534;
  const stream = canvas.captureStream(fps);

  const recorder = new MediaRecorder(stream, {
    mimeType: "video/webm"
  });

  const chunks = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "trainer-playback.webm";
    a.click();

    URL.revokeObjectURL(url);
  };

  recorder.start();

  // ▶️ Play frames while recording
  let i = 0;
  const speed = playbackSpeedRef.current || 1;
  const intervalMs = (1000 / fps) / speed;

  const interval = setInterval(() => {
    if (!frames[i]) {
      clearInterval(interval);
      recorder.stop();
      return;
    }

    drawPlayback(frames[i], canvas);
    i++;
  }, intervalMs);
};
const playTrainer = () => {
//loadSelectedTrainerSession();
  // 🛑 Guard: prevent multiple intervals
  console.log("playTrainer");

  if (trainerIntervalRef.current) return;

  const frames = trainerFramesRef.current;
  if (!frames.length) return;

  if (!trainerPaused) {
    trainerIndexRef.current = 0;
  }

  setTrainerPlaying(true);
  setTrainerPaused(false);
  const speed = playbackSpeedRef.current; // 0.25, 0.5, 1, 2
  console.log("playTrainer speed ",speed);

  const intervalMs = (1000 / trainerFpsRef.current) /speed;

  trainerIntervalRef.current = setInterval(() => {
    const i = trainerIndexRef.current;

    if (!frames[i]) {
      stopTrainer();
      return;
    }

    drawPlayback(frames[i], playbackCanvasRef.current);
    trainerIndexRef.current++;
  }, intervalMs);
};



const pauseTrainer = () => {
  if (trainerIntervalRef.current) {
    clearInterval(trainerIntervalRef.current);
    trainerIntervalRef.current = null;
  }

  setTrainerPlaying(false);
  setTrainerPaused(true);
};

const stopTrainer = () => {
  if (trainerIntervalRef.current) {
    clearInterval(trainerIntervalRef.current);
    trainerIntervalRef.current = null;
  }

  setTrainerPlaying(false);
  setTrainerPaused(false);
  trainerIndexRef.current = 0;
};
const MAX_PATH = 40;

const currentPathRefC = useRef([]);
const allPathsRefC = useRef([]);
const recordingTimeRefC = useRef(null);
const drawPlaybackC = (landmarks, canvas,fromdownload = false) => {
  if (!landmarks || !canvas) return;

  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
 const P = (i) => ({
  x: landmarks[i].x * width,
  y: landmarks[i].y * height
});
  ctx.clearRect(0, 0, width, height);
  if(fromdownload){
// 🧾 Get values
const now = recordingTimeRefC.current || new Date();
const name = recordingNameRefC.current || "Client";
const coach_name = recordingCoachNameRefC.current || "Coach";


const note = recordingNoteRefC.current || "";
const progress = recordingProgressRefC.current || 0;

// 📅 Date formatting
const day = now.getDate().toString().padStart(2, "0");
const month = (now.getMonth() + 1).toString().padStart(2, "0");
const year = now.getFullYear();

const dateStr = `${day}/${month}/${year}`;
const timeStr = now.toLocaleTimeString([], {
  hour: "2-digit",
  minute: "2-digit",
});

const dateTimeText = `${dateStr} ${timeStr}`;

const padding = 12;

// 👉 Measure text
ctx.font = "16px Arial";
const nameWidth = ctx.measureText(name).width;

ctx.font = "14px Arial";
const dateWidth = ctx.measureText(dateTimeText).width;
const noteWidth = ctx.measureText(note).width;
const coachWidth = ctx.measureText(coach_name).width;


const textWidth = Math.max(nameWidth, dateWidth, noteWidth,coachWidth);

// 👉 Layout
const circleRadius = 18;
const circleDiameter = circleRadius * 2;

const boxWidth = textWidth ;
const boxHeight = 70;

const x = canvas.width - boxWidth - 10;
const y = canvas.height - boxHeight - 10;

// 🟫 Background
ctx.fillStyle = "rgba(0,0,0,0.6)";
ctx.fillRect(x, y, boxWidth, boxHeight);

// =======================
// 🔵 Circular Progress
// =======================

const cx =  padding + circleRadius +5;
const cy = y - 25;

// Background circle
ctx.beginPath();
ctx.arc(cx, cy, circleRadius, 0, Math.PI * 2);
ctx.strokeStyle = "#444";
ctx.lineWidth = 4;
ctx.stroke();

// Progress arc
const endAngle = (progress / 100) * Math.PI * 2;

ctx.beginPath();
ctx.arc(cx, cy, circleRadius, -Math.PI / 2, endAngle - Math.PI / 2);
ctx.strokeStyle = "#00ff88"; // green
ctx.lineWidth = 4;
ctx.stroke();


// Progress text
ctx.fillStyle = "white";
ctx.font = "12px Arial";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillText(`${progress}%`, cx, cy);

// =======================
// 📝 Text Content
// =======================

const textX = padding;
let textY = y;
ctx.textAlign = "left";
ctx.textBaseline = "top"; // easier spacing control

// Name (Primary)
ctx.font = "bold 16px Arial";
ctx.fillStyle = "#ffffff";
ctx.fillText(name, textX, textY);

// Coach (Highlight)
textY += 20;
ctx.font = "italic 14px Arial";
ctx.fillStyle = "#d28cfa"; // purple highlight
ctx.fillText(`${coach_name}`, textX, textY);

// Note (Secondary)
textY += 18;
ctx.font = "13px Arial";
ctx.fillStyle = "#cccccc";
ctx.fillText(note, textX, textY);

// Date (Muted)
textY += 18;
ctx.font = "12px Arial";
ctx.fillStyle = "#888888";
ctx.fillText(dateTimeText, textX, textY);
  }

  // ---- Connection Groups ----
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
    [23, 24]                  // hips
  ];

  const drawConnections = (connections, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    connections.forEach(([s, e]) => {
      const start = landmarks[s];
      const end = landmarks[e];
  if (
      !start || !end ||
      start[3] < VISIBILITY_THRESHOLD ||
      end[3] < VISIBILITY_THRESHOLD
    ) return;

      ctx.beginPath();
      ctx.moveTo(start.x * width, start.y * height);
      ctx.lineTo(end.x * width, end.y * height);
      ctx.stroke();
    });
  };

  // ---- Draw Skeleton ----
  drawConnections(LEFT_CONNECTIONS, "rgba(255, 0, 242, 0.9)");   // Left = Red
  drawConnections(RIGHT_CONNECTIONS, "rgba(255, 238, 0, 0.9)");  // Right = Blue
  drawConnections(CENTER_CONNECTIONS, "rgba(0, 225, 255, 0.9)"); // Center = Green

  // ---- Draw Joints (Colored by Side) ----
  landmarks.forEach((lm, index) => {
  if (!lm || lm[3] < VISIBILITY_THRESHOLD) return; // 🚫 Skip invisible

    let jointColor = "white";

    if ([11,13,15,23,25,27].includes(index))
      jointColor = "rgba(255, 0, 242, 0.9)";
    else if ([12,14,16,24,26,28].includes(index))
      jointColor = "rgba(255, 238, 0, 0.9)";
    else if ([11,12,23,24].includes(index))
      jointColor = "rgba(0, 225, 255, 0.9)";

    ctx.beginPath();
    ctx.arc(lm.x * width, lm.y * height, 4, 0, Math.PI * 2);
    ctx.fillStyle = jointColor;
    ctx.fill();
  });

function drawSwingArc(ctx, path) {

  if (path.length < 3) return;

  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);

  for (let i = 1; i < path.length - 1; i++) {

    const xc = (path[i].x + path[i+1].x) / 2;
    const yc = (path[i].y + path[i+1].y) / 2;

    ctx.quadraticCurveTo(path[i].x, path[i].y, xc, yc);

  }

  ctx.strokeStyle = "rgba(0,255,255,0.9)";
  ctx.lineWidth = 4;
  ctx.stroke();
}
if (showSwingArcRefC.current) {

  const rightWrist = landmarks[16];

  if (rightWrist && rightWrist.visibility > VISIBILITY_THRESHOLD) {

    currentPathRefC.current.push({
      x: rightWrist.x * width,
      y: rightWrist.y * height
    });

    if (currentPathRefC.current.length > MAX_PATH) {
      currentPathRefC.current.shift();
    }

  }

}

allPathsRefC.current.forEach(path => {
  drawSwingArc(ctx, path);
});

// draw current arc while recording
if (showSwingArcRefC.current) {
  drawSwingArc(ctx, currentPathRefC.current);
}


  if (showMetricsRef.current) {
 
  function calculateAngle(A, B, C) {
  // Angle at point B (A-B-C)

  const AB = { x: A.x - B.x, y: A.y - B.y };
  const CB = { x: C.x - B.x, y: C.y - B.y };

  const dot = AB.x * CB.x + AB.y * CB.y;
  const magAB = Math.sqrt(AB.x * AB.x + AB.y * AB.y);
  const magCB = Math.sqrt(CB.x * CB.x + CB.y * CB.y);

  if (magAB === 0 || magCB === 0) return 0;

  const cosAngle = dot / (magAB * magCB);
  const angle = Math.acos(Math.min(Math.max(cosAngle, -1), 1));

  return (angle * 180) / Math.PI;
}
 
const getDistance = (i, j) => {
  const aLm = landmarks[i];
  const bLm = landmarks[j];

  if (
    !aLm || !bLm ||
    aLm.visibility < VISIBILITY_THRESHOLD ||
    bLm.visibility < VISIBILITY_THRESHOLD
  ) return null;

  const a = P(i);
  const b = P(j);

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

  // -------- ROTATION (relative to horizontal) --------
  const getRotation = (i, j) => {
    const a = P(i);
    const b = P(j);
    return Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI);
  };
const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;
const LEFT_WRIST = 15;
const RIGHT_WRIST = 16;


const leftSW = getDistance(LEFT_SHOULDER, LEFT_WRIST);
const rightSW = getDistance(RIGHT_SHOULDER, RIGHT_WRIST);
  const shoulderRotation = getRotation(11, 12);
  const hipRotation = getRotation(23, 24);

  // -------- ARM ANGLE (Elbow) --------
  const leftArmAngle = calculateAngle(P(11), P(13), P(15));
  const rightArmAngle = calculateAngle(P(12), P(14), P(16));

  // -------- KNEE ANGLE --------
  const leftKneeAngle = calculateAngle(P(23), P(25), P(27));
  const rightKneeAngle = calculateAngle(P(24), P(26), P(28));
const baseFont = Math.max(10, canvas.width * 0.018);
  // -------- BIG DISPLAY --------
  ctx.font = `bold ${baseFont}px Arial`;
ctx.fillStyle = "rgba(255,255,255,0.95)";
ctx.fillText(`Shoulder Rot: ${shoulderRotation.toFixed(1)}°`, 30, baseFont * 2);
ctx.fillText(`Hip Rot: ${hipRotation.toFixed(1)}°`, 30, baseFont * 3.5);

ctx.fillStyle = "rgba(255, 0, 242, 0.95)";
ctx.fillText(`L Arm: ${leftArmAngle.toFixed(1)}°`, 30, baseFont * 5);

ctx.fillStyle = "rgba(255, 238, 0, 0.95)";
ctx.fillText(`R Arm: ${rightArmAngle.toFixed(1)}°`, 30, baseFont * 6.5);

ctx.fillStyle = "rgba(0, 255, 150, 0.95)";
ctx.fillText(`L Knee: ${leftKneeAngle.toFixed(1)}°`, 30, baseFont * 8);

ctx.fillStyle = "rgba(0, 200, 255, 0.95)";
ctx.fillText(`R Knee: ${rightKneeAngle.toFixed(1)}°`, 30, baseFont * 9.5);

if (leftSW !== null) {
  ctx.fillStyle = "rgba(255, 0, 242, 0.95)";
  ctx.fillText(`L Shoulder-Wrist: ${leftSW.toFixed(1)} px`, 30, baseFont * 11);
}

if (rightSW !== null) {
  ctx.fillStyle = "rgba(255, 238, 0, 0.95)";
  ctx.fillText(`R Shoulder-Wrist: ${rightSW.toFixed(1)} px`, 30, baseFont * 12.5);
}

  }
// EXTENDED BODY AXIS LINES
// -----------------------------
const drawExtendedAxis = (indexA, indexB, color, dashed = false) => {
  const aLm = landmarks[indexA];
  const bLm = landmarks[indexB];

  if (
    !aLm || !bLm ||
    aLm.visibility < VISIBILITY_THRESHOLD ||
    bLm.visibility < VISIBILITY_THRESHOLD
  ) return;

  const a = P(indexA);
  const b = P(indexB);

  const dx = b.x - a.x;
  const dy = b.y - a.y;

  const length = Math.sqrt(dx * dx + dy * dy);
  if (length === 0) return;

  const ux = dx / length;
  const uy = dy / length;

  const extendAmount = 1000;

  const startX = a.x - ux * extendAmount;
  const startY = a.y - uy * extendAmount;

  const endX = b.x + ux * extendAmount;
  const endY = b.y + uy * extendAmount;

  ctx.beginPath();

  if (dashed) {
    ctx.setLineDash([10, 8]); // dotted style
  } else {
    ctx.setLineDash([]); // solid
  }

  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.lineWidth = 3;
  ctx.strokeStyle = color;
  ctx.stroke();

  ctx.setLineDash([]); // reset dash

//   // Optional: show distance
//   ctx.font = "12px Arial";
// ctx.fillStyle = "white";
//   ctx.fillText(
//     `${length.toFixed(1)} px`,
//     (a.x + b.x) / 2,
//     (a.y + b.y) / 2 - 10
//   );
};

// Shoulders (solid cyan)
drawExtendedAxis(11, 12, "rgba(255, 72, 0, 0.3)", false);

// Hips (dotted orange/red)
drawExtendedAxis(23, 24, "rgba(255, 120, 0, 0.3)", true);
  // -----------------------------
// WRIST CONNECTION MEASUREMENTS
// -----------------------------
const drawConnectionWithDistance = (i, j, color) => {
  const aLm = landmarks[i];
  const bLm = landmarks[j];

if (
  !aLm || !bLm ||
  aLm.visibility < VISIBILITY_THRESHOLD ||
    bLm.visibility < VISIBILITY_THRESHOLD
) return;

  const a = P(i);
  const b = P(j);

  // Draw line
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineWidth = 3;
  ctx.strokeStyle = color;
  ctx.stroke();

  // Calculate distance
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Draw measurement text at midpoint
//   ctx.font = "12px Arial";
// ctx.fillStyle = "white";
//   ctx.fillText(
//     `${distance.toFixed(1)} px`,
//     (a.x + b.x) / 2,
//     (a.y + b.y) / 2
//   );
};

// LEFT SIDE
drawConnectionWithDistance(15, 11, "rgba(255, 13, 53, 0.3)"); // wrist → shoulder
drawConnectionWithDistance(15, 23, "rgba(255, 13, 53, 0.4)"); // wrist → hip

// RIGHT SIDE
drawConnectionWithDistance(16, 12, "rgba(13, 255, 134, 0.3)"); // wrist → shoulder
drawConnectionWithDistance(16, 24, "rgba(13, 255, 134, 0.4)"); // wrist → hip
  // -------- Heel Distance (run once) --------
const LEFT_HEEL = 29;
const RIGHT_HEEL = 30;

const leftHeel = landmarks[LEFT_HEEL];
const rightHeel = landmarks[RIGHT_HEEL];

if (
  leftHeel &&
  rightHeel &&
  leftHeel.visibility >= VISIBILITY_THRESHOLD &&
  rightHeel.visibility >= VISIBILITY_THRESHOLD
) {

  const ax = leftHeel.x * width;
const ay = leftHeel.y * height;
const bx = rightHeel.x * width;
const by = rightHeel.y * height;

  // Draw line
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(255, 0, 43, 0.9)";
  ctx.stroke();

  // Distance
  const dx = bx - ax;
  const dy = by - ay;
  const distance = Math.sqrt(dx * dx + dy * dy);

 ctx.font = "12px Arial"; // smaller font
ctx.fillStyle = "white";

ctx.fillText(
  `Heel Distance: ${distance.toFixed(1)} px`,
  (ax + bx) / 2 - 40,   // slightly centered
  (ay + by) / 2 + 20    // move text below the line
);
}

};
const clearClientCanvas = () => {
  const canvas = playbackCanvasClientRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  ctx.setTransform(1, 0, 0, 1, 0, 0); // reset scale
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};
const [isDownloadingC, setIsDownloadingC] = useState(false);
const recordingNameRefC = useRef("");
const recordingNoteRefC = useRef("");
const recordingProgressRefC = useRef(0);
const recordingCoachNameRefC = useRef("");

const fetchdetailsofClient = async () => {
setdetailShowDialog(true);
}

const downloadClientPlayback = async () => {
              setdetailShowDialog(false);

  const canvas = playbackCanvasClientRef.current;
  const now = new Date();
recordingTimeRefC.current = now;

    // 🛑 Stop current playback
  if (clientIntervalRef.current) {
    clearInterval(clientIntervalRef.current);
    clientIntervalRef.current = null;
  }

  setClientPlaying(false);
  setClientPaused(false);
  clientIndexRef.current = 0;

  // 🧹 Clear canvas before recording
  clearClientCanvas();
  const frames = recordedFramesClientRef.current;

  if (!canvas || !frames.length) return;

  setIsDownloadingC(true);

  // 📱 Portrait size (same as your player)
  canvas.width = 300;
  canvas.height = 534;

  const fps = 30;
  const stream = canvas.captureStream(fps);

  const recorder = new MediaRecorder(stream, {
    mimeType: "video/webm"
  });

  const chunks = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.start();

  // ▶️ Play frames manually for recording
  let i = 0;
  const speed = playbackSpeedRefClient.current || 1;
  const intervalMs = (1000 / fps) / speed;

  await new Promise((resolve) => {
    const interval = setInterval(() => {
      if (!frames[i]) {
        clearInterval(interval);
        resolve();
        return;
      }

      drawPlaybackC(frames[i], canvas,true);
      i++;
    }, intervalMs);
  });

  recorder.stop();

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);

const safeName = name
  .toLowerCase()
  .replace(/\s+/g, "-")       // spaces → hyphens
  .replace(/[^a-z0-9\-]/g, ""); // remove special chars

const fileName = `c-${safeName}-${now
  .toISOString()
  .slice(2,16)
  .replace(/[-:T]/g,"")}.webm`;

    const a = document.createElement("a");
    a.href = url;
a.download = fileName;

    a.click();

    URL.revokeObjectURL(url);
     recordingNameRefC.current = "";
     recordingCoachNameRefC.current = "";
  recordingTimeRefC.current = null;
    setIsDownloadingC(false);
  };
};
const playClient = () => {
   console.log("playClient" );
  const frames = recordedFramesClientRef.current;
  if (!frames.length) return;

  if (!clientPaused) clientIndexRef.current = 0;

  setClientPlaying(true);
  setClientPaused(false);
    const speed = playbackSpeedRefClient.current; // 0.25, 0.5, 1, 2
  const intervalMs = (1000 / 30) /speed;


  clientIntervalRef.current = setInterval(() => {
    const i = clientIndexRef.current;

    if (frames[i]) {
      drawPlaybackC(frames[i], playbackCanvasClientRef.current);
      clientIndexRef.current++;
    }

    if (clientIndexRef.current >= frames.length) stopClient();
  }, intervalMs);
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





  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-700 p-1">
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
{showExpireBlock && (
 <div className="px-6 fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999]">
  <div className="bg-white p-7 rounded-2xl shadow-2xl max-w-sm w-full text-center border border-red-200 relative">

    {/* Top Close (X icon) */}
    <button
      onClick={() => setShowExpireBlock(false)}
      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
    >
      <X size={18} />
    </button>

    {/* Red Icon */}
    <div className="flex justify-center mb-4">
      <XCircle size={55} className="text-red-500" />
    </div>

    {/* Title */}
    <h2 className="text-2xl font-extrabold text-red-600 mb-3">
      Subscription Expired
    </h2>

    {/* Actual Backend Message */}
      <p>
    on {" "}
    <span className="font- regular ">
      {storedGym?.renewaldate
        ? new Date(storedGym.renewaldate).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "N/A"}
    </span>
  </p>


    {/* Upgrade Button */}
    <button
    onClick={() => {
        setShowExpireBlock(false);
 const stored = JSON.parse(localStorage.getItem("paymentStatus") || "{}");

  if (stored.verified && stored.expiresAt > Date.now()) {
    console.log("✅ Payment already verified and valid");

    setShowDialog(false);
    setShowSuccessDialog(true);
    return; // ⛔ Stop further execution
  }

  // ❌ If expired, clean it
  if (stored.expiresAt && stored.expiresAt <= Date.now()) {
    localStorage.removeItem("paymentStatus");
    console.log("⚠️ Stored payment expired, removed.");
  } 
  //handlePayment(name, email, mobile);
  setShowDialog(true);
}}
      className="mt-6 w-full flex text-white items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-green-500 text-black py-3 rounded-lg font-semibold hover:scale-105 transition"
    >
      🚀 Upgrade Now 
      
    </button>

    {/* Close Button */}
  <button
  onClick={() => setShowExpireBlock(false)}
  className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition"
>
  Close
</button>

  </div>
</div>

)}
{loadingTRequest && (
  <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
    
    <div className="bg-white rounded-2xl shadow-xl px-8 py-6 flex flex-col items-center gap-4">
      
      {/* Spinner */}
      <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>

      {/* Message */}
      <p className="text-gray-700 text-sm font-medium">
        Sending trial request...
      </p>

    </div>

  </div>
)}

{showFreeTrialBox && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 max-w-sm text-center shadow-xl">

      <h3 className="text-lg font-semibold mb-3">
        Free Trial
      </h3>

      <p className="text-gray-600 text-sm mb-5">
        {showFreeTrialBox.message}
      </p>

      <button
        onClick={() => setShowFreeTrialBox(false)}
        className="bg-black text-white px-6 py-2 rounded-lg"
      >
        OK
      </button>

    </div>
  </div>
)}
{showSuccessDialog && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm 
                  flex items-center justify-center z-50 px-4">

    <div className="bg-white rounded-3xl shadow-2xl 
                    max-w-md w-full p-8 text-center animate-fadeIn">

      {/* Animated Tick */}
      <div className="w-20 h-20 mx-auto mb-6 
                      rounded-full bg-green-100 
                      flex items-center justify-center">

        <svg
          className="w-10 h-10 text-green-600 animate-scaleIn"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-800 mb-3">
        Payment Successful 🎾
      </h2>

      {/* Message */}
      
   <p className="text-gray-600 text-sm leading-relaxed mb-6">
  Your payment has been received. Login credentials will be shared 
  <span className="text-red-500 font-semibold"> within 24 hours </span> 
  following account verification to ensure secure account setup.
  <br /><br />
  Please check your email for the payment receipt.
  <br /><br />
  Our team will also contact you to assist with onboarding, if required.
  <br /><br />
  For any queries or feedback, please contact us at 
  <span className="font-semibold text-gray-800"> oxadmedia@gmail.com</span>.
</p>

      {/* Button */}
      <button
        onClick={() => setShowSuccessDialog(false)}
        className="w-full bg-gradient-to-r 
                   from-green-500 to-emerald-600 
                   text-white py-3 rounded-xl font-semibold
                   hover:scale-105 transition duration-300"
      >
        Continue
      </button>

    </div>
  </div>
)}

{loading && (
  <div className="fixed inset-0 bg-black flex flex-col 
                  items-center justify-center z-[9999] text-center">

    {/* Tennis Ball */}
   <div className="relative mb-10">
  <div className="relative w-20 h-20 bg-yellow-400 rounded-full 
                  shadow-2xl animate-tennis overflow-hidden">

    {/* Left curve */}
    <div className="absolute w-24 h-24 border-[6px] border-white 
                    rounded-full -left-10 top-0"></div>

    {/* Right curve */}
    <div className="absolute w-24 h-24 border-[6px] border-white 
                    rounded-full -right-10 top-0"></div>
  </div>

  {/* Shadow */}
  <div className="w-16 h-4 bg-black/40 rounded-full 
                  absolute left-1/2 -translate-x-1/2 top-20 
                  blur-sm animate-pulse"></div>
</div>

    <h2 className="text-white text-2xl font-semibold mb-2">
      Connecting to your bank...
    </h2>

    <p className="text-gray-400">
      Securing your payment 🎾
    </p>
  </div>
)}

{detailshowDialog && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
      <h2 className="text-xl font-semibold">New Session</h2>

      <input
        placeholder="Enter name"
        defaultValue=""
        onChange={(e) => (recordingNameRefC.current = e.target.value)}
        className="w-full border rounded-xl px-3 py-2"
      />

      <textarea
        placeholder="Feedback"
        onChange={(e) => (recordingNoteRefC.current = e.target.value)}
        className="w-full border rounded-xl px-3 py-2"
      />
 <input
        placeholder="Academy/Coach"
        defaultValue=""
        onChange={(e) => (recordingCoachNameRefC.current = e.target.value)}
        className="w-full border rounded-xl px-3 py-2"
      />
     <input
  type="range"
  min="0"
  max="100"
  defaultValue="0"
  onChange={(e) => {
    const val = Number(e.target.value);
    recordingProgressRefC.current = val; // your logic
    setProgressUI(val); // just for display
  }}
  className="w-full"
/>

<p className="text-sm text-gray-600">
  Progress: {progressUI}%
</p>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setdetailShowDialog(false)}
          className="px-4 py-2 border rounded-xl"
        >
          Cancel
        </button>

        <button
          onClick={downloadClientPlayback}

          
          className="px-4 py-2 bg-black text-white rounded-xl"
        >
          Start
        </button>
      </div>
    </div>
  </div>
)}
      {showDialog && (
   <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50">
      <div className="w-full max-w-md bg-white rounded-t-3xl p-6 shadow-2xl max-h-[95vh] overflow-y-auto">

        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Upgrade TennisX Pro
          </h2>
          <p className="text-gray-500 text-sm mt-1">Plans</p>
        </div>

        {/* Currency Toggle */}
          {isLoggedIn && (
        <div className="flex justify-center mb-6">
          <div className="relative flex bg-gray-100 rounded-full p-1 shadow-inner">

            <div
              className={`absolute top-1 bottom-1 w-1/2 rounded-full bg-black transition-all duration-300 ${
                currency === "USD" ? "translate-x-full" : ""
              }`}
            />

            <button
              onClick={() => setCurrency("INR")}
              className={`relative z-10 px-6 py-1.5 text-sm font-medium ${
                currency === "INR" ? "text-white" : "text-gray-600"
              }`}
            >
              ₹ INR
            </button>

            <button
              onClick={() => setCurrency("USD")}
              className={`relative z-10 px-6 py-1.5 text-sm font-medium ${
                currency === "USD" ? "text-white" : "text-gray-600"
              }`}
            >
              $ USD
            </button>

          </div>
        </div>
          )}
        {/* Plans */}
        <div className="space-y-4 mb-6">
          {!isLoggedIn &&(

<div
  onClick={() => setSelectedPlan("trial")}
  className={`relative border-2 rounded-2xl p-5 cursor-pointer transition transform hover:scale-[1.03] ${
    selectedPlan === "trial"
      ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl"
      : "border-gray-200 hover:border-blue-400 hover:shadow-lg"
  }`}
>
  {/* Badge */}
  <span className="absolute -top-3 left-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs px-3 py-1 rounded-full shadow">
    Limited Free Trial
  </span>

  <div className="flex justify-between items-start">
    <div>
      <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
        🎾 2-Day Free Trial
      </h3>

      {/* <p className="text-sm text-gray-600 mt-1">
        Improve your tennis strokes with AI Tracking in just a few days.
      </p> */}

      {/* Trust signal */}
      <p className="text-xs text-green-600 font-medium mt-1">
        ✔ No card required
      </p>

      {/* Skill roadmap */}
     

      {/* Features */}
      {/* <ul className="text-xs text-gray-500 mt-3 space-y-1">
        <li>✔ AI Motion Recording</li>
        <li>✔ Footwork Analysis</li>
        <li>✔ Biomechanics Breakdown</li>
        <li>✔ Skeleton Comparison</li>
        <li>✔ Advanced Playback</li>
      </ul> */}
    </div>

    <div className="text-right">
      <p className="text-2xl font-bold text-blue-600">FREE</p>
      <p className="text-xs text-gray-500">for 2 days</p>
    </div>
  </div>
</div>
          )}
          {/* Strokes Plan */}
             <div
  onClick={() => setSelectedPlan("strokesM")}
  className={`border-2 rounded-2xl p-4 cursor-pointer transition ${
    selectedPlan === "strokesM"
      ? "border-green-500 bg-green-50"
      : "border-gray-200 hover:border-green-400"
  }`}
>
  <div className="flex justify-between items-center">
    <div>
      <h3 className="font-semibold text-gray-800">
        TennisX Pro Monthly
      </h3>

      <p className="text-xs text-gray-500 mt-1">
        Unlimited Motion Recording • Footwork Analysis • Biomechanics Breakdown • Skeleton Comparison • Advanced Playback Control 
      </p>
    </div>

    <div className="text-right">
      <p className="text-lg font-bold text-gray-900">
        {pricing.strokesM[currency].display}
      </p>
      <p className="text-xs text-gray-500"> / month</p>
    </div>
  </div>
</div>
            
<div
  onClick={() => setSelectedPlan("strokesY")}
  className={`relative border-2 rounded-2xl p-4 cursor-pointer transition shadow-sm ${
    selectedPlan === "strokesY"
      ? "border-green-600 bg-green-50"
      : "border-gray-200 hover:border-green-400"
  }`}
>

  {/* Best Value Badge */}
  <span className="absolute -top-2 right-3 bg-green-600 text-white text-[10px] font-semibold px-2 py-1 rounded-full shadow">
    Best Value
  </span>

  <div className="flex justify-between items-center">
    <div>
      <h3 className="font-semibold text-gray-800">
        TennisX Pro Annual
      </h3>

      <p className="text-xs text-gray-500 mt-1">
        Unlimited Motion Recording • Footwork Analysis • Biomechanics Breakdown • Skeleton Comparison • Advanced Playback Control • Priority Customer Support
      </p>
    </div>

    <div className="text-right">
  <p className="text-lg font-bold text-green-700">
    {pricing.strokesY[currency].display}
  </p>

  {/* <p className="text-xs text-gray-500">
    ({currency === "INR" ? "₹1249" : "$13.5"} / month)
  </p> */}
</div>
  </div>
</div>
              

{selectedPlan === "strokesY" && (
  <div className="mt-4">

    {!couponApplied ? (
      <div className="flex justify-between items-center bg-green-50 border border-green-200 rounded-lg p-3">

        <div>
          <p className="text-sm font-semibold text-green-700">
            {coupon.code}
          </p>

          <p className="text-xs text-gray-500">
            {coupon.name} 
            {" "}
            -{currency === "INR" ? "₹" : "$"}
            {coupon.discount[currency]}
          </p>
        </div>

        <button
          onClick={() => setCouponApplied(true)}
          className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
        >
          Apply
        </button>

      </div>
    ) : (
      <div className="flex justify-between items-center bg-green-100 border border-green-300 rounded-lg p-3">

        <div className="text-sm text-green-800">
          {coupon.code} — {coupon.name}
        </div>

        <div className="flex items-center gap-3">
          <span className="font-semibold text-green-700">
            -{currency === "INR" ? "₹" : "$"}
            {coupon.discount[currency]}
          </span>

          <button
            onClick={() => setCouponApplied(false)}
            className="text-xs text-gray-500 hover:text-red-500"
          >
            Cancel
          </button>
        </div>

      </div>
    )}

  </div>
)}

          {/* Radar Plan (Locked) */}
          {/* <div className="border-2 border-gray-200 rounded-2xl p-4 bg-gray-100 opacity-80 cursor-not-allowed">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-700">
                  Radar Speed & Fault Detector
                </h3>
                <p className="text-xs text-red-500 font-medium">
                  Physical setup assistance required
                </p>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-gray-800">
                  {pricing.radar[currency].display}
                </p>
              </div>
            </div>
          </div> */}

        </div>

        {/* Inputs */}
        <input
          type="text"
          placeholder="Full Name*"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-200 p-3 rounded-xl mb-3"
        />

        <input
          type="email"
          placeholder="Email Address*"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-200 p-3 rounded-xl mb-3"
        />

        <input
          type="tel"
          placeholder="Mobile Number*"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="w-full border border-gray-200 p-3 rounded-xl mb-5"
        />

        {/* Upgrade Button */}
         <button
  onClick={() =>
    selectedPlan === "trial"
      ? startFreeTrial(name, email, mobile)
      : handlePayment(name, email, mobile)
  }
  disabled={loading}
  className="w-full bg-gradient-to-r from-yellow-400 to-green-500 text-black py-3 rounded-xl font-semibold hover:scale-105 transition duration-300 disabled:opacity-50"
>
  {loading
    ? "Processing..."
    : selectedPlan === "trial"
    ? "Start Free Trial"
    : "Upgrade Now"}
</button>

        <button
          onClick={() => setShowDialog(false)}
          className="w-full mt-4 text-gray-400 text-sm"
        >
          Cancel
        </button>

      </div>
    </div>
)}


      <div className="bg-gray-900 rounded-2xl shadow-xl px-5 py-6 w-full max-w-4xl space-y-6">
         <div className="flex justify-between items-center flex-wrap gap-3">

  {/* Back Button */}
  <button
     onClick={() => {
    if (window.history.length > 1) {
    //   navigate(-1);  
    // } else {
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

  {/* Upgrade Button */}
 {(isExpired || !isLoggedIn) && (
  <button
    onClick={() =>{
 const stored = JSON.parse(localStorage.getItem("paymentStatus") || "{}");
sendSessionEvent("Start Free Trial Clicked");

  if (stored.verified && stored.expiresAt > Date.now()) {
    console.log("✅ Payment already verified and valid");

    setShowDialog(false);
    setShowSuccessDialog(true);
    return; // ⛔ Stop further execution
  }

  // ❌ If expired, clean it
  if (stored.expiresAt && stored.expiresAt <= Date.now()) {
    localStorage.removeItem("paymentStatus");
    console.log("⚠️ Stored payment expired, removed.");
  }
  //handlePayment(name, email, mobile);
setShowDialog(true)
    } }
    className="px-6 py-2.5 rounded-full font-semibold text-black
               bg-gradient-to-r from-yellow-400 to-green-500
               hover:from-yellow-500 hover:to-green-600
               transition-all duration-300
               shadow-md hover:shadow-xl
               hover:scale-105 active:scale-95"
  >
    {isLoggedIn ? "🚀 Upgrade to Pro" : "🎁 Start Free Trial"}
  </button>
)}

</div>

          <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-white">
    <span className="bg-blue-600 text-white text-sm px-2 py-1 rounded-md">TennisX AI</span>
    Real-Time Stroke Tracker
  </h2>
  {/* <div className="bg-black/40 backdrop-blur-md rounded-xl p-5 border border-yellow-500/20 shadow-lg">
  <h3 className="text-md font-semibold mb-3 text-yellow-400">
    📌 How to Use
  </h3>

  <ul className="space-y-3 text-sm text-gray-200 leading-relaxed">
   <li>1️⃣ Position your camera so your full body and racket path are clearly visible within the frame.</li>
<li>2️⃣ Select the stroke you want to analyze (Forehand, Backhand, Serve, Volley, etc.).</li>
<li>3️⃣ Tap <span className="text-yellow-400 font-semibold">Start</span> to initiate biomechanical tracking.</li>
<li>4️⃣ Perform the stroke slowly as a controlled shadow swing (without the ball) to ensure accurate motion detection.</li>
<li>5️⃣ Stay centered in the frame and maintain proper balance, sequencing, and technique throughout the movement.</li>
<li>6️⃣ Your motion will be processed to generate a skeletal model highlighting joint movements and rotation.</li>
<li>7️⃣ Review the analysis to identify inefficiencies in timing, hip-shoulder separation, contact positioning, and follow-through, then refine accordingly.</li>
    </ul>
</div> */}
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
      Learner
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
  onClick={isRecording ? stopRecording : checkLogin}
  className={`flex items-center justify-center gap-3 px-8 py-4 rounded-full font-semibold text-white transition-all duration-200 ${
    isRecording
      ? "bg-red-600 hover:bg-red-700"
      : "bg-green-600 hover:bg-green-700"
  }`}
>
  {isRecording ? (
    <>
      <Square size={20} />
      Stop Recording
    </>
  ) : (
    <>
      <Circle size={20} className="animate-pulse" />
      Start Recording
    </>
  )}
</button>
<button
  onClick={() => {
    showMetricsRef.current = !showMetricsRef.current;
    setMetricsUI(showMetricsRef.current);
  }}
  className={`px-4 py-2 rounded-lg text-sm font-medium 
              transition-all duration-150 active:scale-95 shadow-md
              ${
                metricsUI
                  ? "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white"
                  : "border-2 border-red-600 text-red-500 hover:bg-red-600/10"
              }`}
>
  {metricsUI ? "Metrics ON" : "Metrics OFF"}
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


    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-1 bg-gradient-to-br from-gray-900 via-black to-gray-900 min-h-screen">

  {/* ================= TRAINER ================= */}
  <div className="backdrop-blur-lg bg-white/5 border border-blue-500/30 rounded-2xl p-6 shadow-2xl">

    <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
      Trainer Skeleton
    </h2>

    {/* Controls */}
    <div className="space-y-4">

      {/* Session Select */}
      <select
        value={selectedSessionId}
        onChange={(e) => {
          setSelectedSessionId(e.target.value)
          console.log("Loaded session:", e.target.value);
        }}
        className="w-full p-3 rounded-xl bg-black/40 border border-blue-400/40 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select trainer session</option>
        {trainerSessions.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} ({new Date(s.createdAt).toLocaleDateString()})
          </option>
        ))}
      </select>

      {/* Speed Select */}
      <select
        defaultValue="1"
        onChange={(e) => {
          playbackSpeedRef.current = Number(e.target.value);
          if (trainerPlaying) {
            stopTrainer();
            playTrainer();
          }
        }}
        className="w-full p-3 rounded-xl bg-black/40 border border-blue-400/40 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="0.1">0.1× Ultra Slow</option>
        <option value="0.2">0.2× Slow</option>
        <option value="0.3">0.3× Slow</option>
        <option value="0.5">0.5× Slow</option>
        <option value="1">1× Normal</option>
      </select>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
  onClick={() => {
    if (!trainerPlaying && !trainerPaused) playTrainer();
    else if (trainerPlaying) pauseTrainer();
    else playTrainer();
  }}
  disabled={!trainerReady}
  className={`flex items-center text-white justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
    trainerPlaying
      ? "bg-yellow-500 hover:bg-yellow-600"
      : "bg-blue-600 hover:bg-blue-700"
  } disabled:opacity-40`}
>
  {trainerPlaying ? (
    <>
      <Pause size={18} />
      Pause
    </>
  ) : trainerPaused ? (
    <>
      <Play size={18} />
      Resume
    </>
  ) : (
    <>
      <Play size={18} />
      Play
    </>
  )}
</button>


<button
  onClick={removeTrainer}
  disabled={!trainerReady}
  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold border border-red-500 text-red-400 hover:bg-red-600 hover:text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
>
  <Trash2 size={18} />
  Remove
</button>
      </div>
 <div className="flex gap-2">

<button
  onClick={() => {

    if (showSwingArcRef.current) {

      if (currentPathRef.current.length > 2) {
        allPathsRef.current.push([...currentPathRef.current]);
      }

      currentPathRef.current = [];
      showSwingArcRef.current = false;
      setArcEnabled(false);

    } else {

      currentPathRef.current = [];
      showSwingArcRef.current = true;
      setArcEnabled(true);

    }

  }}
  className="px-4 py-2 bg-cyan-600 text-white rounded-lg"
>
  Swing Arc: {arcEnabled ? "ON" : "OFF"}
</button>

<button
  onClick={() => {
    allPathsRef.current = [];
    currentPathRef.current = [];
  }}
  className="px-4 py-2 bg-red-600 text-white rounded-lg"
>
  Clear Arcs
</button>

</div>
    </div>

    {/* Canvas */}
    <div className="mt-8 relative aspect-[9/16] rounded-2xl overflow-hidden border border-blue-500/40 shadow-inner bg-black">
      <canvas
        ref={playbackCanvasRef}
        className="w-full h-full"
      />
    </div>
  </div>

  {/* ================= LEARNER ================= */}
  <div className="backdrop-blur-lg bg-white/5 border border-green-500/30 rounded-2xl p-6 shadow-2xl">

    <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
      Learner Skeleton
    </h2>

    <div className="space-y-4">

      {/* Speed Select */}
      <select
        defaultValue="1"
        onChange={(e) => {
          playbackSpeedRefClient.current = Number(e.target.value);
          if (clientPlaying) {
            stopClient();
            playClient();
          }
        }}
        className="w-full p-3 rounded-xl bg-black/40 border border-green-400/40 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="0.1">0.1× Ultra Slow</option>
        <option value="0.2">0.2× Slow</option>
        <option value="0.3">0.3× Slow</option>
        <option value="0.5">0.5× Slow</option>
        <option value="1">1× Normal</option>
      </select>

      {/* Play Button */}
    <button
    
  onClick={() => {
    if (!clientPlaying && !clientPaused) playClient();
    else if (clientPlaying) pauseClient();
    else playClient();
  }}
  disabled={recordedFramesClientRef.current.length === 0 || isDownloadingC}
  className={`w-full flex items-center text-white justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-200 ${
    clientPlaying
      ? "bg-yellow-500 hover:bg-yellow-600"
      : "bg-green-600 hover:bg-green-700"
  } disabled:opacity-40 disabled:cursor-not-allowed`}
>
  {clientPlaying ? (
    <>
      <Pause size={18} />
      Pause
    </>
  ) : clientPaused ? (
    <>
      <Play size={18} />
      Resume
    </>
  ) : (
    <>
      <Play size={18} />
      Play
    </>
  )}
</button>
<button
  onClick={fetchdetailsofClient}
  disabled={recordedFramesClientRef.current.length === 0 || isDownloadingC}
  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40"
>
  {isDownloadingC ? (
    <>
      ⏳ Downloading...
    </>
  ) : (
    <>
      ⬇️ Download Video
    </>
  )}
</button>
 <div className="flex gap-2">

<button
  onClick={() => {

    if (showSwingArcRefC.current) {

      if (currentPathRefC.current.length > 2) {
        allPathsRefC.current.push([...currentPathRefC.current]);
      }

      currentPathRefC.current = [];
      showSwingArcRefC.current = false;
      setArcEnabledC(false);

    } else {

      currentPathRefC.current = [];
      showSwingArcRefC.current = true;
      setArcEnabledC(true);

    }

  }}
  className="px-4 py-2 bg-cyan-600 text-white rounded-lg"
>
  Swing Arc: {arcEnabledC ? "ON" : "OFF"}
</button>

<button
  onClick={() => {
    allPathsRefC.current = [];
    currentPathRefC.current = [];
  }}
  className="px-4 py-2 bg-red-600 text-white rounded-lg"
>
  Clear Arcs
</button>

</div>
    </div>

    {/* Canvas */}
    <div className="mt-8 relative aspect-[9/16] rounded-2xl overflow-hidden border border-green-500/40 shadow-inner bg-black">
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
