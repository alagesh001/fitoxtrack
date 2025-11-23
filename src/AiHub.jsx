import React, { useState,useEffect,useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { showUpgradePopup } from './helper/reuse.js';
import { toast } from "react-toastify";

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
if (type === "workout") navigate("/workout-ai");
if (type === "diet") navigate("/diet-ai");

if (type === "birthday") navigate("/birthday-ai");
if (type === "poster") navigate("/offer-ai");
if (type === "transform") navigate("/transform-ai");
if (type === "bicep") navigate("/bicep-ai");
if (type === "squat") navigate("/squat-ai");
if (type === "lateral") navigate("/lateral-ai");
if (type === "lateralSide") navigate("/lateralside-ai");


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
  <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 p-8">
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

    <h1 className="text-4xl font-extrabold text-center mb-8 text-indigo-700 tracking-tight drop-shadow-sm">
      Fitox AI Hub
    </h1>

    <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-black overflow-hidden relative">

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-md flex flex-col items-center justify-center z-50">
          <div className="w-3/4 h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-4 text-sm text-gray-700 font-medium animate-pulse">
            Loading your AI tool...
          </p>
        </div>
      )}

      <div className="md:flex">

        {/* Vertical Tabs */}
        <aside className="md:w-72 bg-gradient-to-b from-white to-gray-100 px-6 py-8 border-r shadow-sm">
          <nav className="flex flex-col gap-4">

            {/* Workout Tab */}
            <div>
              <button
                onClick={() => setActive(active === "workout" ? null : "workout")}
             className={`group text-left w-full rounded-2xl p-4 transition-all duration-300
  ${
    active === "workout"
      ? "text-white border-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 shadow-[0_4px_12px_rgba(99,102,241,0.4)]"
      : "bg-gradient-to-r from-indigo-50 via-purple-50 to-white border border-black text-gray-700 hover:from-indigo-100 hover:via-purple-100 hover:to-white"
  }
`}

              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl transition ${
                      active === "workout" ? "bg-white/20" : "bg-indigo-100 group-hover:bg-indigo-200"
                    }`}
                  >
                    📝
                  </div>
                  <span className="font-semibold text-lg">Workout Card AI</span>
                </div>
              </button>

              {active === "workout" && (
                <div className="mt-3 ml-3 p-4 bg-indigo-50 rounded-xl shadow-sm border border-indigo-100">
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                    Instantly create personalized workout plans powered by smart AI.
                    Whether strength, endurance, or fat loss — deliver routines that keep
                    every member inspired and consistent.
                  </p>

                  <button
                    onClick={() => handleGenerate("workout")}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-md w-full"
                  >
                    Generate Now
                  </button>
                </div>
              )}
            </div>

            {/* Diet Tab */}
            <div>
              <button
                onClick={() => setActive(active === "diet" ? null : "diet")}
             className={`group text-left w-full rounded-2xl p-4 transition-all duration-300
  ${
    active === "diet"
      ? "text-white border-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 shadow-[0_4px_12px_rgba(99,102,241,0.4)]"
: "bg-gradient-to-r from-indigo-50 via-purple-50 to-white border border-black text-gray-700 hover:from-indigo-100 hover:via-purple-100 hover:to-white"
  }  
`}

              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl transition ${
                      active === "diet" ? "bg-white/20" : "bg-indigo-100 group-hover:bg-indigo-200"
                    }`}
                  >
                    🥗
                  </div>
                  <span className="font-semibold text-lg">Diet AI</span>
                </div>
              </button>

              {active === "diet" && (
                <div className="mt-3 ml-3 p-4 bg-indigo-50 rounded-xl border shadow-sm border-indigo-100">
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                    Deliver personalized AI-powered diet plans crafted for fitness,
                    health goals, and medical considerations — faster than ever.
                  </p>

                  <button
                    onClick={() => handleGenerate("diet")}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-md w-full"
                  >
                    Generate Now
                  </button>
                </div>
              )}
            </div>

            {/* Birthday Tab */}
            <div>
              <button
                onClick={() => setActive(active === "birthday" ? null : "birthday")}
             className={`group text-left w-full rounded-2xl p-4 transition-all duration-300
  ${
    active === "birthday"
      ? "text-white border-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 shadow-[0_4px_12px_rgba(99,102,241,0.4)]"
: "bg-gradient-to-r from-indigo-50 via-purple-50 to-white border border-black text-gray-700 hover:from-indigo-100 hover:via-purple-100 hover:to-white"
  }  
`}

              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl transition ${
                      active === "birthday" ? "bg-white/20" : "bg-indigo-100 group-hover:bg-indigo-200"
                    }`}
                  >
                    🎉
                  </div>
                  <span className="font-semibold text-lg">Birthday Card AI</span>
                </div>
              </button>

              {active === "birthday" && (
                <div className="mt-3 ml-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100 shadow-sm">
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                    Surprise your gym members with AI-generated birthday messages
                    that make them feel appreciated and valued.
                  </p>

                  <button
                    onClick={() => handleGenerate("birthday")}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-md w-full"
                  >
                    Generate Now
                  </button>
                </div>
              )}
            </div>
             {/* Offer Tab */}
            <div>
              <button
                onClick={() => setActive(active === "poster" ? null : "poster")}
              className={`group text-left w-full rounded-2xl p-4 transition-all duration-300
  ${
    active === "poster"
      ? "text-white border-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 shadow-[0_4px_12px_rgba(99,102,241,0.4)]"
: "bg-gradient-to-r from-indigo-50 via-purple-50 to-white border border-black text-gray-700 hover:from-indigo-100 hover:via-purple-100 hover:to-white"
  }  
`}

              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl transition ${
                      active === "poster" ? "bg-white/20" : "bg-indigo-100 group-hover:bg-indigo-200"
                    }`}
                  >
                    🎨
                  </div>
                  <span className="font-semibold text-lg">Offer Post Design AI</span>
                </div>
              </button>

              {active === "poster" && (
                <div className="mt-3 ml-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100 shadow-sm">
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                    Create premium AI-powered offer posters instantly. Perfect for
        Instagram, WhatsApp, print, and digital boards.
                  </p>

                  <button
                    onClick={() => handleGenerate("poster")}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-md w-full"
                  >
                    Generate Now
                  </button>
                </div>
              )}
            </div>
             {/* Transform Tab */}
            <div>
              <button
                onClick={() => setActive(active === "transform" ? null : "transform")}
          className={`group text-left w-full rounded-2xl p-4 transition-all duration-300
  ${
    active === "transform"
      ? "text-white border-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 shadow-[0_4px_12px_rgba(99,102,241,0.4)]"
: "bg-gradient-to-r from-indigo-50 via-purple-50 to-white border border-black text-gray-700 hover:from-indigo-100 hover:via-purple-100 hover:to-white"
  }  
`}

              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl transition ${
                      active === "transform" ? "bg-white/20" : "bg-indigo-100 group-hover:bg-indigo-200"
                    }`}
                  >
                    🎨
                  </div>
                  <span className="font-semibold text-lg">Transformation Post Design AI</span>
                </div>
              </button>

              {active === "transform" && (
                <div className="mt-3 ml-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100 shadow-sm">
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                   Showcase powerful transformation stories with AI-crafted posters, ready for social media and print.
                  </p>

                  <button
                    onClick={() => handleGenerate("transform")}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-md w-full"
                  >
                    Generate Now
                  </button>
                </div>
              )}
            </div>
           <div className="space-y-5">
  {workouts.map((w) => (
  <div key={w.key}>

    {/* Workout Tab */}
    <button
      onClick={() => setActive(active === w.key ? null : w.key)}
      className={`w-full text-left rounded-xl px-4 py-3 border transition
      ${
        active === w.key
          ? "bg-[#1a1c29] border-[#3d4160]"
          : "bg-[#0f111a] border-[#23263a] hover:bg-[#171924]"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-xl text-lg
          ${
            active === w.key
              ? "bg-[#24273a] text-indigo-400"
              : "bg-[#161825] text-gray-400"
          }`}
        >
          {w.emoji}
        </div>

        <div className="flex-1">
          <h3 className="text-base font-semibold text-white">{w.name}</h3>
        </div>
      </div>
    </button>

    {/* Expanded Panel */}
    {active === w.key && (
      <div
        ref={refs[w.key]}
        className="mt-3 ml-2 p-4 rounded-xl bg-[#13141e] border border-[#292c40]"
      >
        <p className="text-sm text-gray-300 mb-4">{w.description}</p>

        <button
          onClick={() => handleGenerate(w.key)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-md w-full"
        >
          Enter
        </button>
      </div>
    )}
  </div>
))}

</div>

          </nav>
        </aside>

        {/* Main content placeholder */}
        <main className="flex-1 p-10 text-center flex items-center justify-center">
          <p className="text-gray-600 text-lg">
            Select a tab and click <span className="font-semibold">Generate Now</span> to continue.
          </p>
        </main>

      </div>
    </div>
  </div>
);

}