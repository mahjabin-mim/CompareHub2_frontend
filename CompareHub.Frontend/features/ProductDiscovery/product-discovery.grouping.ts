import type { StoreProductResult } from './product-discovery.types';

export type ProductGroup = {
  key: string;
  name: string;
  // Every store's image for the product, cheapest store first, so a blocked image can fall back.
  imageUrls: string[];
  // Cheapest first.
  offers: StoreProductResult[];
  lowestPrice: number;
  highestPrice: number;
  storeCount: number;
};

type Signature = {
  core: string;
  words: string[];
  trigrams: Set<string>;
  measures: string[];
  numbers: string[];
  variants: string[];
};

// Same-product names in different stores differ in spacing, punctuation and filler words
// ("Nine Less B-Boost ... Face Serum- 30ml" vs "NINELESS B Boost ... Serum (30ML)").
const SIMILARITY_THRESHOLD = 0.72;
const CONTAINED_SIMILARITY_THRESHOLD = 0.55;
const CONTAINMENT_THRESHOLD = 0.9;
// The same product rarely costs more than ~2x between stores; a bigger gap is usually a
// sachet, tester or bundle whose name doesn't say so.
const MAX_PRICE_RATIO = 2.5;
// Stricter when a listing doesn't state its size but the group does: some stores drop the
// size from smaller packs (iUNIK sunscreen at ৳600 next to the 60ml at ৳1,350).
const MAX_PRICE_RATIO_WITHOUT_SIZE = 1.6;
// Breaks ties between equally similar groups (e.g. a size-less listing that fits both the
// 10ml and the 30ml group) in favour of the group with the closer price.
const PRICE_DISTANCE_WEIGHT = 0.1;

const UNIT_ALIASES: Record<string, string> = {
  ml: 'ml', g: 'g', gm: 'g', gms: 'g', gram: 'g', grams: 'g', kg: 'kg', l: 'l', ltr: 'l', litre: 'l', liter: 'l',
  oz: 'oz', pc: 'pcs', pcs: 'pcs', piece: 'pcs', pieces: 'pcs', sheet: 'sheets', sheets: 'sheets', pad: 'pads', pads: 'pads',
  tablet: 'tabs', tablets: 'tabs', tab: 'tabs', tabs: 'tabs', capsule: 'caps', capsules: 'caps', cap: 'caps', caps: 'caps'
};
const MEASURE_PATTERN = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(${Object.keys(UNIT_ALIASES).join('|')})(?![a-z])`, 'g');
const PERCENT_PATTERN = /(\d+(?:\.\d+)?)\s*%/g;
const SPF_PATTERN = /spf\s*(\d+)\+?/g;
// Words that mean a different listing of the same-sounding product, including condition
// deals ("(NO OUTERBOX)", "(Exp: Mar/27)") that shouldn't pose as the normal price.
const VARIANT_WORDS = [
  'sachet', 'mini', 'travel', 'trial', 'tester', 'sample', 'combo', 'refill', 'bundle', 'set', 'kit',
  'outerbox', 'unboxed', 'damaged', 'defect', 'exp', 'expiry'
];
// Descriptors that make a different product even when the rest of the name matches
// ("Birch Juice Moisturizing Sunscreen" vs "... Tone-Up Sunscreen"); checked on the joined name.
const STRONG_VARIANTS = ['toneup', 'tinted', 'spray', 'stick', 'cushion', 'body', 'kids', 'baby', 'men', 'mildup'];
// When both names say what kind of product it is, the kinds must agree.
const PRODUCT_TYPES = [
  'gel', 'cream', 'lotion', 'essence', 'serum', 'toner', 'cleanser', 'foam', 'oil', 'balm', 'mask', 'mist', 'ampoule',
  'emulsion', 'powder', 'pad', 'pads', 'soap', 'scrub', 'shampoo'
];
const FILLER_WORDS = new Set([
  'the', 'a', 'an', 'and', 'with', 'for', 'of', 'in', 'face', 'facial', 'skin', 'all', 'types', 'type', 'clear', 'glowing',
  'original', 'authentic', 'genuine', 'imported', 'new', 'korean', 'best', 'pa', 'broad', 'spectrum', 'version'
]);

const formatNumber = (value: string) => String(parseFloat(value));

// Results are regrouped every time a store answers, so the same names are parsed again and again.
const signatureCache = new Map<string, Signature>();
const MAX_CACHED_SIGNATURES = 3000;

const getSignature = (productName: string) => {
  let signature = signatureCache.get(productName);
  if (!signature) {
    if (signatureCache.size >= MAX_CACHED_SIGNATURES) {
      signatureCache.clear();
    }
    signature = buildSignature(productName);
    signatureCache.set(productName, signature);
  }
  return signature;
};

export const buildSignature = (productName: string): Signature => {
  // "Oil-free"/"oil control" describe the product; they shouldn't read as the product type "oil".
  let text = productName
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/oil[\s-]*(free|control)/g, 'oil$1');

  const measures: string[] = [];
  text = text.replace(MEASURE_PATTERN, (_, amount: string, unit: string) => {
    measures.push(`${formatNumber(amount)}${UNIT_ALIASES[unit]}`);
    return ' ';
  });
  const numbers: string[] = [];
  text = text.replace(PERCENT_PATTERN, (_, amount: string) => {
    numbers.push(`${formatNumber(amount)}%`);
    return ' ';
  });
  text = text.replace(SPF_PATTERN, (_, amount: string) => {
    numbers.push(`spf${amount}`);
    return ' ';
  });

  const words = text.split(/[^a-z0-9]+/).filter(Boolean);
  for (const word of words) {
    if (/^\d+(\.\d+)?$/.test(word)) {
      numbers.push(formatNumber(word));
    }
  }

  const variants = VARIANT_WORDS.filter((variant) => words.includes(variant));
  const coreWords = words.filter(
    (word) => !/^\d/.test(word) && !FILLER_WORDS.has(word) && !VARIANT_WORDS.includes(word)
  );
  // Joined without spaces so "Nine Less" and "NINELESS" compare equal.
  const core = coreWords.join('');

  return {
    core,
    words: unique(coreWords),
    trigrams: toTrigrams(core),
    measures: unique(measures),
    numbers: unique(numbers),
    variants
  };
};

const unique = (values: string[]) => [...new Set(values)].sort();

const toTrigrams = (value: string) => {
  const trigrams = new Set<string>();
  for (let index = 0; index + 3 <= value.length; index++) {
    trigrams.add(value.slice(index, index + 3));
  }
  return trigrams;
};

const sameWhenBothKnown = (a: string[], b: string[]) =>
  a.length === 0 || b.length === 0 || (a.length === b.length && a.every((value, index) => value === b[index]));

const withinOneEdit = (a: string, b: string) => {
  if (Math.abs(a.length - b.length) > 1) {
    return false;
  }

  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) {
      return false;
    }
    if (a.length > b.length) {
      i++;
    } else if (b.length > a.length) {
      j++;
    } else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
};

// A word counts as present if the other name contains it, even glued to a neighbour
// ("nine" in "nineless"), or has it with a one-letter spelling difference (moisturising/izing).
const hasWord = (word: string, other: Signature) =>
  other.core.includes(word) ||
  (word.length >= 5 && other.words.some((candidate) => candidate.length >= 5 && withinOneEdit(word, candidate)));

// Extra words on one side are usually description ("... with Multi-Vitamins"); words that
// only each side has are usually a different variant ("Aqua Gel" vs "Oil-Free Matte Gel").
export const hasConflictingWords = (a: Signature, b: Signature) => {
  if (STRONG_VARIANTS.some((variant) => a.core.includes(variant) !== b.core.includes(variant))) {
    return true;
  }

  const typesA = PRODUCT_TYPES.filter((type) => a.words.includes(type));
  const typesB = PRODUCT_TYPES.filter((type) => b.words.includes(type));
  if (typesA.length > 0 && typesB.length > 0 && typesA.join() !== typesB.join()) {
    return true;
  }

  return a.words.some((word) => !hasWord(word, b)) && b.words.some((word) => !hasWord(word, a));
};

export const nameSimilarity = (a: Signature, b: Signature) => {
  if (a.trigrams.size === 0 || b.trigrams.size === 0) {
    return a.core === b.core ? 1 : 0;
  }

  let shared = 0;
  a.trigrams.forEach((trigram) => {
    if (b.trigrams.has(trigram)) {
      shared++;
    }
  });
  const dice = (2 * shared) / (a.trigrams.size + b.trigrams.size);
  // One store often adds words ("... for Clear Glowing Skin"); accept that when the shorter
  // name is almost entirely contained in the longer one and the names are still close.
  const containment = shared / Math.min(a.trigrams.size, b.trigrams.size);
  return containment >= CONTAINMENT_THRESHOLD && dice >= CONTAINED_SIMILARITY_THRESHOLD ? Math.max(dice, containment * 0.9) : dice;
};

type WorkingGroup = {
  signature: Signature;
  // Sizes and numbers learned from any member, so a size-less seed can't collect both 30ml and 60ml.
  measures: string[];
  numbers: string[];
  offers: StoreProductResult[];
  // Kept sorted for the median.
  prices: number[];
};

const medianPrice = (group: WorkingGroup) => group.prices[Math.floor(group.prices.length / 2)];

const insertSorted = (values: number[], value: number) => {
  const index = values.findIndex((existing) => existing > value);
  values.splice(index === -1 ? values.length : index, 0, value);
};

export const groupProducts = (products: StoreProductResult[]): ProductGroup[] => {
  // Fixed order so groups don't reshuffle as more stores stream in; listings that state a size
  // go first so size-less ones join a group whose size is already known.
  const signatures = new Map(products.map((product) => [product, getSignature(product.productName)]));
  const ordered = [...products].sort(
    (a, b) =>
      Number(signatures.get(b)!.measures.length > 0) - Number(signatures.get(a)!.measures.length > 0) ||
      a.productName.localeCompare(b.productName) ||
      a.storeKey.localeCompare(b.storeKey) ||
      a.price - b.price
  );
  const groups: WorkingGroup[] = [];
  const seenUrls = new Set<string>();

  for (const product of ordered) {
    if (seenUrls.has(product.productUrl)) {
      continue;
    }
    seenUrls.add(product.productUrl);

    const signature = signatures.get(product)!;
    let best: WorkingGroup | null = null;
    let bestScore = -Infinity;
    for (const group of groups) {
      // Cheapest checks first; the word comparison only runs for names that are already close.
      const groupPrice = medianPrice(group);
      const priceRatio = Math.max(product.price, groupPrice) / Math.min(product.price, groupPrice);
      const maxPriceRatio =
        signature.measures.length === 0 && group.measures.length > 0 ? MAX_PRICE_RATIO_WITHOUT_SIZE : MAX_PRICE_RATIO;
      if (
        priceRatio > maxPriceRatio ||
        !sameWhenBothKnown(signature.measures, group.measures) ||
        !sameWhenBothKnown(signature.numbers, group.numbers) ||
        signature.variants.join() !== group.signature.variants.join()
      ) {
        continue;
      }

      const similarity = nameSimilarity(signature, group.signature);
      if (similarity < SIMILARITY_THRESHOLD || hasConflictingWords(signature, group.signature)) {
        continue;
      }

      const score = similarity - PRICE_DISTANCE_WEIGHT * Math.abs(Math.log(priceRatio));
      if (score > bestScore) {
        best = group;
        bestScore = score;
      }
    }

    if (best) {
      best.offers.push(product);
      insertSorted(best.prices, product.price);
      best.measures = best.measures.length > 0 ? best.measures : signature.measures;
      best.numbers = best.numbers.length > 0 ? best.numbers : signature.numbers;
    } else {
      groups.push({ signature, measures: signature.measures, numbers: signature.numbers, offers: [product], prices: [product.price] });
    }
  }

  return groups.map(toProductGroup);
};

const toProductGroup = ({ signature, measures, numbers, offers }: WorkingGroup): ProductGroup => {
  // Some stores list the same product twice under different URLs; show it once.
  const seen = new Set<string>();
  const sorted = [...offers]
    .sort((a, b) => a.price - b.price || a.storeKey.localeCompare(b.storeKey))
    .filter((offer) => {
      const key = `${offer.storeKey}|${offer.price}|${getSignature(offer.productName).core}`;
      return seen.has(key) ? false : (seen.add(key), true);
    });
  // The shortest name is usually the cleanest; prefer one that states the size when any does.
  const withSize = sorted.filter((offer) => getSignature(offer.productName).measures.length > 0);
  const name = [...(withSize.length > 0 ? withSize : sorted)].sort((a, b) => a.productName.length - b.productName.length)[0]
    .productName;

  return {
    key: [signature.core, ...numbers, ...measures, ...signature.variants].join('|'),
    name,
    imageUrls: [...new Set(sorted.map((offer) => offer.imageUrl).filter(Boolean))],
    offers: sorted,
    lowestPrice: sorted[0].price,
    highestPrice: sorted[sorted.length - 1].price,
    storeCount: new Set(sorted.map((offer) => offer.storeKey)).size
  };
};
