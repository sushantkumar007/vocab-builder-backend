import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiRespones.js";

export const healthCheck = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, "Server is healthy"));
});
