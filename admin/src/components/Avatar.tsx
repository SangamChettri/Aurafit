interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const colorCombinations = [
  'bg-blue-500 text-white',
  'bg-green-500 text-white',
  'bg-purple-500 text-white',
  'bg-pink-500 text-white',
  'bg-amber-500 text-white',
  'bg-cyan-500 text-white',
  'bg-indigo-500 text-white',
  'bg-rose-500 text-white',
];

export default function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  // Get initials from name
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Deterministic color based on name
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colorCombinations.length;
  const colorClass = colorCombinations[colorIndex];

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${colorClass}
        rounded-full flex items-center justify-center font-semibold
        ${className}
      `}
    >
      {initials}
    </div>
  );
}
