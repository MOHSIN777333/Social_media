import { useState } from "react";
import { X, User, Mail, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/Auth_Context";
import { useToast } from "../context/Toast_Context";

const GithubIcon = ({ size = 18, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const DEMO_ACCOUNTS = [
  {
    name: "Mohsin Ali",
    username: "mohsinali",
    email: "mohsinali031332@gmail.com",
    role: "Full-Stack Creator",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
  },
  {
    name: "Design Studio",
    username: "designstudio",
    email: "design@example.com",
    role: "UI/UX Designer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
  },
  {
    name: "Alex River",
    username: "alexriver",
    email: "alex@example.com",
    role: "Photographer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
  },
];

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, signInWithGitHub, switchAccount } = useAuth();
  const { success, error: toastError } = useToast();

  const [tab, setTab] = useState("github"); // "github" | "custom"
  const [gitHubUsername, setGitHubUsername] = useState("mohsinali");
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleGitHubLogin = async (e) => {
    e?.preventDefault();
    setIsLoading(true);
    try {
      const handle = gitHubUsername.trim() || "mohsinali";
      const result = await signInWithGitHub({
        username: handle,
        name: handle.charAt(0).toUpperCase() + handle.slice(1),
        email: `${handle.toLowerCase()}@users.noreply.github.com`,
      });
      if (result.error) {
        throw result.error;
      }
      success(`Signed in as @${handle} via GitHub!`);
      closeAuthModal();
    } catch (err) {
      toastError(err.message || "Failed to sign in with GitHub");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSwitch = async (acc) => {
    setIsLoading(true);
    try {
      await switchAccount({ email: acc.email, username: acc.username, name: acc.name });
      success(`Logged in as ${acc.name}!`);
      closeAuthModal();
    } catch (err) {
      toastError(err.message || "Failed to switch account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomLogin = async (e) => {
    e.preventDefault();
    if (!customEmail.trim()) {
      toastError("Please enter your email or username");
      return;
    }
    setIsLoading(true);
    try {
      await switchAccount({
        email: customEmail.trim(),
        username: customName.trim().toLowerCase().replace(/\s+/g, "") || undefined,
        name: customName.trim() || undefined,
      });
      success(`Welcome, ${customName.trim() || customEmail}!`);
      closeAuthModal();
    } catch (err) {
      toastError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-7 shadow-2xl"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
            <Sparkles size={24} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
            Sign In to X Choice
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Post, react with upvotes, join communities, and interact with members.
          </p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1 mb-5">
          <button
            type="button"
            onClick={() => setTab("github")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
              tab === "github"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <GithubIcon size={15} />
            GitHub Auth
          </button>
          <button
            type="button"
            onClick={() => setTab("custom")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
              tab === "custom"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Mail size={15} />
            Email / Username
          </button>
        </div>

        {tab === "github" ? (
          <form onSubmit={handleGitHubLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                GitHub Username or Handle
              </label>
              <div className="relative">
                <GithubIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={gitHubUsername}
                  onChange={(e) => setGitHubUsername(e.target.value)}
                  placeholder="e.g. mohsinali"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !gitHubUsername.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-sm font-semibold shadow-md transition disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <GithubIcon size={18} />
              )}
              Continue with GitHub
            </button>
          </form>
        ) : (
          <form onSubmit={handleCustomLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Display Name (Optional)
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Mohsin Ali"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Email Address or Username <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !customEmail.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md transition disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle2 size={18} />
              )}
              Sign In
            </button>
          </form>
        )}

        {/* Quick Demo Switcher Section */}
        <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2.5 text-center">
            Or Quick Sign In As Demo User
          </p>

          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickSwitch(acc)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition group text-left"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {acc.name}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      @{acc.username} · {acc.role}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                  Select →
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
