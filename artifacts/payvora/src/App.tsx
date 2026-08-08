import { useEffect, useRef, useState } from 'react'
import VoiceStudioApp from './voice-studio/VoiceStudioApp'
import ImageStudio from './studios/ImageStudio'
import VideoStudio from './studios/VideoStudio'

const NAV_PATHS: Record<string, string> = {
  'AI Chat': '/',
  'Voice Studio': '/voice-studio',
  'Image Studio': '/image-studio',
  'Video Studio': '/video-studio',
}

function navForPath(pathname: string) {
  if (pathname === '/voice-studio') return 'Voice Studio'
  if (pathname === '/image-studio') return 'Image Studio'
  if (pathname === '/video-studio') return 'Video Studio'
  return 'AI Chat'
}

// ── Color tokens (spec-compliant) ──────────────────────────────────────────
const C = {
  sidebar:    '#13161C',
  surfacePri: '#21232B',
  surfaceSec: '#23252E',
  page:       '#FBFAFC',
  card:       '#FFFFFF',
  hover:      '#FFF2F0',
  brand:      '#f97316',
}

// ── Static data ───────────────────────────────────────────────────────────
const CHAT_HISTORY = {
  Today: ['New conversation', 'AI voice clone for a character', 'Create a futuristic city image'],
  Yesterday: ['Fix this code bug', 'Customer support email draft'],
  'Previous 7 days': ['Marketing strategy ideas', 'Python script for data analysis'],
}

const WORKSPACE_ITEMS = [
  { Icon: ChatIcon,  label: 'AI Chat',         active: true },
  { Icon: MicIcon,   label: 'Voice Studio' },
  { Icon: ImgIcon,   label: 'Image Studio' },
  { Icon: VidIcon,   label: 'Video Studio' },
  { Icon: FileIcon,  label: 'Document Studio' },
]

const EXPLORE_ITEMS = [
  { Icon: AgentIcon,  label: 'AI Agents' },
  { Icon: GridIcon,   label: 'Templates' },
  { Icon: BookIcon,   label: 'Knowledge Base' },
  { Icon: FolderIcon, label: 'Projects' },
  { Icon: PlugIcon,   label: 'Integrations' },
]

const STUDIO_CARDS = [
  { bg: '#f3e8ff', fg: '#9333ea', Icon: ChatBubbleIcon, title: 'AI Chat',      sub: 'Have intelligent conversations' },
  { bg: '#dcfce7', fg: '#16a34a', Icon: MicFillIcon,    title: 'Voice Studio', sub: 'Clone voices and generate speech' },
  { bg: '#dbeafe', fg: '#2563eb', Icon: ImgFillIcon,    title: 'Image Studio', sub: 'Create stunning AI images' },
  { bg: '#ffedd5', fg: '#ea580c', Icon: VidFillIcon,    title: 'Video Studio', sub: 'Generate AI videos' },
]

const RECENT_PROJECTS = [
  { bg: '#f3e8ff', fg: '#9333ea', Icon: WaveIcon,  title: 'AI Voice Assistant', time: 'Updated 2h ago' },
  { bg: '#dcfce7', fg: '#16a34a', Icon: BrandIcon,  title: 'Brand Images',       time: 'Updated 5h ago' },
  { bg: '#ffedd5', fg: '#ea580c', Icon: ScriptIcon, title: 'YouTube Script',     time: 'Updated 1d ago' },
]

const TOOLS = [
  { bg: '#faf5ff', fg: '#9333ea', Icon: Spk1Icon, label: 'Text to Speech' },
  { bg: '#eff6ff', fg: '#2563eb', Icon: Spk2Icon, label: 'Speech to Text' },
  { bg: '#eff6ff', fg: '#3b82f6', Icon: I2IIcon,  label: 'Image to Image' },
  { bg: '#faf5ff', fg: '#7c3aed', Icon: T2VIcon,  label: 'Text to Video' },
  { bg: '#faf5ff', fg: '#6d28d9', Icon: CodeIcon, label: 'Code Interpreter' },
]

const QUICK = [
  { emoji: '✏️', label: 'Write anything' },
  { emoji: '💡', label: 'Brainstorm ideas' },
  { emoji: '📊', label: 'Analyze data' },
  { emoji: '{ }', label: 'Solve problems' },
  { emoji: '🔍', label: 'Research topic' },
]

export default function App() {
  const [activeNav, setActiveNav] = useState(() => navForPath(window.location.pathname))
  const [message, setMessage] = useState('')
  const [activeChat, setActiveChat] = useState('New conversation')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [modelOpen, setModelOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState('GPT-4o')
  const [interactionMessage, setInteractionMessage] = useState('')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    try {
      const stored = window.localStorage.getItem('payvora-expanded-sections')
      return stored ? JSON.parse(stored) : { Chats: true, 'AI Workspace': true, Explore: true }
    } catch {
      return { Chats: true, 'AI Workspace': true, Explore: true }
    }
  })
  const messageInputRef = useRef<HTMLInputElement>(null)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const modelMenuRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const isStudio = ['Image Studio', 'Video Studio', 'Voice Studio'].includes(activeNav)
  // Image/Video use a fixed-height split-pane layout; Voice Studio uses natural document flow
  const isFixedStudio = ['Image Studio', 'Video Studio'].includes(activeNav)

  useEffect(() => {
    window.localStorage.setItem('payvora-expanded-sections', JSON.stringify(expandedSections))
  }, [expandedSections])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 760px)')
    const syncSidebar = () => {
      if (mediaQuery.matches) setSidebarCollapsed(true)
    }
    mediaQuery.addEventListener('change', syncSidebar)
    return () => mediaQuery.removeEventListener('change', syncSidebar)
  }, [])

  useEffect(() => {
    const syncRoute = () => setActiveNav(navForPath(window.location.pathname))
    window.addEventListener('popstate', syncRoute)
    return () => window.removeEventListener('popstate', syncRoute)
  }, [])

  useEffect(() => {
    if (!profileOpen && !modelOpen && !notificationsOpen) return
    const closeMenus = (event: PointerEvent) => {
      const target = event.target as Node
      if (profileOpen && !profileMenuRef.current?.contains(target)) setProfileOpen(false)
      if (modelOpen && !modelMenuRef.current?.contains(target)) setModelOpen(false)
      if (notificationsOpen && !notificationsRef.current?.contains(target)) setNotificationsOpen(false)
    }
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileOpen(false)
        setModelOpen(false)
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('pointerdown', closeMenus)
    document.addEventListener('keydown', closeWithEscape)
    return () => {
      document.removeEventListener('pointerdown', closeMenus)
      document.removeEventListener('keydown', closeWithEscape)
    }
  }, [modelOpen, notificationsOpen, profileOpen])

  const notify = (label: string) => setInteractionMessage(label)
  const navigateTo = (label: string, announce = true) => {
    setActiveNav(label)
    const path = NAV_PATHS[label]
    if (path && window.location.pathname !== path) {
      window.history.pushState({}, '', path)
    }
    if (announce) notify(`${label} opened`)
  }
  const toggleSection = (label: string) => {
    setExpandedSections(current => ({ ...current, [label]: !current[label] }))
  }
  const startNewChat = () => {
    setActiveChat('New conversation')
    setMessage('')
    navigateTo('AI Chat', false)
    notify('New chat started')
    messageInputRef.current?.focus()
  }
  const chooseQuickAction = (label: string) => {
    setMessage(`${label}: `)
    notify(`${label} selected`)
    window.setTimeout(() => messageInputRef.current?.focus(), 0)
  }

  return (
    <div className="payvora-app" style={{ display: 'flex', height: '100vh', background: C.page, fontFamily: 'system-ui, -apple-system, sans-serif', overflow: 'hidden' }} aria-live="polite">

      {/* ── LEFT SIDEBAR ──────────────────────────────────────────────────── */}
      <aside className="payvora-sidebar" data-collapsed={sidebarCollapsed} style={{ width: sidebarCollapsed ? 64 : 248, flexShrink: 0, background: C.sidebar, display: 'flex', flexDirection: 'column', height: '100%', borderRight: '1px solid rgba(255,255,255,0.06)', position: 'relative', transition: 'width 220ms cubic-bezier(0.22, 1, 0.36, 1)' }}>

        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between', padding: '16px 16px 12px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="Payvora logo mark">
                <path d="M5 22V6h8.2c5.2 0 8.8 2.7 8.8 7s-3.6 7-8.8 7H10v2H5Zm5-6h3.1c2.5 0 3.9-1 3.9-3s-1.4-3-3.9-3H10v6Z" fill={C.brand}/>
              </svg>
            </div>
            <span style={{ color: '#fff', fontWeight: 600, fontSize: 14, letterSpacing: '-0.01em', opacity: sidebarCollapsed ? 0 : 1, width: sidebarCollapsed ? 0 : 'auto', overflow: 'hidden', whiteSpace: 'nowrap', transition: 'opacity 180ms ease, width 220ms ease' }}>Payvora AI</span>
          </div>
          <button type="button" aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={() => setSidebarCollapsed(value => !value)} style={{ ...ghostBtn, flexShrink: 0, position: sidebarCollapsed ? 'absolute' : 'static', right: sidebarCollapsed ? 8 : undefined, top: sidebarCollapsed ? 14 : undefined }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d={sidebarCollapsed ? 'M5 2L10 7L5 12' : 'M9 2L4 7L9 12'} stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
              {!sidebarCollapsed && <path d="M13 2L8 7L13 12" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>}
            </svg>
          </button>
        </div>

        {/* New Chat */}
        <div style={{ padding: sidebarCollapsed ? '0 8px 8px' : '0 12px 8px' }}>
          <button type="button" aria-label="New chat" className={sidebarCollapsed ? 'payvora-collapsed-utility' : undefined} data-tooltip={sidebarCollapsed ? 'New Chat' : undefined} onClick={startNewChat} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between', padding: '9px 12px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 12, cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 500, transition: 'background 0.15s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1.5v10M1.5 6.5h10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg>
              <span style={{ opacity: sidebarCollapsed ? 0 : 1, width: sidebarCollapsed ? 0 : 'auto', overflow: 'hidden', whiteSpace: 'nowrap', transition: 'opacity 180ms ease, width 220ms ease' }}>New Chat</span>
            </div>
            {!sidebarCollapsed && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.1)', padding: '2px 5px', borderRadius: 5 }}>⌘K</span>}
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: sidebarCollapsed ? '0 8px 12px' : '0 12px 12px' }}>
          <div className={sidebarCollapsed ? 'payvora-collapsed-utility' : undefined} data-tooltip={sidebarCollapsed ? 'Search' : undefined} style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', gap: 8, padding: '8px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.4"/><path d="M12.5 12.5L16 16" stroke="rgba(255,255,255,0.35)" strokeWidth="1.4" strokeLinecap="round"/></svg>
            <input aria-label="Search chats" type="search" placeholder={sidebarCollapsed ? '' : 'Search chats'} style={{ opacity: sidebarCollapsed ? 0 : 1, width: sidebarCollapsed ? 0 : '100%', background: 'transparent', border: 'none', outline: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 12, transition: 'opacity 180ms ease, width 220ms ease' }} />
          </div>
        </div>

        {/* Scrollable nav */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', padding: '0 8px' }}>

          {/* Chats */}
          {!sidebarCollapsed && <SideSection label="Chats" expanded={expandedSections.Chats} onToggle={() => toggleSection('Chats')} collapsed={sidebarCollapsed}>
            {Object.entries(CHAT_HISTORY).map(([group, items]) => (
              <div key={group}>
                <p style={{ ...groupLabel, opacity: sidebarCollapsed ? 0 : 1, transition: 'opacity 180ms ease' }}>{group}</p>
                {items.map((item, i) => (
                  <SideItem key={item} label={item} icon={<ChatIcon />} collapsed={sidebarCollapsed} active={activeChat === item} onClick={() => { setActiveChat(item); navigateTo('AI Chat', false); notify(`${item} opened`) }} />
                ))}
              </div>
            ))}
            <button type="button" onClick={() => notify('Showing all chats')} style={{ ...viewAllBtn, opacity: sidebarCollapsed ? 0 : 1, pointerEvents: sidebarCollapsed ? 'none' : 'auto', transition: 'opacity 180ms ease' }}>View all chats →</button>
          </SideSection>}

          {/* AI Workspace */}
          <SideSection label="AI Workspace" expanded={sidebarCollapsed || expandedSections['AI Workspace']} onToggle={() => toggleSection('AI Workspace')} collapsed={sidebarCollapsed}>
            {WORKSPACE_ITEMS.filter(({ label }) => !sidebarCollapsed || ['AI Chat', 'Voice Studio', 'Image Studio', 'Video Studio'].includes(label)).map(({ Icon, label }) => (
              <SideItem key={label} label={label} icon={<Icon />} collapsed={sidebarCollapsed} active={activeNav === label} onClick={() => navigateTo(label)} />
            ))}
          </SideSection>

          {/* Explore */}
          {!sidebarCollapsed && <SideSection label="Explore" expanded={expandedSections.Explore} onToggle={() => toggleSection('Explore')} collapsed={sidebarCollapsed}>
            {EXPLORE_ITEMS.map(({ Icon, label }) => (
              <SideItem key={label} label={label} icon={<Icon />} collapsed={sidebarCollapsed} active={activeNav === label} onClick={() => { setActiveNav(label); notify(`${label} opened`) }} />
            ))}
          </SideSection>}

        </div>

        {/* User profile */}
        {profileOpen && (
          <div ref={profileMenuRef} role="menu" aria-label="Profile menu" style={{ position: 'absolute', zIndex: 20, left: sidebarCollapsed ? 72 : 12, bottom: 72, width: 240, background: '#fff', border: '1px solid #EAECEF', borderRadius: 16, boxShadow: '0 12px 30px rgba(0,0,0,0.18)', padding: 8, animation: 'payvora-menu-in 200ms ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px 12px', borderBottom: '1px solid #EAECEF' }}>
              <Avatar initials="AJ" size={32} />
              <div>
                <p style={{ margin: 0, color: '#111', fontSize: 12, fontWeight: 600 }}>Ademola Johnson</p>
                <p style={{ margin: '2px 0 0', color: '#a855f7', fontSize: 10 }}>Pro Plan</p>
              </div>
            </div>
            <div style={{ paddingTop: 6 }}>
              {['Settings', 'Billing', 'Help & Support', 'Keyboard Shortcuts', 'API Keys', 'Theme', 'Language'].map(label => (
                <button key={label} type="button" role="menuitem" className="payvora-menu-item" onClick={() => { notify(`${label} opened`); setProfileOpen(false) }} style={profileMenuItem}>{label}</button>
              ))}
              <button type="button" role="menuitem" className="payvora-menu-item" onClick={() => { notify('Signed out'); setProfileOpen(false) }} style={{ ...profileMenuItem, color: '#dc2626', marginTop: 4, borderTop: '1px solid #EAECEF', paddingTop: 10 }}>Sign Out</button>
            </div>
          </div>
        )}
        <div style={{ padding: '12px 12px 16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button type="button" aria-haspopup="menu" aria-expanded={profileOpen} className={sidebarCollapsed ? 'payvora-collapsed-utility' : undefined} data-tooltip={sidebarCollapsed ? 'Profile' : undefined} onClick={() => setProfileOpen(value => !value)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', color: '#fff' }}>
            <Avatar initials="AJ" size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, color: '#fff', fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: sidebarCollapsed ? 0 : 1, transition: 'opacity 180ms ease' }}>Ademola Johnson</p>
              <p style={{ margin: 0, color: '#a855f7', fontSize: 10, marginTop: 1, opacity: sidebarCollapsed ? 0 : 1, transition: 'opacity 180ms ease' }}>Pro Plan</p>
            </div>
            {!sidebarCollapsed && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d={profileOpen ? 'M3 7.5L6 4.5L9 7.5' : 'M3 4.5L6 7.5L9 4.5'} stroke="rgba(255,255,255,0.4)" strokeWidth="1.4" strokeLinecap="round"/></svg>}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
      <main style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', background: C.page, overflow: 'hidden' }}>

        {/* Top bar */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, padding: '0 24px', height: 56, background: C.page, borderBottom: '1px solid rgba(0,0,0,0.06)', flexShrink: 0 }}>
          <button type="button" onClick={() => notify('Upgrade options opened')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', border: `1px solid ${C.brand}40`, borderRadius: 20, background: 'transparent', color: C.brand, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill={C.brand}><path d="M6 .5l1.3 4H12L8.5 7l1.3 4L6 9 2.2 11l1.3-4L0 4.5h4.7z"/></svg>
            Upgrade
          </button>
          <div ref={notificationsRef} style={{ position: 'relative' }}>
          <button type="button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen(value => !value)} style={iconBtn}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5a5 5 0 015 5V9l1.5 2H1.5L3 9V6.5a5 5 0 015-5zM6.5 13.5a1.5 1.5 0 003 0" stroke="#555" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
          {notificationsOpen && <div role="status" style={{ position: 'absolute', top: 42, right: 0, zIndex: 12, width: 220, background: '#fff', border: '1px solid #EAECEF', borderRadius: 14, boxShadow: '0 12px 30px rgba(0,0,0,0.14)', padding: 14, animation: 'payvora-menu-in 200ms ease-out' }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#111' }}>Notifications</p>
            <p style={{ margin: '8px 0 0', fontSize: 11, color: 'rgba(0,0,0,0.45)', lineHeight: 1.45 }}>You’re all caught up.</p>
          </div>}
          </div>
          <button type="button" aria-label="Open profile menu" aria-haspopup="menu" onClick={() => setProfileOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', background: 'transparent', border: 'none', padding: 0 }}>
            <Avatar initials="AJ" size={32} />
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="#555" strokeWidth="1.4" strokeLinecap="round"/></svg>
          </button>
        </header>

        {/* Scrollable body */}
        <div className={isFixedStudio ? 'payvora-main-scroll studio-main-scroll' : 'payvora-main-scroll'} style={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', padding: isStudio ? 0 : '32px 32px 0' }}>
          {activeNav === 'Voice Studio' ? (
            <div className="voice-studio-page">
              <VoiceStudioApp />
            </div>
          ) : activeNav === 'Image Studio' ? (
            <ImageStudio onBack={() => navigateTo('AI Chat', false)} onNotify={notify} />
          ) : activeNav === 'Video Studio' ? (
            <VideoStudio onBack={() => navigateTo('AI Chat', false)} onNotify={notify} />
          ) : (
            <>

          {/* Greeting */}
      <div style={{ marginBottom: 24 }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#000', letterSpacing: '-0.02em' }}>Good afternoon, Ademola 👋</h1>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: 'rgba(0,0,0,0.45)' }}>What would you like to create today?</p>
          </div>

          {/* Studio cards */}
          <div className="payvora-studio-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
            {STUDIO_CARDS.map(({ bg, fg, Icon, title, sub }) => (
              <div key={title} role="button" tabIndex={0} aria-label={`Open ${title}`} onClick={() => navigateTo(title)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigateTo(title) } }} style={{ background: C.card, border: '1px solid rgba(0,0,0,0.06)', borderRadius: 20, padding: 20, cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.07)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div style={{ width: 48, height: 48, background: bg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Icon color={fg} />
                </div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#000' }}>{title}</p>
                <p style={{ margin: '4px 0 12px', fontSize: 12, color: 'rgba(0,0,0,0.45)', lineHeight: 1.5 }}>{sub}</p>
                <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.3)' }}>→</span>
              </div>
            ))}
          </div>

          {/* Chat panel */}
          <div style={{ background: C.card, border: '1px solid rgba(0,0,0,0.06)', borderRadius: 20, padding: '24px 24px 0', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, background: C.brand, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L13 4.5V9.5L7 13L1 9.5V4.5L7 1Z" fill="white" fillOpacity="0.85"/>
                  <path d="M7 4L10 5.8V8.8L7 10.5L4 8.8V5.8L7 4Z" fill="white"/>
                </svg>
              </div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#000', letterSpacing: '-0.02em' }}>How can I help you today?</h2>
            </div>

            {/* Quick action chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
              {QUICK.map(({ emoji, label }) => (
                <button key={label} type="button" onClick={() => chooseQuickAction(label)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 24, background: C.card, color: 'rgba(0,0,0,0.65)', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.hover; e.currentTarget.style.borderColor = `${C.brand}40` }}
                  onMouseLeave={e => { e.currentTarget.style.background = C.card; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)' }}
                >
                  <span style={{ fontSize: 12 }}>{emoji}</span>{label}
                </button>
              ))}
              <button type="button" onClick={() => notify('More actions opened')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 24, background: C.card, color: 'rgba(0,0,0,0.65)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                ··· More
              </button>
            </div>

            <div style={{ height: 32 }} />
          </div>

          {/* Message input */}
          <div style={{ background: C.card, border: '1px solid rgba(0,0,0,0.09)', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.05)', marginBottom: 0 }}>
            <div style={{ padding: '14px 16px 8px' }}>
              <input
                type="text"
                ref={messageInputRef}
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && message.trim()) { e.preventDefault(); notify('Message sent'); setMessage('') } }}
                placeholder="Message Payvora AI..."
                style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: '#000', lineHeight: 1.5 }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {[PlusI, GlobeI, AttachI, MicI].map((Icon, i) => (
                  <button key={i} type="button" aria-label={['Add attachment', 'Browse web', 'Attach file', 'Use voice input'][i]} onClick={() => notify(['Add attachment', 'Browse web', 'Attach file', 'Voice input'][i])} style={inputIconBtn}>
                    <Icon />
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div ref={modelMenuRef} style={{ position: 'relative' }}>
                <button type="button" aria-haspopup="listbox" aria-expanded={modelOpen} onClick={() => setModelOpen(value => !value)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 10, background: 'transparent', fontSize: 12, color: 'rgba(0,0,0,0.6)', cursor: 'pointer' }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="#999" strokeWidth="1.2"/><path d="M6.5 4v3l2 2" stroke="#999" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  {selectedModel}
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d={modelOpen ? 'M2.5 6L5 3.5L7.5 6' : 'M2.5 4L5 6.5L7.5 4'} stroke="#999" strokeWidth="1.2" strokeLinecap="round"/></svg>
                </button>
                {modelOpen && <div role="listbox" aria-label="Choose model" style={{ position: 'absolute', right: 0, bottom: 42, zIndex: 12, width: 130, background: '#fff', border: '1px solid #EAECEF', borderRadius: 12, boxShadow: '0 12px 30px rgba(0,0,0,0.14)', padding: 5, animation: 'payvora-menu-in 200ms ease-out' }}>
                  {['GPT-4o', 'GPT-4o mini', 'Reasoning'].map(model => <button key={model} type="button" role="option" aria-selected={selectedModel === model} className="payvora-menu-item" onClick={() => { setSelectedModel(model); setModelOpen(false); notify(`${model} selected`) }} style={{ ...profileMenuItem, color: selectedModel === model ? C.brand : '#222', fontWeight: selectedModel === model ? 600 : 400 }}>{model}</button>)}
                </div>}
                </div>
                <button type="button" aria-label="Send message" disabled={!message.trim()} onClick={() => { notify('Message sent'); setMessage('') }} style={{ width: 34, height: 34, background: '#111', borderRadius: 10, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: message.trim() ? 'pointer' : 'not-allowed', opacity: message.trim() ? 1 : 0.45 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 12V2M3 6l4-4 4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(0,0,0,0.3)', padding: '12px 0 24px' }}>Payvora AI can make mistakes. Check important info.</p>
            </>
          )}
        </div>
      </main>

      {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────────── */}
      {!isStudio && (
      <aside style={{ width: 316, flexShrink: 0, minHeight: 0, background: C.page, borderLeft: '1px solid #EAECEF', overflowY: 'auto', overscrollBehavior: 'contain' }}>
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* CARD 1 — Recent Projects */}
          <div style={rCard}>
            <div style={rCardHeader}>
              <span style={rCardTitle}>Recent Projects</span>
              <button type="button" onClick={() => notify('Showing all recent projects')} style={rViewAll}>View all</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {RECENT_PROJECTS.map(({ bg, fg, Icon, title, time }, i) => (
                <ProjectRow key={title} bg={bg} fg={fg} Icon={Icon} title={title} time={time} last={i === RECENT_PROJECTS.length - 1} onClick={() => notify(`${title} opened`)} />
              ))}
            </div>

            <div style={{ marginTop: 4, paddingTop: 12, borderTop: '1px solid #EAECEF' }}>
              <button type="button" onClick={() => notify('Showing all projects')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 12, color: 'rgba(0,0,0,0.45)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, letterSpacing: '-0.01em' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#000')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(0,0,0,0.45)')}
              >
                View all projects
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>

          {/* CARD 2 — Tools */}
          <div style={rCard}>
            <div style={rCardHeader}>
              <span style={rCardTitle}>Tools</span>
              <button type="button" onClick={() => notify('Showing all tools')} style={rViewAll}>View all</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {TOOLS.map(({ bg, fg, Icon, label }) => (
                <ToolRow key={label} bg={bg} fg={fg} Icon={Icon} label={label} onClick={() => {
                  const target = label === 'Image to Image' ? 'Image Studio' : label === 'Text to Video' ? 'Video Studio' : label.includes('Speech') ? 'Voice Studio' : label
                  navigateTo(target)
                }} />
              ))}
            </div>
          </div>

          {/* CARD 3 — Usage */}
          <div style={rCard}>
            <div style={rCardHeader}>
              <span style={rCardTitle}>Usage</span>
              <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.38)', fontWeight: 400 }}>Resets in 12 days</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <UsageBar label="AI Messages"      cur={12540} max={50000} color="#9333ea" />
              <UsageBar label="Voice Generation" cur={45}    max={200}   color="#16a34a" unit="mins" />
              <UsageBar label="Image Generation" cur={320}   max={1000}  color="#3b82f6" />
            </div>
          </div>

        </div>
      </aside>
      )}

      {interactionMessage && (
        <div role="status" style={{ position: 'fixed', left: '50%', bottom: 24, zIndex: 40, transform: 'translateX(-50%)', background: '#13161C', color: '#fff', borderRadius: 10, padding: '9px 14px', fontSize: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.16)', animation: 'payvora-menu-in 200ms ease-out' }}>
          {interactionMessage}
        </div>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────

function Avatar({ initials, size = 32 }: { initials: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size, background: 'linear-gradient(135deg,#fb923c,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: size * 0.35, fontWeight: 700, flexShrink: 0 }}>
      {initials}
    </div>
  )
}

function SideSection({ label, children, expanded, onToggle, collapsed }: { label: string; children: React.ReactNode; expanded: boolean; onToggle: () => void; collapsed: boolean }) {
  return (
    <div style={{ marginBottom: 24 }}>
      {!collapsed && <button type="button" aria-expanded={expanded} aria-label={`${expanded ? 'Collapse' : 'Expand'} ${label}`} onClick={onToggle} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 8px 6px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', textAlign: 'left' }}>
        <span style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 200ms ease' }}>
          <path d="M3 4.5L6 7.5L9 4.5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </button>}
      <div aria-hidden={!expanded} style={{ maxHeight: expanded ? 1000 : 0, opacity: expanded ? 1 : 0, overflow: 'hidden', transition: 'max-height 220ms ease, opacity 180ms ease' }}>
        {children}
      </div>
    </div>
  )
}

function SideItem({ label, icon, active, onClick, collapsed }: { label: string; icon?: React.ReactNode; active?: boolean; onClick: () => void; collapsed: boolean }) {
  const [hov, setHov] = useState(false)
  const [tooltipY, setTooltipY] = useState(0)
  const btnRef = useRef<HTMLButtonElement>(null)
  const bg = active ? '#23252E' : hov ? '#21232B' : 'transparent'

  const handleMouseEnter = () => {
    setHov(true)
    if (collapsed && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setTooltipY(rect.top + rect.height / 2)
    }
  }

  return (
    <button
      ref={btnRef}
      type="button"
      aria-label={label}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHov(false)}
      className="payvora-side-item"
      style={{ width: '100%', minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 8, padding: collapsed ? 0 : '7px 10px', borderRadius: 10, border: 'none', background: bg, color: active ? '#fff' : 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: active ? 500 : 400, cursor: 'pointer', textAlign: 'left', transition: 'background 180ms ease, color 180ms ease, transform 180ms ease' }}
    >
      {icon && <span className="payvora-side-icon" style={{ width: 22, height: 22, opacity: active ? 1 : 0.75, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</span>}
      <span style={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto', overflow: 'hidden', whiteSpace: 'nowrap', transition: 'opacity 180ms ease, width 220ms ease' }}>{label}</span>
      {collapsed && hov && (
        <span
          className="payvora-sidebar-tooltip payvora-sidebar-tooltip--fixed"
          role="tooltip"
          style={{ top: tooltipY }}
        >
          {label}
        </span>
      )}
    </button>
  )
}

// Right sidebar card style tokens
const rCard: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid #EAECEF',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
}
const rCardHeader: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,
}
const rCardTitle: React.CSSProperties = {
  fontSize: 13, fontWeight: 650, color: '#000', letterSpacing: '-0.01em',
}
const rViewAll: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'rgba(0,0,0,0.4)', fontWeight: 500, padding: 0, lineHeight: 1,
}
const profileMenuItem: React.CSSProperties = {
  display: 'block', width: '100%', padding: '8px 10px', border: 'none', borderRadius: 9, background: 'transparent', color: '#222', fontSize: 12, fontWeight: 400, textAlign: 'left', cursor: 'pointer', transition: 'background 180ms ease, color 180ms ease',
}

function ProjectRow({ bg, fg, Icon, title, time, last, onClick }: { bg: string; fg: string; Icon: React.FC<IconProps>; title: string; time: string; last: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open ${title}`}
      onClick={onClick}
      onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onClick() } }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 10, cursor: 'pointer', background: hov ? '#FFF2F0' : 'transparent', transition: 'background 0.13s', marginBottom: last ? 0 : 2 }}
    >
      <div style={{ width: 36, height: 36, background: bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon color={fg} size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#000', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</p>
        <p style={{ margin: '3px 0 0', fontSize: 11, color: 'rgba(0,0,0,0.38)', lineHeight: 1 }}>{time}</p>
      </div>
    </div>
  )
}

function ToolRow({ bg, fg, Icon, label, onClick }: { bg: string; fg: string; Icon: React.FC<IconProps>; label: string; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open ${label}`}
      onClick={onClick}
      onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onClick() } }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 8px', borderRadius: 10, cursor: 'pointer', background: hov ? '#FFF2F0' : 'transparent', transition: 'background 0.13s' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 32, height: 32, background: bg, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon color={fg} size={14} />
        </div>
        <span style={{ fontSize: 13, color: '#000', fontWeight: 450, letterSpacing: '-0.01em' }}>{label}</span>
      </div>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M5 3.5L8.5 7L5 10.5" stroke="rgba(0,0,0,0.28)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

function UsageBar({ label, cur, max, color, unit = '' }: { label: string; cur: number; max: number; color: string; unit?: string }) {
  const pct = Math.min(100, Math.round((cur / max) * 100))
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 7 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: '#000', letterSpacing: '-0.01em' }}>{label}</span>
        <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.38)', fontVariantNumeric: 'tabular-nums' }}>
          {cur.toLocaleString()} / {max.toLocaleString()}{unit ? ' ' + unit : ''}
        </span>
      </div>
      <div style={{ height: 5, background: '#EAECEF', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

// ── Inline styles ─────────────────────────────────────────────────────────

const ghostBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center'
}
const iconBtn: React.CSSProperties = {
  width: 34, height: 34, background: 'none', border: 'none', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
}
const inputIconBtn: React.CSSProperties = {
  width: 32, height: 32, background: 'none', border: 'none', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(0,0,0,0.45)'
}
const groupLabel: React.CSSProperties = {
  margin: '6px 0 2px', padding: '0 8px', fontSize: 9.5, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500
}
const viewAllBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'rgba(255,255,255,0.4)', padding: '4px 8px', display: 'block'
}

// ── Icon Library ──────────────────────────────────────────────────────────

type IconProps = { color?: string; size?: number }

// Sidebar (white stroke icons)
function ChatIcon() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 2.5C1.5 1.8 2 1.5 2.5 1.5h8c.8 0 1.5.7 1.5 1.5v5.5c0 .8-.7 1.5-1.5 1.5H4L1.5 12V2.5z" stroke="currentColor" strokeWidth="1.3"/></svg> }
function MicIcon() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="4.5" y="1" width="4" height="7" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M2.5 6.5a4 4 0 008 0M6.5 11v1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> }
function ImgIcon() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="4.5" cy="4.5" r="1.2" fill="currentColor"/><path d="M1 9.5l3-3 2 2 2-2.5 3 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/></svg> }
function VidIcon() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="3" width="8" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M9 5.5l3.5-2v6L9 7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/></svg> }
function FileIcon() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M3 1h5l3 3v8H3V1z" stroke="currentColor" strokeWidth="1.3" fill="none"/><path d="M8 1v3h3" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M4.5 6.5h4M4.5 8.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function AgentIcon() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1.5 12c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> }
function GridIcon() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/><rect x="7" y="1" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/><rect x="1" y="7" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/><rect x="7" y="7" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/></svg> }
function BookIcon() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2.5C2 1.7 2.7 1 3.5 1H11v11H3.5A1.5 1.5 0 012 10.5V2.5z" stroke="currentColor" strokeWidth="1.3" fill="none"/><path d="M2 10.5A1.5 1.5 0 003.5 12H11" stroke="currentColor" strokeWidth="1.3"/><path d="M5 4h4M5 6.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function FolderIcon() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 3.5C1 2.7 1.7 2 2.5 2H5l1.5 1.5H10.5c.8 0 1.5.7 1.5 1.5V10c0 .8-.7 1.5-1.5 1.5H2.5C1.7 11.5 1 10.8 1 10V3.5z" stroke="currentColor" strokeWidth="1.3" fill="none"/></svg> }
function PlugIcon() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M4 1.5v3M9 1.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><rect x="2" y="4.5" width="9" height="3.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M6.5 8v3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> }
function GearIcon() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M6.5 1v1.5M6.5 10V11.5M1 6.5h1.5M10 6.5h1.5M2.6 2.6l1.1 1.1M9.3 9.3l1.1 1.1M2.6 10.4l1.1-1.1M9.3 3.7l1.1-1.1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> }
function CardIcon() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="2.5" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 5.5h11" stroke="currentColor" strokeWidth="1.3"/><path d="M3 8.5h2M3 9.5h1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function HelpIcon() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 5a1.5 1.5 0 013 .5c0 1-1.5 1.5-1.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="6.5" cy="9.5" r=".5" fill="currentColor"/></svg> }

// Studio card icons (filled / colorful)
function ChatBubbleIcon({ color }: IconProps) { return <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 3C3 2 3.9 1 5 1h12c1.1 0 2 .9 2 2v9c0 1.1-.9 2-2 2H7L3 18V3z" stroke={color} strokeWidth="1.8" fill={color + '20'}/><path d="M7 7h8M7 10h5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg> }
function MicFillIcon({ color }: IconProps) { return <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="7" y="2" width="8" height="11" rx="4" stroke={color} strokeWidth="1.8" fill={color + '20'}/><path d="M4 11a7 7 0 0014 0M11 18v3" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg> }
function ImgFillIcon({ color }: IconProps) { return <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="2" width="18" height="18" rx="4" stroke={color} strokeWidth="1.8" fill={color + '20'}/><circle cx="7.5" cy="7.5" r="2" fill={color}/><path d="M2 15l5-5 3.5 3.5 3-3.5L20 16" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none"/></svg> }
function VidFillIcon({ color }: IconProps) { return <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="4" width="13" height="14" rx="3" stroke={color} strokeWidth="1.8" fill={color + '20'}/><path d="M15 9l6-4v12l-6-4" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none"/></svg> }

// Right sidebar project icons
function WaveIcon({ color, size = 16 }: IconProps) { return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><path d="M1 8h1.5V5.5h1.5V11H5.5V4.5H7V13h1.5V2H10v12h1.5V5H13v6h1.5V8" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none"/></svg> }
function BrandIcon({ color, size = 16 }: IconProps) { return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="14" rx="3" stroke={color} strokeWidth="1.4"/><circle cx="5.5" cy="5.5" r="1.5" fill={color}/><path d="M1 11l4-4 2.5 2.5 2-3 4 4.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none"/></svg> }
function ScriptIcon({ color, size = 16 }: IconProps) { return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><path d="M3 1h7l3 3v11H3V1z" stroke={color} strokeWidth="1.4" fill="none"/><path d="M10 1v3h3" stroke={color} strokeWidth="1.2"/><path d="M5 7h6M5 9.5h5M5 12h4" stroke={color} strokeWidth="1.1" strokeLinecap="round"/></svg> }

// Tool icons
function Spk1Icon({ color, size = 13 }: IconProps) { return <svg width={size} height={size} viewBox="0 0 13 13" fill="none"><path d="M1.5 4h5.5l2 2-2 2H1.5V4z" stroke={color} strokeWidth="1.2" fill="none"/><path d="M9 5.5c1.2.4 2 1.2 2 2.5s-.8 2.1-2 2.5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/></svg> }
function Spk2Icon({ color, size = 13 }: IconProps) { return <svg width={size} height={size} viewBox="0 0 13 13" fill="none"><rect x="4.5" y="1" width="4" height="6.5" rx="2" stroke={color} strokeWidth="1.2"/><path d="M2.5 6.5a4 4 0 008 0M6.5 10v2" stroke={color} strokeWidth="1.2" strokeLinecap="round"/></svg> }
function I2IIcon({ color, size = 13 }: IconProps) { return <svg width={size} height={size} viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="10" height="8" rx="1.8" stroke={color} strokeWidth="1.2"/><path d="M1 7.5l3-3 2 2 2-2.5 3 3" stroke={color} strokeWidth="1.1" strokeLinecap="round" fill="none"/><path d="M7 11h5M10 9.5l2 1.5-2 1.5" stroke={color} strokeWidth="1.1" strokeLinecap="round"/></svg> }
function T2VIcon({ color, size = 13 }: IconProps) { return <svg width={size} height={size} viewBox="0 0 13 13" fill="none"><rect x="1" y="3" width="8" height="7" rx="1.5" stroke={color} strokeWidth="1.2"/><path d="M9 5.5l3.5-2v5L9 7" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none"/></svg> }
function CodeIcon({ color, size = 13 }: IconProps) { return <svg width={size} height={size} viewBox="0 0 13 13" fill="none"><path d="M4.5 4L1.5 6.5L4.5 9M8.5 4L11.5 6.5L8.5 9M7 1.5l-1.5 10" stroke={color} strokeWidth="1.2" strokeLinecap="round"/></svg> }

// Input bar icons
function PlusI() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2.5v9M2.5 7h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function GlobeI() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/><path d="M7 1.5c-2 2.5-2 8.5 0 11M1.5 7h11" stroke="currentColor" strokeWidth="1.1"/></svg> }
function AttachI() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12 6.5L6.5 12A4 4 0 011 7L7 1A2.5 2.5 0 0110.5 4.5L5 10A1 1 0 013.5 8.5L9 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> }
function MicI() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="4.5" y="1" width="5" height="7.5" rx="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2.5 7a4.5 4.5 0 009 0M7 12v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> }
