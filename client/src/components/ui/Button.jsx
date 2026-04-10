export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center gap-1.5 font-[500] transition-opacity rounded-[6px] cursor-pointer border-[0.5px] disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-transparent',
    secondary: 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-strong)]',
    ghost: 'bg-transparent text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]',
    danger: 'bg-transparent text-red-500 border-[var(--border-strong)]',
  }

  const sizes = {
    sm: 'px-2.5 py-1 text-[12px]',
    md: 'px-3 py-1.5 text-[13px]',
    lg: 'px-4 py-2 text-[14px]',
  }

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}
