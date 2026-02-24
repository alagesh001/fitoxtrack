import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from 'sweetalert2';
import { toast } from "react-toastify";

import { clearAllIndexedDB } from './helper/indexeddbhelper2';
function SettingsScreen() {
    const navigate = useNavigate();
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState(""); // ✅ For confirm field
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const apiBase = "https://oxadmedia.online";
  const [showAuthBlock, setShowAuthBlock] = useState(false);
const [authErrorMsg, setAuthErrorMsg] = useState("");

    // 🏋️ Fetch selected gym details from localStorage
    const selectedGym = JSON.parse(localStorage.getItem("selectedGym") || "{}");

const handleLogout = async () => {
  try {
      localStorage.clear();

    // 🧹 Clear all IndexedDB databases
    await clearAllIndexedDB();
localStorage.setItem("isLoggedInWeb", "false"); // optional flag
    // 🧹 Clear all localStorage data
     const deviceId = localStorage.getItem("device_idfitox"); // ✅ get from storage

    const response = await fetch(`${apiBase}/api/logout-ai`, {
      method: "POST",
      credentials: "include", // ✅ sends refresh_token cookie
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        device_id: deviceId, // ✅ send to backend
      }),
    });

    const data = await response.json();

    if (!data.success) {
       setAuthErrorMsg(data.message || "You are not authorized to continue.");

      setShowAuthBlock(true);
    
      console.warn("⚠️ Logout failed:", data.message);
      // Optionally still clear localStorage and redirect
    } else {
         localStorage.clear();

    // 🧹 Clear all IndexedDB databases
    await clearAllIndexedDB();
localStorage.setItem("isLoggedInWeb", "false"); // optional flag
  navigate("/login", { replace: true });
    console.log("✅ Cleared localStorage and IndexedDB");
      console.log("✅ Logout success:", data.message);
    }

   
  } catch (err) {
     setAuthErrorMsg("Check your internet.");

      setShowAuthBlock(true);
    
  }

  
};

const refreshAccessToken = async () => {
    try {
        const res = await axios.post(
            `${apiBase}/api/refresh-token-ai`,
            { mob: selectedGym.mob },
            { withCredentials: true }
        );

        if (res.data.success && res.data.access_token) {
            // ✅ Save and return new token
            localStorage.setItem("accessToken", res.data.access_token);
            console.log("✅ Access token refreshed");
            return res.data.access_token;
        } else {
            // ❌ Only handle logout if error is NOT 111
      if (data.error !== 111) {
        console.log("❌ Refresh token invalid or expired. Logging out...");
        handleLogout();
      } else {
        console.log("⚠️ Server returned error 111. Not logging out.");
      }
      return null;
        }
    } catch (err) {
        console.error("🔥 Failed to refresh token:", err);
       // handleLogout();
        return null;
    }
};
  

    const handlePasswordChange = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            setMessage("⚠️ Please fill all fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage("❌ New passwords do not match.");
            return;
        }

        setLoading(true);
        setMessage("");

        const changePasswordApi = async (token) => {
            try {
                const memberData = {
                    gymid: selectedGym?.GymId,
                    oldpass: oldPassword,
                    newpass: newPassword,
                };

                const res = await axios.post(
                    `${apiBase}/api/update-gympass`,
                    memberData,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                        },
                    }
                );

                const data = res.data;
            //    console.log(data);

                if (data.success) {
                toast.success("✅ Password updated successfully!");
                    
                    setMessage("✅ Password updated successfully!");
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setShowChangePassword(false);
                } else if (data.error === 1) {
                    // Access token expired
                    console.log("Access token expired, refreshing...");
                            const newToken = await refreshAccessToken();
                              if (!newToken) {
                        console.log("❌ Unable to refresh token. Logging out...");
                        handleLogout();
                        return;
                    }else{
                       return await retryApi(newToken, memberData,"api/update-gympass"); // 🔁 Retry with new token

                    }

                } else {
                    setMessage("❌ " + (data.message || "Failed to update password."));
                }
            } catch (error) {
                console.error("❌ Error connecting to server:", error);
                setMessage("❌ Error connecting to server.");
            } finally {
                setLoading(false);
            }
        };
  const currentToken = localStorage.getItem("accessToken");
        await changePasswordApi(currentToken);

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
          //   goBack();
    setMessage("✅ Password updated successfully!");
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setShowChangePassword(false);
//alert(`✅ ${res.data.message}`);
        } else {
            alert("❌ Failed even after retry: " + res.data.message);
        }
    } catch (err) {
        console.error("🔥 Retry API Error:", err);
        alert("Something went wrong while retrying.");
    }
};
    const handleContactSupport = () => {
        const phoneNumber = "918595509389"; // Support number
        const gymName = selectedGym?.GymName || "Unknown Gym";
        const gymId = selectedGym?.GymId || "N/A";

        const prefilledMessage = `Hi, I need help with my account.\n\n🏋️ Gym Name: ${gymName}\n🆔 Gym ID: ${gymId}`;
        const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(prefilledMessage)}`;
        window.open(whatsappURL, "_blank"); // Open WhatsApp in new tab
    };

    return (
        <div className="p-10">
            <button
     onClick={() => {
    if (window.history.length > 1) {
      navigate(-1);   // Go back
    } else {
      navigate("/ai-hub");  // Fallback
    }
  }}
    className="p-3 rounded-full 
               bg-gray-800 hover:bg-gray-700
               text-white shadow-md hover:shadow-lg
               transition duration-300 hover:scale-105"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  </button>
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
            <h1 className="text-2xl font-bold mb-6 mt-3">⚙️ Settings</h1>

            {/* 📝 Gym Info */}
            <div className="p-4 rounded-lg shadow bg-gradient-to-r from-blue-50 to-green-50 mb-6">
                <p className="font-semibold text-lg text-gray-800">
                    🎾 Academy: <span className="text-blue-700">{selectedGym?.GymName || "N/A"}</span>
                </p>
                <p className="text-gray-700">
                    📍 Location: <span className="font-medium">{selectedGym?.Location || "N/A"}</span>
                </p>
                <p className="text-gray-700">
                    📞 Mobile: <span className="font-medium">{selectedGym?.mob || "N/A"}</span>
                </p>
                <p className="text-gray-700">
                    👨‍💼 Admin Contact: <span className="font-medium">{selectedGym?.admin_cont || "N/A"}</span>
                </p>
<p className="text-gray-700">
  📅 Active Plan:{" "}
  {selectedGym?.is_active === "1" ? (
    <span className="font-medium text-green-500">Pro</span>
  ) : parseInt(selectedGym?.is_active || "0", 10) > 1 ? (
    <span className="font-medium text-yellow-600">Pro</span>
  ) : (
    <span className="font-medium">N/A</span>
  )}
</p>

{/* Show expiry only if Premium */}
{parseInt(selectedGym?.is_active || "0", 10) > 0 && (
  <p className="text-gray-700">
    📅 Expiry:{" "}
    <span className="font-medium">
{selectedGym?.renewaldate
  ? new Date(selectedGym.renewaldate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  : "N/A"}    </span>
  </p>
)}
            </div>

            {/* 🔧 Settings Options */}
            <div className="space-y-4">
                {/* Toggle Change Password */}
                <button
                    onClick={() => setShowChangePassword(!showChangePassword)}
                    className="w-full p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-700 text-white font-semibold shadow hover:scale-101 transform transition"
                >
                    🔑 {showChangePassword ? "Cancel Password Change" : "Change Password"}
                </button>

                {/* Change Password Form */}
                {showChangePassword && (
                    <div className="p-4 border rounded-lg bg-gray-50 shadow space-y-3">
                        <div>
                            <label className="block mb-1 font-medium">Old Password</label>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full border rounded p-2"
                                placeholder="Enter old password"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full border rounded p-2"
                                placeholder="Enter new password"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full border rounded p-2"
                                placeholder="Re-enter new password"
                            />
                        </div>
                        {message && <p className="text-sm mt-2">{message}</p>}
                        <button
                            onClick={handlePasswordChange}
                            disabled={loading}
                            className={`w-full p-2 rounded-lg text-white font-semibold shadow ${
                                loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-purple-600 hover:bg-purple-700"
                            }`}
                        >
                            {loading ? "Updating..." : "Update Password"}
                        </button>
                    </div>
                )}

                {/* Contact Support */}
                <button
                    onClick={handleContactSupport}
                    className="w-full p-3 rounded-lg bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold shadow hover:scale-101 transform transition"
                >
                    💬 Contact Support
                </button>

                {/* Logout */}
                <button
                    onClick={() => {  Swal.fire({
                          title: "Logout",
                          text: "Are you sure to logout?",
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonText: "Yes, Logout",
                          cancelButtonText: "Cancel",
                          confirmButtonColor: "#d33",
                          cancelButtonColor: "#3085d6",
                          reverseButtons: true
                        }).then((result) => {
                          if (result.isConfirmed) {
                            handleLogout(); // ✅ Only runs if confirmed
                            // Swal.fire({
                            //   title: "Deleted!",
                            //   text: "Leads have been cleared successfully.",
                            //   icon: "success",
                            //   confirmButtonColor: "#3085d6"
                            // });
                          }
                        });}}
                    className="w-full p-3 rounded-lg bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold shadow hover:scale-101 transform transition"
                >
                    🚪 Logout
                </button>
            </div>
        </div>
    );
}

export default SettingsScreen;
