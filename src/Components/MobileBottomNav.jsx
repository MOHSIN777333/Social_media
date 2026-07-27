import React from 'react';
import { Home, Users, Plus, Bell, User } from 'lucide-react';
import NavItem from './NavItem';

export default function MobileBottomNav({
  navItems,
  activeTab,
  setActiveTab,
  onCreatePost,
}) {


  // Icons mapping for mobile
  const iconMap = {
    home: Home,
    communities: Users,
    notifications: Bell,
    profile: User,
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden z-50 mb-5">
      {/* Glassmorphism container */}
      <div
        className="
    mx-auto
    w-[95%]
    max-w-md
    h-18
    px-3
    rounded-full
    border border-white/10
    bg-white/70
    dark:bg-black/30
    backdrop-blur-2xl
    shadow-xl
    flex
    items-center
    justify-between
  "
      >
        <div className="flex items-center justify-between w-full">
          {/* Home */}
          <NavItem

            item={navItems[0]}
            isActive={activeTab === navItems[0].id}
            onClick={() => setActiveTab(navItems[0].id)}
            variant="mobile"
            icon={iconMap[navItems[0].id]}
          />

          {/* Communities */}
          <NavItem
            item={navItems[1]}
            isActive={activeTab === navItems[1].id}
            onClick={() => setActiveTab(navItems[1].id)}
            variant="mobile"
            icon={iconMap[navItems[1].id]}
          />

          {/* Center Create Button - Elevated */}
          <button
            onClick={
              onCreatePost

            }

            aria-label="Create Post"
            className="
    -mt-8
    w-16
    h-16
    rounded-full
    bg-gradient-to-br
    from-blue-500
    to-indigo-600
    text-white
    flex
    items-center
    justify-center
    shadow-xl
    shadow-blue-500/30
    hover:scale-110
    active:scale-95
    transition-all
    duration-300
  "
          >
            <Plus size={30} strokeWidth={2.8} />
          </button>

          {/* Notifications */}
          <NavItem
            item={navItems[2]}
            isActive={activeTab === navItems[2].id}
            onClick={() => setActiveTab(navItems[2].id)}
            variant="mobile"
            icon={iconMap[navItems[2].id]}
          />

          {/* Profile */}
          <NavItem
            item={navItems[3]}
            isActive={activeTab === navItems[3].id}
            onClick={() => setActiveTab(navItems[3].id)}
            variant="mobile"
            icon={iconMap[navItems[3].id]}
          />
        </div>
      </div>
    </nav>
  );
}
