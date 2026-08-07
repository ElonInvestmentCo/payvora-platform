import { useState } from 'react'
import { C } from './tokens'
import { WaveformIcon } from './components/Shared'
import TextToSpeech from './pages/TextToSpeech'
import VoiceClone   from './pages/VoiceClone'
import MyVoices     from './pages/MyVoices'
import History      from './pages/History'

const TABS = [
  { id: 'text-to-speech', label: 'Text to Speech' },
  { id: 'voice-clone',    label: 'Voice Clone'    },
  { id: 'my-voices',      label: 'My Voices'      },
  { id: 'history',        label: 'History'        },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('text-to-speech')

  return (
    <div style={{ minHeight: '100vh', background: C.white, fontFamily: 'Inter, system-ui, sans-serif', color: C.black }}>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <WaveformIcon size={22} color={C.white} />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: C.black, margin: 0, lineHeight: 1.3 }}>Voice Studio</h1>
            <p style={{ fontSize: 13, color: C.textGray, margin: 0 }}>Create natural, human-like speech using advanced AI voices</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 24, marginTop: 20, borderBottom: `1px solid ${C.border}` }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                paddingBottom: 12, fontSize: 14, fontWeight: 500, cursor: 'pointer',
                border: 'none', background: 'none', position: 'relative',
                color: activeTab === tab.id ? C.black : C.textGray,
                transition: 'color 0.15s',
              }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, borderRadius: 1, background: C.accent }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Page content ────────────────────────────────────────────────── */}
      {activeTab === 'text-to-speech' && <TextToSpeech />}
      {activeTab === 'voice-clone'    && <VoiceClone   />}
      {activeTab === 'my-voices'      && <MyVoices     />}
      {activeTab === 'history'        && <History      />}
    </div>
  )
}
