import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Activity, Search, AlertTriangle, CheckCircle } from 'lucide-react';

interface Log {
    id: string;
    action: string;
    status: 'success' | 'warning' | 'danger' | 'info';
    time: string;
}

const generateLog = (): Log => {
    const actions = [
        { msg: 'Analyzing transaction flow...', status: 'info' },
        { msg: 'Velocity check: PASSED', status: 'success' },
        { msg: 'Cross-referencing sanctions list...', status: 'info' },
        { msg: 'Behavioral anomaly detected (Score: 85)', status: 'warning' },
        { msg: 'Geo-location mismatch verified', status: 'danger' },
        { msg: 'Identity verification: MATCH', status: 'success' },
        { msg: 'Pattern recognition: NORMAL', status: 'success' },
        { msg: 'Updating risk profile...', status: 'info' },
    ] as const;

    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    return {
        id: Math.random().toString(36).substring(7),
        action: randomAction.msg,
        status: randomAction.status,
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + Math.floor(Math.random() * 999)
    };
};

export default function LiveRiskFeed() {
    const [logs, setLogs] = useState<Log[]>([]);

    useEffect(() => {
        // Initial logs
        setLogs([
            generateLog(),
            generateLog(),
            generateLog(),
        ]);

        const interval = setInterval(() => {
            setLogs(prev => {
                const newLogs = [generateLog(), ...prev];
                if (newLogs.length > 6) newLogs.pop();
                return newLogs;
            });
        }, 800);

        return () => clearInterval(interval);
    }, []);

    const getIcon = (status: Log['status']) => {
        switch (status) {
            case 'success': return <CheckCircle size={14} className="text-[var(--success)]" />;
            case 'warning': return <Activity size={14} className="text-[var(--warning)]" />;
            case 'danger': return <AlertTriangle size={14} className="text-[var(--danger)]" />;
            default: return <Search size={14} className="text-[var(--primary)]" />;
        }
    };

    return (
        <div className="relative w-full max-w-md mx-auto perspective-1000">
            {/* Main Glass Card */}
            <motion.div
                initial={{ opacity: 0, rotateX: 10, y: 20 }}
                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)]/50 backdrop-blur-md shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] bg-black/20">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-[var(--primary)]/10">
                            <Shield size={16} className="text-[var(--primary)]" />
                        </div>
                        <span className="text-sm font-medium tracking-wide">Live Risk Monitor</span>
                    </div>
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-500/20" />
                        <div className="w-2 h-2 rounded-full bg-green-500/50" />
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                </div>

                {/* Feed Content */}
                <div className="p-5 min-h-[300px] flex flex-col gap-3 font-mono text-xs">
                    <AnimatePresence mode='popLayout'>
                        {logs.map((log) => (
                            <motion.div
                                key={log.id}
                                layout
                                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4 }}
                                className="flex items-center gap-3 p-3 rounded-lg bg-black/40 border border-[var(--border)]"
                            >
                                <span className="text-[var(--text-muted)] w-20 shrink-0">{log.time}</span>
                                <div className="shrink-0">
                                    {getIcon(log.status)}
                                </div>
                                <span className={`truncate ${log.status === 'danger' ? 'text-[var(--danger)]' :
                                    log.status === 'warning' ? 'text-[var(--warning)]' : 'text-[var(--text-dim)]'
                                    }`}>
                                    {log.action}
                                </span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Decorative gradients */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/5 blur-3xl rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[var(--primary)]/10 blur-2xl rounded-full pointer-events-none" />
            </motion.div>

            {/* Floating connecting line decoration */}
            <svg className="absolute -z-10 -right-12 top-1/2 -translate-y-1/2 h-64 w-64 opacity-20 text-[var(--primary)]">
                <circle cx="50%" cy="50%" r="40%" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="animate-[spin_10s_linear_infinite]" />
                <circle cx="50%" cy="50%" r="30%" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" className="animate-[spin_15s_linear_infinite_reverse]" />
            </svg>
        </div>
    );
}
