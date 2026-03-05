import { useState } from 'react';
import { useOutletContext, useParams, useLocation } from 'react-router-dom';
import {
    Sparkles, Copy, RefreshCw, Send, Check, Clock,
    Twitter, Linkedin, MessageCircle, Smartphone, Mail,
    FileText, Rocket, Globe, Loader2,
} from 'lucide-react';
import { useQuery, useAction, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api.js';

const CONTENT_TYPES = [
    { id: 'twitter_thread', label: 'X Thread', iconName: 'twitter', platform: 'twitter' },
    { id: 'linkedin_post', label: 'LinkedIn', iconName: 'linkedin', platform: 'linkedin' },
    { id: 'reddit_post', label: 'Reddit', iconName: 'messageCircle', platform: 'reddit' },
    { id: 'app_store_desc', label: 'App Store', iconName: 'smartphone', platform: 'app_store' },
    { id: 'email_campaign', label: 'Email', iconName: 'mail', platform: 'email' },
    { id: 'blog_post', label: 'Blog', iconName: 'fileText', platform: 'blog' },
    { id: 'product_hunt', label: 'Product Hunt', iconName: 'rocket', platform: 'product_hunt' },
    { id: 'landing_page', label: 'Landing Page', iconName: 'globe', platform: 'web' },
];

const iconMap = {
    twitter: Twitter,
    linkedin: Linkedin,
    messageCircle: MessageCircle,
    smartphone: Smartphone,
    mail: Mail,
    fileText: FileText,
    rocket: Rocket,
    globe: Globe,
};

function statusBadge(status) {
    const map = {
        draft: 'badge-default',
        approved: 'badge-info',
        scheduled: 'badge-warning',
        posted: 'badge-success',
        failed: 'badge-error',
    };
    return <span className={`badge ${map[status] || 'badge-default'}`}>{status}</span>;
}

function timeAgo(ts) {
    if (!ts) return '—';
    const diff = Date.now() - ts;
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 1) return 'Just now';
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function ContentStudio() {
    const { user, mode } = useOutletContext();
    const { projectId } = useParams();
    const location = useLocation();
    const [selectedType, setSelectedType] = useState('twitter_thread');
    const [activeTab, setActiveTab] = useState('create');
    const [copied, setCopied] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [genError, setGenError] = useState('');

    // Pre-select tab if passed from quick actions, else 'all'
    useState(() => {
        if (location.state?.selectedType) {
            setSelectedType(location.state.selectedType);
        }
    });

    // Real data from Convex
    const profile = useQuery(
        api.appProfiles.getById,
        projectId ? { profileId: projectId } : 'skip'
    );
    const contents = useQuery(
        api.contents.getByProfile,
        profile ? { appProfileId: profile._id } : 'skip'
    );

    const generateContent = useAction(api.agentActions.generateContent);
    const updateContentStatus = useMutation(api.contents.updateStatus);
    const updateContentBody = useMutation(api.contents.updateBody);

    console.log('[ContentStudio] Data:', {
        profileId: profile?._id,
        contentsCount: contents?.length,
        selectedType,
        activeTab,
    });

    const selectedContent = (contents || []).find((c) => c.type === selectedType) || null;

    const handleCopy = () => {
        if (!selectedContent) return;
        console.log('[ContentStudio] Copying content:', selectedContent._id);
        navigator.clipboard.writeText(selectedContent.body);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleGenerate = async (type = selectedType) => {
        if (!profile || !user) return;
        const ct = CONTENT_TYPES.find((c) => c.id === type);
        console.log('[ContentStudio] Generating content:', type, ct?.platform);
        setGenerating(true);
        setGenError('');
        try {
            const result = await generateContent({
                appProfileId: profile._id,
                userId: user._id,
                contentType: type,
                platform: ct?.platform || type,
            });
            console.log('[ContentStudio] Generation result:', result);
            if (!result.success) {
                setGenError(result.error || 'Generation failed');
            }
        } catch (err) {
            console.error('[ContentStudio] Generation error:', err);
            setGenError(err?.message || 'Failed to generate');
        }
        setGenerating(false);
    };

    const handleGenerateAll = async () => {
        if (!profile || !user) return;
        console.log('[ContentStudio] Generating all content types');
        setGenerating(true);
        setGenError('');
        for (const ct of CONTENT_TYPES) {
            try {
                console.log('[ContentStudio] Generating:', ct.id);
                await generateContent({
                    appProfileId: profile._id,
                    userId: user._id,
                    contentType: ct.id,
                    platform: ct.platform,
                });
            } catch (err) {
                console.error('[ContentStudio] Failed to generate', ct.id, err);
            }
        }
        setGenerating(false);
    };

    // Loading
    if (!user || profile === undefined) {
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
                    <h1>Content Studio</h1>
                    <p>Generate and manage marketing content across platforms</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-primary" onClick={handleGenerateAll} disabled={generating}>
                        <Sparkles size={16} />
                        {generating ? 'Generating...' : 'Generate All'}
                    </button>
                </div>
            </div>

            {genError && (
                <div style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-4)', background: 'var(--error-muted)', color: 'var(--error)', borderRadius: 'var(--radius-md)', fontSize: '0.813rem' }}>
                    ⚠️ {genError}
                </div>
            )}

            <div className="tabs">
                <button className={`tab${activeTab === 'create' ? ' active' : ''}`} onClick={() => setActiveTab('create')}>
                    Create
                </button>
                <button className={`tab${activeTab === 'history' ? ' active' : ''}`} onClick={() => setActiveTab('history')}>
                    History ({contents?.length ?? 0})
                </button>
            </div>

            {activeTab === 'create' && (
                <>
                    {/* Content type selector */}
                    <div className="content-type-grid mb-6">
                        {CONTENT_TYPES.map((type) => {
                            const IconComp = iconMap[type.iconName] || FileText;
                            const hasContent = (contents || []).some((c) => c.type === type.id);
                            return (
                                <div
                                    key={type.id}
                                    className={`content-type-card${selectedType === type.id ? ' selected' : ''}`}
                                    onClick={() => { setSelectedType(type.id); console.log('[ContentStudio] Selected type:', type.id); }}
                                >
                                    <div className="content-type-card-icon">
                                        <IconComp size={22} />
                                    </div>
                                    <div className="content-type-card-label">{type.label}</div>
                                    {hasContent && <span className="dot dot-success" style={{ position: 'absolute', top: 8, right: 8 }} />}
                                </div>
                            );
                        })}
                    </div>

                    {/* Editor */}
                    <div className="editor-area">
                        <div className="editor-toolbar">
                            <div className="editor-toolbar-left">
                                <span style={{ fontSize: '0.813rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                    {selectedContent?.title || 'No content generated yet'}
                                </span>
                                {selectedContent && statusBadge(selectedContent.status)}
                            </div>
                            <div className="editor-toolbar-right">
                                <button className="btn btn-ghost btn-sm" onClick={() => handleGenerate()} disabled={generating}>
                                    <RefreshCw size={14} className={generating ? 'onboarding-gen-spin' : ''} />
                                    {generating ? 'Generating...' : selectedContent ? 'Regenerate' : 'Generate'}
                                </button>
                                {selectedContent && (
                                    <>
                                        <button className="btn btn-ghost btn-sm" onClick={handleCopy}>
                                            {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                                        </button>
                                        {mode === 'assist' ? (
                                            <button className="btn btn-primary btn-sm" onClick={() => {
                                                console.log('[ContentStudio] Approving content:', selectedContent._id);
                                                updateContentStatus({ contentId: selectedContent._id, status: 'approved' });
                                            }}>
                                                <Check size={14} /> Approve
                                            </button>
                                        ) : (
                                            <button className="btn btn-primary btn-sm" onClick={() => {
                                                console.log('[ContentStudio] Scheduling content:', selectedContent._id);
                                                updateContentStatus({ contentId: selectedContent._id, status: 'scheduled' });
                                            }}>
                                                <Clock size={14} /> Auto-queue
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="editor-body">
                            {generating ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                    <div className="skeleton" style={{ height: 16, width: '80%' }} />
                                    <div className="skeleton" style={{ height: 16, width: '100%' }} />
                                    <div className="skeleton" style={{ height: 16, width: '90%' }} />
                                    <div className="skeleton" style={{ height: 16, width: '70%' }} />
                                    <div className="skeleton" style={{ height: 16, width: '95%' }} />
                                </div>
                            ) : selectedContent ? (
                                <div style={{ whiteSpace: 'pre-wrap' }}>{selectedContent.body}</div>
                            ) : (
                                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-6)' }}>
                                    Click "Generate" to create {CONTENT_TYPES.find(t => t.id === selectedType)?.label || selectedType} content
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'history' && (
                <div className="card">
                    {contents && contents.length > 0 ? (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Type</th>
                                        <th>Platform</th>
                                        <th>Status</th>
                                        <th>Created</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contents.map((c) => (
                                        <tr key={c._id}>
                                            <td style={{ color: 'var(--text-primary)', fontWeight: 500, cursor: 'pointer' }}
                                                onClick={() => { setSelectedType(c.type); setActiveTab('create'); }}>
                                                {c.title}
                                            </td>
                                            <td>{c.type.replace(/_/g, ' ')}</td>
                                            <td>{c.platform}</td>
                                            <td>{statusBadge(c.status)}</td>
                                            <td>{timeAgo(c.createdAt)}</td>
                                            <td>
                                                <button className="btn btn-ghost btn-sm" onClick={() => {
                                                    setSelectedType(c.type);
                                                    setActiveTab('create');
                                                }}>View</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No content generated yet. Use the Create tab to generate your first piece.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
