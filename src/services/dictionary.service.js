import { env } from "../config/env.js";

export const getWordData = async (searchWord) => {
  try {
    const response = await fetch(`${env.DICTIONARY_API_URL}${encodeURIComponent(searchWord)}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Unable to find "${searchWord}". Please check the spelling and try again.`);
    }

    const data = await response.json();
    const [entry] = data;
    const meanings = entry?.meanings[0];
    const definitions = meanings?.definitions[0];

    return {
      word: entry?.word,
      audio: entry?.phonetics.find((p) => p.audio)?.audio ?? null,
      partOfSpeech: meanings?.partOfSpeech ?? null,
      synonyms: meanings?.synonyms ?? null,
      antonyms: meanings?.antonyms ?? null,
      definition: definitions?.definition ?? null,
      examples: definitions?.example ? [definitions?.example] : [],
    };
  } catch (error) {
    throw new Error(`Error fetching word data: ${error.message}`, { cause: error });
  }
};
