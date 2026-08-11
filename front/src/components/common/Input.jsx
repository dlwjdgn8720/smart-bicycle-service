import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Input({ icon: Icon, type = "text", error, className = "", ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword && showPassword ? "text" : type;

  return (
    <div className={className}>
      <div
        className={`flex items-center gap-3 rounded-lg border bg-card px-4 py-3 ${
          error ? "border-danger" : "border-border focus-within:border-white/40"
        }`}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0 text-gray-500" />}
        <input
          type={resolvedType}
          className="w-full bg-transparent text-sm text-white placeholder:text-gray-500 outline-none"
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-gray-500 hover:text-gray-300"
            aria-label="비밀번호 표시 전환"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}
