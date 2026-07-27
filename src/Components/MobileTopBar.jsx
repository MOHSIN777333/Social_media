import React from "react";
import { Bell, LogOut } from "lucide-react";
import UserAvatar from "./UserAvatar";
import ThemeToggle from "./ThemeToggle";

export default function MobileTopBar({
  user,
  signOut,
  signInWithGitHub,
  notificationCount = 0,
}) {
  return (
    <header
      className="
fixed top-0 left-0 right-0 z-40
bg-gradient-to-b
from-white/80
to-white/55
dark:from-[#09090B]/80
dark:to-[#09090B]/55
backdrop-blur-2xl
border-b border-white/20 dark:border-white/10
shadow-lg shadow-black/5 dark:shadow-black/30
md:hidden
"
    >
      <div className="h-16 px-4 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          {user ? (
            <UserAvatar
              image={user.user_metadata.avatar_url}
              fullName={user.user_metadata.full_name}
              size="small"
            />
          ) : (
            <button
              onClick={signInWithGitHub}
              className="
                      px-4
                      py-2
                      rounded-xl
                      bg-gradient-to-r
                      from-blue-600
                      to-indigo-600
                      text-white
                      font-medium
                      shadow-lg
                      shadow-blue-500/20
                      hover:scale-105
                      active:scale-95
                      transition-all
                      duration-200
"
            >
              Sign Up
            </button>
          )}
        </div>

        {/* Right: Notifications & Avatar */}
        <div className="flex items-center gap-3">
          {/* <button onClick={signInWithGitHub} className='
            px-3 py-2 rounded-md bg-indigo-500 cursor-pointer'>SignUp</button> */}
          {/* Theme toggle Button */}
          <div className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all">
            <ThemeToggle />
          </div>
          {/* Notifications Button */}
          <button
            className="
            relative
            w-10
            h-10
            flex
            items-center
            justify-center
            rounded-xl
            text-gray-600
            dark:text-gray-300
            hover:bg-black/5
            dark:hover:bg-white/10
            transition-all
            duration-200
"
            aria-label={`Notifications${notificationCount > 0 ? `, ${notificationCount} new` : ""}`}
          >
            <Bell size={20} strokeWidth={1.5} />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>

          <button
            onClick={signOut}
            className="
              w-10
              h-10
              flex
              items-center
              justify-center
              rounded-xl
              text-gray-600
              dark:text-gray-300
              hover:bg-red-500/10
              hover:text-red-500
              transition-all
              duration-200
"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  );
}
