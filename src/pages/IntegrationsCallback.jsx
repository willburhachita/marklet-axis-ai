import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSession } from '../lib/auth-client.ts';
import { useQuery, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api.js';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * IntegrationsCallback — handles Composio OAuth redirects.
 *
 * Flow:
 *  1. User clicks "Connect" on Twitter / LinkedIn / GitHub in Overview
 *  2. We redirect to Composio's OAuth URL (full page redirect)
 *  3. User completes OAuth on the platform
 *  4. Composio redirects here: /integrations/callback?platform=<platform>
 *  5. We verify the connection with Composio, save it to Convex, redirect home
 *
 * The connectedAccountId is stored in sessionStorage before the OAuth redirect
 * so we can verify the specific connection here.
 */
export default function IntegrationsCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { data: session, isPending } = useSession();
    const user = useQuery(api.users.getCurrentUser, session ? {} : 'skip');

    const verifyAndSave = useAction(api.agentActions.verifyAndSaveConnection);

    const [status, setStatus] = useState('loading');
    const [accountName, setAccountName] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const platform = searchParams.get('platform');

    useEffect(() => {
        if (isPending || !session || user === undefined) return;

        if (!session || !user) {
            navigate('/auth', { replace: true });
            return;
        }

        if (!platform) {
            setStatus('error');
            setErrorMsg('Missing platform parameter.');
            return;
        }

        const handle = async () => {
            try {
                const connectedAccountId =
                    sessionStorage.getItem(`composio_conn_${platform}`) || '';

                const result = await verifyAndSave({
                    userId: user._id,
                    platform,
                    connectedAccountId,
                });

                if (result.success) {
                    setAccountName(result.accountName || platform);
                    setStatus('success');
                    sessionStorage.removeItem(`composio_conn_${platform}`);

                    // Return to wherever they came from, or the overview hub
                    const returnUrl =
                        sessionStorage.getItem('composio_return_url') || '/overview';
                    sessionStorage.removeItem('composio_return_url');

                    setTimeout(() => navigate(returnUrl, { replace: true }), 1800);
                } else {
                    setErrorMsg(result.error || 'Connection could not be verified.');
                    setStatus('error');
                }
            } catch (err) {
                setErrorMsg(String(err));
                setStatus('error');
            }
        };

        handle();
    }, [isPending, session, user, platform]);

    const returnUrl =
        sessionStorage.getItem('composio_return_url') || '/overview';

    const platformLabel =
        platform
            ? platform.charAt(0).toUpperCase() + platform.slice(1)
            : 'Account';

    return (
        <div className="auth-callback-page">
            <div className="auth-callback-inner">
                {status === 'loading' && (
                    <>
                        <Loader2 size={36} className="auth-callback-spin" />
                        <p className="auth-callback-text">
                            Connecting your {platformLabel} account…
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle2
                            size={36}
                            style={{ color: 'var(--success)', flexShrink: 0 }}
                        />
                        <p className="auth-callback-text">
                            {platformLabel} connected
                            {accountName ? ` as @${accountName}` : ''}!
                        </p>
                        <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)', marginTop: 4 }}>
                            Redirecting you back…
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <AlertCircle
                            size={36}
                            style={{ color: 'var(--error)', flexShrink: 0 }}
                        />
                        <p className="auth-callback-text">
                            Could not connect {platformLabel}
                        </p>
                        <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)', marginTop: 4 }}>
                            {errorMsg}
                        </p>
                        <button
                            className="landing-btn-pill"
                            style={{ marginTop: 'var(--space-4)', fontSize: '0.813rem', padding: '8px 20px' }}
                            onClick={() => navigate(returnUrl, { replace: true })}
                        >
                            Go back
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
