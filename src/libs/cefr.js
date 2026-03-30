/* global chrome */
let cefrDict = null;
let dictPromise = null;

export const CEFR_LEVEL_SCORES = {
  UNKNOWN: 0,
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6
};

/**
 * Lazy loads the CEFR dictionary from the extension assets.
 */
export async function getCEFRDict() {
  if (cefrDict) return cefrDict;
  if (dictPromise) return dictPromise;

  dictPromise = (async () => {
    try {
      const url = chrome.runtime.getURL('assets/cefr_dict.json');
      const response = await fetch(url);
      const json = await response.json();
      cefrDict = new Map(Object.entries(json));
      return cefrDict;
    } catch (e) {
      console.error('Failed to load CEFR dictionary:', e);
      cefrDict = new Map();
      return cefrDict;
    } finally {
      dictPromise = null;
    }
  })();

  return dictPromise;
}

/**
 * Gets the CEFR level info for a specific word.
 * @param {string} word - The English word to lookup.
 */
export async function getWordLevelInfo(word) {
  const dict = await getCEFRDict();
  const normalized = word.toLowerCase().trim();
  const entry = dict.get(normalized);
  if (!entry) return null;
  
  return {
    word: normalized,
    level: entry.level,
    levelScore: CEFR_LEVEL_SCORES[entry.level] || 0,
    zh: entry.zh
  };
}

/**
 * Tokenizes English text, looks up words, and wraps difficult words in <ruby> tags.
 */
export async function annotateCEFRText(text, userLevelScore) {
  const dict = await getCEFRDict();
  if (!dict || dict.size === 0) return text;

  const wordRegex = /\b[a-zA-Z]+\b/g;
  
  return text.replace(wordRegex, (match) => {
    const normalized = match.toLowerCase();
    const entry = dict.get(normalized);
    if (entry) {
      const wordScore = CEFR_LEVEL_SCORES[entry.level] || 0;
      if (wordScore >= userLevelScore) {
        return `<ruby>${match}<rt style="color: #999; font-size: 0.7em; font-weight: normal; font-family: sans-serif;">${entry.zh}</rt></ruby>`;
      }
    }
    return match;
  });
}

export function isEnglishLang(lang = '') {
  return typeof lang === 'string' && lang.toLowerCase().startsWith('en');
}

/**
 * Applies CEFR annotation as a post-translation enhancement.
 * Never replaces translation output with the source text.
 */
export async function maybeAnnotateTranslatedText({
  translatedText,
  targetLang = '',
  cefrSetting,
  annotate = annotateCEFRText
}) {
  if (!translatedText) return translatedText;
  if (!cefrSetting?.enabled) return translatedText;
  if (!isEnglishLang(targetLang)) return translatedText;

  const levelScore = Number(cefrSetting.level);
  if (!Number.isFinite(levelScore)) return translatedText;

  return annotate(translatedText, levelScore);
}
