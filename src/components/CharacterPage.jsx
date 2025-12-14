import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { useState } from 'react'

const CharacterPage = () => {
  const navigate = useNavigate()
  const { player, equipItem, unequipItem, getElementModifiers } = useGame()
  const [selectedSlot, setSelectedSlot] = useState(null)

  const equipped = player.equipped || { weapon: null, helmet: null, armor: null, boots: null }
  const inventory = player.inventory || []
  const elementModifiers = getElementModifiers()

  const slotNames = {
    weapon: '⚔️ Weapon',
    helmet: '🪖 Helmet',
    armor: '🛡️ Armor',
    boots: '👢 Boots',
  }

  const handleEquip = (itemId, slot) => {
    equipItem(itemId, slot)
    setSelectedSlot(null)
  }

  const handleUnequip = (slot) => {
    unequipItem(slot)
    setSelectedSlot(null)
  }

  const getItemsForSlot = (slot) => {
    return inventory.filter(item => item.slot === slot)
  }

  const formatElementBonuses = (item) => {
    if (!item.elementBonuses) return 'No bonuses'
    const bonuses = Object.entries(item.elementBonuses)
      .filter(([_, value]) => value > 0)
      .map(([element, value]) => `${element.charAt(0).toUpperCase() + element.slice(1)}: +${value}%`)
    return bonuses.join(', ') || 'No bonuses'
  }

  return (
    <div className="w-full h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-900 relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 to-purple-800"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
        }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl bg-gradient-to-br from-amber-100 to-amber-50 border-8 border-amber-800 rounded-lg shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-amber-900 mb-2 drop-shadow-lg" style={{
            textShadow: '3px 3px 0px #8b6914',
            fontFamily: 'Georgia, serif'
          }}>
            👤 Character Page
          </h1>
          <div className="text-2xl font-bold text-amber-800">{player.name}</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Equipment Slots */}
          <div>
            <h2 className="text-3xl font-bold text-amber-900 mb-4">Equipment</h2>
            
            {Object.entries(slotNames).map(([slot, label]) => (
              <div key={slot} className="mb-4 bg-gradient-to-br from-white to-amber-50 border-4 border-amber-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-amber-900">{label}</h3>
                  {equipped[slot] && (
                    <button
                      onClick={() => handleUnequip(slot)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded border-2 border-red-800"
                    >
                      Unequip
                    </button>
                  )}
                </div>
                
                {equipped[slot] ? (
                  <div className="bg-blue-100 border-2 border-blue-400 rounded p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{equipped[slot].icon}</span>
                      <div className="flex-1">
                        <div className="font-bold text-blue-900">{equipped[slot].name}</div>
                        <div className="text-sm text-blue-700">{formatElementBonuses(equipped[slot])}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-200 border-2 border-gray-400 rounded p-3 text-center text-gray-600">
                    Empty
                  </div>
                )}

                {selectedSlot === slot && (
                  <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                    {getItemsForSlot(slot).length > 0 ? (
                      getItemsForSlot(slot).map(item => (
                        <button
                          key={item.id}
                          onClick={() => handleEquip(item.id, slot)}
                          className="w-full bg-green-100 hover:bg-green-200 border-2 border-green-600 rounded p-2 text-left flex items-center gap-2"
                        >
                          <span className="text-2xl">{item.icon}</span>
                          <div className="flex-1">
                            <div className="font-bold text-green-900">{item.name}</div>
                            <div className="text-xs text-green-700">{formatElementBonuses(item)}</div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 text-sm">No items available</div>
                    )}
                  </div>
                )}

                {!equipped[slot] && (
                  <button
                    onClick={() => setSelectedSlot(selectedSlot === slot ? null : slot)}
                    className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded border-2 border-blue-800"
                  >
                    {selectedSlot === slot ? 'Hide Items' : 'Show Items'}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Right Column - Element Modifiers & Inventory */}
          <div>
            {/* Element Modifiers */}
            <div className="mb-6 bg-gradient-to-br from-purple-100 to-purple-50 border-4 border-purple-600 rounded-lg p-4">
              <h2 className="text-3xl font-bold text-purple-900 mb-4">Element Modifiers</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">Fire:</span>
                  <span className="font-bold text-red-600">{Math.round(elementModifiers.fire)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Water:</span>
                  <span className="font-bold text-blue-600">{Math.round(elementModifiers.water)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Wind:</span>
                  <span className="font-bold text-green-600">{Math.round(elementModifiers.wind)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Ice:</span>
                  <span className="font-bold text-cyan-600">{Math.round(elementModifiers.ice)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Earth:</span>
                  <span className="font-bold text-amber-600">{Math.round(elementModifiers.earth)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Energy:</span>
                  <span className="font-bold text-yellow-600">{Math.round(elementModifiers.energy)}%</span>
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 border-4 border-blue-600 rounded-lg p-4">
              <h2 className="text-3xl font-bold text-blue-900 mb-4">Inventory</h2>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {inventory.length > 0 ? (
                  inventory.map(item => (
                    <div
                      key={item.id}
                      className="bg-white border-2 border-blue-400 rounded p-2 flex items-center gap-2"
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex-1">
                        <div className="font-bold text-blue-900">{item.name}</div>
                        <div className="text-xs text-blue-700">{formatElementBonuses(item)}</div>
                        <div className="text-xs text-gray-600">Slot: {item.slot}</div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedSlot(selectedSlot === item.slot ? null : item.slot)
                        }}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded border border-green-800"
                      >
                        Equip
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">No items in inventory</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Return Button */}
        <button
          onClick={() => navigate('/town')}
          className="w-full mt-6 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-4 px-8 rounded-lg border-4 border-gray-500 shadow-lg transform transition hover:scale-105 text-xl"
        >
          Return to Town
        </button>
      </div>
    </div>
  )
}

export default CharacterPage

