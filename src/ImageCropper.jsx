import React, { useState, useRef, useEffect } from "react";

export default function ImageCropper({ file, onCrop, onCancel }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  const CROP_WIDTH = 450;
  const CROP_HEIGHT = 800;

  // Load the file as Data URL
  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result);
    reader.readAsDataURL(file);
  }, [file]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imgRef.current;
    if (!ctx || !img || !img.complete) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaledWidth = img.width * zoom;
    const scaledHeight = img.height * zoom;
    const imgX = canvas.width / 2 - scaledWidth / 2 + imageOffset.x;
    const imgY = canvas.height / 2 - scaledHeight / 2 + imageOffset.y;

    ctx.drawImage(img, imgX, imgY, scaledWidth, scaledHeight);

    const cropX = canvas.width / 2 - CROP_WIDTH / 2;
    const cropY = canvas.height / 2 - CROP_HEIGHT / 2;

    // Dim outside crop
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.rect(cropX, cropY, CROP_WIDTH, CROP_HEIGHT);
    ctx.fill("evenodd");

    // Draw crop border
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.strokeRect(cropX, cropY, CROP_WIDTH, CROP_HEIGHT);
  };

  useEffect(() => drawCanvas(), [imageSrc, zoom, imageOffset]);

  const handlePointerDown = (x, y) => {
    setIsDragging(true);
    setStartDrag({ x, y });
  };
  const handlePointerMove = (x, y) => {
    if (!isDragging) return;
    const dx = x - startDrag.x;
    const dy = y - startDrag.y;
    setImageOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    setStartDrag({ x, y });
  };
  const handlePointerUp = () => setIsDragging(false);

  const handleCropClick = () => {
    const canvas = document.createElement("canvas");
    canvas.width = CROP_WIDTH;
    canvas.height = CROP_HEIGHT;
    const ctx = canvas.getContext("2d");
    const img = imgRef.current;
    if (!img) return;

    const scaledWidth = img.width * zoom;
    const scaledHeight = img.height * zoom;
    const imgX = canvasRef.current.width / 2 - scaledWidth / 2 + imageOffset.x;
    const imgY = canvasRef.current.height / 2 - scaledHeight / 2 + imageOffset.y;

    const sx = (canvasRef.current.width / 2 - CROP_WIDTH / 2 - imgX) / zoom;
    const sy = (canvasRef.current.height / 2 - CROP_HEIGHT / 2 - imgY) / zoom;
    const sWidth = CROP_WIDTH / zoom;
    const sHeight = CROP_HEIGHT / zoom;

    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, CROP_WIDTH, CROP_HEIGHT);

    const croppedImage = new Image();
    croppedImage.onload = () => onCrop(croppedImage); // return to parent
    croppedImage.src = canvas.toDataURL();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-4 flex flex-col items-center space-y-4">
        {imageSrc && (
          <>
            <canvas
              ref={canvasRef}
              width={900}
              height={1200}
              className="w-full max-w-[90vw] max-h-[80vh] h-auto border"
              onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
              onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={(e) =>
                handlePointerDown(e.touches[0].clientX, e.touches[0].clientY)
              }
              onTouchMove={(e) =>
                handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)
              }
              onTouchEnd={handlePointerUp}
            />
            <img src={imageSrc} ref={imgRef} alt="source" className="hidden" />
            <div className="flex flex-col space-y-2 w-full max-w-[90vw] mt-2">
              <label>
                Zoom: {zoom.toFixed(2)}
                <input
                  type="range"
                  min={0.1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full"
                />
              </label>
            </div>
            <div className="flex space-x-4 mt-2">
              <button
                onClick={handleCropClick}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Crop & Use
              </button>
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
