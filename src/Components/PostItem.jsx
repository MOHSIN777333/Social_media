import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase";
import PostList from "./PostList";

// =====================================================
// Fetch posts
// =====================================================
const fetchPosts = async () => {
    const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(`Failed to fetch posts: ${error.message}`);
    }

    return data ?? [];
};

// =====================================================
// Skeleton Card
// =====================================================
const PostSkeleton = () => {
    return (
        <div className="animate-pulse overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-950">
            <div className="aspect-video w-full bg-zinc-200 dark:bg-zinc-800" />

            <div className="space-y-3 p-4">
                <div className="h-5 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-4 w-5/6 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-8 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            </div>
        </div>
    );
};

// =====================================================
// Post Item / Post Feed
// =====================================================
const PostItem = () => {
    const {
        data: posts = [],
        error,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ["posts"],
        queryFn: fetchPosts,
        staleTime: 30_000,
        retry: 1,
    });

    // ===================================================
    // Loading
    // ===================================================
    if (isLoading) {
        return (
            <section className="w-full px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-7xl">
                    <div className="mb-6">
                        <div className="h-8 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                    </div>

                    <div
                        className="
              grid
              grid-cols-1
              gap-5
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
            "
                    >
                        {Array.from({ length: 8 }).map((_, index) => (
                            <PostSkeleton key={index} />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // ===================================================
    // Error
    // ===================================================
    if (isError) {
        return (
            <section className="w-full px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-7xl">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-500/20 dark:bg-red-500/10">
                        <h2 className="font-semibold text-red-700 dark:text-red-300">
                            Unable to load posts
                        </h2>

                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {error?.message || "Something went wrong while loading posts."}
                        </p>

                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="
                mt-4
                rounded-full
                bg-red-600
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-red-700
              "
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    // ===================================================
    // Empty state
    // ===================================================
    if (posts.length === 0) {
        return (
            <section className="w-full px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-7xl">
                    <div className="rounded-3xl border border-zinc-200 bg-white p-10 text-center dark:border-white/10 dark:bg-zinc-950">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                            No posts yet
                        </h2>

                        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                            Be the first person to create a post.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    // ===================================================
    // Posts
    // ===================================================
    return (
        <section
            className="
        w-full
        px-4
        py-8
        sm:px-6
        lg:px-8
      "
        >
            <div className="mx-auto w-full max-w-7xl">
                {/* Heading */}
                <div className="mb-6">
                    <h2
                        className="
              text-2xl
              font-bold
              tracking-tight
              text-zinc-900
              sm:text-3xl
              dark:text-white
            "
                    >
                        Recent Posts
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Discover the latest posts from the community.
                    </p>
                </div>

                {/* Responsive Grid */}
                <div
                    className="
            grid
            grid-cols-1
            gap-5
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
          "
                >
                    {posts.map((post) => (
                        <PostList
                            key={post.id}
                            post={post}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PostItem;