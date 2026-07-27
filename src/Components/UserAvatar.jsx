import React from 'react';

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

  return (
    <div
      className={`
        
        ${sizeClasses[size]} ${className}
      `}
      aria-label={`${fullName || name} avatar`}
      title={fullName || name}
    >
      <div className="flex items-center space-x-3">
        <img src={image} alt="User Avatar" className="w-8 h-8 rounded-full" />
      </div>
    </div>
  );
}
