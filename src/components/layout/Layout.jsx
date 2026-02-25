import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Target, PenTool, Rocket, Code2,
    FolderOpen, Settings, Hand, Bot, Bell, Search,
} from 'lucide-react';
import { mockUser } from '../../data/mockData';

const navItems = [
    { to: '/overview', label: 'Overview', icon: LayoutDashboard },
    { to: '/strategy', label: 'Strategy', icon: Target },
    { to: '/content', label: 'Content Studio', icon: PenTool },
    { to: '/launch', label: 'Launch Kit', icon: Rocket },
    { to: '/codebase', label: 'Codebase', icon: Code2 },
    { to: '/resources', label: 'Resources', icon: FolderOpen, badge: '5' },
    { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout({ mode, setMode }) {
    const location = useLocation();

    const currentPage = navItems.find(
        (item) => location.pathname.startsWith(item.to)
    );

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="sidebar-logo-icon">M</div>
                        <span>MarketAxis</span>
                    </div>
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
                            {item.badge && <span className="sidebar-badge">{item.badge}</span>}
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
                            {item.badge && <span className="sidebar-badge">{item.badge}</span>}
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
                    <div className="sidebar-user">
                        <div className="sidebar-user-avatar">
                            {mockUser.name.charAt(0)}
                        </div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{mockUser.name}</div>
                            <div className="sidebar-user-plan">{mockUser.plan} plan</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
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
                                onClick={() => setMode('assist')}
                            >
                                <Hand size={14} />
                                Assist
                            </button>
                            <button
                                className={`mode-toggle-option${mode === 'autopilot' ? ' active' : ''}`}
                                onClick={() => setMode('autopilot')}
                            >
                                <Bot size={14} />
                                Autopilot
                            </button>
                        </div>

                        <button className="btn-icon" title="Search">
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
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
