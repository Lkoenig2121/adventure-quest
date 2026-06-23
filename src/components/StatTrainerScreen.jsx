import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'

const makeTrainerEnemy = (playerLevel) => {
  const hp = 500 + playerLevel * 120
  const surrenderHp = Math.floor(hp * 0.30)
  return {
    name: 'Trainer',
    title: 'Guardian of Inner Light',
    hp,
    maxHp: hp,
    mp: 300 + playerLevel * 12,
    maxMp: 300 + playerLevel * 12,
    level: playerLevel + 10,
    surrenderHp,
    xpReward: 0,
    goldReward: 0,
    element: 'Light',
    elementIcon: '✨',
    elementResistances: {
      fire: 100,
      water: 100,
      wind: 100,
      ice: 100,
      earth: 100,
      energy: 100,
      light: 100,
      darkness: 100,
      physical: 100,
    },
    attack: 85,
    speed: 70,
    icon: '👼',
  }
}

const STAT_DEFS = [
  { key: 'strength',  label: 'Strength',  icon: '⚔️',  desc: 'Increases physical attack power',      color: 'from-red-700 to-red-600' },
  { key: 'dexterity', label: 'Dexterity', icon: '🏹',  desc: 'Improves speed and accuracy',           color: 'from-green-700 to-green-600' },
  { key: 'intellect', label: 'Intellect', icon: '📖',  desc: 'Boosts spell damage and MP',            color: 'from-blue-700 to-blue-600' },
  { key: 'endurance', label: 'Endurance', icon: '🛡️',  desc: 'Increases max HP and defense',          color: 'from-yellow-700 to-yellow-600' },
  { key: 'charisma',  label: 'Charisma',  icon: '✨',  desc: 'Earn more gold and improve shop prices', color: 'from-pink-700 to-pink-600' },
  { key: 'luck',      label: 'Luck',      icon: '🍀',  desc: 'Raises critical hit and loot chance',   color: 'from-teal-700 to-teal-600' },
]

export default function StatTrainerScreen() {
  const navigate = useNavigate()
  const { player, startBattle, allocateStatPoints } = useGame()

  const [pending, setPending] = useState({})

  const pendingStatPoints = player.pendingStatPoints || 0
  const spendableStatPoints = player.spendableStatPoints || 0
  const bonusStats = player.bonusStats || {}

  const pendingTotal = Object.values(pending).reduce((s, v) => s + v, 0)
  const remaining = spendableStatPoints - pendingTotal

  function handleFight() {
    if (pendingStatPoints <= 0 || spendableStatPoints > 0) return
    startBattle(makeTrainerEnemy(player.level), 'statTrainer')
    navigate('/battle')
  }

  function increment(key) {
    if (remaining <= 0) return
    setPending(p => ({ ...p, [key]: (p[key] || 0) + 1 }))
  }

  function decrement(key) {
    if (!pending[key]) return
    setPending(p => ({ ...p, [key]: Math.max(0, (p[key] || 0) - 1) }))
  }

  function confirmAllocation() {
    const allocs = Object.fromEntries(
      Object.entries(pending).filter(([, v]) => v > 0)
    )
    if (Object.keys(allocs).length === 0) return
    allocateStatPoints(allocs)
    setPending({})
  }

  const baseStatValue = (key) => {
    const base = {
      strength:  Math.floor(player.level * 10) + 50,
      dexterity: Math.floor(player.level * 8) + 35,
      intellect: Math.floor(player.level * 9) + 40,
      endurance: Math.floor(player.level * 10) + 45,
      charisma:  Math.floor(player.level * 7) + 30,
      luck:      Math.floor(player.level * 6) + 25,
    }
    return (base[key] || 0) + (bonusStats[key] || 0)
  }

  return (
    <div
      className="w-full h-screen flex flex-col items-center justify-start relative overflow-y-auto"
      style={{
        background: 'linear-gradient(180deg, #e0f2fe 0%, #f0f9ff 30%, #fefce8 65%, #fff7ed 100%)',
      }}
    >
      {/* Heavenly light rays */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {[15, 35, 55, 70, 85].map((left, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: 0,
            left: `${left}%`,
            width: 60,
            height: '70%',
            background: `linear-gradient(180deg, rgba(255,255,255,0.55) 0%, transparent 100%)`,
            transform: `rotate(${(i - 2) * 6}deg)`,
            transformOrigin: 'top center',
            filter: 'blur(18px)',
          }} />
        ))}
        {/* Golden halo glow at top */}
        <div style={{
          position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 300, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(253,224,71,0.35) 0%, rgba(250,204,21,0.15) 50%, transparent 75%)',
          filter: 'blur(20px)',
        }} />
        {/* Floating sparkle dots */}
        {[10,25,40,60,75,88].map((left, i) => (
          <div key={`s${i}`} style={{
            position: 'absolute',
            top: `${15 + (i * 12) % 50}%`,
            left: `${left}%`,
            width: 6, height: 6,
            borderRadius: '50%',
            background: '#fde68a',
            boxShadow: '0 0 8px 3px rgba(253,224,71,0.7)',
            animation: `portal-pulse ${1.5 + i * 0.4}s ease-in-out infinite`,
          }} />
        ))}
      </div>

      {/* Top bar */}
      <div className="relative z-10 w-full max-w-3xl flex items-center justify-between px-6 pt-4 pb-2">
        <button
          onClick={() => navigate('/town')}
          className="font-bold px-4 py-2 rounded-lg border-2 transition-colors text-sm"
          style={{ background: 'rgba(255,255,255,0.7)', borderColor: '#d4a017', color: '#92400e', backdropFilter: 'blur(4px)' }}
        >
          ← Return to Town
        </button>
        <h1
          className="text-3xl font-bold"
          style={{ color: '#78350f', textShadow: '0 0 16px rgba(253,224,71,0.8), 0 2px 4px rgba(0,0,0,0.15)', fontFamily: 'Georgia, serif' }}
        >
          ✨ Trainer ✨
        </h1>
        <div className="w-36" />
      </div>

      <div className="relative z-10 w-full max-w-3xl px-6 pb-8 flex flex-col gap-6">

        {/* Trainer portrait + intro */}
        <div
          className="flex gap-6 items-center rounded-2xl p-5 border-2"
          style={{
            background: 'rgba(255,255,255,0.65)',
            borderColor: '#fcd34d',
            backdropFilter: 'blur(6px)',
            boxShadow: '0 4px 24px rgba(253,224,71,0.3), 0 0 0 1px rgba(255,255,255,0.8)',
          }}
        >
          {/* Holy warrior portrait — mature, ~30 years old */}
          <div className="flex-shrink-0 flex flex-col items-center" style={{ position: 'relative', minWidth: 110 }}>
            {/* Outer divine glow */}
            <div style={{
              position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
              width: 130, height: 130, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(253,224,71,0.4) 0%, transparent 70%)',
              filter: 'blur(10px)', pointerEvents: 'none',
            }} />
            {/* Halo ring */}
            <div style={{
              width: 66, height: 20, borderRadius: '50%',
              border: '5px solid #fbbf24',
              boxShadow: '0 0 18px rgba(251,191,36,0.9), 0 0 6px rgba(255,255,255,0.6)',
              marginBottom: -12, zIndex: 2, position: 'relative',
              background: 'transparent',
            }} />
            {/* Portrait circle */}
            <div style={{
              width: 108, height: 108, borderRadius: '50%', fontSize: 60,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'radial-gradient(circle, #fff7ed 0%, #fde68a 50%, #fbbf24 100%)',
              border: '5px solid #d97706',
              boxShadow: '0 0 28px rgba(251,191,36,0.7), inset 0 0 20px rgba(255,255,255,0.5)',
              position: 'relative', zIndex: 1,
            }}>
              🧝‍♂️
            </div>
            {/* Wings */}
            <div style={{ display: 'flex', gap: 4, marginTop: -6 }}>
              <span style={{ fontSize: 22, transform: 'scaleX(-1) rotate(-20deg)', filter: 'drop-shadow(0 0 4px rgba(251,191,36,0.7))' }}>🪶</span>
              <span style={{ fontSize: 22, transform: 'rotate(20deg)', filter: 'drop-shadow(0 0 4px rgba(251,191,36,0.7))' }}>🪶</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold tracking-widest mb-1" style={{ color: '#d97706' }}>GUARDIAN OF INNER LIGHT</div>
            <div className="text-xl font-bold mb-2" style={{ color: '#78350f', fontFamily: 'Georgia, serif' }}>Trainer</div>
            <p className="text-sm leading-relaxed" style={{ color: '#92400e' }}>
              "Blessed traveller, I am the keeper of divine wisdom. When you grow in power through battle, I shall bless you with attribute points to strengthen your very soul."
            </p>
            <div className="flex gap-4 mt-3 text-xs" style={{ color: '#b45309' }}>
              {(() => { const t = makeTrainerEnemy(player.level); return (<>
                <span>✨ Level {t.level}</span>
                <span>❤️ {t.maxHp} HP</span>
                <span>🕊️ Surrenders at {t.surrenderHp} HP</span>
              </>) })()}
            </div>
          </div>
        </div>

        {/* Status panels */}
        {spendableStatPoints > 0 && (
          <div
            className="rounded-xl p-4 text-center border-2"
            style={{ background: 'rgba(255,251,235,0.85)', borderColor: '#fcd34d', boxShadow: '0 0 16px rgba(253,224,71,0.4)' }}
          >
            <div className="font-bold text-lg mb-1" style={{ color: '#92400e' }}>⬆️ Divine Power Awaits!</div>
            <p className="text-sm" style={{ color: '#78350f' }}>
              You have <strong>{spendableStatPoints} attribute point{spendableStatPoints !== 1 ? 's' : ''}</strong> ready to allocate below.
            </p>
          </div>
        )}

        {spendableStatPoints === 0 && pendingStatPoints === 0 && (
          <div
            className="rounded-xl p-4 text-center border-2"
            style={{ background: 'rgba(255,255,255,0.6)', borderColor: '#e5e7eb' }}
          >
            <div className="font-bold text-lg mb-1" style={{ color: '#6b7280' }}>🕊️ No Points Available</div>
            <p className="text-sm" style={{ color: '#9ca3af' }}>
              Earn attribute points by leveling up in battle, then return here to spend them.
            </p>
          </div>
        )}

        {/* Legacy fight button — only for old saves that still have locked pending points */}
        {pendingStatPoints > 0 && spendableStatPoints === 0 && (
          <button
            onClick={handleFight}
            className="w-full py-4 rounded-xl font-bold text-xl shadow-lg transition-all border-2"
            style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
              borderColor: '#b45309',
              color: '#fff',
              textShadow: '0 1px 3px rgba(0,0,0,0.3)',
              boxShadow: '0 4px 20px rgba(251,191,36,0.6)',
            }}
          >
            ⚔️ Challenge the Seraph
          </button>
        )}

        {/* Stat allocation panel */}
        {spendableStatPoints > 0 && (
          <div
            className="rounded-2xl p-5 border-2"
            style={{
              background: 'rgba(255,255,255,0.75)',
              borderColor: '#fcd34d',
              backdropFilter: 'blur(6px)',
              boxShadow: '0 4px 24px rgba(253,224,71,0.25)',
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg" style={{ color: '#78350f', fontFamily: 'Georgia, serif' }}>✨ Allocate Blessed Points</h2>
              <span
                className="px-3 py-1 rounded-full text-sm font-bold border"
                style={{
                  background: remaining > 0 ? '#fffbeb' : '#f0fdf4',
                  color: remaining > 0 ? '#92400e' : '#166534',
                  borderColor: remaining > 0 ? '#fbbf24' : '#86efac',
                }}
              >
                {remaining} point{remaining !== 1 ? 's' : ''} remaining
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {STAT_DEFS.map(({ key, label, icon, desc }) => {
                const currentVal = baseStatValue(key)
                const addedNow = pending[key] || 0
                return (
                  <div
                    key={key}
                    className="rounded-xl p-3 border"
                    style={{ background: 'rgba(255,251,235,0.8)', borderColor: '#fde68a' }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <span className="text-base">{icon}</span>
                        <span className="font-bold text-sm ml-1" style={{ color: '#78350f' }}>{label}</span>
                      </div>
                      <span className="font-bold text-sm" style={{ color: '#b45309' }}>
                        {currentVal}{addedNow > 0 && (
                          <span style={{ color: '#16a34a' }}> → {currentVal + addedNow}</span>
                        )}
                      </span>
                    </div>
                    <p className="text-xs mb-2" style={{ color: '#a16207' }}>{desc}</p>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => decrement(key)}
                        disabled={!pending[key]}
                        className="w-7 h-7 rounded font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed border"
                        style={{ background: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5' }}
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-bold text-sm" style={{ color: '#78350f' }}>{addedNow}</span>
                      <button
                        onClick={() => increment(key)}
                        disabled={remaining <= 0}
                        className="w-7 h-7 rounded font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed border"
                        style={{ background: '#dcfce7', color: '#166534', borderColor: '#86efac' }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={confirmAllocation}
              disabled={pendingTotal === 0}
              className="w-full py-3 rounded-xl font-bold text-white border-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-lg"
              style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                borderColor: '#15803d',
                boxShadow: '0 4px 12px rgba(34,197,94,0.4)',
              }}
            >
              ✅ Confirm Allocation
            </button>
          </div>
        )}

        {/* Current stats display */}
        <div
          className="rounded-2xl p-5 border-2"
          style={{
            background: 'rgba(255,255,255,0.6)',
            borderColor: '#e5e7eb',
            backdropFilter: 'blur(4px)',
          }}
        >
          <h2 className="font-bold text-base mb-3" style={{ color: '#78350f', fontFamily: 'Georgia, serif' }}>Current Attributes</h2>
          <div className="grid grid-cols-3 gap-2">
            {STAT_DEFS.map(({ key, label, icon }) => (
              <div key={key} className="text-center py-2 rounded-lg" style={{ background: 'rgba(255,251,235,0.7)' }}>
                <div className="text-xl">{icon}</div>
                <div className="font-bold text-sm" style={{ color: '#78350f' }}>{baseStatValue(key)}</div>
                <div className="text-xs" style={{ color: '#b45309' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
