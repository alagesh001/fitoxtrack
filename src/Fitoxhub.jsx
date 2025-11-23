import { useState,useRef,useEffect} from "react";
import { Plus,RefreshCcw, Youtube, Instagram, Facebook,Pencil,Check  } from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Fitoxhub() {
  const [activeTab, setActiveTab] = useState("Trainers");
const [isEditing, setIsEditing] = useState(false);
  const apiBase = "https://oxadmedia.online";
    const lastClickTimeRef = useRef(0);
        const selectedGym = JSON.parse(localStorage.getItem("selectedGym"));

  const gymIdIs = selectedGym?.GymId || null; // ✅ safe fallback              
  const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
  const [editingField, setEditingField] = useState(null);

  const [trainers, setTrainers] = useState([]);

  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newTrainer, setNewTrainer] = useState({
    name: "",
    age: "",
    info: "",
    mob:"",
    type: "Normal",
  });
    const [packages, setPackages] = useState([]);
 const icons = {
  "YouTube Channel" : <Youtube className="w-5 h-5 mr-2 text-red-600 inline-block" />,
      "Instagram": <Instagram className="w-6 h-6 mr-2 text-pink-500" />,
      "Facebook": <Facebook className="w-6 h-6 mr-2 text-blue-600" />,
    };
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPackModal, setShowPackModal] = useState(false);
  const [newPackage, setNewPackage] = useState({
    name: "",
    amount: "",
    info: "",
    type: "Normal",
  });
    const [community, setCommunity] = useState({
    youtube: "",
    instagram: "",
    facebook: "",
  });
   const tabs = [
    { id: "Trainers", label: "Trainers" },
    { id: "Packages", label: "Packages" },
    { id: "Community", label: "Community" },
    // { id: "Analytics", label: "Analytics" },
    // { id: "Settings", label: "Settings" },
  ];
    const handleSave = () => {
    console.log("Save clicked:", community);
    // 👉 call your update API here
    localStorage.setItem("hubcommdata", JSON.stringify(community));
  };
   const handleChange = (e) => {
    setCommunity({ ...community, [e.target.name]: e.target.value });
  };
const handleRefresh = async () => {

          fetchTrainers(gymIdIs);

}
const handleRefreshComm = async () => {

          fetchCommData(gymIdIs);

}
const handleRefreshPackage = async () => {

          fetchPackages(gymIdIs);

}
   useEffect(() => {
    const storedGym = localStorage.getItem("selectedGym");

    if (gymIdIs != null) {
      const parsedGym = JSON.parse(storedGym);
      const cachedData = localStorage.getItem(`hubtrainersdata_${gymIdIs}`);
      const cachedPackData = localStorage.getItem(`hubpackdata_${gymIdIs}`);
      const cachedCommData = localStorage.getItem(`hubcommdata_${gymIdIs}`);

      if (cachedData) {
        const parsedTrainers = JSON.parse(cachedData);
        setTrainers(parsedTrainers);
      //  setLoading(false);
        console.log("Fetched from local");

      } else {
        fetchTrainers(gymIdIs);
      }
       if (cachedPackData) {
        const parsedPackages = JSON.parse(cachedPackData);
        setPackages(parsedPackages);
      //  setLoading(false);
        console.log("Fetched from local");

      } else {
      //  fetchPackages(gymIdIs);
      }
         if (cachedCommData) {
        const parsedComm = JSON.parse(cachedCommData);
 if (parsedComm.length > 0) {
    setCommunity({
      youtube: parsedComm[0].yt_url || "",
      instagram: parsedComm[0].insta_url || "",
      facebook: parsedComm[0].fb_url || "",
    });
  }      //  setLoading(false);
        console.log("Fetched from local");

      } else {
      //  fetchCommData(gymIdIs);
      }
    }
  }, []);
const handleAddPackage = async () => {
       const now = Date.now();

    if (now - lastClickTimeRef.current < 2000) {
      alert("⏳ Please wait 2 seconds before clicking again!");
      return; // ignore clicks within 2s
    }
    lastClickTimeRef.current = now;
    if (!newPackage.name || !newPackage.amount) return alert("Please fill all fields.");
           setShowPackModal(false);

    setLoading(true);

    const storedGym = localStorage.getItem("selectedGym");

    if (storedGym) {
      const parsedGym = JSON.parse(storedGym);
   let gymId = parsedGym.GymId;
  try {
    const accessToken = localStorage.getItem("accessToken");
const memberData = {
  gymid: gymId,
  amount: newPackage.amount ?? 0, // if age is null or undefined, use 0
  name: newPackage.name,
  info: newPackage.info,
  type: "add",
  p_type: newPackage.type
};
   // `${apiBase}/api/add-trainer`,

  const response = await axios.post(
    `${apiBase}/api/add-hub-pack`,
   memberData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`, // 👈 add token to headers
      },
    }
  );

  if (response.data.success) {
  toast.success("✅ "+response.data.message);
  const pid = response.data.pid; // safer variable name

const packageData = {
  ...newPackage,              // copy everything from newTrainer
  id: Number(pid),  // override with coachid
};
    // Save trainer in ocalStorage
    addPack(gymId, packageData);
    setShowPackModal(false);
    setNewPackage({ name: "", amount: "", info: "", type: "Normal" });

  } else if (response.data.error === 1) {
                    console.log("Access token expired while fetching page " );

                  const token = await refreshAccessToken(); // Refresh token
                   
                    if (!token) {
                        console.log("❌ Unable to refresh token. Logging out...");
                        handleLogout();
                        return;
                    }else{
                       return await retryPackApi(token, memberData,"api/add-hub-pack"); // 🔁 Retry with new token

                    }
                }else {
Swal.fire({
  icon: "error",                 // ❌ shows error icon
  title: "Failed to add Trajner",
  text: response.data.message,   // your API message
  confirmButtonText: "OK",
  background: "#fff",
  iconColor: "#e74c3c",          // optional: custom icon color
});   }
} catch (error) {
   Swal.fire({
          icon: "error",
          title: "Network Error",
          text: "Check your internet",
          confirmButtonText: "OK",
        });
  console.error("Error adding admin:", error);
}finally {
      setLoading(false); // ✅ enable again after response
    }
}
  };
  const handleupdatePackage = async () => {
       const now = Date.now();

    if (now - lastClickTimeRef.current < 2000) {
      alert("⏳ Please wait 2 seconds before clicking again!");
      return; // ignore clicks within 2s
    }
    lastClickTimeRef.current = now;
    if (!selectedPackage.name || !selectedPackage.amount) return alert("Please fill all fields.");
          // setShowPackModal(false);

    setLoading(true);

    const storedGym = localStorage.getItem("selectedGym");

    if (storedGym) {
      const parsedGym = JSON.parse(storedGym);
   let gymId = parsedGym.GymId;
  try {
    const accessToken = localStorage.getItem("accessToken");
const memberData = {
  gymid: gymId,
  amount: selectedPackage.amount ?? 0, // if age is null or undefined, use 0
  name: selectedPackage.name,
  info: selectedPackage.info,
    pid: selectedPackage.id,

  type: "update",
  p_type: selectedPackage.type
};
   // `${apiBase}/api/add-trainer`,

  const response = await axios.post(
    `${apiBase}/api/add-hub-pack`,
   memberData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`, // 👈 add token to headers
      },
    }
  );

  if (response.data.success) {
  toast.success("✅ "+response.data.message);

    // Save trainer in ocalStorage
   updatePack(gymId, selectedPackage);
  //  setShowPackModal(false);
                      setIsEditing(false);

                    setSelectedPackage(null);

  } else if (response.data.error === 1) {
                    console.log("Access token expired while fetching page " );

                  const token = await refreshAccessToken(); // Refresh token
                   
                    if (!token) {
                        console.log("❌ Unable to refresh token. Logging out...");
                        handleLogout();
                        return;
                    }else{
                       return await retryPackApi(token, memberData,"api/add-hub-pack"); // 🔁 Retry with new token

                    }
                }else {
Swal.fire({
  icon: "error",                 // ❌ shows error icon
  title: "Failed to add Trajner",
  text: response.data.message,   // your API message
  confirmButtonText: "OK",
  background: "#fff",
  iconColor: "#e74c3c",          // optional: custom icon color
});   }
} catch (error) {
   Swal.fire({
          icon: "error",
          title: "Network Error",
          text: "Check your internet",
          confirmButtonText: "OK",
        });
  console.error("Error adding admin:", error);
}finally {
      setLoading(false); // ✅ enable again after response
    }
}
  };
  const handledeletePackage = async () => {
       const now = Date.now();

    if (now - lastClickTimeRef.current < 2000) {
      alert("⏳ Please wait 2 seconds before clicking again!");
      return; // ignore clicks within 2s
    }
    lastClickTimeRef.current = now;
    if (!selectedPackage.name || !selectedPackage.amount) return alert("Please fill all fields.");
          // setShowPackModal(false);

    setLoading(true);

    const storedGym = localStorage.getItem("selectedGym");

    if (storedGym) {
      const parsedGym = JSON.parse(storedGym);
   let gymId = parsedGym.GymId;
  try {
    const accessToken = localStorage.getItem("accessToken");
const memberData = {
  gymid: gymId,
    pid: selectedPackage.id,

  type: "remove",
};
   // `${apiBase}/api/add-trainer`,

  const response = await axios.post(
    `${apiBase}/api/add-hub-pack`,
   memberData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`, // 👈 add token to headers
      },
    }
  );

  if (response.data.success) {
  toast.success("✅ "+response.data.message);

    // Save trainer in ocalStorage
   deletePack(gymId, selectedPackage.id);
  //  setShowPackModal(false);
                      setIsEditing(false);

                    setSelectedPackage(null);

  } else if (response.data.error === 1) {
                    console.log("Access token expired while fetching page " );

                  const token = await refreshAccessToken(); // Refresh token
                   
                    if (!token) {
                        console.log("❌ Unable to refresh token. Logging out...");
                        handleLogout();
                        return;
                    }else{
                       return await retryPackApi(token, memberData,"api/add-hub-pack"); // 🔁 Retry with new token

                    }
                }else {
Swal.fire({
  icon: "error",                 // ❌ shows error icon
  title: "Failed to add Trajner",
  text: response.data.message,   // your API message
  confirmButtonText: "OK",
  background: "#fff",
  iconColor: "#e74c3c",          // optional: custom icon color
});   }
} catch (error) {
   Swal.fire({
          icon: "error",
          title: "Network Error",
          text: "Check your internet",
          confirmButtonText: "OK",
        });
  console.error("Error adding admin:", error);
}finally {
      setLoading(false); // ✅ enable again after response
    }
}
  };
const handleAddTrainer = async () => {
       const now = Date.now();

    if (now - lastClickTimeRef.current < 2000) {
      alert("⏳ Please wait 2 seconds before clicking again!");
      return; // ignore clicks within 2s
    }
    lastClickTimeRef.current = now;
    if (!newTrainer.name || !newTrainer.mob) return alert("Please fill all fields.");
           setShowAddModal(false);

    setLoading(true);

    const storedGym = localStorage.getItem("selectedGym");

    if (storedGym) {
      const parsedGym = JSON.parse(storedGym);
   let gymId = parsedGym.GymId;
  try {
    const accessToken = localStorage.getItem("accessToken");
const memberData = {
  gymid: gymId,
  age: newTrainer.age ?? 0, // if age is null or undefined, use 0
  name: newTrainer.name,
  mob: newTrainer.mob,
  info: newTrainer.info,
  type: "add",
  t_type: newTrainer.type
};
   // `${apiBase}/api/add-trainer`,

  const response = await axios.post(
    `${apiBase}/api/add-hub-trainer`,
   memberData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`, // 👈 add token to headers
      },
    }
  );

  if (response.data.success) {
  toast.success("✅ "+response.data.message);
  const coachida = response.data.coachid; // safer variable name

const trainerData = {
  ...newTrainer,              // copy everything from newTrainer
  id: Number(coachida),  // override with coachid
};
    // Save trainer in ocalStorage
    addTrainer(gymId, trainerData);
    setShowAddModal(false);
    setNewTrainer({ name: "", age: "", mob: "",info: "", type: "Normal" });

  } else if (response.data.error === 1) {
                    console.log("Access token expired while fetching page " );

                  const token = await refreshAccessToken(); // Refresh token
                   
                    if (!token) {
                        console.log("❌ Unable to refresh token. Logging out...");
                        handleLogout();
                        return;
                    }else{
                       return await retryApi(token, memberData,"api/add-hub-trainer"); // 🔁 Retry with new token

                    }
                }else {
Swal.fire({
  icon: "error",                 // ❌ shows error icon
  title: "Failed to add Trajner",
  text: response.data.message,   // your API message
  confirmButtonText: "OK",
  background: "#fff",
  iconColor: "#e74c3c",          // optional: custom icon color
});   }
} catch (error) {
   Swal.fire({
          icon: "error",
          title: "Network Error",
          text: "Check your internet",
          confirmButtonText: "OK",
        });
  console.error("Error adding admin:", error);
}finally {
      setLoading(false); // ✅ enable again after response
    }
}
  };

    const handleUpdateTrainer = async () => {
       const now = Date.now();

    if (now - lastClickTimeRef.current < 2000) {
      alert("⏳ Please wait 2 seconds before clicking again!");
      return; // ignore clicks within 2s
    }
    lastClickTimeRef.current = now;

    if (!selectedTrainer.name || !selectedTrainer.mob) return alert("Please fill all fields.");
    setLoading(true);
      const storedGym = localStorage.getItem("selectedGym");

    if (storedGym) {
      const parsedGym = JSON.parse(storedGym);
    const gymId = parsedGym.GymId;
        const accessToken = localStorage.getItem("accessToken");

   try {
   const memberData = {
  gymid: gymId,
  age: selectedTrainer.age ?? 0, // if age is null or undefined, use 0
  name: selectedTrainer.name,
  mob: selectedTrainer.mob,
  info: selectedTrainer.info,
  coachid: selectedTrainer.id,
  type: "update",
    t_type: selectedTrainer.type

};
  const response = await axios.post(
    `${apiBase}/api/add-hub-trainer`, // API URL
    memberData,
    {
      headers: {
       Authorization: `Bearer ${accessToken}`, // 👈 add token to headers
      },
    }
  );

  if (response.data.success) {
  toast.success("✅ "+response.data.message);

    // Save trainer in ocalStorage
    updateTrainer(gymId, selectedTrainer);

                    setIsEditing(false);
                    setSelectedTrainer(null);
    // Save trainer in localStorage
    //updateTrainer(gymId, trainerData);
    //fetchTrainers(gymId);
  } 
  else if (response.data.error === 1) {
                    // Token expired (API error = 1)
                    console.log("Access token expired while fetching page " );
                               //    alert("❌ Failed: " + res.data.message);

                 const token = await refreshAccessToken(); // Refresh token
                   
                    if (!token) {
                        console.log("❌ Unable to refresh token. Logging out...");
                        handleLogout();
                        return;
                    }else{
                       return await retryApi(token, memberData,"api/add-hub-trainer"); // 🔁 Retry with new token

                    }
                //    console.log("✅ Token refreshed. Retrying page " + currentPage);
                }
                
                else {
Swal.fire({
  icon: "error",                 // ❌ shows error icon
  title: "Failed to update",
  text: response.data.message,   // your API message
  confirmButtonText: "OK",
  background: "#fff",
  iconColor: "#e74c3c",          // optional: custom icon color
});     }
} catch (error) {
   Swal.fire({
          icon: "error",
          title: "Network Error",
          text: "Check your internet",
          confirmButtonText: "OK",
        });
  console.error("Error updating Admin:", error);
}finally {
      setLoading(false); // ✅ enable again after response
    }

  }
  };

    const handleDeleteTrainer = async () => {
       const now = Date.now();

    if (now - lastClickTimeRef.current < 2000) {
      alert("⏳ Please wait 2 seconds before clicking again!");
      return; // ignore clicks within 2s
    }
    lastClickTimeRef.current = now;
    setLoading(true);
    const storedGym = localStorage.getItem("selectedGym");

    if (storedGym) {
      const parsedGym = JSON.parse(storedGym);
   const gymId = parsedGym.GymId;
        const accessToken = localStorage.getItem("accessToken");

    try {
         const memberData = {
  coachid: selectedTrainer.id,
      type: "remove",
       gymid: gymId,

 
};
      const response = await axios.post(
  `${apiBase}/api/add-hub-trainer`, // API endpoint
  memberData,                     // 👈 your data model
  {
    headers: {
      Authorization: `Bearer ${accessToken}`, // 👈 token in headers
    },
  }
);
      if (response.data.success) {
  toast.success("✅ "+response.data.message);
  deleteTrainer(gymId,selectedTrainer.id);
        //fetchTrainers(gymId);
        //resetForm();
      } else if (response.data.error === 1) {
                    // Token expired (API error = 1)
                    console.log("Access token expired while fetching page " );
                               //    alert("❌ Failed: " + res.data.message);

                 const token = await refreshAccessToken(); // Refresh token
                   
                    if (!token) {
                        console.log("❌ Unable to refresh token. Logging out...");
                        handleLogout();
                        return;
                    }else{
                       return await retryApi(token, memberData,"api/add-hub-trainer"); // 🔁 Retry with new token

                    }
                //    console.log("✅ Token refreshed. Retrying page " + currentPage);
                }else {
Swal.fire({
  icon: "error",                 // ❌ shows error icon
  title: "Failed to delete Admin",
  text: response.data.message,   // your API message
  confirmButtonText: "OK",
  background: "#fff",
  iconColor: "#e74c3c",          // optional: custom icon color
});      }
    } catch (error) {
       Swal.fire({
              icon: "error",
              title: "Network Error",
              text: "Check your internet",
              confirmButtonText: "OK",
            });
      console.error("Error deleting admin:", error);
    }finally {
      setLoading(false); // ✅ enable again after response
    }
  }
  };
   let retryCount = 0;
const maxRetries = 2;

    const accessToken = localStorage.getItem("accessToken"); // or your current token
let a_token = accessToken;
const fetchCommData = async (gymId) => {
  try {
    setLoading(true);
    setEditingField(null);

    const response = await axios.get(`${apiBase}/api/fetch-comm-url?gymid=${gymId}`, {
      headers: {
        Authorization: `Bearer ${a_token}`,
      },
    });

    if (response.data.success) {
                       retryCount =0;

    setCommunity({
      youtube: response.data.result[0].yt_url || "",
      instagram: response.data.result[0].insta_url || "",
      facebook: response.data.result[0].fb_url || "",
    });
  
      localStorage.setItem(`hubcommdata_${gymId}`, JSON.stringify(response.data.result));
    //  setError(null); // clear previous error
    } else if (response.data.error === 1 ) {
      // Token expired or invalid, refresh and retry
       if (retryCount >= maxRetries) {
        console.log("❌ Token refresh failed repeatedly. Stopping...");
        handleLogout();
        return;
      }
      retryCount++;
      const newToken = await refreshAccessToken();
      localStorage.setItem("accessToken", newToken);
      a_token = newToken;
      return fetchCommData(gymId); // retry once with new token
    } else {
     // setError(response.data.message || "Failed to load trainers.");
    }
  } catch (err) {
    console.error("🔥 Error fetching trainers:", err);

  //  setError("Failed to fetch trainers.");
  } finally {
    setLoading(false);
  }
};
const fetchTrainers = async (gymId) => {
  try {
    setLoading(true);

    const response = await axios.get(`${apiBase}/api/fetch-hub-trainer?gymid=${gymId}`, {
      headers: {
        Authorization: `Bearer ${a_token}`,
      },
    });

    if (response.data.success) {
                       retryCount =0;

      setTrainers(response.data.result);
      localStorage.setItem(`hubtrainersdata_${gymId}`, JSON.stringify(response.data.result));
    //  setError(null); // clear previous error
    } else if (response.data.error === 1 ) {
      // Token expired or invalid, refresh and retry
       if (retryCount >= maxRetries) {
        console.log("❌ Token refresh failed repeatedly. Stopping...");
        handleLogout();
        return;
      }
      retryCount++;
      const newToken = await refreshAccessToken();
      localStorage.setItem("accessToken", newToken);
      a_token = newToken;
      return fetchTrainers(gymId); // retry once with new token
    } else {
     // setError(response.data.message || "Failed to load trainers.");
    }
  } catch (err) {
    console.error("🔥 Error fetching trainers:", err);

  //  setError("Failed to fetch trainers.");
  } finally {
    setLoading(false);
  }
};
const fetchPackages = async (gymId) => {
  try {
    setLoading(true);

    const response = await axios.get(`${apiBase}/api/fetch-hub-pack?gymid=${gymId}`, {
      headers: {
        Authorization: `Bearer ${a_token}`,
      },
    });

    if (response.data.success) {
                       retryCount =0;

      setPackages(response.data.result);
      localStorage.setItem(`hubpackdata_${gymId}`, JSON.stringify(response.data.result));
    //  setError(null); // clear previous error
    } else if (response.data.error === 1 ) {
      // Token expired or invalid, refresh and retry
       if (retryCount >= maxRetries) {
        console.log("❌ Token refresh failed repeatedly. Stopping...");
        handleLogout();
        return;
      }
      retryCount++;
      const newToken = await refreshAccessToken();
      localStorage.setItem("accessToken", newToken);
      a_token = newToken;
      return fetchPackages(gymId); // retry once with new token
    } else {
     // setError(response.data.message || "Failed to load trainers.");
    }
  } catch (err) {
    console.error("🔥 Error fetching trainers:", err);

  //  setError("Failed to fetch trainers.");
  } finally {
    setLoading(false);
  }
};
const refreshAccessToken =  async (e) =>  {
  const selectedGymRaw = localStorage.getItem("selectedGym");
                const selectedGymA = JSON.parse(selectedGymRaw);
        
    try {
        const res = await axios.post(
            `${apiBase}/api/refresh-token`,
            { mob: selectedGymA.mob },
            { withCredentials: true }
        );

        if (res.data.success && res.data.access_token) {
            // ✅ Save and return new token
            localStorage.setItem("accessToken", res.data.access_token);
            console.log("✅ Access token refreshed");
            return res.data.access_token;
        } else {
            console.log("❌ Refresh token invalid or expired. Logging out...");
            handleLogout();
            return null;
        }
    } catch (err) {
        console.error("🔥 Failed to refresh token:", err);
       // handleLogout();
        return null;
    }
};
  
      const handleLogout = () => {
     Swal.close();
          localStorage.removeItem("gyms");
          localStorage.removeItem("selectedGym");
      localStorage.setItem("isLoggedInWeb", "false");
  
          // ✅ Navigate back to login screen
          navigate("/login", { replace: true });
      };
       const retryApi = async (newToken, memberData,apiurl) => {
    try {
        const res = await axios.post(
            `${apiBase}/${apiurl}`,
            memberData,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${newToken}`,
                },
            }
        );

        if (res.data.success) {
            // goBack();
  toast.success("✅ "+res.data.message);
  switch(memberData.type){
    case "add":
  const coachida = res.data.coachid; // safer variable name

  if (coachida) {
const trainerData = {
  ...newTrainer,              // copy everything from newTrainer
  id: Number(coachida),  // override with coachid
};
    // Save trainer in ocalStorage
    addTrainer(gymId, trainerData);
    setShowAddModal(false);
    setNewTrainer({ name: "", age: "", mob: "",info: "", type: "Normal" });
}
      break;
      case "update":
  updateTrainer(gymId, selectedTrainer);

                    setIsEditing(false);
                    setSelectedTrainer(null);
        
        break;
        case "remove":
  deleteTrainer(gymId,selectedTrainer.id);
          break;
        
        }
   //fetchTrainers(memberData.gymid);
//alert(`✅ ${res.data.message}`);
        } else {
Swal.fire({
  icon: "error",                 // ❌ shows error icon
  title: "Failed retry",
  text: response.data.message,   // your API message
  confirmButtonText: "OK",
  background: "#fff",
  iconColor: "#e74c3c",          // optional: custom icon color
});         }
    } catch (err) {
        console.error("🔥 Retry API Error:", err);
        alert("Something went wrong while retrying.");
    }
};
    const retryUrlApi = async (newToken, memberData,apiurl) => {
    try {
        const res = await axios.post(
            `${apiBase}/${apiurl}`,
            memberData,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${newToken}`,
                },
            }
        );

        if (res.data.success) {
            // goBack();
  toast.success("✅ "+res.data.message);
  const updated = {
    ...community,
    [field]: community[field],
  };
setCommunity(updated);
  // Save back to localStorage
  localStorage.setItem("hubcommdata", JSON.stringify(updated));
        } else {
Swal.fire({
  icon: "error",                 // ❌ shows error icon
  title: "Failed retry",
  text: response.data.message,   // your API message
  confirmButtonText: "OK",
  background: "#fff",
  iconColor: "#e74c3c",          // optional: custom icon color
});         }
    } catch (err) {
        console.error("🔥 Retry API Error:", err);
        alert("Something went wrong while retrying.");
    }
};
      const retryPackApi = async (newToken, memberData,apiurl) => {
    try {
        const res = await axios.post(
            `${apiBase}/${apiurl}`,
            memberData,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${newToken}`,
                },
            }
        );

        if (res.data.success) {
            // goBack();
  toast.success("✅ "+res.data.message);
  switch(memberData.type){
    case "add":
  const pid = res.data.pid; // safer variable name

  if (pid) {
const packData = {
  ...newPackage,              // copy everything from newTrainer
  id: Number(pid),  // override with coachid
};
    // Save trainer in ocalStorage
    addPack(gymId, packData);
    setShowPackModal(false);
    setNewPackage({ name: "", amount: "", info: "", type: "Normal" });
}
      break;
      case "update":
   updatePack(gymId, selectedPackage);

                    setIsEditing(false);
                    setSelectedPackage(null);
        
        break;
        case "remove":
   deletePack(gymId, selectedPackage.id);
          break;
        
        }
   //fetchTrainers(memberData.gymid);
//alert(`✅ ${res.data.message}`);
        } else {
Swal.fire({
  icon: "error",                 // ❌ shows error icon
  title: "Failed retry",
  text: response.data.message,   // your API message
  confirmButtonText: "OK",
  background: "#fff",
  iconColor: "#e74c3c",          // optional: custom icon color
});         }
    } catch (err) {
        console.error("🔥 Retry API Error:", err);
        alert("Something went wrong while retrying.");
    }
};
function getTrainers(gymId) {
  const cached = localStorage.getItem(`hubtrainersdata_${gymId}`);
  return cached ? JSON.parse(cached) : [];
}
function saveTrainers(gymId, trainers) {
  localStorage.setItem(`hubtrainersdata_${gymId}`, JSON.stringify(trainers));
  setTrainers(trainers);
}
// Add trainer
function addTrainer(gymId, newTrainer) {
  const trainers = getTrainers(gymId);
  trainers.push(newTrainer);
  saveTrainers(gymId, trainers);
}

// Update trainer (by coachid)
function updateTrainer(gymId, updatedTrainer) {
  const trainers = getTrainers(gymId);
  const index = trainers.findIndex(t => t.id === updatedTrainer.id);
  if (index !== -1) {
    trainers[index] = { ...trainers[index], ...updatedTrainer }; // merge old + new
    saveTrainers(gymId, trainers);
  }
}

// Delete trainer (by coachid)
function deleteTrainer(gymId, coachid) {
  let trainers = getTrainers(gymId);
  trainers = trainers.filter(t => t.id !== coachid);
  saveTrainers(gymId, trainers);
}
function getPack(gymId) {
  const cached = localStorage.getItem(`hubpackdata_${gymId}`);
  return cached ? JSON.parse(cached) : [];
}
function savePack(gymId, pack) {
  localStorage.setItem(`hubpackdata_${gymId}`, JSON.stringify(pack));
  setPackages(pack);
}
// Add trainer
function addPack(gymId, newPackage) {
  const packages = getPack(gymId);
  packages.push(newPackage);
  savePack(gymId, packages);
}

// Update trainer (by coachid)
function updatePack(gymId, updatedPackage) {
  const packages = getPack(gymId);
  const index = packages.findIndex(t => t.id === updatedPackage.id);
  if (index !== -1) {
    packages[index] = { ...packages[index], ...updatedPackage }; // merge old + new
    savePack(gymId, packages);
  }
}

// Delete trainer (by coachid)
function deletePack(gymId, pid) {
  let packages = getPack(gymId);
  packages = packages.filter(t => t.id !== pid);
  savePack(gymId, packages);
}
  // Trainers List
  const renderTrainers = () => (
    <div className="mt-4">
      {/* Add Trainer Button */}
     <div className="flex justify-between mb-2">
      
  {/* Refresh button (left) */}
  <button
    onClick={() => {handleRefresh();}} // define this function
    className="flex items-center gap-2 px-7 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  >
    <RefreshCcw size={16} /> 
  </button>

  {/* Add Trainer button (right) */}
  <button
    onClick={() =>{  setShowAddModal(true);}}
    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
  >
    <Plus size={16} /> Add Trainer
  </button>
</div>

      {/* Trainers List */}
 <ul className="space-y-2">
  {trainers.map((t) => (
    <li key={t.id} className="flex flex-col">
      {/* Trainer Name Row */}

      <div
        className="p-3 bg-white shadow rounded cursor-pointer hover:bg-gray-50 flex justify-between items-center"
        onClick={() => 
                { 

          setSelectedTrainer(t.id === selectedTrainer?.id ? null : t)

        }
        
        }
      >
        <span className="font-medium">{t.name}</span>
        <span className="text-gray-400 text-sm">Click for details</span>
      </div>

      {/* Details Box Inline */}
      {selectedTrainer?.id === t.id && (
        <div className="mt-2 p-4 bg-white shadow rounded border border-gray-200">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={selectedTrainer.name}
                onChange={(e) =>
                  setSelectedTrainer({ ...selectedTrainer, name: e.target.value })
                }
                className="border p-2 rounded w-full"
              />
              <input
                type="number"
                value={selectedTrainer.age}
                onChange={(e) =>
                  setSelectedTrainer({ ...selectedTrainer, age: e.target.value })
                }
                className="border p-2 rounded w-full"
              />
               <input
                type="number"
                value={selectedTrainer.mob}
                onChange={(e) =>
                  setSelectedTrainer({ ...selectedTrainer, mob: e.target.value })
                }
                className="border p-2 rounded w-full"
              />
           <div className="flex flex-col gap-1">
  <textarea
    value={selectedTrainer.info}
    onChange={(e) =>
      setSelectedTrainer({ ...selectedTrainer, info: e.target.value })
    }
    maxLength={100} // limit to 200 chars
    className="border p-2 rounded w-full"
    placeholder="Description (max 100 characters)"
  />
  <span className="text-sm text-gray-500">
{selectedTrainer?.info?.length || 0}/100
  </span>
  </div>
              <select
                value={selectedTrainer.type}
                onChange={(e) =>
                  setSelectedTrainer({ ...selectedTrainer, type: e.target.value })
                }
                className="border p-2 rounded w-full"
              >
                <option value="Normal">Normal</option>
                <option value="Personal Trainer">Personal Trainer</option>
                <option value="Both">Both</option>
              </select>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-semibold mb-2">{selectedTrainer.name}</h3>
              <p><strong>Age:</strong> {selectedTrainer.age}</p>
              <p><strong>Mobile:</strong> {selectedTrainer.mob}</p>
              <p><strong>Description:</strong> {selectedTrainer.info || "No description"}</p>
              <p><strong>Type:</strong> {selectedTrainer.type}</p>
            </>
          )}

          <div className="mt-4 flex gap-2">
            {isEditing ? (
              <>
                <button
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => {
                    handleUpdateTrainer();
                   
                  }}
                >
                  Save
                </button>
                <button
                  className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => setIsEditing(true)}
                >
                  Update
                </button>
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() =>{
                    handleDeleteTrainer();
            }
                  }
                >
                  Delete
                </button>
                <button
                  className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  onClick={() => setSelectedTrainer(null)}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </li>
  ))}
</ul>



      {/* Add Trainer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Add Trainer</h2>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Name"
                value={newTrainer.name}
                onChange={(e) => setNewTrainer({ ...newTrainer, name: e.target.value })}
                className="border p-2 rounded w-full"
              />
              <input
                type="number"
                placeholder="Age"
                value={newTrainer.age}
                onChange={(e) => setNewTrainer({ ...newTrainer, age: e.target.value })}
                className="border p-2 rounded w-full"
              />
               <input
                type="number"
                placeholder="Mobile"
                value={newTrainer.mob}
                onChange={(e) => setNewTrainer({ ...newTrainer, mob: e.target.value })}
                className="border p-2 rounded w-full"
              />
                 <div className="flex flex-col gap-1">
  <textarea
    value={newTrainer.info}
    onChange={(e) =>
      setNewTrainer({ ...newTrainer, info: e.target.value })
    }
    maxLength={100} // limit to 200 chars
    className="border p-2 rounded w-full"
    placeholder="Description (max 100 characters)"
  />
  <span className="text-sm text-gray-500">
    {newTrainer.info.length}/100
  </span>
  </div>
              <select
                value={newTrainer.type}
                onChange={(e) => setNewTrainer({ ...newTrainer, type: e.target.value })}
                className="border p-2 rounded w-full"
              >
                <option value="Normal">Normal</option>
                <option value="Personal Trainer">Personal Trainer</option>
                <option value="Both">Both</option>
              </select>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                onClick={handleAddTrainer}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

      const renderPackages = () => (
    <div className="mt-4">
      {/* Add Trainer Button */}
     <div className="flex justify-between mb-2">
      
  {/* Refresh button (left) */}
  <button
    onClick={() => {handleRefreshPackage();}} // define this function
    className="flex items-center gap-2 px-7 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  >
    <RefreshCcw size={16} /> 
  </button>

  {/* Add Trainer button (right) */}
  <button
    onClick={() =>{  setShowPackModal(true);}}
    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
  >
    <Plus size={16} /> Add Package
  </button>
</div>

      {/* Trainers List */}
 <ul className="space-y-2">
  {packages.map((t) => (
    <li key={t.id} className="flex flex-col">
      {/* Trainer Name Row */}

      <div
        className="p-3 bg-white shadow rounded cursor-pointer hover:bg-gray-50 flex justify-between items-center"
        onClick={() => 
                { 

          setSelectedPackage(t.id === selectedPackage?.id ? null : t)

        }
        
        }
      >
        <span className="font-medium">{t.name}</span>
        <span className="text-gray-400 text-sm">Click for details</span>
      </div>

      {/* Details Box Inline */}
      {selectedPackage?.id === t.id && (
        <div className="mt-2 p-4 bg-white shadow rounded border border-gray-200">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={selectedPackage.name}
                onChange={(e) =>
                  setSelectedPackage({ ...selectedPackage, name: e.target.value })
                }
                className="border p-2 rounded w-full"
              />
              <input
                type="number"
                value={selectedPackage.amount}
                onChange={(e) =>
                  setSelectedPackage({ ...selectedPackage, amount: e.target.value })
                }
                className="border p-2 rounded w-full"
              />
             
           <div className="flex flex-col gap-1">
  <textarea
    value={selectedPackage.info}
    onChange={(e) =>
      setSelectedPackage({ ...selectedPackage, info: e.target.value })
    }
    maxLength={100} // limit to 200 chars
    className="border p-2 rounded w-full"
    placeholder="Description (max 100 characters)"
  />
  <span className="text-sm text-gray-500">
{selectedPackage?.info?.length || 0}/100
  </span>
  </div>
              <select
                value={selectedPackage.type}
                onChange={(e) =>
                  setSelectedPackage({ ...selectedPackage, type: e.target.value })
                }
                className="border p-2 rounded w-full"
              >
                <option value="Normal">Normal</option>
                <option value="Offer">Offer</option>
              </select>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-semibold mb-2">{selectedPackage.name}</h3>
              <p><strong>Amount:</strong> {selectedPackage.amount}</p>
              <p><strong>Description:</strong> {selectedPackage.info || "No description"}</p>
              <p><strong>Type:</strong> {selectedPackage.type}</p>
            </>
          )}

          <div className="mt-4 flex gap-2">
            {isEditing ? (
              <>
                <button
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => {
                   handleupdatePackage();
                   
                  }}
                >
                  Save
                </button>
                <button
                  className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => setIsEditing(true)}
                >
                  Update
                </button>
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() =>{
                    handledeletePackage();
            }
                  }
                >
                  Delete
                </button>
                <button
                  className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  onClick={() => setSelectedPackage(null)}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </li>
  ))}
</ul>



      {/* Add Trainer Modal */}
      {showPackModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Add Trainer</h2>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Name"
                value={newPackage.name}
                onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                className="border p-2 rounded w-full"
              />
              <input
                type="number"
                placeholder="Amount"
                value={newPackage.amount}
                onChange={(e) => setNewPackage({ ...newPackage, amount: e.target.value })}
                className="border p-2 rounded w-full"
              />
              
                 <div className="flex flex-col gap-1">
  <textarea
    value={newPackage.info}
    onChange={(e) =>
      setNewPackage({ ...newPackage, info: e.target.value })
    }
    maxLength={100} // limit to 200 chars
    className="border p-2 rounded w-full"
    placeholder="Description (max 100 characters)"
  />
  <span className="text-sm text-gray-500">
    {newPackage.info.length}/100
  </span>
  </div>
              <select
                value={newPackage.type}
                onChange={(e) => setNewPackage({ ...newPackage, type: e.target.value })}
                className="border p-2 rounded w-full"
              >
                <option value="Normal">Normal</option>
                <option value="Offer">Offer</option>
              </select>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowPackModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                onClick={handleAddPackage}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}``
    </div>
  );
  const renderCommunity = (label, name, value, placeholder) => (
    <div className="mb-4">
      
    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
  {icons[label]}
  <span>{label}</span>
</label>
      {editingField === name ? (
        <div className="flex gap-2">
          <input
            type="url"
            name={name}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className="flex-1 rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <button
            onClick={() => handleSaveIt(name)}
            className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-1"
          >
            <Check size={16} /> Save
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
          <p className="text-gray-800 truncate">
            {value || "Not set"}
          </p>
          <button
            onClick={() => setEditingField(name)}
            className="text-gray-600 hover:text-indigo-600 flex items-center gap-1 text-sm"
          >
            <Pencil size={16} /> Edit
          </button>
        </div>
      )}
    </div>
  );

   const handleSaveIt = async (field) => {
    console.log(`Saved ${field}:`, community[field]);
  let type;
  switch (field) {
    case "youtube":
      type = 0;
      break;
    case "instagram":
      type = 1;
      break;
    case "facebook":
      type = 2;
      break;
    default:
      type = -1; // fallback
  
  }
  
    setEditingField(null);

        const now = Date.now();

    if (now - lastClickTimeRef.current < 2000) {
      alert("⏳ Please wait 2 seconds before clicking again!");
      return; // ignore clicks within 2s
    }
    lastClickTimeRef.current = now;
    

    setLoading(true);

    const storedGym = localStorage.getItem("selectedGym");

    if (storedGym) {
      const parsedGym = JSON.parse(storedGym);
   let gymId = parsedGym.GymId;
  try {
    const accessToken = localStorage.getItem("accessToken");
const memberData = {
  gymid: gymId,
  type: type , 
  urlIs: community[field]


};
   // `${apiBase}/api/add-trainer`,

  const response = await axios.post(
    `${apiBase}/api/add-comm-url`,
   memberData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`, // 👈 add token to headers
      },
    }
  );

  if (response.data.success) {
  toast.success("✅ "+response.data.message);

  const updated = {
    ...community,
    [field]: community[field],
  };
setCommunity(updated);
  // Save back to localStorage
  localStorage.setItem("hubcommdata", JSON.stringify(updated));

  } else if (response.data.error === 1) {
                    console.log("Access token expired while fetching page " );

                  const token = await refreshAccessToken(); // Refresh token
                   
                    if (!token) {
                        console.log("❌ Unable to refresh token. Logging out...");
                        handleLogout();
                        return;
                    }else{
                       return await retryUrlApi(token, memberData,"api/add-comm-url"); // 🔁 Retry with new token

                    }
                }else {
Swal.fire({
  icon: "error",                 // ❌ shows error icon
  title: "Failed to add Trajner",
  text: response.data.message,   // your API message
  confirmButtonText: "OK",
  background: "#fff",
  iconColor: "#e74c3c",          // optional: custom icon color
});   }
} catch (error) {
   Swal.fire({
          icon: "error",
          title: "Network Error",
          text: "Check your internet",
          confirmButtonText: "OK",
        });
  console.error("Error adding admin:", error);
}finally {
      setLoading(false); // ✅ enable again after response
    }
}
  };

    const renderContent = () => {
    switch (activeTab) {
      case "Trainers":
return renderTrainers();
      case "Packages":
return renderPackages();
     case "Community":
  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex justify-start">
        <button
          onClick={handleRefreshComm} // define this function
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow"
        >
          <RefreshCcw size={16} />        </button>
      </div>

      {/* Community Fields */}
      <div className="space-y-4">
        {renderCommunity(
          "YouTube Channel",
          "youtube",
          community.youtube,
          "https://youtube.com/yourchannel"
        )}
        {renderCommunity(
          "Instagram",
          "instagram",
          community.instagram,
          "https://instagram.com/yourhandle"
        )}
        {renderCommunity(
          "Facebook",
          "facebook",
          community.facebook,
          "https://facebook.com/yourpage"
        )}
      </div>
    </div>
  );

      case "Analytics":
        return <div className="mt-6">📊 Analytics Section</div>;
      case "Settings":
        return <div className="mt-6">⚙️ Settings Section</div>;
      default:
        return null;
    }
  };


  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      {/* Tabs */}
            {loading && (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm z-50">
    <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-3 text-gray-700 font-medium">Processing...</p>
  </div>
)}
      <div className="w-full max-w-4xl mx-auto mt-10">
      {/* Tabs */}
      <div className="overflow-x-auto sm:overflow-x-hidden">
        <div
          className="
            flex p-2 
            min-w-max sm:min-w-0
            bg-gray-100 shadow-sm
            rounded-xl
            w-full
          "
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 whitespace-nowrap
                sm:flex-1
                ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white mt-6 p-6 rounded-xl shadow-lg min-h-[200px]">
        {renderContent()}
      </div>
    </div>

     </div>
  );
}
