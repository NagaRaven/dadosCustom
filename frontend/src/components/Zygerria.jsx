import { useState } from 'react';
import HouseCard from './zygerria/HouseCard';
import HouseModal from './zygerria/HouseModal';
import HouseForm from './zygerria/HouseForm';

export default function Zygerria({ isMaster, houses = [], onAddHouse, onUpdateHouse, onDeleteHouse }) {
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [editingHouse, setEditingHouse]   = useState(null);
  const [search, setSearch]               = useState('');

  const filtered = houses.filter(h => {
    const q = search.toLowerCase();
    return !q || h.name.toLowerCase().includes(q) || (h.territory || '').toLowerCase().includes(q);
  });

  function handleSave(formData) {
    if (editingHouse?.id) {
      onUpdateHouse(editingHouse.id, formData);
    } else {
      onAddHouse(formData);
    }
    setEditingHouse(null);
  }

  function handleDelete(id) {
    onDeleteHouse(id);
    setSelectedHouse(null);
  }

  function handleEditFromModal(house) {
    setSelectedHouse(null);
    setEditingHouse(house);
  }

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0,
      background: 'linear-gradient(180deg, #0a0507 0%, #080406 100%)',
    }}>

      {/* ── Cabecera ───────────────────────────────────────────────────────── */}
      <div style={{
        padding: '22px 26px 18px',
        borderBottom: '1px solid rgba(201,162,39,0.1)',
        background: 'linear-gradient(to bottom, rgba(201,162,39,0.03), transparent)',
        flexShrink: 0,
      }}>
        {/* Título + botón añadir */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{
              fontSize: '0.48rem', color: 'rgba(201,162,39,0.36)',
              fontFamily: 'Orbitron, monospace', letterSpacing: '0.32em', marginBottom: '5px',
            }}>
              ZYGERRIA — SISTEMA NOBLE
            </div>
            <div style={{
              fontFamily: 'Orbitron, monospace', fontSize: '1.05rem', fontWeight: 900,
              color: '#c9a227', letterSpacing: '0.1em',
              textShadow: '0 0 24px rgba(201,162,39,0.35), 0 0 48px rgba(201,162,39,0.12)',
            }}>
              REGISTRO DE CASAS NOBLES
            </div>
          </div>

          {isMaster && (
            <button
              onClick={() => setEditingHouse({})}
              style={{
                background: 'rgba(201,162,39,0.09)', border: '1px solid rgba(201,162,39,0.45)',
                color: '#c9a227', fontFamily: 'Orbitron, monospace', fontSize: '0.5rem',
                fontWeight: 900, letterSpacing: '0.13em', padding: '9px 18px', cursor: 'pointer',
                boxShadow: '0 0 14px rgba(201,162,39,0.12)',
                transition: 'background 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,162,39,0.18)'; e.currentTarget.style.boxShadow = '0 0 22px rgba(201,162,39,0.24)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,162,39,0.09)'; e.currentTarget.style.boxShadow = '0 0 14px rgba(201,162,39,0.12)'; }}
            >
              ⚜ AÑADIR CASA
            </button>
          )}
        </div>

        {/* Buscador */}
        <div style={{ position: 'relative', maxWidth: '360px' }}>
          <span style={{
            position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
            color: 'rgba(201,162,39,0.35)', fontSize: '12px', pointerEvents: 'none',
          }}>◈</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar casa o territorio..."
            style={{
              background: 'rgba(201,162,39,0.04)', border: '1px solid rgba(201,162,39,0.18)',
              color: '#e8d5a3', fontFamily: 'monospace', fontSize: '0.65rem',
              padding: '7px 12px 7px 26px', outline: 'none', width: '100%',
              boxSizing: 'border-box', transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(201,162,39,0.45)'}
            onBlur={e => e.target.style.borderColor = 'rgba(201,162,39,0.18)'}
          />
        </div>
      </div>

      {/* ── Grid de casas ──────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '22px 26px' }}>
        {filtered.length === 0 ? (
          <EmptyState hasSearch={!!search} />
        ) : (
          <>
            <div style={{
              fontSize: '0.46rem', color: 'rgba(201,162,39,0.28)',
              fontFamily: 'monospace', letterSpacing: '0.12em', marginBottom: '14px',
            }}>
              {filtered.length} casa{filtered.length !== 1 ? 's' : ''} registrada{filtered.length !== 1 ? 's' : ''}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: '14px',
            }}>
              {filtered.map(house => (
                <HouseCard key={house.id} house={house} onClick={setSelectedHouse} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Modal detalle ──────────────────────────────────────────────────── */}
      {selectedHouse && (
        <HouseModal
          house={selectedHouse}
          isMaster={isMaster}
          onEdit={handleEditFromModal}
          onDelete={handleDelete}
          onClose={() => setSelectedHouse(null)}
        />
      )}

      {/* ── Formulario crear / editar ──────────────────────────────────────── */}
      {editingHouse !== null && (
        <HouseForm
          house={editingHouse?.id ? editingHouse : null}
          onSave={handleSave}
          onCancel={() => setEditingHouse(null)}
        />
      )}
    </div>
  );
}

function EmptyState({ hasSearch }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '280px', gap: '14px',
    }}>
      <div style={{ fontSize: '40px', color: 'rgba(201,162,39,0.12)' }}>⚜</div>
      <div style={{ fontSize: '0.58rem', color: 'rgba(201,162,39,0.28)', fontFamily: 'Orbitron, monospace', letterSpacing: '0.22em', textAlign: 'center' }}>
        {hasSearch ? 'SIN RESULTADOS' : 'SIN CASAS REGISTRADAS'}
      </div>
      {!hasSearch && (
        <div style={{ fontSize: '0.55rem', color: 'rgba(201,162,39,0.18)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
          El Master puede añadir casas nobles al registro
        </div>
      )}
    </div>
  );
}
