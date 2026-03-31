import { useRef, useState } from "react";

export default function CanvasInvoice() {
  const canvasRef = useRef(null);
const [width] = useState(600);
  const [height] = useState(1200);

 const storedGym = JSON.parse(localStorage.getItem("selectedGymai"));
  
 
  const [data, setData] = useState({
    gym: storedGym?.GymName,
    address: storedGym?.Location,
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
const removeLastItem = () => {
  if (data.items.length === 0) return;

  setData({
    ...data,
    items: data.items.slice(0, -1),
  });
};
const drawInvoice = () => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  const DPR = Math.min(window.devicePixelRatio, 2);

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
  const headerHeight = 120;

  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, "#4f46e5");
  gradient.addColorStop(1, "#06b6d4");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, headerHeight);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 30px Arial";
  ctx.fillText(data.gym, padding, 70);

  ctx.font = "14px Arial";
  ctx.fillText(data.address, padding, 95);

  // Right side invoice meta
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
  const cardHeight = 100;

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
  ctx.fillText(data.mobile, cardX + 20, cardY + 75);

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
  const totalBoxWidth = 220;
  const totalBoxHeight = 70;

  const totalX = width - padding - totalBoxWidth;

  ctx.fillStyle = "#4f46e5";
  ctx.fillRect(totalX, y, totalBoxWidth, totalBoxHeight);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 16px Arial";
  ctx.fillText("Total", totalX + 20, y + 30);

  ctx.font = "bold 20px Arial";
  ctx.fillText(totalAmount, totalX + 20, y + 55);

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
 <button onClick={removeLastItem} className="text-blue-600 text-sm">
          - Remove Item
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