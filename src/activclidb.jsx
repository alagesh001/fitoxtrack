// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { ArrowPathIcon } from '@heroicons/react/24/outline';
// import CallIcon from "./assets/icn_call.png";
// import WhatsappIcon from "./assets/wapp_icn.png";
// import { toast } from "react-toastify";
// import WhatsAppReminderDropdown from './WhatsAppReminderDropdown'; // path as per your project
// import { exportClientsToExcel } from "./helper/excelconvert";
// import { ArrowDownTrayIcon } from "@heroicons/react/24/outline"; // download icon
// // import { getAllClientsForGym,
// //   saveClientsForGymPage,
// //   clearClientsForGym } from './helper/indexedDBHelper';
// import { getActiveClientsForGym,
//   saveActiveClientsForGymPage } from './helper/indexeddbhelper2';

// function ActiveClients() {
//     const [clients, setClients] = useState([]);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");
// const [selectedTrainer, setSelectedTrainer] = useState(null); // null means "All"
// const [trainers, setTrainers] = useState([]); // empty array initially

//     const navigate = useNavigate();
//     const selectedGym = JSON.parse(localStorage.getItem("selectedGym"));
//     const accessToken = localStorage.getItem("accessToken");
// const [sortAscending, setSortAscending] = useState(true);
// //const location = useLocation();
// //const success = location.state?.success;
// //const message = location.state?.message;
//     const apiBase = "https://oxadmedia.online";
//      const [showToast, setShowToast] = useState(false);
// const handleMarkAttendance = async (client) => {
//   const gymIdIs = selectedGym?.GymId || null; // ✅ safe fallback              

//                const memberData = {
//     gymid: gymIdIs , // 🔥 fallback to null
//         userid: client.userid ,



// };
//          try {
//             const res = await axios.post(
//                 `${apiBase}/markAttendAdminSide.php`,
//                 memberData,
//                 {
//                     headers: {
//                         "Content-Type": "application/json",

//                     },
//                 }
//             );

//             if (res.data.success) {
// if (res.data.message.toLowerCase().includes("expired")) {
//   // 🚨 Custom alert for expired
//   alert(`❌ Attendance failed: Member ${client.name} is expired`);
// } else {
//   // ✅ Normal success alert
//   alert(`✅ ${res.data.message} Member: ${client.name}`);
// }

// //alert(`✅ ${res.data.message}`);
//                 // Optionally reset form
//             } else {
//                 alert("❌ Failed: " + res.data.message);
//             }
//         } catch (err) {
//             console.error("🔥 API Error:", err);
//             alert("Something went wrong while adding member.");
//         }
// };

// useEffect(() => {
//   const msg = localStorage.getItem("activeclients-toast");

//   if (msg) {
//     const runAsync = async () => {
//       setLoading(true); // Show loader
//      // await clearClientsForGym(selectedGym.GymId); // ✅ Clear IndexedDB for this Gym
//       let token = localStorage.getItem("accessToken");
//       fetchAllClients(token); // Fetch fresh clients
//       toast.success(msg);
//       localStorage.removeItem("activeclients-toast");
//     };

//     runAsync(); // Call the async inner function
//   }
// }, []);
// // useEffect(() => {
// //   if (success) {
// // toast.success(`🎉 ${message}`, { toastId: "unique-success" });
// //     navigate(location.pathname, { replace: true });
// //         setLoading(true); // Show loader
// //             localStorage.removeItem("clients");
// //             let token = localStorage.getItem("accessToken")
// //             fetchAllClients(token);
// //   }
// // }, [success, message, navigate, location.pathname]);
//      const handleDueClick = (client) => {
//   navigate("/add-member", {
//     state: {
//       type: "due", // 👈 type is "edit"
//       client,       // 👈 pass the client data too
//     },
//   });
// };
// const handleRenewClick = (client) => {
//   navigate("/add-member", {
//     state: {
//       type: "renew", // 👈 type is "edit"
//       client,       // 👈 pass the client data too
//     },
//   });
// };
// const handleEditClick = (client) => {
//   navigate("/add-member", {
//     state: {
//       type: "edit", // 👈 type is "edit"
//       client,       // 👈 pass the client data too
//     },
//   });
// };
//     const handleCopy = (text) => {
//         navigator.clipboard.writeText(text).then(() => {
//             setShowToast(true);
//             setTimeout(() => setShowToast(false), 2000); // Toast visible for 2s
//         });
//     };
//     const [sortNameAsc, setSortNameAsc] = useState(true);
// const handleSortByName = () => {
//     const sortedClients = [...clients].sort((a, b) => {
//         const nameA = a.name.toLowerCase();
//         const nameB = b.name.toLowerCase();

//         if (nameA < nameB) return sortNameAsc ? -1 : 1;
//         if (nameA > nameB) return sortNameAsc ? 1 : -1;
//         return 0;
//     });

//     setClients(sortedClients);
//     setSortNameAsc(!sortNameAsc); // Toggle ascending/descending
// };
// const handleSortByExpiry = () => {
//     const sortedClients = [...clients].sort((a, b) => {
//         const dateA = new Date(a.renewal_date);
//         const dateB = new Date(b.renewal_date);
//         return sortAscending ? dateA - dateB : dateB - dateA;
//     });
//     setClients(sortedClients);
//     setSortAscending(!sortAscending); // Toggle sort direction
// };
// const fetchTrainers = async (gymId) => {
//     try {
//         const response = await axios.get(
//             `${apiBase}/gettrainerdata.php?gymid=${gymId}`,
            
//         );

//         if (response.data.success) {
//             console.log("✅ Trainer data fetched:", response.data.result);
//             setTrainers(response.data.result); // Save to state
//               localStorage.setItem(
//     `trainersdata_${gymId}`, // ✅ use the function parameter
//     JSON.stringify(response.data.result)

                

// );
//         } else {
//             console.error("❌ API error:", response.data.message);
//            // setError(response.data.message);
//         }
//     } catch (err) {
//         console.error("🔥 Error fetching trainers:", err);
//        // setError("Failed to fetch trainers.");
//     }
// };
// const fetchAllClients = async (token) => {
//     let currentPage = 1;
//     let totalPages = 1; // to enter the loop

//     setClients([]); // Clear previous clients
//     setLoading(true);
//     setError("");

//     const allClients = []; // 🔥 Temporary array

//     try {
//         while (currentPage <= totalPages) {
//             try {
//                 // Fetch current page
//                 const response = await axios.get(
//                     `${apiBase}/getmemberwdata.php?gymid=${selectedGym.GymId}&page=${currentPage}`,
//                     {
//                         headers: {
//                             Authorization: `Bearer ${token}`,
//                         },
//                     }
//                 );

//                 if (response.data.success) {
//                     const pageClients = response.data.result;
//   allClients.push(...pageClients);
//                     // Append to temporary array
//         await saveActiveClientsForGymPage(selectedGym.GymId, currentPage, pageClients);

// //                    localStorage.setItem(
// //     `clientsdata_${selectedGym.GymId}`, // key based on gymId
// //     JSON.stringify(allClients)
                

// // );


//                     totalPages = response.data.total_pages; // update total pages
//                     console.log(`✅ Fetched page ${currentPage}/${totalPages} (${pageClients.length} members)`);

//                     currentPage += 1; // move to next page
//                 } else if (response.data.error === 1) {
//                     // Token expired (API error = 1)
//                     console.log("Access token expired while fetching page " + currentPage);
//                     token = await refreshAccessToken(); // Refresh token
//                     if (!token) {
//                         console.log("❌ Unable to refresh token. Logging out...");
//                         handleLogout();
//                         return;
//                     }
//                     console.log("✅ Token refreshed. Retrying page " + currentPage);
//                 } else {
//                     setError(response.data.message);
//                     break;
//                 }
//             } catch (err) {
//                 // if (err.response && err.response.data.message === "Invalid or expired token") {
//                 //     console.log("Access token expired while fetching page " + currentPage);
//                 //     token = await refreshAccessToken(); // Refresh token
//                 //     if (!token) {
//                 //         console.log("❌ Unable to refresh token. Logging out...");
//                 //         handleLogout();
//                 //         return;
//                 //     }
//                 //     console.log("✅ Token refreshed. Retrying page " + currentPage);
//                 // } else {
//                 //     console.error(err);
//                 //     setError("Failed to fetch clients on page " + currentPage);
//                 //     break;
//                 // }
//                    console.error(err);
//                     setError("Failed to fetch clients on page " + currentPage);
//                     break;
//             }
//         }

//         // ✅ Set all clients at once to avoid duplicates
//         setClients(allClients);
// //setTimeout(() => saveClientsForGym(selectedGym.GymId, clients), 0);

//         console.log("🎉 All pages fetched and displayed.");
//     } catch (err) {
//         console.error("🔥 Unexpected error:", err);
//         setError("Something went wrong while fetching clients.");
//     } finally {
//         setLoading(false);
//     }
// };
// const getStatusColor = (client) => {
//   if (client.due_amount > 0) return "gray";
//   const renewalDate = new Date(client.renewal_date);
//   const today = new Date();

//   if (renewalDate < today) return "red";

//   const daysLeft = (renewalDate - today) / (1000 * 60 * 60 * 24);
//   if (daysLeft <= 5) return "yellow";

//   return "green";
// };


// const refreshAccessToken = async () => {
//     try {
//         const res = await axios.post(
//             `${apiBase}/refresh_token.php`,
//             { mob: selectedGym.mob },
//             { withCredentials: true }
//         );

//         if (res.data.success && res.data.access_token) {
//             // ✅ Save and return new token
//             localStorage.setItem("accessToken", res.data.access_token);
//             console.log("✅ Access token refreshed");
//             return res.data.access_token;
//         } else {
//             console.log("❌ Refresh token invalid or expired. Logging out...");
//             handleLogout();
//             return null;
//         }
//     } catch (err) {
//         console.error("🔥 Failed to refresh token:", err);
//        // handleLogout();
//         return null;
//     }
// };

// const [expandedClientId, setExpandedClientId] = useState(null); // Track expanded client

// const toggleExpand = (clientId) => {
//     setExpandedClientId((prev) => (prev === clientId ? null : clientId));
// };


//     const handleLogout = () => {
//         localStorage.removeItem("gyms");
//         localStorage.removeItem("selectedGym");
//     localStorage.setItem("isLoggedInWeb", "false");

//         // ✅ Navigate back to login screen
//         navigate("/login", { replace: true });
//     };
// useEffect(() => {
//             const selectedGym = JSON.parse(localStorage.getItem("selectedGym"));

//         const cachedTrainers = localStorage.getItem(`trainersdata_${selectedGym.GymId}`);

//         if (cachedTrainers) {
//             console.log(`📦 Loaded trainers from localStorage for GymId: ${selectedGym.GymId}`);
//             setTrainers(JSON.parse(cachedTrainers)); // ✅ Set trainers state
//         } else {
//             console.log(`🌐 No cached trainers found. Fetching for GymId: ${selectedGym.GymId}`);
//          //   fetchTrainers(selectedGym.GymId, token); // Fetch from API if not cached
//         }
    
// }, []);
// useEffect(() => {
//   (async () => {
//                 const selectedGym = JSON.parse(localStorage.getItem("selectedGym"));

//     const cachedClients = await getActiveClientsForGym(selectedGym.GymId);

//     if (cachedClients.length > 0) {
//       console.log("📦 Loaded clients from IndexedDB");
//       setClients(cachedClients);
//       setLoading(false);
//     } else {
//       console.log("🌐 No cached data. Fetching from API...");
//       const token = localStorage.getItem("accessToken");
//       fetchAllClients(token);
//     }
//   })();
// }, []);
// //     useEffect(() => {
// //             const selectedGym = JSON.parse(localStorage.getItem("selectedGym"));

// //     const savedClients = localStorage.getItem(`clientsdata_${selectedGym.GymId}`);

// //     const token = localStorage.getItem("accessToken"); // make sure you have the token

// //     if (savedClients && JSON.parse(savedClients).length > 0) {
// //         // ✅ Load cached data if available
// //         setLoading(false);
// //         console.log("📦 Loaded clients from localStorage");
// //         setClients(JSON.parse(savedClients));
// //     } else {
// //         // 🌐 No cached data, fetch from API
// //         console.log("🌐 No clients in localStorage, fetching from API...");
// //         fetchAllClients(token);
// //     }
// // }, []);
// const filteredClients = clients
//     .filter((client) => {
//         // ✅ Filter by selected trainer
//         if (selectedTrainer) {
//             return client.coachid === selectedTrainer.coachid;
//         }
//         return true; // no trainer filter
//     })
//     .filter((client) => {
//         // ✅ Filter by search term
//         const search = searchTerm.toLowerCase();
//         return (
//             client.name.toLowerCase().includes(search) ||
//             String(client.mobile).includes(searchTerm) // convert mobile to string
//         );
//     });

//     if (loading) return <p>Loading clients...</p>;
//     if (error) return <p className="text-red-500">{error}</p>;

//     return (
// <div className="p-4">
// <div className="flex justify-between items-center mb-4">
//   {/* Title on the left */}
//   <h1 className="text-2xl font-bold">Active Clients</h1>

//   {/* Button group on the right */}
//   <div className="flex items-center gap-2">
//     {/* Refresh Button */}
//    <button
//   onClick={async () => {
//     setLoading(true);
//     //await clearClientsForGym(selectedGym.GymId); // ✅ clear IndexedDB for this gym
//     let token = localStorage.getItem("accessToken");
//     fetchAllClients(token); // 🔥 fetch fresh clients
//     fetchTrainers(selectedGym.GymId, token); // 🔥 fetch trainers (optional)
//   }}
//   className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition"
// >
//   <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
//   <span>Refresh</span>
// </button>

//     {/* Export Button */}
//     <button
//       onClick={() => exportClientsToExcel(selectedGym.GymId)}
//       className="flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900 transition"
//     >
//       <ArrowDownTrayIcon className="w-5 h-5" />
//     </button>
//   </div>
// </div>

//     {/* Search Field */}
//     <input
//         type="text"
//         placeholder="Search by name/mobile"
//         className="w-full p-2 mb-4 border rounded"
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//     />
// <div
//   className="flex overflow-x-auto space-x-7 p-2"
//   style={{
//     scrollbarWidth: "none", // Firefox
//     msOverflowStyle: "none", // IE 10+
//   }}
// >
//   {/* Container for buttons */}
//   <div
//     className="flex items-center space-x-8"
//     style={{
//       WebkitOverflowScrolling: "touch",
//     }}
//   >
//     {/* "All" Button */}
//     <button
//       onClick={() => setSelectedTrainer(null)}
//       className={`text-sm whitespace-nowrap 
//         ${selectedTrainer === null ? "font-bold underline text-black-800" : "text-gray-700"}
//       `}
//     >
//       All
//     </button>

//     {/* Trainer Names */}
//     {trainers.map((trainer) => (
//       <button
//         key={trainer.coachid}
//         onClick={() => setSelectedTrainer(trainer)}
//         className={`text-sm whitespace-nowrap
//           ${
//             selectedTrainer?.coachid === trainer.coachid
//               ? "font-bold underline text-black-800"
//               : "text-gray-700"
//           }
//         `}
//       >
//         {trainer.name}
//       </button>
//     ))}
//   </div>
// </div>




//     {/* Table-like Client List */}
//   <div>
//     {/* Header Row */}
    
// <div
//     className="grid grid-cols-[60px_1fr_auto] font-bold text-gray-700 p-3 mb-2"
// >    <div>S.No</div>
//     <div
//         className="cursor-pointer select-none"
//         onClick={handleSortByName}
//     >
//         Name
//         <span className="ml-1">
//             {sortNameAsc ? "⬆️" : "⬇️"}
//         </span>
//     </div>
//     <div
//         className="cursor-pointer select-none"
//         onClick={handleSortByExpiry}
//     >
//         Expiry Date
//         <span className="ml-1">
//             {sortAscending ? "⬆️" : "⬇️"}
//         </span>
//     </div>
// </div>

//     {/* Client Rows */}
//   <ul>
//     {filteredClients.map((client, index) => {
//         const isExpanded = expandedClientId === client.userid;

//         return (
//             <div key={client.userid}>
//                 {/* Client Row */}
//                 <li
//                     onClick={() => toggleExpand(client.userid)} // Toggle expand on click
//                   className={`grid grid-cols-[60px_1fr_auto] p-3 mb-2 rounded-lg shadow-sm cursor-pointer text-white`}
//   style={{
//     backgroundColor:
//       client.due_amount > 0
//         ? "#6b7280" // gray-500 hex
//         : new Date(client.renewal_date) < new Date()
//         ? "#FF0000" // red-500 hex
//         : (new Date(client.renewal_date) - new Date()) / (1000 * 60 * 60 * 24) <= 5
//         ? "#facc15" // yellow-500 hex
//         : "#73da8c" // ✅ your custom green
//   }}
//                 >
//                     <div>{index + 1}</div>
//                     <div className="font-semibold">{client.name}</div>
//                     <div className="text-sm text-right">{client.renewal_date}</div>
//                 </li>

//                 {/* Full-Width Expanded Section */}
//   {isExpanded && (
//     <div className="relative w-full bg-gray-100 text-gray-800 p-4 rounded mb-2 space-y-2">
//         {/* Left content (details) */}
//         <div className="space-y-2">
//             {/* User ID */}
//            <div className="flex items-center justify-between">
//   <div className="flex items-center space-x-2">
//     {/* User Icon */}
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       className="h-5 w-5 text-gray-600"
//       fill="currentColor"
//       viewBox="0 0 20 20"
//     >
//       <path d="M10 2a5 5 0 100 10 5 5 0 000-10zM2 18a8 8 0 0116 0H2z" />
//     </svg>
//     <span>{client.userid}</span>

//     {/* Copy Icon */}
//     <button
//       onClick={() => handleCopy(client.userid)}
//       className="ml-1 text-gray-500 hover:text-gray-800"
//       title="Copy User ID"
//     >
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         fill="none"
//         viewBox="0 0 24 24"
//         strokeWidth={1.5} // ✅ CamelCase
//         stroke="currentColor"
//         className="w-4 h-4"
//       >
//         <path
//           strokeLinecap="round" // ✅ CamelCase
//           strokeLinejoin="round" // ✅ CamelCase
//           d="M8 6h10M8 12h6m-6 6h10M6 4h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z"
//         />
//       </svg>
//     </button>
//   </div>
// </div>

//             {/* Mobile */}
//             <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-2">
//                     {/* Phone Icon */}
//                       <svg
//     xmlns="http://www.w3.org/2000/svg"
//     fill="none"
//     viewBox="0 0 24 24"
//     strokeWidth={"1.5"}
//     stroke="currentColor"
//     className="w-6 h-6 text-gray-600"
// >
//   <path
//     strokeLinecap="round"
//     strokeLinejoin="round"
//     d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
//   />
// </svg>

//                     <span>{client.mobile}</span>

//                     {/* Copy Icon */}
//                     <button
//                         onClick={() => handleCopy(client.mobile)}
//                         className="ml-1 text-gray-500 hover:text-gray-800"
//                         title="Copy Mobile"
//                     >
//                         <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             strokeWidth={"1.5"}
//                             stroke="currentColor"
//                             className="w-4 h-4"
//                         >
//                             <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 d="M8 6h10M8 12h6m-6 6h10M6 4h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z"
//                             />
//                         </svg>
//                     </button>
//                 </div>
//             </div>

//             {/* Attendance Count */}
//             <div className="flex items-center space-x-2">
//                 <span className="font-semibold">Attendance Count:</span>
//                 <span>{client.attendance_count}</span>
//             </div>

//             {/* Last Attend */}
//             <div className="flex items-center space-x-2">
//                 <span className="font-semibold">Last Attend:</span>
//                 <span>{client.last_attend}</span>
//             </div>
//         </div>

//         {/* Right side call & WhatsApp buttons */}
//         <div className="absolute top-4 right-4 flex flex-col space-y-2">
//             {/* Call Button */}
//             <a
//     href={`tel:${client.mobile}`}
//     className="hover:opacity-80"
//     title="Call"
// >
//     <img src={CallIcon} alt="Call" className="w-10 h-10" />
// </a>

//             {/* WhatsApp Button */}
//     <WhatsAppReminderDropdown
//   name={client.name}
//   mobile={client.mobile}
//   expiryDate={client.renewal_date}
//   dueAmount={client.due_amount}
//   statusColor={getStatusColor(client)} // ✅ pass derived color
// />

//         </div>
// <div
//   className="mt-4 overflow-x-auto"
//   style={{
//     scrollbarWidth: "none", // Firefox
//     msOverflowStyle: "none", // IE 10+
//   }}
// >       <div
//     style={{
//       display: "flex",
//       gap: "0.5rem",
//     }}
//     className="scrollbar-hide"
//   >
//   {/* Edit */}
//   <button
//     style={{
//       backgroundColor: "#c5cac5",
//       color: "#FFFFFF",
//       fontSize: "0.875rem",
//       padding: "0.5rem 1rem",
//       borderRadius: "0.5rem",
//       boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
//       flexShrink: 0,
//       border: "none",
//       cursor: "pointer",
//       transition: "background-color 0.2s ease",
//     }}
//     onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#9aa09a")}
//     onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#c5cac5")}
//  onClick={() => handleEditClick(client)}
//   >
//     ✏️ Edit
//   </button>

//   {/* Renew */}

// {(client.due_amount > 0 || new Date(client.renewal_date) < new Date() || 
//   ((new Date(client.renewal_date) - new Date()) / (1000 * 60 * 60 * 24) <= 5)) && (
//   <button
//     style={{
//       backgroundColor: "#a7afa7",
//       color: "#FFFFFF",
//       fontSize: "0.875rem",
//       padding: "0.5rem 1rem",
//       borderRadius: "0.5rem",
//       boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
//       flexShrink: 0,
//       border: "none",
//       cursor: "pointer",
//       transition: "background-color 0.2s ease",
//     }}
//     onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#888f88")}
//     onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#a7afa7")}
//      onClick={() => handleRenewClick(client)}

//   >
//     🔄 Renew
//   </button>
// )}

//   {/* Due Pay */}
//         {client.due_amount > 0 && (

//   <button
//     style={{
//       backgroundColor: "#FF0000",
//       color: "#FFFFFF",
//       fontSize: "0.875rem",
//       padding: "0.5rem 1rem",
//       borderRadius: "0.5rem",
//       boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
//       flexShrink: 0,
//       border: "none",
//       cursor: "pointer",
//       transition: "background-color 0.2s ease",
//     }}
//     onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#cc0000")}
//     onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#FF0000")}
//          onClick={() => handleDueClick(client)}

//   >
//     💰 Due Pay
//   </button>
//         )}
//   {/* Mark Attendance */}
//   <button
//     style={{
//       backgroundColor: "#BAAECE",
//       color: "#FFFFFF",
//       fontSize: "0.875rem",
//       padding: "0.5rem 1rem",
//       borderRadius: "0.5rem",
//       boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
//       flexShrink: 0,
//       border: "none",
//       cursor: "pointer",
//       transition: "background-color 0.2s ease",
//     }}
//     onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#9d91b3")}
//     onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#BAAECE")}
//      onClick={() => handleMarkAttendance(client)}
//   >
//     ✅ Mark Attendance
//   </button>
// </div>

               
               
//         </div>
//     </div>
// )}


//             </div>
//         );
//     })}

//     {filteredClients.length === 0 && (
//         <div className="p-4 text-center text-gray-500">
//             No clients found
//         </div>
//     )}
// </ul>


// </div>

// </div>

//     );
// }

// export default ActiveClients;
