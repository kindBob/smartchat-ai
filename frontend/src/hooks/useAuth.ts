import { useCallback, useEffect, useState } from "react";
import { authClient } from "../auth";

type AuthUser = typeof authClient.$Infer.Session.user;

export function useAuth() {
    const [session, setSession] = useState<unknown>(null);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshSession = useCallback(async () => {
        const result = await authClient.getSession();

        if (result.data?.session && result.data?.user) {
            setSession(result.data.session);
            setUser(result.data.user);
        } else {
            setSession(null);
            setUser(null);
        }
    }, []);

    useEffect(() => {
        const loadSession = async () => {
            try {
                await refreshSession();
            } finally {
                setLoading(false);
            }
        };

        loadSession();
    }, []);

    const signOut = async () => {
        await authClient.signOut();

        setSession(null);
        setUser(null);
    };

    return {
        session,
        user,
        loading,
        signOut,
        refreshSession,
    };
}
