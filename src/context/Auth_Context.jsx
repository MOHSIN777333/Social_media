import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { getCurrentUser, loginUser, loginWithGitHub } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem("active_user");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed?.id) {
                    return {
                        id: parsed.id,
                        email: parsed.email,
                        name: parsed.name,
                        username: parsed.username || parsed.email?.split("@")[0],
                        user_metadata: {
                            full_name: parsed.name,
                            avatar_url: parsed.avatarUrl,
                        },
                    };
                }
            }
        } catch {
            // ignore
        }
        return null;
    });

    useEffect(() => {
        let isMounted = true;
        const fetchMe = async () => {
            const saved = localStorage.getItem("active_user");
            if (!saved) {
                return; // User is logged out, do not auto-login
            }
            try {
                const backendUser = await getCurrentUser();
                if (backendUser && isMounted) {
                    const formatted = {
                        id: backendUser.id,
                        email: backendUser.email,
                        name: backendUser.name,
                        username: backendUser.username,
                        user_metadata: {
                            full_name: backendUser.name,
                            avatar_url: backendUser.avatarUrl,
                        },
                    };
                    setUser(formatted);
                    localStorage.setItem("active_user", JSON.stringify(backendUser));
                } else if (!backendUser && isMounted) {
                    localStorage.removeItem("active_user");
                    setUser(null);
                }
            } catch (err) {
                console.warn("Could not verify session with backend:", err);
            }
        };
        fetchMe();

        return () => {
            isMounted = false;
        };
    }, []);

    const openAuthModal = () => setIsAuthModalOpen(true);
    const closeAuthModal = () => setIsAuthModalOpen(false);

    const signInWithGitHub = async ({ username = "mohsinali", name, email } = {}) => {
        try {
            const loggedIn = await loginWithGitHub({
                username,
                name: name || username.charAt(0).toUpperCase() + username.slice(1),
                email: email || `${username.toLowerCase()}@users.noreply.github.com`,
            });
            const formatted = {
                id: loggedIn.id,
                email: loggedIn.email,
                name: loggedIn.name,
                username: loggedIn.username,
                user_metadata: {
                    full_name: loggedIn.name,
                    avatar_url: loggedIn.avatarUrl,
                },
            };
            setUser(formatted);
            return { user: formatted, error: null };
        } catch (error) {
            console.error("Error signing in with GitHub:", error);
            return { user: null, error };
        }
    };

    const switchAccount = async ({ email, username, name }) => {
        const loggedIn = await loginUser({ email, username: username || name });
        const formatted = {
            id: loggedIn.id,
            email: loggedIn.email,
            name: loggedIn.name,
            username: loggedIn.username,
            user_metadata: {
                full_name: loggedIn.name,
                avatar_url: loggedIn.avatarUrl,
            },
        };
        setUser(formatted);
        return formatted;
    };

    const updateUser = (updatedBackendUser) => {
        if (!updatedBackendUser) return;
        const formatted = {
            id: updatedBackendUser.id,
            email: updatedBackendUser.email,
            name: updatedBackendUser.name,
            username: updatedBackendUser.username,
            bio: updatedBackendUser.bio,
            isPrivateAccount: updatedBackendUser.isPrivateAccount,
            user_metadata: {
                full_name: updatedBackendUser.name,
                avatar_url: updatedBackendUser.avatarUrl,
            },
        };
        setUser(formatted);
        localStorage.setItem("active_user", JSON.stringify(updatedBackendUser));
    };

    const signOut = async () => {
        try {
            localStorage.removeItem("active_user");
            setUser(null);
            await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const value = useMemo(() => ({
        user,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        signInWithGitHub,
        switchAccount,
        updateUser,
        signOut,
    }), [user, isAuthModalOpen]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
