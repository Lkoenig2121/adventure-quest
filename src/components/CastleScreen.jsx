import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { useRef } from 'react'
import { useArrowScroll } from '../utils/useArrowScroll'

export const FLOOR_ENEMIES = {
  1:  { name: 'Iron Guardian',       icon:'🛡️',  hp: 600,  maxHp: 600,  mp: 150, maxMp: 150, level: 12, xpReward: 200,  goldReward: 80,  element: 'Light',    elementIcon: '✨', speed: 35, elementResistances: { fire: 100, water: 100, wind: 100, ice: 100, earth: 100, energy: 150, light: 50,  darkness: 200, physical: 80  } },
  2:  { name: 'Lich King',           icon:'💀',  hp: 850,  maxHp: 850,  mp: 450, maxMp: 450, level: 18, xpReward: 330,  goldReward: 120, element: 'Darkness', elementIcon: '🌑', speed: 40, elementResistances: { fire: 150, water: 100, wind: 100, ice: 50,  earth: 100, energy: 100, light: 200, darkness: 0,   physical: 100 } },
  3:  { name: 'Storm Harpy',         icon:'🦅',  hp: 1050, maxHp: 1050, mp: 320, maxMp: 320, level: 24, xpReward: 450,  goldReward: 160, element: 'Wind',     elementIcon: '🌪️', speed: 75, elementResistances: { fire: 100, water: 100, wind: 0,   ice: 150, earth: 200, energy: 130, light: 100, darkness: 100, physical: 90  } },
  4:  { name: 'Frost Giant',         icon:'🧊',  hp: 1350, maxHp: 1350, mp: 220, maxMp: 220, level: 30, xpReward: 600,  goldReward: 210, element: 'Ice',      elementIcon: '❄️', speed: 30, elementResistances: { fire: 200, water: 80,  wind: 130, ice: 0,   earth: 100, energy: 130, light: 100, darkness: 100, physical: 80  } },
  5:  { name: 'Magma Titan',         icon:'🌋',  hp: 1650, maxHp: 1650, mp: 380, maxMp: 380, level: 36, xpReward: 780,  goldReward: 270, element: 'Fire',     elementIcon: '🔥', speed: 45, elementResistances: { fire: 0,   water: 200, wind: 100, ice: 180, earth: 50,  energy: 120, light: 100, darkness: 100, physical: 90  } },
  6:  { name: 'Abyssal Serpent',     icon:'🐍',  hp: 2000, maxHp: 2000, mp: 550, maxMp: 550, level: 40, xpReward: 950,  goldReward: 340, element: 'Water',    elementIcon: '💧', speed: 60, elementResistances: { fire: 150, water: 0,   wind: 100, ice: 130, earth: 100, energy: 100, light: 100, darkness: 150, physical: 100 } },
  7:  { name: 'Thunder Phoenix',     icon:'🦜',  hp: 2400, maxHp: 2400, mp: 650, maxMp: 650, level: 45, xpReward: 1150, goldReward: 420, element: 'Energy',   elementIcon: '⚡', speed: 80, elementResistances: { fire: 130, water: 150, wind: 50,  ice: 130, earth: 200, energy: 0,   light: 130, darkness: 130, physical: 80  } },
  8:  { name: 'Shadow Wraith King',  icon:'👻',  hp: 2900, maxHp: 2900, mp: 750, maxMp: 750, level: 50, xpReward: 1380, goldReward: 500, element: 'Darkness', elementIcon: '🌑', speed: 70, elementResistances: { fire: 100, water: 100, wind: 130, ice: 100, earth: 100, energy: 130, light: 200, darkness: 0,   physical: 80  } },
  9:  { name: 'Ancient Earth Golem', icon:'🗿',  hp: 3600, maxHp: 3600, mp: 430, maxMp: 430, level: 56, xpReward: 1700, goldReward: 620, element: 'Earth',    elementIcon: '🌍', speed: 25, elementResistances: { fire: 100, water: 150, wind: 180, ice: 100, earth: 0,   energy: 150, light: 100, darkness: 100, physical: 50  } },
  10: { name: 'Void Dragon',         icon:'🐉',  hp: 4500, maxHp: 4500, mp: 950, maxMp: 950, level: 62, xpReward: 2200, goldReward: 800, element: 'Darkness', elementIcon: '🌑', speed: 65, elementResistances: { fire: 130, water: 130, wind: 130, ice: 130, earth: 130, energy: 130, light: 200, darkness: 0,   physical: 80  } },
  11: {
    name: 'Carnax',
    title: 'The Ancient Destroyer',
    hp: 77777, maxHp: 77777, mp: 1200, maxMp: 1200,
    level: 60,
    xpReward: 50000, goldReward: 10000,
    image: 'carnax',
    element: 'Earth', elementIcon: '🌍',
    icon: '👾',
    speed: 40,
    attackMin: 700, attackMax: 1000,
    elementResistances: {
      fire: 150, water: 50, wind: 130, ice: 130,
      earth: 0, energy: 150, light: 130, darkness: 130, physical: 80,
    },
  },
}

// Scale castle floor enemies with player level (floors 1–10 only; Carnax stays fixed)
export function scaleCastleEnemy(enemy, playerLevel, floor) {
  if (floor === 11 || enemy?.name === 'Carnax') {
    return { ...enemy, hp: enemy.hp, maxHp: enemy.maxHp, mp: enemy.mp, maxMp: enemy.maxMp }
  }

  const lv = playerLevel || 1
  const lvGain = lv - 1
  const baseLv = enemy.level || 12
  const hpBonus = Math.floor(enemy.maxHp / baseLv * 1.2)
  const mpBonus = Math.floor(enemy.maxMp / baseLv * 0.8)
  const xpBonus = Math.floor(enemy.xpReward / baseLv * 0.5)
  const goldBonus = Math.floor(enemy.goldReward / baseLv * 0.4)

  const hp = Math.floor(enemy.maxHp + lvGain * hpBonus)
  const mp = Math.floor(enemy.maxMp + lvGain * mpBonus)

  return {
    ...enemy,
    hp,
    maxHp: hp,
    mp,
    maxMp: mp,
    level: baseLv + lvGain,
    xpReward: Math.floor(enemy.xpReward + lvGain * xpBonus),
    goldReward: Math.floor(enemy.goldReward + lvGain * goldBonus),
  }
}

const CastleScreen = () => {
  const navigate = useNavigate()
  const { player, startBattle } = useGame()

  const castleProgress = player.castleProgress || 0
  const nextFloor = Math.min(castleProgress + 1, 11)
  const carnaxUnlocked = castleProgress >= 10
  const scrollRef = useRef(null)
  useArrowScroll(scrollRef)

  const handleBattle = (floor) => {
    startBattle(scaleCastleEnemy(FLOOR_ENEMIES[floor], player.level, floor), 'castle', floor)
    navigate('/battle')
  }

  const regularFloors = Object.entries(FLOOR_ENEMIES).filter(([f]) => parseInt(f) !== 11)

  return (
    <div className="w-full h-screen bg-gradient-to-b from-blue-700 via-indigo-700 to-blue-900 relative overflow-hidden flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-600 to-indigo-800"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.08) 10px, rgba(255,255,255,0.08) 20px)',
        }}></div>
        <div className="absolute top-20 left-20 text-6xl opacity-20">🏰</div>
        <div className="absolute top-40 right-32 text-5xl opacity-20">⚔️</div>
        <div className="absolute bottom-32 left-32 text-4xl opacity-20">🛡️</div>
        <div className="absolute bottom-20 right-20 text-5xl opacity-20">👑</div>
      </div>

      <div className="relative z-10 w-full max-w-5xl bg-gradient-to-br from-sky-100 to-blue-50 border-8 border-blue-800 rounded-lg shadow-2xl p-8 flex flex-col max-h-screen overflow-hidden">
        {/* Header */}
        <div className="text-center mb-6 flex-shrink-0">
          <h1 className="text-5xl font-bold text-blue-900 mb-2 drop-shadow-lg" style={{
            textShadow: '3px 3px 0px #1e3a8a',
            fontFamily: 'Georgia, serif'
          }}>
            🏰 The Castle
          </h1>
          <p className="text-blue-700 text-sm mb-3">Climb the floors and defeat the guardians within!</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="bg-gradient-to-r from-yellow-200 to-yellow-300 border-4 border-yellow-600 rounded-lg px-4 py-2 inline-block">
              <span className="text-blue-900 font-bold text-lg">
                🗝️ Progress: <span className="text-yellow-700">{castleProgress}/10</span>
              </span>
            </div>
            <div className="w-48 bg-blue-200 border-4 border-blue-600 rounded-lg h-6 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-500"
                style={{ width: `${(castleProgress / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Floor Grid */}
        <div ref={scrollRef} className="overflow-y-auto flex-1 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
            {regularFloors.map(([f, enemy]) => {
              const fn = parseInt(f)
              const beaten = fn <= castleProgress
              const current = fn === nextFloor
              const locked = fn > nextFloor
              const scaled = scaleCastleEnemy(enemy, player.level, fn)
              return (
                <div
                  key={f}
                  className={`bg-gradient-to-br from-white to-blue-50 border-4 rounded-lg p-5 shadow-xl transition transform hover:scale-102 ${
                    current ? 'border-amber-500' : beaten ? 'border-green-500' : locked ? 'border-gray-300' : 'border-blue-700'
                  } ${locked ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-6xl flex-shrink-0">{locked ? '🔒' : scaled.elementIcon || enemy.elementIcon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-xl font-bold text-blue-900">Floor {f}: {enemy.name}</h3>
                        {beaten && (
                          <span className="text-xs bg-green-600 text-white px-1 rounded font-bold">CLEARED</span>
                        )}
                        {current && (
                          <span className="text-xs bg-amber-600 text-white px-1 rounded font-bold">NEXT</span>
                        )}
                      </div>
                      <div className="flex gap-1.5 flex-wrap mb-3">
                        <span className="text-xs font-bold bg-yellow-200 text-yellow-900 px-2 py-0.5 rounded-full border-2 border-yellow-500">
                          Lv {scaled.level}
                        </span>
                        <span className="text-xs font-bold bg-red-200 text-red-900 px-2 py-0.5 rounded-full border-2 border-red-500">
                          ❤️ {scaled.hp.toLocaleString()}
                        </span>
                        <span className="text-xs font-bold bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full border-2 border-purple-500">
                          {scaled.elementIcon} {scaled.element}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-bold text-green-700">
                          +{scaled.xpReward.toLocaleString()} XP · <span className="text-yellow-700">+{scaled.goldReward.toLocaleString()} 🪙</span>
                        </div>
                        <button
                          onClick={() => handleBattle(fn)}
                          disabled={locked}
                          className={`font-bold rounded-lg border-4 transition transform hover:scale-105 whitespace-nowrap ${
                            locked
                              ? 'px-4 py-2 text-sm bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed'
                              : beaten
                                ? 'px-6 py-3 text-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-red-900 shadow-lg'
                                : 'px-4 py-2 text-sm bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-green-800 shadow-lg'
                          }`}
                        >
                          {locked ? 'Locked' : beaten ? 'Fight!' : 'Enter'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Carnax banner */}
          <div className={`mt-4 rounded-lg border-4 p-5 shadow-xl ${
            carnaxUnlocked ? 'bg-gradient-to-br from-red-800 to-black border-red-500' : 'bg-gradient-to-br from-gray-300 to-gray-400 border-gray-500 opacity-70'
          }`}>
            <div className="flex items-center gap-4">
              <span className={`text-6xl flex-shrink-0 ${carnaxUnlocked ? 'animate-pulse' : ''}`}>
                {carnaxUnlocked ? '👾' : '🔒'}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className={`text-2xl font-bold ${carnaxUnlocked ? 'text-red-200' : 'text-gray-600'}`} style={{ fontFamily: 'Georgia, serif' }}>
                  {carnaxUnlocked ? '💀 Carnax — The Ancient Destroyer' : '🔒 Carnax — Locked'}
                </h3>
                <p className={`text-sm mt-1 ${carnaxUnlocked ? 'text-red-300' : 'text-gray-600'}`}>
                  {carnaxUnlocked
                    ? `Lv 60 · ${FLOOR_ENEMIES[11].hp.toLocaleString()} HP · +${FLOOR_ENEMIES[11].xpReward.toLocaleString()} XP · +${FLOOR_ENEMIES[11].goldReward.toLocaleString()} Gold`
                    : `Clear all 10 floors to unlock (${castleProgress}/10 cleared)`}
                </p>
              </div>
              <button
                onClick={() => carnaxUnlocked && handleBattle(11)}
                disabled={!carnaxUnlocked}
                className={`px-5 py-3 font-bold rounded-lg border-4 transition transform hover:scale-105 text-base whitespace-nowrap ${
                  carnaxUnlocked
                    ? 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white border-red-400 shadow-lg'
                    : 'bg-gray-400 border-gray-500 text-gray-600 cursor-not-allowed'
                }`}
              >
                {carnaxUnlocked ? 'Face Carnax!' : 'Locked'}
              </button>
            </div>
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

export default CastleScreen

