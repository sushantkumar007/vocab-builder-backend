import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { errorHandler } from "./middlewares/error.middleware.js";
import { env } from "../src/config/env.js";

dotenv.config();

const app = express();
const port = env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// import routes
import healthCheckRouter from "./routes/healthcheck.route.js";
import userRouter from "./routes/user.route.js";
import wordRouter from "./routes/word.route.js";
import watchlistRouter from "./routes/watchlist.route.js";
import savedWordsRouter from "./routes/saved-words.route.js";
import categoryRouter from "./routes/category.route.js";

// use routes
app.use("/api/v1/health", healthCheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/words", wordRouter);
app.use("/api/v1/watchlists", watchlistRouter);
app.use("/api/v1/saved-words", savedWordsRouter);
app.use("/api/v1/categories", categoryRouter);

// error handler middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
