import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { useRef, useState } from 'react'
import { getPetEffectLabel } from '../utils/petStats'
import { useArrowScroll } from '../utils/useArrowScroll'

const ALL_PETS = [
  {
    id: 'nerfKitten',
    name: 'Nerf Kitten',
    description: 'A fierce little kitten that attacks enemies with tiny but determined swipes. Its damage grows with your Level.',
    icon: '🐱',
    effect: 'attack',
    effectMin: 8,
    effectMax: 15,
    price: 500,
    rarity: 'Rare',
    rarityColor: 'text-purple-700',
  },
  {
    id: 'moglinHealer',
    name: 'Moglin',
    description: 'A friendly orange Moglin companion that heals you every turn. Its healing grows with your Level.',
    icon: '🧡',
    effect: 'heal',
    effectAmount: 20,
    price: 400,
    rarity: 'Uncommon',
    rarityColor: 'text-green-700',
  },
  {
    id: 'babyDragon',
    name: 'Baby Dragon',
    description: 'A tiny fire-breathing dragon hatchling that scorches enemies. Its damage grows with your Level.',
    icon: '🐉',
    effect: 'attack',
    effectMin: 12,
    effectMax: 20,
    price: 700,
    rarity: 'Rare',
    rarityColor: 'text-purple-700',
  },
  {
    id: 'zard',
    name: 'Zard',
    description: 'A loyal reptilian companion from Lore. Nips at enemies every turn, dealing more damage as your Level increases.',
    icon: '🦎',
    effect: 'attack',
    effectMin: 5,
    effectMax: 12,
    price: 250,
    rarity: 'Common',
    rarityColor: 'text-gray-600',
  },
  {
    id: 'shadowWolf',
    name: 'Shadow Wolf',
    description: 'A spectral wolf that lunges at enemies with devastating force. Its damage grows with your Level.',
    icon: '🐺',
    effect: 'attack',
    effectMin: 15,
    effectMax: 28,
    price: 900,
    rarity: 'Epic',
    rarityColor: 'text-orange-600',
  },
  {
    id: 'healingSprite',
    name: 'Healing Sprite',
    description: 'A tiny glowing fairy that restores some of your HP each turn. Its healing grows with your Level.',
    icon: '✨',
    effect: 'heal',
    effectAmount: 15,
    price: 350,
    rarity: 'Uncommon',
    rarityColor: 'text-green-700',
  },
  {
    id: 'paxiaDragon',
    name: 'Paxia Dragon',
    description: 'One of the legendary elemental dragon hatchlings of Paxia Isle. Its damage grows with your Level.',
    icon: '🐲',
    effect: 'attack',
    effectMin: 10,
    effectMax: 18,
    price: 600,
    rarity: 'Rare',
    rarityColor: 'text-purple-700',
  },
  {
    id: 'chibiLoco',
    name: 'Chibi Loco',
    description: 'A chaotic little creature brimming with wild energy. Unpredictable but powerful, and its damage grows with your Level.',
    icon: '😈',
    effect: 'attack',
    effectMin: 6,
    effectMax: 22,
    price: 450,
    rarity: 'Uncommon',
    rarityColor: 'text-green-700',
  },
]

const PetShopScreen = () => {
  const navigate = useNavigate()
  const { player, purchasePet, setActivePet } = useGame()
  const [message, setMessage] = useState(null)
  const [selectedPet, setSelectedPet] = useState(null)
  const scrollRef = useRef(null)
  useArrowScroll(scrollRef)

  const ownedPets = player.pets || []
  const activePetId = player.activePetId

  const isPetOwned = (petId) => ownedPets.some(p => p.id === petId)

  const handlePurchase = (pet) => {
    if (player.gold < pet.price) {
      setMessage({ type: 'error', text: 'Not enough gold!' })
    } else if (isPetOwned(pet.id)) {
      setMessage({ type: 'error', text: 'You already own this pet!' })
    } else {
      purchasePet(pet, pet.price)
      setMessage({ type: 'success', text: `${pet.name} joined your team!` })
    }
    setTimeout(() => setMessage(null), 3000)
  }

  const handleSetActive = (pet) => {
    setActivePet(activePetId === pet.id ? null : pet.id)
    setMessage({
      type: 'success',
      text: activePetId === pet.id ? 'Pet deselected.' : `${pet.name} is now your active pet!`,
    })
    setTimeout(() => setMessage(null), 2000)
  }

  const activeFullPet = ALL_PETS.find(p => p.id === activePetId)

  return (
    <div className="w-full h-screen bg-gradient-to-b from-amber-900 via-amber-800 to-amber-900 relative overflow-hidden flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-800 to-amber-700"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)',
        }}></div>
        <div className="absolute top-20 left-20 text-6xl opacity-20">🐾</div>
        <div className="absolute top-40 right-32 text-5xl opacity-20">🐱</div>
        <div className="absolute bottom-32 left-32 text-4xl opacity-20">🐉</div>
        <div className="absolute bottom-20 right-20 text-5xl opacity-20">🐺</div>
      </div>

      <div className="relative z-10 w-full max-w-4xl bg-gradient-to-br from-amber-100 to-amber-50 border-8 border-amber-800 rounded-lg shadow-2xl p-8 flex flex-col max-h-screen overflow-hidden">
        {/* Header */}
        <div className="text-center mb-6 flex-shrink-0">
          <h1 className="text-5xl font-bold text-amber-900 mb-2 drop-shadow-lg" style={{
            textShadow: '3px 3px 0px #8b6914',
            fontFamily: 'Georgia, serif'
          }}>
            🐾 Pet Shop
          </h1>
          <p className="text-amber-700 text-sm mb-3">Buy a companion to fight alongside you in battle!</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="bg-gradient-to-r from-yellow-200 to-yellow-300 border-4 border-yellow-600 rounded-lg px-4 py-2 inline-block">
              <span className="text-amber-900 font-bold text-lg">
                🪙 Gold: <span className="text-yellow-700">{player.gold.toLocaleString()}</span>
              </span>
            </div>
            {activeFullPet && (
              <div className="bg-gradient-to-r from-green-200 to-emerald-200 border-4 border-green-600 rounded-lg px-4 py-2 inline-block">
                <span className="text-green-900 font-bold text-lg">
                  Active Pet: {activeFullPet.icon} {activeFullPet.name}
                </span>
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

        {/* Your Pets */}
        {ownedPets.length > 0 && (
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 border-4 border-blue-600 rounded-lg p-4 mb-4 flex-shrink-0">
            <h3 className="text-lg font-bold text-blue-900 mb-3">Your Pets — click to set active</h3>
            <div className="flex gap-3 flex-wrap">
              {ownedPets.map(pet => {
                const fullPet = ALL_PETS.find(p => p.id === pet.id) || pet
                const isActive = activePetId === pet.id
                return (
                  <button
                    key={pet.id}
                    onClick={() => handleSetActive(fullPet)}
                    className={`flex flex-col items-center gap-1 px-4 py-3 rounded-lg border-4 font-bold transition transform hover:scale-105 ${
                      isActive
                        ? 'bg-green-400 border-green-700 text-green-900 shadow-lg'
                        : 'bg-white border-blue-400 text-blue-900 hover:bg-blue-50'
                    }`}
                  >
                    <span className="text-3xl">{fullPet.icon}</span>
                    <span className="text-xs">{fullPet.name}</span>
                    {isActive && <span className="text-xs bg-green-700 text-white px-1 rounded">ACTIVE</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Pet Grid */}
        <div ref={scrollRef} className="overflow-y-auto flex-1 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
            {ALL_PETS.map(pet => {
              const owned = isPetOwned(pet.id)
              const isActive = activePetId === pet.id
              return (
                <div
                  key={pet.id}
                  className={`bg-gradient-to-br from-white to-amber-50 border-4 rounded-lg p-5 shadow-xl transition transform hover:scale-102 ${
                    isActive ? 'border-green-500' : owned ? 'border-blue-500' : 'border-amber-700'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-6xl flex-shrink-0">{pet.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-xl font-bold text-amber-900">{pet.name}</h3>
                        <span className={`text-xs font-bold ${pet.rarityColor}`}>[{pet.rarity}]</span>
                        {owned && (
                          <span className="text-xs bg-blue-600 text-white px-1 rounded font-bold">OWNED</span>
                        )}
                        {isActive && (
                          <span className="text-xs bg-green-600 text-white px-1 rounded font-bold">ACTIVE</span>
                        )}
                      </div>
                      <p className="text-amber-700 text-sm mb-2">{pet.description}</p>
                      <div className={`text-sm font-bold mb-3 ${pet.effect === 'heal' ? 'text-green-700' : 'text-red-700'}`}>
                        {pet.effect === 'heal' ? '💚' : '⚔️'} {getPetEffectLabel(pet, player.level)}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-lg font-bold text-yellow-700">🪙 {pet.price} Gold</div>
                        {owned ? (
                          <button
                            onClick={() => handleSetActive(pet)}
                            className={`px-4 py-2 font-bold rounded-lg border-4 transition transform hover:scale-105 text-sm ${
                              isActive
                                ? 'bg-gray-400 border-gray-500 text-gray-100 hover:bg-gray-500'
                                : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-green-800 shadow-lg'
                            }`}
                          >
                            {isActive ? 'Deselect' : 'Set Active'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePurchase(pet)}
                            disabled={player.gold < pet.price}
                            className={`px-4 py-2 font-bold rounded-lg border-4 transition transform hover:scale-105 text-sm ${
                              player.gold >= pet.price
                                ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-green-800 shadow-lg'
                                : 'bg-gray-400 border-gray-500 text-gray-600 cursor-not-allowed'
                            }`}
                          >
                            Buy
                          </button>
                        )}
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

export default PetShopScreen
