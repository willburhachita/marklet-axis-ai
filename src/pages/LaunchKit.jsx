import { useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import {
    Sparkles, Eye, Edit3, Rocket, Newspaper, Mail,
    Twitter, Linkedin, ClipboardList, ArrowRight, Loader2,
} from 'lucide-react';
import { useQuery, useAction, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api.js';

const assetTypeConfig = {
    product_hunt: { label: 'Product Hunt', icon: Rocket },
    hacker_news: { label: 'Hacker News', icon: Newspaper },
    press_email: { label: 'Press Email', icon: Mail },
    twitter_launch: { label: 'Twitter Launch', icon: Twitter },
    linkedin_launch: { label: 'LinkedIn Launch', icon: Linkedin },
    betalist: { label: 'BetaList', icon: ClipboardList },
};

export default function LaunchKit() {
    const { user } = useOutletContext();
    const { projectId } = useParams();
    const [viewing, setViewing] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [genError, setGenError] = useState('');

    // Real data from Convex
    const profile = useQuery(
        api.appProfiles.getById,
        projectId ? { profileId: projectId } : 'skip'
    );
    const launchAssets = useQuery(
        api.launchAssets.getByProfile,
        profile ? { appProfileId: profile._id } : 'skip'
    );

    const generateLaunchKit = useAction(api.agentActions.generateLaunchKit);
    const updateStatus = useMutation(api.launchAssets.updateStatus);

    console.log('[LaunchKit] Data:', {
        profileId: profile?._id,
        assetsCount: launchAssets?.length,
    });

    const handleGenerateAll = async () => {
        if (!profile || !user) return;
        console.log('[LaunchKit] Generating all launch assets...');
        setGenerating(true);
        setGenError('');
        try {
            const result = await generateLaunchKit({ appProfileId: profile._id, userId: user._id });
            console.log('[LaunchKit] Generation result:', result);
            if (!result.success) setGenError(result.error || 'Generation failed');
        } catch (err) {
            console.error('[LaunchKit] Generation error:', err);
            setGenError(err?.message || 'Failed to generate');
        }
        setGenerating(false);
    };

    // Loading
    if (!user || profile === undefined) {
        return (
            <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <Loader2 size={32} className="onboarding-gen-spin" />
            </div>
        );
    }

    const assets = launchAssets || [];
    const readyCount = assets.filter((a) => a.status === 'ready').length;
    const totalCount = assets.length;
    const pct = totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 0;

    // Empty state
    if (assets.length === 0 && !generating) {
        return (
            <div className="animate-fade-in">
                <div className="page-header">
                    <div className="page-header-left">
                        <h1>Launch Kit</h1>
                        <p>Pre-packaged launch assets for every platform</p>
                    </div>
                </div>
                {genError && (
                    <div style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-4)', background: 'var(--error-muted)', color: 'var(--error)', borderRadius: 'var(--radius-md)', fontSize: '0.813rem' }}>
                        ⚠️ {genError}
                    </div>
                )}
                <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                    <Rocket size={48} style={{ color: 'var(--warning)', marginBottom: 'var(--space-4)', opacity: 0.6 }} />
                    <h3 style={{ marginBottom: 'var(--space-2)' }}>No launch assets yet</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                        Generate your launch kit to get Product Hunt, Hacker News, and press-ready assets.
                    </p>
                    <button className="btn btn-primary" onClick={handleGenerateAll} disabled={generating}>
                        {generating ? <><Loader2 size={16} className="onboarding-gen-spin" /> Generating...</> : <><Sparkles size={16} /> Generate your launch kit</>}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Launch Kit</h1>
                    <p>Pre-packaged launch assets for every platform</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-primary" onClick={handleGenerateAll} disabled={generating}>
                        <Sparkles size={16} />
                        {generating ? 'Generating...' : 'Generate all'}
                    </button>
                </div>
            </div>

            {genError && (
                <div style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-4)', background: 'var(--error-muted)', color: 'var(--error)', borderRadius: 'var(--radius-md)', fontSize: '0.813rem' }}>
                    ⚠️ {genError}
                </div>
            )}

            {/* Readiness bar */}
            <div className="card mb-6">
                <div className="flex-between mb-4">
                    <div>
                        <div className="card-title">Launch Readiness</div>
                        <div className="card-subtitle">{readyCount} of {totalCount} assets ready</div>
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: pct >= 80 ? 'var(--success)' : 'var(--primary)' }}>
                        {pct}%
                    </span>
                </div>
                <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                </div>
            </div>

            {/* Asset grid */}
            <div className="prompt-grid stagger">
                {assets.map((asset) => {
                    const config = assetTypeConfig[asset.assetType] || { label: asset.assetType, icon: ClipboardList };
                    const IconComp = config.icon;
                    return (
                        <div
                            key={asset._id}
                            className="prompt-card animate-fade-in"
                            onClick={() => setViewing(viewing === asset._id ? null : asset._id)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                                <div className="prompt-card-icon" style={{
                                    background: asset.status === 'ready' ? 'var(--success-muted)' : 'var(--bg-tertiary)',
                                    color: asset.status === 'ready' ? 'var(--success)' : 'var(--text-muted)',
                                }}>
                                    <IconComp />
                                </div>
                                <span
                                    className={`badge ${asset.status === 'ready' ? 'badge-success' : asset.status === 'submitted' ? 'badge-info' : 'badge-warning'}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const next = asset.status === 'draft' ? 'ready' : asset.status === 'ready' ? 'submitted' : 'draft';
                                        console.log('[LaunchKit] Toggling status:', asset._id, '->', next);
                                        updateStatus({ assetId: asset._id, status: next });
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {asset.status}
                                </span>
                            </div>
                            <div className="prompt-card-title">{config.label}</div>
                            <div className="prompt-card-desc" style={{ marginBottom: 'var(--space-3)' }}>
                                {asset.title}
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); setViewing(viewing === asset._id ? null : asset._id); }}>
                                    <Eye size={14} /> View
                                </button>
                            </div>
                            <div className="prompt-card-arrow"><ArrowRight size={16} /></div>

                            {viewing === asset._id && (
                                <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)' }}>
                                    <pre style={{
                                        fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.7,
                                        whiteSpace: 'pre-wrap', fontFamily: 'var(--font-sans)',
                                    }}>
                                        {asset.body}
                                    </pre>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {generating && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', maxWidth: 400 }}>
                        <Loader2 size={32} className="onboarding-gen-spin" style={{ marginBottom: 'var(--space-3)', color: 'var(--primary)' }} />
                        <h3>Generating Launch Kit</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.813rem' }}>Creating 6 launch assets with AI... This may take a minute.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
