'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
            onClick={handleDownloadQR} disabled={downloading}
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




