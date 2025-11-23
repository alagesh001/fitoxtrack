import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowPathIcon } from "@heroicons/react/24/outline"; // Refresh Icon
  import Swal from "sweetalert2";
import { toast } from "react-toastify";

function DashboardAdmin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const apiBase = "https://oxadmedia.online";
  const storedGym = JSON.parse(localStorage.getItem("selectedGym") || "{}");
  const gymid = storedGym?.GymId;
  const navigate = useNavigate();
const [disabled, setDisabled] = useState(false);

  // ✅ Logout Function
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("selectedGym");
    localStorage.setItem("isLoggedInWeb", "false");
    navigate("/login", { replace: true });
  };

  // ✅ Refresh Token
  const refreshAccessToken = async () => {
    try {
      const res = await axios.post(
        `${apiBase}/api/refresh-token`,
        { mob: storedGym.mob },
        { withCredentials: true }
      );

      if (res.data.success && res.data.access_token) {
        localStorage.setItem("accessToken", res.data.access_token);
        console.log("✅ Access token refreshed");
        a_token = res.data.access_token
        return res.data.access_token;
      } else {
        console.log("❌ Refresh token invalid. Logging out...");
        handleLogout();
        return null;
      }
    } catch (err) {
      console.error("🔥 Failed to refresh token:", err);
      handleLogout();
      return null;
    }
  };
let retryCount = 0;
const maxRetries = 2;
    const token = localStorage.getItem("accessToken");
let a_token = token;
  // ✅ Fetch Dashboard Data
  const fetchDashboardData = async (forceRefresh = false) => {
    setLoading(true);
    setError("");

    // If not force refreshing, check localStorage first
    if (!forceRefresh) {
      const cachedData = localStorage.getItem(`dashboardData_${gymid}`);
      if (cachedData) {
        console.log("📦 Loaded dashboard from localStorage");
        setData(JSON.parse(cachedData));
        setLoading(false);
        return;
      }
    }

    // Otherwise fetch from API
    try {
      const response = await axios.get(`${apiBase}/api/fetch-dash`, {
        params: { gymid },
        headers: {
          Authorization: `Bearer ${a_token}`,
        },
      });

      if (response.data.success) {
toast.success("✅ Success", { toastId: "successMessage" });
         retryCount =0;

        setDisabled(true);
        setData(response.data.result);
        localStorage.setItem(
          `dashboardData_${gymid}`,
          JSON.stringify(response.data.result)
        );
        console.log("✅ Dashboard data fetched & cached");
      } else if (
        response.data.error === 1
      ) {
        console.log("⚠️ Token expired. Refreshing...");
         if (retryCount >= maxRetries) {
        console.log("❌ Token refresh failed repeatedly. Stopping...");
        return;
      }
      retryCount++;
        const newToken = await refreshAccessToken();
        if (newToken) {
          // 🔁 Retry API call with refreshed token
          return await fetchDashboardData(forceRefresh);
        }
      } else {
          setDisabled(false);
        setError(response.data.message || "Failed to load dashboard data.");
      }
    } catch (err) {
                setDisabled(false);
 Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Check your internet",
        confirmButtonText: "OK",
      });
      console.error("🔥 Error fetching dashboard data:", err);
      setError("Failed to fetch dashboard data.");
    } finally {
      setLoading(false);
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
       fetchDashboardData(true); // Pass forceRefresh=true
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
  // Load data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="p-4">
      {/* Header with Title and Refresh */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">📊 Gym Dashboard</h1>
        <button
  onClick={() => {
        handleRefresh();
      }}     
           className="flex items-center gap-1 px-3 py-1 rounded bg-gray-500 text-white hover:bg-gray-600 transition"
        >
          <ArrowPathIcon className="h-5 w-5" />
          Refresh
        </button>
      </div>

      {/* Loading & Error */}
      {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="p-4 rounded-lg shadow bg-gray-200 animate-pulse h-28"
      >
        <div className="h-4 w-32 bg-gray-300 rounded mb-2"></div>
        <div className="h-6 w-20 bg-gray-400 rounded"></div>
      </div>
    ))}
  </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-red-50 text-red-700 space-y-2">
  {/* Icon */}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-12 w-12 text-red-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
    />
  </svg>

  {/* Heading */}
  <p className="text-lg font-semibold">Something went wrong</p>

  {/* Error message */}
  <p className="text-sm text-red-600">{error}</p>
</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Weekly Collection */}
          <div className="p-4 rounded-lg shadow bg-blue-100">
            <p className="text-sm text-gray-600">This Week's Collection</p>
            <p className="text-2xl font-bold text-blue-700">
              ₹{data?.weekAmount}
            </p>
          </div>

          {/* Monthly Collection */}
          <div className="p-4 rounded-lg shadow bg-green-100">
            <p className="text-sm text-gray-600">This Month's Collection</p>
            <p className="text-2xl font-bold text-green-700">
              ₹{data?.monthAmount}
            </p>
          </div>

          {/* Type One Count */}
          <div className="p-4 rounded-lg shadow bg-yellow-100">
            <p className="text-sm text-gray-600">New Members</p>
            <p className="text-2xl font-bold text-yellow-700">
              {data?.typeOneCount}
            </p>
          </div>

          {/* Expired Members */}
          <div className="p-4 rounded-lg shadow bg-red-100">
            <p className="text-sm text-gray-600">Expired Members</p>
            <p className="text-2xl font-bold text-red-700">
              {data?.expiredMembersCount}
            </p>
          </div>

          {/* Attendance Today */}
          <div className="p-4 rounded-lg shadow bg-purple-100">
            <p className="text-sm text-gray-600">Today's Attendance</p>
            <p className="text-2xl font-bold text-purple-700">
              {data?.attendanceToday}
            </p>
          </div>

          {/* Total Due */}
          <div className="p-4 rounded-lg shadow bg-pink-100">
            <p className="text-sm text-gray-600">Total Due</p>
            <p className="text-2xl font-bold text-pink-700">
              ₹{data?.total_due}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardAdmin;
