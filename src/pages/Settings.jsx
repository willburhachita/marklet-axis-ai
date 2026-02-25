import { useState } from 'react';
import {
    Save, Hand, Bot, ExternalLink,
    Twitter, Linkedin, Github, Mail, Camera,
} from 'lucide-react';
import { mockUser, mockAppProfile, mockSocialAccounts } from '../data/mockData';

const platformConfig = {
    twitter: { label: 'Twitter / X', icon: Twitter, color: 'var(--info)' },
    linkedin: { label: 'LinkedIn', icon: Linkedin, color: 'var(--primary)' },
    github: { label: 'GitHub', icon: Github, color: 'var(--text-primary)' },
    gmail: { label: 'Gmail', icon: Mail, color: 'var(--error)' },
    instagram: { label: 'Instagram', icon: Camera, color: 'var(--warning)' },
};

export default function Settings({ mode, setMode }) {
    const [profile, setProfile] = useState(mockAppProfile);

    const handleChange = (field, value) => {
        setProfile((p) => ({ ...p, [field]: value }));
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Settings</h1>
                    <p>Manage your app profile, connections, and preferences</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-primary">
                        <Save size={16} /> Save changes
                    </button>
                </div>
            </div>

            {/* Marketing Mode */}
            <div className="card mb-6">
                <div className="card-header">
                    <div className="card-title">Marketing Mode</div>
                </div>
                <div className="grid-2" style={{ gap: 'var(--space-3)' }}>
                    <div
                        className="card"
                        style={{
                            cursor: 'pointer',
                            borderColor: mode === 'assist' ? 'var(--primary)' : 'var(--border-subtle)',
                            background: mode === 'assist' ? 'var(--primary-muted)' : 'var(--bg-tertiary)',
                        }}
                        onClick={() => setMode('assist')}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                            <Hand size={20} style={{ color: mode === 'assist' ? 'var(--primary)' : 'var(--text-muted)' }} />
                            <span style={{ fontWeight: 600, color: mode === 'assist' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Assist Mode</span>
                        </div>
                        <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)' }}>
                            You review and approve everything before it goes live. Full control over all agent actions.
                        </p>
                    </div>
                    <div
                        className="card"
                        style={{
                            cursor: 'pointer',
                            borderColor: mode === 'autopilot' ? 'var(--primary)' : 'var(--border-subtle)',
                            background: mode === 'autopilot' ? 'var(--primary-muted)' : 'var(--bg-tertiary)',
                        }}
                        onClick={() => setMode('autopilot')}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                            <Bot size={20} style={{ color: mode === 'autopilot' ? 'var(--primary)' : 'var(--text-muted)' }} />
                            <span style={{ fontWeight: 600, color: mode === 'autopilot' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Autopilot Mode</span>
                        </div>
                        <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)' }}>
                            Agents execute autonomously within guardrails. You get notified of actions taken.
                        </p>
                    </div>
                </div>
            </div>

            {/* App Profile */}
            <div className="card mb-6">
                <div className="card-header">
                    <div className="card-title">App Profile</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div>
                        <label className="input-label">App Name</label>
                        <input className="input-field" value={profile.appName} onChange={(e) => handleChange('appName', e.target.value)} />
                    </div>
                    <div>
                        <label className="input-label">App URL</label>
                        <input className="input-field" value={profile.appUrl || ''} onChange={(e) => handleChange('appUrl', e.target.value)} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label className="input-label">Description</label>
                        <textarea className="input-field" rows={3} value={profile.description} onChange={(e) => handleChange('description', e.target.value)} />
                    </div>
                    <div>
                        <label className="input-label">Target Audience</label>
                        <input className="input-field" value={profile.targetAudience} onChange={(e) => handleChange('targetAudience', e.target.value)} />
                    </div>
                    <div>
                        <label className="input-label">Region</label>
                        <input className="input-field" value={profile.region} onChange={(e) => handleChange('region', e.target.value)} />
                    </div>
                    <div>
                        <label className="input-label">Stage</label>
                        <select className="input-field" value={profile.stage} onChange={(e) => handleChange('stage', e.target.value)}>
                            <option value="idea">Idea</option>
                            <option value="mvp">MVP</option>
                            <option value="beta">Beta</option>
                            <option value="launched">Launched</option>
                        </select>
                    </div>
                    <div>
                        <label className="input-label">Monetization</label>
                        <select className="input-field" value={profile.monetization} onChange={(e) => handleChange('monetization', e.target.value)}>
                            <option value="Free">Free</option>
                            <option value="Freemium">Freemium</option>
                            <option value="Paid">Paid</option>
                            <option value="SaaS">SaaS</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Connected Accounts */}
            <div className="card mb-6">
                <div className="card-header">
                    <div className="card-title">Connected Accounts</div>
                    <button className="btn btn-secondary btn-sm">Connect new</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {Object.entries(platformConfig).map(([key, config]) => {
                        const connected = mockSocialAccounts.find((a) => a.platform === key);
                        const IconComp = config.icon;
                        return (
                            <div key={key} className="connected-account">
                                <div className="connected-account-icon">
                                    <IconComp size={20} style={{ color: config.color }} />
                                </div>
                                <div className="connected-account-info">
                                    <div className="connected-account-name">{config.label}</div>
                                    <div className="connected-account-status">
                                        {connected ? connected.accountName : 'Not connected'}
                                    </div>
                                </div>
                                {connected ? (
                                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                                        <span className="dot dot-success" />
                                        <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Connected</span>
                                        <button className="btn btn-ghost btn-sm">Disconnect</button>
                                    </div>
                                ) : (
                                    <button className="btn btn-secondary btn-sm">
                                        <ExternalLink size={14} /> Connect
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Account */}
            <div className="card">
                <div className="card-header">
                    <div className="card-title">Account</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div>
                        <label className="input-label">Name</label>
                        <input className="input-field" value={mockUser.name} readOnly />
                    </div>
                    <div>
                        <label className="input-label">Email</label>
                        <input className="input-field" value={mockUser.email} readOnly />
                    </div>
                    <div>
                        <label className="input-label">Plan</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                            <span className="badge badge-primary">{mockUser.plan}</span>
                            <button className="btn btn-ghost btn-sm">Upgrade</button>
                        </div>
                    </div>
                    <div>
                        <label className="input-label">Auth Provider</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                            <span className="badge badge-default">Better Auth</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
