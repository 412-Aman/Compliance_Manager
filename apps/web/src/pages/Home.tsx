import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import GridScan from '../components/GridScan';
import LaserFlow from '../components/LaserFlow';
import { Button } from '../components/ui/button';
import derivLogo from '../assets/deriv.svg';
import LiveRiskFeed from '../components/LiveRiskFeed';

const ArrowRight = () => (
    <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16">
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.53033 2.21968L9 1.68935L7.93934 2.75001L8.46967 3.28034L12.4393 7.25001H1.75H1V8.75001H1.75H12.4393L8.46967 12.7197L7.93934 13.25L9 14.3107L9.53033 13.7803L14.6036 8.70711C14.9941 8.31659 14.9941 7.68342 14.6036 7.2929L9.53033 2.21968Z"
        />
    </svg>
);

export default function Home() {
    const navigate = useNavigate();
    const [scrollY, setScrollY] = useState(0);
    const heroRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        { title: 'Real-time Detection', desc: 'Behavioral anomalies flagged in under 50ms' },
        { title: '140+ Jurisdictions', desc: 'Global regulatory coverage and simulation' },
        { title: 'AI-Powered Analysis', desc: 'Explainable risk scoring with full transparency' },
        { title: '99.99% Uptime', desc: 'Enterprise-grade reliability and redundancy' },
    ];

    const stats = [
        { value: '140+', label: 'Jurisdictions' },
        { value: '<50ms', label: 'Latency' },
        { value: '99.99%', label: 'Uptime' },
        { value: '24/7', label: 'Monitoring' },
    ];

    return (
        <div className="relative">
            {/* Hero Section */}
            <section ref={heroRef} className="relative min-h-screen overflow-hidden">
                {/* GridScan - absolute, stays in hero only */}
                <div className="absolute inset-0 z-0">
                    <GridScan
                        lineThickness={0.8}
                        linesColor="#1a1a1a"
                        gridScale={0.08}
                        scanColor="#926F34"
                        scanOpacity={0.5}
                        enablePost
                        bloomIntensity={0.4}
                        chromaticAberration={0.001}
                        noiseIntensity={0.008}
                    />
                </div>

                <main className="relative z-10 page min-h-screen flex flex-col justify-center">
                    {/* Top Center Project Link */}
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 w-fit">
                        <button
                            onClick={() => window.open('https://ai-payment-process.onrender.com', '_blank')}
                            className="group relative flex items-center justify-center gap-4 px-10 py-5 bg-black/40 backdrop-blur-md border border-[rgba(146,111,52,0.4)] rounded-full hover:border-[var(--primary)] transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(146,111,52,0.25)] cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]" />
                                </span>
                                <span className="text-sm font-medium tracking-[0.2em] uppercase text-[var(--text-dim)] group-hover:text-white transition-colors">
                                    View our second project for Deriv
                                </span>
                                <div className="text-[var(--primary)] group-hover:translate-x-1 transition-transform">
                                    <ArrowRight />
                                </div>
                            </div>
                        </button>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-16 items-center w-full max-w-7xl mx-auto">
                        {/* Left Column: Text Content */}
                        <div className="space-y-8">
                            <div className="tag tag-info w-fit flex items-center gap-2">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--success)]" />
                                </span>
                                Live
                            </div>

                            <h1 className="text-6xl font-semibold tracking-tight leading-[1.05]">
                                Behavioral
                                <br />
                                <span className="gradient-text">Intelligence</span>
                            </h1>

                            <p className="text-lg text-[var(--text-dim)] max-w-xl">
                                Real-time anomaly detection and regulatory simulation
                                for financial infrastructure.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Button variant="primary" suffix={<ArrowRight />} onClick={() => navigate('/alerts')}>
                                    Open Dashboard
                                </Button>
                                <Button variant="secondary" onClick={() => navigate('/regulatory')}>
                                    Regulatory Feed
                                </Button>
                            </div>
                        </div>

                        {/* Right Column: Live Feed Visual */}
                        <div className="hidden lg:flex justify-end items-center pr-4">
                            <LiveRiskFeed />
                        </div>
                    </div>
                </main>

                {/* Scroll indicator */}
                <div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--text-muted)]"
                    style={{ opacity: 1 - scrollY / 200 }}
                >
                    <span className="text-xs uppercase tracking-wider">Scroll</span>
                    <div className="w-px h-8 bg-gradient-to-b from-[var(--primary)] to-transparent" />
                </div>
            </section>

            {/* LaserFlow Section with Box */}
            <section
                className="relative overflow-hidden"
                style={{
                    height: '1000px',
                    backgroundColor: '#050505'
                }}
            >
                {/* LaserFlow Background - simple centered config */}
                <div className="absolute inset-0 z-0">
                    <LaserFlow
                        color="#926f34"
                        wispDensity={2}
                        flowSpeed={1.7}
                        verticalSizing={1.5}
                        horizontalSizing={3}
                        fogIntensity={0.9}
                        fogScale={0.2}
                        wispSpeed={25}
                        wispIntensity={11.5}
                        flowStrength={0.75}
                        decay={2.3}
                        falloffStart={1.2}
                        fogFallSpeed={0.6}
                        horizontalBeamOffset={0}
                        verticalBeamOffset={-0.5}
                    />
                </div>

                {/* Content Box - positioned at top, laser visible below */}
                <div
                    className="absolute z-10"
                    style={{
                        top: '8%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '86%',
                        maxWidth: '1100px',
                    }}
                >
                    <div
                        className="w-full h-full rounded-[24px] p-10 lg:p-14"
                        style={{
                            backgroundColor: 'rgba(5, 5, 5, 0.95)',
                            border: '1px solid rgba(146, 111, 52, 0.4)',
                            backdropFilter: 'blur(20px)',
                        }}
                    >
                        <div className="h-full flex flex-col justify-between">
                            {/* Header */}
                            <div>
                                <span className="text-xs uppercase tracking-wider text-[var(--primary)]">Platform</span>
                                <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight mt-4 mb-6">
                                    Built for Scale
                                </h2>
                                <p className="text-lg text-[var(--text-dim)] leading-relaxed max-w-2xl">
                                    Enterprise-grade compliance infrastructure that adapts to your needs.
                                    Monitor thousands of entities simultaneously with sub-second latency.
                                </p>
                            </div>

                            {/* Features Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {features.map((f, i) => (
                                    <div
                                        key={i}
                                        className="group border-l-2 border-[var(--border)] hover:border-[var(--primary)] pl-5 py-2 transition-all duration-300"
                                    >
                                        <h3 className="text-lg font-medium mb-2 group-hover:text-[var(--primary)] transition-colors">
                                            {f.title}
                                        </h3>
                                        <p className="text-sm text-[var(--text-dim)]">{f.desc}</p>
                                    </div>
                                ))}
                            </div>

                            {/* CTA */}
                            <div className="mt-8">
                                <Button variant="primary" suffix={<ArrowRight />} onClick={() => navigate('/customers')}>
                                    Start Monitoring
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section - Minimal Design */}
            <section className="relative z-10 py-28 px-8 lg:px-24 border-t border-[var(--border)] bg-[var(--bg)]">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-wrap justify-center gap-16 md:gap-24">
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center group">
                                <div className="relative">
                                    <span className="text-4xl lg:text-5xl font-light tracking-tight text-white">
                                        {stat.value}
                                    </span>
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-px bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>
                                <div className="text-sm text-[var(--text-muted)] uppercase tracking-widest mt-4">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trusted Partners Section */}
            <section className="relative z-10 py-24 px-8 lg:px-24 border-t border-[var(--border)]">
                <div className="max-w-5xl mx-auto text-center">
                    <span className="text-sm uppercase tracking-widest text-[var(--text-muted)]">Our Trusted Partners</span>

                    <div className="mt-14 flex justify-center items-center">
                        <a
                            href="https://deriv.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group transition-all duration-300"
                        >
                            <img
                                src={derivLogo}
                                alt="Deriv"
                                className="h-20 w-auto grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                            />
                        </a>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 py-32 px-8 lg:px-24">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl font-semibold tracking-tight mb-6">
                        Ready to get started?
                    </h2>
                    <p className="text-lg text-[var(--text-dim)] mb-10">
                        Deploy behavioral intelligence across your financial infrastructure in minutes.
                    </p>
                    <div className="flex flex-col md:flex-row justify-center items-center gap-4">
                        <Button variant="primary" size="large" suffix={<ArrowRight />} onClick={() => navigate('/customers')}>
                            Add Your First Target
                        </Button>
                        <Button
                            variant="secondary"
                            size="large"
                            onClick={() => window.open('https://resourceful-playfulness-production-0be6.up.railway.app/', '_blank')}
                        >
                            View our second project for Deriv
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-[var(--border)] bg-[var(--bg-elevated)]">
                <div className="max-w-6xl mx-auto px-8 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        {/* Brand */}
                        <div className="md:col-span-2">
                            <div className="text-2xl font-semibold gradient-text mb-4">Compliance Engine</div>
                            <p className="text-[var(--text-dim)] text-sm leading-relaxed max-w-sm">
                                Real-time behavioral intelligence and regulatory simulation
                                for modern financial infrastructure.
                            </p>
                        </div>

                        {/* Links */}
                        <div>
                            <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-4">Product</div>
                            <ul className="space-y-3">
                                <li><a href="/alerts" className="text-sm text-[var(--text-dim)] hover:text-[var(--primary)] transition-colors">Alerts</a></li>
                                <li><a href="/regulatory" className="text-sm text-[var(--text-dim)] hover:text-[var(--primary)] transition-colors">Regulatory</a></li>
                                <li><a href="/customers" className="text-sm text-[var(--text-dim)] hover:text-[var(--primary)] transition-colors">Customers</a></li>
                            </ul>
                        </div>

                        <div>
                            <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-4">Company</div>
                            <ul className="space-y-3">
                                <li><a href="#" className="text-sm text-[var(--text-dim)] hover:text-[var(--primary)] transition-colors">About</a></li>
                                <li><a href="#" className="text-sm text-[var(--text-dim)] hover:text-[var(--primary)] transition-colors">Contact</a></li>
                                <li><a href="#" className="text-sm text-[var(--text-dim)] hover:text-[var(--primary)] transition-colors">Careers</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom */}
                    <div className="mt-16 pt-8 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-[var(--text-muted)]">
                            © 2026 Compliance Engine. All rights reserved.
                        </div>
                        <div className="flex gap-6">
                            <a href="#" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">Privacy</a>
                            <a href="#" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">Terms</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
