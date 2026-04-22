import { useState } from "react";

// ── DATOS POR DEFECTO ────────────────────────────────────
const DEFAULT_FOODS = [
  { id:"pollo",     name:"Pechuga de pollo",     count:3,  color:"#FF8C42", tc:"#1a1a1a", emoji:"🍗" },
  { id:"atun",      name:"Lata de atún",          count:2,  color:"#29B6F6", tc:"#1a1a1a", emoji:"🐟" },
  { id:"batido",    name:"Batido proteína",        count:7,  color:"#CE93D8", tc:"#1a1a1a", emoji:"🥤" },
  { id:"huevo",     name:"Huevo",                 count:10, color:"#FFD54F", tc:"#1a1a1a", emoji:"🥚" },
  { id:"lentejas",  name:"Lentejas 250g",          count:1,  color:"#66BB6A", tc:"#1a1a1a", emoji:"🫘" },
  { id:"soja",      name:"Soja texturizada 250g",  count:1,  color:"#26A69A", tc:"#fff",    emoji:"🌱" },
  { id:"carne",     name:"Carne roja 250g",        count:1,  color:"#EF5350", tc:"#fff",    emoji:"🥩" },
  { id:"yogur",     name:"Yogur Griego 200ml",     count:2,  color:"#4DD0E1", tc:"#1a1a1a", emoji:"🥛" },
  { id:"leche",     name:"Leche 200ml",            count:7,  color:"#90CAF9", tc:"#1a1a1a", emoji:"🍼" },
  { id:"garbanzos", name:"Garbanzos 250g",         count:1,  color:"#FFA726", tc:"#1a1a1a", emoji:"🫘" },
  { id:"ricotta",   name:"Ricotta 150g",           count:1,  color:"#F48FB1", tc:"#1a1a1a", emoji:"🧀" },
  { id:"semillas",  name:"Semillas lino 2 cdas",   count:2,  color:"#C5E1A5", tc:"#1a1a1a", emoji:"🌾" },
  { id:"banana",    name:"Banana",                 count:3,  color:"#FFF176", tc:"#1a1a1a", emoji:"🍌" },
];

const PALETTE = [
  {bg:"#FF8C42",tc:"#1a1a1a"},{bg:"#FFD54F",tc:"#1a1a1a"},{bg:"#FFF176",tc:"#1a1a1a"},
  {bg:"#FFAB91",tc:"#1a1a1a"},{bg:"#F48FB1",tc:"#1a1a1a"},{bg:"#CE93D8",tc:"#1a1a1a"},
  {bg:"#B39DDB",tc:"#1a1a1a"},{bg:"#90CAF9",tc:"#1a1a1a"},{bg:"#29B6F6",tc:"#1a1a1a"},
  {bg:"#4DD0E1",tc:"#1a1a1a"},{bg:"#80CBC4",tc:"#1a1a1a"},{bg:"#66BB6A",tc:"#1a1a1a"},
  {bg:"#C5E1A5",tc:"#1a1a1a"},{bg:"#CCFF90",tc:"#1a1a1a"},{bg:"#26A69A",tc:"#fff"},
  {bg:"#EF5350",tc:"#fff"},   {bg:"#FFA726",tc:"#1a1a1a"},{bg:"#FF8A80",tc:"#1a1a1a"},
];

const QUICK_EMOJIS = ["🍗","🥩","🐟","🥚","🥛","🍼","🧀","🫘","🌱","🌾","🍌","🥜","🥦","🍖","🥗","🫙","🥫","🍳","🥤","🫀"];

const DAYS       = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
const DAYS_SHORT = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
const MEALS      = ["Desayuno","Almuerzo","Merienda","Cena"];
const MEAL_ICONS = ["☀️","🌤️","🍎","🌙"];

const LS_FOODS  = "pizarra-foods-v2";
const LS_BLOCKS = "pizarra-blocks-v2";

// ── HELPERS ──────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

const blocksFromFoods = (foods, prevBlocks = []) =>
  foods.flatMap(f => {
    const prev = prevBlocks.filter(b => b.foodId === f.id);
    return Array.from({ length: f.count }, (_, i) =>
      prev[i]
        ? { ...prev[i], name: f.name, emoji: f.emoji, color: f.color, tc: f.tc }
        : { id: `${f.id}-${uid()}`, foodId: f.id, name: f.name,
            color: f.color, tc: f.tc, emoji: f.emoji, day: null, meal: null }
    );
  });

const loadState = () => {
  try {
    const f = JSON.parse(localStorage.getItem(LS_FOODS));
    const b = JSON.parse(localStorage.getItem(LS_BLOCKS));
    if (f && b) return { foods: f, blocks: b };
    if (f)      return { foods: f, blocks: blocksFromFoods(f) };
  } catch {}
  return { foods: DEFAULT_FOODS, blocks: blocksFromFoods(DEFAULT_FOODS) };
};

// ── COMPONENTE PRINCIPAL ─────────────────────────────────
export default function ProteinTracker() {
  const init = loadState();
  const [foods,  setFoodsRaw]  = useState(init.foods);
  const [blocks, setBlocksRaw] = useState(init.blocks);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOver,   setDragOver]   = useState(null);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name:"", emoji:"🍽️", count:1, colorIdx:0 });
  const [showConfirm, setShowConfirm] = useState(false);

  const saveFoods  = f => { setFoodsRaw(f);  localStorage.setItem(LS_FOODS,  JSON.stringify(f)); };
  const saveBlocks = b => { setBlocksRaw(b); localStorage.setItem(LS_BLOCKS, JSON.stringify(b)); };

  const placed    = blocks.filter(b => b.day !== null).length;
  const total     = blocks.length;
  const pct       = total > 0 ? Math.round(placed / total * 100) : 0;
  const available = blocks.filter(b => b.day === null);
  const getCell   = (day, meal) => blocks.filter(b => b.day === day && b.meal === meal);

  // ── Drag & Drop ──
  const onDragStart  = (e, id) => { setDraggingId(id); e.dataTransfer.effectAllowed = "move"; };
  const onDragOverEl = (e, t)  => { e.preventDefault(); setDragOver(t); };
  const onDragLeave  = ()      => setDragOver(null);
  const onDragEnd    = ()      => { setDraggingId(null); setDragOver(null); };

  const onDrop = (e, day, meal) => {
    e.preventDefault(); setDragOver(null);
    if (!draggingId) return;
    saveBlocks(blocks.map(b => b.id === draggingId ? { ...b, day, meal } : b));
    setDraggingId(null);
  };
  const onDropReturn = (e) => {
    e.preventDefault(); setDragOver(null);
    if (!draggingId) return;
    saveBlocks(blocks.map(b => b.id === draggingId ? { ...b, day: null, meal: null } : b));
    setDraggingId(null);
  };
  const returnBlock = id =>
    saveBlocks(blocks.map(b => b.id === id ? { ...b, day: null, meal: null } : b));

  // ── Editor ──
  const openAdd = () => {
    setEditing(null);
    setForm({ name:"", emoji:"🍽️", count:1, colorIdx:0 });
    setModal(true);
  };
  const openEdit = food => {
    const colorIdx = PALETTE.findIndex(p => p.bg === food.color);
    setEditing(food);
    setForm({ name: food.name, emoji: food.emoji, count: food.count, colorIdx: colorIdx >= 0 ? colorIdx : 0 });
    setModal(true);
  };
  const handleSave = () => {
    if (!form.name.trim()) return;
    const { bg, tc } = PALETTE[form.colorIdx];
    if (editing) {
      const upd = { ...editing, name: form.name.trim(), emoji: form.emoji, count: +form.count, color: bg, tc };
      const nf  = foods.map(f => f.id === editing.id ? upd : f);
      saveFoods(nf);
      saveBlocks(blocksFromFoods(nf, blocks));
    } else {
      const nf = [...foods, { id:`c-${uid()}`, name: form.name.trim(), emoji: form.emoji, count: +form.count, color: bg, tc }];
      saveFoods(nf);
      saveBlocks(blocksFromFoods(nf, blocks));
    }
    setModal(false);
  };
  const handleDelete = () => {
    if (!editing) return;
    saveFoods(foods.filter(f => f.id !== editing.id));
    saveBlocks(blocks.filter(b => b.foodId !== editing.id));
    setModal(false);
  };
  const resetWeek = () => {
    saveBlocks(blocks.map(b => ({ ...b, day: null, meal: null })));
    setShowConfirm(false);
  };

  const C = {
    surface: "rgba(255,255,255,0.025)",
    border:  "rgba(232,223,208,0.07)",
    text:    "#E8DFD0",
    dim:     "rgba(232,223,208,0.4)",
    green:   "#4ADE80",
    over:    "rgba(74,222,128,0.1)",
    overBdr: "rgba(74,222,128,0.4)",
  };

  const inputStyle = {
    width:"100%", background:"rgba(255,255,255,0.07)",
    border:"1px solid rgba(232,223,208,0.15)", borderRadius:"8px",
    padding:"8px 12px", color:C.text, fontFamily: "Inter, sans-serif",
    fontSize:"16px", outline:"none",
  };

  return (
    <>
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { 
    box-sizing:border-box; 
    margin:0; 
    padding:0; 
    font-family: 'Inter', sans-serif !important;;
  }
  body { background:#0c1810; }
  .fb { cursor:grab; transition:transform .15s ease, box-shadow .15s ease; }
  .fb:hover { transform:translateY(-2px) scale(1.04); box-shadow:0 5px 14px rgba(0,0,0,.45) !important; }
  .fb:active { cursor:grabbing; }
  .cell-drop { transition:background .15s, border-color .15s; }
  .board-table { border-collapse:separate; border-spacing:5px; }
  .board-table td, .board-table th { padding:0; }
  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-thumb { background:rgba(232,223,208,.18); border-radius:3px; }
  input:focus { border-color:rgba(74,222,128,.4) !important; }

  .btn-green { background:rgba(74,222,128,.15); border:1px solid rgba(74,222,128,.3); color:#4ADE80; border-radius:8px; padding:8px 16px; font-size:15px; cursor:pointer; transition:background .15s; }
  .btn-green:hover { background:rgba(74,222,128,.25); }

  .btn-red { background:rgba(239,83,80,.15); border:1px solid rgba(239,83,80,.3); color:#EF5350; border-radius:8px; padding:8px 16px; font-size:15px; cursor:pointer; transition:background .15s; }
  .btn-red:hover { background:rgba(239,83,80,.25); }

  .btn-ghost { background:rgba(255,255,255,.06); border:1px solid rgba(232,223,208,.12); color:rgba(232,223,208,.6); border-radius:8px; padding:8px 16px; font-size:15px; cursor:pointer; transition:background .15s; }
  .btn-ghost:hover { background:rgba(255,255,255,.1); }

  .emoji-btn { background:rgba(255,255,255,.07); border:1px solid rgba(232,223,208,.12); border-radius:6px; padding:5px 8px; font-size:18px; cursor:pointer; transition:background .1s, border-color .1s; }
  .emoji-btn:hover { background:rgba(255,255,255,.14); }
  .emoji-btn.sel { border-color:#4ADE80; background:rgba(74,222,128,.12); }

  .food-row { display:flex; align-items:center; gap:10px; padding:10px 12px; border:1px solid rgba(232,223,208,.07); border-radius:10px; background:rgba(255,255,255,.03); cursor:pointer; transition:background .15s, border-color .15s; }
  .food-row:hover { background:rgba(255,255,255,.07); border-color:rgba(232,223,208,.15); }

  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .modal-panel { animation:fadeUp .2s ease; }

  .stepper-btn { width:36px; height:36px; border-radius:8px; background:rgba(255,255,255,.08); border:1px solid rgba(232,223,208,.12); color:#E8DFD0; font-size:20px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .1s; }
  .stepper-btn:hover { background:rgba(255,255,255,.15); }
`}</style>

      <div style={{ minHeight:"100vh", background:"linear-gradient(155deg,#0c1810 0%,#101f16 60%,#0c1810 100%)", fontFamily:"Inter, sans-serif", color:C.text, padding:"22px 24px 40px" }}>

        {/* ── HEADER ── */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:"12px", marginBottom:"20px" }}>
          <div>
            <h1 style={{ fontSize:"38px", fontWeight:700, lineHeight:1.05, textShadow:"0 0 40px rgba(74,222,128,.15)" }}>
              💪 Pizarra de Proteína
            </h1>
            <p style={{ fontSize:"15px", color:C.dim, marginTop:"5px" }}>
              Arrastrá bloques a tu semana &nbsp;·&nbsp; doble clic para devolver
            </p>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"8px" }}>
            <div style={{ fontSize:"26px", fontWeight:700 }}>
              <span style={{ color:C.green }}>{placed}</span>
              <span style={{ color:"rgba(232,223,208,.25)", fontSize:"20px" }}> / {total}</span>
            </div>
            <div style={{ width:"170px", height:"7px", background:"rgba(255,255,255,.07)", borderRadius:"4px", overflow:"hidden" }}>
              <div style={{ width:`${pct}%`, height:"100%", background:"linear-gradient(90deg,#4ADE80,#22C55E)", borderRadius:"4px", transition:"width .4s ease" }} />
            </div>
            <div style={{ fontSize:"13px", color:"rgba(232,223,208,.3)" }}>{pct}% planificado</div>
            <div style={{ display:"flex", gap:"8px", marginTop:"4px" }}>
              <button className="btn-ghost" onClick={openAdd} style={{ fontSize:"13px", padding:"6px 12px" }}>＋ Agregar alimento</button>
              <button className="btn-ghost" onClick={() => setShowConfirm(true)} style={{ fontSize:"13px", padding:"6px 12px" }}>🔄 Nueva semana</button>
            </div>
          </div>
        </div>

        {/* ── BANCO ── */}
        <div onDragOver={e => onDragOverEl(e,"bank")} onDragLeave={onDragLeave} onDrop={onDropReturn}
          style={{ background: dragOver==="bank" ? C.over : C.surface, border:`1px solid ${dragOver==="bank" ? C.overBdr : C.border}`, borderRadius:"14px", padding:"14px 16px", marginBottom:"16px", transition:"background .2s, border-color .2s" }}>
          <div style={{ fontSize:"11px", letterSpacing:"2.5px", textTransform:"uppercase", color:"rgba(232,223,208,.38)", marginBottom:"10px" }}>
            🧺 &nbsp;Disponibles — {available.length} bloque{available.length!==1?"s":""}
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"7px", minHeight:"38px" }}>
            {available.length === 0
              ? <span style={{ fontSize:"17px", color:"rgba(232,223,208,.3)", padding:"4px 0" }}>✨ ¡Todo planificado!</span>
              : available.map(block => (
                <div key={block.id} draggable className="fb"
                  onDragStart={e => onDragStart(e, block.id)} onDragEnd={onDragEnd}
                  style={{ background:block.color, color:block.tc, borderRadius:"9px", padding:"5px 11px", fontSize:"14px", fontFamily: "Inter, sans-serif", fontWeight:600, opacity: draggingId===block.id?.25:1, boxShadow:"0 2px 7px rgba(0,0,0,.3)", display:"flex", alignItems:"center", gap:"5px", userSelect:"none" }}>
                  {block.emoji} {block.name}
                </div>
              ))
            }
          </div>
        </div>

        {/* ── PIZARRA ── */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:"14px", padding:"16px 18px 20px", overflowX:"auto", marginBottom:"16px" }}>
          <div style={{ fontSize:"11px", letterSpacing:"2.5px", textTransform:"uppercase", color:"rgba(232,223,208,.38)", marginBottom:"12px" }}>📋 &nbsp;Semana</div>
          <table className="board-table" style={{ minWidth:"780px", width:"100%" }}>
            <thead>
              <tr>
                <th style={{ width:"88px" }} />
                {DAYS_SHORT.map((d,i) => (
                  <th key={d} style={{ textAlign:"center", paddingBottom:"8px" }}>
                    <div style={{ fontSize:"18px", fontFamily: "Inter, sans-serif", fontWeight:700, color: i>=5 ? C.green : C.text }}>{d}</div>
                    {i>=5 && <div style={{ fontSize:"9px", letterSpacing:"1.5px", color:"rgba(74,222,128,.55)", textTransform:"uppercase" }}>finde</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEALS.map((meal,mi) => (
                <tr key={meal}>
                  <td style={{ verticalAlign:"middle", textAlign:"right", paddingRight:"8px" }}>
                    <span style={{ fontSize:"15px", color:"rgba(232,223,208,.55)", whiteSpace:"nowrap" }}>{MEAL_ICONS[mi]} {meal}</span>
                  </td>
                  {DAYS.map(day => {
                    const key = `${day}-${meal}`;
                    const isOver = dragOver === key;
                    const cb = getCell(day, meal);
                    return (
                      <td key={day} className="cell-drop"
                        onDragOver={e => onDragOverEl(e, key)} onDragLeave={onDragLeave} onDrop={e => onDrop(e, day, meal)}
                        style={{ verticalAlign:"top", borderRadius:"9px", padding:"6px 5px", minWidth:"90px", minHeight:"72px", position:"relative",
                          background: isOver ? C.over : cb.length>0 ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.015)",
                          border:`1px solid ${isOver ? C.overBdr : C.border}` }}>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:"3px" }}>
                          {cb.map(block => (
                            <div key={block.id} draggable className="fb"
                              onDragStart={e => onDragStart(e, block.id)} onDragEnd={onDragEnd}
                              onDoubleClick={() => returnBlock(block.id)}
                              title={`${block.name} — doble clic para devolver`}
                              style={{ background:block.color, color:block.tc, borderRadius:"5px", padding:"3px 6px", fontSize:"11px", fontFamily: "Inter, sans-serif", fontWeight:700, opacity: draggingId===block.id?.2:1, boxShadow:"0 1px 4px rgba(0,0,0,.3)", display:"flex", alignItems:"center", gap:"3px", userSelect:"none", maxWidth:"100%" }}>
                              <span style={{ fontSize:"12px" }}>{block.emoji}</span>
                              <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"68px" }}>{block.name}</span>
                            </div>
                          ))}
                          {cb.length===0 && (
                            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px", opacity: isOver?.6:.08, transition:"opacity .15s", pointerEvents:"none" }}>
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

        {/* ── LISTA DE ALIMENTOS ── */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:"14px", padding:"16px 18px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
            <div style={{ fontSize:"11px", letterSpacing:"2.5px", textTransform:"uppercase", color:"rgba(232,223,208,.38)" }}>🥗 &nbsp;Mis alimentos</div>
            <button className="btn-green" onClick={openAdd} style={{ fontSize:"13px", padding:"5px 12px" }}>＋ Agregar</button>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
            {foods.map(food => {
              const foodPlaced = blocks.filter(b => b.foodId===food.id && b.day!==null).length;
              return (
                <div key={food.id} className="food-row" onClick={() => openEdit(food)}>
                  <div style={{ width:"12px", height:"12px", borderRadius:"50%", background:food.color, flexShrink:0 }} />
                  <span style={{ fontSize:"18px" }}>{food.emoji}</span>
                  <span style={{ fontSize:"16px", flex:1 }}>{food.name}</span>
                  <span style={{ fontSize:"13px" }}>
                    <span style={{ color: foodPlaced>0 ? C.green : C.dim }}>{foodPlaced}</span>
                    <span style={{ color:"rgba(232,223,208,.2)" }}> / {food.count}</span>
                  </span>
                  <span style={{ fontSize:"12px", color:"rgba(232,223,208,.3)" }}>✏️</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── MODAL EDITOR ── */}
      {modal && (
        <div onClick={e => { if(e.target===e.currentTarget) setModal(false); }}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:"20px" }}>
          <div className="modal-panel" style={{ background:"#1a2e1f", border:"1px solid rgba(232,223,208,.12)", borderRadius:"16px", padding:"24px", width:"100%", maxWidth:"420px", maxHeight:"90vh", overflowY:"auto" }}>
            
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
              <h2 style={{ fontSize:"24px", fontWeight:700 }}>{editing ? "✏️ Editar alimento" : "＋ Nuevo alimento"}</h2>
              <button onClick={() => setModal(false)} style={{ background:"none", border:"none", color:"rgba(232,223,208,.4)", fontSize:"24px", cursor:"pointer", lineHeight:1 }}>✕</button>
            </div>

            <label style={{ fontSize:"12px", letterSpacing:"2px", textTransform:"uppercase", color:"rgba(232,223,208,.45)", display:"block", marginBottom:"6px" }}>Nombre</label>
            <input style={inputStyle} placeholder="ej: Claras de huevo 200g" value={form.name} onChange={e => setForm({...form, name:e.target.value})} />

            <label style={{ fontSize:"12px", letterSpacing:"2px", textTransform:"uppercase", color:"rgba(232,223,208,.45)", display:"block", marginTop:"18px", marginBottom:"8px" }}>Emoji</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"5px", marginBottom:"8px" }}>
              {QUICK_EMOJIS.map(em => (
                <button key={em} className={`emoji-btn${form.emoji===em?" sel":""}`} onClick={() => setForm({...form, emoji:em})}>{em}</button>
              ))}
            </div>
            <input style={{...inputStyle, width:"72px", textAlign:"center", fontSize:"22px"}} value={form.emoji} onChange={e => setForm({...form, emoji:e.target.value})} maxLength={2} />

            <label style={{ fontSize:"12px", letterSpacing:"2px", textTransform:"uppercase", color:"rgba(232,223,208,.45)", display:"block", marginTop:"18px", marginBottom:"8px" }}>Cantidad semanal</label>
            <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
              <button className="stepper-btn" onClick={() => setForm({...form, count: Math.max(1, +form.count-1)})}>−</button>
              <span style={{ fontSize:"30px", fontWeight:700, minWidth:"40px", textAlign:"center" }}>{form.count}</span>
              <button className="stepper-btn" onClick={() => setForm({...form, count: +form.count+1})}>＋</button>
            </div>

            <label style={{ fontSize:"12px", letterSpacing:"2px", textTransform:"uppercase", color:"rgba(232,223,208,.45)", display:"block", marginTop:"18px", marginBottom:"8px" }}>Color del bloque</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", marginBottom:"16px" }}>
              {PALETTE.map((p,i) => (
                <div key={i} onClick={() => setForm({...form, colorIdx:i})}
                  style={{ width:"30px", height:"30px", borderRadius:"50%", background:p.bg, cursor:"pointer", border: form.colorIdx===i ? "3px solid #4ADE80" : "3px solid transparent", transition:"border .1s", flexShrink:0 }} />
              ))}
            </div>

            <label style={{ fontSize:"12px", letterSpacing:"2px", textTransform:"uppercase", color:"rgba(232,223,208,.45)", display:"block", marginBottom:"8px" }}>Vista previa</label>
            <div style={{ display:"inline-flex", alignItems:"center", gap:"6px", background:PALETTE[form.colorIdx].bg, color:PALETTE[form.colorIdx].tc, borderRadius:"9px", padding:"7px 14px", fontSize:"15px", fontWeight:600, boxShadow:"0 2px 8px rgba(0,0,0,.3)", marginBottom:"20px" }}>
              {form.emoji} {form.name || "Nombre del alimento"}
            </div>

            <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
              <button className="btn-green" onClick={handleSave} style={{ flex:1 }}>
                {editing ? "💾 Guardar cambios" : "✅ Agregar"}
              </button>
              {editing && <button className="btn-red" onClick={handleDelete}>🗑️ Eliminar</button>}
              <button className="btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL RESET ── */}
      {showConfirm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:"20px" }}>
          <div className="modal-panel" style={{ background:"#1a2e1f", border:"1px solid rgba(232,223,208,.12)", borderRadius:"16px", padding:"28px", maxWidth:"340px", textAlign:"center" }}>
            <div style={{ fontSize:"44px", marginBottom:"12px" }}>🔄</div>
            <h2 style={{ fontSize:"22px", marginBottom:"8px" }}>¿Nueva semana?</h2>
            <p style={{ fontSize:"15px", color:"rgba(232,223,208,.5)", marginBottom:"24px" }}>
              Todos los bloques vuelven a disponibles. Tus alimentos configurados se mantienen.
            </p>
            <div style={{ display:"flex", gap:"10px", justifyContent:"center" }}>
              <button className="btn-green" onClick={resetWeek}>Sí, empezar de cero</button>
              <button className="btn-ghost" onClick={() => setShowConfirm(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}