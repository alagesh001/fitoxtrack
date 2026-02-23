import React, { useState,useEffect,useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { showUpgradePopup } from './helper/reuse.js';
import { toast } from "react-toastify";
import myBackground from "./assets/fitgymbg.png";
import settingIcon from "./assets/settings.png";
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
const lateralSideRef = useRef(null);
const panelRefs = useRef({});
 const [backgroundImage, setBackgroundImage] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
    const [facingMode, setFacingMode] = useState("user"); // 'user' or 'environment'
      const apiBase = "https://oxadmedia.online";

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
 
  // {
  //   key: "bicep",
  //   name: "Bicep curl Form AI",
  //   emoji: "💪",
  //   description:
  //     "Perfect your bicep curls with real-time AI form correction.",
  // },
  {
    key: "lateral",
    name: "Strokes Compare Tracker",
    emoji: "🎾",
    description:
      "Anterior and Posterior View Real-time skeletal overlay powered by tennisX advanced motion tracking for perfect technique refinement.",
  },
  // {
  //   key: "lateralSide",
  //   name: "Form Compare AI (Left/Right)",
  //   emoji: "🏃‍♂️",
  //   description:
  //     "Lateral View Real-time skeletal overlay powered by tennisX advanced motion tracking for perfect technique refinement.",
  // },
  //  {
  //   key: "speeddet",
  //   name: "Speed Detection",
  //   emoji: "🎾",
  //   description:
  //     "Detect the speed of the ball",
  // },
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

  if (isLoggedIn) {
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

    if (type === "lateral") {
      navigate("/lateral-ai", {
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
        console.log("❌ Refresh token invalid or expired. Logging out...");
        handleLogout();
        return null;
      } else {
        console.log("⚠️ Server returned error 111. Not logging out.");
      }
      }
    } catch (err) {
      console.error("🔥 Failed to refresh token:", err);
      //handleLogout();
      setAuthErrorMsg("Check your internet.");

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

{active !== "speeddet" && (
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


</div>

 
</div>


);

}