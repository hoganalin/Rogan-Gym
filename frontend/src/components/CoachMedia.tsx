import { useState } from "react";

export function CoachMedia({
  src,
  name,
  className = "",
}: {
  src: string | null;
  name: string;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);

  if (src && !broken) {
    return <img src={src} alt="" className={`object-cover ${className}`} onError={() => setBroken(true)} />;
  }

  return (
    <div
      className={`flex items-center justify-center bg-brand-500/15 font-display text-4xl font-black text-brand-400 ${className}`}
    >
      {name.charAt(0)}
    </div>
  );
}
