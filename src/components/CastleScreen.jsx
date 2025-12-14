import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { useState } from 'react'

const CastleScreen = () => {
  const navigate = useNavigate()
  const { player, startBattle, resetPlayerStats } = useGame()
  const [selectedFloor, setSelectedFloor] = useState(1)

  // Define enemies for each floor (10 levels)
  const floorEnemies = {
    1: { name: 'Castle Guard', hp: 100, maxHp: 100, mp: 50, maxMp: 50, level: 1, xpReward: 50, goldReward: 25, image: 'guard' },
    2: { name: 'Skeleton Warrior', hp: 150, maxHp: 150, mp: 60, maxMp: 60, level: 2, xpReward: 75, goldReward: 35, image: 'skeleton' },
    3: { name: 'Dark Mage', hp: 120, maxHp: 120, mp: 150, maxMp: 150, level: 3, xpReward: 100, goldReward: 45, image: 'mage' },
    4: { name: 'Orc Berserker', hp: 250, maxHp: 250, mp: 40, maxMp: 40, level: 4, xpReward: 125, goldReward: 55, image: 'orc' },
    5: { name: 'Shadow Assassin', hp: 180, maxHp: 180, mp: 100, maxMp: 100, level: 5, xpReward: 150, goldReward: 65, image: 'assassin' },
    6: { name: 'Fire Elemental', hp: 200, maxHp: 200, mp: 200, maxMp: 200, level: 6, xpReward: 175, goldReward: 75, image: 'elemental' },
    7: { name: 'Ice Golem', hp: 350, maxHp: 350, mp: 80, maxMp: 80, level: 7, xpReward: 200, goldReward: 85, image: 'golem' },
    8: { name: 'Dragon Knight', hp: 400, maxHp: 400, mp: 150, maxMp: 150, level: 8, xpReward: 225, goldReward: 95, image: 'dragonknight' },
    9: { name: 'Demon Lord', hp: 500, maxHp: 500, mp: 250, maxMp: 250, level: 9, xpReward: 250, goldReward: 110, image: 'demon' },
    10: { name: 'Castle Master', hp: 750, maxHp: 750, mp: 300, maxMp: 300, level: 10, xpReward: 300, goldReward: 150, image: 'master' }
  }

  const handleBattle = (floor) => {
    resetPlayerStats()
    const enemy = floorEnemies[floor]
    startBattle(enemy, 'castle')
    navigate('/battle')
  }


  return (
    <div className="w-full h-screen bg-gradient-to-b from-gray-800 via-gray-700 to-gray-900 relative overflow-hidden">
      {/* Castle Interior Background */}
      <div className="absolute inset-0">
        {/* Stone walls with pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800"></div>
        {/* Stone brick pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
          backgroundSize: '40px 40px'
        }}></div>
        
        {/* Torches on walls */}
        <div className="absolute top-20 left-20 w-4 h-16 bg-gradient-to-b from-yellow-400 to-orange-600 rounded-full">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
        </div>
        <div className="absolute top-20 right-20 w-4 h-16 bg-gradient-to-b from-yellow-400 to-orange-600 rounded-full">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
        </div>
        <div className="absolute bottom-20 left-20 w-4 h-16 bg-gradient-to-b from-yellow-400 to-orange-600 rounded-full">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
        </div>
        <div className="absolute bottom-20 right-20 w-4 h-16 bg-gradient-to-b from-yellow-400 to-orange-600 rounded-full">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
        </div>
        
        {/* Windows */}
        <div className="absolute top-40 left-1/4 w-16 h-20 bg-blue-300 border-4 border-gray-600"></div>
        <div className="absolute top-40 right-1/4 w-16 h-20 bg-blue-300 border-4 border-gray-600"></div>
        
        {/* Room indicator */}
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-amber-800 to-amber-900 border-4 border-amber-700 rounded-lg px-6 py-2 shadow-xl">
          <div className="text-yellow-200 font-bold text-xl">Throne Room</div>
        </div>
      </div>

      {/* Castle Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <div className="bg-gradient-to-br from-amber-100 to-amber-50 border-4 border-amber-800 rounded-lg shadow-2xl p-8 max-w-4xl w-full mx-4">
          <h2 className="text-4xl font-bold text-amber-900 mb-4 text-center" style={{
            fontFamily: 'Georgia, serif'
          }}>
            Throne Room
          </h2>
          
          <p className="text-amber-900 text-lg mb-6 text-center">
            You stand in the grand throne room at the top of the castle. Ten powerful guardians await challengers. Choose your opponent and prove your worth!
          </p>

          {/* Enemy Selection Grid */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-amber-900 mb-4 text-center">Choose Your Challenge:</h3>
            <div className="grid grid-cols-5 gap-3 max-h-96 overflow-y-auto">
              {Object.entries(floorEnemies).map(([floor, enemy]) => (
                <button
                  key={floor}
                  onClick={() => {
                    setSelectedFloor(parseInt(floor))
                  }}
                  className={`p-4 rounded-lg border-4 transition transform hover:scale-105 ${
                    selectedFloor === parseInt(floor)
                      ? 'bg-red-200 border-red-600 shadow-lg'
                      : 'bg-gray-100 border-gray-400 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-4xl mb-2">👹</div>
                  <div className="font-bold text-sm mb-1">{enemy.name}</div>
                  <div className="text-xs text-gray-600">Level {enemy.level}</div>
                  <div className="text-xs text-green-700 font-semibold">+{enemy.xpReward} XP</div>
                </button>
              ))}
            </div>

            {selectedFloor && (
              <div className="mt-6">
                <div className="bg-gradient-to-br from-red-100 to-red-50 border-4 border-red-600 rounded-lg p-6 mb-4">
                  <div className="text-center mb-4">
                    <div className="text-6xl mb-2">👹</div>
                    <div className="text-2xl font-bold text-red-900">{floorEnemies[selectedFloor].name}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm text-red-800">
                    <div className="text-center">
                      <div className="font-semibold">Level</div>
                      <div className="font-bold text-lg">{floorEnemies[selectedFloor].level}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">HP</div>
                      <div className="font-bold text-lg">{floorEnemies[selectedFloor].hp}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">XP Reward</div>
                      <div className="font-bold text-lg text-green-700">{floorEnemies[selectedFloor].xpReward}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">Gold Reward</div>
                      <div className="font-bold text-lg text-yellow-700">{floorEnemies[selectedFloor].goldReward}</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleBattle(selectedFloor)}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-8 rounded-lg border-4 border-red-800 shadow-lg transform transition hover:scale-105 text-xl mb-4"
                >
                  Battle {floorEnemies[selectedFloor].name}!
                </button>
              </div>
            )}

            {/* Return to Town */}
            <button
              onClick={() => navigate('/town')}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-6 rounded-lg border-2 border-gray-500 shadow-lg transform transition hover:scale-105"
            >
              Return to Town
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CastleScreen

