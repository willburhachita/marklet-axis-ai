import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import {
    LayoutDashboard, Bot, Check, CheckCircle2, ChevronRight,
    Loader2, RefreshCw, Github, Twitter, Linkedin, Camera, RefreshCcw, Sparkles, Image as ImageIcon,
    ChevronLeft, Palette, Share2, PenTool, Lightbulb, Target,
} from 'lucide-react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api.js';

// NETWORK INTEGRATIONS — all three are connectable via Composio.
// Twitter requires COMPOSIO_TWITTER_AUTH_CONFIG_ID to be set in Convex env vars.
// LinkedIn and GitHub are ready out of the box.
const COMPOSIO_INTEGRATIONS = [
    { id: 'twitter', label: 'Twitter / X', icon: Twitter, color: 'var(--info)' },
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'var(--primary)' },
    { id: 'github', label: 'GitHub', icon: Github, color: 'var(--text-primary)' },
];

function AIComment({ message }) {
    return (
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', maxWidth: '90%' }}>
            <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={16} />
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', borderTopLeftRadius: 4, color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                {message}
            </div>
        </div>
    );
}

export default function Overview() {
    const { user, mode, setSubHeader } = useOutletContext();
    const { projectId } = useParams();
    const navigate = useNavigate();

    // Convex Data
    const profile = useQuery(api.appProfiles.getById, projectId ? { profileId: projectId } : 'skip');
    const strategy = useQuery(api.strategies.getByProfile, profile ? { appProfileId: profile._id } : 'skip');
    const socialAccounts = useQuery(api.socialAccounts.getByUser, user ? { userId: user._id } : 'skip');

    // Mutations & Actions
    const updateProfile = useMutation(api.appProfiles.update);
    const generateStrategyAction = useAction(api.agentActions.generateStrategy);
    const updateContentStatus = useMutation(api.contents.updateStatus);
    const verifyConnectionAction = useAction(api.agentActions.verifyAndSaveConnection);

    // --- Component State ---

    // Step progression locking
    // 0 = Identity, 1 = Positioning, 2 = Roadmap, 3 = Integrations, 4 = Final Review
    const [confirmedStep, setConfirmedStep] = useState(0);
    const [hasRestoredStep, setHasRestoredStep] = useState(false);

    // Refs for scrolling to active steps
    const step1Ref = useRef(null);
    const step2Ref = useRef(null);
    const step3Ref = useRef(null);

    // Step 1: Identity Generation State
    const [nameHistory, setNameHistory] = useState(['']);
    const [descHistory, setDescHistory] = useState(['']);
    const [nameIndex, setNameIndex] = useState(0);
    const [descIndex, setDescIndex] = useState(0);
    const [nameRationale, setNameRationale] = useState('');
    const [descHook, setDescHook] = useState('');

    const [generatingName, setGeneratingName] = useState(false);
    const [generatingDesc, setGeneratingDesc] = useState(false);
    const [savingIdentity, setSavingIdentity] = useState(false);
    const [generatingLogo, setGeneratingLogo] = useState(false);
    const [logoUrl, setLogoUrl] = useState(null);
    const [logoBrief, setLogoBrief] = useState(null); // { brief, style, colorPalette, designDirection }
    const [logoRegenerateCount, setLogoRegenerateCount] = useState(0);

    // Step 2: Positioning State
    const [generatingStrategy, setGeneratingStrategy] = useState(false);
    const [tweakingTone, setTweakingTone] = useState(false);
    const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
    const [roadmapFeedback, setRoadmapFeedback] = useState('');
    const [refiningRoadmap, setRefiningRoadmap] = useState(false);
    const [connectingPlatform, setConnectingPlatform] = useState(null);

    // Step 4: Social Sandbox State
    const [mockConnections, setMockConnections] = useState([]);

    // AI Identity Actions
    const generateNameAction = useAction(api.agentActions.generateIdentityName);
    const generateDescAction = useAction(api.agentActions.generateIdentityDesc);
    const generateLogoImageAction = useAction(api.agentActions.generateLogoImage);
    const tweakToneAction = useAction(api.agentActions.tweakTone);
    const generateExecutionStepsAction = useAction(api.agentActions.generateExecutionSteps);
    const refineExecutionStepsAction = useAction(api.agentActions.refineExecutionSteps);
    const initiateNetworkConnectionAction = useAction(api.agentActions.initiateNetworkConnection);

    // Codebase analysis for enriched context display
    const codebaseAnalysis = useQuery(api.codebaseAnalysis.getByProfile, profile ? { appProfileId: profile._id } : 'skip');

    // Additional Mutations
    const saveResource = useMutation(api.resources.save);

    // Initialize Identity from profile on load
    useEffect(() => {
        if (profile && nameHistory[0] === '') {
            setNameHistory([profile.appName || 'My Awesome App']);
            setDescHistory([profile.description || 'A great app for users.']);
        }
    }, [profile]);

    // Restore step progress based on server state
    useEffect(() => {
        if (profile === undefined || strategy === undefined || hasRestoredStep) return;

        let maxConfirmed = 0;

        // Step 1 implies Identity was confirmed -> Strategy positioning exists
        if (strategy?.positioning) {
            maxConfirmed = 1;
        }

        // Step 2 implies Positioning was confirmed -> Roadmap was generated
        if (strategy?.launchRoadmap && strategy.launchRoadmap.length > 0) {
            maxConfirmed = 2;
        }

        // Depending on existing progress, restore it and scroll to the right area
        if (maxConfirmed > 0) {
            setConfirmedStep(maxConfirmed);

            setTimeout(() => {
                let targetRef = null;
                if (maxConfirmed === 1) targetRef = step2Ref; // Strategy is generated, next is confirming it
                else if (maxConfirmed === 2) targetRef = step3Ref; // Roadmap is generated, review it

                if (targetRef?.current) {
                    targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 500); // slight delay to allow rendering
        }

        setHasRestoredStep(true);
    }, [profile, strategy, hasRestoredStep]);

    // Inject the page sub-header into the Layout slot (outside the scroll container)
    useEffect(() => {
        if (!profile || !user) return;
        const appName = nameHistory[nameIndex] || profile.appName;
        setSubHeader(
            <div className="page-sub-header">
                <div>
                    <h1><LayoutDashboard size={20} /> Strategy &amp; Execution Hub</h1>
                    <p>Your step-by-step AI workflow for <strong>{appName}</strong></p>
                </div>
                <div className="page-sub-header-actions">
                    <button className="btn btn-secondary btn-sm">
                        <RefreshCcw size={14} /> Sync Codebase
                    </button>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => generateStrategyAction({ appProfileId: profile._id, userId: user._id })}
                    >
                        <Sparkles size={14} /> Full Refresh
                    </button>
                </div>
            </div>
        );
        return () => setSubHeader(null);
    }, [profile?._id, nameHistory[nameIndex]]);

    // --- Handlers: Step 1 ---
    const handleGenerateIdentity = async (field) => {
        if (field === 'name') {
            setGeneratingName(true);
            try {
                const result = await generateNameAction({
                    appProfileId: profile?._id,
                    previousNames: nameHistory.slice(0, nameIndex + 1).filter(n => n.trim()),
                });
                if (result.success && result.name) {
                    setNameHistory(prev => [...prev.slice(0, nameIndex + 1), result.name]);
                    setNameIndex(prev => prev + 1);
                    setNameRationale(result.rationale || '');
                } else {
                    console.error('[Identity] Name generation failed:', result.error);
                    const fallbackName = `${profile?.appName} Pro`;
                    setNameHistory(prev => [...prev.slice(0, nameIndex + 1), fallbackName]);
                    setNameIndex(prev => prev + 1);
                    setNameRationale('Fallback suggestion — AI is temporarily unavailable.');
                }
            } catch (err) {
                console.error('[Identity] Name generation error:', err);
            }
            setGeneratingName(false);
        } else {
            setGeneratingDesc(true);
            try {
                const result = await generateDescAction({
                    appProfileId: profile?._id,
                    currentName: nameHistory[nameIndex],
                    previousDescriptions: descHistory.slice(0, descIndex + 1).filter(d => d.trim()),
                });
                if (result.success && result.description) {
                    setDescHistory(prev => [...prev.slice(0, descIndex + 1), result.description]);
                    setDescIndex(prev => prev + 1);
                    setDescHook(result.hook || '');
                } else {
                    console.error('[Identity] Description generation failed:', result.error);
                    const fallbackDesc = `${nameHistory[nameIndex]} helps ${profile?.targetAudience || 'users'} achieve more with less effort.`;
                    setDescHistory(prev => [...prev.slice(0, descIndex + 1), fallbackDesc]);
                    setDescIndex(prev => prev + 1);
                    setDescHook('');
                }
            } catch (err) {
                console.error('[Identity] Desc generation error:', err);
            }
            setGeneratingDesc(false);
        }
    };

    const handleGenerateLogo = async () => {
        setGeneratingLogo(true);
        setLogoBrief(null);
        const liveName = nameHistory[nameIndex]?.trim() || profile?.appName;
        try {
            const result = await generateLogoImageAction({
                appProfileId: profile?._id,
                currentName: liveName,
                regenerateIndex: logoRegenerateCount,
            });
            if (result.success && result.imageDataUrl) {
                setLogoBrief({
                    brief: result.brief,
                    style: result.style,
                    colorPalette: result.colorPalette,
                    designDirection: result.designDirection,
                });
                setLogoUrl(result.imageDataUrl);
                setLogoRegenerateCount(c => c + 1);
            } else {
                console.error('[Logo] Generation failed:', result.error);
                setLogoRegenerateCount(c => c + 1);
            }
        } catch (err) {
            console.error('[Logo] Generation error:', err);
        }
        setGeneratingLogo(false);
    };

    const handleConfirmIdentity = async () => {
        setSavingIdentity(true);
        try {
            const finalName = nameHistory[nameIndex]?.trim() || profile?.appName;
            const finalDesc = descHistory[descIndex]?.trim() || profile?.description;

            await updateProfile({
                profileId: profile._id,
                appName: finalName,
                description: finalDesc
            });

            if (logoUrl) {
                await saveResource({
                    appProfileId: profile._id,
                    type: "brand_logo",
                    title: `${finalName} - Primary Logo`,
                    body: logoUrl,
                    category: "marketing",
                    status: "final",
                    generatedBy: "design_agent"
                });
            }

            if (logoBrief) {
                await saveResource({
                    appProfileId: profile._id,
                    type: "brand_guidelines",
                    title: `${finalName} - Brand Guidelines`,
                    body: `Name: ${finalName}\nDescription: ${finalDesc}\n\nLogo Brief:\n${logoBrief.brief}\nStyle: ${logoBrief.style}\nPalette: ${logoBrief.colorPalette}`,
                    category: "marketing",
                    status: "final",
                    generatedBy: "strategy_agent"
                });
            }

            setConfirmedStep(1);

            if (user && profile._id) {
                setGeneratingStrategy(true);
                try {
                    await generateStrategyAction({
                        appProfileId: profile._id,
                        userId: user._id
                    });
                } catch (err) {
                    console.error("Failed to auto-generate strategy:", err);
                }
                setGeneratingStrategy(false);
            }
        } catch (error) {
            console.error("Failed to confirm identity:", error);
        } finally {
            setSavingIdentity(false);
        }
    };

    // --- Handlers: Step 2 ---
    const handleTweakTone = async () => {
        setTweakingTone(true);
        if (profile && user) {
            try {
                await tweakToneAction({
                    appProfileId: profile._id,
                    userId: user._id
                });
            } catch (err) {
                console.error("Failed to tweak tone:", err);
            }
        }
        setTweakingTone(false);
    };

    const handleConfirmPositioning = async () => {
        setGeneratingRoadmap(true);
        if (profile && user) {
            try {
                await generateExecutionStepsAction({
                    appProfileId: profile._id,
                    userId: user._id
                });
                setConfirmedStep(2);
            } catch (err) {
                console.error("Failed to generate execution steps:", err);
            }
        }
        setGeneratingRoadmap(false);
    };

    // --- Handlers: Step 3 ---
    const handleConfirmRoadmap = () => {
        setConfirmedStep(3);
    };

    const handleRefineRoadmap = async () => {
        if (!roadmapFeedback.trim() || !profile || !user) return;
        setRefiningRoadmap(true);
        try {
            await refineExecutionStepsAction({
                appProfileId: profile._id,
                userId: user._id,
                feedback: roadmapFeedback.trim(),
            });
            setRoadmapFeedback('');
        } catch (err) {
            console.error('Failed to refine roadmap:', err);
        }
        setRefiningRoadmap(false);
    };

    // --- Handlers: Step 4 ---
    const handleConnectAccount = async (platformId) => {
        if (!profile || !user) return;

        setConnectingPlatform(platformId);
        try {
            const result = await initiateNetworkConnectionAction({
                appProfileId: profile._id,
                userId: user._id,
                platform: platformId,
            });

            if (result.success && result.url) {
                // Store the connectedAccountId so IntegrationsCallback can verify it
                if (result.connectedAccountId) {
                    sessionStorage.setItem(`composio_conn_${platformId}`, result.connectedAccountId);
                }
                // Remember where to return after OAuth
                sessionStorage.setItem('composio_return_url', window.location.pathname);
                // Full page redirect — IntegrationsCallback handles the return
                window.location.href = result.url;
            } else {
                alert(`Could not connect ${platformId}: ${result.error}`);
                setConnectingPlatform(null);
            }
        } catch (err) {
            console.error('Connection error:', err);
            setConnectingPlatform(null);
        }
    };

    const handleConfirmIntegrations = () => {
        setConfirmedStep(4);
    };

    // Early return after all handlers are declared
    if (!user || profile === undefined || strategy === undefined) {
        return (
            <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <Loader2 size={32} className="onboarding-gen-spin" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ paddingBottom: 'var(--space-8)' }}>
            <div style={{ maxWidth: 900, margin: '0 auto', paddingTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>

                {/* --- Step 1: Branding & Identity --- */}
                <div className="stagger mb-2" ref={step1Ref}>
                    <AIComment message={<><strong>Step 1: Identity.</strong> {codebaseAnalysis ? <>I've analyzed your codebase — {codebaseAnalysis.techStack?.length > 0 ? <>built with <strong>{codebaseAnalysis.techStack.slice(0, 3).join(', ')}</strong></> : 'your project'}{codebaseAnalysis.features?.length > 0 ? <> with {codebaseAnalysis.features.length} detected features</> : ''}. My name and description suggestions are crafted to highlight your product's real strengths to your target audience.</> : <>Based on your project profile, I'll generate brand names and descriptions with a marketing lens — each suggestion is designed to resonate with your target audience and stand out in the market.</>} Hit <strong>Suggest</strong> to get AI-powered variations, then pick your favorite!</>} />

                    <div className="card animate-fade-in step-container" style={{ borderColor: confirmedStep >= 0 ? 'var(--primary)' : 'var(--border-subtle)' }}>
                        <div className="grid-responsive" style={{ gap: 'var(--space-6)' }}>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                {/* App Name Generation */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                                        <label className="input-label" style={{ margin: 0 }}>App Name</label>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <button className="btn btn-ghost btn-sm" disabled={nameIndex === 0} onClick={() => setNameIndex(n => n - 1)}><ChevronLeft size={14} /></button>
                                            <button className="btn btn-ghost btn-sm" disabled={nameIndex === nameHistory.length - 1} onClick={() => setNameIndex(n => n + 1)}><ChevronRight size={14} /></button>
                                            <button className="btn btn-secondary btn-sm" onClick={() => handleGenerateIdentity('name')} disabled={generatingName}>{generatingName ? <><Loader2 size={12} className="onboarding-gen-spin" /> Thinking...</> : <><Sparkles size={12} /> Suggest</>}</button>
                                        </div>
                                    </div>
                                    <input
                                        className="input-field"
                                        value={nameHistory[nameIndex] || ''}
                                        onChange={(e) => {
                                            const newHistory = [...nameHistory];
                                            newHistory[nameIndex] = e.target.value;
                                            setNameHistory(newHistory);
                                        }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                                        {nameRationale && nameIndex > 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'var(--primary)', fontStyle: 'italic', maxWidth: '70%', lineHeight: 1.3 }}><Lightbulb size={10} /> {nameRationale}</div>
                                        )}
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right', marginLeft: 'auto' }}>Variation {nameIndex + 1} of {nameHistory.length}</div>
                                    </div>
                                </div>

                                {/* Description Generation */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                                        <label className="input-label" style={{ margin: 0 }}>Description</label>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <button className="btn btn-ghost btn-sm" disabled={descIndex === 0} onClick={() => setDescIndex(n => n - 1)}><ChevronLeft size={14} /></button>
                                            <button className="btn btn-ghost btn-sm" disabled={descIndex === descHistory.length - 1} onClick={() => setDescIndex(n => n + 1)}><ChevronRight size={14} /></button>
                                            <button className="btn btn-secondary btn-sm" onClick={() => handleGenerateIdentity('desc')} disabled={generatingDesc}>{generatingDesc ? <><Loader2 size={12} className="onboarding-gen-spin" /> Writing...</> : <><Sparkles size={12} /> Suggest</>}</button>
                                        </div>
                                    </div>
                                    <textarea
                                        className="input-field"
                                        rows={4}
                                        value={descHistory[descIndex] || ''}
                                        onChange={(e) => {
                                            const newHistory = [...descHistory];
                                            newHistory[descIndex] = e.target.value;
                                            setDescHistory(newHistory);
                                        }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                                        {descHook && descIndex > 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600, maxWidth: '70%' }}><Target size={10} /> Tagline: "{descHook}"</div>
                                        )}
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right', marginLeft: 'auto' }}>Variation {descIndex + 1} of {descHistory.length}</div>
                                    </div>
                                </div>
                            </div>

                            {/* DigitalOcean Image Gen Section */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', border: '1px dashed var(--border-subtle)' }}>
                                {generatingLogo ? (
                                    <div style={{ textAlign: 'center', color: 'var(--primary)' }}>
                                        <Loader2 size={32} className="onboarding-gen-spin mx-auto mb-2" />
                                        <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Crafting your brand identity...</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>AI is generating a creative brief, then rendering your logo</p>
                                    </div>
                                ) : logoUrl ? (
                                    <div style={{ textAlign: 'center' }}>
                                        <img src={logoUrl} alt="Generated Logo" style={{ width: 140, height: 140, borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-3)', border: '1px solid var(--border-subtle)' }} />
                                        {logoBrief && (
                                            <div style={{ textAlign: 'left', fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2)', marginBottom: 'var(--space-2)', lineHeight: 1.4, maxWidth: 260 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                    <Palette size={12} style={{ color: 'var(--primary)' }} />
                                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Creative Brief</span>
                                                    {logoBrief.designDirection && <span className="badge badge-info" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>{logoBrief.designDirection}</span>}
                                                </div>
                                                <div>{logoBrief.brief}</div>
                                                <div style={{ marginTop: 4, color: 'var(--text-muted)' }}><strong>Style:</strong> {logoBrief.style}</div>
                                                <div style={{ color: 'var(--text-muted)' }}><strong>Colors:</strong> {logoBrief.colorPalette}</div>
                                            </div>
                                        )}
                                        <div><button className="btn btn-ghost btn-sm" onClick={handleGenerateLogo}><RefreshCw size={14} /> Regenerate Logo</button></div>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <ImageIcon size={48} style={{ opacity: 0.5, marginBottom: 'var(--space-2)' }} />
                                        <p style={{ fontSize: '0.875rem', marginBottom: 2 }}>No creative logo generated yet</p>
                                        <p style={{ fontSize: '0.7rem', marginBottom: 'var(--space-3)', color: 'var(--text-muted)' }}>AI will craft a creative brief first, then render your logo</p>
                                        <button className="btn btn-primary btn-sm" onClick={handleGenerateLogo}><Palette size={14} /> AI Generate Logo</button>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Step Confirmation */}
                        <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)' }}>
                            <button className={`btn ${confirmedStep >= 1 ? 'btn-secondary' : 'btn-primary'}`} onClick={handleConfirmIdentity} disabled={savingIdentity}>
                                {savingIdentity ? <><Loader2 size={14} className="onboarding-gen-spin" /> {confirmedStep >= 1 ? 'Updating...' : 'Saving...'}</> : (confirmedStep >= 1 ? <><Check size={14} /> Save Changes</> : 'Confirm Identity')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- Step 2: Positioning --- */}
                <div className={`stagger mb-2 ${confirmedStep < 1 ? 'deactivated-step' : ''}`} ref={step2Ref}>
                    <AIComment message={<><strong>Step 2: Market Positioning.</strong> Does this angle accurately reflect your product? You can ask me to "Tweak Tone" if you want me to rewrite your persona.</>} />

                    <div className="card animate-fade-in step-container">
                        <div className="card-header">
                            <div className="card-title">Market Positioning</div>
                            <span className="badge badge-info">{generatingStrategy ? 'Regenerating...' : 'AI Recommendation'}</span>
                        </div>

                        {generatingStrategy ? (
                            <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-4)' }}>
                                <Loader2 size={24} className="onboarding-gen-spin mb-2" style={{ color: 'var(--primary)' }} />
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Rewriting strategy based on new identity...</p>
                            </div>
                        ) : (
                            <p style={{ fontSize: '0.938rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                                {strategy?.positioning || "Positioning generation pending... Run Full Refresh."}
                            </p>
                        )}

                        <div className="grid-responsive">
                            <div>
                                <div className="card-subtitle mb-2" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <ChevronRight size={14} style={{ color: 'var(--success)' }} /> Brand Tone
                                </div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{strategy?.brandVoice?.tone || "Authoritative yet approachable."}</p>
                            </div>
                            <div>
                                <div className="card-subtitle mb-2" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <ChevronRight size={14} style={{ color: 'var(--success)' }} /> Focus Audience
                                </div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{profile?.targetAudience || "Developers and founders."}</p>
                            </div>
                        </div>

                        <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)' }}>
                            <button className="btn btn-ghost btn-sm" onClick={handleTweakTone} disabled={tweakingTone}>
                                {tweakingTone ? <><Loader2 size={14} className="onboarding-gen-spin" /> Tweaking...</> : <><RefreshCw size={14} /> Tweak Tone</>}
                            </button>
                            <button className={`btn ${confirmedStep >= 2 ? 'btn-secondary' : 'btn-primary'}`} onClick={handleConfirmPositioning} disabled={generatingRoadmap}>
                                {generatingRoadmap ? <><Loader2 size={14} className="onboarding-gen-spin" /> Crafting Execution...</> : (confirmedStep >= 2 ? <><Check size={14} /> Save Changes</> : 'Confirm Positioning')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- Step 3: Graphical Roadmap --- */}
                <div className={`stagger mb-2 ${confirmedStep < 2 ? 'deactivated-step' : ''}`} ref={step3Ref}>
                    <AIComment message={<><strong>Step 3: Execution Strategy.</strong> We've replaced generic weeks with concrete "Steps". Once approved, any tasks associated with content generation will be scheduled.</>} />

                    <div className="card animate-fade-in overflow-hidden step-container" style={{ padding: 0 }}>
                        <div className="card-header" style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)' }}>
                            <div className="card-title">Execution Steps</div>
                        </div>

                        <div className="scrollable-h" style={{ display: 'flex', padding: 'var(--space-4)', gap: 'var(--space-4)' }}>
                            {strategy?.launchRoadmap && strategy.launchRoadmap.length > 0 ? (
                                strategy.launchRoadmap.map((phase, idx) => (
                                    <div key={idx} style={{ minWidth: 280, flex: 1, background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: idx === 0 ? 'var(--primary)' : 'var(--text-muted)', borderTopLeftRadius: 'var(--radius-md)', borderBottomLeftRadius: 'var(--radius-md)' }} />
                                        <h4 style={{ margin: '0 0 var(--space-2) 0', color: idx === 0 ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '0.813rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Step {idx + 1}</h4>
                                        <p style={{ fontSize: '0.938rem', fontWeight: 600, color: 'var(--primary)', marginBottom: 'var(--space-3)' }}>{phase.title}</p>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                            {phase.tasks.slice(0, 3).map((task, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', fontSize: '0.813rem', color: 'var(--text-secondary)' }}>
                                                    <div style={{ marginTop: 2, color: idx === 0 ? 'var(--success)' : 'var(--border-subtle)' }}><CheckCircle2 size={12} /></div>
                                                    <span style={{ lineHeight: 1.4 }}>{task}</span>
                                                </div>
                                            ))}
                                            {phase.tasks.length > 3 && (
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: 18 }}>+{phase.tasks.length - 3} more</div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: 'var(--space-6)', textAlign: 'center', width: '100%', color: 'var(--text-muted)' }}>
                                    Roadmap steps missing. Hit Full Refresh.
                                </div>
                            )}
                        </div>

                        {/* Feedback / Refine box */}
                        <div style={{ padding: 'var(--space-3) var(--space-4)', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>Not happy with the steps? Leave a note and the AI will revise them.</p>
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                <input
                                    className="input-field"
                                    style={{ flex: 1, fontSize: '0.875rem', padding: 'var(--space-2) var(--space-3)' }}
                                    placeholder='e.g. "Focus more on developer communities" or "Make Step 2 more aggressive"'
                                    value={roadmapFeedback}
                                    onChange={(e) => setRoadmapFeedback(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && roadmapFeedback.trim()) handleRefineRoadmap(); }}
                                    disabled={refiningRoadmap}
                                />
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={handleRefineRoadmap}
                                    disabled={refiningRoadmap || !roadmapFeedback.trim()}
                                    style={{ whiteSpace: 'nowrap' }}
                                >
                                    {refiningRoadmap ? <><Loader2 size={13} className="onboarding-gen-spin" /> Refining...</> : <><RefreshCw size={13} /> Refine Steps</>}
                                </button>
                            </div>
                        </div>

                        <div style={{ padding: 'var(--space-3) var(--space-4)', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className={`btn ${confirmedStep >= 3 ? 'btn-secondary' : 'btn-primary'}`} onClick={handleConfirmRoadmap}>
                                {confirmedStep >= 3 ? <><Check size={14} /> Save Changes</> : 'Approve Execution Steps'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- Step 4: Network Connections --- */}
                <div className={`stagger mb-2 ${confirmedStep < 3 ? 'deactivated-step' : ''}`}>
                    <AIComment message={<><strong>Step 4: Connect Your Networks.</strong> Link the platforms where you want to deploy your strategy. Once connected, content can be published directly from your dashboard.</>} />

                    <div className="card animate-fade-in step-container">
                        <div className="card-header">
                            <div className="card-title">Connected Accounts</div>
                            <span className="badge badge-info">OAuth</span>
                        </div>

                        <div className="grid-responsive">
                            {COMPOSIO_INTEGRATIONS.map((cfg) => {
                                const IconComp = cfg.icon;
                                const isConnecting = connectingPlatform === cfg.id;
                                const socialAccount = socialAccounts?.find(a => a.platform === cfg.id && a.isActive);
                                const isConnected = !!socialAccount;

                                return (
                                    <div key={cfg.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: isConnected ? `1px solid ${cfg.color}` : '1px solid var(--border-subtle)', transition: 'all 0.2s' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                            <IconComp style={{ color: isConnected ? cfg.color : 'var(--text-muted)' }} size={20} />
                                            <div>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: isConnected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{cfg.label}</div>
                                                {isConnected && socialAccount?.accountName && (
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>@{socialAccount.accountName}</div>
                                                )}
                                            </div>
                                        </div>
                                        {isConnected ? (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Check size={12} /> Connected
                                            </span>
                                        ) : (
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                disabled={isConnecting}
                                                onClick={() => handleConnectAccount(cfg.id)}
                                            >
                                                {isConnecting
                                                    ? <><Loader2 size={12} className="onboarding-gen-spin" /> Connecting…</>
                                                    : 'Connect'}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)' }}>
                            <button className={`btn ${confirmedStep >= 4 ? 'btn-secondary' : 'btn-primary'}`} onClick={handleConfirmIntegrations}>
                                {confirmedStep >= 4 ? <><Check size={14} /> Save Changes</> : 'Confirm Integrations'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- Step 5: Final Review Queue --- */}
                <div className={`stagger mb-8 ${confirmedStep < 4 ? 'deactivated-step' : ''}`}>
                    <AIComment message={<><strong>Final Step.</strong> Everything is configured! Below is your Active Task Queue for the content I've just prepared for your new channels. Approve them to see the magic happen.</>} />

                    <div className="card animate-fade-in step-container">
                        <div className="card-header">
                            <div className="card-title">Active Review Queue</div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            {/* Dummy Queue Items representing execution engine start */}
                            <div className="queue-item" style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
                                <div className="queue-item-icon" style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}><PenTool /></div>
                                <div className="queue-item-body">
                                    <div className="queue-item-title" style={{ fontSize: '0.875rem' }}>Introductory Launch Tweet</div>
                                    <div className="queue-item-meta">twitter &middot; Step 1</div>
                                </div>
                                <div className="queue-item-actions">
                                    <button className="btn btn-primary btn-sm"><Check size={14} /> Approve</button>
                                </div>
                            </div>
                            <div className="queue-item" style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
                                <div className="queue-item-icon" style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}><Share2 /></div>
                                <div className="queue-item-body">
                                    <div className="queue-item-title" style={{ fontSize: '0.875rem' }}>LinkedIn Founder Story</div>
                                    <div className="queue-item-meta">linkedin &middot; Step 1</div>
                                </div>
                                <div className="queue-item-actions">
                                    <button className="btn btn-primary btn-sm"><Check size={14} /> Approve</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
