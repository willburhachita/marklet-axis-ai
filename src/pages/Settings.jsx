import { useState, useEffect } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import {
    Save, Hand, Bot, ExternalLink,
    Twitter, Linkedin, Github, Mail, Camera, Loader2, Check, Link2,
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api.js';
import { signIn } from '../lib/auth-client.ts';

const platformConfig = {
    twitter: { label: 'Twitter / X', icon: Twitter, color: 'var(--info)' },
    linkedin: { label: 'LinkedIn', icon: Linkedin, color: 'var(--primary)' },
    github: { label: 'GitHub', icon: Github, color: 'var(--text-primary)' },
    gmail: { label: 'Gmail', icon: Mail, color: 'var(--error)' },
    instagram: { label: 'Instagram', icon: Camera, color: 'var(--warning)' },
};

export default function Settings({ mode, setMode }) {
    const { user } = useOutletContext();
    const { projectId } = useParams();
    const [localProfile, setLocalProfile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Convex queries
    const profile = useQuery(
        api.appProfiles.getById,
        projectId ? { profileId: projectId } : 'skip'
    );
    const socialAccounts = useQuery(
        api.socialAccounts.getByUser,
        user ? { userId: user._id } : 'skip'
    );

    // Mutations
    const updateProfile = useMutation(api.appProfiles.update);
    const disconnectSocial = useMutation(api.socialAccounts.disconnect);

    // Sync local state when profile loads
    useEffect(() => {
        if (profile && !localProfile) {
            setLocalProfile(profile);
            console.log('[Settings] Loaded profile:', profile);
        }
    }, [profile, localProfile]);

    const handleChange = (field, value) => {
        setLocalProfile((p) => ({ ...p, [field]: value }));
    };

    const handleSave = async () => {
        if (!localProfile) return;
        setSaving(true);
        console.log('[Settings] Saving profile updates...', localProfile);
        try {
            await updateProfile({
                profileId: localProfile._id,
                appName: localProfile.appName,
                description: localProfile.description,
                targetAudience: localProfile.targetAudience,
                platforms: localProfile.platforms,
                region: localProfile.region,
                stage: localProfile.stage,
                monetization: localProfile.monetization,
                appUrl: localProfile.appUrl,
            });
            console.log('[Settings] Save successful');
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error('[Settings] Save failed:', err);
        }
        setSaving(false);
    };

    if (!user || profile === undefined || !localProfile) {
        return (
            <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <Loader2 size={32} className="onboarding-gen-spin" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Settings</h1>
                    <p>Manage your app profile, connections, and preferences</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 size={16} className="onboarding-gen-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
                        {saving ? 'Saving...' : saved ? 'Saved' : 'Save changes'}
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
                        <input className="input-field" value={localProfile.appName} onChange={(e) => handleChange('appName', e.target.value)} />
                    </div>
                    <div>
                        <label className="input-label">App URL</label>
                        <input className="input-field" value={localProfile.appUrl || ''} onChange={(e) => handleChange('appUrl', e.target.value)} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label className="input-label">Description</label>
                        <textarea className="input-field" rows={3} value={localProfile.description} onChange={(e) => handleChange('description', e.target.value)} />
                    </div>
                    <div>
                        <label className="input-label">Target Audience</label>
                        <input className="input-field" value={localProfile.targetAudience} onChange={(e) => handleChange('targetAudience', e.target.value)} />
                    </div>
                    <div>
                        <label className="input-label">Region</label>
                        <input className="input-field" value={localProfile.region} onChange={(e) => handleChange('region', e.target.value)} />
                    </div>
                    <div>
                        <label className="input-label">Stage</label>
                        <select className="input-field" value={localProfile.stage} onChange={(e) => handleChange('stage', e.target.value)}>
                            <option value="idea">Idea</option>
                            <option value="mvp">MVP</option>
                            <option value="beta">Beta</option>
                            <option value="launched">Launched</option>
                        </select>
                    </div>
                    <div>
                        <label className="input-label">Monetization</label>
                        <select className="input-field" value={localProfile.monetization} onChange={(e) => handleChange('monetization', e.target.value)}>
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
                    <button className="btn btn-secondary btn-sm" onClick={() => alert('Future Implementation: Composio Connection')}>Connect new</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {Object.entries(platformConfig).map(([key, config]) => {
                        const connected = (socialAccounts || []).find((a) => a.platform === key && a.isActive);
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
                                        <button className="btn btn-ghost btn-sm" onClick={() => {
                                            console.log('[Settings] Disconnecting:', connected._id);
                                            disconnectSocial({ accountId: connected._id });
                                        }}>Disconnect</button>
                                    </div>
                                ) : (
                                    <button className="btn btn-secondary btn-sm" onClick={() => alert(`Connect ${config.label} (Requires Composio Setup) `)}>
                                        <ExternalLink size={14} /> Connect
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Linked Auth Accounts */}
            <div className="card mb-6">
                <div className="card-header">
                    <div className="card-title">Linked Auth Accounts</div>
                    <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)', margin: 0 }}>
                        Manage the sign-in methods connected to your account.
                    </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>

                    {/* GitHub — primary auth */}
                    <div className="connected-account">
                        <div className="connected-account-icon">
                            <Github size={20} style={{ color: 'var(--text-primary)' }} />
                        </div>
                        <div className="connected-account-info">
                            <div className="connected-account-name">GitHub</div>
                            <div className="connected-account-status">
                                {user.githubConnected ? 'Connected — primary sign-in' : 'Not connected'}
                            </div>
                        </div>
                        {user.githubConnected ? (
                            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                                <span className="dot dot-success" />
                                <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Connected</span>
                            </div>
                        ) : (
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={async () => {
                                    sessionStorage.setItem('oauth_provider', 'github');
                                    await signIn.social({
                                        provider: 'github',
                                        callbackURL: `${window.location.origin}/auth/callback`,
                                    });
                                }}
                            >
                                <Github size={14} /> Connect GitHub
                            </button>
                        )}
                    </div>

                    {/* Google — link-only, shown when GitHub is connected */}
                    {user.githubConnected && (
                        <div className="connected-account">
                            <div className="connected-account-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                            </div>
                            <div className="connected-account-info">
                                <div className="connected-account-name">Google</div>
                                <div className="connected-account-status">Link your Google account as an additional sign-in</div>
                            </div>
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={async () => {
                                    await signIn.social({
                                        provider: 'google',
                                        callbackURL: `${window.location.origin}/auth/callback`,
                                    });
                                }}
                            >
                                <Link2 size={14} /> Link Google
                            </button>
                        </div>
                    )}
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
                        <input className="input-field" value={user.name || ''} readOnly />
                    </div>
                    <div>
                        <label className="input-label">Email</label>
                        <input className="input-field" value={user.email} readOnly />
                    </div>
                    <div>
                        <label className="input-label">Plan</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                            <span className="badge badge-primary">{user.plan}</span>
                            <button className="btn btn-ghost btn-sm">Upgrade</button>
                        </div>
                    </div>
                    <div>
                        <label className="input-label">Auth Provider</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                            <span className="badge badge-default">
                                {user.githubConnected ? 'GitHub' : 'Email'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
