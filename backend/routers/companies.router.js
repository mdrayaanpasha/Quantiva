import express from 'express';
import CompanyController from '../controllers/companies.controller.js'; // Adjust path if needed
import { verifyToken } from '../services/util.js';

const companiesRouter = express.Router();

companiesRouter.get("/getReddit/:companyName", CompanyController.getRedditAnalysis.bind(CompanyController));
companiesRouter.get("/getSEC/:companyName", CompanyController.getSECAnalysis.bind(CompanyController));
companiesRouter.get("/getTwitter/:companyName", CompanyController.getTwitterAnalysis.bind(CompanyController));
companiesRouter.get("/getwallstreet/:companyName", CompanyController.getWallStreetAnalysis.bind(CompanyController));

companiesRouter.post("/addCompany", verifyToken, CompanyController.addCompany.bind(CompanyController));
companiesRouter.get("/companies", verifyToken, CompanyController.getCompanies.bind(CompanyController));

export default companiesRouter;