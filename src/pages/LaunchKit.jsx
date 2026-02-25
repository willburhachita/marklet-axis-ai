import { useState } from 'react';
import {
    Sparkles, Eye, Edit3, Rocket, Newspaper, Mail,
    Twitter, Linkedin, ClipboardList, ArrowRight,
} from 'lucide-react';
import { mockLaunchAssets } from '../data/mockData';

const assetTypeConfig = {
    product_hunt: { label: 'Product Hunt', icon: Rocket },
    hacker_news: { label: 'Hacker News', icon: Newspaper },
    press_email: { label: 'Press Email', icon: Mail },
    twitter_launch: { label: 'Twitter Launch', icon: Twitter },
    linkedin_launch: { label: 'LinkedIn Launch', icon: Linkedin },
    betalist: { label: 'BetaList', icon: ClipboardList },
};

export default function LaunchKit() {
    const [viewing, setViewing] = useState(null);

    const readyCount = mockLaunchAssets.filter((a) => a.status === 'ready').length;
    const totalCount = mockLaunchAssets.length;
    const pct = Math.round((readyCount / totalCount) * 100);

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Launch Kit</h1>
                    <p>Pre-packaged launch assets for every platform</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-primary">
                        <Sparkles size={16} /> Generate all
                    </button>
                </div>
            </div>

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

            {/* Asset grid - prompt-card style */}
            <div className="prompt-grid stagger">
                {mockLaunchAssets.map((asset) => {
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
                                <span className={`badge ${asset.status === 'ready' ? 'badge-success' : 'badge-warning'}`}>
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
                                <button className="btn btn-ghost btn-sm" onClick={(e) => e.stopPropagation()}>
                                    <Edit3 size={14} /> Edit
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
        </div>
    );
}
