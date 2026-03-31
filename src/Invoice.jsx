import { useRef, useState } from "react";

export default function CanvasInvoice() {
  const canvasRef = useRef(null);
const [width] = useState(600);
  const [height] = useState(1200);
  const [data, setData] = useState({
    gym: "FitoX AI Fitness",
    address: "Your Gym Address",
    client: "",
    mobile: "",
    date: new Date().toISOString().split("T")[0],
    receipt: "INV-" + Math.floor(Math.random() * 100000),
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

const drawInvoice = () => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  const DPR = Math.min(window.devicePixelRatio, 2);

  // ✅ A4 ratio (scaled down for performance)
  const width = 794;   // A4 @ 96 DPI
  const height = 1123;

  canvas.width = width * DPR;
  canvas.height = height * DPR;

  // ✅ Responsive display
  canvas.style.width = "100%";
  canvas.style.height = "auto";

  ctx.scale(DPR, DPR);

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // 🔥 Padding & layout
  const padding = 40;
  let y = 60;

  // Header
  ctx.fillStyle = "#000";
  ctx.font = "bold 28px Arial";
  ctx.fillText("FitoX AI Fitness", padding, y);

  y += 30;
  ctx.font = "14px Arial";
  ctx.fillText("Gym Address Here", padding, y);

  // Line
  y += 20;
  ctx.beginPath();
  ctx.moveTo(padding, y);
  ctx.lineTo(width - padding, y);
  ctx.stroke();

  // Client Info
  y += 40;
  ctx.fillText(`Client: John Doe`, padding, y);
  ctx.fillText(`Mobile: 9876543210`, padding, y + 20);

  ctx.fillText(`Date: 31-03-2026`, width - 250, y);
  ctx.fillText(`Receipt: INV-1234`, width - 250, y + 20);

  // Table Header
  y += 60;
  ctx.font = "bold 16px Arial";

  ctx.fillText("Item", padding, y);
  ctx.fillText("Qty", width / 2, y);
  ctx.fillText("Price", width / 2 + 80, y);
  ctx.fillText("Total", width - 120, y);

  y += 20;

  ctx.font = "14px Arial";

  // Example row
  ctx.fillText("Workout Plan", padding, y);
  ctx.fillText("1", width / 2, y);
  ctx.fillText("1000", width / 2 + 80, y);
  ctx.fillText("1000", width - 120, y);

  // Total
  y += 60;
  ctx.font = "bold 20px Arial";
  ctx.fillText("Total: ₹1000", width - 200, y);

  // Footer
  y += 80;
  ctx.font = "14px Arial";
  ctx.fillText("Thank you 💪", padding, y);
};

  const downloadImage = () => {
    const link = document.createElement("a");
    link.download = "invoice.png";
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 p-6">

      {/* FORM */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-bold mb-3">Invoice Details</h2>

        <input
          placeholder="Gym Name"
          value={data.gym}
          onChange={(e) => setData({ ...data, gym: e.target.value })}
          className="w-full border p-2 mb-2"
        />

        <input
          placeholder="Address"
          value={data.address}
          onChange={(e) => setData({ ...data, address: e.target.value })}
          className="w-full border p-2 mb-2"
        />

        <input
          placeholder="Client Name"
          value={data.client}
          onChange={(e) => setData({ ...data, client: e.target.value })}
          className="w-full border p-2 mb-2"
        />

        <input
          placeholder="Mobile"
          value={data.mobile}
          onChange={(e) => setData({ ...data, mobile: e.target.value })}
          className="w-full border p-2 mb-2"
        />

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

        <button onClick={addItem} className="text-blue-600 text-sm">
          + Add Item
        </button>

        <div className="flex gap-2 mt-4">
          <button
            onClick={drawInvoice}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Generate
          </button>

          <button
            onClick={downloadImage}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Download PNG
          </button>
        </div>
      </div>

      {/* CANVAS PREVIEW */}
      <div className="relative rounded-2xl shadow-lg border border-white/10 mt-2 w-full overflow-hidden bg-gradient-to-br from-gray-900 via-slate-800 to-black">
  {/* Loading State */}
  {/* {loading && (
    <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md bg-black/40 z-20">
      <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-white mt-4 text-sm opacity-80">Generating AI output...</p>
    </div>
  )} */}

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