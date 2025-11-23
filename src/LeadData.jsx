import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CallIcon from "./assets/icn_call.png";
import WhatsappIcon from "./assets/wapp_icn.png";
import Swal from 'sweetalert2';
import { toast } from "react-toastify";

// IndexedDB helper imports (replace with your actual functions)
import {
  getLeadDataForGymPage,
  saveLeadDataForGymPage,
  clearLeadDataForGym,
  getLeadTotalPages,deleteLead
} from './helper/indexeddbhelper2'; // You must create this similar to inactive clients

function LeadData ()  {
  const navigate = useNavigate();
  const [access_Token, setAccessToken] = useState(localStorage.getItem("accessToken") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [disabled, setDisabled] = useState(false);

const [selectedGym, setSelectedGym] = useState(() => {
  return JSON.parse(localStorage.getItem("selectedGym"));
});    const apiBase = "https://oxadmedia.online";
  const [expandedIndex, setExpandedIndex] = useState(null);
  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };
  let accessToken = access_Token;
// Clear all leads on backend
const clearLeadsFromAPI = async () => {
  try {
             let token = localStorage.getItem("accessToken"); // make sure you have the token

          const gymIdIs = selectedGym?.GymId || null; // ✅ safe fallback              
      //`${apiBase}/removelead.php`,
      const leadDataIs = {
     gymid: gymIdIs,
          typeIs: "clear",

};
    const res = await axios.post(
      `${apiBase}/api/lead-manage`,
    leadDataIs,
  {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }    );

    if (res.data.error === 1) {
      const newToken = await refreshAccessToken();
      if (!newToken) {
                        console.log("❌ Unable to refresh token. Logging out...");
                        handleLogout();
                        return;
                    }else{
                       return await retryApi(newToken, leadDataIs,"api/lead-manage"); // 🔁 Retry with new token

                    }   
    }

    if (res.data.success) {
      await clearLeadDataForGym(selectedGym.GymId);
      setClients([]);
      alert("✅ All leads cleared");
    } else {
      alert(res.data.message || "Failed to clear leads");
    }
  } catch (err) {
     Swal.fire({
            icon: "error",
            title: "Network Error",
            text: "Check your internet",
            confirmButtonText: "OK",
          });
    console.error("Error clearing leads:", err);
  }
};
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
 fetchLeads(1, true)
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
   const retryApi = async (newToken, leadDataIs,apiurl) => {
    try {
        const res = await axios.post(
            `${apiBase}/${apiurl}`,
            leadDataIs,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${newToken}`,
                },
            }
        );

        if (res.data.success) {
if(leadDataIs.typeIs == "delete"){
      const updatedClients = clients.filter(c => c.id !== leadDataIs.leadId);

setClients(updatedClients);
await deleteLead(selectedGym.GymId, page, leadDataIs.leadId);
      alert("🗑️ Lead deleted");
}else if(leadDataIs.typeIs == "clear"){

    await clearLeadDataForGym(selectedGym.GymId);
      setClients([]);
      alert("✅ All leads cleared");
}
          

        } else {
            alert("❌ Failed even after retry: " + res.data.message);
        }
    } catch (err) {
        console.error("🔥 Retry API Error:", err);
        alert("Something went wrong while retrying.");
    }
};
// Delete a single lead
const deleteClient = async (id) => {
  try {
      const gymIdIs = selectedGym?.GymId || null; // ✅ safe fallback              
     const leadDataIs = {
       leadId: id,
          gymid: gymIdIs,
          typeIs: "delete",

};
    const res = await axios.post(
`${apiBase}/api/lead-manage`,
leadDataIs,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (res.data.error === 1) {
      const newToken = await refreshAccessToken();
 if (!newToken) {
                        console.log("❌ Unable to refresh token. Logging out...");
                        handleLogout();
                        return;
                    }else{
                       return await retryApi(newToken, leadDataIs,"api/lead-manage"); // 🔁 Retry with new token

                    }     
    }

    if (res.data.success) {
      // Remove from IndexedDB and state
      const updatedClients = clients.filter(c => c.id !== id);
setClients(updatedClients);
await deleteLead(selectedGym.GymId, page, id);
      alert("🗑️ Lead deleted");
    } else {
      alert(res.data.message || "Failed to delete lead");
    }
  } catch (err) {
     Swal.fire({
            icon: "error",
            title: "Network Error",
            text: "Check your internet",
            confirmButtonText: "OK",
          });
    console.error("Error deleting lead:", err);
  }
};
  let retryCount = 0;
const maxRetries = 2;
  // Fetch Leads
  const fetchLeads = async (pageNumber = 1, forceRefresh = false) => {
    setLoading(true);
    setError("");

    try {
      let cachedData;
     // console.log(`📦 Enter load page ${pageNumber}`);
  const gymIdIs = selectedGym?.GymId || null; // ✅ safe fallback              

      if (!forceRefresh ) {
        cachedData = await getLeadDataForGymPage(gymIdIs, pageNumber);
        const cachedTotalPages = await getLeadTotalPages(gymIdIs);

      //  console.log(`📦 Cache length page ${pageNumber}: ${cachedData?.length || 0}`);
      //  console.log(`📦 cachedTotalPages ${cachedTotalPages}}`);

        if (cachedData && cachedData.length > 0) {
       //   console.log(`📦 Loaded page ${pageNumber} from IndexedDB`);
          setClients(cachedData);
          setPage(pageNumber);
          setTotalPages(cachedTotalPages || 1);
          setLoading(false);
          return;
        }
      }

      // Fetch from API
      const response = await axios.get(
        `${apiBase}/api/fetch-leads?gymid=${gymIdIs}&page=${pageNumber}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.data.success) {
                 retryCount =0;

toast.success("✅ Success", { toastId: "successMessage" });
        setDisabled(true);
        if (forceRefresh) {
         // console.log("♻️ Clearing old cached leads for Gym:", selectedGym.GymId);
          await clearLeadDataForGym(selectedGym.GymId);
        }

        setClients(response.data.result);
        setTotalPages(response.data.total_pages);
        setPage(pageNumber);

        await saveLeadDataForGymPage(
          selectedGym.GymId,
          pageNumber,
          response.data.result,
          response.data.total_pages
        );
      } else if (response.data.error === 1) {
        console.log("⚠️ Token expired, refreshing...");
           if (retryCount >= maxRetries) {
        console.log("❌ Token refresh failed repeatedly. Stopping...");
        return;
      }
      retryCount++;
        const refreshedToken = await refreshAccessToken();
        if (refreshedToken) {
          return fetchLeads(pageNumber, forceRefresh);
        } else {
          handleLogout();
        }
      }else if(response.data.error === 11){
          await clearLeadDataForGym(selectedGym.GymId);
           setClients([]);
        setError(response.data.message || "Failed to fetch leads.");

      } else {
                setDisabled(false);

        setError(response.data.message || "Failed to fetch leads.");
      }
    } catch (err) {
              setDisabled(false);
 Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Check your internet",
        confirmButtonText: "OK",
      });
      console.error("🔥 API Error:", err);
      setError("Something went wrong while fetching leads.");
    } finally {
      setLoading(false);
    }
  };

  // Refresh Token
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
        setAccessToken(res.data.access_token);

            return res.data.access_token;
      } else {
        return null;
      }
    } catch (err) {
      console.error("Failed to refresh token:", err);
      return null;
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("gyms");
    localStorage.removeItem("selectedGym");
    localStorage.setItem("isLoggedInWeb", "false");
    navigate("/login", { replace: true });
  };

  // Load on mount
  useEffect(() => {
    if (selectedGym?.GymId) {
      fetchLeads(1);
    }
  }, [selectedGym]);

  return (
   <div className="p-4">
  <h2 className="text-xl font-bold mb-4">📋 Lead Enquiries</h2>

  {/* Action Buttons */}
  <div className="flex justify-end gap-2 mt-4 mb-4">
    <button
      onClick={() => {
    if (!clients || clients.length === 0) {
      // No leads found
      Swal.fire({
        title: "No Leads Found",
        text: "There are no leads to clear.",
        icon: "info",
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6"
      });
      return;
    }

    // Leads exist → show confirmation
    Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete all leads.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        clearLeadsFromAPI(); // ✅ Only runs if confirmed
        // Swal.fire({
        //   title: "Deleted!",
        //   text: "Leads have been cleared successfully.",
        //   icon: "success",
        //   confirmButtonColor: "#3085d6"
        // });
      }
    });
  }}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
      🗑️ Clear All
    </button>

    <button
      onClick={() =>{ handleRefresh();}}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      🔄 Refresh Data
    </button>
  </div>
      {loading && <p className="text-blue-500">Loading leads...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Table */}

  {!loading && clients.length > 0 && (
  <table className="w-full border border-gray-300 rounded-lg overflow-hidden shadow-lg">
    <thead className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
      <tr>
        <th className="px-4 py-2 border">#</th>
        <th className="px-4 py-2 border">Name</th>
        <th className="px-4 py-2 border">Mobile</th>
      </tr>
    </thead>
    <tbody>
      {clients.map((client, index) => (
        <React.Fragment key={client.id}>
          {/* First row: Number, Name, Mobile */}
         <tr
  onClick={() => toggleExpand(index)}
  className={`transition cursor-pointer hover:bg-blue-50 ${
    client.book_date !== null ? "bg-red-300" : ""
  }`}
>
  <td className="px-4 py-2 border text-center">{index + 1}</td>
  <td className="px-4 py-2 border">{client.name}</td>
  <td className="px-4 py-2 border">{client.mob}</td>
</tr>

          {/* Expanded row: Date + Actions */}
         {expandedIndex === index && (
  <tr>
    <td colSpan={3} className="px-4 py-3 border bg-gray-50">
      <div className="flex flex-col gap-2">
        
        {/* Normal Date */}
        <div className="font-semibold">
          Date: <span className="font-normal">{client.date}</span>
        </div>

        {/* Book Date if present */}
        {client.book_date && (
  <div className="font-semibold text-red-600">
    Trial Date:{" "}
    <span className="font-normal">
      {client.book_date.split("T")[0]}
    </span>
  </div>
)}

        <div className="flex gap-2">
          {/* Call Button */}
          <a
            href={`tel:${client.mob}`}
            className="hover:opacity-80"
          >
            <img src={CallIcon} alt="Call" className="w-10 h-10" />
          </a>

          {/* WhatsApp Button */}
          <a
            href={`https://wa.me/${client.mob}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80"
          >
            <img src={WhatsappIcon} alt="WhatsApp" className="w-10 h-10" />
          </a>

          {/* Delete Button */}
          <button
            onClick={() => {
              Swal.fire({
                title: "Are you sure?",
                text: "This will permanently delete the lead.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete",
                cancelButtonText: "Cancel",
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                reverseButtons: true
              }).then((result) => {
                if (result.isConfirmed) {
                  deleteClient(client.id);
                }
              });
            }}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </td>
  </tr>
)}

        </React.Fragment>
      ))}
    </tbody>
  </table>
)}

  


      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page <= 1}
          onClick={() => fetchLeads(page - 1)}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          ⬅ Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => fetchLeads(page + 1)}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Next ➡
        </button>
      </div>

     
    </div>
  );
};

export default LeadData;
