let prevGray = null;
let prevX = null;
let prevTime = null;

let stableCount = 0;
let lockedSpeed = null;
let lastSpeed = 0;

const PIXEL_TO_METER = 0.01;
const MIN_SPEED = 15;
const STABLE_FRAMES = 3;

export function resetAnalyzer() {
  prevGray = null;
  prevX = null;
  prevTime = null;
  stableCount = 0;
  lockedSpeed = null;
  lastSpeed = 0;
}

export function analyzeFrame(video, canvas) {
  if (lockedSpeed !== null) return lockedSpeed;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const src = cv.imread(canvas);
  const gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

  if (!prevGray) {
    prevGray = gray.clone();
    src.delete(); gray.delete();
    return 0;
  }

  // 🔥 FRAME DIFFERENCE (KEY)
  const diff = new cv.Mat();
  cv.absdiff(gray, prevGray, diff);

  const mask = new cv.Mat();
  cv.threshold(diff, mask, 25, 255, cv.THRESH_BINARY);

  // connect streaks
  const kernel = cv.getStructuringElement(
    cv.MORPH_RECT,
    new cv.Size(9, 3)
  );
  cv.morphologyEx(mask, mask, cv.MORPH_CLOSE, kernel);

  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours(mask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

  let speed = 0;

  for (let i = 0; i < contours.size(); i++) {
    const cnt = contours.get(i);
    const area = cv.contourArea(cnt);
    if (area < 80) continue;

    const rect = cv.boundingRect(cnt);

    // must be horizontal streak
    if (rect.width < rect.height * 1.5) continue;

    const cx = rect.x + rect.width / 2;
    const now = video.currentTime;

    // draw streak
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

    if (prevX !== null && prevTime !== null) {
      const dx = cx - prevX;
      if (dx > 0) { // left → right only
        const dt = now - prevTime;
        if (dt > 0) {
          speed = (dx * PIXEL_TO_METER / dt) * 3.6;

          if (speed > MIN_SPEED) {
            const stable =
              Math.abs(speed - lastSpeed) < lastSpeed * 0.3 || lastSpeed === 0;

            stable ? stableCount++ : stableCount = 0;

            if (stableCount >= STABLE_FRAMES) {
              lockedSpeed = speed;
            }

            lastSpeed = speed;

            ctx.fillStyle = "lime";
            ctx.font = "18px Arial";
            ctx.fillText(`${speed.toFixed(1)} km/h`, cx + 10, rect.y - 5);
          }
        }
      }
    }

    prevX = cx;
    prevTime = now;
    break; // track ONE object only
  }

  prevGray.delete();
  prevGray = gray.clone();

  src.delete();
  gray.delete();
  diff.delete();
  mask.delete();
  contours.delete();
  hierarchy.delete();

  return lockedSpeed ?? 0;
}
