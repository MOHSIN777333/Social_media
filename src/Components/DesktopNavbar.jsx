import { Link, useNavigate } from 'react-router';
import { Bell, LogOut, Search, Plus, Home, Compass, User } from 'lucide-react';
import UserAvatar from './UserAvatar';
import ThemeToggle from './ThemeToggle';
import { useToast } from '../context/Toast_Context';

export default function DesktopNavbar({
  user,
  searchQuery,
  onSearch,
  signOut,
  signInWithGitHub,
  openAuthModal,
}) {
  const navigate = useNavigate();
  const { info } = useToast();

  const handleSignIn = () => {
    if (openAuthModal) {
      openAuthModal();
    } else if (signInWithGitHub) {
      signInWithGitHub();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 dark:text-white dark:bg-[#09090B] dark:border-b dark:border-white/10 backdrop-blur-lg border-b border-zinc-200 shadow-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16 gap-4">
          {/* Left: Brand Logo & Navigation Links */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-black bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 bg-clip-text text-transparent">
                X Choice
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
              <Link
                to="/"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <Home size={17} />
                Feed
              </Link>
              <Link
                to="/communities"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <Compass size={17} />
                Communities
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <User size={17} />
                Profile
              </Link>
            </nav>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-sm hidden md:block">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder="Search posts or creators..."
                value={searchQuery || ''}
                onChange={(e) => onSearch?.(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-full text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                aria-label="Search posts"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Create Post</span>
            </Link>

            <ThemeToggle />

            {/* Notifications Button */}
            <button
              onClick={() => info("No new notifications")}
              className="relative p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition text-zinc-600 dark:text-zinc-300"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={19} strokeWidth={1.75} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
            </button>

            {/* User Avatar / Sign In */}
            {user ? (
              <div
                onClick={() => navigate('/profile')}
                className="cursor-pointer flex items-center hover:opacity-85 transition"
                title="View Profile"
              >
                <UserAvatar
                  image={user?.user_metadata?.avatar_url}
                  fullName={user?.user_metadata?.full_name}
                  size="small"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSignIn}
                className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
              >
                Sign In
              </button>
            )}

            {user && (
              <button
                onClick={signOut}
                className="p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 rounded-full transition"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut size={18} strokeWidth={1.75} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
