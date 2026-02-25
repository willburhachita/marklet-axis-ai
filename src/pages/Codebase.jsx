import { useState } from 'react';
import { RefreshCw, GitBranch, Package, Globe, Shield, ExternalLink } from 'lucide-react';
import { mockGithubRepos, mockCodebaseAnalysis } from '../data/mockData';

export default function Codebase() {
    const [activeTab, setActiveTab] = useState('overview');
    const repo = mockGithubRepos[0];
    const analysis = mockCodebaseAnalysis;

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Codebase Analysis</h1>
                    <p>AI-powered insights from your GitHub repository</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-secondary">
                        <GitBranch size={16} /> Change repo
                    </button>
                    <button className="btn btn-primary">
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
                            <span className="badge badge-info">{repo.language}</span>
                        </div>
                        <div style={{ fontSize: '0.813rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {repo.description}
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
                            {analysis.techStack.map((tech) => (
                                <span key={tech} className="tech-stack-tag">{tech}</span>
                            ))}
                        </div>
                    </div>

                    <div className="grid-3 stagger">
                        <div className="stat-card animate-fade-in">
                            <div className="stat-card-icon info"><Package size={18} /></div>
                            <div className="stat-card-value">{analysis.dependencies.length}</div>
                            <div className="stat-card-label">Dependencies</div>
                        </div>
                        <div className="stat-card animate-fade-in">
                            <div className="stat-card-icon primary"><Globe size={18} /></div>
                            <div className="stat-card-value">{analysis.endpoints?.length || 0}</div>
                            <div className="stat-card-label">API Endpoints</div>
                        </div>
                        <div className="stat-card animate-fade-in">
                            <div className="stat-card-icon warning"><Shield size={18} /></div>
                            <div className="stat-card-value">{analysis.legalRequirements.length}</div>
                            <div className="stat-card-label">Legal Docs Needed</div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'features' && (
                <div className="card animate-fade-in">
                    <div className="card-header">
                        <div className="card-title">Detected Features ({analysis.features.length})</div>
                    </div>
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
                </div>
            )}

            {activeTab === 'dependencies' && (
                <div className="card animate-fade-in">
                    <div className="card-header">
                        <div className="card-title">Dependencies ({analysis.dependencies.length})</div>
                    </div>
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
                </div>
            )}

            {activeTab === 'structure' && (
                <div className="card animate-fade-in">
                    <div className="card-header">
                        <div className="card-title">File Structure</div>
                    </div>
                    <div className="code-file-tree">
                        <pre style={{ margin: 0 }}>{analysis.fileStructure}</pre>
                    </div>
                </div>
            )}

            {activeTab === 'legal' && (
                <div className="card animate-fade-in">
                    <div className="card-header">
                        <div className="card-title">Legal Requirements Detected</div>
                        <div className="card-subtitle">Based on codebase analysis</div>
                    </div>
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
                                        <td><button className="btn btn-primary btn-sm">Generate</button></td>
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
