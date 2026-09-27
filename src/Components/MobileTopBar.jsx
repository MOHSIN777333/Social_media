import { useState } from "react";
import { Bell, LogOut, Search, X } from "lucide-react";
import { Link, useNavigate } from "react-router";
import UserAvatar from "./UserAvatar";
import ThemeToggle from "./ThemeToggle";
import { useToast } from "../context/Toast_Context";

export default function MobileTopBar({
  user,
  signOut,
  signInWithGitHub,
  notificationCount = 0,
  onSearch,
  searchQuery = "",
}) {
  const navigate = useNavigate();
  const { info } = useToast();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header
      className="
        fixed top-0 left-0 right-0 z-40
        bg-white/95
        dark:bg-[#09090B]/95
        backdrop-blur-2xl
        border-b border-zinc-200 dark:border-white/10
        shadow-sm
        md:hidden
      "
    >
      <div className="h-16 px-4 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link to="/" className="flex items-center gap-1.5">
          <span className="text-lg font-black bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 bg-clip-text text-transparent">
            X Choice
          </span>
        </Link>

        {/* Right: Search Toggle, Theme, Notifications, Avatar, Auth */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Search Toggle */}
          <button
            type="button"
            onClick={() => setShowSearch(!showSearch)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/10 transition-all"
            aria-label="Toggle search"
          >
            {showSearch ? <X size={18} /> : <Search size={18} />}
          </button>

          {/* Theme toggle Button */}
          <div className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all">
            <ThemeToggle />
          </div>

          {/* Notifications Button */}
          <button
            type="button"
            onClick={() => info("No new notifications")}
            className="
              relative
              w-9
              h-9
              flex
              items-center
              justify-center
              rounded-xl
              text-zinc-600
              dark:text-zinc-300
              hover:bg-zinc-100
              dark:hover:bg-white/10
              transition-all
            "
            aria-label={`Notifications${notificationCount > 0 ? `, ${notificationCount} new` : ""}`}
          >
            <Bell size={19} strokeWidth={1.75} />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-indigo-500 rounded-full">
                {notificationCount}
              </span>
            )}
          </button>

          {user ? (
            <div
              onClick={() => navigate("/profile")}
              className="cursor-pointer flex items-center"
              title="View profile"
            >
              <UserAvatar
                image={user?.user_metadata?.avatar_url}
                fullName={user?.user_metadata?.full_name}
                size="small"
              />
            </div>
          ) : (
            <button
              onClick={signInWithGitHub}
              className="
                px-3
                py-1.5
                rounded-full
                bg-indigo-600
                text-white
                text-xs
                font-semibold
                shadow-sm
                transition-all
              "
            >
              Sign In
            </button>
          )}

          {user && (
            <button
              onClick={signOut}
              className="
                w-9
                h-9
                flex
                items-center
                justify-center
                rounded-xl
                text-zinc-500
                dark:text-zinc-400
                hover:bg-rose-500/10
                hover:text-rose-500
                transition-all
              "
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={17} strokeWidth={1.75} />
            </button>
          )}
        </div>
      </div>

      {/* Expandable Mobile Search Bar */}
      {showSearch && (
        <div className="px-4 pb-3 pt-1 border-t border-zinc-100 dark:border-zinc-800/80 bg-white/95 dark:bg-[#09090B]/95 animate-in slide-in-from-top-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search posts or creators..."
              value={searchQuery}
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-xs text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
        </div>
      )}
    </header>
  );
}
