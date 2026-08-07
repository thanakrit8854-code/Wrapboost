'use client';

import { formatTHBPlain } from '@/lib/money';
import type { MenuOptionGroup } from '@/types/menu';

export function OptionGroupPicker({
  group,
  selected,
  onToggle,
}: {
  group: MenuOptionGroup;
  selected: string[];
  onToggle: (optionId: string) => void;
}) {
  const atMax = group.select_type === 'MULTI' && selected.length >= group.max_select;

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="text-char-900 font-semibold">{group.name_th}</h3>
        <span className="text-char-500 text-xs">
          {group.is_required
            ? 'ต้องเลือก'
            : group.select_type === 'MULTI'
              ? `เลือกได้ถึง ${group.max_select}`
              : 'ไม่บังคับ'}
        </span>
      </div>

      <div className="space-y-2">
        {group.options.map((option) => {
          const isSelected = selected.includes(option.id);
          const isBlocked = !option.is_available || (atMax && !isSelected);

          return (
            <button
              key={option.id}
              type="button"
              disabled={isBlocked}
              onClick={() => onToggle(option.id)}
              className={[
                'flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all',
                isSelected
                  ? 'border-leaf-500 bg-leaf-50 wb-pop wb-glow-ring'
                  : 'border-char-200 bg-white active:scale-[0.98]',
                isBlocked ? 'cursor-not-allowed opacity-40' : '',
              ].join(' ')}
            >
              <div className="flex min-w-0 items-center gap-3">
                {isSelected && (
                  <span className="bg-leaf-500 wb-tick flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                    ✓
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-char-900 text-sm font-medium">{option.name_th}</p>
                  <p className="text-char-500 text-xs">
                    {option.protein_delta_g > 0 && `+${option.protein_delta_g} g โปรตีน · `}
                    {option.kcal_delta > 0 ? `+${option.kcal_delta}` : option.kcal_delta} kcal
                    {!option.is_available && ' · หมดแล้ว'}
                  </p>
                </div>
              </div>
              <span className="text-char-900 ml-3 shrink-0 text-sm font-semibold">
                {option.price_delta > 0 ? `+฿${formatTHBPlain(option.price_delta)}` : '฿0'}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
