import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { GoogleGenerativeAI } from '@google/generative-ai'
import jsPDF from 'jspdf'
import { formatSummaryByMode } from './summary.format'
import {
  buttonStyle,
  primaryButtonStyle,
  containerStyle
} from './summary.styles'
const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GENAI_KEY
)


const model = genAI.getGenerativeModel({
  model: 'models/gemini-2.5-flash'
})
const cleanTitle = (title: string) => { return title.replace(/^(improved|optimized|implemented|fixed)\s+/i, '').trim() }

export default function Summary() {

  const [period, setPeriod] = useState('30')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  type Mode = 'appraisal' | 'resume' | 'manager'
  const [mode, setMode] = useState<Mode>('appraisal')
  const [toast, setToast] = useState<string | null>(null)
  const animationKey = `${mode}-${summary.length}`

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('Appraisal Summary', 14, 20)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Period: Last ${period} days`, 14, 30)

    const lines = formatSummaryByMode(summary, mode).map(b => `• ${b}`)


    doc.text(lines, 14, 45, {
      maxWidth: 180,
      lineHeightFactor: 1.6
    })

    doc.setFontSize(9)
    doc.text(
      `Generated on ${new Date().toLocaleDateString()}`,
      14,
      285
    )

    doc.save('appraisal-summary.pdf')
    setToast('PDF exported successfully')
    setTimeout(() => setToast(null), 2000)
  }

  const modeButton = (m: Mode, label: string) => (
    <button
      onClick={() => setMode(m)}
      disabled={loading}
      style={{
        ...buttonStyle,
        background: mode === m ? '#e0e7ff' : '#fff',
        borderColor: mode === m ? '#2563eb' : '#ccc',
        fontWeight: mode === m ? 600 : 400,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1
      }}
    >
      {label}
    </button>
  )
  const generateSummary = async () => {
    if (loading) return
    setLoading(true)


    // 🔐 Auth check
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session) {
      alert('You are not logged in')
      setLoading(false)
      return
    }

    // 📅 Date filter
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - Number(period))

    // 📊 Fetch logs
    const { data: logs, error } = await supabase
      .from('logs')
      .select('title, description, impact_type, effort_level')
      .gte('created_at', fromDate.toISOString())

    if (error || !logs || logs.length === 0) {
      alert('No logs found for selected period')
      setLoading(false)
      return
    }

    // 🧠 Format logs
    const formattedLogs = logs
      .map(
        (l, i) =>
          `${i + 1}. ${l.title}: ${l.description} (${l.impact_type}, ${l.effort_level})`
      )
      .join('\n')

    //     try {
    //       const chat = model.startChat({
    //         generationConfig: {
    //           temperature: 0.3,
    //           topP: 0.9,
    //           maxOutputTokens: 512
    //         }
    //       })
    //       const result = await chat.sendMessage(`
    // You are a senior software engineering manager writing performance review bullets
    // that will be read by leadership.

    // STRICT RULES (no exceptions):
    // - Return EXACTLY ${logs.length} bullet points
    // - Each bullet corresponds to the SAME log, in the SAME order
    // - One sentence per bullet
    // - Do NOT merge logs
    // - Do NOT repeat sentence structure
    // - Do NOT repeat verbs

    // FORBIDDEN PHRASES (never use):
    // - "contributing to"
    // - "improvements"
    // - "helped"
    // - "supported"
    // - "assisted"
    // - "delivered"

    // EACH BULLET MUST:
    // - Start with a strong past-tense action verb (Resolved, Optimized, Implemented, Improved, Accelerated, Strengthened)
    // - Describe the specific technical change
    // - Explicitly state concrete impact using words like:
    //   reliability, availability, latency, throughput, stability, developer velocity, user access

    // BAD EXAMPLE (DO NOT DO THIS):
    // • Delivered improved API performance, contributing to performance improvements.

    // GOOD EXAMPLE (STYLE ONLY):
    // • Optimized critical API endpoints, reducing response latency and improving user-facing performance during peak traffic.

    // WORK LOGS (in order):
    // ${formattedLogs}

    // OUTPUT:
    // Return only bullet points, one per line.
    // `);

    //       const rawText = result.response.text()
    //       console.log('Gemini raw response:', rawText);

    //       // ✅ Extract numbered bullets ONLY
    //       let bullets = rawText
    //         .split('\n')
    //         .map(l => l.trim())
    //         .filter(l => /^\d+\.\s+/.test(l))
    //         .map(l => `• ${l.replace(/^\d+\.\s+/, '')}`)

    //       // 🛡 Hard guarantee bullet count
    //       if (bullets.length !== logs.length) {
    //         console.warn(
    //           `Gemini returned ${bullets.length} bullets for ${logs.length} logs`
    //         )

    //         bullets = logs.map(
    //           l =>
    //             `• Delivered ${l.title.toLowerCase()}, contributing to ${l.impact_type.toLowerCase()} improvements.`
    //         )
    //       }

    //       setSummary(bullets.join('\n'))
    //     } catch (err) {
    //       console.error('Gemini error:', err)
    //       alert('Failed to generate summary')
    //     } finally {
    //       setLoading(false)
    //     }
    //   }

    try {
      // 🚧 TEMPORARY FALLBACK (Gemini quota exceeded)
      // TODO: Re-enable Gemini generation once daily quota resets or billing is added

      const fallbackBullets = logs.map((log) => {
        const title = cleanTitle(log.title).toLowerCase()

        switch (log.impact_type) {
          case 'Bug Fix':
            return `• Resolved a production issue related to ${title}, restoring system reliability and preventing user-facing failures.`
          case 'Performance':
            return `• Optimized ${title}, reducing latency and improving performance for critical user flows.`
          case 'Delivery':
            return `• Implemented ${title}, accelerating feature delivery and improving development velocity.`
          case 'Collaboration':
            return `• Improved ${title}, increasing operational visibility and strengthening team collaboration.`
          default:
            return `• Delivered ${title}, improving overall product quality and user experience.`
        }
      })

      setSummary(fallbackBullets.join('\n'))

    } catch (err) {
      console.error('Summary generation error:', err)
      alert('Failed to generate summary')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={containerStyle}
    >
      <style>
        {`
        @keyframes fadeSlide {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}
      </style>

      <h1 style={{ fontSize: 28, marginBottom: 6 }}>
        Appraisal Summary
      </h1>
      <p style={{ color: '#6b7280', marginBottom: 16 }}>
        Generate a concise summary of your work for appraisals, resumes, or manager reviews.
      </p>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          disabled={loading}
          style={{ padding: '6px 10px', borderRadius: 6 }}
        >
          <option value="30">Last 30 days</option>
          <option value="90">This Quarter</option>
          <option value="180">Last 6 months</option>
        </select>


        <button onClick={generateSummary} disabled={loading} style={primaryButtonStyle}>
          {loading ? 'Generating summary…' : 'Generate appraisal summary'}
        </button>

      </div>
      <p style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
        We’ll summarize all work logs created during the selected period.
      </p>
      {!summary && !loading && (
        <div
          style={{
            marginTop: 32,
            padding: 24,
            borderRadius: 12,
            background: '#f9fafb',
            border: '1px dashed #d1d5db',
            textAlign: 'center',
            color: '#374151'
          }}
        >
          <h3 style={{ marginBottom: 8 }}>
            Turn your work logs into a promotion-ready summary
          </h3>
          <p style={{ fontSize: 14, lineHeight: 1.6 }}>
            Select a time period and click <strong>Generate Summary</strong> to
            create a concise, impact-focused summary you can use for appraisals,
            resumes, or manager reviews.
          </p>
        </div>
      )}
      {summary && (
        <div
          style={{
            display: 'inline-flex',
            background: '#f1f5f9',
            borderRadius: 8,
            padding: 4,
            gap: 4,
            marginTop: 12,
            marginBottom: 12
          }}
        >
          {modeButton('appraisal', 'Appraisal')}
          {modeButton('resume', 'Resume')}
          {modeButton('manager', 'Manager Review')}
        </div>
      )}
      {summary && (
        <>
          <div
            key={animationKey}
            style={{
              background: '#fafafa',
              padding: '20px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              marginTop: 16,
              animation: 'fadeSlide 0.25s ease'
            }}
          >
            {mode === 'manager' && (
              <div style={{ fontWeight: 600, marginBottom: 12 }}>
                Executive Summary
              </div>
            )}

            {formatSummaryByMode(summary, mode).map((b, i) => (
              <div key={i} style={{ marginBottom: 14, lineHeight: 1.8 }}>
                • {b}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 8 }}>
            <button
              style={{
                ...buttonStyle,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              disabled={loading}
              onClick={() => {
                const textToCopy = formatSummaryByMode(summary, mode)
                  .map(b => `• ${b}`)
                  .join('\n')

                navigator.clipboard.writeText(
                  mode === 'manager'
                    ? `Executive Summary\n\n${textToCopy}`
                    : textToCopy
                )

                setToast('Copied to clipboard')
                setTimeout(() => setToast(null), 2000)
              }}
            >
              Copy
            </button>

            {summary && (
              <button
                onClick={exportToPDF}
                disabled={loading}
                style={{
                  ...buttonStyle,
                  marginLeft: 8,
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                Export PDF
              </button>
            )}
          </div>
        </>
      )}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: '#111827',
            color: '#fff',
            padding: '10px 14px',
            borderRadius: 8,
            fontSize: 13,
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            zIndex: 50
          }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}
