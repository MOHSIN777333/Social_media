import { Loader2, Trash2, X } from "lucide-react";

export default function DeletePostModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
  postTitle = "",
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-50"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Warning Icon */}
        <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
          <Trash2 size={24} />
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
            Delete Post?
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Are you sure you want to permanently delete{" "}
            {postTitle ? (
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                "{postTitle.length > 40 ? `${postTitle.slice(0, 40)}...` : postTitle}"
              </span>
            ) : (
              "this post"
            )}
            ? This action cannot be undone.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-semibold transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-md transition disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete Post
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
