import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'

const REIGN_ITEMS = [
  {
    id: 'reignSword',
    name: 'Reign Sword',
    description: 'Weapon: A gleaming golden blade forged from sacred light. Grants devastating power against dark foes.',
    price: 2200,
    icon: '⚔️',
    type: 'equipment',
    slot: 'weapon',
    elementBonuses: { light: 25, energy: 15 },
    damageMultiplier: 1.3,
  },
  {
    id: 'reignPlate',
    name: 'Reign Plate',
    description: 'Armor: The legendary golden plate of kings. When worn, every Attack becomes 4 rapid strikes at 75% damage each — devastating multi-hit power.',
    price: 2500,
    icon: '🛡️',
    type: 'equipment',
    slot: 'armor',
    elementBonuses: { light: 20, physical: 15, fire: 10 },
  },
  {
    id: 'reignHelm',
    name: 'Reign Helm',
    description: 'Helmet: A crested golden helm worn by the champions of Swordhaven.',
    price: 1800,
    icon: '👑',
    type: 'equipment',
    slot: 'helmet',
    elementBonuses: { light: 18, energy: 12 },
  },
  {
    id: 'reignGreaves',
    name: 'Reign Greaves',
    description: 'Boots: Forged in the same sanctum as the Reign Plate. Allows swift movement even in heavy armour.',
    price: 1400,
    icon: '🥾',
    type: 'equipment',
    slot: 'boots',
    elementBonuses: { light: 15, fire: 8 },
  },
]

export default function ReignShopScreen() {
  const navigate = useNavigate()
  const { player, purchaseItem } = useGame()
  const [selectedItem, setSelectedItem] = useState(REIGN_ITEMS[0])
  const [message, setMessage] = useState(null)

  const isOwned = (item) => {
    const inv = player.inventory || []
    const eq = player.equipped || {}
    return inv.some(i => i.name === item.name) ||
      Object.values(eq).some(e => e?.name === item.name)
  }

  const handleBuy = (item) => {
    if (isOwned(item)) {
      setMessage({ type: 'error', text: 'Already owned!' })
    } else if (player.gold < item.price) {
      setMessage({ type: 'error', text: 'Not enough gold!' })
    } else {
      purchaseItem(item.type, item.price, {
        name: item.name, slot: item.slot,
        elementBonuses: item.elementBonuses, icon: item.icon,
        ...(item.damageMultiplier ? { damageMultiplier: item.damageMultiplier } : {}),
      })
      setMessage({ type: 'success', text: `Purchased ${item.name}!` })
    }
    setTimeout(() => setMessage(null), 3000)
  }

  const allOwned = REIGN_ITEMS.every(isOwned)

  return (
    <div className="w-full h-screen flex items-center justify-center" style={{
      background: 'linear-gradient(180deg,#2a1a00 0%,#1a0d00 100%)',
    }}>
      <div style={{
        width: 860, minHeight: 540,
        background: 'linear-gradient(135deg,#8B5E3C,#6B3F1F)',
        border: '4px solid #ffd87a',
        borderRadius: 12, padding: 6,
        boxShadow: 'inset 0 0 12px rgba(0,0,0,0.5), 0 0 40px rgba(212,160,48,0.4)',
      }}>

        {/* Title */}
        <div style={{
          background: 'linear-gradient(to bottom,#7c5010,#4a2c00)',
          borderRadius: '6px 6px 0 0', borderBottom: '2px solid #ffd87a',
          padding: '10px 16px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 22, fontWeight: 'bold', fontFamily: 'Georgia,serif',
            color: '#ffd87a', textShadow: '0 0 12px rgba(212,160,48,0.8)' }}>
            👑 Reign Armoury
          </div>
          <div style={{ color: '#c4a87a', fontSize: 12, marginTop: 2 }}>
            Legendary equipment of Swordhaven's champions
          </div>
        </div>

        <div className="flex gap-1 flex-1" style={{ minHeight: 0 }}>

          {/* LEFT panel */}
          <div style={{ width: 150, background: 'linear-gradient(160deg,#6b3f1f,#3b1f08)',
            borderRight: '2px solid #c8a030', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'space-between', padding: '16px 10px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 64 }}>🏆</div>
              <div style={{ color: '#ffd87a', fontFamily: 'Georgia,serif', fontSize: 11,
                marginTop: 6, fontWeight: 'bold' }}>Reign Set</div>
              {allOwned && (
                <div style={{ marginTop: 8, color: '#86efac', fontSize: 10, fontWeight: 'bold' }}>
                  ✅ Full set acquired!
                </div>
              )}
            </div>
            <div style={{
              background: 'linear-gradient(160deg,#f5e6c8,#e8d0a0)',
              border: '2px solid #8B6914', borderRadius: 6, padding: '6px 8px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 10, color: '#5c3410', fontWeight: 'bold' }}>Your Gold</div>
              <div style={{ fontSize: 16, color: '#8B5E0A', fontWeight: 'bold', marginTop: 2 }}>
                🪙 {player.gold.toLocaleString()}
              </div>
            </div>
            {message && (
              <div style={{
                marginTop: 6, padding: '4px 6px', borderRadius: 4, fontSize: 10,
                fontWeight: 'bold', textAlign: 'center',
                background: message.type === 'success' ? '#d4edda' : '#f8d7da',
                color: message.type === 'success' ? '#155724' : '#721c24',
                border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
              }}>
                {message.text}
              </div>
            )}
          </div>

          {/* MIDDLE — item list */}
          <div style={{ flex: 1, background: '#1a0d00', overflowY: 'auto' }}>
            <div style={{ padding: '8px 12px', borderBottom: '1px solid #4a2c0a',
              color: '#c8a030', fontFamily: 'Georgia,serif', fontSize: 13, fontWeight: 'bold' }}>
              ⚔️ Reign Equipment
            </div>
            {REIGN_ITEMS.map(item => {
              const owned = isOwned(item)
              return (
                <div key={item.id}
                  onClick={() => setSelectedItem(item)}
                  onMouseEnter={e => { if (selectedItem?.id !== item.id) e.currentTarget.style.background = 'rgba(80,40,10,0.4)' }}
                  onMouseLeave={e => { if (selectedItem?.id !== item.id) e.currentTarget.style.background = 'transparent' }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                    cursor: 'pointer', borderBottom: '1px solid #2a1508',
                    background: selectedItem?.id === item.id ? 'rgba(200,160,48,0.25)' : 'transparent',
                    color: owned ? '#6b5030' : selectedItem?.id === item.id ? '#ffd87a' : '#d4b896',
                    opacity: owned ? 0.65 : 1,
                  }}>
                  <span style={{ fontSize: 26, minWidth: 32 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontFamily: 'Georgia,serif', fontWeight: 'bold' }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: '#a08060', textTransform: 'capitalize', marginTop: 2 }}>
                      {item.slot}
                      {item.damageMultiplier ? ` · ×${item.damageMultiplier} dmg` : ''}
                    </div>
                  </div>
                  <span style={{ fontSize: 14, color: owned ? '#6b5030' : '#ffd87a', fontWeight: 'bold' }}>
                    {owned ? '✓ Owned' : `${item.price.toLocaleString()}g`}
                  </span>
                </div>
              )
            })}
          </div>

          {/* RIGHT — detail */}
          <div style={{ width: 230, background: 'linear-gradient(160deg,#6b3f1f,#3b1f08)',
            borderLeft: '2px solid #c8a030', display: 'flex', flexDirection: 'column' }}>
            {selectedItem ? (
              <>
                <div style={{ background: 'linear-gradient(to bottom,#7c5010,#4a2c00)',
                  borderBottom: '2px solid #c8a030', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 44 }}>{selectedItem.icon}</div>
                  <div style={{ color: '#ffd87a', fontFamily: 'Georgia,serif', fontWeight: 'bold',
                    fontSize: 15, marginTop: 6 }}>{selectedItem.name}</div>
                </div>

                <div style={{ flex: 1, padding: 12, background: 'linear-gradient(160deg,#f5e6c8,#e8d0a0)',
                  margin: 8, borderRadius: 6, border: '2px solid #8B6914', overflow: 'auto', fontSize: 12 }}>
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ color: '#5c3410', fontWeight: 'bold' }}>Price: </span>
                    <span style={{ color: '#8B5E0A', fontWeight: 'bold', fontSize: 14 }}>
                      {selectedItem.price.toLocaleString()} Gold
                    </span>
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ color: '#5c3410', fontWeight: 'bold' }}>Slot: </span>
                    <span style={{ textTransform: 'capitalize' }}>{selectedItem.slot}</span>
                  </div>
                  {selectedItem.damageMultiplier && (
                    <div style={{ marginBottom: 6 }}>
                      <span style={{ color: '#5c3410', fontWeight: 'bold' }}>Damage: </span>
                      <span style={{ color: '#b45309', fontWeight: 'bold' }}>×{selectedItem.damageMultiplier}</span>
                    </div>
                  )}
                  <div style={{ borderTop: '1px solid #8B6914', paddingTop: 6, marginTop: 4 }}>
                    <div style={{ fontSize: 11, color: '#5c3410', fontWeight: 'bold', marginBottom: 4 }}>Description</div>
                    <div style={{ fontSize: 11, color: '#3b2010', lineHeight: 1.5 }}>{selectedItem.description}</div>
                  </div>
                  <div style={{ borderTop: '1px solid #8B6914', paddingTop: 6, marginTop: 6 }}>
                    <div style={{ fontSize: 11, color: '#5c3410', fontWeight: 'bold', marginBottom: 4 }}>✨ Bonuses</div>
                    {Object.entries(selectedItem.elementBonuses).map(([el, val]) => (
                      <div key={el} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#3b2010' }}>
                        <span style={{ textTransform: 'capitalize' }}>{el}</span>
                        <span style={{ fontWeight: 'bold', color: '#b45309' }}>+{val}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ padding: '0 12px 14px' }}>
                  <button
                    onClick={() => handleBuy(selectedItem)}
                    disabled={player.gold < selectedItem.price || isOwned(selectedItem)}
                    style={{
                      width: '100%', padding: '10px 0', borderRadius: 8,
                      fontWeight: 'bold', fontSize: 14, cursor: 'pointer',
                      color: (player.gold < selectedItem.price || isOwned(selectedItem)) ? '#999' : '#fff2cc',
                      background: isOwned(selectedItem)
                        ? 'linear-gradient(to bottom,#888,#555)'
                        : player.gold < selectedItem.price
                          ? 'linear-gradient(to bottom,#888,#555)'
                          : 'linear-gradient(to bottom,#d4a030,#8B6010)',
                      border: isOwned(selectedItem) ? '2px solid #666'
                        : player.gold < selectedItem.price ? '2px solid #666'
                        : '3px solid #ffd87a',
                      boxShadow: (!isOwned(selectedItem) && player.gold >= selectedItem.price)
                        ? '0 3px 0 #4a2c0a' : 'none',
                    }}
                  >
                    {isOwned(selectedItem) ? '✓ Already Owned'
                      : player.gold >= selectedItem.price ? '👑 Purchase'
                      : '❌ Not Enough Gold'}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#6b5030', fontSize: 12, padding: 16, textAlign: 'center' }}>
                Select an item
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          padding: '10px 16px', background: 'linear-gradient(to bottom,#3b1f08,#2a1508)',
          borderTop: '2px solid #c8a030', borderRadius: '0 0 8px 8px', gap: 10,
        }}>
          <button onClick={() => navigate('/swordhaven')} style={{
            background: 'linear-gradient(to bottom,#c8860a,#8B5E0A)',
            border: '2px solid #4a2c0a', borderRadius: 6, padding: '8px 20px',
            color: '#fff2cc', fontWeight: 'bold', fontSize: 13, cursor: 'pointer',
          }}>
            ← Swordhaven
          </button>
          <button onClick={() => navigate('/town')} style={{
            background: 'linear-gradient(to bottom,#c8860a,#8B5E0A)',
            border: '2px solid #4a2c0a', borderRadius: 6, padding: '8px 20px',
            color: '#fff2cc', fontWeight: 'bold', fontSize: 13, cursor: 'pointer',
          }}>
            🚪 Back to Town
          </button>
        </div>
      </div>
    </div>
  )
}
