import React from "react";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "../supabase";
import { useAuth } from "../context/Auth_Context";

// ===============================
// Fetch votes for a specific post
// ===============================
const fetchVotes = async (postId) => {
    if (!postId) {
        throw new Error("Post ID is required");
    }

    const { data, error } = await supabase
        .from("votes")
        .select("vote")
        .eq("post_id", postId);

    if (error) {
        throw error;
    }

    return data ?? [];
};

// ===============================
// Add / Update / Delete Vote
// ===============================
const vote = async ({ postId, userId, voteType }) => {
    // Validate input
    if (!postId) {
        throw new Error("Post ID is required");
    }

    if (!userId) {
        throw new Error("Please login first");
    }

    if (![1, -1].includes(voteType)) {
        throw new Error("Invalid vote type");
    }

    // Check if current user already voted on this post
    const { data: existingVote, error: fetchError } = await supabase
        .from("votes")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .maybeSingle();

    if (fetchError) {
        throw fetchError;
    }

    // =========================================
    // User already has the same vote
    // Remove the vote
    // =========================================
    if (existingVote && existingVote.vote === voteType) {
        const { error: deleteError } = await supabase
            .from("votes")
            .delete()
            .eq("post_id", postId)
            .eq("user_id", userId);

        if (deleteError) {
            throw deleteError;
        }

        return {
            action: "deleted",
        };
    }

    // =========================================
    // User has opposite vote
    // Change the vote
    // =========================================
    if (existingVote) {
        const { error: updateError } = await supabase
            .from("votes")
            .update({
                vote: voteType,
            })
            .eq("post_id", postId)
            .eq("user_id", userId);

        if (updateError) {
            throw updateError;
        }

        return {
            action: "updated",
        };
    }

    // =========================================
    // User has no vote
    // Create new vote
    // =========================================
    const { error: insertError } = await supabase
        .from("votes")
        .insert([
            {
                post_id: postId,
                user_id: userId,
                vote: voteType,
            },
        ]);

    if (insertError) {
        throw insertError;
    }

    return {
        action: "created",
    };
};

// ===============================
// Like Section Component
// ===============================
const LikeSection = ({ postId }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // ===============================
    // Fetch votes
    // ===============================
    const {
        data: votes = [],
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["votes", postId],
        queryFn: () => fetchVotes(postId),
        enabled: !!postId,
        refetchInterval: 5000,
    });

    // ===============================
    // Vote mutation
    // ===============================
    const {
        mutate,
        isPending,
    } = useMutation({
        mutationFn: (voteType) => {
            if (!user) {
                throw new Error("Please login first to vote");
            }

            return vote({
                postId,
                userId: user.id,
                voteType,
            });
        },

        onSuccess: () => {
            // Refresh votes after successful mutation
            queryClient.invalidateQueries({
                queryKey: ["votes", postId],
            });
        },

        onError: (error) => {
            console.error("Vote error:", error);
        },
    });

    // ===============================
    // Count likes & dislikes
    // ===============================
    const likeCount = votes.filter(
        (vote) => vote.vote === 1
    ).length;

    const dislikeCount = votes.filter(
        (vote) => vote.vote === -1
    ).length;

    // ===============================
    // Loading state
    // ===============================
    if (isLoading) {
        return (
            <div className="flex items-center gap-3 mt-6">
                <span>Loading votes...</span>
            </div>
        );
    }

    // ===============================
    // Error state
    // ===============================
    if (isError) {
        return (
            <div className="mt-6 text-red-500">
                Error loading votes: {error.message}
            </div>
        );
    }

    // ===============================
    // UI
    // ===============================
    return (
        <div className="flex items-center gap-3 mt-6">
            <button
                type="button"
                disabled={isPending}
                onClick={() => mutate(1)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
                👍 {likeCount}
            </button>

            <button
                type="button"
                disabled={isPending}
                onClick={() => mutate(-1)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
                👎 {dislikeCount}
            </button>
        </div>
    );
};

export default LikeSection;