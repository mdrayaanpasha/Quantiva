import express from "express";
import { Router } from "express";
import InvestmentsController from "../controllers/investments.controller.js";

const investmentRouter = new Router();


investmentRouter.post("/investment-bad-analysis", InvestmentsController.badInvestmentAnalysis);
investmentRouter.post("/investment-good-analysis", InvestmentsController.goodInvestmentAnalysis);
investmentRouter.post("/score-portfolio", InvestmentsController.scoreInvestments);

export default investmentRouter;


