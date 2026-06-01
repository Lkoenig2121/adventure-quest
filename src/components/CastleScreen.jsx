import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { useState } from 'react'

export const FLOOR_ENEMIES = {
  1:  { name: 'Iron Guardian',       icon:'🛡️',  hp: 600,  maxHp: 600,  mp: 150, maxMp: 150, level: 12, xpReward: 200,  goldReward: 80,  element: 'Light',    elementIcon: '✨', speed: 35, elementResistances: { fire: 100, water: 100, wind: 100, ice: 100, earth: 100, energy: 150, light: 50,  darkness: 200, physical: 80  } },
  2:  { name: 'Lich King',           icon:'💀',  hp: 850,  maxHp: 850,  mp: 450, maxMp: 450, level: 18, xpReward: 330,  goldReward: 120, element: 'Darkness', elementIcon: '🌑', speed: 40, elementResistances: { fire: 150, water: 100, wind: 100, ice: 50,  earth: 100, energy: 100, light: 200, darkness: 0,   physical: 100 } },
  3:  { name: 'Storm Harpy',         icon:'🦅',  hp: 1050, maxHp: 1050, mp: 320, maxMp: 320, level: 24, xpReward: 450,  goldReward: 160, element: 'Wind',     elementIcon: '🌪️', speed: 75, elementResistances: { fire: 100, water: 100, wind: 0,   ice: 150, earth: 200, energy: 130, light: 100, darkness: 100, physical: 90  } },
  4:  { name: 'Frost Giant',         icon:'🧊',  hp: 1350, maxHp: 1350, mp: 220, maxMp: 220, level: 30, xpReward: 600,  goldReward: 210, element: 'Ice',      elementIcon: '❄️', speed: 30, elementResistances: { fire: 200, water: 80,  wind: 130, ice: 0,   earth: 100, energy: 130, light: 100, darkness: 100, physical: 80  } },
  5:  { name: 'Magma Titan',         icon:'🌋',  hp: 1650, maxHp: 1650, mp: 380, maxMp: 380, level: 36, xpReward: 780,  goldReward: 270, element: 'Fire',     elementIcon: '🔥', speed: 45, elementResistances: { fire: 0,   water: 200, wind: 100, ice: 180, earth: 50,  energy: 120, light: 100, darkness: 100, physical: 90  } },
  6:  { name: 'Abyssal Serpent',     icon:'🐍',  hp: 2000, maxHp: 2000, mp: 550, maxMp: 550, level: 40, xpReward: 950,  goldReward: 340, element: 'Water',    elementIcon: '💧', speed: 60, elementResistances: { fire: 150, water: 0,   wind: 100, ice: 130, earth: 100, energy: 100, light: 100, darkness: 150, physical: 100 } },
  7:  { name: 'Thunder Phoenix',     icon:'🦜',  hp: 2400, maxHp: 2400, mp: 650, maxMp: 650, level: 45, xpReward: 1150, goldReward: 420, element: 'Energy',   elementIcon: '⚡', speed: 80, elementResistances: { fire: 130, water: 150, wind: 50,  ice: 130, earth: 200, energy: 0,   light: 130, darkness: 130, physical: 80  } },
  8:  { name: 'Shadow Wraith King',  icon:'👻',  hp: 2900, maxHp: 2900, mp: 750, maxMp: 750, level: 50, xpReward: 1380, goldReward: 500, element: 'Darkness', elementIcon: '🌑', speed: 70, elementResistances: { fire: 100, water: 100, wind: 130, ice: 100, earth: 100, energy: 130, light: 200, darkness: 0,   physical: 80  } },
  9:  { name: 'Ancient Earth Golem', icon:'🗿',  hp: 3600, maxHp: 3600, mp: 430, maxMp: 430, level: 56, xpReward: 1700, goldReward: 620, element: 'Earth',    elementIcon: '🌍', speed: 25, elementResistances: { fire: 100, water: 150, wind: 180, ice: 100, earth: 0,   energy: 150, light: 100, darkness: 100, physical: 50  } },
  10: { name: 'Void Dragon',         icon:'🐉',  hp: 4500, maxHp: 4500, mp: 950, maxMp: 950, level: 62, xpReward: 2200, goldReward: 800, element: 'Darkness', elementIcon: '🌑', speed: 65, elementResistances: { fire: 130, water: 130, wind: 130, ice: 130, earth: 130, energy: 130, light: 200, darkness: 0,   physical: 80  } },
  11: {
    name: 'Carnax',
    title: 'The Ancient Destroyer',
    hp: 77777, maxHp: 77777, mp: 1200, maxMp: 1200,
    level: 60,
    xpReward: 50000, goldReward: 10000,
    image: 'carnax',
    element: 'Earth', elementIcon: '🌍',
    icon: '👾',
    speed: 40,
    attackMin: 700, attackMax: 1000,
    elementResistances: {
      fire: 150, water: 50, wind: 130, ice: 130,
      earth: 0, energy: 150, light: 130, darkness: 130, physical: 80,
    },
  },
}

const FLOOR_LABELS = {
  1:'F1', 2:'F2', 3:'F3', 4:'F4', 5:'F5',
  6:'F6', 7:'F7', 8:'F8', 9:'F9', 10:'F10', 11:'👾',
}

const CastleScreen = () => {
  const navigate = useNavigate()
  const { player, startBattle } = useGame()

  const castleProgress = player.castleProgress || 0
  const nextFloor = Math.min(castleProgress + 1, 11)

  const [selectedFloor, setSelectedFloor] = useState(nextFloor)

  const handleBattle = (floor) => {
    startBattle(FLOOR_ENEMIES[floor], 'castle', floor)
    navigate('/battle')
  }

  const isCarnax = selectedFloor === 11
  const sel = FLOOR_ENEMIES[selectedFloor]

  return (
    <div className="w-full h-screen relative overflow-hidden flex items-center justify-center"
      style={{ background: 'linear-gradient(180deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)' }}>

      {/* Torch flickers */}
      {[{t:'8%',l:'4%'},{t:'8%',r:'4%'},{t:'50%',l:'2%'},{t:'50%',r:'2%'}].map((pos,i)=>(
        <div key={i} style={{ position:'absolute',...pos, zIndex:1, textAlign:'center' }}>
          <div style={{ fontSize:28, animation:`pulse ${1+i*0.3}s infinite alternate` }}>🔥</div>
        </div>
      ))}

      <div className="relative z-10 flex gap-6 items-start w-full max-w-5xl mx-4">

        {/* LEFT — floor ladder */}
        <div style={{
          width: 160, flexShrink: 0,
          background: 'rgba(0,0,0,0.5)',
          border: '2px solid #4a3f2a',
          borderRadius: 10,
          padding: '12px 8px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}>
          <div style={{ color:'#ffd87a', fontFamily:'Georgia,serif', fontSize:13, fontWeight:'bold', textAlign:'center', marginBottom:10 }}>
            🏰 Castle Floors
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom:10, background:'#1a1a2e', borderRadius:4, height:6 }}>
            <div style={{
              height:6, borderRadius:4,
              width:`${(castleProgress/10)*100}%`,
              background:'linear-gradient(to right,#fbbf24,#f59e0b)',
              transition:'width 0.5s',
            }} />
          </div>
          <div style={{ color:'#a0a0a0', fontSize:10, textAlign:'center', marginBottom:10 }}>
            {castleProgress}/10 floors cleared
          </div>

          {Object.entries(FLOOR_ENEMIES).map(([f, enemy]) => {
            const fn = parseInt(f)
            const beaten  = fn <= castleProgress
            const current = fn === nextFloor
            const locked  = fn > nextFloor
            const isCarnaxFloor = fn === 11
            return (
              <button
                key={f}
                disabled={locked}
                onClick={() => !locked && setSelectedFloor(fn)}
                style={{
                  display:'flex', alignItems:'center', gap:6,
                  width:'100%', padding:'7px 8px', marginBottom:4,
                  borderRadius:6,
                  border:`2px solid ${selectedFloor===fn ? '#fbbf24' : beaten ? '#22c55e' : current ? '#f59e0b' : '#333'}`,
                  background: selectedFloor===fn
                    ? 'rgba(251,191,36,0.15)'
                    : beaten ? 'rgba(34,197,94,0.08)' : current ? 'rgba(245,158,11,0.1)' : 'transparent',
                  color: locked ? '#444' : beaten ? '#86efac' : current ? '#fcd34d' : '#d4d4d4',
                  cursor: locked ? 'not-allowed' : 'pointer',
                  fontSize: 11,
                }}
              >
                <span style={{ fontSize:14 }}>{locked ? '🔒' : beaten ? '✅' : current ? '⚔️' : '👁️'}</span>
                <span style={{ flex:1, textAlign:'left', fontWeight: current ? 'bold' : 'normal' }}>
                  {isCarnaxFloor ? '👾 Carnax' : `F${f}: ${enemy.name}`}
                </span>
              </button>
            )
          })}
        </div>

        {/* RIGHT — selected floor detail */}
        <div style={{ flex:1, minWidth:0 }}>

          {/* Header */}
          <div style={{
            textAlign:'center', marginBottom:16,
            fontFamily:'Georgia,serif',
            color: isCarnax ? '#ff6b6b' : '#ffd87a',
            textShadow: isCarnax ? '0 0 20px rgba(255,100,100,0.8)' : '0 0 10px rgba(255,200,0,0.6)',
          }}>
            <div style={{ fontSize: 15, opacity:0.8, marginBottom:4 }}>
              {isCarnax ? '⚠️ LEGENDARY BOSS' : `Floor ${selectedFloor} of ${castleProgress >= 10 ? '11' : '10'}`}
            </div>
            <div style={{ fontSize: isCarnax ? 30 : 24, fontWeight:'bold' }}>
              {sel?.name}
            </div>
            {isCarnax && <div style={{ fontSize:12, color:'#fca5a5', marginTop:4 }}>The Ancient Destroyer</div>}
          </div>

          {/* Carnax visual OR regular enemy */}
          <div style={{
            background: isCarnax
              ? 'radial-gradient(ellipse at center, rgba(80,10,10,0.9) 0%, rgba(20,5,5,0.95) 100%)'
              : 'rgba(0,0,0,0.6)',
            border: `3px solid ${isCarnax ? '#7f1d1d' : '#4a3f2a'}`,
            borderRadius:12,
            padding: 20,
            marginBottom:16,
            textAlign:'center',
          }}>
            {isCarnax ? (
              <>
                {/* Carnax monster display */}
                <div style={{ position:'relative', display:'inline-block', marginBottom:12 }}>
                  <div style={{
                    fontSize:100, lineHeight:1,
                    filter:'drop-shadow(0 0 30px rgba(0,200,0,0.5))',
                    animation:'pulse 2s infinite',
                  }}>👾</div>
                  {/* Red eye glow overlays */}
                  <div style={{
                    position:'absolute', top:'20%', left:'25%',
                    width:12, height:8, borderRadius:'50%',
                    background:'#ef4444',
                    boxShadow:'0 0 12px #ef4444',
                  }}/>
                  <div style={{
                    position:'absolute', top:'20%', right:'25%',
                    width:12, height:8, borderRadius:'50%',
                    background:'#ef4444',
                    boxShadow:'0 0 12px #ef4444',
                  }}/>
                </div>
                <div style={{ color:'#fca5a5', fontSize:12, marginBottom:12, fontStyle:'italic' }}>
                  "An ancient evil awakens…"
                </div>
              </>
            ) : (
              <div style={{ fontSize:72, marginBottom:12 }}>
                {FLOOR_ENEMIES[selectedFloor]?.elementIcon || '👹'}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3" style={{ fontSize:13 }}>
              {[
                ['Level',    sel?.level,            '#fcd34d'],
                ['HP',       sel?.hp?.toLocaleString(), '#f87171'],
                ['MP',       sel?.mp?.toLocaleString(), '#60a5fa'],
                ['Element',  `${sel?.elementIcon} ${sel?.element}`, '#e9d5ff'],
                ['XP',       `+${sel?.xpReward?.toLocaleString()}`, '#86efac'],
                ['Gold',     `+${sel?.goldReward?.toLocaleString()}`, '#fbbf24'],
              ].map(([label, val, color]) => (
                <div key={label} style={{
                  background:'rgba(255,255,255,0.05)',
                  borderRadius:6, padding:'8px 10px',
                  border:'1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{ color:'#9ca3af', fontSize:10 }}>{label}</div>
                  <div style={{ color, fontWeight:'bold', fontSize:15 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Current floor badge */}
          <div style={{
            textAlign:'center',
            color: '#9ca3af', fontSize:12, marginBottom:10,
          }}>
            {selectedFloor <= castleProgress
              ? '✅ Floor already cleared — you may replay it'
              : selectedFloor === nextFloor
                ? `⚔️ Next challenge — Floor ${selectedFloor}`
                : '🔒 Complete previous floors to unlock'}
          </div>

          {/* Battle button */}
          <button
            onClick={() => handleBattle(selectedFloor)}
            disabled={selectedFloor > nextFloor}
            style={{
              width:'100%',
              padding:'14px 0',
              borderRadius:10,
              fontWeight:'bold',
              fontSize:18,
              fontFamily:'Georgia,serif',
              border:`3px solid ${isCarnax ? '#7f1d1d' : '#b45309'}`,
              background: selectedFloor > nextFloor
                ? '#1f1f1f'
                : isCarnax
                  ? 'linear-gradient(135deg,#7f1d1d,#450a0a)'
                  : 'linear-gradient(135deg,#b45309,#78350f)',
              color: selectedFloor > nextFloor ? '#444' : '#fff',
              cursor: selectedFloor > nextFloor ? 'not-allowed' : 'pointer',
              textShadow: selectedFloor > nextFloor ? 'none' : '0 1px 3px rgba(0,0,0,0.5)',
              boxShadow: selectedFloor > nextFloor ? 'none' : isCarnax
                ? '0 0 20px rgba(255,50,50,0.4)'
                : '0 0 12px rgba(180,83,9,0.4)',
              marginBottom:10,
            }}
          >
            {selectedFloor > nextFloor
              ? '🔒 Locked'
              : isCarnax
                ? '💀 Face Carnax!'
                : `⚔️ Enter Floor ${selectedFloor}`}
          </button>

          <button
            onClick={() => navigate('/town')}
            style={{
              width:'100%', padding:'10px 0', borderRadius:8,
              background:'rgba(0,0,0,0.4)', border:'2px solid #374151',
              color:'#9ca3af', fontSize:14, cursor:'pointer',
            }}
          >
            ← Return to Town
          </button>
        </div>
      </div>

      {/* ── Carnax Banner — always visible at the bottom ─────────────── */}
      {(() => {
        const carnaxUnlocked = castleProgress >= 10
        return (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            zIndex: 20,
          }}>
            <button
              onClick={() => carnaxUnlocked && handleBattle(11)}
              disabled={!carnaxUnlocked}
              style={{
                width: '100%',
                padding: '14px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                cursor: carnaxUnlocked ? 'pointer' : 'not-allowed',
                border: 'none',
                borderTop: `3px solid ${carnaxUnlocked ? '#7f1d1d' : '#374151'}`,
                background: carnaxUnlocked
                  ? 'linear-gradient(90deg, #0a0000 0%, #3b0000 30%, #7f1d1d 50%, #3b0000 70%, #0a0000 100%)'
                  : 'rgba(10,10,10,0.85)',
                boxShadow: carnaxUnlocked ? '0 -4px 24px rgba(200,0,0,0.4), inset 0 1px 0 rgba(255,50,50,0.2)' : 'none',
                transition: 'all 0.3s',
              }}
            >
              {/* Left: pulsing eye */}
              <span style={{
                fontSize: 36,
                filter: carnaxUnlocked ? 'drop-shadow(0 0 10px #ef4444)' : 'grayscale(1)',
                animation: carnaxUnlocked ? 'pulse 1.5s infinite' : 'none',
              }}>
                👾
              </span>

              {/* Centre text */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'Georgia,serif',
                  fontWeight: 'bold',
                  fontSize: 20,
                  color: carnaxUnlocked ? '#fca5a5' : '#4b5563',
                  textShadow: carnaxUnlocked ? '0 0 16px rgba(255,50,50,0.8)' : 'none',
                  letterSpacing: 2,
                }}>
                  {carnaxUnlocked ? '💀 FACE CARNAX 💀' : '🔒 CARNAX — Clear all 10 floors to unlock'}
                </div>
                <div style={{
                  fontSize: 11,
                  color: carnaxUnlocked ? '#f87171' : '#374151',
                  marginTop: 2,
                }}>
                  {carnaxUnlocked
                    ? 'The Ancient Destroyer  ·  Lv 60  ·  6,000 HP  ·  +5,000 XP  ·  +2,000 Gold'
                    : `${castleProgress}/10 floors cleared`}
                </div>
              </div>

              {/* Right: pulsing eye */}
              <span style={{
                fontSize: 36,
                filter: carnaxUnlocked ? 'drop-shadow(0 0 10px #ef4444)' : 'grayscale(1)',
                animation: carnaxUnlocked ? 'pulse 1.5s infinite 0.75s' : 'none',
              }}>
                👾
              </span>
            </button>
          </div>
        )
      })()}
    </div>
  )
}

export default CastleScreen

