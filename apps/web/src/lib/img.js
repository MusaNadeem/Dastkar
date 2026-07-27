// Themed placeholder photography via loremflickr (keyword-matched real photos).
// The seed strings carry craft hints (e.g. "maker-sana-jewelry"), so we map them to a
// relevant keyword to get on-theme images. Deterministic per seed via ?lock.
const MAP = [
  [/calligraph/, 'calligraphy'],
  [/ceramic|pottery|vase|mug|clay|glaze/, 'pottery'],
  [/jewel|ring|earring|filigree|meenakari|neck/, 'jewelry'],
  [/resin|coaster/, 'resin'],
  [/textile|woven|weav|hanging|thread|crochet/, 'weaving'],
  [/miniature|paint|fineart|art\b/, 'painting'],
  [/buyer|portrait|person/, 'portrait'],
  [/maker|seller|studio|workshop|artisan|hero|commission/, 'handicraft'],
  [/craft|home|decor|custom/, 'handicraft'],
];

function keyword(seed) {
  const s = String(seed).toLowerCase();
  const hit = MAP.find(([re]) => re.test(s));
  return hit ? hit[1] : 'handicraft';
}

function lockOf(seed) {
  const s = String(seed);
  let n = 0;
  for (let i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) % 100000;
  return n;
}

export const img = (seed, w, h) =>
  `https://loremflickr.com/${w}/${h}/${keyword(seed)}?lock=${lockOf(seed)}`;
