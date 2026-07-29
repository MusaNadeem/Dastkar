// Hand-verified placeholder photography. loremflickr's live keyword matching is
// unreliable enough that many checked candidates were flatly wrong for our themes
// (a mosque interior for "calligraphy", a boxing ring for "jewelry ring", a laptop
// for "gemstone", wedding dolls for "quran") — so every tag+lock pair below was
// downloaded and visually verified before being added. Nothing here is generated
// from an unchecked hash anymore.
// Categories with no good real-photo match found after extensive searching
// (calligraphy, painting/fine art) fall back to the general craft/handicraft set
// rather than ship a wrong image.
// NOTE: the original "pottery"/"ceramic" tag combos (lock 101, 108) broke on
// loremflickr's end after initially verifying good — the whole tag index started
// 500ing, not just those locks. Swapped to "stoneware". This is a live illustration
// of why hotlinked third-party placeholder images are not launch-safe; see
// docs/MARKET_READINESS.md item 9.
const POOLS = {
  // "stoneware" only has ~2 genuinely distinct photos in loremflickr's pool — further
  // locks started repeating these same two, so this category is capped at 2.
  pottery: [
    { tag: 'stoneware', lock: 2004 },
    { tag: 'stoneware', lock: 2005 },
  ],
  jewelry: [
    { tag: 'jewelry', lock: 102 },
    { tag: 'jewelry', lock: 4001 },
    { tag: 'jewelry', lock: 4003 },
  ],
  resin: [
    { tag: 'resin', lock: 104 },
    { tag: 'resin', lock: 5004 },
  ],
  weaving: [
    { tag: 'weaving', lock: 105 },
    { tag: 'weaving', lock: 5002 },
  ],
  handicraft: [
    { tag: 'handicraft', lock: 107 },
    { tag: 'craftsman,hands', lock: 405 },
    { tag: 'handicraft', lock: 6001 },
    { tag: 'handicraft', lock: 6002 },
    { tag: 'craftsman,hands', lock: 6003 },
  ],
  portrait: [{ tag: 'craftsman,hands', lock: 405 }],
};
// No verified match found for these — reuse the general craft set (see note above).
POOLS.calligraphy = POOLS.handicraft;
POOLS.painting = POOLS.handicraft;

// Word-bounded on short fragments (\bmug\b, \bart\b, \bring\b) so a substring inside
// an unrelated word doesn't misfire — e.g. "Mughal" contains "mug" but isn't a mug.
// Painting/calligraphy checked before pottery/jewelry for the same reason.
const MAP = [
  [/calligraph/, 'calligraphy'],
  [/miniature|paint|fineart|\bart\b|mughal|abstract|indus/, 'painting'],
  [/ceramic|pottery|vase|\bmug\b|clay|glaze|bowl/, 'pottery'],
  [/jewel|\bring\b|earring|filigree|meenakari|neck|bangle|choker|kundan/, 'jewelry'],
  [/resin|coaster/, 'resin'],
  [/textile|woven|weav|hanging|thread|crochet|cushion|blanket|ajrak/, 'weaving'],
  [/buyer|portrait|person|shop-banner|login|hero/, 'portrait'],
  [/maker|seller|studio|workshop|artisan|commission/, 'handicraft'],
];

function category(seed) {
  const s = String(seed).toLowerCase();
  const hit = MAP.find(([re]) => re.test(s));
  return hit ? hit[1] : 'handicraft';
}

// Deterministic index into a category's verified pool, so the same seed always
// resolves to the same (already-checked) photo.
function pick(seed, pool) {
  let n = 0;
  const s = String(seed);
  for (let i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) % pool.length;
  return pool[n];
}

export const img = (seed, w = 800, h = 800) => {
  const pool = POOLS[category(seed)] || POOLS.handicraft;
  const { tag, lock } = pick(seed, pool);
  return `https://loremflickr.com/${w}/${h}/${tag}?lock=${lock}`;
};
