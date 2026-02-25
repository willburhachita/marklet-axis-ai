import { useState } from 'react';
import { FileText, Download, Edit3, Eye, Plus, Scale, BookOpen, Shield } from 'lucide-react';
import { mockResources } from '../data/mockData';

const categoryIcons = {
    legal: { icon: Scale, color: 'error' },
    marketing: { icon: BookOpen, color: 'primary' },
    technical: { icon: Shield, color: 'info' },
    other: { icon: FileText, color: 'default' },
};

export default function Resources() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [viewingDoc, setViewingDoc] = useState(null);

    const categories = ['all', 'legal', 'marketing', 'technical'];
    const filtered = activeCategory === 'all'
        ? mockResources
        : mockResources.filter((r) => r.category === activeCategory);

    const viewing = viewingDoc ? mockResources.find((r) => r._id === viewingDoc) : null;

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Resources</h1>
                    <p>Generated documents, legal files, and brand assets</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-primary">
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
                        {cat === 'all' ? `All (${mockResources.length})` : `${cat.charAt(0).toUpperCase() + cat.slice(1)} (${mockResources.filter((r) => r.category === cat).length})`}
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
                            <button className="btn btn-secondary btn-sm"><Download size={14} /> Download</button>
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
                                        <button className="btn-icon" onClick={(e) => e.stopPropagation()}>
                                            <Download size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
