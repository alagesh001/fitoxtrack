import React, { useRef, useState, useEffect } from "react";
import { Pose } from "@mediapipe/pose";
import { useLocation,useNavigate } from "react-router-dom";
import { XCircle, ArrowUpRight,X } from "lucide-react";

import { Navigate } from "react-router-dom";
export default function VideoPoseSingleScreen() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const rafRef = useRef(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("strokes");
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
const [brightness, setBrightness] = useState(1);
const [contrast, setContrast] = useState(1);
const [currentTime, setCurrentTime] = useState(0);
const [duration, setDuration] = useState(0);
const [showMetrics, setShowMetrics] = useState(true);
const showMetricsRef = useRef(true);
const [metricsUI, setMetricsUI] = useState(true);
 const navigate = useNavigate();
    const location = useLocation();
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
   if (!location.state?.fromButton) {
  return <Navigate to="/ai-hub/" replace />;
}
useEffect(() => {
  window.scrollTo({
    top: 0,
    behavior: "smooth", // remove this if you want instant scroll
  });
}, []);
const isLoggedIn = localStorage.getItem("isLoggedInWeb") === "true";
    const [showExpireBlock, setShowExpireBlock] = useState(false);

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
}  // ---------- Upload ----------
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setVideoURL(url);
  };
  useEffect(() => {
  const video = videoRef.current;
  if (!video) return;

  let animationFrameId;

  const update = () => {
    if (!video.paused && !video.ended) {
      setCurrentTime(video.currentTime);
    }
    animationFrameId = requestAnimationFrame(update);
  };

  animationFrameId = requestAnimationFrame(update);

  const setMeta = () => {
    setDuration(video.duration || 0);
  };

  video.addEventListener("loadedmetadata", setMeta);

  return () => {
    cancelAnimationFrame(animationFrameId);
    video.removeEventListener("loadedmetadata", setMeta);
  };
}, [videoURL]);
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
const formatTime = (time) => {
  if (!time) return "0:00";
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};
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
    const isLoggedIn =
    localStorage.getItem("isLoggedInWeb") === "true";
console.log("expired ",isExpired);
  if (isLoggedIn) {
    if(isExpired){
      setShowExpireBlock(true);
      return;
    }
  }else{
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
    return;
  }

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
      "https://tennisx.in/api/razorpay/create-order",
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
// useEffect(() => {
//   if (!recordedLandmarks || recordedLandmarks.length === 0) return;

//   const canvas = playbackCanvasRef.current;
//   const ctx = canvas.getContext("2d");

//   canvas.width = canvasRef.current.width;
//   canvas.height = canvasRef.current.height;

//   let frameIndex = 0;
//   let startTime = performance.now();

//   const play = (now) => {
//     if (frameIndex >= recordedLandmarks.length) return;

//     const elapsed = (now - startTime) / 1000; // seconds
//     const frame = recordedLandmarks[frameIndex];

//     if (elapsed >= frame.time) {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       const lm = frame.landmarks.map(p => ({
//         x: p[0],
//         y: p[1],
//         z: p[2],
//         visibility: p[3]
//       }));

//       drawLandmarks(ctx, { poseLandmarks: lm });

//       frameIndex++;
//     }

//     playbackRAFRef.current = requestAnimationFrame(play);
//   };

//   playbackRAFRef.current = requestAnimationFrame(play);

//   return () => cancelAnimationFrame(playbackRAFRef.current);
// }, [recordedLandmarks]);
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
  ctx.font = "bold 28px Arial";
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.fillText(`Shoulder Rot: ${shoulderRotation.toFixed(1)}°`, 30, 50);
  ctx.fillText(`Hip Rot: ${hipRotation.toFixed(1)}°`, 30, 90);

  ctx.fillStyle = "rgba(255, 0, 242, 0.95)";
  ctx.fillText(`L Arm: ${leftArmAngle.toFixed(1)}°`, 30, 140);

  ctx.fillStyle = "rgba(255, 238, 0, 0.95)";
  ctx.fillText(`R Arm: ${rightArmAngle.toFixed(1)}°`, 30, 180);

  ctx.fillStyle = "rgba(0, 255, 150, 0.95)";
  ctx.fillText(`L Knee: ${leftKneeAngle.toFixed(1)}°`, 30, 230);

  ctx.fillStyle = "rgba(0, 200, 255, 0.95)";
  ctx.fillText(`R Knee: ${rightKneeAngle.toFixed(1)}°`, 30, 270);
  

if (leftSW !== null) {
  ctx.fillStyle = "rgba(255, 0, 242, 0.95)";
  ctx.fillText(`L Shoulder-Wrist: ${leftSW.toFixed(1)} px`, 30, 320);
}

if (rightSW !== null) {
  ctx.fillStyle = "rgba(255, 238, 0, 0.95)";
  ctx.fillText(`R Shoulder-Wrist: ${rightSW.toFixed(1)} px`, 30, 350);
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
drawExtendedAxis(11, 12, "rgba(255, 72, 0, 0.3)", false);

// Hips (dotted orange/red)
drawExtendedAxis(23, 24, "rgba(255, 120, 0, 0.3)", true);
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

  // Draw measurement text at midpoint
  ctx.font = "14px Arial";
  ctx.fillStyle = color;
  ctx.fillText(
    `${distance.toFixed(1)} px`,
    (a.x + b.x) / 2,
    (a.y + b.y) / 2
  );
};

// LEFT SIDE
drawConnectionWithDistance(15, 11, "rgba(255, 13, 53, 0.3)"); // wrist → shoulder
drawConnectionWithDistance(15, 23, "rgba(255, 13, 53, 0.4)"); // wrist → hip

// RIGHT SIDE
drawConnectionWithDistance(16, 12, "rgba(13, 255, 134, 0.3)"); // wrist → shoulder
drawConnectionWithDistance(16, 24, "rgba(13, 255, 134, 0.4)"); // wrist → hip
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
  ctx.font = "16px Arial";
  ctx.fillStyle = "white";
  ctx.fillText(
    `Heel Distance: ${distance.toFixed(1)} px`,
    (a.x + b.x) / 2 - 50,
    (a.y + b.y) / 2 - 10
  );
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

    <div className="w-full max-w-md bg-white rounded-t-3xl p-6 animate-slideUp shadow-2xl max-h-[95vh] overflow-y-auto">

      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Upgrade TennisX Pro
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Plans
        </p>
      </div>

      {/* Plan Selection */}
      <div className="space-y-4 mb-6">

        {/* Strokes Motion Tracker */}
        <div
          onClick={() => setSelectedPlan("strokes")}
          className={`border-2 rounded-2xl p-4 cursor-pointer transition ${
            selectedPlan === "strokes"
              ? "border-green-500 bg-green-50"
              : "border-gray-200 hover:border-green-400"
          }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-800">
                Strokes Motion Tracker
              </h3>
              <p className="text-xs text-green-600 font-medium">
                In Stock
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Unlimited motion recordings • Skeleton comparison • Playback control
              </p>
            </div>

            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">₹4999</p>
              <p className="text-xs text-gray-500">/ year</p>
            </div>
          </div>
        </div>

        {/* Speed & Fault Detector (Locked) */}
        <div className="border-2 border-gray-200 rounded-2xl p-4 bg-gray-100 opacity-80 cursor-not-allowed">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-700">
                Rador Speed & Fault Detector
              </h3>
              <p className="text-xs text-red-500 font-medium">
                Physical setup assistance required
              </p>
              <p className="text-xs text-gray-500">
                Offline setup only (Not selectable)
              </p>
            </div>

            <div className="text-right">
              <p className="text-lg font-bold text-gray-800">₹22999</p>
              {/* <p className="text-xs text-gray-500">/ year</p> */}
            </div>
          </div>
        </div>

      </div>

      {/* User Inputs */}
    <input
  type="text"
  placeholder="Full Name*"
  value={name}
  onChange={(e) => setName(e.target.value)}
  className="w-full border border-gray-200
             text-black
             placeholder-gray-400
             focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200
             p-3 rounded-xl mb-3 outline-none transition"
/>

     <input
  type="email"
  placeholder="Email Address*"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="w-full bg-white text-gray-900 placeholder-gray-400
             border border-gray-200
             focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200
             p-3 rounded-xl mb-3 outline-none transition"
/>

<input
  type="tel"
  placeholder="Mobile Number*"
  value={mobile}
  onChange={(e) => setMobile(e.target.value)}
  className="w-full bg-white text-gray-900 placeholder-gray-400
             border border-gray-200
             focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200
             p-3 rounded-xl mb-5 outline-none transition"
/>
      {/* Upgrade Button */}
      <button
        onClick={() => handlePayment(name, email, mobile, selectedPlan)}
        disabled={loading || selectedPlan !== "strokes"}
        className="w-full bg-gradient-to-r from-yellow-400 to-green-500 text-black py-3 rounded-xl font-semibold hover:scale-105 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="w-full flex items-center justify-between">

  {/* Back Button */}
  <button
    onClick={() => {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate("/ai-hub");
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
      onClick={() => {
        const stored = JSON.parse(localStorage.getItem("paymentStatus") || "{}");

        if (stored.verified && stored.expiresAt > Date.now()) {
          setShowDialog(false);
          setShowSuccessDialog(true);
          return;
        }

        if (stored.expiresAt && stored.expiresAt <= Date.now()) {
          localStorage.removeItem("paymentStatus");
        }

        setShowDialog(true);
      }}
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
    Rally Tracker
  </h2>
  <div className="bg-black/40 backdrop-blur-md rounded-xl p-5 border border-yellow-500/20 shadow-lg">
  <h3 className="text-md font-semibold mb-3 text-yellow-400">
    📌 How to Use
  </h3>

 <ul className="space-y-3 text-sm text-gray-200 leading-relaxed">
  <li>1️⃣ Upload your stroke video ensuring your full body is clearly visible within the frame.</li>

  <li>2️⃣ Adjust the <span className="text-yellow-400 font-semibold">brightness</span> if needed for clearer joint detection and visibility.</li>

  <li>3️⃣ The system will generate a skeletal model and automatically calculate key <span className="text-yellow-400 font-semibold">joint angles</span> including arm and knee positions.</li>

  <li>4️⃣ Analyze <span className="text-yellow-400 font-semibold">shoulder-to-wrist</span> and <span className="text-yellow-400 font-semibold">hip-to-wrist</span> alignment to evaluate swing structure and extension.</li>

  <li>5️⃣ Review <span className="text-yellow-400 font-semibold">shoulder and hip alignment axes</span> to understand upper and lower body rotation.</li>

  <li>6️⃣ Observe your <span className="text-yellow-400 font-semibold">footwork and knee bend</span> to assess balance, loading, and stability.</li>

  <li>7️⃣ Use the visual metrics and overlays to refine timing, body sequencing, and overall stroke mechanics.</li>
</ul>
</div>
      {/* Upload */}
 <div className="mt-5 mb-5">
  <label className="inline-block">
    <input
      type="file"
      accept="video/*"
      onChange={handleVideoUpload}
      className="hidden"
    />

    <span
      className="cursor-pointer bg-blue-600 hover:bg-blue-700 
                 active:scale-95 active:bg-blue-800
                 transition-all duration-150
                 px-6 py-3 rounded-xl shadow-lg
                 text-white font-medium text-sm"
    >
      Upload Video
    </span>
  </label>
</div>
      {/* Show only after upload */}
        <>
          {/* Speed */}
        

          {/* Video + Canvas Overlay */}
          {isMobile && (
  <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 
                border border-orange-400/30 
                rounded-2xl p-5 mt-6 shadow-lg backdrop-blur-md">
  
  <div className="flex gap-4 items-start">
    <div className="text-2xl">💻</div>
    
    <div>
      <h3 className="text-lg font-semibold text-orange-400">
        Optimize Your Analytics Experience
      </h3>
      
      <p className="text-sm text-gray-300 mt-2 leading-relaxed">
        For the most accurate motion tracking and real-time performance analysis,
        we recommend using a 
        <span className="font-semibold text-orange-400"> desktop </span>
        or 
        <span className="font-semibold text-orange-400"> laptop </span>
        device. Mobile devices may experience reduced frame processing speed.
      </p>
    </div>
  </div>
</div>
          )}
     
    <div className="w-full max-w-xl space-y-4">

  {/* Video + Canvas */}
 <div className="relative w-full max-w-xl">
  <video
    ref={videoRef}
    src={videoURL}
    playsInline
    muted
    className="w-full rounded-lg bg-black transition-all duration-200"
    style={{
      opacity: 0.5,
      filter: `brightness(${brightness}) contrast(${contrast})`
    }}
  />

  <canvas
    ref={canvasRef}
    className="absolute top-0 left-0 w-full h-full pointer-events-none"
  />
  
</div>

<div className="flex items-center justify-between gap-6 
                bg-gray-800/60 backdrop-blur-md 
                px-6 py-3 rounded-xl shadow-lg border border-gray-700">

  {/* Metrics Toggle */}
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

  {/* Divider */}
  <div className="h-6 w-px bg-gray-600" />

  {/* Playback Speed */}
  <div className="flex items-center gap-3">
    <span className="text-sm text-gray-300 font-medium">
      Speed
    </span>

    <select
      value={playbackRate}
      onChange={(e) => setPlaybackRate(Number(e.target.value))}
      className="bg-gray-900 border border-gray-600 
                 px-3 py-1.5 rounded-lg text-sm
                 focus:outline-none focus:ring-2 focus:ring-indigo-500
                 hover:border-indigo-400 transition"
    >
      <option value={0.1}>0.1x</option>
      <option value={0.2}>0.2x</option>
      <option value={0.3}>0.3x</option>
      <option value={0.5}>0.5x</option>
      <option value={0.8}>0.8x</option> {/* fixed */}
      <option value={1}>1x</option>
    </select>
  </div>

</div>
  {/* Controls */}
  <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl text-white space-y-4 shadow-lg">

    {/* Play / Pause */}
    <div className="flex gap-3">
      <button
        onClick={handlePlayPause}
        className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded-lg"
      >
        {isPlaying ? "Pause" : "Play"}
      </button>

      <button
        onClick={() => videoRef.current.currentTime = 0}
        className="flex-1 bg-gray-700 hover:bg-gray-800 py-2 rounded-lg"
      >
        Reset
      </button>
    </div>

    {/* Timeline Seek */}
   <div>
  <label className="text-xs opacity-70">
    Timeline ({formatTime(currentTime)} / {formatTime(duration)})
  </label>

  <input
  type="range"
  min="0"
  max={duration || 0}
  step="0.05"
  value={currentTime}
  onChange={(e) => {
    const time = Number(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  }}
  className="w-full accent-white"
/>
</div>

    {/* Opacity */}
    <div>
      <label className="text-xs opacity-70">Video Opacity</label>
      <input
        type="range"
        min="0"
        max="100"
        defaultValue="50"
        onChange={(e) => {
          videoRef.current.style.opacity = e.target.value / 100;
        }}
        className="w-full accent-green-400"
      />
    </div>

    {/* Brightness Toggle */}
<div className="flex justify-between items-center">
  <span className="text-xs opacity-70">High Brightness</span>
  <button
    onClick={() =>
      setBrightness((b) => (b === 1 ? 1.4 : 1))
    }
    className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded-lg text-xs"
  >
    {brightness === 1 ? "Enable" : "Disable"}
  </button>
</div>

    {/* Contrast Toggle */}
<div className="flex justify-between items-center">
  <span className="text-xs opacity-70">High Contrast</span>
  <button
    onClick={() =>
      setContrast((c) => (c === 1 ? 1.5 : 1))
    }
    className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded-lg text-xs"
  >
    {contrast === 1 ? "Enable" : "Disable"}
  </button>
</div>

  </div>
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
     
    </div>
  );
}