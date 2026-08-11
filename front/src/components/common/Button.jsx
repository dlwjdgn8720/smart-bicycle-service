const VARIANTS = {
  primary: "bg-neon text-black hover:bg-neon-dark",
  cyan: "bg-bike text-black hover:bg-bike-dark",
  outline: "border border-border bg-transparent text-white hover:border-white/40",
  ghost: "bg-transparent text-gray-300 hover:text-white",
  dark: "bg-card border border-border text-white hover:border-white/30",
  black: "bg-black text-white hover:bg-black/80",
  blackOutline: "border border-black/30 bg-transparent text-black hover:border-black",
};

const SIZES = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

export default function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) {
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
