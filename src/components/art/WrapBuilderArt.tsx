export interface WrapLayers {
  base: string | null;
  protein: string | null;
  veggies: string[];
  sauce: string | null;
}

const PROTEIN_FILL: Record<string, string> = {
  chicken: 'fill-sun-300',
  tuna: 'fill-sky-300',
  tofu: 'fill-sand-100',
};

function proteinKind(name: string | null): string | null {
  if (!name) return null;
  if (name.includes('ไก่')) return 'chicken';
  if (name.includes('ทูน่า')) return 'tuna';
  if (name.includes('เต้าหู้')) return 'tofu';
  return 'chicken';
}

/**
 * The wrap fills in as the customer chooses. Seeing the sandwich assemble is
 * the closest a screen gets to watching it made at the counter.
 */
export function WrapBuilderArt({ layers }: { layers: WrapLayers }) {
  const kind = proteinKind(layers.protein);
  const isSpinach = layers.base?.includes('ผักโขม') ?? false;

  return (
    <svg viewBox="0 0 160 150" className="h-32 w-auto" aria-hidden="true">
      <ellipse cx="80" cy="140" rx="34" ry="6" className="fill-char-200" opacity="0.35" />

      {/* tortilla */}
      <path
        d="M56 30h48c5 0 9 4 8 9l-7 82c-1 5-4 9-9 9H64c-5 0-8-4-9-9l-7-82c-1-5 3-9 8-9z"
        className={isSpinach ? 'fill-leaf-100' : 'fill-amber-100'}
      />
      <path
        d="M59 52h42M60 74h40M62 96h36"
        className={isSpinach ? 'stroke-leaf-300' : 'stroke-amber-200'}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />

      {/* protein */}
      {kind && (
        <g className="wb-layer-in">
          <rect x="64" y="36" width="32" height="13" rx="6" className={PROTEIN_FILL[kind]} />
          <rect
            x="68"
            y="52"
            width="26"
            height="11"
            rx="5"
            className={PROTEIN_FILL[kind]}
            opacity="0.85"
          />
        </g>
      )}

      {/* vegetables stack up one by one */}
      {layers.veggies.slice(0, 4).map((v, i) => (
        <g key={v} className="wb-layer-in" style={{ animationDelay: `${i * 90}ms` }}>
          <ellipse
            cx={70 + (i % 2) * 20}
            cy={22 - i * 5}
            rx="11"
            ry="6"
            className={i % 2 === 0 ? 'fill-leaf-500' : 'fill-leaf-300'}
          />
        </g>
      ))}

      {/* sauce drizzle */}
      {layers.sauce && !layers.sauce.includes('ไม่ใส่') && (
        <path
          d="M62 44q8 6 16 0t16 0"
          className="stroke-sun-500 wb-layer-in"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
      )}

      {/* empty state hint */}
      {!kind && layers.veggies.length === 0 && (
        <text x="80" y="80" textAnchor="middle" className="fill-char-500" fontSize="11">
          เลือกวัตถุดิบ
        </text>
      )}
    </svg>
  );
}
