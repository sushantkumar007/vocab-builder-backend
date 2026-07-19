import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRespones.js";
import { prisma } from "../db/index.js";

export const saveWord = asyncHandler(async (req, res) => {
  const { id: userId } = req.user;
  const { wordId } = req.params;

  const isWordAlreadySaved = await prisma.savedWord.findFirst({
    where: {
      userId,
      wordId,
    },
  });

  if (isWordAlreadySaved) {
    throw new ApiError(400, "Word already saved");
  }

  const savedWord = await prisma.savedWord.create({
    data: {
      userId,
      wordId,
    },
  });

  res.status(201).json(new ApiResponse(201, "Word saved successfully", { savedWord }));
});

export const getSavedWords = asyncHandler(async (req, res) => {
  const { id: userId } = req.user;

  const savedWords = await prisma.savedWord.findMany({
    where: { userId },
    include: {
      word: true,
    },
  });

  if (!savedWords.length) {
    throw new ApiError(404, "No saved words found");
  }

  res.status(200).json(new ApiResponse(200, "Saved words retrieved successfully", { savedWords }));
});

export const deleteSavedWord = asyncHandler(async (req, res) => {
  const { id: userId } = req.user;
  const { wordId } = req.params;

  const savedWord = await prisma.savedWord.findFirst({
    where: {
      userId,
      wordId,
    },
  });

  if (!savedWord) {
    throw new ApiError(404, "Saved word not found");
  }

  await prisma.savedWord.delete({
    where: {
      id: savedWord.id,
    },
  });

  res.status(200).json(new ApiResponse(200, "Saved word deleted successfully"));
});
