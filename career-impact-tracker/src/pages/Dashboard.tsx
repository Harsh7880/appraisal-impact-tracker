import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'

type Stats = {
    totalLogs: number
    lastLogDate: string | null
    topImpact: string | null
}

export default function Dashboard() {
    const [stats, setStats] = useState<Stats>({
        totalLogs: 0,
        lastLogDate: null,
        topImpact: null,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadDashboard = async () => {
            const { data: sessionData } = await supabase.auth.getSession()
            const user = sessionData.session?.user

            if (!user) {
                setLoading(false)
                return
            }
            const { data: logs } = await supabase
                .from('logs')
                .select('impact_type, created_at')
                .order('created_at', { ascending: false })

            if (logs && logs.length > 0) {
                const impactCount: Record<string, number> = {}

                logs.forEach((l) => {
                    impactCount[l.impact_type] =
                        (impactCount[l.impact_type] || 0) + 1
                })

                const topImpact = Object.entries(impactCount).sort(
                    (a, b) => b[1] - a[1]
                )[0][0]

                setStats({
                    totalLogs: logs.length,
                    lastLogDate: new Date(logs[0].created_at).toDateString(),
                    topImpact,
                })
            }

            setLoading(false)
        }

        loadDashboard()
    }, [])

    if (loading) {
        return (
            <div style={{ maxWidth: 960, margin: '60px auto' }}>
                <div style={{ padding: 40, color: '#6b7280' }}>
                    Preparing your dashboard…
                </div>
            </div>
        )
    }

    return (
        <div
            style={{
                maxWidth: 960,
                margin: '40px auto',
                padding: '0 16px',
            }}
        >
            {/* Welcome */}
            <h1 style={{ fontSize: 28, marginBottom: 6 }}>
                Welcome back 👋
            </h1>
            <p style={{ color: '#6b7280', marginBottom: 32 }}>
                Here’s a snapshot of your work impact
            </p>

            {/* Stats */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 16,
                    marginBottom: 32,
                }}
            >
                <StatCard label="Total logs" value={stats.totalLogs} />
                <StatCard
                    label="Last entry"
                    value={stats.lastLogDate ?? '—'}
                />
                <StatCard
                    label="Top impact"
                    value={stats.topImpact ?? '—'}
                />
            </div>

            {/* Primary CTA */}
            <div
                style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 16,
                    padding: 24,
                    background: '#f9fafb',
                    marginBottom: 32,
                }}
            >
                {stats.totalLogs === 0 ? (
                    <>
                        <h3 style={{ fontSize: 20, marginBottom: 8 }}>
                            Start logging your work
                        </h3>
                        <p style={{ color: '#6b7280', marginBottom: 16 }}>
                            Track your impact and build appraisal-ready summaries.
                        </p>
                        <Link to="/add">
                            <button style={primaryButton}>
                                Add your first log
                            </button>
                        </Link>
                    </>
                ) : (
                    <>
                        <h3 style={{ fontSize: 20, marginBottom: 8 }}>
                            Ready for appraisal?
                        </h3>
                        <p style={{ color: '#6b7280', marginBottom: 16 }}>
                            Generate a performance summary from your work logs.
                        </p>
                        <Link to="/summary">
                            <button style={primaryButton}>
                                Generate appraisal-ready summary →
                            </button>
                        </Link>
                    </>
                )}
            </div>

            {/* Secondary actions */}
            <div style={{ display: 'flex', gap: 12 }}>
                <Link to="/logs">View all logs</Link>
                <Link to="/add">Add new log</Link>
            </div>
        </div>
    )
}

/* ---------- helpers ---------- */

function StatCard({
    label,
    value,
}: {
    label: string
    value: string | number
}) {
    return (
        <div
            style={{
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                padding: 16,
                background: '#fff',
            }}
        >
            <div style={{ fontSize: 13, color: '#6b7280' }}>
                {label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>
                {value}
            </div>
        </div>
    )
}

const primaryButton = {
    padding: '12px 16px',
    background: '#2563eb',
    color: '#fff',
    borderRadius: 10,
    border: 'none',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
}
