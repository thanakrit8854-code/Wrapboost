import Link from 'next/link';

import { formatTHBPlain } from '@/lib/money';
import type { MenuProduct } from '@/types/menu';

export function ProductCard({
  product,
  storeSlug,
  index = 0,
}: {
  product: MenuProduct;
  storeSlug: string;
  index?: number;
}) {
  const optionCount = product.option_groups.reduce((sum, g) => sum + g.options.length, 0);

  return (
    <Link
      href={`/build/${product.id}?store=${storeSlug}`}
      style={{ animationDelay: `${index * 130}ms` }}
      className="border-char-200 active:border-leaf-500 wb-float-in wb-shine-host wb-card-press block rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(26,26,23,0.04)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-char-900 font-semibold">{product.name_th}</h3>
          {product.description_th && (
            <p className="text-char-500 mt-1 text-sm leading-relaxed">{product.description_th}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-char-900 text-lg font-bold">฿{formatTHBPlain(product.base_price)}</p>
          <p className="text-char-500 text-xs">เริ่มต้น</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="bg-leaf-50 text-leaf-700 rounded-full px-2.5 py-1 text-xs font-medium">
          โปรตีน {product.base_protein_g} g
        </span>
        <span className="bg-char-50 text-char-500 rounded-full px-2.5 py-1 text-xs font-medium">
          {product.base_kcal} kcal
        </span>
        {optionCount > 0 && (
          <span className="text-char-500 text-xs">เลือกได้ {optionCount} รายการ</span>
        )}
      </div>

      {!product.is_available && (
        <p className="mt-3 text-sm font-medium text-red-600">ของหมดชั่วคราว</p>
      )}
    </Link>
  );
}
