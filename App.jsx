import { useState, useEffect } from “react”;

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

const EMPTY_INTERVAL = { speed: “”, duration: “” };

export default function App() {
const [logs, setLogs] = useState([]);
const [loading, setLoading] = useState(true);
const [tab, setTab] = useState(“log”); // log | history | stats
const [viewLog, setViewLog] = useState(null);

// Form state
const [date, setDate] = useState(TODAY);
const [intervals, setIntervals] = useState([{ speed: “”, duration: “” }, { speed: “”, duration: “” }]);
const [note, setNote] = useState(””);
const [saving, setSaving] = useState(false);
const [saved, setSaved] = useState(false);

// Load from storage
useEffect(() => {
async function load() {
try {
const res = await window.storage.get(“runlogs_v2”);
if (res && res.value) setLogs(JSON.parse(res.value));
} catch (e) {}
setLoading(false);
}
load();
}, []);

// Save to storage
async function saveLogs(newLogs) {
setLogs(newLogs);
try {
await window.storage.set(“runlogs_v2”, JSON.stringify(newLogs));
} catch (e) {}
}

function addInterval() {
setIntervals(p => […p, { speed: “”, duration: “” }]);
}

function removeInterval(i) {
setIntervals(p => p.filter((_, idx) => idx !== i));
}

function updateInterval(i, key, val) {
setIntervals(p => p.map((iv, idx) => idx === i ? { …iv, [key]: val } : iv));
}

async function handleSave() {
const validIntervals = intervals.filter(iv => iv.speed && iv.duration).map(iv => ({
speed: parseFloat(iv.speed),
duration: parseFloat(iv.duration),
}));
if (validIntervals.length === 0) return;

```
setSaving(true);
const totalCal = calcTotalCal(validIntervals);
const totalDist = calcTotalDist(validIntervals);
const totalDur = validIntervals.reduce((s, iv) => s + iv.duration, 0);
const avgSpeed = totalDist / (totalDur / 60);

const entry = {
  id: Date.now(),
  date,
  intervals: validIntervals,
  totalCal,
  totalDist: parseFloat(totalDist.toFixed(2)),
  totalDur,
  avgSpeed: parseFloat(avgSpeed.toFixed(1)),
  note,
};

const newLogs = [entry, ...logs.filter(l => l.date !== date)].sort((a, b) => b.date.localeCompare(a.date));
await saveLogs(newLogs);
setIntervals([{ speed: "", duration: "" }, { speed: "", duration: "" }]);
setNote("");
setSaving(false);
setSaved(true);
setTimeout(() => setSaved(false), 2500);
setTab("history");
```

}

async function deleteLog(id) {
const newLogs = logs.filter(l => l.id !== id);
await saveLogs(newLogs);
setViewLog(null);
}

// Stats
const totalSessions = logs.length;
const totalKm = logs.reduce((s, l) => s + l.totalDist, 0);
const totalCal = logs.reduce((s, l) => s + l.totalCal, 0);
const projFatLoss = (totalCal / 7700).toFixed(2);

// Last 7 days for chart
const last7 = Array.from({ length: 7 }, (_, i) => {
const d = new Date();
d.setDate(d.getDate() - (6 - i));
const key = d.toISOString().slice(0, 10);
const log = logs.find(l => l.date === key);
return { date: key, label: [“อา”,“จ”,“อ”,“พ”,“พฤ”,“ศ”,“ส”][d.getDay()], cal: log ? log.totalCal : 0, dist: log ? log.totalDist : 0 };
});
const maxCal = Math.max(…last7.map(d => d.cal), 1);

if (loading) return (
<div style={{ background: “#080810”, minHeight: “100vh”, display: “flex”, alignItems: “center”, justifyContent: “center” }}>
<div style={{ color: “#f15a24”, fontFamily: “‘Bebas Neue’, sans-serif”, fontSize: 28, letterSpacing: 4 }}>LOADING…</div>
</div>
);

return (
<div style={{ minHeight: “100vh”, background: “#080810”, fontFamily: “‘DM Mono’, monospace”, color: “#e0dcd0”, paddingBottom: 80 }}>
<style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Bebas+Neue&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } input { outline: none; -webkit-appearance: none; } input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; } @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } } .fu { animation: fadeUp 0.35s ease forwards; } @keyframes pop { 0%{transform:scale(1)} 50%{transform:scale(1.04)} 100%{transform:scale(1)} } .pop { animation: pop 0.3s ease; } ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #f15a2450; border-radius: 2px; }`}</style>

```
  {/* HEADER */}
  <div style={{ background: "linear-gradient(160deg,#1c0800 0%,#080810 70%)", padding: "24px 18px 16px", borderBottom: "1px solid #f15a2418" }}>
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 44, color: "#f15a24", letterSpacing: 3, lineHeight: 1 }}>RUN LOG</div>
          <div style={{ fontSize: 10, color: "#f15a2460", letterSpacing: 2, marginTop: 2 }}>180 CM · 108.5 KG · TREADMILL</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, color: "#fff", lineHeight: 1 }}>{totalSessions}</div>
          <div style={{ fontSize: 10, color: "#555", letterSpacing: 1 }}>SESSIONS</div>
        </div>
      </div>

      {/* Mini stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 14 }}>
        {[
          { val: totalKm.toFixed(1), unit: "km total" },
          { val: totalCal.toLocaleString(), unit: "kcal burnt" },
          { val: projFatLoss, unit: "kg fat ↓" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: i === 2 ? "#4caf50" : "#f15a24", lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 9, color: "#555", marginTop: 3, letterSpacing: 1 }}>{s.unit.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* TABS */}
  <div style={{ maxWidth: 500, margin: "0 auto", padding: "14px 18px 0" }}>
    <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
      {[["log","+ บันทึก"],["history","ประวัติ"],["stats","กราฟ"]].map(([t, label]) => (
        <button key={t} onClick={() => setTab(t)} style={{
          flex: 1, padding: "10px 0", border: "none", borderRadius: 9, cursor: "pointer",
          fontFamily: "'DM Mono'", fontSize: 11, letterSpacing: 1,
          background: tab === t ? "#f15a24" : "#0f0f1a",
          color: tab === t ? "#fff" : "#555",
          border: tab === t ? "none" : "1px solid #1e1e2e",
          transition: "all 0.2s",
        }}>{label}</button>
      ))}
    </div>

    {/* ── LOG TAB ── */}
    {tab === "log" && (
      <div className="fu">
        <div style={{ background: "#0f0f1a", border: "1px solid #f15a2428", borderRadius: 16, padding: 18, boxShadow: "0 0 30px #f15a2412" }}>
          <div style={{ fontSize: 10, color: "#f15a24", letterSpacing: 2, marginBottom: 16 }}>วันที่</div>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ width: "100%", background: "#080810", border: "1px solid #2a2a3e", borderRadius: 9, padding: "10px 14px", color: "#e0dcd0", fontSize: 14, fontFamily: "'DM Mono'", marginBottom: 20 }} />

          <div style={{ fontSize: 10, color: "#f15a24", letterSpacing: 2, marginBottom: 12 }}>ช่วงความเร็ว (km/h + นาที)</div>

          {intervals.map((iv, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
              <div style={{ width: 22, fontSize: 10, color: "#444", flexShrink: 0, textAlign: "center" }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: "#444", marginBottom: 3 }}>ความเร็ว km/h</div>
                <input type="number" placeholder="6.0" value={iv.speed} onChange={e => updateInterval(i, "speed", e.target.value)}
                  style={{ width: "100%", background: "#080810", border: "1px solid #2a2a3e", borderRadius: 8, padding: "10px 12px", color: "#e0dcd0", fontSize: 14, fontFamily: "'DM Mono'" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: "#444", marginBottom: 3 }}>นาที</div>
                <input type="number" placeholder="20" value={iv.duration} onChange={e => updateInterval(i, "duration", e.target.value)}
                  style={{ width: "100%", background: "#080810", border: "1px solid #2a2a3e", borderRadius: 8, padding: "10px 12px", color: "#e0dcd0", fontSize: 14, fontFamily: "'DM Mono'" }} />
              </div>
              {intervals.length > 1 && (
                <button onClick={() => removeInterval(i)} style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: 18, paddingTop: 16, flexShrink: 0 }}>✕</button>
              )}
            </div>
          ))}

          <button onClick={addInterval} style={{ width: "100%", padding: "9px", background: "none", border: "1px dashed #2a2a3e", borderRadius: 9, color: "#444", fontSize: 12, fontFamily: "'DM Mono'", cursor: "pointer", marginBottom: 16, letterSpacing: 1 }}>
            + เพิ่มช่วงความเร็ว
          </button>

          {/* Live preview */}
          {intervals.some(iv => iv.speed && iv.duration) && (() => {
            const valid = intervals.filter(iv => iv.speed && iv.duration).map(iv => ({ speed: parseFloat(iv.speed), duration: parseFloat(iv.duration) }));
            const cal = calcTotalCal(valid);
            const dist = calcTotalDist(valid).toFixed(2);
            const dur = valid.reduce((s, iv) => s + iv.duration, 0);
            return (
              <div style={{ background: "#f15a2412", border: "1px solid #f15a2430", borderRadius: 10, padding: "12px 14px", marginBottom: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[["🔥", cal + " kcal"], ["📏", dist + " km"], ["⏱️", dur + " นาที"]].map(([icon, val], i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 16 }}>{icon}</div>
                    <div style={{ fontSize: 13, color: "#f15a24", fontFamily: "'Bebas Neue'", letterSpacing: 1 }}>{val}</div>
                  </div>
                ))}
              </div>
            );
          })()}

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, color: "#444", marginBottom: 4, letterSpacing: 1 }}>โน้ต (ไม่บังคับ)</div>
            <input type="text" placeholder="เช่น เหนื่อยมาก, รู้สึกดี..." value={note} onChange={e => setNote(e.target.value)}
              style={{ width: "100%", background: "#080810", border: "1px solid #2a2a3e", borderRadius: 9, padding: "10px 14px", color: "#e0dcd0", fontSize: 13, fontFamily: "'DM Mono'" }} />
          </div>

          <button onClick={handleSave} disabled={saving} style={{
            width: "100%", padding: "14px", background: saved ? "#4caf50" : "#f15a24", border: "none", borderRadius: 11,
            color: "#fff", fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: 3, cursor: "pointer", transition: "background 0.3s",
          }}>
            {saved ? "✓ บันทึกแล้ว!" : saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>
    )}

    {/* ── HISTORY TAB ── */}
    {tab === "history" && (
      <div className="fu">
        {viewLog ? (
          // Detail view
          <div>
            <button onClick={() => setViewLog(null)} style={{ background: "none", border: "none", color: "#f15a24", fontFamily: "'DM Mono'", fontSize: 12, cursor: "pointer", marginBottom: 14, letterSpacing: 1 }}>
              ← กลับ
            </button>
            <div style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 18 }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: "#f15a24", letterSpacing: 2, marginBottom: 4 }}>{viewLog.date}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
                {[
                  ["🔥", viewLog.totalCal + " kcal", "เบิร์น"],
                  ["📏", viewLog.totalDist + " km", "ระยะ"],
                  ["⏱️", viewLog.totalDur + " min", "เวลา"],
                ].map(([icon, val, label], i) => (
                  <div key={i} style={{ background: "#080810", border: "1px solid #1e1e2e", borderRadius: 10, padding: "12px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 18, marginBottom: 2 }}>{icon}</div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: "#f15a24" }}>{val}</div>
                    <div style={{ fontSize: 9, color: "#555", letterSpacing: 1 }}>{label}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 10, color: "#f15a24", letterSpacing: 2, marginBottom: 10 }}>INTERVALS</div>
              {viewLog.intervals.map((iv, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #141420", fontSize: 13 }}>
                  <span style={{ color: "#888" }}>ช่วง {i + 1}</span>
                  <span style={{ color: "#e0dcd0" }}>{iv.speed} km/h</span>
                  <span style={{ color: "#e0dcd0" }}>{iv.duration} นาที</span>
                  <span style={{ color: "#f15a24" }}>~{calcCalories(iv.duration, iv.speed)} kcal</span>
                </div>
              ))}

              {viewLog.note && (
                <div style={{ marginTop: 14, fontSize: 12, color: "#666", fontStyle: "italic" }}>"{viewLog.note}"</div>
              )}

              <button onClick={() => deleteLog(viewLog.id)} style={{ marginTop: 20, width: "100%", padding: "11px", background: "none", border: "1px solid #3a1010", borderRadius: 9, color: "#c0392b", fontFamily: "'DM Mono'", fontSize: 12, cursor: "pointer", letterSpacing: 1 }}>
                ลบรายการนี้
              </button>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: "center", color: "#333", fontSize: 13, padding: "50px 0" }}>
            ยังไม่มีข้อมูล<br />บันทึกการวิ่งครั้งแรกได้เลย 🏃
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {logs.map((l, i) => (
              <div key={l.id} onClick={() => setViewLog(l)} className="fu" style={{
                background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 13, padding: "14px 16px",
                cursor: "pointer", transition: "border-color 0.2s",
                animationDelay: i * 0.04 + "s",
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#f15a2440"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#1e1e2e"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: "#f15a24", letterSpacing: 1, lineHeight: 1 }}>{l.date}</div>
                    <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                      {l.totalDur} นาที · {l.totalDist} km · {l.avgSpeed} km/h avg
                    </div>
                    {l.note && <div style={{ fontSize: 11, color: "#444", marginTop: 2, fontStyle: "italic" }}>"{l.note}"</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: "#f9a825", lineHeight: 1 }}>{l.totalCal}</div>
                    <div style={{ fontSize: 9, color: "#555", letterSpacing: 1 }}>KCAL</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

    {/* ── STATS TAB ── */}
    {tab === "stats" && (
      <div className="fu">
        {/* 7-day bar chart */}
        <div style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 18, marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: "#f15a24", letterSpacing: 2, marginBottom: 16 }}>7 วันล่าสุด (KCAL)</div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 100 }}>
            {last7.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 10, color: d.cal ? "#f15a24" : "#333" }}>{d.cal || ""}</div>
                <div style={{
                  width: "100%", borderRadius: "4px 4px 0 0",
                  height: d.cal ? Math.max(8, (d.cal / maxCal) * 70) : 3,
                  background: d.cal ? "linear-gradient(180deg,#f15a24,#c0390a)" : "#1e1e2e",
                  transition: "height 0.5s ease",
                }} />
                <div style={{ fontSize: 10, color: "#555" }}>{d.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Distance chart */}
        <div style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 18, marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: "#f15a24", letterSpacing: 2, marginBottom: 16 }}>7 วันล่าสุด (KM)</div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 80 }}>
            {last7.map((d, i) => {
              const maxDist = Math.max(...last7.map(x => x.dist), 0.1);
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ fontSize: 10, color: d.dist ? "#4caf50" : "#333" }}>{d.dist ? d.dist.toFixed(1) : ""}</div>
                  <div style={{
                    width: "100%", borderRadius: "4px 4px 0 0",
                    height: d.dist ? Math.max(8, (d.dist / maxDist) * 55) : 3,
                    background: d.dist ? "linear-gradient(180deg,#4caf50,#2e7d32)" : "#1e1e2e",
                  }} />
                  <div style={{ fontSize: 10, color: "#555" }}>{d.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 18 }}>
          <div style={{ fontSize: 10, color: "#f15a24", letterSpacing: 2, marginBottom: 14 }}>สรุปรวม</div>
          {[
            ["Sessions ทั้งหมด", totalSessions + " ครั้ง"],
            ["ระยะรวม", totalKm.toFixed(1) + " km"],
            ["แคลรวม", totalCal.toLocaleString() + " kcal"],
            ["ประเมินไขมันที่เผา", projFatLoss + " kg"],
            ["เฉลี่ยต่อ session", totalSessions ? Math.round(totalCal / totalSessions) + " kcal" : "—"],
          ].map(([label, val], i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 4 ? "1px solid #141420" : "none", fontSize: 13 }}>
              <span style={{ color: "#666" }}>{label}</span>
              <span style={{ color: i === 3 ? "#4caf50" : "#e0dcd0" }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
</div>
```

);
}
