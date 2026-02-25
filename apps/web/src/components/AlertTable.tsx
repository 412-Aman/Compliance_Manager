import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowUpRight } from 'lucide-react';

interface Alert {
    id: string;
    customer_label: string;
    customer_address: string;
    alert_type: string;
    risk_score: number;
    created_at: string;
}

export default function AlertTable() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8000/api/v1/alerts?status=OPEN')
            .then(res => res.json())
            .then(data => { setAlerts(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const getTag = (score: number) => {
        if (score >= 75) return { class: 'tag-danger', label: 'Critical' };
        if (score >= 50) return { class: 'tag-warning', label: 'Warning' };
        return { class: 'tag-success', label: 'Low' };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (alerts.length === 0) {
        return (
            <div className="py-32 text-center">
                <h2 className="text-2xl font-medium mb-2">All clear</h2>
                <p className="text-[var(--text-dim)]">No anomalies detected</p>
            </div>
        );
    }

    return (
        <div>
            {alerts.map((alert) => {
                const tag = getTag(alert.risk_score);
                return (
                    <Link
                        key={alert.id}
                        to={`/alerts/${alert.id}`}
                        className="grid grid-cols-[auto,1fr,120px,140px,auto] items-center gap-6 py-6 border-b border-[var(--border)] hover:bg-white/5 transition"
                    >
                        <AlertTriangle className="text-[var(--danger)]" />

                        <div>
                            <div className="flex items-center gap-3">
                                <span className="font-medium">{alert.alert_type.replace(/_/g, ' ')}</span>
                                <span className={`tag ${tag.class}`}>{tag.label}</span>
                            </div>
                            <div className="text-sm text-[var(--text-muted)]">
                                {alert.customer_label}
                            </div>
                        </div>

                        <code className="text-xs text-[var(--text-muted)] font-mono">
                            {alert.customer_address.slice(0, 10)}...
                        </code>

                        <span className="text-3xl font-semibold tabular-nums text-right">
                            {Math.round(alert.risk_score)}
                        </span>

                        <ArrowUpRight className="text-[var(--text-muted)]" />
                    </Link>
                );
            })}
        </div>
    );
}
