export default function SectionTitle({ eyebrow, title, description, align = "left", className = "" }) {
  return (
    <div className={`${align === "center" ? "text-center" : ""} ${className}`}>
      {eyebrow && (
        <p className="mb-3 text-sm font-bold uppercase tracking-wide text-neon">{eyebrow}</p>
      )}
      <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 max-w-xl text-sm text-gray-400">{description}</p>}
    </div>
  );
}
