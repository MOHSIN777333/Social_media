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

import { getVotes, submitVote } from "../api";
import { useAuth } from "../context/Auth_Context";
import { useToast } from "../context/Toast_Context";

const LikeSection = ({ postId }) => {
    const { user, openAuthModal } = useAuth();
    const { error: toastError } = useToast();
    const queryClient = useQueryClient();

    // ---------------------------------------------------
    // Fetch votes
    // ---------------------------------------------------
    const {
        data: voteData = { votes: [], upvotes: 0, downvotes: 0 },
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["votes", postId],
        queryFn: () => getVotes(postId),
        enabled: Boolean(postId),
        staleTime: 10_000,
    });

    const votes = voteData.votes || [];

    // Current user's vote
    const currentUserVote =
        votes.find((item) => item.user_id === user?.id)?.vote ?? null;

    const likeCount = voteData.upvotes ?? votes.filter((item) => item.vote === 1).length;
    const dislikeCount = voteData.downvotes ?? votes.filter((item) => item.vote === -1).length;

    // ---------------------------------------------------
    // Optimistic Mutation
    // ---------------------------------------------------
    const { mutate, isPending } = useMutation({
        mutationFn: (voteType) => {
            return submitVote(postId, voteType);
        },
        onMutate: async (voteType) => {
            await queryClient.cancelQueries({ queryKey: ["votes", postId] });
            const previousVotes = queryClient.getQueryData(["votes", postId]);

            queryClient.setQueryData(["votes", postId], (old = { votes: [], upvotes: 0, downvotes: 0 }) => {
                const currentVote = old.votes?.find((v) => v.user_id === user?.id)?.vote;
                let nextVotes = [...(old.votes || [])];
                if (currentVote === voteType) {
                    // toggle off
                    nextVotes = nextVotes.filter((v) => v.user_id !== user?.id);
                } else if (currentVote !== undefined) {
                    // change vote
                    nextVotes = nextVotes.map((v) => v.user_id === user?.id ? { ...v, vote: voteType } : v);
                } else {
                    // new vote
                    nextVotes.push({ id: `temp-${Date.now()}`, post_id: postId, user_id: user?.id, vote: voteType });
                }
                const upvotes = nextVotes.filter((v) => v.vote === 1).length;
                const downvotes = nextVotes.filter((v) => v.vote === -1).length;
                return {
                    ...old,
                    votes: nextVotes,
                    upvotes,
                    downvotes,
                    score: upvotes - downvotes,
                };
            });

            return { previousVotes };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousVotes) {
                queryClient.setQueryData(["votes", postId], context.previousVotes);
            }
            toastError("Failed to update reaction");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["votes", postId] });
            queryClient.invalidateQueries({ queryKey: ["post", postId] });
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
    });

    const handleVote = (voteType) => {
        if (!user) {
            toastError("Please login to react to posts.");
            openAuthModal();
            return;
        }
        mutate(voteType);
    };

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
                onClick={() => handleVote(1)}
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
                onClick={() => handleVote(-1)}
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
