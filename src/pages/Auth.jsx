import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Github, Eye, EyeOff } from 'lucide-react';
import { signIn, signUp } from '../lib/auth-client.ts';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api.js';

export default function Auth() {
    const navigate = useNavigate();
    const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');

    const syncUser = useMutation(api.users.syncUser);

    const handleChange = (field, value) => {
        setForm((f) => ({ ...f, [field]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (mode === 'signup' && !form.name.trim()) {
            setError('Full name is required');
            return;
        }
        if (!form.email.trim() || !form.email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }
        if (form.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            if (mode === 'signup') {
                const result = await signUp.email({
                    email: form.email,
                    password: form.password,
                    name: form.name.trim(),
                    callbackURL: '/auth/callback',
                });
                if (result.error) throw new Error(result.error.message);

                // Sync to Convex immediately on sign-up
                await syncUser({
                    email: form.email,
                    name: form.name.trim(),
                    avatarUrl: undefined,
                });

                navigate('/onboarding', { replace: true });
            } else {
                const result = await signIn.email({
                    email: form.email,
                    password: form.password,
                    callbackURL: '/auth/callback',
                });
                if (result.error) throw new Error(result.error.message);

                // Sync (in case profile changed)
                await syncUser({
                    email: form.email,
                    name: result.data?.user?.name || form.email.split('@')[0],
                    avatarUrl: undefined,
                });

                // Redirect to callback which will check profile existence
                navigate('/auth/callback', { replace: true });
            }
        } catch (err) {
            const msg = err?.message || '';
            if (msg.includes('Invalid email or password') || msg.includes('credentials')) {
                setError('Incorrect email or password. Please try again.');
            } else if (msg.includes('already exists') || msg.includes('registered')) {
                setError('An account with this email already exists. Sign in instead.');
            } else {
                setError(msg || 'Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSocialAuth = async (provider) => {
        setLoading(true);
        setError('');

        try {
            await signIn.social({
                provider,
                callbackURL: `${window.location.origin}/auth/callback`,
            });
            // Better Auth will redirect — no further code runs here
        } catch (err) {
            setError(`Could not connect with ${provider === 'github' ? 'GitHub' : 'Google'}. Please try again.`);
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Left — Branding */}
            <div className="auth-brand">
                <a href="/" className="auth-brand-logo" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                    <img src="/marketaxis-logo.png" alt="MarketAxis AI" className="landing-logo-img" />
                    <span>MarketAxis</span>
                </a>
                <div className="auth-brand-content">
                    <h2 className="auth-brand-title">Your AI<br />marketing team</h2>
                    <p className="auth-brand-desc">
                        Strategy, content, launch kits, and legal docs — generated from your codebase by autonomous AI agents.
                    </p>
                    <div className="auth-brand-features">
                        {[
                            'Strategy generated in 3 minutes',
                            '30 days of content, ready to post',
                            'Launch kits for Product Hunt, HN, Reddit',
                            'Legal docs from your actual codebase',
                        ].map((f) => (
                            <div key={f} className="auth-brand-feature">
                                <span className="auth-brand-feature-check">✓</span>
                                {f}
                            </div>
                        ))}
                    </div>

                    {/* Free Trial Banner */}
                    <div className="auth-free-trial-banner">
                        <span className="auth-free-trial-badge">Free Trial</span>
                        Start free — no credit card required
                    </div>
                </div>
                <p className="auth-brand-footer">© 2026 MarketAxis AI</p>
            </div>

            {/* Right — Form */}
            <div className="auth-form-side">
                <div className="auth-form-container">
                    <div className="auth-form-header">
                        <h1 className="auth-form-title">
                            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
                        </h1>
                        <p className="auth-form-subtitle">
                            {mode === 'signin'
                                ? 'Sign in to continue to MarketAxis AI'
                                : 'Start your free trial — no credit card needed'
                            }
                        </p>
                    </div>

                    {/* Social Auth */}
                    <div className="auth-social-buttons">
                        <button
                            className="auth-social-btn"
                            onClick={() => handleSocialAuth('github')}
                            disabled={loading}
                            id="auth-github-btn"
                        >
                            <Github size={18} />
                            Continue with GitHub
                        </button>
                        <button
                            className="auth-social-btn"
                            onClick={() => handleSocialAuth('google')}
                            disabled={loading}
                            id="auth-google-btn"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>
                    </div>

                    <div className="auth-divider">
                        <span>or continue with email</span>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleSubmit} className="auth-form" id="auth-email-form">
                        {mode === 'signup' && (
                            <div className="auth-field">
                                <label className="auth-label">Full name</label>
                                <input
                                    className="auth-input"
                                    type="text"
                                    placeholder="Your name"
                                    value={form.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    autoComplete="name"
                                    disabled={loading}
                                />
                            </div>
                        )}

                        <div className="auth-field">
                            <label className="auth-label">Email</label>
                            <input
                                className="auth-input"
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                autoComplete="email"
                                disabled={loading}
                            />
                        </div>

                        <div className="auth-field">
                            <label className="auth-label">Password</label>
                            <div className="auth-input-wrapper">
                                <input
                                    className="auth-input"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Min. 8 characters"
                                    value={form.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="auth-password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && <div className="auth-error">{error}</div>}

                        <button
                            type="submit"
                            className="landing-btn-pill auth-submit"
                            disabled={loading}
                            id="auth-submit-btn"
                        >
                            {loading
                                ? 'Please wait...'
                                : mode === 'signin' ? 'Sign in' : 'Create free account'
                            }
                            {!loading && <ArrowRight size={16} />}
                        </button>
                    </form>

                    <p className="auth-toggle">
                        {mode === 'signin' ? (
                            <>
                                Don't have an account?{' '}
                                <button className="auth-toggle-btn" onClick={() => { setMode('signup'); setError(''); }} id="auth-switch-to-signup">
                                    Sign up free
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{' '}
                                <button className="auth-toggle-btn" onClick={() => { setMode('signin'); setError(''); }} id="auth-switch-to-signin">
                                    Sign in
                                </button>
                            </>
                        )}
                    </p>

                    <p className="auth-terms">
                        By continuing, you agree to our{' '}
                        <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}
