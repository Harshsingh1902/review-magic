'use client'

import { useState, useEffect } from 'react'
import { supabase, Client } from '@/lib/supabase'
import { CheckCircle, Copy, ExternalLink, ChevronLeft } from 'lucide-react'
import { useParams } from 'next/navigation'

type Step = 'rate' | 'tags' | 'generate' | 'done'

const CHIP_EMOJIS: Record<string, string> = {
  Taste: '🍛', Hygiene: '✨', Value: '💰', Service: '🤝',
  Ambiance: '🌟', Speed: '⚡', Vibe: '🎵', Freshness: '🌿',
  Food: '🍛', Price: '💸',
}

export default function ReviewPage() {
  const params = useParams()
  const slug = params.slug as string

  const [client, setClient] = useState<Client | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [step, setStep] = useState<Step>('rate')
  const [stars, setStars] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [selectedChips, setSelectedChips] = useState<string[]>([])
  const [review, setReview] = useState('')
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (slug === 'demo') {
      setClient({
        id: 'demo',
        name: "Sharma's Dhaba",
        place_id: 'ChIJdemo',
        tags: ['Taste', 'Value', 'Hygiene', 'Vibe'],
        slug: 'demo',
        created_at: new Date().toISOString(),
      })
      return
    }
    supabase
      .from('clients')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true)
        else setClient(data)
      })
  }, [slug])

  function toggleChip(tag: string) {
    setSelectedChips(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  async function handleGenerate() {
    if (selectedChips.length === 0) { setSelectedChips([client?.tags?.[0] || 'Service']); return }
    setStep('generate')
    setGenerating(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: client?.name,
          tags: selectedChips,
          stars,
        }),
      })
      const data = await res.json()
      setReview(data.review || 'Great experience! Highly recommended.')
    } catch {
      setReview(`Had an amazing time at ${client?.name}! Everything was top-notch — the ${selectedChips[0]?.toLowerCase() || 'service'} really stood out. Will definitely be back! ⭐`)
    }
    setGenerating(false)
    setStep('done')
  }

  function handleCopyAndPost() {
    navigator.clipboard.writeText(review).catch(() => {})
    setCopied(true)
    const url = `https://search.google.com/local/writereview?placeid=${client?.place_id}`
    setTimeout(() => window.open(url, '_blank'), 400)
  }

  function reset() {
    setStep('rate'); setStars(0); setHoveredStar(0)
    setSelectedChips([]); setReview(''); setCopied(false)
  }

  // ---- Not Found ----
  if (notFound) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center px-6 text-center">
        <div>
          <p className="font-serif text-4xl font-light text-ink-900 mb-3">404</p>
          <p className="text-ink-400 text-sm">This review page doesn&apos;t exist.</p>
        </div>
      </div>
    )
  }

  // ---- Loading ----
  if (!client) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="flex gap-1.5">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-gold-400 animate-bounce" style={{ animationDelay: `${i * 0.12}s` }} />
          ))}
        </div>
      </div>
    )
  }

  const activeChips = selectedChips.length > 0 ? selectedChips : client.tags || []

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #FAF7F0 0%, #FDFCF9 50%, #EEF2FF 100%)' }}>
      {/* Header */}
      <header className="px-5 pt-8 pb-0">
        <div className="max-w-sm mx-auto">
          <p className="font-serif text-sm font-medium text-gold-600 tracking-wide">{client.name}</p>
        </div>
      </header>

      {/* Main card */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-8">
        <div className="w-full max-w-sm">
          {/* Step indicators */}
          <div className="flex gap-1.5 justify-center mb-8">
            {(['rate', 'tags', 'done'] as Step[]).map((s, i) => (
              <div
                key={s}
                className={`h-1 rounded-full transition-all duration-400 ${
                  (step === 'rate' && i === 0) ||
                  (step === 'tags' && i === 1) ||
                  ((step === 'generate' || step === 'done') && i === 2)
                    ? 'w-8 bg-gold-400'
                    : 'w-2 bg-ink-900/15'
                }`}
              />
            ))}
          </div>

          {/* STEP 1: Stars */}
          {step === 'rate' && (
            <div className="bg-white rounded-3xl shadow-xl shadow-ink-900/5 p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-ink-900 flex items-center justify-center mx-auto mb-6 text-2xl">
                ⭐
              </div>
              <h1 className="font-serif text-3xl font-light text-ink-900 mb-2">How was your experience?</h1>
              <p className="text-sm text-ink-400 mb-8">Tap a star to rate</p>

              <div className="flex justify-center gap-3 mb-6">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => { setStars(n); setTimeout(() => setStep('tags'), 400) }}
                    onMouseEnter={() => setHoveredStar(n)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="text-5xl leading-none transition-transform duration-100 active:scale-90"
                    style={{ color: n <= (hoveredStar || stars) ? '#F59E0B' : '#E5E7EB' }}
                  >
                    ★
                  </button>
                ))}
              </div>
              {stars > 0 && (
                <p className="text-sm font-medium text-ink-500 animate-in fade-in">
                  {['', 'Poor 😕', 'Fair 😐', 'Good 🙂', 'Great 😊', 'Excellent! 🤩'][stars]}
                </p>
              )}
            </div>
          )}

          {/* STEP 2: Tags */}
          {step === 'tags' && (
            <div className="bg-white rounded-3xl shadow-xl shadow-ink-900/5 p-8 text-center">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep('rate')} className="p-2 rounded-xl text-ink-400 hover:bg-ink-900/5 transition-colors -ml-2">
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-1 ml-1">
                  {[1,2,3,4,5].map(n => (
                    <span key={n} style={{ color: n <= stars ? '#F59E0B' : '#E5E7EB', fontSize: 16 }}>★</span>
                  ))}
                </div>
              </div>

              <h2 className="font-serif text-2xl font-light text-ink-900 mb-2">What did you love?</h2>
              <p className="text-sm text-ink-400 mb-7">Select all that apply</p>

              <div className="flex flex-wrap gap-2 justify-center mb-8">
                {(client.tags?.length ? client.tags : ['Food', 'Vibe', 'Service', 'Price']).map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleChip(tag)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-150 ${
                      selectedChips.includes(tag)
                        ? 'bg-ink-900 text-cream-50 scale-105'
                        : 'bg-cream-100 text-ink-600 hover:bg-cream-200'
                    }`}
                  >
                    <span>{CHIP_EMOJIS[tag] || '✓'}</span> {tag}
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerate}
                className="w-full py-4 bg-ink-900 text-cream-50 rounded-2xl font-semibold text-base hover:bg-ink-800 active:scale-98 transition-all duration-150"
              >
                ✨ Generate My Review
              </button>
            </div>
          )}

          {/* STEP 3: Generating */}
          {step === 'generate' && (
            <div className="bg-white rounded-3xl shadow-xl shadow-ink-900/5 p-10 text-center">
              <div className="flex gap-2 justify-center mb-5">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2.5 h-2.5 rounded-full bg-gold-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <p className="font-serif text-xl font-light text-ink-900 mb-2">Writing your review…</p>
              <p className="text-sm text-ink-400">Our AI is crafting something natural</p>
            </div>
          )}

          {/* STEP 4: Done */}
          {step === 'done' && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl shadow-xl shadow-ink-900/5 p-7">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle size={18} className="text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">Your review is ready!</p>
                    <p className="text-xs text-ink-400">Tap below to copy and post</p>
                  </div>
                </div>
                <div className="bg-cream-100 rounded-2xl p-4 mb-2">
                  <p className="text-sm text-ink-700 leading-relaxed">{review}</p>
                </div>
              </div>

              {/* The big button */}
              <button
                onClick={handleCopyAndPost}
                className={`w-full py-5 rounded-2xl font-semibold text-base flex items-center justify-center gap-2.5 transition-all duration-200 shadow-lg ${
                  copied
                    ? 'bg-green-500 text-white shadow-green-500/25'
                    : 'bg-gold-400 text-ink-900 hover:bg-gold-500 shadow-gold-400/25 active:scale-98'
                }`}
              >
                {copied ? (
                  <><CheckCircle size={20} /> Copied! Opening Google…</>
                ) : (
                  <><Copy size={18} /> Copy & Post to Google <ExternalLink size={14} /></>
                )}
              </button>

              <button
                onClick={reset}
                className="w-full py-3.5 bg-white text-ink-500 rounded-2xl text-sm font-medium border border-ink-900/8 hover:border-ink-900/20 transition-colors"
              >
                Start over
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center pb-8 pt-4">
        <p className="text-xs text-ink-400/60">
          Powered by <span className="font-serif italic">ReviewMagic</span>
        </p>
      </footer>
    </div>
  )
}
