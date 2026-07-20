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
    <div className="w-full h-screen bg-gradient-to-b from-yellow-500 via-amber-500 to-yellow-600 relative overflow-hidden flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-yellow-600"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.15) 10px, rgba(255,255,255,0.15) 20px)',
        }}></div>
        <div className="absolute top-20 left-20 text-6xl opacity-25">👑</div>
        <div className="absolute top-40 right-32 text-5xl opacity-25">🏆</div>
        <div className="absolute bottom-32 left-32 text-4xl opacity-25">⚔️</div>
        <div className="absolute bottom-20 right-20 text-5xl opacity-25">🛡️</div>
      </div>

      <div className="relative z-10 w-full max-w-4xl bg-gradient-to-br from-yellow-50 to-amber-50 border-8 border-yellow-600 rounded-lg shadow-2xl p-8 flex flex-col max-h-screen overflow-hidden">
        {/* Header */}
        <div className="text-center mb-6 flex-shrink-0">
          <h1 className="text-5xl font-bold text-amber-900 mb-2 drop-shadow-lg" style={{
            textShadow: '3px 3px 0px #b45309',
            fontFamily: 'Georgia, serif'
          }}>
            👑 Reign Armoury
          </h1>
          <p className="text-amber-700 text-sm mb-3">Legendary equipment of Swordhaven's champions</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="bg-gradient-to-r from-yellow-200 to-yellow-300 border-4 border-yellow-600 rounded-lg px-4 py-2 inline-block">
              <span className="text-amber-900 font-bold text-lg">
                🪙 Gold: <span className="text-yellow-700">{player.gold.toLocaleString()}</span>
              </span>
            </div>
            {allOwned && (
              <div className="bg-gradient-to-r from-green-200 to-emerald-200 border-4 border-green-600 rounded-lg px-4 py-2 inline-block">
                <span className="text-green-900 font-bold text-lg">✅ Full set acquired!</span>
              </div>
            )}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg border-4 text-center font-bold flex-shrink-0 ${
            message.type === 'success'
              ? 'bg-green-100 border-green-600 text-green-800'
              : 'bg-red-100 border-red-600 text-red-800'
          } animate-fade-in`}>
            {message.text}
          </div>
        )}

        {/* Item Grid */}
        <div className="overflow-y-auto flex-1 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
            {REIGN_ITEMS.map(item => {
              const owned = isOwned(item)
              return (
                <div
                  key={item.id}
                  className={`bg-gradient-to-br from-white to-yellow-50 border-4 rounded-lg p-5 shadow-xl transition transform hover:scale-102 ${
                    owned ? 'border-blue-500' : 'border-yellow-600'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-6xl flex-shrink-0">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-xl font-bold text-amber-900">{item.name}</h3>
                        <span className="text-xs font-bold text-amber-700 capitalize bg-amber-100 border-2 border-amber-400 px-2 py-0.5 rounded-full">
                          {item.slot}
                        </span>
                        {owned && (
                          <span className="text-xs bg-blue-600 text-white px-1 rounded font-bold">OWNED</span>
                        )}
                      </div>
                      <p className="text-amber-700 text-sm mb-2">{item.description}</p>
                      <div className="flex gap-1.5 flex-wrap mb-3">
                        {item.damageMultiplier && (
                          <span className="text-xs font-bold bg-red-200 text-red-900 px-2 py-0.5 rounded-full border-2 border-red-500">
                            ×{item.damageMultiplier} damage
                          </span>
                        )}
                        {Object.entries(item.elementBonuses).map(([el, val]) => (
                          <span key={el} className="text-xs font-bold bg-yellow-200 text-yellow-900 px-2 py-0.5 rounded-full border-2 border-yellow-500 capitalize">
                            {el} +{val}%
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-lg font-bold text-yellow-700">🪙 {item.price.toLocaleString()}</div>
                        <button
                          onClick={() => handleBuy(item)}
                          disabled={owned || player.gold < item.price}
                          className={`px-4 py-2 font-bold rounded-lg border-4 transition transform hover:scale-105 text-sm ${
                            owned
                              ? 'bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed'
                              : player.gold >= item.price
                                ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white border-amber-800 shadow-lg'
                                : 'bg-gray-400 border-gray-500 text-gray-600 cursor-not-allowed'
                          }`}
                        >
                          {owned ? 'Owned' : 'Purchase'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Return */}
        <div className="mt-4 flex-shrink-0 flex gap-3">
          <button
            onClick={() => navigate('/swordhaven')}
            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-4 px-8 rounded-lg border-4 border-amber-800 shadow-lg transform transition hover:scale-105 text-lg"
          >
            ← Swordhaven
          </button>
          <button
            onClick={() => navigate('/town')}
            className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-4 px-8 rounded-lg border-4 border-gray-500 shadow-lg transform transition hover:scale-105 text-lg"
          >
            🚪 Back to Town
          </button>
        </div>
      </div>
    </div>
  )
}
