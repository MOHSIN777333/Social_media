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
    <nav className="fixed bottom-0 left-0 right-0 md:hidden z-50 mb-4 px-3">
      {/* Glassmorphism container */}
      <div
        className="
          mx-auto
          w-full
          max-w-md
          h-16
          px-3
          rounded-full
          border border-zinc-200/90 dark:border-white/10
          bg-white/85 dark:bg-zinc-950/85
          backdrop-blur-2xl
          shadow-xl shadow-zinc-300/30 dark:shadow-black/50
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
            type="button"
            onClick={onCreatePost}
            aria-label="Create Post"
            className="
              -mt-6
              w-14
              h-14
              rounded-full
              bg-gradient-to-br
              from-indigo-600
              to-purple-600
              text-white
              flex
              items-center
              justify-center
              shadow-lg
              shadow-indigo-500/40
              hover:scale-105
              active:scale-95
              transition-all
              duration-200
            "
          >
            <Plus size={26} strokeWidth={2.5} />
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
