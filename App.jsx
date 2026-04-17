import { useState, useEffect } from "react";

const WEIGHT = 108.5;

function calcCal(min, speed) {
  let MET = 5;
  if (speed >= 12) MET = 13;
  else if (speed >= 10) MET = 11;
  else if (speed >= 8) MET = 9;
  else if (speed >= 6) MET = 7;

  return Math.round(MET * WEIGHT * (min / 60));
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

    const cal = calcCal(Number(time), Number(speed));
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
      background: "linear-gradient(160deg,#080810,#111)",
      display: "flex",
      justifyContent: "center",
      color: "#e0dcd0",
      fontFamily: "'DM Mono', monospace"
    }}>
      <div style={{ width: "100%", maxWidth: 420, padding: 20 }}>

        {/* HEADER */}
        <h1 style={{
          fontFamily: "'Bebas Neue'",
          fontSize: 42,
          color: "#f15a24",
          letterSpacing: 3
        }}>
          RUN TRACKER
        </h1>

        {/* INPUT */}
        <div style={{
          background: "#0f0f1a",
          padding: 16,
          borderRadius: 16,
          border: "1px solid #1e1e2e",
          marginTop: 10
        }}>
          <input
            placeholder="Speed (km/h)"
            value={speed}
            onChange={e => setSpeed(e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder="Time (min)"
            value={time}
            onChange={e => setTime(e.target.value)}
            style={inputStyle}
          />

          <button onClick={save} style={btnStyle}>
            บันทึก
          </button>
        </div>

        {/* STATS */}
        <div style={card}>
          <div>🔥 {totalCal} kcal</div>
          <div>📏 {totalDist.toFixed(2)} km</div>
        </div>

        {/* GRAPH */}
        <div style={card}>
          <div style={{ marginBottom: 10 }}>7 วันล่าสุด</div>
          <div style={{
            display: "flex",
            gap: 6,
            alignItems: "flex-end",
            height: 100
          }}>
            {logs.slice(0,7).map(l => (
              <div key={l.id} style={{
                flex: 1,
                height: (l.cal / maxCal) * 100,
                background: "linear-gradient(#f15a24,#c0390a)",
                borderRadius: 4
              }} />
            ))}
          </div>
        </div>

        {/* LIST */}
        <div style={{ marginTop: 10 }}>
          {logs.map(l => (
            <div key={l.id} style={{
              background: "#0f0f1a",
              padding: 14,
              borderRadius: 12,
              marginBottom: 10,
              border: "1px solid #1e1e2e"
            }}>
              {l.speed} km/h • {l.time} min  
              <br />
              🔥 {l.cal} kcal • 📏 {l.dist} km
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: 14,
  marginBottom: 10,
  borderRadius: 10,
  border: "1px solid #333",
  background: "#111",
  color: "#fff",
  fontSize: 16
};

const btnStyle = {
  width: "100%",
  padding: 16,
  borderRadius: 12,
  background: "#f15a24",
  color: "#fff",
  border: "none",
  fontSize: 18,
  cursor: "pointer"
};

const card = {
  background: "#0f0f1a",
  padding: 16,
  borderRadius: 16,
  border: "1px solid #1e1e2e",
  marginTop: 16
};
