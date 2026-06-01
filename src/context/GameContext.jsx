import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

const GameContext = createContext()

// Guardian starter equipment — equipped by default for all players
const GUARDIAN_BLADE = {
  id: 'guardianBlade',
  name: 'Guardian Blade',
  slot: 'weapon',
  icon: '🗡️',
  elementBonuses: { light: 12, energy: 8, fire: 5 },
}
const GUARDIAN_PLATE = {
  id: 'guardianPlate',
  name: 'Guardian Plate',
  slot: 'armor',
  icon: '🛡️',
  elementBonuses: { fire: 10, ice: 10, light: 8 },
}
const GUARDIAN_HELM = {
  id: 'guardianHelm',
  name: 'Guardian Helm',
  slot: 'helmet',
  icon: '🪖',
  elementBonuses: { wind: 8, energy: 7, light: 5 },
}
const GUARDIAN_GREAVES = {
  id: 'guardianGreaves',
  name: 'Guardian Greaves',
  slot: 'boots',
  icon: '👢',
  elementBonuses: { earth: 6, light: 5, water: 4 },
}

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}

export const GameProvider = ({ children }) => {
  const [player, setPlayer] = useState(() => {
    const defaultEquipped = {
      weapon: GUARDIAN_BLADE,
      helmet: GUARDIAN_HELM,
      armor: GUARDIAN_PLATE,
      boots: GUARDIAN_GREAVES,
    }

    const saved = localStorage.getItem('playerData')
    if (saved) {
      const parsed = JSON.parse(saved)
      // Migrate: if weapon slot is empty, give the full Guardian set
      if (!parsed.equipped?.weapon) {
        return {
          ...parsed,
          equipped: {
            weapon:  parsed.equipped?.weapon  || GUARDIAN_BLADE,
            helmet:  parsed.equipped?.helmet  || GUARDIAN_HELM,
            armor:   parsed.equipped?.armor   || GUARDIAN_PLATE,
            boots:   parsed.equipped?.boots   || GUARDIAN_GREAVES,
          },
        }
      }
      // Always sync the name to whatever username was last used to log in
      return { ...parsed, name: localStorage.getItem('username') || parsed.name || 'Hero' }
    }

    return {
      name: localStorage.getItem('username') || 'Hero',
      level: 1,
      hp: 193,
      maxHp: 193,
      mp: 192,
      maxMp: 192,
      sp: 322,
      maxSp: 322,
      xp: 0,
      gold: 100,
      healthPotions: 5,
      manaPotions: 5,
      inventory: [],
      equipped: defaultEquipped,
      pets: [],
      activePetId: null,
      pendingStatPoints: 0,
      spendableStatPoints: 0,
      bonusStats: { strength: 0, dexterity: 0, intellect: 0, endurance: 0, charisma: 0, luck: 0 },
      purchasedSpells: [],
      castleProgress: 0,  // highest floor beaten (0 = none yet, floor 1 available)
    }
  })

  const [enemy, setEnemy] = useState(null)
  const [inBattle, setInBattle] = useState(false)
  const [battleRewards, setBattleRewards] = useState(null)
  const [battleSource, setBattleSource] = useState('town') // 'town' or 'castle'
  const [battleFloor, setBattleFloor] = useState(null) // castle floor number, null for town

  // Debug: Log enemy state changes
  useEffect(() => {
    if (enemy) {
      console.log('🎯 Enemy state changed in context:', enemy.hp, enemy)
    } else {
      console.log('🎯 Enemy state is null in context')
    }
  }, [enemy])

  useEffect(() => {
    localStorage.setItem('playerData', JSON.stringify(player))
  }, [player])

  const updatePlayer = useCallback((updates) => {
    setPlayer(prev => ({ ...prev, ...updates }))
  }, [])

  const startBattle = useCallback((enemyData, source = 'town', floor = null) => {
    setEnemy(enemyData)
    setInBattle(true)
    setBattleSource(source)
    setBattleFloor(floor)
  }, [])

  const endBattle = useCallback((victory) => {
    if (victory && enemy) {
      // Stat Trainer battle: convert pending points to spendable, no XP/gold
      if (battleSource === 'statTrainer') {
        setPlayer(prev => {
          const pending = prev.pendingStatPoints || 0
          setBattleRewards({ statTrainer: true, pointsUnlocked: pending, leveledUp: false, xp: 0, gold: 0, newLevel: null })
          return {
            ...prev,
            spendableStatPoints: (prev.spendableStatPoints || 0) + pending,
            pendingStatPoints: 0,
          }
        })
      } else {
        const xpGain = enemy.xpReward || 100
        const charismaBonus = Math.floor((player.bonusStats?.charisma || 0) * 5)
        const goldGain = (enemy.goldReward || 50) + charismaBonus

        setPlayer(prev => {
          const newXp = prev.xp + xpGain
          const newGold = prev.gold + goldGain

          // XP resets each level; requirement grows with level so fights-per-level increases
          const xpForNextLevel = 920 + prev.level * 80
          const willLevelUp = newXp >= xpForNextLevel
          const newLevel = willLevelUp ? prev.level + 1 : prev.level

          // Track castle progress (defined before both branches)
          const castleUpdate = (battleSource === 'castle' && battleFloor)
            ? { castleProgress: Math.max(prev.castleProgress || 0, battleFloor) }
            : {}

          setBattleRewards({
            xp: xpGain,
            gold: goldGain,
            leveledUp: willLevelUp,
            newLevel: newLevel,
          })

          if (willLevelUp) {
            return {
              ...prev,
              xp: 0,   // reset XP each level
              gold: newGold,
              level: newLevel,
              maxHp: prev.maxHp + 50,
              hp: prev.maxHp + 50,
              maxMp: prev.maxMp + 30,
              mp: prev.maxMp + 30,
              healthPotions: (prev.healthPotions || 0) + 1,
              manaPotions: (prev.manaPotions || 0) + 1,
              pendingStatPoints: (prev.pendingStatPoints || 0) + 10,
              ...castleUpdate,
            }
          }

          return {
            ...prev,
            xp: newXp,
            gold: newGold,
            ...castleUpdate,
            healthPotions: (prev.healthPotions || 0) + 1,
            manaPotions: (prev.manaPotions || 0) + 1,
          }
        })
      }
    } else {
      setBattleRewards(null)
    }
    setEnemy(null)
    setInBattle(false)
  }, [enemy, battleSource, player.bonusStats])

  const damagePlayer = useCallback((amount) => {
    setPlayer(prev => ({
      ...prev,
      hp: Math.max(0, prev.hp - amount)
    }))
  }, [])

  const damageEnemy = useCallback((amount) => {
    setEnemy(prev => {
      if (!prev) {
        console.log('Damage Enemy: No enemy!')
        return null
      }
      const currentHp = prev.hp
      const newHp = Math.max(0, currentHp - amount)
      console.log('💥 Damage Enemy:', { 
        currentHp, 
        damage: amount, 
        newHp 
      })
      
      return {
        ...prev,
        hp: newHp
      }
    })
  }, [])

  const healPlayer = useCallback((amount) => {
    setPlayer(prev => ({
      ...prev,
      hp: Math.min(prev.maxHp, prev.hp + amount)
    }))
  }, [])

  const useMana = useCallback((amount) => {
    setPlayer(prev => ({
      ...prev,
      mp: Math.max(0, prev.mp - amount)
    }))
  }, [])

  const resetPlayerStats = useCallback(() => {
    setPlayer(prev => ({
      ...prev,
      hp: prev.maxHp,
      mp: prev.maxMp,
    }))
  }, [])

  const fullHeal = useCallback(() => {
    setPlayer(prev => ({
      ...prev,
      hp: prev.maxHp,
      mp: prev.maxMp,
      sp: prev.maxSp,
    }))
  }, [])

  const clearBattleRewards = useCallback(() => {
    setBattleRewards(null)
  }, [])

  const useHealthPotion = useCallback(() => {
    setPlayer(prev => {
      if (prev.healthPotions > 0) {
        const healAmount = Math.floor(prev.maxHp * 0.5) // Heal 50% of max HP
        return {
          ...prev,
          healthPotions: prev.healthPotions - 1,
          hp: Math.min(prev.maxHp, prev.hp + healAmount)
        }
      }
      return prev
    })
  }, [])

  const useManaPotion = useCallback(() => {
    setPlayer(prev => {
      if (prev.manaPotions > 0) {
        const restoreAmount = Math.floor(prev.maxMp * 0.5) // Restore 50% of max MP
        return {
          ...prev,
          manaPotions: prev.manaPotions - 1,
          mp: Math.min(prev.maxMp, prev.mp + restoreAmount)
        }
      }
      return prev
    })
  }, [])

  const purchaseItem = useCallback((itemType, price, itemData = null) => {
    setPlayer(prev => {
      if (prev.gold < price) {
        return prev // Don't update if not enough gold
      }

      let updates = {
        gold: prev.gold - price,
      }

      if (itemType === 'healthPotion') {
        updates.healthPotions = (prev.healthPotions || 0) + 1
      } else if (itemType === 'manaPotion') {
        updates.manaPotions = (prev.manaPotions || 0) + 1
      } else if (itemData) {
        // Prevent buying duplicates — check inventory and all equipped slots
        const inventory = prev.inventory || []
        const equipped  = prev.equipped  || {}
        const alreadyOwned =
          inventory.some(i => i.name === itemData.name) ||
          Object.values(equipped).some(e => e?.name === itemData.name)
        if (alreadyOwned) return prev
        updates.inventory = [...inventory, { ...itemData, price, id: Date.now() + Math.random() }]
      }

      return { ...prev, ...updates }
    })
  }, [])

  const sellItem = useCallback((itemId) => {
    setPlayer(prev => {
      const inventory = prev.inventory || []
      const equipped  = prev.equipped  || {}

      // Check inventory first
      const invItem = inventory.find(i => i.id === itemId)
      if (invItem) {
        const refund = Math.floor((invItem.price || 0) * 0.8)
        return {
          ...prev,
          gold: prev.gold + refund,
          inventory: inventory.filter(i => i.id !== itemId),
        }
      }

      // Check equipped slots
      const slot = Object.keys(equipped).find(k => equipped[k]?.id === itemId)
      if (slot) {
        const eqItem = equipped[slot]
        const refund = Math.floor((eqItem.price || 0) * 0.8)
        return {
          ...prev,
          gold: prev.gold + refund,
          equipped: { ...equipped, [slot]: null },
        }
      }

      return prev
    })
  }, [])

  const purchaseSpell = useCallback((spellId, price) => {
    setPlayer(prev => {
      if (prev.gold < price) return prev
      if ((prev.purchasedSpells || []).includes(spellId)) return prev
      return {
        ...prev,
        gold: prev.gold - price,
        purchasedSpells: [...(prev.purchasedSpells || []), spellId],
      }
    })
  }, [])

  const equipItem = useCallback((itemId, slot) => {
    setPlayer(prev => {
      const inventory = prev.inventory || []
      const item = inventory.find(i => i.id === itemId)
      if (!item) return prev

      const equipped = prev.equipped || { weapon: null, helmet: null, armor: null, boots: null }
      const currentEquipped = equipped[slot]

      // Remove item from inventory
      const newInventory = inventory.filter(i => i.id !== itemId)

      // If something was already equipped, add it back to inventory
      if (currentEquipped) {
        newInventory.push(currentEquipped)
      }

      // Equip the new item
      const newEquipped = {
        ...equipped,
        [slot]: item,
      }

      return {
        ...prev,
        inventory: newInventory,
        equipped: newEquipped,
      }
    })
  }, [])

  const unequipItem = useCallback((slot) => {
    setPlayer(prev => {
      const equipped = prev.equipped || { weapon: null, helmet: null, armor: null, boots: null }
      const item = equipped[slot]
      if (!item) return prev

      const inventory = prev.inventory || []
      const newEquipped = {
        ...equipped,
        [slot]: null,
      }

      return {
        ...prev,
        inventory: [...inventory, item],
        equipped: newEquipped,
      }
    })
  }, [])

  // Helper function to calculate Element Modifiers with equipment
  // In Adventure Quest, 100% = normal damage, lower = less damage
  // Stacking equipment for one element REDUCES that element's effectiveness
  const purchasePet = useCallback((petData, price) => {
    setPlayer(prev => {
      if (prev.gold < price) return prev
      const pets = prev.pets || []
      if (pets.find(p => p.id === petData.id)) return prev // already owned
      return {
        ...prev,
        gold: prev.gold - price,
        pets: [...pets, petData],
      }
    })
  }, [])

  const setActivePet = useCallback((petId) => {
    setPlayer(prev => ({
      ...prev,
      activePetId: petId,
    }))
  }, [])

  // Legacy single-point version (kept for compatibility)
  const allocateStatPoint = useCallback((stat) => {
    setPlayer(prev => {
      if ((prev.spendableStatPoints || 0) <= 0) return prev
      const bonusStats = prev.bonusStats || { strength: 0, dexterity: 0, intellect: 0, endurance: 0, charisma: 0, luck: 0 }
      const updates = {
        ...prev,
        spendableStatPoints: prev.spendableStatPoints - 1,
        bonusStats: { ...bonusStats, [stat]: (bonusStats[stat] || 0) + 1 },
      }
      if (stat === 'endurance') {
        updates.maxHp = prev.maxHp + 10
        updates.hp = Math.min(prev.hp + 10, prev.maxHp + 10)
      }
      return updates
    })
  }, [])

  // Bulk version — applies an entire { stat: count } map atomically
  const allocateStatPoints = useCallback((allocs) => {
    setPlayer(prev => {
      const totalCost = Object.values(allocs).reduce((s, v) => s + v, 0)
      if ((prev.spendableStatPoints || 0) < totalCost) return prev
      const bonusStats = { ...(prev.bonusStats || { strength: 0, dexterity: 0, intellect: 0, endurance: 0, charisma: 0, luck: 0 }) }
      let maxHpDelta = 0
      Object.entries(allocs).forEach(([stat, count]) => {
        if (count <= 0) return
        bonusStats[stat] = (bonusStats[stat] || 0) + count
        if (stat === 'endurance') maxHpDelta += count * 10
      })
      return {
        ...prev,
        spendableStatPoints: prev.spendableStatPoints - totalCost,
        bonusStats,
        ...(maxHpDelta > 0 ? {
          maxHp: prev.maxHp + maxHpDelta,
          hp: Math.min(prev.hp + maxHpDelta, prev.maxHp + maxHpDelta),
        } : {}),
      }
    })
  }, [])

  const getElementModifiers = useCallback(() => {
    const baseModifier = 100 // 100% = normal damage
    const equipped = player.equipped || { weapon: null, helmet: null, armor: null, boots: null }
    
    const modifiers = {
      fire: baseModifier,
      water: baseModifier,
      wind: baseModifier,
      ice: baseModifier,
      earth: baseModifier,
      energy: baseModifier,
      light: baseModifier,
    }

    // Only armor, helmet, and boots affect element modifiers — weapons do not
    const { weapon: _weapon, ...defenseSlots } = equipped
    Object.values(defenseSlots).forEach(item => {
      if (item && item.elementBonuses) {
        Object.keys(item.elementBonuses).forEach(element => {
          if (modifiers.hasOwnProperty(element)) {
            // Subtract the bonus to reduce effectiveness
            modifiers[element] = Math.max(0, (modifiers[element] || baseModifier) - item.elementBonuses[element])
          }
        })
      }
    })

    return modifiers
  }, [player.equipped])

  const value = useMemo(() => ({
    player,
    enemy,
    inBattle,
    battleRewards,
    battleSource,
    battleFloor,
    updatePlayer,
    startBattle,
    endBattle,
    damagePlayer,
    damageEnemy,
    healPlayer,
    useMana,
    resetPlayerStats,
    fullHeal,
    clearBattleRewards,
    useHealthPotion,
    useManaPotion,
    purchaseItem,
    sellItem,
    purchaseSpell,
    equipItem,
    unequipItem,
    getElementModifiers,
    purchasePet,
    setActivePet,
    allocateStatPoint,
    allocateStatPoints,
  }), [player, enemy, inBattle, battleRewards, battleSource, battleFloor, updatePlayer, startBattle, endBattle, damagePlayer, damageEnemy, healPlayer, useMana, resetPlayerStats, fullHeal, clearBattleRewards, useHealthPotion, useManaPotion, purchaseItem, sellItem, purchaseSpell, equipItem, unequipItem, getElementModifiers, purchasePet, setActivePet, allocateStatPoint, allocateStatPoints])

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
}

