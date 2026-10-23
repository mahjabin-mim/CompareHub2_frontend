export function FloatingOrbs({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <span className="absolute -left-16 top-10 h-64 w-64 animate-float-slow rounded-full bg-brand-300/50 blur-2xl" />
      <span className="absolute -right-10 top-1/3 h-80 w-80 animate-float-slower rounded-full bg-brand-500/35 blur-2xl [animation-delay:-4s]" />
      <span className="absolute bottom-24 left-1/4 h-72 w-72 animate-float-fast rounded-full bg-brand-300/45 blur-2xl [animation-delay:-2s]" />
      <span className="absolute -bottom-10 right-1/4 h-56 w-56 animate-float-slow rounded-full bg-brand-500/30 blur-2xl [animation-delay:-6s]" />
    </div>
  );
}
