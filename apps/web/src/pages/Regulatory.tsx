import { useEffect, useState } from 'react';
import { RefreshCw, ArrowUpRight, Calendar, X, ExternalLink, FileText } from 'lucide-react';
import { Button } from '../components/ui/button';
import { fetchApi, API_BASE_URL } from '../lib/api';

interface Doc {
    id: string;
    source: string;
    fetched_at: string;
    raw_text?: string;
    url: string;
    jurisdiction?: string;
    parsed_json?: {
        summary?: string;
        obligations?: string[];
    };
}

export default function Regulatory() {
    const [docs, setDocs] = useState<Doc[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);

    const fetchDocs = () => {
        fetchApi('/regulatory/updates')
            .then(d => { setDocs(d); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { fetchDocs(); }, []);

    const handleSync = async () => {
        setSyncing(true);
        await fetch(`${API_BASE_URL}/regulatory/poll`, { method: 'POST' });
        await fetchDocs();
        setSyncing(false);
    };

    const getSourceColor = (source: string) => {
        switch (source.toUpperCase()) {
            case 'FCA': return 'bg-blue-500/20 text-blue-400';
            case 'FINCEN': return 'bg-green-500/20 text-green-400';
            case 'FATF': return 'bg-purple-500/20 text-purple-400';
            case 'MFSA': return 'bg-orange-500/20 text-orange-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <div className="page min-h-screen">
            <header className="flex items-end justify-between mb-12">
                <div>
                    <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight mb-3">Regulatory</h1>
                    <p className="text-lg text-[var(--text-dim)]">Live updates from global regulatory bodies</p>
                </div>
                <Button variant="secondary" loading={syncing} onClick={handleSync} prefix={<RefreshCw className="w-4 h-4" />}>
                    {syncing ? 'Syncing...' : 'Sync'}
                </Button>
            </header>

            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : docs.length === 0 ? (
                <div className="py-32 text-center">
                    <h2 className="text-2xl font-medium mb-2">No updates yet</h2>
                    <p className="text-[var(--text-dim)]">Click sync to fetch latest regulatory news</p>
                </div>
            ) : (
                <div className="space-y-0">
                    {docs.map((doc) => (
                        <div
                            key={doc.id}
                            onClick={() => setSelectedDoc(doc)}
                            className="flex items-start gap-4 py-5 border-b border-[var(--border)] hover:pl-4 hover:bg-white/5 transition-all duration-200 group cursor-pointer"
                        >
                            <div className="p-2.5 bg-[var(--primary)]/10 rounded-lg">
                                <FileText className="w-5 h-5 text-[var(--primary)]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2.5 mb-2">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getSourceColor(doc.source)}`}>
                                        {doc.source}
                                    </span>
                                    <span className="text-xs text-[var(--text-muted)]">{doc.jurisdiction || 'Global'}</span>
                                </div>
                                <p className="text-base leading-relaxed group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                                    {doc.parsed_json?.summary || doc.raw_text?.slice(0, 150) || 'Click to view details'}
                                </p>
                            </div>

                            <div className="flex items-center gap-6 flex-shrink-0 pt-1">
                                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] min-w-[100px]">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(doc.fetched_at).toLocaleDateString()}</span>
                                </div>
                                <ArrowUpRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {selectedDoc && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-6">
                    <div className="w-full max-w-3xl max-h-[80vh] bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-8 relative overflow-y-auto">
                        <button
                            onClick={() => setSelectedDoc(null)}
                            className="absolute top-6 right-6 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getSourceColor(selectedDoc.source)}`}>
                                {selectedDoc.source}
                            </span>
                            <span className="text-sm text-[var(--text-muted)]">{selectedDoc.jurisdiction || 'Global'}</span>
                            <span className="text-sm text-[var(--text-muted)]">•</span>
                            <span className="text-sm text-[var(--text-muted)]">{new Date(selectedDoc.fetched_at).toLocaleString()}</span>
                        </div>

                        <h2 className="text-2xl font-semibold mb-6">Regulatory Update</h2>

                        {selectedDoc.parsed_json?.summary && (
                            <div className="mb-6">
                                <h3 className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">AI Summary</h3>
                                <p className="text-lg leading-relaxed">{selectedDoc.parsed_json.summary}</p>
                            </div>
                        )}

                        {selectedDoc.parsed_json?.obligations && selectedDoc.parsed_json.obligations.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Key Obligations</h3>
                                <ul className="space-y-2">
                                    {selectedDoc.parsed_json.obligations.map((ob, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="text-[var(--primary)]">•</span>
                                            <span>{ob}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="mb-6">
                            <h3 className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Raw Content</h3>
                            <div className="p-4 bg-black/20 rounded-lg max-h-60 overflow-y-auto">
                                <pre className="text-sm text-[var(--text-dim)] whitespace-pre-wrap font-mono">
                                    {selectedDoc.raw_text || 'No raw content available'}
                                </pre>
                            </div>
                        </div>

                        <a
                            href={selectedDoc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-[var(--primary)] hover:underline"
                        >
                            <ExternalLink className="w-4 h-4" />
                            View Original Source
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}