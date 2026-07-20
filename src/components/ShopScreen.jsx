import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { useRef, useState } from 'react'
import { useArrowScroll } from '../utils/useArrowScroll'
import { OPTIONS_LIST, useGameOptions } from '../utils/gameOptions'

const ShopScreen = () => {
  const navigate = useNavigate()
  const { player, purchaseItem, sellItem } = useGame()
  const [purchaseMessage, setPurchaseMessage] = useState(null)
  const [activeTab, setActiveTab] = useState('shop')
  const scrollRef = useRef(null)
  useArrowScroll(scrollRef)

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
      id: 'orcBombs',
      name: 'Orc Bombs',
      description: 'Weapon: Deals DOUBLE damage with 🔥 Fire element. Crafted by Orcish engineers — devastating against fire-weak enemies.',
      price: 500,
      icon: '💣',
      type: 'equipment',
      slot: 'weapon',
      elementBonuses: { fire: 20 },
      damageMultiplier: 2,
    },
    {
      id: 'abyssalWhip',
      name: 'Abyssal Whip',
      description: 'Weapon: Deals TRIPLE damage with 🌪️ Wind element. Forged from abyssal essence — lashes enemies with devastating wind strikes.',
      price: 100000,
      icon: '⛓️',
      type: 'equipment',
      slot: 'weapon',
      elementBonuses: { wind: 25 },
      damageMultiplier: 3,
    },
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
      id: 'obsidianCloak',
      name: 'Obsidian Cloak',
      description: 'Armor: Imbued with necromantic power. Unlocks special Necromancer moves in battle. +20% Darkness.',
      price: 1000,
      icon: '🖤',
      type: 'equipment',
      slot: 'armor',
      elementBonuses: { darkness: 20 },
    },
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

  const isOwned = (item) => {
    if (item.type !== 'equipment') return false
    const inventory = player.inventory || []
    const equipped  = player.equipped  || {}
    return (
      inventory.some(i => i.name === item.name) ||
      Object.values(equipped).some(e => e?.name === item.name)
    )
  }

  const handlePurchase = (item) => {
    if (item.type === 'equipment' && isOwned(item)) {
      setPurchaseMessage({ type: 'error', text: 'You already own this item!' })
    } else if (player.gold < item.price) {
      setPurchaseMessage({ type: 'error', text: 'Not enough gold!' })
    } else {
      if (item.type === 'equipment') {
        purchaseItem(item.type, item.price, {
          name: item.name,
          slot: item.slot,
          elementBonuses: item.elementBonuses,
          icon: item.icon,
          ...(item.damageMultiplier ? { damageMultiplier: item.damageMultiplier } : {}),
        })
      } else {
        purchaseItem(item.type, item.price)
      }
      setPurchaseMessage({ type: 'success', text: `Purchased ${item.name}!` })
    }
    setTimeout(() => setPurchaseMessage(null), 3000)
  }

  const handleSell = (eq) => {
    const sellPrice = Math.floor((eq.price || 0) * 0.8)
    sellItem(eq.id)
    setPurchaseMessage({ type: 'success', text: `Sold ${eq.name} for ${sellPrice}g!` })
    setTimeout(() => setPurchaseMessage(null), 3000)
  }

  const [openCategories, setOpenCategories] = useState(new Set([
    '🧪 Potions', '⚔️ Weapons', '🪖 Helmets', '🛡️ Armor', '👢 Boots',
  ]))

  const { gameOptions, toggleOption } = useGameOptions()

  const toggleCategory = (label) => {
    setOpenCategories(prev => {
      const next = new Set(prev)
      next.has(label) ? next.delete(label) : next.add(label)
      return next
    })
  }

  const categories = [
    { label: '🧪 Potions',  filter: i => i.type === 'healthPotion' || i.type === 'manaPotion' },
    { label: '⚔️ Weapons',  filter: i => i.slot === 'weapon' },
    { label: '🪖 Helmets',  filter: i => i.slot === 'helmet' },
    { label: '🛡️ Armor',    filter: i => i.slot === 'armor'  },
    { label: '👢 Boots',    filter: i => i.slot === 'boots'  },
  ]

  const equippedEntries = Object.entries(player.equipped || {}).filter(([, v]) => v)
  const bagItems = player.inventory || []

  const tabs = [
    { id: 'shop',      label: '🛒 Buy Items' },
    { id: 'inventory', label: '🎒 Inventory' },
    { id: 'options',   label: '⚙️ Options' },
  ]

  return (
    <div className="w-full h-screen bg-gradient-to-b from-amber-700 via-amber-600 to-amber-700 relative overflow-hidden flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-orange-700"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)',
        }}></div>
        <div className="absolute top-20 left-20 text-6xl opacity-20">🏪</div>
        <div className="absolute top-40 right-32 text-5xl opacity-20">⚔️</div>
        <div className="absolute bottom-32 left-32 text-4xl opacity-20">🛡️</div>
        <div className="absolute bottom-20 right-20 text-5xl opacity-20">🧪</div>
      </div>

      <div className="relative z-10 w-full max-w-5xl bg-gradient-to-br from-amber-100 to-amber-50 border-8 border-amber-800 rounded-lg shadow-2xl p-8 flex flex-col max-h-screen overflow-hidden">
        {/* Header */}
        <div className="text-center mb-6 flex-shrink-0">
          <h1 className="text-5xl font-bold text-amber-900 mb-2 drop-shadow-lg" style={{
            textShadow: '3px 3px 0px #8b6914',
            fontFamily: 'Georgia, serif'
          }}>
            🏪 Item Shop
          </h1>
          <p className="text-amber-700 text-sm mb-3">Gear up with potions, weapons, and armor!</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="bg-gradient-to-r from-yellow-200 to-yellow-300 border-4 border-yellow-600 rounded-lg px-4 py-2 inline-block">
              <span className="text-amber-900 font-bold text-lg">
                🪙 Gold: <span className="text-yellow-700">{player.gold.toLocaleString()}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Message */}
        {purchaseMessage && (
          <div className={`mb-4 p-3 rounded-lg border-4 text-center font-bold flex-shrink-0 ${
            purchaseMessage.type === 'success'
              ? 'bg-green-100 border-green-600 text-green-800'
              : 'bg-red-100 border-red-600 text-red-800'
          } animate-fade-in`}>
            {purchaseMessage.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4 flex-shrink-0 flex-wrap justify-center">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 font-bold rounded-lg border-4 transition transform hover:scale-105 text-sm md:text-base ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-800 shadow-lg'
                  : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div ref={scrollRef} className="overflow-y-auto flex-1 min-h-0">
          {activeTab === 'shop' && (
            <div className="p-1">
              {categories.map(cat => {
                const items = shopItems.filter(cat.filter)
                if (!items.length) return null
                const isOpen = openCategories.has(cat.label)
                return (
                  <div key={cat.label} className="mb-4">
                    <button
                      onClick={() => toggleCategory(cat.label)}
                      className="w-full bg-gradient-to-br from-amber-200 to-amber-100 border-4 border-amber-600 rounded-lg px-4 py-3 mb-3 flex items-center justify-between transition hover:scale-101"
                    >
                      <h3 className="text-lg font-bold text-amber-900">{cat.label}</h3>
                      <span className="text-amber-700 font-bold text-sm">{isOpen ? '▲ Hide' : '▼ Show'}</span>
                    </button>
                    {isOpen && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {items.map(item => {
                          const owned = isOwned(item)
                          return (
                            <div
                              key={item.id}
                              className={`bg-gradient-to-br from-white to-amber-50 border-4 rounded-lg p-5 shadow-xl transition transform hover:scale-102 ${
                                owned ? 'border-blue-500' : 'border-amber-700'
                              }`}
                            >
                              <div className="flex items-start gap-4">
                                <div className="text-5xl flex-shrink-0">{item.icon}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h3 className="text-lg font-bold text-amber-900">{item.name}</h3>
                                    {owned && (
                                      <span className="text-xs bg-blue-600 text-white px-1 rounded font-bold">OWNED</span>
                                    )}
                                  </div>
                                  <p className="text-amber-700 text-sm mb-2">{item.description}</p>
                                  {item.elementBonuses && (
                                    <div className="flex gap-1.5 flex-wrap mb-3">
                                      {Object.entries(item.elementBonuses).map(([el, val]) => (
                                        <span key={el} className="text-xs font-bold bg-orange-200 text-orange-900 px-2 py-0.5 rounded-full border-2 border-orange-400 capitalize">
                                          {el} +{val}%
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="text-lg font-bold text-yellow-700">🪙 {item.price.toLocaleString()}</div>
                                    <button
                                      onClick={() => handlePurchase(item)}
                                      disabled={owned || player.gold < item.price}
                                      className={`px-4 py-2 font-bold rounded-lg border-4 transition transform hover:scale-105 text-sm ${
                                        owned
                                          ? 'bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed'
                                          : player.gold >= item.price
                                            ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-green-800 shadow-lg'
                                            : 'bg-gray-400 border-gray-500 text-gray-600 cursor-not-allowed'
                                      }`}
                                    >
                                      {owned ? 'Owned' : 'Buy'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="p-1 space-y-6">
              {/* Consumables */}
              <div>
                <h3 className="text-lg font-bold text-amber-900 mb-3">🧪 Consumables</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: '🧪', label: 'Health Potions', count: player.healthPotions || 0 },
                    { icon: '💧', label: 'Mana Potions',   count: player.manaPotions   || 0 },
                  ].map(c => (
                    <div key={c.label} className="bg-gradient-to-br from-white to-amber-50 border-4 border-amber-700 rounded-lg p-4 shadow-xl flex items-center gap-3">
                      <span className="text-4xl">{c.icon}</span>
                      <span className="flex-1 font-bold text-amber-900">{c.label}</span>
                      <span className="text-xl font-bold text-yellow-700">×{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipped */}
              {equippedEntries.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-amber-900 mb-3">🛡️ Equipped</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {equippedEntries.map(([slot, eq]) => {
                      const sellPrice = Math.floor((eq.price || 0) * 0.8)
                      return (
                        <div key={slot} className="bg-gradient-to-br from-white to-blue-50 border-4 border-blue-500 rounded-lg p-4 shadow-xl flex items-center gap-3">
                          <span className="text-4xl">{eq.icon || '⚔️'}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-amber-900 truncate">{eq.name}</div>
                            <div className="text-xs text-amber-600 capitalize">{slot} — equipped</div>
                          </div>
                          {sellPrice > 0 && (
                            <button
                              onClick={() => handleSell(eq)}
                              className="px-3 py-1.5 font-bold rounded-lg border-4 border-red-800 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs shadow-lg transition transform hover:scale-105 whitespace-nowrap"
                            >
                              Sell {sellPrice}g
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Bag */}
              <div>
                <h3 className="text-lg font-bold text-amber-900 mb-3">🎒 Bag ({bagItems.length} items)</h3>
                {bagItems.length === 0 ? (
                  <div className="bg-gradient-to-br from-white to-amber-50 border-4 border-amber-300 rounded-lg p-6 text-center text-amber-600 font-semibold">
                    Bag is empty.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bagItems.map(eq => {
                      const sellPrice = Math.floor((eq.price || 0) * 0.8)
                      return (
                        <div key={eq.id} className="bg-gradient-to-br from-white to-amber-50 border-4 border-amber-700 rounded-lg p-4 shadow-xl flex items-center gap-3">
                          <span className="text-4xl">{eq.icon || '⚔️'}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-amber-900 truncate">{eq.name}</div>
                            <div className="text-xs text-amber-600 capitalize">{eq.slot}</div>
                          </div>
                          {sellPrice > 0 ? (
                            <button
                              onClick={() => handleSell(eq)}
                              className="px-3 py-1.5 font-bold rounded-lg border-4 border-red-800 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs shadow-lg transition transform hover:scale-105 whitespace-nowrap"
                            >
                              Sell {sellPrice}g
                            </button>
                          ) : (
                            <span className="text-xs text-amber-500 font-semibold">No value</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'options' && (
            <div className="p-1">
              <h3 className="text-lg font-bold text-amber-900 mb-3 uppercase tracking-wide">⚙️ Game Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {OPTIONS_LIST.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => toggleOption(opt.key)}
                    className={`text-left bg-gradient-to-br from-white to-amber-50 border-4 rounded-lg p-4 shadow-xl transition transform hover:scale-102 flex items-center gap-4 ${
                      gameOptions[opt.key] ? 'border-green-500' : 'border-amber-300'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-12 h-7 rounded-full border-4 relative transition-colors ${
                      gameOptions[opt.key] ? 'bg-green-500 border-green-700' : 'bg-gray-300 border-gray-400'
                    }`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                        gameOptions[opt.key] ? 'left-6' : 'left-0.5'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold ${gameOptions[opt.key] ? 'text-green-800' : 'text-amber-900'}`}>{opt.label}</div>
                      <div className="text-xs text-amber-600 mt-0.5">{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
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

export default ShopScreen
