import React, { useState,useRef,useEffect   } from "react";
import megaData from "./data/mega_diet.json"; // <-- update path if needed
import { Download } from "lucide-react";
import { useLocation,useNavigate } from "react-router-dom";

export default function MealOptionsSelector() {
  const dietTypes = ["Veg", "Nonveg", "Balanced"];
  const regionTypes = ["North Indian", "South Indian", "Both"];
  const goals = ["Balanced", "Endurance", "Weight Loss", "Muscle Gain"];
  const conditions = ["None", "Diabetes", "PCOS", "Fatty Liver"];
  const proteinPreferences = ["Any","Chicken + egg", "Without fish", "Egg only"];

  const [diet, setDiet] = useState("Veg");
  const [region, setRegion] = useState("North Indian");
  const [goal, setGoal] = useState("Balanced");
  const [condition, setCondition] = useState("None");
  const [proteinPref, setProteinPref] = useState("");
  const [result, setResult] = useState(null);
  const [width] = useState(600);
  const [height] = useState(1200);
  const showProteinOptions = diet === "Nonveg" || diet === "Balanced";
  const canvasRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fromText, setFromText] = useState("");
   const [selectedGym, setSelectedGym] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
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
const title = "Personalized Diet Chart";
const gymName = "";
const renderCanvas = () => {
  if (!result || result.length === 0) return;

  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  const DPR = 6; // Device Pixel Ratio for high-res
  const width = 900;
  const padding = 60;
  const lineHeight = 22;
  let y = padding;

  // Estimate height based on days
  // First, calculate exact height required
  let estimatedHeight = padding * 2 + 35 + 70; // title + gym name
  result.forEach((day) => {
    estimatedHeight += 28; // day header
    Object.values(day.meals).forEach((item) => {
      estimatedHeight += lineHeight + 5; // one row per meal
    });
    estimatedHeight += lineHeight + 20; // daily macros
  });

  // Set canvas size in device pixels
  canvas.width = width * DPR;
  canvas.height = estimatedHeight * DPR;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${estimatedHeight}px`;

  // Scale context to handle high DPI
  ctx.scale(DPR, DPR);

  // Background
  ctx.fillStyle = "#fefefe";
  ctx.fillRect(0, 0, width, estimatedHeight);




   ctx.textAlign = 'left';

ctx.font = `700 16px 'Poppins', sans-serif`;
    ctx.fillStyle = '#d11717ff';
    ctx.fillText(`Name: ${name}`, 60, y);
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
  ctx.fillText(`${dateStr} • ${timeStr}`, width - 60, y);
  y += 35;
    // header
    ctx.fillStyle = '#0957f3ff';
    ctx.font = `700 28px 'Poppins', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(title, width/2, y);
y += 35;
    // from label
    ctx.font = `500 14px 'Poppins', sans-serif`;
    ctx.fillStyle = '#0c0c0cff';
    ctx.fillText(`From ${fromText}`, width/2, y);
  y += 35;

ctx.textAlign = 'start';

  

  result.forEach((day) => {
    // Day header
    ctx.fillStyle = "#111827";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(day.day, padding, y);
    y += 28;

    Object.entries(day.meals).forEach(([meal, item]) => {
      // Meal header box
      ctx.fillStyle = "#2563eb";
      ctx.fillRect(padding, y - 15, 150, 22);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText(meal.toUpperCase(), padding + 5, y);

      if (!item) {
        ctx.fillStyle = "red";
        ctx.fillText("No match found", padding + 160, y);
      } else {
        ctx.fillStyle = "#111827";
        ctx.font = "14px sans-serif";
        ctx.fillText(item.name, padding + 160, y);

       // Macros in columns
        // ctx.fillStyle = "#1a1a1aff"; // calories green
        // ctx.fillText(`per 100g`, padding + 350, y);
        // ctx.fillStyle = "#059669"; // calories green
        // ctx.fillText(`${item.c}kcal`, padding + 450, y);
        // ctx.fillStyle = "#f59e0b"; // protein yellow
        // ctx.fillText(`Protein: ${item.p}`, padding + 520, y);
        // ctx.fillStyle = "#3b82f6"; // carbs blue
        // ctx.fillText(`Carbs: ${item.cb}`, padding + 620, y);
        // ctx.fillStyle = "#ef4444"; // fat red
        // ctx.fillText(`Fat: ${item.f}`, padding + 720, y);
      }
      y += lineHeight + 5;
    });

    // Daily macros summary
    // ctx.fillStyle = "#111827";
    // ctx.font = "bold 16px sans-serif";
    // ctx.fillText("Daily Macros:", padding, y);

    const macroX = padding + 160;
    // ctx.fillStyle = "#059669";
    // ctx.fillText(`Calories: ${day.macros.c}`, macroX, y);
    // ctx.fillStyle = "#f59e0b";
    // ctx.fillText(`Protein: ${day.macros.p}`, macroX + 70, y);
    // ctx.fillStyle = "#3b82f6";
    // ctx.fillText(`Cb: ${day.macros.cb}`, macroX + 140, y);
    // ctx.fillStyle = "#ef4444";
    // ctx.fillText(`F: ${day.macros.f}`, macroX + 210, y);

    y += lineHeight + 20;

   
    
  });
 // footer small
    ctx.font = `400 12px 'Poppins', sans-serif`;
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'center';
    ctx.fillText('Generated with ❤️ — Fitox AI Diet Chart', width/2, y+15);
  // Convert canvas to high-quality PNG
  setPreviewUrl(canvas.toDataURL("image/png", 1.0)); // 1.0 = max quality
};
  const [firstloading, setfirstLoading] = useState(true);

useEffect(() => {
  
  regenerate();
}, []);
const regenerate = () => {
    // You can add extra behavior here if needed (like animations or reset)
    if(firstloading){
      setfirstLoading(false);
    }else{
 if (loading)return;
    }
     

    setLoading(true); // optional: start loading manually before triggering
 const payload = { region, diet, proteinPref, goal };
    const result7 = generateSevenDays(payload);
    setResult(result7); 
   };

   useEffect(() => {
    const timer = setTimeout(() => {
    renderCanvas();
      setLoading(false);        // stop loader
    }, 2000);
  
    return () => clearTimeout(timer);
  }, [result]);


  const downloadPNG = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.download = `${title}.png`;
    link.href = previewUrl;
    link.click();
  };
  // -----------------------------------------------------
  // PROTEIN RULES
  // -----------------------------------------------------
function checkProteinRules(name, proteinPref) {
  const n = name.toLowerCase();

  const hasEgg = n.includes("egg") || n.includes("omelette");
  const hasChicken = n.includes("chicken");
  const hasMutton = n.includes("mutton") || n.includes("lamb");
  const hasFish = n.includes("fish") || n.includes("prawn") || n.includes("shrimp") || n.includes("crab") || n.includes("lobster");
  const hasBeef = n.includes("beef");
  const hasPork = n.includes("pork");

  const hasOtherMeat = hasMutton || hasFish || hasBeef || hasPork;
    const isVeg = !hasChicken && !hasMutton && !hasFish && !hasBeef && !hasPork && !hasEgg;


  switch (proteinPref) {
    case "Any":
      return true;

    case "Chicken + egg":
      // allow chicken or egg, but exclude other meats
  return (hasChicken || hasEgg || isVeg) && !hasOtherMeat;

    case "Egg only":
      // only egg, exclude everything else
      return hasEgg && !hasChicken && !hasOtherMeat || isVeg;

    case "Without fish":
      // allow anything except seafood
      return !hasFish ;

   

    default:
      return true;
  }
}

const DEFAULT_SERVING = {
  "Weight Loss": 250,   // eats ~300g per meal
  "Balanced":    400,
  "Muscle Gain": 500,
  "Endurance":   450,
};

// Goal-based multipliers
const goalMultipliers = {
  "Weight Loss": { c: 1.0, p: 1.0, cb: 1.0, f: 1.0 },
  "Balanced":    { c: 1.0, p: 1.0, cb: 1.0, f: 1.0 },
  "Muscle Gain": { c: 1.0, p: 1.0, cb: 1.0, f: 1.0 },
  "Endurance":   { c: 1.0, p: 1.0, cb: 1.0, f: 1.0 },
};

// Apply multiplier to a food item based on goal and grams eaten
function applyGoalMultiplier(item, goal, grams = null) {
  const mult = goalMultipliers[goal] || goalMultipliers.Balanced;
  const serving = grams || DEFAULT_SERVING[goal] || 100;
  const factor = serving / 100;

 return {
    ...item,
    c: Math.round(item.c * factor * mult.c),
    p: Math.round(item.p * factor * mult.p),
    cb: Math.round(item.cb * factor * mult.cb),
    f: Math.round(item.f * factor * mult.f),
  };
}

// Scoring function now uses scaled macros properly
function scoreFood(item, goal, grams = null) {
  // First, scale the item macros based on goal & grams
  const scaled = applyGoalMultiplier(item, goal, grams);
  const calories = scaled.c;
  const protein = scaled.p;
  const carbs = scaled.cb;
  const fat = scaled.f;

  if (goal === "Weight Loss") return protein * 2 - calories * 0.01;
  if (goal === "Muscle Gain") return protein * 2 + calories * 0.01;
  if (goal === "Endurance") return carbs * 1.5 + protein * 0.5;

  // Balanced
  return Math.round(400 - calories) * -0.01 + protein * 1 + carbs * 0.5;
}

  // Random select
 const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// -----------------------------------------------------
// MAIN MEAL GENERATOR
// -----------------------------------------------------

function generateOneDay({ region, diet, proteinPref, goal }, usedMeals) {
  const regions = region === "Both"
    ? ["north", "south"]
    : region.toLowerCase().includes("north")
      ? ["north"]
      : ["south"];

  const diets = diet === "Balanced"
    ? ["veg", "nonveg"]
    : [diet.toLowerCase()];

  const meals = ["breakfast", "lunch", "snacks", "dinner"];
  const output = {};

  meals.forEach((meal) => {
    const chosenRegion = pickRandom(regions);
    const chosenDiet = pickRandom(diets);

    let list = megaData[chosenRegion][chosenDiet][meal] || [];

    // Filter by protein preference
    let filtered = list.filter(item => checkProteinRules(item.name, proteinPref));

    // If everything is already used, allow repeated meals
    let available = filtered.filter(item => !usedMeals.has(item.name));
    if (available.length === 0) available = filtered;

    if (available.length === 0) {
      output[meal] = null; // truly no match exists
      return;
    }

    // Score and sort
    const scored = available.map(item => ({ ...item, score: scoreFood(item, goal) }));
    scored.sort((a, b) => b.score - a.score);

    // Pick one randomly from top 3
    const picked = pickRandom(scored.slice(0, Math.min(3, scored.length)));
    output[meal] = picked;

    // Track meal
    usedMeals.add(picked.name);
  });

  return output;
}

function generateSevenDays(payload) {
  const days = [];
  const usedMeals = new Set();

  for (let i = 1; i <= 7; i++) {
    const dayMeals = generateOneDay(payload, usedMeals);

    const totals = { c: 0, p: 0, cb: 0, f: 0 };
    Object.values(dayMeals).forEach((m) => {
      if (!m) return;
      totals.c += m.c;
      totals.p += m.p;
      totals.cb += m.cb;
      totals.f += m.f;
    });

    days.push({
      day: `Day ${i}`,
      meals: dayMeals,
      macros: totals,
    });
  }

  return days;
}


  // -----------------------------------------------------
  // UI BELOW
  // -----------------------------------------------------

  return (
 
    <div className="max-w-3xl mx-auto p-4 md:p-6 bg-white/80 backdrop-blur rounded-2xl shadow-lg">
                    {showAuthBlock && (
<div className="px-10 fixed inset-0 bg-black bg-opacity-70 flex items-start justify-center z-[9999]">
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

     <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-gray-800">
    <span className="bg-blue-600 text-white text-sm px-2 py-1 rounded-md">Fitox AI</span>
   Diet Chart
  </h2>
       <input
  className="border p-2 rounded w-full mt-5"
  value={name}
  onChange={(e) => setName(e.target.value)}
  placeholder="Enter name"
/>

      {/* REGION */}
      <section className="mb-6 mt-5">
        <h2 className="text-sm font-medium text-gray-600 mb-2">0 — Region</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {regionTypes.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`px-4 py-2 rounded-xl font-medium text-sm sm:text-base ${
                region === r
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </section>

      {/* DIET */}
      <section className="mb-6">
        <h2 className="text-sm font-medium text-gray-600 mb-2">1 — Diet type</h2>
        <div className="grid grid-cols-3 gap-2">
          {dietTypes.map((d) => (
            <button
              key={d}
              onClick={() => setDiet(d)}
              className={`px-4 py-2 rounded-xl font-medium text-sm ${
                diet === d
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </section>

      {/* GOAL */}
      <section className="mb-6">
        <h2 className="text-sm font-medium text-gray-600 mb-2">2 — Goal</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {goals.map((g) => (
            <div
              key={g}
              onClick={() => setGoal(g)}
              className={`cursor-pointer px-3 py-2 text-center rounded-full border text-sm ${
                goal === g
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-700 border-gray-200"
              }`}
            >
              {g}
            </div>
          ))}
        </div>
      </section>

      {/* CONDITION */}
      <section className="mb-6">
        <h2 className="text-sm font-medium text-gray-600 mb-2">
          3 — Medical / lifestyle
        </h2>
        <div className="grid grid-cols-2 sm:flex sm:gap-3 gap-2">
          {conditions.map((c) => (
            <button
              key={c}
              onClick={() => setCondition(c)}
              className={`px-3 py-2 rounded-lg text-sm ${
                condition === c ? "bg-yellow-500 text-white" : "bg-gray-50 text-gray-700"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* PROTEIN */}
      <section className="mb-6">
        <h2 className="text-sm font-medium text-gray-600 mb-2">
          4 — Protein preference
        </h2>

        {!showProteinOptions ? (
          <div className="text-sm text-gray-500">
            Protein options appear only for <b>Nonveg</b> or <b>Balanced</b>.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {proteinPreferences.map((p) => (
              <div
                key={p}
                onClick={() => setProteinPref(p)}
                className={`cursor-pointer px-3 py-2 rounded-md border text-sm text-center ${
                  proteinPref === p
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-200"
                }`}
              >
                {p}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* GENERATE BUTTON */}
      <div className="flex items-center justify-end gap-2 mt-2 col-span-1 md:col-span-2">
                  <button
            onClick={downloadPNG}
            className="p-2 rounded-md bg-green-600 hover:bg-green-700 text-white transition"
          >
            <Download className="w-5 h-5" />
          </button>
                <button
                                  onClick={() => regenerate()}

               className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
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
              </div>


      {/* <div className="mt-4">
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Meal Plan Preview"
            className="w-full border rounded-lg shadow"
          />
        )}
      </div> */}
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
  className="rounded-xl"
  style={{
    display: "block",
    maxWidth: "100%",   // 🔥 Key: allow shrink to fit width
    height: "auto",     // 🔥 Maintain aspect ratio
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
</div>      {/* RESULT */}



      <footer className="mt-6 text-xs text-gray-400 text-center">
        Fitox AI — Diet Chart.
      </footer>
    </div>
  );
}

// {result && (
//   <div className="mt-6 p-5 rounded-xl bg-gray-50 shadow">
//     <h3 className="text-xl font-bold mb-3">7-Day Meal Plan</h3>

//     {result.map((day, idx) => (
//       <div key={idx} className="mb-6 p-4 bg-white rounded-lg shadow-sm">
//         <h4 className="font-semibold text-lg mb-2">{day.day}</h4>

//         {Object.entries(day.meals).map(([meal, item]) => (
//           <div key={meal} className="mb-2">
//             <div className="font-medium capitalize">{meal}:</div>

//             {!item ? (
//               <div className="text-red-500 text-sm">No match found</div>
//             ) : (
//               <div className="text-sm text-gray-700">
//                 <b>{item.name}</b>
//                 <div>Calories: {item.c}</div>
//                 <div>Protein: {item.p}g</div>
//                 <div>Carbs: {item.cb}g</div>
//                 <div>Fat: {item.f}g</div>
//               </div>
//             )}
//           </div>
//         ))}

//         {/* Day Macros */}
//         <div className="mt-3 p-3 bg-gray-100 rounded-lg text-sm">
//           <div className="font-semibold">Daily Macro Total:</div>
//           <div>Calories: {day.macros.c}</div>
//           <div>Protein: {day.macros.p}g</div>
//           <div>Carbs: {day.macros.cb}g</div>
//           <div>Fat: {day.macros.f}g</div>
//         </div>
//       </div>
//     ))}
//   </div>
// )}


