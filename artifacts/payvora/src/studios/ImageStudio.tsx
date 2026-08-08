import { useRef, useState, type ChangeEvent } from 'react'

const RECENT_IMAGES = [
  { id: 1, src: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=400&h=400&fit=crop&auto=format', label: 'Futuristic cityscape' },
  { id: 2, src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&auto=format', label: 'Mountain landscape' },
  { id: 3, src: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop&auto=format', label: 'Modern living room' },
  { id: 4, src: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=400&fit=crop&auto=format', label: 'Space explorer' },
  { id: 5, src: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=400&fit=crop&auto=format', label: 'Neon city night' },
  { id: 6, src: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=400&fit=crop&auto=format', label: 'AI robot' },
  { id: 7, src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&auto=format', label: 'Portrait' },
  { id: 8, src: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400&h=400&fit=crop&auto=format', label: 'Abstract art' },
]

const HISTORY_ITEMS = RECENT_IMAGES.slice(0, 3).map((item, index) => ({
  ...item,
  time: ['Just now', '2 hours ago', '5 hours ago'][index],
}))

const ASPECT_RATIOS = ['1:1', '16:9', '4:3', '3:4', '9:16']
const NUM_IMAGES = [1, 2, 4, 6]
const TABS = ['Generate', 'Edit Image', 'Variations', 'Upscale', 'History', 'Inspiration']
const DEFAULT_PROMPT = 'A futuristic cityscape at sunset with flying cars, neon lights, and massive skyscrapers, ultra detailed, cinematic lighting.'

type Props = {
  onBack: () => void
  onNotify: (message: string) => void
}

export default function ImageStudio({ onBack, onNotify }: Props) {
  const [activeTab, setActiveTab] = useState('Generate')
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT)
  const [enhancePrompt, setEnhancePrompt] = useState(true)
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [quality, setQuality] = useState('High')
  const [numImages, setNumImages] = useState(2)
  const [seed, setSeed] = useState('893412')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<(typeof RECENT_IMAGES)[number] | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const addPromptPhrase = (phrase: string) => {
    setPrompt(current => current ? `${current.replace(/\s*$/, '')}, ${phrase}` : phrase)
  }

  const handleImageImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      onNotify('Choose an image file to use as a reference.')
      return
    }
    setUploadedImage(URL.createObjectURL(file))
    onNotify(`${file.name} added as a reference image`)
  }

  const clearPrompt = () => {
    setPrompt('')
    setUploadedImage(null)
    if (imageInputRef.current) imageInputRef.current.value = ''
    onNotify('Prompt cleared')
  }

  return (
    <section className="studio-page" aria-label="Image Studio">
      <div className="studio-page-heading">
        <button type="button" className="studio-back-button" onClick={onBack} aria-label="Back to AI Chat" title="Back to AI Chat">
          <ImageStudioIcon />
        </button>
        <div>
          <h1>Image Studio</h1>
          <p>Create stunning images with AI</p>
        </div>
      </div>

      <nav className="studio-tabs" aria-label="Image Studio sections">
        {TABS.map(tab => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={activeTab === tab ? 'is-active' : undefined}>
            {tab}
          </button>
        ))}
      </nav>

      <div className="studio-workspace">
        <div className="studio-editor">
          <div className="studio-card studio-prompt-card">
            <div className="studio-card-heading">
              <h2>Describe your image</h2>
              <div className="studio-inline-actions">
                <input ref={imageInputRef} onChange={handleImageImport} type="file" accept="image/*" hidden />
                <button type="button" onClick={() => imageInputRef.current?.click()}><UploadIcon />Import Image</button>
                <button type="button" onClick={clearPrompt}><TrashIcon />Clear</button>
              </div>
            </div>
            {uploadedImage && (
              <div className="studio-reference-image">
                <img src={uploadedImage} alt="Uploaded image reference" />
                <span>Reference image attached</span>
                <button type="button" aria-label="Remove reference image" onClick={() => setUploadedImage(null)}>×</button>
              </div>
            )}
            <textarea aria-label="Image prompt" value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="Describe the image you want to generate..." maxLength={2000} />
            <div className="studio-prompt-footer">
              <div className="studio-toggle-row">
                <span>Enhance prompt</span>
                <button type="button" aria-pressed={enhancePrompt} aria-label="Enhance prompt" onClick={() => setEnhancePrompt(value => !value)} className={`studio-toggle ${enhancePrompt ? 'is-on' : ''}`}><span /></button>
              </div>
              <span>{prompt.length} / 2000</span>
            </div>
          </div>

          <div className="studio-action-row">
            <div className="studio-chip-group">
              <button type="button" onClick={() => addPromptPhrase('inspired composition')}><SunIcon />Inspiration</button>
              <button type="button" onClick={() => addPromptPhrase('editorial art style')}><LayersIcon />Add Style</button>
              <button type="button" onClick={() => addPromptPhrase('dramatic volumetric lighting')}><SparkleOutlineIcon />Add Elements</button>
            </div>
            <div className="studio-generate-control">
              <button type="button" className="studio-primary-button" onClick={() => onNotify('Image generation requires a connected AI image provider. Your prompt and settings are ready.')}><SparkleIcon />Generate</button>
              <span>This will use {numImages} {numImages === 1 ? 'credit' : 'credits'}</span>
            </div>
          </div>

          <div className="studio-section-heading">
            <h2>Recent Creations</h2>
            <button type="button" onClick={() => setActiveTab('History')}>View all</button>
          </div>
          <div className="image-gallery">
            {RECENT_IMAGES.map(image => (
              <button key={image.id} type="button" className="image-gallery-item" onClick={() => setSelectedImage(image)} aria-label={`Preview ${image.label}`}>
                <img src={image.src} alt={image.label} loading="lazy" />
                <span>{image.label}</span>
              </button>
            ))}
          </div>
        </div>

        <aside className="studio-settings" aria-label="Image settings">
          <div className="studio-settings-inner">
            <div className="studio-field">
              <div className="studio-field-label"><label htmlFor="image-model">Model</label><InfoIcon /></div>
              <select id="image-model" defaultValue="Payvora Image v2" onChange={event => onNotify(`${event.target.value} selected`)}>
                <option>Payvora Image v2</option><option>Payvora Image v1</option>
              </select>
              <p>Our most advanced image model</p>
            </div>

            <div className="studio-settings-section">
              <h2>Image Settings</h2>
              <div className="studio-field">
                <label>Aspect Ratio</label>
                <div className="studio-option-grid">
                  {ASPECT_RATIOS.map(ratio => <button type="button" key={ratio} onClick={() => setAspectRatio(ratio)} className={aspectRatio === ratio ? 'is-selected' : undefined}><AspectIcon ratio={ratio} />{ratio}</button>)}
                </div>
              </div>
              <SettingsSelect label="Resolution" values={['High (1024 × 1024)', 'Standard (768 × 768)', 'Wide (1536 × 864)']} onChange={onNotify} />
              <SettingsSelect label="Style" values={['Photorealistic', 'Illustration', '3D Render', 'Cinematic']} onChange={onNotify} />
              <div className="studio-settings-row"><label>Quality</label><div className="studio-quality-options">{['Standard', 'High'].map(value => <button type="button" key={value} onClick={() => setQuality(value)} className={quality === value ? 'is-selected' : undefined}>{value === 'High' && <SparkleIcon />}{value}</button>)}</div></div>
              <div className="studio-settings-row"><label htmlFor="image-seed">Seed (optional)</label><div className="studio-seed-input"><input id="image-seed" value={seed} onChange={event => setSeed(event.target.value)} /><button type="button" aria-label="Randomize seed" onClick={() => setSeed(Math.floor(Math.random() * 999999).toString())}><RefreshIcon /></button></div></div>
              <div className="studio-settings-row"><label>Number of Images</label><div className="studio-number-options">{NUM_IMAGES.map(value => <button type="button" key={value} onClick={() => setNumImages(value)} className={numImages === value ? 'is-selected' : undefined}>{value}</button>)}</div></div>
            </div>

            <div className="studio-advanced">
              <button type="button" aria-expanded={advancedOpen} onClick={() => setAdvancedOpen(value => !value)}><strong>Advanced Settings</strong><ChevronIcon open={advancedOpen} /></button>
              {advancedOpen && <div className="studio-advanced-content"><label><input type="checkbox" /> Use a fixed seed</label><label><input type="checkbox" /> Private generation</label></div>}
            </div>

            <div className="studio-history">
              <div className="studio-section-heading"><h2>Recent History</h2><button type="button" onClick={() => setActiveTab('History')}>View all</button></div>
              {HISTORY_ITEMS.map(item => <button type="button" key={item.id} className="studio-history-item" onClick={() => setSelectedImage(item)}><img src={item.src} alt="" /><span><strong>{item.label}</strong><small>{item.time}</small></span><DotsIcon /></button>)}
            </div>
          </div>
        </aside>
      </div>

      {selectedImage && <div className="studio-modal-backdrop" role="presentation" onMouseDown={() => setSelectedImage(null)}><div className="studio-image-modal" role="dialog" aria-modal="true" aria-label={selectedImage.label} onMouseDown={event => event.stopPropagation()}><button type="button" aria-label="Close image preview" onClick={() => setSelectedImage(null)}>×</button><img src={selectedImage.src} alt={selectedImage.label} /><p>{selectedImage.label}</p></div></div>}
    </section>
  )
}

function SettingsSelect({ label, values, onChange }: { label: string; values: string[]; onChange: (message: string) => void }) {
  return <div className="studio-settings-row"><label>{label}</label><select defaultValue={values[0]} onChange={event => onChange(`${label}: ${event.target.value}`)}>{values.map(value => <option key={value}>{value}</option>)}</select></div>
}

function AspectIcon({ ratio }: { ratio: string }) {
  const dimensions: Record<string, { x: number; y: number; width: number; height: number }> = { '1:1': { x: 1, y: 1, width: 8, height: 8 }, '16:9': { x: 0, y: 2.5, width: 10, height: 5.5 }, '4:3': { x: .5, y: 1.5, width: 9, height: 7 }, '3:4': { x: 2, y: .5, width: 6, height: 9 }, '9:16': { x: 3, y: 0, width: 4, height: 10 } }
  const rect = dimensions[ratio]
  return <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><rect {...rect} rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
}

function ImageStudioIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="8" height="6" rx="1.5" fill="#7C3AED" opacity=".8" /><rect x="13" y="3" width="8" height="6" rx="1.5" fill="#7C3AED" opacity=".4" /><rect x="3" y="11" width="8" height="10" rx="1.5" fill="#7C3AED" opacity=".4" /><rect x="13" y="11" width="8" height="10" rx="1.5" fill="#7C3AED" opacity=".8" /></svg> }
function UploadIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg> }
function TrashIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><polyline points="3 6 5 6 21 6" /><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6m4-6v6" /></svg> }
function SunIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="5" /><path d="M12 1v2m0 18v2M4.2 4.2l1.4 1.4m12.8 12.8 1.4 1.4M1 12h2m18 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></svg> }
function LayersIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 2 10 5-10 5L2 7l10-5Z" /><path d="m2 12 10 5 10-5M2 17l10 5 10-5" /></svg> }
function SparkleOutlineIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M12 1v4m0 14v4M4.2 4.2l2.8 2.8m10 10 2.8 2.8M1 12h4m14 0h4M4.2 19.8 7 17m10-10 2.8-2.8" /></svg> }
function SparkleIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2 9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5Z" /></svg> }
function InfoIcon() { return <span className="studio-info-icon" aria-label="More information">i</span> }
function RefreshIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15" /></svg> }
function ChevronIcon({ open }: { open: boolean }) { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform: open ? 'rotate(180deg)' : undefined }} aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg> }
function DotsIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="5" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="19" r="1" fill="currentColor" /></svg> }
