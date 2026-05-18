import { useState, useRef } from 'react';

const PLAYERS = ['Nivare', 'Xalithra', 'Luz-Ya', 'Mireya', 'Kang'];

const LEVEL_COLORS = [
  '#5c0a0a', '#8b1a1a', '#c0392b', '#d35400', '#e67e22',
  '#f1c40f', '#27ae60', '#2980b9', '#3498db', '#5dade2', '#aed6f1',
];

// ── Normalización de datos ───────────────────────────────────────────────────
function ensureItem(v) {
  if (!v) return { nombre: '', descripcion: '' };
  if (typeof v === 'string') return { nombre: v, descripcion: '' };
  return { nombre: v.nombre ?? '', descripcion: v.descripcion ?? '' };
}
function ensureFortaleza(v) {
  if (!v) return { nombre: '', nivel: 5 };
  if (typeof v === 'string') return { nombre: v, nivel: 5 };
  return { nombre: v.nombre ?? '', nivel: typeof v.nivel === 'number' ? v.nivel : 5 };
}
function ensureChar(raw) {
  return {
    avatar:     raw?.avatar     ?? null,
    nombre:     raw?.nombre     ?? '',
    raza:       raw?.raza       ?? '',
    clase:      raw?.clase      ?? '',
    arquetipo:  raw?.arquetipo  ?? raw?.profesion ?? '',
    afiliacion: raw?.afiliacion ?? '',
    creditos:      { enPosesion: raw?.creditos?.enPosesion      ?? '', enElBanco: raw?.creditos?.enElBanco      ?? '' },
    realesDeAOcho: { enPosesion: raw?.realesDeAOcho?.enPosesion ?? '', enElBanco: raw?.realesDeAOcho?.enElBanco ?? '' },
    inventario:           Array.isArray(raw?.inventario)           ? raw.inventario.map(ensureItem)       : [],
    habilidadesEspeciales: Array.isArray(raw?.habilidadesEspeciales) ? raw.habilidadesEspeciales.map(ensureItem) : [],
    fortalezas:           Array.isArray(raw?.fortalezas)           ? raw.fortalezas.map(ensureFortaleza) : [],
  };
}

// ── Estilos compartidos ──────────────────────────────────────────────────────
const LABEL = { fontFamily:'Orbitron,monospace', fontSize:'7.5px', letterSpacing:'0.12em', color:'rgba(0,212,255,0.5)', textTransform:'uppercase', whiteSpace:'nowrap', flexShrink:0 };
const VALUE = { fontFamily:'Rajdhani,sans-serif', fontSize:'13px', color:'#e0e8f0', flex:1, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' };
const EDIT_INPUT = { background:'transparent', border:'none', borderBottom:'1px solid rgba(0,212,255,0.4)', color:'#e0e8f0', fontFamily:'Rajdhani,sans-serif', fontSize:'13px', padding:'1px 2px', outline:'none', flex:1, minWidth:0, caretColor:'#00d4ff', width:'100%' };
const GLOW_LINE   = { height:'1px', background:'linear-gradient(to right,rgba(0,212,255,0.35),rgba(0,212,255,0.08),transparent)', marginTop:'3px' };
const GOLD_LINE   = { height:'1px', background:'linear-gradient(to right,rgba(255,215,0,0.4),rgba(255,215,0,0.08),transparent)',   marginTop:'3px' };
const PURPLE_LINE = { height:'1px', background:'linear-gradient(to right,rgba(124,58,237,0.4),rgba(124,58,237,0.08),transparent)', marginTop:'3px' };

const BASIC_FIELDS = [
  { label:'NOMBRE',    key:'nombre'    },
  { label:'RAZA',      key:'raza'      },
  { label:'CLASE',     key:'clase'     },
  { label:'ARQUETIPO', key:'arquetipo' },
  { label:'AFILIACIÓN',key:'afiliacion'},
];

// ── Componentes decorativos ──────────────────────────────────────────────────
function Corner({ pos }) {
  const map = {
    tl:{ top:0,    left:0,  borderTop:'1px solid rgba(0,212,255,0.55)',    borderLeft:'1px solid rgba(0,212,255,0.55)'  },
    tr:{ top:0,    right:0, borderTop:'1px solid rgba(0,212,255,0.55)',    borderRight:'1px solid rgba(0,212,255,0.55)' },
    bl:{ bottom:0, left:0,  borderBottom:'1px solid rgba(0,212,255,0.55)', borderLeft:'1px solid rgba(0,212,255,0.55)'  },
    br:{ bottom:0, right:0, borderBottom:'1px solid rgba(0,212,255,0.55)', borderRight:'1px solid rgba(0,212,255,0.55)' },
  };
  return <div style={{ position:'absolute', width:'10px', height:'10px', ...map[pos] }} />;
}

function DividerCircle() {
  return (
    <div style={{ width:'14px', height:'14px', borderRadius:'50%', flexShrink:0, border:'1px solid rgba(0,212,255,0.45)', boxShadow:'0 0 8px rgba(0,212,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:'4px', height:'4px', borderRadius:'50%', background:'#00d4ff', boxShadow:'0 0 6px rgba(0,212,255,0.9)' }} />
    </div>
  );
}

// ── Divisor de energía animado — se extiende por las 3 filas ─────────────────
function EnergyDivider() {
  const tick = (pct, wide = false) => (
    <>
      <div style={{ position:'absolute', top:`${pct}%`, left:'50%', transform:'translateX(-50%)', width: wide ? '20px' : '14px', height:'1px', background:'rgba(0,212,255,0.35)' }} />
      <div style={{ position:'absolute', top:`${pct}%`, left:'50%', transform:'translate(-50%,-50%)', width:'5px', height:'5px', borderRadius:'50%', background:'rgba(0,212,255,0.55)', boxShadow:'0 0 6px rgba(0,212,255,0.5)' }} />
    </>
  );
  return (
    <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center' }}>
      {/* Línea con margen en extremos para no llegar al borde del recuadro */}
      <div style={{ position:'absolute', top:'10px', bottom:'10px', left:'50%', width:'1px', marginLeft:'-0.5px', background:'linear-gradient(to bottom,transparent 0%,rgba(0,212,255,0.55) 15%,rgba(0,212,255,0.3) 50%,rgba(0,212,255,0.55) 85%,transparent 100%)', animation:'energy-line-pulse 2s ease-in-out infinite' }} />

      {tick(33, true)} {/* límite fila 1/2 */}
      {tick(67, true)} {/* límite fila 2/3 */}

      {/* Runa central (50%) */}
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'26px', height:'26px', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ position:'absolute', width:'22px', height:'22px', border:'1px solid rgba(0,212,255,0.18)', transform:'rotate(45deg)' }} />
        <div style={{ position:'absolute', width:'14px', height:'14px', border:'1px solid rgba(0,212,255,0.65)', background:'rgba(0,212,255,0.06)', animation:'rune-rotate 3.5s linear infinite' }} />
        <div style={{ position:'absolute', width:'8px',  height:'8px',  border:'1px solid rgba(0,212,255,0.4)', animation:'rune-counter 2.5s linear infinite', transform:'rotate(45deg)' }} />
        <div style={{ position:'absolute', width:'4px',  height:'4px',  borderRadius:'50%', background:'#00d4ff', boxShadow:'0 0 10px rgba(0,212,255,1),0 0 20px rgba(0,212,255,0.6)', animation:'rune-glow-pulse 2s ease-in-out infinite' }} />
      </div>

      {/* Partículas */}
      <div style={{ position:'absolute', left:'50%', transform:'translateX(-50%)', width:'2px', height:'14px', borderRadius:'1px', background:'linear-gradient(to bottom,transparent,#00d4ff 50%,transparent)', boxShadow:'0 0 5px rgba(0,212,255,0.7)', animation:'energy-flow-down 3s ease-in-out infinite' }} />
      <div style={{ position:'absolute', left:'50%', transform:'translateX(-50%)', width:'2px', height:'9px',  borderRadius:'1px', background:'linear-gradient(to top,transparent,rgba(0,212,255,0.85) 50%,transparent)', boxShadow:'0 0 4px rgba(0,212,255,0.6)', animation:'energy-flow-up 3.5s ease-in-out 1.4s infinite' }} />
      <div style={{ position:'absolute', left:'50%', transform:'translateX(-50%)', width:'2px', height:'10px', borderRadius:'1px', background:'linear-gradient(to bottom,transparent,rgba(0,212,255,0.6) 50%,transparent)', animation:'energy-flow-down 3s ease-in-out 1.6s infinite' }} />
      <div style={{ position:'absolute', left:'50%', transform:'translateX(-50%)', width:'2px', height:'7px',  borderRadius:'1px', background:'linear-gradient(to top,transparent,rgba(0,212,255,0.5) 50%,transparent)', animation:'energy-flow-up 3.5s ease-in-out 3s infinite' }} />
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function CharacterSheet({ username, isMaster, characters, onUpdate }) {
  const [selectedPlayer, setSelectedPlayer] = useState(isMaster ? PLAYERS[0] : username);
  const [isEditing, setIsEditing]           = useState(false);
  const [draft, setDraft]                   = useState(null);
  const [isDragOver, setIsDragOver]         = useState(false);
  const [topExpanded, setTopExpanded]       = useState(true);
  const [tooltip, setTooltip]               = useState(null); // { x, y, goLeft, text }
  const fileRef  = useRef(null);
  const panelRef = useRef(null);

  const targetUser = isMaster ? selectedPlayer : username;
  const char = ensureChar(characters[targetUser]);
  const data = isEditing ? draft : char;

  // ── Helpers ───────────────────────────────────────────────────────────────
  const set       = (k, v)       => setDraft(p => ({ ...p, [k]: v }));
  const setNested = (o, k, v)    => setDraft(p => ({ ...p, [o]: { ...p[o], [k]: v } }));
  const setItemField = (arr, i, f, v) => setDraft(p => { const a = [...p[arr]]; a[i] = { ...a[i], [f]: v }; return { ...p, [arr]: a }; });
  const addItem   = (arr)        => setDraft(p => ({ ...p, [arr]: [...p[arr], arr === 'fortalezas' ? { nombre:'', nivel:5 } : { nombre:'', descripcion:'' }] }));
  const removeItem= (arr, i)     => setDraft(p => ({ ...p, [arr]: p[arr].filter((_,j) => j !== i) }));

  function startEdit()   { setDraft(JSON.parse(JSON.stringify(char))); setIsEditing(true); }
  function cancelEdit()  { setDraft(null); setIsEditing(false); }
  function confirmEdit() { onUpdate(targetUser, draft); setDraft(null); setIsEditing(false); }

  function handleDrop(e) {
    e.preventDefault(); setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file?.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = ev => set('avatar', ev.target.result);
    reader.readAsDataURL(file);
  }
  function handleFile(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => set('avatar', ev.target.result);
    reader.readAsDataURL(file); e.target.value = '';
  }

  // Tooltip de hover (seguimiento del ratón, relativo al panel)
  function trackTooltip(e, text) {
    if (!text) { setTooltip(null); return; }
    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTooltip({ x, y, goLeft: x > rect.width * 0.5, text });
  }

  // ── Sección de items con tooltip ──────────────────────────────────────────
  function renderItemSection({ arrKey, label, accentColor, bulletColor, emptyText }) {
    const items = data?.[arrKey] ?? [];
    const readItems = items.filter(it => it.nombre);
    return (
      <div className="glass-panel rounded-sm" style={{ flex:1, padding:'10px', minWidth:0 }}>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:'7px', letterSpacing:'0.15em', color:accentColor, textAlign:'center', marginBottom:'8px', borderBottom:`1px solid ${accentColor}22`, paddingBottom:'6px' }}>
          {label}
        </div>

        {!isEditing && (
          <>
            {readItems.length === 0 && <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:'11px', color:'rgba(0,212,255,0.2)', textAlign:'center', padding:'8px 0' }}>{emptyText}</div>}
            {readItems.map((item, i) => (
              <div
                key={i}
                style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'5px', cursor: item.descripcion ? 'help' : 'default', padding:'2px 0' }}
                onMouseMove={e => trackTooltip(e, item.descripcion)}
                onMouseLeave={() => setTooltip(null)}
              >
                <div style={{ width:'7px', height:'7px', borderRadius:'50%', flexShrink:0, border:`1px solid ${bulletColor}`, background:`${bulletColor}55`, boxShadow:`0 0 5px ${bulletColor}66` }} />
                <span style={{ fontFamily: arrKey === 'inventario' ? 'Share Tech Mono,monospace' : 'Rajdhani,sans-serif', fontSize:'11px', color:'#c8d4e0', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.nombre}</span>
                {item.descripcion && <span style={{ fontSize:'8px', color:'rgba(0,212,255,0.3)', flexShrink:0 }}>···</span>}
              </div>
            ))}
          </>
        )}

        {isEditing && (
          <>
            {items.map((item, i) => (
              <div key={i} style={{ marginBottom:'8px', padding:'6px 8px', background:'rgba(0,212,255,0.03)', border:'1px solid rgba(0,212,255,0.1)', borderRadius:'2px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'4px', marginBottom:'4px' }}>
                  <div style={{ width:'7px', height:'7px', borderRadius:'50%', flexShrink:0, border:`1px solid ${bulletColor}`, background:`${bulletColor}44` }} />
                  <input type="text" value={item.nombre} onChange={e => setItemField(arrKey, i, 'nombre', e.target.value)} placeholder="Nombre..." style={{ ...EDIT_INPUT, fontSize:'12px', fontWeight:600 }} />
                  <button onClick={() => removeItem(arrKey, i)} style={{ background:'transparent', border:'none', cursor:'pointer', color:'rgba(255,68,68,0.6)', fontSize:'14px', padding:'0 2px', lineHeight:1, flexShrink:0 }}>×</button>
                </div>
                <textarea value={item.descripcion} onChange={e => setItemField(arrKey, i, 'descripcion', e.target.value)} placeholder="Descripción (aparece al pasar el ratón)..." rows={2}
                  style={{ background:'rgba(0,0,0,0.2)', border:'1px solid rgba(0,212,255,0.18)', color:'rgba(200,215,230,0.8)', fontFamily:'Rajdhani,sans-serif', fontSize:'11px', padding:'4px 6px', outline:'none', width:'100%', resize:'vertical', caretColor:'#00d4ff', lineHeight:1.4, borderRadius:'1px' }} />
              </div>
            ))}
            <button className="cyber-btn" onClick={() => addItem(arrKey)} style={{ width:'100%', fontSize:'7.5px', padding:'5px', borderColor:`${accentColor}88`, color:accentColor, marginTop: items.length > 0 ? '4px' : 0 }}>+ AÑADIR</button>
          </>
        )}
      </div>
    );
  }

  // ── Mis Fortalezas ─────────────────────────────────────────────────────────
  function renderFortalezas() {
    const items = data?.fortalezas ?? [];
    return (
      <div className="glass-panel rounded-sm" style={{ flex:1, padding:'10px', minWidth:0 }}>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:'7px', letterSpacing:'0.15em', color:'rgba(0,212,255,0.6)', textAlign:'center', marginBottom:'8px', borderBottom:'1px solid rgba(0,212,255,0.08)', paddingBottom:'6px' }}>
          MIS FORTALEZAS
        </div>
        {!isEditing && (
          <>
            {items.filter(f => f.nombre).length === 0 && <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:'11px', color:'rgba(0,212,255,0.2)', textAlign:'center', padding:'8px 0' }}>Sin fortalezas</div>}
            {items.filter(f => f.nombre).map((f, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'5px' }}>
                <div style={{ width:'10px', height:'10px', borderRadius:'2px', flexShrink:0, background:LEVEL_COLORS[f.nivel], boxShadow:`0 0 6px ${LEVEL_COLORS[f.nivel]}88` }} />
                <span style={{ fontFamily:'Rajdhani,sans-serif', fontSize:'11px', color:'#c8d4e0', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.nombre}</span>
              </div>
            ))}
          </>
        )}
        {isEditing && (
          <>
            {items.map((f, i) => (
              <div key={i} style={{ marginBottom:'8px', padding:'6px 8px', background:'rgba(0,212,255,0.03)', border:'1px solid rgba(0,212,255,0.1)', borderRadius:'2px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'4px', marginBottom:'6px' }}>
                  <div style={{ width:'10px', height:'10px', borderRadius:'2px', flexShrink:0, background:LEVEL_COLORS[f.nivel], boxShadow:`0 0 6px ${LEVEL_COLORS[f.nivel]}66`, transition:'background 0.2s' }} />
                  <input type="text" value={f.nombre} onChange={e => setItemField('fortalezas', i, 'nombre', e.target.value)} placeholder="Nombre de la fortaleza..." style={{ ...EDIT_INPUT, fontSize:'12px', fontWeight:600 }} />
                  <button onClick={() => removeItem('fortalezas', i)} style={{ background:'transparent', border:'none', cursor:'pointer', color:'rgba(255,68,68,0.6)', fontSize:'14px', padding:'0 2px', lineHeight:1, flexShrink:0 }}>×</button>
                </div>
                {/* Slider de nivel */}
                <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                  <span style={{ fontFamily:'Orbitron,monospace', fontSize:'6px', color:LEVEL_COLORS[0], flexShrink:0 }}>0</span>
                  <input
                    type="range" min="0" max="10" step="1"
                    value={f.nivel}
                    onChange={e => setItemField('fortalezas', i, 'nivel', parseInt(e.target.value))}
                    className="strength-slider"
                    style={{ '--level-color': LEVEL_COLORS[f.nivel] }}
                  />
                  <span style={{ fontFamily:'Orbitron,monospace', fontSize:'6px', color:LEVEL_COLORS[10], flexShrink:0 }}>10</span>
                  <span style={{ fontFamily:'Orbitron,monospace', fontSize:'9px', fontWeight:700, color:LEVEL_COLORS[f.nivel], textShadow:`0 0 8px ${LEVEL_COLORS[f.nivel]}99`, minWidth:'16px', textAlign:'center', flexShrink:0, transition:'color 0.2s' }}>{f.nivel}</span>
                </div>
              </div>
            ))}
            <button className="cyber-btn" onClick={() => addItem('fortalezas')} style={{ width:'100%', fontSize:'7.5px', padding:'5px' }}>+ AÑADIR</button>
          </>
        )}
      </div>
    );
  }

  // ── Contactos del Comunicador (estático) ──────────────────────────────────
  function renderContactos() {
    return (
      <div className="glass-panel rounded-sm" style={{ flex:1, padding:'10px', display:'flex', flexDirection:'column' }}>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:'6.5px', letterSpacing:'0.1em', color:'rgba(0,212,255,0.6)', textAlign:'center', marginBottom:'10px', borderBottom:'1px solid rgba(0,212,255,0.08)', paddingBottom:'6px', lineHeight:1.5 }}>
          COMUNICADOR
        </div>
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'6px 0' }}>
          {/* Símbolo prohibido */}
          <div style={{ width:'44px', height:'44px', borderRadius:'50%', border:'2.5px solid rgba(255,68,68,0.4)', position:'relative', marginBottom:'10px', boxShadow:'0 0 14px rgba(255,68,68,0.12), inset 0 0 10px rgba(255,68,68,0.04)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ position:'absolute', width:'2.5px', height:'40px', background:'rgba(255,68,68,0.4)', transform:'rotate(45deg)', borderRadius:'2px', boxShadow:'0 0 6px rgba(255,68,68,0.3)' }} />
          </div>
          <span style={{ fontFamily:'Orbitron,monospace', fontSize:'7.5px', letterSpacing:'0.3em', color:'rgba(255,68,68,0.45)', textShadow:'0 0 10px rgba(255,68,68,0.25)' }}>BLOQUEADO</span>
        </div>
      </div>
    );
  }

  // ── Panel de moneda (créditos o reales) ───────────────────────────────────
  function renderCurrencyPanel({ title, titleColor, titleShadow, objKey, lineStyle }) {
    return (
      <div className="glass-panel rounded-sm" style={{ padding:'12px 14px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'10px', paddingBottom:'7px', borderBottom:'1px solid rgba(0,212,255,0.1)' }}>
          <div style={{ flex:1, height:'1px', background:`linear-gradient(to right,transparent,${titleColor}55)` }} />
          <span style={{ fontFamily:'Orbitron,monospace', fontSize:'7px', letterSpacing:'0.18em', color:titleColor, textShadow:titleShadow, whiteSpace:'nowrap' }}>{title}</span>
          <div style={{ flex:1, height:'1px', background:`linear-gradient(to left,transparent,${titleColor}55)` }} />
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          {[['EN POSESIÓN','enPosesion'],['EN EL BANCO','enElBanco']].map(([lbl, fk], idx) => (
            <div key={fk} style={{ flex:1, minWidth:0 }}>
              <span style={{ ...LABEL, display:'block', marginBottom:'4px', fontSize:'6.5px', color:`${titleColor}77` }}>{lbl}</span>
              {isEditing
                ? <input type="text" value={data?.[objKey]?.[fk] ?? ''} onChange={e => setNested(objKey, fk, e.target.value)} style={{ ...EDIT_INPUT, flex:'none', fontSize:'14px', borderBottomColor:`${titleColor}66` }} />
                : <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:'22px', fontWeight:700, color:titleColor, textShadow:`0 0 14px ${titleColor}bb, 0 0 28px ${titleColor}44`, letterSpacing:'0.03em' }}>{data?.[objKey]?.[fk] || '—'}</div>
              }
              {idx === 0 && <div style={{ width:'1px', background:`${titleColor}22`, position:'absolute', top:0, bottom:0, right:0 }} />}
              <div style={lineStyle} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div
      ref={panelRef}
      className="glass-panel-bright rounded-sm"
      style={{ display:'flex', flexDirection:'column', height:'100%', minHeight:0, position:'relative' }}
    >
      {/* Esquinas HUD */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:1 }}>
        <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
      </div>

      {/* ── CABECERA ──────────────────────────────────────────────────────── */}
      <div style={{ padding:'10px 16px 8px', borderBottom:'1px solid rgba(0,212,255,0.12)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
          <div style={{ flex:1, height:'1px', background:'linear-gradient(to right,transparent,rgba(0,212,255,0.4))' }} />
          <span style={{ fontFamily:'Orbitron,monospace', fontSize:'9px', letterSpacing:'0.22em', color:'#00d4ff', textShadow:'0 0 10px rgba(0,212,255,0.6)', whiteSpace:'nowrap' }}>FICHA DE PERSONAJE</span>
          <div style={{ flex:1, height:'1px', background:'linear-gradient(to left,transparent,rgba(0,212,255,0.4))' }} />
        </div>
        {isMaster ? (
          <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
            <select value={selectedPlayer} onChange={e => { setSelectedPlayer(e.target.value); cancelEdit(); }} className="cyber-input" style={{ flex:1, fontSize:'10px', padding:'3px 28px 3px 10px', height:'28px' }}>
              {PLAYERS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {!isEditing && <button className="cyber-btn" style={{ fontSize:'7.5px', padding:'4px 10px', flexShrink:0 }} onClick={startEdit}>EDITAR FICHA</button>}
          </div>
        ) : (
          <div style={{ fontFamily:'Orbitron,monospace', fontSize:'8px', letterSpacing:'0.15em', color:'rgba(0,212,255,0.4)', textAlign:'center' }}>{username.toUpperCase()}</div>
        )}
      </div>

      {/* ── CUERPO DESPLAZABLE ────────────────────────────────────────────── */}
      <div style={{ flex:1, overflowY:'auto', padding:'14px 16px 12px' }}>

        {/* Panel superior plegable */}
        {topExpanded && (<div style={{ display:'flex', gap:'14px', marginBottom:'14px' }}>

          {/* Avatar */}
          <div
            onClick={() => isEditing && fileRef.current?.click()}
            onDrop={isEditing ? handleDrop : undefined}
            onDragOver={isEditing ? e => { e.preventDefault(); setIsDragOver(true); } : undefined}
            onDragLeave={isEditing ? () => setIsDragOver(false) : undefined}
            style={{ width:'100px', height:'130px', flexShrink:0, border:`1px solid ${isDragOver?'rgba(0,212,255,0.9)':isEditing?'rgba(0,212,255,0.55)':'rgba(0,212,255,0.28)'}`, background:isDragOver?'rgba(0,212,255,0.12)':'rgba(0,212,255,0.03)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:isEditing?'pointer':'default', transition:'all 0.2s', position:'relative', overflow:'hidden', boxShadow:isEditing?'0 0 16px rgba(0,212,255,0.15)':'none' }}
          >
            {['tl','tr','bl','br'].map(p => <Corner key={p} pos={p} />)}
            {data?.avatar ? (
              <>
                <img src={data.avatar} alt="Avatar" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
                {isEditing && <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'4px' }}><span style={{ fontSize:'18px', color:'#00d4ff' }}>⇪</span><span style={{ fontFamily:'Orbitron,monospace', fontSize:'7px', color:'#00d4ff', letterSpacing:'0.1em' }}>{isDragOver?'SOLTAR':'CAMBIAR'}</span></div>}
              </>
            ) : (
              <>
                <span style={{ fontSize:'32px', color:'rgba(0,212,255,0.18)', textShadow:'0 0 20px rgba(0,212,255,0.3)', lineHeight:1, zIndex:1 }}>?</span>
                <span style={{ fontFamily:'Orbitron,monospace', fontSize:'6px', letterSpacing:'0.1em', color:'rgba(0,212,255,0.28)', marginTop:'10px', zIndex:1, textAlign:'center', lineHeight:1.6 }}>{isEditing?(isDragOver?'SOLTAR\nAQUÍ':'ARRASTRAR\nO CLICK'):'EN\nESPERA'}</span>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFile} />

          {/* Campos básicos */}
          <div style={{ flex:1, minWidth:0 }}>
            {BASIC_FIELDS.map(({ label, key }) => (
              <div key={key} style={{ marginBottom:'6px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <span style={{ ...LABEL, minWidth:'72px' }}>{label}</span>
                  {isEditing
                    ? <input type="text" value={data?.[key] ?? ''} onChange={e => set(key, e.target.value)} style={EDIT_INPUT} />
                    : <span style={VALUE}>{data?.[key] || '—'}</span>
                  }
                </div>
                {!isEditing && <div style={GLOW_LINE} />}
              </div>
            ))}
          </div>
        </div>)}

        {/* Separador plegable */}
        <button onClick={() => setTopExpanded(e => !e)} style={{ width:'100%', display:'flex', alignItems:'center', gap:'8px', marginBottom:'20px', background:'transparent', border:'none', cursor:'pointer', padding:'4px 0' }}>
          <div style={{ flex:1, height:'1px', background:'linear-gradient(to right,transparent,rgba(0,212,255,0.25))' }} />
          <span style={{ fontFamily:'Orbitron,monospace', fontSize:'6px', letterSpacing:'0.15em', color:'rgba(0,212,255,0.5)', padding:'3px 10px', border:'1px solid rgba(0,212,255,0.22)', borderRadius:'1px', display:'flex', alignItems:'center', gap:'5px', flexShrink:0, whiteSpace:'nowrap' }}>
            {topExpanded ? '▲' : '▼'} PERSONAJE
          </span>
          <div style={{ flex:1, height:'1px', background:'linear-gradient(to left,transparent,rgba(0,212,255,0.25))' }} />
        </button>

        {/* ── GRID PRINCIPAL: CSS Grid — alturas simétricas por fila ─────── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 32px 1fr', rowGap:'8px', marginBottom:'14px' }}>

          {/* Fila 1 */}
          <div style={{ gridColumn:1, gridRow:1 }}>
            {renderCurrencyPanel({ title:'CRÉDITOS', titleColor:'#ffd700', titleShadow:'0 0 10px rgba(255,215,0,0.5)', objKey:'creditos', lineStyle:GOLD_LINE })}
          </div>
          <div style={{ gridColumn:2, gridRow:'1 / 4', position:'relative' }}>
            <EnergyDivider />
          </div>
          <div style={{ gridColumn:3, gridRow:1 }}>
            {renderCurrencyPanel({ title:'REALES DE A OCHO', titleColor:'rgba(200,165,255,1)', titleShadow:'0 0 10px rgba(124,58,237,0.6)', objKey:'realesDeAOcho', lineStyle:PURPLE_LINE })}
          </div>

          {/* Fila 2 */}
          <div style={{ gridColumn:1, gridRow:2, display:'flex', flexDirection:'column' }}>
            {renderItemSection({ arrKey:'inventario', label:'OBJETOS IMPORTANTES', accentColor:'rgba(0,212,255,0.6)', bulletColor:'rgba(0,212,255,0.7)', emptyText:'Sin objetos' })}
          </div>
          <div style={{ gridColumn:3, gridRow:2, display:'flex', flexDirection:'column' }}>
            {renderItemSection({ arrKey:'habilidadesEspeciales', label:'HABILIDADES ESPECIALES', accentColor:'rgba(0,255,136,0.6)', bulletColor:'rgba(0,255,136,0.7)', emptyText:'Sin habilidades' })}
          </div>

          {/* Fila 3 */}
          <div style={{ gridColumn:1, gridRow:3, display:'flex', flexDirection:'column' }}>
            {renderContactos()}
          </div>
          <div style={{ gridColumn:3, gridRow:3, display:'flex', flexDirection:'column' }}>
            {renderFortalezas()}
          </div>
        </div>

        {/* Controles de edición */}
        {isMaster && isEditing && (
          <div style={{ display:'flex', gap:'8px', marginTop:'4px' }}>
            <button className="cyber-btn" style={{ flex:1, fontSize:'8px', padding:'7px', borderColor:'rgba(0,255,136,0.5)', color:'rgba(0,255,136,0.85)' }} onClick={confirmEdit}>CONFIRMAR</button>
            <button className="cyber-btn" style={{ flex:1, fontSize:'8px', padding:'7px', borderColor:'rgba(255,68,68,0.4)', color:'rgba(255,68,68,0.75)' }} onClick={cancelEdit}>CANCELAR</button>
          </div>
        )}
      </div>

      {/* ── TOOLTIP holográfico (position:absolute, fuera del scroll) ────── */}
      {tooltip && (
        <div
          style={{
            position:'absolute',
            left: Math.max(8, tooltip.goLeft ? tooltip.x - 244 : tooltip.x + 14),
            top:  Math.max(8, tooltip.y - 20),
            zIndex:100, pointerEvents:'none',
            maxWidth:'220px', minWidth:'120px',
            background:'rgba(7,9,15,0.97)',
            border:'1px solid rgba(0,212,255,0.38)',
            borderRadius:'2px',
            padding:'9px 11px',
            boxShadow:'0 0 24px rgba(0,212,255,0.12), 0 6px 24px rgba(0,0,0,0.8)',
            animation:'tooltip-scan 0.2s ease-out',
          }}
        >
          {/* Esquinas del tooltip */}
          {['tl','tr','bl','br'].map(p => <Corner key={p} pos={p} />)}
          <p style={{ margin:0, fontFamily:'Rajdhani,sans-serif', fontSize:'11.5px', color:'rgba(195,215,235,0.92)', lineHeight:1.55, whiteSpace:'pre-wrap' }}>
            {tooltip.text}
          </p>
        </div>
      )}
    </div>
  );
}
