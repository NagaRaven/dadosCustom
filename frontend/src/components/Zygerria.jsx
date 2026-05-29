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
      background: '#0a0a0f',
    }}>

      {/* ── Cabecera ───────────────────────────────────────────────────────── */}
      <div style={{
        padding: '22px 26px 18px',
        borderBottom: '1px solid rgba(0,212,255,0.1)',
        background: 'linear-gradient(to bottom, rgba(0,212,255,0.02), transparent)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{
              fontFamily: 'Orbitron, monospace', fontSize: '1.45rem', fontWeight: 900,
              color: '#d9a84a', letterSpacing: '0.18em', marginBottom: '4px',
              textShadow: '0 0 24px rgba(217,168,74,0.45)',
            }}>
              ZYGERRIA
            </div>
            <div style={{
              fontFamily: 'Orbitron, monospace', fontSize: '0.58rem', fontWeight: 700,
              color: 'rgba(0,212,255,0.55)', letterSpacing: '0.22em',
              textShadow: '0 0 10px rgba(0,212,255,0.2)',
            }}>
              REGISTRO DE CASAS NOBLES
            </div>
          </div>

          {isMaster && (
            <button
              onClick={() => setEditingHouse({})}
              className="cyber-btn"
              style={{ fontSize: '0.5rem', letterSpacing: '0.12em', padding: '8px 18px', fontWeight: 900 }}
            >
              ⚜ AÑADIR CASA
            </button>
          )}
        </div>

        {/* Buscador */}
        <div style={{ position: 'relative', maxWidth: '360px' }}>
          <span style={{
            position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
            color: 'rgba(0,212,255,0.35)', fontSize: '12px', pointerEvents: 'none',
          }}>◈</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar casa o territorio..."
            style={{
              background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.15)',
              color: 'rgba(0,212,255,0.8)', fontFamily: 'monospace', fontSize: '0.65rem',
              padding: '7px 12px 7px 26px', outline: 'none', width: '100%',
              boxSizing: 'border-box', transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.45)'}
            onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.15)'}
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
              fontSize: '0.46rem', color: 'rgba(0,212,255,0.25)',
              fontFamily: 'monospace', letterSpacing: '0.12em', marginBottom: '20px',
            }}>
              {filtered.length} casa{filtered.length !== 1 ? 's' : ''} registrada{filtered.length !== 1 ? 's' : ''}
            </div>

            <HouseSection
              title="⚜ CASAS MAYORES"
              houses={filtered.filter(h => !h.rank || h.rank === 'mayor')}
              onSelect={setSelectedHouse}
            />
            <HouseSection
              title="◈ CASAS MENORES"
              houses={filtered.filter(h => h.rank === 'menor')}
              onSelect={setSelectedHouse}
            />
          </>
        )}
      </div>

      {selectedHouse && (
        <HouseModal
          house={selectedHouse}
          isMaster={isMaster}
          onEdit={handleEditFromModal}
          onDelete={handleDelete}
          onClose={() => setSelectedHouse(null)}
        />
      )}

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

function HouseSection({ title, houses, onSelect }) {
  if (houses.length === 0) return null;
  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px',
      }}>
        <div style={{
          fontFamily: 'Orbitron, monospace', fontSize: '0.52rem', fontWeight: 700,
          color: 'rgba(0,212,255,0.55)', letterSpacing: '0.2em',
        }}>
          {title}
        </div>
        <div style={{ flex: 1, height: '1px', background: 'rgba(0,212,255,0.1)' }} />
        <div style={{ fontSize: '0.44rem', color: 'rgba(0,212,255,0.25)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
          {houses.length}
        </div>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
        gap: '14px',
      }}>
        {houses.map(house => (
          <HouseCard key={house.id} house={house} onClick={onSelect} />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ hasSearch }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '280px', gap: '14px',
    }}>
      <div style={{ fontSize: '40px', color: 'rgba(0,212,255,0.1)' }}>⚜</div>
      <div style={{ fontSize: '0.58rem', color: 'rgba(0,212,255,0.28)', fontFamily: 'Orbitron, monospace', letterSpacing: '0.22em', textAlign: 'center' }}>
        {hasSearch ? 'SIN RESULTADOS' : 'SIN CASAS REGISTRADAS'}
      </div>
      {!hasSearch && (
        <div style={{ fontSize: '0.55rem', color: 'rgba(0,212,255,0.18)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
          El Master puede añadir casas nobles al registro
        </div>
      )}
    </div>
  );
}
