/**
 * A glass panel that sits over a soft gradient sky. Rounded, translucent,
 * and lit from the top-left so it reads as a surface rather than a rectangle.
 */
export function AirportScene() {
  return (
    <div className="wb-glass-scene relative isolate h-32 w-full overflow-hidden rounded-[28px]">
      {/* gradient sky behind the glass */}
      <div className="wb-sky-wash absolute inset-0" />

      {/* drifting light blobs */}
      <div className="wb-blob wb-blob-a absolute h-24 w-24 rounded-full" />
      <div className="wb-blob wb-blob-b absolute h-20 w-20 rounded-full" />

      {/* frosted glass layer */}
      <div className="absolute inset-0 rounded-[28px] bg-white/18 backdrop-blur-xl" />

      {/* specular highlight along the top edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
      <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-white/35 ring-inset" />

      {/* content */}
      <svg
        viewBox="0 0 320 128"
        className="relative h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <g className="wb-plane" opacity="0.95">
          <path
            d="M0 0l26 8-8 3.5-5-1.8-3.5 6-3.5-0.9 1.8-7-8-2.6 2.6-2.6z"
            className="fill-white"
          />
        </g>

        <g opacity="0.32">
          <ellipse cx="70" cy="34" rx="26" ry="9" className="fill-white" />
          <ellipse cx="88" cy="30" rx="17" ry="11" className="fill-white" />
        </g>

        <g className="wb-scene-wrap">
          <ellipse cx="160" cy="112" rx="26" ry="4" className="fill-char-900" opacity="0.12" />
          <path
            d="M146 62h28c3.5 0 6 2.5 5 6l-5 36c-0.5 3.5-3 6-6.5 6h-15c-3.5 0-6-2.5-6.5-6l-5-36c-1-3.5 1.5-6 5-6z"
            className="fill-amber-100"
          />
          <path d="M145 62c4.5-6 9-8.5 15-8.5s10.5 2.5 15 8.5z" className="fill-leaf-500" />
          <circle cx="153" cy="58" r="2.6" className="fill-leaf-300" />
          <circle cx="160" cy="56" r="3" className="fill-red-300" />
          <circle cx="167" cy="58" r="2.6" className="fill-leaf-300" />
          <circle cx="154" cy="76" r="2.2" className="fill-char-900" />
          <circle cx="166" cy="76" r="2.2" className="fill-char-900" />
          <path
            d="M155 84q5 5 10 0"
            className="stroke-char-900"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
}
