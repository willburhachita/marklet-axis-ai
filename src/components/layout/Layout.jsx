import { useState, useCallback } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Target, PenTool, Rocket, Code2,
    FolderOpen, Settings, Hand, Bot, Bell, Search, LogOut, Github, X,
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api.js';
import { signOut } from '../../lib/auth-client.ts';

const navItems = [
    { to: '/overview', label: 'Dashboard', icon: LayoutDashboard },
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
    const [githubBannerDismissed, setGithubBannerDismissed] = useState(false);
    // Sub-header slot — pages can inject a sticky header here via outlet context.
    // It lives OUTSIDE .main-content so it never scrolls.
    const [subHeader, setSubHeaderRaw] = useState(null);
    const setSubHeader = useCallback((el) => setSubHeaderRaw(el), []);

    // Real user from Convex
    const user = useQuery(api.users.getCurrentUser);
    const toggleMode = useMutation(api.users.toggleMode);

    const mode = user?.mode || 'assist';

    const match = location.pathname.match(/\/project\/([^\/]+)/);
    const projectId = match ? match[1] : null;

    const currentPage = navItems.find(
        (item) => location.pathname.includes(item.to)
    );

    // If we have a project ID, the base becomes /project/:id, otherwise we fall back to /overview hub.
    const buildPath = (path) => {
        if (!projectId) return '/overview';
        return `/project/${projectId}${path}`;
    };

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
                    {/* Hardcode the Project Hub button purely for the hub */}
                    <NavLink to="/overview" className={({ isActive }) => `sidebar-link${isActive && !projectId ? ' active' : ''}`}>
                        <FolderOpen />
                        <span>All Projects</span>
                    </NavLink>

                    {navItems.slice(0, 3).map((item) => (
                        <NavLink
                            key={item.to}
                            to={buildPath(item.to)}
                            className={({ isActive }) =>
                                `sidebar-link${isActive && projectId ? ' active' : ''}`
                            }
                            onClick={e => !projectId && e.preventDefault()}
                            style={{ opacity: projectId ? 1 : 0.5 }}
                        >
                            <item.icon />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}

                    <div className="sidebar-section-title">Intelligence</div>
                    {navItems.slice(3, 5).map((item) => (
                        <NavLink
                            key={item.to}
                            to={buildPath(item.to)}
                            className={({ isActive }) =>
                                `sidebar-link${isActive && projectId ? ' active' : ''}`
                            }
                            onClick={e => !projectId && e.preventDefault()}
                            style={{ opacity: projectId ? 1 : 0.5 }}
                        >
                            <item.icon />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}

                    <div className="sidebar-section-title">Account</div>
                    {navItems.slice(5).map((item) => (
                        <NavLink
                            key={item.to}
                            to={buildPath(item.to)}
                            className={({ isActive }) =>
                                `sidebar-link${isActive && projectId ? ' active' : ''}`
                            }
                            onClick={e => !projectId && e.preventDefault()}
                            style={{ opacity: projectId ? 1 : 0.5 }}
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

                {/* GitHub connect nudge — shown for email/password users who haven't connected GitHub */}
                {user && user.githubConnected === false && !githubBannerDismissed && (
                    <div className="github-connect-banner">
                        <Github size={15} className="github-banner-icon" />
                        <span className="github-banner-text">
                            Connect GitHub to unlock the Codebase Agent — your AI reads your code for smarter marketing.
                        </span>
                        <button
                            className="github-banner-btn"
                            onClick={() => navigate(projectId ? `/project/${projectId}/settings` : '/settings')}
                        >
                            Connect GitHub →
                        </button>
                        <button
                            className="github-banner-close"
                            title="Dismiss"
                            onClick={() => setGithubBannerDismissed(true)}
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}

                {/* Page sub-header slot — rendered here so it never enters the scroll container.
                    Pages set this via setSubHeader from useOutletContext(). */}
                {subHeader && (
                    <div className="page-sub-header-slot">
                        {subHeader}
                    </div>
                )}

                <main className="main-content">
                    <Outlet context={{ user, mode, setSubHeader }} />
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
