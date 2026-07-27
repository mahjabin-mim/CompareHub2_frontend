'use client';

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
    <main className="mx-auto max-w-6xl space-y-5 px-4 py-8">
      <header className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Product Sources</h1>
            <p className="mt-1 text-slate-600">Total links added: {totalLinks}</p>
          </div>
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-700"
          >
            {showAddForm ? 'Close' : 'Add Source'}
          </button>
        </div>
      </header>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="grid gap-3 rounded-xl bg-white p-4 shadow-sm md:grid-cols-3">
          <input
            value={form.sourceName}
            onChange={(e) => setForm({ ...form, sourceName: e.target.value })}
            placeholder="Source name"
            className="rounded-lg border border-slate-300 px-4 py-2"
            required
          />
          <input
            value={form.baseUrl}
            onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
            placeholder="Website URL (https://example.com)"
            className="rounded-lg border border-slate-300 px-4 py-2 md:col-span-2"
            required
          />
          <div className="md:col-span-3">
            <button className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-700" disabled={createSource.isPending}>
              {createSource.isPending ? 'Adding...' : 'Add Link'}
            </button>
          </div>
        </form>
      )}

      <section className="rounded-xl bg-white p-4 shadow-sm">
        {isLoading ? (
          <div className="h-20 animate-pulse rounded-lg bg-slate-200" />
        ) : (
          <div className="space-y-2">
            {data?.map((source) => (
              <div key={source.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div>
                  <p className="font-medium">{source.sourceName}</p>
                  <p className="text-sm text-slate-500">{source.baseUrl}</p>
                </div>
                <button onClick={() => deleteSource.mutate(source.id)} className="rounded-md bg-red-50 px-3 py-1 text-red-600">
                  Delete
                </button>
              </div>
            ))}
            {!data?.length && <p className="text-sm text-slate-500">No links added yet.</p>}
          </div>
        )}
      </section>
    </main>
  );
}
