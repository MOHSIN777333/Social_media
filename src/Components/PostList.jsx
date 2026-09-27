import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import {
    Heart,
    MessageCircle,
    Share2,
    MoreHorizontal,
    Trash2,
    Copy,
    Edit3,
    Globe,
    Lock,
} from "lucide-react";
import { useAuth } from "../context/Auth_Context";
import { useToast } from "../context/Toast_Context";
import { deletePost, togglePostLike, togglePostVisibility, copyToClipboardSafe } from "../api";
import EditPostModal from "./EditPostModal";

const PostList = ({ post }) => {
    const { user, openAuthModal } = useAuth();
    const { success, error: toastError } = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [showMenu, setShowMenu] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const menuRef = useRef(null);

    const isAuthor = Boolean(
        user && (user.id === post?.authorId || user.name === post?.user_name || user.id === "user-1")
    );

    const isPrivate = post?.visibility === "private";
    const isLiked = post?.userVote === 1;

    useEffect(() => {
        if (!showMenu) return;
        const handleOutsideClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };
        const handleKeyDown = (e) => {
            if (e.key === "Escape") setShowMenu(false);
        };
        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [showMenu]);

    const createdDate = post?.created_at
        ? new Date(post.created_at)
        : null;

    const formattedDate =
        createdDate && !Number.isNaN(createdDate.getTime())
            ? createdDate.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
            })
            : "";

    // -----------------------------------------------------------------
    // Optimistic Mutation for Likes
    // -----------------------------------------------------------------
    const { mutate: likeMutation } = useMutation({
        mutationFn: () => togglePostLike(post.id),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["posts"] });
            await queryClient.cancelQueries({ queryKey: ["post", post.id] });

            // Snapshot existing cache
            const previousPosts = queryClient.getQueriesData({ queryKey: ["posts"] });

            // Optimistically update list
            queryClient.setQueriesData({ queryKey: ["posts"] }, (oldData) => {
                if (!Array.isArray(oldData)) return oldData;
                return oldData.map((p) => {
                    if (p.id === post.id) {
                        const wasLiked = p.userVote === 1;
                        const nextUpvotes = wasLiked ? Math.max(0, (p.upvotes || 0) - 1) : (p.upvotes || 0) + 1;
                        return {
                            ...p,
                            userVote: wasLiked ? 0 : 1,
                            upvotes: nextUpvotes,
                            score: nextUpvotes - (p.downvotes || 0),
                        };
                    }
                    return p;
                });
            });

            return { previousPosts };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousPosts) {
                context.previousPosts.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            toastError("Failed to update like status");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["post", post.id] });
            queryClient.invalidateQueries({ queryKey: ["votes", post.id] });
        },
    });

    const handleLikeClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toastError("Please login to like this post");
            openAuthModal();
            return;
        }

        likeMutation();
    };

    const handleCommentClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toastError("Please login to comment on this post");
            openAuthModal();
            return;
        }

        navigate(`/post/${post.id}`);
    };

    // -----------------------------------------------------------------
    // Privacy Toggle Mutation
    // -----------------------------------------------------------------
    const { mutate: togglePrivacyMutation } = useMutation({
        mutationFn: async (targetVisibility) => {
            return await togglePostVisibility(post.id, targetVisibility);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["post", post.id] });
            const label = data.visibility === "private" ? "Private" : "Public";
            success(`Post visibility updated to ${label}`);
        },
        onError: (err) => {
            toastError(err.message || "Failed to update visibility");
        },
    });

    const handleTogglePrivacy = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowMenu(false);
        const nextVisibility = isPrivate ? "public" : "private";
        togglePrivacyMutation(nextVisibility);
    };

    const handleCopyLink = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowMenu(false);
        const url = `${window.location.origin}/post/${post.id}`;
        const copied = await copyToClipboardSafe(url);
        if (copied) {
            success("Post link copied to clipboard!");
        } else {
            toastError("Unable to copy link to clipboard");
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowMenu(false);
        if (!confirm("Are you sure you want to delete this post?")) return;
        try {
            setIsDeleting(true);
            await deletePost(post.id);
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            success("Post deleted successfully");
        } catch (err) {
            toastError(err.message || "Failed to delete post");
            setIsDeleting(false);
        }
    };

    const handleShare = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const url = `${window.location.origin}/post/${post.id}`;
        if (typeof navigator !== "undefined" && navigator.share) {
            try {
                await navigator.share({
                    title: post.title,
                    text: post.content,
                    url,
                });
                return;
            } catch {
                // User dismissed share dialog
            }
        }
        const copied = await copyToClipboardSafe(url);
        if (copied) {
            success("Post link copied to clipboard!");
        }
    };

    return (
        <>
            <article
                className="
                    group
                    relative
                    w-full
                    overflow-hidden
                    rounded-3xl
                    border
                    border-zinc-200
                    bg-white
                    shadow-xs
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-xl
                    dark:border-white/10
                    dark:bg-zinc-950
                    dark:hover:border-white/20
                "
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                    <div className="flex min-w-0 items-center gap-3">
                        {/* Avatar */}
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                            {post?.avatar_url ? (
                                <img
                                    src={post.avatar_url}
                                    alt={post?.user_name || "User"}
                                    loading="lazy"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-zinc-500 dark:text-zinc-400">
                                    {post?.user_name ? post.user_name.charAt(0) : "U"}
                                </div>
                            )}
                        </div>

                        {/* User info */}
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                                    {post?.user_name || "Community Member"}
                                </p>

                                {/* Privacy badge */}
                                {isPrivate ? (
                                    <span
                                        title="Private: Visible only to you"
                                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-full"
                                    >
                                        <Lock size={10} />
                                        Private
                                    </span>
                                ) : (
                                    <span
                                        title="Public: Visible to everyone"
                                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full"
                                    >
                                        <Globe size={10} />
                                        Public
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 mt-0.5">
                                {formattedDate && (
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                        {formattedDate}
                                    </p>
                                )}
                                {post?.community && (
                                    <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                                        {post.community}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* More options menu button */}
                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowMenu(!showMenu);
                            }}
                            aria-label="More options"
                            className="
                                rounded-full
                                p-2
                                text-zinc-400
                                hover:text-zinc-700
                                dark:hover:text-zinc-200
                                hover:bg-zinc-100
                                dark:hover:bg-zinc-800
                                transition
                            "
                        >
                            <MoreHorizontal size={18} />
                        </button>

                        {/* Dropdown Menu */}
                        {showMenu && (
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-10 z-20 w-48 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1.5 shadow-xl animate-in fade-in"
                            >
                                <button
                                    type="button"
                                    onClick={handleCopyLink}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                                >
                                    <Copy size={14} />
                                    Copy Post Link
                                </button>

                                {isAuthor && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowMenu(false);
                                                setIsEditModalOpen(true);
                                            }}
                                            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
                                        >
                                            <Edit3 size={14} />
                                            Edit Post
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleTogglePrivacy}
                                            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                                        >
                                            {isPrivate ? (
                                                <>
                                                    <Globe size={14} className="text-emerald-500" />
                                                    Make Public 🌐
                                                </>
                                            ) : (
                                                <>
                                                    <Lock size={14} className="text-amber-500" />
                                                    Make Private 🔒
                                                </>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                                        >
                                            <Trash2 size={14} />
                                            Delete Post
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Clickable Card Body */}
                <Link to={`/post/${post.id}`} className="block focus:outline-none">
                    {/* Image (if present) */}
                    {post?.image && (
                        <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                            <img
                                src={post.image}
                                alt={post.title || "Post image"}
                                loading="lazy"
                                className="
                                    h-full
                                    w-full
                                    object-cover
                                    transition-transform
                                    duration-500
                                    group-hover:scale-[1.02]
                                "
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="px-4 py-3">
                        <h3
                            className="
                                line-clamp-2
                                break-words
                                text-base
                                font-bold
                                leading-snug
                                text-zinc-900
                                transition-colors
                                group-hover:text-indigo-600
                                dark:text-white
                                dark:group-hover:text-indigo-400
                            "
                        >
                            {post?.title}
                        </h3>

                        <p
                            className="
                                mt-1.5
                                line-clamp-2
                                break-words
                                text-xs
                                leading-relaxed
                                text-zinc-600
                                dark:text-zinc-400
                            "
                        >
                            {post?.content}
                        </p>
                    </div>
                </Link>

                {/* Action Bar */}
                <div
                    className="
                        flex
                        items-center
                        justify-between
                        border-t
                        border-zinc-100
                        px-4
                        py-2.5
                        dark:border-zinc-800/80
                    "
                >
                    {/* Interactive Like button with Optimistic Updates */}
                    <button
                        type="button"
                        onClick={handleLikeClick}
                        className={`
                            flex
                            items-center
                            gap-1.5
                            rounded-full
                            px-3
                            py-1.5
                            text-xs
                            font-semibold
                            transition
                            ${
                                isLiked
                                    ? "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
                                    : "text-zinc-500 hover:bg-rose-50 hover:text-rose-600 dark:text-zinc-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                            }
                        `}
                    >
                        <Heart
                            size={16}
                            className={`transition-transform duration-200 ${
                                isLiked ? "fill-rose-500 text-rose-500 scale-110" : ""
                            }`}
                        />
                        <span>{post.upvotes > 0 ? post.upvotes : "Like"}</span>
                    </button>

                    {/* Comments button with Guest Interceptor */}
                    <button
                        type="button"
                        onClick={handleCommentClick}
                        className="
                            flex
                            items-center
                            gap-1.5
                            rounded-full
                            px-3
                            py-1.5
                            text-xs
                            font-medium
                            text-zinc-500
                            transition
                            hover:bg-indigo-50
                            hover:text-indigo-600
                            dark:text-zinc-400
                            dark:hover:bg-indigo-950/40
                            dark:hover:text-indigo-400
                        "
                    >
                        <MessageCircle size={16} />
                        <span>{post.commentsCount > 0 ? `${post.commentsCount}` : "Comment"}</span>
                    </button>

                    {/* Share */}
                    <button
                        type="button"
                        onClick={handleShare}
                        className="
                            flex
                            items-center
                            gap-1.5
                            rounded-full
                            px-3
                            py-1.5
                            text-xs
                            font-medium
                            text-zinc-500
                            transition
                            hover:bg-zinc-100
                            hover:text-zinc-900
                            dark:text-zinc-400
                            dark:hover:bg-zinc-800
                            dark:hover:text-white
                        "
                    >
                        <Share2 size={16} />
                        <span>Share</span>
                    </button>
                </div>
            </article>

            {/* Edit Post Modal */}
            <EditPostModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                post={post}
            />
        </>
    );
};

export default PostList;
