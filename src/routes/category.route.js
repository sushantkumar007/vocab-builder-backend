import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  createCategory,
  getCategories,
  deleteCategory,
  addWordToCategory,
  getWordsInCategory,
  removeWordFromCategory,
} from "../controllers/category.controller.js";

const categoryRouter = Router();

categoryRouter.route("/create-category").post(isAuthenticated, createCategory);
categoryRouter.route("/get-categories").get(isAuthenticated, getCategories);
categoryRouter.route("/delete-category/:categoryId").delete(isAuthenticated, deleteCategory);
categoryRouter.route("/add-word/:categoryId").post(isAuthenticated, addWordToCategory);
categoryRouter.route("/get-words/:categoryId").get(isAuthenticated, getWordsInCategory);
categoryRouter.route("/remove-word/:categoryId").delete(isAuthenticated, removeWordFromCategory);

export default categoryRouter;
