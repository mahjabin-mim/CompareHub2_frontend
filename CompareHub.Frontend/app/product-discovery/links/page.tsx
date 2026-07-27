import { SourceLinksPanel } from '@/features/ProductDiscovery/product-discovery.components/SourceLinksPanel';

export default function ProductDiscoveryLinksPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <header className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Manage Source Links</h1>
        <p className="mt-1 text-slate-600">Add the ecommerce sites CompareHub should search for your account.</p>
      </header>
      <SourceLinksPanel />
    </main>
  );
}
