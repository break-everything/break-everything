import type { CSSProperties } from "react";

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

export default function ToolIcon({
  icon,
  name,
  className,
  fallbackClassName,
}: {
  icon: string;
  name: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const value = String(icon ?? "").trim();
  if (isHttpUrl(value)) {
    const style: CSSProperties = {
      backgroundImage: `url(${value})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
    return (
      <span
        className={className}
        role="img"
        aria-label={`${name} icon`}
        style={style}
      />
    );
  }

  return <span className={fallbackClassName}>{value || "🔧"}</span>;
}

