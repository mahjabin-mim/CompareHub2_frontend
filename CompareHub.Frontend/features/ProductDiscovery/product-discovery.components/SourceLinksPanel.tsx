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
    <section className="space-y-4">
      <form onSubmit={handleSubmit} className="grid gap-3 rounded-xl bg-white p-4 shadow-sm md:grid-cols-3">
        <input
          value={sourceName}
          onChange={(e) => setSourceName(e.target.value)}
          placeholder="Source name"
          className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-brand-500"
          required
        />
        <input
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="https://example.com"
          className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-brand-500"
          required
        />
        <button className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-700">Add Link</button>
      </form>

      {isLoading ? (
        <div className="h-24 animate-pulse rounded-xl bg-slate-200" />
      ) : (
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Saved Source Links</h3>
          <div className="space-y-2">
            {data?.map((link) => (
              <div key={link.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div>
                  <p className="font-medium">{link.sourceName}</p>
                  <p className="text-sm text-slate-500">{link.baseUrl}{link.searchEndpoint}</p>
                </div>
                <button
                  onClick={() => deleteSource.mutate(link.id)}
                  className="rounded-md bg-red-50 px-3 py-1 text-red-600 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            ))}
            {!data?.length && <p className="text-sm text-slate-500">No links added yet.</p>}
          </div>
        </div>
      )}
    </section>
  );
}
