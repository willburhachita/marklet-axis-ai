import { useState } from 'react';
import { useLocation, useOutletContext, useParams } from 'react-router-dom';
import { FileText, Download, Edit3, Eye, Plus, Scale, BookOpen, Shield, Loader2, X } from 'lucide-react';
import { useQuery, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api.js';

const categoryIcons = {
    legal: { icon: Scale, color: 'error' },
    marketing: { icon: BookOpen, color: 'primary' },
    technical: { icon: Shield, color: 'info' },
    other: { icon: FileText, color: 'default' },
};

const DOC_TYPES = [
    { id: 'privacy_policy', label: 'Privacy Policy' },
    { id: 'terms_of_service', label: 'Terms of Service' },
    { id: 'cookie_policy', label: 'Cookie Policy' },
    { id: 'gdpr_compliance', label: 'GDPR Compliance' },
    { id: 'ccpa_compliance', label: 'CCPA Compliance' },
];

export default function Resources() {
    const { user } = useOutletContext();
    const { projectId } = useParams();
    const [activeCategory, setActiveCategory] = useState('all');
    const [viewingDoc, setViewingDoc] = useState(null);
    const [showGenModal, setShowGenModal] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [genError, setGenError] = useState('');

    // Real data from Convex
    const profile = useQuery(
        api.appProfiles.getById,
        projectId ? { profileId: projectId } : 'skip'
    );
    const resources = useQuery(
        api.resources.getByProfile,
        profile ? { appProfileId: profile._id } : 'skip'
    );

    const generateLegalDocument = useAction(api.agentActions.generateLegalDocument);

    console.log('[Resources] Data:', {
        profileId: profile?._id,
        resourcesCount: resources?.length,
    });

    // Loading
    if (!user || profile === undefined || resources === undefined) {
        return (
            <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <Loader2 size={32} className="onboarding-gen-spin" />
            </div>
        );
    }

    const categories = ['all', 'legal', 'marketing', 'technical'];
    const filtered = activeCategory === 'all'
        ? resources
        : resources.filter((r) => r.category === activeCategory);

    const viewing = viewingDoc ? resources.find((r) => r._id === viewingDoc) : null;

    const handleGenerate = async (docType) => {
        if (!profile || !user) return;
        console.log('[Resources] Generating legal document:', docType);
        setGenerating(true);
        setGenError('');
        try {
            const result = await generateLegalDocument({
                appProfileId: profile._id,
                userId: user._id,
                documentType: docType,
            });
            console.log('[Resources] Generation result:', result);
            if (!result.success) setGenError(result.error || 'Generation failed');
            if (result.success) setShowGenModal(false);
        } catch (err) {
            console.error('[Resources] Generation error:', err);
            setGenError(err?.message || 'Failed to generate');
        }
        setGenerating(false);
    };

    const handleDownload = (doc) => {
        const textToSave = doc.body;
        const blob = new Blob([textToSave], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${doc.title.replace(/\s+/g, '_').toLowerCase()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Resources</h1>
                    <p>Generated documents, legal files, and brand assets</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-primary" onClick={() => setShowGenModal(true)}>
                        <Plus size={16} /> Generate document
                    </button>
                </div>
            </div>

            {/* Category filter */}
            <div className="tabs">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        className={`tab${activeCategory === cat ? ' active' : ''}`}
                        onClick={() => { setActiveCategory(cat); setViewingDoc(null); }}
                    >
                        {cat === 'all' ? `All (${resources.length})` : `${cat.charAt(0).toUpperCase() + cat.slice(1)} (${resources.filter((r) => r.category === cat).length})`}
                    </button>
                ))}
            </div>

            {viewingDoc && viewing ? (
                /* Document viewer */
                <div className="doc-viewer animate-fade-in">
                    <div className="doc-viewer-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => setViewingDoc(null)}>← Back</button>
                            <span style={{ fontSize: '0.938rem', fontWeight: 600, color: 'var(--text-primary)' }}>{viewing.title}</span>
                            <span className={`badge ${viewing.status === 'final' ? 'badge-success' : 'badge-default'}`}>{viewing.status}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <button className="btn btn-ghost btn-sm"><Edit3 size={14} /> Edit</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleDownload(viewing)}><Download size={14} /> Download</button>
                        </div>
                    </div>
                    <div className="doc-viewer-body">
                        {viewing.body.split('\n\n').map((paragraph, i) => {
                            if (paragraph.match(/^\d+\./)) {
                                return <h2 key={i}>{paragraph}</h2>;
                            }
                            return <p key={i}>{paragraph}</p>;
                        })}
                    </div>
                </div>
            ) : (
                /* Resource cards grid */
                <>
                    {filtered.length > 0 ? (
                        <div className="grid-auto stagger">
                            {filtered.map((resource) => {
                                const catConfig = categoryIcons[resource.category] || categoryIcons.other;
                                const IconComp = catConfig.icon;
                                return (
                                    <div key={resource._id} className="resource-card animate-fade-in" onClick={() => setViewingDoc(resource._id)}>
                                        <div className="resource-card-header">
                                            <div className={`resource-card-icon`} style={{
                                                background: `var(--${catConfig.color}-muted)`,
                                                color: `var(--${catConfig.color})`,
                                            }}>
                                                <IconComp />
                                            </div>
                                            <span className={`badge ${resource.status === 'final' ? 'badge-success' : 'badge-default'}`}>
                                                {resource.status}
                                            </span>
                                        </div>
                                        <div className="resource-card-title">{resource.title}</div>
                                        <div className="resource-card-desc">
                                            {resource.body.slice(0, 120)}...
                                        </div>
                                        <div className="resource-card-footer">
                                            <span style={{ fontSize: '0.688rem', color: 'var(--text-muted)' }}>
                                                v{resource.version} • {resource.generatedBy.replace(/_/g, ' ')}
                                            </span>
                                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                                <button className="btn-icon" onClick={(e) => { e.stopPropagation(); setViewingDoc(resource._id); }}>
                                                    <Eye size={14} />
                                                </button>
                                                <button className="btn-icon" onClick={(e) => { e.stopPropagation(); handleDownload(resource); }}>
                                                    <Download size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', marginTop: 'var(--space-4)' }}>
                            <FileText size={48} style={{ color: 'var(--primary)', marginBottom: 'var(--space-4)', opacity: 0.6 }} />
                            <h3 style={{ marginBottom: 'var(--space-2)' }}>No resources found</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                                Generate legal documents, brand guidelines, and other assets.
                            </p>
                            <button className="btn btn-primary" onClick={() => setShowGenModal(true)}>
                                <Plus size={16} /> Generate document
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Generate Document Modal */}
            {showGenModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div className="card animate-fade-in" style={{ padding: 'var(--space-6)', width: '100%', maxWidth: 450 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                            <h3 style={{ margin: 0 }}>Generate Legal Document</h3>
                            <button className="btn-icon" onClick={() => !generating && setShowGenModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        {genError && (
                            <div style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-4)', background: 'var(--error-muted)', color: 'var(--error)', borderRadius: 'var(--radius-md)', fontSize: '0.813rem' }}>
                                ⚠️ {genError}
                            </div>
                        )}
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 'var(--space-4)' }}>
                            Select a document type to generate. Our Legal Agent will analyze your app profile and generate a draft.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxHeight: '300px', overflowY: 'auto' }}>
                            {DOC_TYPES.map((doc) => (
                                <button
                                    key={doc.id}
                                    className="btn btn-secondary"
                                    style={{ justifyContent: 'flex-start', padding: 'var(--space-3)' }}
                                    onClick={() => handleGenerate(doc.id)}
                                    disabled={generating}
                                >
                                    <Scale size={16} />
                                    <div style={{ textAlign: 'left', flex: 1 }}>
                                        <div style={{ fontWeight: 500 }}>{doc.label}</div>
                                    </div>
                                    {generating && <Loader2 size={14} className="onboarding-gen-spin" style={{ color: 'var(--text-muted)' }} />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
