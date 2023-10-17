import express from "express"
import { userData } from "../controllers/userController.js"

export const router = new express.Router()

router.get('/data', userData)