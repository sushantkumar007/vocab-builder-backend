export const translateWordFromEnglish = async ({
  word = "rose",
  targetLanguage = LANGUAGE.HINDI,
}) => {
  try {
    const translateApiUrl = process.env.TRANSLATE_API_URL;

    const res = await fetch(translateApiUrl, {
      method: "POST",
      body: JSON.stringify({
        q: word,
        source: LANGUAGE.ENGLISH,
        target: targetLanguage,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!data?.translatedText) {
      throw new Error("Translation API response did not include translatedText");
    }

    return data.translatedText;
  } catch (error) {
    throw new Error(`Error translating word: ${error.message}`, { cause: error });
  }
};

export const LANGUAGE = Object.freeze({
  ALBANIAN: "sq",
  ARABIC: "ar",
  AZERBAIJANI: "az",
  BASQUE: "eu",
  BENGALI: "bn",
  BULGARIAN: "bg",
  CATALAN: "ca",
  CHINESE: "zh",
  CHINESE_TRADITIONAL: "zt",
  CZECH: "cs",
  DANISH: "da",
  DUTCH: "nl",
  ENGLISH: "en",
  ESPERANTO: "eo",
  ESTONIAN: "et",
  FINNISH: "fi",
  FRENCH: "fr",
  GALICIAN: "gl",
  GERMAN: "de",
  GREEK: "el",
  HEBREW: "he",
  HINDI: "hi",
  HUNGARIAN: "hu",
  INDONESIAN: "id",
  IRISH: "ga",
  ITALIAN: "it",
  JAPANESE: "ja",
  KOREAN: "ko",
  KYRGYZ: "ky",
  LATVIAN: "lv",
  LITHUANIAN: "lt",
  MALAY: "ms",
  NORWEGIAN: "nb",
  PERSIAN: "fa",
  POLISH: "pl",
  PORTUGUESE: "pt",
  PORTUGUESE_BRAZIL: "pb",
  ROMANIAN: "ro",
  RUSSIAN: "ru",
  SLOVAK: "sk",
  SLOVENIAN: "sl",
  SPANISH: "es",
  SWEDISH: "sv",
  TAGALOG: "tl",
  THAI: "th",
  TURKISH: "tr",
  UKRAINIAN: "uk",
  URDU: "ur",
  VIETNAMESE: "vi",
});
