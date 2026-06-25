import express from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// import routes
import healthCheckRouter from "./routes/healthcheck.route.js";
import userRouter from "./routes/user.route.js";

// use routes
app.use("/api/v1/health", healthCheckRouter);
app.use("/api/v1/users", userRouter);

// error handler middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
