import React, { useState,useEffect,useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { showUpgradePopup } from './helper/reuse.js';
import { toast } from "react-toastify";
import myBackground from "./assets/fitgymbg.jpg";
import settingIcon from "./assets/settings.png";
import { XCircle, ArrowUpRight,X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
export default function AIhubHere() {
  const [active, setActive] = useState(null);
  const navigate = useNavigate();
const [loading, setLoading] = useState(false);
const [progress, setProgress] = useState(0);
    const [selectedGym, setSelectedGym] = useState(null);
const [accessToken, setAccessToken] = useState(null);
const [authErrorMsg, setAuthErrorMsg] = useState("");
  const token = localStorage.getItem("accessToken");
  const storedGym = localStorage.getItem("selectedGym");
const isLoggedIn = localStorage.getItem("isLoggedInWeb") === "true";
    const [showExpireBlock, setShowExpireBlock] = useState(false);
  const storedparseGym = JSON.parse(localStorage.getItem("selectedGym") || "{}");

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

  const [showAuthBlock, setShowAuthBlock] = useState(false);
  const squatRef = useRef(null);
const bicepRef = useRef(null);
const lateralRef = useRef(null);
const speedetref = useRef(null);
const lateralUploadref = useRef(null);

const lateralSideRef = useRef(null);
const panelRefs = useRef({});
 const [backgroundImage, setBackgroundImage] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
    const [facingMode, setFacingMode] = useState("user"); // 'user' or 'environment'
      const apiBase = "https://tennisx.in";

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
 
  // {
  //   key: "bicep",
  //   name: "Bicep curl Form AI",
  //   emoji: "💪",
  //   description:
  //     "Perfect your bicep curls with real-time AI form correction.",
  // },
   {
  key: "speeddet",
  name: "Speed Detection",
  emoji: "🚀",
  description:
    "Accurately measure serve speed using baseline-to-net tracking. Get instant velocity analysis with frame-based motion detection for performance benchmarking.",
},
{
  key: "lateral",
  name: "Strokes Compare Tracker (Real Time)",
  emoji: "🎾",
  description:
    "Real-time anterior and posterior skeletal overlay powered by TennisX motion tracking. Compare technique live, analyze joint angles, and refine stroke mechanics instantly.",
},
{
  key: "lateralupload",
  name: "Play Tracker (Uploaded Video)",
  emoji: "🎾",
  description:
    "Upload match or practice footage to generate detailed skeletal overlays. Analyze posture, swing path, and body alignment frame-by-frame for deep technical improvement.",
},

  // {
  //   key: "lateralSide",
  //   name: "Form Compare AI (Left/Right)",
  //   emoji: "🏃‍♂️",
  //   description:
  //     "Lateral View Real-time skeletal overlay powered by tennisX advanced motion tracking for perfect technique refinement.",
  // },
 
  // Add more workouts here
];
useEffect(() => {
  if (workouts.length && active === null) {
   // setActive(workouts[0].key);
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

  if (isLoggedIn && type === "lateral") {
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

<div
  className={`fixed inset-0 w-screen h-screen bg-center bg-black transition-opacity duration-1000 
    ${isLoaded ? "opacity-100 bg-cover" : "opacity-0"} -z-10`}
  style={{
    backgroundImage: isLoaded ? `url(${myBackground})` : "none",
  }}
>
  <div className="absolute inset-0 bg-black/50"></div>
</div>
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
    navigate("/lateral-ai", { 
      state: { fromButton: true, facing: facingMode } 
    });
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

<h1
  className="text-5xl font-extrabold text-center mb-10 tracking-tight drop-shadow-lg
             bg-gradient-to-r from-blue-500 via-teal-400 to-cyan-400
             text-transparent bg-clip-text"
>
  TennisX AI Hub
</h1>



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

   <div className="md:flex">
{!isLoggedIn && (
  <div className="flex justify-end py-5">
    <button
      onClick={() => navigate("/login")}
      className="px-6 py-2 rounded-lg font-semibold text-white 
                 bg-gradient-to-r from-blue-500 to-indigo-600 
                 hover:from-blue-600 hover:to-indigo-700 
                 transition duration-300 shadow-lg hover:shadow-xl"
    >
      Login
    </button>
  </div>
)}
{isLoggedIn && (
 <div className="w-full max-w-xl flex justify-end pr-4 mb-4">
    <div
      onClick={() => handleTabClick("Settings")}
      className="cursor-pointer p-3 rounded-full bg-red-600/60 hover:bg-red-700 transition shadow-lg"
    >
      <img
        src={settingIcon}
        alt="Settings"
        className="w-6 h-6 filter brightness-0 invert"
      />
    </div>
  </div>
)}
 

    <nav className="flex flex-col gap-14">

      {/* ---------------- PREMIUM SECTION (DARK THEME) ---------------- */}
      <div className="bg-[#0b0c12]/60 border border-[#191c29] rounded-2xl p-6 shadow-[0_0_20px_rgba(0,0,0,0.5)]">


        <h2
          className="text-lg font-bold mb-5 tracking-wide
                     bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-300
                     text-transparent bg-clip-text drop-shadow-lg"
        >
          ⭐ Motion Tracker
        </h2>

        <div className="space-y-6">

          {workouts.slice(0, 3).map((w) => (
            <div key={w.key}>
              <button
                onClick={() => setActive(active === w.key ? null : w.key)}
                className={`w-full text-left rounded-xl px-5 py-4 border transition-all duration-300 shadow-sm
                ${
                  active === w.key
                    ? "bg-gradient-to-br from-[#1b1e2d] to-[#131522] border-indigo-500/50 shadow-[0_0_18px_rgba(99,102,241,0.4)]"
                    : "bg-[#0f111a]/80 border-white hover:bg-[#171924] hover:border-[#3d4160]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-xl text-xl transition
                    ${
                      active === w.key
                        ? "bg-indigo-600/20 text-indigo-400"
                        : "bg-[#161825] text-gray-400"
                    }`}
                  >
                    {w.emoji}
                  </div>

                  <h3 className="text-base font-semibold text-white drop-shadow-sm">
                    {w.name}
                  </h3>
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

{active == "lateral" && (
<div className="flex gap-3 justify-center mb-4">
  <button
    onClick={() => setFacingMode("user")} // front camera
    className={`flex-1 py-2 rounded-xl font-regular shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-105 ${
      facingMode === "user"
        ? "bg-gradient-to-r from-gray-800 to-gray-700 text-white text-sm shadow-purple-400/40"
        :"bg-gray-100 text-gray-400 text-sm hover:bg-gray-200"
    }`}
  >
    Front Cam
  </button>

  <button
    onClick={() => setFacingMode("environment")} // back camera
    className={`flex-1 py-2 rounded-xl font-regular shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-105 ${
      facingMode === "environment"
        ? "bg-gradient-to-r from-gray-800 to-gray-700 text-sm text-white shadow-purple-400/40"
        : "bg-gray-100 text-gray-400 hover:bg-gray-200 text-sm"
    }`}
  >
    Back Cam
  </button>
</div>
)}
<button
  onClick={() => handleClick(w.key)}
  className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-105"
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

  <p>
    📞 Contact:{" "}
    <a
      href="tel:+918148602102"
      className="text-yellow-400 hover:underline"
    >
      +91 81486 02102
    </a>
  </p>

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