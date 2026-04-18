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
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg,#100800 0%,#080810 60%)",
      color: "#e0dcd0",
      fontFamily: "'DM Mono', monospace",
      paddingBottom: 60
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; }
        input { font-family: 'DM Mono', monospace; }
      `}</style>

      <div style={{ maxWidth: 420, margin: "0 auto", padding: 16 }}>
        {/* HEADER */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 42, color: "#f15a24" }}>
            RUN LOG
          </div>
          <div style={{ fontSize: 11, color: "#555" }}>
            108.5 KG · TREADMILL
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {["log","history","stats"].map(t => (
            <button key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 8,
                background: tab === t ? "#f15a24" : "#0d0d18",
                color: tab === t ? "#fff" : "#555",
                border: "1px solid #222"
              }}>
              {t}
            </button>
          ))}
        </div>

        {/* LOG */}
        {tab === "log" && (
          <div>
            <input type="date"
              value={date}
              onChange={(e)=>setDate(e.target.value)}
              style={{ width:"100%", marginBottom:10, padding:10 }}
            />

            {intervals.map((iv,i)=>(
              <div key={i} style={{ display:"flex", gap:6, marginBottom:8 }}>
                <input placeholder="km/h"
                  value={iv.speed}
                  onChange={e=>update(i,"speed",e.target.value)}
                />
                <input placeholder="min"
                  value={iv.time}
                  onChange={e=>update(i,"time",e.target.value)}
                />
                <input placeholder="%"
                  value={iv.incline}
                  onChange={e=>update(i,"incline",e.target.value)}
                />
                <button onClick={()=>removeInterval(i)}>x</button>
              </div>
            ))}

            <button onClick={()=>setIntervals([...intervals,{speed:"",time:"",incline:"0"}])}>
              + เพิ่มช่วง
            </button>

            <div style={{ marginTop:10 }}>
              🔥 {previewCal} kcal <br/>
              📏 {previewDist.toFixed(2)} km
            </div>

            <input placeholder="โน้ต"
              value={note}
              onChange={e=>setNote(e.target.value)}
              style={{ width:"100%", marginTop:10 }}
            />

            <button onClick={save} style={{
              width:"100%",
              padding:14,
              background:"#f15a24",
              color:"#fff",
              marginTop:10,
              borderRadius:10
            }}>
              {saved ? "✓ saved" : "บันทึก"}
            </button>
          </div>
        )}

        {/* HISTORY */}
        {tab==="history" && (
          <div>
            {logs.map(l=>(
              <div key={l.id} style={{
                background:"#0d0d18",
                padding:10,
                marginBottom:8,
                borderRadius:8
              }}>
                {l.date} - {l.totalCal} kcal
                <button onClick={()=>deleteLog(l.id)}>ลบ</button>
              </div>
            ))}
          </div>
        )}

        {/* STATS */}
        {tab==="stats" && (
          <div>
            <div>Total: {totalCal} kcal</div>
            <div>Distance: {totalDist.toFixed(2)} km</div>
            <div>Fat: {fatBurnt} kg</div>
            <div>Sessions: {totalSessions}</div>
          </div>
        )}
      </div>
    </div>
  );
}
