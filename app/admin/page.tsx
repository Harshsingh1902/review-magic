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
            Set <code className="bg-ink-900/5 px-1 py-0.5 rounded">ADMIN_PASSWORD</code> in your <code className="bg-ink-900/5 px-1 py-0.5 rounded">.env.local</code>
          </p>
        </div>
      </div>
    )
  }

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
            onClick={() => { sessionStorage.removeItem('rm_authed'); setAuthed(false) }}
            className="inline-flex items-center gap-2 text-xs text-ink-400 hover:text-ink-900 transition-colors"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-5 gap-8">
          
          {/* Add Client Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-ink-900/8 rounded-2xl p-6 sticky top-24">
              <h2 className="font-semibold text-ink-900 mb-1">Add New Client</h2>
              <p className="text-xs text-ink-400 mb-6">Each client gets a unique review page + QR code</p>
              
              <form onSubmit={addClient} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-ink-600 mb-2">Business Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Sharma's Dhaba"
                    className="w-full px-4 py-3 bg-cream-100 rounded-xl text-sm border border-transparent focus:border-gold-400 outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-600 mb-2">Google Place ID *</label>
                  <input
                    type="text"
                    value={placeId}
                    onChange={e => setPlaceId(e.target.value)}
                    placeholder="ChIJxxxxxxxxxxxxxxxxxx"
                    className="w-full px-4 py-3 bg-cream-100 rounded-xl text-sm border border-transparent focus:border-gold-400 outline-none transition-colors font-mono text-xs"
                    required
                  />
                  <a
                    href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-gold-500 hover:text-gold-600 mt-1.5 transition-colors"
                  >
                    How to find your Place ID <ExternalLink size={10} />
                  </a>
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-600 mb-3">Focus Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_TAGS.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
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
                  disabled={adding}
                  className="w-full btn-primary py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {adding ? 'Adding...' : <><Plus size={15} /> Add Client</>}
                </button>
              </form>
            </div>
          </div>

          {/* Client List */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-ink-900">
                Your Clients <span className="text-ink-400 font-normal text-sm ml-1">({clients.length})</span>
              </h2>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-28 bg-ink-900/4 rounded-2xl animate-pulse" />)}
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-20 text-ink-400">
                <QrCode size={40} className="mx-auto mb-4 opacity-30" />
                <p className="text-sm">No clients yet. Add your first one.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {clients.map(client => (
                  <div key={client.id} className="bg-white border border-ink-900/8 rounded-2xl p-5 hover:border-ink-900/16 transition-all duration-200">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-9 h-9 rounded-xl bg-ink-900 flex items-center justify-center text-cream-50 font-serif text-base font-medium flex-shrink-0">
                            {client.name[0]}
                          </div>
                          <div>
                            <h3 className="font-semibold text-ink-900">{client.name}</h3>
                            <p className="text-xs text-ink-400 font-mono">{client.place_id}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-3 ml-12">
                          {client.tags?.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-gold-400/10 text-gold-600 text-xs rounded-full font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => copyLink(client.slug)}
                          className="p-2 rounded-lg text-ink-400 hover:text-ink-900 hover:bg-ink-900/5 transition-all"
                          title="Copy review link"
                        >
                          {copied === client.slug ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                        </button>
                        <button
                          onClick={() => setQrClient(client)}
                          className="p-2 rounded-lg text-ink-400 hover:text-ink-900 hover:bg-ink-900/5 transition-all"
                          title="View QR Code"
                        >
                          <QrCode size={16} />
                        </button>
                        <Link
                          href={`/review/${client.slug}`}
                          target="_blank"
                          className="p-2 rounded-lg text-ink-400 hover:text-ink-900 hover:bg-ink-900/5 transition-all"
                          title="Preview review page"
                        >
                          <ExternalLink size={16} />
                        </Link>
                        <button
                          onClick={() => deleteClient(client.id)}
                          className="p-2 rounded-lg text-ink-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          title="Delete client"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {qrClient && (
        <div
          className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={e => e.target === e.currentTarget && setQrClient(null)}
        >
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <p className="section-label mb-2 text-center">QR Code</p>
            <h3 className="font-serif text-2xl font-light text-center text-ink-900 mb-6">{qrClient.name}</h3>
            
            <div className="flex justify-center bg-cream-100 rounded-2xl p-6 mb-5">
              <QRCodeSVG
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/review/${qrClient.slug}`}
                size={200}
                level="H"
                fgColor="#0A0A08"
                bgColor="transparent"
                imageSettings={{
                  src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23C9A84C'%3E%3Cpath d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/%3E%3C/svg%3E",
                  height: 28,
                  width: 28,
                  excavate: true,
                }}
              />
            </div>

            <p className="text-center text-xs text-ink-400 mb-6">
              Scan to visit: <span className="text-ink-700 font-mono">/review/{qrClient.slug}</span>
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setQrClient(null)}
                className="flex-1 py-3 bg-cream-100 text-ink-700 text-sm font-medium rounded-xl hover:bg-cream-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const svg = document.querySelector('.qr-modal-svg')
                  if (svg) {
                    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url; a.download = `${qrClient.slug}-qr.svg`; a.click()
                  }
                }}
                className="flex-1 py-3 bg-ink-900 text-cream-50 text-sm font-medium rounded-xl hover:bg-ink-800 transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
