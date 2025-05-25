import express from 'express';
import otherController from '../controllers/other.controller.js';

const otherRouter = express.Router();


otherRouter.post("/alert-short", otherController.alertShort);
otherRouter.post("/chat", otherController.chat);



export default otherRouter;