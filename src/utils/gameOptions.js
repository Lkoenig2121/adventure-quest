import { useState } from 'react'

// Shared across every screen that can toggle game options (Item Shop, Town, etc.)
// so they all read/write the exact same persisted settings.
export const DEFAULT_GAME_OPTIONS = {
  showDamageNumbers: true,
  fastBattleMode: false,
  showElementTips: true,
  confirmPurchases: false,
  showStatChanges: true,
}

export const OPTIONS_LIST = [
  { key: 'showDamageNumbers', label: 'Show Damage Numbers', desc: 'Display damage values during battle' },
  { key: 'fastBattleMode',    label: 'Fast Battle Mode',     desc: 'Skip battle animations for quicker fights' },
  { key: 'showElementTips',   label: 'Show Element Tips',    desc: 'Hint which elements are strong/weak' },
  { key: 'confirmPurchases',  label: 'Confirm Purchases',    desc: 'Ask before spending gold in the shop' },
  { key: 'showStatChanges',   label: 'Show Stat Changes',    desc: 'Highlight stat changes after level-up' },
]

const loadGameOptions = () => {
  try {
    return { ...DEFAULT_GAME_OPTIONS, ...JSON.parse(localStorage.getItem('gameOptions') || '{}') }
  } catch {
    return { ...DEFAULT_GAME_OPTIONS }
  }
}

export function useGameOptions() {
  const [gameOptions, setGameOptions] = useState(loadGameOptions)

  const toggleOption = (key) => {
    setGameOptions(prev => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem('gameOptions', JSON.stringify(next))
      return next
    })
  }

  return { gameOptions, toggleOption }
}
