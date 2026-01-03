import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const impactOptions = [
  'Delivery',
  'Performance',
  'Bug Fix',
  'Collaboration',
  'Ownership'
]

export default function AddLog() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [impactType, setImpactType] = useState('Delivery')
  const [effort, setEffort] = useState('Medium')
  const [loading, setLoading] = useState(false)

  const saveLog = async () => {
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    await supabase.from('logs').insert({
      user_id: userData.user.id,
      title,
      description,
      impact_type: impactType,
      effort_level: effort
    })

    setLoading(false)
    navigate('/logs')
  }

  return (
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      <h2>Add Work Log</h2>

      <input
        placeholder="Short title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="What did you do?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div>
        {impactOptions.map(opt => (
          <button
            key={opt}
            onClick={() => setImpactType(opt)}
            style={{
              fontWeight: impactType === opt ? 'bold' : 'normal'
            }}
          >
            {opt}
          </button>
        ))}
      </div>

      <select
        value={effort}
        onChange={(e) => setEffort(e.target.value)}
      >
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>

      <button onClick={saveLog} disabled={loading}>
        {loading ? 'Saving...' : 'Save Log'}
      </button>
    </div>
  )
}
