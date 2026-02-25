import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X, Check, Wallet, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { fetchApi, API_BASE_URL } from '../lib/api';

interface Customer {
    id: string;
    label: string;
    chain: string;
    address: string;
    created_at: string;
}

export default function Customers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ label: '', chain: 'ethereum', address: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetchCustomers = () => {
        fetchApi('/customers')
            .then(data => { setCustomers(data); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { fetchCustomers(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await fetch(`${API_BASE_URL}/customers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    declared_profile: { country: 'Unknown', income_band: 'MID', occupation: 'Unknown', source_of_funds: 'Unknown', expected_monthly_volume_usd: 10000, risk_appetite: 'MED' }
                })
            });
            setShowModal(false);
            setForm({ label: '', chain: 'ethereum', address: '' });
            fetchCustomers(); // Refresh list
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const getChainColor = (chain: string) => {
        switch (chain.toLowerCase()) {
            case 'ethereum': return 'bg-blue-500/20 text-blue-400';
            case 'polygon': return 'bg-purple-500/20 text-purple-400';
            case 'arbitrum': return 'bg-cyan-500/20 text-cyan-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <div className="page min-h-screen">
            <header className="flex items-end justify-between mb-12">
                <div>
                    <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight mb-3">Customers</h1>
                    <p className="text-lg text-[var(--text-dim)]">Monitored wallet addresses</p>
                </div>
                <Button variant="primary" onClick={() => setShowModal(true)} prefix={<Plus className="w-4 h-4" />}>
                    Add Target
                </Button>
            </header>

            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : customers.length === 0 ? (
                <div className="py-24 text-center">
                    <h2 className="text-2xl font-medium mb-3">Start monitoring</h2>
                    <p className="text-lg text-[var(--text-dim)] max-w-md mx-auto mb-8">
                        Add wallet addresses to begin real-time behavioral analysis.
                    </p>
                    <Button variant="secondary" onClick={() => setShowModal(true)}>
                        Add your first target
                    </Button>
                </div>
            ) : (
                <div className="space-y-0">
                    {customers.map((customer) => (
                        <Link
                            key={customer.id}
                            to={`/customers/${customer.id}`}
                            className="flex items-center gap-4 py-5 border-b border-[var(--border)] hover:bg-white/5 hover:pl-2 transition-all group"
                        >
                            <div className="p-3 bg-[var(--primary)]/10 rounded-xl">
                                <Wallet className="w-5 h-5 text-[var(--primary)]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="font-semibold text-lg group-hover:text-[var(--primary)] transition-colors">{customer.label}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getChainColor(customer.chain)}`}>
                                        {customer.chain}
                                    </span>
                                </div>
                                <code className="text-sm text-[var(--text-muted)] font-mono">
                                    {customer.address}
                                </code>
                            </div>
                            <div className="text-sm text-[var(--text-muted)]">
                                {new Date(customer.created_at).toLocaleDateString()}
                            </div>
                            <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
                        </Link>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-6">
                    <div className="w-full max-w-lg bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-8 relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-6 right-6 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-2xl font-semibold mb-6">Add Target</h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm text-[var(--text-dim)] mb-2">Label</label>
                                <input
                                    type="text"
                                    required
                                    value={form.label}
                                    onChange={e => setForm({ ...form, label: e.target.value })}
                                    className="input"
                                    placeholder="Coinbase Hot Wallet"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-[var(--text-dim)] mb-2">Network</label>
                                <select
                                    value={form.chain}
                                    onChange={e => setForm({ ...form, chain: e.target.value })}
                                    className="input"
                                >
                                    <option value="ethereum">Ethereum</option>
                                    <option value="polygon">Polygon</option>
                                    <option value="arbitrum">Arbitrum</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-[var(--text-dim)] mb-2">Address</label>
                                <input
                                    type="text"
                                    required
                                    value={form.address}
                                    onChange={e => setForm({ ...form, address: e.target.value })}
                                    className="input font-mono"
                                    placeholder="0x..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
                                    Cancel
                                </Button>
                                <Button variant="primary" className="flex-1" loading={submitting} prefix={<Check className="w-4 h-4" />}>
                                    Start
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}