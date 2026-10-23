import { FloatingOrbs } from '@/components/decor/FloatingOrbs';
import { SourceLinksPanel } from '@/features/ProductDiscovery/product-discovery.components/SourceLinksPanel';

export default function ProductDiscoveryLinksPage() {
  return (
    <main className="relative min-h-[calc(100vh-96px)] overflow-hidden bg-[radial-gradient(circle_at_top_left,#FBF0E6_0,#FEFAF7_34%,#FBF0E6_100%)]">
      <FloatingOrbs />
      <div className="relative mx-auto max-w-6xl space-y-6 px-4 py-8">
        <header className="animate-fade-in-up rounded-lg border border-brand-200 bg-brand-100 p-6 shadow-[0_18px_50px_rgba(193,89,46,0.10)] md:p-8">
          <div className="inline-flex rounded-full bg-brand-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-brand-700">
            Sources
          </div>
          <h1 className="mt-4 text-2xl font-bold text-[#3A2417] md:text-3xl">Manage Source Links</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#3A2417]/80">
            Add the ecommerce sites CompareHub should search for your account.
          </p>
        </header>
        <SourceLinksPanel />
      </div>
    </main>
  );
}
