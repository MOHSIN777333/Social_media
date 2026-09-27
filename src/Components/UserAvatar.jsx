export default function UserAvatar({
  fullName,
  image,
  name = 'User',
  size = 'medium',
  className = '',
}) {
  const sizeClasses = {
    small: 'w-8 h-8 text-xs',
    medium: 'w-10 h-10 text-sm',
    large: 'w-12 h-12 text-base',
  };

  const displayName = fullName || name;
  const initial = displayName.charAt(0).toUpperCase() || 'U';

  return (
    <div
      className={`relative shrink-0 rounded-full overflow-hidden shadow-xs ${
        sizeClasses[size] || sizeClasses.medium
      } ${className}`}
      aria-label={`${displayName} avatar`}
      title={displayName}
    >
      {image ? (
        <img
          src={image}
          alt={displayName}
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            // Graceful fallback to initial if image fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div className="w-full h-full rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold uppercase select-none">
          {initial}
        </div>
      )}
    </div>
  );
}
