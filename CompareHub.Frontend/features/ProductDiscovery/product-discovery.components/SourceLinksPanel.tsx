'use client';

import { FormEvent, useState } from 'react';
import { useCreateProductSource, useDeleteProductSource, useProductSources } from '../product-discovery.hooks';

export function SourceLinksPanel() {
  const [baseUrl, setBaseUrl] = useState('');
  const [sourceName, setSourceName] = useState('');

  const { data, isLoading } = useProductSources();
  const createSource = useCreateProductSource();
  const deleteSource = useDeleteProductSource();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await createSource.mutateAsync({
      sourceName,
      sourceType: 'API',
      baseUrl,
      searchEndpoint: '/search',
      queryParamName: 'q',
      httpMethod: 'GET',
      headersJson: '{}',
      namePath: 'products[].title',
      pricePath: 'products[].price',
      imagePath: 'products[].image',
      productUrlPath: 'products[].url',
      isActive: true
    });
    setBaseUrl('');
    setSourceName('');
  };

  return (
    <section className="space-y-5">
      <form
        onSubmit={handleSubmit}
        className="grid animate-fade-in-up gap-3 rounded-lg border border-brand-200 bg-brand-100 p-5 shadow-[0_18px_50px_rgba(193,89,46,0.10)] transition-shadow duration-300 hover:shadow-[0_22px_60px_rgba(193,89,46,0.14)] md:grid-cols-3 md:p-6"
      >
        <input
          value={sourceName}
          onChange={(e) => setSourceName(e.target.value)}
          placeholder="Source name"
          className="h-12 rounded-lg border border-brand-300 bg-brand-100 px-4 text-sm text-[#3A2417] outline-none transition-all duration-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-200"
          required
        />
        <input
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="https://example.com"
          className="h-12 rounded-lg border border-brand-300 bg-brand-100 px-4 text-sm text-[#3A2417] outline-none transition-all duration-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-200"
          required
        />
        <button className="h-12 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(193,89,46,0.24)] transition-all duration-200 hover:bg-brand-700 active:scale-95">
          Add Link
        </button>
      </form>

      {isLoading ? (
        <div className="skeleton h-24 rounded-lg border border-brand-200" />
      ) : (
        <div className="animate-fade-in-up rounded-lg border border-brand-200 bg-brand-100 p-5 shadow-[0_18px_50px_rgba(193,89,46,0.10)] [animation-delay:100ms] md:p-6">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-brand-700">Saved Source Links</h3>
          <div className="space-y-2">
            {data?.map((link, index) => (
              <div
                key={link.id}
                className="flex animate-fade-in-up items-center justify-between gap-4 rounded-lg border border-brand-200 bg-brand-50/60 p-4 transition-colors duration-200 hover:border-brand-300"
                style={{ animationDelay: `${Math.min(index, 10) * 50}ms` }}
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#3A2417]">{link.sourceName}</p>
                  <p className="truncate text-sm text-[#3A2417]/70">
                    {link.baseUrl}
                    {link.searchEndpoint}
                  </p>
                </div>
                <button
                  onClick={() => deleteSource.mutate(link.id)}
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
        </div>
      )}
    </section>
  );
}
