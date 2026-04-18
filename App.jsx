import { useState, useEffect } from "react";

const WEIGHT = 108.5;

// ===== MET TABLE 1–12 =====
function calcMET(speed, incline = 0) {
  const table = {
    1: 2.0, 2: 2.3, 3: 2.8, 4: 3.3, 5: 3.8,
    6: 5.0, 7: 6.3, 8: 8.3, 9: 9.8,
    10: 10.5, 11: 11.5, 12: 12.5,
  };

  let base;
  if (table[speed]) base = table[speed];
  else {
    const l = Math.floor(speed);
    const u = Math.ceil(speed);
    if (!table[l] || !table[u]) base = 12.5;
    else {
      const r = speed - l;
      base = table[l] + (table[u] - table[l]) * r;
    }
  }

  return base + incline * 0.5;
}

function calcCal(min, speed, incline = 0) {
  const MET = calcMET(speed, incline);
  return Math.round(MET * WEIGHT * (min / 60));
}

function calcDist(speed, min) {
  return speed * (min / 60);
}

function getTDEE() {
  return 2700;
}

export default function App() {
  const TODAY = new Date().toISOString().slice(0, 10);

  const [tab, setTab] = useState("log");
  const [logs, setLogs] = useState([]);
  const [foods, setFoods] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [date, setDate] = useState(TODAY);
  const [intervals, setIntervals] = useState([{ speed: "", time: "", incline: "0" }]);
  const [note, setNote] = useState("");
  const [foodInput, setFoodInput] = useState("");

  useEffect(() => {
    const l = localStorage.getItem("run_logs");
    const f = localStorage.getItem("food_logs");
    if (l) setLogs(JSON.parse(l));
    if (f) setFoods(JSON.parse(f));
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
    const totalTime = valid.reduce((s, i) => s + Number(i.time), 0);

    const newLog = {
      id: editingId || Date.now(),
      date,
      intervals: valid,
      totalCal,
      totalDist: totalDist.toFixed(2),
      totalTime,
      note,
    };

    let updated;
    if (editingId) updated = logs.map(l => l.id === editingId ? newLog : l);
    else updated = [newLog, ...logs];

    saveLogs(updated);

    setEditingId(null);
    setIntervals([{ speed: "", time: "", incline: "0" }]);
    setNote("");
    setTab("history");
  }

  // ===== FOOD =====
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

  // ===== TODAY =====
  const todayRun = logs.find(l => l.date === date);
  const todayFood = foods.filter(f => f.date === date);

  const eatCal = todayFood.reduce((s, f) => s + f.cal, 0);
  const burnCal = todayRun?.totalCal || 0;

  const deficit = getTDEE() + burnCal - eatCal;
  const weightChange = (deficit / 7700).toFixed(3);

  // ===== STREAK =====
  function calcStreak() {
    let s = 0;
    let d = new Date();

    while (true) {
      const key = d.toISOString().slice(0, 10);
      if (logs.find(l => l.date === key)) {
        s++;
        d.setDate(d.getDate() - 1);
      } else break;
    }

    return s;
  }

  const streak = calcStreak();

  // ===== UI =====
  return (
    <div style={{ maxWidth: 420, margin: "auto", padding: 16, color: "#fff", background: "#0a0a12", minHeight: "100vh" }}>

      <h2>🔥 RUN TRACKER</h2>
      <div>🔥 {streak} วันติด</div>

      {/* tabs */}
      <div style={{ display: "flex", gap: 6, margin: "10px 0" }}>
        {["log","food","history"].map(t => (
          <button key={t} onClick={()=>setTab(t)}>{t}</button>
        ))}
      </div>

      {/* LOG */}
      {tab === "log" && (
        <div>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} />

          {intervals.map((iv,i)=>(
            <div key={i} style={{ display:"flex", gap:4 }}>
              <input placeholder="km/h" value={iv.speed}
                onChange={e=>{
                  const c=[...intervals];
                  c[i].speed=e.target.value;
                  setIntervals(c);
                }} />

              <input placeholder="min" value={iv.time}
                onChange={e=>{
                  const c=[...intervals];
                  c[i].time=e.target.value;
                  setIntervals(c);
                }} />

              <input placeholder="incline" value={iv.incline}
                onChange={e=>{
                  const c=[...intervals];
                  c[i].incline=e.target.value;
                  setIntervals(c);
                }} />
            </div>
          ))}

          <button onClick={()=>setIntervals([...intervals,{speed:"",time:"",incline:"0"}])}>+ เพิ่ม</button>

          {/* quick fill */}
          <div style={{ marginTop: 6 }}>
            <button onClick={()=>setIntervals([{speed:"6",time:"20",incline:"0"}])}>เดิน</button>
            <button onClick={()=>setIntervals([{speed:"8",time:"30",incline:"0"}])}>วิ่ง</button>
          </div>

          <button onClick={saveRun}>
            {editingId ? "อัปเดต" : "บันทึก"}
          </button>
        </div>
      )}

      {/* FOOD */}
      {tab === "food" && (
        <div>
          <input placeholder="kcal" value={foodInput} onChange={e=>setFoodInput(e.target.value)} />
          <button onClick={addFood}>เพิ่ม</button>

          {todayFood.map(f => <div key={f.id}>🍔 {f.cal}</div>)}
        </div>
      )}

      {/* HISTORY */}
      {tab === "history" && (
        <div>
          {logs.map(l=>(
            <div key={l.id} style={{ border:"1px solid #333", marginBottom:10, padding:6 }}>
              <div>{l.date}</div>
              <div>{l.totalCal} kcal</div>

              <button onClick={()=>{
                setEditingId(l.id);
                setDate(l.date);
                setIntervals(l.intervals);
                setTab("log");
              }}>✏️ แก้</button>
            </div>
          ))}
        </div>
      )}

      {/* SUMMARY */}
      <div style={{ marginTop:20 }}>
        <div>🔥 เผา: {burnCal}</div>
        <div>🍔 กิน: {eatCal}</div>
        <div>📉 ขาดดุล: {deficit}</div>
        <div>⚖️ น้ำหนักเปลี่ยน: {weightChange} kg</div>
      </div>

    </div>
  );
}
