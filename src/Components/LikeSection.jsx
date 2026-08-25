import React from "react";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    Heart,
    ThumbsDown,
    Loader2,
} from "lucide-react";

import { supabase } from "../supabase";
import { useAuth } from "../context/Auth_Context";

// =====================================================
// Fetch votes
// =====================================================
const fetchVotes = async (postId) => {
    if (!postId) {
        throw new Error("Post ID is required");
    }

    const { data, error } = await supabase
        .from("votes")
        .select("user_id, vote")
        .eq("post_id", postId);

    if (error) {
        throw error;
    }

    return data ?? [];
};

// =====================================================
// Create / Update / Delete vote
// =====================================================
const votePost = async ({ postId, userId, voteType }) => {
    if (!postId) {
        throw new Error("Post ID is required");
    }

    if (!userId) {
        throw new Error("Please login first");
    }

    if (![1, -1].includes(voteType)) {
        throw new Error("Invalid vote type");
    }

    const { data: existingVote, error: fetchError } = await supabase
        .from("votes")
        .select("id, vote")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .maybeSingle();

    if (fetchError) {
        throw fetchError;
    }

    // User clicked the same vote again -> remove vote
    if (existingVote?.vote === voteType) {
        const { error: deleteError } = await supabase
            .from("votes")
            .delete()
            .eq("id", existingVote.id);

        if (deleteError) {
            throw deleteError;
        }

        return {
            action: "deleted",
            voteType: null,
        };
    }

    // User changes vote
    if (existingVote) {
        const { error: updateError } = await supabase
            .from("votes")
            .update({
                vote: voteType,
            })
            .eq("id", existingVote.id);

        if (updateError) {
            throw updateError;
        }

        return {
            action: "updated",
            voteType,
        };
    }

    // New vote
    const { error: insertError } = await supabase
        .from("votes")
        .insert({
            post_id: postId,
            user_id: userId,
            vote: voteType,
        });

    if (insertError) {
        throw insertError;
    }

    return {
        action: "created",
        voteType,
    };
};

// =====================================================
// Like Section
// =====================================================
const LikeSection = ({ postId }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // ---------------------------------------------------
    // Fetch votes
    // ---------------------------------------------------
    const {
        data: votes = [],
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["votes", postId],
        queryFn: () => fetchVotes(postId),
        enabled: Boolean(postId),

        // Don't constantly poll the database.
        staleTime: 10_000,
    });

    // ---------------------------------------------------
    // Current user's vote
    // ---------------------------------------------------
    const currentUserVote =
        votes.find((item) => item.user_id === user?.id)?.vote ?? null;

    // ---------------------------------------------------
    // Counts
    // ---------------------------------------------------
    const likeCount = votes.filter(
        (item) => item.vote === 1
    ).length;

    const dislikeCount = votes.filter(
        (item) => item.vote === -1
    ).length;

    // ---------------------------------------------------
    // Mutation
    // ---------------------------------------------------
    const { mutate, isPending } = useMutation({
        mutationFn: (voteType) => {
            if (!user) {
                throw new Error("Please login first to vote");
            }

            return votePost({
                postId,
                userId: user.id,
                voteType,
            });
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["votes", postId],
            });
        },

        onError: (mutationError) => {
            console.error("Vote error:", mutationError);
        },
    });

    // ---------------------------------------------------
    // Loading
    // ---------------------------------------------------
    if (isLoading) {
        return (
            <div className="mt-4 flex items-center gap-2">
                <div className="h-9 w-20 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-9 w-20 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
            </div>
        );
    }

    // ---------------------------------------------------
    // Error
    // ---------------------------------------------------
    if (isError) {
        return (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                Failed to load reactions.
            </div>
        );
    }

    // ---------------------------------------------------
    // UI
    // ---------------------------------------------------
    return (
        <div className="mt-4 flex items-center gap-2 sm:gap-3">
            {/* Like */}
            <button
                type="button"
                disabled={isPending}
                onClick={() => mutate(1)}
                aria-label="Like post"
                aria-pressed={currentUserVote === 1}
                className={`
          group
          inline-flex
          h-10
          items-center
          gap-2
          rounded-full
          border
          px-3
          text-sm
          font-medium
          transition-all
          duration-200
          disabled:cursor-not-allowed
          disabled:opacity-60
          sm:px-4
          ${currentUserVote === 1
                        ? "border-red-200 bg-red-50 text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
                        : "border-zinc-200 bg-white text-zinc-600 hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-red-500/20 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    }
        `}
            >
                {isPending && currentUserVote !== 1 ? (
                    <Loader2 size={17} className="animate-spin" />
                ) : (
                    <Heart
                        size={17}
                        strokeWidth={2}
                        className={`
              transition-transform
              duration-200
              group-hover:scale-110
              ${currentUserVote === 1 ? "fill-current" : ""}
            `}
                    />
                )}

                <span>{likeCount}</span>
            </button>

            {/* Dislike */}
            <button
                type="button"
                disabled={isPending}
                onClick={() => mutate(-1)}
                aria-label="Dislike post"
                aria-pressed={currentUserVote === -1}
                className={`
          group
          inline-flex
          h-10
          items-center
          gap-2
          rounded-full
          border
          px-3
          text-sm
          font-medium
          transition-all
          duration-200
          disabled:cursor-not-allowed
          disabled:opacity-60
          sm:px-4
          ${currentUserVote === -1
                        ? "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400"
                        : "border-zinc-200 bg-white text-zinc-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-blue-500/20 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                    }
        `}
            >
                <ThumbsDown
                    size={17}
                    strokeWidth={2}
                    className={`
            transition-transform
            duration-200
            group-hover:scale-110
            ${currentUserVote === -1 ? "fill-current" : ""}
          `}
                />

                <span>{dislikeCount}</span>
            </button>
        </div>
    );
};

export default LikeSection;