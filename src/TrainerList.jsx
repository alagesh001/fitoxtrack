import { useEffect, useState, useRef} from "react";
import axios from "axios";
import { PencilSquareIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

function TrainerList({ gymId }) {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
    const lastClickTimeRef = useRef(0);
    const navigate = useNavigate();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [selectedTrainer, setSelectedTrainer] = useState(null); // 👈 Stores trainer for edit
  const [mode, setMode] = useState(""); // "" | "add" | "update"

  const apiBase = "https://oxadmedia.online";

  useEffect(() => {
    const storedGym = localStorage.getItem("selectedGym");

    if (storedGym) {
      const parsedGym = JSON.parse(storedGym);
      const cachedData = localStorage.getItem(`trainersdata_${parsedGym.GymId}`);

      if (cachedData) {
        const parsedTrainers = JSON.parse(cachedData);
        setTrainers(parsedTrainers);
        setLoading(false);
      } else {
       // fetchTrainers(parsedGym.GymId);
      }
    }
  }, [gymId]);
  let retryCount = 0;
const maxRetries = 2;
    const accessToken = localStorage.getItem("accessToken"); // or your current token
let a_token = accessToken;
const fetchTrainers = async (gymId) => {
  try {
    setLoading(true);

    const response = await axios.get(`${apiBase}/api/fetch-trainer?gymid=${gymId}`, {
      headers: {
        Authorization: `Bearer ${a_token}`,
      },
    });

    if (response.data.success) {
                       retryCount =0;

      setTrainers(response.data.result);
      localStorage.setItem(`trainersdata_${gymId}`, JSON.stringify(response.data.result));
      setError(null); // clear previous error
    } else if (response.data.error === 1 ) {
      // Token expired or invalid, refresh and retry
       if (retryCount >= maxRetries) {
        console.log("❌ Token refresh failed repeatedly. Stopping...");
        return;
      }
      retryCount++;
      const newToken = await refreshAccessToken();
      localStorage.setItem("accessToken", newToken);
      a_token = newToken;
      return fetchTrainers(gymId); // retry once with new token
    } else {
      setError(response.data.message || "Failed to load trainers.");
    }
  } catch (err) {
    console.error("🔥 Error fetching trainers:", err);
    setError("Failed to fetch trainers.");
  } finally {
    setLoading(false);
  }
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
  coachid: Number(coachida), // force number
  mob: Number(mobile),                      // force number
  name: name,
  password: "",   // keep empty if not needed
  role: "trainer"
};
    

    // Save trainer in localStorage
    addTrainer(gymId, trainerData);
  }
      break;
      case "update":
const trainerData = {
  coachid: Number(selectedTrainer.coachid), // force number
  mob: Number(mobile),                      // force number
  name: name,
  password: "",   // keep empty if not needed
  role: "trainer"
};

    // Save trainer in localStorage
    updateTrainer(gymId, trainerData);
        
        break;
        case "remove":
  deleteTrainer(gymId,selectedTrainer.coachid);
          break;
        
        }
   //fetchTrainers(memberData.gymid);
    resetForm();
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
  const handleAddTrainer = async () => {
       const now = Date.now();

    if (now - lastClickTimeRef.current < 2000) {
      alert("⏳ Please wait 2 seconds before clicking again!");
      return; // ignore clicks within 2s
    }
    lastClickTimeRef.current = now;
    if (!name || !mobile) return alert("Please fill all fields.");
    setLoading(true);
    const storedGym = localStorage.getItem("selectedGym");

    if (storedGym) {
      const parsedGym = JSON.parse(storedGym);
    gymId = parsedGym.GymId;
  try {
    const accessToken = localStorage.getItem("accessToken");
const memberData = {
  gymid: gymId,
  name: name,
  mob: mobile,
  type: "add",
 
};
   // `${apiBase}/api/add-trainer`,

  const response = await axios.post(
    `${apiBase}/api/add-trainer`,
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

  if (coachida) {
    const trainerData = {
  coachid: Number(coachida), // force number
  mob: Number(mobile),                      // force number
  name: name,
  password: "",   // keep empty if not needed
  role: "trainer"
};
   

    // Save trainer in localStorage
    addTrainer(gymId, trainerData);
  }
   //fetchTrainers(gymId);
    resetForm();
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
                       return await retryApi(token, memberData,"api/add-trainer"); // 🔁 Retry with new token

                    }
                //    console.log("✅ Token refreshed. Retrying page " + currentPage);
                }else {
Swal.fire({
  icon: "error",                 // ❌ shows error icon
  title: "Failed to add admin",
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
    if (!name || !mobile) return alert("Please fill all fields.");
    setLoading(true);
      const storedGym = localStorage.getItem("selectedGym");

    if (storedGym) {
      const parsedGym = JSON.parse(storedGym);
    gymId = parsedGym.GymId;
        const accessToken = localStorage.getItem("accessToken");

   try {
    const memberData = {
  coachid: selectedTrainer.coachid,
      name: name,
      mob: mobile,
      type: "update",
       gymid: gymId
 
};
  const response = await axios.post(
    `${apiBase}/api/add-trainer`, // API URL
    memberData,
    {
      headers: {
       Authorization: `Bearer ${accessToken}`, // 👈 add token to headers
      },
    }
  );

  if (response.data.success) {
  toast.success("✅ "+response.data.message);
  
    const trainerData = {
  coachid: Number(selectedTrainer.coachid), // force number
  mob: Number(mobile),                      // force number
  name: name,
  password: "",   // keep empty if not needed
  role: "trainer"
};
    // Save trainer in localStorage
    updateTrainer(gymId, trainerData);
    //fetchTrainers(gymId);
    resetForm();
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
                       return await retryApi(token, memberData,"api/add-trainer"); // 🔁 Retry with new token

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
    gymId = parsedGym.GymId;
        const accessToken = localStorage.getItem("accessToken");

    try {
         const memberData = {
  coachid: selectedTrainer.coachid,
      type: "remove",
       gymid: gymId,

 
};
      const response = await axios.post(
  `${apiBase}/api/add-trainer`, // API endpoint
  memberData,                     // 👈 your data model
  {
    headers: {
      Authorization: `Bearer ${accessToken}`, // 👈 token in headers
    },
  }
);
      if (response.data.success) {
  toast.success("✅ "+response.data.message);
  deleteTrainer(gymId,selectedTrainer.coachid);
        //fetchTrainers(gymId);
        resetForm();
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
                       return await retryApi(token, memberData,"api/add-trainer"); // 🔁 Retry with new token

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
  const resetForm = () => {
    setMode(""); // Go back to list
    setName("");
    setMobile("");
    setSelectedTrainer(null);
  };
    const handleLogout = () => {
   Swal.close();
        localStorage.removeItem("gyms");
        localStorage.removeItem("selectedGym");
    localStorage.setItem("isLoggedInWeb", "false");

        // ✅ Navigate back to login screen
        navigate("/login", { replace: true });
    };
  // if (loading) {
  //   return (
  //     <div className="flex justify-center items-center py-10">
  //       <span className="text-gray-500">Loading trainers...</span>
  //     </div>
  //   );
  // }

// Save back to localStorage
function getTrainers(gymId) {
  const cached = localStorage.getItem(`trainersdata_${gymId}`);
  return cached ? JSON.parse(cached) : [];
}
function saveTrainers(gymId, trainers) {
  localStorage.setItem(`trainersdata_${gymId}`, JSON.stringify(trainers));
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
  const index = trainers.findIndex(t => t.coachid === updatedTrainer.coachid);
  if (index !== -1) {
    trainers[index] = { ...trainers[index], ...updatedTrainer }; // merge old + new
    saveTrainers(gymId, trainers);
  }
}

// Delete trainer (by coachid)
function deleteTrainer(gymId, coachid) {
  let trainers = getTrainers(gymId);
  trainers = trainers.filter(t => t.coachid !== coachid);
  saveTrainers(gymId, trainers);
}

  return (
    <div className="p-4">
      {/* 🆕 Add/Edit Form */}
        {loading && (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm z-50">
    <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-3 text-gray-700 font-medium">Processing...</p>
  </div>
)}
      {mode !== "" ? (
        <div className="mb-6 p-4 rounded-xl border border-gray-300 shadow bg-gray-50">
          <h2 className="text-lg font-bold mb-3">
            {mode === "add" ? "➕ Add Admin" : "✏️ Edit Admin"}
          </h2>
          <div className="grid gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Mobile"
              className="w-full p-2 border rounded"
            />
            {mode === "add" && (
              <button
                onClick={handleAddTrainer}
                className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 transition"
              >
                Add
              </button>
            )}
            {mode === "update" && (
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateTrainer}
                  className="flex-1 px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
                >
                  Update
                </button>
                <button
                  onClick={() =>{
                        Swal.fire({
                              title: "Are you sure?",
                              text: "This will permanently delete the Admin",
                              icon: "warning",
                              showCancelButton: true,
                              confirmButtonText: "Yes, delete",
                              cancelButtonText: "Cancel",
                              confirmButtonColor: "#d33",
                              cancelButtonColor: "#3085d6",
                              reverseButtons: true
                            }).then((result) => {
                              if (result.isConfirmed) {
                                 handleDeleteTrainer();
                                // Swal.fire({
                                //   title: "Deleted!",
                                //   text: "Leads have been cleared successfully.",
                                //   icon: "success",
                                //   confirmButtonColor: "#3085d6"
                                // });
                              }
                            });
                        
                        
                       } }
                  className="flex-1 px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition"
                >
                  <TrashIcon className="inline-block w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            )}
            <button
              onClick={resetForm}
              className="mt-2 px-4 py-1 rounded border text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        // 🟢 Show Add Button only in list view
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Admins</h2>
          <button
            onClick={() => setMode("add")}
            className="flex items-center gap-2 px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600 transition"
          >
            <PlusIcon className="h-4 w-4" />
            Add Admin
          </button>
        </div>
      )}

      {/* 📃 List of trainers */}
      <div className="grid gap-4">
        <div className="text-sm text-gray-500 italic">
    🔄 Refresh from <span className="font-medium">Active Clients</span> section to update the list to latest.
  </div>
               {/* {error && (
    <div className="text-center text-red-600 font-semibold py-4">
      ❌ {error}
    </div>
  )} */}
        {trainers.length > 0 ? (
          trainers.map((person) => (
            <div
              key={person.coachid}
              className="flex justify-between items-center p-4 rounded-xl border border-gray-300 shadow-sm bg-gray-50 hover:shadow-md transition"
            >
              <div>
                <p className="font-semibold text-gray-800">{person.name}</p>
                <p className="text-sm text-gray-600">📱 {person.mob}</p>
                <p className="text-sm text-gray-600">🆔 Admin ID: {person.coachid}</p>
                {person.role === "dietician" && (
  <p className="text-sm text-gray-600">🥗 Role: Dietician</p>
)}
              </div>
              <button
                onClick={() => {
                  setSelectedTrainer(person);
                  setName(person.name);
                  setMobile(person.mob);
                  setMode("update");
                      window.scrollTo({ top: 0, behavior: "smooth" });

                }}
                className="flex items-center gap-1 px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
              >
                <PencilSquareIcon className="h-4 w-4" />
                Edit
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No Admins found.</p>
        )}
      </div>
    </div>
  );
}

export default TrainerList;
