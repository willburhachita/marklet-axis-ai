import { useState } from 'react';
import {
    Sparkles, Copy, RefreshCw, Send, Check, Clock,
    Twitter, Linkedin, MessageCircle, Smartphone, Mail,
    FileText, Rocket, Globe,
} from 'lucide-react';
import { mockContents, contentTypes } from '../data/mockData';

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
    const diff = Date.now() - ts;
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 1) return 'Just now';
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function ContentStudio({ mode }) {
    const [selectedType, setSelectedType] = useState('twitter_thread');
    const [activeTab, setActiveTab] = useState('create');
    const [copied, setCopied] = useState(false);
    const [generating, setGenerating] = useState(false);

    const selectedContent = mockContents.find((c) => c.type === selectedType) || mockContents[0];

    const handleCopy = () => {
        navigator.clipboard.writeText(selectedContent.body);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleGenerate = () => {
        setGenerating(true);
        setTimeout(() => setGenerating(false), 2000);
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Content Studio</h1>
                    <p>Generate and manage marketing content across platforms</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
                        <Sparkles size={16} />
                        {generating ? 'Generating...' : 'Generate All'}
                    </button>
                </div>
            </div>

            <div className="tabs">
                <button className={`tab${activeTab === 'create' ? ' active' : ''}`} onClick={() => setActiveTab('create')}>
                    Create
                </button>
                <button className={`tab${activeTab === 'history' ? ' active' : ''}`} onClick={() => setActiveTab('history')}>
                    History ({mockContents.length})
                </button>
            </div>

            {activeTab === 'create' && (
                <>
                    {/* Content type selector with Lucide icons */}
                    <div className="content-type-grid mb-6">
                        {contentTypes.map((type) => {
                            const IconComp = iconMap[type.iconName] || FileText;
                            return (
                                <div
                                    key={type.id}
                                    className={`content-type-card${selectedType === type.id ? ' selected' : ''}`}
                                    onClick={() => setSelectedType(type.id)}
                                >
                                    <div className="content-type-card-icon">
                                        <IconComp size={22} />
                                    </div>
                                    <div className="content-type-card-label">{type.label}</div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Editor */}
                    <div className="editor-area">
                        <div className="editor-toolbar">
                            <div className="editor-toolbar-left">
                                <span style={{ fontSize: '0.813rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                    {selectedContent.title}
                                </span>
                                {statusBadge(selectedContent.status)}
                            </div>
                            <div className="editor-toolbar-right">
                                <button className="btn btn-ghost btn-sm" onClick={() => handleGenerate()}>
                                    <RefreshCw size={14} /> Regenerate
                                </button>
                                <button className="btn btn-ghost btn-sm" onClick={handleCopy}>
                                    {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                                </button>
                                {mode === 'assist' ? (
                                    <button className="btn btn-primary btn-sm">
                                        <Send size={14} /> Post
                                    </button>
                                ) : (
                                    <button className="btn btn-primary btn-sm">
                                        <Clock size={14} /> Auto-queue
                                    </button>
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
                            ) : (
                                selectedContent.body
                            )}
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'history' && (
                <div className="card">
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
                                {mockContents.map((c) => (
                                    <tr key={c._id}>
                                        <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.title}</td>
                                        <td>{c.type.replace(/_/g, ' ')}</td>
                                        <td>{c.platform}</td>
                                        <td>{statusBadge(c.status)}</td>
                                        <td>{timeAgo(c.createdAt)}</td>
                                        <td>
                                            <button className="btn btn-ghost btn-sm">View</button>
                                        </td>
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
