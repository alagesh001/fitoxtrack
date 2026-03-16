import React, { useState,useEffect,useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { showUpgradePopup } from './helper/reuse.js';
import { toast } from "react-toastify";
import myBackground from "./assets/fitgymbg.jpg";
import settingIcon from "./assets/settings.png";
import { XCircle, ArrowUpRight,X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import xlogo from "./assets/logo.webp";

export default function AIhubHere() {
  const [active, setActive] = useState(null);
  const navigate = useNavigate();
const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [loadingpay, setLoadingPay] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
const [progress, setProgress] = useState(0);
    const [selectedGym, setSelectedGym] = useState(null);
const [accessToken, setAccessToken] = useState(null);
const [authErrorMsg, setAuthErrorMsg] = useState("");
  const token = localStorage.getItem("accessToken");
  const storedGym = localStorage.getItem("selectedGym");
const isLoggedIn = localStorage.getItem("isLoggedInWeb") === "true";
const [couponCode, setCouponCode] = useState("");
const [couponStatus, setCouponStatus] = useState(null);
const [couponLoading, setCouponLoading] = useState(false);
const [appliedCoupon, setAppliedCoupon] = useState(null);
const [selectedPlan, setSelectedPlan] = useState(
  isLoggedIn ? "strokes" : "trial"
);
    const [showExpireBlock, setShowExpireBlock] = useState(false);
      const [typeIs, setTypeIs] = useState("");
const [currency, setCurrency] = useState("INR");
  const storedparseGym = JSON.parse(localStorage.getItem("selectedGym") || "{}");
const today = new Date();
today.setHours(0, 0, 0, 0);

const expiry = new Date(storedparseGym?.renewaldate);
expiry.setHours(0, 0, 0, 0);

let isExpired = true; // default to expired

if (isLoggedIn && storedparseGym?.renewaldate) {
  const expiry = new Date(storedparseGym.renewaldate);
  expiry.setHours(0, 0, 0, 0);

  isExpired = expiry < today;
}  // ---------- Upload ----------
useEffect(() => {

  if (storedGym) {
    try {
      const parsedGym = JSON.parse(storedGym);
      setSelectedGym(parsedGym);
    } catch (err) {
      console.error("❌ Invalid gym data in localStorage");
      localStorage.removeItem("selectedGym");
    }
  }

  if (token) {
    setAccessToken(token);
  }
}, []);
const [verifiedCoupon, setVerifiedCoupon] = useState(null);
const [couponApplied, setCouponApplied] = useState(false);
const coupon = {
  code: "FIRST1000",
  name: "First Time User Offer",
  discount: {
    INR: 1000,
    USD: 12
  }
};
const verifyCoupon = () => {

  if (couponCode === "FIRST1000") {
    setVerifiedCoupon({
      code: "FIRST1000",
      name: "First Time User Offer",
      discount: 1000
    });
    setCouponStatus(null);
  } else {
    setVerifiedCoupon(null);
    setCouponStatus({
      type: "error",
      message: "Invalid coupon"
    });
  }

};
// const verifyCoupon = async () => {
//   if (!couponCode) return;

//   setCouponLoading(true);
//   setCouponStatus(null);

//   try {
//     const res = await fetch("https://tennisx.in/api/coupon_verify", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({ code: couponCode })
//     });

//     const data = await res.json();

//     if (data.valid) {
      
//       setAppliedCoupon(null);
//       setVerifiedCoupon(Number(data.coupon)); 
//       setCouponStatus({ type: "success", message: "Coupon applied!" });
//     } else {
//       setAppliedCoupon(null);
//       setVerifiedCoupon(null); 
//       setCouponStatus({ type: "error", message: data.message });
//     }

//   } catch (err) {
//     setCouponStatus({ type: "error", message: "Server error" });
//   }

//   setCouponLoading(false);
// };

  const [showAuthBlock, setShowAuthBlock] = useState(false);
  const squatRef = useRef(null);
const bicepRef = useRef(null);
const lateralRef = useRef(null);
const speedetref = useRef(null);
const lateralUploadref = useRef(null);
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
 useEffect(() => {

  let sessionId = localStorage.getItem("tx_session");

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("tx_session", sessionId);
  }

  fetch("https://tennisx.in/api/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      isp: "TennisX",
      session_id: sessionId,
      page: window.location.pathname
    })
  }).catch(() => {});

}, []);
const lateralSideRef = useRef(null);
const panelRefs = useRef({});
 const [backgroundImage, setBackgroundImage] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
    const [facingMode, setFacingMode] = useState("user"); // 'user' or 'environment'
      const apiBase = "https://tennisx.in";
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

const handleNavigation = (type) => {
      console.log("tps b ",type);

  if (type === "lateral") {
    navigate("/lateral-ai", {
      state: {
        fromButton: true,
        facing: facingMode },
    });
  }

  if (type === "lateralupload") {
    navigate("/upload-ai", {
      state: {
        fromButton: true,
        facing: facingMode },
    });
  }

  if (type === "speeddet") {
    navigate("/speedd-ai",{
      state: {
        fromButton: true,
        facing: facingMode },
    });
  }
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
   
 setLoadingPay(true);
  // Ensure mobile is 10 digits only
  mobile = mobile.replace(/\D/g, "").slice(-10);

  const sdkLoaded = await loadRazorpayScript();

  if (!sdkLoaded) {
    setLoadingPay(false);
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
}),     }
    );

    if (!orderRes.ok) {
      setLoadingPay(false);
      throw new Error("Order creation request failed");
    }

    const order = await orderRes.json();

    if (!order || !order.id) {
      setLoadingPay(false);
      alert("Order creation failed");
      return;
    }
setLoadingPay(false);
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
      setLoadingPay(false); // ✅ Stop loading if user cancels
    }
  },
      theme: {
        color: "#2ef02e",
      },

      handler: async function (response) {
        try {
          setLoadingPay(false);
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
            setLoadingPay(false);
        } catch (err) {
          setLoadingPay(false);
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
    const img = new Image();
    img.src = myBackground;
    img.onload = () => {
      setBackgroundImage(myBackground); // use imported image
      setIsLoaded(true);
    };
    
  }, []);
const aiTools = [
  {
    key: "workout",
    icon: "📝",
    title: "Workout Card AI",
    description:
      "Instantly create personalized workout plans powered by smart AI.",
  },
  {
    key: "diet",
    icon: "🥗",
    title: "Diet AI",
    description:
      "Deliver personalized AI-powered diet plans crafted for fitness and health.",
  },
  {
    key: "birthday",
    icon: "🎉",
    title: "Birthday Card AI",
    description:
      "Surprise members with AI-generated birthday messages that feel personal.",
  },
  {
    key: "poster",
    icon: "🎨",
    title: "Offer Post Design AI",
    description:
      "Create premium offer posters for Instagram, WhatsApp, and print instantly.",
  },
  {
    key: "transform",
    icon: "🎨",
    title: "Transformation Post Design AI",
    description:
      "Showcase transformation stories with AI-crafted posters.",
  },
];

const refs = {
  squat: squatRef,
  bicep: bicepRef,
  lateral: lateralRef,
    speeddet: speedetref,
    lateralupload: lateralUploadref,

  lateralSide:lateralSideRef
};
const workouts = [
  {
    key: "lateral",
    name: "Perfect your strokes",
    tier: "PRO",
    icon: "biomech",
    description:
      "Real-time skeletal tracking powered by TennisX AI. Analyze and compare joint movements to optimize your forehand, backhand, and serve.",
  },

  ...(isLoggedIn
    ? [
        {
          key: "speeddet",
          name: "Find your serve speed",
          tier: "FREE",
          icon: "speed",
          description:
            "Precision serve speed measurement using baseline-to-net trajectory tracking. Advanced frame-based motion analysis delivers accurate velocity metrics for performance benchmarking.",
        },
        {
          key: "lateralupload",
          name: "Perfect your rally",
          tier: "PRO",
          icon: "analysis",
          description:
            "Upload match or training footage for advanced skeletal overlay and biomechanical breakdown. Analyze footwork, posture, swing path, and kinetic chain alignment frame-by-frame.",
        },
      ]
    : []),
];
// const workouts = [
 
//   // {
//   //   key: "bicep",
//   //   name: "Bicep curl Form AI",
//   //   emoji: "💪",
//   //   description:
//   //     "Perfect your bicep curls with real-time AI form correction.",
//   // },
// //  {
// //   key: "speeddet",
// //   name: "Find your serve speed",
// //   tier: "FREE",
// //   icon: "speed",
// //   description:
// //     "Precision serve speed measurement using baseline-to-net trajectory tracking. Advanced frame-based motion analysis delivers accurate velocity metrics for performance benchmarking.",
// // },
// {
//   key: "lateral",
//   name: "Perfect your strokes",
//   tier: "PRO",
//   icon: "biomech",
//   description:
//     "Real-time skeletal tracking powered by TennisX AI. Analyze and compare joint movements to optimize your forehand, backhand, and serve.",
// },
// // {
// //   key: "lateralupload",
// //   name: "Perfect your rally",
// //   tier: "PRO",
// //   icon: "analysis",
// //   description:
// //     "Upload match or training footage for advanced skeletal overlay and biomechanical breakdown. Analyze footwork, posture, swing path, and kinetic chain alignment frame-by-frame.",
// // },

//   // {
//   //   key: "lateralSide",
//   //   name: "Form Compare AI (Left/Right)",
//   //   emoji: "🏃‍♂️",
//   //   description:
//   //     "Lateral View Real-time skeletal overlay powered by tennisX advanced motion tracking for perfect technique refinement.",
//   // },
 
//   // Add more workouts here
// ];
useEffect(() => {
  if (workouts.length && active === null) {
    setActive(workouts[0].key);
  }
}, [workouts]);
useEffect(() => {
  if (active === "squat") {
    setTimeout(() => {
      squatRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 120);
  }

  if (active === "bicep") {
    setTimeout(() => {
      bicepRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 120);
  }
    if (active === "lateral") {
    setTimeout(() => {
      lateralRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 120);
  }
   if (active === "speeddet") {
    setTimeout(() => {
      speedetref.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 120);
  }
  if (active === "lateralupload") {
    setTimeout(() => {
      lateralUploadref.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 120);
  }
  if (active === "lateralSide") {
    setTimeout(() => {
      lateralSideRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 120);
  }
}, [active]);
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
const handleLogin = (type) => {
  const isLoggedIn =
    localStorage.getItem("isLoggedInWeb") === "true";

  if (isLoggedIn) {
   
    return;
  }

 
};
const handleClick = (type) => {
  const isLoggedIn =
    localStorage.getItem("isLoggedInWeb") === "true";

  if (isLoggedIn && (type === "lateral" || type === "lateralupload")) {
    handleGenerate(type);
    return;
  }
setLoading(true);
setProgress(0);

let progressInterval = setInterval(() => {
setProgress((prev) => {
if (prev >= 100) {
clearInterval(progressInterval);
return 100;
}
return prev +7;
});
}, 100);
  setTimeout(() => {
    setLoading(false);
  if (type === "speeddet") {
      navigate("/speedd-ai", {
        state: {
          fromButton: true,
          facing: facingMode,
        },
      });
    }
    if (type === "lateral") {
      navigate("/lateral-ai", {
        state: {
          fromButton: true,
          facing: facingMode,
        },
      });
    }
      if (type === "lateralupload") {
      navigate("/upload-ai", {
        state: {
          fromButton: true,
          facing: facingMode,
        },
      });
    }
  }, 1000);
};
const handleGenerate = async (type,tokenIs=token,retryCount = 0) => {
      const MAX_RETRIES = 1; // or 2

setLoading(true);
setProgress(0);

let progressInterval = setInterval(() => {
setProgress((prev) => {
if (prev >= 100) {
clearInterval(progressInterval);
return 100;
}
return prev +7;
});
}, 100);

 try {
  const gymid = selectedGym?.GymId;
const mob = selectedGym?.mob;
//const uniqueId = localStorage.getItem("device_idfitox");
                      //  console.log("✅uid",uniqueId);

    // ✅ AUTH CHECK API
    const response = await axios.get(`${apiBase}/api/check_tok_ai`, {
  params: {
    gymid: gymid,
   // device_id: uniqueId,
  },
  headers: {
    Authorization: `Bearer ${tokenIs}`,
  },
});


    // ❌ AUTH FAILED → BLOCK UI
    if(response.data.success){
setTimeout(() => {
setLoading(false);
 const storedGym = JSON.parse(localStorage.getItem("selectedGym") || "{}");

  const updatedGym = {
    ...storedGym,
    renewaldate: response.data.exp, // replace with exp date
  };

  localStorage.setItem("selectedGym", JSON.stringify(updatedGym));
  const params = { facing: facingMode }; // pass current facingMode
      console.log("facemode",facingMode);

// if (type === "workout") navigate("/workout-ai", { state: { fromButton: true } });
// if (type === "diet") navigate("/diet-ai", { state: { fromButton: true } });

// if (type === "birthday") navigate("/birthday-ai", { state: { fromButton: true } });
// if (type === "poster") navigate("/offer-ai", { state: { fromButton: true } });
// if (type === "transform") navigate("/transform-ai", { state: { fromButton: true } });
// if (type === "bicep") navigate("/bicep-ai", { state: { fromButton: true } });
//  if (type === "squat") navigate("/squat-ai", { state: { fromButton: true, facing:facingMode } });
   if (type === "lateral") navigate("/lateral-ai", { state: { fromButton: true, facing:facingMode } });
      if (type === "lateralupload") navigate("/upload-ai", { state: { fromButton: true, facing:facingMode } });

  //  if (type === "lateralSide") navigate("/lateralside-ai", { state: { fromButton: true,facing:facingMode } });
  //  if (type === "speeddet") navigate("/speed-ai", { state: { fromButton: true,facing:facingMode } });


}, 1000);
    }else{
      if (response.data.error === 1 && retryCount < MAX_RETRIES) {
      console.log("⚠️ Token expired. Refreshing...");
      const newToken = await refreshAccessToken();

      if (newToken) {
        // 🔁 Retry API call with refreshed token
        return await handleGenerate(type,newToken,retryCount + 1);
      }
    }else{
      if(response.data.error == 99){
         const storedGym = JSON.parse(localStorage.getItem("selectedGym") || "{}");

  const updatedGym = {
    ...storedGym,
    renewaldate: response.data.exp, // replace with exp date
  };

  localStorage.setItem("selectedGym", JSON.stringify(updatedGym));
  setLoading(false);
      clearInterval(progressInterval);
      setAuthErrorMsg(response.data.message || "You are not authorized to continue.");
      setTypeIs(type);
      setShowExpireBlock(true);
       return;
      }
 setLoading(false);
      clearInterval(progressInterval);
      setAuthErrorMsg(response.data.message || "You are not authorized to continue.");

      setShowAuthBlock(true);
      return;
    }
     
    
    }
    

} catch (err) {
    console.error("🔥 Auth check failed:", err);
    setLoading(false);
    clearInterval(progressInterval);
    setAuthErrorMsg("Check your internet.");

    setShowAuthBlock(true);
  }
}

// useEffect(() => {
   
//         const token = localStorage.getItem("accessToken");
//             console.log("🌐 Check Active from API...");
//             fetchCheck(gymid, token); // ✅ use parsedGym directly
        
    
// }, []);
const fetchCheck = async (gymId,token,retryCount = 0) => {
    const MAX_RETRIES = 1; // or 2

    try {
        const response = await axios.get(`${apiBase}/api/check_tok?gymid=${gymId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

        if (response.data.success) {
          console.log("✅ ", response.data.result);
          
        } else if (response.data.error === 1 && retryCount < MAX_RETRIES) {
      console.log("⚠️ Token expired. Refreshing...");
      const newToken = await refreshAccessToken();

      if (newToken) {
        // 🔁 Retry API call with refreshed token
        return await fetchCheck(gymId, newToken,retryCount + 1);
      }
    } else if(response.data.error == 99){
            setAuthErrorMsg("Your session expired. Kindly relogin.");

            //handleLogout();
                            }   
    
    
                            
        else {
            console.error("❌ API error:", response.data.message);
           // setError(response.data.message);
        }
    } catch (err) {
        console.error("🔥 Error fetching trainers:", err);
       // setError("Failed to fetch trainers.");
    }
};
  const refreshAccessToken = async () => {
    try {
      const mobile = selectedGym?.mob;
      const res = await axios.post(
        `${apiBase}/api/refresh-token-ai`,
        { mob: mobile},
        { withCredentials: true }
      );

      if (res.data.success && res.data.access_token) {
        localStorage.setItem("accessToken", res.data.access_token);
        console.log("✅ Access token refreshed");
        return res.data.access_token;
      } else {
        if (res.data.error !== 111) {
          setLoading(false);

        console.log("❌ Refresh token invalid or expired. Logging out...");
                    setAuthErrorMsg("Your session expired. Kindly relogin.");

        //handleLogout();
        return null;
      } else {
        setLoading(false);

        console.log("⚠️ Server returned error 111. Not logging out.");
      }
      }
    } catch (err) {
      setLoading(false);

      console.error("🔥 Failed to refresh token:", err);
      //handleLogout();
      setAuthErrorMsg("Check your internet. Kindly logout and relogin.");

    setShowAuthBlock(true);
      return null;
    }
  };
  const handleTabClick = (tabName) => {
        if (tabName === "Settings") {
            navigate("/settings");
        }
      }
   const handleLogout = () => {
        localStorage.removeItem("gyms");
        localStorage.removeItem("selectedGym");
    localStorage.setItem("isLoggedInWeb", "false");

        // ✅ Navigate back to login screen
        navigate("/login", { replace: true });
    };
return (
 <div className="min-h-screen p-8 ">
    <div className="fixed inset-0 bg-black -z-20"></div>

{/* <div
  className={`fixed inset-0 w-screen h-screen bg-center bg-black transition-opacity duration-1000 
    ${isLoaded ? "opacity-100 bg-cover" : "opacity-0"} -z-10`}
  style={{
    backgroundImage: isLoaded ? `url(${myBackground})` : "none",
  }}
>
  <div className="absolute inset-0 bg-black/50"></div>
</div> */}
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

{loadingpay && (
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
{!isLoggedIn && (
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
          {/* <div
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
                 TennisX Pro
                </h3>
                 
                <p className="text-xs text-gray-500 mt-1">
                  Unlimited Motion Recording • Footwork Analysis • Biomechanics Breakdown • Skeleton Comparison • Advanced Playback Control
                </p>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {pricing.strokes[currency].display}
                </p>
                <p className="text-xs text-gray-500">/ year</p>
              </div>
            </div>
            <div className="mt-4">

  <div className="flex gap-2">
    <input
      type="text"
      placeholder="Enter coupon code"
      value={couponCode}
      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
      className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
    />

    <button
      onClick={verifyCoupon}
      className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600"
    >
      {couponLoading ? "Checking..." : "Apply"}
    </button>
  </div>

  {couponStatus && (
    <p
      className={`text-xs mt-2 ${
        couponStatus.type === "success"
          ? "text-green-600"
          : "text-red-500"
      }`}
    >
      {couponStatus.message}
    </p>
  )}

</div>
          </div> */}
                         
  
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
 {/* <div className="mt-3 text-xs space-y-1">
        <p className="text-gray-700 font-medium">What you'll improve:</p>
       <ul className="text-gray-600 space-y-1">
  <li>🎯 Forehand improvement</li>
  <li>🎯 Backhand consistency</li>
  <li>🎯 Powerful Serve</li>
  <li>🎯 Faster Footwork</li>
</ul>
      </div> */}
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
      : "border-orange-200 bg-gradient-to-br from-orange-50 to-white hover:border-orange-400"
  }`}
>

  {/* Best Value Badge */}
  <span className="absolute -top-2 right-3 bg-green-600 text-white text-[10px] font-semibold px-2 py-1 rounded-full shadow">
    Best Value
  </span>

  <div className="flex justify-between items-center">
    <div>
      <h3 className="font-semibold text-gray-800">
        TennisX Pro Life-Time
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
    ? "Improve NOW!"
    : "Upgrade Now!"}
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
      {storedparseGym?.renewaldate
        ? new Date(storedparseGym.renewaldate).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "N/A"}
    </span>
  </p>


    {/* Upgrade Button */}
    {/* <button
    onClick={() => {
        setShowExpireBlock(false);

  setShowDialog(true);
}}
      className="mt-6 w-full flex text-white items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-green-500 text-black py-3 rounded-lg font-semibold hover:scale-105 transition"
    >
      🚀 Upgrade Now 
      
    </button> */}

    {/* Close Button */}
<button
  onClick={() => {
    setShowExpireBlock(false);
    handleNavigation(typeIs);
  }}
  className="mt-4 w-full 
             border border-black 
             text-black 
             py-2 rounded-lg text-sm font-medium
             hover:bg-black hover:text-white
             transition duration-200"
>
  Continue with Free Version
</button>


  </div>
</div>

)}
{showAuthBlock && (
  <div className="px-10 fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999]">
    <div className="bg-white p-7 rounded-2xl shadow-2xl max-w-sm w-full text-center border border-red-200">
      
      <h2 className="text-2xl font-extrabold text-red-600 mb-3 drop-shadow">
        ⚠️ Access Denied
      </h2>

      <p className="text-gray-700 text-base">
        {authErrorMsg}
      </p>

      <button
        onClick={() => setShowAuthBlock(false)}
        className="mt-5 w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition"
      >
        Close
      </button>

    </div>
  </div>
)}

{/* <h1
  className="text-5xl font-extrabold text-center mb-10 tracking-tight drop-shadow-lg
             bg-gradient-to-r from-blue-500 via-teal-400 to-cyan-400
             text-transparent bg-clip-text"
>
  TennisX
</h1> */}
<div className="w-full">
  
  {/* Top Right Login */}
  <div className="flex justify-end mb-4">
    <button
      onClick={() => navigate("/login")}
      className="px-6 py-2 rounded-full font-semibold text-white
                 bg-transparent border border-white/30
                 hover:border-white hover:bg-white/10
                 transition duration-300 backdrop-blur-sm"
    >
      Login
    </button>
  </div>

  {/* Logo */}
  <div className="flex items-center justify-center">
    <img
      src={xlogo}
      alt="TennisX Logo"
      className="max-w-[200px] h-auto object-contain"
    />
  </div>

</div>

    {/* Loading Overlay */}
   {loading && (
  <div className="fixed inset-0 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center z-[9999]">
    <div className="w-3/4 h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
      <div
        className="h-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-200"
        style={{ width: `${progress}%` }}
      />
    </div>

    <p className="mt-4 text-sm text-gray-700 font-semibold animate-pulse tracking-wide">
      Loading your premium AI tool...
    </p>
  </div>
)}

<div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
  {/* { !isLoggedIn && (
  <div className="flex flex-col sm:flex-row sm:justify-end items-stretch gap-3 py-4 px-4 sm:px-0">
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
      className="w-full sm:w-auto px-6 py-3 rounded-full font-semibold text-black
                 bg-gradient-to-r from-yellow-400 to-green-500
                 hover:from-yellow-500 hover:to-green-600
                 transition-all duration-300
                 shadow-md hover:shadow-xl
                 active:scale-95"
    >
      🎁 Start Free Trial
    </button>
   


  </div>
)} */}

{isLoggedIn && (
  <div className="w-full flex items-center justify-between px-4 sm:px-6 mb-4">

    {/* Settings */}
    <div
      onClick={() => handleTabClick("Settings")}
      className="cursor-pointer p-3 rounded-full 
                 bg-red-600/60 hover:bg-red-700 
                 transition shadow-lg flex-shrink-0"
    >
      <img
        src={settingIcon}
        alt="Settings"
        className="w-6 h-6 filter brightness-0 invert"
      />
    </div>

    {/* Upgrade Button */}
    {isExpired && (
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
        className="ml-4 px-5 py-2.5 rounded-full font-semibold text-black
                   bg-gradient-to-r from-yellow-400 to-green-500
                   hover:from-yellow-500 hover:to-green-600
                   transition-all duration-300
                   shadow-md hover:shadow-xl
                   active:scale-95 text-sm sm:text-base"
      >
        🚀 Upgrade to Pro
      </button>
    )}

  </div>
)}

 

    <nav className="flex flex-col gap-14">

      {/* ---------------- PREMIUM SECTION (DARK THEME) ---------------- */}
      <div className="bg-[#0b0c12]/60 border border-[#191c29] rounded-2xl p-6 shadow-[0_0_20px_rgba(0,0,0,0.5)]">


        {/* <h2
          className="text-lg font-bold mb-5 tracking-wide
                     bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-300
                     text-transparent bg-clip-text drop-shadow-lg"
        >
          ⭐ Motion Tracker
        </h2> */}

        <div className="space-y-6">

      {workouts.slice(0, 3).map((w) => (
  <div key={w.key}>
    <button
      onClick={() => setActive(active === w.key ? null : w.key)}
      className={`w-full text-left rounded-xl px-5 py-4 border transition-all duration-300 shadow-sm
      ${
        active === w.key
          ? "bg-gradient-to-br from-[#1b1e2d] to-[#131522] border-indigo-500/50 shadow-[0_0_18px_rgba(99,102,241,0.4)]"
          : w.tier === "PRO"
          ? "bg-[#0f111a]/80 border-indigo-500/30 hover:border-indigo-400/60 hover:bg-[#171924] shadow-[0_0_12px_rgba(139,92,246,0.2)]"
          : "bg-[#0f111a]/80 border-white hover:bg-[#171924] hover:border-[#3d4160]"
      }`}
    >
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-4">
          
          {/* ICON */}
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-xl text-lg transition
            ${
              active === w.key
                ? "bg-indigo-600/20 text-indigo-400"
                : w.tier === "PRO"
                ? "bg-gradient-to-br from-indigo-600/20 to-purple-600/20 text-indigo-400"
                : "bg-[#161825] text-gray-400"
            }`}
          >
            {w.icon === "speed" && "⚡"}
            {w.icon === "biomech" && "⬡"}
            {w.icon === "analysis" && "◉"}
          </div>

          {/* TITLE */}
          <h3 className="text-base font-semibold text-white drop-shadow-sm">
            {w.name}
          </h3>
        </div>

        {/* TIER BADGE */}
        <span
          className={`text-[10px] px-3 py-1 rounded-full font-semibold tracking-wide
          ${
            w.tier === "PRO"
              ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-md"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          {w.tier}
        </span>
      </div>
    </button>

    {active === w.key && (
      <div
        ref={refs[w.key]}
        className="mt-3 ml-2 p-4 rounded-xl bg-white border border-[#292c40] shadow-inner"
      >
        <p className="text-sm text-black mb-4 leading-relaxed">
          {w.description}
        </p>

        {active === "lateral" && (
          <div className="flex gap-3 justify-center mb-4">
            <button
              onClick={() => setFacingMode("user")}
              className={`flex-1 py-2 rounded-xl shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-105 text-sm
              ${
                facingMode === "user"
                  ? "bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-purple-400/40"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              Front Camera
            </button>

            <button
              onClick={() => setFacingMode("environment")}
              className={`flex-1 py-2 rounded-xl shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-105 text-sm
              ${
                facingMode === "environment"
                  ? "bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-purple-400/40"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              Back Camera
            </button>
          </div>
        )}

        <button
          onClick={() => handleClick(w.key)}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-600 text-white font-bold shadow-xl hover:from-red-700 hover:to-red-700 transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-105"
        >
         Start
        </button>
      </div>
    )}
  </div>
))}

        </div>
      </div>


      {/* ---------------- EXTRAS SECTION (LIGHT THEME) ---------------- */}
      
    </nav>

<div className="mt-10 text-center text-sm text-gray-300 flex flex-col items-center space-y-2">
  <p className="text-white">For support or feedback:</p>

  <p>
    📧 Email:{" "}
    <a
      href="mailto:oxadmedia@gmail.com"
      className="text-yellow-400 hover:underline"
    >
      oxadmedia@gmail.com
    </a>
  </p>

  {/* <p>
    📞 Contact:{" "}
    <a
      href="tel:+918148602102"
      className="text-yellow-400 hover:underline"
    >
      +91 81486 02102
    </a>
  </p> */}

  <a
    href="https://wa.me/918595509389"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 text-green-500 hover:text-green-400 transition-colors"
  >
    <FaWhatsapp size={28} />
    <span className="font-medium">Chat on WhatsApp</span>
  </a>
</div>
 
</div>

 
</div>


);

}