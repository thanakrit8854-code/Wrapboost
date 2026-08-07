/**
 * A quiet departure-hall scene. Vector, not photography: the counter does not
 * exist yet, and an illustration says that honestly while still filling space.
 */
export function AirportScene() {
  return (
    <div className="wb-scene relative h-44 w-full overflow-hidden">
      <svg viewBox="0 0 400 176" className="h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="wb-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-leaf-700)" />
            <stop offset="100%" stopColor="var(--color-leaf-600)" />
          </linearGradient>
        </defs>

        <rect width="400" height="176" fill="url(#wb-sky)" />

        <circle cx="330" cy="40" r="26" className="fill-leaf-500" opacity="0.45" />
        <circle cx="330" cy="40" r="16" className="fill-leaf-300" opacity="0.5" />

        <g className="wb-cloud-a" opacity="0.25">
          <ellipse cx="70" cy="42" rx="30" ry="11" className="fill-white" />
          <ellipse cx="92" cy="38" rx="20" ry="13" className="fill-white" />
        </g>
        <g className="wb-cloud-b" opacity="0.18">
          <ellipse cx="250" cy="66" rx="34" ry="10" className="fill-white" />
          <ellipse cx="272" cy="62" rx="22" ry="12" className="fill-white" />
        </g>

        <g className="wb-plane" opacity="0.9">
          <path d="M0 0l30 9-9 4-6-2-4 7-4-1 2-8-9-3 3-3z" className="fill-white" opacity="0.85" />
        </g>

        <g opacity="0.3">
          <rect x="24" y="104" width="18" height="34" rx="2" className="fill-leaf-300" />
          <rect x="50" y="94" width="22" height="44" rx="2" className="fill-leaf-300" />
          <rect x="80" y="112" width="16" height="26" rx="2" className="fill-leaf-300" />
          <rect x="300" y="98" width="24" height="40" rx="2" className="fill-leaf-300" />
          <rect x="332" y="110" width="18" height="28" rx="2" className="fill-leaf-300" />
        </g>

        <rect y="138" width="400" height="38" className="fill-leaf-600" opacity="0.55" />

        <g className="wb-counter">
          <rect
            x="150"
            y="112"
            width="100"
            height="30"
            rx="5"
            className="fill-white"
            opacity="0.92"
          />
          <rect x="150" y="112" width="100" height="8" rx="4" className="fill-leaf-300" />
          <rect x="158" y="126" width="26" height="10" rx="2" className="fill-leaf-100" />
          <rect x="190" y="126" width="26" height="10" rx="2" className="fill-leaf-100" />
          <rect x="222" y="126" width="20" height="10" rx="2" className="fill-leaf-100" />
        </g>

        <g className="wb-scene-wrap">
          <path
            d="M188 78h24c3 0 5 2 4 5l-4 30c0 3-3 5-6 5h-16c-3 0-6-2-6-5l-4-30c-1-3 1-5 4-5z"
            className="fill-amber-100"
          />
          <path d="M187 78c4-5 8-7 13-7s9 2 13 7z" className="fill-leaf-500" />
          <circle cx="195" cy="90" r="2" className="fill-char-900" />
          <circle cx="205" cy="90" r="2" className="fill-char-900" />
          <path
            d="M196 98q4 4 8 0"
            className="stroke-char-900"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
}
