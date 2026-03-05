import { useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { RefreshCw, GitBranch, Package, Globe, Shield, ExternalLink, Loader2 } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api.js';

export default function Codebase() {
    const { user } = useOutletContext();
    const [activeTab, setActiveTab] = useState('overview');

    // Real data from Convex
    const profile = useQuery(
        api.appProfiles.getById,
        projectId ? { profileId: projectId } : 'skip'
    );
    const repos = useQuery(
        api.githubRepos.getByProfile,
        profile ? { appProfileId: profile._id } : 'skip'
    );
    const analysis = useQuery(
        api.codebaseAnalysis.getByProfile,
        profile ? { appProfileId: profile._id } : 'skip'
    );

    console.log('[Codebase] Data:', {
        profileId: profile?._id,
        reposCount: repos?.length,
        hasAnalysis: !!analysis,
    });

    if (!user || profile === undefined || repos === undefined) {
        return (
            <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <Loader2 size={32} className="onboarding-gen-spin" />
            </div>
        );
    }

    const repo = repos?.[0];

    if (!repo) {
        return (
            <div className="animate-fade-in">
                <div className="page-header">
                    <div className="page-header-left">
                        <h1>Codebase Analysis</h1>
                        <p>AI-powered insights from your GitHub repository</p>
                    </div>
                </div>
                <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                    <GitBranch size={48} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)', opacity: 0.6 }} />
                    <h3 style={{ marginBottom: 'var(--space-2)' }}>No repository connected</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                        Connect your GitHub repository to generate product-aware marketing strategies.
                    </p>
                    <button className="btn btn-primary" onClick={() => alert('Future Implementation: GitHub OAuth Connection')}>
                        <GitBranch size={16} /> Connect Repository
                    </button>
                </div>
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="animate-fade-in">
                <div className="page-header">
                    <div className="page-header-left">
                        <h1>Codebase Analysis</h1>
                        <p>AI-powered insights from your GitHub repository</p>
                    </div>
                    <div className="page-header-actions">
                        <button className="btn btn-secondary" onClick={() => alert('Future Implementation: Change Repo')}>
                            <GitBranch size={16} /> Change repo
                        </button>
                        <button className="btn btn-primary" onClick={() => alert('Future Implementation: Codebase analysis agent not yet hooked up')}>
                            <RefreshCw size={16} /> Analyze Codebase
                        </button>
                    </div>
                </div>
                {/* Repo info */}
                <div className="card mb-6">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: 'var(--radius-lg)',
                            background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <GitBranch size={24} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{repo.repoName}</span>
                                <span className="badge badge-default">{repo.defaultBranch}</span>
                                {repo.language && <span className="badge badge-info">{repo.language}</span>}
                            </div>
                            <div style={{ fontSize: '0.813rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                {repo.description || 'No description provided'}
                            </div>
                        </div>
                        <a href={repo.repoUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                            <ExternalLink size={14} /> View on GitHub
                        </a>
                    </div>
                </div>
                <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                    <Shield size={48} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)', opacity: 0.6 }} />
                    <h3 style={{ marginBottom: 'var(--space-2)' }}>Analysis Pending</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                        Your repository is connected but hasn't been analyzed yet.
                    </p>
                    <button className="btn btn-primary" onClick={() => alert('Future Implementation: Codebase analysis agent not yet hooked up')}>
                        <RefreshCw size={16} /> Run Analysis
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Codebase Analysis</h1>
                    <p>AI-powered insights from your GitHub repository</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-secondary" onClick={() => alert('Future Implementation: Change Repo')}>
                        <GitBranch size={16} /> Change repo
                    </button>
                    <button className="btn btn-primary" onClick={() => alert('Future Implementation: Run Re-analyze Agent')}>
                        <RefreshCw size={16} /> Re-analyze
                    </button>
                </div>
            </div>

            {/* Repo info */}
            <div className="card mb-6">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 'var(--radius-lg)',
                        background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <GitBranch size={24} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{repo.repoName}</span>
                            <span className="badge badge-default">{repo.defaultBranch}</span>
                            {repo.language && <span className="badge badge-info">{repo.language}</span>}
                        </div>
                        <div style={{ fontSize: '0.813rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {repo.description || 'No description provided'}
                        </div>
                    </div>
                    <a href={repo.repoUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                        <ExternalLink size={14} /> View on GitHub
                    </a>
                </div>
            </div>

            <div className="tabs">
                {['overview', 'features', 'dependencies', 'structure', 'legal'].map((tab) => (
                    <button
                        key={tab}
                        className={`tab${activeTab === tab ? ' active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className="stagger">
                    <div className="card animate-fade-in mb-4">
                        <div className="card-header"><div className="card-title">Tech Stack</div></div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                            {(analysis.techStack || []).map((tech) => (
                                <span key={tech} className="tech-stack-tag">{tech}</span>
                            ))}
                        </div>
                    </div>

                    <div className="grid-3 stagger">
                        <div className="stat-card animate-fade-in">
                            <div className="stat-card-icon info"><Package size={18} /></div>
                            <div className="stat-card-value">{analysis.dependencies?.length || 0}</div>
                            <div className="stat-card-label">Dependencies</div>
                        </div>
                        <div className="stat-card animate-fade-in">
                            <div className="stat-card-icon primary"><Globe size={18} /></div>
                            <div className="stat-card-value">{analysis.endpoints?.length || 0}</div>
                            <div className="stat-card-label">API Endpoints</div>
                        </div>
                        <div className="stat-card animate-fade-in">
                            <div className="stat-card-icon warning"><Shield size={18} /></div>
                            <div className="stat-card-value">{analysis.legalRequirements?.length || 0}</div>
                            <div className="stat-card-label">Legal Docs Needed</div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'features' && (
                <div className="card animate-fade-in">
                    <div className="card-header">
                        <div className="card-title">Detected Features ({(analysis.features || []).length})</div>
                    </div>
                    {(analysis.features || []).length > 0 ? (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr><th>Feature</th><th>Description</th><th>Category</th></tr>
                                </thead>
                                <tbody>
                                    {analysis.features.map((f, i) => (
                                        <tr key={i}>
                                            <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{f.name}</td>
                                            <td>{f.description}</td>
                                            <td><span className="badge badge-default">{f.category}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-6)' }}>No features detected.</p>
                    )}
                </div>
            )}

            {activeTab === 'dependencies' && (
                <div className="card animate-fade-in">
                    <div className="card-header">
                        <div className="card-title">Dependencies ({(analysis.dependencies || []).length})</div>
                    </div>
                    {(analysis.dependencies || []).length > 0 ? (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr><th>Package</th><th>Version</th><th>Type</th></tr>
                                </thead>
                                <tbody>
                                    {analysis.dependencies.map((d, i) => (
                                        <tr key={i}>
                                            <td style={{ color: 'var(--text-primary)', fontWeight: 500, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem' }}>{d.name}</td>
                                            <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem' }}>{d.version}</td>
                                            <td><span className={`badge ${d.type === 'production' ? 'badge-info' : 'badge-default'}`}>{d.type}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-6)' }}>No dependencies detected.</p>
                    )}
                </div>
            )}

            {activeTab === 'structure' && (
                <div className="card animate-fade-in">
                    <div className="card-header">
                        <div className="card-title">File Structure</div>
                    </div>
                    {analysis.fileStructure ? (
                        <div className="code-file-tree">
                            <pre style={{ margin: 0, overflowX: 'auto' }}>{analysis.fileStructure}</pre>
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-6)' }}>No file structure detected.</p>
                    )}
                </div>
            )}

            {activeTab === 'legal' && (
                <div className="card animate-fade-in">
                    <div className="card-header">
                        <div className="card-title">Legal Requirements Detected</div>
                        <div className="card-subtitle">Based on codebase analysis</div>
                    </div>
                    {(analysis.legalRequirements || []).length > 0 ? (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr><th>Document</th><th>Reason</th><th>Severity</th><th>Action</th></tr>
                                </thead>
                                <tbody>
                                    {analysis.legalRequirements.map((req, i) => (
                                        <tr key={i}>
                                            <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{req.documentType}</td>
                                            <td>{req.reason}</td>
                                            <td>
                                                <span className={`badge ${req.severity === 'required' ? 'badge-error' : req.severity === 'recommended' ? 'badge-warning' : 'badge-default'}`}>
                                                    {req.severity}
                                                </span>
                                            </td>
                                            <td><button className="btn btn-primary btn-sm" onClick={() => alert('Feature hookup to Legal Agent needed.')}>Generate</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-6)' }}>No legal requirements detected.</p>
                    )}
                </div>
            )}
        </div>
    );
}
