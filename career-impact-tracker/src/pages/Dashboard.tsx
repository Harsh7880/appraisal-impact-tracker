import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'

type Stats = {
    totalLogs: number
    lastLogDate: string | null
    topImpact: string | null
    impactBreakdown: Record<string, number>
}
const impactColorMap: Record<
    string,
    { bg: string; text: string }
> = {
    'Bug Fix': { bg: '#fee2e2', text: '#991b1b' },
    Performance: { bg: '#dbeafe', text: '#1e40af' },
    Ownership: { bg: '#fef3c7', text: '#92400e' },
    Collaboration: { bg: '#e0e7ff', text: '#3730a3' },
    Delivery: { bg: '#dcfce7', text: '#166534' },
}


export default function Dashboard() {
    const [stats, setStats] = useState<Stats>({
        totalLogs: 0,
        lastLogDate: null,
        topImpact: null,
        impactBreakdown: {},
    })
    const [streak, setStreak] = useState({
        activeLast7Days: false,
        activeDaysThisWeek: 0,
    })

    const [recentLogs, setRecentLogs] = useState<any[]>([])
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
                .select('id, title, impact_type, created_at')
                .order('created_at', { ascending: false })

            if (logs && logs.length > 0) {
                setRecentLogs(logs.slice(0, 3))

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
                    impactBreakdown: impactCount,
                })
                // ----- STEP C: Streak calculation -----
                const today = new Date()
                const last7Days = new Set<string>()
                const thisWeek = new Set<string>()

                logs.forEach((log) => {
                    const logDate = new Date(log.created_at)
                    const dateKey = logDate.toDateString()

                    const diffDays =
                        (today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)

                    if (diffDays <= 7) {
                        last7Days.add(dateKey)
                    }

                    if (diffDays <= today.getDay() + 1) {
                        thisWeek.add(dateKey)
                    }
                })

                setStreak({
                    activeLast7Days: last7Days.size > 0,
                    activeDaysThisWeek: thisWeek.size,
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

            {/* Momentum / Streaks */}
            <div
                style={{
                    display: 'flex',
                    gap: 16,
                    marginBottom: 32,
                    flexWrap: 'wrap',
                }}
            >
                <div
                    style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: 12,
                        padding: 16,
                        background: '#fff',
                        fontSize: 14,
                    }}
                >
                    {streak.activeLast7Days ? '🔥 Active in last 7 days' : '⏸ No activity in last 7 days'}
                </div>

                <div
                    style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: 12,
                        padding: 16,
                        background: '#fff',
                        fontSize: 14,
                    }}
                >
                    📆 {streak.activeDaysThisWeek} day(s) active this week
                </div>
            </div>
            {/* Recent Activity */}
            {recentLogs.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                    <h3 style={{ fontSize: 18, marginBottom: 12 }}>
                        Recent activity
                    </h3>
                    {recentLogs.map((log) => (
                        <div
                            style={{
                                border: '1px solid #e5e7eb',
                                borderRadius: 12,
                                background: '#fff',
                                overflow: 'hidden',
                                marginBottom: 10,
                            }}
                        >
                            <Link
                                key={log.id}
                                to={`/logs/edit/${log.id}`}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '10px 14px',
                                    borderBottom: '1px solid #e5e7eb',
                                    textDecoration: 'none',
                                    color: '#111827',
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 600 }}>
                                        {log.title}
                                    </div>
                                    <span
                                        style={{
                                            fontSize: 11,
                                            padding: '2px 8px',
                                            borderRadius: 999,
                                            background: impactColorMap[log.impact_type]?.bg ?? '#f3f4f6',
                                            color: impactColorMap[log.impact_type]?.text ?? '#374151',
                                            display: 'inline-block',
                                            marginTop: 4,
                                        }}
                                    >
                                        {log.impact_type}
                                    </span>
                                </div>

                                <div style={{ fontSize: 12, color: '#6b7280' }}>
                                    {new Date(log.created_at).toDateString()}
                                </div>
                            </Link>
                        </div>
                    ))}

                </div>
            )}
            {/* Impact distribution */}
            {stats.totalLogs > 0 && (
                <div style={{ marginBottom: 32 }}>
                    <h3 style={{ fontSize: 18, marginBottom: 6 }}>
                        Impact distribution
                    </h3>

                    {stats.topImpact && (
                        <p
                            style={{
                                fontSize: 13,
                                color: '#6b7280',
                                marginBottom: 12,
                            }}
                        >
                            Most of your recent work is focused on{' '}
                            <strong style={{ color: '#111827' }}>
                                {stats.topImpact}
                            </strong>
                            , showing strong delivery impact.
                        </p>
                    )}

                    <div style={{ display: 'grid', gap: 12 }}>
                        {Object.entries(stats.impactBreakdown).map(
                            ([impact, count]) => {
                                const percent = Math.round(
                                    (count / stats.totalLogs) * 100
                                )

                                return (
                                    <div key={impact}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                fontSize: 13,
                                                marginBottom: 4,
                                            }}
                                        >
                                            <span>{impact}</span>
                                            <span>{percent}%</span>
                                        </div>

                                        <div
                                            style={{
                                                height: 8,
                                                background: '#e5e7eb',
                                                borderRadius: 999,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: `${percent}%`,
                                                    height: '100%',
                                                    background: '#2563eb',
                                                    borderRadius: 999,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )
                            }
                        )}
                    </div>
                </div>
            )}
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

            {/* Quick actions */}
            <div
                style={{
                    marginTop: 24,
                    display: 'flex',
                    gap: 16,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                }}
            >
                <span style={{ fontSize: 14, color: '#6b7280' }}>
                    Quick actions:
                </span>

                <Link to="/add">
                    <button
                        style={{
                            padding: '8px 14px',
                            borderRadius: 8,
                            border: '1px solid #d1d5db',
                            background: '#fff',
                            fontSize: 14,
                            cursor: 'pointer',
                        }}
                    >
                        ➕ Add log
                    </button>
                </Link>

                <Link to="/logs">
                    <button
                        style={{
                            padding: '8px 14px',
                            borderRadius: 8,
                            border: '1px solid #d1d5db',
                            background: '#fff',
                            fontSize: 14,
                            cursor: 'pointer',
                        }}
                    >
                        📄 View all logs
                    </button>
                </Link>
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
