import { useEffect, useRef, useState } from "react";
import { analyzeFrame } from "./analyzers/speedAnalyzer";

export default function CameraRecorder() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunks = useRef([]);

  const [recordedUrl, setRecordedUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [speeds, setSpeeds] = useState([]);

  // 🎛 user-selected options
  const [fps, setFps] = useState(60);
  const [resolution, setResolution] = useState("720p");

  // resolution map
  const RES_MAP = {
    "480p": { width: 640, height: 480 },
    "720p": { width: 1280, height: 720 },
    "1080p": { width: 1920, height: 1080 },
  };

  // 🎥 start / restart camera
  useEffect(() => {
    let stream;

    const startCamera = async () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }

      const { width, height } = RES_MAP[resolution];

      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          frameRate: { ideal: fps },
          width: { ideal: width },
          height: { ideal: height },
        },
        audio: false,
      });

      videoRef.current.srcObject = stream;
    };

    startCamera().catch(console.error);

    return () => stream?.getTracks().forEach(t => t.stop());
  }, [fps, resolution]);

  // ▶️ start recording
  const startRecording = () => {
    chunks.current = [];
    setSpeeds([]);
    setRecordedUrl(null);

    const stream = videoRef.current.srcObject;
    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: "video/webm; codecs=vp9",
      videoBitsPerSecond: resolution === "1080p" ? 8_000_000 : 4_000_000,
    });

    mediaRecorderRef.current.ondataavailable = e => chunks.current.push(e.data);
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setRecordedUrl(url);
      analyzeVideo(url);
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);

    setTimeout(() => {
      if (mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    }, 5000);
  };

  // 📈 analyze video
  const analyzeVideo = (url) => {
    setIsAnalyzing(true);
    setSpeeds([]);

    const video = document.createElement("video");
    video.src = url;
    video.play();

    const loop = () => {
      if (video.ended) {
        setIsAnalyzing(false);
        return;
      }

      const speed = analyzeFrame(video, canvasRef.current);
      if (speed > 0) {
        setSpeeds(prev => [...prev, +speed.toFixed(1)]);
      }

      requestAnimationFrame(loop);
    };

    loop();
  };

  return (
    <div style={{ maxWidth: 650, margin: "auto", fontFamily: "sans-serif" }}>
      <h2>Ball Speed Recorder</h2>

      {/* 🎛 Controls */}
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <label>
          FPS:
          <select value={fps} onChange={e => setFps(+e.target.value)}>
            <option value={30}>30</option>
            <option value={60}>60</option>
            <option value={120}>120</option>
          </select>
        </label>

        <label>
          Quality:
          <select value={resolution} onChange={e => setResolution(e.target.value)}>
            <option value="480p">480p</option>
            <option value="720p">720p</option>
            <option value="1080p">1080p</option>
          </select>
        </label>
      </div>

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ width: "100%", borderRadius: 10, border: "2px solid #333" }}
      />

      <button
        onClick={startRecording}
        disabled={isRecording || isAnalyzing}
        style={{ marginTop: 10, padding: 10, fontWeight: "bold" }}
      >
        Start (Auto Record + Analyze)
      </button>

      <canvas
        ref={canvasRef}
        width={640}
        height={360}
        style={{ marginTop: 20, width: "100%", border: "1px solid #333" }}
      />

      {speeds.length > 0 && (
        <>
          <h3>Detected Speeds (km/h)</h3>
          <ul>
            {speeds.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </>
      )}
    </div>
  );
}
