type ArtKind = 'WRAP' | 'DRINK' | 'COMBO' | 'SIDE';

/**
 * Hand-drawn vector food, not stock photography. A prototype that shows
 * illustrations reads as a concept; one that shows glossy photos of food
 * nobody has cooked yet invites the wrong question.
 */
export function FoodArt({ kind, className = '' }: { kind: ArtKind; className?: string }) {
  if (kind === 'DRINK') {
    return (
      <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
        <path d="M24 20h32l-4 46a6 6 0 0 1-6 5H34a6 6 0 0 1-6-5z" className="fill-leaf-100" />
        <path d="M27 40h26l-3 26a5 5 0 0 1-5 4H35a5 5 0 0 1-5-4z" className="fill-leaf-500" />
        <ellipse cx="40" cy="20" rx="16" ry="4" className="fill-leaf-300" />
        <rect
          x="44"
          y="6"
          width="4"
          height="18"
          rx="2"
          className="fill-char-500"
          transform="rotate(12 46 15)"
        />
        <circle cx="34" cy="50" r="2.5" className="fill-white" opacity="0.65" />
        <circle cx="45" cy="58" r="2" className="fill-white" opacity="0.5" />
      </svg>
    );
  }

  if (kind === 'COMBO') {
    return (
      <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
        <path
          d="M8 26h26c3 0 5 2 4 5l-5 38c0 3-2 5-5 5H14c-3 0-5-2-5-5L4 31c-1-3 1-5 4-5z"
          className="fill-amber-100"
        />
        <path d="M7 26c4-5 10-7 16-7s12 2 16 7z" className="fill-leaf-500" />
        <path
          d="M11 40h24M12 52h22"
          className="stroke-amber-200"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M48 30h22l-3 38a5 5 0 0 1-5 4H56a5 5 0 0 1-5-4z" className="fill-leaf-100" />
        <path d="M50 46h18l-2 22a4 4 0 0 1-4 3H56a4 4 0 0 1-4-3z" className="fill-leaf-500" />
        <ellipse cx="59" cy="30" rx="11" ry="3" className="fill-leaf-300" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
      <path
        d="M22 18h36c4 0 7 3 6 7l-6 42c-1 4-4 7-8 7H30c-4 0-7-3-8-7l-6-42c-1-4 2-7 6-7z"
        className="fill-amber-100"
      />
      <path d="M21 18c5-7 12-10 19-10s14 3 19 10z" className="fill-leaf-500" />
      <circle cx="31" cy="12" r="3.5" className="fill-leaf-300" />
      <circle cx="40" cy="9" r="4" className="fill-red-300" />
      <circle cx="49" cy="12" r="3.5" className="fill-leaf-300" />
      <path
        d="M25 34h30M26 46h28M28 58h24"
        className="stroke-amber-200"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
