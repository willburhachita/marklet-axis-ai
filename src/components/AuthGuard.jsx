import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../lib/auth-client.ts';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api.js';

const TIMEOUT_MS = 6000;

export default function AuthGuard({ children }) {
    const navigate = useNavigate();
    const { data: session, isPending } = useSession();
    const [expired, setExpired] = useState(false);
    const timer = useRef(null);

    useEffect(() => {
        timer.current = setTimeout(() => setExpired(true), TIMEOUT_MS);
        return () => clearTimeout(timer.current);
    }, []);

    // Cancel the timeout if session resolves before it fires
    useEffect(() => {
        if (!isPending && timer.current) {
            clearTimeout(timer.current);
        }
    }, [isPending]);

    const user = useQuery(
        api.users.getCurrentUser,
        session ? {} : 'skip'
    );

    const profile = useQuery(
        api.appProfiles.getByUser,
        user?._id ? { userId: user._id } : 'skip'
    );

    useEffect(() => {
        if (isPending && !expired) return; // still loading, within time window

        const noSession = expired || !session;
        if (noSession) {
            navigate('/auth', { replace: true });
            return;
        }

        if (user === undefined || profile === undefined) return; // Convex still loading

        if (profile === null) {
            navigate('/onboarding', { replace: true });
        }
    }, [expired, isPending, session, user, profile, navigate]);

    // Show loading spinner during the grace period
    if (isPending && !expired) {
        return (
            <div className="auth-guard-loading">
                <div className="auth-guard-spinner" />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading...</p>
            </div>
        );
    }

    if (!session || !user || profile === null) return null;

    return children;
}
