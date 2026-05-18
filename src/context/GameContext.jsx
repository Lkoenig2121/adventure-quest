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
      return parsed
    }

    return {
      name: 'Yankees12100',
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
      const xpGain = enemy.xpReward || 100
      const goldGain = enemy.goldReward || 50
      
      setPlayer(prev => {
        const newXp = prev.xp + xpGain
        const newGold = prev.gold + goldGain
        
        // Level up check
        const xpForNextLevel = prev.level * 1000
        const willLevelUp = newXp >= xpForNextLevel
        const newLevel = willLevelUp ? prev.level + 1 : prev.level
        
        // Store battle rewards for display
        setBattleRewards({
          xp: xpGain,
          gold: goldGain,
          leveledUp: willLevelUp,
          newLevel: newLevel,
        })
        
        if (willLevelUp) {
          return {
            ...prev,
            xp: newXp,
            gold: newGold,
            level: newLevel,
            maxHp: prev.maxHp + 50,
            hp: prev.maxHp + 50,
            maxMp: prev.maxMp + 30,
            mp: prev.maxMp + 30,
            healthPotions: (prev.healthPotions || 0) + 1,
            manaPotions: (prev.manaPotions || 0) + 1,
          }
        }
        
        return {
          ...prev,
          xp: newXp,
          gold: newGold,
          healthPotions: (prev.healthPotions || 0) + 1,
          manaPotions: (prev.manaPotions || 0) + 1,
        }
      })
    } else {
      setBattleRewards(null)
    }
    setEnemy(null)
    setInBattle(false)
  }, [enemy])

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
        // Add equipment to inventory
        const inventory = prev.inventory || []
        updates.inventory = [...inventory, { ...itemData, id: Date.now() + Math.random() }]
      }

      return { ...prev, ...updates }
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
    equipItem,
    unequipItem,
    getElementModifiers,
    purchasePet,
    setActivePet,
  }), [player, enemy, inBattle, battleRewards, battleSource, battleFloor, updatePlayer, startBattle, endBattle, damagePlayer, damageEnemy, healPlayer, useMana, resetPlayerStats, fullHeal, clearBattleRewards, useHealthPotion, useManaPotion, purchaseItem, equipItem, unequipItem, getElementModifiers, purchasePet, setActivePet])

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
}

