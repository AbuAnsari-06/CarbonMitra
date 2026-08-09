import { Router } from "express";
import { healthCheckHandler } from "../health";
import { asyncHandler } from "../middleware/errorHandler";
import { computeCarbonScore } from "../services/carbonScore";

export const apiRouter = Router();

apiRouter.get("/health", asyncHandler(healthCheckHandler));

apiRouter.post("/computeCarbonScore", asyncHandler(async (req, res) => {
  const { areaHectares, rawNdvi } = req.body;
  if (typeof areaHectares !== "number" || typeof rawNdvi !== "number") {
    res.status(400).json({ success: false, error: "Numeric areaHectares and rawNdvi required." });
    return;
  }
  const score = computeCarbonScore(areaHectares, rawNdvi);
  res.json({ success: true, ...score });
}));
