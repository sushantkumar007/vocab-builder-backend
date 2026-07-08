import { prisma } from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRespones.js";
import { getWordData } from "../services/dictionary.service.js";
import { translateWordFromEnglish, LANGUAGE } from "../services/translate.service.js";

export const addWord = asyncHandler(async (req, res) => {
  const { word, audio, partOfSpeech, definition, examples, synonyms, antonyms, translations } =
    req.body;

  const newWord = await prisma.word.create({
    data: {
      word,
      audio,
      partOfSpeech,
      definition,
      examples,
      synonyms,
      antonyms,
      translations,
    },
  });

  if (!newWord) {
    throw new ApiError(500, "Failed to add word");
  }

  res.status(201).json(new ApiResponse(201, "Word added successfully", { word: newWord }));
});

export const getWords = asyncHandler(async (req, res) => {
  const { word } = req.params;

  let words = await prisma.word.findMany({
    where: {
      word: { equals: word, mode: "insensitive" },
    },
  });

  if (!words || words.length === 0) {
    const wordData = await getWordData(word);

    if (!wordData) {
      throw new ApiError(404, `Word "${word}" not found`);
    }

    const translatedWord = await translateWordFromEnglish({
      word,
      targetLanguage: LANGUAGE.HINDI,
    });

    const newWord = await prisma.word.create({
      data: {
        ...wordData,
        translations: { [LANGUAGE.HINDI]: translatedWord },
      },
    });

    words = [newWord];
  }

  res.status(200).json(new ApiResponse(200, "Word data fetched successfully", { words }));
});

export const updateWord = asyncHandler(async (req, res) => {
  const { wordId } = req.params;
  const { word, audio, partOfSpeech, definition, examples, synonyms, antonyms, translations } =
    req.body;

  const wordToUpdate = await prisma.word.findUnique({
    where: { id: wordId },
  });

  if (!wordToUpdate) {
    throw new ApiError(404, "Word not found");
  }

  const updatedWord = await prisma.word.update({
    where: { id: wordId },
    data: {
      word,
      audio,
      partOfSpeech,
      definition,
      examples,
      synonyms,
      antonyms,
      translations,
    },
  });

  if (!updatedWord) {
    throw new ApiError(500, "Failed to update word");
  }

  res.status(200).json(new ApiResponse(200, "Word updated successfully", { word: updatedWord }));
});

export const deleteWord = asyncHandler(async (req, res) => {
  const { wordId } = req.params;

  const wordToDelete = await prisma.word.findUnique({
    where: { id: wordId },
  });

  if (!wordToDelete) {
    throw new ApiError(404, "Word not found");
  }

  const deletedWord = await prisma.word.delete({
    where: { id: wordId },
  });

  if (!deletedWord) {
    throw new ApiError(500, "Failed to delete word");
  }

  res.status(200).json(new ApiResponse(200, "Word deleted successfully", { word: deletedWord }));
});
