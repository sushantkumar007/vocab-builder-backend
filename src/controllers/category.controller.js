import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRespones.js";
import { prisma } from "../db/index.js";

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const existingCategory = await prisma.category.findFirst({
    where: {
      name,
    },
  });

  if (existingCategory) {
    throw new ApiError(400, "Category already exists");
  }

  const category = await prisma.category.create({
    data: {
      name,
      description,
    },
  });

  res.status(201).json(new ApiResponse(201, "Category created successfully", { category }));
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany();

  if (!categories.length) {
    throw new ApiError(404, "No categories found");
  }

  res.status(200).json(new ApiResponse(200, "Categories retrieved successfully", { categories }));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
    },
  });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  await prisma.category.delete({
    where: {
      id: categoryId,
    },
  });

  res.status(200).json(new ApiResponse(200, "Category deleted successfully"));
});

export const addWordToCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { wordId } = req.body;

  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
    },
  });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  const word = await prisma.word.findFirst({
    where: {
      id: wordId,
    },
  });

  if (!word) {
    throw new ApiError(404, "Word not found");
  }

  const isWordAlreadyInCategory = await prisma.categoryWord.findFirst({
    where: {
      categoryId,
      wordId,
    },
  });

  if (isWordAlreadyInCategory) {
    throw new ApiError(400, "Word already in category");
  }

  const categoryWord = await prisma.categoryWord.create({
    data: {
      categoryId,
      wordId,
    },
  });

  res
    .status(201)
    .json(new ApiResponse(201, "Word added to category successfully", { categoryWord }));
});

export const getWordsInCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
    },
  });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  const wordsInCategory = await prisma.categoryWord.findMany({
    where: {
      categoryId,
    },
    include: {
      word: true,
    },
  });

  if (!wordsInCategory.length) {
    throw new ApiError(404, "No words found in this category");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Words in category retrieved successfully", { wordsInCategory }));
});

export const removeWordFromCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { wordId } = req.body;

  const categoryWord = await prisma.categoryWord.findFirst({
    where: {
      categoryId,
      wordId,
    },
  });

  if (!categoryWord) {
    throw new ApiError(404, "Word not found in this category");
  }

  await prisma.categoryWord.delete({
    where: {
      id: categoryWord.id,
    },
  });

  res.status(200).json(new ApiResponse(200, "Word removed from category successfully"));
});
