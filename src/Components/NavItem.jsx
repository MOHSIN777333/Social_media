import {
  Home,
  Users,
  Bell,
  User,
} from "lucide-react";

const iconMap = {
  home: Home,
  communities: Users,
  notifications: Bell,
  profile: User,
};

export default function NavItem({
  item,
  isActive,
  onClick,
  variant = "desktop",
  icon: ProvidedIcon,
}) {
  const Icon = ProvidedIcon || iconMap[item?.id] || Home;

  const activeClasses =
    "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30";

  const inactiveClasses =
    "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:scale-105";

  const size =
    variant === "mobile"
      ? "w-12 h-12 sm:w-14 sm:h-14"
      : "w-11 h-11";

  const label = item?.label || (item?.id ? item.id.charAt(0).toUpperCase() + item.id.slice(1) : "Nav link");

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      aria-label={label}
      title={label}
      className={`
        ${size}
        flex items-center justify-center
        rounded-full
        transition-all
        duration-200
        ease-out
        ${isActive ? activeClasses : inactiveClasses}
      `}
    >
      <Icon
        size={variant === "mobile" ? 22 : 20}
        strokeWidth={2.2}
        className="transition-transform duration-200 group-hover:scale-110"
      />
    </button>
  );
}
