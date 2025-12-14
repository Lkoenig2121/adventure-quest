import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { useState, useEffect, useCallback } from 'react'

const BattleScreen = () => {
  const navigate = useNavigate()
  const { player, enemy, endBattle, damagePlayer, damageEnemy, useMana, healPlayer, battleRewards, clearBattleRewards, battleSource, useHealthPotion, useManaPotion } = useGame()
  const [selectedAction, setSelectedAction] = useState('attack')
  const [selectedSpell, setSelectedSpell] = useState(null)
  const [battleLog, setBattleLog] = useState([])
  const [playerTurn, setPlayerTurn] = useState(true)
  const [animating, setAnimating] = useState(false)
  const [showVictory, setShowVictory] = useState(false)


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
    if (!enemy && !showVictory) {
      navigate(battleSource === 'castle' ? '/castle' : '/town')
      return
    }
  }, [enemy, navigate, showVictory, battleSource])

  useEffect(() => {
    if (enemy && enemy.hp <= 0 && !showVictory) {
      console.log('🎉 Enemy defeated! Showing victory screen...')
      setTimeout(() => {
        console.log('🎉 Setting showVictory and ending battle')
        setShowVictory(true)
        endBattle(true)
      }, 1500)
    } else if (player.hp <= 0 && !showVictory) {
      setTimeout(() => {
        endBattle(false)
        navigate(battleSource === 'castle' ? '/castle' : '/town')
      }, 1500)
    }
  }, [enemy?.hp, player.hp, endBattle, navigate, showVictory])


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
    navigate(battleSource === 'castle' ? '/castle' : '/town')
  }

  const handleVictoryContinue = () => {
    clearBattleRewards()
    setShowVictory(false)
    navigate(battleSource === 'castle' ? '/castle' : '/town')
  }

  if (!enemy && !showVictory) return null

  // Show victory screen
  if (showVictory) {
    console.log('🏆 Victory screen should show', { showVictory, battleRewards })
    // Wait for battle rewards to be calculated
    if (!battleRewards) {
      console.log('⏳ Waiting for battle rewards...')
      return (
        <div className="w-full h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-black relative overflow-hidden flex items-center justify-center">
          <div className="text-white text-2xl">Loading rewards...</div>
        </div>
      )
    }
    console.log('✅ Showing victory screen with rewards:', battleRewards)
    return (
      <div className="w-full h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-black relative overflow-hidden flex items-center justify-center">
        {/* Victory Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-yellow-400 rounded-full opacity-20 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full opacity-20 blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Victory Banner */}
        <div className="relative z-10 animate-fade-in">
          {/* Victory Text */}
          <div className="text-center mb-8">
            <h1 className="text-8xl font-bold mb-4" style={{
              background: 'linear-gradient(to bottom, #60a5fa, #a78bfa, #f472b6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(147, 51, 234, 0.5)',
              fontFamily: 'Georgia, serif'
            }}>
              VICTORY!
            </h1>
          </div>

          {/* Battle Rewards Scroll */}
          <div className="bg-gradient-to-br from-amber-100 to-amber-50 border-8 border-amber-800 rounded-lg shadow-2xl p-8 min-w-96 max-w-lg relative">
            {/* Scroll decorative top */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-24 h-8 bg-amber-700 rounded-full border-4 border-amber-800"></div>
            
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-amber-900 mb-6" style={{
                fontFamily: 'Georgia, serif',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}>
                Battle Rewards
              </h2>
              
              {/* XP Reward */}
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-4 border-4 border-blue-400">
                <div className="text-amber-900 font-semibold text-lg mb-1">Experience Points</div>
                <div className="text-3xl font-bold text-blue-700">+ {battleRewards.xp} XP</div>
              </div>

              {/* Gold Reward */}
              <div className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg p-4 border-4 border-yellow-400">
                <div className="text-amber-900 font-semibold text-lg mb-1">Gold</div>
                <div className="text-3xl font-bold text-yellow-700">+ {battleRewards.gold} GOLD</div>
              </div>

              {/* Level Up Message */}
              {battleRewards.leveledUp && (
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-4 border-4 border-green-400 animate-pulse">
                  <div className="text-amber-900 font-semibold text-lg mb-1">🎉 Level Up! 🎉</div>
                  <div className="text-2xl font-bold text-green-700">You are now Level {battleRewards.newLevel}!</div>
                </div>
              )}

              {/* Next Button */}
              <button
                onClick={handleVictoryContinue}
                className="w-full mt-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-8 rounded-lg border-4 border-red-800 shadow-lg transform transition hover:scale-105 active:scale-95 text-xl"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    )
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

          {/* Items */}
          {selectedAction === 'items' && (
            <div className="space-y-3">
              {/* Health Potion */}
              <button
                onClick={() => {
                  if (playerTurn && !animating && player.healthPotions > 0) {
                    useHealthPotion()
                    const healAmount = Math.floor(player.maxHp * 0.5)
                    addLog(`${player.name} used a Health Potion and restored ${healAmount} HP!`)
                    setAnimating(true)
                    setTimeout(() => {
                      setAnimating(false)
                      setPlayerTurn(false)
                    }, 500)
                  }
                }}
                disabled={!playerTurn || animating || player.healthPotions === 0}
                className={`w-full px-4 py-3 font-bold rounded-lg border-2 transition ${
                  !playerTurn || animating || player.healthPotions === 0
                    ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 border-red-800 text-white hover:bg-red-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🧪</span>
                    <div className="text-left">
                      <div className="font-bold">Health Potion</div>
                      <div className="text-sm opacity-90">Restores 50% HP</div>
                    </div>
                  </div>
                  <div className="text-xl font-bold">x{player.healthPotions || 0}</div>
                </div>
              </button>

              {/* Mana Potion */}
              <button
                onClick={() => {
                  if (playerTurn && !animating && player.manaPotions > 0) {
                    useManaPotion()
                    const restoreAmount = Math.floor(player.maxMp * 0.5)
                    addLog(`${player.name} used a Mana Potion and restored ${restoreAmount} MP!`)
                    setAnimating(true)
                    setTimeout(() => {
                      setAnimating(false)
                      setPlayerTurn(false)
                    }, 500)
                  }
                }}
                disabled={!playerTurn || animating || player.manaPotions === 0}
                className={`w-full px-4 py-3 font-bold rounded-lg border-2 transition ${
                  !playerTurn || animating || player.manaPotions === 0
                    ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 border-blue-800 text-white hover:bg-blue-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💧</span>
                    <div className="text-left">
                      <div className="font-bold">Mana Potion</div>
                      <div className="text-sm opacity-90">Restores 50% MP</div>
                    </div>
                  </div>
                  <div className="text-xl font-bold">x{player.manaPotions || 0}</div>
                </div>
              </button>
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

      {/* Back Button */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          console.log('🏠 Back clicked')
          endBattle(false)
          navigate(battleSource === 'castle' ? '/castle' : '/town')
        }}
        style={{ pointerEvents: 'auto', zIndex: 1000 }}
        className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded border-2 border-red-800 z-50"
      >
        {battleSource === 'castle' ? 'Back to Castle' : 'Back to Town'}
      </button>
    </div>
  )
}

export default BattleScreen

