'use client';

import { useState } from 'react';

// --- Icons Component ---
const Icons = {
    Lock: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
    Clock: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
    Eye: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
    Info: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>,
    Check: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
    Copy: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>,
    External: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>,
    Trash: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
};

export default function Home() {
    const [content, setContent] = useState('');

    // New State for Time Inputs
    const [hours, setHours] = useState('');
    const [minutes, setMinutes] = useState('');
    const [seconds, setSeconds] = useState('');

    const [maxViews, setMaxViews] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [terminating, setTerminating] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setResult(null);
        setLoading(true);

        try {
            const payload = { content: content.trim() };

            // --- CALCULATE TOTAL SECONDS ---
            const h = parseInt(hours || '0', 10);
            const m = parseInt(minutes || '0', 10);
            const s = parseInt(seconds || '0', 10);
            const totalSeconds = (h * 3600) + (m * 60) + s;

            // Validation: If user entered something but total is 0 or negative
            if ((hours || minutes || seconds) && totalSeconds <= 0) {
                throw new Error("Please select a valid time (must be greater than 0)");
            }

            if (totalSeconds > 0) {
                payload.ttl_seconds = totalSeconds;
            }

            if (maxViews && parseInt(maxViews) >= 1) {
                payload.max_views = parseInt(maxViews);
            }

            const response = await fetch('/api/pastes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to create paste');

            setResult(data);
            setContent('');
            setHours('');
            setMinutes('');
            setSeconds('');
            setMaxViews('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        if (result?.url) {
            await navigator.clipboard.writeText(result.url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleTerminate = async () => {
        if (!result?.id) return;

        const confirmed = window.confirm('Are you sure you want to terminate this paste? This action cannot be undone.');
        if (!confirmed) return;

        setTerminating(true);
        try {
            const response = await fetch(`/api/pastes/${result.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to terminate paste');
            }

            // Success - reset form
            setResult(null);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setTerminating(false);
        }
    };

    return (
        <main className="container">
            {/* Navbar */}
            <nav className="navbar animate-in">
                <div className="brand">
                    <div className="brand-icon"><Icons.Lock /></div>
                    <span>Pastebin</span>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="animate-in" style={{ animationDelay: '0.1s', textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ marginBottom: '1rem' }}>Share Code & Text <br /> Securely & Beautifully.</h1>
                <p style={{ maxWidth: '600px', margin: '0 auto' }}>
                    The modern way to share sensitive data. Create temporary pastes with expiration controls and view limits.
                </p>
            </section>

            {/* Main Glass Card */}
            <div className="glass-card animate-in" style={{ animationDelay: '0.2s' }}>
                {!result ? (
                    // --- CREATE FORM ---
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="content">Paste Content</label>
                            <textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="// Enter your code, logs, or secret text here..."
                                required
                                spellCheck="false"
                            />
                        </div>

                        <div className="grid-cols-2">

                            {/* --- NEW TIME SELECTION SECTION --- */}
                            <div className="form-group">
                                <label>Expiration Time (Optional)</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>

                                    {/* Hours */}
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="number"
                                            value={hours}
                                            onChange={(e) => setHours(e.target.value)}
                                            placeholder="00"
                                            min="0"
                                            style={{ paddingRight: '1.5rem', textAlign: 'center' }}
                                        />
                                        <span style={{
                                            position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                                            fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', pointerEvents: 'none'
                                        }}>HR</span>
                                    </div>

                                    {/* Minutes */}
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="number"
                                            value={minutes}
                                            onChange={(e) => setMinutes(e.target.value)}
                                            placeholder="00"
                                            min="0"
                                            max="59"
                                            style={{ paddingRight: '1.5rem', textAlign: 'center' }}
                                        />
                                        <span style={{
                                            position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                                            fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', pointerEvents: 'none'
                                        }}>MIN</span>
                                    </div>

                                    {/* Seconds */}
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="number"
                                            value={seconds}
                                            onChange={(e) => setSeconds(e.target.value)}
                                            placeholder="00"
                                            min="0"
                                            max="59"
                                            style={{ paddingRight: '1.5rem', textAlign: 'center' }}
                                        />
                                        <span style={{
                                            position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                                            fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', pointerEvents: 'none'
                                        }}>SEC</span>
                                    </div>

                                </div>
                            </div>
                            {/* --- END TIME SELECTION --- */}

                            <div className="form-group">
                                <label htmlFor="maxViews">View Limit (Optional)</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="number"
                                        id="maxViews"
                                        value={maxViews}
                                        onChange={(e) => setMaxViews(e.target.value)}
                                        placeholder="e.g. 5 Views"
                                        min="1"
                                        style={{ paddingLeft: '2.5rem' }}
                                    />
                                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                        <Icons.Eye />
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading || !content.trim()}>
                            {loading ? 'Creating...' : <><Icons.Lock /> Create Secure Paste</>}
                        </button>
                    </form>
                ) : (
                    // --- SUCCESS STATE (Professional UI) ---
                    <div className="success-view animate-in">
                        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                            <div style={{
                                width: '64px', height: '64px', background: '#ecfdf5', color: '#10b981',
                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                            }}>
                                <Icons.Check />
                            </div>
                            <h3 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', color: '#111827' }}>Paste Created Successfully!</h3>
                            <p style={{ color: '#6b7280' }}>Your secure link is ready to share.</p>
                        </div>

                        {/* Professional URL Input Display */}
                        <div className="form-group">
                            <label style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }}>Shareable Link</label>
                            <div style={{
                                display: 'flex',
                                gap: '0',
                                background: '#fff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                padding: '4px',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                            }}>
                                <input
                                    type="text"
                                    readOnly
                                    value={result.url}
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        boxShadow: 'none',
                                        fontSize: '1rem',
                                        color: '#374151',
                                        width: '100%',
                                        paddingLeft: '1rem'
                                    }}
                                    onClick={(e) => e.target.select()}
                                />
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={copyToClipboard}
                                    style={{
                                        borderRadius: '8px',
                                        padding: '0.75rem 1.5rem',
                                        margin: '0',
                                        minWidth: '110px'
                                    }}
                                >
                                    {copied ? <><Icons.Check /> Copied</> : <><Icons.Copy /> Copy</>}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleTerminate}
                                    disabled={terminating}
                                    style={{
                                        borderRadius: '8px',
                                        padding: '0.75rem 1rem',
                                        margin: '0',
                                        minWidth: '50px',
                                        background: '#fef2f2',
                                        border: '1px solid #fecaca',
                                        color: '#dc2626',
                                        cursor: terminating ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                    title="Terminate Paste"
                                >
                                    {terminating ? '...' : <Icons.Trash />}
                                </button>
                            </div>
                        </div>

                        <div className="grid-cols-2" style={{ marginTop: '2rem' }}>
                            <a href={result.url} target="_blank" className="btn btn-secondary" style={{ justifyContent: 'center', height: '50px' }}>
                                <Icons.External /> Open Link
                            </a>
                            <button onClick={() => setResult(null)} className="btn btn-secondary" style={{ justifyContent: 'center', height: '50px' }}>
                                Back to home
                            </button>
                        </div>
                    </div>
                )}

                {error && (
                    <div style={{
                        marginTop: '1.5rem', padding: '1rem', borderRadius: '12px',
                        background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2', display: 'flex', gap: '0.5rem', alignItems: 'center'
                    }}>
                        <span style={{ fontSize: '1.25rem' }}>⚠</span> {error}
                    </div>
                )}
            </div>
        </main>
    );
}