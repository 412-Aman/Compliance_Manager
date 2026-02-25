import React from 'react';
import { Button } from './ui/button';

const RedirectionOverlay: React.FC = () => {
    const targetUrl = "https://ai-payment-process.onrender.com";

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6 text-center">
            <div className="max-w-xl w-full space-y-8 animate-in fade-in zoom-in duration-500">
                {/* Visual indicator */}
                <div className="flex justify-center">
                    <div className="relative flex h-20 w-20">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-20" />
                        <div className="relative inline-flex rounded-full h-20 w-20 bg-black border-2 border-[var(--primary)] items-center justify-center">
                            <svg className="w-10 h-10 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                        Service has <span className="gradient-text">Relocated</span>
                    </h1>
                    <p className="text-lg text-[var(--text-dim)] leading-relaxed">
                        We have migrated our primary Compliance intelligence engine and
                        Anomaly Detection demo to a optimized environment for the Deriv Hackathon.
                    </p>
                </div>

                <div className="bg-[var(--bg-elevated)] border border-[var(--border)] p-6 rounded-2xl space-y-4">
                    <p className="text-sm text-[var(--text-muted)] uppercase tracking-widest">
                        Redirecting to
                    </p>
                    <p className="text-xl font-mono text-[var(--primary)] break-all">
                        ai-payment-process.onrender.com
                    </p>
                </div>

                <div className="pt-4">
                    <Button
                        variant="primary"
                        size="large"
                        className="w-full h-16 text-lg font-bold shadow-[0_0_50px_rgba(146,111,52,0.3)]"
                        onClick={() => window.location.href = targetUrl}
                    >
                        Enter Second Project Now
                    </Button>
                </div>

                <p className="text-xs text-[var(--text-muted)] animate-pulse">
                    Click the button above to continue to the live demo
                </p>
            </div>
        </div>
    );
};

export default RedirectionOverlay;
