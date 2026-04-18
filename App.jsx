import { useState, useEffect } from "react";

const WEIGHT = 108.5;
const TODAY = new Date().toISOString().slice(0, 10);

function calcMET(speedKmh, incline = 0) {
  let MET;
  if (speedKmh < 6.0) MET = 2.0 + (speedKmh / 6.0) * 1.5;
  else if (speedKmh < 8.0) MET = 4.0 + ((speedKmh - 6.0) / 2.0) * 2.0;
  else if (speedKmh < 10.0) MET = 8.0 + ((speedKmh - 8.0) / 2.0) * 1.5;
  else if (speedKmh < 12.0) MET = 10.0 + ((speedKmh - 10.0) / 2.0) * 1.5;
  else MET = 12.5;

  return MET + incline * 0.5;
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

  const [date, setDate] = useState(TODAY);
  const [intervals, setIntervals] = useState([
    { speed: "", time: "", incline: "0" },
  ]);

  useEffect(() => {
    const s = localStorage.getItem("runlogs_v6");
    if (s) setLogs(JSON.parse(s));
  }, []);

  function persist(newLogs) {
    setLogs(newLogs);
    localStorage.setItem("runlogs_v6", JSON.stringify(newLogs));
  }

  function update(i, key, val) {
    setIntervals((prev) =>
      prev.map((iv, idx) =>
        idx === i ? { ...iv, [key]: val } : iv
      )
    );
  }

  function removeInterval(i) {
    setIntervals((prev) => prev.filter((_, idx) => idx !== i));
  }

  const valid = intervals.filter((iv) => iv.speed && iv.time);
  const totalCal = valid.reduce(
    (s, iv) => s + calcCal(iv.time, iv.speed, iv.incline),
    0
  );
  const totalDist = valid.reduce(
    (s, iv) => s + calcDist(iv.speed, iv.time),
    0
  );

  function save() {
    if (!valid.length) return;
    const newLog = {
      id: Date.now(),
      date,
      totalCal,
      totalDist: totalDist.toFixed(2),
      intervals: valid,
    };
    persist([newLog, ...logs]);
    setIntervals([{ speed: "", time: "", incline: "0" }]);
    setTab("history");
  }

  return (
    <div style={bg}>
      <style>{`
        * { box-sizing: border-box; max-width: 100%; }
        body { margin: 0; }
      `}</style>

      <div style={container}>
        <h1 style={title}>RUN LOG</h1>

        {/* tabs */}
        <div style={tabs}>
          {["log", "history"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                ...tabBtn,
                background: tab === t ? "#f15a24" : "#111",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* LOG */}
        {tab === "log" && (
          <div style={card}>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={inp}
            />

            {intervals.map((iv, i) => (
              <div key={i} style={{ marginTop: 10 }}>
                {/* ✅ FIX UI ตรงนี้ */}
                <div style={row}>
                  <input
                    placeholder="km/h"
                    value={iv.speed}
                    onChange={(e) =>
                      update(i, "speed", e.target.value)
                    }
                    style={inp}
                  />
                  <input
                    placeholder="min"
                    value={iv.time}
                    onChange={(e) =>
                      update(i, "time", e.target.value)
                    }
                    style={inp}
                  />
                  <input
                    placeholder="%"
                    value={iv.incline}
                    onChange={(e) =>
                      update(i, "incline", e.target.value)
                    }
                    style={inp}
                  />
                </div>

                {intervals.length > 1 && (
                  <button onClick={() => removeInterval(i)}>
                    ลบ
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={() =>
                setIntervals([
                  ...intervals,
                  { speed: "", time: "", incline: "0" },
                ])
              }
            >
              + add
            </button>

            <div style={{ marginTop: 10 }}>
              🔥 {totalCal} kcal <br />
              📏 {totalDist.toFixed(2)} km
            </div>

            <button onClick={save}>save</button>
          </div>
        )}

        {/* HISTORY */}
        {tab === "history" && (
          <div>
            {logs.map((l) => (
              <div key={l.id} style={card}>
                <b>{l.date}</b>
                <div>{l.totalCal} kcal</div>
                <div>{l.totalDist} km</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================== STYLE ================== */

const bg = {
  minHeight: "100vh",
  background: "#000",
  color: "#fff",
};

const container = {
  maxWidth: 420,
  margin: "0 auto",
  padding: "0 12px",
  width: "100%",
};

const title = {
  fontSize: 32,
  margin: "20px 0",
};

const tabs = {
  display: "flex",
  gap: 6,
};

const tabBtn = {
  flex: 1,
  padding: 10,
  border: "none",
  color: "#fff",
};

const card = {
  background: "#111",
  padding: 12,
  marginTop: 10,
  borderRadius: 10,
};

/* ⭐ FIX สำคัญ */
const row = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: 6,
};

const inp = {
  width: "100%",
  padding: "10px",
  borderRadius: 6,
  border: "1px solid #333",
  background: "#000",
  color: "#fff",
  boxSizing: "border-box",
};
