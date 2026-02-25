import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Activity, AlertTriangle, TrendingUp, TrendingDown, Clock, Wallet, Shield, Zap } from 'lucide-react';
import { fetchApi } from '../lib/api';

interface Customer {
    id: string;
    label: string;
    chain: string;
    address: string;
    created_at: string;
}

interface Stats {
    transaction_count: number;
    alert_count: number;
    last_activity: string | null;
    monitoring_status: 'ACTIVE' | 'PENDING' | 'IDLE';
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface Transaction {
    id: string;
    tx_hash: string;
    direction: string;
    amount_usd: number;
    asset: string;
    counterparty: string;
    block_time: string;
}

export default function CustomerDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            Promise.all([
                fetchApi(`/customers/${id}`),
                fetchApi(`/customers/${id}/stats`),
                fetchApi(`/customers/${id}/transactions`)
            ])
                .then(([cust, st, txs]) => {
                    setCustomer(cust);
                    setStats(st);
                    setTransactions(txs);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [id]);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'ACTIVE': return { color: 'bg-green-500', pulse: true, label: 'Actively Monitoring', icon: Zap };
            case 'PENDING': return { color: 'bg-yellow-500', pulse: true, label: 'Awaiting First Transaction', icon: Clock };
            case 'IDLE': return { color: 'bg-gray-500', pulse: false, label: 'No Recent Activity', icon: Activity };
            default: return { color: 'bg-gray-500', pulse: false, label: 'Unknown', icon: Activity };
        }
    };

    const getRiskConfig = (level: string) => {
        switch (level) {
            case 'LOW': return { color: 'text-green-400', bg: 'bg-green-500/20', label: 'Low Risk' };
            case 'MEDIUM': return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Medium Risk' };
            case 'HIGH': return { color: 'text-red-400', bg: 'bg-red-500/20', label: 'High Risk' };
            default: return { color: 'text-gray-400', bg: 'bg-gray-500/20', label: 'Unknown' };
        }
    };

    const getChainColor = (chain: string) => {
        switch (chain?.toLowerCase()) {
            case 'ethereum': return 'bg-blue-500/20 text-blue-400';
            case 'polygon': return 'bg-purple-500/20 text-purple-400';
            case 'arbitrum': return 'bg-cyan-500/20 text-cyan-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!customer || !stats) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-[var(--text-dim)]">Customer not found</p>
            </div>
        );
    }

    const statusConfig = getStatusConfig(stats.monitoring_status);
    const riskConfig = getRiskConfig(stats.risk_level);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="page min-h-screen">
            {/* Back */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-[var(--text-dim)] hover:text-[var(--text)] transition-colors mb-10"
            >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Customers</span>
            </button>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-start justify-between gap-8 mb-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
                                {customer.label}
                            </h1>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getChainColor(customer.chain)}`}>
                                {customer.chain}
                            </span>
                        </div>
                        <code className="text-[var(--text-muted)] font-mono text-sm">{customer.address}</code>
                    </div>

                    {/* Live Status Indicator */}
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-3 px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl">
                            <div className={`w-3 h-3 rounded-full ${statusConfig.color} ${statusConfig.pulse ? 'animate-pulse' : ''}`} />
                            <StatusIcon className="w-4 h-4 text-[var(--text-muted)]" />
                            <span className="text-sm font-medium">{statusConfig.label}</span>
                        </div>
                        {stats.last_activity && (
                            <span className="text-xs text-[var(--text-muted)]">
                                Last seen: {new Date(stats.last_activity).toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Risk Level */}
                <div className={`card ${riskConfig.bg} border-none`}>
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className={`w-6 h-6 ${riskConfig.color}`} />
                        <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Risk Level</span>
                    </div>
                    <div className={`text-3xl font-bold ${riskConfig.color}`}>{riskConfig.label}</div>
                </div>

                {/* Transactions */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <Activity className="w-6 h-6 text-[var(--primary)]" />
                        <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Transactions</span>
                    </div>
                    <div className="text-3xl font-bold">{stats.transaction_count}</div>
                </div>

                {/* Alerts */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className={`w-6 h-6 ${stats.alert_count > 0 ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]'}`} />
                        <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Alerts</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{stats.alert_count}</span>
                        {stats.alert_count > 0 && (
                            <Link to={`/alerts?customer=${id}`} className="text-sm text-[var(--primary)] hover:underline">
                                View alerts →
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <section>
                <h2 className="text-xl font-semibold mb-6">Transaction History</h2>
                {transactions.length === 0 ? (
                    <div className="card text-center py-12">
                        <Wallet className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                        <p className="text-[var(--text-dim)] mb-2">No transactions recorded yet</p>
                        <p className="text-sm text-[var(--text-muted)]">
                            The system is monitoring this address. Transactions will appear here when detected.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-0">
                        {transactions.map((tx) => (
                            <div
                                key={tx.id}
                                className="flex items-center gap-4 py-4 border-b border-[var(--border)] hover:bg-white/5 transition-all"
                            >
                                <div className={`p-2 rounded-lg ${tx.direction === 'IN' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                    {tx.direction === 'IN' ? (
                                        <TrendingDown className="w-5 h-5 text-green-400" />
                                    ) : (
                                        <TrendingUp className="w-5 h-5 text-red-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium">{tx.direction === 'IN' ? 'Received' : 'Sent'}</span>
                                        <span className="text-sm text-[var(--text-muted)]">{tx.asset}</span>
                                    </div>
                                    <code className="text-xs text-[var(--text-muted)] font-mono">
                                        {tx.tx_hash.slice(0, 20)}...
                                    </code>
                                </div>
                                <div className="text-right">
                                    <div className={`text-lg font-semibold ${tx.direction === 'IN' ? 'text-green-400' : 'text-red-400'}`}>
                                        {tx.direction === 'IN' ? '+' : '-'}${tx.amount_usd.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-[var(--text-muted)]">
                                        {new Date(tx.block_time).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
