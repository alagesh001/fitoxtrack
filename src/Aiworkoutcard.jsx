// AIWorkoutCardGenerator.jsx
// Place in your React project. Requires lucide-react (npm i lucide-react).
import React, { useRef, useEffect, useState } from "react";
import { Download } from "lucide-react";
import { useLocation,useNavigate } from "react-router-dom";

export default function AIWorkoutCardGenerator() {
  const canvasRef = useRef(null);
  const [seed, setSeed] = useState(Date.now());
  const [title, setTitle] = useState("Weekly Workout Plan");
  const [width] = useState(600);
  const [height] = useState(1200);
  const [plan, setPlan] = useState([]);
// GOAL definitions
const goals = ["Muscle Gain", "Weight Loss", "Endurance", "Balanced"];
const [goal, setGoal] = useState("Balanced");
const [mode, setMode] = useState("separate");
 const [selectedGym, setSelectedGym] = useState(null);
const [fromText, setFromText] = useState("");
const [name, setName] = useState("");
const [loading, setLoading] = useState(true);
const storedGym = JSON.parse(localStorage.getItem("selectedGym") || "{}");
  const gymid = storedGym?.GymId;
  const [showAuthBlock, setShowAuthBlock] = useState(false);
  const location = useLocation();

 const navigate = useNavigate();

    useEffect(() => {
    // Check if navigation came from button click
    if (!location.state?.fromButton) {
      // Redirect or hide
      navigate("/", { replace: true }); // or just return null
       return null;
    }
  }, [location.state, navigate]);
// useEffect(() => {
//   const storedGymRaw = localStorage.getItem("selectedGym");
//   const storedGym = storedGymRaw ? JSON.parse(storedGymRaw) : null;

//   const storedRenew = localStorage.getItem(`renew_data_${gymid}`);


//   if (!storedGym || !storedRenew) {
//     console.log("Access Blocked: Missing required localStorage data");
//     setShowAuthBlock(true);
//     return;
//   }
//    const now = new Date();

//   // storedRenew.expiresAt = "17-07-2025"
//   const [day, month, year] = storedRenew.split("-");

//   // Convert to JS date: yyyy-mm-ddT23:59:59
//   const expiryDate = new Date(`${year}-${month}-${day}T23:59:59`);

//   if (now > expiryDate) {
//     console.log("Access Blocked: Renew date expired");
//     setShowAuthBlock(true);
//     return;
//   }

//   console.log("Access Allowed");
// }, []);
useEffect(() => {
  const storedGym = localStorage.getItem("selectedGym");

  if (storedGym) {
    const parsedGym = JSON.parse(storedGym);
    setSelectedGym(parsedGym);

    if (parsedGym?.GymName) {
      setFromText(parsedGym.GymName);
    }
  }
}, []); 
  // Exercise pools
const pools = {
  chest: [
    "Barbell Bench Press",
    "Incline Dumbbell Press",
    "Chest Dips",
    "Cable Flyes",
    "Push-ups",
    "Incline Barbell Bench Press",
    "Decline Dumbbell Press",
    "Pec Deck Machine",
    "Single-arm Cable Crossover",
    "Squeeze Press"
  ],

  back: [
    "Pull-ups",
    "Bent-over Row",
    "Lat Pulldown",
    "Single-arm Dumbbell Row",
    "Seated Cable Row",
    "T-Bar Row",
    "Inverted Row",
    "Deadlift",
    "Wide-Grip Pull-down",
    "Machine Row"
  ],

  legs: [
    "Back Squat",
    "Romanian Deadlift",
    "Lunges",
    "Leg Press",
    "Hamstring Curls",
    "Front Squat",
    "Leg Extension",
    "Walking Lunges",
    "Bulgarian Split Squat",
    "Calf Raises"
  ],

  shoulders: [
    "Overhead Press",
    "Lateral Raises",
    "Front Raises",
    "Rear Delt Flyes",
    "Arnold Press",
    "Seated Dumbbell Press",
    "Cable Lateral Raise",
    "Upright Row",
    "Face Pulls",
    "Barbell Overhead Press"
  ],

  arms: [
    "Barbell Curl",
    "Tricep Pushdown",
    "Hammer Curl",
    "Skull Crushers",
    "Overhead Tricep Extension",
    "Concentration Curl",
    "Cable Curl",
    "Close-grip Bench Press",
    "Rope Overhead Tricep Extension",
    "Preacher Curl"
  ],

  core: [
    "Plank",
    "Hanging Leg Raise",
    "Russian Twist",
    "Bicycle Crunches",
    "Mountain Climbers",
    "Cable Crunch",
    "Toe Touches",
    "V-Ups",
    "Side Plank",
    "Ab Wheel Rollout"
  ],

  cardio: [
    "Jump Rope",
    "Treadmill Run (10 min)",
    "HIIT Sprints (8×20s)",
    "Rowing Machine (5 min)",
    "Burpees 3×15",
    "Cycling (15 min)",
    "Stair Climber (10 min)",
    "Shadow Boxing",
    "Elliptical (12 min)",
    "Battle Ropes (5 rounds)"
  ],

  full: [
    "Kettlebell Swing",
    "Thrusters",
    "Clean & Press",
    "Burpee Pull-ups",
    "Man Makers",
    "Snatch",
    "Push Press",
    "Bear Complex",
    "Dumbbell Cluster",
    "Renegade Rows"
  ]
};


  function seededRNG(s) {
    let t = s >>> 0;
    return function () {
      t += 0x6D2B79F5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pick(rng, arr) {
    return arr[Math.floor(rng() * arr.length)];
  }

  function genSetsReps(rng, type) {
    // Returns a string like 3x12 or 4x6 or 60s
    if (type === "cardio") {
      const opts = ["5 min", "8 min", "10 min", "12 min", "15 min"];
      return pick(rng, opts);
    }
    if (type === "core") {
      const secs = [30, 40, 45, 60];
      return `${pick(rng, secs)}s`;
    }
    const intensity = rng();
    if (intensity < 0.25) return `${4}x${6 + Math.floor(rng() * 3)}`; // heavy
    if (intensity < 0.6) return `${3}x${8 + Math.floor(rng() * 4)}`; // moderate
    return `${2 + Math.floor(rng() * 2)}x${10 + Math.floor(rng() * 6)}`; // higher rep
  }

function generateWeeklyPlan(seedVal = Date.now()) {
  const rng = seededRNG(seedVal);
  const days = ["Day 1","Day 2","Day 3","Day 4","Day 5","Day 6","Day 7"];
  const generated = [];

  // Define per-goal splits
  const goalSplits = {
    "Muscle Gain": ["chest","back","legs","shoulders","arms","core","rest"],
    "Weight Loss": ["cardio","full","cardio","core","full","cardio","rest"],
    "Endurance": ["cardio","core","full","cardio","core","full","rest"],
    "Balanced": ["chest","back","legs","cardio","shoulders","core","rest"]
  };

  const goalCombos = {
    "Muscle Gain": [
      { type: "push", pools: ["chest","shoulders","arms"] },
      { type: "pull", pools: ["back","arms"] },
      { type: "legs", pools: ["legs","core"] },
      { type: "full", pools: ["full","core"] },
      { type: "cardio", pools: ["cardio"] },
      { type: "mix", pools: ["chest","back","legs","shoulders","arms","core"] },
      { type: "rest", pools: [] }
    ],
    "Weight Loss": [
      { type: "hiit", pools: ["weightLoss","cardio"] },
      { type: "core", pools: ["core"] },
      { type: "full", pools: ["full","weightLoss"] },
      { type: "cardio", pools: ["cardio","weightLoss"] },
      { type: "mix", pools: ["weightLoss","core","cardio"] },
      { type: "hiit", pools: ["weightLoss","full"] },
      { type: "rest", pools: [] }
    ],
    "Endurance": [
      { type: "cardio", pools: ["cardio"] },
      { type: "core", pools: ["core"] },
      { type: "legs", pools: ["legs","core"] },
      { type: "full", pools: ["full"] },
      { type: "cardio", pools: ["cardio"] },
      { type: "mix", pools: ["full","core","cardio"] },
      { type: "rest", pools: [] }
    ],
    "Balanced": [
      { type: "push", pools: ["chest","shoulders","arms"] },
      { type: "pull", pools: ["back","arms"] },
      { type: "legs", pools: ["legs"] },
      { type: "cardio", pools: ["cardio"] },
      { type: "full", pools: ["full","core"] },
      { type: "mix", pools: ["chest","back","legs","core"] },
      { type: "rest", pools: [] }
    ]
  };

  const split = goalSplits[goal] || goalSplits["Balanced"];
  const combos = goalCombos[goal] || goalCombos["Balanced"];

  // SEPARATE MODE
  if (mode === "separate") {
    for (let i = 0; i < 7; i++) {
      const dayType = split[i];
      if (dayType === "rest") {
        generated.push({ day: days[i], type: "rest", exercises: ["Rest / Recovery"], sets: ["—"] });
        continue;
      }

      const pool = pools[dayType] || pools.full;
      const exs = [];
      const sets = [];
      const poolCopy = [...pool];

      for (let j = 0; j < 5; j++) {
        const idx = Math.floor(rng() * poolCopy.length);
        const ex = poolCopy.splice(idx,1)[0] || pick(rng, pool);
        exs.push(ex);
        sets.push(genSetsReps(rng, dayType === 'cardio' ? 'cardio' : (dayType==='core'?'core':'strength')));
      }

      generated.push({ day: days[i], type: dayType, exercises: exs, sets });
    }
  }
  // COMBINATION MODE
  else {
    for (let i = 0; i < 7; i++) {
      const c = combos[i];
      if (c.type === 'rest') {
        const restOpt = rng() < 0.5 ? 'Rest / Mobility' : 'Light Walk';
        generated.push({ day: days[i], type: 'rest', exercises: [restOpt], sets: ['—'] });
        continue;
      }

      const exs = [];
      const sets = [];
      let mixed = [];
      c.pools.forEach(p => { if (pools[p]) mixed = mixed.concat(pools[p]); });

      const used = new Set();
      for (let j = 0; j < 5; j++) {
        let ex = pick(rng, mixed);
        let tries = 0;
        while (used.has(ex) && tries < 5) {
          ex = pick(rng, mixed);
          tries++;
        }
        used.add(ex);
        exs.push(ex);
        const setType = ["cardio","hiit"].includes(c.type)
          ? "cardio"
          : c.type === "core"
          ? "core"
          : "strength";
        sets.push(genSetsReps(rng, setType));
      }

      generated.push({ day: days[i], type: c.type, exercises: exs, sets });
    }
  }

  setPlan(generated);
}

  // draw plan to canvas for download
  function drawPlanToCanvas(seedVal = seed, currentPlan = plan) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width * 2;
    canvas.height = height * 2;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    const ctx = canvas.getContext('2d');
    ctx.scale(2,2);

    // background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0,0,width,height);
      // Name
  ctx.textAlign = 'left';

ctx.font = `700 16px 'Poppins', sans-serif`;
    ctx.fillStyle = '#d11717ff';
    ctx.fillText(`Name: ${name}`, 40, 48);
  // 🕒 Add Date and Time on top right below title
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
  ctx.textAlign = 'right';
  ctx.font = `500 13px 'Poppins', sans-serif`;
  ctx.fillStyle = '#9ca3af';
  ctx.fillText(`${dateStr} • ${timeStr}`, width - 40, 48);
    // header
    ctx.fillStyle = '#0957f3ff';
    ctx.font = `700 28px 'Poppins', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(title, width/2, 85);

    // from label
    ctx.font = `500 14px 'Poppins', sans-serif`;
    ctx.fillStyle = '#0c0c0cff';
    ctx.fillText(`From ${fromText}`, width/2, 110);

    
    // layout: 7 day boxes vertically spaced
    const margin = 36;
    const contentTop = 140;
    const contentBottom = height - 48;
    const contentH = contentBottom - contentTop;
    const boxH = Math.floor(contentH / 7) - 8;
    const boxW = width - margin*2;

    for (let i = 0; i < 7; i++) {
      const item = currentPlan[i] || {day: 'Day', exercises:['-','-','-','-','-'], sets:['','','','','']};
      const bx = margin;
      const by = contentTop + i * (boxH + 8);

      // box background
      ctx.fillStyle = i % 2 === 0 ? '#f3f4f6' : '#ffffff';
      roundRect(ctx, bx, by, boxW, boxH, 8);
      ctx.fill();

      // day header
      ctx.fillStyle = '#111827';
      ctx.font = `600 16px 'Poppins', sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(item.day, bx + 14, by + 26);

      // type tag
      ctx.font = `500 12px 'Poppins', sans-serif`;
      ctx.fillStyle = '#6b7280';
      ctx.fillText(item.type, bx + boxW - 80, by + 26);

      // exercises list
      ctx.font = `600 13px 'Poppins', sans-serif`;
      ctx.fillStyle = '#111827';
      const lineX = bx + 14;
      let ly = by + 52;
      for (let j = 0; j < 5; j++) {
        const ex = item.exercises[j] || '-';
        const sets = item.sets[j] || '';
        // name (truncate if needed)
        ctx.textAlign = 'left';
        const maxNameWidth = boxW - 120;
        let name = ex;
        if (ctx.measureText(name).width > maxNameWidth) {
          while (ctx.measureText(name + '...').width > maxNameWidth && name.length > 6) {
            name = name.slice(0, -1);
          }
          name = name + '...';
        }
        ctx.fillText(name, lineX, ly);
        // sets on right
        ctx.textAlign = 'right';
        ctx.fillStyle = '#374151';
        ctx.fillText(sets, bx + boxW - 18, ly);
        ctx.fillStyle = '#111827';
        ly += 20;
      }
    }

    // footer small
    ctx.font = `400 12px 'Poppins', sans-serif`;
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'center';
    ctx.fillText('Generated with ❤️ — Fitox AI Workout Planner', width/2, height - 25);
    
  }

  // rounded rect helper
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
useEffect(() => {
  setTitle(`Workout Card - ${goal}`);
}, [goal]);
  // useEffect(() => {
  //   // generate plan on mount and when mode/seed changes
  //   generateWeeklyPlan(seed);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [mode, seed]);
useEffect(() => {

  setLoading(true); // start loader
  const timer = setTimeout(() => {
    generateWeeklyPlan(seed); // generate plan after 2s
    setLoading(false);        // stop loader
  }, 2000);

  return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [seed]);
  useEffect(() => {
    // draw canvas whenever plan changes
    drawPlanToCanvas(seed, plan);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan]);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${title.replace(/\s+/g,'-').toLowerCase()}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
<div className="flex flex-col mb-4 gap-3">
          <div className="flex-1">
  {showAuthBlock && (
  <div className="px-10 fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
    <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full text-center">
      <h2 className="text-xl font-bold text-red-600 mb-3">
        Not Authorised
      </h2>
      <p className="text-gray-700 text-base">
        Kindly login through authorized account to access.
      </p>
    </div>
  </div>
)}
            <div className="bg-white/60 rounded-2xl p-4 shadow-lg">

  {/* Title */}
  <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-gray-800">
    <span className="bg-blue-600 text-white text-sm px-2 py-1 rounded-md">Fitox AI</span>
    Workout Generator
  </h2>

  {/* Selectors below title */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
    {/* Goal Selector */}
    <div className="flex items-center gap-2">
      <label className="text-m font-medium">Goal:</label>
      <select
        className="border rounded p-2 text-m w-32"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
      >
        {goals.map((g) => (
          <option key={g}>{g}</option>
        ))}
      </select>
    </div>

    {/* Mode Selector */}
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium">Mode:</label>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1 text-sm cursor-pointer">
          <input
            type="radio"
            name="mode"
            value="separate"
            checked={mode === "separate"}
            onChange={(e) => setMode(e.target.value)}
            className="text-blue-600 focus:ring-blue-500"
          />
          Separate
        </label>

        <label className="flex items-center gap-1 text-sm cursor-pointer">
          <input
            type="radio"
            name="mode"
            value="mix"
            checked={mode === "mix"}
            onChange={(e) => setMode(e.target.value)}
            className="text-blue-600 focus:ring-blue-500"
          />
          Combination
        </label>
      </div>
    </div>
  </div>




      <div className="grid gap-3 mt-4">
              <input
  className="border p-2 rounded w-full"
  value={name}
  onChange={(e) => setName(e.target.value)}
  placeholder="Enter name"
/>

<input
  className="border p-2 rounded w-full"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
  placeholder="Enter workout title"
/>

<div className="flex items-center justify-end gap-2 mt-2">
          <div className="flex gap-2">
<button
  onClick={handleDownload}
  className="p-2 rounded-md bg-green-600 hover:bg-green-700 text-white transition"
>
  <Download className="w-5 h-5" />
</button>
  {/* Generate Button */}
    <button
      onClick={() => setSeed(Date.now())}
      className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm whitespace-nowrap"
    >
      Regenerate
    </button>
    
                <button
                  onClick={() => {
                    // copy image to clipboard (if supported)
                    const canvas = canvasRef.current;
                    if (!canvas) return;
                    canvas.toBlob(async (blob) => {
                      try {
                        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                        alert('Image copied to clipboard');
                      } catch (e) {
                        alert('Copy failed — try downloading instead');
                      }
                    });
                  }}
                  className="px-3 py-2 rounded-md border"
                >
                  Copy
                </button>
            {/* <button onClick={()=>{ setSeed(Date.now()); }} className="px-3 py-1 rounded-md border">Randomize</button> */}
          </div>
        
        </div>
          </div>
          </div>
   <div className="mt-4 text-sm text-gray-600">
            Tip: Use the "Regenerate" button to produce a new planner set. Use the "copy" to use the same to send without downloading.
          </div>
                  </div>

    <div className="relative rounded-2xl shadow-lg border border-white/10 mt-2 w-full overflow-hidden bg-gradient-to-br from-gray-900 via-slate-800 to-black">
  {/* Loading State */}
  {loading && (
    <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md bg-black/40 z-20">
      <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-white mt-4 text-sm opacity-80">Generating AI output...</p>
    </div>
  )}

  {/* Canvas Wrapper */}
  <div className="p-2 flex justify-center items-center min-h-[60vh]">
    <div
      className="relative flex justify-center items-center w-full"
      style={{ maxHeight: "80vh" }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          display: "block",
          borderRadius: "12px",
          width: "100%",
          height: "auto",
          objectFit: "contain",
          maxHeight: "80vh",
          transition: "filter 0.5s ease, opacity 0.5s ease",
          filter: loading ? "blur(10px)" : "blur(0)",
          opacity: loading ? 0.5 : 1,
        }}
      />
    </div>
  </div>

  {/* Optional subtle glow border */}
  <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 pointer-events-none"></div>
</div>


      </div>
    </div>
  );
}
