import React from 'react';
import { Bell, LogOut, Search, Plus, Users } from 'lucide-react';
import NavItem from './NavItem';
import UserAvatar from './UserAvatar';
import ThemeToggle from './ThemeToggle';

export default function DesktopNavbar({
  navItems,
  activeTab,
  setActiveTab,
  user,
  searchQuery,
  onSearch,
  onLogout,
  onCreatePost,
  onCreateCommunity,
  signOut,
  signInWithGitHub
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 dark:text-white dark:bg-[#09090B] dark:border-b dark:border-black/10 dark: backdrop-blur-lg border-b border-white/10 shadow-lg  bg-white">
      <div className="">
        <div className="flex justify-between items-center p-2 gap-3 ">
          {/* Left: Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="  flex items-center justify-center">
              <h1 className="text-lg shadow font-bold bg-linear-to-r from-purple-700 via-indigo-500 to-pink-500 bg-clip-text text-transparent ">
                <span className="">X</span>

                Choise</h1>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-xs mx-6 hidden lg:block">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                  aria-label="Search posts"
                />
              </div>
            </div>

          </div>





          {/* Right: Actions */}
          <div className="flex items-center justify-center gap-2 lg:gap-4">
            {/* User Avatar */}
            <div className=" flex items-center">

              {user ?
                <UserAvatar className='mt-2'
                  image={user.user_metadata.avatar_url}
                  fullName={user.user_metadata.full_name}
                />
                : <button onClick={signInWithGitHub} className='px-3 py-2 rounded-md bg-indigo-500 cursor-pointer'>Sign Up</button>}
            </div>

            <ThemeToggle />

            {/* Notifications Button */}
            <button
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={20} strokeWidth={1.5} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>



            {/* Logout Button */}
            <button
              onClick={signOut}
              className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
