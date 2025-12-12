import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { useState } from 'react'

const TownScreen = ({ onLogout }) => {
  const navigate = useNavigate()
  const { player, startBattle, resetPlayerStats, fullHeal } = useGame()
  const [showNews, setShowNews] = useState(true)
  const [showTwillyMessage, setShowTwillyMessage] = useState(false)
  const [isHealing, setIsHealing] = useState(false)

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
      <div className="relative z-10 w-full h-full">
        {/* Top UI */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          {/* News Panel */}
          <div className="bg-gradient-to-br from-amber-100 to-amber-50 border-4 border-amber-800 rounded-lg shadow-2xl w-96 max-h-96 overflow-hidden">
            <div className="bg-amber-900 text-yellow-200 font-bold text-lg px-4 py-2 border-b-2 border-amber-700">
              BattleOn News!
            </div>
            <div className="p-4 overflow-y-auto max-h-80 text-sm text-amber-900 space-y-3">
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
            <div className="border-t-2 border-amber-700 p-2 space-y-1">
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

          {/* Castle (clickable for battle) */}
          <button
            onClick={handleBattleClick}
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
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-yellow-300 text-2xl animate-bounce">⚔️</div>
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
        <div className="absolute bottom-4 left-4 bg-gradient-to-br from-amber-800 to-amber-900 border-4 border-amber-700 rounded-lg shadow-2xl p-4">
          <div className="flex items-start gap-4">
            {/* Character Portrait */}
            <div className="w-20 h-20 bg-gradient-to-br from-amber-200 to-amber-300 rounded-full border-4 border-amber-600 flex items-center justify-center overflow-hidden">
              <div className="text-4xl">🧙</div>
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
          Click the castle to battle monsters!
        </div>
      </div>
    </div>
  )
}

export default TownScreen

