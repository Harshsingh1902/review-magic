'use client'

import Link from 'next/link'
import { Star, ArrowRight, QrCode, Zap, Globe, TrendingUp } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-cream-50">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream-50/90 backdrop-blur-md border-b border-ink-900/6">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-serif text-xl font-medium tracking-tight text-ink-900">
            Review<span className="text-gold-500">Magic</span>
          </span>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-sm text-ink-500 hover:text-ink-900 transition-colors">
              Dashboard
            </Link>
            <Link
              href="/admin"
              className="px-5 py-2 bg-ink-900 text-cream-50 text-sm font-medium rounded-full hover:bg-ink-800 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold-400/10 border border-gold-400/30 rounded-full mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
            <span className="text-xs font-medium tracking-widest uppercase text-gold-600">Now live</span>
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-light tracking-tight text-ink-900 leading-[1.05] mb-8">
            Every great experience<br />
            <em className="not-italic text-gold-500">deserves to be heard.</em>
          </h1>
          <p className="text-lg text-ink-400 max-w-xl mx-auto leading-relaxed mb-12">
            ReviewMagic turns satisfied customers into authentic Google reviews — 
            in under 10 seconds, with no friction, no app, no login.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/admin" className="btn-primary text-base px-8 py-4">
              Open Dashboard <ArrowRight size={16} />
            </Link>
            <Link href="/review/demo" className="btn-ghost text-base px-8 py-4">
              See Customer View
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-ink-900/8 bg-white">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          {[
            { num: '10×', label: 'more reviews' },
            { num: '< 10s', label: 'avg completion' },
            { num: '4.9★', label: 'avg rating achieved' },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-serif text-4xl sm:text-5xl font-light text-ink-900 mb-1">{s.num}</div>
              <div className="text-xs tracking-widest uppercase text-ink-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="section-label mb-4">How it works</p>
            <h2 className="font-serif text-4xl font-light text-ink-900">Three steps. Done.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: QrCode, step: '01', title: 'Place the QR', body: 'Generate a branded QR code for each business. Print it at the counter, on the table, or on the receipt.' },
              { icon: Star, step: '02', title: 'Customer rates', body: 'They scan, tap stars, pick what they loved. The AI writes a natural, human-sounding review in seconds.' },
              { icon: Globe, step: '03', title: 'Live on Google', body: 'One tap copies the review and opens Google. The whole journey takes under 10 seconds.' },
            ].map((item) => (
              <div key={item.step} className="group p-8 bg-white border border-ink-900/8 rounded-2xl hover:border-gold-400/40 hover:shadow-lg hover:shadow-gold-400/5 transition-all duration-300">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-11 h-11 rounded-xl bg-ink-900 flex items-center justify-center">
                    <item.icon size={18} className="text-cream-100" />
                  </div>
                  <span className="font-mono text-xs text-ink-300">{item.step}</span>
                </div>
                <h3 className="font-semibold text-ink-900 mb-2">{item.title}</h3>
                <p className="text-sm text-ink-400 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-ink-900 text-cream-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-widest uppercase text-ink-400 mb-4">Built for India</p>
            <h2 className="font-serif text-4xl font-light">Everything you need,<br />nothing you don&apos;t.</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-px bg-ink-700 rounded-2xl overflow-hidden">
            {[
              { icon: Zap, title: 'AI Review Writer', body: 'Groq-powered Llama 3 writes natural reviews. Supports Hinglish for Indian businesses automatically.' },
              { icon: QrCode, title: 'Branded QR Codes', body: 'High-quality QR codes with your brand mark engraved in the center. Print-ready at any size.' },
              { icon: TrendingUp, title: 'Focus Tag System', body: 'Guide customers to talk about what matters — food, vibe, hygiene, service, value.' },
              { icon: Globe, title: 'Zero Friction', body: 'No app download, no login, no form filling. Scan → Rate → Post. Under 10 seconds flat.' },
            ].map((f) => (
              <div key={f.title} className="bg-ink-900 p-8">
                <div className="w-10 h-10 rounded-lg bg-gold-400/10 border border-gold-400/20 flex items-center justify-center mb-5">
                  <f.icon size={18} className="text-gold-400" />
                </div>
                <h3 className="font-semibold text-cream-100 mb-2">{f.title}</h3>
                <p className="text-sm text-ink-300 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-4xl sm:text-5xl font-light text-ink-900 mb-6">
            Ready to fill your page<br />with 5-star reviews?
          </h2>
          <p className="text-ink-400 mb-10">Add your first client in under 2 minutes.</p>
          <Link href="/admin" className="btn-gold text-base px-10 py-4">
            Start Free <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-900/8 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-serif text-lg text-ink-900">Review<span className="text-gold-500">Magic</span></span>
          <p className="text-xs text-ink-400">© {new Date().getFullYear()} ReviewMagic. Built for businesses that care.</p>
        </div>
      </footer>
    </main>
  )
}
