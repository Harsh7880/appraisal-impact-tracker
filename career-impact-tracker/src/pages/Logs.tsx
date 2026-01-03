import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

type Log = {
    id: string;
    title: string;
    impact_type: string;
    effort_level: string;
    created_at: string;
};

export default function Logs() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            const { data, error } = await supabase
                .from("logs")
                .select("*")
                .order("created_at", { ascending: false });

            if (!error && data) setLogs(data);
            setLoading(false);
        };

        fetchLogs();
    }, []);

    if (loading) return <div>Loading logs...</div>;
    
    const deleteLog = async (id: string) => {
        if (!confirm('Delete this log?')) return
        await supabase.from('logs').delete().eq('id', id)
        setLogs(logs.filter(l => l.id !== id))
    }

    return (
        <div style={{ maxWidth: 700, margin: "auto" }}>
            <h2>Your Work Logs</h2>

            <Link to="/add">
                <button >Add Entry</button>
            </Link>

            {logs.length === 0 && <p>No logs yet. Add your first entry.</p>}

            {logs.map((log) => (
                <div key={log.id} style={{ borderBottom: "1px solid #ddd" }}>
                    <h4 style={{ marginBottom: 6 }}>{log.title}</h4>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <small>
                            {log.impact_type} · {log.effort_level} •{' '}
                            {new Date(log.created_at).toDateString()}
                        </small>

                        <button onClick={() => deleteLog(log.id)}>🗑️</button>
                    </div>
                </div>
            ))}
        </div>
    );
}
