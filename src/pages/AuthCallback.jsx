import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../lib/auth-client.ts';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api.js';
import { Loader2 } from 'lucide-react';

/**
 * AuthCallback — landing page for social OAuth redirects and email sign-in.
 *
 * After GitHub / Google sign-in, Better Auth redirects here.
 * We:
 *  1. Wait at least 2s for the session token exchange to complete
 *  2. Sync the user to our Convex users table (with provider info)
 *  3. Check if they have an appProfile
 *  4. Redirect to /onboarding (new) or /overview (returning)
 *
 * The 2s grace period is required because OAuth token exchange
 * via crossDomainClient can take a moment to propagate into useSession.
 */
export default function AuthCallback() {
    const navigate = useNavigate();
    const { data: session, isPending } = useSession();
    const syncUser = useMutation(api.users.syncUser);

    // Prevents immediate "no session" redirect during token exchange
    const [minWaitDone, setMinWaitDone] = useState(false);
    const [synced, setSynced] = useState(false);

    const user = useQuery(
        api.users.getCurrentUser,
        session ? {} : 'skip'
    );

    // Always wait at least 2s before concluding no session exists.
    // OAuth token exchange via Better Auth crossDomainClient can take
    // a moment before useSession reflects the newly-granted session.
    useEffect(() => {
        const timer = setTimeout(() => setMinWaitDone(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    // Once session is confirmed + min wait is done, sync user to Convex
    useEffect(() => {
        if (isPending || !minWaitDone) return;

        if (!session) {
            navigate('/auth', { replace: true });
            return;
        }

        if (synced) return;
        setSynced(true);

        // Read the provider that was saved before OAuth redirect
        const provider = sessionStorage.getItem('oauth_provider') || undefined;
        sessionStorage.removeItem('oauth_provider');

        const doSync = async () => {
            try {
                await syncUser({
                    email: session.user.email,
                    name: session.user.name || session.user.email.split('@')[0],
                    avatarUrl: session.user.image || undefined,
                    provider,
                });
            } catch (e) {
                console.error('syncUser failed:', e);
            }
        };

        doSync();
    }, [isPending, session, minWaitDone, synced]);

    // Navigate once user record is confirmed in Convex
    useEffect(() => {
        if (!session || user === undefined) return;
        navigate('/overview', { replace: true });
    }, [session, user, navigate]);

    return (
        <div className="auth-callback-page">
            <div className="auth-callback-inner">
                <Loader2 size={32} className="auth-callback-spin" />
                <p className="auth-callback-text">Completing sign in...</p>
            </div>
        </div>
    );
}
