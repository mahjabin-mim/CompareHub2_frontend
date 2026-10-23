import type { ProductGroup } from './product-discovery.grouping';

// Store data has no brand field, but names start with the brand. Spellings are normalised first
// (lowercase, no punctuation, "&" as "and"), so "Dot & Key", "DOT AND KEY" and "Dot&Key" all match.
const BRANDS: Record<string, string[]> = {
  'Acrest': ['acrest'],
  'Advanced Clinicals': ['advanced clinicals'],
  'Aestura': ['aestura'],
  'Anua': ['anua'],
  'APLB': ['aplb'],
  'April Skin': ['aprilskin', 'april skin'],
  'Arencia': ['arencia'],
  'Aveeno': ['aveeno'],
  'Axis-Y': ['axis y', 'axisy'],
  'B.LAB': ['b lab'],
  'Beauty Formulas': ['beauty formulas'],
  'Beauty of Joseon': ['beauty of joseon'],
  'Beplain': ['beplain'],
  'Benton': ['benton'],
  'Bioderma': ['bioderma'],
  'Bioaqua': ['bioaqua'],
  'Biodance': ['biodance'],
  'Biore': ['biore'],
  'Boots': ['boots'],
  'Caplino': ['caplino'],
  'Care:Nel': ['care nel', 'carenel'],
  'CellQ': ['cellq'],
  'Celimax': ['celimax'],
  'CeraVe': ['cerave', 'cera ve'],
  'Cetaphil': ['cetaphil'],
  'Chemist at Play': ['chemist at play'],
  'Commonlabs': ['commonlabs'],
  'Cos De Baha': ['cos de baha'],
  'Cosmo': ['cosmo'],
  'COSRX': ['cosrx'],
  'Coxir': ['coxir'],
  'Dabo': ['dabo'],
  'Deconstruct': ['deconstruct'],
  'Dermatouch': ['dermatouch'],
  'Dot & Key': ['dot and key', 'dotandkey'],
  'Daiso': ['daiso'],
  'Dove': ['dove'],
  'Dr. Althea': ['dr althea'],
  'Dr Rashel': ['dr rashel'],
  "Dr. Sheth's": ['dr sheth s', 'dr sheths'],
  'Estée Lauder': ['estee lauder'],
  'Etude': ['etude'],
  'Fixderma': ['fixderma'],
  'Fully': ['fully'],
  'Eqqualberry': ['eqqualberry'],
  'Garnier': ['garnier'],
  'Haruharu': ['haruharu'],
  'Heimish': ['heimish'],
  'Innisfree': ['innisfree'],
  'Innsaei': ['innsaei'],
  "I'm From": ['i m from', 'im from'],
  'Isntree': ['isntree'],
  'iUNIK': ['iunik'],
  'Jumiso': ['jumiso'],
  'K-Secret': ['k secret', 'ksecret'],
  'Kaine': ['kaine'],
  'Kodomo': ['kodomo'],
  'La Roche-Posay': ['la roche posay', 'laroche posay'],
  'Laikou': ['laikou'],
  'Lakme': ['lakme'],
  'Laxzin': ['laxzin'],
  'Liana': ['liana'],
  'Lilac': ['lilac'],
  'Maange': ['maange'],
  'Mamaearth': ['mamaearth'],
  'Medicube': ['medicube'],
  'Melao': ['melao'],
  'Melano CC': ['melano'],
  'Minimalist': ['minimalist'],
  'Neogen': ['neogen'],
  'Neutrogena': ['neutrogena'],
  'Nivea': ['nivea'],
  'Nineless': ['nineless', 'nine less'],
  'Numbuzin': ['numbuzin'],
  'OMI Brotherhood': ['omi brotherhood', 'omi'],
  'Organikaon': ['organikaon'],
  'Paxmoly': ['paxmoly'],
  'Pilgrim': ['pilgrim'],
  'Plum': ['plum'],
  'Precious Skin': ['precious skin'],
  'Purito': ['purito'],
  'Rohto': ['rohto'],
  'Round Lab': ['round lab', 'roundlab'],
  'Senka': ['senka'],
  'Seravix': ['seravix'],
  'Simple': ['simple'],
  'Skin1004': ['skin1004'],
  "Skin'O": ['skin o', 'skino'],
  'SkinPro': ['skinpro'],
  'Some By Mi': ['some by mi'],
  'The Celeste': ['the celeste'],
  'The Derma Co': ['the derma co'],
  'The Dermalix': ['the dermalix'],
  'The Face Shop': ['the face shop'],
  'The Ordinary': ['the ordinary'],
  'Tiam': ['tiam'],
  'VRH': ['vrh'],
  'WishCare': ['wishcare', 'wish care']
};

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’']/g, ' ')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

// Longest spelling first, so "dr althea" is tried before a shorter prefix.
const PREFIXES = Object.entries(BRANDS)
  .flatMap(([brand, spellings]) => spellings.map((spelling) => ({ brand, prefix: spelling })))
  .sort((a, b) => b.prefix.length - a.prefix.length);

export const getBrand = (productName: string): string | null => {
  // Listings sometimes start with a note like "(NO OUTERBOX)" or "Combo 03 -".
  const text = normalize(productName.replace(/^\s*\([^)]*\)\s*/, ''));
  const match = PREFIXES.find(({ prefix }) => text === prefix || text.startsWith(`${prefix} `));
  return match?.brand ?? null;
};

export type BrandOption = { brand: string; count: number };

export const getBrandOptions = (groups: ProductGroup[]): BrandOption[] => {
  const counts = new Map<string, number>();
  for (const group of groups) {
    const brand = getBrand(group.name);
    if (brand) {
      counts.set(brand, (counts.get(brand) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([brand, count]) => ({ brand, count }))
    .sort((a, b) => b.count - a.count || a.brand.localeCompare(b.brand));
};

export const filterGroupsByBrand = (groups: ProductGroup[], brand: string | null) =>
  brand ? groups.filter((group) => getBrand(group.name) === brand) : groups;

export type PriceRange = { min: number | null; max: number | null };

export const parsePriceInput = (value: string): number | null => {
  const digits = value.replace(/[^0-9.]/g, '');
  const parsed = Number(digits);
  return digits === '' || !Number.isFinite(parsed) ? null : parsed;
};

// A product passes when at least one store sells it inside the range.
export const filterGroupsByPrice = (groups: ProductGroup[], { min, max }: PriceRange) =>
  min === null && max === null
    ? groups
    : groups.filter((group) =>
        group.offers.some((offer) => (min === null || offer.price >= min) && (max === null || offer.price <= max))
      );
