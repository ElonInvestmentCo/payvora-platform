import { useRef, useState } from 'react'

export type WorkspaceTool = 'review' | 'terminal' | 'browser' | 'files'

type WorkspaceControlsProps = {
  bottomPanelOpen: boolean
  rightPanelOpen: boolean
  onToggleBottomPanel: () => void
  onToggleRightPanel: () => void
}

type RightWorkspacePanelProps = {
  activeTool: WorkspaceTool | null
  onSelectTool: (tool: WorkspaceTool) => void
  onClose: () => void
}

export function WorkspaceControls({ bottomPanelOpen, rightPanelOpen, onToggleBottomPanel, onToggleRightPanel }: WorkspaceControlsProps) {
  return (
    <div className="payvora-workspace-controls" aria-label="Workspace layout controls">
      <button
        type="button"
        className="payvora-workspace-control"
        aria-label={bottomPanelOpen ? 'Hide terminal panel' : 'Show terminal panel'}
        aria-pressed={bottomPanelOpen}
        title={bottomPanelOpen ? 'Hide terminal panel' : 'Show terminal panel'}
        onClick={onToggleBottomPanel}
      >
        <BottomPanelIcon />
      </button>
      <button
        type="button"
        className="payvora-workspace-control"
        aria-label={rightPanelOpen ? 'Hide workspace panel' : 'Show workspace panel'}
        aria-pressed={rightPanelOpen}
        title={rightPanelOpen ? 'Hide workspace panel' : 'Show workspace panel'}
        onClick={onToggleRightPanel}
      >
        <RightPanelIcon />
      </button>
    </div>
  )
}

export function BottomWorkspacePanel({ onClose }: { onClose: () => void }) {
  return (
    <section className="payvora-bottom-workspace" aria-label="Terminal panel">
      <PanelTab title="Terminal" icon={<TerminalIcon />} onClose={onClose} />
      <TerminalSurface compact />
    </section>
  )
}

export function RightWorkspacePanel({ activeTool, onSelectTool, onClose }: RightWorkspacePanelProps) {
  const [width, setWidth] = useState(520)
  const [resizing, setResizing] = useState(false)
  const resizeStart = useRef<{ x: number; width: number } | null>(null)

  const startResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    resizeStart.current = { x: event.clientX, width }
    setResizing(true)

    const move = (moveEvent: PointerEvent) => {
      const start = resizeStart.current
      if (!start) return
      const max = Math.min(760, Math.max(390, window.innerWidth - 280))
      setWidth(Math.min(max, Math.max(360, start.width + start.x - moveEvent.clientX)))
    }
    const stop = () => {
      resizeStart.current = null
      setResizing(false)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', stop)
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop, { once: true })
  }

  return (
    <aside
      className={`payvora-right-workspace${resizing ? ' is-resizing' : ''}`}
      style={{ '--pv-workspace-panel-width': `${width}px` } as React.CSSProperties}
      aria-label="Workspace panel"
    >
      <button className="payvora-workspace-resize" aria-label="Resize workspace panel" title="Drag to resize" onPointerDown={startResize} />
      {activeTool === null ? (
        <WorkspaceLauncher onSelect={onSelectTool} />
      ) : (
        <WorkspaceToolSurface tool={activeTool} onBack={() => onSelectTool('review')} onClose={onClose} />
      )}
    </aside>
  )
}

function WorkspaceLauncher({ onSelect }: { onSelect: (tool: WorkspaceTool) => void }) {
  const options: Array<{ tool: WorkspaceTool; label: string; shortcut?: string; icon: React.ReactNode }> = [
    { tool: 'review', label: 'Review', shortcut: 'Ctrl+Shift+G', icon: <ReviewIcon /> },
    { tool: 'terminal', label: 'Terminal', icon: <TerminalIcon /> },
    { tool: 'browser', label: 'Browser', shortcut: 'Ctrl+T', icon: <BrowserIcon /> },
    { tool: 'files', label: 'Files', shortcut: 'Ctrl+P', icon: <FilesIcon /> },
  ]

  return (
    <div className="payvora-workspace-launcher" role="menu" aria-label="Open workspace tool">
      {options.map(({ tool, label, shortcut, icon }) => (
        <button key={tool} type="button" role="menuitem" className="payvora-workspace-launcher-item" onClick={() => onSelect(tool)}>
          <span className="payvora-workspace-tool-icon" aria-hidden>{icon}</span>
          <span>{label}</span>
          {shortcut && <kbd>{shortcut}</kbd>}
        </button>
      ))}
    </div>
  )
}

function WorkspaceToolSurface({ tool, onBack, onClose }: { tool: WorkspaceTool; onBack: () => void; onClose: () => void }) {
  const titles: Record<WorkspaceTool, string> = { review: 'Review', terminal: 'Terminal', browser: 'New tab', files: 'Open file' }
  const icons: Record<WorkspaceTool, React.ReactNode> = { review: <ReviewIcon />, terminal: <TerminalIcon />, browser: <BrowserIcon />, files: <FilesIcon /> }
  const [branchMenuOpen, setBranchMenuOpen] = useState(false)
  const [address, setAddress] = useState('')
  const [openedAddress, setOpenedAddress] = useState('')

  return (
    <div className="payvora-workspace-tool">
      <PanelTab title={titles[tool]} icon={icons[tool]} onClose={onClose} />
      {tool === 'review' && (
        <>
          <div className="payvora-review-toolbar">
            <div className="payvora-branch-menu">
              <button type="button" className="payvora-branch-button" aria-expanded={branchMenuOpen} onClick={() => setBranchMenuOpen(open => !open)}>
                Branch <ChevronIcon />
              </button>
              {branchMenuOpen && (
                <div className="payvora-branch-popover" role="menu">
                  {['Last Turn', 'Uncommitted', 'Unstaged', 'Staged', 'Committed', 'Branch'].map((option, index) => (
                    <button key={option} type="button" role="menuitem" className={index === 5 ? 'is-selected' : ''} onClick={() => setBranchMenuOpen(false)}>
                      {option}{option === 'Committed' && <span aria-hidden>›</span>}{option === 'Branch' && <span aria-hidden>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="payvora-review-branch">main <span aria-hidden>→</span> origin/main <ChevronIcon /></span>
          </div>
          <div className="payvora-workspace-empty">
            <ReviewEmptyIcon />
            <strong>No file changes yet</strong>
            <span>Changes in this workspace will appear here.</span>
          </div>
        </>
      )}
      {tool === 'terminal' && <TerminalSurface />}
      {tool === 'browser' && (
        <div className="payvora-browser-surface">
          <form className="payvora-browser-address" onSubmit={event => { event.preventDefault(); setOpenedAddress(address.trim()) }}>
            <button type="button" aria-label="Back" disabled>‹</button>
            <button type="button" aria-label="Forward" disabled>›</button>
            <button type="button" aria-label="Refresh" onClick={() => setOpenedAddress('')}>↻</button>
            <input aria-label="Enter a URL" placeholder="Enter a URL" value={address} onChange={event => setAddress(event.target.value)} />
            <button type="submit" aria-label="Open URL">↗</button>
          </form>
          <div className="payvora-workspace-empty">
            <BrowserIcon />
            <strong>{openedAddress ? 'Ready to browse' : 'Start browsing'}</strong>
            <span>{openedAddress || 'Enter a URL to open a page'}</span>
          </div>
        </div>
      )}
      {tool === 'files' && <FilesSurface />}
      {tool !== 'review' && (
        <button type="button" className="payvora-workspace-back" onClick={onBack}>Open Review</button>
      )}
    </div>
  )
}

function PanelTab({ title, icon, onClose }: { title: string; icon: React.ReactNode; onClose: () => void }) {
  return (
    <div className="payvora-workspace-tabbar">
      <div className="payvora-workspace-tab"><span aria-hidden>{icon}</span>{title}</div>
      <button type="button" className="payvora-workspace-tab-close" aria-label={`Close ${title}`} onClick={onClose}>×</button>
      <button type="button" className="payvora-workspace-tab-add" aria-label="Add workspace tab">+</button>
    </div>
  )
}

function TerminalSurface({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`payvora-terminal-surface${compact ? ' is-compact' : ''}`} aria-label="Windows PowerShell terminal">
      <p>Windows PowerShell</p>
      <p>Copyright (C) Microsoft Corporation. All rights reserved.</p>
      <p className="payvora-terminal-prompt">PS C:\\Users\\deept\\payvora-ai-platform&gt;<span aria-hidden /></p>
    </div>
  )
}

function FilesSurface() {
  const files = ['artifacts', 'attached_assets', 'lib', 'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', 'replit.md']
  return (
    <div className="payvora-files-surface">
      <div className="payvora-files-header">/ <button type="button" aria-label="New folder">▢</button></div>
      <div className="payvora-files-content">
        <input aria-label="Filter files" type="search" placeholder="Filter files..." />
        <ul aria-label="Workspace files">
          {files.map((file, index) => <li key={file}><span aria-hidden>{index < 3 ? '›' : '◻'}</span>{file}</li>)}
        </ul>
      </div>
    </div>
  )
}

function BottomPanelIcon() { return <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden><rect x="3" y="3.6" width="14" height="12.8" rx="2.2" stroke="currentColor" strokeWidth="1.45" /><path d="M4.5 12.1h11" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" /></svg> }
function RightPanelIcon() { return <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden><rect x="3" y="3.6" width="14" height="12.8" rx="2.2" stroke="currentColor" strokeWidth="1.45" /><path d="M12.1 4.8v10.4" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" /></svg> }
function TerminalIcon() { return <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><rect x="2.8" y="3.4" width="14.4" height="13.2" rx="2.3" stroke="currentColor" strokeWidth="1.45"/><path d="m6 8 2 2-2 2M10.7 12h3.3" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function ReviewIcon() { return <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><rect x="4" y="3.4" width="12" height="13.2" rx="2" stroke="currentColor" strokeWidth="1.45"/><path d="M7 8h6M7 11.5h4.1" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round"/><path d="M8 5.4v3.2M6.4 7h3.2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/></svg> }
function BrowserIcon() { return <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.1" stroke="currentColor" strokeWidth="1.45"/><path d="M2.9 10h14.2M10 2.9c2 2 3.1 4.4 3.1 7.1S12 15.1 10 17.1C8 15.1 6.9 12.7 6.9 10S8 4.9 10 2.9Z" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round"/></svg> }
function FilesIcon() { return <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><path d="M2.8 6.5A2.2 2.2 0 0 1 5 4.3h3.2l1.6 1.9h5.3a2.2 2.2 0 0 1 2.1 2.2v5.1a2.2 2.2 0 0 1-2.1 2.2H4.9a2.2 2.2 0 0 1-2.1-2.2V6.5Z" stroke="currentColor" strokeWidth="1.45" strokeLinejoin="round"/></svg> }
function ChevronIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function ReviewEmptyIcon() { return <svg width="76" height="76" viewBox="0 0 76 76" fill="none" aria-hidden><path d="M26 14h23l11 11-8.6 34.5a7 7 0 0 1-8.5 5.1L18 58.4a7 7 0 0 1-5.1-8.5l8.7-29.5A7 7 0 0 1 26 14Z" stroke="currentColor" strokeWidth="1.35"/><path d="M49 14v11h11M30 42h16M38 34v16" stroke="currentColor" strokeWidth="3.8" strokeLinecap="round"/></svg> }
