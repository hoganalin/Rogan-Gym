import { useState } from "react";

type CoachMediaProps = {
  src: string | null;
  name: string;
  className?: string;
};

export function CoachMedia(props: CoachMediaProps) {
  // Each URL gets fresh loading state, including after an earlier image failed.
  return <CoachMediaImage key={props.src} {...props} />;
}

function CoachMediaImage({
  src,
  name,
  className = "",
}: CoachMediaProps) {
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
