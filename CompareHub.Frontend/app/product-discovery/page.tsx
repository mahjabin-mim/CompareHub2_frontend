import Link from 'next/link';
import { FloatingOrbs } from '@/components/decor/FloatingOrbs';
import { ProductSearchPanel } from '@/features/ProductDiscovery/product-discovery.components/ProductSearchPanel';

export default function ProductDiscoveryPage() {
  return (
    <main className="relative min-h-[calc(100vh-96px)] overflow-hidden bg-[radial-gradient(circle_at_top_left,#FBF0E6_0,#FEFAF7_34%,#FBF0E6_100%)]">
      <FloatingOrbs />
      <div className="relative mx-auto max-w-6xl space-y-6 px-4 py-8">
        <header className="flex animate-fade-in-up flex-wrap items-center justify-between gap-4 rounded-lg border border-brand-200 bg-brand-100 p-6 shadow-[0_18px_50px_rgba(193,89,46,0.10)] md:p-8">
          <div>
            <div className="inline-flex rounded-full bg-brand-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-brand-700">
              Product Discovery
            </div>
            <h1 className="mt-4 text-2xl font-bold text-[#3A2417] md:text-3xl">Compare prices across your sources</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#3A2417]/80">
              Search products from your saved source links and compare by lowest price.
            </p>
          </div>
          <Link
            href="/product-discovery/links"
            className="inline-flex items-center gap-2 rounded-lg border border-brand-300 bg-brand-100 px-5 py-3 text-sm font-semibold text-brand-700 shadow-[0_10px_22px_rgba(193,89,46,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500 hover:bg-brand-200 active:translate-y-0 active:scale-95"
          >
            Manage Sources
          </Link>
        </header>
        <ProductSearchPanel />
      </div>
    </main>
  );
}
