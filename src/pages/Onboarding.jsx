import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useMutation, useAction, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api.js';
import { useSession } from '../lib/auth-client.ts';

const PLATFORMS = ['Web', 'iOS', 'Android', 'Desktop', 'Chrome Extension'];
const TARGET_AUDIENCES = [
    'Indie Developers',
    'Small Startups',
    'Enterprise Teams',
    'Content Creators',
    'E-commerce Sellers',
    'Mobile Users',
    'SaaS Customers',
    'Students & Educators',
    'Other',
];
const REGIONS = ['Global', 'North America', 'Europe', 'Asia Pacific', 'Latin America', 'Africa'];
const STAGES = [
    { value: 'idea', label: 'Idea' },
    { value: 'mvp', label: 'MVP / Building' },
    { value: 'beta', label: 'Beta / Testing' },
    { value: 'launched', label: 'Launched' },
];
const MONETIZATIONS = ['Free', 'Freemium', 'Paid / One-time', 'SaaS / Subscription', 'Open Source'];

const GENERATION_STEPS = [
    'Analyzing your product...',
    'Defining brand positioning...',
    'Crafting your brand voice...',
    'Building 30-day content calendar...',
    'Mapping target communities...',
    'Strategy ready!',
];

export default function Onboarding() {
    const navigate = useNavigate();
    const { data: session } = useSession();
    const user = useQuery(api.users.getCurrentUser, session ? {} : 'skip');

    const createProfile = useMutation(api.appProfiles.create);
    const generateStrategy = useAction(api.agentActions.generateStrategy);

    const [step, setStep] = useState(1); // 1 = profile, 2 = generating
    const [generating, setGenerating] = useState(false);
    const [genStepIdx, setGenStepIdx] = useState(0);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        appName: '',
        description: '',
        targetAudiences: [],
        customAudience: '',
        platforms: [],
        region: 'Global',
        stage: 'mvp',
        monetization: 'Freemium',
        appUrl: '',
    });

    const setField = (field, value) => {
        setForm((f) => ({ ...f, [field]: value }));
        setError('');
    };

    const togglePlatform = (p) => {
        setForm((f) => ({
            ...f,
            platforms: f.platforms.includes(p)
                ? f.platforms.filter((x) => x !== p)
                : [...f.platforms, p],
        }));
    };

    const toggleAudience = (a) => {
        setForm((f) => ({
            ...f,
            targetAudiences: f.targetAudiences.includes(a)
                ? f.targetAudiences.filter((x) => x !== a)
                : [...f.targetAudiences, a],
        }));
        setError('');
    };

    // Compose the audience string from selections
    const buildAudienceString = () => {
        const selected = form.targetAudiences.filter((a) => a !== 'Other');
        if (form.targetAudiences.includes('Other') && form.customAudience.trim()) {
            selected.push(form.customAudience.trim());
        }
        return selected.join(', ');
    };

    const validate = () => {
        if (!form.appName.trim()) return 'App name is required';
        if (!form.description.trim() || form.description.trim().length < 10)
            return 'Description must be at least 10 characters';
        if (form.targetAudiences.length === 0) return 'Select at least one target audience';
        if (form.targetAudiences.includes('Other') && !form.customAudience.trim())
            return 'Please specify your custom target audience';
        if (form.platforms.length === 0) return 'Select at least one platform';
        return null;
    };

    const handleGenerateStrategy = async () => {
        const err = validate();
        if (err) { setError(err); return; }
        if (!user) { setError('Session expired. Please sign in again.'); return; }

        setGenerating(true);
        setGenStepIdx(0);
        setError('');

        let profileId;
        try {
            // Step 1: save profile
            profileId = await createProfile({
                userId: user._id,
                appName: form.appName.trim(),
                description: form.description.trim(),
                targetAudience: buildAudienceString(),
                platforms: form.platforms,
                region: form.region,
                stage: form.stage,
                monetization: form.monetization,
                appUrl: form.appUrl.trim() || undefined,
            });
        } catch (err) {
            setError(err?.message || 'Failed to save your profile. Please try again.');
            setGenerating(false);
            return;
        }

        // Animate through generation steps while the action runs
        const animInterval = setInterval(() => {
            setGenStepIdx((i) => Math.min(i + 1, GENERATION_STEPS.length - 2));
        }, 1400);

        try {
            // Step 2: generate strategy (now returns { success, error, isQuotaError })
            const result = await generateStrategy({ appProfileId: profileId, userId: user._id });

            clearInterval(animInterval);

            if (result && !result.success) {
                const isQuota = result.isQuotaError;
                setError(
                    isQuota
                        ? '⚠️ AI quota exceeded — free tier limit reached. Your profile was saved. Click "Skip for now" to go to the dashboard, or try again in a few minutes.'
                        : (result.error || 'Strategy generation failed. Your profile was saved.')
                );
                setGenerating(false);
                return;
            }

            // Success — show "ready" and navigate
            setGenStepIdx(GENERATION_STEPS.length - 1);
            await new Promise((r) => setTimeout(r, 800));
            navigate('/overview', { replace: true });
        } catch (err) {
            clearInterval(animInterval);
            console.error(err);
            const msg = err?.message || 'Something went wrong.';
            const isQuota = msg.includes('quota') || msg.includes('429');
            setError(
                isQuota
                    ? '⚠️ AI quota exceeded — free tier limit reached. Your profile was saved. Click "Skip for now" to continue.'
                    : msg
            );
            setGenerating(false);
        }
    };

    const handleSkip = async () => {
        const err = validate();
        if (err) { setError(err); return; }
        if (!user) return;

        try {
            await createProfile({
                userId: user._id,
                appName: form.appName.trim(),
                description: form.description.trim(),
                targetAudience: buildAudienceString(),
                platforms: form.platforms,
                region: form.region,
                stage: form.stage,
                monetization: form.monetization,
                appUrl: form.appUrl.trim() || undefined,
            });
            navigate('/overview', { replace: true });
        } catch (err) {
            setError(err?.message || 'Failed to save. Please try again.');
        }
    };

    // ── Generation overlay ──────────────────────────────────
    if (generating) {
        return (
            <div className="onboarding-generating">
                <div className="onboarding-gen-card">
                    <div className="onboarding-gen-icon">
                        {genStepIdx < GENERATION_STEPS.length - 1
                            ? <Loader2 size={32} className="onboarding-gen-spin" />
                            : <CheckCircle size={32} style={{ color: 'var(--success)' }} />
                        }
                    </div>
                    <h2 className="onboarding-gen-title">
                        {genStepIdx < GENERATION_STEPS.length - 1
                            ? 'Creating your marketing strategy...'
                            : 'Strategy ready!'
                        }
                    </h2>
                    <div className="onboarding-gen-steps">
                        {GENERATION_STEPS.map((s, i) => (
                            <div
                                key={s}
                                className={`onboarding-gen-step ${i < genStepIdx ? 'done' : i === genStepIdx ? 'active' : 'pending'}`}
                            >
                                <span className="onboarding-gen-step-dot" />
                                <span>{s}</span>
                            </div>
                        ))}
                    </div>
                    <p className="onboarding-gen-note">
                        This takes about 20–30 seconds. Please don't close the tab.
                    </p>
                </div>
            </div>
        );
    }

    // ── Profile form ────────────────────────────────────────
    return (
        <div className="onboarding-page">
            {/* Header */}
            <div className="onboarding-header">
                <a href="/" className="landing-logo" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                    <img src="/marketaxis-logo.png" alt="MarketAxis AI" className="landing-logo-img" />
                    <span>MarketAxis</span>
                </a>
                <div className="onboarding-free-trial">
                    <span className="auth-free-trial-badge">Free Trial</span>
                    <span>You can upgrade any time</span>
                </div>
            </div>

            {/* Content */}
            <div className="onboarding-content">
                <div className="onboarding-card">
                    <div className="onboarding-card-header">
                        <h1 className="onboarding-title">Tell us about your app</h1>
                        <p className="onboarding-subtitle">
                            We use this to generate a strategy tailored to your product.
                        </p>
                    </div>

                    <div className="onboarding-form">
                        {/* App Name */}
                        <div className="auth-field">
                            <label className="auth-label">App name <span className="onboarding-required">*</span></label>
                            <input
                                className="auth-input"
                                type="text"
                                placeholder="e.g. MarketAxis AI"
                                value={form.appName}
                                onChange={(e) => setField('appName', e.target.value)}
                            />
                        </div>

                        {/* Description */}
                        <div className="auth-field">
                            <label className="auth-label">What does your app do? <span className="onboarding-required">*</span></label>
                            <textarea
                                className="auth-input onboarding-textarea"
                                placeholder="Describe your app in 1–3 sentences. Be specific about the problem it solves."
                                value={form.description}
                                onChange={(e) => setField('description', e.target.value)}
                                rows={3}
                            />
                        </div>

                        {/* Target Audience */}
                        <div className="auth-field">
                            <label className="auth-label">Who is your target audience? <span className="onboarding-required">*</span></label>
                            <div className="onboarding-chips">
                                {TARGET_AUDIENCES.map((a) => (
                                    <button
                                        key={a}
                                        type="button"
                                        className={`onboarding-chip${form.targetAudiences.includes(a) ? ' selected' : ''}`}
                                        onClick={() => toggleAudience(a)}
                                    >
                                        {a}
                                    </button>
                                ))}
                            </div>
                            {form.targetAudiences.includes('Other') && (
                                <input
                                    className="auth-input"
                                    type="text"
                                    placeholder="Describe your target audience..."
                                    value={form.customAudience}
                                    onChange={(e) => setField('customAudience', e.target.value)}
                                    style={{ marginTop: '0.5rem' }}
                                />
                            )}
                        </div>

                        {/* Platforms */}
                        <div className="auth-field">
                            <label className="auth-label">Platform(s) <span className="onboarding-required">*</span></label>
                            <div className="onboarding-chips">
                                {PLATFORMS.map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        className={`onboarding-chip${form.platforms.includes(p) ? ' selected' : ''}`}
                                        onClick={() => togglePlatform(p)}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Row: Stage + Monetization */}
                        <div className="onboarding-row">
                            <div className="auth-field">
                                <label className="auth-label">Stage</label>
                                <select
                                    className="auth-input onboarding-select"
                                    value={form.stage}
                                    onChange={(e) => setField('stage', e.target.value)}
                                >
                                    {STAGES.map((s) => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="auth-field">
                                <label className="auth-label">Monetization</label>
                                <select
                                    className="auth-input onboarding-select"
                                    value={form.monetization}
                                    onChange={(e) => setField('monetization', e.target.value)}
                                >
                                    {MONETIZATIONS.map((m) => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Row: Region + App URL */}
                        <div className="onboarding-row">
                            <div className="auth-field">
                                <label className="auth-label">Target region</label>
                                <select
                                    className="auth-input onboarding-select"
                                    value={form.region}
                                    onChange={(e) => setField('region', e.target.value)}
                                >
                                    {REGIONS.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="auth-field">
                                <label className="auth-label">App URL <span className="onboarding-optional">(optional)</span></label>
                                <input
                                    className="auth-input"
                                    type="url"
                                    placeholder="https://yourapp.com"
                                    value={form.appUrl}
                                    onChange={(e) => setField('appUrl', e.target.value)}
                                />
                            </div>
                        </div>

                        {error && <div className="auth-error">{error}</div>}

                        {/* Actions */}
                        <div className="onboarding-actions">
                            <button
                                className="landing-btn-pill landing-btn-lg"
                                style={{ flex: 1, justifyContent: 'center' }}
                                onClick={handleGenerateStrategy}
                                id="onboarding-generate-btn"
                            >
                                Generate My Strategy <ArrowRight size={16} />
                            </button>
                            <button
                                className="landing-btn-ghost-outline"
                                onClick={handleSkip}
                                id="onboarding-skip-btn"
                                style={{ whiteSpace: 'nowrap' }}
                            >
                                Skip for now
                            </button>
                        </div>

                        <p className="onboarding-note">
                            Strategy generation takes ~20 seconds. You can always regenerate it later.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
