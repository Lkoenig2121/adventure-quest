import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { useState } from 'react'

const ShopScreen = () => {
  const navigate = useNavigate()
  const { player, purchaseItem, sellItem } = useGame()
  const [purchaseMessage, setPurchaseMessage] = useState(null)
  const [activeTab, setActiveTab] = useState('shop')

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

  const [selectedItem, setSelectedItem] = useState(shopItems[0])
  const [openCategories, setOpenCategories] = useState(new Set(['🧪 Potions']))

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

  const woodBorder = {
    background: 'linear-gradient(135deg,#8B5E3C,#6B3F1F)',
    border: '3px solid #4a2c0a',
    boxShadow: 'inset 0 0 8px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.6)',
  }

  const parchment = {
    background: 'linear-gradient(160deg,#f5e6c8,#e8d0a0)',
    border: '3px solid #8B6914',
  }

  const AqButton = ({ onClick, disabled, children, className = '' }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 font-bold text-sm rounded transition-all ${className}`}
      style={{
        background: disabled
          ? 'linear-gradient(to bottom,#888,#555)'
          : 'linear-gradient(to bottom,#c8860a,#8B5E0A)',
        border: '2px solid #4a2c0a',
        color: disabled ? '#999' : '#fff2cc',
        textShadow: disabled ? 'none' : '0 1px 2px rgba(0,0,0,0.7)',
        boxShadow: disabled ? 'none' : '0 3px 0 #4a2c0a, inset 0 1px 0 rgba(255,255,255,0.2)',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  )

  return (
    <div className="w-full h-screen flex items-center justify-center" style={{
      background: 'linear-gradient(to bottom, #2a1a0a 0%, #1a0d00 100%)',
    }}>
      {/* Outer wooden frame */}
      <div className="flex flex-col" style={{
        width: 780, minHeight: 520,
        ...woodBorder,
        borderRadius: 8,
        padding: 6,
      }}>

        {/* Title bar */}
        <div className="flex items-center justify-center py-2 mb-1" style={{
          background: 'linear-gradient(to bottom,#5c3410,#3b1f08)',
          borderRadius: '4px 4px 0 0',
          borderBottom: '2px solid #4a2c0a',
        }}>
          <span style={{ fontFamily: 'Georgia,serif', color: '#ffd87a', fontSize: 20, fontWeight: 'bold', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
            🏪 Item Shop
          </span>
        </div>

        {/* Main 3-column layout */}
        <div className="flex gap-1 flex-1" style={{ minHeight: 0 }}>

          {/* LEFT — treasure chest + gold */}
          <div className="flex flex-col items-center justify-between py-4 px-3" style={{
            width: 130,
            background: 'linear-gradient(160deg,#6b3f1f,#3b1f08)',
            borderRight: '2px solid #4a2c0a',
          }}>
            <div className="text-center">
              <div style={{ fontSize: 64, lineHeight: 1 }}>🗃️</div>
              <div style={{ color: '#ffd87a', fontFamily: 'Georgia,serif', fontSize: 11, marginTop: 6, textAlign: 'center', fontWeight: 'bold' }}>
                Shop Wares
              </div>
            </div>

            <div className="w-full">
              <div style={{ ...parchment, borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#5c3410', fontWeight: 'bold' }}>Your Gold</div>
                <div style={{ fontSize: 16, color: '#8B5E0A', fontWeight: 'bold', marginTop: 2 }}>
                  🪙 {player.gold.toLocaleString()}
                </div>
              </div>

              {purchaseMessage && (
                <div style={{
                  marginTop: 6,
                  padding: '4px 6px',
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  background: purchaseMessage.type === 'success' ? '#d4edda' : '#f8d7da',
                  color:      purchaseMessage.type === 'success' ? '#155724' : '#721c24',
                  border:     `1px solid ${purchaseMessage.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                }}>
                  {purchaseMessage.text}
                </div>
              )}
            </div>
          </div>

          {/* MIDDLE — scrollable item list */}
          <div className="flex flex-col flex-1" style={{ minWidth: 0 }}>
            {/* Tab row */}
            <div className="flex" style={{ borderBottom: '2px solid #4a2c0a' }}>
              {['shop','inventory'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    padding: '6px 0',
                    fontSize: 12,
                    fontWeight: 'bold',
                    fontFamily: 'Georgia,serif',
                    color: activeTab === tab ? '#ffd87a' : '#c4a87a',
                    background: activeTab === tab
                      ? 'linear-gradient(to bottom,#5c3410,#3b1f08)'
                      : 'linear-gradient(to bottom,#3b1f08,#2a1508)',
                    border: 'none',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {tab === 'shop' ? '🛒 Buy Items' : '🎒 Inventory'}
                </button>
              ))}
            </div>

            {activeTab === 'shop' ? (
              <div className="overflow-y-auto flex-1" style={{
                background: '#1a0d00',
                scrollbarWidth: 'thin',
                scrollbarColor: '#8B5E3C #1a0d00',
              }}>
                {categories.map(cat => {
                  const items = shopItems.filter(cat.filter)
                  if (!items.length) return null
                  const isOpen = openCategories.has(cat.label)
                  return (
                    <div key={cat.label}>
                      {/* Clickable category header */}
                      <div
                        onClick={() => toggleCategory(cat.label)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '5px 10px',
                          background: isOpen
                            ? 'linear-gradient(to right,#5c3410,#3b1f08)'
                            : 'linear-gradient(to right,#3b1f08,#2a1508)',
                          color: isOpen ? '#ffd87a' : '#c4a87a',
                          fontSize: 11,
                          fontWeight: 'bold',
                          borderBottom: '1px solid #4a2c0a',
                          borderTop: '1px solid #4a2c0a',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        <span>{cat.label}</span>
                        <span style={{ fontSize: 9, opacity: 0.8 }}>{isOpen ? '▲' : '▼'}</span>
                      </div>

                      {/* Items — only shown when open */}
                      {isOpen && items.map(item => {
                        const owned = isOwned(item)
                        return (
                          <div
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '6px 10px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #2a1508',
                              background: selectedItem?.id === item.id
                                ? 'rgba(100,60,20,0.6)'
                                : 'transparent',
                              color: owned
                                ? '#6b5030'
                                : selectedItem?.id === item.id ? '#ffd87a' : '#d4b896',
                              opacity: owned ? 0.6 : 1,
                            }}
                            onMouseEnter={e => { if (selectedItem?.id !== item.id) e.currentTarget.style.background = 'rgba(80,40,10,0.4)' }}
                            onMouseLeave={e => { if (selectedItem?.id !== item.id) e.currentTarget.style.background = 'transparent' }}
                          >
                            <span style={{ fontSize: 16, minWidth: 22 }}>{item.icon}</span>
                            <span style={{ fontSize: 12, fontFamily: 'Georgia,serif' }}>{item.name}</span>
                            <span style={{ marginLeft: 'auto', fontSize: 11, color: owned ? '#6b5030' : '#ffd87a' }}>
                              {owned ? '✓' : `${item.price}g`}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            ) : (
              /* Inventory tab */
              <div className="overflow-y-auto flex-1" style={{ background: '#1a0d00' }}>
                {/* Consumables (not sellable) */}
                <div style={{ color: '#c4a87a', fontFamily: 'Georgia,serif', fontSize: 11, padding: '5px 10px 3px', borderBottom: '1px solid #2a1508' }}>
                  Consumables
                </div>
                {[
                  { icon: '🧪', label: 'Health Potions', count: player.healthPotions || 0 },
                  { icon: '💧', label: 'Mana Potions',   count: player.manaPotions   || 0 },
                ].map(c => (
                  <div key={c.label} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '5px 10px', borderBottom: '1px solid #2a1508',
                    color: '#d4b896', fontSize: 12,
                  }}>
                    <span style={{ fontSize: 14 }}>{c.icon}</span>
                    <span>{c.label}</span>
                    <span style={{ marginLeft: 'auto', color: '#ffd87a', fontWeight: 'bold' }}>×{c.count}</span>
                  </div>
                ))}

                {/* Equipped items */}
                {Object.entries(player.equipped || {}).some(([, v]) => v) && (
                  <>
                    <div style={{ color: '#c4a87a', fontFamily: 'Georgia,serif', fontSize: 11, padding: '5px 10px 3px', borderBottom: '1px solid #2a1508', borderTop: '1px solid #4a2c0a' }}>
                      Equipped
                    </div>
                    {Object.entries(player.equipped || {}).filter(([, v]) => v).map(([slot, eq]) => {
                      const sellPrice = Math.floor((eq.price || 0) * 0.8)
                      return (
                        <div key={slot} style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '5px 10px', borderBottom: '1px solid #2a1508',
                          color: '#d4b896', fontSize: 11,
                        }}>
                          <span style={{ fontSize: 14 }}>{eq.icon || '⚔️'}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{eq.name}</div>
                            <div style={{ fontSize: 9, color: '#a08060', textTransform: 'capitalize' }}>{slot} — equipped</div>
                          </div>
                          {sellPrice > 0 && (
                            <button
                              onClick={() => { sellItem(eq.id); setPurchaseMessage({ type: 'success', text: `Sold ${eq.name} for ${sellPrice}g!` }); setTimeout(() => setPurchaseMessage(null), 3000) }}
                              style={{
                                fontSize: 10, padding: '2px 6px', borderRadius: 3, cursor: 'pointer', whiteSpace: 'nowrap',
                                background: 'linear-gradient(to bottom,#7a3a0a,#4a2005)',
                                border: '1px solid #4a2c0a', color: '#ffd87a',
                              }}
                            >
                              Sell {sellPrice}g
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </>
                )}

                {/* Bag items */}
                <div style={{ color: '#c4a87a', fontFamily: 'Georgia,serif', fontSize: 11, padding: '5px 10px 3px', borderBottom: '1px solid #2a1508', borderTop: '1px solid #4a2c0a' }}>
                  Bag ({(player.inventory || []).length} items)
                </div>
                {(player.inventory || []).length === 0 ? (
                  <div style={{ color: '#6b5030', fontSize: 11, padding: '6px 10px' }}>Bag is empty.</div>
                ) : (
                  (player.inventory || []).map(eq => {
                    const sellPrice = Math.floor((eq.price || 0) * 0.8)
                    return (
                      <div key={eq.id} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '5px 10px', borderBottom: '1px solid #2a1508',
                        color: '#d4b896', fontSize: 11,
                      }}>
                        <span style={{ fontSize: 14 }}>{eq.icon || '⚔️'}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{eq.name}</div>
                          <div style={{ fontSize: 9, color: '#a08060', textTransform: 'capitalize' }}>{eq.slot}</div>
                        </div>
                        {sellPrice > 0 ? (
                          <button
                            onClick={() => { sellItem(eq.id); setPurchaseMessage({ type: 'success', text: `Sold ${eq.name} for ${sellPrice}g!` }); setTimeout(() => setPurchaseMessage(null), 3000) }}
                            style={{
                              fontSize: 10, padding: '2px 6px', borderRadius: 3, cursor: 'pointer', whiteSpace: 'nowrap',
                              background: 'linear-gradient(to bottom,#7a3a0a,#4a2005)',
                              border: '1px solid #4a2c0a', color: '#ffd87a',
                            }}
                          >
                            Sell {sellPrice}g
                          </button>
                        ) : (
                          <span style={{ fontSize: 9, color: '#6b5030' }}>No value</span>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {/* RIGHT — item detail panel */}
          <div className="flex flex-col" style={{
            width: 200,
            background: 'linear-gradient(160deg,#6b3f1f,#3b1f08)',
            borderLeft: '2px solid #4a2c0a',
          }}>
            {selectedItem && activeTab === 'shop' ? (
              <>
                {/* Item name banner */}
                <div style={{
                  background: 'linear-gradient(to bottom,#8B5E3C,#5c3410)',
                  borderBottom: '2px solid #4a2c0a',
                  padding: '8px 10px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 32, lineHeight: 1 }}>{selectedItem.icon}</div>
                  <div style={{
                    color: '#ffd87a',
                    fontFamily: 'Georgia,serif',
                    fontWeight: 'bold',
                    fontSize: 13,
                    marginTop: 4,
                    textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                  }}>
                    {selectedItem.name}
                  </div>
                </div>

                {/* Details parchment */}
                <div className="flex-1 p-3" style={{ ...parchment, margin: 8, borderRadius: 6, overflow: 'auto' }}>
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: '#5c3410', fontWeight: 'bold' }}>Price: </span>
                    <span style={{ fontSize: 13, color: '#8B5E0A', fontWeight: 'bold' }}>{selectedItem.price.toLocaleString()} Gold</span>
                  </div>
                  {selectedItem.slot && (
                    <div style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: '#5c3410', fontWeight: 'bold' }}>Slot: </span>
                      <span style={{ fontSize: 12, color: '#3b1f08', textTransform: 'capitalize' }}>{selectedItem.slot}</span>
                    </div>
                  )}
                  <div style={{ borderTop: '1px solid #8B6914', paddingTop: 6, marginTop: 4 }}>
                    <div style={{ fontSize: 11, color: '#5c3410', fontWeight: 'bold', marginBottom: 4 }}>Description</div>
                    <div style={{ fontSize: 11, color: '#3b2010', lineHeight: 1.5 }}>
                      {selectedItem.description}
                    </div>
                  </div>
                  {selectedItem.elementBonuses && (
                    <div style={{ borderTop: '1px solid #8B6914', paddingTop: 6, marginTop: 6 }}>
                      <div style={{ fontSize: 11, color: '#5c3410', fontWeight: 'bold', marginBottom: 4 }}>Elements</div>
                      {Object.entries(selectedItem.elementBonuses).map(([el, val]) => (
                        <div key={el} style={{ fontSize: 11, color: '#3b2010', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ textTransform: 'capitalize' }}>{el}</span>
                          <span style={{ fontWeight: 'bold', color: '#8B5E0A' }}>+{val}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Buy button */}
                <div className="p-3">
                  <AqButton
                    onClick={() => handlePurchase(selectedItem)}
                    disabled={player.gold < selectedItem.price || isOwned(selectedItem)}
                    className="w-full"
                  >
                    {isOwned(selectedItem)
                      ? '✓ Already Owned'
                      : player.gold >= selectedItem.price
                        ? '💰 Buy Item'
                        : '❌ Not Enough Gold'}
                  </AqButton>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center flex-1" style={{ color: '#6b5030', fontSize: 12, padding: 16, textAlign: 'center' }}>
                {activeTab === 'shop' ? 'Select an item to see details' : 'Viewing your inventory'}
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar — action buttons */}
        <div className="flex items-center justify-between px-4 py-3" style={{
          background: 'linear-gradient(to bottom,#3b1f08,#2a1508)',
          borderTop: '2px solid #4a2c0a',
          borderRadius: '0 0 4px 4px',
        }}>
          <div style={{ color: '#c4a87a', fontSize: 12, fontFamily: 'Georgia,serif' }}>
            HP <span style={{ color: '#f87171', fontWeight: 'bold' }}>{player.hp}</span>
            <span style={{ color: '#6b5030' }}> / {player.maxHp}</span>
            {'  '}MP <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{player.mp}</span>
            <span style={{ color: '#6b5030' }}> / {player.maxMp}</span>
          </div>
          <div className="flex gap-2">
            <AqButton onClick={() => setActiveTab('shop')}>🛒 Buy Items</AqButton>
            <AqButton onClick={() => setActiveTab('inventory')}>🎒 Inventory</AqButton>
            <AqButton onClick={() => navigate('/town')}>🚪 Exit</AqButton>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShopScreen

