import { useEffect, useState } from "react";
import { topCities } from "../helper/states";

export default function CoachingList() {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    rating: "",
    state: "",
    city: "",
    type: "",
    lat: "",
    lng: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
      const apiBase = "https://tennisx.in";

  const fetchData = async () => {
  let query = `${apiBase}/api/get_t_coach?page=${page}`;

    if (filters.rating) query += `&rating=${filters.rating}`;
    if (filters.state) query += `&state=${filters.state}`;
    if (filters.city) query += `&city=${filters.city}`;
    if (filters.type) query += `&type=${filters.type}`;
    if (filters.lat && filters.lng)
      query += `&lat=${filters.lat}&lng=${filters.lng}`;

    const res = await fetch(query);
    const json = await res.json();
    setData(json.data);
  };

  useEffect(() => {
    fetchData();
  }, [filters, page]);

 return (
  <div className="bg-gray-50 min-h-screen p-4 md:p-8">
    
    {/* 🔍 Filters */}
    <div className="mb-6">

  {/* 🔘 Filter Toggle Button */}
  <div className="flex justify-between items-center mb-3">
    <h1 className="text-xl font-bold text-gray-800">
      Coaches & Academies
    </h1>

    <button
      onClick={() => setShowFilters(!showFilters)}
      className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-100"
    >
      ⚙️ Filters
    </button>
  </div>

  {/* 🔍 Filters (Shown only when needed) */}
  {showFilters && (
    <div className="bg-white p-4 rounded-2xl shadow-sm border grid md:grid-cols-4 gap-4 transition-all">
      
      {/* Rating */}
      <select 
        onChange={(e) => setFilters({...filters, rating: e.target.value})}
        className="p-3 rounded-xl border focus:ring-2 focus:ring-green-400 outline-none"
      >
        <option value="">Rating</option>
        <option value="4">4+ Stars</option>
        <option value="3">3+ Stars</option>
      </select>

      {/* City Dropdown */}
      <select
        onChange={(e) => setFilters({...filters, city: e.target.value})}
        className="p-3 rounded-xl border focus:ring-2 focus:ring-green-400 outline-none"
      >
        <option value="">Select City</option>
        {topCities.map((city, i) => (
          <option key={i} value={city}>{city}</option>
        ))}
      </select>

      {/* Type */}
      <select
        onChange={(e) => setFilters({...filters, type: e.target.value})}
        className="p-3 rounded-xl border focus:ring-2 focus:ring-green-400 outline-none"
      >
        <option value="">Type</option>
        <option value="coach">Coach</option>
        <option value="academy">Academy</option>
      </select>

      {/* Nearby */}
      <button
        onClick={() => {
          navigator.geolocation.getCurrentPosition((pos) => {
            setFilters({
              ...filters,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          });
        }}
        className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl p-3 transition"
      >
        📍 Nearby
      </button>

      {/* Clear Filters */}
      <button
        onClick={() => setFilters({})}
        className="md:col-span-4 text-sm text-red-500 hover:underline text-left"
      >
        Clear Filters
      </button>
    </div>
  )}
</div>

    {/* 🏸 List */}
    <div className="grid md:grid-cols-3 gap-6">
      {data.map((item) => (
        <div 
          key={item.id} 
          className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-lg transition duration-300"
        >
          
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">{item.name}</h2>

            {item.is_verified && (
              <span className="text-green-600 text-sm font-medium">
                ✔ Verified
              </span>
            )}
          </div>

          <p className="text-gray-500 mt-1 text-sm">
            {item.city}, {item.state}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-yellow-500 font-semibold">
              ⭐ {item.rating}
            </span>

            <span className="text-gray-400 text-sm">
              • {item.experience_years} yrs exp
            </span>
          </div>

          <p className="text-sm text-gray-500 mt-2 capitalize">
            {item.type}
          </p>
        </div>
      ))}
    </div>

    {/* 🔢 Pagination */}
    <div className="flex gap-3 mt-10 justify-center">
      <button
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
        className="px-5 py-2 rounded-xl border bg-white hover:bg-gray-100 disabled:opacity-50"
      >
        Prev
      </button>

      <button
        onClick={() => setPage(page + 1)}
        className="px-5 py-2 rounded-xl border bg-white hover:bg-gray-100"
      >
        Next
      </button>
    </div>
  </div>
);
}