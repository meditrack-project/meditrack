import './InitialsAvatar.css';

function InitialsAvatar({ name = '', size = 40 }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className="initials-avatar"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${size * 0.4}px`,
      }}
    >
      {initials || '?'}
    </div>
  );
}

export default InitialsAvatar;
