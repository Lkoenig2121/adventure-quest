import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { useState } from 'react'
import { ALL_SPELLS } from '../data/spells'

const SpellShopScreen = () => {
  const navigate = useNavigate()
  const { player, purchaseSpell } = useGame()
  const [selectedSpell, setSelectedSpell] = useState(ALL_SPELLS[0])
  const [message, setMessage] = useState(null)

  const isOwned = (spell) => (player.purchasedSpells || []).includes(spell.id)

  const handlePurchase = (spell) => {
    if (isOwned(spell)) {
      setMessage({ type: 'error', text: 'You already know this spell!' })
    } else if (player.gold < spell.price) {
      setMessage({ type: 'error', text: 'Not enough gold!' })
    } else {
      purchaseSpell(spell.id, spell.price)
      setMessage({ type: 'success', text: `Learned ${spell.name}!` })
    }
    setTimeout(() => setMessage(null), 3000)
  }

  const woodBorder = {
    background: 'linear-gradient(135deg,#4a2a6b,#2d1a4a)',
    border: '3px solid #2a0a4a',
    boxShadow: 'inset 0 0 8px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.6)',
  }

  const parchment = {
    background: 'linear-gradient(160deg,#f0e8f8,#ddd0f0)',
    border: '3px solid #6b3a9a',
  }

  const AqButton = ({ onClick, disabled, children }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '6px 14px',
        fontWeight: 'bold',
        fontSize: 12,
        borderRadius: 4,
        background: disabled
          ? 'linear-gradient(to bottom,#888,#555)'
          : 'linear-gradient(to bottom,#7b2fc0,#4a1a80)',
        border: '2px solid #2a0a4a',
        color: disabled ? '#999' : '#f0d8ff',
        textShadow: disabled ? 'none' : '0 1px 2px rgba(0,0,0,0.7)',
        boxShadow: disabled ? 'none' : '0 3px 0 #2a0a4a, inset 0 1px 0 rgba(255,255,255,0.2)',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  )

  const elementColors = {
    Fire: '#ef4444', Ice: '#60a5fa', Energy: '#facc15', Wind: '#34d399',
    Earth: '#a16207', Darkness: '#a855f7', Light: '#fde68a', Water: '#38bdf8',
  }

  return (
    <div className="w-full h-screen flex items-center justify-center" style={{
      background: 'linear-gradient(to bottom, #0d0020 0%, #1a0030 100%)',
    }}>
      {/* Outer arcane frame */}
      <div className="flex flex-col" style={{
        width: 780, minHeight: 520,
        ...woodBorder,
        borderRadius: 8,
        padding: 6,
      }}>

        {/* Title bar */}
        <div className="flex items-center justify-center py-2 mb-1" style={{
          background: 'linear-gradient(to bottom,#2d1a4a,#1a0a30)',
          borderRadius: '4px 4px 0 0',
          borderBottom: '2px solid #2a0a4a',
        }}>
          <span style={{ fontFamily: 'Georgia,serif', color: '#d8b4fe', fontSize: 20, fontWeight: 'bold', textShadow: '0 1px 6px rgba(139,92,246,0.8)' }}>
            📚 Intellect Building — Spell Tome
          </span>
        </div>

        {/* Main 3-column layout */}
        <div className="flex gap-1 flex-1" style={{ minHeight: 0 }}>

          {/* LEFT — arcane decoration + gold */}
          <div className="flex flex-col items-center justify-between py-4 px-3" style={{
            width: 130,
            background: 'linear-gradient(160deg,#2d1a4a,#1a0a30)',
            borderRight: '2px solid #2a0a4a',
          }}>
            <div className="text-center">
              {/* Arcane tower icon */}
              <div style={{ fontSize: 56, lineHeight: 1 }}>🏛️</div>
              <div style={{ color: '#d8b4fe', fontFamily: 'Georgia,serif', fontSize: 11, marginTop: 6, textAlign: 'center', fontWeight: 'bold' }}>
                Spell Tomes
              </div>
              <div style={{ color: '#9f7aea', fontSize: 10, marginTop: 4, textAlign: 'center' }}>
                {(player.purchasedSpells || []).length}/{ALL_SPELLS.length} learned
              </div>
              {/* Floating sparkles */}
              {['✨','⭐','💫'].map((s, i) => (
                <div key={i} style={{ fontSize: 14, marginTop: 4, opacity: 0.6, animation: `bounce ${1.2 + i * 0.3}s infinite alternate` }}>{s}</div>
              ))}
            </div>

            <div className="w-full">
              <div style={{ ...parchment, borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#4a1a80', fontWeight: 'bold' }}>Your Gold</div>
                <div style={{ fontSize: 16, color: '#7b2fc0', fontWeight: 'bold', marginTop: 2 }}>
                  🪙 {player.gold.toLocaleString()}
                </div>
              </div>

              {message && (
                <div style={{
                  marginTop: 6, padding: '4px 6px', borderRadius: 4, fontSize: 10,
                  fontWeight: 'bold', textAlign: 'center',
                  background: message.type === 'success' ? '#d4edda' : '#f8d7da',
                  color:      message.type === 'success' ? '#155724' : '#721c24',
                  border:     `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                }}>
                  {message.text}
                </div>
              )}
            </div>
          </div>

          {/* MIDDLE — spell list */}
          <div className="flex flex-col flex-1" style={{ minWidth: 0 }}>
            <div style={{
              padding: '4px 10px',
              background: 'linear-gradient(to right,#2d1a4a,#1a0a30)',
              color: '#c4a8e8',
              fontSize: 11,
              fontWeight: 'bold',
              borderBottom: '1px solid #2a0a4a',
              fontFamily: 'Georgia,serif',
            }}>
              Available Spells
            </div>

            <div className="overflow-y-auto flex-1" style={{
              background: '#0d0020',
              scrollbarWidth: 'thin',
              scrollbarColor: '#4a1a80 #0d0020',
            }}>
              {ALL_SPELLS.map(spell => {
                const owned = isOwned(spell)
                return (
                  <div
                    key={spell.id}
                    onClick={() => setSelectedSpell(spell)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '7px 10px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #1a0a30',
                      background: selectedSpell?.id === spell.id
                        ? 'rgba(109,40,217,0.35)'
                        : 'transparent',
                      color: owned ? '#5a3a7a' : selectedSpell?.id === spell.id ? '#e9d5ff' : '#c4a8e8',
                      opacity: owned ? 0.6 : 1,
                    }}
                    onMouseEnter={e => { if (selectedSpell?.id !== spell.id) e.currentTarget.style.background = 'rgba(80,20,160,0.25)' }}
                    onMouseLeave={e => { if (selectedSpell?.id !== spell.id) e.currentTarget.style.background = 'transparent' }}
                  >
                    <span style={{ fontSize: 18, minWidth: 24 }}>{spell.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontFamily: 'Georgia,serif' }}>{spell.name}</div>
                      <div style={{ fontSize: 9, color: elementColors[spell.element] || '#c4a8e8' }}>
                        {spell.element} · {spell.type === 'heal' ? `Heal ${spell.heal} HP` : `${spell.damage} dmg`} · {spell.cost} MP
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: owned ? '#5a3a7a' : '#e9d5ff', fontWeight: 'bold' }}>
                      {owned ? '✓' : `${spell.price}g`}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* RIGHT — detail panel */}
          <div className="flex flex-col" style={{
            width: 210,
            background: 'linear-gradient(160deg,#2d1a4a,#1a0a30)',
            borderLeft: '2px solid #2a0a4a',
          }}>
            {selectedSpell ? (
              <>
                {/* Spell name banner */}
                <div style={{
                  background: 'linear-gradient(to bottom,#4a1a80,#2d1a4a)',
                  borderBottom: '2px solid #2a0a4a',
                  padding: '10px 10px 8px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 36, lineHeight: 1 }}>{selectedSpell.icon}</div>
                  <div style={{
                    color: '#e9d5ff',
                    fontFamily: 'Georgia,serif',
                    fontWeight: 'bold',
                    fontSize: 14,
                    marginTop: 5,
                    textShadow: '0 1px 4px rgba(139,92,246,0.8)',
                  }}>
                    {selectedSpell.name}
                  </div>
                  <div style={{
                    display: 'inline-block',
                    marginTop: 4,
                    padding: '1px 8px',
                    borderRadius: 10,
                    fontSize: 10,
                    fontWeight: 'bold',
                    background: elementColors[selectedSpell.element] ? `${elementColors[selectedSpell.element]}33` : '#ffffff22',
                    color: elementColors[selectedSpell.element] || '#e9d5ff',
                    border: `1px solid ${elementColors[selectedSpell.element] || '#9f7aea'}`,
                  }}>
                    {selectedSpell.element}
                  </div>
                </div>

                {/* Parchment details */}
                <div className="flex-1 p-3" style={{ ...parchment, margin: 8, borderRadius: 6, overflow: 'auto' }}>
                  <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: '#4a1a80', fontWeight: 'bold' }}>Price</span>
                    <span style={{ fontSize: 13, color: '#7b2fc0', fontWeight: 'bold' }}>{selectedSpell.price.toLocaleString()}g</span>
                  </div>
                  <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: '#4a1a80', fontWeight: 'bold' }}>MP Cost</span>
                    <span style={{ fontSize: 12, color: '#1a4a80' }}>{selectedSpell.cost} MP</span>
                  </div>
                  <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: '#4a1a80', fontWeight: 'bold' }}>
                      {selectedSpell.type === 'heal' ? 'Heals' : 'Base Dmg'}
                    </span>
                    <span style={{ fontSize: 12, color: selectedSpell.type === 'heal' ? '#15803d' : '#7f1d1d' }}>
                      {selectedSpell.type === 'heal' ? `${selectedSpell.heal} HP` : `${selectedSpell.damage} dmg`}
                    </span>
                  </div>
                  <div style={{ borderTop: '1px solid #6b3a9a', paddingTop: 6, marginTop: 6 }}>
                    <div style={{ fontSize: 11, color: '#4a1a80', fontWeight: 'bold', marginBottom: 4 }}>Description</div>
                    <div style={{ fontSize: 11, color: '#2d1054', lineHeight: 1.5 }}>
                      {selectedSpell.description}
                    </div>
                  </div>
                </div>

                {/* Buy/Owned button */}
                <div className="p-3">
                  <AqButton
                    onClick={() => handlePurchase(selectedSpell)}
                    disabled={isOwned(selectedSpell) || player.gold < selectedSpell.price}
                  >
                    <span style={{ width: '100%', display: 'block', textAlign: 'center' }}>
                      {isOwned(selectedSpell)
                        ? '✓ Already Learned'
                        : player.gold >= selectedSpell.price
                          ? '📖 Learn Spell'
                          : '❌ Not Enough Gold'}
                    </span>
                  </AqButton>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center flex-1" style={{ color: '#5a3a7a', fontSize: 12, padding: 16, textAlign: 'center' }}>
                Select a spell to see details
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-4 py-3" style={{
          background: 'linear-gradient(to bottom,#1a0a30,#0d0020)',
          borderTop: '2px solid #2a0a4a',
          borderRadius: '0 0 4px 4px',
        }}>
          <div style={{ color: '#c4a8e8', fontSize: 12, fontFamily: 'Georgia,serif' }}>
            HP <span style={{ color: '#f87171', fontWeight: 'bold' }}>{player.hp}</span>
            <span style={{ color: '#5a3a7a' }}> / {player.maxHp}</span>
            {'  '}MP <span style={{ color: '#a78bfa', fontWeight: 'bold' }}>{player.mp}</span>
            <span style={{ color: '#5a3a7a' }}> / {player.maxMp}</span>
          </div>
          <AqButton onClick={() => navigate('/town')}>🚪 Exit</AqButton>
        </div>
      </div>
    </div>
  )
}

export default SpellShopScreen
