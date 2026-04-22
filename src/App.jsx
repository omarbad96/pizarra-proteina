import { useState } from "react";

const FOOD_TYPES = [
  { id: "pollo",     name: "Pechuga de pollo",      count: 3,  color: "#FF8C42", tc: "#1a1a1a", emoji: "🍗" },
  { id: "atun",      name: "Lata de atún",           count: 2,  color: "#29B6F6", tc: "#1a1a1a", emoji: "🐟" },
  { id: "batido",    name: "Batido proteína",         count: 7,  color: "#CE93D8", tc: "#1a1a1a", emoji: "🥤" },
  { id: "huevo",     name: "Huevo",                  count: 10, color: "#FFD54F", tc: "#1a1a1a", emoji: "🥚" },
  { id: "lentejas",  name: "Lentejas 250g",           count: 1,  color: "#66BB6A", tc: "#1a1a1a", emoji: "🫘" },
  { id: "soja",      name: "Soja texturizada 250g",   count: 1,  color: "#26A69A", tc: "#fff",    emoji: "🌱" },
  { id: "carne",     name: "Carne roja 250g",         count: 1,  color: "#EF5350", tc: "#fff",    emoji: "🥩" },
  { id: "yogur",     name: "Yogur Griego 200ml",      count: 2,  color: "#4DD0E1", tc: "#1a1a1a", emoji: "🥛" },
  { id: "leche",     name: "Leche 200ml",             count: 7,  color: "#90CAF9", tc: "#1a1a1a", emoji: "🍼" },
  { id: "garbanzos", name: "Garbanzos 250g",          count: 1,  color: "#FFA726", tc: "#1a1a1a", emoji: "🫘" },
  { id: "ricotta",   name: "Ricotta 150g",            count: 1,  color: "#F48FB1", tc: "#1a1a1a", emoji: "🧀" },
  { id: "semillas",  name: "Semillas lino 2 cdas",    count: 2,  color: "#C5E1A5", tc: "#1a1a1a", emoji: "🌾" },
  { id: "banana",    name: "Banana",                  count: 3,  color: "#FFF176", tc: "#1a1a1a", emoji: "🍌" },
];

const DAYS       = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
const DAYS_SHORT = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
const MEALS      = ["Desayuno","Almuerzo","Merienda","Cena"];
const MEAL_ICONS = ["☀️","🌤️","🍎","🌙"];

const createBlocks = () =>
  FOOD_TYPES.flatMap(f =>
    Array.from({ length: f.count }, (_, i) => ({
      id: `${f.id}-${i}`,
      foodId: f.id,
      name: f.name,
      color: f.color,
      tc: f.tc,
      emoji: f.emoji,
      day: null,
      meal: null,
    }))
  );

export default function ProteinTracker() {
  const [blocks, setBlocks]       = useState(createBlocks);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOver, setDragOver]   = useState(null);

  const placed   = blocks.filter(b => b.day !== null).length;
  const total    = blocks.length;
  const progress = placed / total;
  const available = blocks.filter(b => b.day === null);
  const getCell   = (day, meal) => blocks.filter(b => b.day === day && b.meal === meal);

  const onDragStart = (e, id) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver  = (e, target) => { e.preventDefault(); setDragOver(target); };
  const onDragLeave = () => setDragOver(null);
  const onDragEnd   = () => { setDraggingId(null); setDragOver(null); };

  const onDrop = (e, day, meal) => {
    e.preventDefault();
    setDragOver(null);
    if (!draggingId) return;
    setBlocks(p => p.map(b => b.id === draggingId ? { ...b, day, meal } : b));
    setDraggingId(null);
  };

  const onDropReturn = (e) => {
    e.preventDefault();
    setDragOver(null);
    if (!draggingId) return;
    setBlocks(p => p.map(b => b.id === draggingId ? { ...b, day: null, meal: null } : b));
    setDraggingId(null);
  };

  const returnBlock = (id) =>
    setBlocks(p => p.map(b => b.id === id ? { ...b, day: null, meal: null } : b));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0c1810; }

        .fb {
          cursor: grab;
          transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s;
        }
        .fb:hover { transform: translateY(-2px) scale(1.04); box-shadow: 0 5px 14px rgba(0,0,0,0.45) !important; }
        .fb:active { cursor: grabbing; }

        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
        ::-webkit-scrollbar-thumb { background: rgba(232,223,208,0.18); border-radius: 3px; }

        .cell-drop {
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .board-table { border-collapse: separate; border-spacing: 5px; }
        .board-table td, .board-table th { padding: 0; }

        @keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
        .bank-block { animation: fadeIn 0.2s ease; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(155deg, #0c1810 0%, #101f16 60%, #0c1810 100%)",
        fontFamily: "'Caveat', cursive",
        color: "#E8DFD0",
        padding: "22px 24px 36px",
      }}>

        {/* ── HEADER ── */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"20px", flexWrap:"wrap", gap:"12px" }}>
          <div>
            <h1 style={{ fontSize:"38px", fontWeight:700, lineHeight:1.05, textShadow:"0 0 40px rgba(74,222,128,0.15)" }}>
              💪 Pizarra de Proteína
            </h1>
            <p style={{ fontSize:"15px", color:"rgba(232,223,208,0.4)", marginTop:"5px" }}>
              Arrastrá los bloques a tu semana &nbsp;·&nbsp; doble clic para devolver
            </p>
          </div>

          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:"26px", fontWeight:700 }}>
              <span style={{ color:"#4ADE80" }}>{placed}</span>
              <span style={{ color:"rgba(232,223,208,0.25)", fontSize:"20px" }}> / {total}</span>
            </div>
            <div style={{ width:"170px", height:"7px", background:"rgba(255,255,255,0.07)", borderRadius:"4px", overflow:"hidden", marginTop:"6px" }}>
              <div style={{
                width:`${progress*100}%`, height:"100%",
                background:"linear-gradient(90deg,#4ADE80,#22C55E)",
                borderRadius:"4px",
                transition:"width 0.4s ease",
              }} />
            </div>
            <div style={{ fontSize:"13px", color:"rgba(232,223,208,0.3)", marginTop:"4px" }}>
              {Math.round(progress*100)}% planificado
            </div>
          </div>
        </div>

        {/* ── BANK ── */}
        <div
          onDragOver={(e) => onDragOver(e, "bank")}
          onDragLeave={onDragLeave}
          onDrop={onDropReturn}
          style={{
            background: dragOver === "bank" ? "rgba(74,222,128,0.06)" : "rgba(255,255,255,0.025)",
            border:`1px solid ${dragOver==="bank" ? "rgba(74,222,128,0.35)" : "rgba(232,223,208,0.07)"}`,
            borderRadius:"14px",
            padding:"14px 16px",
            marginBottom:"16px",
            transition:"background 0.2s, border-color 0.2s",
          }}
        >
          <div style={{ fontSize:"11px", letterSpacing:"2.5px", textTransform:"uppercase", color:"rgba(232,223,208,0.38)", marginBottom:"10px" }}>
            🧺 &nbsp;Disponibles &nbsp;— &nbsp;{available.length} bloque{available.length !== 1 ? "s" : ""}
          </div>

          <div style={{ display:"flex", flexWrap:"wrap", gap:"7px", minHeight:"38px" }}>
            {available.length === 0 ? (
              <span style={{ fontSize:"17px", color:"rgba(232,223,208,0.3)", padding:"4px 0" }}>
                ✨ ¡Todo planificado para la semana!
              </span>
            ) : available.map(block => (
              <div
                key={block.id}
                draggable
                className="fb bank-block"
                onDragStart={(e) => onDragStart(e, block.id)}
                onDragEnd={onDragEnd}
                style={{
                  background: block.color,
                  color: block.tc,
                  borderRadius:"9px",
                  padding:"5px 11px",
                  fontSize:"14px",
                  fontFamily:"'Caveat',cursive",
                  fontWeight:600,
                  opacity: draggingId === block.id ? 0.25 : 1,
                  boxShadow:"0 2px 7px rgba(0,0,0,0.3)",
                  display:"flex", alignItems:"center", gap:"5px",
                  userSelect:"none",
                }}
              >
                {block.emoji} {block.name}
              </div>
            ))}
          </div>
        </div>

        {/* ── BOARD ── */}
        <div style={{
          background:"rgba(255,255,255,0.02)",
          border:"1px solid rgba(232,223,208,0.07)",
          borderRadius:"14px",
          padding:"16px 18px 20px",
          overflowX:"auto",
        }}>
          <div style={{ fontSize:"11px", letterSpacing:"2.5px", textTransform:"uppercase", color:"rgba(232,223,208,0.38)", marginBottom:"12px" }}>
            📋 &nbsp;Semana
          </div>

          <table className="board-table" style={{ minWidth:"780px", width:"100%" }}>
            <thead>
              <tr>
                <th style={{ width:"88px" }} />
                {DAYS_SHORT.map((d, i) => (
                  <th key={d} style={{ textAlign:"center", paddingBottom:"8px" }}>
                    <div style={{ fontSize:"18px", fontFamily:"'Caveat',cursive", fontWeight:700, color: i>=5 ? "#4ADE80" : "#E8DFD0" }}>
                      {d}
                    </div>
                    {i >= 5 && (
                      <div style={{ fontSize:"9px", letterSpacing:"1.5px", color:"rgba(74,222,128,0.55)", textTransform:"uppercase" }}>
                        finde
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEALS.map((meal, mi) => (
                <tr key={meal}>
                  {/* meal label */}
                  <td style={{ verticalAlign:"middle", textAlign:"right", paddingRight:"8px", paddingBottom:"2px" }}>
                    <span style={{ fontSize:"15px", fontFamily:"'Caveat',cursive", color:"rgba(232,223,208,0.55)", whiteSpace:"nowrap" }}>
                      {MEAL_ICONS[mi]} {meal}
                    </span>
                  </td>

                  {/* cells */}
                  {DAYS.map(day => {
                    const cellKey = `${day}-${meal}`;
                    const isOver  = dragOver === cellKey;
                    const cb      = getCell(day, meal);

                    return (
                      <td
                        key={day}
                        className="cell-drop"
                        onDragOver={(e) => onDragOver(e, cellKey)}
                        onDragLeave={onDragLeave}
                        onDrop={(e) => onDrop(e, day, meal)}
                        style={{
                          verticalAlign:"top",
                          background: isOver
                            ? "rgba(74,222,128,0.1)"
                            : cb.length > 0 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.015)",
                          border:`1px solid ${isOver ? "rgba(74,222,128,0.4)" : "rgba(232,223,208,0.07)"}`,
                          borderRadius:"9px",
                          padding:"6px 5px",
                          minWidth:"90px",
                          minHeight:"72px",
                          position:"relative",
                        }}
                      >
                        <div style={{ display:"flex", flexWrap:"wrap", gap:"3px" }}>
                          {cb.map(block => (
                            <div
                              key={block.id}
                              draggable
                              className="fb"
                              onDragStart={(e) => onDragStart(e, block.id)}
                              onDragEnd={onDragEnd}
                              onDoubleClick={() => returnBlock(block.id)}
                              title={`${block.name} — doble clic para devolver`}
                              style={{
                                background: block.color,
                                color: block.tc,
                                borderRadius:"5px",
                                padding:"3px 6px",
                                fontSize:"11px",
                                fontFamily:"'Caveat',cursive",
                                fontWeight:700,
                                opacity: draggingId === block.id ? 0.2 : 1,
                                boxShadow:"0 1px 4px rgba(0,0,0,0.3)",
                                display:"flex", alignItems:"center", gap:"3px",
                                userSelect:"none",
                                maxWidth:"100%",
                              }}
                            >
                              <span style={{ fontSize:"12px" }}>{block.emoji}</span>
                              <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"68px" }}>
                                {block.name}
                              </span>
                            </div>
                          ))}

                          {/* empty placeholder */}
                          {cb.length === 0 && (
                            <div style={{
                              position:"absolute", inset:0,
                              display:"flex", alignItems:"center", justifyContent:"center",
                              fontSize:"22px", opacity: isOver ? 0.6 : 0.08,
                              transition:"opacity 0.15s",
                              pointerEvents:"none",
                            }}>
                              {isOver ? "+" : "·"}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── LEGEND ── */}
        <div style={{ marginTop:"18px", display:"flex", flexWrap:"wrap", gap:"6px", justifyContent:"center" }}>
          {FOOD_TYPES.map(f => (
            <div key={f.id} style={{
              display:"flex", alignItems:"center", gap:"5px",
              background:"rgba(255,255,255,0.04)",
              borderRadius:"20px",
              padding:"3px 10px",
              fontSize:"12px",
              fontFamily:"'Caveat',cursive",
              color:"rgba(232,223,208,0.6)",
            }}>
              <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:f.color, flexShrink:0 }} />
              {f.emoji} {f.name} ×{f.count}
            </div>
          ))}
        </div>

      </div>
    </>
  );
}