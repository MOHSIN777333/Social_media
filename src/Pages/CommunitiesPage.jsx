import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Loader2, Compass, Check } from "lucide-react";
import { useNavigate } from "react-router";
import { getCommunities, createCommunity, toggleCommunityJoin } from "../api";
import { useToast } from "../context/Toast_Context";
import { useAuth } from "../context/Auth_Context";

export default function CommunitiesPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, openAuthModal } = useAuth();
    const { success, error: toastError, info } = useToast();
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [icon, setIcon] = useState("🚀");

    const [joinedIds, setJoinedIds] = useState(() => {
        try {
            const saved = localStorage.getItem("joined_communities");
            return saved ? JSON.parse(saved) : ["comm-1"];
        } catch {
            return ["comm-1"];
        }
    });

    const { data: communities = [], isLoading } = useQuery({
        queryKey: ["communities"],
        queryFn: getCommunities,
    });

    const { mutate: createCommMutation, isPending } = useMutation({
        mutationFn: createCommunity,
        onSuccess: (newComm) => {
            setShowModal(false);
            setName("");
            setDescription("");
            queryClient.invalidateQueries({ queryKey: ["communities"] });
            success(`Community "${newComm?.community?.name || name}" created successfully!`);
        },
        onError: (err) => {
            toastError(err.message || "Failed to create community");
        },
    });

    const handleCreate = (e) => {
        e.preventDefault();
        if (!user) {
            toastError("Please sign in to create a community.");
            openAuthModal();
            return;
        }
        if (!name.trim()) return;
        createCommMutation({ name: name.trim(), description: description.trim(), icon });
    };

    const handleToggleJoin = async (comm) => {
        if (!user) {
            toastError("Please sign in to join communities.");
            openAuthModal();
            return;
        }

        const isCurrentlyJoined = joinedIds.includes(comm.id) || joinedIds.includes(comm.slug);
        const willJoin = !isCurrentlyJoined;

        try {
            await toggleCommunityJoin(comm.id || comm.slug, willJoin);
            const nextJoined = willJoin
                ? [...joinedIds, comm.id]
                : joinedIds.filter((id) => id !== comm.id && id !== comm.slug);
            setJoinedIds(nextJoined);
            localStorage.setItem("joined_communities", JSON.stringify(nextJoined));
            queryClient.invalidateQueries({ queryKey: ["communities"] });

            if (willJoin) {
                success(`Joined ${comm.name}!`);
            } else {
                info(`Left ${comm.name}.`);
            }
        } catch (err) {
            toastError(err.message || "Failed to update membership");
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-2.5">
                        <Compass className="text-indigo-500" />
                        Explore Communities
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Join discussions, share specialized posts, and follow creator circles.
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
                >
                    <Plus size={18} />
                    Create Community
                </button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-44 rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-zinc-900/50 animate-pulse"
                        />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {communities.map((comm) => (
                        <div
                            key={comm.id}
                            className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/80 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition"
                        >
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-2xl">
                                        {comm.icon || "🌐"}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                                            {comm.name}
                                        </h3>
                                        <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                            <Users size={12} />
                                            {comm.memberCount || 1} members
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-3">
                                    {comm.description || "A community for creative discussions."}
                                </p>
                            </div>

                            <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                <button
                                    onClick={() => navigate(`/?community=${encodeURIComponent(comm.name)}`)}
                                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    Browse Feed →
                                </button>
                                <button
                                    onClick={() => handleToggleJoin(comm)}
                                    className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                                        joinedIds.includes(comm.id) || joinedIds.includes(comm.slug)
                                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                                    }`}
                                >
                                    {(joinedIds.includes(comm.id) || joinedIds.includes(comm.slug)) && (
                                        <Check size={13} strokeWidth={2.5} />
                                    )}
                                    {joinedIds.includes(comm.id) || joinedIds.includes(comm.slug) ? "Joined" : "Join"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Community Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
                            New Community
                        </h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                                    Community Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. React & TypeScript"
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                                    Icon / Emoji
                                </label>
                                <input
                                    type="text"
                                    value={icon}
                                    onChange={(e) => setIcon(e.target.value)}
                                    maxLength={4}
                                    className="w-20 px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-xl text-center outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="What is this community about?"
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-full text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!name.trim() || isPending}
                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                                >
                                    {isPending && <Loader2 size={16} className="animate-spin" />}
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
