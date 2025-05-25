import express from "express";
import { Router } from "express";
import authController from "../controllers/auth.controller.js";

const AuthRouter = new Router();


AuthRouter.post("/register", authController.Register);
AuthRouter.post("/login", authController.login);
AuthRouter.post("/forgot-password", authController.forgetPassword);
AuthRouter.post("/reset-password", authController.resetPassword);
AuthRouter.post("/verify", authController.verify);



export default AuthRouter;