import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { FLOOR_ENEMIES, scaleCastleEnemy } from './CastleScreen'
import { ALL_SPELLS } from '../data/spells'

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

const getStrengthDamageBonus = (strength) =>
  Math.floor(Math.sqrt(strength || 0) * 5)

const BattleScreen = () => {
  const navigate = useNavigate()
  const { player, enemy, endBattle, damagePlayer, damageEnemy, useMana, healPlayer, battleRewards, clearBattleRewards, battleSource, battleFloor, startBattle, resetPlayerStats, useHealthPotion, useManaPotion, equipItem, unequipItem, getElementModifiers, setActivePet } = useGame()
  const [selectedAction, setSelectedAction] = useState('attack')
  const [selectedSpell, setSelectedSpell] = useState(null)

  // Luck-based initiative — computed once at mount so log and turn are always in sync
  const [{ firstTurn: _firstTurn, initLog: _initLog }] = useState(() => {
    const playerLuck = 25 + Math.floor((player?.level || 1) * 5) + (player?.bonusStats?.luck || 0)
    const enemySpeed = enemy?.speed || 50
    const playerRoll = Math.random() * playerLuck
    const enemyRoll  = Math.random() * enemySpeed
    const firstTurn  = playerRoll >= enemyRoll
    const initLog    = firstTurn
      ? `⚡ ${player?.name || 'You'} wins the initiative and attacks first! (LCK ${playerLuck} vs SPD ${enemySpeed})`
      : `⚡ ${enemy?.name || 'Enemy'} is faster and strikes first! (SPD ${enemySpeed} vs LCK ${playerLuck})`
    return { firstTurn, initLog }
  })
  const [playerTurn, setPlayerTurn] = useState(_firstTurn)
  const [battleLog, setBattleLog] = useState([_initLog])
  const [animating, setAnimating] = useState(false)
  const [showNecroPanel, setShowNecroPanel] = useState(false)
  const [showVictory, setShowVictory] = useState(false)
  const [showDefeat, setShowDefeat] = useState(false)
  const [dragonStrike, setDragonStrike] = useState(null) // { element, icon, damage } | null
  const [showStatsTooltip, setShowStatsTooltip] = useState(false)
  const [showEnemyTooltip, setShowEnemyTooltip] = useState(false)
  const portraitRef = useRef(null)


  const addLog = useCallback((message) => {
    setBattleLog(prev => [...prev, message])
  }, [])

  // Returns scaled pet stats based on player level
  const getScaledPet = (petDef, lv) => {
    if (!petDef) return {}
    if (petDef.effect === 'heal') {
      return { healAmount: petDef.effectAmount + lv * 2 }
    }
    return {
      min: petDef.effectMin + lv * 4,
      max: petDef.effectMax + lv * 6,
    }
  }

  const triggerPetEffect = useCallback(() => {
    const activePetId = player.activePetId
    if (!activePetId) return
    const petDef = PET_DEFS[activePetId]
    if (!petDef) return
    const lv = player.level || 1
    const scaled = getScaledPet(petDef, lv)
    if (petDef.effect === 'attack') {
      const petDmg = Math.floor(Math.random() * (scaled.max - scaled.min + 1)) + scaled.min
      damageEnemy(petDmg)
      addLog(`${petDef.icon} ${petDef.name} attacks for ${petDmg} damage!`)
    } else if (petDef.effect === 'heal') {
      healPlayer(scaled.healAmount)
      addLog(`${petDef.icon} ${petDef.name} heals you for ${scaled.healAmount} HP!`)
    }
  }, [player.activePetId, player.level, damageEnemy, healPlayer, addLog])

  const handleAttack = useCallback(() => {
    console.log('⚔️ Attack clicked!', { playerTurn, animating, hasEnemy: !!enemy })
    if (!playerTurn || animating || !enemy) {
      console.log('❌ Attack blocked:', { playerTurn, animating, hasEnemy: !!enemy })
      return
    }
    
    setAnimating(true)
    const bonusStats = player.bonusStats || {}
    const strBonus    = getStrengthDamageBonus(bonusStats.strength)
    const dexBonus    = (bonusStats.dexterity || 0) * 1   // +1 to random range per DEX point
    const luckPoints  = bonusStats.luck || 0
    const critChance  = luckPoints * 0.02                  // 2% crit chance per LCK point
    const isCrit      = Math.random() < critChance
    const critMult    = isCrit ? 1.5 : 1

    const baseDamage = 25 + strBonus
    const randomVariation = Math.floor(Math.random() * (50 + dexBonus)) + 1
    const weaponMultiplier = player.equipped?.weapon?.damageMultiplier || 1
    const damage = Math.round((baseDamage + randomVariation) * weaponMultiplier * critMult)

    const weaponEl = getWeaponElement()
    const multiplierNote = weaponMultiplier > 1 ? ` [×${weaponMultiplier} weapon]` : ''
    const critNote = isCrit ? ' ⚡ CRITICAL HIT!' : ''

    const isReignPlate = player.equipped?.armor?.name === 'Reign Plate'

    // Guardian Blade 25% Dragon proc — REPLACES the player's attack entirely
    const isGuardianBlade = player.equipped?.weapon?.name === 'Guardian Blade'
    if (isGuardianBlade && Math.random() < 0.10) {
      const resistances = enemy.elementResistances || {}
      const ELEM_ICONS = { fire:'🔥', water:'💧', wind:'🌪️', ice:'❄️', earth:'🌍', energy:'⚡', light:'✨', darkness:'🌑', physical:'⚔️' }
      const sorted = Object.entries(resistances).sort(([,a],[,b]) => b - a)
      const [weakEl] = sorted[0] || ['physical', 100]
      const weakIcon = ELEM_ICONS[weakEl] || '⚔️'
      const dragonBase = 1000 + Math.floor(Math.random() * 500)
      const { finalDamage: dragonDmg, label: dragonLabel } = applyResistance(dragonBase, weakEl)
      setTimeout(() => {
        damageEnemy(dragonDmg)
        addLog(`🐉 GUARDIAN DRAGON replaces your attack and strikes ${enemy.name} for ${dragonDmg} ${weakIcon} ${weakEl.charAt(0).toUpperCase()+weakEl.slice(1)} damage! (their weakness!)${dragonLabel}`)
        setDragonStrike({ element: weakEl, icon: weakIcon, damage: dragonDmg })
        setTimeout(() => setDragonStrike(null), 1800)
      }, 400)
      triggerPetEffect()
      setTimeout(() => { setAnimating(false); setPlayerTurn(false) }, 600)
      return
    }

    if (isReignPlate) {
      // 4 sequential hits — each re-rolls its own random variation
      let hit = 0
      const doReignHit = () => {
        if (hit >= 4) {
          triggerPetEffect()
          setTimeout(() => { setAnimating(false); setPlayerTurn(false) }, 300)
          return
        }
        hit++
        const hitVariation = Math.floor(Math.random() * (50 + (bonusStats.dexterity || 0))) + 1
        const hitDmg = Math.round((baseDamage + hitVariation) * weaponMultiplier * critMult * 0.7)
        const { finalDamage: fd, label: lbl } = applyResistance(hitDmg, weaponEl.key)
        damageEnemy(fd)
        addLog(`🛡️ Reign Strike ${hit}/4 — ${player.name} hits for ${fd} ${weaponEl.icon} ${weaponEl.name} damage!${multiplierNote}${lbl}${hit === 1 ? critNote : ''}`)
        setTimeout(doReignHit, 400)
      }
      doReignHit()
      return
    }

    const { finalDamage, label } = applyResistance(damage, weaponEl.key)
    damageEnemy(finalDamage)
    addLog(`${player.name} attacks ${enemy.name} for ${finalDamage} ${weaponEl.icon} ${weaponEl.name} damage!${multiplierNote}${label}${critNote}`)
    triggerPetEffect()

    setTimeout(() => {
      setAnimating(false)
      setPlayerTurn(false)
    }, 500)
  }, [playerTurn, animating, enemy, player, damageEnemy, triggerPetEffect, addLog])


  const sourceNav = battleSource === 'castle' ? '/castle'
    : battleSource === 'statTrainer' ? '/stat-trainer'
    : battleSource === 'reignQuest' ? '/reign-quest'
    : '/town'

  useEffect(() => {
    if (!enemy && !showVictory) {
      navigate(sourceNav)
      return
    }
  }, [enemy, navigate, showVictory, sourceNav])

  useEffect(() => {
    if (!enemy || showVictory) return

    const trainerSurrenders = battleSource === 'statTrainer' && enemy.hp > 0 && enemy.hp <= (enemy.surrenderHp ?? 250)
    const normalDefeat = enemy.hp <= 0

    if (trainerSurrenders || normalDefeat) {
      if (trainerSurrenders) {
        addLog('✨ The Celestial Trainer raises a glowing hand — "Enough, champion. You have proven your worth. I yield my wisdom to you!"')
      } else {
        console.log('🎉 Enemy defeated! Showing victory screen...')
      }
      setTimeout(() => {
        setShowVictory(true)
        endBattle(true)
      }, 1500)
    } else if (player.hp <= 0) {
      setTimeout(() => {
        setShowDefeat(true)
      }, 800)
    }
  }, [enemy?.hp, player.hp, endBattle, navigate, showVictory, battleSource, addLog])


  useEffect(() => {
    // Enemy turn after player acts
    if (!playerTurn && enemy && enemy.hp > 0 && player.hp > 0) {
      setShowNecroPanel(false)
      const timer = setTimeout(() => {
        const enemyLv = enemy.level || player.level
        const minDmg = enemy.attackMin ?? Math.floor(10 + player.level * 4 + enemyLv * 1)
        const maxDmg = enemy.attackMax ?? Math.floor(20 + player.level * 8 + enemyLv * 2)
        const damage = Math.floor(Math.random() * (maxDmg - minDmg + 1)) + minDmg
        damagePlayer(damage)
        const eIcon = enemy.elementIcon || '⚔️'
        const eName = enemy.element || 'Physical'
        setBattleLog(prev => [...prev, `${enemy.name} attacks for ${damage} ${eIcon} ${eName} damage!`])
        setPlayerTurn(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [playerTurn, enemy, damagePlayer])

  // ── Necromancer moves (available when Obsidian Cloak is equipped) ──────
  const NECRO_MOVES = [
    { key: 'attack',       name: 'Attack',         icon: '⚔️',  mpCost: 0,   row: 1, col: 2, desc: 'Basic strike'          },
    { key: 'undeadGiant',  name: 'Undead Giant',   icon: '💀',  mpCost: 30,  row: 2, col: 1, desc: '3.5× damage'            },
    { key: 'undeadMutant', name: 'Undead Mutant!', icon: '🧟',  mpCost: 125, row: 2, col: 3, desc: '8 rapid hits'           },
    { key: 'necroHeal',    name: 'Necro Heal!',    icon: '💚',  mpCost: 0,   row: 3, col: 1, desc: 'Restore 80 HP'          },
    { key: 'becomeALich',  name: 'Become a Lich!', icon: '💀',  mpCost: 150, row: 3, col: 2, desc: '5× Darkness strike'     },
    { key: 'fear',         name: 'Fear!',          icon: '😱',  mpCost: 60,  row: 3, col: 3, desc: '1.5× + terrify'         },
    { key: 'deathDog',     name: 'Death Dog!',     icon: '🐕',  mpCost: 80,  row: 4, col: 1, desc: '3× damage'              },
    { key: 'skullSwarm',   name: 'Skull Swarm!',   icon: '🔮',  mpCost: 45,  row: 4, col: 2, desc: '2.5× damage'            },
    { key: 'zombieHands',  name: 'Zombie Hands!',  icon: '🖐️',  mpCost: 30,  row: 4, col: 3, desc: '2× damage'              },
  ]

  const handleNecroMove = (move) => {
    if (!playerTurn || animating || !enemy) return
    if (player.mp < move.mpCost) {
      addLog(`Not enough MP for ${move.name}! Need ${move.mpCost} MP.`)
      return
    }

    setShowNecroPanel(false)
    setAnimating(true)
    if (move.mpCost > 0) useMana(move.mpCost)

    const bonusStats = player.bonusStats || {}
    const strBonus  = getStrengthDamageBonus(bonusStats.strength)
    const dexBonus  = (bonusStats.dexterity || 0)
    const calcBase  = () => 25 + strBonus + Math.floor(Math.random() * (50 + dexBonus)) + 1

    // Use the equipped weapon's element (falls back to Physical)
    const weaponEl = getWeaponElement()
    const elKey    = weaponEl.key
    const elLabel  = `${weaponEl.icon} ${weaponEl.name}`

    // Undead Mutant: 8 hits × 0.5 s
    if (move.key === 'undeadMutant') {
      let hit = 0
      const doHit = () => {
        if (hit >= 8) {
          triggerPetEffect()
          setTimeout(() => { setAnimating(false); setPlayerTurn(false) }, 300)
          return
        }
        const dmg = Math.round(calcBase() * 0.5)
        const { finalDamage, label } = applyResistance(dmg, elKey)
        damageEnemy(finalDamage)
        addLog(`🧟 Undead Mutant hit ${hit + 1} — ${finalDamage} ${elLabel} damage!${label}`)
        hit++
        setTimeout(doHit, 500)
      }
      doHit()
      return
    }

    // Necro Heal (no damage)
    if (move.key === 'necroHeal') {
      healPlayer(80)
      addLog(`💚 Necro Heal! ${player.name} absorbs dark energy and recovers 80 HP!`)
      triggerPetEffect()
      setTimeout(() => { setAnimating(false); setPlayerTurn(false) }, 500)
      return
    }

    // All damaging moves
    const multipliers = { attack: 1, undeadGiant: 3.5, fear: 1.5, zombieHands: 2, skullSwarm: 2.5, deathDog: 3, becomeALich: 5 }
    const logPrefixes = {
      attack:      () => `⚔️ ${player.name} attacks ${enemy.name}`,
      undeadGiant: () => `💀 Undead Giant SMASHES ${enemy.name}`,
      fear:        () => `😱 Fear! ${enemy.name} is terrified and takes`,
      zombieHands: () => `🖐️ Zombie Hands drag ${enemy.name} down for`,
      skullSwarm:  () => `🔮 Skull Swarm overwhelms ${enemy.name} for`,
      deathDog:    () => `🐕 Death Dog mauls ${enemy.name} for`,
      becomeALich: () => `💀 BECOME A LICH! Undead fury tears through ${enemy.name} for`,
    }

    const mult = multipliers[move.key] || 1
    const raw  = Math.round(calcBase() * mult)
    const { finalDamage, label } = applyResistance(raw, elKey)
    const multNote = mult > 1 ? ` (×${mult})` : ''
    damageEnemy(finalDamage)
    addLog(`${(logPrefixes[move.key] || (() => `${player.name} hits ${enemy.name}`))()} ${finalDamage} ${elLabel} damage!${multNote}${label}`)

    triggerPetEffect()
    setTimeout(() => { setAnimating(false); setPlayerTurn(false) }, 500)
  }

  const handleSpell = (spell) => {
    if (!playerTurn || animating || !enemy) return
    
    const spellCost = spell.cost || 20
    if (player.mp < spellCost) {
      addLog('Not enough MP!')
      return
    }

    setAnimating(true)
    useMana(spellCost)

    const totalInt = Math.floor(player.level * 8) + 40 + (player.bonusStats?.intellect || 0)
    if (spell.type === 'attack') {
      const rawDamage = (spell.damage || 50) + Math.floor(totalInt * 2.0)
      const { finalDamage, label } = applyResistance(rawDamage, spell.element.toLowerCase())
      damageEnemy(finalDamage)
      addLog(`${player.name} casts ${spell.name} for ${finalDamage} ${spell.elementIcon} ${spell.element} damage!${label}`)
    } else if (spell.type === 'heal') {
      const heal = (spell.heal || 50) + Math.floor(totalInt * 1.5)
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
    navigate(sourceNav)
  }

  const handleVictoryContinue = () => {
    clearBattleRewards()
    setShowVictory(false)
    navigate(sourceNav)
  }

  const handleNextBattle = () => {
    const nextFloor = (battleFloor || 0) + 1
    const baseEnemy = FLOOR_ENEMIES[nextFloor]
    if (!baseEnemy) return
    clearBattleRewards()
    startBattle(scaleCastleEnemy(baseEnemy, player.level, nextFloor), 'castle', nextFloor)
    // Reset local battle state
    setShowVictory(false)
    setPlayerTurn(true)
    setAnimating(false)
    setBattleLog([])
    setSelectedAction('attack')
  }

  if (!enemy && !showVictory && !showDefeat) return null

  // ── Defeat screen ────────────────────────────────────────────────────────
  if (showDefeat) {
    const defeatedBy = enemy?.name || 'your foe'
    const defeatedIcon = enemy?.icon || '💀'
    return (
      <div className="w-full h-screen flex items-center justify-center" style={{
        background: 'radial-gradient(ellipse at center, #3b0000 0%, #1a0000 60%, #000 100%)',
      }}>
        {/* Pulsing red glow */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(180,0,0,0.18) 0%, transparent 70%)',
          animation: 'pulse 2s infinite',
        }} />

        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
          padding: 48, borderRadius: 20, zIndex: 10, textAlign: 'center',
          background: 'rgba(0,0,0,0.6)',
          border: '3px solid #7f1d1d',
          boxShadow: '0 0 60px rgba(180,0,0,0.5)',
          maxWidth: 480,
        }}>
          {/* Enemy icon */}
          <div style={{ fontSize: 80, lineHeight: 1, filter: 'drop-shadow(0 0 20px rgba(255,0,0,0.7))' }}>
            {defeatedIcon}
          </div>

          {/* Defeat title */}
          <div style={{
            fontFamily: 'Georgia, serif', fontSize: 42, fontWeight: 'bold',
            color: '#ef4444', textShadow: '0 0 20px rgba(239,68,68,0.8), 0 2px 4px rgba(0,0,0,0.9)',
            letterSpacing: 3,
          }}>
            DEFEATED
          </div>

          <div style={{ color: '#fca5a5', fontSize: 16, lineHeight: 1.6, fontFamily: 'Georgia,serif' }}>
            <strong style={{ color: '#f87171' }}>{player.name}</strong> was overcome by{' '}
            <strong style={{ color: '#fbbf24' }}>{defeatedBy}</strong>.<br />
            <span style={{ color: '#9ca3af', fontSize: 14 }}>
              Rest, recover, and return stronger.
            </span>
          </div>

          {/* HP bar — showing 0 */}
          <div style={{ width: '100%', maxWidth: 280 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#f87171', fontSize: 12, fontWeight: 'bold' }}>HP</span>
              <span style={{ color: '#f87171', fontSize: 12 }}>0 / {player.maxHp}</span>
            </div>
            <div style={{ width: '100%', height: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 5 }}>
              <div style={{ width: '0%', height: '100%', background: '#ef4444', borderRadius: 5 }} />
            </div>
          </div>

          {/* Continue button */}
          <button
            onClick={() => {
              endBattle(false)
              resetPlayerStats()
              navigate('/town')
            }}
            style={{
              marginTop: 8, padding: '14px 48px',
              background: 'linear-gradient(to bottom, #dc2626, #991b1b)',
              border: '3px solid #ef4444', borderRadius: 12,
              color: 'white', fontWeight: 'bold', fontSize: 18,
              cursor: 'pointer', fontFamily: 'Georgia,serif',
              boxShadow: '0 0 20px rgba(239,68,68,0.5), 0 4px 0 #7f1d1d',
              transition: 'transform 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Continue...
          </button>
          <div style={{ color: '#6b7280', fontSize: 12 }}>
            Your HP will be fully restored.
          </div>
        </div>
      </div>
    )
  }

  // Show victory screen
  if (showVictory) {
    console.log('🏆 Victory screen should show', { showVictory, battleRewards })
    // Wait for battle rewards to be calculated
    if (!battleRewards) {
      console.log('⏳ Waiting for battle rewards...')
      return (
        <div
          className="w-full h-screen relative overflow-hidden flex items-center justify-center"
          style={{ background: battleSource === 'statTrainer' ? 'linear-gradient(180deg,#e0f2fe,#fefce8)' : 'linear-gradient(180deg,#581c87,#312e81,#000)' }}
        >
          <div className="text-white text-2xl">Loading rewards...</div>
        </div>
      )
    }
    const isHeavenVictory = battleSource === 'statTrainer'
    console.log('✅ Showing victory screen with rewards:', battleRewards)
    return (
      <div
        className="w-full h-screen relative overflow-hidden flex items-center justify-center"
        style={{ background: isHeavenVictory ? 'linear-gradient(180deg,#e0f2fe 0%,#fef9ee 50%,#fffbeb 100%)' : 'linear-gradient(180deg,#581c87,#312e81,#000)' }}
      >
        {/* Victory Background Effects */}
        <div className="absolute inset-0">
          {isHeavenVictory ? (
            <>
              {[15, 35, 55, 72, 88].map((l, i) => (
                <div key={i} style={{
                  position:'absolute', top:0, left:`${l}%`, width:70, height:'100%',
                  background:'linear-gradient(180deg,rgba(255,255,255,0.55) 0%,transparent 100%)',
                  transform:`rotate(${(i-2)*5}deg)`, transformOrigin:'top center', filter:'blur(20px)',
                }} />
              ))}
              <div style={{
                position:'absolute', top:-60, left:'50%', transform:'translateX(-50%)',
                width:600, height:300, borderRadius:'50%',
                background:'radial-gradient(ellipse,rgba(253,224,71,0.45) 0%,transparent 70%)',
                filter:'blur(24px)',
              }} />
            </>
          ) : (
            <>
              <div className="absolute top-20 left-20 w-64 h-64 bg-yellow-400 rounded-full opacity-20 blur-3xl animate-pulse"></div>
              <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full opacity-20 blur-3xl animate-pulse delay-1000"></div>
            </>
          )}
        </div>

        {/* Victory Banner */}
        <div className="relative z-10 animate-fade-in">
          {/* Victory Text */}
          <div className="text-center mb-8">
            <h1 className="text-8xl font-bold mb-4" style={{
              background: isHeavenVictory
                ? 'linear-gradient(to bottom, #fbbf24, #f59e0b, #d97706)'
                : 'linear-gradient(to bottom, #60a5fa, #a78bfa, #f472b6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(147, 51, 234, 0.5)',
              fontFamily: 'Georgia, serif'
            }}>
              VICTORY!
            </h1>
          </div>

          {/* Battle Rewards Scroll */}
          <div
            className="rounded-2xl shadow-2xl p-8 min-w-96 max-w-lg relative border-4"
            style={isHeavenVictory
              ? { background: 'rgba(255,255,255,0.88)', borderColor: '#fbbf24', boxShadow: '0 8px 40px rgba(251,191,36,0.4)', backdropFilter: 'blur(8px)' }
              : { background: 'linear-gradient(135deg,#fef3c7,#fffbeb)', borderColor: '#92400e' }
            }
          >
            {/* Scroll decorative top */}
            <div
              className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-24 h-8 rounded-full border-4"
              style={isHeavenVictory
                ? { background: '#fbbf24', borderColor: '#d97706', boxShadow: '0 0 12px rgba(251,191,36,0.7)' }
                : { background: '#b45309', borderColor: '#92400e' }
              }
            />

            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold mb-6" style={{
                fontFamily: 'Georgia, serif',
                color: isHeavenVictory ? '#78350f' : '#78350f',
                textShadow: isHeavenVictory ? '0 0 12px rgba(251,191,36,0.6)' : '2px 2px 4px rgba(0,0,0,0.3)',
              }}>
                {isHeavenVictory ? '✨ Divine Training ✨' : 'Battle Rewards'}
              </h2>
              
              {/* Stat Trainer special rewards */}
              {battleRewards.statTrainer ? (
                <div className="bg-gradient-to-r from-purple-100 to-violet-100 rounded-lg p-4 border-4 border-purple-500 animate-pulse">
                  <div className="text-purple-900 font-bold text-lg mb-1">✨ Training Complete! ✨</div>
                  <div className="text-2xl font-bold text-purple-700">
                    {battleRewards.pointsUnlocked > 0
                      ? `${battleRewards.pointsUnlocked} Attribute Point${battleRewards.pointsUnlocked !== 1 ? 's' : ''} Unlocked!`
                      : 'The Trainer has yielded!'}
                  </div>
                  {battleRewards.pointsUnlocked > 0 && (
                    <div className="text-purple-600 text-sm mt-1">Return to the Trainer to allocate your points.</div>
                  )}
                </div>
              ) : (
                <>
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
                      <div className="text-green-600 text-sm mt-1">⚡ Visit the Trainer at the Portal and prove yourself to unlock 10 Attribute Points!</div>
                    </div>
                  )}
                </>
              )}

              {/* Castle: Next Battle + Return | StatTrainer: Return to Trainer | Town: Next */}
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
              ) : battleSource === 'statTrainer' ? (
                <button
                  onClick={handleVictoryContinue}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white font-bold py-4 px-8 rounded-lg border-4 border-purple-800 shadow-lg transform transition hover:scale-105 active:scale-95 text-xl"
                >
                  ✨ Return to Trainer
                </button>
              ) : battleSource === 'reignQuest' ? (
                <div className="flex flex-col gap-3 mt-6">
                  {battleFloor === 6 ? (
                    <button
                      onClick={() => { clearBattleRewards(); setShowVictory(false); navigate('/reign-shop') }}
                      className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-bold py-4 px-8 rounded-lg border-4 border-yellow-700 shadow-lg transform transition hover:scale-105 active:scale-95 text-xl"
                    >
                      👑 Open Reign Armoury!
                    </button>
                  ) : (
                    <button
                      onClick={handleVictoryContinue}
                      className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-3 px-8 rounded-lg border-4 border-amber-800 shadow-lg transform transition hover:scale-105 active:scale-95"
                    >
                      ⚔️ Continue Quest
                    </button>
                  )}
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

  const spells = ALL_SPELLS.filter(s => (player.purchasedSpells || []).includes(s.id))

  const isHeavenlyBattle = battleSource === 'statTrainer'

  return (
    <div
      className="w-full h-screen relative overflow-hidden"
      style={{
        background: isHeavenlyBattle
          ? 'linear-gradient(180deg, #e0f2fe 0%, #f0f9ff 35%, #fef9ee 70%, #fffbeb 100%)'
          : undefined,
        pointerEvents: 'auto',
      }}
    >
      {/* ── Guardian Dragon Strike Overlay ─────────────────────── */}
      {dragonStrike && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 9999,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
          animation: 'fadeInOut 1.8s ease forwards',
        }}>
          {/* Dark flash */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at center, rgba(30,10,60,0.85) 0%, rgba(0,0,0,0.5) 100%)',
          }} />
          {/* Dragon swooping in */}
          <div style={{
            position: 'relative', zIndex: 1, textAlign: 'center',
            animation: 'dragonSwoop 1.8s ease forwards',
          }}>
            <div style={{ fontSize: 90, lineHeight: 1, filter: 'drop-shadow(0 0 24px gold)' }}>🐉</div>
            <div style={{
              marginTop: 12,
              fontSize: 22,
              fontWeight: 'bold',
              color: '#ffd700',
              fontFamily: 'Georgia,serif',
              textShadow: '0 0 16px #ffd700, 0 2px 4px rgba(0,0,0,0.9)',
            }}>
              GUARDIAN DRAGON!
            </div>
            <div style={{
              marginTop: 8,
              fontSize: 32,
              fontWeight: 'bold',
              color: '#fff',
              textShadow: `0 0 20px ${dragonStrike.icon === '🔥' ? '#ef4444' : dragonStrike.icon === '❄️' ? '#60a5fa' : '#ffd700'}, 0 2px 4px rgba(0,0,0,0.9)`,
            }}>
              {dragonStrike.icon} -{dragonStrike.damage}
            </div>
          </div>
        </div>
      )}

      {isHeavenlyBattle ? (
        /* ——— Heavenly battle background ——— */
        <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
          {/* Divine light rays */}
          {[12, 30, 50, 68, 86].map((left, i) => (
            <div key={i} style={{
              position: 'absolute', top: 0, left: `${left}%`,
              width: 80, height: '80%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)',
              transform: `rotate(${(i - 2) * 5}deg)`,
              transformOrigin: 'top center',
              filter: 'blur(22px)',
            }} />
          ))}
          {/* Golden halo at top */}
          <div style={{
            position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
            width: 700, height: 320, borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(253,224,71,0.4) 0%, rgba(250,204,21,0.2) 50%, transparent 75%)',
            filter: 'blur(24px)',
          }} />
          {/* Fluffy heavenly clouds */}
          {[
            { top: '8%', left: '5%', w: 160, h: 60 },
            { top: '14%', left: '20%', w: 220, h: 70 },
            { top: '6%', right: '8%', w: 180, h: 65 },
            { top: '20%', right: '25%', w: 140, h: 50 },
          ].map((c, i) => (
            <div key={i} style={{
              position: 'absolute', ...c,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.85)',
              filter: 'blur(8px)',
              boxShadow: '0 4px 20px rgba(255,255,255,0.6)',
            }} />
          ))}
          {/* Floating golden sparkles */}
          {[8, 22, 40, 57, 73, 90].map((left, i) => (
            <div key={`sp${i}`} style={{
              position: 'absolute',
              top: `${10 + (i * 14) % 55}%`,
              left: `${left}%`,
              width: 7, height: 7,
              borderRadius: '50%',
              background: '#fde68a',
              boxShadow: '0 0 10px 4px rgba(253,224,71,0.8)',
              animation: `portal-pulse ${1.4 + i * 0.35}s ease-in-out infinite`,
            }} />
          ))}
          {/* Heavenly marble floor glow */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 160,
            background: 'linear-gradient(180deg, transparent, rgba(255,251,235,0.8) 60%, rgba(253,230,138,0.4) 100%)',
          }} />
          {/* Marble floor columns (decorative) */}
          {[10, 85].map((left, i) => (
            <div key={`col${i}`} style={{
              position: 'absolute', bottom: 0, left: `${left}%`,
              width: 28, height: 180,
              background: 'linear-gradient(90deg, rgba(255,255,255,0.9), rgba(253,224,71,0.3), rgba(255,255,255,0.9))',
              borderRadius: '4px 4px 0 0',
              border: '1px solid rgba(253,224,71,0.5)',
              boxShadow: '0 0 16px rgba(253,224,71,0.3)',
            }} />
          ))}
        </div>
      ) : (
        /* ——— Normal battle background ——— */
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-blue-400 to-blue-300">
            <div className="absolute top-10 left-20 w-32 h-16 bg-white opacity-60 rounded-full blur-sm"></div>
            <div className="absolute top-20 right-32 w-40 h-20 bg-white opacity-60 rounded-full blur-sm"></div>
          </div>
          <div className="absolute bottom-0 w-full h-40 bg-gradient-to-b from-green-400 to-green-500">
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-amber-700 to-amber-800 opacity-60"></div>
          </div>
          <div className="absolute bottom-40 right-10">
            <div className="w-16 h-32 bg-green-700 border-2 border-green-800 rounded-t-full"></div>
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-green-600 rounded-full border-2 border-green-700"></div>
          </div>
        </>
      )}

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
                          <span className="text-purple-700 font-bold">{player.xp || 0} / {920 + player.level * 80} XP</span>
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
                        {[
                          { label: 'STR', base: Math.floor(player.level * 10) + 50, bonus: (player.bonusStats?.strength  || 0), color: 'text-red-700'    },
                          { label: 'DEX', base: Math.floor(player.level * 7)  + 35, bonus: (player.bonusStats?.dexterity || 0), color: 'text-purple-700' },
                          { label: 'INT', base: Math.floor(player.level * 8)  + 40, bonus: (player.bonusStats?.intellect || 0), color: 'text-blue-700'   },
                          { label: 'END', base: Math.floor(player.level * 9)  + 45, bonus: (player.bonusStats?.endurance || 0), color: 'text-orange-700' },
                          { label: 'CHA', base: Math.floor(player.level * 6)  + 30, bonus: (player.bonusStats?.charisma  || 0), color: 'text-pink-700'   },
                          { label: 'LCK', base: Math.floor(player.level * 5)  + 25, bonus: (player.bonusStats?.luck      || 0), color: 'text-yellow-700' },
                        ].map(({ label, base, bonus, color }) => (
                          <div key={label} className="flex justify-between">
                            <span>{label}:</span>
                            <span className={`font-bold ${color}`}>{base + bonus}</span>
                          </div>
                        ))}
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
          {/* Enemy sprite — holy warrior for stat trainer, monster otherwise */}
          {isHeavenlyBattle ? (
            <div className="mb-4 flex flex-col items-center" style={{ position: 'relative' }}>
              {/* Halo */}
              <div style={{
                width: 64, height: 18, borderRadius: '50%',
                border: '5px solid #fbbf24',
                boxShadow: '0 0 16px rgba(251,191,36,0.9), inset 0 0 8px rgba(255,255,255,0.4)',
                marginBottom: -10, zIndex: 2, position: 'relative',
              }} />
              {/* Angel body */}
              <div style={{
                width: 96, height: 96, borderRadius: '50%', fontSize: 58,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'radial-gradient(circle, #fef3c7 0%, #fde68a 55%, #fbbf24 100%)',
                border: '4px solid #d97706',
                boxShadow: '0 0 32px rgba(251,191,36,0.7), 0 0 8px rgba(255,255,255,0.5)',
              }}>
                🧝‍♂️
              </div>
              {/* Wing flourishes */}
              <div style={{
                position: 'absolute', bottom: 4, left: -28,
                fontSize: 28, opacity: 0.85,
                transform: 'scaleX(-1) rotate(-15deg)',
                filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.8))',
              }}>🪶</div>
              <div style={{
                position: 'absolute', bottom: 4, right: -28,
                fontSize: 28, opacity: 0.85,
                transform: 'rotate(15deg)',
                filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.8))',
              }}>🪶</div>
              {/* Divine glow beneath */}
              <div style={{
                position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)',
                width: 80, height: 16, borderRadius: '50%',
                background: 'rgba(253,224,71,0.5)', filter: 'blur(6px)',
              }} />
            </div>
          ) : (
            <div className="text-8xl mb-4">{enemy.icon || '👹'}</div>
          )}
          <div
            className="border-4 rounded-lg px-4 py-2 shadow-2xl"
            style={isHeavenlyBattle
              ? { background: 'linear-gradient(135deg, rgba(255,255,255,0.85), rgba(255,251,235,0.9))', borderColor: '#fbbf24', backdropFilter: 'blur(4px)' }
              : { background: 'linear-gradient(135deg, #5b21b6, #4c1d95)', borderColor: '#7c3aed' }
            }
          >

            {/* Hoverable enemy name */}
            <div
              className="flex items-center gap-2 mb-2 cursor-pointer group"
              onMouseEnter={() => setShowEnemyTooltip(true)}
              onMouseLeave={() => setShowEnemyTooltip(false)}
            >
              <div
                className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-lg group-hover:scale-110 transition-transform"
                style={isHeavenlyBattle
                  ? { background: 'linear-gradient(135deg,#fde68a,#fbbf24)', borderColor: '#d97706' }
                  : { background: 'linear-gradient(135deg,#7c3aed,#a855f7)', borderColor: '#c084fc' }
                }
              >
                {isHeavenlyBattle ? '🧝‍♂️' : (enemy.icon || '👹')}
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
                  className="border-4 rounded-lg shadow-2xl p-5"
                  style={isHeavenlyBattle
                    ? { background: 'linear-gradient(135deg,rgba(255,255,255,0.95),rgba(255,251,235,0.95))', borderColor: '#fbbf24', pointerEvents: 'auto', backdropFilter: 'blur(6px)' }
                    : { background: 'linear-gradient(135deg,#f3e8ff,#ede9fe)', borderColor: '#6d28d9', pointerEvents: 'auto' }
                  }
                  onMouseEnter={() => setShowEnemyTooltip(true)}
                  onMouseLeave={() => setShowEnemyTooltip(false)}
                >
                  <div className="text-sm" style={{ color: isHeavenlyBattle ? '#78350f' : '#4c1d95' }}>
                    {/* Header */}
                    <div className="text-center mb-3 pb-2 border-b-2" style={{ borderColor: isHeavenlyBattle ? '#fbbf24' : '#7c3aed' }}>
                      <div className="text-3xl mb-1">{isHeavenlyBattle ? '🧝‍♂️' : (enemy.icon || '👹')}</div>
                      <span className="font-bold text-xl" style={{ color: isHeavenlyBattle ? '#78350f' : '#4c1d95' }}>{enemy.name}</span>
                      <div className="text-xs mt-1" style={{ color: isHeavenlyBattle ? '#b45309' : '#7c3aed' }}>
                        {isHeavenlyBattle ? '— Holy Guardian' : '— Monster Stats'}
                      </div>
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
                          <span className="font-bold">{Math.min(player.xp + (enemy.xpReward || 0), 920 + player.level * 80)} / {920 + player.level * 80}</span>
                        </div>
                        <div className="w-full bg-gray-300 h-3 rounded overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                            style={{ width: `${Math.min(100, ((player.xp + (enemy.xpReward || 0)) / (920 + player.level * 80)) * 100)}%` }}
                          />
                        </div>
                        {player.xp + (enemy.xpReward || 0) >= 920 + player.level * 80 && (
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
            {(() => {
              const pd = PET_DEFS[player.activePetId]
              const sc = getScaledPet(pd, player.level || 1)
              return (
                <div className={`text-xs font-semibold text-center ${pd.effect === 'heal' ? 'text-green-300' : 'text-red-300'}`}>
                  {pd.effect === 'heal'
                    ? `💚 +${sc.healAmount} HP/turn`
                    : `⚔️ ${sc.min}–${sc.max} dmg`}
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* Action Menu */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50">
        <div
          className="border-4 rounded-lg shadow-2xl p-6"
          style={isHeavenlyBattle
            ? { background: 'rgba(255,255,255,0.88)', borderColor: '#fbbf24', backdropFilter: 'blur(8px)', boxShadow: '0 8px 32px rgba(251,191,36,0.3)' }
            : { background: 'linear-gradient(135deg,#92400e,#78350f)', borderColor: '#d97706' }
          }
        >
          <div className="grid grid-cols-5 gap-2 mb-4">
            {[
              { key: 'attack', label: 'Attack' },
              { key: 'spells', label: 'Spells' },
              { key: 'items',  label: 'Items'  },
              { key: 'pets',   label: '🐾 Pets' },
              { key: 'equipment', label: 'Equip' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  if (key === 'attack') console.log('🎯 Attack tab clicked')
                  setSelectedAction(key)
                }}
                className="px-4 py-3 font-bold rounded-lg border-2 transition"
                style={selectedAction === key
                  ? { background: isHeavenlyBattle ? '#fbbf24' : '#dc2626', borderColor: isHeavenlyBattle ? '#d97706' : '#991b1b', color: isHeavenlyBattle ? '#78350f' : '#fff' }
                  : isHeavenlyBattle
                    ? { background: 'rgba(253,224,71,0.15)', borderColor: '#fde68a', color: '#92400e' }
                    : { background: '#78350f', borderColor: '#d97706', color: '#fde68a' }
                }
              >
                {label}
              </button>
            ))}
          </div>
          {/* Flee button below tabs */}
          <div className="mb-2">
            <button
              onClick={handleFlee}
              className="w-full px-4 py-2 font-bold rounded-lg border-2 transition text-sm"
              style={isHeavenlyBattle
                ? { background: 'rgba(253,224,71,0.15)', borderColor: '#fde68a', color: '#92400e' }
                : { background: '#78350f', borderColor: '#d97706', color: '#fde68a' }
              }
            >
              Flee
            </button>
          </div>

          {/* Spell Selection */}
          {selectedAction === 'spells' && (
            <div className="space-y-2">
              {spells.length === 0 ? (
                <div className="text-center py-4 px-2">
                  <div className="text-3xl mb-2">📚</div>
                  <div className="text-yellow-200 text-sm font-bold">No spells learned yet!</div>
                  <div className="text-yellow-400 text-xs mt-1 opacity-75">Visit the Intellect Building in town to purchase spells.</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {spells.map((spell) => {
                    const totalInt = Math.floor(player.level * 8) + 40 + (player.bonusStats?.intellect || 0)
                    const scaledValue = spell.type === 'attack'
                      ? (spell.damage || 50) + Math.floor(totalInt * 2.0)
                      : (spell.heal  || 50) + Math.floor(totalInt * 1.5)
                    const valueLabel = spell.type === 'attack' ? `${scaledValue} dmg` : `+${scaledValue} HP`
                    return (
                      <button
                        key={spell.name}
                        onClick={() => handleSpell(spell)}
                        disabled={!playerTurn || player.mp < spell.cost || animating}
                        className="px-3 py-2 bg-amber-900 border-2 border-amber-700 text-yellow-200 font-bold rounded hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex flex-col items-center gap-0.5"
                      >
                        <span>{spell.icon} {spell.name}</span>
                        <span className="text-xs font-normal opacity-80">{spell.cost} MP · {valueLabel}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Attack Button / Necromancer Panel */}
          {selectedAction === 'attack' && (() => {
            const hasObsidianCloak = player.equipped?.armor?.name === 'Obsidian Cloak'

            // ── Necromancer special moves panel (shown after clicking Attack) ──
            if (hasObsidianCloak && showNecroPanel) {
              const gridPos = (row, col) => ({ gridRow: row, gridColumn: col })
              return (
                <div style={{ pointerEvents: 'auto' }}>
                  {/* Header */}
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="text-2xl">💀</span>
                    <div className="text-center">
                      <div className="font-bold text-lg" style={{ color: '#dc2626', fontFamily: 'Georgia, serif', textShadow: '0 0 8px rgba(220,38,38,0.6)' }}>
                        Necromancer
                      </div>
                      <div className="text-xs" style={{ color: '#9ca3af' }}>Choose your move</div>
                    </div>
                    <span className="text-2xl">💀</span>
                  </div>

                  {/* 3-column grid of moves */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, minWidth: 300 }}>
                    {NECRO_MOVES.map(move => {
                      const canUse = playerTurn && !animating && player.mp >= move.mpCost
                      const isBig  = move.key === 'attack'
                      return (
                        <button
                          key={move.key}
                          onClick={() => handleNecroMove(move)}
                          disabled={!canUse}
                          style={{
                            ...gridPos(move.row, move.col),
                            background: isBig
                              ? 'linear-gradient(135deg,#b91c1c,#7f1d1d)'
                              : 'linear-gradient(135deg,#1c1c2e,#2d1b4e)',
                            border: `2px solid ${isBig ? '#ef4444' : '#6d28d9'}`,
                            borderRadius: 10,
                            padding: isBig ? '10px 6px' : '8px 4px',
                            color: '#fff',
                            cursor: canUse ? 'pointer' : 'not-allowed',
                            opacity: canUse ? 1 : 0.4,
                            boxShadow: canUse ? `0 0 8px ${isBig ? 'rgba(239,68,68,0.5)' : 'rgba(109,40,217,0.5)'}` : 'none',
                            transition: 'all 0.15s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2,
                          }}
                        >
                          <span style={{ fontSize: isBig ? 20 : 16 }}>{move.icon}</span>
                          <span style={{ fontSize: isBig ? 12 : 10, fontWeight: 'bold', textAlign: 'center', lineHeight: 1.2 }}>
                            {move.name}
                          </span>
                          <span style={{ fontSize: 9, color: move.mpCost === 0 ? '#86efac' : '#c4b5fd' }}>
                            {move.mpCost === 0 ? 'Free' : `${move.mpCost} MP`}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Back + MP indicator */}
                  <div className="flex items-center justify-between mt-2">
                    <button
                      onClick={() => setShowNecroPanel(false)}
                      style={{ fontSize: 11, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      ← Back
                    </button>
                    <span className="text-xs" style={{ color: '#9ca3af' }}>
                      MP: <span style={{ color: '#818cf8', fontWeight: 'bold' }}>{player.mp}</span> / {player.maxMp}
                    </span>
                  </div>
                </div>
              )
            }

            // ── Attack button (opens Necromancer panel if cloak equipped, otherwise normal attack) ──
            return (
              <button
                onClick={(e) => {
                  e.preventDefault(); e.stopPropagation()
                  if (hasObsidianCloak) {
                    if (!playerTurn || animating) return
                    const isGB = player.equipped?.weapon?.name === 'Guardian Blade'
                    if (isGB && Math.random() < 0.25) {
                      // Dragon replaces the attack — skip the Necro panel entirely
                      setAnimating(true)
                      const EICONS = { fire:'🔥', water:'💧', wind:'🌪️', ice:'❄️', earth:'🌍', energy:'⚡', light:'✨', darkness:'🌑', physical:'⚔️' }
                      const [weakEl] = Object.entries(enemy.elementResistances || {}).sort(([,a],[,b]) => b - a)[0] || ['physical', 100]
                      const weakIcon = EICONS[weakEl] || '⚔️'
                      const dragonBase = 1000 + Math.floor(Math.random() * 500)
                      const { finalDamage: dDmg, label: dLbl } = applyResistance(dragonBase, weakEl)
                      setTimeout(() => {
                        damageEnemy(dDmg)
                        addLog(`🐉 GUARDIAN DRAGON swoops in and strikes ${enemy.name} for ${dDmg} ${weakIcon} ${weakEl.charAt(0).toUpperCase()+weakEl.slice(1)} damage! (their weakness!)${dLbl}`)
                        setDragonStrike({ element: weakEl, icon: weakIcon, damage: dDmg })
                        setTimeout(() => setDragonStrike(null), 1800)
                      }, 400)
                      triggerPetEffect()
                      setTimeout(() => { setAnimating(false); setPlayerTurn(false) }, 600)
                    } else {
                      setShowNecroPanel(true)
                    }
                  } else {
                    handleAttack()
                  }
                }}
                disabled={!playerTurn || animating}
                style={isHeavenlyBattle
                  ? { pointerEvents: 'auto', zIndex: 1000, background: 'linear-gradient(135deg,#fbbf24,#d97706)', borderColor: '#b45309', color: '#fff', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.3)', boxShadow: '0 4px 16px rgba(251,191,36,0.5)' }
                  : hasObsidianCloak
                    ? { pointerEvents: 'auto', zIndex: 1000, background: 'linear-gradient(135deg,#7f1d1d,#1c1c2e)', borderColor: '#ef4444', color: '#fff', boxShadow: '0 0 12px rgba(220,38,38,0.4)' }
                    : { pointerEvents: 'auto', zIndex: 1000 }
                }
                className={isHeavenlyBattle
                  ? 'w-full font-bold py-4 px-6 rounded-lg border-2 shadow-lg transform transition hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                  : 'w-full font-bold py-4 px-6 rounded-lg border-2 shadow-lg transform transition hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white'
                }
              >
                {hasObsidianCloak ? '💀 Attack' : `Attack! ${!playerTurn ? '(Not your turn)' : animating ? '(Animating)' : ''}`}
              </button>
            )
          })()}

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
                            {(() => {
                              const sc = getScaledPet(petDef, player.level || 1)
                              return petDef.effect === 'heal'
                                ? `💚 Heals ${sc.healAmount} HP per turn`
                                : `⚔️ Deals ${sc.min}–${sc.max} dmg per turn`
                            })()}
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
            <div className="space-y-3 overflow-y-auto" style={{ maxHeight: 320 }}>
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
                <div className="space-y-2">
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
          navigate(sourceNav)
        }}
        style={{ pointerEvents: 'auto', zIndex: 1000 }}
        className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded border-2 border-red-800 z-50"
      >
        {battleSource === 'castle' ? 'Back to Castle' : battleSource === 'statTrainer' ? 'Back to Trainer' : 'Back to Town'}
      </button>

      {/* Castle floor indicator */}
      {battleSource === 'castle' && battleFloor && (
        <div style={{
          position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, pointerEvents: 'none',
          background: battleFloor === 11
            ? 'linear-gradient(135deg,rgba(127,29,29,0.9),rgba(69,10,10,0.9))'
            : 'rgba(0,0,0,0.6)',
          border: `2px solid ${battleFloor === 11 ? '#7f1d1d' : '#b45309'}`,
          borderRadius: 8,
          padding: '4px 14px',
          color: battleFloor === 11 ? '#fca5a5' : '#fcd34d',
          fontFamily: 'Georgia,serif',
          fontWeight: 'bold',
          fontSize: 13,
          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
          whiteSpace: 'nowrap',
        }}>
          {battleFloor === 11
            ? '👾 CARNAX — Legendary Boss'
            : `🏰 Castle — Floor ${battleFloor} / 10`}
        </div>
      )}
    </div>
  )
}

export default BattleScreen

