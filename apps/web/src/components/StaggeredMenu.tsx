import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';

export interface StaggeredMenuItem {
    label: string;
    ariaLabel: string;
    link: string;
}

export interface StaggeredMenuProps {
    position?: 'left' | 'right';
    colors?: string[];
    items?: StaggeredMenuItem[];
    displayItemNumbering?: boolean;
    accentColor?: string;
}

export const StaggeredMenu: React.FC<StaggeredMenuProps> = ({
    position = 'right',
    colors = ['#18181b', '#27272a'],
    items = [],
    displayItemNumbering = true,
    accentColor = '#06b6d4',
}) => {
    const [open, setOpen] = useState(false);
    const openRef = useRef(false);
    const navigate = useNavigate();

    const panelRef = useRef<HTMLDivElement | null>(null);
    const preLayersRef = useRef<HTMLDivElement | null>(null);
    const preLayerElsRef = useRef<HTMLElement[]>([]);
    const plusHRef = useRef<HTMLSpanElement | null>(null);
    const plusVRef = useRef<HTMLSpanElement | null>(null);
    const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
    const busyRef = useRef(false);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const panel = panelRef.current;
            const preContainer = preLayersRef.current;
            if (!panel) return;

            let preLayers: HTMLElement[] = [];
            if (preContainer) {
                preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer')) as HTMLElement[];
            }
            preLayerElsRef.current = preLayers;

            const offscreen = position === 'left' ? -100 : 100;
            gsap.set([panel, ...preLayers], { xPercent: offscreen });
            gsap.set(plusHRef.current, { rotate: 0 });
            gsap.set(plusVRef.current, { rotate: 90 });
        });
        return () => ctx.revert();
    }, [position]);

    const playOpen = useCallback(() => {
        if (busyRef.current) return;
        busyRef.current = true;
        const panel = panelRef.current;
        const layers = preLayerElsRef.current;
        if (!panel) return;

        const itemEls = Array.from(panel.querySelectorAll('.sm-label')) as HTMLElement[];
        gsap.set(itemEls, { yPercent: 100, opacity: 0 });

        const tl = gsap.timeline({ onComplete: () => { busyRef.current = false; } });

        layers.forEach((el, i) => {
            tl.to(el, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.05);
        });

        tl.to(panel, { xPercent: 0, duration: 0.6, ease: 'power4.out' }, layers.length * 0.05);
        tl.to(itemEls, { yPercent: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.08 }, '-=0.3');
    }, []);

    const playClose = useCallback(() => {
        const panel = panelRef.current;
        const layers = preLayerElsRef.current;
        if (!panel) return;

        const offscreen = position === 'left' ? -100 : 100;
        gsap.to([...layers, panel], {
            xPercent: offscreen,
            duration: 0.35,
            ease: 'power3.in',
            stagger: 0.02,
            onComplete: () => { busyRef.current = false; }
        });
    }, [position]);

    const animateIcon = useCallback((opening: boolean) => {
        if (opening) {
            gsap.to(plusHRef.current, { rotate: 45, duration: 0.4, ease: 'power4.out' });
            gsap.to(plusVRef.current, { rotate: -45, duration: 0.4, ease: 'power4.out' });
        } else {
            gsap.to(plusHRef.current, { rotate: 0, duration: 0.3, ease: 'power3.inOut' });
            gsap.to(plusVRef.current, { rotate: 90, duration: 0.3, ease: 'power3.inOut' });
        }
    }, []);

    const toggleMenu = useCallback(() => {
        const target = !openRef.current;
        openRef.current = target;
        setOpen(target);
        if (target) playOpen(); else playClose();
        animateIcon(target);
    }, [playOpen, playClose, animateIcon]);

    const closeMenu = useCallback(() => {
        if (openRef.current) {
            openRef.current = false;
            setOpen(false);
            playClose();
            animateIcon(false);
        }
    }, [playClose, animateIcon]);

    const handleNav = (e: React.MouseEvent, link: string) => {
        e.preventDefault();
        closeMenu();
        setTimeout(() => navigate(link), 300);
    };

    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {/* Layers */}
            <div ref={preLayersRef} className="absolute top-0 right-0 bottom-0 w-[420px]">
                {colors.map((c, i) => (
                    <div key={i} className="sm-prelayer absolute inset-0" style={{ background: c }} />
                ))}
            </div>

            {/* Panel */}
            <aside
                ref={panelRef}
                className="fixed top-0 right-0 h-full w-[420px] bg-[var(--bg-panel)] border-l border-[var(--border)] px-12 flex flex-col justify-center pointer-events-auto"
                style={{ ['--accent' as string]: accentColor }}
            >
                <nav>
                    <ul className="space-y-4">
                        {items.map((item, i) => (
                            <li key={item.link} className="overflow-hidden">
                                <a
                                    href={item.link}
                                    onClick={(e) => handleNav(e, item.link)}
                                    className="sm-label flex items-baseline gap-4"
                                >
                                    {displayItemNumbering && (
                                        <span className="text-sm font-mono text-[var(--primary)] opacity-60">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                    )}
                                    <span className="text-5xl font-semibold tracking-tight text-[var(--text)] hover:text-[var(--primary)] transition">
                                        {item.label}
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Toggle Button */}
            <button
                ref={toggleBtnRef}
                onClick={toggleMenu}
                className="fixed top-6 right-6 z-50 pointer-events-auto flex items-center gap-3 px-5 h-12 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] hover:bg-white/5 transition"
            >
                <span className="text-sm font-medium tracking-wide">
                    {open ? 'Close' : 'Menu'}
                </span>
                <span className="relative w-4 h-4">
                    <span ref={plusHRef} className="absolute inset-0 m-auto w-full h-0.5 bg-current" />
                    <span ref={plusVRef} className="absolute inset-0 m-auto w-full h-0.5 bg-current" />
                </span>
            </button>
        </div>
    );
};

export default StaggeredMenu;
