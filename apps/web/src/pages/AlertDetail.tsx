import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, X, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { fetchApi } from '../lib/api';

interface Driver {
    feature: string;
    observed: string;
    expected: string;
    delta: string;
    severity: number;
}

interface AlertData {
    id: string;
    customer_label: string;
    customer_address: string;
    alert_type: string;
    risk_score: number;
    confidence: number;
    status: string;
    drivers_json: Driver[];
    explanation_nl: string;
    recommendations_nl: string;
    created_at: string;
}

export default function AlertDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [alert, setAlert] = useState<AlertData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchApi(`/alerts/${id}`)
                .then(data => { setAlert(data); setLoading(false); })
                .catch(() => setLoading(false));
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!alert) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-[var(--text-dim)]">Alert not found</p>
            </div>
        );
    }

    return (
        <div className="page min-h-screen">
            {/* Back */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-[var(--text-dim)] hover:text-[var(--text)] transition-colors mb-10"
            >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
            </button>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-start justify-between gap-8 mb-4">
                    <div className="flex-1">
                        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
                            {alert.alert_type.replace(/_/g, ' ')}
                        </h1>
                        <code className="text-[var(--text-muted)] font-mono text-sm">{alert.customer_address}</code>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <div className="text-6xl font-semibold gradient-text mb-1">{Math.round(alert.risk_score)}</div>
                        <div className="text-sm text-[var(--text-muted)]">Risk Score</div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Analysis */}
                    <section className="card space-y-6">
                        <h2 className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                            AI Analysis
                        </h2>
                        <p className="text-lg text-[var(--text-dim)] leading-relaxed">
                            {alert.explanation_nl}
                        </p>
                    </section>

                    {/* Recommendations */}
                    <section className="card bg-[var(--primary)]/5 border-[var(--primary)]/20 space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-[var(--primary)]/10 rounded-lg">
                                <Check className="w-5 h-5 text-[var(--primary)]" />
                            </span>
                            <h2 className="text-xs uppercase tracking-wider text-[var(--primary)] font-semibold">
                                AI Compliance Advice
                            </h2>
                        </div>
                        <p className="text-xl font-medium leading-relaxed">
                            {alert.recommendations_nl}
                        </p>
                    </section>

                    {/* Drivers */}
                    <div className="card space-y-6">
                        <h2 className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                            Risk Drivers
                        </h2>
                        {alert.drivers_json?.map((d, i) => (
                            <div key={i} className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="font-medium">{d.feature.replace(/_/g, ' ')}</span>
                                    <span className="text-[var(--danger)]">{Math.round(d.severity * 100)}%</span>
                                </div>
                                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div style={{ width: `${d.severity * 100}%` }} className="h-full bg-gradient-to-r from-cyan-400 to-red-500" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="card">
                        <div className="text-xs text-[var(--text-muted)] mb-2">Confidence</div>
                        <div className="text-3xl font-semibold">{Math.round(alert.confidence * 100)}%</div>
                    </div>

                    <div className="card">
                        <div className="text-xs text-[var(--text-muted)] mb-2">Status</div>
                        <div className="text-base font-medium">{alert.status}</div>
                    </div>

                    <div className="card">
                        <div className="text-xs text-[var(--text-muted)] mb-2">Entity</div>
                        <div className="text-base font-medium">{alert.customer_label}</div>
                    </div>

                    <div className="space-y-3 pt-4">
                        <Button variant="error" className="w-full" prefix={<AlertTriangle className="w-4 h-4" />}>
                            Confirm Threat
                        </Button>
                        <Button variant="secondary" className="w-full" prefix={<X className="w-4 h-4" />}>
                            Dismiss
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}