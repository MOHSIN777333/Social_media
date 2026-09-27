import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ImagePlus,
    Loader2,
    X,
    SendHorizontal,
    AlertCircle,
    Compass,
    Globe,
    Lock,
} from "lucide-react";
import { useNavigate } from "react-router";

import { createPost as apiCreatePost, getCommunities } from "../api";
import { useAuth } from "../context/Auth_Context";
import { useToast } from "../context/Toast_Context";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
];

const createPost = async ({ title, content, image, community, visibility }) => {
    if (!title?.trim()) {
        throw new Error("Post title is required.");
    }

    if (!content?.trim()) {
        throw new Error("Post content is required.");
    }

    if (image) {
        if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
            throw new Error("Only JPG, PNG, WEBP, and GIF images are allowed.");
        }

        if (image.size > MAX_IMAGE_SIZE) {
            throw new Error("Image size must be less than 10MB.");
        }
    }

    const data = await apiCreatePost({
        title: title.trim(),
        content: content.trim(),
        community: community || "General",
        visibility: visibility || "public",
        imageFile: image || undefined,
    });

    return data.post;
};

const CreatePost = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, openAuthModal } = useAuth();
    const { success, error: toastError } = useToast();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [community, setCommunity] = useState("General");
    const [visibility, setVisibility] = useState("public");
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const { data: communities = [] } = useQuery({
        queryKey: ["communities"],
        queryFn: getCommunities,
    });

    const {
        mutate: createPostMutation,
        isPending,
        error,
    } = useMutation({
        mutationFn: createPost,

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["posts"],
            });

            setTitle("");
            setContent("");
            setImage(null);
            setPreviewUrl("");
            success("Post published successfully!");
            navigate("/");
        },
        onError: (err) => {
            toastError(err.message || "Failed to create post");
        },
    });

    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            toastError("Please choose a valid JPG, PNG, WEBP, or GIF image.");
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            toastError("Image size must be under 10MB.");
            return;
        }

        if (previewUrl && previewUrl.startsWith("blob:")) {
            URL.revokeObjectURL(previewUrl);
        }

        setImage(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleRemoveImage = () => {
        if (previewUrl && previewUrl.startsWith("blob:")) {
            URL.revokeObjectURL(previewUrl);
        }
        setImage(null);
        setPreviewUrl("");
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!user) {
            toastError("Please sign in to publish a post.");
            openAuthModal();
            return;
        }
        createPostMutation({
            title,
            content,
            community,
            visibility,
            image,
        });
    };

    if (!user) {
        return (
            <section className="w-full py-8">
                <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 sm:p-12 text-center shadow-xl dark:border-white/10 dark:bg-zinc-950">
                    <div className="mx-auto w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-3xl mb-4">
                        ✨
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                        Sign In to Create a Post
                    </h2>
                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                        Join the community to publish articles, share photos, join specialized groups, and interact with members.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-5 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
                        >
                            Go Back
                        </button>
                        <button
                            type="button"
                            onClick={openAuthModal}
                            className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md transition"
                        >
                            Sign In / Continue
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="w-full py-4 sm:py-8">
            <form
                onSubmit={handleSubmit}
                className="
                  overflow-hidden
                  rounded-3xl
                  border
                  border-zinc-200
                  bg-white
                  shadow-xl
                  shadow-zinc-200/50
                  dark:border-white/10
                  dark:bg-zinc-950
                  dark:shadow-black/20
                "
            >
                {/* Header */}
                <div className="border-b border-zinc-100 p-6 sm:p-8 dark:border-zinc-800">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
                        Create a Post
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Share stories, showcase projects, or spark a conversation.
                    </p>
                </div>

                <div className="space-y-6 p-6 sm:p-8">
                    {/* Error Banner */}
                    {error && (
                        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                            <AlertCircle size={18} className="mt-0.5 shrink-0" />
                            <p>{error.message}</p>
                        </div>
                    )}

                    {/* Community Picker */}
                    <div>
                        <label
                            htmlFor="community"
                            className="mb-2 block text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5"
                        >
                            <Compass size={16} className="text-indigo-500" />
                            Select Community
                        </label>
                        <select
                            id="community"
                            value={community}
                            onChange={(e) => setCommunity(e.target.value)}
                            disabled={isPending}
                            className="
                              w-full
                              rounded-2xl
                              border
                              border-zinc-200
                              bg-zinc-50
                              px-4
                              py-3
                              text-sm
                              text-zinc-900
                              outline-none
                              focus:border-indigo-500
                              focus:ring-4
                              focus:ring-indigo-500/10
                              dark:border-zinc-800
                              dark:bg-zinc-900
                              dark:text-white
                            "
                        >
                            <option value="General">🌐 General</option>
                            {communities.map((c) => (
                                <option key={c.id} value={c.name}>
                                    {c.icon || "🚀"} {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Visibility Picker */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-zinc-900 dark:text-white">
                            Post Visibility & Privacy
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setVisibility("public")}
                                className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition ${
                                    visibility === "public"
                                        ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20"
                                        : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                                }`}
                            >
                                <Globe size={20} className={visibility === "public" ? "text-indigo-600 dark:text-indigo-400 mt-0.5" : "text-zinc-400 mt-0.5"} />
                                <div>
                                    <p className="text-sm font-bold">Public Post 🌐</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                        Visible to everyone on the public community feed.
                                    </p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setVisibility("private")}
                                className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition ${
                                    visibility === "private"
                                        ? "border-amber-600 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20"
                                        : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                                }`}
                            >
                                <Lock size={20} className={visibility === "private" ? "text-amber-600 dark:text-amber-400 mt-0.5" : "text-zinc-400 mt-0.5"} />
                                <div>
                                    <p className="text-sm font-bold">Private Post 🔒</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                        Only visible to you on your profile dashboard.
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label
                            htmlFor="title"
                            className="mb-2 block text-sm font-semibold text-zinc-900 dark:text-white"
                        >
                            Post Title <span className="text-rose-500">*</span>
                        </label>

                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            placeholder="Give your post a catchy title..."
                            maxLength={120}
                            required
                            disabled={isPending}
                            className="
                              w-full
                              rounded-2xl
                              border
                              border-zinc-200
                              bg-zinc-50
                              px-4
                              py-3
                              text-sm
                              text-zinc-900
                              outline-none
                              placeholder:text-zinc-400
                              focus:border-indigo-500
                              focus:ring-4
                              focus:ring-indigo-500/10
                              disabled:cursor-not-allowed
                              disabled:opacity-60
                              dark:border-zinc-800
                              dark:bg-zinc-900
                              dark:text-white
                              dark:placeholder:text-zinc-500
                            "
                        />

                        <div className="mt-2 text-right text-xs text-zinc-400">
                            {title.length}/120
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        <label
                            htmlFor="content"
                            className="mb-2 block text-sm font-semibold text-zinc-900 dark:text-white"
                        >
                            Content <span className="text-rose-500">*</span>
                        </label>

                        <textarea
                            id="content"
                            value={content}
                            onChange={(event) => setContent(event.target.value)}
                            placeholder="What would you like to share with the community?"
                            rows={6}
                            maxLength={1500}
                            required
                            disabled={isPending}
                            className="
                              min-h-36
                              w-full
                              resize-y
                              rounded-2xl
                              border
                              border-zinc-200
                              bg-zinc-50
                              px-4
                              py-3
                              text-sm
                              leading-6
                              text-zinc-900
                              outline-none
                              placeholder:text-zinc-400
                              focus:border-indigo-500
                              focus:ring-4
                              focus:ring-indigo-500/10
                              disabled:cursor-not-allowed
                              disabled:opacity-60
                              dark:border-zinc-800
                              dark:bg-zinc-900
                              dark:text-white
                              dark:placeholder:text-zinc-500
                            "
                        />

                        <div className="mt-2 text-right text-xs text-zinc-400">
                            {content.length}/1500
                        </div>
                    </div>

                    {/* Image Upload (Optional) */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label
                                htmlFor="image"
                                className="block text-sm font-semibold text-zinc-900 dark:text-white"
                            >
                                Cover Image
                            </label>
                            <span className="text-xs text-zinc-400">(Optional)</span>
                        </div>

                        {!previewUrl ? (
                            <label
                                htmlFor="image"
                                className="
                                  flex
                                  min-h-32
                                  cursor-pointer
                                  flex-col
                                  items-center
                                  justify-center
                                  rounded-2xl
                                  border-2
                                  border-dashed
                                  border-zinc-300
                                  bg-zinc-50
                                  px-4
                                  py-6
                                  text-center
                                  transition
                                  hover:border-indigo-400
                                  hover:bg-indigo-50/50
                                  dark:border-zinc-700
                                  dark:bg-zinc-900
                                  dark:hover:border-indigo-500
                                  dark:hover:bg-indigo-500/5
                                "
                            >
                                <ImagePlus className="mb-2 text-zinc-400" size={28} />

                                <p className="font-medium text-sm text-zinc-700 dark:text-zinc-200">
                                    Attach an image or photo
                                </p>

                                <p className="mt-1 text-xs text-zinc-400">
                                    JPG, PNG, WEBP or GIF · Max 10MB
                                </p>

                                <input
                                    id="image"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    onChange={handleImageChange}
                                    disabled={isPending}
                                    className="hidden"
                                />
                            </label>
                        ) : (
                            <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                <img
                                    src={previewUrl}
                                    alt="Selected post preview"
                                    className="
                                      max-h-[450px]
                                      w-full
                                      object-cover
                                      sm:max-h-[550px]
                                    "
                                />

                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    disabled={isPending}
                                    aria-label="Remove selected image"
                                    className="
                                      absolute
                                      right-3
                                      top-3
                                      flex
                                      h-9
                                      w-9
                                      items-center
                                      justify-center
                                      rounded-full
                                      bg-black/70
                                      text-white
                                      backdrop-blur
                                      transition
                                      hover:bg-rose-600
                                      disabled:cursor-not-allowed
                                      disabled:opacity-50
                                    "
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            disabled={isPending}
                            className="
                              rounded-full
                              border
                              border-zinc-200
                              px-6
                              py-3
                              text-sm
                              font-semibold
                              text-zinc-700
                              transition
                              hover:bg-zinc-100
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                              dark:border-zinc-800
                              dark:text-zinc-200
                              dark:hover:bg-zinc-900
                            "
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isPending || !title.trim() || !content.trim()}
                            className="
                              inline-flex
                              items-center
                              justify-center
                              gap-2
                              rounded-full
                              bg-gradient-to-r
                              from-indigo-600
                              to-purple-600
                              px-6
                              py-3
                              text-sm
                              font-semibold
                              text-white
                              shadow-lg
                              shadow-indigo-500/20
                              transition-all
                              hover:scale-[1.02]
                              hover:shadow-indigo-500/30
                              active:scale-[0.98]
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                              disabled:hover:scale-100
                            "
                        >
                            {isPending ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Publishing...
                                </>
                            ) : (
                                <>
                                    <SendHorizontal size={18} />
                                    Publish Post
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </section>
    );
};

export default CreatePost;
