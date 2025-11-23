import { useState, useEffect,useRef } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline"; // download icon
import * as XLSX from "xlsx";
import { showUpgradePopup } from './helper/reuse.js';

function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState(""); // user typing
  const [searchTerm, setSearchTerm] = useState("");   // applied search term
  const [limit] = useState(15);
const transactionsCache = useRef({});
const [selectedDate, setSelectedDate] = useState("");
  const [isDateFilter, setIsDateFilter] = useState(false);
    const navigate = useNavigate();

  const apiBase = "https://oxadmedia.online";
  const storedGym = JSON.parse(localStorage.getItem("selectedGym") || "{}");
  const gymid = storedGym?.GymId;
  const handleDateSearch = () => {
  if (!selectedDate) {
    alert("Please select a date.");
    return;
  }
setIsDateFilter(true);
  // Example: call your fetch function with the selected date
    transactionsCache.current = {};

  setPage(1);

  fetchTransactions(1,"-22",selectedDate);
};
const handleDownload = () => {
  const allData = [];

  // Collect all transactions from the cache
  Object.values(transactionsCache.current).forEach(entry => {
    if (Array.isArray(entry.result)) {
      allData.push(...entry.result);
    }
  });

  if (allData.length === 0) {
    alert("No transaction data available to download.");
    return;
  }

  // Transform the type field into human-readable string
  const transformedData = allData.map(client => ({
    ...client,
    t_type: client.type === 0 ? "Delete"
          : client.type === 1 ? "New"
          : client.type === 2 ? "Renew"
          : client.type === 3 ? "Due"
          : client.type === 4 ? "Expense"
          : client.type  // fallback to original value if unknown
  }));

  // Create worksheet and workbook from transformed data
  const worksheet = XLSX.utils.json_to_sheet(transformedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

  // Save file
  XLSX.writeFile(workbook, "transaction_history.xlsx");
};

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

    const handleLogout = () => {
        localStorage.removeItem("gyms");
        localStorage.removeItem("selectedGym");
    localStorage.setItem("isLoggedInWeb", "false");

        // ✅ Navigate back to login screen
        navigate("/login", { replace: true });
    };

const fetchTransactions = async (currentPage = page, memid = searchTerm,t_dateIs = "1",retryCount = 0) => {
  setLoading(true);
  setError("");
  const MAX_RETRIES = 1; // or 2

  const token = localStorage.getItem("accessToken");
    console.log("📦 Using currentPage data for", currentPage);

  // 👉 Check cache first (only for non-search)
  const isMemid22 = memid === "-22" || memid === -22;

const cacheKey = `page_${currentPage}`;   // default listing


  if (transactionsCache.current[cacheKey]) {
   // console.log("📦 Using cached data for", cacheKey);
    setTransactions(transactionsCache.current[cacheKey].result || []);
    setTotalPages(transactionsCache.current[cacheKey].total_pages || 1);
    setLoading(false);
    return;
  }
      //const response = await axios.get(`${apiBase}/api/get-transac`, {

    //const response = await axios.get(`${apiBase}/gettransachisWe.php`, {

  try {
    const response = await axios.get(`${apiBase}/api/get-transac`, {
      params: {
        gymid: gymid,
typeIs: memid > 0 ? 1 : 0,
        t_date: t_dateIs,
page: currentPage,
          limit,
        ...(memid && { memid }),
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      const result = response.data.result || [];
      const total_pages = response.data.total_pages || 1;

      setTransactions(result);
      setTotalPages(total_pages);

      // ✅ Save to cache
      transactionsCache.current[cacheKey] = {
        result,
        total_pages,
      };
    } else if (response.data.error === 1 && retryCount < MAX_RETRIES) {
      console.log("⚠️ Token expired. Refreshing...");
      const newToken = await refreshAccessToken();

      if (newToken) {
        // 🔁 Retry API call with refreshed token
        return await fetchTransactions(currentPage, memid,t_dateIs, retryCount + 1);
      }
    } else {
        if(response.data.error == 99){
        showUpgradePopup({
                          price: "₹5000 / Year",
                          titleIs: "Renew Now"
                         });
                        }   

      setError(response.data.message || "Failed to fetch transactions.");

                        
    }
  } catch (err) {
    console.error("🔥 Error fetching transactions:", err);
    setError("Check your internet connection");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
if (isDateFilter) {
  
    fetchTransactions(page,"-22", selectedDate);
  } else {
              console.log("✅ api called aaatraansaccc");

    fetchTransactions();
  }  }, [page, searchTerm]);

  const handleSearchClick = () => {
    //setPage(1); // Reset to first page
    setIsDateFilter(false);
    setPage(1);
transactionsCache.current = {};
    setSearchTerm(searchInput); // Apply search term
  };

  return (
    <div className="p-4">
  <div className="flex justify-between items-center mb-4">
    <h1 className="text-xl font-bold">💳 Transaction History</h1>
    <button
         onClick={handleDownload}
         className="flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900 transition"
       >
         <ArrowDownTrayIcon className="w-5 h-5" />
       </button>
  </div>
      {/* 🔍 Search Input and Button */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter Member ID"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="border rounded p-2 flex-1"
        />
        <button
          onClick={handleSearchClick}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
        >
          Search
        </button>
      </div>
<div className="flex gap-2 mb-4">
  <input
    type="date"
    value={selectedDate}
    onChange={(e) => setSelectedDate(e.target.value)}
    className="border rounded p-2"
  />
  <button
    onClick={handleDateSearch}
    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
  >
    Search by Date
  </button>
</div>
      {/* 📄 Transaction List */}
      {loading ? (
        //<p>Loading transactions...</p>
          // Shimmer placeholder for transactions
  <div className="grid gap-3">
    {[...Array(7)].map((_, i) => (
      <div
        key={i}
        className="p-3 border rounded shadow-sm bg-white flex justify-between items-center animate-pulse"
      >
        {/* Left side placeholder */}
        <div className="flex flex-col gap-2">
          <div className="h-4 w-32 bg-gray-300 rounded"></div>
          <div className="h-3 w-24 bg-gray-200 rounded"></div>
          <div className="h-3 w-20 bg-gray-200 rounded"></div>
        </div>
        {/* Right side placeholder */}
        <div className="h-5 w-16 bg-gray-300 rounded"></div>
      </div>
    ))}
  </div>
      ) : error ?  (
  <div className="flex flex-col items-center justify-center p-6 border rounded bg-red-50 text-red-600">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-10 w-10 mb-2"
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
    <p className="text-lg font-semibold">Oops!</p>
    <p className="text-sm">{error}</p>
  </div>
) : transactions.length === 0 ? (
  <div className="flex flex-col items-center justify-center p-6 border rounded bg-gray-50 text-gray-500">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-10 w-10 mb-2"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
    <p className="text-lg font-semibold">No transactions found</p>
    <p className="text-sm">Try changing your search or date filter.</p>
  </div>
) : (
        <div className="grid gap-3">
          {transactions.map((txn) => (
        <div
  key={txn.id}
  className="p-3 border rounded shadow-sm bg-white hover:shadow-md transition flex justify-between items-center"
>
  {/* Left side details */}
  <div>
    <p className="font-semibold">🧾 {txn.name}</p>
    <p className="text-sm text-gray-600">📅 Date: {txn.date}</p>
    <p className="text-sm text-gray-600">
      🏷 Type: {{
        0: "Delete",
        1: "New",
        2: "Renew",
        3: "Due",
        4: "Expense",
      }[txn.type] || "Unknown"}
    </p>
  </div>

  {/* Right side amount */}
  <div className="text-right">
    <p className="text-lg font-bold text-green-600">+ ₹{txn.amount}</p>
  </div>
</div>
          ))}
        </div>
      )}

      {/* ⏭ Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
        >
          ⬅ Prev
        </button>
        <p>
          Page {page} of {totalPages}
        </p>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
        >
          Next ➡
        </button>
      </div>
    </div>
  );
}

export default TransactionHistory;
