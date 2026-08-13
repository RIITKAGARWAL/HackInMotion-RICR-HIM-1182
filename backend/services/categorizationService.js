// ============================================================
// Smart Categorization Engine
// Combines (1) exact rule-based keyword matching with
// (2) fuzzy string similarity (Levenshtein + bigram Dice) for
// automatic merchant classification during CSV imports.
// ============================================================

// Keyword lexicon mapped to SpenSight schema category names.
const CATEGORY_KEYWORDS = {
  Food: [
    'starbucks', 'mcdonalds', 'doordash', 'ubereats', 'uber eats', 'subway', 'dominos',
    'restaurant', 'cafe', 'dunkin', 'kfc', 'chipotle', 'pizza', 'burger', 'taco',
    'sushi', 'biryani', 'grubhub', 'postmates', 'wendys', 'popeyes', 'panera',
    'bar', 'coffee', 'bakery', 'grocery', 'kroger', 'wholefoods', 'trader joe',
    'albertsons', 'safeway', 'tesco', 'lidl', 'aldi', 'wawa', '7-eleven', 'fresco'
  ],
  Subscriptions: [
    'netflix', 'spotify', 'hulu', 'apple.com', 'apple tv', 'disney', 'prime video',
    'youtube premium', 'youtube', 'hbo', 'paramount', 'peacock', 'audible', 'patreon',
    'onlyfans', 'dropbox', 'google one', 'icloud', 'adobe', 'canva', 'notion', 'figma'
  ],
  Bills: [
    'electric', 'water', 'gas company', 'verizon', 'at&t', 'comcast', 'utility',
    'power bill', 'internet', 'broadband', 'energy', 'waste', 'sewage', 'phone bill'
  ],
  Car: [
    'gas station', 'shell', 'chevron', 'exxon', 'bp', 'fuel', 'petrol', 'diesel',
    'auto repair', 'car wash', 'mechanic', 'parking', 'toll', 'lube', 'tire'
  ],
  Home: [
    'rent', 'mortgage', 'property', 'lease', 'landlord', 'maintenance', 'home depot',
    'lowe', 'ikea', 'furniture', 'plumbing', 'electrician', 'airbnb host'
  ],
  Entertainment: [
    'movie', 'cinema', 'theater', 'amc', 'bowling', 'arcade', 'concert', 'eventbrite',
    'steam', 'playstation', 'xbox', 'nintendo', 'twitch', 'disneyland', 'zoo'
  ],
  Health: [
    'pharmacy', 'cvs', 'walgreens', 'doctor', 'dentist', 'hospital', 'clinic',
    'medication', 'therapy', 'gym', 'fitness', 'labcorp', 'urgent care', 'vitamin'
  ],
  Education: [
    'school', 'university', 'college', 'tuition', 'coursera', 'udemy', 'udacity',
    'skillshare', 'masterclass', 'bookstore', 'amazon kindle', 'library'
  ],
  Clothing: [
    'zara', 'nike', 'adidas', 'h&m', 'gap', 'old navy', 'unqlo', 'forever21',
    'levi', 'under armour', 'puma', 'reebok', 'macy', 'nordstrom', 'shein'
  ],
  Electronics: [
    'apple store', 'best buy', 'amazon', 'ebay', 'newegg', 'b&h', 'microcenter',
    'samsung', 'sony', 'bose', 'jbl', 'kindle', 'iphone', 'laptop'
  ],
  Insurance: [
    'geico', 'progressive', 'state farm', 'allstate', 'liberty mutual', 'aetna',
    'cigna', 'unitedhealth', 'blue cross', 'insurance', 'life insurance'
  ],
  Social: [
    'bar', 'pub', 'party', 'birthday', 'wedding', 'gift', 'donation', 'charity',
    'event ticket', 'concert ticket', 'hangout', 'dinner'
  ],
  Sport: [
    'gym', 'fitness', 'peloton', 'nike training', 'yoga', 'tennis', 'golf',
    'swimming', 'basketball', 'soccer', 'baseball', 'ski'
  ],
  Tax: ['tax', 'irs', 'state tax', 'property tax', 'income tax', 'filing'],
  Telephone: ['verizon wireless', 'at&t mobile', 't-mobile', 'sprint', 'cell phone', 'mobile bill'],
  Transportation: [
    'uber', 'lyft', 'airbnb', 'delta', 'flight', 'hotel', 'marriott', 'hilton',
    'amtrak', 'greyhound', 'metro', 'subway card', 'bus', 'taxi', 'cab', 'train'
  ],
  Travel: [
    'airline', 'flight', 'airbnb', 'booking.com', 'expedia', 'kayak', 'hotel',
    'resort', 'cruise', 'visa', 'passport', 'rental car', 'hertz', 'avis', 'enterprise'
  ],
  Baby: ['diapers', 'pampers', 'huggies', 'baby', 'formula', 'gerber', 'crib', 'stroller', 'kids'],
  Beauty: [
    'sephora', 'ulta', 'salon', 'barber', 'loreal', 'maybelline', 'nails', 'spa',
    'cosmetics', 'perfume', 'cologne'
  ],
  Shopping: [
    'amazon', 'target', 'walmart', 'ebay', 'costco', 'sam\u2019s club', 'sams club',
    'etsy', 'shopify', 'ali express', 'wish', 'depop', 'poshmark', 'mall'
  ],
  Salary: ['payroll', 'direct deposit', 'wage', 'salary', 'paycheck', 'biweekly', 'paychex', 'adp'],
  Freelance: ['upwork', 'fiverr', 'freelance', 'gig', 'contract', 'invoice', 'square', 'stripe', 'paypal'],
  Rental: ['rental income', 'airbnb income', 'property income', 'tenant'],
  Refunds: ['refund', 'reversal', 'cashback', 'return', 'chargeback', 'rebate'],
  Awards: ['bonus', 'award', 'prize', 'incentive', 'commission'],
  Coupons: ['coupon', 'voucher', 'promo', 'discount code'],
  Grants: ['grant', 'scholarship', 'subsidy', 'stipend'],
  Lottery: ['lottery', 'jackpot', 'raffle', 'prize draw'],
  Sale: ['garage sale', 'ebay sale', 'resale', 'depop sale', 'secondhand'],
  Investment: ['dividend', 'interest', 'investment', 'etf', 'stock', 'mutual fund', 'crypto', 'bitcoin'],
  Uncategorized: []
};

// Normalize a description into a compact token list
function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter((w) => w.length > 1);
}

// Levenshtein edit distance
function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const m = a.length;
  const n = b.length;
  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

// Dice coefficient on character bigrams (0..1 similarity)
function diceCoefficient(a, b) {
  const getBigrams = (s) => {
    const map = new Map();
    for (let i = 0; i < s.length - 1; i++) {
      const bg = s.substr(i, 2);
      map.set(bg, (map.get(bg) || 0) + 1);
    }
    return map;
  };
  const bgA = getBigrams(a);
  const bgB = getBigrams(b);
  let overlap = 0;
  for (const [bg, count] of bgA) {
    if (bgB.has(bg)) overlap += Math.min(count, bgB.get(bg));
  }
  const total = [...bgA.values()].reduce((s, c) => s + c, 0) + [...bgB.values()].reduce((s, c) => s + c, 0);
  return total === 0 ? 0 : (2 * overlap) / total;
}

// Never let auto-generated / dummy categories (e.g. "EdgeCat161514")
// leak into classification results, regardless of inputs.
const DISALLOWED_CATEGORY_PATTERN = /^EdgeCat/i;

function safeCategoryName(name, fallback = 'Uncategorized') {
  const clean = String(name || '').trim();
  if (!clean || DISALLOWED_CATEGORY_PATTERN.test(clean)) return fallback;
  return clean;
}

// Return the best matching category for a transaction description
function classifyTransaction(description, options = {}) {
  const fallback = safeCategoryName(options.fallback, 'Uncategorized');
  const text = String(description || '').trim();
  if (!text) return { category: fallback, confidence: 0, method: 'fallback' };

  const words = tokenize(text);
  const fullLower = text.toLowerCase();

  let best = { category: fallback, score: 0, method: 'fallback' };

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'Uncategorized' || !keywords || keywords.length === 0) continue;

    let score = 0;

    // 1. Exact substring / phrase match (highest confidence)
    for (const kw of keywords) {
      if (fullLower.includes(kw)) {
        const isPhrase = kw.includes(' ');
        score += isPhrase ? 10 : 6;
      }
    }

    // 2. Token-level fuzzy matching (Levenshtein + Dice)
    for (const word of words) {
      let bestKwScore = 0;
      for (const kw of keywords) {
        const isPhrase = kw.includes(' ');
        if (isPhrase) continue;
        const exact = word === kw ? 8 : 0;
        if (exact) { bestKwScore = Math.max(bestKwScore, exact); continue; }
        const maxLen = Math.max(word.length, kw.length);
        const levSim = 1 - levenshtein(word, kw) / maxLen;
        const dice = diceCoefficient(word, kw);
        const combined = levSim * 0.6 + dice * 0.4;
        if (combined > 0.82) {
          bestKwScore = Math.max(bestKwScore, Math.round(combined * 6));
        }
      }
      score += bestKwScore;
    }

    if (score > best.score) {
      best = { category, score, method: score >= 8 ? 'rule' : 'fuzzy' };
    }
  }

  best.confidence = best.score > 0 ? Math.min(1, best.score / 8) : 0;
  if (best.score === 0) {
    best.category = fallback;
    best.method = 'fallback';
    best.confidence = 0;
  }

  // Defense in depth: result must be a known keyword category, never a
  // random / auto-generated name.
  if (!CATEGORY_KEYWORDS[best.category] || DISALLOWED_CATEGORY_PATTERN.test(best.category)) {
    best.category = fallback;
    best.method = 'fallback';
    best.confidence = 0;
  }
  return best;
}

module.exports = { classifyTransaction, safeCategoryName, CATEGORY_KEYWORDS };
