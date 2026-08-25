import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
    ArrowLeft,
    CalendarDays,
    MessageCircle,
    Share2,
} from "lucide-react";
import { useNavigate } from "react-router";

import { supabase } from "../supabase";
import LikeSection from "./LikeSection";

const fetchPostById = async (postId) => {
    if (!postId) {
        throw new Error("Post ID is required");
    }

    const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .single();

    if (error) {
        throw new Error(`Unable to fetch post: ${error.message}`);
    }

    return data;
};

const PostDetail = ({ postId }) => {
    const navigate = useNavigate();

    const {
        data: post,
        error,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["post", postId],
        queryFn: () => fetchPostById(postId),
        enabled: Boolean(postId),
        staleTime: 30_000,
    });

    // ---------------------------------------------
    // Loading state
    // ---------------------------------------------
    if (isLoading) {
        return (
            <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
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
            </main>
        );
    }

    // ---------------------------------------------
    // Error state
    // ---------------------------------------------
    if (isError) {
        return (
            <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
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
            </main>
        );
    }

    // ---------------------------------------------
    // Missing post
    // ---------------------------------------------
    if (!post) {
        return (
            <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
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
            </main>
        );
    }

    const createdDate = post.created_at
        ? new Date(post.created_at)
        : null;

    const formattedDate =
        createdDate && !Number.isNaN(createdDate.getTime())
            ? createdDate.toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
            })
            : "Unknown date";

    const formattedTime =
        createdDate && !Number.isNaN(createdDate.getTime())
            ? createdDate.toLocaleTimeString(undefined, {
                hour: "numeric",
                minute: "2-digit",
            })
            : "";

    return (
        <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <article className="mx-auto w-full max-w-4xl">
                {/* Back button */}
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="
            mb-5
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

                            {formattedTime && (
                                <span>{formattedTime}</span>
                            )}
                        </div>
                    </div>

                    {/* Image */}
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
                                Comment
                            </button>

                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        if (navigator.share) {
                                            await navigator.share({
                                                title: post.title,
                                                text: post.content,
                                                url: window.location.href,
                                            });
                                        } else {
                                            await navigator.clipboard.writeText(
                                                window.location.href
                                            );
                                        }
                                    } catch {
                                        // User cancelled the share dialog.
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
                </div>
            </article>
        </main>
    );
};

export default PostDetail;