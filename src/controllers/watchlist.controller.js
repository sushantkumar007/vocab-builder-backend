import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRespones.js";
import { prisma } from "../db/index.js";

export const addWordToWatchlist = asyncHandler(async (req, res) => {
  const { id: userId } = req.user;
  const { wordId } = req.params;

  const existingWord = await prisma.watchlist.findFirst({
    where: {
      userId,
      wordId,
    },
  });

  if (existingWord) {
    throw new ApiError(400, "Word already exists in the watchlist");
  }

  const watchlistEntry = await prisma.watchlist.create({
    data: {
      userId,
      wordId,
    },
  });

  res.status(201).json(new ApiResponse(201, "Word added to watchlist", { watchlistEntry }));
});

export const getWatchlist = asyncHandler(async (req, res) => {
  const { id: userId } = req.user;

  const watchlist = await prisma.watchlist.findMany({
    where: {
      userId,
    },
    include: {
      word: true,
    },
  });

  if (!watchlist || watchlist.length === 0) {
    throw new ApiError(404, "No words found in the watchlist");
  }

  res.status(200).json(new ApiResponse(200, "Watchlist retrieved successfully", { watchlist }));
});

export const removeWordFromWatchlist = asyncHandler(async (req, res) => {
  const { id: userId } = req.user;
  const { wordId } = req.params;

  const watchlistEntry = await prisma.watchlist.findFirst({
    where: {
      userId,
      wordId,
    },
  });

  if (!watchlistEntry) {
    throw new ApiError(404, "Word not found in the watchlist");
  }

  await prisma.watchlist.delete({
    where: {
      id: watchlistEntry.id,
    },
  });

  res.status(200).json(new ApiResponse(200, "Word removed from watchlist"));
});
