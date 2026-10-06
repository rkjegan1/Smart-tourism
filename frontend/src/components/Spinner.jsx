export default function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-[1.5px]',
    md: 'w-5 h-5 border-2',
    lg: 'w-8 h-8 border-[3px]',
  };
  return (
    <div
      className={`${sizes[size]} border-current border-t-transparent rounded-full animate-spinner ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
