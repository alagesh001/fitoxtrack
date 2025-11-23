// UpgradeDialog.jsx
import React from "react";

export default function UpgradeDialog({ isOpen, onClose, onUpgrade, gymName, gymId }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>

      {/* Dialog box */}
      <div className="bg-white rounded-lg shadow-lg p-6 z-10 w-full max-w-md mx-2">
        <h2 className="text-xl font-bold mb-3">Upgrade Required</h2>
        <p className="text-gray-600 mb-6">
          Upgrade your plan to access inactive clients.
        </p>

        {/* Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white"
            onClick={() => {
              const message = `Hi from ${gymName}, Gym id = ${gymId}, I would like to upgrade.`;
              const whatsappURL = `https://wa.me/918148602102?text=${encodeURIComponent(message)}`;
              window.open(whatsappURL, "_blank");
              onClose();
            }}
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
}