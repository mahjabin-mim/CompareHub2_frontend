'use client';

import { FloatingOrbs } from '@/components/decor/FloatingOrbs';
import {
  useCreateProductSource,
  useDeleteProductSource,
  useProductSources
} from '@/features/ProductDiscovery/product-discovery.hooks';
import { FormEvent, useState } from 'react';

type FormState = {
  sourceName: string;
  baseUrl: string;
};

const initialForm: FormState = {
  sourceName: '',
  baseUrl: ''
};

export default function LinksPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [showAddForm, setShowAddForm] = useState(false);

  const { data, isLoading } = useProductSources();
  const createSource = useCreateProductSource();
  const deleteSource = useDeleteProductSource();

  const totalLinks = data?.length ?? 0;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await createSource.mutateAsync({
      sourceName: form.sourceName.trim(),
      sourceType: 'WEBSITE',
      baseUrl: form.baseUrl.trim(),
      searchEndpoint: '/',
      queryParamName: 's',
      httpMethod: 'GET',
      headersJson: '{}',
      namePath: 'products[].title',
      pricePath: 'products[].price',
      imagePath: 'products[].image',
      productUrlPath: 'products[].url',
      isActive: true
    });

    setForm(initialForm);
    setShowAddForm(false);
  };

  return (
    <main className="relative min-h-[calc(100vh-96px)] overflow-hidden bg-[radial-gradient(circle_at_top_left,#FBF0E6_0,#FEFAF7_34%,#FBF0E6_100%)]">
      <FloatingOrbs />
      <div className="relative mx-auto max-w-6xl space-y-5 px-4 py-8">
        <header className="animate-fade-in-up rounded-lg border border-brand-200 bg-brand-100 p-6 shadow-[0_18px_50px_rgba(193,89,46,0.10)] md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="inline-flex rounded-full bg-brand-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-brand-700">
                Sources
              </div>
              <h1 className="mt-4 text-2xl font-bold text-[#3A2417] md:text-3xl">Product Sources</h1>
              <p className="mt-2 text-sm text-[#3A2417]/80">Total links added: {totalLinks}</p>
            </div>
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className="rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(193,89,46,0.24)] transition-all duration-200 hover:bg-brand-700 active:scale-95"
            >
              {showAddForm ? 'Close' : 'Add Source'}
            </button>
          </div>
        </header>

        {showAddForm && (
          <form
            onSubmit={handleSubmit}
            className="grid animate-scale-in gap-3 rounded-lg border border-brand-200 bg-brand-100 p-5 shadow-[0_18px_50px_rgba(193,89,46,0.10)] md:grid-cols-3 md:p-6"
          >
            <input
              value={form.sourceName}
              onChange={(e) => setForm({ ...form, sourceName: e.target.value })}
              placeholder="Source name"
              className="h-12 rounded-lg border border-brand-300 bg-brand-100 px-4 text-sm text-[#3A2417] outline-none transition-all duration-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-200"
              required
            />
            <input
              value={form.baseUrl}
              onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
              placeholder="Website URL (https://example.com)"
              className="h-12 rounded-lg border border-brand-300 bg-brand-100 px-4 text-sm text-[#3A2417] outline-none transition-all duration-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-200 md:col-span-2"
              required
            />
            <div className="md:col-span-3">
              <button
                className="h-12 rounded-lg bg-brand-500 px-6 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(193,89,46,0.24)] transition-all duration-200 hover:bg-brand-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-brand-300 disabled:shadow-none disabled:active:scale-100"
                disabled={createSource.isPending}
              >
                {createSource.isPending ? 'Adding...' : 'Add Link'}
              </button>
            </div>
          </form>
        )}

        <section className="animate-fade-in-up rounded-lg border border-brand-200 bg-brand-100 p-5 shadow-[0_18px_50px_rgba(193,89,46,0.10)] [animation-delay:100ms] md:p-6">
          {isLoading ? (
            <div className="skeleton h-20 rounded-lg border border-brand-200" />
          ) : (
            <div className="space-y-2">
              {data?.map((source, index) => (
                <div
                  key={source.id}
                  className="flex animate-fade-in-up items-center justify-between gap-4 rounded-lg border border-brand-200 bg-brand-50/60 p-4 transition-colors duration-200 hover:border-brand-300"
                  style={{ animationDelay: `${Math.min(index, 10) * 50}ms` }}
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#3A2417]">{source.sourceName}</p>
                    <p className="truncate text-sm text-[#3A2417]/70">{source.baseUrl}</p>
                  </div>
                  <button
                    onClick={() => deleteSource.mutate(source.id)}
                    className="shrink-0 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-600 transition-all duration-200 hover:bg-red-100 active:scale-95"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {!data?.length && (
                <p className="rounded-lg border border-dashed border-brand-300 bg-brand-50/60 p-4 text-sm text-[#3A2417]/70">
                  No links added yet.
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
