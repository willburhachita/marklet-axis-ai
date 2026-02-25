import { useState } from 'react';
import { RefreshCw, Edit3, ChevronRight, ArrowRight } from 'lucide-react';
import { mockStrategy } from '../data/mockData';

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Strategy() {
    const [activeTab, setActiveTab] = useState('positioning');
    const s = mockStrategy;

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Marketing Strategy</h1>
                    <p>AI-generated strategy based on your app profile and codebase</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-secondary"><Edit3 size={16} /> Edit profile</button>
                    <button className="btn btn-primary"><RefreshCw size={16} /> Regenerate</button>
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
                            <button className="btn btn-ghost btn-sm"><RefreshCw size={14} /> Regenerate</button>
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
                            {s.differentiators.map((d, i) => (
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

                    <div className="card animate-fade-in">
                        <div className="card-header">
                            <div className="card-title">Pricing Position</div>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{s.pricingPosition}</p>
                    </div>
                </div>
            )}

            {activeTab === 'voice' && (
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
                            {s.brandVoice.doList.map((item, i) => (
                                <div key={i} style={{ fontSize: '0.813rem', color: 'var(--success)', marginBottom: 'var(--space-2)', display: 'flex', gap: 'var(--space-2)' }}>
                                    <ArrowRight size={14} /> {item}
                                </div>
                            ))}
                        </div>
                        <div className="card animate-fade-in">
                            <div className="card-title" style={{ marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <ChevronRight size={14} style={{ color: 'var(--error)' }} /> Don't
                            </div>
                            {s.brandVoice.dontList.map((item, i) => (
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
                        <button className="btn btn-ghost btn-sm">Export</button>
                    </div>
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
                                                <div key={ei} className={`calendar-event ${evt.platform}`}>
                                                    {evt.title}
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeTab === 'roadmap' && (
                <div className="stagger">
                    {s.launchRoadmap.map((phase) => (
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
                                        <input type="checkbox" style={{ accentColor: 'var(--primary)' }} defaultChecked={phase.week === 1} />
                                        {task}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'communities' && (
                <div className="card animate-fade-in">
                    <div className="card-header">
                        <div className="card-title">Target Communities</div>
                        <button className="btn btn-ghost btn-sm">Add community</button>
                    </div>
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
                </div>
            )}
        </div>
    );
}
