import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { FLOOR_ENEMIES } from './CastleScreen'

// Full pet definitions mirrored from PetShopScreen so BattleScreen can read effect data
const PET_DEFS = {
  nerfKitten:    { name: 'Nerf Kitten',    icon: '🐱', effect: 'attack', effectMin: 8,  effectMax: 15 },
  moglinHealer:  { name: 'Moglin',         icon: '🧡', effect: 'heal',   effectAmount: 20 },
  babyDragon:    { name: 'Baby Dragon',    icon: '🐉', effect: 'attack', effectMin: 12, effectMax: 20 },
  zard:          { name: 'Zard',           icon: '🦎', effect: 'attack', effectMin: 5,  effectMax: 12 },
  shadowWolf:    { name: 'Shadow Wolf',    icon: '🐺', effect: 'attack', effectMin: 15, effectMax: 28 },
  healingSprite: { name: 'Healing Sprite', icon: '✨', effect: 'heal',   effectAmount: 15 },
  paxiaDragon:   { name: 'Paxia Dragon',   icon: '🐲', effect: 'attack', effectMin: 10, effectMax: 18 },
  chibiLoco:     { name: 'Chibi Loco',     icon: '😈', effect: 'attack', effectMin: 6,  effectMax: 22 },
}

const BattleScreen = () => {
  const navigate = useNavigate()
  const { player, enemy, endBattle, damagePlayer, damageEnemy, useMana, healPlayer, battleRewards, clearBattleRewards, battleSource, battleFloor, startBattle, resetPlayerStats, useHealthPotion, useManaPotion, equipItem, unequipItem, getElementModifiers, setActivePet } = useGame()
  const [selectedAction, setSelectedAction] = useState('attack')
  const [selectedSpell, setSelectedSpell] = useState(null)
  const [battleLog, setBattleLog] = useState([])
  const [playerTurn, setPlayerTurn] = useState(true)
  const [animating, setAnimating] = useState(false)
  const [showVictory, setShowVictory] = useState(false)
  const [showStatsTooltip, setShowStatsTooltip] = useState(false)
  const [showEnemyTooltip, setShowEnemyTooltip] = useState(false)
  const portraitRef = useRef(null)


  const addLog = useCallback((message) => {
    setBattleLog(prev => [...prev, message])
  }, [])

  const triggerPetEffect = useCallback(() => {
    const activePetId = player.activePetId
    if (!activePetId) return
    const petDef = PET_DEFS[activePetId]
    if (!petDef) return
    if (petDef.effect === 'attack') {
      const petDmg = Math.floor(Math.random() * (petDef.effectMax - petDef.effectMin + 1)) + petDef.effectMin
      damageEnemy(petDmg)
      addLog(`${petDef.icon} ${petDef.name} attacks for ${petDmg} damage!`)
    } else if (petDef.effect === 'heal') {
      healPlayer(petDef.effectAmount)
      addLog(`${petDef.icon} ${petDef.name} heals you for ${petDef.effectAmount} HP!`)
    }
  }, [player.activePetId, damageEnemy, healPlayer, addLog])

  const handleAttack = useCallback(() => {
    console.log('⚔️ Attack clicked!', { playerTurn, animating, hasEnemy: !!enemy })
    if (!playerTurn || animating || !enemy) {
      console.log('❌ Attack blocked:', { playerTurn, animating, hasEnemy: !!enemy })
      return
    }
    
    setAnimating(true)
    const baseDamage = 25
    const randomVariation = Math.floor(Math.random() * 50) + 1
    const weaponMultiplier = player.equipped?.weapon?.damageMultiplier || 1
    const damage = Math.round((baseDamage + randomVariation) * weaponMultiplier)

    const weaponEl = getWeaponElement()
    const { finalDamage, label } = applyResistance(damage, weaponEl.key)
    damageEnemy(finalDamage)
    const multiplierNote = weaponMultiplier > 1 ? ` [×${weaponMultiplier} weapon]` : ''
    addLog(`${player.name} attacks ${enemy.name} for ${finalDamage} ${weaponEl.icon} ${weaponEl.name} damage!${multiplierNote}${label}`)
    triggerPetEffect()
    
    setTimeout(() => {
      setAnimating(false)
      setPlayerTurn(false)
    }, 500)
  }, [playerTurn, animating, enemy, player, damageEnemy, triggerPetEffect, addLog])


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
        const eIcon = enemy.elementIcon || '⚔️'
        const eName = enemy.element || 'Physical'
        setBattleLog(prev => [...prev, `${enemy.name} attacks for ${damage} ${eIcon} ${eName} damage!`])
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
      const rawDamage = spell.damage || 50
      const { finalDamage, label } = applyResistance(rawDamage, spell.element.toLowerCase())
      damageEnemy(finalDamage)
      addLog(`${player.name} casts ${spell.name} for ${finalDamage} ${spell.elementIcon} ${spell.element} damage!${label}`)
    } else if (spell.type === 'heal') {
      const heal = spell.heal || 50
      healPlayer(heal)
      addLog(`${player.name} casts ${spell.name} and heals for ${heal} ${spell.elementIcon} ${spell.element} HP!`)
    }

    triggerPetEffect()

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

  const handleNextBattle = () => {
    const nextFloor = (battleFloor || 0) + 1
    const nextEnemy = FLOOR_ENEMIES[nextFloor]
    if (!nextEnemy) return
    clearBattleRewards()
    startBattle(nextEnemy, 'castle', nextFloor)
    // Reset local battle state
    setShowVictory(false)
    setPlayerTurn(true)
    setAnimating(false)
    setBattleLog([])
    setSelectedAction('attack')
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

              {/* Castle: Next Battle + Return | Town: Next */}
              {battleSource === 'castle' && battleFloor && FLOOR_ENEMIES[battleFloor + 1] ? (
                <div className="flex flex-col gap-3 mt-6">
                  <div className="text-center text-amber-700 text-sm font-semibold">
                    Floor {battleFloor} cleared!
                  </div>
                  <button
                    onClick={handleNextBattle}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-8 rounded-lg border-4 border-green-800 shadow-lg transform transition hover:scale-105 active:scale-95 text-xl"
                  >
                    ⚔️ Next Battle — Floor {battleFloor + 1}: {FLOOR_ENEMIES[battleFloor + 1].name}
                  </button>
                  <button
                    onClick={handleVictoryContinue}
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-8 rounded-lg border-4 border-gray-500 shadow-lg transform transition hover:scale-105 active:scale-95"
                  >
                    Return to Castle
                  </button>
                </div>
              ) : battleSource === 'castle' && battleFloor === 10 ? (
                <div className="flex flex-col gap-3 mt-6">
                  <div className="text-center text-yellow-600 font-bold text-lg animate-pulse">
                    🏆 Castle Conquered!
                  </div>
                  <button
                    onClick={handleVictoryContinue}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-4 px-8 rounded-lg border-4 border-yellow-700 shadow-lg transform transition hover:scale-105 active:scale-95 text-xl"
                  >
                    Return to Castle
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleVictoryContinue}
                  className="w-full mt-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-8 rounded-lg border-4 border-red-800 shadow-lg transform transition hover:scale-105 active:scale-95 text-xl"
                >
                  Next
                </button>
              )}
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

  const ELEMENT_MAP = {
    fire:     { icon: '🔥', name: 'Fire' },
    water:    { icon: '💧', name: 'Water' },
    wind:     { icon: '🌪️', name: 'Wind' },
    ice:      { icon: '❄️', name: 'Ice' },
    earth:    { icon: '🌍', name: 'Earth' },
    energy:   { icon: '⚡', name: 'Energy' },
    light:    { icon: '✨', name: 'Light' },
    darkness: { icon: '🌑', name: 'Darkness' },
  }

  const getWeaponElement = () => {
    const weapon = player.equipped?.weapon
    if (!weapon?.elementBonuses) return { icon: '⚔️', name: 'Physical', key: 'physical' }
    const top = Object.entries(weapon.elementBonuses)
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a)[0]
    if (!top) return { icon: '⚔️', name: 'Physical', key: 'physical' }
    return { ...(ELEMENT_MAP[top[0]] || { icon: '⚔️', name: 'Physical' }), key: top[0] }
  }

  // Apply the enemy's element resistance to a raw damage value.
  // Returns { finalDamage, multiplier, label } where label is a log suffix.
  const applyResistance = (rawDamage, elementKey) => {
    const resistance = enemy?.elementResistances?.[elementKey] ?? 100
    const multiplier = resistance / 100
    const finalDamage = Math.max(0, Math.round(rawDamage * multiplier))
    let label = ''
    if (resistance === 0)        label = ' (IMMUNE!)'
    else if (resistance >= 200)  label = ' (SUPER WEAK! ×2)'
    else if (resistance >= 150)  label = ` (WEAK! ×${multiplier.toFixed(1)})`
    else if (resistance > 100)   label = ` (WEAK! ×${multiplier.toFixed(1)})`
    else if (resistance <= 25)   label = ' (NEARLY IMMUNE!)'
    else if (resistance < 100)   label = ` (RESISTED ×${multiplier.toFixed(1)})`
    return { finalDamage, multiplier, label }
  }

  // Returns the dominant element { icon, name, key } for any item, or null if no bonuses
  const getItemPrimaryElement = (item) => {
    if (!item?.elementBonuses) return null
    const top = Object.entries(item.elementBonuses)
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a)[0]
    if (!top) return null
    return { ...(ELEMENT_MAP[top[0]] || { icon: '⚔️', name: 'Physical' }), key: top[0], bonus: top[1] }
  }

  const spells = [
    { name: 'Fireball', type: 'attack', damage: 60, cost: 25, icon: '🔥', elementIcon: '🔥', element: 'Fire' },
    { name: 'Ice Bolt', type: 'attack', damage: 55, cost: 20, icon: '❄️', elementIcon: '❄️', element: 'Ice' },
    { name: 'Lightning', type: 'attack', damage: 70, cost: 30, icon: '⚡', elementIcon: '⚡', element: 'Energy' },
    { name: 'Heal', type: 'heal', heal: 60, cost: 20, icon: '💚', elementIcon: '💚', element: 'Light' },
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
            {/* Hoverable name / portrait row */}
            <div
              ref={portraitRef}
              className="flex items-center gap-2 mb-2 cursor-pointer group"
              onMouseEnter={() => setShowStatsTooltip(true)}
              onMouseLeave={() => setShowStatsTooltip(false)}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-amber-200 to-amber-300 rounded-full border-2 border-amber-500 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                🧙
              </div>
              <h3 className="text-yellow-200 font-bold text-xl group-hover:text-yellow-100 transition-colors underline decoration-dotted underline-offset-2">
                {player.name}
              </h3>
              <span className="text-yellow-400 text-xs opacity-70 group-hover:opacity-100 transition-opacity">▲</span>
            </div>

            {/* Stats tooltip portal */}
            {showStatsTooltip && createPortal(
              <div
                className="fixed animate-fade-in"
                style={{
                  position: 'fixed',
                  width: '460px',
                  maxWidth: 'calc(100vw - 20px)',
                  zIndex: 99999,
                  top: '10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  maxHeight: 'calc(100vh - 20px)',
                  overflowY: 'auto',
                  pointerEvents: 'none',
                }}
              >
                <div
                  className="bg-gradient-to-br from-amber-100 to-amber-50 border-4 border-amber-800 rounded-lg shadow-2xl p-5"
                  style={{ pointerEvents: 'auto' }}
                  onMouseEnter={() => setShowStatsTooltip(true)}
                  onMouseLeave={() => setShowStatsTooltip(false)}
                >
                  <div className="text-amber-900 text-sm">
                    {/* Header */}
                    <div className="text-center mb-3 pb-2 border-b-2 border-amber-700">
                      <span className="font-bold text-xl text-amber-900">{player.name}</span>
                      <span className="text-amber-600 text-xs ml-2">— Character Stats</span>
                    </div>

                    {/* Profile */}
                    <div className="mb-3 pb-3 border-b-2 border-amber-700">
                      <div className="grid grid-cols-3 gap-1">
                        <div className="flex items-center gap-1">
                          <span className="font-bold">Race:</span>
                          <span className="text-blue-800 font-semibold">Human</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold">Class:</span>
                          <span className="text-purple-800 font-semibold">Warrior</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold">Clan:</span>
                          <span className="text-gray-700 font-semibold">None</span>
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="mb-3 pb-3 border-b-2 border-amber-700">
                      <div className="grid grid-cols-2 gap-1">
                        <div className="flex justify-between pr-2">
                          <span className="font-semibold">Level:</span>
                          <span className="text-blue-700 font-bold">{player.level}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Gold:</span>
                          <span className="text-yellow-700 font-bold">{player.gold.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pr-2 col-span-2">
                          <span className="font-semibold">Experience:</span>
                          <span className="text-purple-700 font-bold">{player.xp || 0} / {player.level * 1000} XP</span>
                        </div>
                      </div>
                    </div>

                    {/* Combat Defense */}
                    <div className="mb-3 pb-3 border-b-2 border-amber-700">
                      <h5 className="font-bold mb-1 text-amber-800">Combat Defense</h5>
                      <div className="grid grid-cols-3 gap-1">
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
                    <div className="mb-3 pb-3 border-b-2 border-amber-700">
                      <h5 className="font-bold mb-1 text-amber-800">Attributes</h5>
                      <div className="grid grid-cols-3 gap-1">
                        <div className="flex justify-between">
                          <span>STR:</span>
                          <span className="font-bold text-red-700">{Math.floor(player.level * 10) + 50}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>DEX:</span>
                          <span className="font-bold text-purple-700">{Math.floor(player.level * 7) + 35}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>INT:</span>
                          <span className="font-bold text-blue-700">{Math.floor(player.level * 8) + 40}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>END:</span>
                          <span className="font-bold text-orange-700">{Math.floor(player.level * 9) + 45}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>CHA:</span>
                          <span className="font-bold text-pink-700">{Math.floor(player.level * 6) + 30}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>LCK:</span>
                          <span className="font-bold text-yellow-700">{Math.floor(player.level * 5) + 25}</span>
                        </div>
                      </div>
                    </div>

                    {/* Element Modifiers */}
                    <div className="mb-3 pb-3 border-b-2 border-amber-700">
                      <h5 className="font-bold mb-1 text-amber-800">Element Modifier</h5>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          ['Fire', 'text-red-600', Math.round(getElementModifiers().fire)],
                          ['Water', 'text-blue-600', Math.round(getElementModifiers().water)],
                          ['Wind', 'text-green-600', Math.round(getElementModifiers().wind)],
                          ['Ice', 'text-cyan-600', Math.round(getElementModifiers().ice)],
                          ['Earth', 'text-amber-600', Math.round(getElementModifiers().earth)],
                          ['Energy', 'text-yellow-600', Math.round(getElementModifiers().energy)],
                          ['Light', 'text-yellow-300', Math.round(getElementModifiers().light)],
                          ['Dark', 'text-gray-800', 50 + Math.floor(player.level * 0.5)],
                        ].map(([label, color, val]) => (
                          <div key={label} className="flex justify-between">
                            <span>{label}:</span>
                            <span className={`font-bold ${color}`}>{val}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Equipment */}
                    <div className="mb-3 pb-3 border-b-2 border-amber-700">
                      <h5 className="font-bold mb-1 text-amber-800">Equipment</h5>
                      <div className="grid grid-cols-2 gap-1">
                        {[
                          { slot: 'weapon', icon: '⚔️', label: 'Weapon', fallback: 'Basic Sword' },
                          { slot: 'helmet', icon: '🪖', label: 'Helmet', fallback: 'None' },
                          { slot: 'armor',  icon: '🛡️', label: 'Armor',  fallback: 'None' },
                          { slot: 'boots',  icon: '👢', label: 'Boots',  fallback: 'None' },
                        ].map(({ slot, icon, label, fallback }) => {
                          const item = (player.equipped || {})[slot]
                          return (
                            <div key={slot} className="flex items-center gap-1">
                              <span>{item ? item.icon : icon}</span>
                              <div>
                                <div className="text-xs text-gray-500">{label}:</div>
                                <div className="font-semibold text-xs">{item ? item.name : fallback}</div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Consumables */}
                    <div>
                      <h5 className="font-bold mb-1 text-amber-800">Consumables</h5>
                      <div className="grid grid-cols-2 gap-1">
                        <div className="flex items-center gap-1">
                          <span className="text-red-600">🧪</span>
                          <span>HP Potion:</span>
                          <span className="font-bold text-red-700">x{player.healthPotions || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-blue-600">💧</span>
                          <span>MP Potion:</span>
                          <span className="font-bold text-blue-700">x{player.manaPotions || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>,
              document.body
            )}
            
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

            {/* Hoverable enemy name */}
            <div
              className="flex items-center gap-2 mb-2 cursor-pointer group"
              onMouseEnter={() => setShowEnemyTooltip(true)}
              onMouseLeave={() => setShowEnemyTooltip(false)}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full border-2 border-purple-300 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                👹
              </div>
              <h3 className="text-yellow-200 font-bold text-xl group-hover:text-yellow-100 transition-colors underline decoration-dotted underline-offset-2">
                {enemy.name}
              </h3>
              <span className="text-yellow-400 text-xs opacity-70 group-hover:opacity-100 transition-opacity">▲</span>
            </div>

            {/* Enemy stats tooltip portal */}
            {showEnemyTooltip && createPortal(
              <div
                className="fixed animate-fade-in"
                style={{
                  position: 'fixed',
                  width: '420px',
                  maxWidth: 'calc(100vw - 20px)',
                  zIndex: 99999,
                  top: '10px',
                  right: '20px',
                  maxHeight: 'calc(100vh - 20px)',
                  overflowY: 'auto',
                  pointerEvents: 'none',
                }}
              >
                <div
                  className="bg-gradient-to-br from-purple-100 to-purple-50 border-4 border-purple-800 rounded-lg shadow-2xl p-5"
                  style={{ pointerEvents: 'auto' }}
                  onMouseEnter={() => setShowEnemyTooltip(true)}
                  onMouseLeave={() => setShowEnemyTooltip(false)}
                >
                  <div className="text-purple-900 text-sm">
                    {/* Header */}
                    <div className="text-center mb-3 pb-2 border-b-2 border-purple-700">
                      <div className="text-3xl mb-1">👹</div>
                      <span className="font-bold text-xl text-purple-900">{enemy.name}</span>
                      <div className="text-purple-600 text-xs mt-1">— Monster Stats</div>
                    </div>

                    {/* Level & Element */}
                    <div className="mb-3 pb-3 border-b-2 border-purple-700">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex justify-between">
                          <span className="font-semibold">Level:</span>
                          <span className="text-blue-700 font-bold">{enemy.level}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Element:</span>
                          <span className="font-bold">{enemy.elementIcon || '⚔️'} {enemy.element || 'Physical'}</span>
                        </div>
                      </div>
                    </div>

                    {/* HP / MP */}
                    <div className="mb-3 pb-3 border-b-2 border-purple-700">
                      <h5 className="font-bold mb-2 text-purple-800">Stats</h5>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold">HP</span>
                            <span className="font-bold text-red-700">{enemy.hp} / {enemy.maxHp}</span>
                          </div>
                          <div className="w-full bg-gray-300 h-3 rounded overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-300"
                              style={{ width: `${enemyHpPercentage}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold">MP</span>
                            <span className="font-bold text-blue-700">{enemy.mp} / {enemy.maxMp}</span>
                          </div>
                          <div className="w-full bg-gray-300 h-3 rounded overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300"
                              style={{ width: `${enemyMpPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Element Resistances */}
                    {enemy.elementResistances && (
                      <div className="mb-3 pb-3 border-b-2 border-purple-700">
                        <h5 className="font-bold mb-2 text-purple-800">Element Resistances
                          <span className="font-normal text-xs text-purple-600 ml-2">— hover for tip</span>
                        </h5>
                        <div className="text-xs text-purple-600 mb-2 italic">
                          🟢 &gt;100% = Weak (use this!) &nbsp;|&nbsp; 🔴 &lt;100% = Resistant &nbsp;|&nbsp; ⬛ 0% = Immune
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          {[
                            { key: 'fire',     icon: '🔥', label: 'Fire' },
                            { key: 'water',    icon: '💧', label: 'Water' },
                            { key: 'wind',     icon: '🌪️', label: 'Wind' },
                            { key: 'ice',      icon: '❄️', label: 'Ice' },
                            { key: 'earth',    icon: '🌍', label: 'Earth' },
                            { key: 'energy',   icon: '⚡', label: 'Energy' },
                            { key: 'light',    icon: '✨', label: 'Light' },
                            { key: 'darkness', icon: '🌑', label: 'Dark' },
                          ].map(({ key, icon, label }) => {
                            const val = enemy.elementResistances[key] ?? 100
                            const isWeak = val > 100
                            const isImmune = val === 0
                            const isResistant = val < 100 && val > 0
                            return (
                              <div
                                key={key}
                                className={`rounded p-1 text-center border ${
                                  isImmune    ? 'bg-gray-800 border-gray-600 text-white' :
                                  isWeak      ? 'bg-green-100 border-green-500' :
                                  isResistant ? 'bg-red-100 border-red-400' :
                                               'bg-white border-gray-300'
                                }`}
                              >
                                <div>{icon}</div>
                                <div className={`text-xs font-bold leading-tight ${
                                  isImmune    ? 'text-gray-300' :
                                  isWeak      ? 'text-green-700' :
                                  isResistant ? 'text-red-600' :
                                               'text-gray-600'
                                }`}>
                                  {isImmune ? 'IMMUNE' : `${val}%`}
                                </div>
                                <div className={`text-xs leading-tight truncate ${
                                  isImmune    ? 'text-gray-400' :
                                  isWeak      ? 'text-green-600' :
                                  isResistant ? 'text-red-500' :
                                               'text-gray-500'
                                }`}>
                                  {label}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Rewards — the main section the user asked for */}
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-500 rounded-lg p-3">
                      <h5 className="font-bold mb-2 text-amber-800 text-center">⚔️ Victory Rewards</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white border-2 border-blue-400 rounded-lg p-2 text-center">
                          <div className="text-2xl mb-1">⭐</div>
                          <div className="text-xs text-blue-700 font-semibold">Experience</div>
                          <div className="text-xl font-bold text-blue-700">+{enemy.xpReward || 0} XP</div>
                        </div>
                        <div className="bg-white border-2 border-yellow-500 rounded-lg p-2 text-center">
                          <div className="text-2xl mb-1">🪙</div>
                          <div className="text-xs text-yellow-700 font-semibold">Gold</div>
                          <div className="text-xl font-bold text-yellow-700">+{enemy.goldReward || 0}</div>
                        </div>
                      </div>
                      {/* XP progress towards next level */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-amber-700 mb-1">
                          <span>Your XP Progress after win:</span>
                          <span className="font-bold">{Math.min(player.xp + (enemy.xpReward || 0), player.level * 1000)} / {player.level * 1000}</span>
                        </div>
                        <div className="w-full bg-gray-300 h-3 rounded overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                            style={{ width: `${Math.min(100, ((player.xp + (enemy.xpReward || 0)) / (player.level * 1000)) * 100)}%` }}
                          />
                        </div>
                        {player.xp + (enemy.xpReward || 0) >= player.level * 1000 && (
                          <div className="text-center text-green-700 font-bold text-xs mt-1 animate-pulse">🎉 LEVEL UP on victory!</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>,
              document.body
            )}
            
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

      {/* Active Pet Display */}
      {player.activePetId && PET_DEFS[player.activePetId] && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20">
          <div className="bg-gradient-to-br from-green-800 to-green-900 border-4 border-green-600 rounded-lg px-4 py-3 shadow-2xl flex flex-col items-center gap-1 min-w-[100px]">
            <div className="text-xs text-green-200 font-bold uppercase tracking-wide">Active Pet</div>
            <div className="text-5xl">{PET_DEFS[player.activePetId].icon}</div>
            <div className="text-yellow-200 font-bold text-sm text-center leading-tight">{PET_DEFS[player.activePetId].name}</div>
            <div className={`text-xs font-semibold text-center ${PET_DEFS[player.activePetId].effect === 'heal' ? 'text-green-300' : 'text-red-300'}`}>
              {PET_DEFS[player.activePetId].effect === 'heal'
                ? `💚 +${PET_DEFS[player.activePetId].effectAmount} HP/turn`
                : `⚔️ ${PET_DEFS[player.activePetId].effectMin}–${PET_DEFS[player.activePetId].effectMax} dmg`}
            </div>
          </div>
        </div>
      )}

      {/* Action Menu */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-gradient-to-br from-amber-800 to-amber-900 border-4 border-amber-700 rounded-lg shadow-2xl p-6">
          <div className="grid grid-cols-5 gap-2 mb-4">
            <button
              onClick={() => {
                console.log('🎯 Attack tab clicked')
                setSelectedAction('attack')
              }}
              className={`px-4 py-3 font-bold rounded-lg border-2 transition ${
                selectedAction === 'attack'
                  ? 'bg-red-600 border-red-800 text-white'
                  : 'bg-amber-900 border-amber-700 text-yellow-200 hover:bg-amber-800'
              }`}
            >
              Attack
            </button>
            <button
              onClick={() => setSelectedAction('spells')}
              className={`px-4 py-3 font-bold rounded-lg border-2 transition ${
                selectedAction === 'spells'
                  ? 'bg-red-600 border-red-800 text-white'
                  : 'bg-amber-900 border-amber-700 text-yellow-200 hover:bg-amber-800'
              }`}
            >
              Spells
            </button>
            <button
              onClick={() => setSelectedAction('items')}
              className={`px-4 py-3 font-bold rounded-lg border-2 transition ${
                selectedAction === 'items'
                  ? 'bg-red-600 border-red-800 text-white'
                  : 'bg-amber-900 border-amber-700 text-yellow-200 hover:bg-amber-800'
              }`}
            >
              Items
            </button>
            <button
              onClick={() => setSelectedAction('pets')}
              className={`px-4 py-3 font-bold rounded-lg border-2 transition ${
                selectedAction === 'pets'
                  ? 'bg-red-600 border-red-800 text-white'
                  : 'bg-amber-900 border-amber-700 text-yellow-200 hover:bg-amber-800'
              }`}
            >
              🐾 Pets
            </button>
            <button
              onClick={() => setSelectedAction('equipment')}
              className={`px-4 py-3 font-bold rounded-lg border-2 transition ${
                selectedAction === 'equipment'
                  ? 'bg-red-600 border-red-800 text-white'
                  : 'bg-amber-900 border-amber-700 text-yellow-200 hover:bg-amber-800'
              }`}
            >
              Equip
            </button>
          </div>
          {/* Flee button below tabs */}
          <div className="mb-2">
            <button
              onClick={handleFlee}
              className="w-full px-4 py-2 font-bold rounded-lg border-2 bg-amber-900 border-amber-700 text-yellow-200 hover:bg-amber-800 transition text-sm"
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
                    triggerPetEffect()
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
                    triggerPetEffect()
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
          
          {/* Pets Tab */}
          {selectedAction === 'pets' && (
            <div className="space-y-3">
              {(player.pets || []).length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-5xl mb-3">🐾</div>
                  <div className="text-yellow-200 font-bold text-lg mb-1">No pets yet!</div>
                  <div className="text-yellow-300 text-sm">Visit the Pet Shop in town (left brown building) to buy a companion.</div>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {(player.pets || []).map(pet => {
                    const petDef = PET_DEFS[pet.id] || pet
                    const isActive = player.activePetId === pet.id
                    return (
                      <button
                        key={pet.id}
                        onClick={() => setActivePet(isActive ? null : pet.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 font-bold transition ${
                          isActive
                            ? 'bg-green-600 border-green-800 text-white'
                            : 'bg-amber-900 border-amber-700 text-yellow-200 hover:bg-amber-800'
                        }`}
                      >
                        <span className="text-3xl">{petDef.icon}</span>
                        <div className="text-left flex-1">
                          <div className="font-bold">{petDef.name}</div>
                          <div className="text-xs opacity-90">
                            {petDef.effect === 'heal'
                              ? `💚 Heals ${petDef.effectAmount} HP per turn`
                              : `⚔️ Deals ${petDef.effectMin}–${petDef.effectMax} dmg per turn`}
                          </div>
                        </div>
                        {isActive && (
                          <span className="bg-white text-green-700 text-xs font-bold px-2 py-1 rounded">ACTIVE</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Equipment Management */}
          {selectedAction === 'equipment' && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <div className="bg-gradient-to-br from-purple-100 to-purple-50 border-4 border-purple-600 rounded-lg p-4 mb-3">
                <h3 className="text-xl font-bold text-purple-900 mb-2">Current Element Modifiers</h3>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span>Fire:</span>
                    <span className="font-bold text-red-600">{Math.round(getElementModifiers().fire)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Water:</span>
                    <span className="font-bold text-blue-600">{Math.round(getElementModifiers().water)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wind:</span>
                    <span className="font-bold text-green-600">{Math.round(getElementModifiers().wind)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ice:</span>
                    <span className="font-bold text-cyan-600">{Math.round(getElementModifiers().ice)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Earth:</span>
                    <span className="font-bold text-amber-600">{Math.round(getElementModifiers().earth)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Energy:</span>
                    <span className="font-bold text-yellow-600">{Math.round(getElementModifiers().energy)}%</span>
                  </div>
                </div>
              </div>

              {/* Equipped Items */}
              <div className="bg-gradient-to-br from-blue-100 to-blue-50 border-4 border-blue-600 rounded-lg p-3 mb-3">
                <h3 className="text-lg font-bold text-blue-900 mb-2">Currently Equipped</h3>
                <div className="space-y-2">
                  {['weapon', 'helmet', 'armor', 'boots'].map(slot => {
                    const equipped = player.equipped || {}
                    const item = equipped[slot]
                    const slotNames = { weapon: '⚔️ Weapon', helmet: '🪖 Helmet', armor: '🛡️ Armor', boots: '👢 Boots' }
                    const primaryEl = item ? getItemPrimaryElement(item) : null

                    return (
                      <div key={slot} className="bg-white border-2 border-blue-400 rounded p-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-lg flex-shrink-0">{slotNames[slot]}</span>
                            {item ? (
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1 flex-wrap">
                                  <span className="text-xl">{item.icon}</span>
                                  <span className="font-bold text-blue-900 text-sm">{item.name}</span>
                                </div>
                                {primaryEl && (
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <span className="text-xs text-gray-500">
                                      {slot === 'weapon' ? 'Attacks with:' : 'Primary element:'}
                                    </span>
                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                      slot === 'weapon'
                                        ? 'bg-orange-100 border border-orange-400 text-orange-700'
                                        : 'bg-purple-100 border border-purple-400 text-purple-700'
                                    }`}>
                                      {primaryEl.icon} {primaryEl.name}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500 text-sm">Empty</span>
                            )}
                          </div>
                          {item && (
                            <button
                              onClick={() => {
                                unequipItem(slot)
                                addLog(`Unequipped ${item.name}`)
                              }}
                              className="flex-shrink-0 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded"
                            >
                              Unequip
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Inventory Items */}
              <div className="bg-gradient-to-br from-green-100 to-green-50 border-4 border-green-600 rounded-lg p-3">
                <h3 className="text-lg font-bold text-green-900 mb-2">Inventory</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(player.inventory || []).length > 0 ? (
                    (player.inventory || []).map(item => {
                      const primaryEl = getItemPrimaryElement(item)
                      return (
                        <div key={item.id} className="bg-white border-2 border-green-400 rounded p-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-xl flex-shrink-0">{item.icon}</span>
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-green-900 text-sm">{item.name}</div>
                                <div className="text-xs text-gray-500">Slot: {item.slot}</div>
                                {primaryEl && (
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <span className="text-xs text-gray-500">
                                      {item.slot === 'weapon' ? 'Attacks with:' : 'Primary element:'}
                                    </span>
                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                      item.slot === 'weapon'
                                        ? 'bg-orange-100 border border-orange-400 text-orange-700'
                                        : 'bg-purple-100 border border-purple-400 text-purple-700'
                                    }`}>
                                      {primaryEl.icon} {primaryEl.name}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                equipItem(item.id, item.slot)
                                addLog(`Equipped ${item.name}`)
                              }}
                              className="flex-shrink-0 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded"
                            >
                              Equip
                            </button>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center text-gray-500 py-2">No items in inventory</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Battle Log - last 4 lines only */}
      {battleLog.length > 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-6 py-3 rounded-lg max-w-md max-h-[6.5rem] overflow-hidden">
          {battleLog.slice(-4).map((log, idx) => (
            <div key={idx} className="text-sm mb-1 truncate">{log}</div>
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

