import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

// ─────────────────────────────────────────────────────────
// API KEYS NOTE:
// Add GROQ_API_KEY to your .env.local file.
// In Vercel: Settings → Environment Variables → GROQ_API_KEY
// Get your key at: https://console.groq.com/keys
// ─────────────────────────────────────────────────────────

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// Heuristic to detect Indian-sounding business names
function isIndianBusiness(name: string): boolean {
  const indianWords = [
    'dhaba', 'chaiwala', 'chai', 'biryani', 'halwai', 'sweets', 'mithai',
    'sharma', 'gupta', 'patel', 'singh', 'kumar', 'agarwal', 'jain',
    'indian', 'punjabi', 'gujarati', 'rajasthani', 'bengali', 'kerala',
    'udupi', 'idli', 'dosa', 'tandoor', 'masala', 'spice', 'curry',
    'shree', 'shri', 'ganesh', 'laxmi', 'lakshmi', 'sai', 'balaji',
  ]
  const lower = name.toLowerCase()
  return indianWords.some(w => lower.includes(w))
}

export async function POST(req: NextRequest) {
  try {
    const { businessName, tags, stars } = await req.json()

    if (!businessName || !tags) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const isIndian = isIndianBusiness(businessName)
    const tagList = Array.isArray(tags) ? tags.join(', ') : tags

    const languageInstruction = isIndian
      ? `Write in a natural Hinglish style — a casual mix of Hindi and English that young Indians use. For example: "Food was amazing, aur staff ka behaviour bahut achha tha!" or "Service itni fast thi, bilkul bhi wait nahi karna pada." Keep it authentic, not forced.`
      : `Write in casual, conversational English. Sound like a real customer, not a marketing copy.`

    const starContext = stars >= 4
      ? 'The customer had a very positive experience.'
      : stars === 3
      ? 'The customer had a decent experience with room for improvement.'
      : 'The customer had an average experience.'

    const prompt = `You are writing a Google review on behalf of a real customer.

Business: ${businessName}
Star rating: ${stars}/5
What the customer loved: ${tagList}
${starContext}

Instructions:
- Write EXACTLY 2-3 sentences. No more.
- ${languageInstruction}
- Add ONE relevant emoji naturally in the text (not just at the end).
- Sound 100% human — no corporate language, no "As a customer", no "I recently visited".
- Do NOT mention the star rating number.
- Do NOT start with "I" — vary the opening.
- No fake details like specific dish names unless they match the tags.
- Output ONLY the review text. No quotes, no labels, no preamble.`

    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0.85,
    })

    const review = completion.choices[0]?.message?.content?.trim() || ''

    if (!review) {
      throw new Error('Empty response from Groq')
    }

    return NextResponse.json({ review })
  } catch (error) {
    console.error('[/api/generate] Error:', error)

    // Fallback review if Groq fails
    const fallback = `Absolutely loved the experience here! The quality and vibe were spot on — will definitely be coming back soon. 🙌`
    return NextResponse.json({ review: fallback })
  }
}
