import { useState, useEffect } from "react";

const WEIGHT_KG = 108.5;

function calcCalories(durationMin, speedKmh) {
  let MET = 5;
  if (speedKmh >= 12) MET = 13;
  else if (speedKmh >= 10) MET = 11;
  else if (speedKmh >= 8) MET = 9;
  else if (speedKmh >= 6) MET = 7;
  return Math.round(MET * WEIGHT_KG * (durationMin / 60));
}

export default function App() {
  const [logs, setLogs] = useState([]);
  const [speed, setSpeed] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("runlogs_v2");
    if (saved) setLogs(JSON.parse(saved));
  }, []);

  function save() {
    if (!speed || !time) return;

    const cal = calcCalories(Number(time), Number(speed));
    const dist = (speed * time / 60).toFixed(2);

    const newLog = {
      id: Date.now(),
      speed,
      time,
      cal,
      dist
    };

    const newLogs = [newLog, ...logs];
    setLogs(newLogs);
    localStorage.setItem("runlogs_v2", JSON.stringify(newLogs));

    setSpeed("");
    setTime("");
  }

  const totalCal = logs.reduce((s, l) => s + l.cal, 0);
  const totalDist = logs.reduce((s, l) => s + Number(l.dist), 0);

  const maxCal = Math.max(...logs.map(l => l.cal), 1);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080810",
      color: "#e0dcd0",
      fontFamily: "monospace",
      padding: 20
    }}>

      <h1 style={{
        fontSize: 40,
        color: "#f15a24",
        letterSpacing: 2
      }}>RUN TRACKER</h1>

      {/* INPUT */}
      <div style={{
        background: "#0f0f1a",
        padding: 20,
        borderRadius: 12,
        marginTop: 20
      }}>
        <input
          placeholder="speed km/h"
          value={speed}
          onChange={e => setSpeed(e.target.value)}
        />
        <input
          placeholder="minutes"
          value={time}
          onChange={e => setTime(e.target.value)}
        />

        <button onClick={save} style={{
          background: "#f15a24",
          color: "#fff",
          padding: 10,
          marginTop: 10,
          width: "100%"
        }}>
          บันทึก
        </button>
      </div>

      {/* STATS */}
      <div style={{ marginTop: 20 }}>
        <div>🔥 {totalCal} kcal</div>
        <div>📏 {totalDist.toFixed(2)} km</div>
      </div>

      {/* GRAPH */}
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 6,
        height: 120,
        marginTop: 20
      }}>
        {logs.slice(0,7).map(l => (
          <div key={l.id} style={{
            flex: 1,
            height: (l.cal / maxCal) * 100,
            background: "#f15a24"
          }} />
        ))}
      </div>

      {/* LIST */}
      <div style={{ marginTop: 20 }}>
        {logs.map(l => (
          <div key={l.id} style={{
            background: "#0f0f1a",
            padding: 10,
            marginBottom: 10,
            borderRadius: 8
          }}>
            {l.speed} km/h • {l.time} min → {l.cal} kcal
          </div>
        ))}
      </div>

    </div>
  );
}
