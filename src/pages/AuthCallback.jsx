import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession, signOut as baSignOut } from '../lib/auth-client.ts';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api.js';
import { Loader2 } from 'lucide-react';

/**
 * AuthCallback — landing page for social OAuth redirects.
 *
 * After GitHub / Google sign-in, Better Auth redirects here.
 * We:
 *  1. Wait for the session to appear
 *  2. Sync the user to our Convex users table
 *  3. Check if they have an appProfile
 *  4. Redirect to /onboarding (new) or /overview (returning)
 */
export default function AuthCallback() {
    const navigate = useNavigate();
    const { data: session, isPending } = useSession();
    const syncUser = useMutation(api.users.syncUser);

    const user = useQuery(
        api.users.getCurrentUser,
        session ? {} : 'skip'
    );

    useEffect(() => {
        if (isPending) return;

        // If no session at all, auth failed — go back to /auth
        if (!session) {
            navigate('/auth', { replace: true });
            return;
        }

        // Sync user to Convex
        const doSync = async () => {
            try {
                await syncUser({
                    email: session.user.email,
                    name: session.user.name || session.user.email.split('@')[0],
                    avatarUrl: session.user.image || undefined,
                });
            } catch (e) {
                console.error('syncUser failed:', e);
            }
        };

        doSync();
    }, [isPending, session]);

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
