import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Target, Github, Loader2, Rocket, Plus, FolderOpen } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api.js';

export default function ProjectHub() {
    const { user } = useOutletContext();
    const navigate = useNavigate();
    const [showImportModal, setShowImportModal] = useState(false);
    const [importUrl, setImportUrl] = useState('');
    const [isImporting, setIsImporting] = useState(false);

    // Get all profiles for user
    const profiles = useQuery(
        api.appProfiles.getAllByUser,
        user ? { userId: user._id } : 'skip'
    );

    const importProject = useMutation(api.appProfiles.importProject);

    if (!user || profiles === undefined) {
        return (
            <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <Loader2 size={32} className="onboarding-gen-spin" />
            </div>
        );
    }

    const handleImportProject = async () => {
        setIsImporting(true);
        try {
            const profileId = await importProject({ userId: user._id, repoUrl: importUrl });
            setIsImporting(false);
            setShowImportModal(false);
            setImportUrl('');

            // Navigate directly to the AI Wizard setup flow
            navigate(`/project/${profileId}/wizard`);
        } catch (err) {
            console.error('Import failed', err);
            setIsImporting(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Projects</h1>
                    <p>Select a project to access its marketing dashboard</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-primary" onClick={() => setShowImportModal(true)}>
                        <Plus size={16} /> Import New Project
                    </button>
                </div>
            </div>

            {profiles.length === 0 ? (
                <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                    <FolderOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)', opacity: 0.6 }} />
                    <h3 style={{ marginBottom: 'var(--space-2)' }}>No projects found</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                        Import your GitHub repository and let AI construct your entire marketing layout.
                    </p>
                    <button className="btn btn-primary" onClick={() => setShowImportModal(true)}>
                        <Github size={16} /> Import Project
                    </button>
                </div>
            ) : (
                <div className="grid-3 stagger">
                    {profiles.map(p => (
                        <div
                            key={p._id}
                            className="card animate-fade-in"
                            style={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}
                            onClick={() => {
                                // If it's a shell project (no name), route it to wizard, otherwise overview
                                if (p.appName === "Importing...") {
                                    navigate(`/project/${p._id}/wizard`);
                                } else {
                                    navigate(`/project/${p._id}/overview`);
                                }
                            }}
                        >
                            <div className="card-header">
                                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    {p.appName === "Importing..." ? <Loader2 size={16} className="onboarding-gen-spin" /> : <Rocket size={16} />}
                                    {p.appName}
                                </div>
                                <span className={`badge ${p.appName === 'Importing...' ? 'badge-warning' : 'badge-default'}`}>
                                    {p.appName === 'Importing...' ? 'Setup Pending' : p.stage}
                                </span>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.813rem', marginTop: 'var(--space-2)' }}>
                                {p.appUrl || 'No Repository Linked'}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* GitHub Import Modal */}
            {showImportModal && (
                <div className="modal-overlay" onClick={() => !isImporting && setShowImportModal(false)} style={{ zIndex: 9999 }}>
                    <div className="modal-card animate-fade-in" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 450 }}>
                        <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Github size={20} /> Import New Project
                        </h3>
                        <p className="modal-body" style={{ color: 'var(--text-muted)' }}>
                            Connect a GitHub repository. Our AI will analyze your codebase to automatically understand your product and generate a tailored marketing plan.
                        </p>
                        <div style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                            <label className="input-label">Repository URL</label>
                            <input
                                className="input-field"
                                placeholder="https://github.com/username/repo"
                                value={importUrl}
                                onChange={e => setImportUrl(e.target.value)}
                                disabled={isImporting}
                            />
                        </div>
                        <div className="modal-actions" style={{ justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                            <button className="btn btn-ghost" onClick={() => setShowImportModal(false)} disabled={isImporting}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleImportProject} disabled={!importUrl || isImporting}>
                                {isImporting ? <Loader2 className="onboarding-gen-spin" size={16} /> : <Github size={16} />}
                                {isImporting ? 'Analyzing...' : 'Import & Analyze'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
