import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

const GameContext = createContext()

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}

export const GameProvider = ({ children }) => {
  const [player, setPlayer] = useState(() => {
    const saved = localStorage.getItem('playerData')
    if (saved) {
      return JSON.parse(saved)
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
    }
  })

  const [enemy, setEnemy] = useState(null)
  const [inBattle, setInBattle] = useState(false)
  const [battleRewards, setBattleRewards] = useState(null)
  const [battleSource, setBattleSource] = useState('town') // 'town' or 'castle'

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

  const startBattle = useCallback((enemyData, source = 'town') => {
    setEnemy(enemyData)
    setInBattle(true)
    setBattleSource(source)
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

  const value = useMemo(() => ({
    player,
    enemy,
    inBattle,
    battleRewards,
    battleSource,
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
  }), [player, enemy, inBattle, battleRewards, battleSource, updatePlayer, startBattle, endBattle, damagePlayer, damageEnemy, healPlayer, useMana, resetPlayerStats, fullHeal, clearBattleRewards, useHealthPotion, useManaPotion])

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
}

