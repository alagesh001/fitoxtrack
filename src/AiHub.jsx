import React, { useState,useEffect,useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { showUpgradePopup } from './helper/reuse.js';
import { toast } from "react-toastify";
import myBackground from "./assets/fitgymbg.png";

export default function AIhubHere() {
  const [active, setActive] = useState(null);
  const navigate = useNavigate();
const [loading, setLoading] = useState(false);
const [progress, setProgress] = useState(0);
    const [selectedGym, setSelectedGym] = useState(null);
const storedGym = JSON.parse(localStorage.getItem("selectedGym") || "{}");
  const gymid = storedGym?.GymId;
  const [showAuthBlock, setShowAuthBlock] = useState(false);
  const squatRef = useRef(null);
const bicepRef = useRef(null);
const lateralRef = useRef(null);
const lateralSideRef = useRef(null);
const panelRefs = useRef({});
 const [backgroundImage, setBackgroundImage] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
    const [facingMode, setFacingMode] = useState("user"); // 'user' or 'environment'
  
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
  lateralSide:lateralSideRef
};
const workouts = [
  {
    key: "squat",
    name: "Squat Form Corrector AI",
    emoji: "🏋️",
    description:
      "Precision squat coaching powered by advanced motion tracking and AI biomechanics.",
  },
  // {
  //   key: "bicep",
  //   name: "Bicep curl Form AI",
  //   emoji: "💪",
  //   description:
  //     "Perfect your bicep curls with real-time AI form correction.",
  // },
  {
    key: "lateral",
    name: "Form Compare AI (Front/Back)",
    emoji: "🧍‍♂️",
    description:
      "Enhance your workouts with precise AI Form Tracker.",
  },
  {
    key: "lateralSide",
    name: "Form Compare AI (Left/Right)",
    emoji: "🏃‍♂️",
    description:
      "Enhance your workouts with precise AI Form Tracker.",
  },
  // Add more workouts here
];
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
  if (active === "lateralSide") {
    setTimeout(() => {
      lateralSideRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 120);
  }
}, [active]);
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

const handleGenerate = (type) => {
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
  const params = { facing: facingMode }; // pass current facingMode

if (type === "workout") navigate("/workout-ai");
if (type === "diet") navigate("/diet-ai");

if (type === "birthday") navigate("/birthday-ai");
if (type === "poster") navigate("/offer-ai");
if (type === "transform") navigate("/transform-ai");
if (type === "bicep") navigate("/bicep-ai");
 if (type === "squat") navigate("/squat-ai", { state: params });
   if (type === "lateral") navigate("/lateral-ai", { state: params });
   if (type === "lateralSide") navigate("/lateralside-ai", { state: params });


}, 1000);
};
    const apiBase = "https://oxadmedia.online";

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
            handleLogout();
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
      const res = await axios.post(
        `${apiBase}/api/refresh-token`,
        { mob: storedGym.mob },
        { withCredentials: true }
      );

      if (res.data.success && res.data.access_token) {
        localStorage.setItem("accessToken", res.data.access_token);
        console.log("✅ Access token refreshed");
        return res.data.access_token;
      } else {
        console.log("❌ Refresh token invalid. Logging out...");
        handleLogout();
        return null;
      }
    } catch (err) {
      console.error("🔥 Failed to refresh token:", err);
      handleLogout();
      return null;
    }
  };
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

  {showAuthBlock && (
    <div className="px-10 fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white p-7 rounded-2xl shadow-2xl max-w-sm w-full text-center border border-red-200">
        <h2 className="text-2xl font-extrabold text-red-600 mb-3 drop-shadow">
          Not Authorised
        </h2>
        <p className="text-gray-700 text-base">
          Kindly login through an authorized account to access.
        </p>
      </div>
    </div>
  )}

<h1
  className="text-5xl font-extrabold text-center mb-10 tracking-tight drop-shadow-lg
             bg-gradient-to-r from-blue-500 via-teal-400 to-cyan-400
             text-transparent bg-clip-text"
>
  Fitox AI Hub
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

<div className="flex gap-3 justify-center mb-4">
  <button
    onClick={() => setFacingMode("user")} // front camera
    className={`flex-1 py-2 rounded-xl font-semibold shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-105 ${
      facingMode === "user"
        ? "bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-green-400/40"
        :"bg-gray-100 text-gray-500 hover:bg-gray-200"
    }`}
  >
    Front Cam
  </button>

  <button
    onClick={() => setFacingMode("environment")} // back camera
    className={`flex-1 py-2 rounded-xl font-semibold shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-105 ${
      facingMode === "environment"
        ? "bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-green-400/40"
        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
    }`}
  >
    Back Cam
  </button>
</div>

<button
  onClick={() => handleGenerate(w.key)}
  className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-105"
>
  Enter
</button>

                </div>
              )}
            </div>
          ))}

        </div>
      </div>


      {/* ---------------- EXTRAS SECTION (LIGHT THEME) ---------------- */}
      <div className="bg-white/40  rounded-2xl p-6 shadow-md">

        <h2 className="text-lg font-bold text-white mb-5 tracking-wide">
          🧰 Premium Extras
        </h2>

      <div className="space-y-7">
  {aiTools.map((tool) => (
    <div key={tool.key}>

      {/* Main Tab */}
      <button
        onClick={() => {
          const newActive = active === tool.key ? null : tool.key;
          setActive(newActive);

          if (newActive !== null) {
            setTimeout(() => {
              panelRefs.current[newActive]?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }, 150);
          }
        }}
        className={`group w-full text-left rounded-xl p-4 transition-all duration-300 border 
          ${
            active === tool.key
              ? "text-white border-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 shadow-[0_4px_14px_rgba(99,102,241,0.35)]"
              : "bg-gray-200/80 border-gray-300 hover:from-indigo-100 hover:via-purple-100 hover:to-white"
          }
        `}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl transition
              ${
                active === tool.key
                  ? "bg-white/20"
                  : "bg-white group-hover:bg-indigo-200"
              }
            `}
          >
            {tool.icon}
          </div>

          <span
            className={`font-semibold text-lg ${
              active === tool.key ? "text-white" : "text-gray-700"
            }`}
          >
            {tool.title}
          </span>
        </div>
      </button>

      {/* Expanded Panel */}
      {active === tool.key && (
        <div
          ref={(el) => (panelRefs.current[tool.key] = el)}
          className="mt-3 ml-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
        >
          <p className="text-sm text-gray-700 mb-3 leading-relaxed">
            {tool.description}
          </p>

          <button
            onClick={() => handleGenerate(tool.key)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-md w-full font-semibold"
          >
            Generate Now
          </button>
        </div>
      )}

    </div>
  ))}
</div>


      </div>

    </nav>


</div>

 
</div>


);

}