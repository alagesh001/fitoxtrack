import React, { useState, useEffect } from "react";

export default function BiometricDashboard() {
  const API_BASE = "http://192.168.1.33:5000"; // update to your Flask API IP
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userIdsInput, setUserIdsInput] = useState("");

  // Fetch users from biometric device
 const fetchUsers = async () => {
  setLoading(true);
  setMessage(""); // clear previous message
  try {
    const res = await fetch(`${API_BASE}/users`);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    setUsers(data);
  } catch (error) {
    console.error("Error fetching users:", error);
    setMessage("❌ Failed to load users");
  } finally {
    setLoading(false);
  }
};


  // Fetch attendance logs
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/logs`);
      const data = await res.json();
      setLogs(data);
    } catch {
      setMessage("❌ Failed to load logs");
    }
    setLoading(false);
  };

  // Delete a single user
  const deleteUser = async (userId) => {
    if (!window.confirm(`Delete user ${userId}?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/delete-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();
      setMessage(data.message || "✅ Deleted");
      fetchUsers();
    } catch {
      setMessage("❌ Failed to delete user");
    }
    setLoading(false);
  };

  // Remove expired members (or custom IDs)
  const removeExpired = async () => {
    setLoading(true);
    try {
      let payload = {};
      if (userIdsInput.trim()) {
        const userIds = userIdsInput
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id);
        payload = { user_ids: userIds };
      }

      const res = await fetch(`${API_BASE}/remove-expired-members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: Object.keys(payload).length ? JSON.stringify(payload) : null,
      });

      const data = await res.json();
      console.log("Expired sync result:", data);
      setMessage("✅ Sync complete");
      setUserIdsInput("");
      fetchUsers();
    } catch {
      setMessage("❌ Failed to remove expired");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center mb-4">
        Biometric Device Dashboard
      </h1>

      {/* Users Section */}
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Users</h2>
          <div className="flex gap-2">
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              onClick={fetchUsers}
              disabled={loading}
            >
              Refresh
            </button>
          </div>
        </div>

        <ul className="divide-y max-h-64 overflow-y-auto">
          {users.map((u) => (
            <li
              key={u.user_id}
              className="flex justify-between items-center py-2"
            >
              <span>{u.name || "Unnamed"} (ID: {u.user_id})</span>
              <button
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                onClick={() => deleteUser(u.user_id)}
                disabled={loading}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

        {/* Custom IDs input */}
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Enter User IDs comma-separated"
            value={userIdsInput}
            onChange={(e) => setUserIdsInput(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <button
            className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600"
            onClick={removeExpired}
            disabled={loading}
          >
            Remove Expired / Custom IDs
          </button>
        </div>
      </div>

      {/* Logs Section */}
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Attendance Logs</h2>
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            onClick={fetchLogs}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        <ul className="divide-y max-h-64 overflow-y-auto text-sm">
          {logs.map((l, i) => (
            <li key={i} className="py-1">
              User {l.user_id} → {new Date(l.time).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>

      {message && <div className="text-center text-blue-600">{message}</div>}
    </div>
  );
}
