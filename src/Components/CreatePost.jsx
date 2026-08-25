import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    ImagePlus,
    Loader2,
    X,
    SendHorizontal,
    AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router";

import { supabase } from "../supabase";
import { useAuth } from "../context/Auth_Context";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
];

const createPost = async ({ title, content, image, avatar_url }) => {
    if (!title?.trim()) {
        throw new Error("Post title is required.");
    }

    if (!content?.trim()) {
        throw new Error("Post content is required.");
    }

    if (!image) {
        throw new Error("Please select an image.");
    }

    if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
        throw new Error("Only JPG, PNG, WEBP, and GIF images are allowed.");
    }

    if (image.size > MAX_IMAGE_SIZE) {
        throw new Error("Image size must be less than 5MB.");
    }

    const fileExtension = image.name.split(".").pop()?.toLowerCase() || "jpg";

    const safeFileName = `${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;

    const filePath = `posts/${safeFileName}`;

    const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, image, {
            cacheControl: "3600",
            upsert: false,
            contentType: image.type,
        });

    if (uploadError) {
        throw new Error(`Image upload failed: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

    const imageUrl = publicUrlData?.publicUrl;

    if (!imageUrl) {
        throw new Error("Unable to generate image URL.");
    }

    const { data: postData, error: postError } = await supabase
        .from("posts")
        .insert([
            {
                title: title.trim(),
                content: content.trim(),
                image: imageUrl,
                avatar_url: avatar_url || null,
            },
        ])
        .select()
        .single();

    if (postError) {
        // Cleanup uploaded image if DB insertion fails
        await supabase.storage.from("images").remove([filePath]);

        throw new Error(`Post creation failed: ${postError.message}`);
    }

    return postData;
};

const CreatePost = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { user } = useAuth();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const {
        mutate: createPostMutation,
        isPending,
        error,
    } = useMutation({
        mutationFn: createPost,

        onSuccess: async () => {
            // Refresh posts after successful creation
            await queryClient.invalidateQueries({
                queryKey: ["posts"],
            });

            // Clear form
            setTitle("");
            setContent("");
            setImage(null);
            setPreviewUrl("");

            // Redirect only after SUCCESS
            navigate("/");
        },
    });

    useEffect(() => {
        if (!image) {
            setPreviewUrl("");
            return;
        }

        const url = URL.createObjectURL(image);

        setPreviewUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [image]);

    const handleImageChange = (event) => {
        const selectedFile = event.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        if (!ALLOWED_IMAGE_TYPES.includes(selectedFile.type)) {
            event.target.value = "";
            setImage(null);
            setPreviewUrl("");
            return;
        }

        if (selectedFile.size > MAX_IMAGE_SIZE) {
            event.target.value = "";
            setImage(null);
            setPreviewUrl("");
            return;
        }

        setImage(selectedFile);
    };

    const handleRemoveImage = () => {
        setImage(null);
        setPreviewUrl("");
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (isPending) return;

        createPostMutation({
            title,
            content,
            image,
            avatar_url: user?.user_metadata?.avatar_url || null,
        });
    };

    return (
        <section className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <form
                onSubmit={handleSubmit}
                className="
          mx-auto
          w-full
          max-w-2xl
          overflow-hidden
          rounded-3xl
          border
          border-zinc-200
          bg-white
          shadow-xl
          dark:border-white/10
          dark:bg-zinc-950/80
          dark:shadow-black/30
        "
            >
                {/* Header */}
                <div className="border-b border-zinc-200 px-5 py-5 sm:px-6 dark:border-white/10">
                    <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-white">
                        Create Post
                    </h1>

                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Share something with your community.
                    </p>
                </div>

                {/* Form Content */}
                <div className="space-y-6 p-5 sm:p-6">
                    {/* Error */}
                    {error && (
                        <div
                            role="alert"
                            className="
                flex
                items-start
                gap-3
                rounded-2xl
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-sm
                text-red-700
                dark:border-red-500/20
                dark:bg-red-500/10
                dark:text-red-300
              "
                        >
                            <AlertCircle size={18} className="mt-0.5 shrink-0" />
                            <p>{error.message}</p>
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label
                            htmlFor="title"
                            className="mb-2 block text-sm font-semibold text-zinc-900 dark:text-white"
                        >
                            Post Title
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
                focus:border-blue-500
                focus:ring-4
                focus:ring-blue-500/10
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
                            Content
                        </label>

                        <textarea
                            id="content"
                            value={content}
                            onChange={(event) => setContent(event.target.value)}
                            placeholder="What's on your mind?"
                            rows={6}
                            maxLength={1000}
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
                focus:border-blue-500
                focus:ring-4
                focus:ring-blue-500/10
                disabled:cursor-not-allowed
                disabled:opacity-60
                dark:border-zinc-800
                dark:bg-zinc-900
                dark:text-white
                dark:placeholder:text-zinc-500
              "
                        />

                        <div className="mt-2 text-right text-xs text-zinc-400">
                            {content.length}/1000
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label
                            htmlFor="image"
                            className="mb-2 block text-sm font-semibold text-zinc-900 dark:text-white"
                        >
                            Image
                        </label>

                        {!previewUrl ? (
                            <label
                                htmlFor="image"
                                className="
                  flex
                  min-h-36
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
                  py-8
                  text-center
                  transition
                  hover:border-blue-400
                  hover:bg-blue-50/50
                  dark:border-zinc-700
                  dark:bg-zinc-900
                  dark:hover:border-blue-500
                  dark:hover:bg-blue-500/5
                "
                            >
                                <ImagePlus className="mb-3 text-zinc-400" size={32} />

                                <p className="font-medium text-zinc-700 dark:text-zinc-200">
                                    Choose an image
                                </p>

                                <p className="mt-1 text-xs text-zinc-400">
                                    JPG, PNG, WEBP or GIF · Max 5MB
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
                    max-h-[500px]
                    w-full
                    object-cover
                    sm:max-h-[600px]
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
                    hover:bg-red-500
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
                            disabled={isPending || !title.trim() || !content.trim() || !image}
                            className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-full
                bg-gradient-to-r
                from-blue-600
                to-indigo-600
                px-6
                py-3
                text-sm
                font-semibold
                text-white
                shadow-lg
                shadow-blue-500/20
                transition-all
                hover:scale-[1.02]
                hover:shadow-blue-500/30
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-50
                disabled:hover:scale-100
              "
                        >
                            {isPending ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <SendHorizontal size={18} />
                                    Create Post
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