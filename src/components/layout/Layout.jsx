import { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Target, PenTool, Rocket, Code2,
    FolderOpen, Settings, Hand, Bot, Bell, Search, LogOut,
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api.js';
import { signOut } from '../../lib/auth-client.ts';

const navItems = [
    { to: '/overview', label: 'Overview', icon: LayoutDashboard },
    { to: '/strategy', label: 'Strategy', icon: Target },
    { to: '/content', label: 'Content Studio', icon: PenTool },
    { to: '/launch', label: 'Launch Kit', icon: Rocket },
    { to: '/codebase', label: 'Codebase', icon: Code2 },
    { to: '/resources', label: 'Resources', icon: FolderOpen },
    { to: '/settings', label: 'Settings', icon: Settings },
];

const PLAN_LABELS = {
    free: 'Free Trial',
    indie: 'Indie',
    startup: 'Startup',
    pro: 'Pro',
};

export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [signingOut, setSigningOut] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // Real user from Convex
    const user = useQuery(api.users.getCurrentUser);
    const toggleMode = useMutation(api.users.toggleMode);

    const mode = user?.mode || 'assist';

    const currentPage = navItems.find(
        (item) => location.pathname.startsWith(item.to)
    );

    const handleModeToggle = async (newMode) => {
        if (!user) return;
        if (newMode === 'autopilot' && user.plan === 'free') {
            setShowUpgradeModal(true);
            return;
        }
        await toggleMode({ userId: user._id, mode: newMode });
    };

    const handleSignOut = async () => {
        setSigningOut(true);
        await signOut();
        navigate('/', { replace: true });
    };

    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    const planLabel = PLAN_LABELS[user?.plan] || 'Free Trial';
    const isFree = !user?.plan || user.plan === 'free';

    return (
        <div className="app-layout">
            {/* ── Sidebar ────────────────────────────── */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <NavLink to="/overview" className="sidebar-logo">
                        <div className="sidebar-logo-icon">M</div>
                        <span>MarketAxis</span>
                    </NavLink>
                </div>

                <nav className="sidebar-nav">
                    <div className="sidebar-section-title">Main</div>
                    {navItems.slice(0, 4).map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `sidebar-link${isActive ? ' active' : ''}`
                            }
                        >
                            <item.icon />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}

                    <div className="sidebar-section-title">Intelligence</div>
                    {navItems.slice(4, 6).map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `sidebar-link${isActive ? ' active' : ''}`
                            }
                        >
                            <item.icon />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}

                    <div className="sidebar-section-title">Account</div>
                    {navItems.slice(6).map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `sidebar-link${isActive ? ' active' : ''}`
                            }
                        >
                            <item.icon />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    {/* Free Trial upgrade nudge */}
                    {isFree && (
                        <div className="sidebar-trial-banner">
                            <span className="sidebar-trial-badge">Free Trial</span>
                            <span className="sidebar-trial-text">Upgrade to unlock Autopilot</span>
                            <button
                                className="sidebar-trial-btn"
                                onClick={() => navigate('/settings')}
                            >
                                Upgrade →
                            </button>
                        </div>
                    )}

                    {/* User row */}
                    <div className="sidebar-user" onClick={() => navigate('/settings')} style={{ cursor: 'pointer' }}>
                        <div className="sidebar-user-avatar">{initials}</div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">
                                {user?.name || 'Loading...'}
                            </div>
                            <div className={`sidebar-user-plan${isFree ? ' free' : ''}`}>
                                {planLabel}
                            </div>
                        </div>
                        <button
                            className="sidebar-signout-btn"
                            title="Sign out"
                            onClick={(e) => { e.stopPropagation(); handleSignOut(); }}
                            disabled={signingOut}
                        >
                            <LogOut size={15} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* ── Main ────────────────────────────────── */}
            <div className="main-wrapper">
                <header className="topbar">
                    <div className="topbar-left">
                        <span className="topbar-title">
                            {currentPage?.label || 'Dashboard'}
                        </span>
                    </div>
                    <div className="topbar-right">
                        <div className="mode-toggle">
                            <button
                                className={`mode-toggle-option${mode === 'assist' ? ' active' : ''}`}
                                onClick={() => handleModeToggle('assist')}
                                id="mode-assist-btn"
                            >
                                <Hand size={14} />
                                Assist
                            </button>
                            <button
                                className={`mode-toggle-option${mode === 'autopilot' ? ' active' : ''}`}
                                onClick={() => handleModeToggle('autopilot')}
                                id="mode-autopilot-btn"
                            >
                                <Bot size={14} />
                                Autopilot
                                {isFree && <span className="mode-toggle-lock">🔒</span>}
                            </button>
                        </div>

                        <button className="btn-icon" title="Search (Ctrl+K)">
                            <Search size={18} />
                        </button>
                        <button className="btn-icon" title="Notifications" style={{ position: 'relative' }}>
                            <Bell size={18} />
                            <span style={{
                                position: 'absolute', top: 4, right: 4, width: 7, height: 7,
                                borderRadius: '50%', background: 'var(--error)',
                            }} />
                        </button>
                    </div>
                </header>

                <main className="main-content">
                    <Outlet context={{ user, mode }} />
                </main>
            </div>

            {/* ── Upgrade Modal (free → autopilot) ─── */}
            {showUpgradeModal && (
                <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">Autopilot requires an upgrade</h3>
                        <p className="modal-body">
                            Autopilot mode lets AI agents post, engage, and execute marketing actions autonomously.
                            It's available on the <strong>Indie plan</strong> and above.
                        </p>
                        <div className="modal-actions">
                            <button
                                className="landing-btn-pill"
                                onClick={() => { setShowUpgradeModal(false); navigate('/settings'); }}
                            >
                                See Plans
                            </button>
                            <button
                                className="landing-btn-ghost-outline"
                                style={{ padding: '10px 20px', fontSize: '0.813rem' }}
                                onClick={() => setShowUpgradeModal(false)}
                            >
                                Stay on Free Trial
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
