import { ProductSearchPanel } from '@/features/ProductDiscovery/product-discovery.components/ProductSearchPanel';

export default function ProductDiscoveryPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <header className="rounded-2xl bg-gradient-to-r from-brand-500 to-emerald-600 p-6 text-white">
        <h1 className="text-2xl font-semibold">Product Discovery</h1>
        <p className="mt-1 text-white/90">Search products from your saved source links and compare by lowest price.</p>
      </header>
      <ProductSearchPanel />
    </main>
  );
}
