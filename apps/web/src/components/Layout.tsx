import { Outlet, useNavigate } from 'react-router-dom';
import StaggeredMenu from './StaggeredMenu';
import { useWebSocket } from '../hooks/useWebSocket';
import { useState, useCallback } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const menuItems = [
    { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
    { label: 'Alerts', ariaLabel: 'View alerts', link: '/alerts' },
    { label: 'Regulatory', ariaLabel: 'Regulatory feed', link: '/regulatory' },
    { label: 'Customers', ariaLabel: 'Manage customers', link: '/customers' }
];

interface Toast {
    id: string;
    message: string;
    riskScore: number;
}

export default function Layout() {
    const navigate = useNavigate();
    const [toasts, setToasts] = useState<Toast[]>([]);

    const handleWsMessage = useCallback((event: string, data: any) => {
        if (event === 'alert.created') {
            const newToast: Toast = {
                id: data.alert_id,
                message: `New Alert Detected`,
                riskScore: data.risk_score
            };
            setToasts(prev => [...prev, newToast]);
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== newToast.id));
            }, 7000);
        }
    }, []);

    useWebSocket(handleWsMessage);

    const dismissToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div className="min-h-screen">
            <StaggeredMenu
                position="right"
                items={menuItems}
                displayItemNumbering={true}
                colors={['#18181b', '#27272a']}
                accentColor="#06b6d4"
            />
            <main>
                <Outlet />
            </main>

            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[100] space-y-3">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        onClick={() => { navigate(`/alerts/${toast.id}`); dismissToast(toast.id); }}
                        className="flex items-center gap-4 bg-[var(--bg-elevated)] border border-[var(--danger)]/50 rounded-xl p-4 shadow-2xl cursor-pointer hover:bg-white/5 transition-all animate-pulse"
                    >
                        <AlertTriangle className="w-6 h-6 text-[var(--danger)]" />
                        <div>
                            <div className="font-semibold">{toast.message}</div>
                            <div className="text-sm text-[var(--text-muted)]">Risk Score: {Math.round(toast.riskScore)}</div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); dismissToast(toast.id); }} className="ml-auto">
                            <X className="w-5 h-5 text-[var(--text-muted)] hover:text-white" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
