'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

// --- Icons Component ---
const Icons = {
    Back: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>,
    Calendar: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
    Clock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
    Eye: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
    Copy: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>,
    Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
    Alert: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>,
    Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
};

export default function ViewPaste() {
    const params = useParams();
    const router = useRouter();
    const [paste, setPaste] = useState(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null); // State for the countdown string
    const fetchedRef = useRef(false);

    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;

        const fetchPaste = async () => {
            try {
                const response = await fetch(`/api/pastes/${params.id}`);
                if (!response.ok) { setError(true); return; }
                const data = await response.json();
                setPaste(data);
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) fetchPaste();
    }, [params.id]);

    // --- COUNTDOWN TIMER LOGIC ---
    useEffect(() => {
        if (!paste?.expires_at) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const expiry = new Date(paste.expires_at).getTime();
            const distance = expiry - now;

            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft("Expired");
                // Optional: Force reload or show error if expired
                setError(true);
            } else {
                // Time calculations
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                // Format: "01h 20m 30s" or just "20m 30s"
                let timeString = '';
                if (hours > 0) timeString += `${hours}h `;
                timeString += `${minutes}m ${seconds}s`;

                setTimeLeft(timeString);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [paste]);

    const handleCopy = async () => {
        if (paste?.content) {
            await navigator.clipboard.writeText(paste.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm('Are you sure you want to delete this paste? This action cannot be undone.');
        if (!confirmed) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/pastes/${params.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete paste');
            }

            alert('Paste deleted successfully!');
            router.push('/');
        } catch (err) {
            alert('Error: ' + err.message);
            setIsDeleting(false);
        }
    };

    // --- Loading State ---
    if (loading) {
        return (
            <main className="container" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    width: '40px', height: '40px',
                    border: '3px solid rgba(99, 102, 241, 0.3)',
                    borderTopColor: '#6366f1',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </main>
        );
    }

    // --- Error State (404) ---
    if (error) {
        return (
            <main className="container" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <div className="glass-card animate-in" style={{ textAlign: 'center', maxWidth: '500px', padding: '3rem' }}>
                    <div style={{ color: '#ef4444', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                        <Icons.Alert />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Paste Not Found</h2>
                    <p style={{ marginBottom: '2rem' }}>
                        This link may have expired, reached its view limit, or never existed.
                    </p>
                    <a href="/" className="btn btn-primary">Create New Paste</a>
                </div>
            </main>
        );
    }

    // --- Success State ---
    return (
        <main className="container">
            {/* Navigation Header */}
            <nav className="navbar animate-in" style={{ marginBottom: '1rem' }}>
                <a href="/" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                    <Icons.Back /> Back to Home
                </a>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#1e293b' }}>PasteBin </div>
            </nav>

            {/* Main Glass Card */}
            <div className="glass-card animate-in" style={{ padding: '0', overflow: 'hidden' }}>

                {/* Card Header with Metadata Pills */}
                <div style={{
                    background: 'rgba(255,255,255,0.5)',
                    padding: '1.5rem 2rem',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Paste Content</h3>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>

                        {/* View Limit Pill */}
                        {paste.remaining_views !== null && (
                            <span style={{
                                background: '#eff6ff', color: '#2563eb',
                                border: '1px solid rgba(37,99,235,0.2)',
                                padding: '0.25rem 0.75rem', borderRadius: '20px',
                                fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem'
                            }}>
                                <Icons.Eye /> {paste.remaining_views} Views Left
                            </span>
                        )}

                        {/* LIVE COUNTDOWN PILL */}
                        {paste.expires_at ? (
                            <span style={{
                                background: '#fffbeb', color: '#d97706',
                                border: '1px solid rgba(217,119,6,0.2)',
                                padding: '0.25rem 0.75rem', borderRadius: '20px',
                                fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem',
                                fontVariantNumeric: 'tabular-nums' /* Keeps numbers from jumping */
                            }}>
                                <Icons.Clock /> Expires in: {timeLeft || 'Calculating...'}
                            </span>
                        ) : (
                            <span style={{
                                background: '#f1f5f9', color: '#64748b',
                                border: '1px solid #e2e8f0',
                                padding: '0.25rem 0.75rem', borderRadius: '20px',
                                fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem'
                            }}>
                                <Icons.Calendar /> Never Expires
                            </span>
                        )}
                    </div>
                </div>

                {/* Content Box */}
                <div style={{ padding: '2rem' }}>
                    <div style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        overflowX: 'auto'
                    }}>
                        <pre style={{
                            fontFamily: "'Fira Code', monospace",
                            fontSize: '0.95rem',
                            color: '#334155',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            margin: 0
                        }}>
                            {paste.content}
                        </pre>
                    </div>
                </div>

                {/* Card Footer Actions */}
                <div style={{
                    padding: '0 2rem 2rem 2rem',
                    display: 'flex',
                    gap: '1rem'
                }}>
                    <button onClick={handleCopy} className="btn btn-primary" style={{ minWidth: '140px' }}>
                        {copied ? <><Icons.Check /> Copied!</> : <><Icons.Copy /> Copy Text</>}
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '1rem 1.5rem',
                            fontWeight: 600,
                            borderRadius: '12px',
                            cursor: isDeleting ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s',
                            border: '1px solid #fecaca',
                            background: '#fef2f2',
                            color: '#dc2626',
                            fontSize: '1rem',
                            minWidth: '140px',
                            opacity: isDeleting ? 0.6 : 1
                        }}
                    >
                        <Icons.Trash /> {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>

            </div>
        </main>
    );
}