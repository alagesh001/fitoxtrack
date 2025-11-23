import { useState, useRef, useEffect } from "react";
import WhatsappIcon from "./assets/wapp_icn.png";

export default function WhatsAppReminderDropdown({ name, mobile, expiryDate, dueAmount, statusColor }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  const sanitizedMobile = "91" + String(mobile || "").replace(/\s+/g, "");

  const messages = {
    renewal: `Hello ${name}, your gym membership is expiring on ${expiryDate}. Please renew soon!`,
    expired: `Hi ${name}, your gym membership expired on ${expiryDate}. Renew now to continue your fitness journey!`,
    due: `Hi ${name}, you have ₹${dueAmount} pending for your gym membership. Kindly clear your dues to avoid interruption.`,
    custom: `Hey ${name}, don’t miss your next session. Stay fit!`,
  };

  const labels = {
    renewal: "🕓 Renewal Reminder",
    expired: "⛔ Expiry Reminder",
    due: "💰 Due Reminder",
    custom: "🧘 Custom Reminder",
  };

  const allowedButtonsByColor = {
    green: ["custom", "renewal"],
    yellow: ["custom", "renewal"],
    red: ["custom", "renewal", "expired"],
    gray: ["custom", "renewal", "due"],
  };

  const allowedKeys = allowedButtonsByColor[statusColor?.toLowerCase()] || ["custom"];

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSendMessage = (msg) => {
    const url = `https://wa.me/${sanitizedMobile}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    setShowDropdown(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button onClick={() => setShowDropdown((prev) => !prev)} title="Send WhatsApp Reminder">
        <img src={WhatsappIcon} alt="WhatsApp" className="w-10 h-10 hover:opacity-80" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {allowedKeys.map((key) => (
            <button
              key={key}
              onClick={() => handleSendMessage(messages[key])}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-100"
            >
              {labels[key]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
