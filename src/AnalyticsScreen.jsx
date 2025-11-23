import { useEffect, useState } from "react";
import { getActiveClientsForGymBatched,
 } from './helper/indexeddbhelper2';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { FaBirthdayCake, FaUserFriends, FaVenusMars, FaBullseye, FaChartBar } from "react-icons/fa";
import { MdAccessTime } from "react-icons/md";

// 🎨 Vibrant colors for celebratory vibe
const COLORS = [
  "#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#FF6F91", "#845EC2",
  "#FFC75F", "#0081CF", "#FF9671", "#00C9A7", "#C34A36", "#F9F871"
];
const TAB_COLORS = {
  dob: "bg-pink-500",
  attendance: "bg-yellow-500",
  gender: "bg-green-500",
  goals: "bg-purple-500",
  age: "bg-blue-500",
};
const GENDER_COLORS = {
  Male: "#4D96FF",
  Female: "#FF6B6B",
  Other: "#845EC2",
};

const GOAL_COLORS = {
  "Weight Loss": "#FF6B6B",
  "Weight Gain": "#6BCB77",
  "Muscle Tone": "#4D96FF",
  Other: "#845EC2",
};
// ✅ Inline Tabs Component with icons
function Tabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex overflow-x-auto no-scrollbar space-x-2 border-b mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-t min-w-max transition-all duration-200 ${
            activeTab === tab.key
              ? `${TAB_COLORS[tab.key]} text-white font-semibold shadow`
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <span className="text-lg">{tab.icon}</span>
          <span className="whitespace-nowrap">{tab.name}</span>
        </button>
      ))}
    </div>
  );
}

function AnalyticsScreen() {
  const [activeTab, setActiveTab] = useState("dob");
  const [clientData, setClientData] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc"); // for attendance sorting
  const [activeGender, setActiveGender] = useState(null); // 👈 for gender filter
  const [activeGoal, setActiveGoal] = useState(null);     // 👈 for goal filter
  const storedGym = JSON.parse(localStorage.getItem("selectedGym") || "{}");
  const gymid = storedGym?.GymId;
useEffect(() => {

  async function loadClients() {

    const savedClients = [];

    // 🚀 Load from IndexedDB in batches
    await getActiveClientsForGymBatched(
      gymid,
      100,
      async (batch) => {
        savedClients.push(...batch);
      }
    );

    if (savedClients.length > 0) {
      console.log(`📦 Loaded ${savedClients.length} clients from IndexedDB`);
      setClientData(savedClients); // ✅ Only set once
    } else {
      console.log("🌐 No clients in IndexedDB, fetching from API...");
      //await fetchAllClients(token); // Will setClients internally
    }

  }
  loadClients();


  }, []);
  // useEffect(() => {
  //   const cachedClients = localStorage.getItem(`clientsdata_${gymid}`);
  //   if (cachedClients) {
  //     setClientData(JSON.parse(cachedClients));
  //   } else {
  //     console.warn("⚠️ No cached client data found");
  //   }
  // }, [gymid]);

  // 🧠 Birthday Chart Data
  const getDOBChartData = () => {
    const monthCount = Array(12).fill(0);
    clientData.forEach((client) => {
      if (client.dob) {
        const month = new Date(client.dob).getMonth(); // 0=Jan
        monthCount[month]++;
      }
    });
    return monthCount.map((count, idx) => ({
      month: new Date(0, idx).toLocaleString("default", { month: "short" }),
      count,
    }));
  };

  const getUpcomingBirthdays = () => {
    const today = new Date();
    const todayList = [];
    const next7Days = [];

    clientData.forEach((client) => {
      if (client.dob) {
        const dob = new Date(client.dob);
        dob.setFullYear(today.getFullYear());
        const diffDays = Math.ceil((dob - today) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) todayList.push(client);
        else if (diffDays > 0 && diffDays <= 7) next7Days.push(client);
      }
    });

    next7Days.sort((a, b) => new Date(a.dob) - new Date(b.dob));
    return { todayList, next7Days };
  };

  const getGenderChartData = () => {
    const genderCount = { Male: 0, Female: 0, Other: 0 };
    clientData.forEach((client) => {
      const gender = client.gender || "Other";
      genderCount[gender] = (genderCount[gender] || 0) + 1;
    });
    return Object.entries(genderCount).map(([gender, count]) => ({
      gender,
      count,
    }));
  };

  const getGoalChartData = () => {
    const goalCount = {};
    clientData.forEach((client) => {
      let goal = client.goal || "4"; // Default to "Other"
      goal = {
        1: "Weight Loss",
        2: "Weight Gain",
        3: "Muscle Tone",
        4: "Other",
      }[goal] || "Other";
      goalCount[goal] = (goalCount[goal] || 0) + 1;
    });
    return Object.entries(goalCount).map(([goal, count]) => ({
      goal,
      count,
    }));
  };

  const getAgeChartData = () => {
    const ageGroups = {
      "Under 20": 0,
      "20-30": 0,
      "31-40": 0,
      "41-50": 0,
      "51+": 0,
    };
    const today = new Date();
    clientData.forEach((client) => {
      if (client.dob) {
        const birthDate = new Date(client.dob);
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 20) ageGroups["Under 20"]++;
        else if (age <= 30) ageGroups["20-30"]++;
        else if (age <= 40) ageGroups["31-40"]++;
        else if (age <= 50) ageGroups["41-50"]++;
        else ageGroups["51+"]++;
      }
    });
    return Object.entries(ageGroups).map(([group, count]) => ({
      ageGroup: group,
      count,
    }));
  };

  const getAttendanceData = () => {
    const sorted = [...clientData].sort((a, b) => {
      const dateA = new Date(a.last_attend);
      const dateB = new Date(b.last_attend);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
    return sorted;
  };

  // 🔥 Render Chart or Table Based on Tab
  const renderChart = () => {
    const { todayList, next7Days } = getUpcomingBirthdays();

    switch (activeTab) {
      case "dob":
        return (
  <>
    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
      🎉 <span className="text-pink-600">Birthdays by Month</span> 🎂
    </h2>

    <div className="rounded-lg shadow bg-gradient-to-r from-pink-50 to-blue-50 p-4">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={getDOBChartData()}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}
          />
          <Bar dataKey="count">
            {getDOBChartData().map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>

    {/* 🎂 Today Birthdays */}
    <h3 className="mt-6 text-md font-bold text-pink-600 flex items-center gap-2">
      🥳 Birthdays Today
    </h3>
    {todayList.length > 0 ? (
      <ul className="mt-3 space-y-2">
        {todayList.map((client) => (
          <li
            key={client.userid}
            className="border p-3 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gradient-to-r from-yellow-50 to-pink-50 animate-pulse"
          >
            <div>
              <p className="font-semibold text-lg text-pink-700">{client.name} 🎈</p>
              <p className="text-sm text-gray-600">
                📅 {new Date(client.dob).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">📞 {client.mobile}</p>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500 mt-2">🎈 No birthdays today.</p>
    )}

    {/* 🎁 Upcoming Birthdays */}
    <h3 className="mt-6 text-md font-bold text-blue-600 flex items-center gap-2">
      🎁 Upcoming Birthdays (Next 7 Days)
    </h3>
    {next7Days.length > 0 ? (
      <ul className="mt-3 space-y-2">
        {next7Days.map((client) => (
          <li
            key={client.userid}
            className="border p-3 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gradient-to-r from-blue-50 to-green-50"
          >
            <div>
              <p className="font-semibold text-lg text-blue-700">{client.name} 🎊</p>
              <p className="text-sm text-gray-600">
                📅 {new Date(client.dob).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">📞 {client.mobile}</p>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500 mt-2">🎈 No upcoming birthdays.</p>
    )}
  </>
);

      case "attendance":
        return (
          <>
            <h2 className="text-lg font-semibold mb-2">📅 Attendance Report</h2>
            <div className="flex justify-end mb-2">
              <button
                onClick={() =>
                  setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                }
                className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
              >
                Sort: {sortOrder === "asc" ? "Old → New" : "New → Old"}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Last Attend</th>
                    <th className="p-2 border">Attendance Count</th>
                  </tr>
                </thead>
                <tbody>
                  {getAttendanceData().map((client) => (
                    <tr key={client.userid} className="hover:bg-gray-50">
                      <td className="p-2 border">{client.name}</td>
                      <td className="p-2 border">
                        {client.last_attend
                          ? new Date(client.last_attend).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="p-2 border text-center">
                        {client.attendance_count || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );

      case "gender":
        return (
          <>
            <h2 className="text-lg font-semibold mb-2">⚧ Gender Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getGenderChartData().filter((entry) =>
                    activeGender ? entry.gender === activeGender : true
                  )}
                  dataKey="count"
                  nameKey="gender"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {getGenderChartData().map((entry, index) => (
                    <Cell
                      key={index}
                      fill={GENDER_COLORS[entry.gender] || COLORS[index % COLORS.length]}
                      opacity={
                        activeGender && entry.gender !== activeGender ? 0.3 : 1
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4 flex-wrap">
              {Object.entries(GENDER_COLORS).map(([gender, color]) => (
                <button
                  key={gender}
                //   onClick={() =>
                //     setActiveGender((prev) => (prev === gender ? null : gender))
                //   }
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    activeGender === gender
                      ? "text-white shadow"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  style={{
                    backgroundColor: activeGender === gender ? color : undefined,
                    color: activeGender === gender ? "#fff" : undefined,
                  }}
                >
                  <span
                    className="w-4 h-4 rounded-full inline-block"
                    style={{ backgroundColor: color }}
                  ></span>
                  {gender}
                </button>
              ))}
            </div>
          </>
        );

      case "goals":
        return (
          <>
            <h2 className="text-lg font-semibold mb-2">🎯 Goals Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getGoalChartData().filter((entry) =>
                    activeGoal ? entry.goal === activeGoal : true
                  )}
                  dataKey="count"
                  nameKey="goal"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {getGoalChartData().map((entry, index) => (
                    <Cell
                      key={index}
                      fill={GOAL_COLORS[entry.goal] || COLORS[index % COLORS.length]}
                      opacity={
                        activeGoal && entry.goal !== activeGoal ? 0.3 : 1
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4 flex-wrap">
              {Object.entries(GOAL_COLORS).map(([goal, color]) => (
                <button
                  key={goal}
                //   onClick={() =>
                //     setActiveGoal((prev) => (prev === goal ? null : goal))
                //   }
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    activeGoal === goal
                      ? "text-white shadow"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  style={{
                    backgroundColor: activeGoal === goal ? color : undefined,
                    color: activeGoal === goal ? "#fff" : undefined,
                  }}
                >
                  <span
                    className="w-4 h-4 rounded-full inline-block"
                    style={{ backgroundColor: color }}
                  ></span>
                  {goal}
                </button>
              ))}
            </div>
          </>
        );

      case "age":
        return (
          <>
            <h2 className="text-lg font-semibold mb-2">🎂 Age Groups</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getAgeChartData()}>
                <XAxis dataKey="ageGroup" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count">
                  {getAgeChartData().map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </>
        );

      default:
        return <p className="text-gray-500">No data available.</p>;
    }
  };

return (
  <div className="p-4">
    <h1 className="text-2xl font-bold mb-4">📊 Analytics</h1>

    {/* Tabs */}
    <Tabs
      tabs={[
        { name: "Birthday", key: "dob", icon: <FaBirthdayCake /> },
        { name: "Attendance", key: "attendance", icon: <MdAccessTime /> },
        { name: "Gender", key: "gender", icon: <FaVenusMars /> },
        { name: "Goals", key: "goals", icon: <FaBullseye /> },
        { name: "Age", key: "age", icon: <FaChartBar /> },
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />

    {/* Chart or Table */}
    <div className="mt-4">{renderChart()}</div>
  </div>
);
}

export default AnalyticsScreen;
