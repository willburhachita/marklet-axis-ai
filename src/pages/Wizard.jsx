import { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import {
    Bot, ArrowRight, CheckCircle2, ChevronRight, Github, Code2,
    Target, PenTool, Share2, Rocket, Loader2
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api.js';

const WIZARD_STEPS = [
    { id: 'analyze', title: 'Codebase Analysis', icon: Code2 },
    { id: 'audience', title: 'Audience & Positioning', icon: Target },
    { id: 'channels', title: 'Integration Setup', icon: Share2 },
    { id: 'strategy', title: 'Generate Roadmap', icon: Rocket },
];

export default function Wizard() {
    const { projectId } = useParams();
    const { user } = useOutletContext();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(0);
    const [isProcessing, setIsProcessing] = useState(true);
    const [wizardData, setWizardData] = useState({
        appName: 'MarketAxis AI',
        description: 'Autonomous marketing team for developers',
        targetAudience: 'Indie Hackers & Founders',
        tagline: '',
        platforms: ['Twitter', 'Product Hunt'],
    });

    // We'd ideally pull the profile to get the repository URL being scanned
    const profile = useQuery(
        api.appProfiles.getById,
        projectId ? { profileId: projectId } : 'skip'
    );

    const updateProfile = useMutation(api.appProfiles.update);

    // Simulate Agent processing delays
    useEffect(() => {
        setIsProcessing(true);
        const timer = setTimeout(() => {
            setIsProcessing(false);
        }, 2000); // 2 second pause for effect between steps
        return () => clearTimeout(timer);
    }, [currentStep]);

    const handleNext = async () => {
        if (currentStep === WIZARD_STEPS.length - 1) {
            // Finalize: update the profile from "Importing..." to real data
            await updateProfile({
                profileId: projectId,
                appName: wizardData.appName,
                description: wizardData.description,
                targetAudience: wizardData.targetAudience,
                platforms: wizardData.platforms,
                stage: 'mvp',
            });
            // Proceed to the specific project dashboard
            navigate(`/project/${projectId}/overview`);
        } else {
            setCurrentStep((prev) => prev + 1);
        }
    };

    if (!profile) {
        return (
            <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <Loader2 size={32} className="onboarding-gen-spin" />
            </div>
        );
    }

    const stepInfo = WIZARD_STEPS[currentStep];

    return (
        <div className="animate-fade-in" style={{ maxWidth: 800, margin: '0 auto', paddingTop: 'var(--space-8)' }}>

            {/* Context Header */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, background: 'var(--primary-muted)', color: 'var(--primary)', borderRadius: '50%', marginBottom: 'var(--space-4)' }}>
                    <Bot size={24} />
                </div>
                <h2>Project Setup Assistant</h2>
                <p style={{ color: 'var(--text-muted)' }}>Analyzing {profile.appUrl || 'your repository'}</p>
            </div>

            {/* Progress Stepper */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-8)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 12, left: 0, right: 0, height: 2, background: 'var(--border-subtle)', zIndex: 0 }} />
                {WIZARD_STEPS.map((step, idx) => {
                    const isActive = idx === currentStep;
                    const isPast = idx < currentStep;
                    return (
                        <div key={step.id} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <div style={{
                                width: 26, height: 26, borderRadius: '50%',
                                background: isActive || isPast ? 'var(--primary)' : 'var(--bg-tertiary)',
                                color: isActive || isPast ? 'white' : 'var(--text-muted)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600,
                                border: '2px solid var(--bg-primary)'
                            }}>
                                {isPast ? <CheckCircle2 size={14} /> : idx + 1}
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                {step.title}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Dynamic Step Content */}
            <div className="card animate-fade-in" style={{ padding: 'var(--space-8)', minHeight: 300, display: 'flex', flexDirection: 'column' }}>

                {isProcessing ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Loader2 size={32} className="onboarding-gen-spin" style={{ color: 'var(--primary)', marginBottom: 'var(--space-4)' }} />
                        <h3 style={{ color: 'var(--text-primary)' }}>{stepInfo.title}...</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Running AI Agent</p>
                    </div>
                ) : (
                    <div className="animate-fade-in" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                            <stepInfo.icon size={24} style={{ color: 'var(--primary)' }} />
                            <h2 style={{ margin: 0 }}>{stepInfo.title}</h2>
                        </div>

                        {currentStep === 0 && (
                            <div>
                                <p style={{ marginBottom: 'var(--space-4)' }}>I successfully analyzed the repository. Here's what I found:</p>
                                <div className="grid-2" style={{ gap: 'var(--space-4)' }}>
                                    <div>
                                        <label className="input-label">Detected App Name</label>
                                        <input className="input-field" value={wizardData.appName} onChange={e => setWizardData({ ...wizardData, appName: e.target.value })} />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label className="input-label">Product Description</label>
                                        <textarea className="input-field" rows={3} value={wizardData.description} onChange={e => setWizardData({ ...wizardData, description: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 1 && (
                            <div>
                                <p style={{ marginBottom: 'var(--space-4)' }}>Based on the tech stack and description, here is your core audience and recommended positioning. Pick your favorite tagline:</p>
                                <label className="input-label">Core Audience</label>
                                <input className="input-field" value={wizardData.targetAudience} onChange={e => setWizardData({ ...wizardData, targetAudience: e.target.value })} style={{ marginBottom: 'var(--space-4)' }} />

                                <label className="input-label">Generated Taglines (Select One)</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                    {['Your autonomous marketing team.', 'Ship code, we handle the growth.', 'Marketing on autopilot.'].map(tag => (
                                        <div
                                            key={tag}
                                            className="card"
                                            style={{
                                                cursor: 'pointer', padding: 'var(--space-3)',
                                                borderColor: wizardData.tagline === tag ? 'var(--primary)' : 'var(--border-subtle)',
                                                background: wizardData.tagline === tag ? 'var(--primary-muted)' : 'var(--bg-tertiary)'
                                            }}
                                            onClick={() => setWizardData({ ...wizardData, tagline: tag })}
                                        >
                                            {tag}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div>
                                <p style={{ marginBottom: 'var(--space-4)' }}>To reach <strong>{wizardData.targetAudience}</strong>, you need to be active on these platforms. Connect them now to enable Autopilot posting.</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                    {['Twitter / X', 'LinkedIn', 'Product Hunt'].map(plat => (
                                        <div key={plat} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3)' }}>
                                            <span style={{ fontWeight: 500 }}>{plat}</span>
                                            <button className="btn btn-secondary btn-sm" onClick={() => alert('Future implementation: Composio OAuth Connection')}>Connect</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div style={{ textAlign: 'center', paddingTop: 'var(--space-4)' }}>
                                <Rocket size={48} style={{ color: 'var(--success)', marginBottom: 'var(--space-4)', margin: '0 auto', opacity: 0.8 }} />
                                <h3>All Set!</h3>
                                <p style={{ color: 'var(--text-muted)' }}>
                                    I've created your app profile. Your 30-day marketing strategy, content calendar, and launch kit assets are generating in the background.
                                </p>
                            </div>
                        )}

                    </div>
                )}

                {/* Wizard Navigation Footer */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-8)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
                    <button className="btn btn-primary" onClick={handleNext} disabled={isProcessing || (currentStep === 1 && !wizardData.tagline)}>
                        {currentStep === WIZARD_STEPS.length - 1 ? 'Go to Dashboard' : 'Next Step'}
                        <ArrowRight size={16} />
                    </button>
                </div>

            </div>
        </div>
    );
}
