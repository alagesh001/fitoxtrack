import React, { useEffect, useState,useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import CallIcon from "./assets/icn_call.png";
import WhatsappIcon from "./assets/wapp_icn.png";
import { toast } from "react-toastify";
import WhatsAppReminderDropdown from './WhatsAppReminderDropdown'; // path as per your project
import { exportClientsToExcel,exportClientsToExcelStreaming} from "./helper/excelconvert";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline"; // download icon
import { getActiveClientsForGymBatched,clearActiveClientsForGym,
  saveActiveClientsForGymPage,updateActiveClientAttendance } from './helper/indexeddbhelper2';
  import Loader from "./helper/Loader";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { showUpgradePopup } from './helper/reuse.js';

function ActiveClients() {
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
        const [saving, setSaving] = useState(false);

        const [firstLoad, setFirstLoading] = useState(true);
const MySwal = withReactContent(Swal);
const [disabled, setDisabled] = useState(false);

    const [error, setError] = useState("");
const [selectedTrainer, setSelectedTrainer] = useState(null); // null means "All"
const [trainers, setTrainers] = useState([]); // empty array initially
 const handleRefresh = async () => {
    if (disabled) {
      Swal.fire({
        icon: "info",
        title: "Please wait",
        text: "You need to wait 10 seconds before refreshing again.",
        confirmButtonText: "OK",
      });
      return;
    }

   
                          setDisabled(true);

    localStorage.removeItem("clients");
    const token = localStorage.getItem("accessToken");

    try {
      await fetchAllClients(token);
      await fetchTrainers(selectedGym.GymId, token);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while refreshing.",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);

      // Re-enable button after 10 seconds
      setTimeout(() => setDisabled(false), 10000);
    }
  };
    const navigate = useNavigate();
    const selectedGym = JSON.parse(localStorage.getItem("selectedGym"));
    const accessToken = localStorage.getItem("accessToken");
const [sortAscending, setSortAscending] = useState(true);
//const location = useLocation();
//const success = location.state?.success;
//const message = location.state?.message;
    const apiBase = "https://oxadmedia.online";
     const [showToast, setShowToast] = useState(false);
     function getCurrentDateTimeIST() {
  const now = new Date();
  const istTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  const year = istTime.getFullYear();
  const month = String(istTime.getMonth() + 1).padStart(2, "0");
  const day = String(istTime.getDate()).padStart(2, "0");
  const hours = String(istTime.getHours()).padStart(2, "0");
  const minutes = String(istTime.getMinutes()).padStart(2, "0");
  const seconds = String(istTime.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
const retryApi = async (client,newToken, memberData,apiurl) => {
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
if(apiurl == "api/mark-attendAdmin"){
if (res.data.message.toLowerCase().includes("expired")) {
  // 🚨 Custom alert for expired
  alert(`❌ Attendance failed: Member ${client.name} is expired`);
} else {
  // ✅ Normal success alert
  alert(`✅ ${res.data.message} Member: ${client.name}`);
   const updatedClient = {
          ...client,
          attendance_count: res.data.a_count,
          last_attend: res.data.last_attend,

        };

        // 1️⃣ Update in React state
        setClients((prev) =>
          prev.map((c) =>
            c.userid === updatedClient.userid ? updatedClient : c
          )
        );

        // 2️⃣ Update in IndexedDB
        await updateActiveClientAttendance(updatedClient);
      
      
}

}
          

//alert(`✅ ${res.data.message}`);
        } else {
            alert("❌ Failed even after retry: " + res.data.message);
        }
    } catch (err) {
        console.error("🔥 Retry API Error:", err);
        alert("Something went wrong while retrying.");
    }
};
const handleMarkAttendance = async (client) => {
   const now = new Date();
  const istOffset = 5.5 * 60; // IST is UTC+5:30 in minutes
  const istTime = new Date(now.getTime() + (istOffset + now.getTimezoneOffset()) * 60000);

  // Get last attendance date in IST
  const lastAttendUTC = new Date(client.last_attend);
  const lastAttendIST = new Date(lastAttendUTC.getTime() + (istOffset + lastAttendUTC.getTimezoneOffset()) * 60000);

  const isToday =
    istTime.getFullYear() === lastAttendIST.getFullYear() &&
    istTime.getMonth() === lastAttendIST.getMonth() &&
    istTime.getDate() === lastAttendIST.getDate();

  if (isToday) {
    Swal.fire({
      icon: "info",
      title: "Already Marked",
      text: "Attendance has already been marked for today.",
      confirmButtonText: "OK",
    });
    return; // stop further attendance marking
  }
  const gymIdIs = selectedGym?.GymId || null; // ✅ safe fallback              
    const token = localStorage.getItem("accessToken");

               const memberData = {
    gymid: gymIdIs , // 🔥 fallback to null
        userid: client.userid ,



};
          //      `${apiBase}/markAttendAdminSide.php`,

         try {
          MySwal.fire({
    title: "Please wait...",
    html: "Marking Attendance...",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading(); // show spinner
    },
  }); 
            const res = await axios.post(
                `${apiBase}/api/mark-attendAdmin`,
                memberData,
                {
                   headers: {
                        "Content-Type": "application/json",
                         Authorization: `Bearer ${token}`,

                    },
                }
            );
Swal.close();
            if (res.data.success) {
if (res.data.message.toLowerCase().includes("expired")) {
  // 🚨 Custom alert for expired
Swal.fire({
  icon: "error",                         // ❌ shows error icon
  title: "Attendance Failed",
  text: `${client.name} membership expired`,
  confirmButtonText: "OK",
  background: "#fff",                     // optional: custom background
  iconColor: "#e74c3c",                  // optional: red icon
});} else {
  // ✅ Normal success alert
Swal.fire({
  icon: "success",                     // ✅ green check icon
  title: "Attendance Successful",
  text: `${res.data.message} Member: ${client.name}`,
  confirmButtonText: "OK",
  background: "#fff",                   // optional: custom background
  iconColor: "#28a745",                // optional: green icon
});   const updatedClient = {
          ...client,
          attendance_count: res.data.a_count,
          last_attend: res.data.last_attend,

        };

        // 1️⃣ Update in React state
        setClients((prev) =>
          prev.map((c) =>
            c.userid === updatedClient.userid ? updatedClient : c
          )
        );

        // 2️⃣ Update in IndexedDB
        await updateActiveClientAttendance(updatedClient);
      
      
}

//alert(`✅ ${res.data.message}`);
                // Optionally reset form
            } else if (res.data.error === 1) {
                    // Token expired (API error = 1)
                    console.log("Access token expired while fetching page " );
                               //    alert("❌ Failed: " + res.data.message);

                  const token = await refreshAccessToken(); // Refresh token
                   
                    if (!token) {
                        console.log("❌ Unable to refresh token. Logging out...");
                        handleLogout();
                        return;
                    }else{
                       return await retryApi(client,token, memberData,"api/mark-attendAdmin"); // 🔁 Retry with new token

                    }
                //    console.log("✅ Token refreshed. Retrying page " + currentPage);
                }else {
                  Swal.fire({
  icon: "error",                         // ❌ shows error icon
  title: "Error",
  text:  res.data.message,
  confirmButtonText: "OK",
  background: "#fff",                     // optional: custom background
  iconColor: "#e74c3c",                  // optional: red icon
});
                //alert("❌ Failed: " + res.data.message);
            }
        } catch (err) {
           Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Check your internet",
        confirmButtonText: "OK",
      });
            console.error("🔥 API Error:", err);
           // alert("Something went wrong while adding member.");
        }
};
useEffect(() => {
  const msg = localStorage.getItem("activeclients-toast");
  if (msg) {
      // setLoading(true); // Show loader
      //       clearActiveClientsForGym(selectedGym.GymId);
      //       let token = localStorage.getItem("accessToken")
      //        fetchAllClients(token);
    toast.success(msg);
    localStorage.removeItem("activeclients-toast");
  }
}, []);
// useEffect(() => {
//   if (success) {
// toast.success(`🎉 ${message}`, { toastId: "unique-success" });
//     navigate(location.pathname, { replace: true });
//         setLoading(true); // Show loader
//             localStorage.removeItem("clients");
//             let token = localStorage.getItem("accessToken")
//             fetchAllClients(token);
//   }
// }, [success, message, navigate, location.pathname]);
     const handleDueClick = (client) => {
  navigate("/add-member", {
    state: {
      type: "due", // 👈 type is "edit"
      client,       // 👈 pass the client data too
    },
  });
};
const handleFreezeClick = (client) => {
  navigate("/add-member", {
    state: {
      type: "freeze", // 👈 type is "edit"
      client,       // 👈 pass the client data too
    },
  });
};
const handleRenewClick = (client) => {
  navigate("/add-member", {
    state: {
      type: "renew", // 👈 type is "edit"
      client,       // 👈 pass the client data too
    },
  });
};
const handleEditClick = (client) => {
  navigate("/add-member", {
    state: {
      type: "edit", // 👈 type is "edit"
      client,       // 👈 pass the client data too
    },
  });
};
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000); // Toast visible for 2s
        });
    };
    const [sortNameAsc, setSortNameAsc] = useState(true);
const handleSortByName = () => {
    const sortedClients = [...clients].sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();

        if (nameA < nameB) return sortNameAsc ? -1 : 1;
        if (nameA > nameB) return sortNameAsc ? 1 : -1;
        return 0;
    });

    setClients(sortedClients);
    setSortNameAsc(!sortNameAsc); // Toggle ascending/descending
};
const handleSortByExpiry = () => {
    const sortedClients = [...clients].sort((a, b) => {
        const dateA = new Date(a.renewal_date);
        const dateB = new Date(b.renewal_date);
        return sortAscending ? dateA - dateB : dateB - dateA;
    });
    setClients(sortedClients);
    setSortAscending(!sortAscending); // Toggle sort direction
};
const fetchTrainers = async (gymId,token) => {
    try {
         const response = await axios.get(`${apiBase}/api/fetch-trainer?gymid=${gymId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

        if (response.data.success) {
          //  console.log("✅ Trainer data fetched:", response.data.result);
            setTrainers(response.data.result); // Save to state
         if (gymId && response?.data?.renew_date) {
          console.log("storing  ",gymId ,response.data.renew_date);

  localStorage.setItem(`renew_data_${gymId}`, response.data.renew_date);
}
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
let retryCount = 0;
const maxRetries = 2;
const fetchAllClients = async (token) => {
    let currentPage = 1;
    let totalPages = 1; // to enter the loop
setFirstLoading(true);
  MySwal.fire({
    title: "Please wait...",
    html: "Updating all clients in batches. Do not close or navigate away.",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading(); // show spinner
    },
  });
    setClients([]); // Clear previous clients
    setLoading(true);
    setError("");
    const allClients = []; // 🔥 Temporary array
               //     `${apiBase}/getmemberwdata.php?gymid=${selectedGym.GymId}&page=${currentPage}`,
const startTime = Date.now();

    try {
        while (currentPage <= totalPages) {
            try {
                 if (Date.now() - startTime > 7000) { // 60s timeout
        console.error("❌ Stopping due to timeout");
        break;
    }
                // Fetch current page
                const response = await axios.get(
                    `${apiBase}/api/fetch-activeclients?gymid=${selectedGym.GymId}&page=${currentPage}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data.success) {
 retryCount =0;
                    const pageClients = response.data.result;
                     // const pageClients = response.data.result.filter(c => c.userid); // ✅ remove bad records

  allClients.push(...pageClients);
setFirstLoading(false);
setClients((prevClients) => [...prevClients, ...pageClients]);

                    // Append to temporary array

//                    localStorage.setItem(
//     `clientsdata_${selectedGym.GymId}`, // key based on gymId
//     JSON.stringify(allClients)
                

// );


                    totalPages = response.data.total_pages; // update total pages
                   // console.log(`✅ Fetched page ${currentPage}/${totalPages} (${pageClients.length} members)`);

                    currentPage += 1; // move to next page
                    setLoading(false);
//await new Promise(resolve => setTimeout(resolve, 0));
   Swal.close();
                } else if (response.data.error === 1) {
                    // Token expired (API error = 1)
                    console.log("Access token expired while fetching page " + currentPage);
                     if (retryCount >= maxRetries) {
        console.log("❌ Token refresh failed repeatedly. Stopping...");
        break;
      }
      retryCount++;
                    token = await refreshAccessToken(); // Refresh token
                    if (!token) {
                        console.log("❌ Unable to refresh token. Logging out...");
                        handleLogout();
                        return;
                    }
                    console.log("✅ Token refreshed. Retrying page " + currentPage);
                } else {
                    setDisabled(false);
                     if (Swal.isLoading()) {
    Swal.close();
  }    
                  if(response.data.error == 99){
            
  showUpgradePopup({
                    price: "₹5000 / Year",
                    titleIs: "Renew Now"
                   });
const d = new Date();
d.setDate(d.getDate() - 1); // go to yesterday

const formattedYesterday =
  String(d.getDate()).padStart(2, "0") + "-" +
  String(d.getMonth() + 1).padStart(2, "0") + "-" +
  d.getFullYear();

localStorage.setItem(`renew_data_${selectedGym.GymId}`, formattedYesterday);
                  }   else{
            Swal.fire({
  icon: "error",                         // ❌ shows error icon
  title: "Error",
  text:  response.data.message,
  confirmButtonText: "OK",
  background: "#fff",                     // optional: custom background
  iconColor: "#e74c3c",                  // optional: red icon
});
                  }                           

                  
                        

                    //setError(response.data.message);
                    break;
                }
            } catch (err) {
 if (Swal.isLoading()) {
    Swal.close();
  }
                // if (err.response && err.response.data.message === "Invalid or expired token") {
                //     console.log("Access token expired while fetching page " + currentPage);
                //     token = await refreshAccessToken(); // Refresh token
                //     if (!token) {
                //         console.log("❌ Unable to refresh token. Logging out...");
                //         handleLogout();
                //         return;
                //     }
                //     console.log("✅ Token refreshed. Retrying page " + currentPage);
                // } else {
                //     console.error(err);
                //     setError("Failed to fetch clients on page " + currentPage);
                //     break;
                // }
                        setDisabled(false);
 Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Check your internet",
        confirmButtonText: "OK",
      });
                   console.error(err);
                    setError("Failed to fetch clients on page " + currentPage);
                    break;
            }
        }

        // ✅ Set all clients at once to avoid duplicates
       // setClients(allClients);
               setLoading(false);
if(allClients.length>0){
      setDisabled(true);

await saveClientsInBatches(selectedGym.GymId, allClients, 1000);

      }
        console.log("🎉 All pages fetched and displayed.");
    } catch (err) {
              setLoading(false);
      setDisabled(false);

        console.error("🔥 Unexpected error:", err);
        setError("Something went wrong while fetching clients.");
    } finally {
      setFirstLoading(false);

    }
};
useEffect(() => {
  const bc = new BroadcastChannel("client-saving");

  bc.onmessage = async (event) => {
    if (event.data.status === "completed") {
      console.log("completed fetch");

      const savedClients = [];

      await getActiveClientsForGymBatched(
        selectedGym.GymId,
        100,
        async (batch) => {
          savedClients.push(...batch);
        }
      );

      // ✅ Replace state with fresh list instead of appending
      setClients(savedClients);

      //console.log("Fetched clients:", savedClients.length);
    }
  };

  //console.log("BroadcastChannel listening...");

  return () => {
    bc.close();
    //console.log("BroadcastChannel closed");
  };
}, [selectedGym.GymId]);

async function saveClientsInBatches(gymId, clients, batchSize = 1000) {
  setSaving(true);

  const totalBatches = Math.ceil(clients.length / batchSize);

  // ✅ Create or get progress bar
  let barContainer = document.getElementById("batch-progress-bar");
  if (!barContainer) {
    barContainer = document.createElement("div");
    barContainer.id = "batch-progress-bar";
    barContainer.className = "fixed top-0 left-0 w-full z-50 bg-gray-100 shadow-lg p-4 rounded-b-lg";
    document.body.appendChild(barContainer);

    barContainer.innerHTML = `
      <div class="w-full bg-gray-300 h-6 rounded">
        <div id="batch-progress-fill" class="bg-blue-600 h-6 w-0 rounded transition-all"></div>
      </div>
      <p id="batch-progress-text" class="text-center text-sm text-gray-700 mt-2 font-medium">0%</p>
    `;
  }

  const progressBar = document.getElementById("batch-progress-fill");
  const progressText = document.getElementById("batch-progress-text");

  // ✅ Reset progress for this run
  progressBar.style.width = "0%";
  progressText.textContent = `0% (0 / ${totalBatches} batches)`;
  barContainer.style.display = "block";
const bc = new BroadcastChannel("client-saving");
bc.postMessage({ status: "started" });
  try {
    for (let i = 0; i < clients.length; i += batchSize) {
      const batch = clients.slice(i, i + batchSize);
      const clearBefore = i === 0;

      await saveActiveClientsForGymPage(gymId, batch, clearBefore);

      // Update progress
      const currentBatch = i / batchSize + 1;
      const progressPercent = Math.round((currentBatch / totalBatches) * 100);
      progressBar.style.width = `${progressPercent}%`;
      progressText.textContent = `${progressPercent}% (${currentBatch} / ${totalBatches} batches)`;
    }
    // ✅ Hide progress after completion
    
    console.log("clients is set new");
// ... after saving
bc.postMessage({ status: "completed" });
    setTimeout(() => {
      barContainer.style.display = "none";
    }, 1000);
  } catch (err) {
    console.error("❌ Failed saving clients:", err);
    barContainer.style.display = "none";
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to save clients. Please try again.",
    });
  }
}

const getStatusColor = (client) => {
  if (client.due_amount > 0) return "gray";
  const renewalDate = new Date(client.renewal_date);
  const today = new Date();

  if (renewalDate < today) return "red";

  const daysLeft = (renewalDate - today) / (1000 * 60 * 60 * 24);
  if (daysLeft <= 5) return "yellow";

  return "green";
};


const refreshAccessToken = async () => {
    try {
        const res = await axios.post(
            `${apiBase}/api/refresh-token`,
            { mob: selectedGym.mob },
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

const [expandedClientId, setExpandedClientId] = useState(null); // Track expanded client

const toggleExpand = (clientId) => {
    setExpandedClientId((prev) => (prev === clientId ? null : clientId));
};


    const handleLogout = () => {
   Swal.close();
        localStorage.removeItem("gyms");
        localStorage.removeItem("selectedGym");
    localStorage.setItem("isLoggedInWeb", "false");

        // ✅ Navigate back to login screen
        navigate("/login", { replace: true });
    };
useEffect(() => {
            const selectedGym = JSON.parse(localStorage.getItem("selectedGym"));

        const cachedTrainers = localStorage.getItem(`trainersdata_${selectedGym.GymId}`);

        if (cachedTrainers) {
         //   console.log(`📦 Loaded trainers from localStorage for GymId: ${selectedGym.GymId}`);
            setTrainers(JSON.parse(cachedTrainers)); // ✅ Set trainers state
        } else {
          //  console.log(`🌐 No cached trainers found. Fetching for GymId: ${selectedGym.GymId}`);
         //   fetchTrainers(selectedGym.GymId, token); // Fetch from API if not cached
        }
    
}, []);
const hasLoadedRef = useRef(false);

useEffect(() => {
 async function loadClients() {

  if (hasLoadedRef.current) return; // skip if already loaded
     setLoading(true);
  hasLoadedRef.current = true;
    const selectedGym = JSON.parse(localStorage.getItem("selectedGym"));
    const token = localStorage.getItem("accessToken");

    const savedClients = [];
let a = 1;
    await getActiveClientsForGymBatched(
  selectedGym.GymId,
  100,
  async (batch) => {
   savedClients.push(...batch);
      
setFirstLoading(false);
  //console.log(`📦 Received batch of ${a}`);
  //a++;

    setClients((prevClients) => [...prevClients, ...batch]);
 setLoading(false);
  }
);

if (savedClients.length > 0) {
  //setClients(savedClients); // set only once
} else {
  await fetchAllClients(token);
}

  }
    loadClients();

  }, []);
// useEffect(() => {
//   async function loadClients() {
//     setLoading(true);

//     const selectedGym = JSON.parse(localStorage.getItem("selectedGym"));
//     const token = localStorage.getItem("accessToken");

//     const savedClients = [];

//     await getActiveClientsForGymBatched(
//       selectedGym.GymId,
//       100,
//       async (batch) => {
//         console.log(`📦 Received batch of ${batch.length}`);
//         savedClients.push(...batch);
//         setClients((prev) => [...prev, ...batch]); // Show in UI as they come
//       }
//     );

//     console.log("✅ All batches loaded:", savedClients);

//     if (savedClients.length === 0) {
//       console.log("🌐 No clients in IndexedDB, fetching from API...");
//       await fetchAllClients(token); // Will setClients internally
//     }

//     setLoading(false);
//   }

//   loadClients();
// }, []);
// Shimmering Client Row
const ClientRowShimmer = () => {
  return (
    <li
      className="grid grid-cols-[60px_1fr_auto] p-3 mb-2 rounded-lg shadow-sm bg-green-300 animate-pulse"
    >
      {/* Index placeholder */}
      <div className="h-4 w-6 bg-gray-300/40 rounded"></div>

      {/* Name placeholder */}
      <div className="h-4 w-32 bg-gray-300/40 rounded"></div>

      {/* Date placeholder */}
      <div className="h-4 w-20 bg-gray-300/40 rounded justify-self-end"></div>
    </li>
  );
};
const filteredClients = clients
    .filter((client) => {
        // ✅ Filter by selected trainer
        if (selectedTrainer) {
            return client.coachid === selectedTrainer.coachid;
        }
        return true; // no trainer filter
    })
    .filter((client) => {
        // ✅ Filter by search term
        const search = searchTerm.toLowerCase();
        return (
            client.name.toLowerCase().includes(search) ||
            String(client.mobile).includes(searchTerm) // convert mobile to string
        );
    });

// if (loading) {
//   return <Loader label="Fetching clients..." />;
// }   

    return (
<div className="p-4">
         {/* {error && (
    <div className="text-center text-red-600 font-semibold py-4">
      ❌ {error}
    </div>
  )} */}
<div className="flex justify-between items-center mb-4">
  {/* Title on the left */}
  <h1 className="text-2xl font-bold">Active Clients</h1>

  {/* Button group on the right */}
  <div className="flex items-center gap-2">
    {/* Refresh Button */}
   
 <button
      onClick={handleRefresh}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition 
        ${disabled ? "bg-gray-400 cursor-not-allowed" : "bg-gray-600 text-white hover:bg-blue-700 active:scale-95"}`}
    >
      <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
      <span>Refresh</span>
    </button>

    {/* Export Button */}
    <button
      onClick={() => exportClientsToExcel(selectedGym.GymId)}
      className="flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900 transition"
    >
      <ArrowDownTrayIcon className="w-5 h-5" />
    </button>
  </div>
</div>

    {/* Search Field */}
    <input
        type="text"
        placeholder="Search by name/mobile"
        className="w-full p-2 mb-4 border rounded"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
    />
<div
  className="flex overflow-x-auto space-x-7 p-2"
  style={{
    scrollbarWidth: "none", // Firefox
    msOverflowStyle: "none", // IE 10+
  }}
>
  {/* Container for buttons */}
  <div
    className="flex items-center space-x-8"
    style={{
      WebkitOverflowScrolling: "touch",
    }}
  >
    {/* "All" Button */}
    <button
      onClick={() => setSelectedTrainer(null)}
      className={`text-sm whitespace-nowrap 
        ${selectedTrainer === null ? "font-bold underline text-black-800" : "text-gray-700"}
      `}
    >
      All
    </button>

    {/* Trainer Names */}
    {trainers.map((trainer) => (
      <button
        key={trainer.coachid}
        onClick={() => setSelectedTrainer(trainer)}
        className={`text-sm whitespace-nowrap
          ${
            selectedTrainer?.coachid === trainer.coachid
              ? "font-bold underline text-black-800"
              : "text-gray-700"
          }
        `}
      >
        {trainer.name}
      </button>
    ))}
  </div>
</div>




    {/* Table-like Client List */}
  <div>
    {/* Header Row */}
    
<div
    className="grid grid-cols-[60px_1fr_auto] font-bold text-gray-700 p-3 mb-2"
>    <div>S.No</div>
    <div
        className="cursor-pointer select-none"
        onClick={handleSortByName}
    >
        Name
        <span className="ml-1">
            {sortNameAsc ? "⬆️" : "⬇️"}
        </span>
    </div>
    <div
        className="cursor-pointer select-none"
        onClick={handleSortByExpiry}
    >
        Expiry Date
        <span className="ml-1">
            {sortAscending ? "⬆️" : "⬇️"}
        </span>
    </div>
</div>

    {/* Client Rows */}
  <ul>
     {loading ? (
    // Show shimmer placeholders when loading
    Array.from({ length: 25 }).map((_, idx) => <ClientRowShimmer key={idx} />)
  ) : (filteredClients.map((client, index) => {
        const isExpanded = expandedClientId === client.userid;

        return (
    <div key={client.userid}>
                {/* Client Row */}
                <li
                    onClick={() => toggleExpand(client.userid)} // Toggle expand on click
                  className={`grid grid-cols-[60px_1fr_auto] p-3 mb-2 rounded-lg shadow-sm cursor-pointer text-white`}
  style={{
    backgroundColor:
      client.due_amount > 0
        ? "#6b7280" // gray-500 hex
        : new Date(client.renewal_date) < new Date()
        ? "#FF0000" // red-500 hex
        : (new Date(client.renewal_date) - new Date()) / (1000 * 60 * 60 * 24) <= 5
        ? "#facc15" // yellow-500 hex
        : "#73da8c" // ✅ your custom green
  }}
                >
                    <div>{index + 1}</div>
                    <div className="font-semibold">{client.name}</div>
                    <div className="text-sm text-right">{client.renewal_date}</div>
                </li>

                {/* Full-Width Expanded Section */}
  {isExpanded && (
    <div className="relative w-full bg-gray-100 text-gray-800 p-4 rounded mb-2 space-y-2">
        {/* Left content (details) */}
        <div className="space-y-2">
            {/* User ID */}
           <div className="flex items-center justify-between">
  <div className="flex items-center space-x-2">
    {/* User Icon */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-gray-600"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M10 2a5 5 0 100 10 5 5 0 000-10zM2 18a8 8 0 0116 0H2z" />
    </svg>
    <span>{client.userid}</span>

    {/* Copy Icon */}
    <button
      onClick={() => handleCopy(client.userid)}
      className="ml-1 text-gray-500 hover:text-gray-800"
      title="Copy User ID"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5} // ✅ CamelCase
        stroke="currentColor"
        className="w-4 h-4"
      >
        <path
          strokeLinecap="round" // ✅ CamelCase
          strokeLinejoin="round" // ✅ CamelCase
          d="M8 6h10M8 12h6m-6 6h10M6 4h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z"
        />
      </svg>
    </button>
  </div>
</div>

            {/* Mobile */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    {/* Phone Icon */}
                      <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={"1.5"}
    stroke="currentColor"
    className="w-6 h-6 text-gray-600"
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
  />
</svg>

                    <span>{client.mobile}</span>

                    {/* Copy Icon */}
                    <button
                        onClick={() => handleCopy(client.mobile)}
                        className="ml-1 text-gray-500 hover:text-gray-800"
                        title="Copy Mobile"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={"1.5"}
                            stroke="currentColor"
                            className="w-4 h-4"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 6h10M8 12h6m-6 6h10M6 4h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z"
                            />
                        </svg>
                    </button>
                </div>
            </div>
  <div className="flex items-center space-x-2">
                <span className="font-semibold">Join Date:</span>
                <span>{client.joiningdate}</span>
            </div>
            {/* Attendance Count */}
            <div className="flex items-center space-x-2">
                <span className="font-semibold">Attendance Count:</span>
                <span>{client.attendance_count}</span>
            </div>

            {/* Last Attend */}
            <div className="flex items-center space-x-2">
                <span className="font-semibold">Last Attend:</span>
                <span>{client.last_attend}</span>
            </div>
        </div>

        {/* Right side call & WhatsApp buttons */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
            {/* Call Button */}
            <a
    href={`tel:${client.mobile}`}
    className="hover:opacity-80"
    title="Call"
>
    <img src={CallIcon} alt="Call" className="w-10 h-10" />
</a>

            {/* WhatsApp Button */}
    <WhatsAppReminderDropdown
  name={client.name}
  mobile={client.mobile}
  expiryDate={client.renewal_date}
  dueAmount={client.due_amount}
  statusColor={getStatusColor(client)} // ✅ pass derived color
/>

        </div>
<div
  className="mt-4 overflow-x-auto"
  style={{
    scrollbarWidth: "none", // Firefox
    msOverflowStyle: "none", // IE 10+
  }}
>       <div
    style={{
      display: "flex",
      gap: "0.5rem",
    }}
    className="scrollbar-hide"
  >
  {/* Edit */}
  <button
    style={{
      backgroundColor: "#c5cac5",
      color: "#FFFFFF",
      fontSize: "0.875rem",
      padding: "0.5rem 1rem",
      borderRadius: "0.5rem",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
      flexShrink: 0,
      border: "none",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
    }}
    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#9aa09a")}
    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#c5cac5")}
 onClick={() => handleEditClick(client)}
  >
    ✏️ Edit
  </button>

  {/* Renew */}
{( new Date(client.renewal_date) > new Date() ) && (
  <button
    style={{
      backgroundColor: "#8ee9f3ff",
      color: "#FFFFFF",
      fontSize: "0.875rem",
      padding: "0.5rem 1rem",
      borderRadius: "0.5rem",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
      flexShrink: 0,
      border: "none",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
    }}
    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#03637eff")}
    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#8ee9f3ff")}
     onClick={() => handleFreezeClick(client)}

  >
    💤 Freeze
  </button>
)}
{(client.due_amount > 0 || new Date(client.renewal_date) < new Date() || 
  ((new Date(client.renewal_date) - new Date()) / (1000 * 60 * 60 * 24) <= 5)) && (
  <button
    style={{
      backgroundColor: "#a7afa7",
      color: "#FFFFFF",
      fontSize: "0.875rem",
      padding: "0.5rem 1rem",
      borderRadius: "0.5rem",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
      flexShrink: 0,
      border: "none",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
    }}
    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#888f88")}
    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#a7afa7")}
     onClick={() => handleRenewClick(client)}

  >
    🔄 Renew
  </button>
)}

  {/* Due Pay */}
        {client.due_amount > 0 && (

  <button
    style={{
      backgroundColor: "#FF0000",
      color: "#FFFFFF",
      fontSize: "0.875rem",
      padding: "0.5rem 1rem",
      borderRadius: "0.5rem",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
      flexShrink: 0,
      border: "none",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
    }}
    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#cc0000")}
    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#FF0000")}
         onClick={() => handleDueClick(client)}

  >
    💰 Due Pay
  </button>
        )}
  {/* Mark Attendance */}
  <button
    style={{
      backgroundColor: "#BAAECE",
      color: "#FFFFFF",
      fontSize: "0.875rem",
      padding: "0.5rem 1rem",
      borderRadius: "0.5rem",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
      flexShrink: 0,
      border: "none",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
    }}
    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#9d91b3")}
    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#BAAECE")}
     onClick={() => handleMarkAttendance(client)}
  >
    ✅ Mark Attendance
  </button>
</div>

               
               
        </div>
    </div>
)}


            </div>
        );
    }))}

    {!firstLoad && filteredClients.length === 0 && (
<div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-gray-50 text-gray-500 space-y-2">
  {/* Icon */}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-12 w-12 text-gray-300"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 7v4a2 2 0 002 2h3m4 0h3a2 2 0 002-2V7m-8 10h.01M12 17h.01"
    />
  </svg>

  {/* Heading */}
  <p className="text-lg font-semibold">No clients found</p>

  {/* Optional helper text */}
  <p className="text-sm text-gray-400">Try adjusting your search or filters to see results.</p>
</div>
)}
</ul>


</div>

</div>

    );
}

export default ActiveClients;
