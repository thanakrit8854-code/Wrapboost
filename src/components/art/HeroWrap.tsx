/**
 * A large hero wrap, cut open so the filling shows. Illustration rather than
 * photography: nobody has cooked this yet, and a drawing says so honestly
 * while still looking appetising.
 */
export function HeroWrap() {
  return (
    <div className="relative flex items-center justify-center">
      <div className="wb-hero-glow absolute h-56 w-56 rounded-full" />

      <svg viewBox="0 0 240 240" className="wb-hero-float relative h-56 w-56" aria-hidden="true">
        <ellipse cx="120" cy="214" rx="62" ry="10" className="fill-char-900" opacity="0.12" />

        {/* back wrap, angled */}
        <g transform="rotate(-14 120 130)">
          <path
            d="M84 62h44c7 0 12 5 11 12l-9 96c-1 7-6 12-13 12h-23c-7 0-12-5-13-12l-9-96c-1-7 4-12 11-12z"
            className="fill-amber-200"
            opacity="0.55"
          />
        </g>

        {/* main wrap */}
        <g className="wb-hero-wrap">
          <path
            d="M92 54h56c8 0 14 6 13 14l-11 110c-1 8-7 14-15 14h-30c-8 0-14-6-15-14L79 68c-1-8 5-14 13-14z"
            className="fill-amber-100"
          />

          {/* tortilla creases */}
          <path
            d="M86 92h68M88 120h64M91 148h58M94 176h50"
            className="stroke-amber-200"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />

          {/* cut face at the top: the filling */}
          <path d="M78 54c8-14 24-22 42-22s34 8 42 22z" className="fill-leaf-500" />

          {/* filling detail */}
          <circle cx="98" cy="42" r="7" className="fill-leaf-300" />
          <circle cx="120" cy="36" r="8.5" className="fill-red-300" />
          <circle cx="142" cy="42" r="7" className="fill-leaf-300" />
          <ellipse cx="110" cy="48" rx="10" ry="5" className="fill-sun-300" />
          <ellipse cx="134" cy="50" rx="9" ry="4.5" className="fill-sun-300" />

          {/* highlight */}
          <path
            d="M96 70q-4 40 2 96"
            className="stroke-white"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
            opacity="0.35"
          />
        </g>

        {/* floating ingredients */}
        <g className="wb-orbit-a">
          <circle cx="42" cy="88" r="13" className="fill-leaf-300" />
          <path d="M36 88q6-7 12 0" className="stroke-leaf-700" strokeWidth="2.5" fill="none" />
        </g>
        <g className="wb-orbit-b">
          <circle cx="200" cy="72" r="11" className="fill-red-300" />
        </g>
        <g className="wb-orbit-c">
          <ellipse cx="196" cy="158" rx="14" ry="9" className="fill-sun-300" />
        </g>
      </svg>
    </div>
  );
}
