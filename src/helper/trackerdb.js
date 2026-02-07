const DB_NAME = "PoseRecorderDB";
const DB_VERSION = 1;
const STORE_NAME = "trainerSessions";

export function openPoseDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function saveTrainerSession(trainerFrames, fps = 30, name) {
  const db = await openPoseDB();

  const session = {
    id: crypto.randomUUID(),
    name,
    createdAt: Date.now(),
    fps,
    frames: trainerFrames,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction("trainerSessions", "readwrite");
    const store = tx.objectStore("trainerSessions");

    store.put(session);

    tx.oncomplete = () => resolve(session);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllTrainerSessions() {
  const db = await openPoseDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction("trainerSessions", "readonly");
    const store = tx.objectStore("trainerSessions");
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getPoseSessionById(id) {
  const db = await openPoseDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction("trainerSessions", "readonly");
    const store = tx.objectStore("trainerSessions");

    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}
export async function clearTrainerSessions() {
  const db = await openPoseDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction("trainerSessions", "readwrite");
    const store = tx.objectStore("trainerSessions");

    store.clear();

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}
export async function deleteTrainerSessionById(sessionId) {
  const db = await openPoseDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction("trainerSessions", "readwrite");
    const store = tx.objectStore("trainerSessions");

    // 1️⃣ check if it exists
    const getReq = store.get(sessionId);

    getReq.onsuccess = () => {
      if (!getReq.result) {
        // ❌ not in IndexedDB → built-in JSON
        resolve(false);
        return;
      }

      // 2️⃣ delete only if it exists
      store.delete(sessionId);
      resolve(true);
    };

    getReq.onerror = () => reject(getReq.error);
  });
}

export async function downloadTrainerSessionsJSON() {
  const data = await getAllTrainerSessions();

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "trainer-sessions.json";
  a.click();

  URL.revokeObjectURL(url);
}