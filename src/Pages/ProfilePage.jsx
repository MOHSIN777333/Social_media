import { useState } from "react";
import { useAuth } from "../context/Auth_Context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPosts, getLikedPosts } from "../api";
import PostList from "../Components/PostList";
import EditProfileModal from "../Components/EditProfileModal";
import {
    Mail,
    Calendar,
    ShieldCheck,
    UserCheck,
    Edit3,
    Heart,
    Globe,
    Lock,
} from "lucide-react";
import { useToast } from "../context/Toast_Context";

export default function ProfilePage() {
    const { user, switchAccount, openAuthModal } = useAuth();
    const queryClient = useQueryClient();
    const { success, error: toastError } = useToast();

    const [activeTab, setActiveTab] = useState("my-posts"); // 'my-posts' | 'liked-posts'
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

    // Fetch all posts (current user gets their public + private posts)
    const { data: allPosts = [] } = useQuery({
        queryKey: ["posts"],
        queryFn: () => getPosts(),
    });

    // Fetch liked posts for current user
    const { data: likedPosts = [] } = useQuery({
        queryKey: ["posts", "liked"],
        queryFn: () => getLikedPosts(),
        enabled: Boolean(user),
    });

    const userPosts = allPosts.filter(
        (p) => user && (p.authorId === user.id || p.user_name === user.name)
    );

    const publicPostsCount = userPosts.filter((p) => p.visibility !== "private").length;
    const privatePostsCount = userPosts.filter((p) => p.visibility === "private").length;
    const totalLikesReceived = userPosts.reduce((acc, p) => acc + (p.upvotes || 0), 0);

    const handleSwitchAccount = async (email, username, displayName) => {
        try {
            await switchAccount({ email, username, name: displayName });
            await queryClient.invalidateQueries({ queryKey: ["posts"] });
            await queryClient.invalidateQueries({ queryKey: ["posts", "liked"] });
            success(`Switched account to ${displayName || username}!`);
        } catch (err) {
            toastError(err.message || "Failed to switch account");
        }
    };

    if (!user) {
        return (
            <section className="max-w-4xl mx-auto px-4 py-8">
                <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 p-8 sm:p-12 text-center shadow-sm">
                    <div className="mx-auto w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-3xl mb-4">
                        👤
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                        Sign In to Your Profile
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                        Connect with GitHub or select a demo creator profile to view your published posts, activity, and manage your account.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={openAuthModal}
                            className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md transition"
                        >
                            Sign In / Open Auth
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 max-w-sm mx-auto text-left">
                        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 text-center">
                            Or Quick Sign In
                        </p>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => handleSwitchAccount("mohsinali031332@gmail.com", "mohsinali", "Mohsin Ali")}
                                className="w-full text-left px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-xs font-medium transition flex items-center justify-between"
                            >
                                <span className="font-bold text-zinc-900 dark:text-white">Mohsin Ali (Creator)</span>
                                <span className="text-indigo-600 dark:text-indigo-400">Select →</span>
                            </button>
                            <button
                                onClick={() => handleSwitchAccount("design@example.com", "designstudio", "Design Studio")}
                                className="w-full text-left px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-xs font-medium transition flex items-center justify-between"
                            >
                                <span className="font-bold text-zinc-900 dark:text-white">Design Studio (Designer)</span>
                                <span className="text-indigo-600 dark:text-indigo-400">Select →</span>
                            </button>
                            <button
                                onClick={() => handleSwitchAccount("alex@example.com", "alexriver", "Alex River")}
                                className="w-full text-left px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-xs font-medium transition flex items-center justify-between"
                            >
                                <span className="font-bold text-zinc-900 dark:text-white">Alex River (Photographer)</span>
                                <span className="text-indigo-600 dark:text-indigo-400">Select →</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    const currentTabPosts = activeTab === "my-posts" ? userPosts : likedPosts;

    return (
        <section className="max-w-4xl mx-auto px-4 py-8">
            {/* Profile Header Card */}
            <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 sm:p-8 shadow-sm mb-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Avatar */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-indigo-500/20 bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center text-3xl font-bold shrink-0 shadow-sm">
                        {user?.user_metadata?.avatar_url ? (
                            <img
                                src={user.user_metadata.avatar_url}
                                alt={user.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            user?.name?.charAt(0) || "U"
                        )}
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                                    {user?.name || "Anonymous Member"}
                                    <ShieldCheck size={20} className="text-indigo-500" />
                                    {user?.isPrivateAccount && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 font-medium">
                                            🔒 Private Account
                                        </span>
                                    )}
                                </h1>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                                    @{user?.username || user?.name?.toLowerCase().replace(/\s+/g, "") || "user"}
                                </p>
                            </div>

                            {/* Edit Profile & Account switcher */}
                            <div className="flex flex-wrap items-center justify-center gap-2">
                                <button
                                    onClick={() => setIsEditProfileOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
                                >
                                    <Edit3 size={13} />
                                    Edit Profile
                                </button>

                                <button
                                    onClick={() => handleSwitchAccount("mohsinali031332@gmail.com", "mohsinali", "Mohsin Ali")}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                                        user?.email === "mohsinali031332@gmail.com"
                                            ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                                            : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800"
                                    }`}
                                >
                                    Mohsin
                                </button>
                                <button
                                    onClick={() => handleSwitchAccount("design@example.com", "designstudio", "Design Studio")}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                                        user?.email === "design@example.com"
                                            ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                                            : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800"
                                    }`}
                                >
                                    Design Studio
                                </button>
                            </div>
                        </div>

                        {/* Bio */}
                        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300 max-w-xl">
                            {user?.bio || "No bio added yet. Click 'Edit Profile' to share more about yourself."}
                        </p>

                        {/* Meta information */}
                        <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                            <span className="flex items-center gap-1.5">
                                <Mail size={14} />
                                {user?.email || "guest@socialmedia.app"}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar size={14} />
                                Joined Recently
                            </span>
                        </div>

                        {/* Stats counters */}
                        <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
                            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60">
                                <p className="text-lg font-bold text-zinc-900 dark:text-white">
                                    {userPosts.length}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Posts</p>
                            </div>

                            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60">
                                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center sm:justify-start gap-1">
                                    <Globe size={15} />
                                    {publicPostsCount}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Public Posts</p>
                            </div>

                            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60">
                                <p className="text-lg font-bold text-amber-600 dark:text-amber-400 flex items-center justify-center sm:justify-start gap-1">
                                    <Lock size={15} />
                                    {privatePostsCount}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Private Posts</p>
                            </div>

                            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60">
                                <p className="text-lg font-bold text-rose-600 dark:text-rose-400 flex items-center justify-center sm:justify-start gap-1">
                                    <Heart size={15} />
                                    {totalLikesReceived}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Likes Received</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-6">
                <button
                    type="button"
                    onClick={() => setActiveTab("my-posts")}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${
                        activeTab === "my-posts"
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    }`}
                >
                    <UserCheck size={16} />
                    My Posts ({userPosts.length})
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("liked-posts")}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${
                        activeTab === "liked-posts"
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    }`}
                >
                    <Heart size={16} />
                    Liked Posts ({likedPosts.length})
                </button>
            </div>

            {/* Posts Activity Section */}
            <div>
                {currentTabPosts.length === 0 ? (
                    <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 p-10 text-center">
                        <div className="mx-auto w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-400 flex items-center justify-center text-xl mb-3">
                            {activeTab === "my-posts" ? "📝" : "❤️"}
                        </div>
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                            {activeTab === "my-posts"
                                ? "You haven't published any posts yet."
                                : "You haven't liked any posts yet."}
                        </h3>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            {activeTab === "my-posts"
                                ? "Click 'Create Post' in the top bar to share something with the community!"
                                : "Explore the feed and tap the heart icon on posts you like."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {currentTabPosts.map((post) => (
                            <PostList key={post.id} post={post} />
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Profile Modal */}
            <EditProfileModal
                isOpen={isEditProfileOpen}
                onClose={() => setIsEditProfileOpen(false)}
            />
        </section>
    );
}
