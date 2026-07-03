import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { addWord, getWords, updateWord, deleteWord } from "../controllers/word.controller.js";

const wordRouter = Router();

wordRouter.route("/add-word").post(isAuthenticated, addWord);
wordRouter.route("/get-words/:word").get(getWords);
wordRouter.route("/update-word/:wordId").patch(isAuthenticated, updateWord);
wordRouter.route("/delete-word/:wordId").delete(isAuthenticated, deleteWord);

export default wordRouter;
