import { useState, useRef, useEffect } from 'react';

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
  if (!v) return { nombre: '', nivel: 5, descripcion: '' };
  if (typeof v === 'string') return { nombre: v, nivel: 5, descripcion: '' };
  return { nombre: v.nombre ?? '', nivel: typeof v.nivel === 'number' ? v.nivel : 5, descripcion: v.descripcion ?? '' };
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
    notas:      raw?.notas ?? '',
    estado:     raw?.estado ?? 'Intacto',
  };
}

// ── Estados del personaje ────────────────────────────────────────────────────
const STATUS_STYLES = {
  'Intacto':          { color:'#00e676', rgb:'0,230,118'   },
  'Herido leve':      { color:'#ffd700', rgb:'255,215,0'   },
  'Herido grave':     { color:'#ff8c00', rgb:'255,140,0'   },
  'Enfermo':          { color:'#c084fc', rgb:'192,132,252' },
  'Aturdido':         { color:'#94a3b8', rgb:'148,163,184' },
  'Lesionado':        { color:'#a855f7', rgb:'168,85,247'  },
  'Heridas críticas': { color:'#ff4444', rgb:'255,68,68', pulse:true },
};

// ── Estilos compartidos ──────────────────────────────────────────────────────
const LABEL = { fontFamily:'Orbitron,monospace', fontSize:'7.5px', letterSpacing:'0.12em', color:'rgba(var(--cyan-rgb),0.5)', textTransform:'uppercase', whiteSpace:'nowrap', flexShrink:0 };
const VALUE = { fontFamily:'Rajdhani,sans-serif', fontSize:'13px', color:'#e0e8f0', flex:1, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' };
const EDIT_INPUT = { background:'transparent', border:'none', borderBottom:'1px solid rgba(var(--cyan-rgb),0.4)', color:'#e0e8f0', fontFamily:'Rajdhani,sans-serif', fontSize:'13px', padding:'1px 2px', outline:'none', flex:1, minWidth:0, caretColor:'var(--cyan)', width:'100%' };
const GLOW_LINE   = { height:'1px', background:'linear-gradient(to right,rgba(var(--cyan-rgb),0.35),rgba(var(--cyan-rgb),0.08),transparent)', marginTop:'3px' };
const GOLD_LINE   = { height:'1px', background:'linear-gradient(to right,rgba(255,215,0,0.4),rgba(255,215,0,0.08),transparent)',   marginTop:'3px' };
const BROWN_LINE     = { height:'1px', background:'linear-gradient(to right,rgba(200,150,106,0.4),rgba(200,150,106,0.08),transparent)', marginTop:'3px' };

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
    tl:{ top:0,    left:0,  borderTop:'1px solid rgba(var(--cyan-rgb),0.55)',    borderLeft:'1px solid rgba(var(--cyan-rgb),0.55)'  },
    tr:{ top:0,    right:0, borderTop:'1px solid rgba(var(--cyan-rgb),0.55)',    borderRight:'1px solid rgba(var(--cyan-rgb),0.55)' },
    bl:{ bottom:0, left:0,  borderBottom:'1px solid rgba(var(--cyan-rgb),0.55)', borderLeft:'1px solid rgba(var(--cyan-rgb),0.55)'  },
    br:{ bottom:0, right:0, borderBottom:'1px solid rgba(var(--cyan-rgb),0.55)', borderRight:'1px solid rgba(var(--cyan-rgb),0.55)' },
  };
  return <div style={{ position:'absolute', width:'10px', height:'10px', ...map[pos] }} />;
}

// ── Separador discreto entre columnas ───────────────────────────────────────
function SectionDivider() {
  return (
    <div style={{ position:'absolute', inset:0 }}>
      <div style={{ position:'absolute', top:'8px', bottom:'8px', left:'50%', width:'1px', transform:'translateX(-50%)',
        background:'linear-gradient(to bottom, transparent, rgba(var(--cyan-rgb),0.2) 15%, rgba(var(--cyan-rgb),0.12) 85%, transparent)' }} />
      {[33, 67].map(pct => (
        <div key={pct} style={{ position:'absolute', top:`${pct}%`, left:'50%', width:'5px', height:'5px',
          transform:'translate(-50%,-50%) rotate(45deg)',
          border:'1px solid rgba(var(--cyan-rgb),0.3)', background:'rgba(var(--cyan-rgb),0.05)' }} />
      ))}
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function CharacterSheet({ username, isMaster, characters, onUpdate, onUpdateNotes, fortalezasCatalog = [] }) {
  const [selectedPlayer, setSelectedPlayer] = useState(isMaster ? PLAYERS[0] : username);
  const [isEditing, setIsEditing]           = useState(false);
  const [draft, setDraft]                   = useState(null);
  const [isDragOver, setIsDragOver]         = useState(false);
  const [topExpanded, setTopExpanded]       = useState(true);
  const [tooltip, setTooltip]               = useState(null); // { x, y, goLeft, text }
  const [isEditingNotas, setIsEditingNotas] = useState(false);
  const [notasDraft, setNotasDraft]         = useState('');
  const [fortPickOpen, setFortPickOpen]     = useState(false);
  const [fortPickName, setFortPickName]     = useState('');
  const [fortPickLevel, setFortPickLevel]   = useState(5);
  const fileRef  = useRef(null);
  const panelRef = useRef(null);

  const targetUser = isMaster ? selectedPlayer : username;
  const char = ensureChar(characters[targetUser]);
  const data = isEditing ? draft : char;

  // Resetea el estado de notas al cambiar de jugador (relevante para el Master)
  useEffect(() => {
    setIsEditingNotas(false);
    setNotasDraft('');
  }, [targetUser]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const set       = (k, v)       => setDraft(p => ({ ...p, [k]: v }));
  const setNested = (o, k, v)    => setDraft(p => ({ ...p, [o]: { ...p[o], [k]: v } }));
  const setItemField = (arr, i, f, v) => setDraft(p => { const a = [...p[arr]]; a[i] = { ...a[i], [f]: v }; return { ...p, [arr]: a }; });
  const addItem   = (arr)        => setDraft(p => ({ ...p, [arr]: [...p[arr], arr === 'fortalezas' ? { nombre:'', nivel:5 } : { nombre:'', descripcion:'' }] }));
  const removeItem= (arr, i)     => setDraft(p => ({ ...p, [arr]: p[arr].filter((_,j) => j !== i) }));

  function startEdit()   { setDraft(JSON.parse(JSON.stringify(char))); setIsEditing(true); }
  function cancelEdit()  { setDraft(null); setIsEditing(false); setFortPickOpen(false); setFortPickName(''); setFortPickLevel(5); }
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
  function renderItemSection({ arrKey, label, accentColor, bulletColor, emptyText, logo }) {
    const items = data?.[arrKey] ?? [];
    const readItems = items.filter(it => it.nombre);
    return (
      <div className="glass-panel rounded-sm" style={{ flex:1, padding:'10px', minWidth:0 }}>
        {logo ? (
          <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'8px' }}>
            <div style={{ flex:1, height:'1px', background:`linear-gradient(to right,transparent,${accentColor}55)` }} />
            <span style={{ fontFamily:'Orbitron,monospace', fontSize:'7px', letterSpacing:'0.18em', color:accentColor, whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:'5px' }}>
              <img src={logo} alt="" style={{ height:'14px', width:'auto', maxWidth:'18px', objectFit:'contain', flexShrink:0, filter:'sepia(1) saturate(8) hue-rotate(165deg) brightness(0.85) drop-shadow(0 0 4px rgba(0,212,255,1)) drop-shadow(0 0 10px rgba(0,212,255,0.55))' }} />
              {label}
            </span>
            <div style={{ flex:1, height:'1px', background:`linear-gradient(to left,transparent,${accentColor}55)` }} />
          </div>
        ) : (
          <div style={{ fontFamily:'Orbitron,monospace', fontSize:'7px', letterSpacing:'0.15em', color:accentColor, textAlign:'center', marginBottom:'8px', borderBottom:`1px solid ${accentColor}22`, paddingBottom:'6px' }}>
            {label}
          </div>
        )}

        {!isEditing && (
          <>
            {readItems.length === 0 && <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:'11px', color:'rgba(var(--cyan-rgb),0.2)', textAlign:'center', padding:'8px 0' }}>{emptyText}</div>}
            {readItems.map((item, i) => (
              <div
                key={i}
                style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'5px', cursor: item.descripcion ? 'help' : 'default', padding:'2px 0' }}
                onMouseMove={e => trackTooltip(e, item.descripcion)}
                onMouseLeave={() => setTooltip(null)}
              >
                <div style={{ width:'7px', height:'7px', borderRadius:'50%', flexShrink:0, border:`1px solid ${bulletColor}`, background:`${bulletColor}55`, boxShadow:`0 0 5px ${bulletColor}66` }} />
                <span style={{ fontFamily:'Rajdhani,sans-serif', fontSize:'11px', color:'#c8d4e0', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.nombre}</span>
                {item.descripcion && <span style={{ fontSize:'8px', color:'rgba(var(--cyan-rgb),0.3)', flexShrink:0 }}>···</span>}
              </div>
            ))}
          </>
        )}

        {isEditing && (
          <>
            {items.map((item, i) => (
              <div key={i} style={{ marginBottom:'8px', padding:'6px 8px', background:'rgba(var(--cyan-rgb),0.03)', border:'1px solid rgba(var(--cyan-rgb),0.1)', borderRadius:'2px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'4px', marginBottom:'4px' }}>
                  <div style={{ width:'7px', height:'7px', borderRadius:'50%', flexShrink:0, border:`1px solid ${bulletColor}`, background:`${bulletColor}44` }} />
                  <input type="text" value={item.nombre} onChange={e => setItemField(arrKey, i, 'nombre', e.target.value)} placeholder="Nombre..." style={{ ...EDIT_INPUT, fontSize:'12px', fontWeight:600 }} />
                  <button onClick={() => removeItem(arrKey, i)} style={{ background:'transparent', border:'none', cursor:'pointer', color:'rgba(255,68,68,0.6)', fontSize:'14px', padding:'0 2px', lineHeight:1, flexShrink:0 }}>×</button>
                </div>
                <textarea value={item.descripcion} onChange={e => setItemField(arrKey, i, 'descripcion', e.target.value)} placeholder="Descripción (aparece al pasar el ratón)..." rows={2}
                  style={{ background:'rgba(0,0,0,0.2)', border:'1px solid rgba(var(--cyan-rgb),0.18)', color:'rgba(200,215,230,0.8)', fontFamily:'Rajdhani,sans-serif', fontSize:'11px', padding:'4px 6px', outline:'none', width:'100%', resize:'vertical', caretColor:'var(--cyan)', lineHeight:1.4, borderRadius:'1px' }} />
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
        <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'8px' }}>
          <div style={{ flex:1, height:'1px', background:'linear-gradient(to right,transparent,rgba(var(--cyan-rgb),0.4))' }} />
          <span style={{ fontFamily:'Orbitron,monospace', fontSize:'7px', letterSpacing:'0.15em', color:'rgba(var(--cyan-rgb),0.6)', whiteSpace:'nowrap' }}>MIS FORTALEZAS</span>
          <div style={{ flex:1, height:'1px', background:'linear-gradient(to left,transparent,rgba(var(--cyan-rgb),0.4))' }} />
        </div>

        {/* Vista lectura */}
        {!isEditing && (
          <>
            {items.filter(f => f.nombre).length === 0 && (
              <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:'11px', color:'rgba(var(--cyan-rgb),0.2)', textAlign:'center', padding:'8px 0' }}>Sin fortalezas</div>
            )}
            {items.filter(f => f.nombre).map((f, i) => (
              <div
                key={i}
                style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'5px', cursor: f.descripcion ? 'help' : 'default', padding:'2px 0' }}
                onMouseMove={e => trackTooltip(e, f.descripcion)}
                onMouseLeave={() => setTooltip(null)}
              >
                <div style={{ width:'10px', height:'10px', borderRadius:'2px', flexShrink:0, background:LEVEL_COLORS[f.nivel], boxShadow:`0 0 6px ${LEVEL_COLORS[f.nivel]}88` }} />
                <span style={{ fontFamily:'Rajdhani,sans-serif', fontSize:'11px', color:'#c8d4e0', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.nombre}</span>
                {f.descripcion && <span style={{ fontSize:'8px', color:'rgba(var(--cyan-rgb),0.3)', flexShrink:0 }}>···</span>}
              </div>
            ))}
          </>
        )}

        {/* Vista edición (solo Master) */}
        {isEditing && (
          <>
            {items.map((f, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'4px', marginBottom:'5px', padding:'4px 6px', background:'rgba(var(--cyan-rgb),0.03)', border:'1px solid rgba(var(--cyan-rgb),0.1)', borderRadius:'2px' }}>
                <div style={{ width:'10px', height:'10px', borderRadius:'2px', flexShrink:0, background:LEVEL_COLORS[f.nivel], boxShadow:`0 0 6px ${LEVEL_COLORS[f.nivel]}66`, transition:'background 0.2s' }} />
                <span style={{ fontFamily:'Rajdhani,sans-serif', fontSize:'11px', color:'#c8d4e0', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.nombre}</span>
                <input type="range" min="0" max="10" step="1" value={f.nivel} onChange={e => setItemField('fortalezas', i, 'nivel', parseInt(e.target.value))} className="strength-slider" style={{ '--level-color': LEVEL_COLORS[f.nivel], width:'55px', flexShrink:0 }} />
                <span style={{ fontFamily:'Orbitron,monospace', fontSize:'9px', fontWeight:700, color:LEVEL_COLORS[f.nivel], textShadow:`0 0 8px ${LEVEL_COLORS[f.nivel]}99`, minWidth:'14px', textAlign:'center', flexShrink:0, transition:'color 0.2s' }}>{f.nivel}</span>
                <button onClick={() => removeItem('fortalezas', i)} style={{ background:'transparent', border:'none', cursor:'pointer', color:'rgba(255,68,68,0.6)', fontSize:'14px', padding:'0 2px', lineHeight:1, flexShrink:0 }}>×</button>
              </div>
            ))}

            {!fortPickOpen ? (
              <button
                className="cyber-btn"
                onClick={() => { setFortPickOpen(true); setFortPickName(fortalezasCatalog[0]?.nombre ?? ''); setFortPickLevel(5); }}
                style={{ width:'100%', fontSize:'7.5px', padding:'5px', marginTop: items.length > 0 ? '4px' : 0 }}
              >+ AÑADIR FORTALEZA</button>
            ) : (
              <div style={{ padding:'8px', background:'rgba(var(--cyan-rgb),0.04)', border:'1px solid rgba(var(--cyan-rgb),0.15)', borderRadius:'2px', marginTop:'4px' }}>
                {fortalezasCatalog.length === 0 ? (
                  <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:'11px', color:'rgba(var(--cyan-rgb),0.3)', textAlign:'center', padding:'4px 0', marginBottom:'6px' }}>
                    El Master no ha definido fortalezas aún
                  </div>
                ) : (
                  <>
                    <select
                      value={fortPickName}
                      onChange={e => setFortPickName(e.target.value)}
                      className="cyber-input"
                      style={{ width:'100%', fontSize:'11px', padding:'2px 6px', height:'24px', marginBottom:'8px' }}
                    >
                      {fortalezasCatalog.map(f => <option key={f.nombre} value={f.nombre}>{f.nombre}</option>)}
                    </select>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'8px' }}>
                      <span style={{ fontFamily:'Orbitron,monospace', fontSize:'6px', color:LEVEL_COLORS[0], flexShrink:0 }}>0</span>
                      <input type="range" min="0" max="10" step="1" value={fortPickLevel} onChange={e => setFortPickLevel(parseInt(e.target.value))} className="strength-slider" style={{ '--level-color': LEVEL_COLORS[fortPickLevel], flex:1 }} />
                      <span style={{ fontFamily:'Orbitron,monospace', fontSize:'6px', color:LEVEL_COLORS[10], flexShrink:0 }}>10</span>
                      <span style={{ fontFamily:'Orbitron,monospace', fontSize:'9px', fontWeight:700, color:LEVEL_COLORS[fortPickLevel], textShadow:`0 0 8px ${LEVEL_COLORS[fortPickLevel]}99`, minWidth:'16px', textAlign:'center', flexShrink:0, transition:'color 0.2s' }}>{fortPickLevel}</span>
                    </div>
                  </>
                )}
                <div style={{ display:'flex', gap:'4px' }}>
                  {fortalezasCatalog.length > 0 && (
                    <button className="cyber-btn"
                      onClick={() => {
                        if (!fortPickName) return;
                        const desc = fortalezasCatalog.find(f => f.nombre === fortPickName)?.descripcion ?? '';
                        setDraft(p => ({ ...p, fortalezas: [...p.fortalezas, { nombre: fortPickName, nivel: fortPickLevel, descripcion: desc }] }));
                        setFortPickOpen(false);
                      }}
                      style={{ flex:1, fontSize:'7px', padding:'4px' }}>AÑADIR</button>
                  )}
                  <button className="cyber-btn" onClick={() => setFortPickOpen(false)} style={{ flex:1, fontSize:'7px', padding:'4px', borderColor:'rgba(255,68,68,0.3)', color:'rgba(255,68,68,0.6)' }}>CANCELAR</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // ── Contactos del Comunicador (estático) ──────────────────────────────────
  function renderContactos() {
    return (
      <div className="glass-panel rounded-sm" style={{ flex:1, padding:'10px', display:'flex', flexDirection:'column' }}>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:'6.5px', letterSpacing:'0.1em', color:'rgba(var(--cyan-rgb),0.6)', textAlign:'center', marginBottom:'10px', borderBottom:'1px solid rgba(var(--cyan-rgb),0.08)', paddingBottom:'6px', lineHeight:1.5 }}>
          COMUNICADOR
        </div>
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'6px 0' }}>
          <div style={{ width:'44px', height:'44px', borderRadius:'50%', border:'2.5px solid rgba(255,68,68,0.4)', position:'relative', marginBottom:'10px', boxShadow:'0 0 14px rgba(255,68,68,0.12), inset 0 0 10px rgba(255,68,68,0.04)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ position:'absolute', width:'2.5px', height:'40px', background:'rgba(255,68,68,0.4)', transform:'rotate(45deg)', borderRadius:'2px', boxShadow:'0 0 6px rgba(255,68,68,0.3)' }} />
          </div>
          <span style={{ fontFamily:'Orbitron,monospace', fontSize:'7.5px', letterSpacing:'0.3em', color:'rgba(255,68,68,0.45)', textShadow:'0 0 10px rgba(255,68,68,0.25)' }}>BLOQUEADO</span>
        </div>
      </div>
    );
  }

  // ── Panel de moneda (créditos o reales) ───────────────────────────────────
  function renderCurrencyPanel({ title, titleColor, titleShadow, objKey, lineStyle, logo }) {
    return (
      <div className="glass-panel rounded-sm" style={{ padding:'12px 14px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'10px' }}>
          <div style={{ flex:1, height:'1px', background:`linear-gradient(to right,transparent,${titleColor}55)` }} />
          <span style={{ fontFamily:'Orbitron,monospace', fontSize:'7px', letterSpacing:'0.18em', color:titleColor, textShadow:titleShadow, whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:'5px' }}>
            {logo && (
              <img src={logo} alt="" style={{
                height:'14px', width:'auto', maxWidth:'18px', objectFit:'contain', flexShrink:0,
                filter:`drop-shadow(0 0 3px ${titleColor}aa)`,
              }} />
            )}
            {title}
          </span>
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

  // ── Mis Notas ──────────────────────────────────────────────────────────────
  function renderMisNotas() {
    const notasValue = char.notas ?? '';
    return (
      <div className="glass-panel rounded-sm" style={{ padding:'10px', marginTop:'8px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'8px', paddingBottom:'6px', borderBottom:'1px solid rgba(var(--cyan-rgb),0.08)' }}>
          <div style={{ flex:1, height:'1px', background:'linear-gradient(to right,transparent,rgba(var(--cyan-rgb),0.3))' }} />
          <span style={{ fontFamily:'Orbitron,monospace', fontSize:'7px', letterSpacing:'0.15em', color:'rgba(var(--cyan-rgb),0.6)', whiteSpace:'nowrap' }}>MIS NOTAS</span>
          <div style={{ flex:1, height:'1px', background:'linear-gradient(to left,transparent,rgba(var(--cyan-rgb),0.3))' }} />
        </div>

        {isEditingNotas ? (
          <>
            <textarea
              value={notasDraft}
              onChange={e => setNotasDraft(e.target.value)}
              rows={4}
              style={{ width:'100%', background:'rgba(0,0,0,0.25)', border:'1px solid rgba(var(--cyan-rgb),0.25)', color:'rgba(200,215,230,0.9)', fontFamily:'Rajdhani,sans-serif', fontSize:'12px', padding:'8px', outline:'none', resize:'vertical', caretColor:'var(--cyan)', lineHeight:1.55, borderRadius:'1px' }}
            />
            <div style={{ display:'flex', justifyContent:'flex-end', gap:'4px', marginTop:'5px' }}>
              <button className="cyber-btn" style={{ fontSize:'6.5px', padding:'3px 8px', borderColor:'rgba(255,68,68,0.4)', color:'rgba(255,68,68,0.7)' }}
                onClick={() => setIsEditingNotas(false)}>
                CANCELAR
              </button>
              <button className="cyber-btn" style={{ fontSize:'6.5px', padding:'3px 8px', borderColor:'rgba(0,255,136,0.5)', color:'rgba(0,255,136,0.85)' }}
                onClick={() => { onUpdateNotes(targetUser, notasDraft); setIsEditingNotas(false); }}>
                GUARDAR
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:'12px', color: notasValue ? 'rgba(200,215,230,0.8)' : 'rgba(var(--cyan-rgb),0.2)', minHeight:'52px', lineHeight:1.55, whiteSpace:'pre-wrap', padding:'2px' }}>
              {notasValue || 'Sin notas...'}
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'5px' }}>
              <button className="cyber-btn" style={{ fontSize:'6.5px', padding:'3px 8px' }}
                onClick={() => { setNotasDraft(notasValue); setIsEditingNotas(true); }}>
                EDITAR
              </button>
            </div>
          </>
        )}
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
      <div style={{ padding:'10px 16px 8px', borderBottom:'1px solid rgba(var(--cyan-rgb),0.12)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
          <div style={{ flex:1, height:'1px', background:'linear-gradient(to right,transparent,rgba(var(--cyan-rgb),0.4))' }} />
          <span style={{ fontFamily:'Orbitron,monospace', fontSize:'9px', letterSpacing:'0.22em', color:'var(--cyan)', textShadow:'0 0 10px rgba(var(--cyan-rgb),0.6)', whiteSpace:'nowrap' }}>FICHA DE PERSONAJE</span>
          <div style={{ flex:1, height:'1px', background:'linear-gradient(to left,transparent,rgba(var(--cyan-rgb),0.4))' }} />
        </div>
        {isMaster ? (
          <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
            <select value={selectedPlayer} onChange={e => { setSelectedPlayer(e.target.value); cancelEdit(); }} className="cyber-input" style={{ flex:1, fontSize:'10px', padding:'3px 28px 3px 10px', height:'28px' }}>
              {PLAYERS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {!isEditing && <button className="cyber-btn" style={{ fontSize:'7.5px', padding:'4px 10px', flexShrink:0 }} onClick={startEdit}>EDITAR FICHA</button>}
          </div>
        ) : (
          <div style={{ fontFamily:'Orbitron,monospace', fontSize:'8px', letterSpacing:'0.15em', color:'rgba(var(--cyan-rgb),0.4)', textAlign:'center' }}>{username.toUpperCase()}</div>
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
            style={{ width:'100px', height:'130px', flexShrink:0, border:`1px solid ${isDragOver?'rgba(var(--cyan-rgb),0.9)':isEditing?'rgba(var(--cyan-rgb),0.55)':'rgba(var(--cyan-rgb),0.28)'}`, background:isDragOver?'rgba(var(--cyan-rgb),0.12)':'rgba(var(--cyan-rgb),0.03)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:isEditing?'pointer':'default', transition:'all 0.2s', position:'relative', overflow:'hidden', boxShadow:isEditing?'0 0 16px rgba(var(--cyan-rgb),0.15)':'none' }}
          >
            {['tl','tr','bl','br'].map(p => <Corner key={p} pos={p} />)}
            {data?.avatar ? (
              <>
                <img src={data.avatar} alt="Avatar" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
                {isEditing && <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'4px' }}><span style={{ fontSize:'18px', color:'var(--cyan)' }}>⇪</span><span style={{ fontFamily:'Orbitron,monospace', fontSize:'7px', color:'var(--cyan)', letterSpacing:'0.1em' }}>{isDragOver?'SOLTAR':'CAMBIAR'}</span></div>}
              </>
            ) : (
              <>
                <span style={{ fontSize:'32px', color:'rgba(var(--cyan-rgb),0.18)', textShadow:'0 0 20px rgba(var(--cyan-rgb),0.3)', lineHeight:1, zIndex:1 }}>?</span>
                <span style={{ fontFamily:'Orbitron,monospace', fontSize:'6px', letterSpacing:'0.1em', color:'rgba(var(--cyan-rgb),0.28)', marginTop:'10px', zIndex:1, textAlign:'center', lineHeight:1.6 }}>{isEditing?(isDragOver?'SOLTAR\nAQUÍ':'ARRASTRAR\nO CLICK'):'EN\nESPERA'}</span>
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
        <button onClick={() => setTopExpanded(e => !e)} style={{ width:'100%', display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px', background:'transparent', border:'none', cursor:'pointer', padding:'4px 0' }}>
          <div style={{ flex:1, height:'1px', background:'linear-gradient(to right,transparent,rgba(var(--cyan-rgb),0.25))' }} />
          <span style={{ fontFamily:'Orbitron,monospace', fontSize:'6px', letterSpacing:'0.15em', color:'rgba(var(--cyan-rgb),0.5)', padding:'3px 10px', border:'1px solid rgba(var(--cyan-rgb),0.22)', borderRadius:'1px', display:'flex', alignItems:'center', gap:'5px', flexShrink:0, whiteSpace:'nowrap' }}>
            {topExpanded ? '▲' : '▼'} PERSONAJE
          </span>
          <div style={{ flex:1, height:'1px', background:'linear-gradient(to left,transparent,rgba(var(--cyan-rgb),0.25))' }} />
        </button>

        {/* ── INDICADOR DE ESTADO ───────────────────────────────────────── */}
        {(() => {
          const sc = STATUS_STYLES[char.estado] || STATUS_STYLES['Intacto'];
          return (
            <div style={{ display:'flex', justifyContent:'center', marginBottom:'14px' }}>
              <div
                className={sc.pulse ? 'status-crit-pulse' : ''}
                style={{
                  display:'flex', alignItems:'center', gap:'10px',
                  padding:'8px 28px',
                  border:`1px solid rgba(${sc.rgb},0.5)`,
                  borderRadius:'5px',
                  background:`rgba(${sc.rgb},0.1)`,
                  boxShadow: sc.pulse ? undefined : `0 0 14px rgba(${sc.rgb},0.18)`,
                }}
              >
                <span style={{ fontFamily:'Orbitron,monospace', fontSize:'7px', letterSpacing:'0.2em', color:`rgba(${sc.rgb},0.65)`, flexShrink:0 }}>ESTADO</span>
                <div style={{ width:'1px', height:'16px', background:`rgba(${sc.rgb},0.35)`, flexShrink:0 }} />
                <span style={{ fontFamily:'Rajdhani,sans-serif', fontSize:'14px', fontWeight:700, letterSpacing:'0.06em', color:sc.color, textShadow:`0 0 14px rgba(${sc.rgb},0.65)` }}>{char.estado.toUpperCase()}</span>
              </div>
            </div>
          );
        })()}

        {/* ── GRID PRINCIPAL: CSS Grid — alturas simétricas por fila ─────── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 32px 1fr', rowGap:'8px', marginBottom:'14px' }}>

          {/* Fila 1 */}
          <div style={{ gridColumn:1, gridRow:1 }}>
            {renderCurrencyPanel({ title:'CRÉDITOS', titleColor:'#ffd700', titleShadow:'0 0 10px rgba(255,215,0,0.5)', objKey:'creditos', lineStyle:GOLD_LINE, logo:'/simbolo-creditos.png' })}
          </div>
          <div style={{ gridColumn:2, gridRow:'1 / 4', position:'relative' }}>
            <SectionDivider />
          </div>
          <div style={{ gridColumn:3, gridRow:1 }}>
            {renderCurrencyPanel({ title:'REALES DE A OCHO', titleColor:'#c8966a', titleShadow:'0 0 10px rgba(200,150,106,0.5)', objKey:'realesDeAOcho', lineStyle:BROWN_LINE, logo:'/simbolo-reales.png' })}
          </div>

          {/* Fila 2 */}
          <div style={{ gridColumn:1, gridRow:2, display:'flex', flexDirection:'column' }}>
            {renderItemSection({ arrKey:'inventario', label:'INVENTARIO', accentColor:'rgba(0,212,255,0.9)', bulletColor:'rgba(0,212,255,1)', emptyText:'Sin objetos', logo:'/simbolo-inventario.png' })}
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

        {/* ── MIS NOTAS ──────────────────────────────────────────────────── */}
        {renderMisNotas()}

        {/* Controles de edición */}
        {isMaster && isEditing && (
          <div style={{ display:'flex', gap:'8px', marginTop:'12px' }}>
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
            border:'1px solid rgba(var(--cyan-rgb),0.38)',
            borderRadius:'2px',
            padding:'9px 11px',
            boxShadow:'0 0 24px rgba(var(--cyan-rgb),0.12), 0 6px 24px rgba(0,0,0,0.8)',
            animation:'tooltip-scan 0.2s ease-out',
          }}
        >
          {['tl','tr','bl','br'].map(p => <Corner key={p} pos={p} />)}
          <p style={{ margin:0, fontFamily:'Rajdhani,sans-serif', fontSize:'11.5px', color:'rgba(195,215,235,0.92)', lineHeight:1.55, whiteSpace:'pre-wrap' }}>
            {tooltip.text}
          </p>
        </div>
      )}
    </div>
  );
}
