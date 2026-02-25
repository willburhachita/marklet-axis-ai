import { useNavigate } from 'react-router-dom';
import {
    FileText, PenTool, Rocket, Code2, Target, Zap,
    ArrowRight, Check, X, Clock, Shield, GitBranch,
    Hand, Bot, Send, Eye, RefreshCw, Activity,
} from 'lucide-react';
import {
    mockAppProfile, mockContents, mockActivities,
    mockResources, mockCodebaseAnalysis, mockLaunchAssets,
} from '../data/mockData';

function timeAgo(ts) {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

const agentIcons = {
    content: { icon: PenTool, color: 'primary' },
    strategy: { icon: Target, color: 'info' },
    launch: { icon: Rocket, color: 'warning' },
    codebase: { icon: Code2, color: 'success' },
    legal: { icon: Shield, color: 'error' },
};

/* ============================= */
/* ASSIST MODE DASHBOARD         */
/* ============================= */
function AssistDashboard() {
    const navigate = useNavigate();

    // Items waiting for user review
    const pendingContent = mockContents.filter((c) => c.status === 'draft' || c.status === 'approved');
    const pendingLaunch = mockLaunchAssets.filter((a) => a.status === 'draft');
    const pendingResources = mockResources.filter((r) => r.status === 'draft');

    const quickActions = [
        { title: 'Generate a Twitter thread', desc: 'Create a thread about your product story', icon: PenTool, color: 'primary', action: () => navigate('/content') },
        { title: 'Analyze your codebase', desc: 'Connect GitHub and extract product context', icon: Code2, color: 'success', action: () => navigate('/codebase') },
        { title: 'Create a legal document', desc: 'Generate privacy policy or terms of service', icon: Shield, color: 'error', action: () => navigate('/resources') },
        { title: 'Build your launch kit', desc: 'Product Hunt, Hacker News, and press ready assets', icon: Rocket, color: 'warning', action: () => navigate('/launch') },
    ];

    return (
        <div className="animate-fade-in">
            {/* Assist banner */}
            <div className="mode-banner assist">
                <div className="mode-banner-title">
                    <Hand size={22} />
                    Assist Mode
                </div>
                <div className="mode-banner-subtitle">
                    You review and approve everything. {pendingContent.length + pendingLaunch.length + pendingResources.length} items waiting for your review.
                </div>
            </div>

            {/* Quick actions — prompt-style cards */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-3)' }}>
                    Quick actions
                </div>
                <div className="prompt-grid">
                    {quickActions.map((action) => (
                        <div key={action.title} className="prompt-card" onClick={action.action}>
                            <div className="prompt-card-icon" style={{ background: `var(--${action.color}-muted)`, color: `var(--${action.color})` }}>
                                <action.icon />
                            </div>
                            <div className="prompt-card-title">{action.title}</div>
                            <div className="prompt-card-desc">{action.desc}</div>
                            <div className="prompt-card-arrow"><ArrowRight size={16} /></div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid-2">
                {/* Review queue */}
                <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-3)' }}>
                        Review queue
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        {pendingContent.map((content) => (
                            <div key={content._id} className="queue-item">
                                <div className="queue-item-icon" style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>
                                    <PenTool />
                                </div>
                                <div className="queue-item-body">
                                    <div className="queue-item-title">{content.title}</div>
                                    <div className="queue-item-meta">{content.platform} &middot; {content.type.replace(/_/g, ' ')}</div>
                                </div>
                                <div className="queue-item-actions">
                                    <button className="btn btn-primary btn-sm"><Check size={14} /> Approve</button>
                                    <button className="btn btn-ghost btn-sm"><Eye size={14} /></button>
                                </div>
                            </div>
                        ))}
                        {pendingResources.map((r) => (
                            <div key={r._id} className="queue-item">
                                <div className="queue-item-icon" style={{ background: 'var(--error-muted)', color: 'var(--error)' }}>
                                    <Shield />
                                </div>
                                <div className="queue-item-body">
                                    <div className="queue-item-title">{r.title}</div>
                                    <div className="queue-item-meta">Legal document &middot; draft</div>
                                </div>
                                <div className="queue-item-actions">
                                    <button className="btn btn-primary btn-sm"><Check size={14} /> Approve</button>
                                    <button className="btn btn-ghost btn-sm"><Eye size={14} /></button>
                                </div>
                            </div>
                        ))}
                        {pendingLaunch.map((a) => (
                            <div key={a._id} className="queue-item">
                                <div className="queue-item-icon" style={{ background: 'var(--warning-muted)', color: 'var(--warning)' }}>
                                    <Rocket />
                                </div>
                                <div className="queue-item-body">
                                    <div className="queue-item-title">{a.title}</div>
                                    <div className="queue-item-meta">Launch asset &middot; draft</div>
                                </div>
                                <div className="queue-item-actions">
                                    <button className="btn btn-primary btn-sm"><Check size={14} /> Approve</button>
                                    <button className="btn btn-ghost btn-sm"><Eye size={14} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status + metrics sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {/* Metrics card */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">Progress</div>
                        </div>
                        <div className="metric-row">
                            <div className="metric-row-icon" style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}><PenTool /></div>
                            <div className="metric-row-body">
                                <div className="metric-row-label">Content pieces</div>
                                <div className="metric-row-value">{mockContents.length}</div>
                            </div>
                        </div>
                        <div className="metric-row">
                            <div className="metric-row-icon" style={{ background: 'var(--success-muted)', color: 'var(--success)' }}><FileText /></div>
                            <div className="metric-row-body">
                                <div className="metric-row-label">Resources generated</div>
                                <div className="metric-row-value">{mockResources.length}</div>
                            </div>
                        </div>
                        <div className="metric-row">
                            <div className="metric-row-icon" style={{ background: 'var(--warning-muted)', color: 'var(--warning)' }}><Rocket /></div>
                            <div className="metric-row-body">
                                <div className="metric-row-label">Launch readiness</div>
                                <div className="metric-row-value">{Math.round((mockLaunchAssets.filter((a) => a.status === 'ready').length / mockLaunchAssets.length) * 100)}%</div>
                            </div>
                        </div>
                        <div className="metric-row">
                            <div className="metric-row-icon" style={{ background: 'var(--info-muted)', color: 'var(--info)' }}><Code2 /></div>
                            <div className="metric-row-body">
                                <div className="metric-row-label">Features detected</div>
                                <div className="metric-row-value">{mockCodebaseAnalysis.features.length}</div>
                            </div>
                        </div>
                    </div>

                    {/* Tech stack */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">Tech Stack</div>
                            <span className="badge badge-default">{mockAppProfile.appName}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                            {mockCodebaseAnalysis.techStack.map((tech) => (
                                <span key={tech} className="tech-stack-tag">{tech}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ============================= */
/* AUTOPILOT MODE DASHBOARD      */
/* ============================= */
function AutopilotDashboard() {
    const navigate = useNavigate();

    const agents = [
        { name: 'Strategy Agent', icon: Target, color: 'info', status: 'idle', lastAction: 'Updated positioning 2h ago' },
        { name: 'Content Agent', icon: PenTool, color: 'primary', status: 'active', lastAction: 'Generating Reddit post...' },
        { name: 'Launch Agent', icon: Rocket, color: 'warning', status: 'idle', lastAction: 'Created PH listing 5h ago' },
        { name: 'Codebase Agent', icon: Code2, color: 'success', status: 'idle', lastAction: 'Analyzed repo 1h ago' },
        { name: 'Legal Agent', icon: Shield, color: 'error', status: 'idle', lastAction: 'Generated Privacy Policy 30m ago' },
    ];

    const autopilotActions = [
        { title: 'Pause all agents', desc: 'Temporarily stop autonomous actions', icon: Clock, color: 'warning', action: () => { } },
        { title: 'View agent logs', desc: 'See detailed execution history', icon: Activity, color: 'info', action: () => { } },
        { title: 'Configure guardrails', desc: 'Set boundaries for auto-posting', icon: Shield, color: 'error', action: () => navigate('/settings') },
        { title: 'Review posted content', desc: 'Check what agents have published', icon: Eye, color: 'primary', action: () => navigate('/content') },
    ];

    return (
        <div className="animate-fade-in">
            {/* Autopilot banner */}
            <div className="mode-banner autopilot">
                <div className="mode-banner-title">
                    <Bot size={22} />
                    Autopilot Active
                    <span className="live-pulse"><span className="live-pulse-dot" /> Live</span>
                </div>
                <div className="mode-banner-subtitle">
                    Agents are autonomously executing your marketing strategy. You'll be notified of all actions taken.
                </div>
            </div>

            {/* Agent status grid */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-3)' }}>
                    Agent status
                </div>
                <div className="agent-grid">
                    {agents.map((agent) => (
                        <div key={agent.name} className="agent-status-card">
                            <div className="agent-status-header">
                                <div className="agent-status-icon" style={{ background: `var(--${agent.color}-muted)`, color: `var(--${agent.color})` }}>
                                    <agent.icon />
                                </div>
                                <div>
                                    <div className="agent-status-name">{agent.name}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                                        <span className={`dot ${agent.status === 'active' ? 'dot-success' : 'dot-default'}`} />
                                        <span style={{ fontSize: '0.688rem', color: agent.status === 'active' ? 'var(--success)' : 'var(--text-muted)' }}>
                                            {agent.status === 'active' ? 'Running' : 'Idle'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="agent-status-info">{agent.lastAction}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid-2">
                {/* Live activity feed */}
                <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-3)' }}>
                        Live activity
                    </div>
                    <div className="live-feed">
                        <div className="live-feed-header">
                            <span style={{ fontSize: '0.813rem', fontWeight: 500, color: 'var(--text-primary)' }}>Agent Actions</span>
                            <span className="live-pulse"><span className="live-pulse-dot" /> Streaming</span>
                        </div>
                        {mockActivities.map((activity) => {
                            const agentConfig = agentIcons[activity.agentType] || agentIcons.content;
                            const IconComponent = agentConfig.icon;
                            return (
                                <div key={activity._id} className="live-feed-item">
                                    <div
                                        className="live-feed-item-icon"
                                        style={{ background: `var(--${agentConfig.color}-muted)`, color: `var(--${agentConfig.color})` }}
                                    >
                                        <IconComponent />
                                    </div>
                                    <div className="live-feed-item-content">
                                        <div className="live-feed-item-text">
                                            <strong>{activity.agentType.charAt(0).toUpperCase() + activity.agentType.slice(1)}</strong>{' '}
                                            {activity.description.replace(/^[A-Z]\w+ Agent /, '')}
                                        </div>
                                        <div className="live-feed-item-time">{timeAgo(activity.createdAt)}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick controls */}
                <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-3)' }}>
                        Controls
                    </div>
                    <div className="prompt-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                        {autopilotActions.map((action) => (
                            <div key={action.title} className="prompt-card" onClick={action.action}>
                                <div className="prompt-card-icon" style={{ background: `var(--${action.color}-muted)`, color: `var(--${action.color})` }}>
                                    <action.icon />
                                </div>
                                <div className="prompt-card-title">{action.title}</div>
                                <div className="prompt-card-desc">{action.desc}</div>
                                <div className="prompt-card-arrow"><ArrowRight size={16} /></div>
                            </div>
                        ))}
                    </div>

                    {/* Auto-execution stats */}
                    <div className="card" style={{ marginTop: 'var(--space-4)' }}>
                        <div className="card-header">
                            <div className="card-title">Autopilot Stats (24h)</div>
                        </div>
                        <div className="metric-row">
                            <div className="metric-row-icon" style={{ background: 'var(--success-muted)', color: 'var(--success)' }}><Send /></div>
                            <div className="metric-row-body">
                                <div className="metric-row-label">Posts published</div>
                                <div className="metric-row-value">3</div>
                            </div>
                        </div>
                        <div className="metric-row">
                            <div className="metric-row-icon" style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}><PenTool /></div>
                            <div className="metric-row-body">
                                <div className="metric-row-label">Content generated</div>
                                <div className="metric-row-value">5</div>
                            </div>
                        </div>
                        <div className="metric-row">
                            <div className="metric-row-icon" style={{ background: 'var(--error-muted)', color: 'var(--error)' }}><Shield /></div>
                            <div className="metric-row-body">
                                <div className="metric-row-label">Legal docs created</div>
                                <div className="metric-row-value">2</div>
                            </div>
                        </div>
                        <div className="metric-row">
                            <div className="metric-row-icon" style={{ background: 'var(--info-muted)', color: 'var(--info)' }}><RefreshCw /></div>
                            <div className="metric-row-body">
                                <div className="metric-row-label">Strategy updates</div>
                                <div className="metric-row-value">1</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ============================= */
/* MAIN EXPORT                   */
/* ============================= */
export default function Overview({ mode }) {
    return mode === 'autopilot' ? <AutopilotDashboard /> : <AssistDashboard />;
}
