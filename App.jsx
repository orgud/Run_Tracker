import { useState, useEffect } from "react";

const WEIGHT = 108.5;

// ===== MET TABLE =====
function calcMET(speed, incline = 0) {
  const table = {
    1: 2.0, 2: 2.3, 3: 2.8, 4: 3.3, 5: 3.8,
    6: 5.0, 7: 6.3, 8: 8.3, 9: 9.8,
    10: 10.5, 11: 11.5, 12: 12.5,
  };

  let base = table[Math.round(speed)] || 12.5;
  return base + incline * 0.5;
}

function calcCal(min, speed, incline = 0) {
  const MET = calcMET(Number(speed), Number(incline));
  return Math.round(MET * WEIGHT * (Number(min) / 60));
}

function calcDist(speed, min) {
  return Number(speed) * (Number(min) / 60);
}

function getTDEE() {
  return 2700;
}

export default function App() {
  const TODAY = new Date().toISOString().slice(0, 10);

  const [tab, setTab] = useState("log");
  const [logs, setLogs] = useState([]);
  const [foods, setFoods] = useState([]);

  const [date, setDate] = useState(TODAY);
  const [intervals, setIntervals] = useState([{ speed: "", time: "", incline: "0" }]);
  const [foodInput, setFoodInput] = useState("");

  // ===== LOAD =====
  useEffect(() => {
    const l = JSON.parse(localStorage.getItem("run_logs") || "[]");
    const f = JSON.parse(localStorage.getItem("food_logs") || "[]");
    setLogs(l);
    setFoods(f);
  }, []);

  function saveLogs(d) {
    setLogs(d);
    localStorage.setItem("run_logs", JSON.stringify(d));
  }

  function saveFoods(d) {
    setFoods(d);
    localStorage.setItem("food_logs", JSON.stringify(d));
  }

  // ===== SAVE RUN =====
  function saveRun() {
    const valid = intervals.filter(i => i.speed && i.time);
    if (!valid.length) return;

    const totalCal = valid.reduce((s, i) => s + calcCal(i.time, i.speed, i.incline), 0);
    const totalDist = valid.reduce((s, i) => s + calcDist(i.speed, i.time), 0);

    const newLog = {
      id: Date.now(),
      date,
      intervals: valid,
      totalCal,
      totalDist: totalDist.toFixed(2),
    };

    saveLogs([newLog, ...logs]);
    setIntervals([{ speed: "", time: "", incline: "0" }]);
  }

  // ===== ADD FOOD =====
  function addFood() {
    if (!foodInput) return;

    const newFood = {
      id: Date.now(),
      date,
      cal: Number(foodInput)
    };

    saveFoods([newFood, ...foods]);
    setFoodInput("");
  }

  // ===== SUMMARY =====
  function getSummary(dateKey) {
    const run = logs.find(l => l.date === dateKey);
    const food = foods.filter(f => f.date === dateKey);

    const eat = food.reduce((s, f) => s + f.cal, 0);
    const burn = run?.totalCal || 0;

    return {
      eat,
      burn,
      deficit: getTDEE() + burn - eat,
    };
  }

  return (
    <div style={wrap}>

      <h2>🔥 RUN TRACKER</h2>

      {/* tabs */}
      <div style={tabs}>
        {["log","food","history"].map(t => (
          <button key={t} onClick={()=>setTab(t)}>{t}</button>
        ))}
      </div>

      {/* LOG */}
      {tab === "log" && (
        <div>
          <input style={input} type="date" value={date} onChange={e=>setDate(e.target.value)} />

          {intervals.map((iv,i)=>(
            <div key={i} style={row}>
              <input style={input} placeholder="km/h" value={iv.speed}
                onChange={e=>{
                  const c=[...intervals]; c[i].speed=e.target.value; setIntervals(c);
                }} />
              <input style={input} placeholder="min" value={iv.time}
                onChange={e=>{
                  const c=[...intervals]; c[i].time=e.target.value; setIntervals(c);
                }} />
              <input style={input} placeholder="incline" value={iv.incline}
                onChange={e=>{
                  const c=[...intervals]; c[i].incline=e.target.value; setIntervals(c);
                }} />
            </div>
          ))}

          <button onClick={()=>setIntervals([...intervals,{speed:"",time:"",incline:"0"}])}>+ เพิ่ม</button>
          <button onClick={saveRun}>บันทึก</button>
        </div>
      )}

      {/* FOOD */}
      {tab === "food" && (
        <div>
          <input style={input} placeholder="kcal" value={foodInput} onChange={e=>setFoodInput(e.target.value)} />
          <button onClick={addFood}>เพิ่ม</button>

          {foods.filter(f=>f.date===date).map(f => (
            <div key={f.id}>🍔 {f.cal}</div>
          ))}
        </div>
      )}

      {/* HISTORY */}
      {tab === "history" && (
        <div>
          {logs.length === 0 && <div>ยังไม่มีข้อมูล</div>}

          {logs.map(l=>{
            const s = getSummary(l.date);

            return (
              <div key={l.id} style={card}>
                <div><b>{l.date}</b></div>
                <div>🔥 เผา: {s.burn}</div>
                <div>🍔 กิน: {s.eat}</div>
                <div>📉 ขาดดุล: {s.deficit}</div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

// ===== STYLE =====
const wrap = {
  maxWidth: 420,
  margin: "auto",
  padding: 16,
  color: "#fff",
  background: "#0a0a12",
  minHeight: "100vh"
};

const tabs = {
  display: "flex",
  gap: 6,
  margin: "10px 0"
};

const row = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: 6,
  marginBottom: 10
};

const card = {
  border: "1px solid #333",
  padding: 10,
  marginBottom: 10
};

const input = {
  padding: "10px",
  fontSize: 16,
  width: "100%",
  borderRadius: 6,
  border: "1px solid #333",
  background: "#111",
  color: "#fff"
};
