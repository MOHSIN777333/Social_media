import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Loader2, User, Lock, Check, Sparkles } from "lucide-react";
import { updateUserProfile } from "../api";
import { useAuth } from "../context/Auth_Context";
import { useToast } from "../context/Toast_Context";

function EditProfileForm({ user, updateUser, onClose }) {
    const queryClient = useQueryClient();
    const { success, error: toastError } = useToast();

    const [name, setName] = useState(user?.name || "");
    const [bio, setBio] = useState(user?.bio || "");
    const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || "");
    const [isPrivateAccount, setIsPrivateAccount] = useState(Boolean(user?.isPrivateAccount));

    const { mutate: handleSave, isPending } = useMutation({
        mutationFn: async () => {
            if (!name.trim()) throw new Error("Name cannot be empty");
            return await updateUserProfile({
                name: name.trim(),
                bio: bio.trim(),
                avatarUrl: avatarUrl.trim(),
                isPrivateAccount,
            });
        },
        onSuccess: (updatedUser) => {
            updateUser(updatedUser);
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            success("Profile updated successfully!");
            onClose();
        },
        onError: (err) => {
            toastError(err.message || "Failed to update profile");
        },
    });

    const generateNewAvatar = () => {
        const seed = Math.random().toString(36).substring(2, 8);
        setAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSave();
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Avatar Preview & URL */}
            <div className="flex items-center gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-indigo-500/20 bg-zinc-100 dark:bg-zinc-800">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt="Avatar preview"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                                e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || "user")}`;
                            }}
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl font-bold text-zinc-400">
                            {name ? name.charAt(0) : "U"}
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                        Avatar URL
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none transition"
                        />
                        <button
                            type="button"
                            onClick={generateNewAvatar}
                            title="Generate Random Avatar"
                            className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1 shrink-0 transition"
                        >
                            <Sparkles size={13} />
                            Random
                        </button>
                    </div>
                </div>
            </div>

            {/* Display Name */}
            <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Display Name
                </label>
                <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                        required
                    />
                </div>
            </div>

            {/* Bio */}
            <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Bio
                </label>
                <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell the community about yourself..."
                    className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition resize-none"
                />
            </div>

            {/* Private Account Option */}
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                        <Lock size={15} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-zinc-900 dark:text-white">
                            Private Account
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            Keep your account details and profile private
                        </p>
                    </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isPrivateAccount}
                        onChange={(e) => setIsPrivateAccount(e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition disabled:opacity-50"
                >
                    {isPending ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Check size={14} />
                            Save Profile
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}

export default function EditProfileModal({ isOpen, onClose }) {
    const { user, updateUser } = useAuth();

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div
                className="w-full max-w-lg rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                        Edit Profile
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                <EditProfileForm key={user.id} user={user} updateUser={updateUser} onClose={onClose} />
            </div>
        </div>
    );
}
