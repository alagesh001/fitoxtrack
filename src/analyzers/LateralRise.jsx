import React, { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { useLocation,useNavigate } from "react-router-dom";
import { openPoseDB,saveTrainerSession,downloadTrainerSessionsJSON,getAllTrainerSessions,deleteTrainerSessionById,getPoseSessionById,clearTrainerSessions } from "../helper/trackerdb";
import jsonSessions  from "../helper/trainer-sessions.json";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Circle, Trash2 ,Square } from "lucide-react";

const LiveSkeletonTracker = () => {
    const location = useLocation();
const { facing = "user" } = location.state || {}; // ✅ DIRECT READ
const [facingMode, setFacingMode] = useState(facing);
const [trainerReady, setTrainerReady] = useState(false);
const clientFpsRef = useRef(30); // default
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [mobile, setMobile] = useState("");
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
const [loading, setLoading] = useState(false);
const [showSuccessDialog, setShowSuccessDialog] = useState(false);

const playbackSpeedRef = useRef(1);
const playbackSpeedRefClient = useRef(1);
const isLoggedIn = localStorage.getItem("isLoggedInWeb") === "true";

const clientIndexRef = useRef(0);
  const poseRef = useRef(null);
    const [lastSessionId, setLastSessionId] = useState("");
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
      "https://oxadmedia.online/api/razorpay/create-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, mobile }),
      }
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
      key: "rzp_live_SIk4XqCcjDia3U",
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,

      name: "Oxad Media",
      description: "Free Trial Payment",

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
            "https://oxadmedia.online/api/razorpay/verify-payment",
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


const checkLogin = () => {
  const isLoggedIn =
    localStorage.getItem("isLoggedInWeb") === "true";

  if (isLoggedIn) {
   startRecording();
    return;
  }
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
const drawPlayback = (frame, canvas) => {
  if (!frame || !canvas) return;

  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

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
const drawPlaybackC = (landmarks, canvas) => {
  if (!landmarks || !canvas) return;

  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

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
  drawConnections(CENTER_CONNECTIONS, "rgba(0, 225, 255, 0.9"); // Center = Green

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
};


const playClient = () => {
   console.log("playClient" );
  const frames = recordedFramesClientRef.current;
  if (!frames.length) return;

  if (!clientPaused) clientIndexRef.current = 0;

  setClientPlaying(true);
  setClientPaused(false);
    const speed = playbackSpeedRefClient.current; // 0.25, 0.5, 1, 2
  const intervalMs = (1000 / 60) /speed;


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


{showDialog && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50">

    <div className="w-full max-w-md bg-white rounded-t-3xl p-6 animate-slideUp shadow-2xl">

      {/* Header */}
      <div className="text-center mb-6">

        <div className="inline-block px-4 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full mb-3">
          1-Month Pro Plan
        </div>

        <h2 className="text-2xl font-bold text-gray-800">
          Upgrade to Pro
        </h2>

        <p className="text-gray-500 text-sm mt-1">
          Complete access for 30 days
        </p>

        {/* Price */}
        <div className="mt-4">
          <span className="text-3xl font-bold text-gray-900">
            ₹2999
          </span>
          <span className="text-sm text-gray-500 ml-1">
            / month
          </span>
        </div>

      </div>

      {/* Features */}
      <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm text-gray-600 space-y-2">
        <p>✔ Unlimited motion recordings</p>
        <p>✔ Skeleton comparison analysis</p>
        <p>✔ Playback speed control</p>
        <p>✔ Session storage</p>
      </div>

      {/* Inputs */}
      <input
        type="text"
        placeholder="Full Name*"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 p-3 rounded-xl mb-3 outline-none transition"
      />

      <input
        type="email"
        placeholder="Email Address*"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 p-3 rounded-xl mb-3 outline-none transition"
      />

      <input
        type="tel"
        placeholder="Mobile Number*"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
        className="w-full border border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 p-3 rounded-xl mb-5 outline-none transition"
      />

      {/* Upgrade Button */}
      <button
        onClick={() => handlePayment(name, email, mobile)}
        disabled={loading}
        className="w-full bg-gradient-to-r from-yellow-400 to-green-500 text-black py-3 rounded-xl font-semibold hover:scale-105 transition duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : "Upgrade Now"}
      </button>

      {/* Cancel */}
      <button
        onClick={() => setShowDialog(false)}
        className="w-full mt-4 text-gray-400 text-sm hover:text-gray-600 transition"
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

  {/* Upgrade Button */}
 {!isLoggedIn && (
  <button
    onClick={() => setShowDialog(true)}
    className="px-6 py-2.5 rounded-full font-semibold text-black
               bg-gradient-to-r from-yellow-400 to-green-500
               hover:from-yellow-500 hover:to-green-600
               transition-all duration-300
               shadow-md hover:shadow-xl
               hover:scale-105 active:scale-95"
  >
    🚀 Upgrade to Pro
  </button>
)}

</div>

          <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-white">
    <span className="bg-blue-600 text-white text-sm px-2 py-1 rounded-md">TennisX AI</span>
    Real-Time Stroke Tracker
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
  disabled={recordedFramesClientRef.current.length === 0}
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
