import { useState, useEffect } from "react";

const WEIGHT = 108.5;
const TODAY = new Date().toISOString().slice(0, 10);

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
  const [tab, setTab] = useState("log");

  const [date, setDate] = useState(TODAY);
  const [intervals, setIntervals] = useState([{ speed: "", time: "" }]);

  useEffect(() => {
    const saved = localStorage.getItem("runlogs_v4");
    if (saved) setLogs(JSON.parse(saved));
  }, []);

  function addInterval() {
    setIntervals([...intervals, { speed: "", time: "" }]);
  }

  function update(i, key, val) {
    const copy = [...intervals];
    copy[i][key] = val;
    setIntervals(copy);
  }

  function save() {
    const valid = intervals.filter(i => i.speed && i.time);
    if (!valid.length) return;

    let totalCal = 0;
    let totalDist = 0;
    let totalTime = 0;

    valid.forEach(i => {
      const cal = calcCal(Number(i.time), Number(i.speed));
      totalCal += cal;
      totalDist += (i.speed * i.time / 60);
      totalTime += Number(i.time);
    });

    const newLog = {
      id: Date.now(),
      date,
      intervals: valid,
      totalCal,
      totalDist: totalDist.toFixed(2),
      totalTime
    };

    const newLogs = [newLog, ...logs];
    setLogs(newLogs);
    localStorage.setItem("runlogs_v4", JSON.stringify(newLogs));

    setIntervals([{ speed: "", time: "" }]);
    setTab("history");
  }

  const totalCal = logs.reduce((s, l) => s + l.totalCal, 0);
  const totalDist = logs.reduce((s, l) => s + Number(l.totalDist), 0);

  const last7 = logs.slice(0, 7);
  const maxCal = Math.max(...last7.map(l => l.totalCal), 1);

  return (
    <div style={bg}>
      <div style={container}>

        {/* HEADER */}
        <div style={header}>
          <div>
            <div style={title}>RUN LOG</div>
            <div style={sub}>108.5 KG • TREADMILL</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={big}>{logs.length}</div>
            <div style={sub}>SESSIONS</div>
          </div>
        </div>

        {/* TABS */}
        <div style={tabs}>
          {["log","history","stats"].map(t => (
            <button key={t} onClick={()=>setTab(t)}
              style={{
                ...tabBtn,
                background: tab===t ? "#f15a24" : "#111",
                color: tab===t ? "#fff" : "#555"
              }}>
              {t}
            </button>
          ))}
        </div>

        {/* LOG */}
        {tab==="log" && (
          <div style={card}>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={input}/>

            {intervals.map((iv,i)=>(
              <div key={i} style={{display:"flex",gap:8}}>
                <input placeholder="km/h" value={iv.speed}
                  onChange={e=>update(i,"speed",e.target.value)} style={input}/>
                <input placeholder="min" value={iv.time}
                  onChange={e=>update(i,"time",e.target.value)} style={input}/>
              </div>
            ))}

            <button onClick={addInterval} style={btnGhost}>
              + เพิ่มช่วง
            </button>

            <button onClick={save} style={btnMain}>
              บันทึก
            </button>
          </div>
        )}

        {/* HISTORY */}
        {tab==="history" && (
          <div>
            {logs.map(l=>(
              <div key={l.id} style={card}>
                <div style={dateTxt}>{l.date}</div>
                <div>🔥 {l.totalCal} kcal</div>
                <div>📏 {l.totalDist} km</div>

                {l.intervals.map((iv,i)=>(
                  <div key={i} style={mini}>
                    {iv.speed} km/h • {iv.time} min
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* STATS */}
        {tab==="stats" && (
          <div>
            <div style={card}>
              🔥 {totalCal} kcal<br/>
              📏 {totalDist.toFixed(2)} km
            </div>

            <div style={card}>
              <div style={{marginBottom:10}}>7 วันล่าสุด</div>
              <div style={chart}>
                {last7.map(l=>(
                  <div key={l.id} style={{
                    flex:1,
                    height:(l.totalCal/maxCal)*100,
                    background:"linear-gradient(#f15a24,#c0390a)",
                    borderRadius:4
                  }}/>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* STYLE */
const bg = {
  minHeight:"100vh",
  background:"linear-gradient(160deg,#1c0800,#080810)",
  display:"flex",
  justifyContent:"center",
  color:"#e0dcd0",
  fontFamily:"'DM Mono'"
};

const container = {width:"100%",maxWidth:420,padding:20};

const header = {display:"flex",justifyContent:"space-between",marginBottom:10};
const title = {fontFamily:"'Bebas Neue'",fontSize:40,color:"#f15a24"};
const sub = {fontSize:10,color:"#555"};
const big = {fontSize:30};

const tabs = {display:"flex",gap:6,marginBottom:10};
const tabBtn = {flex:1,padding:10,border:"none",borderRadius:8,cursor:"pointer"};

const card = {
  background:"#0f0f1a",
  padding:16,
  borderRadius:16,
  border:"1px solid #1e1e2e",
  marginBottom:10
};

const input = {
  flex:1,
  padding:12,
  marginBottom:8,
  borderRadius:8,
  border:"1px solid #333",
  background:"#111",
  color:"#fff"
};

const btnMain = {
  width:"100%",
  padding:14,
  background:"#f15a24",
  border:"none",
  borderRadius:10,
  color:"#fff"
};

const btnGhost = {
  width:"100%",
  padding:10,
  background:"none",
  border:"1px dashed #333",
  color:"#666",
  borderRadius:8
};

const chart = {display:"flex",gap:6,height:100,alignItems:"flex-end"};

const mini = {fontSize:12,color:"#777"};
const dateTxt = {color:"#f15a24"};
