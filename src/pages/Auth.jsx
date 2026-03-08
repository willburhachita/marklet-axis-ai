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

    const handleGitHubAuth = async () => {
        setLoading(true);
        setError('');

        try {
            // Mark provider in sessionStorage so AuthCallback knows
            // to set githubConnected = true on the user record
            sessionStorage.setItem('oauth_provider', 'github');
            await signIn.social({
                provider: 'github',
                callbackURL: `${window.location.origin}/auth/callback`,
            });
            // Better Auth will redirect — no further code runs here
        } catch (err) {
            sessionStorage.removeItem('oauth_provider');
            setError('Could not connect with GitHub. Please try again.');
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

                    {/* Primary Auth — GitHub */}
                    <div className="auth-social-buttons">
                        <button
                            className="auth-social-btn auth-github-primary"
                            onClick={handleGitHubAuth}
                            disabled={loading}
                            id="auth-github-btn"
                        >
                            <Github size={18} />
                            Continue with GitHub
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
