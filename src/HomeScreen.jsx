import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import myBackground from "./assets/fitgymbg.png";
//import UpgradeDialog from "./UpgradeDialog";
import Swal from 'sweetalert2';
import clientIcon from "./assets/clienticn.png"; // adjust path to match your project
import adminIcon from "./assets/adminicn.png"; // adjust path to match your project
import transacIcon from "./assets/transactionicn.png"; // adjust path to match your project
import dashIcon from "./assets/menu.png"; // adjust path to match your project
import anaIcon from "./assets/analytics.png"; // adjust path to match your project
import inactiveIcon from "./assets/inactive.png"; // adjust path to match your project
import settingIcon from "./assets/settings.png"; // adjust path to match your project
import addleadIcon from "./assets/lead.png"; // adjust path to match your project
import leadIcon from "./assets/leadfunnel.png"; // adjust path to match your project
import upgradeIcon from "./assets/upgrade.png"; // adjust path to match your project
import hubIcon from "./assets/hubicn.png"; // adjust path to match your project
import aiIcon from "./assets/aiicon2.png"; // adjust path to match your project
import { toast } from "react-toastify";

import { showUpgradePopup } from './helper/reuse.js';
 
function HomeScreen() {
    const [selectedGym, setSelectedGym] = useState(null);
    const navigate = useNavigate();
    const apiBase = "https://oxadmedia.online";
const [trainers, setTrainers] = useState([]);
 const [backgroundImage, setBackgroundImage] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  //const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

useEffect(() => {
  const img = new Image();
  img.src = myBackground;
  img.onload = () => {
    setBackgroundImage(myBackground); // use imported image
    setIsLoaded(true);
  };
}, []);
useEffect(() => {
    const storedGym = localStorage.getItem("selectedGym");

    if (storedGym) {
        const parsedGym = JSON.parse(storedGym);
setSelectedGym(parsedGym);
        const token = localStorage.getItem("accessToken");
        const cachedTrainers = localStorage.getItem(`trainersdata_${parsedGym.GymId}`);
  const iso = parsedGym.renewaldate; // "2025-10-16T18:30:00.000Z"
const d = new Date(iso);

// Format to dd-mm-yyyy
const day = String(d.getDate()).padStart(2, "0");
const month = String(d.getMonth() + 1).padStart(2, "0");
const year = d.getFullYear();

const formatted = `${day}-${month}-${year}`; 
        localStorage.setItem(`renew_data_${parsedGym.GymId}`, formatted);
//         if (cachedTrainers) {
//            const parsedTrainers = JSON.parse(cachedTrainers);

//   //  console.log("📦 Loaded trainers from localStorage:", parsedTrainers);

//     setTrainers(parsedTrainers);
   
//         } else {
//             console.log("🌐 Fetching trainers from API...");
//              const iso = parsedGym.renewaldate; // "2025-10-16T18:30:00.000Z"
// const d = new Date(iso);

// // Format to dd-mm-yyyy
// const day = String(d.getDate()).padStart(2, "0");
// const month = String(d.getMonth() + 1).padStart(2, "0");
// const year = d.getFullYear();

// const formatted = `${day}-${month}-${year}`; 
//         localStorage.setItem(`renew_data_${parsedGym.GymId}`, formatted);
//             fetchTrainers(parsedGym.GymId, token); // ✅ use parsedGym directly
            
//         }
    }
}, []);

// const handleAddAdmin = () => {
//   navigate("/trainer-list", {
//     state: {
//       type: "add", // 👈 type is "add"
//     },
//   });
// };
 
const handleAddMember = () => {
  navigate("/add-member", {
    state: {
      type: "add", // 👈 type is "add"
    },
  });
};
const fetchTrainers = async (gymId,token) => {
    try {
        const response = await axios.get(`${apiBase}/api/fetch-trainer?gymid=${gymId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

        if (response.data.success) {
         //   console.log("✅ Trainer data fetched:", response.data.result);
            setTrainers(response.data.result); // Save to state
              localStorage.setItem(
    `trainersdata_${gymId}`, // ✅ use the function parameter
    JSON.stringify(response.data.result)

                

);
        } else {
            console.error("❌ API error:", response.data.message);
           // setError(response.data.message);
        }
    } catch (err) {
        console.error("🔥 Error fetching trainers:", err);
       // setError("Failed to fetch trainers.");
    }
};
    const tabs = [
        // { name: "Active Clients", gradient: "from-green-400 to-green-600" },
        // { name: "Admins", gradient: "from-orange-400 to-orange-600" },
        // { name: "Transaction History", gradient: "from-purple-400 to-purple-600" },
{ name: "AI Hub", gradient: "from-blue-600 via-cyan-400 to-teal-300" },

        // { name: "Dashboard", gradient: "from-red-400 to-red-600" },
        // { name: "Analytics", gradient: "from-blue-400 to-blue-600" },
        // { name: "Inactive Clients", gradient: "from-gray-800 to-gray-500" },
        { name: "Settings", gradient: "from-pink-800 to-pink-500" },
        // { name: "Leads", gradient: "from-yellow-800 to-yellow-500" },
        // { name: "Add Lead", gradient: "from-violet-800 to-violet-500" },
        //     //    { name: "Biometric", gradient: "from-blue-800 to-blue-500" },
        // { name: "My Hub", gradient: "from-blue-800 to-blue-500" },

//{ name: "Upgrade", gradient: "from-[#FFD700] to-[#FFA500]" }



    ];
const handleTabClick = (tabName) => {
        if (tabName === "Settings") {
            navigate("/settings");
        } else if (tabName === "Active Clients"){
            navigate("/activeClients");
        }else if (tabName === "Admins"){
            navigate("/trainer-list");

       
        }else if (tabName === "Transaction History"){
            navigate("/transac-hist");

        
        } else if (tabName === "Dashboard"){
            navigate("/dash-admin");

        
        }else if (tabName === "Analytics"){
            navigate("/analytics-screen");

        
        }else if (tabName === "Biometric"){
            navigate("/bio-dash");

        
        }else if (tabName === "My Hub"){
         
            navigate("/fitox-hub");

        
        }else if (tabName === "AI Hub"){
             const storedGym = localStorage.getItem("selectedGym");
        const parsedGym = JSON.parse(storedGym);
  const stored = localStorage.getItem(`renew_data_${parsedGym.GymId}`);
  if (!stored) {
    toast.success("Refresh the active clients list once to access this section.");

    return;
  }

  // stored = "17-02-2026"
  const [day, month, year] = stored.split("-").map(Number);

  const renewDate = new Date(year, month - 1, day); // JS date
  const today = new Date();

  renewDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
//console.log("Expired ",parsedGym.GymId,stored);
  if (renewDate <= today) {
    console.log("Expired");
    showUpgradePopup({
   price: "₹5000 / Year",
   titleIs: "Renew Now"
  });
    // your logic here
  } else {
    console.log("Active");
                navigate("/ai-hub");

  }

        }else if (tabName === "Inactive Clients"){
        //      const storedGym = localStorage.getItem("selectedGym");
        // const parsedGym = JSON.parse(storedGym);
navigate("/inactive-screen");
// if (Number(parsedGym.is_active) === 1) {
// showUpgradePopup({
//   price: "₹5000 / Year",
//   titleIs: "Limit Exceeded"
//  });
// } else {
//     navigate("/inactive-screen");
// }
        
        }else if (tabName === "Leads"){
            navigate("/lead_data");

        
        }else if (tabName === "Add Lead"){
   const storedGym = localStorage.getItem("selectedGym");
 if (storedGym) {
        const parsedGym = JSON.parse(storedGym);
        navigate(`/add_lead?gymid=${parsedGym.GymId}`);
 }
        
        }else{
           // console.log(`Navigating to ${tabName}`);

        }
    };
return (
  <div className="fixed inset-0 bg-black overflow-hidden">
    
    {/* BACKDROP */}
    <div
      className={`fixed inset-0 bg-center bg-black transition-opacity duration-1000 ${
        isLoaded ? "opacity-100 bg-cover" : "opacity-0"
      }`}
      style={{
        backgroundColor: "black",
        backgroundImage: isLoaded ? `url(${myBackground})` : "none",
        zIndex: 0
      }}
    >
      <div className="absolute inset-0 bg-black/50"></div>
    </div>
    
    {/* TITLE FRAME */}
    <div className="absolute top-0 z-30 bg-black/70 w-full p-5 text-center shadow-lg">
      <h1 className="text-3xl font-bold text-white/90">
        {selectedGym?.GymName}
        {selectedGym?.Location && `, ${selectedGym.Location}`}
      </h1>
    </div>
    
    {/* CENTER CONTAINER (holds button + settings) */}
<div className="absolute inset-0 flex flex-col items-center justify-center z-50">

  {/* Row containing settings aligned to right */}
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

  {/* Centered AI Hub Button */}
  <div
  className="w-[80%] max-w-xl p-10 rounded-2xl text-white text-2xl font-semibold
             bg-gradient-to-r 
             from-blue-600/80 via-cyan-400/80 to-teal-300/80 
             hover:from-blue-600/90 hover:via-cyan-400/90 hover:to-teal-300/90
             hover:scale-105 cursor-pointer
             transition-all shadow-2xl flex flex-col items-center gap-4"
  onClick={() => handleTabClick("AI Hub")}
>
  <img
    src={aiIcon}
    alt="AI Icon"
    className="w-20 h-20 filter brightness-0 invert opacity-90"
  />
  <span className="opacity-95">Enter Fitox AI</span>
</div>


</div>

    
  </div>
);

}

export default HomeScreen;






