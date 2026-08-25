import React from "react";
import { Link } from "react-router";
import {
    Heart,
    MessageCircle,
    Share2,
    MoreHorizontal,
} from "lucide-react";

const PostList = ({ post }) => {
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

    return (
        <article
            className="
        group
        w-full
        overflow-hidden
        rounded-2xl
        border
        border-zinc-200
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
        dark:border-white/10
        dark:bg-zinc-950
        dark:hover:border-white/15
      "
        >
            <Link
                to={`/post/${post.id}`}
                className="block focus:outline-none"
            >
                {/* =========================
            Post Header
        ========================== */}
                <div className="flex items-center justify-between px-4 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                        {/* Avatar */}
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                            {post?.avatar_url ? (
                                <img
                                    src={post.avatar_url}
                                    alt="Post author"
                                    loading="lazy"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-zinc-500 dark:text-zinc-400">
                                    U
                                </div>
                            )}
                        </div>

                        {/* User info */}
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                                {post?.user_name || "Community User"}
                            </p>

                            {formattedDate && (
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    {formattedDate}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* More */}
                    <button
                        type="button"
                        onClick={(event) => event.preventDefault()}
                        aria-label="More options"
                        className="
              rounded-full
              p-2
              text-zinc-500
              transition
              hover:bg-zinc-100
              hover:text-zinc-900
              dark:text-zinc-400
              dark:hover:bg-zinc-900
              dark:hover:text-white
            "
                    >
                        <MoreHorizontal size={20} />
                    </button>
                </div>

                {/* =========================
            Image
        ========================== */}
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

                {/* =========================
            Content
        ========================== */}
                <div className="px-4 py-4">
                    {/* Title */}
                    <h3
                        className="
              line-clamp-2
              break-words
              text-lg
              font-bold
              leading-6
              text-zinc-900
              transition-colors
              group-hover:text-blue-600
              dark:text-white
              dark:group-hover:text-blue-400
            "
                    >
                        {post?.title}
                    </h3>

                    {/* Content */}
                    <p
                        className="
              mt-2
              line-clamp-3
              break-words
              text-sm
              leading-6
              text-zinc-600
              dark:text-zinc-400
            "
                    >
                        {post?.content}
                    </p>
                </div>

                {/* =========================
            Actions
        ========================== */}
                <div
                    className="
            flex
            items-center
            gap-1
            border-t
            border-zinc-100
            px-3
            py-3
            dark:border-zinc-800
          "
                >
                    {/* Like */}
                    <div
                        className="
              flex
              items-center
              gap-1.5
              rounded-full
              px-3
              py-2
              text-zinc-500
              transition
              hover:bg-red-50
              hover:text-red-500
              dark:text-zinc-400
              dark:hover:bg-red-500/10
            "
                    >
                        <Heart size={17} />
                        <span className="text-xs">Like</span>
                    </div>

                    {/* Comment */}
                    <div
                        className="
              flex
              items-center
              gap-1.5
              rounded-full
              px-3
              py-2
              text-zinc-500
              transition
              hover:bg-blue-50
              hover:text-blue-500
              dark:text-zinc-400
              dark:hover:bg-blue-500/10
            "
                    >
                        <MessageCircle size={17} />
                        <span className="text-xs">Comment</span>
                    </div>

                    {/* Share */}
                    <div
                        className="
              flex
              items-center
              gap-1.5
              rounded-full
              px-3
              py-2
              text-zinc-500
              transition
              hover:bg-zinc-100
              hover:text-zinc-900
              dark:text-zinc-400
              dark:hover:bg-zinc-800
              dark:hover:text-white
            "
                    >
                        <Share2 size={17} />
                        <span className="text-xs">Share</span>
                    </div>
                </div>
            </Link>
        </article>
    );
};

export default PostList;