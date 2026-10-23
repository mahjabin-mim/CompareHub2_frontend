'use client';

import { SeriesPoint } from '../product-discovery.wishlist';

const WIDTH = 300;
const HEIGHT = 84;
const PADDING_X = 8;
const PADDING_Y = 14;

const formatPrice = (price: number) => `৳${price.toLocaleString()}`;
const formatDate = (time: number) => new Date(time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

// The lowest price over time as a step line: price changes happen on one day and hold until the next.
export function PriceHistoryChart({ series, now = Date.now() }: { series: SeriesPoint[]; now?: number }) {
  if (series.length < 2) {
    return (
      <p className="rounded-lg bg-brand-50/70 px-3 py-2 text-xs text-[#3A2417]/70">
        Price history appears here after a store changes its price. We check a few times a day.
      </p>
    );
  }

  const prices = series.map((point) => point.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const start = series[0].time;
  const end = Math.max(now, series[series.length - 1].time);
  const x = (time: number) => PADDING_X + ((time - start) / Math.max(end - start, 1)) * (WIDTH - PADDING_X * 2);
  const y = (price: number) => (max === min ? HEIGHT / 2 : PADDING_Y + ((max - price) / (max - min)) * (HEIGHT - PADDING_Y * 2));

  const path = series
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${x(point.time).toFixed(1)},${y(series[index - 1]?.price ?? point.price).toFixed(1)} L${x(point.time).toFixed(1)},${y(point.price).toFixed(1)}`)
    .concat(`L${x(end).toFixed(1)},${y(series[series.length - 1].price).toFixed(1)}`)
    .join(' ');
  const latest = series[series.length - 1];
  const first = series[0];
  const label = `Lowest price over time: ${formatPrice(first.price)} on ${formatDate(first.time)}, now ${formatPrice(latest.price)}. Range ${formatPrice(min)} to ${formatPrice(max)}.`;

  return (
    <figure className="rounded-lg bg-brand-50/70 p-3">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-20 w-full" role="img" aria-label={label}>
        <path d={path} fill="none" stroke="#C1592E" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(latest.time)} cy={y(latest.price)} r="4" fill="#C1592E" />
      </svg>
      <figcaption className="mt-1 flex items-center justify-between text-[11px] text-[#3A2417]/70">
        <span>
          {formatDate(first.time)} · {formatPrice(first.price)}
        </span>
        <span>
          low {formatPrice(min)} · high {formatPrice(max)}
        </span>
      </figcaption>
    </figure>
  );
}
