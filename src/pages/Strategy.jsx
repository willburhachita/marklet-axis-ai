import { useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { RefreshCw, Edit3, ChevronRight, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useQuery, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api.js';

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Strategy() {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const { user } = useOutletContext();
    const [activeTab, setActiveTab] = useState('positioning');
    const [regenerating, setRegenerating] = useState(false);

    // Get real profile + strategy from Convex
    const profile = useQuery(
        api.appProfiles.getById,
        projectId ? { profileId: projectId } : 'skip'
    );
    const s = useQuery(
        api.strategies.getByProfile,
        profile ? { appProfileId: profile._id } : 'skip'
    );

    const generateStrategy = useAction(api.agentActions.generateStrategy);

    console.log('[Strategy] Data:', {
        userId: user?._id,
        profileId: profile?._id,
        hasStrategy: !!s,
        positioning: s?.positioning?.slice(0, 50),
        differentiators: s?.differentiators?.length,
        calendar: s?.contentCalendar?.length,
        roadmap: s?.launchRoadmap?.length,
        communities: s?.targetCommunities?.length,
    });

    // Handle regenerate
    const handleRegenerate = async () => {
        if (!profile || !user) return;
        console.log('[Strategy] Regenerating strategy...');
        setRegenerating(true);
        try {
            await generateStrategy({ appProfileId: profile._id, userId: user._id });
            console.log('[Strategy] Strategy regenerated successfully');
        } catch (err) {
            console.error('[Strategy] Regeneration failed:', err);
        }
        setRegenerating(false);
    };

    // Handle CSV export
    const handleExportCalendar = () => {
        if (!s?.contentCalendar) return;
        console.log('[Strategy] Exporting calendar as CSV');
        const csvRows = ['Day,Title,Platform,Content Type'];
        s.contentCalendar.forEach((c) => {
            csvRows.push(`${c.day},"${c.title}",${c.platform},${c.contentType}`);
        });
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'content-calendar.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    // Loading state
    if (!user || profile === undefined) {
        return (
            <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <Loader2 size={32} className="onboarding-gen-spin" />
            </div>
        );
    }

    // Empty state — no strategy generated yet
    if (s === null) {
        return (
            <div className="animate-fade-in">
                <div className="page-header">
                    <div className="page-header-left">
                        <h1>Marketing Strategy</h1>
                        <p>AI-generated strategy based on your app profile and codebase</p>
                    </div>
                </div>
                <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                    <Sparkles size={48} style={{ color: 'var(--primary)', marginBottom: 'var(--space-4)', opacity: 0.6 }} />
                    <h3 style={{ marginBottom: 'var(--space-2)' }}>No strategy generated yet</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                        Generate a marketing strategy based on your app profile to get started.
                    </p>
                    <button className="btn btn-primary" onClick={handleRegenerate} disabled={regenerating}>
                        {regenerating ? <><Loader2 size={16} className="onboarding-gen-spin" /> Generating...</> : <><Sparkles size={16} /> Generate Strategy</>}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Marketing Strategy</h1>
                    <p>AI-generated strategy based on your app profile and codebase</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-secondary" onClick={() => navigate('/settings')}>
                        <Edit3 size={16} /> Edit profile
                    </button>
                    <button className="btn btn-primary" onClick={handleRegenerate} disabled={regenerating}>
                        <RefreshCw size={16} className={regenerating ? 'onboarding-gen-spin' : ''} />
                        {regenerating ? 'Regenerating...' : 'Regenerate'}
                    </button>
                </div>
            </div>

            <div className="tabs">
                {['positioning', 'voice', 'calendar', 'roadmap', 'communities'].map((tab) => (
                    <button
                        key={tab}
                        className={`tab${activeTab === tab ? ' active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {activeTab === 'positioning' && (
                <div className="stagger">
                    <div className="card animate-fade-in mb-4">
                        <div className="card-header">
                            <div className="card-title">Positioning Statement</div>
                            <button className="btn btn-ghost btn-sm" onClick={handleRegenerate} disabled={regenerating}>
                                <RefreshCw size={14} /> Regenerate
                            </button>
                        </div>
                        <p style={{ fontSize: '0.938rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                            {s.positioning}
                        </p>
                    </div>

                    <div className="card animate-fade-in mb-4">
                        <div className="card-header">
                            <div className="card-title">Key Differentiators</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {(s.differentiators || []).map((d, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                                        background: 'var(--primary-muted)', color: 'var(--primary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.75rem', fontWeight: 600, flexShrink: 0,
                                    }}>
                                        {i + 1}
                                    </div>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{d}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {s.pricingPosition && (
                        <div className="card animate-fade-in">
                            <div className="card-header">
                                <div className="card-title">Pricing Position</div>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{s.pricingPosition}</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'voice' && s.brandVoice && (
                <div className="grid-2 stagger">
                    <div className="card animate-fade-in">
                        <div className="card-header">
                            <div className="card-title">Brand Tone</div>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                            {s.brandVoice.tone}
                        </p>
                        <div className="card-subtitle">Personality</div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
                            {s.brandVoice.personality}
                        </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <div className="card animate-fade-in">
                            <div className="card-title" style={{ marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <ChevronRight size={14} style={{ color: 'var(--success)' }} /> Do
                            </div>
                            {(s.brandVoice.doList || []).map((item, i) => (
                                <div key={i} style={{ fontSize: '0.813rem', color: 'var(--success)', marginBottom: 'var(--space-2)', display: 'flex', gap: 'var(--space-2)' }}>
                                    <ArrowRight size={14} /> {item}
                                </div>
                            ))}
                        </div>
                        <div className="card animate-fade-in">
                            <div className="card-title" style={{ marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <ChevronRight size={14} style={{ color: 'var(--error)' }} /> Don't
                            </div>
                            {(s.brandVoice.dontList || []).map((item, i) => (
                                <div key={i} style={{ fontSize: '0.813rem', color: 'var(--error)', marginBottom: 'var(--space-2)', display: 'flex', gap: 'var(--space-2)' }}>
                                    <ArrowRight size={14} /> {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'calendar' && (
                <div className="card animate-fade-in">
                    <div className="card-header">
                        <div className="card-title">30-Day Content Calendar</div>
                        <button className="btn btn-ghost btn-sm" onClick={handleExportCalendar}>Export</button>
                    </div>
                    {s.contentCalendar && s.contentCalendar.length > 0 ? (
                        <div className="calendar-grid">
                            {dayNames.map((d) => (
                                <div key={d} className="calendar-day-header">{d}</div>
                            ))}
                            {Array.from({ length: 35 }, (_, i) => {
                                const day = i + 1;
                                const events = s.contentCalendar.filter((c) => c.day === day);
                                return (
                                    <div key={i} className="calendar-day">
                                        {day <= 30 && (
                                            <>
                                                <div className="calendar-day-number">{day}</div>
                                                {events.map((evt, ei) => (
                                                    <div key={ei} className={`calendar-event ${evt.platform}`}
                                                        onClick={() => navigate('/content', { state: { selectedType: evt.contentType } })}
                                                        style={{ cursor: 'pointer' }}>
                                                        {evt.title}
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-6)' }}>
                            No content calendar available. Regenerate your strategy to create one.
                        </p>
                    )}
                </div>
            )}

            {activeTab === 'roadmap' && (
                <div className="stagger">
                    {(s.launchRoadmap || []).length > 0 ? (
                        s.launchRoadmap.map((phase) => (
                            <div key={phase.week} className="card animate-fade-in mb-4">
                                <div className="card-header">
                                    <div>
                                        <div className="card-title">Week {phase.week}: {phase.title}</div>
                                    </div>
                                    <span className="badge badge-default">Week {phase.week}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                    {phase.tasks.map((task, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.813rem', color: 'var(--text-secondary)' }}>
                                            <input type="checkbox" style={{ accentColor: 'var(--primary)' }} />
                                            {task}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No launch roadmap available. Regenerate your strategy to create one.
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'communities' && (
                <div className="card animate-fade-in">
                    <div className="card-header">
                        <div className="card-title">Target Communities</div>
                        <button className="btn btn-ghost btn-sm">Add community</button>
                    </div>
                    {(s.targetCommunities || []).length > 0 ? (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Community</th>
                                        <th>Platform</th>
                                        <th>URL</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {s.targetCommunities.map((c, i) => (
                                        <tr key={i}>
                                            <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.name}</td>
                                            <td>{c.platform}</td>
                                            <td>
                                                {c.url ? (
                                                    <a href={c.url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>{c.url}</a>
                                                ) : '\u2014'}
                                            </td>
                                            <td><span className="badge badge-default">Not joined</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-6)' }}>
                            No target communities identified yet. Regenerate your strategy.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
