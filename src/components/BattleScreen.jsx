import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { useState, useEffect, useCallback } from 'react'

const BattleScreen = () => {
  const navigate = useNavigate()
  const { player, enemy, endBattle, damagePlayer, damageEnemy, useMana, healPlayer } = useGame()
  const [selectedAction, setSelectedAction] = useState('attack')
  const [selectedSpell, setSelectedSpell] = useState(null)
  const [battleLog, setBattleLog] = useState([])
  const [playerTurn, setPlayerTurn] = useState(true)
  const [animating, setAnimating] = useState(false)


  const addLog = useCallback((message) => {
    setBattleLog(prev => [...prev, message])
  }, [])

  const handleAttack = useCallback(() => {
    console.log('⚔️ Attack clicked!', { playerTurn, animating, hasEnemy: !!enemy })
    if (!playerTurn || animating || !enemy) {
      console.log('❌ Attack blocked:', { playerTurn, animating, hasEnemy: !!enemy })
      return
    }
    
    setAnimating(true)
    // Random damage between 25-75 (more variation)
    const baseDamage = 25
    const randomVariation = Math.floor(Math.random() * 50) + 1
    const damage = baseDamage + randomVariation
    
    console.log('💥 Applying damage:', damage, 'to enemy with HP:', enemy.hp)
    // Apply damage immediately
    damageEnemy(damage)
    addLog(`${player.name} attacks ${enemy.name} for ${damage} damage!`)
    
    setTimeout(() => {
      setAnimating(false)
      setPlayerTurn(false)
    }, 500)
  }, [playerTurn, animating, enemy, player, damageEnemy, addLog])


  useEffect(() => {
    if (!enemy) {
      navigate('/town')
      return
    }
  }, [enemy, navigate])

  useEffect(() => {
    if (enemy && enemy.hp <= 0) {
      setTimeout(() => {
        endBattle(true)
        navigate('/town')
      }, 1500)
    } else if (player.hp <= 0) {
      setTimeout(() => {
        endBattle(false)
        navigate('/town')
      }, 1500)
    }
  }, [enemy?.hp, player.hp, endBattle, navigate])


  useEffect(() => {
    // Enemy turn after player acts
    if (!playerTurn && enemy && enemy.hp > 0 && player.hp > 0) {
      const timer = setTimeout(() => {
        const damage = Math.floor(Math.random() * 30) + 20
        damagePlayer(damage)
        setBattleLog(prev => [...prev, `${enemy.name} attacks for ${damage} damage!`])
        setPlayerTurn(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [playerTurn, enemy, damagePlayer])

  const handleSpell = (spell) => {
    if (!playerTurn || animating || !enemy) return
    
    const spellCost = spell.cost || 20
    if (player.mp < spellCost) {
      addLog('Not enough MP!')
      return
    }

    setAnimating(true)
    useMana(spellCost)

    if (spell.type === 'attack') {
      const damage = spell.damage || 50
      damageEnemy(damage)
      addLog(`${player.name} casts ${spell.name} for ${damage} damage!`)
    } else if (spell.type === 'heal') {
      const heal = spell.heal || 50
      healPlayer(heal)
      addLog(`${player.name} casts ${spell.name} and heals for ${heal} HP!`)
    }

    setTimeout(() => {
      setAnimating(false)
      setPlayerTurn(false)
    }, 500)
  }

  const handleFlee = () => {
    endBattle(false)
    navigate('/town')
  }

  if (!enemy) return null

  const hpPercentage = (player.hp / player.maxHp) * 100
  const mpPercentage = (player.mp / player.maxMp) * 100
  const spPercentage = (player.sp / player.maxSp) * 100
  const enemyHpPercentage = enemy && enemy.maxHp > 0 ? (enemy.hp / enemy.maxHp) * 100 : 0
  const enemyMpPercentage = enemy && enemy.maxMp > 0 ? (enemy.mp / enemy.maxMp) * 100 : 0

  const spells = [
    { name: 'Fireball', type: 'attack', damage: 60, cost: 25, icon: '🔥' },
    { name: 'Ice Bolt', type: 'attack', damage: 55, cost: 20, icon: '❄️' },
    { name: 'Lightning', type: 'attack', damage: 70, cost: 30, icon: '⚡' },
    { name: 'Heal', type: 'heal', heal: 60, cost: 20, icon: '💚' },
  ]

  const spellIcons = ['⭐', '⬜', '🔴', '🟢', '🟡', '⚫']

  return (
    <div className="w-full h-screen bg-gradient-to-b from-blue-400 via-blue-300 to-green-300 relative overflow-hidden" style={{ pointerEvents: 'auto' }}>
      {/* Sky Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-400 to-blue-300">
        <div className="absolute top-10 left-20 w-32 h-16 bg-white opacity-60 rounded-full blur-sm"></div>
        <div className="absolute top-20 right-32 w-40 h-20 bg-white opacity-60 rounded-full blur-sm"></div>
      </div>

      {/* Ground */}
      <div className="absolute bottom-0 w-full h-40 bg-gradient-to-b from-green-400 to-green-500">
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-amber-700 to-amber-800 opacity-60"></div>
      </div>

      {/* Trees */}
      <div className="absolute bottom-40 right-10">
        <div className="w-16 h-32 bg-green-700 border-2 border-green-800 rounded-t-full"></div>
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-green-600 rounded-full border-2 border-green-700"></div>
      </div>

      {/* Battle Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center gap-20">
        {/* Player Character */}
        <div className={`flex flex-col items-center ${animating && selectedAction === 'attack' ? 'animate-bounce' : ''}`}>
          <div className="text-8xl mb-4">⚔️</div>
          <div className="bg-gradient-to-br from-red-800 to-red-900 border-4 border-red-700 rounded-lg px-4 py-2 shadow-2xl">
            <h3 className="text-yellow-200 font-bold text-xl mb-2">{player.name}</h3>
            
            {/* HP Bar */}
            <div className="mb-2">
              <div className="flex justify-between text-xs text-yellow-200 mb-1">
                <span>HP</span>
                <span>{player.hp} / {player.maxHp}</span>
              </div>
              <div className="w-64 bg-gray-800 h-5 rounded border-2 border-gray-600 overflow-hidden">
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
              <div className="w-64 bg-gray-800 h-5 rounded border-2 border-gray-600 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-300"
                  style={{ width: `${mpPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* SP Bar */}
            <div>
              <div className="flex justify-between text-xs text-yellow-200 mb-1">
                <span>SP</span>
                <span>{player.sp} / {player.maxSp}</span>
              </div>
              <div className="w-64 bg-gray-800 h-5 rounded border-2 border-gray-600 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-600 to-green-500 transition-all duration-300"
                  style={{ width: `${spPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Enemy Character */}
        <div className={`flex flex-col items-center ${animating && !playerTurn ? 'animate-bounce' : ''}`}>
          <div className="text-8xl mb-4">👹</div>
          <div className="bg-gradient-to-br from-purple-800 to-purple-900 border-4 border-purple-700 rounded-lg px-4 py-2 shadow-2xl">
            <h3 className="text-yellow-200 font-bold text-xl mb-2">{enemy.name}</h3>
            
            {/* HP Bar */}
            <div className="mb-2">
              <div className="flex justify-between text-xs text-yellow-200 mb-1">
                <span>HP</span>
                <span>{enemy.hp} / {enemy.maxHp}</span>
              </div>
              <div className="w-64 bg-gray-800 h-5 rounded border-2 border-gray-600 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300"
                  style={{ width: `${enemyHpPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* MP Bar */}
            <div>
              <div className="flex justify-between text-xs text-yellow-200 mb-1">
                <span>MP</span>
                <span>{enemy.mp} / {enemy.maxMp}</span>
              </div>
              <div className="w-64 bg-gray-800 h-5 rounded border-2 border-gray-600 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-300"
                  style={{ width: `${enemyMpPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Menu */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-gradient-to-br from-amber-800 to-amber-900 border-4 border-amber-700 rounded-lg shadow-2xl p-6">
          <div className="grid grid-cols-4 gap-2 mb-4">
            <button
              onClick={() => {
                console.log('🎯 Attack tab clicked')
                setSelectedAction('attack')
              }}
              className={`px-6 py-3 font-bold rounded-lg border-2 transition ${
                selectedAction === 'attack'
                  ? 'bg-red-600 border-red-800 text-white'
                  : 'bg-amber-900 border-amber-700 text-yellow-200 hover:bg-amber-800'
              }`}
            >
              Attack
            </button>
            <button
              onClick={() => setSelectedAction('spells')}
              className={`px-6 py-3 font-bold rounded-lg border-2 transition ${
                selectedAction === 'spells'
                  ? 'bg-red-600 border-red-800 text-white'
                  : 'bg-amber-900 border-amber-700 text-yellow-200 hover:bg-amber-800'
              }`}
            >
              Spells
            </button>
            <button
              onClick={() => setSelectedAction('items')}
              className={`px-6 py-3 font-bold rounded-lg border-2 transition ${
                selectedAction === 'items'
                  ? 'bg-red-600 border-red-800 text-white'
                  : 'bg-amber-900 border-amber-700 text-yellow-200 hover:bg-amber-800'
              }`}
            >
              Items
            </button>
            <button
              onClick={handleFlee}
              className="px-6 py-3 font-bold rounded-lg border-2 bg-amber-900 border-amber-700 text-yellow-200 hover:bg-amber-800 transition"
            >
              Flee
            </button>
          </div>

          {/* Spell Selection */}
          {selectedAction === 'spells' && (
            <div className="space-y-2">
              <div className="grid grid-cols-6 gap-2 mb-3">
                {spellIcons.map((icon, idx) => (
                  <div
                    key={idx}
                    className={`w-10 h-10 border-2 rounded flex items-center justify-center text-xl ${
                      idx === 0 ? 'border-white bg-yellow-400' : 'border-gray-600 bg-gray-700'
                    }`}
                  >
                    {icon}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {spells.map((spell) => (
                  <button
                    key={spell.name}
                    onClick={() => handleSpell(spell)}
                    disabled={!playerTurn || player.mp < spell.cost || animating}
                    className="px-4 py-2 bg-amber-900 border-2 border-amber-700 text-yellow-200 font-bold rounded hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {spell.icon} {spell.name} ({spell.cost} MP)
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Attack Button */}
          {selectedAction === 'attack' && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('🔥 Attack button clicked!', e)
                handleAttack()
              }}
              disabled={!playerTurn || animating}
              style={{ pointerEvents: 'auto', zIndex: 1000 }}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-6 rounded-lg border-2 border-red-800 shadow-lg transform transition hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Attack! {!playerTurn ? '(Not your turn)' : animating ? '(Animating)' : ''}
            </button>
          )}

          {/* Items placeholder */}
          {selectedAction === 'items' && (
            <div className="text-yellow-200 text-center py-4">
              No items available
            </div>
          )}
        </div>
      </div>

      {/* Battle Log */}
      {battleLog.length > 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-6 py-3 rounded-lg max-w-md">
          {battleLog.map((log, idx) => (
            <div key={idx} className="text-sm mb-1">{log}</div>
          ))}
        </div>
      )}

      {/* Game Title */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <h2 className="text-3xl font-bold text-yellow-400 drop-shadow-2xl" style={{
          textShadow: '3px 3px 0px #8b6914, 5px 5px 15px rgba(0,0,0,0.8)',
          fontFamily: 'Georgia, serif'
        }}>
          Adventure Quest
        </h2>
        <p className="text-white text-center text-sm">Version 34.2</p>
      </div>

      {/* Back to Town Button */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          console.log('🏠 Back to Town clicked')
          endBattle(false)
          navigate('/town')
        }}
        style={{ pointerEvents: 'auto', zIndex: 1000 }}
        className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded border-2 border-red-800 z-50"
      >
        Back to Town
      </button>
    </div>
  )
}

export default BattleScreen

