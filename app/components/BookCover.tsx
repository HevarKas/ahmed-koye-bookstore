import { cn } from '~/lib/utils';

// Hand-picked cloth-binding colours; each book always gets the same one.
const BINDINGS = [
  { bg: '#1F4D3F', ink: '#F3E9D2' },
  { bg: '#7A2E2E', ink: '#F6E7D0' },
  { bg: '#23395B', ink: '#EDE6D6' },
  { bg: '#B5532E', ink: '#FFF4E6' },
  { bg: '#4B3F72', ink: '#EFE7FA' },
  { bg: '#2F5D62', ink: '#E8F1EE' },
  { bg: '#8A6A1F', ink: '#FFF6DF' },
  { bg: '#3D3D3D', ink: '#F1ECE2' },
  { bg: '#5E3A54', ink: '#F7E9F1' },
  { bg: '#335C3B', ink: '#EEF5E6' },
];

type Props = {
  id: number;
  title: string;
  author?: string | null;
  categoryId: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function BookCover({ id, title, author, categoryId, size = 'md', className }: Props) {
  const binding = BINDINGS[(id * 7 + categoryId) % BINDINGS.length];
  const pattern = id % 3;

  return (
    <div
      className={cn(
        'relative isolate flex aspect-[2/3] w-full flex-col overflow-hidden rounded-md shadow-[0_1px_2px_rgba(0,0,0,.15),0_8px_24px_-12px_rgba(0,0,0,.45)]',
        className,
      )}
      style={{ backgroundColor: binding.bg, color: binding.ink }}
      aria-hidden="true"
    >
      {/* spine shadow on the right edge (RTL books open from the right) */}
      <div className="absolute inset-y-0 right-0 w-3 bg-gradient-to-l from-black/30 to-transparent" />
      <div className="absolute inset-y-0 right-3 w-px bg-white/10" />

      {pattern === 0 && <div className="absolute inset-3 rounded-sm border opacity-40" style={{ borderColor: binding.ink }} />}
      {pattern === 1 && (
        <div
          className="absolute inset-x-0 top-0 h-1/3 opacity-15"
          style={{ backgroundImage: `repeating-linear-gradient(135deg, ${binding.ink} 0 1px, transparent 1px 9px)` }}
        />
      )}
      {pattern === 2 && (
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full opacity-15" style={{ backgroundColor: binding.ink }} />
      )}

      <div className={cn('relative flex flex-1 flex-col justify-center px-[12%] text-center', size === 'sm' ? 'gap-1' : 'gap-2')}>
        <div className="mx-auto h-px w-1/3 opacity-50" style={{ backgroundColor: binding.ink }} />
        <p
          className={cn(
            'font-display font-bold leading-snug line-clamp-4',
            size === 'sm' && 'text-[0.7rem]',
            size === 'md' && 'text-sm sm:text-base',
            size === 'lg' && 'text-xl sm:text-2xl',
          )}
        >
          {title}
        </p>
        <div className="mx-auto h-px w-1/3 opacity-50" style={{ backgroundColor: binding.ink }} />
      </div>
      {author && size !== 'sm' && (
        <p className={cn('relative truncate px-4 pb-4 text-center opacity-80', size === 'lg' ? 'text-sm' : 'text-[0.7rem]')}>
          {author}
        </p>
      )}
    </div>
  );
}
