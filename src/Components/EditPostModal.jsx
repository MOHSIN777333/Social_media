import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { X, Loader2, Globe, Lock, Check } from "lucide-react";
import { updatePost, getCommunities } from "../api";
import { useToast } from "../context/Toast_Context";

function EditPostForm({ post, onClose }) {
    const queryClient = useQueryClient();
    const { success, error: toastError } = useToast();

    const [title, setTitle] = useState(post?.title || "");
    const [content, setContent] = useState(post?.content || "");
    const [community, setCommunity] = useState(post?.community || "General");
    const [visibility, setVisibility] = useState(post?.visibility || "public");

    const { data: communities = [] } = useQuery({
        queryKey: ["communities"],
        queryFn: getCommunities,
    });

    const { mutate: handleUpdate, isPending } = useMutation({
        mutationFn: async () => {
            if (!title.trim()) throw new Error("Title cannot be empty");
            if (!content.trim()) throw new Error("Content cannot be empty");
            return await updatePost(post.id, {
                title: title.trim(),
                content: content.trim(),
                community,
                visibility,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["post", post.id] });
            success("Post updated successfully!");
            onClose();
        },
        onError: (err) => {
            toastError(err.message || "Failed to update post");
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        handleUpdate();
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Title */}
            <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Post Title
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter post title..."
                    className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                    required
                />
            </div>

            {/* Community */}
            <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Community
                </label>
                <select
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                >
                    <option value="General">🌐 General</option>
                    {communities.map((c) => (
                        <option key={c.id} value={c.name}>
                            {c.icon} {c.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Visibility Settings */}
            <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Privacy & Visibility
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setVisibility("public")}
                        className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition ${
                            visibility === "public"
                                ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200"
                                : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                        }`}
                    >
                        <Globe size={18} className={visibility === "public" ? "text-indigo-600" : "text-zinc-400"} />
                        <div className="min-w-0">
                            <p className="text-xs font-bold leading-tight">Public</p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">Visible to all</p>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setVisibility("private")}
                        className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition ${
                            visibility === "private"
                                ? "border-amber-600 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200"
                                : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                        }`}
                    >
                        <Lock size={18} className={visibility === "private" ? "text-amber-600" : "text-zinc-400"} />
                        <div className="min-w-0">
                            <p className="text-xs font-bold leading-tight">Private</p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">Only you</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Post Content
                </label>
                <textarea
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your post content..."
                    className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition resize-none"
                    required
                />
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition disabled:opacity-50"
                >
                    {isPending ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Check size={14} />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}

export default function EditPostModal({ isOpen, onClose, post }) {
    if (!isOpen || !post) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div
                className="w-full max-w-lg rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                        Edit Post
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                <EditPostForm key={post.id} post={post} onClose={onClose} />
            </div>
        </div>
    );
}
