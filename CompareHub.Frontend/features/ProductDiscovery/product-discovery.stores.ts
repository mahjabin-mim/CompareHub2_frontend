// Friendly names for the stores the public search covers; unknown stores show their domain.
const STORE_NAMES: Record<string, string> = {
  'kireibd.com': 'Kirei',
  'koreanmartbd.com': 'Korean Mart',
  'shop.shajgoj.com': 'Shajgoj',
  'groomlybd.com': 'Groomly',
  'skincareshop.com.bd': 'Skincare Shop',
  'beautybooth.com.bd': 'Beauty Booth',
  'emartwayskincare.com.bd': 'Emartway',
  'tekka.com.bd': 'Tekka',
  'dhalishop.com': 'Dhali Shop',
  'thealamsbd.com': 'The Alams',
  'thelilium.shop': 'The Lilium',
  'klassy.com.bd': 'Klassy',
  'pixielabellabangladesh.com': 'Pixie Labella',
  'skinnora.com': 'Skinnora',
  'makeupchari.com': 'Makeup Chari',
  'perfectobd.com': 'Perfecto',
  'arogga.com': 'Arogga'
};

export const storeDisplayName = (storeKey: string) => STORE_NAMES[storeKey] ?? storeKey;
