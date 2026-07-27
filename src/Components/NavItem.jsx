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
  const Icon = ProvidedIcon || iconMap[item.id];

  const activeClasses =
    "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30";

  const inactiveClasses =
    "text-gray-500 hover:text-gray-900 hover:bg-gray-100 hover:scale-105";

  const size =
    variant === "mobile"
      ? "w-14 h-14"
      : "w-11 h-11";

  return (
    <button
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      aria-label={item.label}
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
        size={variant === "mobile" ? 26 : 22}
        strokeWidth={2.2}
        className="transition-transform duration-200 group-hover:scale-110"
      />
    </button>
  );
}