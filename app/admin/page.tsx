'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, Client } from '@/lib/supabase'
import { Plus, QrCode, ExternalLink, Copy, Check, LogOut, Trash2, ArrowLeft } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import Link from 'next/link'

const ALL_TAGS = ['Taste', 'Hygiene', 'Value', 'Service', 'Ambiance', 'Speed', 'Vibe', 'Freshness']

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)

  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  const [name, setName] = useState('')
  const [placeId, setPlaceId] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>(['Taste', 'Service'])

  const [qrClient, setQrClient] = useState<Client | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  const fetchClients = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    const saved = sessionStorage.getItem('rm_authed')
    if (saved === 'true') { setAuthed(true); fetchClients() }
    else setLoading(false)
  }, [fetchClients])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (pw === (process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'reviewmagic2024')) {
      setAuthed(true)
      sessionStorage.setItem('rm_authed', 'true')
      fetchClients()
    } else {
      setPwError(true)
      setTimeout(() => setPwError(false), 2000)
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('rm_authed')
    setAuthed(false)
    setPw('')
  }

  async function addClient(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !placeId.trim()) return
    setAdding(true)
    const slug = slugify(name) + '-' + Date.now().toString(36)
    const { error } = await supabase.from('clients').insert({
      name: name.trim(),
      place_id: placeId.trim(),
      tags: selectedTags,
      slug,
    })
    if (!error) {
      setName(''); setPlaceId(''); setSelectedTags(['Taste', 'Service'])
      fetchClients()
    }
    setAdding(false)
  }

  async function deleteClient(id: string) {
    if (!confirm('Delete this client?')) return
    await supabase.from('clients').delete().eq('id', id)
    fetchClients()
  }

  function toggleTag(tag: string) {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  function copyLink(slug: string) {
    const url = `${window.location.origin}/review/${slug}`
    navigator.clipboard.writeText(url)
    setCopied(slug)
    setTimeout(() => setCopied(null), 2000)
  }

  async function handleDownloadQR() {
    if (!qrClient) return
    setDownloading(true)
    try {
      const reviewUrl = `${window.location.origin}/review/${qrClient.slug}`
      const size = 1200
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')!

      // Outer background
      ctx.fillStyle = '#F7F4EF'
      ctx.fillRect(0, 0, size, size)

      // White card with shadow
      ctx.shadowColor = 'rgba(0,0,0,0.10)'
      ctx.shadowBlur = 60
      ctx.shadowOffsetY = 8
      roundRect(ctx, 60, 60, size - 120, size - 120, 56)
      ctx.fillStyle = '#FFFFFF'
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0

      // Gold top accent bar
      roundRect(ctx, 60, 60, size - 120, 12, 6)
      ctx.fillStyle = '#C4A962'
      ctx.fill()

      // "QR CODE" label
      ctx.fillStyle = '#C4A962'
      ctx.font = '600 26px Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.letterSpacing = '6px'
      ctx.fillText('QR CODE', size / 2, 175)

      // Business name
      ctx.fillStyle = '#1a1a1a'
      ctx.font = '300 62px Georgia, "Times New Roman", serif'
      ctx.letterSpacing = '0px'
      ctx.fillText(qrClient.name, size / 2, 268)

      // Thin gold divider
      ctx.strokeStyle = '#C4A962'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(size / 2 - 100, 298)
      ctx.lineTo(size / 2 + 100, 298)
      ctx.stroke()

      // QR code background pill
      roundRect(ctx, (size - 600) / 2, 330, 600, 600, 28)
      ctx.fillStyle = '#FDFAF4'
      ctx.fill()

      // Generate QR via qrcode lib
      const QRCode = (await import('qrcode'))
      const qrDataUrl = await QRCode.toDataURL(reviewUrl, {
        width: 560,
        margin: 1,
        color: { dark: '#1a1a1a', light: '#FDFAF4' },
        errorCorrectionLevel: 'H',
      })

      await new Promise<void>((resolve) => {
        const qrImg = new Image()
        qrImg.onload = () => {
          ctx.drawImage(qrImg, (size - 560) / 2, 350, 560, 560)

          // Star overlay in center of QR
          ctx.font = '52px serif'
          ctx.textAlign = 'center'
          ctx.fillStyle = '#FDFAF4'
          ctx.beginPath()
          ctx.arc(size / 2, 630, 34, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#C4A962'
          ctx.fillText('★', size / 2, 648)

          resolve()
        }
        qrImg.src = qrDataUrl
      })

      // Scan label
      ctx.fillStyle = '#AAAAAA'
      ctx.font = '300 24px Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Scan to leave a review', size / 2, 998)

      // Slug URL
      ctx.fillStyle = '#444444'
      ctx.font = '500 26px "Courier New", monospace'
      ctx.fillText(`/review/${qrClient.slug}`, size / 2, 1040)

      // Divider
      ctx.strokeStyle = '#E8E0D0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(size / 2 - 80, 1070)
      ctx.lineTo(size / 2 + 80, 1070)
      ctx.stroke()

      // ReviewMagic branding
      ctx.fillStyle = '#C4A962'
      ctx.font = '400 28px Georgia, serif'
      ctx.fillText('ReviewMagic', size / 2, 1112)

      // Download as PNG
      canvas.toBlob((blob) => {
        if (!blob) return
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `${qrClient.slug}-qr.png`
        a.click()
      }, 'image/png')

    } finally {
      setDownloading(false)
    }
  }

  // ---- Login Screen ----
  if (!authed) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-ink-400 hover:text-ink-900 transition-colors mb-10">
            <ArrowLeft size={14} /> Back to site
          </Link>
          <div className="bg-white border border-ink-900/8 rounded-2xl p-8 shadow-sm">
            <div className="mb-8">
              <p className="font-serif text-3xl font-light text-ink-900 mb-1">Admin</p>
              <p className="text-sm text-ink-400">Enter your dashboard password</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={pw}
                onChange={e => setPw(e.target.value)}
                placeholder="Password"
                className={`w-full px-4 py-3 bg-cream-100 rounded-xl text-sm border transition-colors outline-none focus:border-gold-400 ${pwError ? 'border-red-400 bg-red-50' : 'border-transparent'}`}
                autoFocus
              />
              {pwError && <p className="text-xs text-red-500">Incorrect password</p>}
              <button type="submit" className="w-full btn-primary py-3 rounded-xl">
                Enter Dashboard
              </button>
            </form>
          </div>
          <p className="text-xs text-ink-400 text-center mt-6">
            Set <code className="bg-ink-900/5 px-1 py-0.5 rounded">ADMIN_PASSWORD</code> in your{' '}
            <code className="bg-ink-900/5 px-1 py-0.5 rounded">.env.local</code>
          </p>
        </div>
      </div>
    )
  }

  // ---- Dashboard ----
  return (
    <div className="min-h-screen bg-cream-50">
      {/* Topbar */}
      <header className="bg-white border-b border-ink-900/8 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-serif text-xl font-medium text-ink-900">
              Review<span className="text-gold-500">Magic</span>
            </Link>
            <span className="hidden sm:block text-ink-300">|</span>
            <span className="hidden sm:block text-sm text-ink-500">Client Dashboard</span>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-sm text-ink-400 hover:text-ink-900 transition-colors"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Add Client Form */}
        <section className="bg-white border border-ink-900/8 rounded-2xl p-6 shadow-sm">
          <h2 className="font-serif text-xl font-light text-ink-900 mb-6">Add New Client</h2>
          <form onSubmit={addClient} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Business name"
                className="w-full px-4 py-3 bg-cream-100 rounded-xl text-sm border border-transparent outline-none focus:border-gold-400 transition-colors"
              />
              <input
                value={placeId}
                onChange={e => setPlaceId(e.target.value)}
                placeholder="Google Place ID"
                className="w-full px-4 py-3 bg-cream-100 rounded-xl text-sm border border-transparent outline-none focus:border-gold-400 transition-colors"
              />
            </div>
            <div>
              <p className="text-xs text-ink-400 mb-2">Select rating tags</p>
              <div className="flex flex-wrap gap-2">
                {ALL_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-ink-900 text-cream-50'
                        : 'bg-cream-100 text-ink-500 hover:bg-cream-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={adding || !name.trim() || !placeId.trim()}
              className="inline-flex items-center gap-2 btn-primary px-5 py-2.5 rounded-xl disabled:opacity-50"
            >
              <Plus size={15} /> {adding ? 'Adding…' : 'Add Client'}
            </button>
          </form>
        </section>

        {/* Clients List */}
        <section>
          <h2 className="font-serif text-xl font-light text-ink-900 mb-4">
            Clients {!loading && <span className="text-ink-400 text-base">({clients.length})</span>}
          </h2>
          {loading ? (
            <p className="text-sm text-ink-400">Loading…</p>
          ) : clients.length === 0 ? (
            <p className="text-sm text-ink-400">No clients yet. Add one above.</p>
          ) : (
            <div className="space-y-3">
              {clients.map(client => (
                <div
                  key={client.id}
                  className="bg-white border border-ink-900/8 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink-900 truncate">{client.name}</p>
                    <p className="text-xs text-ink-400 mt-0.5 truncate">{client.slug}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(client.tags || []).map((tag: string) => (
                        <span key={tag} className="px-2 py-0.5 bg-cream-100 text-ink-500 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyLink(client.slug)}
                      className="p-2 rounded-lg hover:bg-cream-100 transition-colors text-ink-400 hover:text-ink-900"
                      title="Copy link"
                    >
                      {copied === client.slug ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                    <Link
                      href={`/review/${client.slug}`}
                      target="_blank"
                      className="p-2 rounded-lg hover:bg-cream-100 transition-colors text-ink-400 hover:text-ink-900"
                      title="Open review page"
                    >
                      <ExternalLink size={16} />
                    </Link>
                    <button
                      onClick={() => setQrClient(client)}
                      className="p-2 rounded-lg hover:bg-cream-100 transition-colors text-ink-400 hover:text-ink-900"
                      title="Show QR code"
                    >
                      <QrCode size={16} />
                    </button>
                    <button
                      onClick={() => deleteClient(client.id)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors text-ink-400 hover:text-red-500"
                      title="Delete client"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* QR Modal */}
      {qrClient && (
        <div
          className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm z-50 flex items-center justify-center px-6"
          onClick={() => setQrClient(null)}
        >
          <div
            id="qr-modal"
            className="bg-white rounded-2xl p-8 shadow-xl max-w-sm w-full text-center"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-xs tracking-widest text-gold-500 uppercase font-medium mb-2">QR Code</p>
            <p className="font-serif text-xl font-light text-ink-900 mb-1">{qrClient.name}</p>
            <p className="text-xs text-ink-400 mb-6">Scan to leave a review</p>
            <div className="flex justify-center mb-3">
              <div className="bg-cream-50 rounded-2xl p-4">
                <QRCodeSVG
                  value={`${window.location.origin}/review/${qrClient.slug}`}
                  size={192}
                  bgColor="#FDFAF4"
                  fgColor="#1a1a1a"
                  level="H"
                  imageSettings={{
                    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ctext y='18' font-size='18'%3E%E2%98%85%3C/text%3E%3C/svg%3E",
                    height: 28,
                    width: 28,
                    excavate: true,
                  }}
                />
              </div>
            </div>
            <p className="text-xs text-ink-400 font-mono mb-6">/review/{qrClient.slug}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setQrClient(null)}
                className="flex-1 py-3 bg-cream-100 text-ink-700 text-sm font-medium rounded-xl hover:bg-cream-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleDownloadQR}
                disabled={downloading}
                className="flex-1 py-3 bg-ink-900 text-cream-50 text-sm font-medium rounded-xl hover:bg-ink-800 transition-colors disabled:opacity-50"
              >
                {downloading ? 'Generating…' : 'Download PNG'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}