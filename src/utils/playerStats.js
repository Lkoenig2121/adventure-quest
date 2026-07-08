export const STAT_KEYS = ['strength', 'dexterity', 'intellect', 'endurance', 'charisma', 'luck']

const STAT_BASE_FORMULAS = {
  strength:  (level) => Math.floor(level * 10) + 50,
  dexterity: (level) => Math.floor(level * 7)  + 35,
  intellect: (level) => Math.floor(level * 8)  + 40,
  endurance: (level) => Math.floor(level * 9)  + 45,
  charisma:  (level) => Math.floor(level * 6)  + 30,
  luck:      (level) => Math.floor(level * 5)  + 25,
}

export const DEFAULT_BONUS_STATS = {
  strength: 0,
  dexterity: 0,
  intellect: 0,
  endurance: 0,
  charisma: 0,
  luck: 0,
}

export const getBaseStat = (stat, level = 1) => {
  const formula = STAT_BASE_FORMULAS[stat]
  return formula ? formula(level) : 0
}

export const getBonusStat = (bonusStats, stat) => bonusStats?.[stat] || 0

export const getTotalStat = (stat, level, bonusStats) =>
  getBaseStat(stat, level) + getBonusStat(bonusStats, stat)

export const getPlayerStats = (player) => {
  const level = player?.level || 1
  const bonusStats = player?.bonusStats || DEFAULT_BONUS_STATS
  return Object.fromEntries(
    STAT_KEYS.map((stat) => [stat, getTotalStat(stat, level, bonusStats)])
  )
}

export const getCombatDefense = (level, bonusStats = {}) => ({
  melee:  Math.floor(level * 2) + 30 + (bonusStats.endurance || 0),
  ranged: Math.floor(level * 1.8) + 25 + (bonusStats.dexterity || 0),
  magic:  Math.floor(level * 1.8) + 25 + (bonusStats.intellect || 0),
})

export const ATTRIBUTE_ROWS = [
  { key: 'strength',  label: 'Strength', short: 'STR', color: 'text-red-700'    },
  { key: 'dexterity', label: 'Dexterity', short: 'DEX', color: 'text-purple-700' },
  { key: 'intellect', label: 'Intellect', short: 'INT', color: 'text-blue-700'   },
  { key: 'endurance', label: 'Endurance', short: 'END', color: 'text-orange-700' },
  { key: 'charisma',  label: 'Charisma',  short: 'CHA', color: 'text-pink-700'   },
  { key: 'luck',      label: 'Luck',      short: 'LCK', color: 'text-yellow-700' },
]
