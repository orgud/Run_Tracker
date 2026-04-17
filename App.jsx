import { useState, useEffect } from "react";

const WEIGHT_KG = 108.5;

function calcCalories(durationMin, speedKmh) {
  let MET = 5.0;
  if (speedKmh >= 12) MET = 13.0;
  else if (speedKmh >= 10) MET = 11.0;
  else if (speedKmh >= 8) MET = 9.0;
  else if (speedKmh >= 6) MET = 7.0;
  else MET = 4.5;
  return Math.round(MET * WEIGHT_KG * (durationMin / 60));
}

function calcTotalCal(intervals) {
  return intervals.reduce((sum, iv) => sum + calcCalories(iv.duration, iv.speed), 0);
}

function calcTotalDist(intervals) {
  return intervals.reduce((sum, iv) => sum + (iv.speed * iv.duration / 60), 0);
}

const TODAY = new Date().toISOString().slice(0, 10);

export default function App() {
  const [logs, setLogs] = useState([]);
  const [tab, setTab] = useState("log");

  const [date, setDate] = useState(TODAY);
  const [intervals, setIntervals] = useState([
    { speed: "", duration: "" },
    { speed: "", duration: "" }
  ]);
  const [note, setNote] = useState("");

  // ✅ โหลดจาก localStorage
  useEffect(() => {
    const saved = localStorage.getItem("runlogs_v2");
    if (saved) setLogs(JSON.parse(saved));
  }, []);

  // ✅ เซฟลง localStorage
  function saveLogs(newLogs) {
    setLogs(newLogs);
    localStorage.setItem("runlogs_v2", JSON.stringify(newLogs));
  }

  function addInterval() {
    setIntervals(p => [...p, { speed: "", duration: "" }]);
  }

  function updateInterval(i, key, val) {
    setIntervals(p =>
      p.map((iv, idx) => idx === i ? { ...iv, [key]: val } : iv)
    );
  }

  function handleSave() {
    const valid = intervals
      .filter(iv => iv.speed && iv.duration)
      .map(iv => ({
        speed: parseFloat(iv.speed),
        duration: parseFloat(iv.duration),
      }));

    if (!valid.length) return;

    const totalCal = calcTotalCal(valid);
    const totalDist = calcTotalDist(valid);
    const totalDur = valid.reduce((s, iv) => s + iv.duration, 0);

    const entry = {
      id: Date.now(),
      date,
      intervals: valid,
      totalCal,
      totalDist: totalDist.toFixed(2),
      totalDur,
      note
    };

    const newLogs = [entry, ...logs];
    saveLogs(newLogs);

    setIntervals([
      { speed: "", duration: "" },
      { speed: "", duration: "" }
    ]);
    setNote("");
    setTab("history");
  }

  return (
    <div style={{ padding: 20, color: "#fff", background: "#111", minHeight: "100vh" }}>
      <h1>🏃 Run Tracker</h1>

      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setTab("log")}>บันทึก</button>
        <button onClick={() => setTab("history")}>ประวัติ</button>
      </div>

      {tab === "log" && (
        <div>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />

          {intervals.map((iv, i) => (
            <div key={i}>
              <input
                placeholder="speed"
                value={iv.speed}
                onChange={e => updateInterval(i, "speed", e.target.value)}
              />
              <input
                placeholder="min"
                value={iv.duration}
                onChange={e => updateInterval(i, "duration", e.target.value)}
              />
            </div>
          ))}

          <button onClick={addInterval}>+ เพิ่ม</button>

          <br /><br />
          <input
            placeholder="note"
            value={note}
            onChange={e => setNote(e.target.value)}
          />

          <br /><br />
          <button onClick={handleSave}>บันทึก</button>
        </div>
      )}

      {tab === "history" && (
        <div>
          {logs.map(l => (
            <div key={l.id} style={{ marginBottom: 10 }}>
              <b>{l.date}</b> - {l.totalCal} kcal / {l.totalDist} km
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
