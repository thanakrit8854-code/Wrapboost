import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ProductCard } from '@/components/menu/ProductCard';
import { getStoreMenu } from '@/server/services/menuService';

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ store?: string; c?: string }>;
}) {
  const { store: storeSlug = 'cei-domestic' } = await searchParams;

  const menu = await getStoreMenu(storeSlug);
  if (!menu) notFound();

  return (
    <main className="mx-auto min-h-dvh max-w-md pb-24">
      <header className="border-char-200 sticky top-0 z-10 border-b bg-white/95 px-4 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link
            href={`/s/${storeSlug}`}
            className="text-char-500 flex h-10 w-10 items-center justify-center rounded-full"
            aria-label="ย้อนกลับ"
          >
            ←
          </Link>
          <div className="min-w-0">
            <h1 className="text-char-900 truncate font-semibold">เมนู</h1>
            <p className="text-char-500 truncate text-xs">{menu.store.name}</p>
          </div>
        </div>
      </header>

      <div className="space-y-8 px-4 pt-6">
        {menu.categories.map((category) => (
          <section key={category.id}>
            <h2 className="text-char-900 mb-3 text-lg font-bold">{category.name_th}</h2>
            <div className="space-y-3">
              {category.products.map((product) => (
                <ProductCard key={product.id} product={product} storeSlug={storeSlug} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="text-char-500 mt-10 px-4 text-center text-xs leading-relaxed">
        ค่าโปรตีนและแคลอรีเป็นค่าประมาณเบื้องต้น
        <br />
        รอผลตรวจวิเคราะห์จากห้องปฏิบัติการ
      </p>
    </main>
  );
}
