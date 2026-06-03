import React from 'react';

interface UserAvatarProps {
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  size?: number;
}

/**
 * Circular avatar — shows profile image if available,
 * otherwise shows the user's initials (FIRST + LAST, uppercase) on a gradient.
 */
const UserAvatar: React.FC<UserAvatarProps> = ({
  firstName = '',
  lastName  = '',
  profileImageUrl,
  size = 32,
}) => {
  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '?';

  const baseStyle: React.CSSProperties = {
    width:        size,
    height:       size,
    borderRadius: '50%',
    flexShrink:   0,
    display:      'inline-flex',
    alignItems:   'center',
    justifyContent: 'center',
    fontSize:     size * 0.36,
    fontWeight:   700,
    fontFamily:   'Plus Jakarta Sans, system-ui, sans-serif',
    letterSpacing: '-0.02em',
    border:       '1.5px solid var(--color-border)',
    overflow:     'hidden',
    userSelect:   'none',
  };

  if (profileImageUrl) {
    return (
      <div style={{
        ...baseStyle,
        backgroundImage:    `url(${profileImageUrl})`,
        backgroundSize:     'cover',
        backgroundPosition: 'center',
      }} />
    );
  }

  return (
    <div style={{
      ...baseStyle,
      background: 'linear-gradient(135deg, #5865f2, #7c3aed)',
      color:      '#fff',
    }}>
      {initials}
    </div>
  );
};

export default UserAvatar;
