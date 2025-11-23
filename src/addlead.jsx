import React, { useState,useRef } from "react";
import axios from "axios";
import appIcon from './assets/ftox_icon.png';
import { useLocation } from "react-router-dom";
import upgradeIcon from "./assets/upgrade.png"; // adjust path to match your project
import Swal from 'sweetalert2';
import { toast } from "react-toastify";
import { showUpgradePopup } from './helper/reuse.js';

function AddLeadHere() {
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const gymId = queryParams.get("gymid");
  const [source, setSource] = useState("");
      const apiBase = "https://oxadmedia.online";
  const [loading, setLoading] = useState(false);
    const lastClickTimeRef = useRef(0);

  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
 const retryApi = async (newToken, leadData,apiurl) => {
    try {
        const res = await axios.post(
            `${apiBase}/${apiurl}`,
            leadData,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${newToken}`,
                },
            }
        );

        if (res.data.success) {
            toast.success("✅ "+res.data.message);
          
          setFormData({ name: "", mobileNumber: "", message: "" });
          

//alert(`✅ ${res.data.message}`);
        } else if (res.data.error == 11){
          showUpgradePopup({
            price: "₹5000 / Year",
            titleIs: "Limit Exceeded"
           });
      }else {
Swal.fire({
  icon: "error",                 // ❌ shows error icon
  title: "Failed",
  text: res.data.message,   // your API message
  confirmButtonText: "OK",
  background: "#fff",
  iconColor: "#e74c3c",          // optional: custom icon color
});           }
    } catch (err) {
        console.error("🔥 Retry API Error:", err);
        alert("Something went wrong while retrying.");
    }
};
  const handleSubmit = async () => {
      const now = Date.now();

    if (now - lastClickTimeRef.current < 2000) {
      alert("⏳ Please wait 2 seconds before clicking again!");
      return; // ignore clicks within 2s
    }
    lastClickTimeRef.current = now;
    if (!formData.name || !formData.mobileNumber) {
      alert("Please fill in required fields.");
      return;
    }
    setLoading(true);
     //   "https://oxadmedia.online/addnewlead.php",

    try {
               let token = localStorage.getItem("accessToken"); // make sure you have the token

          const leadData = {
    leadname: formData.name,
    leadmob: formData.mobileNumber,
    gymid: gymId,
    typeIs: "add"

};
   const response = await axios.post(
  "https://oxadmedia.online/api/lead-manage",
  leadData,
  {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }
);

     // console.log("Server Response:", response.data);
      if (response.data.success) {
  toast.success("✅ "+response.data.message);
        setFormData({ name: "", mobileNumber: "", message: "" });
      } else if (response.data.error == 11){
     showUpgradePopup({
       price: "₹5000 / Year",
       titleIs: "Limit Exceeded"
      });
      }else if (response.data.error === 1) {
                    // Token expired (API error = 1)
                    console.log("Access token expired while fetching page " );
                               //    alert("❌ Failed: " + res.data.message);

                  token = await refreshAccessToken(); // Refresh token
                   
                    if (!token) {
                        console.log("❌ Unable to refresh token. Logging out...");
                        handleLogout();
                        return;
                    }else{
                       return await retryApi(token, leadData,"api/lead-manage"); // 🔁 Retry with new token

                    }
                //    console.log("✅ Token refreshed. Retrying page " + currentPage);
                }else {
Swal.fire({
  icon: "error",                 // ❌ shows error icon
  title: "Failed",
  text: response.data.message,   // your API message
  confirmButtonText: "OK",
  background: "#fff",
  iconColor: "#e74c3c",          // optional: custom icon color
});         }
    } catch (error) {
      console.error("Error adding lead:", error);
       Swal.fire({
              icon: "error",
              title: "Network Error",
              text: "Check your internet",
              confirmButtonText: "OK",
            });
     // alert("An error occurred while adding your lead.");
    }finally {
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
        localStorage.removeItem("gyms");
        localStorage.removeItem("selectedGym");
    localStorage.setItem("isLoggedInWeb", "false");

        // ✅ Navigate back to login screen
        navigate("/login", { replace: true });
    };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {loading && (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm z-50">
    <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-3 text-gray-700 font-medium">Processing...</p>
  </div>
)}
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-6">
        
        {/* Gym Header */}
        

        {/* Enquiry Form */}
        <h2 className="text-xl font-semibold text-center text-red-500 mb-4">
          New Lead Entry
        </h2>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block font-medium mb-1">Lead Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Name"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block font-medium mb-1">Mobile Number *</label>
            <input
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Enter mobile number"
            />
          </div>

          {/* <label style={{ display: "block", marginBottom: "6px" }}>
          Where you knew about us?
        </label>
       <select
  value={source}
  onChange={(e) => setSource(e.target.value)}
  required
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    backgroundColor: "#fff",
    fontSize: "14px",
    outline: "none",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    appearance: "none", // hides default arrow in some browsers
    backgroundImage:
      'url("data:image/svg+xml;utf8,<svg fill=\'%23666\' height=\'16\' viewBox=\'0 0 24 24\' width=\'16\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/></svg>")',
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
    backgroundSize: "16px"
  }}
>
  <option value="">Select</option>
  <option value="Google">Google</option>
  <option value="Instagram">Instagram</option>
  <option value="Facebook">Facebook</option>
  <option value="Friend">Friend</option>
  <option value="Other">Other</option>
</select> */}
          {/* Buttons */}
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setFormData({ name: "", mobileNumber: "", message: "" })}
              className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 transition"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
            >
              Add Lead
            </button>
          </div>

         
        </div>
      </div>
    </div>
  );
}

export default AddLeadHere;
