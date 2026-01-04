import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, useParams } from 'react-router-dom'

const impactOptions = [
  'Delivery',
  'Performance',
  'Bug Fix',
  'Collaboration',
  'Ownership'
]

/* ---------------- styles ---------------- */

const pageStyle = {
  maxWidth: 640,
  margin: '40px auto',
  padding: '0 16px'
}

const cardStyle = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 16,
  padding: 24
}

const labelStyle = {
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 6
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  fontSize: 14
}

const textareaStyle = {
  ...inputStyle,
  minHeight: 100,
  resize: 'vertical' as 'vertical' // Explicitly cast to satisfy type
}

const impactButton = (active: boolean) => ({
  padding: '6px 12px',
  borderRadius: 999,
  border: '1px solid #d1d5db',
  background: active ? '#2563eb' : '#fff',
  color: active ? '#fff' : '#374151',
  fontSize: 13,
  cursor: 'pointer'
})

const primaryButton = {
  padding: '12px 16px',
  background: '#2563eb',
  color: '#fff',
  borderRadius: 10,
  border: 'none',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
  width: '100%'
}

/* ---------------- component ---------------- */

export default function AddLog() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [impactType, setImpactType] = useState('Delivery')
  const [effort, setEffort] = useState('Medium')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return

    const fetchLog = async () => {
      const { data } = await supabase
        .from('logs')
        .select('*')
        .eq('id', id)
        .single()

      if (data) {
        setTitle(data.title)
        setDescription(data.description)
        setImpactType(data.impact_type)
        setEffort(data.effort_level)
      }
    }

    fetchLog()
  }, [id])

  const saveLog = async () => {
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    if (id) {
      await supabase
        .from('logs')
        .update({
          title,
          description,
          impact_type: impactType,
          effort_level: effort
        })
        .eq('id', id)
    } else {
      await supabase.from('logs').insert({
        user_id: userData.user.id,
        title,
        description,
        impact_type: impactType,
        effort_level: effort
      })
    }

    setLoading(false)
    navigate('/logs')
  }

  return (
    <div style={pageStyle}>
      <h2 style={{ fontSize: 28, marginBottom: 6 }}>
        {id ? 'Edit Work Log' : 'Add Work Log'}
      </h2>
      <p style={{ color: '#6b7280', marginBottom: 24 }}>
        Capture what you worked on and its impact
      </p>

      <div style={cardStyle}>
        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <div style={labelStyle}>Title</div>
          <input
            style={inputStyle}
            placeholder="Short, clear summary"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: 16 }}>
          <div style={labelStyle}>Description</div>
          <textarea
            style={textareaStyle}
            placeholder="What did you do? Why did it matter?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Impact */}
        <div style={{ marginBottom: 16 }}>
          <div style={labelStyle}>Impact Type</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {impactOptions.map((opt) => (
              <button
                key={opt}
                style={impactButton(impactType === opt)}
                onClick={() => setImpactType(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Effort */}
        <div style={{ marginBottom: 24 }}>
          <div style={labelStyle}>Effort Level</div>
          <select
            style={inputStyle}
            value={effort}
            onChange={(e) => setEffort(e.target.value)}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        {/* Save */}
        <button
          style={primaryButton}
          onClick={saveLog}
          disabled={loading}
        >
          {loading ? 'Saving…' : id ? 'Update Log' : 'Save Log'}
        </button>
      </div>
    </div>
  )
}
