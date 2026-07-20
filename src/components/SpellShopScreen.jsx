import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { useRef, useState } from 'react'
import { ALL_SPELLS } from '../data/spells'
import { useArrowScroll } from '../utils/useArrowScroll'

const elementColors = {
  Fire: 'bg-red-200 text-red-900 border-red-500',
  Ice: 'bg-sky-200 text-sky-900 border-sky-500',
  Energy: 'bg-yellow-200 text-yellow-900 border-yellow-500',
  Wind: 'bg-emerald-200 text-emerald-900 border-emerald-500',
  Earth: 'bg-amber-200 text-amber-900 border-amber-600',
  Darkness: 'bg-purple-300 text-purple-900 border-purple-600',
  Light: 'bg-yellow-100 text-yellow-800 border-yellow-400',
  Water: 'bg-blue-200 text-blue-900 border-blue-500',
}

const SpellShopScreen = () => {
  const navigate = useNavigate()
  const { player, purchaseSpell } = useGame()
  const [message, setMessage] = useState(null)
  const scrollRef = useRef(null)
  useArrowScroll(scrollRef)

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

  const learnedCount = (player.purchasedSpells || []).length

  return (
    <div className="w-full h-screen bg-gradient-to-b from-violet-800 via-purple-700 to-fuchsia-800 relative overflow-hidden flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-700 to-violet-800"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.06) 10px, rgba(255,255,255,0.06) 20px)',
        }}></div>
        <div className="absolute top-20 left-20 text-6xl opacity-20">📚</div>
        <div className="absolute top-40 right-32 text-5xl opacity-20">✨</div>
        <div className="absolute bottom-32 left-32 text-4xl opacity-20">🔥</div>
        <div className="absolute bottom-20 right-20 text-5xl opacity-20">❄️</div>
      </div>

      <div className="relative z-10 w-full max-w-4xl bg-gradient-to-br from-violet-100 to-purple-50 border-8 border-purple-800 rounded-lg shadow-2xl p-8 flex flex-col max-h-screen overflow-hidden">
        {/* Header */}
        <div className="text-center mb-6 flex-shrink-0">
          <h1 className="text-5xl font-bold text-purple-900 mb-2 drop-shadow-lg" style={{
            textShadow: '3px 3px 0px #6b21a8',
            fontFamily: 'Georgia, serif'
          }}>
            📚 Intellect Building
          </h1>
          <p className="text-purple-700 text-sm mb-3">Learn powerful spells to unleash in battle! ({learnedCount}/{ALL_SPELLS.length} learned)</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="bg-gradient-to-r from-yellow-200 to-yellow-300 border-4 border-yellow-600 rounded-lg px-4 py-2 inline-block">
              <span className="text-purple-900 font-bold text-lg">
                🪙 Gold: <span className="text-yellow-700">{player.gold.toLocaleString()}</span>
              </span>
            </div>
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

        {/* Spell Grid */}
        <div ref={scrollRef} className="overflow-y-auto flex-1 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
            {ALL_SPELLS.map(spell => {
              const owned = isOwned(spell)
              return (
                <div
                  key={spell.id}
                  className={`bg-gradient-to-br from-white to-purple-50 border-4 rounded-lg p-5 shadow-xl transition transform hover:scale-102 ${
                    owned ? 'border-blue-500' : 'border-purple-700'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-6xl flex-shrink-0">{spell.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-xl font-bold text-purple-900">{spell.name}</h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border-2 ${elementColors[spell.element] || 'bg-purple-200 text-purple-900 border-purple-500'}`}>
                          {spell.element}
                        </span>
                        {owned && (
                          <span className="text-xs bg-blue-600 text-white px-1 rounded font-bold">LEARNED</span>
                        )}
                      </div>
                      <p className="text-purple-700 text-sm mb-2">{spell.description}</p>
                      <div className={`text-sm font-bold mb-3 ${spell.type === 'heal' ? 'text-green-700' : 'text-red-700'}`}>
                        {spell.type === 'heal' ? '💚' : '⚔️'} {spell.type === 'heal' ? `Heals ${spell.heal} HP` : `Deals ${spell.damage} damage`} · 💧 {spell.cost} MP
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-lg font-bold text-yellow-700">🪙 {spell.price.toLocaleString()}</div>
                        <button
                          onClick={() => handlePurchase(spell)}
                          disabled={owned || player.gold < spell.price}
                          className={`px-4 py-2 font-bold rounded-lg border-4 transition transform hover:scale-105 text-sm ${
                            owned
                              ? 'bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed'
                              : player.gold >= spell.price
                                ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-green-800 shadow-lg'
                                : 'bg-gray-400 border-gray-500 text-gray-600 cursor-not-allowed'
                          }`}
                        >
                          {owned ? 'Learned' : 'Learn'}
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
        <div className="mt-4 flex-shrink-0">
          <button
            onClick={() => navigate('/town')}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-4 px-8 rounded-lg border-4 border-gray-500 shadow-lg transform transition hover:scale-105 text-xl"
          >
            Return to Town
          </button>
        </div>
      </div>
    </div>
  )
}

export default SpellShopScreen
