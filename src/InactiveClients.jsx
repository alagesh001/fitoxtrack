import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import CallIcon from "./assets/icn_call.png";
import WhatsappIcon from "./assets/wapp_icn.png";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline"; // download icon
import { exportAllInactiveClientsByGymToExcel,exportAllDBInactiveClientsByGymToExcel } from "./helper/excelconvert";
import { getInactiveClientsForGymPage,clearInactiveClientsForGym,getInactiveTotalPages,
  saveInactiveClientsForGymPage } from './helper/indexeddbhelper2';
  import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { showUpgradePopup } from './helper/reuse.js';

function InactiveClients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedClientId, setExpandedClientId] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [refreshCache, setRefreshCache] = useState(false); // 🆕 Toggle for manual refresh
const [disabled, setDisabled] = useState(false);

    const apiBase = "https://oxadmedia.online";
    const selectedGym = JSON.parse(localStorage.getItem("selectedGym"));
    let accessToken = localStorage.getItem("accessToken");
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
        fetchInactiveClients(1, true); // Pass forceRefresh=true
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
  let retryCount = 0;
const maxRetries = 2;
const fetchInactiveClients = async (pageNumber = 1, forceRefresh = false) => {
  setLoading(true);
  setError("");

  try {
    let cachedData;
         console.log(`📦Enter load ${pageNumber}`);

    if (!forceRefresh) {
      // ✅ Try loading from IndexedDB first
      cachedData = await getInactiveClientsForGymPage(selectedGym.GymId, pageNumber);
      const cachedTotalPages = await getInactiveTotalPages(selectedGym.GymId);
       //  console.log(`📦 check cachedata length for page ${pageNumber} is ${cachedData.length} from IndexedDB`);

      if (cachedData && cachedData.length > 0) {
      //   console.log(`📦 Loaded page ${pageNumber} from IndexedDB`);
      //  console.log(`📦 Totalpage ${totalPages} from IndexedDB`);
        setClients(cachedData);
        
        setPage(pageNumber);
                setTotalPages(cachedTotalPages || 1); // fallback to 1

        setLoading(false);
        return;
      }
setLoading(false)
     
    }

    // 🛜 Fetch fresh data from API
    const response = await axios.get(
      `${apiBase}/api/fetch-inactiveclients?gymid=${selectedGym.GymId}&page=${pageNumber}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.data.success) {
toast.success("✅ Success", { toastId: "successMessage" });
         retryCount =0;
      if (forceRefresh) {
       // console.log("♻️ Clearing old cached inactive clients for Gym:", selectedGym.GymId);
        // Clear all IndexedDB pages for this gym
        await clearInactiveClientsForGym(selectedGym.GymId);
       

       
      }

      const pageData = {
        result: response.data.result,
        total_pages: response.data.total_pages,
      };

      

   //   console.log(`✅ Page ${pageNumber} cached to IndexedDB and localStorage`);
    setDisabled(true);

      setClients(response.data.result);

      setTotalPages(response.data.total_pages);
      setPage(pageNumber);
await saveInactiveClientsForGymPage(
  selectedGym.GymId,
  pageNumber,
  response.data.result, // ✅ save the fresh API result
  response.data.total_pages
);
    } else if (response.data.error === 1) {
      console.log("⚠️ Token expired, refreshing...");
         if (retryCount >= maxRetries) {
        console.log("❌ Token refresh failed repeatedly. Stopping...");
        setLoading(false);
        return;
      }
      retryCount++;
      const refreshedToken = await refreshAccessToken();
      if (refreshedToken) {
        return fetchInactiveClients(pageNumber, forceRefresh);
      } else {
        handleLogout();
      }
    } else {
       if(response.data.error == 99){
              showUpgradePopup({
                                price: "₹5000 / Year",
                                titleIs: "Renew Now"
                               });
                              }  else{

 Swal.fire({
        icon: "error",
        title: "Error",
        text: response.data.message,
        confirmButtonText: "OK",
      });
                              }
                setDisabled(false);

      setError(response.data.message || "Failed to fetch inactive clients.");
    }
  } catch (err) {
        setDisabled(false);

    console.error("🔥 API Error:", err);
     Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Check your internet",
        confirmButtonText: "OK",
      });
    setError("Something went wrong while fetching inactive clients.");
  } finally {
    setLoading(false);
  }
};
    const refreshAccessToken = async () => {
        try {
            const res = await axios.post(
                `${apiBase}/api/refresh-token`,
                { mob: selectedGym.mob },
                { withCredentials: true }
            );

            if (res.data.success && res.data.access_token) {
                localStorage.setItem("accessToken", res.data.access_token);
                accessToken = res.data.access_token;
                return res.data.access_token;
            } else {
                return null;
            }
        } catch (err) {
            console.error("Failed to refresh token:", err);
            return null;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("gyms");
        localStorage.removeItem("selectedGym");
        localStorage.setItem("isLoggedInWeb", "false");
        navigate("/login", { replace: true });
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        alert("Copied: " + text);
    };

    const toggleExpand = (userId) => {
        setExpandedClientId((prevId) => (prevId === userId ? null : userId));
    };

    const filteredClients = clients.filter((client) => {
        const search = searchTerm.toLowerCase();
        return (
            client.name.toLowerCase().includes(search) ||
            String(client.mobile).includes(searchTerm)
        );
    });

useEffect(() => {
      fetchInactiveClients(1);
}, []);
const ClientRowShimmer = () => {
  return (
    <li
      className="grid grid-cols-[60px_1fr_auto] p-3 mb-2 rounded-lg shadow-sm cursor-pointer"
      style={{ backgroundColor: "#e5e7eb" }} // light gray base
    >
      {/* Index shimmer */}
      <div className="h-4 w-6 bg-gray-300 rounded animate-pulse opacity-70"></div>

      {/* Name shimmer */}
      <div className="h-4 w-32 bg-gray-300 rounded animate-pulse opacity-70"></div>

      {/* Date shimmer */}
      <div className="h-4 w-20 bg-gray-300 rounded animate-pulse opacity-70"></div>
    </li>
  );
};
    return (
        <div className="p-4">
            {/* Header */}

         <div className="flex justify-between items-center mb-4">
  {/* Left: Title */}
  <h1 className="text-2xl font-bold">Inactive Clients</h1>

  {/* Right: Buttons */}
  <div className="flex items-center gap-2">
    <button
      onClick={() => {
        handleRefresh();
      }}
      className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-green-700 active:scale-95 transition"
    >
      <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
      <span>Refresh</span>
    </button>

    <button
      onClick={() => {
      //  exportAllInactiveClientsByGymToExcel(selectedGym.GymId,1)
            exportAllDBInactiveClientsByGymToExcel(selectedGym.GymId,1)

      }
        
      
    }
      className="flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900 transition"
    >
      <ArrowDownTrayIcon className="w-5 h-5" />
    </button>
  </div>
</div>


            {/* Search */}
            <input
                type="text"
                placeholder="Search by name/mobile"
                className="w-full p-2 mb-4 border rounded"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Table Header */}
            <div className="grid grid-cols-[60px_1fr_auto] font-bold text-gray-700 p-3 mb-2">
                <div>S.No</div>
                <div>Name</div>
                <div>Expiry Date</div>
            </div>

            {/* Client List */}
            <ul>
                {
  loading ? (
    <ul>
      {Array.from({ length: 20 }).map((_, idx) => (
        <ClientRowShimmer key={idx} />
      ))}
    </ul>
  ) : (filteredClients.map((client, index) => {
                    const isExpanded = expandedClientId === client.userid;

                    return (
                        <div key={client.userid}>
                            {/* Row */}
                            <li
                                onClick={() => toggleExpand(client.userid)}
                                className="grid grid-cols-[50px_1fr_150px] p-3 mb-2 rounded-lg shadow-sm cursor-pointer text-white"
                                style={{
                                    backgroundColor: "#313131ff", // gray
                                }}
                            >
                                <div>{index + 1}</div>
                                <div className="font-semibold">{client.name}</div>
                                <div className="text-sm text-right">
                                    {client.renewal_date}
                                </div>
                            </li>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <div className="relative w-full bg-gray-100 text-gray-800 p-4 rounded mb-2 space-y-2">
                                    <div className="space-y-2">
                                        {/* User ID */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5 text-gray-600"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M10 2a5 5 0 100 10 5 5 0 000-10zM2 18a8 8 0 0116 0H2z" />
                                                </svg>
                                                <span>{client.userid}</span>
                                                <button
                                                    onClick={() =>
                                                        handleCopy(client.userid)
                                                    }
                                                    className="ml-1 text-gray-500 hover:text-gray-800"
                                                    title="Copy User ID"
                                                >
                                                    📋
                                                </button>
                                            </div>
                                        </div>

                                        {/* Mobile */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
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
                                                <button
                                                    onClick={() =>
                                                        handleCopy(client.mobile)
                                                    }
                                                    className="ml-1 text-gray-500 hover:text-gray-800"
                                                    title="Copy Mobile"
                                                >
                                                    📋
                                                </button>
                                            </div>
                                        </div>

                                        {/* Attendance */}
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">
                                                Attendance Count:
                                            </span>
                                            <span>{client.attendance_count}</span>
                                        </div>

                                        {/* Last Attend */}
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">
                                                Last Attend:
                                            </span>
                                            <span>{client.last_attend}</span>
                                        </div>
                                    </div>

                                    {/* Call & WhatsApp Buttons */}
                                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                                        <a
                                            href={`tel:${client.mobile}`}
                                            title="Call"
                                        >
                                            <img
                                                src={CallIcon}
                                                alt="Call"
                                                className="w-10 h-10"
                                            />
                                        </a>
                                        <a
                                            href={`https://wa.me/${client.mobile}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="WhatsApp"
                                        >
                                            <img
                                                src={WhatsappIcon}
                                                alt="WhatsApp"
                                                className="w-10 h-10"
                                            />
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                }))}
            </ul>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-4">
                <button
                    onClick={() => fetchInactiveClients(page - 1)}
                    disabled={page <= 1}
                    className={`px-3 py-1 rounded ${
                        page <= 1
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-gray-600 text-white hover:bg-gray-700"
                    }`}
                >
                    Prev
                </button>
                <span className="font-semibold">
                    Page {page} of {totalPages}
                </span>
                <button
                    onClick={() => fetchInactiveClients(page + 1)}
                    disabled={page >= totalPages}
                    className={`px-3 py-1 rounded ${
                        page >= totalPages
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-gray-600 text-white hover:bg-gray-700"
                    }`}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default InactiveClients;