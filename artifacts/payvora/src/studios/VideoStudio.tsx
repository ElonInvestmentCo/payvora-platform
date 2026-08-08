import { useRef, useState, type ChangeEvent } from 'react'

const VIDEO_MODES = [
  { id: 'script', label: 'Script to Video', desc: 'Transform your script into a professional video', color: '#7C3AED', background: '#EDE9FE' },
  { id: 'article', label: 'Article to Video', desc: 'Convert articles or blog posts into videos', color: '#16A34A', background: '#DCFCE7' },
  { id: 'image', label: 'Image to Video', desc: 'Bring your images to life with AI', color: '#D97706', background: '#FEF3C7' },
  { id: 'upload', label: 'Upload Media', desc: 'Upload your clips and create a video', color: '#0284C7', background: '#E0F2FE' },
]

const TEMPLATES = [
  { id: 1, src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=320&h=180&fit=crop&auto=format', label: 'Tech Product Promo', ratio: '16:9' },
  { id: 2, src: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=320&h=180&fit=crop&auto=format', label: 'Business Explainer', ratio: '16:9' },
  { id: 3, src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=320&h=180&fit=crop&auto=format', label: 'Motivational', ratio: '9:16', isNew: true },
  { id: 4, src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=320&h=180&fit=crop&auto=format', label: 'Social Media Ad', ratio: '1:1', isNew: true },
  { id: 5, src: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=320&h=180&fit=crop&auto=format', label: 'Travel Vlog', ratio: '16:9' },
]

const RECENT_VIDEOS = [
  { id: 1, src: TEMPLATES[0].src, label: 'Product Launch Promo', duration: '00:45', time: '2 hours ago' },
  { id: 2, src: TEMPLATES[1].src, label: 'AI in Business Explainer', duration: '01:12', time: '1 day ago' },
  { id: 3, src: TEMPLATES[4].src, label: 'Travel Adventure Vlog', duration: '02:30', time: '3 days ago' },
]

const ASPECT_RATIOS = ['16:9', '9:16', '1:1', '4:3', '3:4']
const TABS = ['Create Video', 'Avatars', 'Templates', 'My Videos', 'History']

type Props = {
  onBack: () => void
  onNotify: (message: string) => void
}

export default function VideoStudio({ onBack, onNotify }: Props) {
  const [activeTab, setActiveTab] = useState('Create Video')
  const [selectedMode, setSelectedMode] = useState('script')
  const [script, setScript] = useState('')
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [quality, setQuality] = useState('High')
  const [musicEnabled, setMusicEnabled] = useState(true)
  const [uploadedMedia, setUploadedMedia] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<(typeof TEMPLATES)[number] | null>(null)
  const scriptInputRef = useRef<HTMLInputElement>(null)
  const mediaInputRef = useRef<HTMLInputElement>(null)
  const mode = VIDEO_MODES.find(item => item.id === selectedMode) ?? VIDEO_MODES[0]

  const handleScriptImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('text/') && !/\.(txt|md|rtf)$/i.test(file.name)) {
      onNotify('Choose a text, Markdown, or RTF file for the script.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setScript(String(reader.result ?? '').slice(0, 5000))
      onNotify(`${file.name} imported into your script`)
    }
    reader.readAsText(file)
  }

  const handleMediaUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadedMedia(file.name)
    onNotify(`${file.name} added to this video project`)
  }

  const appendScene = () => setScript(current => `${current}${current ? '\n\n' : ''}[New scene]\nDescribe what happens in this scene.`.slice(0, 5000))

  return (
    <section className="studio-page" aria-label="Video Studio">
      <div className="studio-page-heading">
        <button type="button" className="studio-back-button" onClick={onBack} aria-label="Back to AI Chat" title="Back to AI Chat"><VideoStudioIcon /></button>
        <div><h1>Video Studio</h1><p>Create professional videos with AI</p></div>
      </div>

      <nav className="studio-tabs" aria-label="Video Studio sections">
        {TABS.map(tab => <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={activeTab === tab ? 'is-active' : undefined}>{tab}</button>)}
      </nav>

      <div className="studio-workspace">
        <div className="studio-editor">
          <div className="video-mode-intro"><h2>Create a new video</h2><p>Choose how you want to create your video</p></div>
          <div className="video-mode-grid">
            {VIDEO_MODES.map(item => <button type="button" key={item.id} onClick={() => setSelectedMode(item.id)} className={selectedMode === item.id ? 'is-selected' : undefined}>
              <VideoModeIcon mode={item.id} color={item.color} background={item.background} />
              <span><strong>{item.label}</strong><small>{item.desc}</small></span><ArrowIcon />
            </button>)}
          </div>

          <div className="studio-card studio-prompt-card video-script-card">
            <div className="studio-card-heading">
              <div><h2>{mode.label}</h2><p>{selectedMode === 'script' ? 'Enter your script and customize your video' : mode.desc}</p></div>
              <div className="studio-inline-actions">
                <input ref={scriptInputRef} onChange={handleScriptImport} type="file" accept=".txt,.md,.rtf,text/plain,text/markdown" hidden />
                <input ref={mediaInputRef} onChange={handleMediaUpload} type="file" accept="video/*,image/*,audio/*" hidden />
                {selectedMode === 'upload' || selectedMode === 'image' ? <button type="button" onClick={() => mediaInputRef.current?.click()}><UploadIcon />Upload Media</button> : <button type="button" onClick={() => scriptInputRef.current?.click()}><UploadIcon />Import Script</button>}
                <button type="button" onClick={() => { setScript(''); setUploadedMedia(null); onNotify('Video input cleared') }}><TrashIcon />Clear</button>
              </div>
            </div>
            {uploadedMedia && <div className="studio-uploaded-file"><UploadIcon /><span>{uploadedMedia}</span><button type="button" onClick={() => setUploadedMedia(null)} aria-label="Remove uploaded media">×</button></div>}
            <textarea aria-label="Video script" value={script} onChange={event => setScript(event.target.value.slice(0, 5000))} placeholder={selectedMode === 'article' ? 'Paste an article or blog post here...' : selectedMode === 'image' ? 'Describe how the image should move...' : 'Enter your script here...'} maxLength={5000} />
            <div className="studio-prompt-footer"><span>{script.length} / 5000</span></div>
          </div>

          <div className="studio-action-row video-action-row">
            <div className="studio-chip-group">
              <button type="button" onClick={() => onNotify('AI rewriting needs a connected provider. The current script was left unchanged.')}><SparkleIcon />Improve with AI</button>
              <button type="button" onClick={appendScene}><GridIcon />Add Scene</button>
              <button type="button" onClick={() => onNotify('Voiceover settings are available in the settings panel.')}><MicIcon />Add Voiceover</button>
              <button type="button" onClick={() => onNotify('B-roll can be added after a video provider is connected.')}><VideoOutlineIcon />Add B-Roll</button>
            </div>
          </div>

          <div className="studio-section-heading"><h2>Popular Templates</h2><button type="button" onClick={() => setActiveTab('Templates')}>View all</button></div>
          <div className="video-template-grid">
            {TEMPLATES.map(template => <button key={template.id} type="button" className="video-template" onClick={() => { setSelectedTemplate(template); setAspectRatio(template.ratio); onNotify(`${template.label} template selected`) }}>
              <span className="video-template-image"><img src={template.src} alt={template.label} loading="lazy" />{template.isNew && <b>NEW</b>}<i><PlayIcon /></i></span><span className="video-template-copy"><strong>{template.label}</strong><small>{template.ratio}</small></span>
            </button>)}
          </div>
        </div>

        <aside className="studio-settings" aria-label="Video settings"><div className="studio-settings-inner">
          <h2 className="studio-settings-title">Settings</h2>
          <div className="studio-field"><div className="studio-field-label"><label htmlFor="video-model">Video Model</label><InfoIcon /></div><select id="video-model" defaultValue="Payvora Video v2" onChange={event => onNotify(`${event.target.value} selected`)}><option>Payvora Video v2</option><option>Payvora Video v1</option></select><p>Our most advanced video model</p></div>
          <div className="studio-field"><label>Aspect Ratio</label><div className="studio-option-grid">{ASPECT_RATIOS.map(ratio => <button type="button" key={ratio} onClick={() => setAspectRatio(ratio)} className={aspectRatio === ratio ? 'is-selected' : undefined}><AspectIcon ratio={ratio} />{ratio}</button>)}</div></div>
          <SettingsSelect label="Duration" values={['60 seconds', '30 seconds', '90 seconds']} onChange={onNotify} />
          <SettingsSelect label="Resolution" values={['1080p (Full HD)', '720p (HD)', '4K (Ultra HD)']} onChange={onNotify} />
          <div className="studio-settings-row"><label>Quality</label><div className="studio-quality-options">{['Standard', 'High'].map(value => <button type="button" key={value} onClick={() => setQuality(value)} className={quality === value ? 'is-selected' : undefined}>{value === 'High' && <SparkleIcon />}{value}</button>)}</div></div>
          <SettingsSelect label="Language" values={['English (US)', 'English (UK)', 'Spanish', 'French']} onChange={onNotify} />
          <SettingsSelect label="Voice" values={['Aria (Female)', 'Daniel (Male)', 'No voiceover']} onChange={onNotify} />
          <div className="studio-settings-row studio-music-row"><span><label>Music</label><small>Auto add background music</small></span><button type="button" aria-pressed={musicEnabled} aria-label="Auto add background music" onClick={() => setMusicEnabled(value => !value)} className={`studio-toggle ${musicEnabled ? 'is-on' : ''}`}><span /></button></div>
          <button type="button" className="studio-primary-button studio-video-generate" onClick={() => onNotify('Video generation requires a connected AI video provider. Your project settings are ready.')}>Generate Video<SparkleIcon /></button><p className="studio-credit-note">This will use 25 credits <InfoIcon /></p>
          <div className="studio-history video-history"><div className="studio-section-heading"><h2>Recent Videos</h2><button type="button" onClick={() => setActiveTab('History')}>View all</button></div>{RECENT_VIDEOS.map(video => <button key={video.id} type="button" className="studio-history-item video-history-item" onClick={() => onNotify(`${video.label} opened`)}><span className="video-thumb"><img src={video.src} alt="" /><PlayIcon /></span><span><strong>{video.label}</strong><small>{video.duration}</small></span><time>{video.time}</time></button>)}<button type="button" className="studio-all-videos" onClick={() => setActiveTab('My Videos')}>All videos →</button></div>
        </div></aside>
      </div>

      {selectedTemplate && <div className="studio-modal-backdrop" role="presentation" onMouseDown={() => setSelectedTemplate(null)}><div className="studio-image-modal studio-template-modal" role="dialog" aria-modal="true" aria-label={selectedTemplate.label} onMouseDown={event => event.stopPropagation()}><button type="button" aria-label="Close template preview" onClick={() => setSelectedTemplate(null)}>×</button><img src={selectedTemplate.src} alt={selectedTemplate.label} /><p>{selectedTemplate.label} · {selectedTemplate.ratio}</p><button type="button" className="studio-primary-button" onClick={() => { setSelectedTemplate(null); onNotify(`${selectedTemplate.label} template applied`) }}>Use this template</button></div></div>}
    </section>
  )
}

function SettingsSelect({ label, values, onChange }: { label: string; values: string[]; onChange: (message: string) => void }) { return <div className="studio-settings-row"><label>{label}</label><select defaultValue={values[0]} onChange={event => onChange(`${label}: ${event.target.value}`)}>{values.map(value => <option key={value}>{value}</option>)}</select></div> }

function VideoModeIcon({ mode, color, background }: { mode: string; color: string; background: string }) { return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" fill={background} />{mode === 'script' && <path d="M8 8h8M8 12h8M8 16h5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />}{mode === 'article' && <path d="m8 9 3 3-3 3m5 0h3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />}{mode === 'image' && <><path d="m3 16 5-5 4 4 3-3 6 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><circle cx="9" cy="9" r="1.5" fill={color} /></>}{mode === 'upload' && <><path d="M12 15V9m-3 3 3-3 3 3M8 17h8" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></>}</svg> }
function AspectIcon({ ratio }: { ratio: string }) { const dimensions: Record<string, { x: number; y: number; width: number; height: number }> = { '1:1': { x: 1, y: 1, width: 8, height: 8 }, '16:9': { x: 0, y: 2.5, width: 10, height: 5.5 }, '4:3': { x: .5, y: 1.5, width: 9, height: 7 }, '3:4': { x: 2, y: .5, width: 6, height: 9 }, '9:16': { x: 3, y: 0, width: 4, height: 10 } }; return <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><rect {...dimensions[ratio]} rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg> }
function VideoStudioIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2" y="6" width="9" height="7" rx="1.5" fill="#7C3AED" opacity=".8" /><path d="m11 8.5 4-2.5v9l-4-2.5" fill="#7C3AED" opacity=".6" /><rect x="17" y="9" width="5" height="5" rx="1" fill="#7C3AED" opacity=".4" /></svg> }
function UploadIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg> }
function TrashIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><polyline points="3 6 5 6 21 6" /><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6m4-6v6" /></svg> }
function SparkleIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2 9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5Z" /></svg> }
function ArrowIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg> }
function GridIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18M15 3v18" /></svg> }
function MicIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="9" y="1" width="6" height="12" rx="3" /><path d="M19 10v2a7 7 0 0 1-14 0v-2m7 9v4m-4 0h8" /></svg> }
function VideoOutlineIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="2" /><path d="m22 10-5-3v6l5-3Z" /></svg> }
function InfoIcon() { return <span className="studio-info-icon" aria-label="More information">i</span> }
function PlayIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3" /></svg> }
