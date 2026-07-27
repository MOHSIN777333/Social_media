import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase";
const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const session = supabase.auth.getSession();
        setUser(session?.user || null);

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null);
        });

        return () => {
            authListener.subscription.unsubscribe();
        }
    }, [])

    const signInWithGitHub = async () => {
        const { user, session, error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
        });
        if (error) {
            console.error('Error signing in with GitHub:', error.message);
        }
        return { user, session, error };
    }

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
        }

    }

    const value = {
        user,
        signInWithGitHub,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}