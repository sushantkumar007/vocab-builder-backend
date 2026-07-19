import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { saveWord, getSavedWords, deleteSavedWord } from "../controllers/saved-word.controller.js";

const savedWordsRouter = Router();

savedWordsRouter.route("/save/:wordId").post(isAuthenticated, saveWord);
savedWordsRouter.route("/saved-word").get(isAuthenticated, getSavedWords);
savedWordsRouter.route("/delete/:wordId").delete(isAuthenticated, deleteSavedWord);

export default savedWordsRouter;
