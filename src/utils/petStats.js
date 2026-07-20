// Pet damage/heal amounts scale with the player's Level.
// Attack pets gain +4 min / +6 max damage per Level; heal pets gain +2 HP per Level.
export const PET_LEVEL_SCALING = {
  attackMin: 4,
  attackMax: 6,
  heal: 2,
}

export const getScaledPetStats = (petDef, level = 1) => {
  if (!petDef) return {}
  const lv = level || 1
  if (petDef.effect === 'heal') {
    return { healAmount: petDef.effectAmount + lv * PET_LEVEL_SCALING.heal }
  }
  return {
    min: petDef.effectMin + lv * PET_LEVEL_SCALING.attackMin,
    max: petDef.effectMax + lv * PET_LEVEL_SCALING.attackMax,
  }
}

// Human-readable label describing a pet's current damage/heal amount at a given
// Level, plus a note on the stat (Level) that scales it.
export const getPetEffectLabel = (petDef, level = 1) => {
  if (!petDef) return ''
  const scaled = getScaledPetStats(petDef, level)
  if (petDef.effect === 'heal') {
    return `Heals you for ${scaled.healAmount} HP per turn at your current Level (scales with Level, +${PET_LEVEL_SCALING.heal} HP/level)`
  }
  return `Deals ${scaled.min}–${scaled.max} damage per turn at your current Level (scales with Level, +${PET_LEVEL_SCALING.attackMin}–${PET_LEVEL_SCALING.attackMax} per level)`
}
