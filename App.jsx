import { useState, useEffect } from "react";

const WEIGHT = 108.5;
const TODAY = new Date().toISOString().slice(0, 10);

function calcMET(speedKmh, incline = 0) {
  let MET;
  if (speedKmh < 6.0) {
    MET = 2.0 + (speedKmh / 6.0) * 1.5;
  } else if (speedKmh < 8.0) {
    MET = 4.0 + ((speedKmh - 6.0) / 2.0) * 2.0;
  } else if (speedKmh < 10.0) {
    MET = 8.0 + ((speedKmh - 8.0) / 2.0) * 1.5;
  } else if (speedKmh < 12.0) {
    MET = 10.0 + ((speedKmh - 10.0) / 2.0) * 1.5;
  } else {
    MET = 12.5;
  }
  MET += incline * 0.5;
  return MET;
}

function calcCal(min, speed, incline = 0) {
  if (!min || !speed) return 0;
  const MET = calcMET(Number(speed), Number(incline));
  return Math.round(MET * WEIGHT * (Number(min) / 60));
}

function calcDist(speed, min) {
  return Number(speed) * (Number(min) / 60);
}

export default function App() {
  const [logs, setLogs] = useState([]);
  const [tab, setTab] = useState("log");
  const [viewLog, setViewLog] = useState(null);

  const [date, setDate] = useState(TODAY);
  const [intervals, setIntervals] = useState([
    { speed: "", time: "", incline: "0" },
  ]);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem("runlogs_v5");
    if (s) setLogs(JSON.parse(s));
  }, []);

  function persist(newLogs) {
    setLogs(newLogs);
    localStorage.setItem("runlogs_v5", JSON.stringify(newLogs));
  }

  function update(i, key, val) {
    setIntervals((prev) =>
      prev.map((iv, idx) => (idx === i ? { ...iv, [key]: val } : iv))
    );
  }

  function removeInterval(i) {
    setIntervals((prev) => prev.filter((_, idx) => idx !== i));
  }

  const validIntervals = intervals.filter((iv) => iv.speed && iv.time);
  const previewCal = validIntervals.reduce(
    (s, iv) => s + calcCal(iv.time, iv.speed, iv.incline),
    0
  );
  const previewDist = validIntervals.reduce(
    (s, iv) => s + calcDist(iv.speed, iv.time),
    0
  );
  const previewTime = validIntervals.reduce(
    (s, iv) => s + Number(iv.time),
    0
  );

  function save() {
    if (!validIntervals.length) return;
    const newLog = {
      id: Date.now(),
      date,
      note,
      intervals: validIntervals.map((iv) => ({
        speed: Number(iv.speed),
        time: Number(iv.time),
        incline: Number(iv.incline) || 0,
        cal: calcCal(iv.time, iv.speed, iv.incline),
      })),
      totalCal: previewCal,
      totalDist: parseFloat(previewDist.toFixed(2)),
      totalTime: previewTime,
    };

    persist(
      [newLog, ...logs.filter((l) => l.date !== date)].sort((a, b) =>
        b.date.localeCompare(a.date)
      )
    );

    setIntervals([{ speed: "", time: "", incline: "0" }]);
    setNote("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setTab("history");
  }

  function deleteLog(id) {
    persist(logs.filter((l) => l.id !== id));
    setViewLog(null);
  }

  const totalCal = logs.reduce((s, l) => s + l.totalCal, 0);
  const totalDist = logs.reduce((s, l) => s + Number(l.totalDist), 0);
  const totalSessions = logs.length;
  const fatBurnt = (totalCal / 7700).toFixed(2);

  return (
    <div style={{ padding: 20, color: "#fff", background: "#111", minHeight: "100vh" }}>
      <h1>RUN LOG</h1>

      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setTab("log")}>Log</button>
        <button onClick={() => setTab("history")}>History</button>
        <button onClick={() => setTab("stats")}>Stats</button>
      </div>

      {tab === "log" && (
        <div>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

          {intervals.map((iv, i) => (
            <div key={i}>
              <input
                placeholder="speed"
                value={iv.speed}
                onChange={(e) => update(i, "speed", e.target.value)}
              />
              <input
                placeholder="time"
                value={iv.time}
                onChange={(e) => update(i, "time", e.target.value)}
              />
              <input
                placeholder="incline"
                value={iv.incline}
                onChange={(e) => update(i, "incline", e.target.value)}
              />
              <button onClick={() => removeInterval(i)}>x</button>
            </div>
          ))}

          <button onClick={() => setIntervals([...intervals, { speed: "", time: "", incline: "0" }])}>
            + add
          </button>

          <div>🔥 {previewCal} kcal</div>
          <div>📏 {previewDist.toFixed(2)} km</div>

          <button onClick={save}>{saved ? "saved!" : "save"}</button>
        </div>
      )}

      {tab === "history" && (
        <div>
          {logs.map((l) => (
            <div key={l.id}>
              <div>{l.date}</div>
              <div>{l.totalCal} kcal</div>
              <button onClick={() => deleteLog(l.id)}>delete</button>
            </div>
          ))}
        </div>
      )}

      {tab === "stats" && (
        <div>
          <div>Total kcal: {totalCal}</div>
          <div>Total distance: {totalDist.toFixed(2)} km</div>
          <div>Fat burned: {fatBurnt} kg</div>
          <div>Sessions: {totalSessions}</div>
        </div>
      )}
    </div>
  );
}
