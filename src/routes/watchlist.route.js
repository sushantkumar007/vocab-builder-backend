import { Router } from "express";
import {
  addWordToWatchlist,
  getWatchlist,
  removeWordFromWatchlist,
} from "../controllers/watchlist.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const watchlistRouter = Router();

watchlistRouter.route("/add-word/:wordId").post(isAuthenticated, addWordToWatchlist);
watchlistRouter.route("/get-watchlist").get(isAuthenticated, getWatchlist);
watchlistRouter.route("/remove-word/:wordId").delete(isAuthenticated, removeWordFromWatchlist);

export default watchlistRouter;
