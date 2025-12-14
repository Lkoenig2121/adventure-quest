import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { useState } from 'react'

const ShopScreen = () => {
  const navigate = useNavigate()
  const { player, purchaseItem } = useGame()
  const [purchaseMessage, setPurchaseMessage] = useState(null)

  const shopItems = [
    // Potions
    {
      id: 'healthPotion',
      name: 'Health Potion',
      description: 'Restores 50% of max HP',
      price: 50,
      icon: '🧪',
      type: 'healthPotion'
    },
    {
      id: 'manaPotion',
      name: 'Mana Potion',
      description: 'Restores 50% of max MP',
      price: 50,
      icon: '💧',
      type: 'manaPotion'
    },
    // Weapons
    {
      id: 'fireSword',
      name: 'Fire Sword',
      description: 'Weapon: +15% Fire, +5% Energy',
      price: 200,
      icon: '⚔️',
      type: 'equipment',
      slot: 'weapon',
      elementBonuses: { fire: 15, energy: 5 }
    },
    {
      id: 'iceBlade',
      name: 'Ice Blade',
      description: 'Weapon: +15% Ice, +5% Water',
      price: 200,
      icon: '🗡️',
      type: 'equipment',
      slot: 'weapon',
      elementBonuses: { ice: 15, water: 5 }
    },
    {
      id: 'windSpear',
      name: 'Wind Spear',
      description: 'Weapon: +15% Wind, +5% Earth',
      price: 200,
      icon: '🔱',
      type: 'equipment',
      slot: 'weapon',
      elementBonuses: { wind: 15, earth: 5 }
    },
    {
      id: 'earthHammer',
      name: 'Earth Hammer',
      description: 'Weapon: +15% Earth, +5% Fire',
      price: 200,
      icon: '🔨',
      type: 'equipment',
      slot: 'weapon',
      elementBonuses: { earth: 15, fire: 5 }
    },
    {
      id: 'energyStaff',
      name: 'Energy Staff',
      description: 'Weapon: +10% All Elements',
      price: 300,
      icon: '🪄',
      type: 'equipment',
      slot: 'weapon',
      elementBonuses: { fire: 10, water: 10, wind: 10, ice: 10, earth: 10, energy: 10 }
    },
    // Helmets
    {
      id: 'fireHelmet',
      name: 'Fire Helmet',
      description: 'Helmet: +10% Fire, +5% Energy',
      price: 150,
      icon: '🪖',
      type: 'equipment',
      slot: 'helmet',
      elementBonuses: { fire: 10, energy: 5 }
    },
    {
      id: 'iceHelmet',
      name: 'Ice Helmet',
      description: 'Helmet: +10% Ice, +5% Water',
      price: 150,
      icon: '⛑️',
      type: 'equipment',
      slot: 'helmet',
      elementBonuses: { ice: 10, water: 5 }
    },
    {
      id: 'windHelmet',
      name: 'Wind Helmet',
      description: 'Helmet: +10% Wind, +5% Earth',
      price: 150,
      icon: '🎩',
      type: 'equipment',
      slot: 'helmet',
      elementBonuses: { wind: 10, earth: 5 }
    },
    // Armor
    {
      id: 'fireArmor',
      name: 'Fire Armor',
      description: 'Armor: +12% Fire, +8% Energy',
      price: 250,
      icon: '🛡️',
      type: 'equipment',
      slot: 'armor',
      elementBonuses: { fire: 12, energy: 8 }
    },
    {
      id: 'iceArmor',
      name: 'Ice Armor',
      description: 'Armor: +12% Ice, +8% Water',
      price: 250,
      icon: '❄️',
      type: 'equipment',
      slot: 'armor',
      elementBonuses: { ice: 12, water: 8 }
    },
    {
      id: 'windArmor',
      name: 'Wind Armor',
      description: 'Armor: +12% Wind, +8% Earth',
      price: 250,
      icon: '💨',
      type: 'equipment',
      slot: 'armor',
      elementBonuses: { wind: 12, earth: 8 }
    },
    {
      id: 'energyArmor',
      name: 'Energy Armor',
      description: 'Armor: +8% All Elements',
      price: 350,
      icon: '✨',
      type: 'equipment',
      slot: 'armor',
      elementBonuses: { fire: 8, water: 8, wind: 8, ice: 8, earth: 8, energy: 8 }
    },
    // Boots
    {
      id: 'fireBoots',
      name: 'Fire Boots',
      description: 'Boots: +8% Fire, +3% Energy',
      price: 100,
      icon: '👢',
      type: 'equipment',
      slot: 'boots',
      elementBonuses: { fire: 8, energy: 3 }
    },
    {
      id: 'iceBoots',
      name: 'Ice Boots',
      description: 'Boots: +8% Ice, +3% Water',
      price: 100,
      icon: '🥾',
      type: 'equipment',
      slot: 'boots',
      elementBonuses: { ice: 8, water: 3 }
    },
    {
      id: 'windBoots',
      name: 'Wind Boots',
      description: 'Boots: +8% Wind, +3% Earth',
      price: 100,
      icon: '👟',
      type: 'equipment',
      slot: 'boots',
      elementBonuses: { wind: 8, earth: 3 }
    },
  ]

  const handlePurchase = (item) => {
    if (player.gold < item.price) {
      setPurchaseMessage({ type: 'error', text: 'Not enough gold!' })
    } else {
      if (item.type === 'equipment') {
        purchaseItem(item.type, item.price, {
          name: item.name,
          slot: item.slot,
          elementBonuses: item.elementBonuses,
          icon: item.icon,
        })
      } else {
        purchaseItem(item.type, item.price)
      }
      setPurchaseMessage({ type: 'success', text: `Purchased ${item.name}!` })
    }
    setTimeout(() => setPurchaseMessage(null), 3000)
  }

  return (
    <div className="w-full h-screen bg-gradient-to-b from-amber-900 via-amber-800 to-amber-900 relative overflow-hidden flex items-center justify-center p-4">
      {/* Shop Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-800 to-amber-700"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)',
        }}></div>
        {/* Decorative coins */}
        <div className="absolute top-20 left-20 text-6xl opacity-20">🪙</div>
        <div className="absolute top-40 right-32 text-5xl opacity-20">💰</div>
        <div className="absolute bottom-32 left-32 text-4xl opacity-20">💎</div>
      </div>

      {/* Shop Content */}
      <div className="relative z-10 w-full max-w-4xl bg-gradient-to-br from-amber-100 to-amber-50 border-8 border-amber-800 rounded-lg shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-amber-900 mb-2 drop-shadow-lg" style={{
            textShadow: '3px 3px 0px #8b6914',
            fontFamily: 'Georgia, serif'
          }}>
            🏪 Item Shop
          </h1>
          <div className="bg-gradient-to-r from-yellow-200 to-yellow-300 border-4 border-yellow-600 rounded-lg px-6 py-3 inline-block mt-4">
            <span className="text-amber-900 font-bold text-xl">
              Your Gold: <span className="text-yellow-700">{player.gold.toLocaleString()}</span>
            </span>
          </div>
        </div>

        {/* Purchase Message */}
        {purchaseMessage && (
          <div className={`mb-6 p-4 rounded-lg border-4 text-center font-bold text-lg ${
            purchaseMessage.type === 'success'
              ? 'bg-green-100 border-green-600 text-green-800'
              : 'bg-red-100 border-red-600 text-red-800'
          } animate-fade-in`}>
            {purchaseMessage.text}
          </div>
        )}

        {/* Shop Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 max-h-96 overflow-y-auto p-2">
          {shopItems.map((item) => (
            <div
              key={item.id}
              className="bg-gradient-to-br from-white to-amber-50 border-4 border-amber-700 rounded-lg p-6 shadow-xl hover:shadow-2xl transition transform hover:scale-105"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="text-6xl">{item.icon}</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-amber-900 mb-2">{item.name}</h3>
                  <p className="text-amber-700 text-sm mb-4">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold text-yellow-700">
                      🪙 {item.price} Gold
                    </div>
                    <button
                      onClick={() => handlePurchase(item)}
                      disabled={player.gold < item.price}
                      className={`px-6 py-3 font-bold rounded-lg border-4 transition transform hover:scale-105 ${
                        player.gold >= item.price
                          ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-green-800 shadow-lg'
                          : 'bg-gray-400 border-gray-500 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      Buy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Player Inventory Display */}
        <div className="bg-gradient-to-br from-blue-100 to-blue-50 border-4 border-blue-600 rounded-lg p-6 mb-6">
          <h3 className="text-2xl font-bold text-blue-900 mb-4 text-center">Your Inventory</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white border-2 border-blue-400 rounded-lg p-4 text-center">
              <div className="text-4xl mb-2">🧪</div>
              <div className="text-blue-900 font-bold">Health Potions</div>
              <div className="text-3xl font-bold text-blue-700 mt-2">{player.healthPotions || 0}</div>
            </div>
            <div className="bg-white border-2 border-blue-400 rounded-lg p-4 text-center">
              <div className="text-4xl mb-2">💧</div>
              <div className="text-blue-900 font-bold">Mana Potions</div>
              <div className="text-3xl font-bold text-blue-700 mt-2">{player.manaPotions || 0}</div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-blue-900 font-bold mb-2">Equipment Items: {(player.inventory || []).length}</div>
            <div className="text-sm text-blue-700">Visit Character Page to equip items</div>
          </div>
        </div>

        {/* Return Button */}
        <button
          onClick={() => navigate('/town')}
          className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-4 px-8 rounded-lg border-4 border-gray-500 shadow-lg transform transition hover:scale-105 text-xl"
        >
          Return to Town
        </button>
      </div>
    </div>
  )
}

export default ShopScreen

