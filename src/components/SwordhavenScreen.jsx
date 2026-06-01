import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'

export default function SwordhavenScreen() {
  const navigate = useNavigate()
  const { player } = useGame()
  const [showDialog, setShowDialog] = useState(true)
  const questDone = (player.reignQuestProgress || 0) >= 6

  return (
    <div className="w-full h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(180deg, #87CEEB 0%, #e0c97a 55%, #c8a84b 100%)',
    }}>

      {/* Sun */}
      <div style={{
        position: 'absolute', top: '6%', right: '12%',
        width: 80, height: 80, borderRadius: '50%',
        background: 'radial-gradient(circle, #fff7a1, #fbbf24)',
        boxShadow: '0 0 40px 20px rgba(251,191,36,0.45)',
      }} />

      {/* Heat shimmer horizon */}
      <div style={{
        position: 'absolute', top: '52%', left: 0, right: 0, height: 6,
        background: 'linear-gradient(90deg, transparent, rgba(255,220,80,0.6), transparent)',
        filter: 'blur(3px)',
      }} />

      {/* Sand dunes background */}
      {[
        { left: '-5%', width: '35%', height: '26%', bottom: '30%', opacity: 0.55 },
        { left: '55%', width: '50%', height: '22%', bottom: '30%', opacity: 0.45 },
        { left: '20%', width: '65%', height: '18%', bottom: '28%', opacity: 0.35 },
      ].map((s, i) => (
        <div key={i} style={{
          position: 'absolute', ...s,
          background: 'radial-gradient(ellipse 100% 60% at 50% 100%, #d4a843, #f5d68a)',
          borderRadius: '50% 50% 0 0',
        }} />
      ))}

      {/* Ground */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '32%',
        background: 'linear-gradient(180deg, #e6b84a 0%, #c8962e 100%)',
      }} />

      {/* Adobe buildings */}
      {/* Left tower */}
      <div style={{ position: 'absolute', bottom: '28%', left: '8%' }}>
        <div style={{ width: 70, height: 100, background: '#d4a055', border: '3px solid #a0702a', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -20, left: -6, right: -6, height: 24,
            background: '#c4902a', border: '3px solid #a0702a' }} />
          <div style={{ position: 'absolute', top: 15, left: 10, width: 18, height: 24,
            background: '#7a4a10', borderRadius: '50% 50% 0 0' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: 22, height: 36, background: '#7a4a10', borderRadius: '50% 50% 0 0' }} />
        </div>
      </div>

      {/* Right market stall */}
      <div style={{ position: 'absolute', bottom: '28%', right: '10%' }}>
        <div style={{ width: 90, height: 80, background: '#d4a055', border: '3px solid #a0702a', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -16, left: -8, right: -8, height: 18,
            background: '#b94a10', border: '3px solid #8a3208' }} />
          <div style={{ position: 'absolute', top: 10, left: 8, width: 22, height: 20,
            background: '#f5d68a', border: '2px solid #a0702a' }} />
          <div style={{ position: 'absolute', top: 10, right: 8, width: 22, height: 20,
            background: '#f5d68a', border: '2px solid #a0702a' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: 24, height: 40, background: '#7a4a10', borderRadius: '50% 50% 0 0' }} />
        </div>
      </div>

      {/* Central building with archway */}
      <div style={{ position: 'absolute', bottom: '28%', left: '50%', transform: 'translateX(-50%)' }}>
        <div style={{ width: 130, height: 130, background: '#ddb060', border: '4px solid #a0702a', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -28, left: -8, right: -8, height: 30,
            background: '#c4902a', border: '3px solid #a0702a' }} />
          {/* Battlements */}
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{
              position: 'absolute', top: -46, left: 6 + i * 24, width: 16, height: 20,
              background: '#c4902a', border: '2px solid #a0702a',
            }} />
          ))}
          <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
            width: 38, height: 44, background: '#7a4a10', borderRadius: '50% 50% 0 0', border: '3px solid #5a3010' }} />
          <div style={{ position: 'absolute', top: 12, left: 12, width: 24, height: 28,
            background: '#f5d0a0', border: '2px solid #a0702a', borderRadius: '4px 4px 0 0' }} />
          <div style={{ position: 'absolute', top: 12, right: 12, width: 24, height: 28,
            background: '#f5d0a0', border: '2px solid #a0702a', borderRadius: '4px 4px 0 0' }} />
          {/* Sign */}
          <div style={{
            position: 'absolute', top: 65, left: '50%', transform: 'translateX(-50%)',
            background: '#f5d068', border: '2px solid #8a6010', borderRadius: 4, padding: '2px 8px',
            fontSize: 9, fontWeight: 'bold', color: '#5a3010', whiteSpace: 'nowrap',
          }}>SWORDHAVEN</div>
        </div>
      </div>

      {/* NPC Merchant — stands in front of central building */}
      <div style={{ position: 'absolute', bottom: '31%', left: '50%', transform: 'translateX(-170px)', zIndex: 10 }}>
        {/* Body */}
        <div style={{ position: 'relative', width: 56, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Head */}
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f0c888',
            border: '2px solid #c89050', position: 'relative', zIndex: 2 }}>
            {/* Turban */}
            <div style={{ position: 'absolute', top: -8, left: -4, right: -4, height: 18,
              background: '#e05010', borderRadius: '50% 50% 0 0', border: '2px solid #b03000' }} />
            <div style={{ position: 'absolute', top: 8, left: 6, width: 6, height: 6, borderRadius: '50%', background: '#2a1a08' }} />
            <div style={{ position: 'absolute', top: 8, right: 6, width: 6, height: 6, borderRadius: '50%', background: '#2a1a08' }} />
            <div style={{ position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)',
              width: 14, height: 6, borderRadius: '0 0 8px 8px', border: '2px solid #c89050', borderTop: 'none' }} />
            {/* Beard */}
            <div style={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)',
              width: 18, height: 14, background: '#8a6030', borderRadius: '0 0 60% 60%' }} />
          </div>
          {/* Robe */}
          <div style={{ width: 44, height: 60, background: '#3060a0', border: '2px solid #204080',
            borderRadius: '4px 4px 0 0', position: 'relative', marginTop: -2 }}>
            {/* Belt */}
            <div style={{ position: 'absolute', top: 20, left: 0, right: 0, height: 6, background: '#c8a030' }} />
            {/* Arms */}
            <div style={{ position: 'absolute', top: 4, left: -10, width: 12, height: 40,
              background: '#3060a0', border: '2px solid #204080', borderRadius: 6, transform: 'rotate(-10deg)' }} />
            <div style={{ position: 'absolute', top: 4, right: -10, width: 12, height: 40,
              background: '#3060a0', border: '2px solid #204080', borderRadius: 6, transform: 'rotate(10deg)' }} />
            {/* Scroll in hand */}
            <div style={{ position: 'absolute', top: 28, right: -14, width: 8, height: 24,
              background: '#f5e0a0', border: '2px solid #c8a030', borderRadius: 2 }} />
          </div>
        </div>

        {/* Speech bubble */}
        {showDialog && (
          <div style={{
            position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-30%)',
            background: 'white', border: '3px solid #c8a030',
            borderRadius: 12, padding: '12px 16px', width: 260, zIndex: 20,
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          }}>
            {/* Tail */}
            <div style={{
              position: 'absolute', bottom: -14, left: 32,
              width: 0, height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderTop: '14px solid #c8a030',
            }} />
            <div style={{
              position: 'absolute', bottom: -10, left: 34,
              width: 0, height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '12px solid white',
            }} />
            {questDone ? (
              <p style={{ fontSize: 13, color: '#3b2010', fontFamily: 'Georgia,serif', lineHeight: 1.5 }}>
                "You proved yourself worthy, champion! The Reign armoury is yours to browse.
                May the Reign Plate serve you well!"
              </p>
            ) : (
              <p style={{ fontSize: 13, color: '#3b2010', fontFamily: 'Georgia,serif', lineHeight: 1.5 }}>
                "Hail, traveller! Legend speaks of the mighty <strong>Reign Plate</strong> — 
                golden armour of kings, locked beyond the Shifting Sands. 
                Face five trials and the Reign Guardian himself. 
                Do you accept the quest?"
              </p>
            )}
          </div>
        )}
      </div>

      {/* UI panel */}
      <div style={{
        position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg,#8B5E3C,#6B3F1F)',
        border: '4px solid #4a2c0a', borderRadius: 12,
        padding: '20px 32px', zIndex: 30,
        boxShadow: 'inset 0 0 8px rgba(0,0,0,0.5), 0 6px 20px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        minWidth: 340,
      }}>
        <div style={{ fontFamily: 'Georgia,serif', color: '#ffd87a', fontSize: 20, fontWeight: 'bold',
          textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
          ⚔️ Swordhaven
        </div>
        <div style={{ color: '#e8c882', fontSize: 13, textAlign: 'center', opacity: 0.85 }}>
          {questDone
            ? 'The Reign armoury is open to you.'
            : 'Ancient desert city — home of the Reign Plate.'}
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {questDone ? (
            <button
              onClick={() => navigate('/reign-shop')}
              style={{
                background: 'linear-gradient(to bottom,#d4a030,#8B6010)',
                border: '3px solid #ffd87a', borderRadius: 8, padding: '10px 28px',
                color: '#fff8dc', fontWeight: 'bold', fontSize: 15, cursor: 'pointer',
                boxShadow: '0 3px 0 #4a2c0a, inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              🏆 Reign Armoury
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/reign-quest')}
                style={{
                  background: 'linear-gradient(to bottom,#c8860a,#8B5E0A)',
                  border: '2px solid #4a2c0a', borderRadius: 8, padding: '10px 24px',
                  color: '#fff2cc', fontWeight: 'bold', fontSize: 15, cursor: 'pointer',
                  boxShadow: '0 3px 0 #4a2c0a',
                }}
              >
                ⚔️ Accept Quest
              </button>
              <button
                onClick={() => navigate('/town')}
                style={{
                  background: 'linear-gradient(to bottom,#666,#444)',
                  border: '2px solid #4a2c0a', borderRadius: 8, padding: '10px 24px',
                  color: '#ccc', fontWeight: 'bold', fontSize: 15, cursor: 'pointer',
                }}
              >
                🚪 Leave Town
              </button>
            </>
          )}
          {questDone && (
            <button
              onClick={() => navigate('/town')}
              style={{
                background: 'linear-gradient(to bottom,#666,#444)',
                border: '2px solid #4a2c0a', borderRadius: 8, padding: '10px 20px',
                color: '#ccc', fontWeight: 'bold', fontSize: 14, cursor: 'pointer',
              }}
            >
              🚪 Leave
            </button>
          )}
        </div>

        {!questDone && (player.reignQuestProgress || 0) > 0 && (
          <div style={{ color: '#a0d080', fontSize: 12, textAlign: 'center' }}>
            ✅ Progress: Stage {player.reignQuestProgress} / 6 complete — continue your quest!
          </div>
        )}
      </div>

      {/* Back to Town top-right */}
      <button
        onClick={() => navigate('/town')}
        style={{
          position: 'absolute', top: 16, right: 16,
          background: 'linear-gradient(to bottom,#c8860a,#8B5E0A)',
          border: '2px solid #4a2c0a', borderRadius: 8, padding: '8px 18px',
          color: '#fff2cc', fontWeight: 'bold', fontSize: 13, cursor: 'pointer', zIndex: 40,
        }}
      >
        ← Back to Town
      </button>
    </div>
  )
}
