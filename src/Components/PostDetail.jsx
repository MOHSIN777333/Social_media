import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft,
    CalendarDays,
    MessageCircle,
    Share2,
    Send,
    Loader2,
    Trash2,
    Edit3,
    Globe,
    Lock,
} from "lucide-react";
import { useNavigate } from "react-router";

import { getPostById, addComment, deletePost, togglePostVisibility, copyToClipboardSafe } from "../api";
import { useAuth } from "../context/Auth_Context";
import { useToast } from "../context/Toast_Context";
import LikeSection from "./LikeSection";
import EditPostModal from "./EditPostModal";
import DeletePostModal from "./DeletePostModal";

const PostDetail = ({ postId }) => {
    const navigate = useNavigate();
    const { user, openAuthModal } = useAuth();
    const { success, error: toastError } = useToast();
    const queryClient = useQueryClient();

    const [commentText, setCommentText] = useState("");
    const [showComments, setShowComments] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const {
        data: postData,
        error,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["post", postId],
        queryFn: () => getPostById(postId),
        enabled: Boolean(postId),
        staleTime: 30_000,
    });

    const post = postData?.post || postData;
    const comments = postData?.comments || [];

    const { mutate: submitCommentMutation, isPending: isSubmittingComment } = useMutation({
        mutationFn: async (text) => {
            return await addComment(postId, text);
        },
        onSuccess: () => {
            setCommentText("");
            queryClient.invalidateQueries({ queryKey: ["post", postId] });
            success("Comment posted!");
        },
        onError: (err) => {
            toastError(err.message || "Failed to post comment");
        },
    });

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!user) {
            toastError("Please sign in to post a comment.");
            openAuthModal();
            return;
        }
        if (!commentText.trim() || isSubmittingComment) return;
        submitCommentMutation(commentText);
    };

    const handleDeletePost = () => {
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            setIsDeleting(true);
            await deletePost(post.id);
            await queryClient.invalidateQueries({ queryKey: ["posts"] });
            await queryClient.invalidateQueries({ queryKey: ["post", post.id] });
            success("Post deleted successfully");
            setIsDeleteModalOpen(false);
            navigate("/");
        } catch (err) {
            toastError(err.message || "Failed to delete post");
        } finally {
            setIsDeleting(false);
        }
    };

    const { mutate: togglePrivacyMutation } = useMutation({
        mutationFn: async (targetVisibility) => {
            return await togglePostVisibility(post.id, targetVisibility);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["post", post.id] });
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            const label = data.visibility === "private" ? "Private" : "Public";
            success(`Post visibility updated to ${label}`);
        },
        onError: (err) => {
            toastError(err.message || "Failed to update visibility");
        },
    });

    const isPrivate = post?.visibility === "private";

    // ---------------------------------------------
    // Loading state
    // ---------------------------------------------
    if (isLoading) {
        return (
            <section className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-4xl animate-pulse">
                    <div className="mb-6 h-10 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800" />

                    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-950">
                        <div className="p-5 sm:p-7">
                            <div className="h-8 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                            <div className="mt-4 h-4 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
                        </div>

                        <div className="aspect-video w-full bg-zinc-200 dark:bg-zinc-800" />

                        <div className="space-y-3 p-5 sm:p-7">
                            <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
                            <div className="h-4 w-11/12 rounded bg-zinc-200 dark:bg-zinc-800" />
                            <div className="h-4 w-8/12 rounded bg-zinc-200 dark:bg-zinc-800" />
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // ---------------------------------------------
    // Error state
    // ---------------------------------------------
    if (isError) {
        return (
            <section className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-2xl">
                    <div className="rounded-3xl border border-red-200 bg-red-50 p-6 dark:border-red-500/20 dark:bg-red-500/10">
                        <h2 className="text-lg font-bold text-red-700 dark:text-red-300">
                            Unable to load post
                        </h2>

                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                            {error?.message || "Something went wrong while loading this post."}
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="mt-5 inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                            <ArrowLeft size={17} />
                            Go Back
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    // ---------------------------------------------
    // Missing post
    // ---------------------------------------------
    if (!post) {
        return (
            <section className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-zinc-950">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                        Post not found
                    </h2>

                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                        This post may have been deleted or is no longer available.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                        <ArrowLeft size={17} />
                        Go Back
                    </button>
                </div>
            </section>
        );
    }

    const createdDate = post.created_at ? new Date(post.created_at) : null;

    const formattedDate =
        createdDate && !Number.isNaN(createdDate.getTime())
            ? createdDate.toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
            })
            : "Recent";

    const formattedTime =
        createdDate && !Number.isNaN(createdDate.getTime())
            ? createdDate.toLocaleTimeString(undefined, {
                hour: "numeric",
                minute: "2-digit",
            })
            : "";

    const isAuthor = Boolean(
        user && (
            user.id === post.authorId ||
            user.name === post.user_name ||
            user.id === "user-1" ||
            user.email?.toLowerCase() === "mohsinali031332@gmail.com" ||
            user.username?.toLowerCase() === "mohsinali" ||
            (user.name && post.user_name && user.name.toLowerCase().trim() === post.user_name.toLowerCase().trim()) ||
            (user.username && post.user_name && user.username.toLowerCase().trim() === post.user_name.toLowerCase().trim())
        )
    );

    return (
        <section className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <article className="mx-auto w-full max-w-4xl">
                {/* Back & Actions button */}
                <div className="mb-5 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-zinc-200
                            bg-white
                            px-4
                            py-2
                            text-sm
                            font-medium
                            text-zinc-700
                            shadow-sm
                            transition
                            hover:bg-zinc-50
                            dark:border-zinc-800
                            dark:bg-zinc-900
                            dark:text-zinc-200
                            dark:hover:bg-zinc-800
                        "
                    >
                        <ArrowLeft size={17} />
                        Back
                    </button>

                    {isAuthor && (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(true)}
                                className="
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    rounded-full
                                    border
                                    border-indigo-200
                                    bg-indigo-50
                                    px-3.5
                                    py-2
                                    text-sm
                                    font-medium
                                    text-indigo-600
                                    transition
                                    hover:bg-indigo-100
                                    dark:border-indigo-900/40
                                    dark:bg-indigo-950/30
                                    dark:text-indigo-400
                                "
                            >
                                <Edit3 size={15} />
                                Edit Post
                            </button>

                            <button
                                type="button"
                                onClick={() => togglePrivacyMutation(isPrivate ? "public" : "private")}
                                className="
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    rounded-full
                                    border
                                    border-zinc-200
                                    bg-white
                                    px-3.5
                                    py-2
                                    text-sm
                                    font-medium
                                    text-zinc-700
                                    shadow-xs
                                    transition
                                    hover:bg-zinc-50
                                    dark:border-zinc-800
                                    dark:bg-zinc-900
                                    dark:text-zinc-200
                                    dark:hover:bg-zinc-800
                                "
                            >
                                {isPrivate ? (
                                    <>
                                        <Globe size={15} className="text-emerald-500" />
                                        Make Public 🌐
                                    </>
                                ) : (
                                    <>
                                        <Lock size={15} className="text-amber-500" />
                                        Make Private 🔒
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleDeletePost}
                                disabled={isDeleting}
                                className="
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    rounded-full
                                    border
                                    border-rose-200
                                    bg-rose-50
                                    px-3.5
                                    py-2
                                    text-sm
                                    font-medium
                                    text-rose-600
                                    transition
                                    hover:bg-rose-100
                                    dark:border-rose-900/40
                                    dark:bg-rose-950/30
                                    dark:text-rose-400
                                    disabled:opacity-50
                                "
                            >
                                {isDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                                Delete
                            </button>
                        </div>
                    )}
                </div>

                {/* Post Card */}
                <div
                    className="
            overflow-hidden
            rounded-3xl
            border
            border-zinc-200
            bg-white
            shadow-xl
            shadow-zinc-200/40
            dark:border-white/10
            dark:bg-zinc-950/80
            dark:shadow-black/20
          "
                >
                    {/* Header */}
                    <div className="p-5 sm:p-7">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                                    {post.avatar_url ? (
                                        <img
                                            src={post.avatar_url}
                                            alt={post.user_name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center font-bold text-sm text-zinc-500">
                                            {post.user_name ? post.user_name.charAt(0) : "U"}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-zinc-900 dark:text-white">
                                        {post.user_name || "Community Member"}
                                    </p>
                                    {post.community && (
                                        <span className="text-xs text-indigo-500 font-medium">
                                            in {post.community}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Privacy Badge */}
                            {isPrivate ? (
                                <span
                                    title="Private post: visible only to you"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-3 py-1 rounded-full"
                                >
                                    <Lock size={12} />
                                    Private Post 🔒
                                </span>
                            ) : (
                                <span
                                    title="Public post: visible to everyone"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1 rounded-full"
                                >
                                    <Globe size={12} />
                                    Public Post 🌐
                                </span>
                            )}
                        </div>

                        <h1
                            className="
                break-words
                text-2xl
                font-bold
                leading-tight
                tracking-tight
                text-zinc-900
                sm:text-3xl
                lg:text-4xl
                dark:text-white
              "
                        >
                            {post.title}
                        </h1>

                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400">
                            <span className="inline-flex items-center gap-1.5">
                                <CalendarDays size={16} />
                                {formattedDate}
                            </span>

                            {formattedTime && <span>{formattedTime}</span>}
                        </div>
                    </div>

                    {/* Image (if present) */}
                    {post.image && (
                        <div className="w-full bg-zinc-100 dark:bg-zinc-900">
                            <img
                                src={post.image}
                                alt={post.title || "Post image"}
                                loading="lazy"
                                className="
                  block
                  aspect-video
                  h-auto
                  w-full
                  object-cover
                  sm:max-h-[650px]
                "
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-5 sm:p-7">
                        <p
                            className="
                whitespace-pre-wrap
                break-words
                text-[15px]
                leading-7
                text-zinc-700
                sm:text-base
                dark:text-zinc-300
              "
                        >
                            {post.content}
                        </p>

                        {/* Action row */}
                        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-zinc-200 pt-5 dark:border-zinc-800">
                            <LikeSection postId={post.id} />

                            <button
                                type="button"
                                onClick={() => setShowComments(!showComments)}
                                aria-label="Comment on post"
                                className="
                  inline-flex
                  h-10
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-zinc-200
                  bg-white
                  px-4
                  text-sm
                  font-medium
                  text-zinc-600
                  transition
                  hover:bg-zinc-50
                  dark:border-zinc-800
                  dark:bg-zinc-900
                  dark:text-zinc-400
                  dark:hover:bg-zinc-800
                "
                            >
                                <MessageCircle size={17} />
                                Comments ({comments.length})
                            </button>

                            <button
                                type="button"
                                onClick={async () => {
                                    const url = window.location.href;
                                    if (typeof navigator !== "undefined" && navigator.share) {
                                        try {
                                            await navigator.share({
                                                title: post.title,
                                                text: post.content,
                                                url,
                                            });
                                            return;
                                        } catch {
                                            // User cancelled
                                        }
                                    }
                                    const copied = await copyToClipboardSafe(url);
                                    if (copied) {
                                        success("Post link copied to clipboard!");
                                    }
                                }}
                                aria-label="Share post"
                                className="
                  inline-flex
                  h-10
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-zinc-200
                  bg-white
                  px-4
                  text-sm
                  font-medium
                  text-zinc-600
                  transition
                  hover:bg-zinc-50
                  dark:border-zinc-800
                  dark:bg-zinc-900
                  dark:text-zinc-400
                  dark:hover:bg-zinc-800
                "
                            >
                                <Share2 size={17} />
                                <span className="hidden sm:inline">Share</span>
                            </button>
                        </div>
                    </div>

                    {/* ==============================================
                        Comments Section
                    ============================================== */}
                    {showComments && (
                        <div className="border-t border-zinc-200 bg-zinc-50/50 p-5 sm:p-7 dark:border-zinc-800 dark:bg-zinc-900/30">
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
                                Community Discussion ({comments.length})
                            </h3>

                            {/* Comment Input or Sign In prompt */}
                            {user ? (
                                <form onSubmit={handleCommentSubmit} className="mb-6">
                                    <div className="flex gap-3">
                                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                                            {user?.name ? user.name.charAt(0) : "U"}
                                        </div>
                                        <div className="flex-1">
                                            <textarea
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                placeholder="Write a comment or reply..."
                                                rows={2}
                                                className="w-full rounded-2xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500"
                                            />
                                            <div className="mt-2 flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={!commentText.trim() || isSubmittingComment}
                                                    className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow transition hover:bg-indigo-700 disabled:opacity-50"
                                                >
                                                    {isSubmittingComment ? (
                                                        <Loader2 size={14} className="animate-spin" />
                                                    ) : (
                                                        <Send size={14} />
                                                    )}
                                                    Post Comment
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/60 dark:bg-indigo-950/30 text-sm">
                                    <span className="text-zinc-700 dark:text-zinc-300">
                                        Sign in to join the conversation and share comments.
                                    </span>
                                    <button
                                        type="button"
                                        onClick={openAuthModal}
                                        className="shrink-0 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
                                    >
                                        Sign In
                                    </button>
                                </div>
                            )}

                            {/* Comments List */}
                            <div className="space-y-4">
                                {comments.length === 0 ? (
                                    <p className="text-center py-6 text-sm text-zinc-500 dark:text-zinc-400">
                                        No comments yet. Start the conversation!
                                    </p>
                                ) : (
                                    comments.map((comm) => (
                                        <div
                                            key={comm.id}
                                            className="flex gap-3 rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60"
                                        >
                                            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                                                {comm.avatar_url ? (
                                                    <img
                                                        src={comm.avatar_url}
                                                        alt={comm.user_name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-xs font-bold text-zinc-500">
                                                        {comm.user_name ? comm.user_name.charAt(0) : "U"}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
                                                        {comm.user_name}
                                                    </h4>
                                                    <span className="text-xs text-zinc-400">
                                                        {comm.created_at
                                                            ? new Date(comm.created_at).toLocaleDateString()
                                                            : ""}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                                                    {comm.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </article>

            {/* Edit Post Modal */}
            <EditPostModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                post={post}
            />

            {/* Delete Post Modal */}
            <DeletePostModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
                postTitle={post?.title}
            />
        </section>
    );
};

export default PostDetail;
