import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

const TownScreen = ({ onLogout }) => {
  const navigate = useNavigate()
  const { player, startBattle, resetPlayerStats, fullHeal } = useGame()
  const [showNews, setShowNews] = useState(true)
  const [showTwillyMessage, setShowTwillyMessage] = useState(false)
  const [isHealing, setIsHealing] = useState(false)
  const [showStatsTooltip, setShowStatsTooltip] = useState(false)
  const portraitRef = useRef(null)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })

  const handleTwillyClick = () => {
    fullHeal()
    setIsHealing(true)
    setShowTwillyMessage(true)
    setTimeout(() => {
      setShowTwillyMessage(false)
      setIsHealing(false)
    }, 3000)
  }

  const handleBattleClick = () => {
    // Reset player stats before battle
    resetPlayerStats()
    
    // Generate a random enemy
    const enemies = [
      {
        name: 'Berserker (+20)',
        hp: 786,
        maxHp: 786,
        mp: 128,
        maxMp: 128,
        level: player.level + 20,
        xpReward: 200,
        goldReward: 100,
        image: 'berserker'
      },
      {
        name: 'Goblin Warrior',
        hp: 150,
        maxHp: 150,
        mp: 50,
        maxMp: 50,
        level: player.level + 5,
        xpReward: 80,
        goldReward: 40,
        image: 'goblin'
      },
      {
        name: 'Dark Knight',
        hp: 400,
        maxHp: 400,
        mp: 200,
        maxMp: 200,
        level: player.level + 10,
        xpReward: 150,
        goldReward: 75,
        image: 'knight'
      }
    ]
    const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)]
    startBattle(randomEnemy)
    navigate('/battle')
  }

  const handleCastleClick = () => {
    navigate('/castle')
  }

  const hpPercentage = (player.hp / player.maxHp) * 100
  const mpPercentage = (player.mp / player.maxMp) * 100
  const spPercentage = (player.sp / player.maxSp) * 100

  return (
    <div className="w-full h-screen bg-gradient-to-b from-blue-400 via-blue-300 to-green-300 relative overflow-hidden">
      {/* Sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-400 to-blue-300">
        {/* Clouds */}
        <div className="absolute top-10 left-20 w-32 h-16 bg-white opacity-60 rounded-full blur-sm"></div>
        <div className="absolute top-20 right-32 w-40 h-20 bg-white opacity-60 rounded-full blur-sm"></div>
        <div className="absolute top-30 left-1/3 w-36 h-18 bg-white opacity-60 rounded-full blur-sm"></div>
        
        {/* Comet/Meteor */}
        <div className="absolute top-5 right-20 w-4 h-20 bg-gradient-to-b from-red-500 to-orange-400 rounded-full transform rotate-45 opacity-80"></div>
        <div className="absolute top-8 right-18 w-2 h-16 bg-yellow-300 rounded-full transform rotate-45 blur-sm"></div>
      </div>

      {/* Mountains */}
      <div className="absolute bottom-0 w-full h-64">
        <div className="absolute bottom-0 left-0 w-96 h-64 bg-gradient-to-t from-blue-600 to-blue-500 clip-path-mountain"></div>
        <div className="absolute bottom-0 right-0 w-80 h-56 bg-gradient-to-t from-blue-700 to-blue-600 clip-path-mountain"></div>
      </div>

      {/* Town Content */}
      <div className="relative z-10 w-full h-full" style={{ overflow: 'visible' }}>
        {/* Top UI */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          {/* News Panel */}
          <div className="bg-gradient-to-br from-amber-100 to-amber-50 border-4 border-amber-800 rounded-lg shadow-2xl w-96 flex flex-col max-h-96">
            <div className="bg-amber-900 text-yellow-200 font-bold text-lg px-4 py-2 border-b-2 border-amber-700 flex-shrink-0">
              BattleOn News!
            </div>
            <div className="p-4 overflow-y-auto flex-1 text-sm text-amber-900 space-y-3 min-h-0">
              <p>
                <strong>Explore the town buildings and talk to everyone you see.</strong> Click on the mountains to battle monsters, with new enemies every level!
              </p>
              <p>
                <strong>THIS WEEK:</strong> The annual Grenwog Festival returns! This year the festival is running a little long, as the Grenwogs refuse to return home! As you set out to find what's wrong, Galanoth appears to be onto the cause! Plant Dragons... starting forest fires?
              </p>
              <p>
                <strong>LIMITED-TIME SHOP:</strong> Chibi Loco Pets are now available! During the month of April, this little guy can channel more of Loco's power, dealing a lot more damage!
              </p>
            </div>
            <div className="border-t-2 border-amber-700 p-2 space-y-1 flex-shrink-0">
              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded border-2 border-red-800 text-sm">
                TODAY'S EVENT
              </button>
              <button className="w-full bg-amber-800 hover:bg-amber-900 text-yellow-200 font-bold py-2 px-4 rounded border-2 border-amber-700 text-sm">
                Travel Map
              </button>
            </div>
          </div>

          {/* Shop Buttons */}
          <div className="flex flex-col gap-3">
            <button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-lg border-4 border-yellow-400 shadow-lg transform transition hover:scale-105">
              Elite Items!
            </button>
            <button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-lg border-4 border-yellow-400 shadow-lg transform transition hover:scale-105 flex items-center gap-2">
              <span>⏰</span>
              Limited-Time Shop!
            </button>
          </div>
        </div>

        {/* Town Scene */}
        <div className="absolute bottom-32 left-0 right-0 flex justify-center items-end gap-4">
          {/* Houses */}
          <div className="relative">
            <div className="w-24 h-32 bg-amber-800 border-4 border-amber-900 relative">
              <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-700 to-gray-600"></div>
              <div className="absolute top-2 left-2 w-4 h-4 bg-amber-200 rounded"></div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-8 bg-amber-950 rounded-t"></div>
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-600 border border-black"></div>
            </div>
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-yellow-300 text-2xl">!</div>
          </div>

          {/* Fountain */}
          <div className="relative">
            <div className="w-20 h-16 bg-blue-400 border-2 border-blue-600 rounded-t-full relative">
              <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full animate-ping"></div>
              <div className="absolute top-4 right-3 w-2 h-2 bg-white rounded-full animate-ping delay-300"></div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-blue-300 rounded-full"></div>
            </div>
          </div>

          {/* Twilly - The Orange Healer */}
          <button
            onClick={handleTwillyClick}
            className="relative transform transition hover:scale-110 cursor-pointer z-20"
          >
            {/* Healing glow effect */}
            {isHealing && (
              <div className="absolute inset-0 bg-green-400 rounded-full opacity-50 animate-ping"></div>
            )}
            
            {/* Twilly's Body (Orange creature) */}
            <div className="relative">
              {/* Body */}
              <div className={`w-16 h-20 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full border-2 border-orange-700 relative ${isHealing ? 'animate-pulse' : ''}`}>
                {/* Head */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-b from-orange-300 to-orange-500 rounded-full border-2 border-orange-600">
                  {/* Eyes */}
                  <div className="absolute top-3 left-3 w-2 h-2 bg-black rounded-full"></div>
                  <div className="absolute top-3 right-3 w-2 h-2 bg-black rounded-full"></div>
                  {/* Nose */}
                  <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-700 rounded-full"></div>
                  {/* Mouth */}
                  <div className="absolute top-7 left-1/2 transform -translate-x-1/2 w-4 h-2 border-b-2 border-orange-700 rounded-b-full"></div>
                </div>
                {/* Ears */}
                <div className="absolute -top-2 left-2 w-4 h-6 bg-orange-500 rounded-full transform rotate-12 border border-orange-600"></div>
                <div className="absolute -top-2 right-2 w-4 h-6 bg-orange-500 rounded-full transform -rotate-12 border border-orange-600"></div>
                {/* Arms */}
                <div className="absolute top-4 left-0 w-3 h-8 bg-orange-500 rounded-full transform -rotate-12"></div>
                <div className="absolute top-4 right-0 w-3 h-8 bg-orange-500 rounded-full transform rotate-12"></div>
                {/* Staff */}
                <div className="absolute top-2 right-0 w-1 h-16 bg-amber-800 transform rotate-12"></div>
                <div className="absolute top-12 right-2 w-4 h-4 bg-yellow-300 rounded-full border border-yellow-400"></div>
              </div>
              {/* Tail */}
              <div className="absolute bottom-2 right-0 w-8 h-3 bg-orange-500 rounded-full transform rotate-45"></div>
              {/* Exclamation mark */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-yellow-300 text-3xl animate-bounce">!</div>
            </div>

            {/* Twilly's Speech Bubble */}
            {showTwillyMessage && (
              <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 animate-fade-in z-30">
                <div className="bg-white border-4 border-yellow-400 rounded-lg shadow-2xl p-4 min-w-48 max-w-64 relative">
                  {/* Speech bubble tail */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                    <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-yellow-400"></div>
                  </div>
                  <p className="text-amber-900 font-bold text-sm text-center">
                    "There you go! All healed up and ready for adventure!"
                  </p>
                  <p className="text-orange-600 text-xs text-center mt-1">- Twilly</p>
                </div>
              </div>
            )}
          </button>

          {/* More Houses */}
          <div className="relative">
            <div className="w-24 h-32 bg-amber-800 border-4 border-amber-900 relative">
              <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-700 to-gray-600"></div>
              <div className="absolute top-2 right-2 w-4 h-4 bg-amber-200 rounded"></div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-8 bg-amber-950 rounded-t"></div>
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-600 border border-black"></div>
            </div>
          </div>

          {/* Castle (clickable to enter) */}
          <button
            onClick={handleCastleClick}
            className="relative transform transition hover:scale-110 cursor-pointer"
          >
            <div className="w-32 h-48 bg-gradient-to-b from-gray-500 to-gray-600 border-4 border-gray-700 relative">
              <div className="absolute top-0 left-4 w-8 h-12 bg-gray-400 border-2 border-gray-600"></div>
              <div className="absolute top-0 right-4 w-8 h-12 bg-gray-400 border-2 border-gray-600"></div>
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-16 h-20 bg-gray-500 border-2 border-gray-700">
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-8 bg-gray-800 rounded-t"></div>
              </div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-600 border border-black"></div>
              {/* Dragon statue on top */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-6 h-8 bg-gradient-to-b from-gray-400 to-gray-600 rounded-t-full">
                <div className="absolute top-1 left-1 w-1 h-1 bg-red-600 rounded-full"></div>
                <div className="absolute top-1 right-1 w-1 h-1 bg-red-600 rounded-full"></div>
              </div>
            </div>
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-yellow-300 text-2xl animate-bounce">🏰</div>
          </button>

          {/* Tents */}
          <div className="relative">
            <div className="w-16 h-12 bg-gradient-to-br from-red-700 to-red-800 border-2 border-red-900 transform -skew-x-12"></div>
            <div className="absolute top-0 left-4 w-12 h-10 bg-gradient-to-br from-red-700 to-red-800 border-2 border-red-900 transform skew-x-12"></div>
            <div className="absolute top-1 left-6 w-3 h-3 bg-white border border-black text-xs flex items-center justify-center">X</div>
          </div>
        </div>

        {/* Ground/Path */}
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-b from-green-400 to-green-500">
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-amber-700 to-amber-800 opacity-60"></div>
        </div>

        {/* Character Info Panel */}
        <div className="absolute bottom-4 left-4 bg-gradient-to-br from-amber-800 to-amber-900 border-4 border-amber-700 rounded-lg shadow-2xl p-4" style={{ zIndex: 10 }}>
          <div className="flex items-start gap-4">
            {/* Character Portrait */}
            <div 
              ref={portraitRef}
              className="relative w-20 h-20 bg-gradient-to-br from-amber-200 to-amber-300 rounded-full border-4 border-amber-600 flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
              style={{ zIndex: 1000 }}
              onMouseEnter={() => {
                if (portraitRef.current) {
                  const tooltipWidth = 500
                  const padding = 20
                  
                  // Position it at the very top center of the viewport
                  const finalLeft = Math.max(padding, (window.innerWidth - tooltipWidth) / 2)
                  const finalTop = 10 // Position at very top of viewport
                  
                  console.log('Tooltip position:', { 
                    top: finalTop, 
                    left: finalLeft,
                    windowWidth: window.innerWidth,
                    windowHeight: window.innerHeight,
                    scrollY: window.scrollY
                  })
                  
                  setTooltipPosition({
                    top: finalTop,
                    left: finalLeft
                  })
                  setShowStatsTooltip(true)
                } else {
                  console.log('Portrait ref is null!')
                }
              }}
              onMouseLeave={() => {
                console.log('Mouse left portrait')
                setShowStatsTooltip(false)
              }}
            >
              <div className="text-4xl">🧙</div>
              
              {/* Stats Tooltip - Rendered via Portal */}
              {showStatsTooltip && tooltipPosition.top > 0 && createPortal(
                <div 
                  className="fixed animate-fade-in" 
                  style={{ 
                    position: 'fixed',
                    width: '500px',
                    maxWidth: '500px',
                    zIndex: 99999,
                    pointerEvents: 'none',
                    top: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    maxHeight: 'calc(100vh - 20px)',
                    overflowY: 'auto'
                  }}
                >
                  <div 
                    className="bg-gradient-to-br from-amber-100 to-amber-50 border-4 border-amber-800 rounded-lg shadow-2xl p-6 min-w-96"
                    style={{ pointerEvents: 'auto' }}
                    onMouseEnter={() => setShowStatsTooltip(true)}
                    onMouseLeave={() => setShowStatsTooltip(false)}
                  >
                    {/* Tooltip arrow */}
                    <div className="absolute bottom-0 left-8 transform translate-y-full">
                      <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-amber-800"></div>
                    </div>
                    
                    <div className="text-amber-900">
                      {/* Character Profile */}
                      <div className="mb-4 pb-3 border-b-2 border-amber-700">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg">Race:</span>
                          <span className="text-blue-800 font-semibold">Human</span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg">Class:</span>
                          <span className="text-purple-800 font-semibold">Warrior</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">Clan:</span>
                          <span className="text-gray-700 font-semibold">None</span>
                        </div>
                      </div>

                      {/* Information Section */}
                      <div className="mb-4 pb-3 border-b-2 border-amber-700">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold">Level:</span>
                          <span className="text-blue-700 font-bold">{player.level}</span>
                        </div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold">Gold:</span>
                          <span className="text-yellow-700 font-bold">{player.gold.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Tokens:</span>
                          <span className="text-green-700 font-bold">0</span>
                        </div>
                      </div>

                      {/* Combat Defense */}
                      <div className="mb-4 pb-3 border-b-2 border-amber-700">
                        <h5 className="font-bold mb-2 text-amber-800">Combat Defense</h5>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span>Melee:</span>
                            <span className="font-bold text-red-700">{Math.floor(player.level * 2) + 30}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ranged:</span>
                            <span className="font-bold text-blue-700">{Math.floor(player.level * 1.8) + 25}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Magic:</span>
                            <span className="font-bold text-purple-700">{Math.floor(player.level * 1.8) + 25}</span>
                          </div>
                        </div>
                      </div>

                      {/* Attributes */}
                      <div className="mb-4 pb-3 border-b-2 border-amber-700">
                        <h5 className="font-bold mb-2 text-amber-800">Attributes</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span>Strength:</span>
                            <span className="font-bold text-red-700">{Math.floor(player.level * 10) + 50}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Dexterity:</span>
                            <span className="font-bold text-purple-700">{Math.floor(player.level * 7) + 35}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Intellect:</span>
                            <span className="font-bold text-blue-700">{Math.floor(player.level * 8) + 40}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Endurance:</span>
                            <span className="font-bold text-orange-700">{Math.floor(player.level * 9) + 45}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Charisma:</span>
                            <span className="font-bold text-pink-700">{Math.floor(player.level * 6) + 30}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Luck:</span>
                            <span className="font-bold text-yellow-700">{Math.floor(player.level * 5) + 25}</span>
                          </div>
                        </div>
                      </div>

                      {/* Element Modifier */}
                      <div className="mb-4 pb-3 border-b-2 border-amber-700">
                        <h5 className="font-bold mb-2 text-amber-800">Element Modifier</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span>Fire:</span>
                            <span className="font-bold text-red-600">{50 + Math.floor(player.level * 0.5)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Water:</span>
                            <span className="font-bold text-blue-600">{50 + Math.floor(player.level * 0.5)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Wind:</span>
                            <span className="font-bold text-green-600">{50 + Math.floor(player.level * 0.5)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ice:</span>
                            <span className="font-bold text-cyan-600">{50 + Math.floor(player.level * 0.5)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Earth:</span>
                            <span className="font-bold text-amber-600">{50 + Math.floor(player.level * 0.5)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Energy:</span>
                            <span className="font-bold text-yellow-600">{50 + Math.floor(player.level * 0.5)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Light:</span>
                            <span className="font-bold text-yellow-300">{50 + Math.floor(player.level * 0.5)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Darkness:</span>
                            <span className="font-bold text-gray-800">{50 + Math.floor(player.level * 0.5)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Equipment */}
                      <div className="mb-4 pb-3 border-b-2 border-amber-700">
                        <h5 className="font-bold mb-2 text-amber-800">Equipment</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span>🛡️</span>
                            <div className="flex-1">
                              <div className="text-xs text-gray-600">Helmet:</div>
                              <div className="font-semibold">None</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>⚔️</span>
                            <div className="flex-1">
                              <div className="text-xs text-gray-600">Weapon:</div>
                              <div className="font-semibold">Basic Sword</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>🛡️</span>
                            <div className="flex-1">
                              <div className="text-xs text-gray-600">Shield:</div>
                              <div className="font-semibold">None</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>💍</span>
                            <div className="flex-1">
                              <div className="text-xs text-gray-600">Ring:</div>
                              <div className="font-semibold">None</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Inventory/Consumables */}
                      <div>
                        <h5 className="font-bold mb-2 text-amber-800">Consumables</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-red-600">🧪</span>
                            <span>Red Potion:</span>
                            <span className="font-bold text-red-700">x 0</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-blue-600">🧪</span>
                            <span>Blue Potion:</span>
                            <span className="font-bold text-blue-700">x 0</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>,
                document.body
              )}
            </div>
            
            <div className="flex-1 min-w-48">
              <h3 className="text-yellow-200 font-bold text-lg mb-2">{player.name}</h3>
              
              {/* HP Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-yellow-200 mb-1">
                  <span>HP</span>
                  <span>{player.hp} / {player.maxHp}</span>
                </div>
                <div className="w-full bg-gray-800 h-4 rounded border-2 border-gray-600 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300"
                    style={{ width: `${hpPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* MP Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-yellow-200 mb-1">
                  <span>MP</span>
                  <span>{player.mp} / {player.maxMp}</span>
                </div>
                <div className="w-full bg-gray-800 h-4 rounded border-2 border-gray-600 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-300"
                    style={{ width: `${mpPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* SP Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-yellow-200 mb-1">
                  <span>SP</span>
                  <span>{player.sp} / {player.maxSp}</span>
                </div>
                <div className="w-full bg-gray-800 h-4 rounded border-2 border-gray-600 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-600 to-green-500 transition-all duration-300"
                    style={{ width: `${spPercentage}%` }}
                  ></div>
                </div>
              </div>

              <button className="mt-2 w-full bg-amber-900 hover:bg-amber-950 text-yellow-200 font-bold py-1 px-3 rounded border-2 border-amber-700 text-xs">
                Options
              </button>
            </div>
          </div>
        </div>

        {/* Game Title */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <h2 className="text-4xl font-bold text-yellow-400 drop-shadow-2xl" style={{
            textShadow: '3px 3px 0px #8b6914, 5px 5px 15px rgba(0,0,0,0.8)',
            fontFamily: 'Georgia, serif'
          }}>
            Adventure Quest
          </h2>
        </div>

        {/* Navigation Menu */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button 
            onClick={handleBattleClick}
            className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-2 px-6 rounded-lg border-4 border-yellow-400 shadow-lg transform transition hover:scale-105 text-sm"
          >
            Battle Monsters
          </button>
          <button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-2 px-6 rounded-lg border-2 border-red-800 shadow-lg transform transition hover:scale-105 text-sm">
            Character Page
          </button>
          <button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-2 px-6 rounded-lg border-2 border-red-800 shadow-lg transform transition hover:scale-105 text-sm">
            House
          </button>
          <button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-2 px-6 rounded-lg border-2 border-red-800 shadow-lg transform transition hover:scale-105 text-sm">
            Ballyhoo and Upgrades
          </button>
          <button 
            onClick={onLogout}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-2 px-6 rounded-lg border-2 border-red-800 shadow-lg transform transition hover:scale-105 text-sm"
          >
            Logout
          </button>
        </div>

        {/* Click hint */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm">
          Click the castle to enter, or use the Battle Monsters button!
        </div>
      </div>
    </div>
  )
}

export default TownScreen

