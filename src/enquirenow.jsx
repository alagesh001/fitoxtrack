import React, { useState } from "react";
import axios from "axios";
import appIcon from './assets/ftox_icon.png';
import { useLocation } from "react-router-dom";

function EnquireGym() {
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const gymId = queryParams.get("gymid");
  const gymName = queryParams.get("gymname");
  const [source, setSource] = useState("");

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

  const handleSubmit = async () => {
    if (!formData.name || !formData.mobileNumber) {
      alert("Please fill in required fields.");
      return;
    }

    try {
      const response = await axios.post(
        "https://oxadmedia.online/addnewlead.php",
        {
          leadname: formData.name,
          leadmob: formData.mobileNumber,
          gymid: gymId,
        },
        { headers: { "Content-Type": "application/json" } }
      );

     // console.log("Server Response:", response.data);
      if (response.data.success) {
        alert("Your enquiry has been sent successfully!");
        setFormData({ name: "", mobileNumber: "", message: "" });
      } else {
        alert("Failed to send enquiry: " + response.data.message);
      }
    } catch (error) {
      console.error("Error sending enquiry:", error);
      alert("An error occurred while sending your enquiry.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-6">
        
        {/* Gym Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{gymName}</h1>
          <p className="text-gray-500 text-sm mt-2">Fill the form below to enquire about memberships or offers.</p>
        </div>

        {/* Enquiry Form */}
        <h2 className="text-xl font-semibold text-center text-red-500 mb-4">
          Enquiry Form
        </h2>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block font-medium mb-1">Your Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Enter your name"
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
              placeholder="Enter your mobile number"
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
              Send Enquiry
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-2">
            📞 We’ll get back to you within 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
}

export default EnquireGym;
