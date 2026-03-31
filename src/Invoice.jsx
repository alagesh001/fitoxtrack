import { useRef, useState,useEffect } from "react";

export default function CanvasInvoice() {
  const canvasRef = useRef(null);
const [width] = useState(600);
  const [height] = useState(1200);
  const [loading, setLoading] = useState(true);

const [storedGym, setStoredGym] = useState(() =>
  JSON.parse(localStorage.getItem("selectedGymai"))
);useEffect(() => {
  if (!storedGym?.Id) return;

  const key = `invoiceSettings_${storedGym.Id}`;
  const saved = localStorage.getItem(key);

  if (saved) {
    const parsed = JSON.parse(saved);

    setData((prev) => ({
      ...prev,
      ...parsed,
    }));
  }
}, [storedGym]);
 const receiptNo = 1001;

  const [data, setData] = useState({
    gym: storedGym?.GymName,
    address: storedGym?.Location,
    client: "",
    mobile: "",  
        c_address: "",  
c_paid:"",
    gstNumber: "",
    gst: 5,
    logo: null,
    saveOnCreate: true,
     isGstEnabled: false,
  isGstIncluded: false,
    date: new Date().toISOString().split("T")[0],
    receiptNo,
    receipt: "REC-" + receiptNo,
    items: [{ name: "", price: 0, qty: 1 }],
  });

  const updateItem = (i, field, value) => {
    const updated = [...data.items];
    updated[i][field] = value;
    setData({ ...data, items: updated });
  };

  const addItem = () => {
    setData({
      ...data,
      items: [...data.items, { name: "", price: 0, qty: 1 }],
    });
  };
const removeLastItem = () => {
  if (data.items.length === 0) return;

  setData({
    ...data,
    items: data.items.slice(0, -1),
  });
};

const saveSettings = () => {
  if (!storedGym?.Id) return;
const nextNo = data.receiptNo + 1;
const nextReceipt = "REC-" + nextNo;

// ✅ Update state
setData((prev) => ({
  ...prev,
  receiptNo: nextNo,
  receipt: nextReceipt,
}));

  const key = `invoiceSettings_${storedGym.Id}`;

  if (data.saveOnCreate) {

// ✅ Use SAME values for saving
const settings = {
  gstNumber: data.gstNumber,
  gst: data.gst,
  isGstEnabled: data.isGstEnabled,
  isGstIncluded: data.isGstIncluded,
  receiptNo: nextNo,
  receipt: nextReceipt,
   logo: data.logo
};

  localStorage.setItem(key, JSON.stringify(settings));

  //alert("Settings Saved ✅");
  }else{
 const existing =
    JSON.parse(localStorage.getItem(key)) || {};

  let settings = {
    ...existing, // ✅ preserve old values
    receiptNo: nextNo,
    receipt: nextReceipt,
  };

  localStorage.setItem(key, JSON.stringify(settings));

  }


};
const resizeImage = (file) =>
  new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const maxWidth = 150; // 🔥 control size here
      const scale = maxWidth / img.width;

      canvas.width = maxWidth;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // compress (0.7 = good balance)
      const compressed = canvas.toDataURL("image/png", 1.0);

      resolve(compressed);
    };

    reader.readAsDataURL(file);
  });
  useEffect(() => {
    
handleCreateInvoice(false);
           // stop loader
     }, []);
const handleCreateInvoice = (value=true) => {
  // 👉 your existing invoice logic here
 setLoading(true);
 if(value){
    saveSettings();
}
  
  setTimeout(() => {
drawInvoice();
      setLoading(false);        // stop loader
    }, 2000);
  // continue invoice generation...
};
const drawInvoice = async() => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

const DPR = Math.max(window.devicePixelRatio, 3); // 🔥 higher quality
  const width = 794;
  const height = 1123;

  canvas.width = width * DPR;
  canvas.height = height * DPR;

  canvas.style.width = "100%";
  canvas.style.height = "auto";

  ctx.scale(DPR, DPR);

  // Background
  ctx.fillStyle = "#f5f7fb";
  ctx.fillRect(0, 0, width, height);

  const padding = 40;
  let y = 0;

  // ================= HEADER =================
  let headerHeight = 120;

  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, "#4f46e5");
  gradient.addColorStop(1, "#06b6d4");

  ctx.fillStyle = gradient;
  if (data.gstNumber && data.gstNumber.trim() !== "") {
  ctx.fillRect(0, 0, width, headerHeight + 25);
headerHeight += 25;
  }
      ctx.fillRect(0, 0, width, headerHeight);

 let headerY = 70;
let textX = padding;

// 🔥 Logo aligned with text
if (data.logo) {
  const img = new Image();
  img.src = data.logo;

  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const logoSize = 60;

  // Align logo top with text
  const logoY = headerY - 30; // adjust based on font size

  ctx.drawImage(img, padding, logoY, logoSize, logoSize);

  // shift text right
  textX += logoSize + 20;
}

// Gym Name
ctx.fillStyle = "#fff";
ctx.font = "bold 30px Arial";
ctx.fillText(data.gym, textX, headerY);

// Address
headerY += 25;
ctx.font = "14px Arial";
ctx.fillText(data.address, textX, headerY);

// GST
if (data.gstNumber && data.gstNumber.trim() !== "") {
  headerY += 20;
  ctx.fillText(`GSTIN: ${data.gstNumber}`, textX, headerY);
}
ctx.textAlign = "right";
  ctx.font = "bold 16px Arial";
  ctx.fillText("RECEIPT", width - padding, 50);

  ctx.font = "13px Arial";
  ctx.fillText(data.receipt, width - padding, 75);
  ctx.fillText(data.date, width - padding, 95);

  ctx.textAlign = "left";

  y = headerHeight + 30;

  // ================= CARD (CLIENT INFO) =================
  const cardX = padding;
  const cardY = y;
  const cardWidth = width - padding * 2;
  const cardHeight = 120;

  // shadow
  ctx.shadowColor = "rgba(0,0,0,0.08)";
  ctx.shadowBlur = 10;

  ctx.fillStyle = "#fff";
  ctx.fillRect(cardX, cardY, cardWidth, cardHeight);

  ctx.shadowBlur = 0;

  ctx.fillStyle = "#000";
  ctx.font = "bold 16px Arial";
  ctx.fillText("Billed To:", cardX + 20, cardY + 30);

  ctx.font = "14px Arial";
  ctx.fillText(data.client, cardX + 20, cardY + 55);
    ctx.fillText(data.c_address, cardX + 20, cardY + 75);

  ctx.fillText(data.mobile, cardX + 20, cardY + 95);

  y += cardHeight + 40;

  // ================= TABLE =================
  const tableX = padding;
  const tableWidth = width - padding * 2;
  const rowHeight = 40;

  // Header row
  ctx.fillStyle = "#eef2ff";
  ctx.fillRect(tableX, y, tableWidth, rowHeight);

  ctx.fillStyle = "#000";
  ctx.font = "bold 14px Arial";

  ctx.fillText("Item", tableX + 20, y + 25);
  ctx.fillText("Qty", tableX + tableWidth / 2, y + 25);
  ctx.fillText("Price", tableX + tableWidth / 2 + 80, y + 25);
  ctx.fillText("Total", tableX + tableWidth - 100, y + 25);

  y += rowHeight;

  // Row
  ctx.font = "14px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillRect(tableX, y, tableWidth, rowHeight);

  ctx.fillStyle = "#000";
ctx.font = "14px Arial";

let totalAmount = 0;

data.items.forEach((item, index) => {
  const rowY = y + index * rowHeight;

  const itemTotal = item.qty * item.price;
  totalAmount += itemTotal;

  // Row background (alternate color)
  ctx.fillStyle = index % 2 === 0 ? "#ffffff" : "#f9fafb";
  ctx.fillRect(tableX, rowY, tableWidth, rowHeight);

  ctx.fillStyle = "#000";

  ctx.fillText(item.name || "Item", tableX + 20, rowY + 25);
  ctx.fillText(item.qty.toString(), tableX + tableWidth / 2, rowY + 25);
  ctx.fillText(item.price.toString(), tableX + tableWidth / 2 + 80, rowY + 25);
  ctx.fillText(itemTotal.toString(), tableX + tableWidth - 100, rowY + 25);
  
});
const tableHeight = rowHeight * (data.items.length + 1); // + header
  // Table borders
 ctx.strokeStyle = "#e5e7eb";
ctx.strokeRect(tableX, y - rowHeight, tableWidth, tableHeight);

y += rowHeight * data.items.length + 50;
  // ================= TOTAL BOX =================
// ===== CALCULATIONS =====
// ===== CALCULATIONS =====
let baseAmount = totalAmount; // total from items
let subtotal = baseAmount;
let gstAmount = 0;
let finalTotal = baseAmount;

if (data.isGstEnabled) {
  const gstRate = Number(data.gst) || 0;

  if (data.isGstIncluded) {
    // GST already included in total
    gstAmount = baseAmount - baseAmount / (1 + gstRate / 100);
    subtotal = baseAmount - gstAmount;
    finalTotal = baseAmount; // already includes GST
  } else {
    // GST extra
    gstAmount = (baseAmount * gstRate) / 100;
    subtotal = baseAmount;
    finalTotal = baseAmount + gstAmount;
  }
}
const paidAmount = Number(data.c_paid) || 0;
const dueAmount = finalTotal - paidAmount;
// ===== BOX SIZE =====
const lineHeight = 24;
let lines = 5; // Subtotal + Total

if (data.isGstEnabled) lines += 1;

const totalBoxWidth = 250;
const totalBoxHeight = lines * lineHeight + 30;

const totalX = width - padding - totalBoxWidth;

// ===== BOX BACKGROUND =====
ctx.fillStyle = "#4f46e5";
ctx.fillRect(totalX, y, totalBoxWidth, totalBoxHeight);

// ===== TEXT STYLE =====
ctx.fillStyle = "#fff";
ctx.font = "14px Arial";

let textY = y + 25;

// Subtotal
ctx.fillText(
  `Subtotal: ₹${subtotal.toFixed(2)}`,
  totalX + 20,
  textY
);

// GST
if (data.isGstEnabled) {
  textY += lineHeight;
  ctx.fillText(
    `GST (${data.gst}%): ₹${gstAmount.toFixed(2)}`,
    totalX + 20,
    textY
  );
}

// Divider
textY += lineHeight;

ctx.beginPath();
ctx.moveTo(totalX + 15, textY - 10);
ctx.lineTo(totalX + totalBoxWidth - 15, textY - 10);
ctx.strokeStyle = "rgba(255,255,255,0.6)";
ctx.lineWidth = 1;
ctx.stroke();

// Final Total
ctx.font = "bold 18px Arial";
ctx.fillText(
  `Total: ₹${finalTotal.toFixed(2)}`,
  totalX + 20,
  textY +15
);


// Paid
// Paid
textY += lineHeight;

textY += lineHeight;

// Label (left)
ctx.fillText("Paid:", totalX + 20, textY + 10);

// Amount (right aligned)
ctx.textAlign = "right";
ctx.fillText(
  `₹${paidAmount.toFixed(2)}`,
  totalX + totalBoxWidth - 20,
  textY + 10
);

ctx.textAlign = "left";

// Due
textY += lineHeight;

ctx.font = "bold 14px Arial";

// Label
ctx.fillText("Due:", totalX + 20, textY + 10);

// Amount (right aligned)
ctx.textAlign = "right";
ctx.fillText(
  `₹${dueAmount.toFixed(2)}`,
  totalX + totalBoxWidth - 20,
  textY + 10
);

ctx.textAlign = "left";
  y += totalBoxHeight + 80;

  // ================= FOOTER =================
  ctx.fillStyle = "#6b7280";
  ctx.font = "13px Arial";
ctx.fillText(
  `Thank you for choosing ${data.gym}, ${data.address} 💪`,
  padding,
  y
);
ctx.textAlign = "right";
  ctx.fillStyle = "#b4b6b9";

const centerX = width - 20 ;
const bottomY = height - 30; // adjust margin if needed
ctx.fillText("Powered by Fitox ❤️", centerX, bottomY);
};

  const downloadImage = () => {
    const link = document.createElement("a");
    //   // 🔥 Short Gym Name
  const shortGym = (data.gym || "Gym")
    .split(" ")[0]
    .replace(/[^a-zA-Z0-9]/g, "");

  // 🔥 Invoice Number
const invoiceNo = getPreviousReceipt(data.receipt);
  // 🔥 Short Location (first word)
  const shortLocation = (data.address || "Location")
    .split(",")[0] // take first part
    .split(" ")[0] // first word
    .replace(/[^a-zA-Z0-9]/g, "");

  // 🔥 Final File Name
  const fileName = `${shortGym}_${shortLocation}_${invoiceNo}.png`;

    link.download = fileName;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };
  const getPreviousReceipt = (receipt) => {
  const num = parseInt(receipt.replace(/\D/g, "")) || 1;
  return "REC-" + (num - 1);
};
// const downloadPDF = () => {
//   const canvas = canvasRef.current;

// const imgData = canvas.toDataURL("image/jpeg", 0.7); // 🔥 huge reduction
//   const pdf = new jsPDF("p", "pt", "a4");

//   const pageWidth = pdf.internal.pageSize.getWidth();
//   const pageHeight = pdf.internal.pageSize.getHeight();

//   pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);

//   // 🔥 Short Gym Name
//   const shortGym = (data.gym || "Gym")
//     .split(" ")[0]
//     .replace(/[^a-zA-Z0-9]/g, "");

//   // 🔥 Invoice Number
// const invoiceNo = getPreviousReceipt(data.receipt);
//   // 🔥 Short Location (first word)
//   const shortLocation = (data.address || "Location")
//     .split(",")[0] // take first part
//     .split(" ")[0] // first word
//     .replace(/[^a-zA-Z0-9]/g, "");

//   // 🔥 Final File Name
//   const fileName = `${shortGym}_${shortLocation}_${invoiceNo}.pdf`;

//   pdf.save(fileName);
// };
  return (
    <div className="grid md:grid-cols-2 gap-6 p-6">

      {/* FORM */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-bold mb-3">Receipt Details</h2>
<div className="mb-4">
  <label className="block text-sm font-medium mb-2">
    Upload Logo
  </label>

  <div className="flex items-center gap-4">

    {/* Preview */}
    {data.logo ? (
      <img
        src={data.logo}
        alt="logo"
        className="w-16 h-16 object-cover rounded-lg border"
      />
    ) : (
      <div className="w-16 h-16 flex items-center justify-center border rounded-lg text-gray-400">
        Logo
      </div>
    )}

    {/* Upload Button */}
   <label className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition">
  Upload
  <input
    type="file"
    accept="image/*"
    hidden
    onChange={async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const resized = await resizeImage(file);

      setData((prev) => ({
        ...prev,
        logo: resized,
      }));
    }}
  />
</label>
    {/* Remove Button */}
    {data.logo && (
      <button
        onClick={() =>
          setData((prev) => ({ ...prev, logo: null }))
        }
        className="text-red-500 text-sm hover:underline"
      >
        Remove
      </button>
    )}
  </div>
</div>

        <input
          placeholder="Client Name"
          value={data.client}
          onChange={(e) => setData({ ...data, client: e.target.value })}
          className="w-full border p-2 mb-2"
        />
  <input
          placeholder="Client Address"
          value={data.c_address}
          onChange={(e) => setData({ ...data, c_address: e.target.value })}
          className="w-full border p-2 mb-2"
        />
        <input
          placeholder="Mobile"
          value={data.mobile}
          onChange={(e) => setData({ ...data, mobile: e.target.value })}
          className="w-full border p-2 mb-2"
        />
         
          <input
          placeholder="GSTIN"
          value={data.gstNumber}
          onChange={(e) => setData({ ...data, gstNumber: e.target.value })}
          className="w-full border p-2 mb-2"
        />
        
 <div className="border p-3 rounded mb-3">

  {/* GST Enable */}
  <label className="flex items-center gap-2 mb-2">
    <input
      type="checkbox"
      checked={data.isGstEnabled}
      onChange={(e) =>
        setData({ ...data, isGstEnabled: e.target.checked })
      }
    />
    Apply GST
  </label>

  {/* GST Rate (only show if enabled) */}
  {data.isGstEnabled && (
    <input
      type="number"
      placeholder="GST % (e.g. 18)"
      value={data.gst}
      onChange={(e) =>
        setData({ ...data, gst: e.target.value })
      }
      className="w-full border p-2 mb-2"
    />
  )}

  {/* Inclusive Checkbox */}
  {data.isGstEnabled && (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={data.isGstIncluded}
        onChange={(e) =>
          setData({ ...data, isGstIncluded: e.target.checked })
        }
      />
      GST Included in Price
    </label>
  )}
</div>
        <div className="flex gap-2 mb-2">
          <input
            type="date"
            value={data.date}
            onChange={(e) => setData({ ...data, date: e.target.value })}
            className="border p-2 w-full"
          />

          <input
            value={data.receipt}
            onChange={(e) => setData({ ...data, receipt: e.target.value })}
            className="border p-2 w-full"
          />
        </div>

        {data.items.map((item, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              placeholder="Item"
              value={item.name}
              onChange={(e) => updateItem(i, "name", e.target.value)}
              className="border p-2 w-full"
            />
            <input
              type="number"
              placeholder="Price"
              value={item.price}
              onChange={(e) =>
                updateItem(i, "price", Number(e.target.value))
              }
              className="border p-2 w-24"
            />
            <input
              type="number"
              value={item.qty}
              onChange={(e) =>
                updateItem(i, "qty", Number(e.target.value))
              }
              className="border p-2 w-16"
            />
          </div>
        ))}

       <div className="flex  gap-2">
  <button onClick={addItem} className="text-blue-600 text-sm">
    + Add Item
  </button>

  <button onClick={removeLastItem} className="text-red-600 text-sm">
    − Remove Item
  </button>
</div>
<input
          placeholder="Total Paid"
          value={data.c_paid}
          onChange={(e) => setData({ ...data, c_paid: e.target.value })}
          className="w-full border p-2 mb-2 mt-4"
        />
<label className="flex items-center gap-2 mt-2">
  <input
    type="checkbox"
    checked={data.saveOnCreate}
    onChange={(e) =>
      setData({ ...data, saveOnCreate: e.target.checked })
    }
  />
  Save details
</label>
       <div className="flex gap-3 mt-4">
  <button
    onClick={handleCreateInvoice}
    className="bg-blue-500 text-white px-5 py-2 rounded-lg 
               shadow-md hover:bg-blue-600 
               active:scale-95 transition-all duration-150"
  >
    Generate
  </button>

  <button
    onClick={downloadImage}
    className="bg-green-500 text-white px-5 py-2 rounded-lg 
               shadow-md hover:bg-green-600 
               active:scale-95 transition-all duration-150"
  >
    Download
  </button>
</div>
      </div>

      {/* CANVAS PREVIEW */}
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
 <div className="w-full max-w-md mx-auto bg-white shadow p-2">
  <canvas
    ref={canvasRef}
    className="w-full h-auto rounded"
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
</div>


  {/* Optional subtle glow border */}
  <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 pointer-events-none"></div>
</div>
    </div>
  );
}