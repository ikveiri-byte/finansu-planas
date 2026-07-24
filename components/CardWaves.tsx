type CardWavesProps = {
  className?: string;
  opacity?: number;
};

export default function CardWaves({
  className = "",
  opacity = 0.18,
}: CardWavesProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 420 240"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-0 h-full w-full text-[#20A9F3] ${className}`}
    >
      <path
        d="M-35 36 C72 -14 124 130 244 78 S382 130 458 34"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.15"
        vectorEffect="non-scaling-stroke"
        opacity={opacity}
      />
      <path
        d="M-48 72 C62 18 136 168 262 104 S392 178 470 74"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.05"
        vectorEffect="non-scaling-stroke"
        opacity={opacity * 0.82}
      />
      <path
        d="M148 -24 C176 56 250 74 320 112 S382 204 446 230"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        opacity={opacity * 0.72}
      />
    </svg>
  );
}

